/* ALTER 内容库 · 第 2 季（第 6–10 集）
 * 结构同第 1 季；新增 callbacks：用上一集的分支选项 id 作为 key，写"本集如何承接它"。
 * 难度：B1（比第 1 季更长、更少提示、更多需要自己组织信息）。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ALTER_SEASON2 = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return [
    /* ============================ 6 ============================ */
    {
      id: 'first-shift',
      season: 2,
      title: 'First Shift',
      cn: '第一份工',
      emoji: '☕',
      level: 'B1',
      minutes: 4,
      hook: '考完试的第三天，你推开那家新开的咖啡店，门口贴着 Hiring，围裙就挂在椅背上。',
      callbacks: {
        yes: '考完那晚你们真的去了那家新店。你走的时候注意到门口贴着一张 Hiring 的纸，第二天又绕回去看了一眼。',
        maybe: '你后来还是去了那家新店。等餐的时候，你盯着柜台上那张 Hiring 的纸看了很久。'
      },
      cast: [{ name: 'Nadia', avatar: '🧑‍🍳', role: '店主 / 一眼看出你没经验' }],
      acts: [
        {
          id: 's6-a1',
          title: 'Act 1 · 柜台前',
          beats: [
            {
              id: 's6-a1-b1',
              speaker: 'Nadia',
              avatar: '🧑‍🍳',
              line: 'Here for the job?',
              lineCn: '来应聘的？',
              situation: '她正在擦杯子，没抬头，但已经把椅子往你这边推了一点。',
              intent: '说是，看到门口的招聘牌',
              chips: ['Yeah', 'I', 'saw', 'the', 'hiring', 'sign', 'outside', 'job', 'here', 'for', 'a', 'wanted'],
              solutions: [
                { text: 'Yeah, I saw the hiring sign outside.', level: 'native', note: '“hiring sign” 是招聘牌，比 “job paper” 地道得多。' },
                { text: 'I saw the sign outside.', level: 'ok', note: '省掉 hiring 也听得懂，但对方可能不确定你说的是哪个 sign。' }
              ],
              tip: '面试第一句别只说 “I want a job.”，说清你从哪知道这个机会，显得有准备。'
            },
            {
              id: 's6-a1-b2',
              speaker: 'Nadia',
              avatar: '🧑‍🍳',
              line: 'How old are you?',
              lineCn: '你多大了？',
              situation: '她终于抬头，看了你一眼，又看回手里的杯子。',
              intent: '说自己 16，问够不够年龄',
              chips: ["I'm", 'sixteen', 'Is', 'that', 'old', 'enough', 'for', 'this', 'yes', 'job'],
              solutions: [
                { text: "I'm sixteen. Is that old enough?", level: 'native', note: '“old enough” 很自然；“enough old” 是典型的中式语序。' }
              ],
              tip: '问资格用 “Is that old enough?”，比笼统的 “Can I?” 更具体。'
            },
            {
              id: 's6-a1-b3',
              speaker: 'Nadia',
              avatar: '🧑‍🍳',
              line: 'Have you worked before?',
              lineCn: '以前打过工吗？',
              situation: '这个问题她问过很多人，语气很平。',
              intent: '说没有，但在学校集市摆过摊',
              chips: ['Not', 'really', 'but', 'I', 'ran', 'a', 'stall', 'at', 'the', 'school', 'fair', 'never', 'worked', 'no'],
              solutions: [
                { text: 'Not really, but I ran a stall at the school fair.', level: 'native', note: '“Not really” 软化否定，既不撒谎也不显得毫无经验。' },
                { text: 'No, but I ran a stall at the school fair.', level: 'ok', note: '完全能懂，但 “No” 会让空气冷一秒。' }
              ],
              tip: '没经验时，“Not really, but…” 是最好用的结构：先诚实，再给替代经验。'
            }
          ]
        },
        {
          id: 's6-a2',
          title: 'Act 2 · 试一下',
          beats: [
            {
              id: 's6-a2-b1',
              speaker: 'Nadia',
              avatar: '🧑‍🍳',
              line: 'Make me a latte. Machine is behind you.',
              lineCn: '给我做杯拿铁。机器在你后面。',
              situation: '蒸汽棒、两个手柄、三个按钮，你一个都没用过。',
              intent: '承认没用过，但说学得快',
              chips: ['I', "haven't", 'used', 'this', 'machine', 'before', 'but', 'I', 'can', 'learn', 'fast', 'no', 'sorry', 'it'],
              solutions: [
                { text: "I haven't used this machine before, but I can learn fast.", level: 'native', note: '“haven’t used … before” 比 “I can’t” 诚实，也不关上门。' },
                { text: "Sorry, I haven't used this machine before.", level: 'ok', note: '先道歉也能过，但少了“我能学”的补救，气势会弱一点。' }
              ],
              tip: '不会的时候，承认 + 给出学习能力，比硬撑安全得多。'
            },
            {
              id: 's6-a2-b2',
              speaker: 'Nadia',
              avatar: '🧑‍🍳',
              line: "Learning fast isn't the same as being careful.",
              lineCn: '学得快，不等于细心。',
              situation: '她把抹布放下，第一次正眼看你。',
              intent: '说你会按步骤来，不确定就问',
              chips: ["I'll", 'follow', 'the', 'steps', 'and', 'ask', 'when', "I'm", 'not', 'sure', 'careful', 'yes', 'okay'],
              solutions: [
                { text: "I'll follow the steps and ask when I'm not sure.", level: 'native', note: '“ask when I’m not sure” 是雇主最想听到的一句。' }
              ],
              tip: '面试里“我会问”比“我什么都会”更可信。'
            },
            {
              id: 's6-a2-b3',
              speaker: 'Nadia',
              avatar: '🧑‍🍳',
              line: 'When can you start?',
              lineCn: '什么时候能开始？',
              situation: '她拿起排班表，笔尖停在周六那一栏。',
              intent: '说周六，工作日放学后也能来',
              chips: ['Saturday', 'if', 'that', 'works', 'and', 'after', 'school', 'on', 'weekdays', 'I', 'can', 'start'],
              solutions: [
                { text: 'Saturday, if that works — and after school on weekdays.', level: 'native', note: '“if that works” 把决定权递回去，很礼貌。' }
              ],
              tip: '时间用 “after school on weekdays” 这种顺序表达，对方一秒就能排班。'
            }
          ]
        },
        {
          id: 's6-a3',
          title: 'Act 3 · 谈条件',
          beats: [
            {
              id: 's6-a3-b1',
              speaker: 'Nadia',
              avatar: '🧑‍🍳',
              line: "It's minimum wage. Tips are split.",
              lineCn: '按最低时薪算，小费平摊。',
              situation: '她说得很直接，像在测试你会不会当场变脸。',
              intent: '问一周大概能排多少小时',
              chips: ['How', 'many', 'hours', 'a', 'week', 'would', 'I', 'get', 'much', 'time', 'work', 'pay'],
              solutions: [
                { text: 'How many hours a week would I get?', level: 'native', note: '“How many hours a week” 是问排班的固定说法。' },
                { text: 'How many hours would I get a week?', level: 'ok', note: '把 a week 挪到句尾也完全能懂，口语里很常见。' }
              ],
              tip: '谈条件用 “would I get”，比 “can I get” 更中性，不像在讨价还价。'
            },
            {
              id: 's6-a3-b2',
              speaker: 'Nadia',
              avatar: '🧑‍🍳',
              line: 'About twelve. Busy Saturdays.',
              lineCn: '大概十二小时。周六最忙。',
              situation: '她说完，等着你的反应。',
              intent: '说可以，但考试周要少排一点',
              chips: ['That', 'works', 'but', 'I', 'need', 'fewer', 'hours', 'during', 'exams', 'no', 'yes', 'maybe'],
              solutions: [
                { text: 'That works, but I need fewer hours during exams.', level: 'native', note: '“fewer hours”：hours 可数，别用 less。' }
              ],
              tip: '提要求用 “I need…”，比 “Can you give me…” 更像一个能商量的人。'
            },
            {
              id: 's6-a3-b3',
              speaker: 'Nadia',
              avatar: '🧑‍🍳',
              line: 'Deal. First shift Saturday, nine sharp.',
              lineCn: '成交。周六第一班，九点整。',
              situation: '她伸出手，掌心朝上。',
              intent: '确认你会准时到，并道谢',
              chips: ["I'll", 'be', 'here', 'at', 'nine', 'Thanks', 'for', 'the', 'chance', 'yes', 'will', 'come'],
              solutions: [
                { text: "I'll be here at nine. Thanks for the chance.", level: 'native', note: '“Thanks for the chance” 是拿到机会后的标准收尾。' },
                { text: "Yes, I'll be here at nine.", level: 'ok', note: '先答应再报到，简单清楚；少了感谢，正式场合会显得冷一点。' }
              ],
              tip: '“nine sharp” = 九点整，带一点不容迟到的意味。'
            }
          ]
        }
      ],
      choice: {
        prompt: '第一班结束，Nadia 问你要不要周末再多排一天。',
        options: [
          { id: 'extra', label: '多排一天，钱更重要', reply: '“我可以多排一天。”', outcome: '你多排了一天。周六晚上你数着工时，第一次觉得钱是自己挣的。' },
          { id: 'balance', label: '只排一天，留时间给自己', reply: '“先只排一天。”', outcome: '你只排了一天。Nadia 点点头：“Smart. Burnout is real.” 你松了口气。' }
        ]
      },
      personaClose: {
        warm: 'Nadia 后来跟常客说：“那个学生，第一天就把地拖了。”',
        snark: 'Nadia 说：“他没经验，但敢说不知道，这种人我敢教。”',
        chaos: 'Nadia 说：“他把拿铁拉花做成了地图，但客人居然喜欢。”'
      }
    },

    /* ============================ 7 ============================ */
    {
      id: 'train-north',
      season: 2,
      title: 'Train to Somewhere',
      cn: '一个人坐高铁',
      emoji: '🚄',
      level: 'B1',
      minutes: 4,
      hook: '第一次一个人坐高铁去外地比赛。票在手机里，站台在楼上，你提前了四十分钟。',
      callbacks: {
        extra: '你把多排的那一天换成了这张车票。出门前你算了算，这趟刚好花掉两周的工资。',
        balance: '你用第一笔工资买了这张车票，剩下的还够请自己吃一顿。'
      },
      cast: [{ name: 'June', avatar: '🎧', role: '同去比赛的女生' }, { name: 'Ms. Okafor', avatar: '👩🏽‍🏫', role: '赛事负责人' }],
      acts: [
        {
          id: 's7-a1',
          title: 'Act 1 · 七号站台',
          beats: [
            {
              id: 's7-a1-b1',
              speaker: 'June',
              avatar: '🎧',
              line: 'Is this the line for the 9:40?',
              lineCn: '这是九点四十那班吗？',
              situation: '队伍很长，她回头问你，手里捏着和张一样的号码牌。',
              intent: '说是，并问她是不是也去比赛',
              chips: ['Yeah', 'it', 'is', 'Are', 'you', 'here', 'for', 'the', 'speech', 'contest', 'too', 'no', 'yes'],
              solutions: [
                { text: 'Yeah, it is. Are you here for the speech contest too?', level: 'native', note: '“too” 放句尾表示“也是”，别放句首。' }
              ],
              tip: '搭话最简单的两步：确认对方的问题，再补一个相关的问题。'
            },
            {
              id: 's7-a1-b2',
              speaker: 'June',
              avatar: '🎧',
              line: 'How did you know?',
              lineCn: '你怎么知道？',
              situation: '她低头看自己，才发现号码牌露在外面。',
              intent: '说她的号码牌从包里露出来了',
              chips: ['Your', 'number', 'tag', 'is', 'sticking', 'out', 'of', 'your', 'bag', 'show', 'see', 'name'],
              solutions: [
                { text: 'Your number tag is sticking out of your bag.', level: 'native', note: '“stick out” = 露出来，比 “is visible” 口语得多。' },
                { text: 'Your number tag is sticking out.', level: 'ok', note: '只说 “sticking out” 也够，对方低头就能看到。' }
              ],
              tip: '解释“我怎么知道”时给具体细节，比 “I guessed” 有趣。'
            },
            {
              id: 's7-a1-b3',
              speaker: 'June',
              avatar: '🎧',
              line: 'Nervous?',
              lineCn: '紧张吗？',
              situation: '她问得很随意，但自己的手指一直在转号码牌。',
              intent: '承认手都在抖',
              chips: ['My', 'hands', 'are', 'actually', 'shaking', 'a', 'little', 'yes', 'no', 'very', 'scared'],
              solutions: [
                { text: 'My hands are actually shaking a little.', level: 'native', note: '“actually” 在这里是“真的”，让自嘲更真实。' },
                { text: 'My hands are shaking a little.', level: 'ok', note: '去掉 actually 也成立，只是没那么强调“真的在抖”。' }
              ],
              tip: '承认紧张时给一个身体细节，比 “I’m nervous” 更容易让人接话。'
            }
          ]
        },
        {
          id: 's7-a2',
          title: 'Act 2 · 靠窗的位置',
          beats: [
            {
              id: 's7-a2-b1',
              speaker: 'June',
              avatar: '🎧',
              line: "What's your topic?",
              lineCn: '你讲什么题目？',
              situation: '车开了，窗外全是稻田，她把耳机摘下来。',
              intent: '说讲“为什么青少年该把真实想法说出来”',
              chips: ['Why', 'teenagers', 'should', 'speak', 'up', 'about', 'what', 'they', 'actually', 'think', 'my', 'topic', 'is'],
              solutions: [
                { text: 'Why teenagers should speak up about what they actually think.', level: 'native', note: '“speak up” = 敢于发声，比 “say something” 有力量。' },
                { text: 'My topic is why teenagers should speak up.', level: 'ok', note: '先说 topic 再解释，更像在介绍，而不是直接开讲。' }
              ],
              tip: '介绍话题用 why / what / how 开头，一句话说清立场。'
            },
            {
              id: 's7-a2-b2',
              speaker: 'June',
              avatar: '🎧',
              line: "That's heavy for nine in the morning.",
              lineCn: '早上九点讲这个，有点重。',
              situation: '她笑了一下，把腿盘到座位上。',
              intent: '笑，说自己也是半夜写的',
              chips: ['I', 'know', 'right', 'I', 'wrote', 'it', 'at', 'midnight', 'no', 'yes', 'heavy', 'funny'],
              solutions: [
                { text: 'I know, right? I wrote it at midnight.', level: 'native', note: '“I know, right?” 是强烈共鸣，比 “Yes, I agree” 自然。' }
              ],
              tip: '“I know, right?” 用在对方说了你也正好这么想的时候。'
            },
            {
              id: 's7-a2-b3',
              speaker: 'June',
              avatar: '🎧',
              line: 'Do you actually do it? Speak up, I mean.',
              lineCn: '你自己做得到吗？我是说，真的说出来。',
              situation: '这个问题问得有点狠，她自己也愣了一下。',
              intent: '承认还在练，比如现在就在练',
              chips: ["I'm", 'practising', 'right', 'now', 'talking', 'to', 'you', 'yes', 'no', 'always', 'try'],
              solutions: [
                { text: "I'm practising right now, talking to you.", level: 'native', note: '“practising right now” 用进行时，恰好在回应“现在”。' }
              ],
              tip: '“I mean” 用来补充说明上一句，是口语里的修正器。'
            }
          ]
        },
        {
          id: 's7-a3',
          title: 'Act 3 · 后台',
          beats: [
            {
              id: 's7-a3-b1',
              speaker: 'Ms. Okafor',
              avatar: '👩🏽‍🏫',
              line: "You're number fourteen. You have four minutes.",
              lineCn: '你是十四号，四分钟。',
              situation: '她递给你一张评分表，背面写着规则。',
              intent: '问超时会不会被扣分',
              chips: ['What', 'happens', 'if', 'I', 'go', 'over', 'four', 'minutes', 'time', 'late', 'sorry', 'long'],
              solutions: [
                { text: 'What happens if I go over four minutes?', level: 'native', note: '“go over” = 超时，比 “too long” 准确。' }
              ],
              tip: '问规则用 “What happens if…”，比 “Can I…” 更清楚。'
            },
            {
              id: 's7-a3-b2',
              speaker: 'Ms. Okafor',
              avatar: '👩🏽‍🏫',
              line: 'You get cut off. Politely.',
              lineCn: '会被打断。很礼貌地打断。',
              situation: '她说完自己笑了一下，气氛松了点。',
              intent: '说你会自己计时，不会超',
              chips: ['Then', "I'll", 'time', 'myself', 'I', "won't", 'run', 'over', 'cut', 'will', 'no'],
              solutions: [
                { text: "Then I'll time myself. I won't run over.", level: 'native', note: '“time myself” = 自己计时；“run over” = 超时。' }
              ],
              tip: '两个都是地道搭配：time myself（自己计时）、run over（超时）。'
            },
            {
              id: 's7-a3-b3',
              speaker: 'June',
              avatar: '🎧',
              line: 'If you freeze, look at me.',
              lineCn: '你要是卡住了，就看我。',
              situation: '她在你旁边坐下，把号码牌反过来扣在腿上。',
              intent: '说谢谢，可能会真的需要',
              chips: ['Thanks', 'I', 'might', 'take', 'you', 'up', 'on', 'that', 'no', 'yes', 'maybe', 'look'],
              solutions: [
                { text: 'Thanks. I might take you up on that.', level: 'native', note: '“take you up on that” = 接受你的提议，非常地道。' }
              ],
              tip: '接受别人好意时用这句，比 “OK” 有温度得多。'
            }
          ]
        }
      ],
      choice: {
        prompt: '上台前五分钟，June 说她也在抖，问你要不要先互相讲一遍。',
        options: [
          { id: 'rehearse', label: '在后台互相讲一遍', reply: '“来吧，先讲给我听。”', outcome: '你们在后台小声讲完了彼此的稿子。上台时，你发现自己的手不抖了。' },
          { id: 'quiet', label: '各自安静待着', reply: '“我想自己待一会儿。”', outcome: '你们各自戴上耳机。上台前她拍了拍你的肩，什么都没说。' }
        ]
      },
      personaClose: {
        warm: 'June 后来在动态里写：“今天认识了一个在高铁上背稿的人。”',
        snark: 'June 说：“他紧张得手抖，还敢上台，这点我服。”',
        chaos: 'June 说：“他上台前讲了个冷笑话，然后真的不紧张了。”'
      }
    },

    /* ============================ 8 ============================ */
    {
      id: 'dinner-table',
      season: 2,
      title: 'Dinner, Interrupted',
      cn: '饭桌上的谈判',
      emoji: '🍽',
      level: 'B1',
      minutes: 4,
      hook: '饭吃到一半，妈妈把你的排班表放在桌上，用筷子压住，说“我们聊聊”。',
      callbacks: {
        rehearse: '比赛你拿了第三。回家路上你一直想着后台那几分钟，连妈妈叫你都没听见。',
        quiet: '比赛没进前三。你在高铁上把稿子读了最后一遍，然后把手机扣在腿上。'
      },
      cast: [{ name: 'Mom', avatar: '👩', role: '已经看过你的排班表' }, { name: 'Dad', avatar: '👨', role: '负责说“我们不是那个意思”' }],
      acts: [
        {
          id: 's8-a1',
          title: 'Act 1 · 那张纸',
          beats: [
            {
              id: 's8-a1-b1',
              speaker: 'Mom',
              avatar: '👩',
              line: 'Your shifts are getting in the way of your homework.',
              lineCn: '你打工已经影响作业了。',
              situation: '她把排班表转过来对着你，上面用红笔圈了三个周六。',
              intent: '说作业都是做完才去上班的',
              chips: ['I', 'finish', 'my', 'homework', 'before', 'every', 'shift', 'first', 'do', 'all', 'then', 'yes'],
              solutions: [
                { text: 'I finish my homework before every shift.', level: 'native', note: '“before every shift” 比 “always” 具体，可信度更高。' },
                { text: 'I do my homework before every shift.', level: 'ok', note: 'do homework 也完全正确，只是 finish 更强调“做完”。' }
              ],
              tip: '被质疑时先给事实，不要先给情绪。'
            },
            {
              id: 's8-a1-b2',
              speaker: 'Mom',
              avatar: '👩',
              line: "That's what you say. I want to see it.",
              lineCn: '你就这么说。我要看到。',
              situation: '她把手机推到一边，等你拿出点东西。',
              intent: '说可以给她看你的计划表',
              chips: ['I', 'can', 'show', 'you', 'my', 'schedule', 'if', 'you', 'want', 'yes', 'let', 'see'],
              solutions: [
                { text: 'I can show you my schedule, if you want.', level: 'native', note: '“if you want” 放句尾，把选择权交给对方。' }
              ],
              tip: '“show you my schedule” 比 “believe me” 有效得多。'
            },
            {
              id: 's8-a1-b3',
              speaker: 'Dad',
              avatar: '👨',
              line: "We're not saying quit. We're saying slow down.",
              lineCn: '我们不是让你别干了。是让你慢一点。',
              situation: '他放下筷子，语气比妈妈软，但更认真。',
              intent: '问“慢一点”具体是什么样',
              chips: ['What', 'does', 'slow', 'down', 'actually', 'look', 'like', 'mean', 'is', 'how'],
              solutions: [
                { text: "What does 'slow down' actually look like?", level: 'native', note: '把对方的词原样引回来再追问，是很成熟的沟通方式。' }
              ],
              tip: '“What does that look like?” 能把抽象要求变成可执行的事。'
            }
          ]
        },
        {
          id: 's8-a2',
          title: 'Act 2 · 算一笔账',
          beats: [
            {
              id: 's8-a2-b1',
              speaker: 'Mom',
              avatar: '👩',
              line: "One weekend a month. That's it.",
              lineCn: '一个月一个周末。就这样。',
              situation: '她说得像已经定了，但手指还在桌面上敲。',
              intent: '说太少，问能不能隔周一次',
              chips: ['Could', 'we', 'do', 'every', 'other', 'weekend', 'instead', 'two', 'weeks', 'one', 'no'],
              solutions: [
                { text: 'Could we do every other weekend instead?', level: 'native', note: '“every other weekend” = 隔周，极其常用。' },
                { text: 'Could we do every two weeks instead?', level: 'ok', note: 'every two weeks 和 every other weekend 意思一样，前者更直白。' }
              ],
              tip: '谈判用 “Could we… instead?”，比直接说 “No” 更容易谈成。'
            },
            {
              id: 's8-a2-b2',
              speaker: 'Dad',
              avatar: '👨',
              line: 'Why does it matter so much to you?',
              lineCn: '为什么这件事对你这么重要？',
              situation: '他终于问了那个真正的问题。',
              intent: '说想自己付这趟旅行的钱',
              chips: ['I', 'want', 'to', 'pay', 'for', 'my', 'own', 'trip', "It's", 'the', 'first', 'thing', "I've", 'earned', 'need', 'money'],
              solutions: [
                { text: "I want to pay for my own trip. It's the first thing I've earned.", level: 'native', note: '“pay for my own…” 强调独立，比 “I need money” 有分量。' }
              ],
              tip: '“It’s the first thing I’ve earned.” 用完成时，说的是“到现在为止”的成果。'
            },
            {
              id: 's8-a2-b3',
              speaker: 'Mom',
              avatar: '👩',
              line: 'You could just ask us for the money.',
              lineCn: '你直接问我们要钱就行了。',
              situation: '她说这话的时候，其实有点受伤。',
              intent: '说你懂，但不想一直开口',
              chips: ['I', 'know', 'But', 'I', "don't", 'want', 'to', 'keep', 'asking', 'yes', 'money', 'always'],
              solutions: [
                { text: "I know. But I don't want to keep asking.", level: 'native', note: '“keep asking” = 一直开口要，暗示你想独立。' }
              ],
              tip: '拒绝好意时先说 “I know”，再给理由，不会显得不领情。'
            }
          ]
        },
        {
          id: 's8-a3',
          title: 'Act 3 · 成交',
          beats: [
            {
              id: 's8-a3-b1',
              speaker: 'Dad',
              avatar: '👨',
              line: "Grades stay above eighty-five. Then we'll talk.",
              lineCn: '成绩保持在八十五以上，再谈。',
              situation: '他拿起筷子，像是准备结束这个话题。',
              intent: '答应，并问期中考后能不能重新谈',
              chips: ['Deal', 'Can', 'we', 'revisit', 'this', 'after', 'midterms', 'yes', 'okay', 'talk', 'again'],
              solutions: [
                { text: 'Deal. Can we revisit this after midterms?', level: 'native', note: '“revisit” = 回头再谈，比 “talk again” 更正式，适合谈条件。' },
                { text: 'Deal. Can we talk again after midterms?', level: 'ok', note: 'talk again 更口语，意思一样。' }
              ],
              tip: '把条件绑到时间点（after midterms），比“以后再说”可信。'
            },
            {
              id: 's8-a3-b2',
              speaker: 'Mom',
              avatar: '👩',
              line: "You're growing up too fast.",
              lineCn: '你长太快了。',
              situation: '她说完自己先笑了，眼睛有点红。',
              intent: '说你也这么觉得，但这是好事',
              chips: ['I', 'think', "that's", 'kind', 'of', 'the', 'point', 'yes', 'no', 'maybe', 'good'],
              solutions: [
                { text: "I think that's kind of the point.", level: 'native', note: '“that’s kind of the point” = 这不就是重点吗，温和的反驳。' }
              ],
              tip: '“kind of” 用来软化语气，避免顶嘴感。'
            },
            {
              id: 's8-a3-b3',
              speaker: 'Dad',
              avatar: '👨',
              line: 'Fine. But text us when you are on shift.',
              lineCn: '行。但你上班的时候给我们发个消息。',
              situation: '他把排班表折好，推回给你。',
              intent: '答应，每次都会',
              chips: ['I', 'will', 'Every', 'time', 'Promise', 'yes', 'text', 'always', 'sure'],
              solutions: [
                { text: 'I will. Every time. Promise.', level: 'native', note: '三个短句连用，比长句更有承诺感。' },
                { text: 'Yes. Every time. Promise.', level: 'ok', note: '少一个 I will，语气更短促，像在点头。' }
              ],
              tip: '答应父母时，短句 + Promise 比 “I promise I will definitely…” 自然。'
            }
          ]
        }
      ],
      choice: {
        prompt: '第二天，Nadia 问你要不要接周五晚上的班，那天正好是家庭聚餐。',
        options: [
          { id: 'take', label: '接，钱和排班都重要', reply: '“周五我可以。”', outcome: '你接了班，错过了那顿饭。回家时桌上留着一份打包的菜和一张便条：“We saved you some.”' },
          { id: 'family', label: '不接，那顿饭更重要', reply: '“周五我有事。”', outcome: '你推掉了班。饭桌上妈妈多问了你两句比赛的事，你发现她其实一直在听。' }
        ]
      },
      personaClose: {
        warm: '妈妈后来跟亲戚说：“他现在会自己算账了。”',
        snark: '爸爸说：“这小子跟我谈条件，还挺有条理。”',
        chaos: '妈妈说：“他把排班表做成了表格，我都不好意思反对。”'
      }
    },

    /* ============================ 9 ============================ */
    {
      id: 'maya-irl',
      season: 2,
      title: '@maya_irl',
      cn: '第一次和真人说英语',
      emoji: '🌍',
      level: 'B1–B2',
      minutes: 4,
      hook: '一个学语言的语音房里，你认识了一个同龄人。她刚发来一句：wanna hop on a call?',
      callbacks: {
        take: '周五的班结束得很晚，你回到家，桌上的菜还温着。手机在口袋里震了一下。',
        family: '那顿饭吃完，你回房间，手机在震。你第一次没有立刻假装没看见。'
      },
      cast: [{ name: 'Maya', avatar: '🌍', role: '加拿大 / 同龄 / 说话很快' }],
      acts: [
        {
          id: 's9-a1',
          title: 'Act 1 · 私聊',
          beats: [
            {
              id: 's9-a1-b1',
              speaker: 'Maya',
              avatar: '🌍',
              line: 'wanna hop on a call?',
              lineCn: '要不要语音聊会儿？',
              situation: '你盯着这句话看了十秒，输入框删了三次。',
              intent: '说可以，但你从没这样跟真人说过英语',
              chips: ['Sure', 'but', "I've", 'never', 'actually', 'talked', 'to', 'anyone', 'like', 'this', 'before', 'yes', 'nervous'],
              solutions: [
                { text: "Sure, but I've never actually talked to anyone like this before.", level: 'native', note: '“talked to anyone like this” 比 “speak English with foreigner” 自然太多。' },
                { text: "Sure, but I've never talked to anyone like this before.", level: 'ok', note: '去掉 actually 更平，没那么强调“真的没有”。' }
              ],
              tip: '别用 “foreigner” 指对方，用 “someone from…” 或直接叫名字。'
            },
            {
              id: 's9-a1-b2',
              speaker: 'Maya',
              avatar: '🌍',
              line: "lol same. my first call I said 'thank you' like ten times",
              lineCn: '哈哈我也是。第一次通话我大概说了十遍谢谢。',
              situation: '她发来一个笑哭的表情，你松了口气。',
              intent: '笑，说你可能会更糟',
              chips: ['Honestly', "I'll", 'probably', 'be', 'worse', 'same', 'maybe', 'no', 'funny', 'thank'],
              solutions: [
                { text: "Honestly, I'll probably be worse.", level: 'native', note: '“probably be worse” 自嘲，比 “I think I am bad” 轻松。' },
                { text: "Honestly, maybe I'll be worse.", level: 'ok', note: '加个 maybe 会更松，像在开玩笑。' }
              ],
              tip: '自嘲时加 “probably”，给自己留一点余地。'
            },
            {
              id: 's9-a1-b3',
              speaker: 'Maya',
              avatar: '🌍',
              line: 'ok calling in 2',
              lineCn: '好，两分钟后打过来。',
              situation: '你从椅子上弹起来，耳机不知道放哪了。',
              intent: '说等一下，要先找耳机',
              chips: ['Give', 'me', 'a', 'second', 'I', 'need', 'to', 'find', 'my', 'headphones', 'wait', 'two', 'minute'],
              solutions: [
                { text: 'Give me a second. I need to find my headphones.', level: 'native', note: '“Give me a second” 是“等一下”最自然的说法。' }
              ],
              tip: '不要说 “wait a moment please”，那是客服语气。'
            }
          ]
        },
        {
          id: 's9-a2',
          title: 'Act 2 · 通话',
          beats: [
            {
              id: 's9-a2-b1',
              speaker: 'Maya',
              avatar: '🌍',
              line: 'Okay so what do people actually do in China after school?',
              lineCn: '好吧，你们放学后到底都干嘛？',
              situation: '她问得很直接，你脑子里先冒出“补习班”三个字。',
              intent: '说大部分人去补习班，但聊这个有点无聊',
              chips: ['Most', 'people', 'go', 'to', 'cram', 'school', 'but', "that's", 'kind', 'of', 'boring', 'to', 'talk', 'about', 'yes'],
              solutions: [
                { text: "Most people go to cram school, but that's kind of boring to talk about.", level: 'native', note: '“cram school” 就是补习班，英语里本来就有这个词。' }
              ],
              tip: '回答完别停住，加一句“但说实话…”，对话才接得下去。'
            },
            {
              id: 's9-a2-b2',
              speaker: 'Maya',
              avatar: '🌍',
              line: 'wait you have school on saturday??',
              lineCn: '等等，你们周六还上课？？',
              situation: '她声音一下高了，背景里有人在笑。',
              intent: '说是，一个月两次，并问她那边',
              chips: ['Yeah', 'twice', 'a', 'month', 'What', 'about', 'you', 'really', 'no', 'weekend', 'school'],
              solutions: [
                { text: 'Yeah, twice a month. What about you?', level: 'native', note: '“What about you?” 是对话回球的标准句。' },
                { text: 'Yeah, twice a month. You?', level: 'ok', note: '口语里直接一个 “You?” 就能把问题递回去，比完整句更松弛。' }
              ],
              tip: '每次回答后把球抛回去，聊天就不会断。'
            },
            {
              id: 's9-a2-b3',
              speaker: 'Maya',
              avatar: '🌍',
              line: "we just have clubs. honestly kinda jealous",
              lineCn: '我们只有社团。说实话有点羡慕。',
              situation: '她说完叹了口气，很夸张。',
              intent: '说别羡慕，其实很累',
              chips: ["Don't", 'be', "It's", 'exhausting', 'actually', 'no', 'really', 'jealous', 'tired'],
              solutions: [
                { text: "Don't be. It's exhausting, actually.", level: 'native', note: '“Don’t be.” 两个词就能接住“羡慕”。' },
                { text: "Don't be. It's really exhausting.", level: 'ok', note: 'really exhausting 也很自然，语气比 actually 更直接。' }
              ],
              tip: '“actually” 放句尾，是口语里的补充，很自然。'
            }
          ]
        },
        {
          id: 's9-a3',
          title: 'Act 3 · 认真一点',
          beats: [
            {
              id: 's9-a3-b1',
              speaker: 'Maya',
              avatar: '🌍',
              line: 'Can I ask something kinda personal?',
              lineCn: '我能问个有点私人的问题吗？',
              situation: '她的语气变了，背景噪音也小了。',
              intent: '说可以，但你可能不回答',
              chips: ['Sure', 'but', 'I', 'might', 'not', 'answer', 'it', 'yes', 'no', 'ask', 'anything'],
              solutions: [
                { text: 'Sure, but I might not answer it.', level: 'native', note: '“might not answer” 提前设边界，很成熟。' }
              ],
              tip: '设边界不用道歉，直接说 “I might not answer that.”'
            },
            {
              id: 's9-a3-b2',
              speaker: 'Maya',
              avatar: '🌍',
              line: "Do you ever feel like you're behind everyone?",
              lineCn: '你会不会觉得自己落后于所有人？',
              situation: '问题落地，你听见自己的呼吸。',
              intent: '说经常，尤其是说英语的时候',
              chips: ['All', 'the', 'time', 'Especially', 'when', 'I', 'speak', 'English', 'yes', 'never', 'sometimes', 'too'],
              solutions: [
                { text: 'All the time. Especially when I speak English.', level: 'native', note: '“All the time.” 比 “Very often” 更像真人。' }
              ],
              tip: '“especially when…” 让回答更具体，也给对方接话的空间。'
            },
            {
              id: 's9-a3-b3',
              speaker: 'Maya',
              avatar: '🌍',
              line: 'Same. But your English is honestly good.',
              lineCn: '我也是。不过说真的，你英语挺好的。',
              situation: '她说完很快就补了一句，像怕你不信。',
              intent: '道谢，也说她的不错',
              chips: ['Thanks', 'Yours', 'is', 'too', 'honestly', 'no', 'yes', 'really', 'better'],
              solutions: [
                { text: 'Thanks. Yours is too, honestly.', level: 'native', note: '“Yours is too” 是最短的互夸，自然不油腻。' }
              ],
              tip: '被夸时先谢谢，再回一句，别急着否认。'
            }
          ]
        }
      ],
      choice: {
        prompt: '挂断前，Maya 问要不要每周固定聊一次。',
        options: [
          { id: 'weekly', label: '约每周日晚上', reply: '“每周日，怎么样？”', outcome: '你们约了每周日晚上。挂断后你才发现，你刚才一句中文都没说。' },
          { id: 'adhoc', label: '说随缘，有空就聊', reply: '“有空就聊吧。”', outcome: '你说 “maybe whenever”。她回 “fair.” 后来你们真的又聊了很多次，只是没有约定。' }
        ]
      },
      personaClose: {
        warm: 'Maya 后来跟朋友说：“my Chinese friend is way funnier than me.”',
        snark: 'Maya 说：“he roasts me in English and I respect it.”',
        chaos: 'Maya 说：“he sent me a voice note of him yelling at his cat.”'
      }
    },

    /* ============================ 10 ============================ */
    {
      id: 'last-day',
      season: 2,
      title: 'Last Day',
      cn: '最后一天',
      emoji: '🌅',
      level: 'B1–B2',
      minutes: 4,
      hook: '期末最后一天，Mia 的桌子空了。她在群里发：don’t make it weird.',
      callbacks: {
        weekly: '每周日的语音房成了你的固定节目。今天是最后一次，你说下周要考试，她说明白。',
        adhoc: '你们没约固定时间，但几乎每周都会聊上几句。她昨晚发来一句 “guess what”。'
      },
      cast: [{ name: 'Mia', avatar: '😼', role: '要转学去另一个城市' }, { name: 'Leo', avatar: '🧢', role: '拒绝把告别搞得像葬礼' }],
      acts: [
        {
          id: 's10-a1',
          title: 'Act 1 · 空桌子',
          beats: [
            {
              id: 's10-a1-b1',
              speaker: 'Mia',
              avatar: '😼',
              line: "So. I'm moving. My dad's job.",
              lineCn: '嗯。我要搬走了。我爸的工作。',
              situation: '她一条一条发，中间隔了很久，像在等你先说话。',
              intent: '说听说了，问什么时候走',
              chips: ['I', 'heard', 'When', 'do', 'you', 'actually', 'leave', 'move', 'go', 'yes', 'already'],
              solutions: [
                { text: 'I heard. When do you actually leave?', level: 'native', note: '“actually” 在这里有“到底”的意味，比 “When do you leave” 更贴近情绪。' },
                { text: 'I heard. When do you leave?', level: 'ok', note: '去掉 actually 更轻，不会显得在追问。' }
              ],
              tip: '听到坏消息时先确认事实，不要立刻说 “I’m sorry”。'
            },
            {
              id: 's10-a1-b2',
              speaker: 'Mia',
              avatar: '😼',
              line: "Sunday. Don't make it weird.",
              lineCn: '周日。别搞得那么奇怪。',
              situation: '她发完这条，补了一个翻白眼的表情。',
              intent: '说太晚了，已经怪了',
              chips: ['Too', 'late', "It's", 'already', 'weird', 'no', 'yes', 'sorry', 'fine'],
              solutions: [
                { text: "Too late. It's already weird.", level: 'native', note: '“Too late.” 两个词就能接住玩笑，很自然。' }
              ],
              tip: '用玩笑回应玩笑，比“我会想你”更能缓解尴尬。'
            },
            {
              id: 's10-a1-b3',
              speaker: 'Mia',
              avatar: '😼',
              line: 'Fair. I cried in the bathroom twice today.',
              lineCn: '行吧。我今天在洗手间哭了两次。',
              situation: '这条她撤回了两次，最后还是发了出来。',
              intent: '说这不奇怪，你也会',
              chips: ["That's", 'not', 'weird', "I'd", 'do', 'the', 'same', 'yes', 'no', 'cry', 'too'],
              solutions: [
                { text: "That's not weird. I'd do the same.", level: 'native', note: '“I’d do the same” 是最有效的共情句之一。' }
              ],
              tip: '共情别说 “I understand your feeling”，说 “I’d do the same.”'
            }
          ]
        },
        {
          id: 's10-a2',
          title: 'Act 2 · 最后一顿午饭',
          beats: [
            {
              id: 's10-a2-b1',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'So this is the last table lunch.',
              lineCn: '所以这是最后一顿桌子午饭了。',
              situation: '他把餐盘放下，声音比平时低。',
              intent: '说别说得像葬礼',
              chips: ["Don't", 'say', 'it', 'like', 'that', "It's", 'not', 'a', 'funeral', 'no', 'please', 'sad', 'last'],
              solutions: [
                { text: "Don't say it like that. It's not a funeral.", level: 'native', note: '“say it like that” = 这么说话，语气很自然。' },
                { text: "Please don't say it like that.", level: 'ok', note: '加 please 更像在求饶，笑点还在。' }
              ],
              tip: '用夸张比喻（funeral）打断悲伤气氛，是朋友间的默契。'
            },
            {
              id: 's10-a2-b2',
              speaker: 'Leo',
              avatar: '🧢',
              line: "Fine. But I'm keeping your seat empty for a month.",
              lineCn: '行。但你的位子我要空一个月。',
              situation: '他说得很认真，Mia 在旁边笑出声。',
              intent: '说一个月太长，两周就行',
              chips: ['Two', 'weeks', 'max', 'A', 'month', 'is', 'too', 'long', 'no', 'yes', 'okay', 'sad'],
              solutions: [
                { text: 'Two weeks, max. A month is too long.', level: 'native', note: '“max” 放句尾 = 最多，非常口语。' }
              ],
              tip: '讨价还价式的告别，比煽情更像真朋友。'
            },
            {
              id: 's10-a2-b3',
              speaker: 'Mia',
              avatar: '😼',
              line: 'You two are the worst.',
              lineCn: '你俩真是够了。',
              situation: '她嘴上嫌弃，已经把最后一块肉夹到你碗里。',
              intent: '说我们知道，所以我们才合得来',
              chips: ['We', 'know', "That's", 'why', 'we', 'get', 'along', 'yes', 'no', 'best', 'worst'],
              solutions: [
                { text: "We know. That's why we get along.", level: 'native', note: '“get along” = 相处得来。' }
              ],
              tip: '“That’s why…” 用来把玩笑收成一句真话。'
            }
          ]
        },
        {
          id: 's10-a3',
          title: 'Act 3 · 群里',
          beats: [
            {
              id: 's10-a3-b1',
              speaker: 'Mia',
              avatar: '😼',
              line: 'Are you staying in the group?',
              lineCn: '你还留在这个群里吗？',
              situation: '她问得很随意，但发完就没再打字。',
              intent: '说当然，还会继续发你的歌',
              chips: ['Obviously', "I'm", 'still', 'sending', 'you', 'tracks', 'yes', 'no', 'stay', 'maybe', 'music'],
              solutions: [
                { text: "Obviously. I'm still sending you tracks.", level: 'native', note: '“Obviously.” 一个词表示“当然”，带点耍帅。' },
                { text: "Obviously. I'm still sending you music.", level: 'ok', note: 'music 比 tracks 更宽泛，但完全能懂。' }
              ],
              tip: '“still + 动名词” 表示继续做某事。'
            },
            {
              id: 's10-a3-b2',
              speaker: 'Mia',
              avatar: '😼',
              line: 'Even the bad ones?',
              lineCn: '烂的也发？',
              situation: '她发了一个“你敢”的表情。',
              intent: '说尤其是烂的那些',
              chips: ['Especially', 'the', 'bad', 'ones', 'no', 'yes', 'worse', 'all', 'send'],
              solutions: [
                { text: 'Especially the bad ones.', level: 'native', note: '用 “ones” 代替重复名词，避免再说一遍 tracks。' }
              ],
              tip: '“the + 形容词 + ones” 是英语里很常用的一类指代。'
            },
            {
              id: 's10-a3-b3',
              speaker: 'Mia',
              avatar: '😼',
              line: "Okay. Don't disappear.",
              lineCn: '好。别消失。',
              situation: '这条她没加表情，也没加句号。',
              intent: '说不会，向她保证',
              chips: ['I', "won't", 'you', 'have', 'my', 'word', 'yes', 'promise', 'never', 'sure', 'gone'],
              solutions: [
                { text: "I won't. You have my word.", level: 'native', note: '“You have my word.” = 我向你保证，比 “I promise” 更有分量。' },
                { text: "I won't. Promise.", level: 'ok', note: '一个 Promise 就够，比整句誓言更像朋友。' }
              ],
              tip: '对重要的人，用 “You have my word.”，不要用 “I promise” 堆句子。'
            }
          ]
        }
      ],
      choice: {
        prompt: '走之前，Mia 问要不要在食堂那张桌子前拍一张四个人的合照。',
        options: [
          { id: 'photo', label: '拍，留一张', reply: '“拍吧。”', outcome: '你们挤在那张桌子前拍了一张。照片里没人看镜头，但每个人都在笑。' },
          { id: 'hug', label: '不拍，抱一下就好', reply: '“不拍了。”', outcome: '你们谁都没提拍照。Mia 抱了你一下，说 “okay, now it’s weird”，然后笑着走了。' }
        ]
      },
      personaClose: {
        warm: 'Mia 走之前在群里说：“记得吃饭。”',
        snark: 'Mia 说：“这个群以后靠你嘴硬撑着了。”',
        chaos: 'Mia 说：“我走后没人给你们讲冷笑话了，你们会想我的。”'
      }
    }
  ];
});
