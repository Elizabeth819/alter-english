/* ALTER · 另一个我 —— 界面层
 * 依赖：window.ALTER_CONTENT（内容）、window.ALTER_ENGINE（纯逻辑）
 * 无框架、无构建、无网络请求；双击 index.html 即可运行。
 */
(function () {
  'use strict';

  var E = window.ALTER_ENGINE;
  var C = window.ALTER_CONTENT;
  var SP = window.ALTER_SPEECH;
  var AN = window.ALTER_ANALYTICS;
  var stage = document.getElementById('stage');
  if (!E || !C || !stage) {
    if (stage) {
      stage.innerHTML = '<div class="empty"><b>页面没加载完整</b><br>刷新一次通常就能好。<br>' +
        '<a class="btn btn-ghost btn-sm" href="./" style="margin-top:14px;display:inline-flex">刷新重试</a></div>';
    }
    return;
  }

  var SCENES = C.SCENES;
  var PERSONAS = C.PERSONAS;
  var TAB_META = { home: '剧情', book: '句子本', persona: '人设' };
  var LIVE_URL = 'https://elizabeth819.github.io/alter-english/';

  /* ---------------- 存储 ---------------- */

  var hasLS = (function () {
    try { window.localStorage.setItem('__alter_t', '1'); window.localStorage.removeItem('__alter_t'); return true; }
    catch (e) { return false; }
  })();

  function loadState() {
    if (!hasLS) return E.createState();
    try { return E.migrate(JSON.parse(window.localStorage.getItem(E.STORAGE_KEY))); }
    catch (e) { return E.createState(); }
  }

  var state = loadState();

  function persist() {
    if (!hasLS) return;
    try { window.localStorage.setItem(E.STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* 隐私模式下静默 */ }
  }

  /* ---------------- 视图状态 ---------------- */

  var view = {
    screen: 'home',
    sceneId: null,
    index: 0,
    selected: [],
    feedback: null,
    fails: 0,
    showCn: true
  };

  /* ---------------- 语音偏好 ---------------- */

  var SPEECH_OFF_KEY = 'alter.speech.off';
  var SPEECH_INTRO_KEY = 'alter.speech.intro.v1';

  function readFlag(key) {
    try { return window.localStorage.getItem(key) === '1'; } catch (e) { return false; }
  }

  function writeFlag(key, on) {
    try { window.localStorage.setItem(key, on ? '1' : '0'); } catch (e) { /* 隐私模式下忽略 */ }
  }

  view.speech = null;          // 最近一次比对结果
  view.speechState = 'idle';   // idle | listening
  view.speechInterim = '';     // 正在识别中的临时文本
  view.speechNotice = '';      // 降级提示（不弹窗）
  view.speechOff = readFlag(SPEECH_OFF_KEY);
  view.speechGuide = false;    // 首次引导
  var speechController = null;

  /* ---------------- 本机埋点 ---------------- */

  var analytics = AN ? AN.migrate(readJSON(AN.STORAGE_KEY)) : null;
  var brandTaps = 0;
  var brandTapStart = 0;

  // 试用编号：只从链接参数读取，存本机；不含姓名等个人信息。
  var TRIAL_KEY = 'alter.trial.v1';

  function readTrialId() {
    var m = /[?&]trial=([A-Za-z0-9_-]{1,12})/.exec(window.location.search || '');
    if (m) {
      var id = m[1].toUpperCase();
      try { window.localStorage.setItem(TRIAL_KEY, id); } catch (e) { /* 隐私模式忽略 */ }
      return id;
    }
    try { return window.localStorage.getItem(TRIAL_KEY) || ''; } catch (e) { return ''; }
  }

  var trialId = readTrialId();

  function readJSON(key) {
    try { return JSON.parse(window.localStorage.getItem(key)); } catch (e) { return null; }
  }

  function saveAnalytics() {
    if (!AN || !analytics || !hasLS) return;
    try { window.localStorage.setItem(AN.STORAGE_KEY, JSON.stringify(analytics)); } catch (e) { /* 隐私模式忽略 */ }
  }

  function track(name, props) {
    if (!AN || !analytics) return;
    analytics = AN.record(analytics, name, props);
    saveAnalytics();
  }

  /* ---------------- 小工具 ---------------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function byId(id) {
    for (var i = 0; i < SCENES.length; i++) if (SCENES[i].id === id) return SCENES[i];
    return null;
  }

  function sceneIndexOf(id) {
    for (var i = 0; i < SCENES.length; i++) if (SCENES[i].id === id) return i;
    return -1;
  }

  function seasonOf(scene) { return scene.season || 1; }

  function seasonTitle(n) {
    var list = C.SEASONS || [];
    for (var i = 0; i < list.length; i++) if (list[i].index === n) return list[i].title;
    return '第 ' + n + ' 季';
  }

  /** 该集在本季里的序号（从 1 开始） */
  function episodeInSeason(index) {
    var n = 0;
    for (var i = 0; i <= index; i++) if (seasonOf(SCENES[i]) === seasonOf(SCENES[index])) n += 1;
    return n;
  }

  function persona() {
    for (var i = 0; i < PERSONAS.length; i++) if (PERSONAS[i].id === state.persona) return PERSONAS[i];
    return PERSONAS[0];
  }

  function beatsOf(scene) { return E.flattenBeats(scene); }

  function firstUnpassedIndex(scene) {
    var list = beatsOf(scene);
    for (var i = 0; i < list.length; i++) if (!state.passed[list[i].beat.id]) return i;
    return -1;
  }

  function todayKey() {
    return E.dayKey(new Date());
  }

  /** 在已加载的剧集里找回合（复习队列只有 beatId）。 */
  function findBeat(beatId) {
    for (var i = 0; i < SCENES.length; i++) {
      var list = beatsOf(SCENES[i]);
      for (var j = 0; j < list.length; j++) {
        if (list[j].beat.id === beatId) return { beat: list[j].beat, scene: SCENES[i], index: j };
      }
    }
    return null;
  }

  function currentBeat() {
    if (view.screen === 'review') {
      var hit = view.review && view.review.list[view.review.index];
      return hit ? hit.beat : null;
    }
    var scene = byId(view.sceneId);
    if (!scene) return null;
    var item = beatsOf(scene)[view.index];
    return item ? item.beat : null;
  }

  function dueReviewCount() {
    return E.reviewDueCount(state, todayKey());
  }

  function sceneXp(scene) {
    var xp = 0;
    beatsOf(scene).forEach(function (x) {
      var g = state.passed[x.beat.id];
      if (g === 'native') xp += 10;
      else if (g === 'ok') xp += 7;
    });
    return xp;
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1600);
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) { toast('这个浏览器不支持朗读'); return; }
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.92;
    u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function rerender() {
    var y = window.scrollY;
    render();
    window.scrollTo(0, y);
  }

  /* ---------------- 开口说（语音） ---------------- */

  function speechReady() {
    return !!(SP && SP.supported && SP.supported(window));
  }

  function resetSpeech() {
    if (speechController) {
      speechController.abort();
      speechController = null;
    }
    view.speech = null;
    view.speechState = 'idle';
    view.speechInterim = '';
    view.speechNotice = '';
    view.speechGuide = false;
  }

  function speechResultHtml(r) {
    var cls = r.status === 'pass' ? 'ok' : r.status === 'close' ? 'half' : 'fail';
    var heard = r.transcript ? '听到：' + esc(r.transcript) : '没有听到声音';
    var missing = r.status !== 'unclear' && r.missing && r.missing.length
      ? '<div class="speech-missing">没对上 ' + r.missing.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</div>'
      : '';
    var actions = r.status === 'pass'
      ? '<button class="btn btn-primary btn-sm" data-action="speech-submit">交卷看分数 →</button>' +
        '<button class="btn btn-ghost btn-sm" data-action="start-speech">再说一次</button>'
      : '<button class="btn btn-primary btn-sm" data-action="start-speech">再说一次</button>' +
        '<button class="btn btn-ghost btn-sm" data-action="speech-submit">用词块交卷</button>';

    return '' +
      '<div class="speech-result ' + cls + '" role="status">' +
        '<div class="speech-head">' +
          '<span class="speech-badge ' + r.status + '">' + r.label + '</span>' +
          '<span class="speech-heard">' + heard + '</span>' +
        '</div>' +
        missing +
        '<p class="speech-tip">语音只判断有没有真的说出口，分数仍按词块判定。</p>' +
        '<div class="speech-actions">' + actions + '</div>' +
      '</div>';
  }

  function speechArea(locked) {
    if (locked || !SP) return '';
    var privacy = '<p class="privacy-line">ALTER 不录音、不上传、不保存音频；识别由浏览器完成，只在本机比对文字。</p>';
    if (!speechReady()) {
      return '<div class="speech-note">这个浏览器不支持语音识别，用词块交卷一样算数。</div>' + privacy;
    }
    if (view.speechOff) {
      var offMsg = view.speechNotice || '语音已关 · 用词块交卷一样算数。';
      return '<div class="speech-note">' + esc(offMsg) + ' ' +
        '<button class="link" data-action="speech-on">重新开启</button></div>' + privacy;
    }
    if (view.speechState === 'listening') {
      return '' +
        '<div class="listen-panel" role="status">' +
          '<span class="listen-dot" aria-hidden="true"></span>' +
          '<div class="listen-text"><b>正在听…</b>' +
            '<p>念出你拼好的这句话<span id="speech-heard">' + (view.speechInterim ? '：' + esc(view.speechInterim) : '') + '</span></p>' +
          '</div>' +
          '<button class="btn btn-ghost btn-sm" data-action="cancel-speech">取消</button>' +
        '</div>' + privacy;
    }
    if (view.speech) return speechResultHtml(view.speech) + privacy;

    return '' +
      '<div class="speech-row">' +
        '<button class="speech-open" data-action="start-speech">🎙 开口说 · 念出这句话</button>' +
        '<button class="link" data-action="speech-off">关掉语音</button>' +
      '</div>' + privacy +
      (view.speechNotice ? '<div class="speech-note">' + esc(view.speechNotice) + '</div>' : '');
  }

  function speechGuideHtml() {
    return '' +
      '<div class="sheet-mask" data-action="close-speech-guide" role="dialog" aria-modal="true" aria-labelledby="speech-guide-title">' +
        '<div class="sheet" data-action="sheet-keep">' +
          '<div class="sheet-emoji">🎙</div>' +
          '<h2 class="sheet-title" id="speech-guide-title">先开口，再谈说得对不对</h2>' +
          '<p class="sheet-sub">词块能拼对，不代表嘴上说得出。念一遍，才算真的会。</p>' +
          '<ul class="guide-list">' +
            '<li><b>会弹一次授权</b>点“开始说”后，浏览器会问你是否允许使用麦克风。</li>' +
            '<li><b>拒绝也没关系</b>会自动回到点词块交卷，不扣分、不卡住。</li>' +
            '<li><b>隐私与关闭</b>不录音、不上传音频；不想要了，随时可以关掉。</li>' +
          '</ul>' +
          '<div class="sheet-actions">' +
            '<button class="btn btn-primary" data-action="speech-allow">开始说</button>' +
            '<button class="btn btn-ghost" data-action="close-speech-guide">先不开口</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function startSpeech() {
    if (!speechReady()) {
      view.speechNotice = '这个浏览器不支持语音识别，用词块交卷一样算数。';
      rerender();
      return;
    }
    if (!view.selected.length) {
      toast('先用词块拼出这句话，再开口');
      return;
    }
    if (!readFlag(SPEECH_INTRO_KEY)) {
      view.speechGuide = true;
      rerender();
      setTimeout(function () {
        var btn = document.querySelector('[data-action="speech-allow"]');
        if (btn) btn.focus();
      }, 30);
      return;
    }
    beginListening();
  }

  function closeSpeechGuide() {
    view.speechGuide = false;
    rerender();
    setTimeout(function () {
      var btn = document.querySelector('[data-action="start-speech"]');
      if (btn) btn.focus();
    }, 20);
  }

  function beginListening() {
    view.speechGuide = false;
    view.speech = null;
    view.speechNotice = '';
    view.speechInterim = '';
    view.speechState = 'listening';
    render();
    setTimeout(function () {
      var btn = document.querySelector('[data-action="cancel-speech"]');
      if (btn) btn.focus();
    }, 30);
    speechController = SP.createController({ window: window });

    var started = speechController.start({
      interim: function (text) {
        view.speechInterim = text;
        var el = document.getElementById('speech-heard');
        if (el) el.textContent = '：' + text;
      },
      result: function (res) {
        view.speechState = 'idle';
        view.speechInterim = '';
        speechController = null;
        var beat = currentBeat();
        if (beat) {
          view.speech = SP.matchTranscript(res.transcript, beat);
          var revCurrent = view.screen === 'review' && view.review
            ? view.review.list[view.review.index]
            : null;
          track('speech_use', {
            beatId: beat.id,
            sceneId: revCurrent ? revCurrent.scene.id : view.sceneId,
            status: view.speech.status,
            mode: view.screen === 'review' ? 'review' : 'play'
          });
        }
        rerender();
        setTimeout(function () {
          var box = document.querySelector('.speech-result');
          if (box && box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      },
      error: function (code) {
        onSpeechError(code);
      },
      end: function () {
        speechController = null;
        if (view.speechState === 'listening') {
          view.speechState = 'idle';
          view.speechInterim = '';
          view.speechNotice = '没听清，再说一次，或者直接用词块交卷。';
          rerender();
        }
      }
    });

    if (!started) {
      onSpeechError('unsupported');
    }
  }

  function onSpeechError(code) {
    if (code === 'aborted') return;
    view.speechState = 'idle';
    view.speechInterim = '';
    speechController = null;
    if (code === 'denied' || code === 'no-mic' || code === 'unsupported' || code === 'start-failed') {
      view.speechOff = true;
      writeFlag(SPEECH_OFF_KEY, true);
      view.speechNotice = '没有拿到麦克风。用词块交卷一样能过，想再试可以点“重新开启”。';
    } else if (code === 'no-speech') {
      view.speechNotice = '这次没听到声音，靠近一点再说，或者直接用词块交卷。';
    } else if (code === 'network') {
      view.speechNotice = '语音识别暂时不可用，用词块交卷一样能过。';
    } else {
      view.speechNotice = '这次没识别成功，用词块交卷一样能过。';
    }
    rerender();
  }

  function cancelSpeech() {
    if (speechController) {
      speechController.abort();
      speechController = null;
    }
    view.speechState = 'idle';
    view.speechInterim = '';
    rerender();
  }

  /* ---------------- 顶栏 / 底栏 ---------------- */

  function updateChrome() {
    var xp = document.getElementById('pill-xp');
    var st = document.getElementById('pill-streak');
    if (xp) xp.textContent = state.xp + ' XP';
    if (st) {
      st.textContent = '🔥 ' + state.streak;
      st.className = 'pill' + (state.streak > 0 ? ' hot' : '');
    }
    document.querySelectorAll('.tab').forEach(function (btn) {
      var target = btn.getAttribute('data-tab');
      var storyScreen = view.screen === 'intro' || view.screen === 'play' || view.screen === 'choice' || view.screen === 'result';
      var reviewScreen = view.screen === 'review' || view.screen === 'reviewDone';
      btn.classList.toggle('on', target === view.screen || (storyScreen && target === 'home') || (reviewScreen && target === 'book'));
    });
  }

  /* ---------------- 首页 ---------------- */

  function sceneCardHtml(scene, i, today) {
    var stats = E.sceneStats(state, scene);
    var st = E.sceneStatus(state, SCENES, i);
    var timing = E.sceneTiming(state, SCENES, i, today);
    var badge = '';
    var cls = '';
    if (st === 'locked') { badge = '🔒 未解锁'; cls = 'locked'; }
    else if (st === 'done') { badge = '✓ 已完成'; cls = 'done'; }
    else if (st === 'choice') { badge = '等你选择'; cls = 'active'; }
    else if (timing.status === 'early') { badge = '⚡ 提前解锁'; cls = 'early'; }
    else if (timing.status === 'today') { badge = stats.passed ? stats.passed + '/' + stats.total + ' 幕' : '今天'; cls = 'active'; }
    else { badge = stats.passed + '/' + stats.total + ' 幕'; cls = 'active'; }

    return '' +
      '<button class="scene-card ' + cls + '" data-action="open-scene" data-id="' + scene.id + '">' +
        '<span class="scene-thumb">' + (st === 'locked' ? '🔒' : scene.emoji) + '</span>' +
        '<span class="scene-info"><b>第 ' + (i + 1) + ' 集 · ' + esc(scene.cn) + '</b>' +
          '<span>' + esc(scene.title) + '</span></span>' +
        '<span class="scene-badge ' + (st === 'done' || st === 'choice' ? 'ok' : cls === 'early' ? 'early' : st === 'active' ? 'on' : '') + '">' + badge + '</span>' +
      '</button>';
  }

  function renderHome() {
    if (C.allLoaded && !C.allLoaded()) {
      loadAllSeasons().then(function () {
        if (view.screen === 'home') rerender();
      });
    }
    var t = E.totalStats(state, SCENES);
    var today = todayKey();
    var plan = E.dailyEpisode(state, SCENES, today);
    var due = E.reviewDueCount(state, today);
    var pending = E.reviewPending(state, today);
    var all = C.allLoaded ? C.allLoaded() : true;
    var html = '';

    if (plan.status === 'complete') {
      html += '' +
        '<section class="hero">' +
          '<div class="hero-emoji">🏁</div>' +
          '<div class="eyebrow">全三季 · 完结</div>' +
          '<div class="hero-title">你走完了 ' + SCENES.length + ' 集</div>' +
          '<div class="hero-cn">' + t.passed + ' 幕全部通过，' + t.native + ' 句达到地道水平</div>' +
          '<div class="hero-hook">从食堂窗口到毕业告别，这个“英语的你”已经能自己处理很多事了。</div>' +
          '<div class="hero-cta"><div class="meta">' + (due ? due + ' 句等待复习' : '每天回来复习几句，别让它们溜走') + '</div>' +
            '<button class="btn btn-primary btn-sm" data-action="' + (due ? 'start-review' : 'go-book') + '">' +
              (due ? '复习 ' + due + ' 句 →' : '打开句子本 →') + '</button></div>' +
        '</section>';
    } else if (plan.scene) {
      var s = plan.scene;
      var total = beatsOf(s).length;
      var idx = firstUnpassedIndex(s);
      var global = plan.index + 1;
      var early = plan.status === 'early';
      var resume = idx > 0;
      html += '' +
        '<section class="hero' + (early ? ' hero-done' : '') + '">' +
          '<div class="hero-emoji">' + s.emoji + '</div>' +
          '<div class="eyebrow">' + (early ? '今天的 3 分钟 · 已完成 ✓' : '今天的 3 分钟') + '</div>' +
          '<div class="hero-title">' + esc(s.cn) + '</div>' +
          '<div class="hero-cn">' + esc(s.title) + ' · ' + seasonTitle(seasonOf(s)) + ' · 第 ' + global + ' 集</div>' +
          '<div class="hero-hook">' + esc(s.hook) + '</div>' +
          (early ? '<div class="early-note">这一集原定 <b>' + esc(plan.scheduledFor) + '</b> 解锁。想提前看也可以，明天照常更新。</div>' : '') +
          '<div class="hero-cta">' +
            '<div class="meta">' + (early
              ? '提前解锁 · 第 ' + global + ' 集 · ' + total + ' 幕'
              : resume
                ? '已演到第 ' + (idx + 1) + ' / ' + total + ' 幕'
                : '约 ' + (s.minutes || 3) + ' 分钟 · ' + total + ' 幕') + '</div>' +
            '<button class="btn btn-primary btn-sm" data-action="open-scene" data-id="' + s.id + '">' +
              (early ? '提前看第 ' + global + ' 集 →' : resume ? '继续今天的 3 分钟 →' : '开始今天的 3 分钟 →') +
            '</button>' +
          '</div>' +
        '</section>';
    }

    if (due) {
      html += '' +
        '<button class="review-banner" data-action="start-review">' +
          '<span class="review-badge">复习</span>' +
          '<span class="review-text"><b>' + due + ' 句到期</b>' +
            '<span>说错或只说“能懂”的句子会按遗忘节奏回来，答对才移出</span></span>' +
          '<span class="review-arrow">→</span>' +
        '</button>';
    }

    html += '' +
      '<div class="stats-grid">' +
        '<div class="stat"><b>' + t.xp + '</b><span>XP</span></div>' +
        '<div class="stat"><b>' + state.streak + '</b><span>连击天数</span></div>' +
        '<div class="stat"><b>' + t.native + '</b><span>地道句</span></div>' +
        '<div class="stat"><b>' + t.percent + '%</b><span>总进度</span></div>' +
      '</div>';

    var currentSeason = plan.scene ? seasonOf(plan.scene) : 3;
    var seasonScenes = [];
    SCENES.forEach(function (scene, i) { if (seasonOf(scene) === currentSeason) seasonScenes.push(i); });
    var doneInSeason = seasonScenes.filter(function (i) { return E.sceneStats(state, SCENES[i]).done; }).length;

    html += '<div class="section-head"><h2 class="h2">本季 · ' + esc(seasonTitle(currentSeason)) + '</h2>' +
      '<span class="sub">' + doneInSeason + ' / ' + seasonScenes.length + ' 集</span></div>' +
      '<div class="scene-list">';
    seasonScenes.forEach(function (i) { html += sceneCardHtml(SCENES[i], i, today); });
    html += '</div>';

    if (!all) {
      html += '<div class="load-hint">正在载入后续剧集…</div>';
    } else {
      html += '<details class="all-scenes"><summary>全部剧集 · ' + SCENES.length + ' 集</summary><div class="scene-list">';
      SCENES.forEach(function (scene, i) {
        if (i === 0 || seasonOf(scene) !== seasonOf(SCENES[i - 1])) {
          html += '<div class="season-head"><span>' + esc(seasonTitle(seasonOf(scene))) + '</span>' +
            '<span class="sub">' + (seasonOf(scene) === 3 ? 'B2' : seasonOf(scene) === 2 ? 'B1' : 'A2–B1') + '</span></div>';
        }
        html += sceneCardHtml(scene, i, today);
      });
      html += '</div></details>';
    }

    if (pending.length) {
      html += '<div class="teaser">另有 ' + pending.length + ' 句会在之后的复习里出现。先不用管。</div>';
    }
    if (!state.persona) html += '<div class="teaser">先选一个「英语分身」，你说的话会带上它的性格。</div>';

    stage.innerHTML = '<div class="screen">' + html + '</div>';
    updateChrome();
  }

  /* ---------------- 章节开场 ---------------- */

  function renderIntro() {
    var scene = byId(view.sceneId);
    if (!scene) return goHome();
    var list = beatsOf(scene);
    var idx = firstUnpassedIndex(scene);
    if (idx < 0) { view.index = list.length - 1; view.screen = 'result'; return render(); }
    view.index = idx;
    var isResume = idx > 0;

    var cast = scene.cast.map(function (c) {
      return '<span class="cast-item"><i>' + c.avatar + '</i>' + esc(c.name) + '</span>';
    }).join('');
    var recall = E.sceneCallback(state, SCENES, scene.id);
    var scIndex = sceneIndexOf(scene.id);
    var timing = E.sceneTiming(state, SCENES, scIndex, todayKey());
    var plan = E.dailyEpisode(state, SCENES, todayKey());
    var isToday = !!(plan && plan.scene && plan.scene.id === scene.id);

    stage.innerHTML = '' +
      '<div class="screen intro-wrap">' +
        '<div class="play-head">' +
          '<button class="back-btn" data-action="go-home" aria-label="返回">←</button>' +
          '<div class="play-title">' + seasonTitle(seasonOf(scene)) + ' · 第 ' + (scIndex + 1) + ' 集 / ' + SCENES.length + '</div>' +
        '</div>' +
        (isToday ? '<div class="eyebrow" style="margin-top:2px">今天的 3 分钟</div>' : '') +
        '<div class="intro-emoji">' + scene.emoji + '</div>' +
        '<h1 class="intro-title">' + esc(scene.cn) + '</h1>' +
        '<div class="intro-cn">' + esc(scene.title) + '</div>' +
        (timing.status === 'early' ? '<div class="early-note">⚡ 提前解锁 · 原定 ' + esc(timing.scheduledFor) + ' 解锁</div>' : '') +
        (recall ? '<div class="recall"><b>上次你选了</b>' + esc(recall) + '</div>' : '') +
        '<div class="intro-hook">' + esc(scene.hook) + '</div>' +
        '<div class="cast">' + cast + '</div>' +
        '<div class="intro-meta"><span>' + scene.level + '</span><span>' + scene.minutes + ' 分钟</span><span>' + list.length + ' 幕</span></div>' +
        '<button class="btn btn-primary" data-action="start-scene">' +
          (isResume ? '继续演 · 第 ' + (idx + 1) + ' 幕' : '开始这一集') +
        '</button>' +
        '<p class="sub" style="margin-top:14px;text-align:center;font-size:12px">先用词块拼出你要说的话；想更接近真的会，就再开口念一遍。</p>' +
      '</div>';
    updateChrome();
  }

  /* ---------------- 作答 ---------------- */

  function feedbackHtml(beat, r) {
    var meta = {
      native: ['地道', 'pass'],
      ok: ['能懂', 'pass'],
      order: ['顺序不对', 'half'],
      close: ['还差一点', 'half'],
      off: ['再想想', 'fail']
    };
    var m = meta[r.grade] || meta.off;
    var body = '';
    if (r.passed) {
      body =
        '<div class="solution">' + esc(r.solution.text) + '</div>' +
        '<div class="note">' + esc(r.solution.note) + '</div>' +
        '<div class="tip"><b>地道点</b> · ' + esc(beat.tip) + '</div>';
    } else if (r.grade === 'order') {
      body = '<div class="note">词都对，但英语的语序不对。把主语放到最前面，再排一次。</div>' +
        '<div class="tip"><b>提示</b> · 主语 + 动词 + 其他成分，中文的“把…放在最后”在英语里常常要换位置。</div>';
    } else if (r.grade === 'close') {
      body = '<div class="note">快到了。这句话还需要这些词：</div>' +
        '<div class="missing-chips">' + r.missing.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</div>';
    } else {
      body = '<div class="note">这次没接上。先想清楚对方到底在问什么，再拼你的回答。</div>';
    }

    if (!r.passed && view.fails >= 2) {
      var head = String(E.bestSolution(beat).text).split(/\s+/).slice(0, 2).join(' ');
      body += '<div class="tip"><b>提示</b> · 这句话以 “' + esc(head) + '” 开头。</div>';
    }
    if (!r.passed && view.fails >= 3) {
      body += '<div class="tip"><b>参考答案</b> · ' + esc(E.bestSolution(beat).text) + '</div>';
    }

    var actions = '';
    if (r.passed) {
      if (view.screen === 'review') {
        var lastOne = view.review && view.review.index >= view.review.list.length - 1;
        actions = '<button class="btn btn-primary btn-sm" data-action="next-review">' +
          (lastOne ? '完成复习 →' : '下一条 →') + '</button>';
      } else {
        actions = '<button class="btn btn-primary btn-sm" data-action="next-beat">继续</button>' +
          '<button class="btn btn-ghost btn-sm" data-action="save-phrase">收藏这句</button>';
      }
    } else {
      actions = '<button class="btn btn-ghost btn-sm" data-action="retry">再试一次</button>' +
        (view.fails >= 3 ? '<button class="btn btn-ghost btn-sm" data-action="fill-answer">照着拼</button>' : '');
    }

    return '<div class="feedback ' + m[1] + '" role="status">' +
      '<div class="grade-row"><span class="grade-badge ' + r.grade + '">' + m[0] + '</span>' +
      '<span class="grade-score">' + r.score + ' / 100' + (r.passed && view.screen !== 'review' ? ' · +' + r.xp + ' XP' : '') + '</span></div>' +
      body + '<div class="feedback-actions">' + actions + '</div></div>';
  }

  function renderPlay() {
    var scene = byId(view.sceneId);
    var list = beatsOf(scene);
    var item = list[view.index];
    if (!item) return nextBeat();
    var beat = item.beat;
    var locked = view.feedback && view.feedback.passed;

    var answer = view.selected.length
      ? view.selected.map(function (chipIdx, pos) {
          return '<button class="chip on" data-action="unpick-chip" data-pos="' + pos + '">' + esc(beat.chips[chipIdx]) + '</button>';
        }).join('')
      : '<span class="placeholder">点下面的词块，拼出你要说的那句话…</span>';

    var bank = beat.chips.map(function (chip, i) {
      var used = view.selected.indexOf(i) > -1;
      return '<button class="chip' + (used ? ' used' : '') + '" data-action="pick-chip" data-i="' + i + '">' + esc(chip) + '</button>';
    }).join('');

    stage.innerHTML = '' +
      '<div class="screen">' +
        '<div class="play-head">' +
          '<button class="back-btn" data-action="go-home" aria-label="返回首页">←</button>' +
          '<div class="play-title">' + seasonTitle(seasonOf(scene)) + ' · 第 ' + (sceneIndexOf(scene.id) + 1) + ' 集 · ' + esc(scene.cn) + '</div>' +
          '<span class="pill" style="margin-left:auto">' + (view.index + 1) + '/' + list.length + '</span>' +
        '</div>' +
        '<div class="progress"><i style="width:' + Math.round(((view.index) / list.length) * 100) + '%"></i></div>' +
        '<div class="act-pill">' + esc(item.act.title) + '</div>' +

        '<div class="npc">' +
          '<div class="avatar">' + beat.avatar + '</div>' +
          '<div class="bubble">' +
            '<div class="name">' + esc(beat.speaker) + '</div>' +
            '<div class="line">' + esc(beat.line) + '</div>' +
            (view.showCn ? '<div class="cn">' + esc(beat.lineCn) + '</div>' : '') +
            '<button class="speak-btn" data-action="speak" data-text="' + esc(beat.line) + '">🔊 听一遍</button>' +
          '</div>' +
        '</div>' +

        '<p class="situation">' + esc(beat.situation) + '</p>' +

        '<div class="mission">' +
          '<div class="label">你的台词</div>' +
          '<div class="text">' + esc(beat.intent) + '</div>' +
        '</div>' +

        '<div class="answer-zone' + (view.selected.length ? ' filled' : '') + '">' + answer + '</div>' +
        '<div class="bank' + (locked ? ' frozen' : '') + '">' + bank + '</div>' +

        speechArea(locked) +

        '<div class="play-actions">' +
          '<button class="btn btn-ghost" data-action="clear"' + (locked ? ' disabled' : '') + '>清空</button>' +
          '<button class="btn btn-primary" data-action="submit"' + (locked ? ' disabled' : '') + '>交卷</button>' +
        '</div>' +

        (view.feedback ? feedbackHtml(beat, view.feedback) : '') +
        (view.speechGuide ? speechGuideHtml() : '') +
      '</div>';

    updateChrome();
  }

  /* ---------------- 分支 ---------------- */

  function renderChoice() {
    var scene = byId(view.sceneId);
    var opts = scene.choice.options.map(function (o) {
      return '<button class="opt" data-action="pick-option" data-opt="' + o.id + '">' + esc(o.label) + '</button>';
    }).join('');

    stage.innerHTML = '' +
      '<div class="screen">' +
        '<div class="choice-card">' +
          '<div class="eyebrow">' + seasonTitle(seasonOf(scene)) + ' · 第 ' + (sceneIndexOf(scene.id) + 1) + ' 集 · 你的选择</div>' +
          '<div class="choice-prompt">' + esc(scene.choice.prompt) + '</div>' +
          opts +
          '<p class="sub" style="margin:10px 0 0;font-size:12px">没有标准答案。但这个选择会被记住。</p>' +
        '</div>' +
      '</div>';
    updateChrome();
  }

  /* ---------------- 结算 ---------------- */

  function renderResult() {
    var scene = byId(view.sceneId);
    var stats = E.sceneStats(state, scene);
    var choiceId = state.choices[scene.id];
    var opt = null;
    scene.choice.options.forEach(function (o) { if (o.id === choiceId) opt = o; });
    var outcome = state.outcomes[scene.id] || (opt ? opt.outcome : '');
    var idx = sceneIndexOf(scene.id);
    var nextScene = SCENES[idx + 1];
    var lastItem = beatsOf(scene)[beatsOf(scene).length - 1];

    var nextBtn = '';
    if (nextScene) {
      var crosses = seasonOf(nextScene) !== seasonOf(scene);
      var nextTiming = E.sceneTiming(state, SCENES, idx + 1, todayKey());
      nextBtn = '<button class="btn btn-primary" data-action="open-scene" data-id="' + nextScene.id + '">' +
        (crosses ? seasonTitle(seasonOf(nextScene)) + '开播 · ' : '下一集 · ') + esc(nextScene.cn) + ' →</button>' +
        (nextTiming.status === 'early' ? '<div class="early-note">下一集明天自动解锁，今天可以先看。</div>' : '');
    } else {
      nextBtn = '<button class="btn btn-primary" data-action="go-home">回到首页 · 全三季完</button>';
    }
    var dueNow = dueReviewCount();

    stage.innerHTML = '' +
      '<div class="screen">' +
        '<div class="result-hero">' +
          '<div class="eyebrow">' + seasonTitle(seasonOf(scene)) + ' · 第 ' + (idx + 1) + ' 集 · 本集完</div>' +
          '<div class="big">' + scene.emoji + ' ' + esc(scene.cn) + '</div>' +
          '<div class="small">' + esc(scene.title) + '</div>' +
        '</div>' +
        '<div class="score-row">' +
          '<div class="score-cell"><b>' + stats.native + '/' + stats.total + '</b><span>地道句</span></div>' +
          '<div class="score-cell"><b>+' + sceneXp(scene) + '</b><span>本集 XP</span></div>' +
          '<div class="score-cell"><b>' + state.streak + '</b><span>连击天数</span></div>' +
        '</div>' +
        (outcome ? '<div class="outcome">' + esc(outcome) + '</div>' : '') +
        '<div class="closing">「' + esc(E.personaClosing(scene, state.persona)) + '」</div>' +
        '<div id="card-holder"></div>' +
        '<div class="row" style="margin:14px 0 10px">' +
          '<button class="btn btn-ghost btn-sm" data-action="download-card">⬇ 下载名场面卡</button>' +
          '<button class="btn btn-ghost btn-sm" data-action="save-last">收藏最后一句</button>' +
        '</div>' +
        (dueNow ? '<button class="review-banner" data-action="start-review">' +
          '<span class="review-badge">复习</span>' +
          '<span class="review-text"><b>' + dueNow + ' 句到期</b><span>今天说错或只说“能懂”的句子，趁热再来一次</span></span>' +
          '<span class="review-arrow">→</span></button>' : '') +
        nextBtn +
        (nextScene ? '<div class="teaser">下一集：' + esc(nextScene.hook) + '</div>' : '') +
      '</div>';

    var holder = document.getElementById('card-holder');
    if (holder) {
      var canvas = buildCard(scene, lastItem, outcome);
      holder.appendChild(canvas);
      if (AN && analytics && !AN.hasEvent(analytics, 'card_generated', 'sceneId', scene.id)) {
        track('card_generated', { sceneId: scene.id, season: seasonOf(scene) });
      }
    }
    view.lastItem = lastItem;
    updateChrome();
  }

  /* ---------------- 名场面卡 ---------------- */

  function hexA(hex, alpha) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapLines(ctx, text, maxWidth, maxLines) {
    var words = String(text).split(/\s+/);
    var lines = [];
    var line = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = lines[maxLines - 1].replace(/[,;:]?$/, '') + '…';
    }
    return lines;
  }

  function buildCard(scene, lastItem, outcome) {
    var W = 1080;
    var H = 1350;
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.className = 'card-preview';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '名场面分享卡：' + (scene.cn || scene.title || ''));
    var ctx = canvas.getContext('2d');
    var p = persona();
    var idx = sceneIndexOf(scene.id);

    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#15151f');
    bg.addColorStop(0.55, '#0b0b12');
    bg.addColorStop(1, '#050508');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var g1 = ctx.createRadialGradient(90, 60, 0, 90, 60, 780);
    g1.addColorStop(0, hexA(p.color, 0.3));
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    var g2 = ctx.createRadialGradient(1010, 1200, 0, 1010, 1200, 700);
    g2.addColorStop(0, 'rgba(255,122,184,0.2)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    var font = '"Inter", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 42px ' + font;
    ctx.fillText('ALTER', 84, 122);

    ctx.fillStyle = p.color;
    ctx.fillRect(84, 142, 64, 5);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 26px ' + font;
    ctx.fillText('名场面 · SCENE ' + (idx + 1), 84, 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 64px ' + font;
    var titleLines = wrapLines(ctx, scene.title, W - 168, 2);
    titleLines.forEach(function (line, i) {
      ctx.fillText(line, 84, 300 + i * 76);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '500 30px ' + font;
    ctx.fillText(scene.cn, 84, 300 + titleLines.length * 76 + 20);

    // 台词卡
    var boxY = 510;
    var boxH = 430;
    ctx.fillStyle = 'rgba(255,255,255,0.055)';
    roundRect(ctx, 60, boxY, W - 120, boxH, 34);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = p.color;
    ctx.font = '800 26px ' + font;
    ctx.fillText('你说 / YOU SAID', 104, boxY + 62);

    var quote = lastItem ? E.bestSolution(lastItem.beat).text : '';
    ctx.fillStyle = '#f7f7fb';
    ctx.font = '700 58px ' + font;
    var quoteLines = wrapLines(ctx, quote, W - 220, 3);
    quoteLines.forEach(function (line, i) {
      ctx.fillText(line, 104, boxY + 152 + i * 76);
    });

    // 对方台词
    if (lastItem) {
      ctx.fillStyle = 'rgba(255,255,255,0.42)';
      ctx.font = '500 26px ' + font;
      var npcLine = lastItem.beat.speaker + ': "' + lastItem.beat.line + '"';
      var npcLines = wrapLines(ctx, npcLine, W - 220, 1);
      ctx.fillText(npcLines[0], 104, boxY + boxH - 42);
    }

    // 集数 / 地道句数
    var stats = E.sceneStats(state, scene);
    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.font = '600 28px ' + font;
    ctx.fillText('第 ' + (idx + 1) + ' 集 · 本集 ' + stats.native + '/' + stats.total + ' 句地道', 84, 992);

    // 底部人设
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    roundRect(ctx, 60, 1024, 640, 200, 30);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '500 60px ' + font;
    ctx.fillText(p.emoji, 96, 1140);

    ctx.font = '800 30px ' + font;
    ctx.fillText(p.name + ' · ' + p.en, 186, 1110);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '500 23px ' + font;
    ctx.fillText('在 ALTER 里，这是我说过的一句话。', 96, 1160);
    ctx.fillText('每天 3 分钟，用英语活另一种人生。', 96, 1196);

    // 扫码入口
    drawQr(ctx, 736, 1000, 272);

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '500 22px ' + font;
    ctx.fillText('ALTER · 另一个我', 84, 1300);
    var d = new Date();
    ctx.textAlign = 'right';
    ctx.fillText(E.dayKey(d), W - 84, 1300);
    ctx.textAlign = 'left';

    return canvas;
  }

  function drawQr(ctx, x, y, size) {
    if (!window.ALTER_QR) return false;
    var qr;
    try { qr = window.ALTER_QR.encode(LIVE_URL); } catch (e) { return false; }
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, x, y, size, size, 22);
    ctx.fill();

    var module = Math.floor((size - 56) / qr.size);
    var real = module * qr.size;
    var ox = x + Math.round((size - real) / 2);
    var oy = y + 20;
    ctx.fillStyle = '#0a0a10';
    for (var row = 0; row < qr.size; row++) {
      for (var col = 0; col < qr.size; col++) {
        if (qr.modules[row][col]) ctx.fillRect(ox + col * module, oy + row * module, module, module);
      }
    }
    ctx.fillStyle = 'rgba(10,10,16,0.68)';
    ctx.font = '700 21px "Inter", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('扫码玩这一集', x + size / 2, y + size - 20);
    ctx.textAlign = 'left';
    return true;
  }

  /* ---------------- 句子本 ---------------- */

  function renderBook() {
    var items = state.saved;
    var today = todayKey();
    var due = E.reviewDue(state, today);
    var pending = E.reviewPending(state, today);
    var html = '<div class="screen">' +
      '<div class="section-head" style="margin-top:10px">' +
        '<h1 class="h1">句子本</h1><span class="sub">' + items.length + ' 句收藏</span>' +
      '</div>' +
      '<div class="review-panel">' +
        '<div class="review-head">' +
          '<div><div class="eyebrow">复习队列</div>' +
            '<div class="review-num">' + due.length + '<span> 句到期</span></div></div>' +
          '<button class="btn btn-primary btn-sm" data-action="start-review"' + (due.length ? '' : ' disabled') + '>' +
            (due.length ? '开始复习 →' : '今天已清空') + '</button>' +
        '</div>' +
        '<p class="sub">说错或只说“能懂”的句子会按遗忘节奏回来；在复习里答对，才会移出。</p>' +
        (pending.length ? '<div class="review-next">另有 ' + pending.length + ' 句排队中，最早 ' + esc(pending[0].due) + ' 到期</div>' : '') +
      '</div>' +
      '<p class="sub" style="margin:18px 0 12px">下面是你说过、并且想留住的句子。忘了就听一遍。</p>';

    if (!items.length && !due.length) {
      html += '<div class="empty">还空着。<br>完成一幕之后，点「收藏这句」，<br>它就会出现在这里。</div>';
    } else {
      items.forEach(function (p, i) {
        html += '<div class="phrase">' +
          '<div class="en">' + esc(p.text) + '</div>' +
          (p.note ? '<div class="note">' + esc(p.note) + '</div>' : '') +
          (p.sceneTitle ? '<div class="from">来自 · ' + esc(p.sceneTitle) + '</div>' : '') +
          '<div class="phrase-actions">' +
            '<button class="btn btn-ghost btn-sm" data-action="speak" data-text="' + esc(p.text) + '">🔊 朗读</button>' +
            '<button class="btn btn-ghost btn-sm" data-action="del-phrase" data-i="' + i + '">删除</button>' +
          '</div>' +
        '</div>';
      });
    }
    html += '</div>';
    stage.innerHTML = html;
    updateChrome();
  }

  /* ---------------- 复习 ---------------- */

  function startReview() {
    if (C.allLoaded && !C.allLoaded()) {
      loadAllSeasons().then(function () { startReview(); });
      return;
    }
    resetSpeech();
    var today = todayKey();
    var items = E.reviewDue(state, today);
    var list = [];
    items.forEach(function (item) {
      var hit = findBeat(item.beatId);
      if (hit) list.push({ item: item, beat: hit.beat, scene: hit.scene });
    });
    if (!list.length) {
      toast('现在没有到期的句子');
      return;
    }
    view.review = { list: list, index: 0, correct: 0 };
    view.screen = 'review';
    view.selected = [];
    view.feedback = null;
    view.fails = 0;
    render();
    window.scrollTo(0, 0);
  }

  function renderReview() {
    var rev = view.review;
    if (!rev || !rev.list.length) { view.screen = 'book'; return renderBook(); }
    var cur = rev.list[rev.index];
    if (!cur) { view.screen = 'reviewDone'; return render(); }
    var beat = cur.beat;
    var locked = view.feedback && view.feedback.passed;

    var answer = view.selected.length
      ? view.selected.map(function (chipIdx, pos) {
          return '<button class="chip on" data-action="unpick-chip" data-pos="' + pos + '">' + esc(beat.chips[chipIdx]) + '</button>';
        }).join('')
      : '<span class="placeholder">再拼一次这句话…</span>';
    var bank = beat.chips.map(function (chip, i) {
      var used = view.selected.indexOf(i) > -1;
      return '<button class="chip' + (used ? ' used' : '') + '" data-action="pick-chip" data-i="' + i + '">' + esc(chip) + '</button>';
    }).join('');

    stage.innerHTML = '' +
      '<div class="screen">' +
        '<div class="play-head">' +
          '<button class="back-btn" data-action="go-book" aria-label="返回句子本">←</button>' +
          '<div class="play-title">复习 · ' + (rev.index + 1) + ' / ' + rev.list.length + '</div>' +
          '<span class="pill" style="margin-left:auto">答对移出</span>' +
        '</div>' +
        '<div class="progress"><i style="width:' + Math.round((rev.index / rev.list.length) * 100) + '%"></i></div>' +
        '<div class="act-pill">来自 · ' + esc(cur.scene.cn) + '</div>' +
        '<div class="npc">' +
          '<div class="avatar">' + beat.avatar + '</div>' +
          '<div class="bubble">' +
            '<div class="name">' + esc(beat.speaker) + '</div>' +
            '<div class="line">' + esc(beat.line) + '</div>' +
            (view.showCn ? '<div class="cn">' + esc(beat.lineCn) + '</div>' : '') +
            '<button class="speak-btn" data-action="speak" data-text="' + esc(beat.line) + '">🔊 听一遍</button>' +
          '</div>' +
        '</div>' +
        '<p class="situation">' + esc(beat.situation) + '</p>' +
        '<div class="mission">' +
          '<div class="label">再说一遍</div>' +
          '<div class="text">' + esc(beat.intent) + '</div>' +
        '</div>' +
        '<div class="answer-zone' + (view.selected.length ? ' filled' : '') + '">' + answer + '</div>' +
        '<div class="bank' + (locked ? ' frozen' : '') + '">' + bank + '</div>' +
        speechArea(locked) +
        '<div class="play-actions">' +
          '<button class="btn btn-ghost" data-action="clear"' + (locked ? ' disabled' : '') + '>清空</button>' +
          '<button class="btn btn-primary" data-action="submit"' + (locked ? ' disabled' : '') + '>交卷</button>' +
        '</div>' +
        (view.feedback ? feedbackHtml(beat, view.feedback) : '') +
        (view.speechGuide ? speechGuideHtml() : '') +
      '</div>';
    updateChrome();
  }

  function renderReviewDone() {
    var rev = view.review || { list: [], correct: 0 };
    var left = E.reviewPending(state, todayKey()).length;
    stage.innerHTML = '' +
      '<div class="screen review-done">' +
        '<div class="intro-emoji">✅</div>' +
        '<h1 class="h1">复习完成</h1>' +
        '<p class="sub" style="margin:10px 0 20px">' + (rev.correct || 0) + ' 句过关，已经从队列里移出。' +
          (left ? '还有 ' + left + ' 句在排队，明天再来。' : '队列清空了。') + '</p>' +
        '<button class="btn btn-primary" data-action="go-home">回首页</button>' +
        '<button class="btn btn-ghost" style="margin-top:10px" data-action="go-book">看待复习的句子</button>' +
      '</div>';
    updateChrome();
  }

  function nextReview() {
    if (!view.review) return renderBook();
    resetSpeech();
    view.feedback = null;
    view.selected = [];
    view.fails = 0;
    view.review.index += 1;
    if (view.review.index >= view.review.list.length) view.screen = 'reviewDone';
    render();
    window.scrollTo(0, 0);
  }

  /* ---------------- 数据页 / 家长周报 ---------------- */

  function analyticsFallback() {
    stage.innerHTML = '<div class="screen">' +
      '<div class="play-head"><button class="back-btn" data-action="go-home" aria-label="返回">←</button>' +
      '<div class="play-title">本机数据</div></div>' +
      '<p class="sub">分析模块未加载，暂时看不到统计。</p>' +
      '<button class="btn btn-primary" data-action="go-home">回首页</button></div>';
    updateChrome();
  }

  function renderStats() {
    if (!AN || !analytics) return analyticsFallback();
    var s = AN.stats(analytics, { today: todayKey(), pending: dueReviewCount() });

    var funnel = s.funnel.map(function (f) {
      var width = Math.max(0, Math.min(100, f.rate));
      return '<div class="funnel-row" data-step="' + f.key + '">' +
        '<span class="funnel-name">' + esc(f.label) + '</span>' +
        '<span class="funnel-count" data-count="' + f.count + '">' + f.count + '</span>' +
        '<span class="funnel-bar"><i style="width:' + width + '%"></i></span>' +
        '<span class="funnel-rate">' + f.rate + '%</span>' +
      '</div>';
    }).join('');

    var bars = s.daily.map(function (d) {
      var hgt = d.learning ? Math.min(100, 14 + d.learning * 10) : 4;
      var tip = d.day + ' · ' + d.learning + ' 幕' + (d.opens ? ' · 打开 ' + d.opens + ' 次' : '');
      return '<span class="day-bar' + (d.active ? ' on' : '') + '" title="' + esc(tip) + '">' +
        '<i style="height:' + hgt + '%"></i></span>';
    }).join('');

    stage.innerHTML = '' +
      '<div class="screen stats-screen">' +
        '<div class="play-head">' +
          '<button class="back-btn" data-action="go-home" aria-label="返回首页">←</button>' +
          '<div class="play-title">本机数据</div>' +
          '<span class="pill" style="margin-left:auto">仅自己可见</span>' +
        '</div>' +
        '<p class="privacy-line">所有数据只存在这台设备，不上传、不接入任何第三方统计。</p>' +

        '<section class="panel">' +
          '<div class="panel-head"><h2 class="panel-title">漏斗</h2><span class="panel-note">占打开的比例</span></div>' +
          '<div class="funnel">' + funnel + '</div>' +
        '</section>' +

        '<section class="panel">' +
          '<div class="panel-head"><h2 class="panel-title">行为计数</h2><span class="panel-note">本机累计</span></div>' +
          '<div class="counter-row">' +
            '<div><b data-counter="beats">' + s.counters.beats + '</b><span>完成幕数</span></div>' +
            '<div><b data-counter="speech">' + s.counters.speech + '</b><span>开口说</span></div>' +
            '<div><b data-counter="reviews">' + s.counters.reviews + '</b><span>复习完成</span></div>' +
          '</div>' +
        '</section>' +

        '<section class="panel">' +
          '<div class="panel-head"><h2 class="panel-title">每日活跃</h2><span class="panel-note">最近 14 天</span></div>' +
          '<div class="day-bars" aria-hidden="true">' + bars + '</div>' +
          '<p class="sub" style="font-size:12px;margin:8px 0 0">最近 14 天打开 ' + s.activeDays + ' 天，共 ' + s.total + ' 条本机事件。</p>' +
        '</section>' +

        '<div class="stats-grid">' +
          '<div class="stat"><b>' + s.avgBeats + '</b><span>平均每集完成幕数</span></div>' +
          '<div class="stat"><b>' + Math.round(s.speech.ratio * 100) + '%</b><span>开口说比例</span></div>' +
          '<div class="stat"><b>' + Math.round(s.share.ratio * 100) + '%</b><span>分享卡保存率</span></div>' +
          '<div class="stat"><b>' + s.total + '</b><span>本机记录 / 上限 ' + s.max + '</span></div>' +
        '</div>' +

        '<button class="btn btn-primary" data-action="go-report">打开家长周报 →</button>' +
        '<button class="btn btn-ghost" style="margin-top:10px" data-action="export-events">导出学习数据 JSON</button>' +
        '<p class="load-hint">' + (trialId
          ? '试用编号：' + esc(trialId) + ' · 导出文件名会带上它'
          : '未设置试用编号：组织者用 ?trial=编号 的链接打开一次即可') + '</p>' +
        '<p class="load-hint">隐藏入口：连点左上角 ALTER 标志 5 次，或直接打开 #stats。</p>' +
      '</div>';
    updateChrome();
  }

  function renderReport() {
    if (!AN || !analytics) return analyticsFallback();
    var r = AN.weekReport(analytics, { today: todayKey(), pending: dueReviewCount() });
    var m = r.metrics;
    var trendText;
    var trendCls;
    if (r.trend.dir === 'up' && r.previous.beats > 0) {
      trendText = '比上周多完成 ' + r.trend.delta + ' 幕';
      trendCls = 'up';
    } else if (r.trend.dir === 'up') {
      trendText = '这是第一周记录';
      trendCls = 'flat';
    } else if (r.trend.dir === 'down') {
      trendText = '比上周少完成 ' + Math.abs(r.trend.delta) + ' 幕';
      trendCls = 'down';
    } else {
      trendText = r.previous.beats ? '与上周持平' : '这是第一周记录';
      trendCls = 'flat';
    }

    stage.innerHTML = '' +
      '<div class="screen report-screen">' +
        '<div class="report-sheet">' +
          '<div class="report-top">' +
            '<div><div class="report-brand">ALTER · 学习周报</div>' +
              '<div class="report-range">' + esc(r.range.from) + ' 至 ' + esc(r.range.to) + '</div></div>' +
            '<span class="report-stamp">仅存本机</span>' +
          '</div>' +
          '<h1 class="report-title">这周，孩子的英语开口记录</h1>' +
          '<p class="report-sub">只含统计，不含任何对话原文；数据未上传。</p>' +
          '<div class="report-grid">' +
            '<div><b data-metric="studyDays">' + m.studyDays + '</b><span>学习天数 / 7</span></div>' +
            '<div><b data-metric="scenes">' + m.scenes + '</b><span>完成集数</span></div>' +
            '<div><b data-metric="native">' + m.native + '</b><span>地道句</span></div>' +
            '<div><b data-metric="speech">' + m.speech + '</b><span>开口次数</span></div>' +
            '<div><b data-metric="reviews">' + m.reviews + '</b><span>复习完成句数</span></div>' +
          '</div>' +
          '<div class="report-trend ' + trendCls + '">本周完成 <b data-metric="beats">' + m.beats + '</b> 幕 · ' + trendText + '</div>' +
          '<div class="report-advice">' +
            '<div class="label">给家长的一句话</div>' +
            '<p>' + esc(r.advice) + '</p>' +
          '</div>' +
          '<div class="report-foot">本页可打印或存为 PDF。ALTER 不上传任何学习数据，也不展示孩子的对话内容。</div>' +
        '</div>' +
        '<div class="report-actions">' +
          '<button class="btn btn-primary" data-action="print-report">打印 / 保存 PDF</button>' +
          '<button class="btn btn-ghost" data-action="go-stats">查看数据页</button>' +
          '<button class="btn btn-ghost" data-action="go-home">回首页</button>' +
        '</div>' +
      '</div>';
    updateChrome();
  }

  /* ---------------- 人设 ---------------- */

  function renderPersona(gate) {
    var html = '<div class="screen gate-screen">' +
      '<div class="eyebrow" style="margin-top:14px">英语剧情练习 · 每天 3 分钟</div>' +
      '<h1 class="h1" style="margin-top:8px">在英语里，<br>你想成为谁？</h1>' +
      '<p class="sub" style="margin-top:10px">演一集：用词块拼出台词，再开口说出来。同一句话，温柔、犀利或好笑都行——先选一个你想成为的人。</p>' +
      '<div class="demo-line" aria-label="示例对话：Is this seat taken？回答 No, it is all yours，判定地道，加 10 点经验">' +
        '<div class="demo-row"><span class="demo-tag">对方</span><span class="demo-q">Is this seat taken?</span></div>' +
        '<div class="demo-row you"><span class="demo-tag">你</span><span class="demo-a">No, it’s all yours.</span>' +
          '<span class="demo-grade">地道 +10</span></div>' +
      '</div>' +
      '<div class="persona-list">';

    PERSONAS.forEach(function (p) {
      html += '<button class="persona-card' + (state.persona === p.id ? ' on' : '') + '" data-action="set-persona" data-id="' + p.id + '">' +
        '<span class="persona-emoji">' + p.emoji + '</span>' +
        '<span><b>' + p.name + '</b><span class="en">' + p.en + '</span><p>' + p.tagline + '</p></span>' +
      '</button>';
    });

    html += '</div>';
    if (!gate) {
      html += '<div class="row" style="margin-top:18px"><button class="btn btn-ghost" data-action="go-home">返回</button></div>' +
        '<div style="margin-top:28px;text-align:center">' +
          '<button class="link-btn" data-action="go-report">家长周报 · 学习数据</button>' +
          '<div style="height:10px"></div>' +
          '<button class="link-btn" data-action="reset">清除本机所有进度与学习数据</button>' +
        '</div>';
    } else {
      html += '<p class="sub" style="margin-top:16px;font-size:12px;text-align:center">选好后直接进入今天的 3 分钟。人设之后随时能换。</p>';
    }
    html += '</div>';

    stage.innerHTML = html;
    updateChrome();
  }

  /* ---------------- 路由 ---------------- */

  function render() {
    var firstRun = !state.persona;
    document.body.classList.toggle('first-run', firstRun);
    if (firstRun && view.screen !== 'stats' && view.screen !== 'report') { renderPersona(true); return; }
    switch (view.screen) {
      case 'home': renderHome(); break;
      case 'intro': renderIntro(); break;
      case 'play': renderPlay(); break;
      case 'choice': renderChoice(); break;
      case 'result': renderResult(); break;
      case 'book': renderBook(); break;
      case 'review': renderReview(); break;
      case 'reviewDone': renderReviewDone(); break;
      case 'persona': renderPersona(false); break;
      case 'stats': renderStats(); break;
      case 'report': renderReport(); break;
      default: renderHome();
    }
  }

  function openStats() {
    view.screen = 'stats';
    view.feedback = null;
    render();
    window.scrollTo(0, 0);
  }

  function openReport() {
    view.screen = 'report';
    view.feedback = null;
    render();
    window.scrollTo(0, 0);
  }

  function goHome() {
    resetSpeech();
    if (window.location.hash) {
      try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) { /* 忽略 */ }
    }
    view.screen = 'home';
    view.sceneId = null;
    view.feedback = null;
    view.selected = [];
    view.review = null;
    render();
    window.scrollTo(0, 0);
  }

  function openScene(id) {
    var scene = byId(id);
    if (!scene) return;
    var idx = sceneIndexOf(id);
    if (!E.sceneUnlocked(state, SCENES, idx)) {
      toast('先完成上一集，才会解锁');
      return;
    }
    resetSpeech();
    view.sceneId = id;
    if (firstUnpassedIndex(scene) < 0) {
      view.index = beatsOf(scene).length - 1;
      view.screen = state.choices[scene.id] ? 'result' : 'choice';
    } else {
      view.screen = 'intro';
    }
    view.feedback = null;
    view.selected = [];
    view.fails = 0;
    render();
    window.scrollTo(0, 0);
  }

  function nextBeat() {
    var scene = byId(view.sceneId);
    var list = beatsOf(scene);
    resetSpeech();
    view.feedback = null;
    view.selected = [];
    view.fails = 0;
    if (view.index + 1 < list.length) {
      view.index += 1;
      render();
      window.scrollTo(0, 0);
    } else {
      view.screen = 'choice';
      render();
      window.scrollTo(0, 0);
    }
  }

  function submitAnswer() {
    if (view.feedback && view.feedback.passed) return;
    if (!view.selected.length) { toast('先点词块拼一句话'); return; }
    resetSpeech();
    var beat = currentBeat();
    if (!beat) return;
    var picked = view.selected.map(function (i) { return beat.chips[i]; });
    var result = E.evaluate(picked, beat);

    if (view.screen === 'review') {
      if (result.passed) {
        state = E.gradeReview(state, beat.id, result, todayKey());
        state = E.updateStreak(state, todayKey());
        if (view.review) view.review.correct = (view.review.correct || 0) + 1;
        view.fails = 0;
        var revCur = view.review && view.review.list[view.review.index];
        track('review_clear', {
          beatId: beat.id,
          sceneId: revCur ? revCur.scene.id : '',
          grade: result.grade
        });
      } else {
        view.fails += 1;
      }
      persist();
      view.feedback = result;
      rerender();
      setTimeout(function () {
        var f = document.querySelector('.feedback');
        if (f && f.scrollIntoView) f.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
      return;
    }

    var scene = byId(view.sceneId);
    var out = E.applyAnswer(state, beat, result, {
      day: todayKey(),
      sceneId: scene ? scene.id : '',
      season: scene ? seasonOf(scene) : 1
    });
    state = out.state;
    if (result.passed) {
      state = E.updateStreak(state, todayKey());
      view.fails = 0;
      track('beat_complete', {
        sceneId: scene ? scene.id : '',
        season: scene ? seasonOf(scene) : 1,
        beatId: beat.id,
        grade: result.grade,
        firstPass: out.firstPass
      });
    } else {
      view.fails += 1;
    }
    persist();
    view.feedback = result;
    rerender();
    setTimeout(function () {
      var f = document.querySelector('.feedback');
      if (f && f.scrollIntoView) f.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  function fillAnswer() {
    var beat = currentBeat();
    if (!beat) return;
    var need = E.wordsOf(E.bestSolution(beat).text);
    var used = [];
    var picked = [];
    need.forEach(function (w) {
      for (var i = 0; i < beat.chips.length; i++) {
        if (used.indexOf(i) > -1) continue;
        if (E.wordsOf(beat.chips[i]).join(' ') === w) {
          used.push(i);
          picked.push(i);
          break;
        }
      }
    });
    view.selected = picked;
    view.feedback = null;
    rerender();
  }

  /* ---------------- 事件 ---------------- */

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');

    switch (action) {
      case 'go-home':
        if (el.classList && el.classList.contains('brand')) {
          var tapNow = Date.now();
          if (!brandTapStart || tapNow - brandTapStart > 3000) {
            brandTapStart = tapNow;
            brandTaps = 1;
          } else {
            brandTaps += 1;
          }
          if (brandTaps >= 5) {
            brandTaps = 0;
            brandTapStart = 0;
            openStats();
            break;
          }
        }
        goHome();
        break;

      case 'go-stats':
        openStats();
        break;

      case 'go-report':
        openReport();
        break;

      case 'print-report':
        try { window.print(); } catch (e) { toast('这个浏览器不支持打印'); }
        break;

      case 'export-events': {
        if (!AN || !analytics) { toast('暂时没有可导出的数据'); break; }
        try {
          var blob = new Blob([AN.exportJson(analytics, { trialId: trialId })], { type: 'application/json' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'alter-' + (trialId || 'local') + '-' + todayKey() + '.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
          toast('已导出学习数据');
        } catch (e) {
          toast('导出失败，可换个浏览器试试');
        }
        break;
      }

      case 'go-book':
        view.screen = 'book';
        render();
        window.scrollTo(0, 0);
        break;

      case 'start-review':
        startReview();
        break;

      case 'next-review':
        nextReview();
        break;

      case 'go-persona':
        view.screen = 'persona';
        render();
        window.scrollTo(0, 0);
        break;

      case 'set-persona': {
        var personaId = el.getAttribute('data-id');
        var firstPick = !state.persona;
        if (firstPick) track('persona_pick', { persona: personaId });
        state = E.setPersona(state, personaId);
        persist();
        if (firstPick) {
          var firstPlan = E.dailyEpisode(state, SCENES, todayKey());
          if (firstPlan && firstPlan.status !== 'complete' && firstPlan.scene) {
            toast('人设已就位');
            openScene(firstPlan.scene.id);
            break;
          }
        }
        toast('已切换人设');
        view.screen = 'home';
        render();
        window.scrollTo(0, 0);
        break;
      }

      case 'open-scene':
        openScene(el.getAttribute('data-id'));
        break;

      case 'start-scene': {
        resetSpeech();
        var startScene = byId(view.sceneId);
        track('scene_start', {
          sceneId: view.sceneId,
          season: startScene ? seasonOf(startScene) : 1
        });
        view.screen = 'play';
        view.feedback = null;
        view.selected = [];
        render();
        window.scrollTo(0, 0);
        break;
      }

      case 'pick-chip': {
        if (view.feedback && view.feedback.passed) return;
        var i = Number(el.getAttribute('data-i'));
        if (view.selected.indexOf(i) > -1) return;
        resetSpeech();
        view.selected.push(i);
        rerender();
        break;
      }

      case 'unpick-chip': {
        if (view.feedback && view.feedback.passed) return;
        var pos = Number(el.getAttribute('data-pos'));
        resetSpeech();
        view.selected.splice(pos, 1);
        rerender();
        break;
      }

      case 'clear':
        resetSpeech();
        view.selected = [];
        rerender();
        break;

      case 'submit':
        submitAnswer();
        break;

      case 'retry':
        resetSpeech();
        view.feedback = null;
        view.selected = [];
        rerender();
        break;

      case 'fill-answer':
        resetSpeech();
        fillAnswer();
        break;

      case 'next-beat':
        nextBeat();
        break;

      case 'pick-option': {
        var scene = byId(view.sceneId);
        var optId = el.getAttribute('data-opt');
        var opt = null;
        scene.choice.options.forEach(function (o) { if (o.id === optId) opt = o; });
        state = E.completeScene(state, scene.id, optId, todayKey());
        if (opt) state = E.recordOutcome(state, scene.id, opt.outcome);
        track('scene_complete', { sceneId: scene.id, season: seasonOf(scene), choice: optId });
        persist();
        view.screen = 'result';
        render();
        window.scrollTo(0, 0);
        break;
      }

      case 'speak':
        speak(el.getAttribute('data-text'));
        break;

      case 'start-speech':
        startSpeech();
        break;

      case 'speech-allow':
        writeFlag(SPEECH_INTRO_KEY, true);
        beginListening();
        break;

      case 'close-speech-guide':
        closeSpeechGuide();
        break;

      case 'cancel-speech':
        cancelSpeech();
        break;

      case 'speech-submit':
        resetSpeech();
        submitAnswer();
        break;

      case 'speech-off':
        resetSpeech();
        view.speechOff = true;
        writeFlag(SPEECH_OFF_KEY, true);
        rerender();
        break;

      case 'speech-on':
        view.speechOff = false;
        writeFlag(SPEECH_OFF_KEY, false);
        rerender();
        break;

      case 'sheet-keep':
        break;

      case 'save-phrase': {
        var sc = byId(view.sceneId);
        var sol = view.feedback && view.feedback.solution;
        if (!sol) return;
        var res = E.toggleSaved(state, {
          text: sol.text,
          note: sol.note,
          sceneId: sc.id,
          sceneTitle: sc.cn,
          day: E.dayKey(new Date())
        });
        state = res.state;
        persist();
        toast(res.saved ? '已收进句子本' : '已从句子本移除');
        break;
      }

      case 'save-last': {
        var scene2 = byId(view.sceneId);
        if (!view.lastItem) return;
        var sol2 = E.bestSolution(view.lastItem.beat);
        var res2 = E.toggleSaved(state, {
          text: sol2.text,
          note: sol2.note,
          sceneId: scene2.id,
          sceneTitle: scene2.cn,
          day: E.dayKey(new Date())
        });
        state = res2.state;
        persist();
        toast(res2.saved ? '已收进句子本' : '已从句子本移除');
        break;
      }

      case 'del-phrase': {
        var idx = Number(el.getAttribute('data-i'));
        var item = state.saved[idx];
        if (!item) return;
        var r = E.toggleSaved(state, { text: item.text });
        state = r.state;
        persist();
        renderBook();
        break;
      }

      case 'download-card': {
        var canvas = document.querySelector('#card-holder canvas');
        if (!canvas) return;
        try {
          var link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = 'ALTER-' + view.sceneId + '.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          track('card_saved', { sceneId: view.sceneId });
          toast('已保存名场面卡');
        } catch (e) {
          toast('这个浏览器不允许下载，试试长按保存');
        }
        break;
      }

      case 'reset': {
        if (!window.confirm('清除本机所有进度与学习数据？句子本和分析记录也会一起清空。')) return;
        state = E.createState();
        persist();
        if (AN) {
          analytics = AN.createLog();
          saveAnalytics();
        }
        view.screen = 'persona';
        render();
        break;
      }

      default:
        break;
    }
  });

  /* ---------------- 启动 ---------------- */

  function loadAllSeasons() {
    if (!C.loadSeason) return Promise.resolve();
    return Promise.all([C.loadSeason(2), C.loadSeason(3)]).catch(function () {
      return null;
    });
  }

  function trackOpen() {
    if (!AN || !analytics) return;
    var today = todayKey();
    var last = null;
    analytics.events.forEach(function (e) {
      if (e.name === 'app_open' && (!last || e.day > last)) last = e.day;
    });
    if (last && last < today) track('day2_return', { lastDay: last });
    track('app_open');
  }

  function applyHash() {
    var hash = String(window.location.hash || '').replace('#', '');
    if (hash === 'stats') view.screen = 'stats';
    else if (hash === 'report') view.screen = 'report';
  }

  window.addEventListener('hashchange', function () {
    var hash = String(window.location.hash || '').replace('#', '');
    if (hash === 'stats') openStats();
    else if (hash === 'report') openReport();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    if (view.speechGuide) { closeSpeechGuide(); return; }
    if (view.speechState === 'listening') cancelSpeech();
  });

  applyHash();
  trackOpen();
  render();

  // 首屏先画第 1 季；首屏稳定后再补第 2/3 季，弱网/省流量时干脆不预取。
  function prefetchSeasons() {
    loadAllSeasons().then(function () {
      if (view.screen === 'home' || view.screen === 'book') rerender();
    });
  }

  function shouldPrefetch() {
    var c = navigator.connection;
    if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return false;
    return true;
  }

  setTimeout(function () {
    if (!shouldPrefetch()) return;
    if (window.requestIdleCallback) window.requestIdleCallback(prefetchSeasons, { timeout: 2000 });
    else prefetchSeasons();
  }, 2600);

  if ('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* 离线能力非必需 */ });
    });
  }
})();
