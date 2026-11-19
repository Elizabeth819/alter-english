/* ALTER 核心逻辑测试（Node + 浏览器共用）。
 * 运行：node tests/run.js  或  直接用浏览器打开 tests/test.html
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.registerAlterTests = factory;
})(typeof self !== 'undefined' ? self : this, function (h, E, C) {
  'use strict';

  var SCENES = C.SCENES;
  var PERSONAS = C.PERSONAS;
  var beat = function (id) {
    for (var i = 0; i < SCENES.length; i++) {
      var list = E.flattenBeats(SCENES[i]);
      for (var j = 0; j < list.length; j++) if (list[j].beat.id === id) return list[j].beat;
    }
    throw new Error('找不到回合 ' + id);
  };
  var words = function (text) { return E.wordsOf(text).join(' ').split(' '); };

  /* ---------------- 1. 文本归一化 ---------------- */
  h.test('归一化：大小写、标点、缩写', function () {
    h.deepEq(E.wordsOf("No, it's ALL yours!"), ['no', "it's", 'all', 'yours']);
  });

  h.test('归一化：弯引号统一为直引号', function () {
    h.deepEq(E.wordsOf('I’d rather not'), ["i'd", 'rather', 'not']);
  });

  h.test('归一化：纯标点返回空数组', function () {
    h.deepEq(E.wordsOf('?!... , '), []);
  });

  /* ---------------- 2. 评分器 ---------------- */
  h.test('评分：完全命中母语者说法 → native / 100 分 / 通过', function () {
    var b = beat('s1-a1-b1');
    var r = E.evaluate(['No', "it's", 'all', 'yours'], b);
    h.eq(r.grade, 'native');
    h.eq(r.score, 100);
    h.eq(r.passed, true);
    h.eq(r.xp, 10);
  });

  h.test('评分：命中可接受说法 → ok / 82 分 / 通过', function () {
    var b = beat('s1-a1-b1');
    var r = E.evaluate(['Go', 'ahead'], b);
    h.eq(r.grade, 'ok');
    h.eq(r.score, 82);
    h.eq(r.passed, true);
    h.eq(r.xp, 7);
  });

  h.test('评分：词都对但顺序错 → order / 不通过', function () {
    var b = beat('s1-a1-b1');
    var r = E.evaluate(['all', 'yours', 'no', "it's"], b);
    h.eq(r.grade, 'order');
    h.eq(r.passed, false);
    h.eq(r.orderOnly, true);
    h.eq(r.xp, 0);
  });

  h.test('评分：多词但缺关键词 → close / 不通过', function () {
    var b = beat('s1-a1-b1');
    var r = E.evaluate(['No', "it's", 'all', 'yours', 'sorry'], b);
    h.eq(r.grade, 'close');
    h.eq(r.passed, false);
    h.deepEq(r.extra, ['sorry']);
  });

  h.test('评分：完全不相干 → off / 0 分', function () {
    var b = beat('s1-a1-b1');
    var r = E.evaluate(['sorry', 'busy'], b);
    h.eq(r.grade, 'off');
    h.eq(r.score, 0);
    h.eq(r.passed, false);
  });

  h.test('评分：空作答 → off，并给出缺少的词', function () {
    var b = beat('s1-a1-b1');
    var r = E.evaluate([], b);
    h.eq(r.grade, 'off');
    h.ok(r.missing.length > 0, '应给出缺失词');
  });

  h.test('评分：多个参考答案时取最高分（不因先匹配到低分句而扣分）', function () {
    var b = beat('s1-a2-b2');
    var r = E.evaluate(words("That'd be great, thanks."), b);
    h.eq(r.grade, 'native');
    h.eq(r.score, 100);
  });

  h.test('评分：缺少 solutions 时抛错（防止坏数据静默通过）', function () {
    h.throws(function () { E.evaluate(['a'], { id: 'bad', solutions: [] }); });
  });

  /* ---------------- 3. 状态与进度 ---------------- */
  h.test('初始状态：等级、XP、人设为空', function () {
    var s = E.createState();
    h.eq(s.xp, 0);
    h.eq(s.persona, null);
    h.eq(s.streak, 0);
    h.deepEq(s.passed, {});
    h.eq(s.version, E.STATE_VERSION);
  });

  h.test('首次通过：加 XP 并记录成绩', function () {
    var b = beat('s1-a1-b1');
    var r = E.evaluate(['No', "it's", 'all', 'yours'], b);
    var out = E.applyAnswer(E.createState(), b, r);
    h.eq(out.firstPass, true);
    h.eq(out.state.xp, 10);
    h.eq(out.state.passed[b.id], 'native');
    h.eq(out.state.nativeCount, 1);
    h.eq(out.state.attempts[b.id], 1);
  });

  h.test('重复通过同一幕：不重复加 XP（防刷分）', function () {
    var b = beat('s1-a1-b1');
    var r = E.evaluate(['No', "it's", 'all', 'yours'], b);
    var s1 = E.applyAnswer(E.createState(), b, r).state;
    var s2 = E.applyAnswer(s1, b, r);
    h.eq(s2.firstPass, false);
    h.eq(s2.state.xp, 10);
    h.eq(s2.state.attempts[b.id], 2);
  });

  h.test('作答失败：记录尝试次数但不加 XP、不通过', function () {
    var b = beat('s1-a1-b1');
    var r = E.evaluate(['sorry'], b);
    var out = E.applyAnswer(E.createState(), b, r);
    h.eq(out.state.xp, 0);
    h.eq(out.state.attempts[b.id], 1);
    h.eq(E.isPassed(out.state, b.id), false);
  });

  h.test('场景统计：完成度与地道句数', function () {
    var scene = SCENES[0];
    var s = E.createState();
    s.passed['s1-a1-b1'] = 'native';
    s.passed['s1-a1-b2'] = 'ok';
    var stats = E.sceneStats(s, scene);
    h.eq(stats.passed, 2);
    h.eq(stats.native, 1);
    h.eq(stats.total, 9);
    h.eq(stats.done, false);
    h.ok(stats.percent > 0 && stats.percent < 100);
  });

  h.test('解锁：第一集默认解锁，第二集必须等第一集全部通过', function () {
    var s = E.createState();
    h.eq(E.sceneUnlocked(s, SCENES, 0), true);
    h.eq(E.sceneUnlocked(s, SCENES, 1), false);
    E.flattenBeats(SCENES[0]).forEach(function (x) { s.passed[x.beat.id] = 'native'; });
    h.eq(E.sceneUnlocked(s, SCENES, 1), true);
    h.eq(E.sceneUnlocked(s, SCENES, 2), false);
  });

  h.test('nextUp：跳过已通过回合，返回第一处未完成', function () {
    var s = E.createState();
    var first = E.nextUp(s, SCENES);
    h.eq(first.beat.id, SCENES[0].acts[0].beats[0].id);
    s.passed[first.beat.id] = 'native';
    h.eq(E.nextUp(s, SCENES).beat.id, SCENES[0].acts[0].beats[1].id);
  });

  h.test('场景状态机：locked → active → choice → done', function () {
    var s = E.createState();
    h.eq(E.sceneStatus(s, SCENES, 1), 'locked');
    h.eq(E.sceneStatus(s, SCENES, 0), 'active');
    E.flattenBeats(SCENES[0]).forEach(function (x) { s.passed[x.beat.id] = 'native'; });
    h.eq(E.sceneStatus(s, SCENES, 0), 'choice');
    s = E.completeScene(s, SCENES[0].id, 'send');
    h.eq(E.sceneStatus(s, SCENES, 0), 'done');
    h.eq(s.choices[SCENES[0].id], 'send');
  });

  h.test('人设结算文案：按人设取对应的一句', function () {
    var s = E.setPersona(E.createState(), 'snark');
    h.eq(s.persona, 'snark');
    h.ok(E.personaClosing(SCENES[0], 'snark').indexOf('嘴') > -1, '应取到 snark 专属文案');
    h.ok(E.personaClosing(SCENES[0], null).length > 0, '无人设时应有兜底文案');
  });

  h.test('总览统计：累计通过数与百分比', function () {
    var s = E.createState();
    E.flattenBeats(SCENES[0]).forEach(function (x) { s.passed[x.beat.id] = 'native'; });
    s.xp = 90;
    var t = E.totalStats(s, SCENES);
    h.eq(t.passed, 9);
    h.eq(t.total, 45);
    h.eq(t.percent, 20);
    h.eq(t.xp, 90);
  });

  /* ---------------- 4. 容错与持久化 ---------------- */
  h.test('迁移：空/损坏数据退化为全新状态', function () {
    h.eq(E.migrate(null).xp, 0);
    h.eq(E.migrate('oops').xp, 0);
    h.eq(E.migrate({ version: 999, xp: 500 }).xp, 0);
  });

  h.test('迁移：合法数据被保留', function () {
    var s = E.createState();
    s.xp = 42;
    s.passed['s1-a1-b1'] = 'native';
    var m = E.migrate(JSON.parse(JSON.stringify(s)));
    h.eq(m.xp, 42);
    h.eq(m.passed['s1-a1-b1'], 'native');
  });

  h.test('句子本：收藏→去重→取消收藏', function () {
    var s = E.createState();
    var out1 = E.toggleSaved(s, { text: 'That’d be great, thanks.', note: 'x', sceneId: 's' });
    h.eq(out1.saved, true);
    h.eq(out1.state.saved.length, 1);
    var out2 = E.toggleSaved(out1.state, { text: "That'd be great, thanks", note: 'x' });
    h.eq(out2.saved, false);
    h.eq(out2.state.saved.length, 0);
    h.eq(E.isSaved(out1.state, "that'd be great thanks"), true);
  });

  h.test('连击：首日 1，同日不变，隔日 +1，断档重置', function () {
    var s = E.createState();
    s = E.updateStreak(s, '2026-11-18');
    h.eq(s.streak, 1);
    s = E.updateStreak(s, '2026-11-18');
    h.eq(s.streak, 1);
    s = E.updateStreak(s, '2026-11-19');
    h.eq(s.streak, 2);
    s = E.updateStreak(s, '2026-11-25');
    h.eq(s.streak, 1);
  });

  h.test('日期键：本地日期格式 YYYY-MM-DD', function () {
    h.eq(E.dayKey(new Date(2026, 0, 5)), '2026-01-05');
    h.eq(E.dayKey(new Date(2026, 10, 19)), '2026-11-19');
    h.eq(E.daysBetween('2026-11-18', '2026-11-19'), 1);
  });

  /* ---------------- 5. 内容完整性 ---------------- */
  h.test('内容校验：命名冲突 / 词块不足 / 字段缺失 全部为 0', function () {
    var errors = E.validateContent(SCENES, PERSONAS);
    h.eq(errors.length, 0, '内容错误：\n' + errors.join('\n'));
  });

  h.test('内容规模：至少 5 集 / 40 个回合 / 每集 3 幕', function () {
    h.ok(SCENES.length >= 5, '场景不足 5 集');
    var beats = 0;
    SCENES.forEach(function (s) {
      h.ok(s.acts.length >= 3, s.id + ' 不足 3 幕');
      beats += E.flattenBeats(s).length;
    });
    h.ok(beats >= 40, '总回合不足 40，实际 ' + beats);
  });

  h.test('内容：每集都有二选一分支与两个不同结局', function () {
    SCENES.forEach(function (s) {
      h.eq(s.choice.options.length, 2, s.id + ' 分支数不对');
      h.ok(s.choice.options[0].outcome !== s.choice.options[1].outcome, s.id + ' 两个分支结局相同');
    });
  });

  h.test('内容校验器：能抓出词块缺失的坏数据', function () {
    var bad = [{
      id: 'x', title: 't', cn: 'c', hook: 'h', emoji: 'x',
      choice: { prompt: 'p', options: [{ id: 'a', label: 'a', outcome: 'o' }, { id: 'b', label: 'b', outcome: 'o2' }] },
      personaClose: { warm: 'w', snark: 's', chaos: 'c' },
      acts: [{ id: 'xa', beats: [{
        id: 'xb', line: 'l', lineCn: 'l', intent: 'i', situation: 's', tip: 't',
        chips: ['no', 'yours'], solutions: [{ text: 'no it is all yours', level: 'native', note: 'n' }]
      }] }]
    }];
    var errors = E.validateContent(bad, PERSONAS);
    h.ok(errors.length > 0, '应报错');
    h.ok(errors.join('|').indexOf('词块不足') > -1, '应指出词块不足，实际：' + errors.join(' | '));
  });

  /* ---------------- 6. 端到端：完整走通五集 ---------------- */
  h.test('端到端：用参考答案走完 45 个回合，五集全部可通关', function () {
    var s = E.createState();
    s = E.setPersona(s, 'chaos');
    var guard = 0;
    while (true) {
      guard += 1;
      if (guard > 200) throw new Error('死循环：进度没有推进');
      var step = E.nextUp(s, SCENES);
      if (!step) break;
      var sol = E.bestSolution(step.beat);
      var r = E.evaluate(words(sol.text), step.beat);
      h.eq(r.passed, true, step.beat.id + ' 参考答案竟然不通过：' + sol.text);
      s = E.applyAnswer(s, step.beat, r).state;
      if (E.sceneStats(s, step.scene).done && !s.choices[step.scene.id]) {
        s = E.completeScene(s, step.scene.id, step.scene.choice.options[0].id);
        s = E.recordOutcome(s, step.scene.id, step.scene.choice.options[0].outcome);
      }
    }
    var t = E.totalStats(s, SCENES);
    h.eq(t.passed, t.total, '应全部通过');
    h.eq(t.percent, 100);
    h.eq(t.xp, 45 * 10);
    h.eq(t.native, 45);
    h.eq(E.nextUp(s, SCENES), null);
    SCENES.forEach(function (sc) { h.eq(E.sceneStatus(s, SCENES, SCENES.indexOf(sc)), 'done', sc.id); });
  });

  h.test('端到端：走完第一集即可解锁第二集', function () {
    var s = E.createState();
    E.flattenBeats(SCENES[0]).forEach(function (x) {
      var r = E.evaluate(words(E.bestSolution(x.beat).text), x.beat);
      s = E.applyAnswer(s, x.beat, r).state;
    });
    h.eq(E.sceneUnlocked(s, SCENES, 1), true);
    var next = E.nextUp(s, SCENES);
    h.eq(next.scene.id, SCENES[1].id);
  });
});
