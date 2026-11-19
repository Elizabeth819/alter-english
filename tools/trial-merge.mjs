#!/usr/bin/env node
/* ALTER 试用数据合并：把家长导出的多份 JSON 汇总成每人一行 + 总体汇总。
 * 零依赖，只读统计事件；不读取也不输出任何对话原文。
 *
 * 用法：
 *   node tools/trial-merge.mjs <rawDir> [--out <dir>] [--from YYYY-MM-DD] [--to YYYY-MM-DD]
 * 例：
 *   node tools/trial-merge.mjs ../trial/raw --out ../trial/out
 *   （本机没有 node 时：ELECTRON_RUN_AS_NODE=1 "<Trae CN.exe>" tools/trial-merge.mjs ...）
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (!args.length || args[0] === '-h' || args[0] === '--help') {
  console.log('用法：node tools/trial-merge.mjs <rawDir> [--out <dir>] [--from YYYY-MM-DD] [--to YYYY-MM-DD]');
  process.exit(args.length ? 0 : 1);
}
const rawDir = path.resolve(args[0]);
let outDir = path.join(rawDir, '..', 'out');
let from = null;
let to = null;
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--out' && args[i + 1]) { outDir = path.resolve(args[++i]); }
  else if (args[i] === '--from' && args[i + 1]) { from = args[++i]; }
  else if (args[i] === '--to' && args[i + 1]) { to = args[++i]; }
}

const PRIVATE = ['text', 'line', 'lineCn', 'transcript', 'heard', 'solution', 'note', 'intent', 'situation', 'prompt'];
const LEARNING = { beat_complete: 1, review_clear: 1 };
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDay(key) { const p = String(key).split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); }
function shiftDay(key, delta) { return new Date(parseDay(key) + delta * 86400000).toISOString().slice(0, 10); }
function dayDiff(a, b) { return Math.round((parseDay(b) - parseDay(a)) / 86400000); }
function uniq(list) { return [...new Set(list)]; }
function round(n, d = 2) { const p = Math.pow(10, d); return Math.round(n * p) / p; }
function sceneOrder(id) {
  const m = /^s(\d+)-a(\d+)$/.exec(id || '');
  return m ? Number(m[1]) * 100 + Number(m[2]) : 9999;
}

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.json$/i.test(name)) out.push(full);
  }
  return out;
}

function sanitizeEvents(events, warn) {
  return events.map((e) => {
    if (!e || typeof e.name !== 'string' || !DAY_RE.test(e.day || '')) return null;
    const props = {};
    Object.keys(e.props || {}).forEach((k) => {
      if (PRIVATE.includes(k)) { warn('已剔除隐私字段 ' + k); return; }
      props[k] = e.props[k];
    });
    return { name: e.name, day: e.day, props };
  }).filter(Boolean);
}

function userMetrics(events, payload) {
  const days = uniq(events.map((e) => e.day)).sort();
  const first = payload.firstDay || days[0] || null;
  const last = payload.lastDay || days[days.length - 1] || null;
  const openDays = uniq(events.filter((e) => e.name === 'app_open').map((e) => e.day));
  const study7End = first ? shiftDay(first, 6) : null;
  const studyDays7 = uniq(events.filter((e) =>
    LEARNING[e.name] && first && e.day >= first && e.day <= study7End
  ).map((e) => e.day)).length;
  const byScene = (name) => uniq(events.filter((e) => e.name === name && e.props.sceneId).map((e) => e.props.sceneId));
  const started = byScene('scene_start');
  const completed = byScene('scene_complete');
  const beats = uniq(events.filter((e) => e.name === 'beat_complete' && e.props.beatId).map((e) => e.props.beatId));
  const speech = uniq(events.filter((e) => e.name === 'speech_use' && e.props.beatId).map((e) => e.props.beatId));
  const generated = byScene('card_generated');
  const saved = byScene('card_saved');
  const reviews = events.filter((e) => e.name === 'review_clear').length;

  const touched = uniq([...started, ...completed]).sort((a, b) => sceneOrder(a) - sceneOrder(b));
  const lastScene = touched.length ? touched[touched.length - 1] : '';
  const stuckScene = lastScene && started.includes(lastScene) && !completed.includes(lastScene) ? lastScene : '';

  const nextDay = first ? shiftDay(first, 1) : null;
  const eligibleD1 = !!(last && first && dayDiff(first, last) >= 1);
  const returned = eligibleD1 && events.some((e) => e.day === nextDay && (e.name === 'app_open' || LEARNING[e.name]));

  const weekEligible = !!(last && first && dayDiff(first, last) >= 6);
  return {
    trialId: payload.trialId || '',
    firstDay: first || '',
    lastDay: last || '',
    daysObserved: first && last ? dayDiff(first, last) + 1 : 0,
    openDays: openDays.length,
    d1Eligible: eligibleD1 ? 1 : 0,
    d1: returned ? 1 : 0,
    studyDays7,
    weekEligible: weekEligible ? 1 : 0,
    scenesStarted: started.length,
    scenesCompleted: completed.length,
    beats: beats.length,
    speechUses: speech.length,
    speechRatio: beats.length ? round(speech.length / beats.length, 2) : 0,
    cardsGenerated: generated.length,
    cardsSaved: saved.length,
    reviews,
    lastScene,
    stuckScene,
    active: beats.length > 0 ? 1 : 0,
    capped: payload.count === 500 ? 1 : 0
  };
}

function mean(list) { return list.length ? round(list.reduce((a, b) => a + b, 0) / list.length, 2) : 0; }
function rate(n, d) { return d ? round((n / d) * 100, 1) : 0; }

if (!fs.existsSync(rawDir)) {
  console.error('找不到目录：' + rawDir);
  process.exit(1);
}
const files = walk(rawDir);
const warnings = [];
const users = [];
const byId = new Map();

for (const file of files) {
  const name = path.basename(file);
  const warn = (msg) => warnings.push(name + '：' + msg);
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { warn('不是合法 JSON，已跳过'); continue; }
  if (!data || data.app !== 'ALTER' || !Array.isArray(data.events)) { warn('不是 ALTER 导出文件，已跳过'); continue; }
  if (data.schema && data.schema !== 'alter-trial-v1') warn('未知 schema：' + data.schema);
  if (data.version !== 1) warn('未知版本：' + data.version);
  if (typeof data.count === 'number' && data.count !== data.events.length) warn('count 与事件数不一致');
  if (data.count === 500) warn('事件达到 500 条上限，可能被裁剪');

  const infer = /^alter-([A-Za-z0-9_-]+)-\d{4}-\d{2}-\d{2}\.json$/.exec(name);
  const trialId = String(data.trialId || (infer ? infer[1].toUpperCase() : '')).trim();
  if (!trialId) warn('缺少试用编号，按文件名归档'); else if (!data.trialId) warn('payload 无 trialId，按文件名推断为 ' + trialId);

  const events = sanitizeEvents(data.events, warn);
  if (from || to) {
    const kept = events.filter((e) => (!from || e.day >= from) && (!to || e.day <= to));
    if (kept.length !== events.length) warn('按时间窗过滤了 ' + (events.length - kept.length) + ' 条事件');
    events.length = 0;
    events.push(...kept);
  }

  const payload = {
    trialId,
    firstDay: data.firstDay && DAY_RE.test(data.firstDay) ? data.firstDay : null,
    lastDay: data.lastDay && DAY_RE.test(data.lastDay) ? data.lastDay : null,
    count: data.count
  };
  const row = userMetrics(events, payload);
  row.exportedAt = data.exportedAt || '';
  row.file = name;

  const key = trialId || 'file:' + name;
  const prev = byId.get(key);
  if (prev) {
    warn('同一编号有重复导出，取 exportedAt 最新的一份');
    if (String(row.exportedAt) >= String(prev.row.exportedAt)) byId.set(key, { row, file });
    continue;
  }
  byId.set(key, { row, file });
}
byId.forEach((v) => users.push(v.row));

const active = users.filter((u) => u.active);
const eligibleD1 = users.filter((u) => u.d1Eligible);
const weekEligible = users.filter((u) => u.weekEligible);
const completedUsers = users.filter((u) => u.scenesCompleted > 0);

const sceneStats = new Map();
const userScenes = new Map();
byId.forEach((v) => userScenes.set(v.row.trialId || ('file:' + v.row.file), { started: new Set(), completed: new Set() }));
for (const file of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { continue; }
  if (!data || data.app !== 'ALTER' || !Array.isArray(data.events)) continue;
  const infer = /^alter-([A-Za-z0-9_-]+)-\d{4}-\d{2}-\d{2}\.json$/.exec(path.basename(file));
  const trialId = String(data.trialId || (infer ? infer[1].toUpperCase() : '')).trim();
  const key = trialId || 'file:' + path.basename(file);
  if (byId.get(key) && byId.get(key).file !== file) continue; // 重复导出只算最新
  const bucket = userScenes.get(key);
  (data.events || []).forEach((e) => {
    if (!e || !e.props || !e.props.sceneId) return;
    if (from && e.day < from) return;
    if (to && e.day > to) return;
    if (e.name === 'scene_start') bucket.started.add(e.props.sceneId);
    if (e.name === 'scene_complete') bucket.completed.add(e.props.sceneId);
  });
}
userScenes.forEach((b) => {
  b.started.forEach((s) => {
    if (!sceneStats.has(s)) sceneStats.set(s, { started: 0, completed: 0, stuck: 0 });
    sceneStats.get(s).started += 1;
  });
  b.completed.forEach((s) => {
    if (!sceneStats.has(s)) sceneStats.set(s, { started: 0, completed: 0, stuck: 0 });
    sceneStats.get(s).completed += 1;
  });
});
userScenes.forEach((b, key) => {
  const row = byId.get(key) ? byId.get(key).row : null;
  if (row && row.stuckScene && sceneStats.has(row.stuckScene)) sceneStats.get(row.stuckScene).stuck += 1;
});

const dropoff = [...sceneStats.entries()]
  .sort((a, b) => sceneOrder(a[0]) - sceneOrder(b[0]))
  .map(([sceneId, s]) => ({
    sceneId,
    started: s.started,
    completed: s.completed,
    completionRate: rate(s.completed, s.started),
    stuckHere: s.stuck
  }));

const summary = {
  generatedAt: new Date().toISOString(),
  window: { from, to },
  files: files.length,
  users: users.length,
  activeUsers: active.length,
  warnings,
  d1: {
    eligible: eligibleD1.length,
    returned: eligibleD1.filter((u) => u.d1).length,
    rate: rate(eligibleD1.filter((u) => u.d1).length, eligibleD1.length)
  },
  studyDays7: {
    eligible: weekEligible.length,
    meanEligible: mean(weekEligible.map((u) => u.studyDays7)),
    meanAll: mean(users.map((u) => u.studyDays7)),
    distribution: [0, 1, 2, 3, 4, 5, 6, 7].map((d) => ({ days: d, users: users.filter((u) => u.studyDays7 === d).length }))
  },
  scenes: {
    startedTotal: users.reduce((a, u) => a + u.scenesStarted, 0),
    completedTotal: users.reduce((a, u) => a + u.scenesCompleted, 0),
    completionRate: rate(users.reduce((a, u) => a + u.scenesCompleted, 0), users.reduce((a, u) => a + u.scenesStarted, 0)),
    usersCompletedOne: completedUsers.length,
    meanCompletedPerUser: mean(users.map((u) => u.scenesCompleted))
  },
  speech: {
    uses: users.reduce((a, u) => a + u.speechUses, 0),
    beats: users.reduce((a, u) => a + u.beats, 0),
    ratio: rate(users.reduce((a, u) => a + u.speechUses, 0), users.reduce((a, u) => a + u.beats, 0)),
    usersUsed: active.filter((u) => u.speechUses > 0).length,
    userRate: rate(active.filter((u) => u.speechUses > 0).length, active.length)
  },
  share: {
    generated: users.reduce((a, u) => a + u.cardsGenerated, 0),
    saved: users.reduce((a, u) => a + u.cardsSaved, 0),
    genRate: rate(users.reduce((a, u) => a + u.cardsGenerated, 0), users.reduce((a, u) => a + u.scenesCompleted, 0)),
    saveRate: rate(users.reduce((a, u) => a + u.cardsSaved, 0), users.reduce((a, u) => a + u.cardsGenerated, 0))
  },
  review: {
    usersUsed: completedUsers.filter((u) => u.reviews > 0).length,
    usageRate: rate(completedUsers.filter((u) => u.reviews > 0).length, completedUsers.length)
  },
  dropoff,
  cappedUsers: users.filter((u) => u.capped).map((u) => u.trialId)
};

fs.mkdirSync(outDir, { recursive: true });
const cols = ['trialId', 'firstDay', 'lastDay', 'daysObserved', 'openDays', 'd1Eligible', 'd1', 'studyDays7', 'scenesStarted', 'scenesCompleted', 'beats', 'speechUses', 'speechRatio', 'cardsGenerated', 'cardsSaved', 'reviews', 'lastScene', 'stuckScene', 'active', 'capped', 'exportedAt', 'file'];
const csv = [cols.join(',')]
  .concat(users.map((u) => cols.map((c) => {
    const v = u[c] == null ? '' : String(u[c]);
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }).join(',')))
  .join('\n');
fs.writeFileSync(path.join(outDir, 'users.csv'), '\ufeff' + csv);
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));

console.log('已读取 ' + files.length + ' 个文件，合并 ' + users.length + ' 人');
console.log('D1 回访：' + summary.d1.returned + '/' + summary.d1.eligible + ' = ' + summary.d1.rate + '%');
console.log('首 7 日学习天数（均值）：' + summary.studyDays7.meanEligible + '（可评估 ' + summary.studyDays7.eligible + ' 人）');
console.log('每集完成率：' + summary.scenes.completionRate + '%（' + summary.scenes.completedTotal + '/' + summary.scenes.startedTotal + '）');
console.log('开口说比例：' + summary.speech.ratio + '% · 使用过开口的用户 ' + summary.speech.userRate + '%');
console.log('分享卡：生成率 ' + summary.share.genRate + '% · 保存率 ' + summary.share.saveRate + '%');
console.log('复习使用率：' + summary.review.usageRate + '%');
console.log('卡点：' + (summary.dropoff.filter((d) => d.stuckHere > 0).map((d) => d.sceneId + '×' + d.stuckHere).join('、') || '无'));
if (warnings.length) {
  console.log('\n告警 ' + warnings.length + ' 条：');
  warnings.slice(0, 20).forEach((w) => console.log(' - ' + w));
  if (warnings.length > 20) console.log(' - …其余见 summary.json');
}
console.log('\n输出：' + path.join(outDir, 'users.csv') + ' · ' + path.join(outDir, 'summary.json'));
