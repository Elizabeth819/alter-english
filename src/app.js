/* ALTER · 另一个我 —— 界面层
 * 依赖：window.ALTER_CONTENT（内容）、window.ALTER_ENGINE（纯逻辑）
 * 无框架、无构建、无网络请求；双击 index.html 即可运行。
 */
(function () {
  'use strict';

  var E = window.ALTER_ENGINE;
  var C = window.ALTER_CONTENT;
  var stage = document.getElementById('stage');
  if (!E || !C || !stage) {
    if (stage) stage.innerHTML = '<div class="empty">加载失败：请确认 src/ 目录完整。</div>';
    return;
  }

  var SCENES = C.SCENES;
  var PERSONAS = C.PERSONAS;
  var TAB_META = { home: '剧情', book: '句子本', persona: '人设' };

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
      btn.classList.toggle('on', target === view.screen || (view.screen === 'intro' || view.screen === 'play' || view.screen === 'choice' || view.screen === 'result') && target === 'home');
    });
  }

  /* ---------------- 首页 ---------------- */

  function renderHome() {
    var t = E.totalStats(state, SCENES);
    var up = E.nextUp(state, SCENES);
    var html = '';

    if (up) {
      var s = up.scene;
      var total = beatsOf(s).length;
      html += '' +
        '<section class="hero">' +
          '<div class="hero-emoji">' + s.emoji + '</div>' +
          '<div class="eyebrow">今日剧情 · 第 ' + (up.sceneIndex + 1) + ' 集</div>' +
          '<div class="hero-title">' + esc(s.cn) + '</div>' +
          '<div class="hero-cn">' + esc(s.title) + ' · ' + s.level + ' · ' + s.minutes + ' 分钟</div>' +
          '<div class="hero-hook">' + esc(s.hook) + '</div>' +
          '<div class="hero-cta">' +
            '<div class="meta">' + esc(up.act.title) + '<br>第 ' + (up.beatIndex + 1) + ' / ' + total + ' 幕</div>' +
            '<button class="btn btn-primary btn-sm" data-action="open-scene" data-id="' + s.id + '">' +
              (up.beatIndex > 0 ? '继续 →' : '开始 3 分钟 →') + '</button>' +
          '</div>' +
        '</section>';
    } else {
      html += '' +
        '<section class="hero">' +
          '<div class="hero-emoji">🏁</div>' +
          '<div class="eyebrow">第一季 · 完结</div>' +
          '<div class="hero-title">你走完了 5 集</div>' +
          '<div class="hero-cn">' + t.passed + ' 幕全部通过，' + t.native + ' 句达到地道水平</div>' +
          '<div class="hero-hook">第二季正在写：打工第一天、追星评论区、和爸妈的第一场谈判。</div>' +
          '<div class="hero-cta"><div class="meta">去句子本复习你说过的句子</div>' +
            '<button class="btn btn-primary btn-sm" data-action="go-book">打开句子本 →</button></div>' +
        '</section>';
    }

    html += '' +
      '<div class="stats-grid">' +
        '<div class="stat"><b>' + t.xp + '</b><span>XP</span></div>' +
        '<div class="stat"><b>' + state.streak + '</b><span>连击天数</span></div>' +
        '<div class="stat"><b>' + t.native + '</b><span>地道句</span></div>' +
        '<div class="stat"><b>' + t.percent + '%</b><span>总进度</span></div>' +
      '</div>' +
      '<div class="section-head"><h2 class="h2">剧集</h2><span class="sub">' + t.passed + ' / ' + t.total + ' 幕</span></div>' +
      '<div class="scene-list">';

    SCENES.forEach(function (scene, i) {
      var st = E.sceneStatus(state, SCENES, i);
      var stats = E.sceneStats(state, scene);
      var badge = '';
      var cls = '';
      var action = 'open-scene';
      if (st === 'locked') { badge = '🔒 未解锁'; cls = 'locked'; }
      else if (st === 'active') { badge = stats.passed + '/' + stats.total + ' 幕'; cls = 'active'; }
      else if (st === 'choice') { badge = '等你选择'; cls = 'active'; }
      else { badge = '✓ 已完成'; cls = 'done'; }
      html += '' +
        '<button class="scene-card ' + cls + '" data-action="' + action + '" data-id="' + scene.id + '">' +
          '<span class="scene-thumb">' + (st === 'locked' ? '🔒' : scene.emoji) + '</span>' +
          '<span class="scene-info"><b>第 ' + (i + 1) + ' 集 · ' + esc(scene.cn) + '</b>' +
            '<span>' + esc(scene.title) + '</span></span>' +
          '<span class="scene-badge ' + (st === 'done' || st === 'choice' ? 'ok' : st === 'active' ? 'on' : '') + '">' + badge + '</span>' +
        '</button>';
    });

    html += '</div>';

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

    stage.innerHTML = '' +
      '<div class="screen intro-wrap">' +
        '<div class="play-head">' +
          '<button class="back-btn" data-action="go-home" aria-label="返回">←</button>' +
          '<div class="play-title">第 ' + (sceneIndexOf(scene.id) + 1) + ' 集 / ' + SCENES.length + '</div>' +
        '</div>' +
        '<div class="intro-emoji">' + scene.emoji + '</div>' +
        '<h1 class="intro-title">' + esc(scene.cn) + '</h1>' +
        '<div class="intro-cn">' + esc(scene.title) + '</div>' +
        '<div class="intro-hook">' + esc(scene.hook) + '</div>' +
        '<div class="cast">' + cast + '</div>' +
        '<div class="intro-meta"><span>' + scene.level + '</span><span>' + scene.minutes + ' 分钟</span><span>' + list.length + ' 幕</span></div>' +
        '<button class="btn btn-primary" data-action="start-scene">' +
          (isResume ? '继续演 · 第 ' + (idx + 1) + ' 幕' : '开始这一集') +
        '</button>' +
        '<p class="sub" style="margin-top:14px;text-align:center;font-size:12px">用词块拼出你要说的话。说对了，剧情才会往下走。</p>' +
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
      actions = '<button class="btn btn-primary btn-sm" data-action="next-beat">继续</button>' +
        '<button class="btn btn-ghost btn-sm" data-action="save-phrase">收藏这句</button>';
    } else {
      actions = '<button class="btn btn-ghost btn-sm" data-action="retry">再试一次</button>' +
        (view.fails >= 3 ? '<button class="btn btn-ghost btn-sm" data-action="fill-answer">照着拼</button>' : '');
    }

    return '<div class="feedback ' + m[1] + '" role="status">' +
      '<div class="grade-row"><span class="grade-badge ' + r.grade + '">' + m[0] + '</span>' +
      '<span class="grade-score">' + r.score + ' / 100' + (r.passed ? ' · +' + r.xp + ' XP' : '') + '</span></div>' +
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
          '<div class="play-title">第 ' + (sceneIndexOf(scene.id) + 1) + ' 集 · ' + esc(scene.cn) + '</div>' +
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

        '<div class="play-actions">' +
          '<button class="btn btn-ghost" data-action="clear"' + (locked ? ' disabled' : '') + '>清空</button>' +
          '<button class="btn btn-primary" data-action="submit"' + (locked ? ' disabled' : '') + '>说出口</button>' +
        '</div>' +

        (view.feedback ? feedbackHtml(beat, view.feedback) : '') +
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
          '<div class="eyebrow">第 ' + (sceneIndexOf(scene.id) + 1) + ' 集 · 你的选择</div>' +
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
      nextBtn = '<button class="btn btn-primary" data-action="open-scene" data-id="' + nextScene.id + '">下一集 · ' + esc(nextScene.cn) + ' →</button>';
    } else {
      nextBtn = '<button class="btn btn-primary" data-action="go-home">回到首页 · 第一季完</button>';
    }

    stage.innerHTML = '' +
      '<div class="screen">' +
        '<div class="result-hero">' +
          '<div class="eyebrow">第 ' + (idx + 1) + ' 集 · 本集完</div>' +
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
        nextBtn +
        (nextScene ? '<div class="teaser">下一集：' + esc(nextScene.hook) + '</div>' : '') +
      '</div>';

    var holder = document.getElementById('card-holder');
    if (holder) {
      var canvas = buildCard(scene, lastItem, outcome);
      holder.appendChild(canvas);
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
    var boxY = 520;
    var boxH = 470;
    ctx.fillStyle = 'rgba(255,255,255,0.055)';
    roundRect(ctx, 60, boxY, W - 120, boxH, 34);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = p.color;
    ctx.font = '800 26px ' + font;
    ctx.fillText('你说 / YOU SAID', 104, boxY + 66);

    var quote = lastItem ? E.bestSolution(lastItem.beat).text : '';
    ctx.fillStyle = '#f7f7fb';
    ctx.font = '700 62px ' + font;
    var quoteLines = wrapLines(ctx, quote, W - 220, 4);
    quoteLines.forEach(function (line, i) {
      ctx.fillText(line, 104, boxY + 168 + i * 82);
    });

    // 对方台词
    if (lastItem) {
      ctx.fillStyle = 'rgba(255,255,255,0.42)';
      ctx.font = '500 27px ' + font;
      var npcLine = lastItem.beat.speaker + ': "' + lastItem.beat.line + '"';
      var npcLines = wrapLines(ctx, npcLine, W - 220, 1);
      ctx.fillText(npcLines[0], 104, boxY + boxH - 54);
    }

    // 底部人设
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    roundRect(ctx, 60, 1080, W - 120, 150, 30);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '500 56px ' + font;
    ctx.fillText(p.emoji, 96, 1170);

    ctx.font = '800 30px ' + font;
    ctx.fillText(p.name + ' · ' + p.en, 184, 1145);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '500 23px ' + font;
    ctx.fillText('在 ALTER 里，这是我说过的一句话。', 184, 1188);

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '500 22px ' + font;
    ctx.fillText('ALTER · 另一个我', 84, 1296);
    var d = new Date();
    ctx.textAlign = 'right';
    ctx.fillText(E.dayKey(d), W - 84, 1296);
    ctx.textAlign = 'left';

    return canvas;
  }

  /* ---------------- 句子本 ---------------- */

  function renderBook() {
    var items = state.saved;
    var html = '<div class="screen">' +
      '<div class="section-head" style="margin-top:10px">' +
        '<h1 class="h1">句子本</h1><span class="sub">' + items.length + ' 句</span>' +
      '</div>' +
      '<p class="sub" style="margin:0 0 16px">这里只收你真的说出口的句子。忘了就听一遍。</p>';

    if (!items.length) {
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

  /* ---------------- 人设 ---------------- */

  function renderPersona(gate) {
    var html = '<div class="screen">' +
      '<div class="eyebrow" style="margin-top:14px">你的英语分身</div>' +
      '<h1 class="h1" style="margin-top:8px">在英语里，<br>你想成为谁？</h1>' +
      '<p class="sub" style="margin-top:10px">同一句话，可以选择温柔、犀利或好笑。人设决定别人怎么看你说的话，也决定每一集结尾的那句旁白。</p>' +
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
        '<div style="margin-top:28px;text-align:center"><button class="sub" data-action="reset" style="font-size:12px;text-decoration:underline">清除本机所有进度</button></div>';
    } else {
      html += '<p class="sub" style="margin-top:16px;font-size:12px;text-align:center">随时可以在「人设」里换。</p>';
    }
    html += '</div>';

    stage.innerHTML = html;
    updateChrome();
  }

  /* ---------------- 路由 ---------------- */

  function render() {
    if (!state.persona) { renderPersona(true); return; }
    switch (view.screen) {
      case 'home': renderHome(); break;
      case 'intro': renderIntro(); break;
      case 'play': renderPlay(); break;
      case 'choice': renderChoice(); break;
      case 'result': renderResult(); break;
      case 'book': renderBook(); break;
      case 'persona': renderPersona(false); break;
      default: renderHome();
    }
  }

  function goHome() {
    view.screen = 'home';
    view.sceneId = null;
    view.feedback = null;
    view.selected = [];
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
    var scene = byId(view.sceneId);
    var beat = beatsOf(scene)[view.index].beat;
    var picked = view.selected.map(function (i) { return beat.chips[i]; });
    var result = E.evaluate(picked, beat);
    var out = E.applyAnswer(state, beat, result);
    state = out.state;
    if (result.passed) {
      state = E.updateStreak(state, E.dayKey(new Date()));
      view.fails = 0;
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
    var scene = byId(view.sceneId);
    var beat = beatsOf(scene)[view.index].beat;
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
        goHome();
        break;

      case 'go-book':
        view.screen = 'book';
        render();
        window.scrollTo(0, 0);
        break;

      case 'go-persona':
        view.screen = 'persona';
        render();
        window.scrollTo(0, 0);
        break;

      case 'set-persona':
        state = E.setPersona(state, el.getAttribute('data-id'));
        persist();
        toast('已切换人设');
        view.screen = 'home';
        render();
        window.scrollTo(0, 0);
        break;

      case 'open-scene':
        openScene(el.getAttribute('data-id'));
        break;

      case 'start-scene':
        view.screen = 'play';
        view.feedback = null;
        view.selected = [];
        render();
        window.scrollTo(0, 0);
        break;

      case 'pick-chip': {
        if (view.feedback && view.feedback.passed) return;
        var i = Number(el.getAttribute('data-i'));
        if (view.selected.indexOf(i) > -1) return;
        view.selected.push(i);
        rerender();
        break;
      }

      case 'unpick-chip': {
        if (view.feedback && view.feedback.passed) return;
        var pos = Number(el.getAttribute('data-pos'));
        view.selected.splice(pos, 1);
        rerender();
        break;
      }

      case 'clear':
        view.selected = [];
        rerender();
        break;

      case 'submit':
        submitAnswer();
        break;

      case 'retry':
        view.feedback = null;
        view.selected = [];
        rerender();
        break;

      case 'fill-answer':
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
        state = E.completeScene(state, scene.id, optId);
        if (opt) state = E.recordOutcome(state, scene.id, opt.outcome);
        persist();
        view.screen = 'result';
        render();
        window.scrollTo(0, 0);
        break;
      }

      case 'speak':
        speak(el.getAttribute('data-text'));
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
          toast('已保存名场面卡');
        } catch (e) {
          toast('这个浏览器不允许下载，试试长按保存');
        }
        break;
      }

      case 'reset': {
        if (!window.confirm('清除本机所有进度？句子本也会一起清空。')) return;
        state = E.createState();
        persist();
        view.screen = 'persona';
        render();
        break;
      }

      default:
        break;
    }
  });

  /* ---------------- 启动 ---------------- */

  render();

  if ('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* 离线能力非必需 */ });
    });
  }
})();
