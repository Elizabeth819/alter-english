/* ALTER 语音判定 —— 识别文本与参考答案的宽容比对 + 浏览器语音识别控制器。
 * 纯函数，无 DOM、无网络、无存储副作用。
 * 浏览器：window.ALTER_SPEECH ；Node：module.exports（供自动化测试）。
 *
 * 隐私：这里只处理“识别出来的文字”。App 不录音、不上传、不保存音频，
 * 语音识别本身由浏览器（Web Speech API）完成。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ALTER_SPEECH = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------------- 归一化 ---------------- */

  // 口头缩写/连读/识别器常见写法 → 标准写法（前后都做同样展开，保证两侧可比）
  var REDUCTIONS = {
    "can't": 'can not', cant: 'can not',
    "won't": 'will not', wont: 'will not',
    "shan't": 'shall not',
    "ain't": 'is not', aint: 'is not',
    cannot: 'can not',
    "let's": 'let us', lets: 'let us',
    gonna: 'going to',
    wanna: 'want to',
    gotta: 'got to',
    hafta: 'have to',
    shoulda: 'should have',
    woulda: 'would have',
    coulda: 'could have',
    musta: 'must have',
    kinda: 'kind of',
    sorta: 'sort of',
    dunno: 'do not know',
    lemme: 'let me',
    gimme: 'give me',
    "c'mon": 'come on', cmon: 'come on',
    cause: 'because', cos: 'because', coz: 'because', cuz: 'because',
    ya: 'you', yer: 'your',
    "y'all": 'you all', yall: 'you all',
    whatcha: 'what are you',
    gotcha: 'got you',
    ok: 'okay',
    yeah: 'yes', yep: 'yes', yup: 'yes',
    nope: 'no',
    alot: 'a lot',
    // 识别器常丢撇号
    its: 'it is', thats: 'that is', whats: 'what is',
    hes: 'he is', shes: 'she is',
    theres: 'there is', heres: 'here is',
    whos: 'who is', wheres: 'where is', hows: 'how is',
    dont: 'do not', doesnt: 'does not', didnt: 'did not',
    isnt: 'is not', arent: 'are not',
    wasnt: 'was not', werent: 'were not',
    hasnt: 'has not', havent: 'have not', hadnt: 'had not',
    wouldnt: 'would not', couldnt: 'could not', shouldnt: 'should not', mustnt: 'must not',
    im: 'i am', youre: 'you are',
    ive: 'i have', youve: 'you have', weve: 'we have', theyve: 'they have',
    youll: 'you will', theyll: 'they will', youd: 'you would', theyd: 'they would'
  };

  var SUFFIX = { s: 'is', ll: 'will', re: 'are', ve: 'have', d: 'would', m: 'am' };

  // 语气词/停顿词：识别器会加，但不应算“多说了词”
  var FILLERS = { uh: 1, um: 1, erm: 1, hmm: 1, mm: 1, mmm: 1, ah: 1, eh: 1 };

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

  /** 把一句话拆成可比较的标准词序列。 */
  function canonicalize(input) {
    var raw = wordsOf(input);
    var out = [];
    raw.forEach(function (token) {
      var mapped = REDUCTIONS[token];
      if (mapped) { out = out.concat(mapped.split(' ')); return; }
      if (/n't$/.test(token)) { out.push(token.slice(0, -3)); out.push('not'); return; }
      var m = /^([a-z0-9]+)'(s|ll|re|ve|d|m)$/.exec(token);
      if (m) { out.push(m[1]); out.push(SUFFIX[m[2]]); return; }
      out.push(token);
    });
    return out;
  }

  /** 去掉语气词后再比较，避免“um…”被判成多说。 */
  function heardWords(transcript) {
    return canonicalize(transcript).filter(function (w) { return !FILLERS[w]; });
  }

  /* ---------------- 比对 ---------------- */

  function counts(list) {
    var map = {};
    for (var i = 0; i < list.length; i++) map[list[i]] = (map[list[i]] || 0) + 1;
    return map;
  }

  function overlap(a, b) {
    var pool = counts(b);
    var n = 0;
    a.forEach(function (w) {
      if (pool[w]) { pool[w] -= 1; n += 1; }
    });
    return n;
  }

  function lcs(a, b) {
    if (!a.length || !b.length) return 0;
    var prev = new Array(b.length + 1);
    var cur = new Array(b.length + 1);
    for (var j = 0; j <= b.length; j++) prev[j] = 0;
    for (var i = 1; i <= a.length; i++) {
      cur[0] = 0;
      for (var k = 1; k <= b.length; k++) {
        cur[k] = a[i - 1] === b[k - 1] ? prev[k - 1] + 1 : Math.max(prev[k], cur[k - 1]);
      }
      var tmp = prev; prev = cur; cur = tmp;
    }
    return prev[b.length];
  }

  function missingFrom(target, heard) {
    var pool = counts(heard);
    var list = [];
    target.forEach(function (w) {
      if (pool[w]) pool[w] -= 1;
      else list.push(w);
    });
    return list;
  }

  function extraFrom(heard, target) {
    var pool = counts(target);
    var list = [];
    heard.forEach(function (w) {
      if (pool[w]) pool[w] -= 1;
      else list.push(w);
    });
    return list;
  }

  var LABEL = { pass: '说对了', close: '差一点', unclear: '没听清' };
  var RANK = { pass: 3, close: 2, unclear: 1 };

  function judge(heard, target, transcript, solution) {
    var targetLen = target.length;
    var bag = overlap(heard, target);
    var inOrder = lcs(heard, target);
    var coverage = targetLen ? bag / targetLen : 0;
    var order = bag ? inOrder / bag : 0;
    var missing = missingFrom(target, heard);
    var extra = extraFrom(heard, target);
    var extraLimit = Math.max(2, Math.round(targetLen * 0.34));
    var status;

    if (!heard.length) status = 'unclear';
    else if (coverage >= 0.9 && order >= 0.6 && extra.length <= extraLimit) status = 'pass';
    else if (coverage >= 0.5) status = 'close';
    else status = 'unclear';

    return {
      status: status,
      label: LABEL[status],
      transcript: String(transcript == null ? '' : transcript).trim(),
      heard: heard,
      solution: solution ? solution.text : '',
      missing: missing,
      extra: extra,
      coverage: Math.round(coverage * 100) / 100,
      order: Math.round(order * 100) / 100
    };
  }

  function better(a, b) {
    if (!b) return true;
    if (RANK[a.status] !== RANK[b.status]) return RANK[a.status] > RANK[b.status];
    if (a.coverage !== b.coverage) return a.coverage > b.coverage;
    if (a.order !== b.order) return a.order > b.order;
    return a.extra.length < b.extra.length;
  }

  /**
   * 把识别文本和回合的参考答案做宽容比对。
   * @param {string} transcript 浏览器识别出的文字
   * @param {object} beat 回合数据（含 solutions）
   * @returns {{status:string,label:string,transcript:string,heard:string[],
   *            solution:string,missing:string[],extra:string[],
   *            coverage:number,order:number}}
   */
  function matchTranscript(transcript, beat) {
    var solutions = (beat && beat.solutions) || [];
    if (!solutions.length) throw new Error('beat 缺少 solutions: ' + (beat && beat.id));
    var heard = heardWords(transcript);
    var best = null;
    solutions.forEach(function (sol) {
      var target = canonicalize(sol.text);
      var result = judge(heard, target, transcript, sol);
      if (better(result, best)) best = result;
    });
    return best;
  }

  /* ---------------- 语音识别控制器 ---------------- */

  function supported(win) {
    var w = win || (typeof window !== 'undefined' ? window : null);
    return !!(w && (w.SpeechRecognition || w.webkitSpeechRecognition));
  }

  function normalizeError(code) {
    if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'permission-denied') return 'denied';
    if (code === 'audio-capture') return 'no-mic';
    if (code === 'no-speech') return 'no-speech';
    if (code === 'network') return 'network';
    if (code === 'aborted') return 'aborted';
    return 'error';
  }

  /**
   * 创建一次识别会话。可注入 factory（测试时用假识别器，不碰真实麦克风）。
   * @param {{window?:object, factory?:Function, lang?:string, timeout?:number}} opts
   * @returns {{supported:boolean, start:Function, abort:Function}}
   */
  function createController(opts) {
    var o = opts || {};
    var win = o.window || (typeof window !== 'undefined' ? window : null);
    var Factory = o.factory || (win && (win.SpeechRecognition || win.webkitSpeechRecognition)) || null;
    var lang = o.lang || 'en-US';
    var timeout = typeof o.timeout === 'number' ? o.timeout : 9000;
    var rec = null;
    var timer = null;
    var finished = false;
    var handlers = {};

    function stopTimer() {
      if (timer) { clearTimeout(timer); timer = null; }
    }

    function finish(kind, payload) {
      if (finished) return;
      finished = true;
      stopTimer();
      if (kind === 'end') {
        if (handlers.end) handlers.end();
        return;
      }
      if (handlers[kind]) handlers[kind](payload);
      if (handlers.end) handlers.end();
    }

    function start(callbacks) {
      handlers = callbacks || {};
      if (!Factory) {
        finished = true;
        if (handlers.error) handlers.error('unsupported');
        return false;
      }
      finished = false;
      try {
        rec = new Factory();
      } catch (e) {
        finished = true;
        if (handlers.error) handlers.error('unsupported');
        return false;
      }

      rec.lang = lang;
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;

      rec.onresult = function (ev) {
        if (finished) return;
        var text = '';
        var finalText = '';
        var isFinal = false;
        var results = (ev && ev.results) || [];
        var from = typeof ev.resultIndex === 'number' ? ev.resultIndex : 0;
        for (var i = from; i < results.length; i++) {
          var res = results[i];
          var chunk = res && res[0] ? res[0].transcript : '';
          text += chunk;
          if (res && res.isFinal) { isFinal = true; finalText += chunk; }
        }
        if (!isFinal) {
          if (handlers.interim) handlers.interim(text);
          return;
        }
        finish('result', { transcript: finalText || text });
      };

      rec.onerror = function (ev) {
        if (finished) return;
        finish('error', normalizeError(ev && ev.error));
      };

      rec.onend = function () {
        // 没有拿到任何结果就结束了：当作“没听清”，由界面给出降级路径。
        if (!finished) finish('empty', { transcript: '' });
      };

      timer = setTimeout(function () {
        timer = null;
        try { rec.stop(); } catch (e) { /* 忽略 */ }
        finish('empty', { transcript: '' });
      }, timeout);

      try {
        rec.start();
      } catch (e) {
        finish('error', 'start-failed');
        return false;
      }
      return true;
    }

    function abort() {
      finished = true;
      stopTimer();
      if (rec) {
        try { rec.abort(); } catch (e) { /* 忽略 */ }
      }
    }

    return { supported: !!Factory, start: start, abort: abort };
  }

  return {
    matchTranscript: matchTranscript,
    canonicalize: canonicalize,
    heardWords: heardWords,
    createController: createController,
    supported: supported
  };
});
