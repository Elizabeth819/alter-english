/* ALTER 本机埋点与周报聚合 —— 纯函数，无 DOM、无网络。
 * 浏览器：window.ALTER_ANALYTICS ；Node：module.exports（供自动化测试）。
 *
 * 只记录行为计数与 id，不记录任何对话原文；数据只存在本机 localStorage。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ALTER_ANALYTICS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = 1;
  var STORAGE_KEY = 'alter.events.v1';
  var MAX_EVENTS = 500;
  var DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

  // 这些字段即使被误传，也不允许写进埋点（隐私优先）。
  var PRIVATE_KEYS = {
    text: 1, line: 1, lineCn: 1, transcript: 1, heard: 1,
    solution: 1, note: 1, intent: 1, situation: 1, prompt: 1
  };

  var EVENT_LABELS = {
    app_open: '打开 App',
    persona_pick: '选人设',
    scene_start: '开始一集',
    beat_complete: '完成一幕',
    scene_complete: '完成整集',
    speech_use: '开口说',
    card_generated: '生成分享卡',
    card_saved: '保存分享卡',
    day2_return: '次日回访',
    review_clear: '复习清空'
  };

  /* ---------------- 日期 ---------------- */

  function dayKey(date) {
    var d = date || new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function parseDay(key) {
    var p = String(key).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function shiftDay(key, delta) {
    var d = parseDay(key);
    d.setDate(d.getDate() + delta);
    return dayKey(d);
  }

  /* ---------------- 记录 ---------------- */

  function createLog() {
    return { version: VERSION, events: [] };
  }

  function cleanProps(props) {
    if (!props || typeof props !== 'object') return null;
    var out = {};
    var n = 0;
    Object.keys(props).forEach(function (key) {
      if (n >= 8 || PRIVATE_KEYS[key]) return;
      var value = props[key];
      if (typeof value === 'string') { out[key] = value.slice(0, 80); n += 1; }
      else if (typeof value === 'number' && isFinite(value)) { out[key] = value; n += 1; }
      else if (typeof value === 'boolean') { out[key] = value; n += 1; }
    });
    return n ? out : null;
  }

  function trim(log) {
    var next = log || createLog();
    if (next.events.length > MAX_EVENTS) next.events = next.events.slice(-MAX_EVENTS);
    return next;
  }

  /** 坏数据一律退化，绝不让 App 崩掉。 */
  function migrate(raw) {
    var log = createLog();
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.events)) return log;
    raw.events.forEach(function (item) {
      if (!item || typeof item.name !== 'string' || !item.name) return;
      var day = typeof item.day === 'string' && DAY_RE.test(item.day) ? item.day : null;
      var t = typeof item.t === 'number' && isFinite(item.t) ? item.t : null;
      if (!day || t == null) return;
      var event = { name: item.name, day: day, t: t };
      var props = cleanProps(item.props);
      if (props) event.props = props;
      log.events.push(event);
    });
    return trim(log);
  }

  /**
   * 追加一条事件并裁剪到上限。
   * @param {object} log 现有日志
   * @param {string} name 事件名
   * @param {object} [props] 只允许字符串/数字/布尔，最多 8 个键
   * @param {{now?:Date, day?:string}} [opts] 便于测试注入时间
   */
  function record(log, name, props, opts) {
    var next = migrate(log);
    var o = opts || {};
    var now = o.now instanceof Date ? o.now : new Date();
    var event = {
      name: String(name),
      day: o.day && DAY_RE.test(o.day) ? o.day : dayKey(now),
      t: now.getTime()
    };
    var p = cleanProps(props);
    if (p) event.props = p;
    next.events.push(event);
    return trim(next);
  }

  /* ---------------- 查询 ---------------- */

  function inRange(event, from, to) {
    return event.day >= from && event.day <= to;
  }

  function count(log, name, from, to) {
    var n = 0;
    (log && log.events ? log.events : []).forEach(function (e) {
      if (e.name !== name) return;
      if (from && !inRange(e, from, to)) return;
      n += 1;
    });
    return n;
  }

  function uniqueCount(log, name, key, from, to) {
    var set = {};
    (log && log.events ? log.events : []).forEach(function (e) {
      if (e.name !== name) return;
      if (from && !inRange(e, from, to)) return;
      var value = e.props && e.props[key];
      if (value == null) value = '';
      if (value) set[value] = 1;
    });
    return Object.keys(set).length;
  }

  function hasEvent(log, name, key, value) {
    var events = (log && log.events) || [];
    for (var i = 0; i < events.length; i++) {
      var e = events[i];
      if (e.name === name && e.props && e.props[key] === value) return true;
    }
    return false;
  }

  function daysWith(log, from, to) {
    var set = {};
    (log && log.events ? log.events : []).forEach(function (e) {
      if (!inRange(e, from, to)) return;
      if (e.name === 'beat_complete' || e.name === 'review_clear') set[e.day] = 1;
    });
    return Object.keys(set).length;
  }

  /* ---------------- 数据页聚合 ---------------- */

  var FUNNEL = [
    { key: 'open', label: '打开 App', name: 'app_open' },
    { key: 'persona', label: '选人设', name: 'persona_pick' },
    { key: 'sceneStart', label: '开始一集', name: 'scene_start', prop: 'sceneId' },
    { key: 'scene', label: '完成整集', name: 'scene_complete', prop: 'sceneId' },
    { key: 'card', label: '生成分享卡', name: 'card_generated', prop: 'sceneId' },
    { key: 'save', label: '保存分享卡', name: 'card_saved', prop: 'sceneId' },
    { key: 'return', label: '次日回访', name: 'day2_return' }
  ];

  function funnel(log) {
    var opens = count(log, 'app_open');
    return FUNNEL.map(function (step) {
      var n = step.prop
        ? uniqueCount(log, step.name, step.prop)
        : count(log, step.name);
      return {
        key: step.key,
        label: step.label,
        count: n,
        rate: opens ? Math.round((n / opens) * 100) : 0
      };
    });
  }

  function daily(log, days, opts) {
    var o = opts || {};
    var end = o.today || dayKey(new Date());
    var out = [];
    for (var i = days - 1; i >= 0; i--) {
      var day = shiftDay(end, -i);
      var opens = count(log, 'app_open', day, day);
      var beats = count(log, 'beat_complete', day, day);
      var reviews = count(log, 'review_clear', day, day);
      out.push({
        day: day,
        opens: opens,
        learning: beats + reviews,
        active: opens > 0
      });
    }
    return out;
  }

  function avgBeatsPerScene(log) {
    var started = uniqueCount(log, 'scene_start', 'sceneId');
    var beats = uniqueCount(log, 'beat_complete', 'beatId');
    if (!started) return 0;
    return Math.round((beats / started) * 10) / 10;
  }

  function speechUsage(log) {
    var uses = uniqueCount(log, 'speech_use', 'beatId');
    var beats = uniqueCount(log, 'beat_complete', 'beatId');
    var ratio = beats ? uses / beats : 0;
    if (ratio > 1) ratio = 1;
    return { uses: uses, beats: beats, ratio: Math.round(ratio * 100) / 100 };
  }

  function shareRate(log) {
    var saved = uniqueCount(log, 'card_saved', 'sceneId');
    var completed = uniqueCount(log, 'scene_complete', 'sceneId');
    var ratio = completed ? saved / completed : 0;
    if (ratio > 1) ratio = 1;
    return { saved: saved, completed: completed, ratio: Math.round(ratio * 100) / 100 };
  }

  function stats(log, opts) {
    var o = opts || {};
    var days = daily(log, 14, o);
    var activeDays = 0;
    days.forEach(function (d) { if (d.active) activeDays += 1; });
    return {
      total: log && log.events ? log.events.length : 0,
      max: MAX_EVENTS,
      funnel: funnel(log),
      counters: {
        beats: uniqueCount(log, 'beat_complete', 'beatId'),
        beatEvents: count(log, 'beat_complete'),
        speech: uniqueCount(log, 'speech_use', 'beatId'),
        speechEvents: count(log, 'speech_use'),
        reviews: count(log, 'review_clear')
      },
      daily: days,
      activeDays: activeDays,
      avgBeats: avgBeatsPerScene(log),
      speech: speechUsage(log),
      share: shareRate(log),
      week: weekReport(log, o)
    };
  }

  /* ---------------- 家长周报 ---------------- */

  function metricsFor(log, from, to) {
    var beats = {};
    var scenes = {};
    var days = {};
    var native = 0;
    var speech = 0;
    var reviews = 0;
    var events = 0;
    (log && log.events ? log.events : []).forEach(function (e) {
      if (!inRange(e, from, to)) return;
      events += 1;
      var p = e.props || {};
      if (e.name === 'beat_complete') {
        if (p.beatId) beats[p.beatId] = 1;
        days[e.day] = 1;
        if (p.grade === 'native' && p.firstPass) native += 1;
      } else if (e.name === 'scene_complete') {
        if (p.sceneId) scenes[p.sceneId] = 1;
      } else if (e.name === 'speech_use') {
        speech += 1;
      } else if (e.name === 'review_clear') {
        reviews += 1;
        days[e.day] = 1;
      }
    });
    return {
      events: events,
      beats: Object.keys(beats).length,
      scenes: Object.keys(scenes).length,
      native: native,
      speech: speech,
      reviews: reviews,
      studyDays: Object.keys(days).length
    };
  }

  /** 依据真实数据给一句具体建议，而不是套话。 */
  function adviceFor(m, prev, pending) {
    if (!m.events) {
      return '本周还没有学习记录。先陪孩子打开 App 做今天的 3 分钟，不用加量。';
    }
    if (m.studyDays <= 2) {
      return '本周只学了 ' + m.studyDays + ' 天。把 3 分钟固定在晚饭后，先连续 3 天，比周末补一小时更容易坚持。';
    }
    var target = Math.max(3, Math.round(m.beats * 0.3));
    if (m.beats > 0 && m.speech < target) {
      return '本周完成 ' + m.beats + ' 幕，开口 ' + m.speech + ' 次。下次让孩子先点「开口说」再交卷，每集至少开口 3 次；说不出时再用词块，不扣分。';
    }
    if (pending > 0 && m.reviews === 0) {
      return '复习队列还有 ' + pending + ' 句到期。这周先清一次复习，答对才移出，比刷新剧情更能记住。';
    }
    if (prev.beats > 0 && m.beats > prev.beats) {
      return '本周比上周多完成 ' + (m.beats - prev.beats) + ' 幕，节奏在变稳。下周保持同样的时间，不用额外加量。';
    }
    if (m.scenes > 0 && m.native >= m.scenes * 3) {
      return '本周有 ' + m.native + ' 句说到地道水平。下一步可以让孩子遮住中文提示，直接开口说整句。';
    }
    return '本周学习 ' + m.studyDays + ' 天、完成 ' + m.scenes + ' 集，保持每天 3 分钟；下周试着把开口次数从 ' +
      m.speech + ' 提到 ' + Math.max(m.speech + 3, 6) + ' 次。';
  }

  /**
   * 最近 7 天（含今天）的周报。
   * @param {object} log 事件日志
   * @param {{today?:string, pending?:number}} [opts]
   */
  function weekReport(log, opts) {
    var o = opts || {};
    var today = o.today || dayKey(new Date());
    var from = shiftDay(today, -6);
    var prevFrom = shiftDay(today, -13);
    var prevTo = shiftDay(today, -7);
    var current = metricsFor(log, from, today);
    var previous = metricsFor(log, prevFrom, prevTo);
    var delta = current.beats - previous.beats;
    var pending = typeof o.pending === 'number' ? o.pending : 0;

    return {
      range: { from: from, to: today, days: 7 },
      metrics: current,
      previous: previous,
      trend: {
        dir: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
        delta: delta
      },
      pending: pending,
      advice: adviceFor(current, previous, pending),
      hasData: current.events > 0
    };
  }

  /* ---------------- 导出 ---------------- */

  function exportJson(log) {
    var safe = migrate(log);
    return JSON.stringify({
      app: 'ALTER',
      version: VERSION,
      exportedAt: new Date().toISOString(),
      count: safe.events.length,
      events: safe.events
    }, null, 2);
  }

  return {
    VERSION: VERSION,
    STORAGE_KEY: STORAGE_KEY,
    MAX_EVENTS: MAX_EVENTS,
    EVENT_LABELS: EVENT_LABELS,
    createLog: createLog,
    migrate: migrate,
    record: record,
    trim: trim,
    dayKey: dayKey,
    shiftDay: shiftDay,
    count: count,
    uniqueCount: uniqueCount,
    hasEvent: hasEvent,
    daysWith: daysWith,
    funnel: funnel,
    daily: daily,
    avgBeatsPerScene: avgBeatsPerScene,
    speechUsage: speechUsage,
    shareRate: shareRate,
    weekReport: weekReport,
    stats: stats,
    exportJson: exportJson,
    cleanProps: cleanProps
  };
});
