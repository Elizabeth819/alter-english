/* ALTER 核心逻辑测试（Node + 浏览器共用）。
 * 运行：node tests/run.js  或  直接用浏览器打开 tests/test.html
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.registerAlterTests = factory;
})(typeof self !== 'undefined' ? self : this, function (h, E, C, QR, SP, AN) {
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
    var total = SCENES.reduce(function (n, sc) { return n + E.flattenBeats(sc).length; }, 0);
    h.eq(t.passed, 9);
    h.eq(t.total, total);
    h.eq(t.percent, Math.round((9 / total) * 100));
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

  /* ---------------- 5. 每日节奏 ---------------- */
  function passScene(state, scene, day) {
    E.flattenBeats(scene).forEach(function (x) {
      var r = E.evaluate(words(E.bestSolution(x.beat).text), x.beat);
      state = E.applyAnswer(state, x.beat, r, { day: day, sceneId: scene.id, season: scene.season }).state;
    });
    return E.completeScene(state, scene.id, scene.choice.options[0].id, day);
  }

  h.test('每日节奏：新用户今天就是第 1 集', function () {
    var s = E.createState();
    s.createdAt = '2026-11-18T10:00:00.000Z';
    var plan = E.dailyEpisode(s, SCENES, '2026-11-18');
    h.eq(plan.index, 0);
    h.eq(plan.scene.id, SCENES[0].id);
    h.eq(plan.status, 'new');
    h.eq(plan.timing.status, 'today');
    h.eq(plan.timing.early, false);
  });

  h.test('每日节奏：今天通关后，下一集标记为提前解锁（不硬卡）', function () {
    var s = E.createState();
    s.createdAt = '2026-11-18T10:00:00.000Z';
    s = passScene(s, SCENES[0], '2026-11-18');
    var plan = E.dailyEpisode(s, SCENES, '2026-11-18');
    h.eq(plan.index, 1);
    h.eq(plan.status, 'early');
    h.eq(plan.timing.early, true);
    h.eq(plan.scheduledFor, '2026-11-19');
    h.eq(E.sceneTiming(s, SCENES, 1, '2026-11-18').status, 'early');
    h.eq(E.sceneUnlocked(s, SCENES, 1), true, '提前看仍然可进入');
  });

  h.test('每日节奏：第二天回来，下一集就是今天的 3 分钟', function () {
    var s = E.createState();
    s.createdAt = '2026-11-18T10:00:00.000Z';
    s = passScene(s, SCENES[0], '2026-11-18');
    var plan = E.dailyEpisode(s, SCENES, '2026-11-19');
    h.eq(plan.index, 1);
    h.eq(plan.status, 'today');
    h.eq(plan.timing.status, 'today');
    h.eq(plan.timing.early, false);
  });

  h.test('每日节奏：老存档缺少 completedOn 时按“今天可玩”处理', function () {
    var s = E.createState();
    s.createdAt = '2026-11-18T10:00:00.000Z';
    E.flattenBeats(SCENES[0]).forEach(function (x) { s.passed[x.beat.id] = 'native'; });
    s.choices[SCENES[0].id] = SCENES[0].choice.options[0].id;
    var plan = E.dailyEpisode(s, SCENES, '2026-11-19');
    h.eq(plan.index, 1);
    h.eq(plan.timing.early, false);
    h.eq(plan.status, 'today');
  });

  h.test('每日节奏：全部通关后不再给出新的一集', function () {
    var s = E.createState();
    SCENES.forEach(function (scene) { s = passScene(s, scene, '2026-11-19'); });
    var plan = E.dailyEpisode(s, SCENES, '2026-11-19');
    h.eq(plan.status, 'complete');
    h.eq(plan.index, -1);
  });

  /* ---------------- 6. 复习队列 ---------------- */
  h.test('复习：答错 → 今天到期，进入队列', function () {
    var b = beat('s1-a1-b1');
    var s = E.applyAnswer(E.createState(), b, E.evaluate(['sorry'], b), {
      day: '2026-11-19', sceneId: SCENES[0].id, season: 1
    }).state;
    var item = E.reviewItem(s, b.id);
    h.ok(item, '应进入复习队列');
    h.eq(item.due, '2026-11-19');
    h.eq(item.source, 'wrong');
    h.eq(E.reviewDueCount(s, '2026-11-19'), 1);
    h.eq(E.reviewDue(s, '2026-11-19')[0].beatId, b.id);
  });

  h.test('复习：只说“能懂” → 3 天后再来，不占今天', function () {
    var b = beat('s1-a1-b1');
    var ok = E.evaluate(['Go', 'ahead'], b);
    h.eq(ok.grade, 'ok');
    var s = E.applyAnswer(E.createState(), b, ok, {
      day: '2026-11-19', sceneId: SCENES[0].id, season: 1
    }).state;
    h.eq(E.reviewDueCount(s, '2026-11-19'), 0);
    h.eq(E.reviewDueCount(s, '2026-11-22'), 1);
    h.eq(E.reviewPending(s, '2026-11-19').length, 1);
  });

  h.test('复习：剧情里改口说到地道 → 仍留给复习确认，不静默清掉', function () {
    var b = beat('s1-a1-b1');
    var s = E.applyAnswer(E.createState(), b, E.evaluate(['sorry'], b), {
      day: '2026-11-19', sceneId: SCENES[0].id, season: 1
    }).state;
    h.ok(E.reviewItem(s, b.id), '先进入队列');
    s = E.applyAnswer(s, b, E.evaluate(words("No, it's all yours."), b), {
      day: '2026-11-19', sceneId: SCENES[0].id, season: 1
    }).state;
    h.ok(E.reviewItem(s, b.id), '答对后仍应在队列里等复习');
    h.eq(E.reviewItem(s, b.id).due, '2026-11-19');

    var clean = E.applyAnswer(E.createState(), b, E.evaluate(words("No, it's all yours."), b), {
      day: '2026-11-19', sceneId: SCENES[0].id, season: 1
    }).state;
    h.eq(E.reviewItem(clean, b.id), null, '一次就说到地道，不必进队列');
  });

  h.test('复习作答：答对移出，答错推到明天', function () {
    var b = beat('s1-a1-b1');
    var base = E.applyAnswer(E.createState(), b, E.evaluate(['sorry'], b), {
      day: '2026-11-19', sceneId: SCENES[0].id, season: 1
    }).state;

    var pass = E.gradeReview(base, b.id, E.evaluate(words('No, it\'s all yours.'), b), '2026-11-19');
    h.eq(E.reviewItem(pass, b.id), null);

    var fail = E.gradeReview(base, b.id, E.evaluate(['sorry'], b), '2026-11-19');
    h.eq(E.reviewItem(fail, b.id).due, '2026-11-20');
    h.eq(E.reviewItem(fail, b.id).lapses, 2);
    h.eq(E.reviewDueCount(fail, '2026-11-19'), 0);
    h.eq(E.reviewDueCount(fail, '2026-11-20'), 1);
  });

  h.test('复习：本机存档迁移保留队列，坏条目被丢弃', function () {
    var raw = E.createState();
    raw.review = {
      's1-a1-b1': { beatId: 's1-a1-b1', sceneId: 'first-day', season: 1, due: '2026-11-19', interval: 0, source: 'wrong', lapses: 1, added: '2026-11-19' },
      bad: { nothing: true }
    };
    var m = E.migrate(JSON.parse(JSON.stringify(raw)));
    h.eq(E.reviewTotal(m), 1);
    h.eq(E.reviewItem(m, 's1-a1-b1').due, '2026-11-19');
    h.eq(E.reviewItem(m, 'bad'), null);
  });

  /* ---------------- 7. 二维码 ---------------- */
  h.test('二维码：线上地址 → 33×33，三个定位图形完整', function () {
    h.ok(QR, '缺少二维码模块');
    var qr = QR.encode('https://elizabeth819.github.io/alter-english/');
    h.eq(qr.size, 33);
    var rows = [
      '1111111',
      '1000001',
      '1011101',
      '1011101',
      '1011101',
      '1000001',
      '1111111'
    ];
    var corners = [[0, 0], [26, 0], [0, 26]];
    corners.forEach(function (c) {
      rows.forEach(function (row, dy) {
        for (var dx = 0; dx < 7; dx++) {
          h.eq(qr.modules[c[1] + dy][c[0] + dx], row[dx] === '1',
            '定位图形 (' + c[0] + ',' + c[1] + ') 偏移 ' + dx + ',' + dy);
        }
      });
    });
  });

  h.test('二维码：时序图案交错，固定暗模块存在', function () {
    var qr = QR.encode('https://elizabeth819.github.io/alter-english/');
    h.eq(qr.modules[6][8], true);
    h.eq(qr.modules[6][9], false);
    h.eq(qr.modules[8][6], true);
    h.eq(qr.modules[9][6], false);
    h.eq(qr.modules[25][8], true, '固定暗模块');
    var dark = qr.modules.reduce(function (sum, row) {
      return sum + row.filter(Boolean).length;
    }, 0);
    h.ok(dark > 300 && dark < 850, '暗模块比例异常：' + dark);
  });

  h.test('二维码：同样输入输出稳定（可复现）', function () {
    var a = QR.encode('https://example.com');
    var b = QR.encode('https://example.com');
    h.deepEq(a.modules, b.modules);
  });

  h.test('二维码：超出容量时抛错，不生成坏图', function () {
    h.throws(function () { QR.encode(new Array(120).join('a')); });
  });

  /* ---------------- 8. 内容完整性 ---------------- */
  h.test('内容校验：命名冲突 / 词块不足 / 字段缺失 全部为 0', function () {
    var errors = E.validateContent(SCENES, PERSONAS);
    h.eq(errors.length, 0, '内容错误：\n' + errors.join('\n'));
  });

  h.test('内容规模：3 季 15 集 / 135 个回合 / 每集 3 幕', function () {
    h.eq(SCENES.length, 15, '应为 15 集');
    var beats = 0;
    SCENES.forEach(function (s) {
      h.eq(s.acts.length, 3, s.id + ' 应为 3 幕');
      h.eq(E.flattenBeats(s).length, 9, s.id + ' 应为 9 个回合');
      beats += E.flattenBeats(s).length;
    });
    h.eq(beats, 135, '总回合应为 135');
  });

  h.test('内容规模：三季各 5 集，难度逐季上升', function () {
    var seasons = SCENES.map(function (s) { return s.season; });
    h.deepEq(seasons, [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3]);
    h.eq(SCENES[0].level, 'A2–B1');
    h.eq(SCENES[14].level, 'B2');
  });

  h.test('分支承接：每一集都必须引用上一集的两个分支', function () {
    for (var i = 1; i < SCENES.length; i++) {
      var prev = SCENES[i - 1];
      var cur = SCENES[i];
      h.ok(cur.callbacks, cur.id + ' 缺少 callbacks');
      prev.choice.options.forEach(function (opt) {
        h.ok(cur.callbacks[opt.id], cur.id + ' 缺少对上一集分支 ' + opt.id + ' 的承接');
      });
    }
  });

  h.test('分支承接：不同选择真的会得到不同开场', function () {
    var prev = SCENES[0];
    var a = E.createState();
    a = E.completeScene(a, prev.id, prev.choice.options[0].id);
    var b = E.completeScene(a, prev.id, prev.choice.options[1].id);
    var lineA = E.sceneCallback(a, SCENES, SCENES[1].id);
    var lineB = E.sceneCallback(b, SCENES, SCENES[1].id);
    h.ok(lineA && lineB, '两种选择都应有承接文案');
    h.ok(lineA !== lineB, '两种选择应产生不同文案');
    h.eq(E.sceneCallback(a, SCENES, SCENES[0].id), '', '第一集没有上一集');
  });

  h.test('英文语料：参考答案与台词里不能出现中文', function () {
    var cn = /[\u4e00-\u9fa5]/;
    SCENES.forEach(function (s) {
      E.flattenBeats(s).forEach(function (x) {
        h.ok(!cn.test(x.beat.line), x.beat.id + ' 台词混入中文');
        x.beat.solutions.forEach(function (sol) {
          h.ok(!cn.test(sol.text), x.beat.id + ' 参考答案含中文: ' + sol.text);
        });
      });
    });
  });

  h.test('地道点解释：每条不超过两句', function () {
    SCENES.forEach(function (s) {
      E.flattenBeats(s).forEach(function (x) {
        h.ok(E.countSentences(x.beat.tip) <= 2, x.beat.id + ' 解释超过两句');
      });
    });
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

  /* ---------------- 6. 端到端：完整走通三季 ---------------- */
  h.test('端到端：用参考答案走完 135 个回合，15 集全部可通关', function () {
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
    var total = SCENES.reduce(function (n, sc) { return n + E.flattenBeats(sc).length; }, 0);
    h.eq(t.passed, t.total, '应全部通过');
    h.eq(t.percent, 100);
    h.eq(t.xp, total * 10);
    h.eq(t.native, total);
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

  /* ---------------- 12. 语音识别文本比对 ---------------- */

  var speechBeat = function (text) {
    return { id: 'speech-test', solutions: [{ text: text, level: 'native', note: '' }] };
  };

  h.test('语音比对：逐字念对 → 说对了', function () {
    var r = SP.matchTranscript('No, it is all yours.', speechBeat("No, it's all yours."));
    h.eq(r.status, 'pass');
    h.eq(r.label, '说对了');
    h.deepEq(r.missing, []);
  });

  h.test('语音比对：大小写、标点、多余空格都不影响', function () {
    var r = SP.matchTranscript('  THAT   WOULD BE GREAT, THANKS! ', speechBeat("That'd be great, thanks."));
    h.eq(r.status, 'pass');
    h.eq(r.transcript, 'THAT   WOULD BE GREAT, THANKS!');
  });

  h.test('语音比对：缩写与完整写法互通（I am going to / I\'m gonna）', function () {
    var r = SP.matchTranscript('I am going to grab a coffee', speechBeat("I'm gonna grab a coffee."));
    h.eq(r.status, 'pass');
    h.eq(r.coverage, 1);
  });

  h.test('语音比对：连读/弱写（lemme → let me）能对上', function () {
    var r = SP.matchTranscript('lemme take a look', speechBeat('Let me take a look.'));
    h.eq(r.status, 'pass');
    h.deepEq(r.missing, []);
  });

  h.test('语音比对：词序小偏差仍算说对了', function () {
    var r = SP.matchTranscript("no it's yours all", speechBeat("No, it's all yours."));
    h.eq(r.status, 'pass');
    h.eq(r.coverage, 1);
    h.ok(r.order < 1, '应识别出语序有小偏差');
  });

  h.test('语音比对：多词漏说 → 差一点，并指出漏掉的词', function () {
    var r = SP.matchTranscript("I'm going to get coffee", speechBeat('I am going to grab a coffee.'));
    h.eq(r.status, 'close');
    h.eq(r.label, '差一点');
    h.deepEq(r.missing, ['grab', 'a']);
    h.ok(r.coverage < 0.9);
  });

  h.test('语音比对：完全跑偏 → 没听清', function () {
    var r = SP.matchTranscript('Sorry, I am busy.', speechBeat("No, it's all yours."));
    h.eq(r.status, 'unclear');
    h.eq(r.label, '没听清');
  });

  h.test('语音比对：空识别结果 → 没听清', function () {
    var r = SP.matchTranscript('', speechBeat("No, it's all yours."));
    h.eq(r.status, 'unclear');
    h.ok(r.missing.length > 0, '应给出参考句里没听到的词');
  });

  h.test('语音比对：语气词（um/uh）不算多说', function () {
    var r = SP.matchTranscript("um, uh, I'm gonna grab a coffee", speechBeat("I'm gonna grab a coffee."));
    h.eq(r.status, 'pass');
    h.deepEq(r.extra, []);
  });

  h.test('语音比对：多个参考答案时取最匹配的一条', function () {
    var b = {
      id: 'multi',
      solutions: [
        { text: 'Go ahead.', level: 'ok' },
        { text: "No, it's all yours.", level: 'native' }
      ]
    };
    var r = SP.matchTranscript('no it is all yours', b);
    h.eq(r.status, 'pass');
    h.eq(r.solution, "No, it's all yours.");
  });

  h.test('语音比对：缺少 solutions 时抛错', function () {
    h.throws(function () { SP.matchTranscript('hello', { id: 'bad', solutions: [] }); });
  });

  /* ---------------- 13. 语音识别控制器（假结果，不碰麦克风） ---------------- */

  function FakeRecognition() {
    FakeRecognition.last = this;
    this.started = false;
    this.aborted = false;
    this.start = function () { this.started = true; };
    this.stop = function () {};
    this.abort = function () { this.aborted = true; };
  }

  h.test('语音控制器：没有浏览器识别能力时报告不支持', function () {
    var ctrl = SP.createController({ window: {}, factory: null });
    h.eq(ctrl.supported, false);
    var err = null;
    var ok = ctrl.start({ error: function (code) { err = code; } });
    h.eq(ok, false);
    h.eq(err, 'unsupported');
    h.eq(SP.supported({}), false);
    h.eq(SP.supported({ webkitSpeechRecognition: FakeRecognition }), true);
  });

  h.test('语音控制器：假识别结果能回调文本，且只结束一次', function () {
    var got = null;
    var ends = 0;
    var interim = [];
    var ctrl = SP.createController({ window: {}, factory: FakeRecognition });
    ctrl.start({
      interim: function (t) { interim.push(t); },
      result: function (r) { got = r.transcript; },
      end: function () { ends += 1; }
    });
    h.eq(FakeRecognition.last.started, true);
    FakeRecognition.last.onresult({ resultIndex: 0, results: [{ 0: { transcript: 'no it is' }, isFinal: false }] });
    FakeRecognition.last.onresult({ resultIndex: 0, results: [{ 0: { transcript: "no it's all yours" }, isFinal: true }] });
    FakeRecognition.last.onend();
    h.eq(got, "no it's all yours");
    h.deepEq(interim, ['no it is']);
    h.eq(ends, 1);
  });

  h.test('语音控制器：麦克风被拒绝 → denied，不死循环', function () {
    var err = null;
    var ends = 0;
    var ctrl = SP.createController({ window: {}, factory: FakeRecognition });
    ctrl.start({ error: function (code) { err = code; }, end: function () { ends += 1; } });
    FakeRecognition.last.onerror({ error: 'not-allowed' });
    FakeRecognition.last.onend();
    h.eq(err, 'denied');
    h.eq(ends, 1);
  });

  h.test('语音控制器：主动取消后不再回调', function () {
    var called = 0;
    var ctrl = SP.createController({ window: {}, factory: FakeRecognition });
    ctrl.start({
      result: function () { called += 1; },
      interim: function () { called += 1; },
      error: function () { called += 1; },
      end: function () { called += 1; }
    });
    ctrl.abort();
    FakeRecognition.last.onresult({ resultIndex: 0, results: [{ 0: { transcript: 'hi' }, isFinal: true }] });
    FakeRecognition.last.onend();
    h.eq(FakeRecognition.last.aborted, true);
    h.eq(called, 0);
  });

  /* ---------------- 14. 本机埋点与周报 ---------------- */

  var at = function (log, name, props, day) {
    return AN.record(log, name, props, { now: new Date(2026, 10, 19, 9, 0, 0), day: day || '2026-11-19' });
  };

  h.test('埋点：记录事件名、本地日期与时间戳', function () {
    var log = at(AN.createLog(), 'app_open');
    h.eq(log.events.length, 1);
    h.eq(log.events[0].name, 'app_open');
    h.eq(log.events[0].day, '2026-11-19');
    h.ok(log.events[0].t > 0, '应写入时间戳');
  });

  h.test('埋点：对话原文等隐私字段绝不落库', function () {
    var log = at(AN.createLog(), 'beat_complete', {
      beatId: 'b1',
      grade: 'native',
      firstPass: true,
      text: 'No, it is all yours.',
      line: 'Is this seat taken?',
      transcript: 'no it is all yours'
    });
    var p = log.events[0].props;
    h.eq(p.beatId, 'b1');
    h.eq(p.grade, 'native');
    h.eq(p.firstPass, true);
    h.eq(p.text, undefined);
    h.eq(p.line, undefined);
    h.eq(p.transcript, undefined);
  });

  h.test('埋点：超过上限自动裁剪，保留最新事件', function () {
    var log = AN.createLog();
    for (var i = 0; i < AN.MAX_EVENTS + 25; i++) {
      log = at(log, 'app_open', { i: i });
    }
    h.eq(log.events.length, AN.MAX_EVENTS);
    h.eq(log.events[0].props.i, 25);
    h.eq(log.events[log.events.length - 1].props.i, AN.MAX_EVENTS + 24);
  });

  h.test('埋点：迁移丢弃坏事件，坏数据不崩', function () {
    var log = AN.migrate({
      version: 1,
      events: [
        { name: 'app_open', day: '2026-11-19', t: 1 },
        { name: '', day: '2026-11-19', t: 2 },
        { name: 'beat_complete', day: 'not-a-day', t: 3 },
        { name: 'scene_start', day: '2026-11-19' },
        { name: 'scene_complete', day: '2026-11-19', t: 4, props: { sceneId: 's1' } }
      ]
    });
    h.eq(log.events.length, 2);
    h.eq(log.events[1].props.sceneId, 's1');
    h.eq(AN.migrate('bad data').events.length, 0);
  });

  h.test('漏斗：各步计数与占打开的转化率', function () {
    var log = AN.createLog();
    log = at(log, 'app_open'); log = at(log, 'app_open'); log = at(log, 'app_open');
    log = at(log, 'persona_pick', { persona: 'soft' });
    log = at(log, 'scene_start', { sceneId: 's1' });
    log = at(log, 'scene_start', { sceneId: 's2' });
    log = at(log, 'beat_complete', { sceneId: 's1', beatId: 'b1', grade: 'native', firstPass: true });
    log = at(log, 'beat_complete', { sceneId: 's1', beatId: 'b2', grade: 'ok', firstPass: true });
    log = at(log, 'beat_complete', { sceneId: 's2', beatId: 'b3', grade: 'native', firstPass: true });
    log = at(log, 'scene_complete', { sceneId: 's1' });
    log = at(log, 'scene_complete', { sceneId: 's2' });
    log = at(log, 'speech_use', { beatId: 'b1' });
    log = at(log, 'speech_use', { beatId: 'b2' });
    log = at(log, 'card_generated', { sceneId: 's1' });
    log = at(log, 'card_saved', { sceneId: 's1' });
    log = at(log, 'day2_return');

    var f = AN.funnel(log);
    var byKey = {};
    f.forEach(function (x) { byKey[x.key] = x; });
    h.eq(byKey.open.count, 3);
    h.eq(byKey.persona.count, 1);
    h.eq(byKey.sceneStart.count, 2);
    h.eq(byKey.scene.count, 2);
    h.eq(byKey.card.count, 1);
    h.eq(byKey.save.count, 1);
    h.eq(byKey.return.count, 1);
    h.eq(byKey.open.rate, 100);
    h.eq(byKey.persona.rate, 33);
    h.eq(byKey.sceneStart.rate, 67);
    h.eq(byKey.scene.rate, 67);
    var s = AN.stats(log, { today: '2026-11-19' });
    h.eq(s.counters.beats, 3);
    h.eq(s.counters.speech, 2);
    h.eq(s.counters.reviews, 0);
    h.ok(AN.hasEvent(log, 'card_generated', 'sceneId', 's1'));
    h.eq(AN.hasEvent(log, 'card_generated', 'sceneId', 's2'), false);
  });

  h.test('每日活跃：只统计最近 N 天', function () {
    var log = AN.createLog();
    log = at(log, 'app_open', null, '2026-11-19');
    log = at(log, 'app_open', null, '2026-11-19');
    log = at(log, 'beat_complete', { beatId: 'b1' }, '2026-11-19');
    log = at(log, 'app_open', null, '2026-11-17');
    log = at(log, 'app_open', null, '2026-11-01');

    var d = AN.daily(log, 7, { today: '2026-11-19' });
    h.eq(d.length, 7);
    h.eq(d[0].day, '2026-11-13');
    h.eq(d[6].day, '2026-11-19');
    h.eq(d[6].opens, 2);
    h.eq(d[6].learning, 1);
    h.eq(d[4].day, '2026-11-17');
    h.eq(d[4].active, true);
    var active = d.filter(function (x) { return x.active; }).length;
    h.eq(active, 2);
  });

  h.test('数据页指标：平均幕数、语音比例、分享率', function () {
    var log = AN.createLog();
    log = at(log, 'scene_start', { sceneId: 's1' });
    log = at(log, 'scene_start', { sceneId: 's2' });
    log = at(log, 'beat_complete', { sceneId: 's1', beatId: 'b1' });
    log = at(log, 'beat_complete', { sceneId: 's1', beatId: 'b2' });
    log = at(log, 'beat_complete', { sceneId: 's1', beatId: 'b3' });
    log = at(log, 'beat_complete', { sceneId: 's2', beatId: 'b4' });
    log = at(log, 'speech_use', { beatId: 'b1' });
    log = at(log, 'speech_use', { beatId: 'b2' });
    log = at(log, 'scene_complete', { sceneId: 's1' });
    log = at(log, 'scene_complete', { sceneId: 's2' });
    log = at(log, 'card_saved', { sceneId: 's1' });

    h.eq(AN.avgBeatsPerScene(log), 2);
    h.deepEq(AN.speechUsage(log), { uses: 2, beats: 4, ratio: 0.5 });
    h.deepEq(AN.shareRate(log), { saved: 1, completed: 2, ratio: 0.5 });

    var empty = AN.createLog();
    h.eq(AN.avgBeatsPerScene(empty), 0);
    h.eq(AN.speechUsage(empty).ratio, 0);
    h.eq(AN.shareRate(empty).ratio, 0);
  });

  h.test('周报：7 天窗口内指标正确，并与上周比较', function () {
    var log = AN.createLog();
    // 本周（11-13 ~ 11-19）
    log = at(log, 'beat_complete', { beatId: 'b1', grade: 'native', firstPass: true }, '2026-11-18');
    log = at(log, 'beat_complete', { beatId: 'b2', grade: 'ok', firstPass: true }, '2026-11-18');
    log = at(log, 'beat_complete', { beatId: 'b3', grade: 'ok', firstPass: true }, '2026-11-19');
    log = at(log, 'scene_complete', { sceneId: 's1' }, '2026-11-18');
    log = at(log, 'scene_complete', { sceneId: 's2' }, '2026-11-19');
    log = at(log, 'speech_use', { beatId: 'b1' }, '2026-11-18');
    log = at(log, 'speech_use', { beatId: 'b2' }, '2026-11-19');
    log = at(log, 'review_clear', { beatId: 'r1' }, '2026-11-19');
    // 上周（11-06 ~ 11-12）
    log = at(log, 'beat_complete', { beatId: 'p1' }, '2026-11-10');
    log = at(log, 'beat_complete', { beatId: 'p2' }, '2026-11-11');

    var r = AN.weekReport(log, { today: '2026-11-19', pending: 2 });
    h.eq(r.range.from, '2026-11-13');
    h.eq(r.range.to, '2026-11-19');
    h.eq(r.metrics.studyDays, 2);
    h.eq(r.metrics.beats, 3);
    h.eq(r.metrics.scenes, 2);
    h.eq(r.metrics.native, 1);
    h.eq(r.metrics.speech, 2);
    h.eq(r.metrics.reviews, 1);
    h.eq(r.previous.beats, 2);
    h.eq(r.trend.dir, 'up');
    h.eq(r.trend.delta, 1);
    h.eq(r.pending, 2);
    h.ok(/2 天/.test(r.advice), '建议应基于真实学习天数');
    h.eq(JSON.stringify(r).indexOf('transcript'), -1);
  });

  h.test('周报：窗口外的事件不计入本周', function () {
    var log = AN.createLog();
    log = at(log, 'beat_complete', { beatId: 'old' }, '2026-11-12');
    var r = AN.weekReport(log, { today: '2026-11-19' });
    h.eq(r.metrics.beats, 0);
    h.eq(r.previous.beats, 1);
    h.eq(r.trend.dir, 'down');
    h.eq(r.hasData, false);
  });

  h.test('周报：开口太少时给出具体可执行的建议', function () {
    var log = AN.createLog();
    for (var i = 1; i <= 8; i++) {
      log = at(log, 'beat_complete', { beatId: 'b' + i, grade: 'ok', firstPass: true }, '2026-11-' + (15 + (i % 3)));
    }
    var r = AN.weekReport(log, { today: '2026-11-19' });
    h.eq(r.metrics.studyDays, 3);
    h.ok(/开口/.test(r.advice), '低开口率应优先建议开口');
    h.ok(/8/.test(r.advice), '建议应带上本周完成幕数');
  });

  h.test('周报：没有数据时给温和的起步建议', function () {
    var r = AN.weekReport(AN.createLog(), { today: '2026-11-19' });
    h.eq(r.hasData, false);
    h.ok(/还没有学习记录/.test(r.advice));
  });

  h.test('导出：JSON 可解析、带上限与条数、不含隐私字段', function () {
    var log = at(AN.createLog(), 'beat_complete', { beatId: 'b1', text: 'secret' });
    var data = JSON.parse(AN.exportJson(log));
    h.eq(data.app, 'ALTER');
    h.eq(data.count, 1);
    h.eq(data.events.length, 1);
    h.eq(JSON.stringify(data).indexOf('secret'), -1);
  });
});
