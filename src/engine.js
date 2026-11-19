/* ALTER 逻辑引擎 —— 纯函数，无 DOM、无网络、无存储副作用。
 * 浏览器：window.ALTER_ENGINE ；Node：module.exports（供自动化测试）。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ALTER_ENGINE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var STATE_VERSION = 1;
  var STORAGE_KEY = 'alter.state.v1';
  var XP_BY_GRADE = { native: 10, ok: 7, order: 0, close: 0, off: 0 };
  var GRADE_SCORE = { native: 100, ok: 82, order: 45, close: 25, off: 0 };

  /* ---------------- 文本归一化 ---------------- */

  function wordsOf(input) {
    var text = Array.isArray(input) ? input.join(' ') : String(input == null ? '' : input);
    return text
      .toLowerCase()
      .replace(/[\u2018\u2019\u02bc]/g, "'")
      .replace(/[^a-z0-9' ]+/g, ' ')
      .split(/\s+/)
      .map(function (w) { return w.replace(/^'+|'+$/g, ''); })
      .filter(Boolean);
  }

  function sameWords(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function counts(words) {
    var map = {};
    for (var i = 0; i < words.length; i++) map[words[i]] = (map[words[i]] || 0) + 1;
    return map;
  }

  function diffWords(attemptWords, targetWords) {
    var pool = counts(attemptWords);
    var missing = [];
    targetWords.forEach(function (w) {
      if (pool[w]) pool[w] -= 1;
      else missing.push(w);
    });
    var targetPool = counts(targetWords);
    var extra = [];
    attemptWords.forEach(function (w) {
      if (targetPool[w]) targetPool[w] -= 1;
      else extra.push(w);
    });
    return { missing: missing, extra: extra };
  }

  /* ---------------- 评分器 ---------------- */

  /**
   * 判定一次作答。
   * @param {string[]} chips 玩家按顺序选中的词块
   * @param {object} beat 回合数据（含 solutions）
   * @returns {{grade:string,score:number,passed:boolean,xp:number,
   *            solution:object|null,missing:string[],extra:string[],coverage:number,orderOnly:boolean}}
   */
  function evaluate(chips, beat) {
    var attempt = wordsOf(chips || []);
    var solutions = (beat && beat.solutions) || [];
    if (!solutions.length) throw new Error('beat 缺少 solutions: ' + (beat && beat.id));
    if (!attempt.length) {
      var s0 = bestSolution(beat);
      return { grade: 'off', score: 0, passed: false, xp: 0, solution: s0, missing: wordsOf(s0.text), extra: [], coverage: 0, orderOnly: false };
    }

    var best = null;
    solutions.forEach(function (sol) {
      var target = wordsOf(sol.text);
      var result;
      if (sameWords(attempt, target)) {
        result = {
          grade: sol.level === 'native' ? 'native' : 'ok',
          score: GRADE_SCORE[sol.level === 'native' ? 'native' : 'ok'],
          passed: true,
          xp: XP_BY_GRADE[sol.level === 'native' ? 'native' : 'ok'],
          solution: sol,
          missing: [],
          extra: [],
          coverage: 1,
          orderOnly: false
        };
      } else {
        var d = diffWords(attempt, target);
        var matched = target.length - d.missing.length;
        var coverage = target.length ? matched / target.length : 0;
        var sameBag = d.missing.length === 0 && d.extra.length === 0;
        result = {
          grade: sameBag ? 'order' : coverage >= 0.6 ? 'close' : 'off',
          score: sameBag ? GRADE_SCORE.order : coverage >= 0.6 ? GRADE_SCORE.close : 0,
          passed: false,
          xp: 0,
          solution: sol,
          missing: d.missing,
          extra: d.extra,
          coverage: coverage,
          orderOnly: sameBag
        };
      }
      if (!best || result.score > best.score) best = result;
    });
    return best;
  }

  function bestSolution(beat) {
    var solutions = (beat && beat.solutions) || [];
    for (var i = 0; i < solutions.length; i++) if (solutions[i].level === 'native') return solutions[i];
    return solutions[0] || null;
  }

  /* ---------------- 状态 ---------------- */

  function createState() {
    return {
      version: STATE_VERSION,
      persona: null,
      xp: 0,
      streak: 0,
      lastDay: null,
      passed: {},
      attempts: {},
      nativeCount: 0,
      choices: {},
      completedOn: {},
      outcomes: {},
      review: {},
      saved: [],
      createdAt: new Date().toISOString()
    };
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /** 容错读取：任何坏数据都退化为全新状态，绝不让 App 崩掉。 */
  function migrate(raw) {
    var state = createState();
    if (!raw || typeof raw !== 'object') return state;
    if (raw.version !== STATE_VERSION) return state;
    if (raw.persona) state.persona = String(raw.persona);
    if (typeof raw.xp === 'number' && raw.xp >= 0) state.xp = raw.xp;
    if (typeof raw.streak === 'number' && raw.streak >= 0) state.streak = raw.streak;
    if (typeof raw.lastDay === 'string') state.lastDay = raw.lastDay;
    if (typeof raw.nativeCount === 'number' && raw.nativeCount >= 0) state.nativeCount = raw.nativeCount;
    if (raw.passed && typeof raw.passed === 'object') state.passed = raw.passed;
    if (raw.attempts && typeof raw.attempts === 'object') state.attempts = raw.attempts;
    if (raw.choices && typeof raw.choices === 'object') state.choices = raw.choices;
    if (raw.completedOn && typeof raw.completedOn === 'object') {
      Object.keys(raw.completedOn).forEach(function (id) {
        if (typeof raw.completedOn[id] === 'string') state.completedOn[id] = raw.completedOn[id];
      });
    }
    if (raw.outcomes && typeof raw.outcomes === 'object') state.outcomes = raw.outcomes;
    if (raw.review && typeof raw.review === 'object') {
      Object.keys(raw.review).forEach(function (id) {
        var item = raw.review[id];
        if (!item || typeof item !== 'object' || typeof item.due !== 'string') return;
        state.review[id] = {
          beatId: String(item.beatId || id),
          sceneId: typeof item.sceneId === 'string' ? item.sceneId : '',
          season: typeof item.season === 'number' ? item.season : 1,
          due: item.due,
          interval: typeof item.interval === 'number' ? item.interval : 0,
          source: item.source === 'ok' ? 'ok' : 'wrong',
          lapses: typeof item.lapses === 'number' ? item.lapses : 0,
          added: typeof item.added === 'string' ? item.added : item.due
        };
      });
    }
    if (Array.isArray(raw.saved)) state.saved = raw.saved.filter(function (p) { return p && typeof p.text === 'string'; });
    if (typeof raw.createdAt === 'string') state.createdAt = raw.createdAt;
    return state;
  }

  function setPersona(state, personaId) {
    var next = clone(state);
    next.persona = personaId;
    return next;
  }

  function isPassed(state, beatId) {
    return !!state.passed[beatId];
  }

  /** 答题后维护复习队列：答错→今天复习；只说“能懂”→3 天后再来；地道→移出。 */
  function reviewAfterAnswer(review, beat, result, opts) {
    var next = clone(review || {});
    var id = beat.id;
    var item = next[id];
    var day = opts.day;
    var sceneId = opts.sceneId || '';
    var season = opts.season || 1;

    if (result.passed && result.grade === 'native') {
      // 剧情里改口说对了，也先留在队列里：等复习环节再确认一次，才算真的记住。
      if (item && item.due < day) item.due = day;
      return next;
    }
    if (result.passed && result.grade === 'ok') {
      if (!item) {
        next[id] = {
          beatId: id, sceneId: sceneId, season: season,
          due: addDays(day, 3), interval: 3, source: 'ok', lapses: 0, added: day
        };
      } else {
        item.due = addDays(day, Math.max(3, item.interval || 3));
        item.interval = Math.max(3, item.interval || 3);
        if (sceneId) { item.sceneId = sceneId; item.season = season; }
      }
      return next;
    }
    if (!item) {
      next[id] = {
        beatId: id, sceneId: sceneId, season: season,
        due: day, interval: 0, source: 'wrong', lapses: 1, added: day
      };
    } else {
      item.due = day;
      item.interval = 0;
      item.lapses = (item.lapses || 0) + 1;
      if (sceneId) { item.sceneId = sceneId; item.season = season; }
    }
    return next;
  }

  /** 记录一次作答。只有首次通过才加 XP，防止刷题刷分。
   * opts.day / opts.sceneId / opts.season 存在时，同步维护复习队列。 */
  function applyAnswer(state, beat, result, opts) {
    var next = clone(state);
    next.attempts[beat.id] = (next.attempts[beat.id] || 0) + 1;
    var firstPass = false;
    if (result.passed && !next.passed[beat.id]) {
      next.passed[beat.id] = result.grade;
      next.xp += result.xp;
      if (result.grade === 'native') next.nativeCount += 1;
      firstPass = true;
    }
    if (opts && opts.day) {
      next.review = reviewAfterAnswer(next.review, beat, result, opts);
    }
    return { state: next, firstPass: firstPass };
  }

  function flattenBeats(scene) {
    var list = [];
    (scene.acts || []).forEach(function (act) {
      (act.beats || []).forEach(function (beat) { list.push({ act: act, beat: beat }); });
    });
    return list;
  }

  function sceneStats(state, scene) {
    var list = flattenBeats(scene);
    var passed = 0;
    var native = 0;
    list.forEach(function (item) {
      if (state.passed[item.beat.id]) passed += 1;
      if (state.passed[item.beat.id] === 'native') native += 1;
    });
    var total = list.length;
    return {
      total: total,
      passed: passed,
      native: native,
      percent: total ? Math.round((passed / total) * 100) : 0,
      done: total > 0 && passed === total
    };
  }

  function sceneUnlocked(state, scenes, index) {
    if (index <= 0) return true;
    var prev = scenes[index - 1];
    return !!prev && sceneStats(state, prev).done;
  }

  /** 首页/剧情页用：第一集未完成的场景索引。 */
  function currentSceneIndex(state, scenes) {
    for (var i = 0; i < scenes.length; i++) {
      if (!sceneStats(state, scenes[i]).done) return i;
    }
    return scenes.length - 1;
  }

  /** 下一幕（跳过已通过的回合）。已全部完成返回 null。 */
  function nextUp(state, scenes) {
    for (var i = 0; i < scenes.length; i++) {
      if (!sceneUnlocked(state, scenes, i)) return null;
      var list = flattenBeats(scenes[i]);
      for (var j = 0; j < list.length; j++) {
        if (!state.passed[list[j].beat.id]) {
          return { scene: scenes[i], sceneIndex: i, act: list[j].act, beat: list[j].beat, beatIndex: j };
        }
      }
    }
    return null;
  }

  /** 场景完成度：'locked' | 'active' | 'choice' | 'done' */
  function sceneStatus(state, scenes, index) {
    if (!sceneUnlocked(state, scenes, index)) return 'locked';
    var scene = scenes[index];
    var stats = sceneStats(state, scene);
    if (!stats.done) return 'active';
    return state.choices[scene.id] ? 'done' : 'choice';
  }

  function completeScene(state, sceneId, optionId, day) {
    var next = clone(state);
    next.choices[sceneId] = optionId;
    if (day) next.completedOn[sceneId] = day;
    return next;
  }

  function recordOutcome(state, sceneId, text) {
    var next = clone(state);
    next.outcomes[sceneId] = text;
    return next;
  }

  function personaClosing(scene, personaId) {
    if (!scene.personaClose) return '';
    return scene.personaClose[personaId] || scene.personaClose.warm || '';
  }

  /** 上一集的分支结果，在本集开场被引用。没有上一集 / 没选过 → 返回空串。 */
  function sceneCallback(state, scenes, sceneId) {
    var index = -1;
    for (var i = 0; i < scenes.length; i++) if (scenes[i].id === sceneId) index = i;
    if (index <= 0) return '';
    var scene = scenes[index];
    var prev = scenes[index - 1];
    if (!scene.callbacks) return '';
    var picked = state.choices[prev.id];
    return scene.callbacks[picked] || scene.callbacks[prev.choice.options[0].id] || '';
  }

  function totalStats(state, scenes) {
    var total = 0;
    var passed = 0;
    scenes.forEach(function (scene) {
      var s = sceneStats(state, scene);
      total += s.total;
      passed += s.passed;
    });
    return {
      total: total,
      passed: passed,
      percent: total ? Math.round((passed / total) * 100) : 0,
      xp: state.xp,
      native: state.nativeCount,
      streak: state.streak
    };
  }

  /* ---------------- 句子本 ---------------- */

  function phraseKey(text) {
    return wordsOf(text).join(' ');
  }

  function isSaved(state, text) {
    var key = phraseKey(text);
    return state.saved.some(function (p) { return phraseKey(p.text) === key; });
  }

  function toggleSaved(state, phrase) {
    var next = clone(state);
    var key = phraseKey(phrase.text);
    var idx = -1;
    for (var i = 0; i < next.saved.length; i++) {
      if (phraseKey(next.saved[i].text) === key) { idx = i; break; }
    }
    if (idx >= 0) {
      next.saved.splice(idx, 1);
      return { state: next, saved: false };
    }
    next.saved.unshift({
      text: phrase.text,
      note: phrase.note || '',
      sceneId: phrase.sceneId || '',
      sceneTitle: phrase.sceneTitle || '',
      day: phrase.day || ''
    });
    return { state: next, saved: true };
  }

  /* ---------------- 连击 / 日期 ---------------- */

  function dayKey(date) {
    var d = date instanceof Date ? date : new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    return d.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (day.length < 2 ? '0' + day : day);
  }

  function daysBetween(aKey, bKey) {
    var a = new Date(aKey + 'T00:00:00');
    var b = new Date(bKey + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }

  function addDays(key, n) {
    var d = new Date(key + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return dayKey(d);
  }

  /** 同一天不变；隔一天 +1；断了重置为 1。 */
  function updateStreak(state, key) {
    var next = clone(state);
    if (!key) return next;
    if (next.lastDay === key) return next;
    if (!next.lastDay) next.streak = 1;
    else next.streak = daysBetween(next.lastDay, key) === 1 ? next.streak + 1 : 1;
    next.lastDay = key;
    return next;
  }

  /* ---------------- 每日节奏 ---------------- */

  function startDay(state, today) {
    if (state && state.createdAt) {
      var d = new Date(state.createdAt);
      if (!isNaN(d.getTime())) return dayKey(d);
    }
    return today;
  }

  /** 某集原定哪一天解锁；提前看时 early = true。
   * status: 'locked'（上一集没完成）| 'done' | 'today' | 'early' */
  function sceneTiming(state, scenes, index, today) {
    if (index < 0 || index >= (scenes || []).length) {
      return { status: 'locked', scheduledFor: null, early: false };
    }
    if (!sceneUnlocked(state, scenes, index)) {
      return { status: 'locked', scheduledFor: null, early: false };
    }
    var scene = scenes[index];
    var stats = sceneStats(state, scene);
    if (stats.done) {
      return { status: 'done', scheduledFor: (state.completedOn || {})[scene.id] || null, early: false };
    }
    var scheduled;
    if (index === 0) {
      scheduled = startDay(state, today);
    } else {
      var prevDone = (state.completedOn || {})[scenes[index - 1].id];
      scheduled = prevDone ? addDays(prevDone, 1) : today;
    }
    var early = today < scheduled;
    return { status: early ? 'early' : 'today', scheduledFor: scheduled, early: early };
  }

  /** 今天该玩哪一集：第一集未完成的；今天已完成则给出下一集（early）。 */
  function dailyEpisode(state, scenes, today) {
    var due = reviewDueCount(state, today);
    if (!scenes || !scenes.length) {
      return { status: 'complete', index: -1, scene: null, timing: null, due: due, scheduledFor: null };
    }
    var first = -1;
    for (var i = 0; i < scenes.length; i++) {
      if (!sceneStats(state, scenes[i]).done) { first = i; break; }
    }
    if (first < 0) {
      return { status: 'complete', index: -1, scene: null, timing: null, due: due, scheduledFor: null };
    }
    var timing = sceneTiming(state, scenes, first, today);
    var started = Object.keys(state.passed || {}).length > 0;
    var status = timing.status === 'locked' ? 'locked' : timing.status === 'early' ? 'early' : started ? 'today' : 'new';
    return {
      status: status,
      index: first,
      scene: scenes[first],
      timing: timing,
      due: due,
      scheduledFor: timing.scheduledFor
    };
  }

  /* ---------------- 复习队列 ---------------- */

  function reviewItem(state, beatId) {
    return (state.review && state.review[beatId]) || null;
  }

  function reviewDue(state, today) {
    var review = state.review || {};
    return Object.keys(review).map(function (id) { return review[id]; })
      .filter(function (item) { return item && item.due && item.due <= today; })
      .sort(function (a, b) {
        if (a.due !== b.due) return a.due < b.due ? -1 : 1;
        return (a.added || '') < (b.added || '') ? -1 : 1;
      });
  }

  function reviewPending(state, today) {
    var review = state.review || {};
    return Object.keys(review).map(function (id) { return review[id]; })
      .filter(function (item) { return item && item.due && item.due > today; })
      .sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
  }

  function reviewDueCount(state, today) {
    return reviewDue(state, today).length;
  }

  function reviewTotal(state) {
    return Object.keys(state.review || {}).length;
  }

  /** 复习作答：答对（地道或能懂）移出；答错推到明天。 */
  function gradeReview(state, beatId, result, day) {
    var next = clone(state);
    var item = next.review && next.review[beatId];
    if (!item) return next;
    if (result.passed) {
      delete next.review[beatId];
    } else {
      item.due = addDays(day, 1);
      item.interval = 1;
      item.lapses = (item.lapses || 0) + 1;
    }
    return next;
  }

  /* ---------------- 内容完整性校验（测试用） ---------------- */

  function countSentences(text) {
    // 只数中文句末标点：引号里的英文问号不算“一句”
    return (String(text || '').match(/[。！？]/g) || []).length;
  }

  function validateContent(scenes, personas) {
    var errors = [];
    var seenScene = {};
    var seenAct = {};
    var seenBeat = {};
    var personaIds = (personas || []).map(function (p) { return p.id; });
    var badStrings = /(TODO|FIXME|占位|lorem ipsum|placeholder)/i;
    var cnChars = /[\u4e00-\u9fa5]/;

    if (!Array.isArray(scenes) || scenes.length < 1) errors.push('scenes 为空');

    (scenes || []).forEach(function (scene, si) {
      if (!scene.id) errors.push('场景 ' + si + ' 缺少 id');
      if (seenScene[scene.id]) errors.push('重复场景 id: ' + scene.id);
      seenScene[scene.id] = true;
      ['title', 'cn', 'hook', 'emoji'].forEach(function (k) {
        if (!scene[k]) errors.push(scene.id + ' 缺少字段 ' + k);
      });
      if (!scene.choice || !Array.isArray(scene.choice.options) || scene.choice.options.length < 2) {
        errors.push(scene.id + ' 缺少二选一分支');
      } else {
        var optIds = {};
        scene.choice.options.forEach(function (opt) {
          if (!opt.id || !opt.label || !opt.outcome) errors.push(scene.id + ' 分支字段不完整: ' + JSON.stringify(opt).slice(0, 60));
          if (optIds[opt.id]) errors.push(scene.id + ' 重复分支 id: ' + opt.id);
          optIds[opt.id] = true;
        });
      }
      if (si > 0) {
        var prev = scenes[si - 1];
        if (!scene.callbacks) {
          errors.push(scene.id + ' 缺少 callbacks（必须引用上一集分支）');
        } else {
          prev.choice.options.forEach(function (opt) {
            var line = scene.callbacks[opt.id];
            if (!line) errors.push(scene.id + ' callbacks 缺少分支 "' + opt.id + '" 的承接文案');
            else if (badStrings.test(line)) errors.push(scene.id + ' callbacks 含占位文本');
          });
        }
      }
      if (typeof scene.season !== 'number' || scene.season < 1 || scene.season > 3) {
        errors.push(scene.id + ' 缺少合法的 season 字段');
      }
      personaIds.forEach(function (pid) {
        if (!scene.personaClose || !scene.personaClose[pid]) errors.push(scene.id + ' 缺少人设结算文案: ' + pid);
      });

      var beatsInScene = 0;
      (scene.acts || []).forEach(function (act) {
        if (!act.id) errors.push(scene.id + ' 有 act 缺少 id');
        if (seenAct[act.id]) errors.push('重复 act id: ' + act.id);
        seenAct[act.id] = true;
        if (!act.beats || !act.beats.length) errors.push(act.id + ' 没有回合');
        (act.beats || []).forEach(function (beat) {
          beatsInScene += 1;
          if (!beat.id) errors.push(act.id + ' 有回合缺少 id');
          if (seenBeat[beat.id]) errors.push('重复 beat id: ' + beat.id);
          seenBeat[beat.id] = true;
          ['line', 'lineCn', 'intent', 'situation', 'tip'].forEach(function (k) {
            if (!beat[k]) errors.push(beat.id + ' 缺少字段 ' + k);
            else if (badStrings.test(beat[k])) errors.push(beat.id + ' 含占位文本: ' + beat[k]);
          });
          if (!Array.isArray(beat.chips) || beat.chips.length < 4) errors.push(beat.id + ' 词块不足');
          if (beat.line && cnChars.test(beat.line)) errors.push(beat.id + ' 英文台词里混入了中文');
          if (beat.tip && countSentences(beat.tip) > 2) errors.push(beat.id + ' 地道点超过两句，请压缩');
          if (!Array.isArray(beat.solutions) || !beat.solutions.length) {
            errors.push(beat.id + ' 没有参考答案');
            return;
          }
          var hasPass = false;
          beat.solutions.forEach(function (sol) {
            if (sol.level !== 'native' && sol.level !== 'ok') errors.push(beat.id + ' 参考答案 level 非法: ' + sol.level);
            if (sol.level === 'native' || sol.level === 'ok') hasPass = true;
            if (!sol.note) errors.push(beat.id + ' 参考答案缺少解释');
            if (!sol.text) { errors.push(beat.id + ' 参考答案为空'); return; }
            if (badStrings.test(sol.text)) errors.push(beat.id + ' 参考答案含占位文本');
            if (cnChars.test(sol.text)) errors.push(beat.id + ' 参考答案含中文（疑似中式表达）: ' + sol.text);
            var need = counts(wordsOf(sol.text));
            var pool = counts(wordsOf(beat.chips || []));
            Object.keys(need).forEach(function (w) {
              if ((pool[w] || 0) < need[w]) errors.push(beat.id + ' 词块不足: 需要 "' + w + '" ×' + need[w] + '（参考句：' + sol.text + '）');
            });
          });
          if (!hasPass) errors.push(beat.id + ' 没有可通过的参考答案');
        });
      });
      if (beatsInScene < 3) errors.push(scene.id + ' 回合太少: ' + beatsInScene);
    });

    return errors;
  }

  return {
    STATE_VERSION: STATE_VERSION,
    STORAGE_KEY: STORAGE_KEY,
    XP_BY_GRADE: XP_BY_GRADE,
    wordsOf: wordsOf,
    evaluate: evaluate,
    bestSolution: bestSolution,
    createState: createState,
    migrate: migrate,
    setPersona: setPersona,
    isPassed: isPassed,
    applyAnswer: applyAnswer,
    flattenBeats: flattenBeats,
    sceneStats: sceneStats,
    sceneUnlocked: sceneUnlocked,
    currentSceneIndex: currentSceneIndex,
    nextUp: nextUp,
    sceneStatus: sceneStatus,
    completeScene: completeScene,
    recordOutcome: recordOutcome,
    personaClosing: personaClosing,
    sceneCallback: sceneCallback,
    countSentences: countSentences,
    totalStats: totalStats,
    phraseKey: phraseKey,
    isSaved: isSaved,
    toggleSaved: toggleSaved,
    dayKey: dayKey,
    daysBetween: daysBetween,
    addDays: addDays,
    updateStreak: updateStreak,
    sceneTiming: sceneTiming,
    dailyEpisode: dailyEpisode,
    reviewItem: reviewItem,
    reviewDue: reviewDue,
    reviewPending: reviewPending,
    reviewDueCount: reviewDueCount,
    reviewTotal: reviewTotal,
    gradeReview: gradeReview,
    validateContent: validateContent
  };
});
