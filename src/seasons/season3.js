/* ALTER 内容库 · 第 3 季（第 11–15 集）
 * 难度到 B2：更抽象的话题、更长的句子、需要自己组织信息；分支承接更明显。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ALTER_SEASON3 = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return [
    /* ============================ 11 ============================ */
    {
      id: 'interview-room',
      season: 3,
      title: 'The Interview Room',
      cn: '那间没有窗的屋子',
      emoji: '🪑',
      level: 'B1–B2',
      minutes: 4,
      hook: '一间没有窗的屋子，三个人，一杯水。你的作品集摊在桌上，最上面那页是打印歪的。',
      callbacks: {
        photo: '毕业照在群里被翻来覆去看了好几天。有人把你在食堂那张桌子前的样子设成了群头像。',
        hug: '那天谁都没拍照。你只记得 Mia 抱了你一下，说 “okay, now it’s weird”，然后笑着走了。'
      },
      cast: [{ name: 'Dr. Avery', avatar: '👔', role: '面试官 / 全程不笑' }],
      acts: [
        {
          id: 's11-a1',
          title: 'Act 1 · 第一个问题',
          beats: [
            {
              id: 's11-a1-b1',
              speaker: 'Dr. Avery',
              avatar: '👔',
              line: "Tell us about something you made that didn't work.",
              lineCn: '讲一个你做过的、但没成的东西。',
              situation: '她翻开你的材料，停在第二页，没有抬头。',
              intent: '说你的第一个播客，没人听',
              chips: ['My', 'first', 'podcast', 'Nobody', 'listened', 'to', 'it', 'failed', 'made', 'work', 'no', 'bad'],
              solutions: [
                { text: 'My first podcast. Nobody listened to it.', level: 'native', note: '面试答题先给具体例子，再解释，比先讲道理有说服力。' },
                { text: 'My first podcast. It failed.', level: 'ok', note: '直接说 failed 更狠，也更有自嘲的效果。' }
              ],
              tip: '被问失败时别绕，直接给一个具体作品。'
            },
            {
              id: 's11-a1-b2',
              speaker: 'Dr. Avery',
              avatar: '👔',
              line: "Why didn't it work?",
              lineCn: '为什么没成？',
              situation: '她终于抬头，笔停在纸上。',
              intent: '说因为你在模仿别人，而不是说自己想说的',
              chips: ['I', 'was', 'copying', 'someone', 'else', 'instead', 'of', 'saying', 'what', 'I', 'wanted', 'because', 'no'],
              solutions: [
                { text: 'I was copying someone else instead of saying what I wanted.', level: 'native', note: '“instead of + 动名词” 是解释取舍的高分结构。' },
                { text: 'I was saying what someone else wanted.', level: 'ok', note: '换个说法也能懂，但少了 “instead of” 那层对比。' }
              ],
              tip: '“instead of” 用来对比两种做法，比 “but” 更精确。'
            },
            {
              id: 's11-a1-b3',
              speaker: 'Dr. Avery',
              avatar: '👔',
              line: 'And the second one?',
              lineCn: '第二个呢？',
              situation: '她翻到下一页，那页贴着一张截图，播放量是 12。',
              intent: '说第二个只有十二个人听，但他们真的在听',
              chips: ['Twelve', 'people', 'listened', 'But', 'they', 'actually', 'listened', 'no', 'yes', 'only', 'more'],
              solutions: [
                { text: 'Twelve people listened. But they actually listened.', level: 'native', note: '重复同一个词制造对比，是英语里很有力的修辞。' }
              ],
              tip: '想说“少但真”，就用重复对比：few… but real。'
            }
          ]
        },
        {
          id: 's11-a2',
          title: 'Act 2 · 假设',
          beats: [
            {
              id: 's11-a2-b1',
              speaker: 'Dr. Avery',
              avatar: '👔',
              line: 'What would you do with the scholarship?',
              lineCn: '如果拿到奖学金，你会做什么？',
              situation: '这个问题像在测你会不会说空话。',
              intent: '说想做一个给小镇学生用的英语节目',
              chips: ["I'd", 'build', 'an', 'English', 'show', 'for', 'students', 'in', 'small', 'towns', 'no', 'want', 'make'],
              solutions: [
                { text: "I'd build an English show for students in small towns.", level: 'native', note: '“I’d + 动词” 表假设计划，面试里比 “I will” 更稳。' },
                { text: "I'd make an English show for students in small towns.", level: 'ok', note: 'make 和 build 在这里几乎一样，build 更有“从零搭起来”的感觉。' }
              ],
              tip: '回答“你会做什么”时给对象（for students in small towns），具体才可信。'
            },
            {
              id: 's11-a2-b2',
              speaker: 'Dr. Avery',
              avatar: '👔',
              line: "That's ambitious.",
              lineCn: '这挺宏大。',
              situation: '她说完看了另外两位面试官一眼。',
              intent: '说可以先小规模开始，十个人就够',
              chips: ['It', 'can', 'start', 'small', 'Ten', 'people', 'is', 'enough', 'no', 'yes', 'big', 'only'],
              solutions: [
                { text: 'It can start small. Ten people is enough.', level: 'native', note: '“start small” 是固定说法，发音也顺。' }
              ],
              tip: '被说“太宏大”时，给一个最小可执行版本。'
            },
            {
              id: 's11-a2-b3',
              speaker: 'Dr. Avery',
              avatar: '👔',
              line: 'What if nobody watches?',
              lineCn: '如果没人看呢？',
              situation: '她把笔放下，等你。',
              intent: '说那就做给那十个人，并问他们为什么',
              chips: ['Then', "I'd", 'make', 'it', 'for', 'those', 'ten', 'and', 'ask', 'them', 'why', 'no'],
              solutions: [
                { text: "Then I'd make it for those ten, and ask them why.", level: 'native', note: '“those ten” 指代前面提过的十个人，很自然。' }
              ],
              tip: '假设问题用 “Then I’d…”，比 “I think” 更利落。'
            }
          ]
        },
        {
          id: 's11-a3',
          title: 'Act 3 · 最后一问',
          beats: [
            {
              id: 's11-a3-b1',
              speaker: 'Dr. Avery',
              avatar: '👔',
              line: "One thing you'd change about your school?",
              lineCn: '如果只能改学校的一件事，你改什么？',
              situation: '她合上材料，第一次整个人转向你。',
              intent: '说想留一个可以说真话的地方',
              chips: ["I'd", 'make', 'one', 'room', 'where', 'people', 'can', 'be', 'honest', 'no', 'want', 'change'],
              solutions: [
                { text: "I'd make one room where people can be honest.", level: 'native', note: '“where people can be honest” 是定语从句，比 “for honest talking” 自然。' }
              ],
              tip: '提建议用 “I’d make…”，比 “The school should…” 柔和。'
            },
            {
              id: 's11-a3-b2',
              speaker: 'Dr. Avery',
              avatar: '👔',
              line: 'Honest about what?',
              lineCn: '对什么说实话？',
              situation: '她没有笑，但语气软了一点。',
              intent: '说关于成绩、家里、害怕的事',
              chips: ['Grades', 'family', 'being', 'scared', 'the', 'stuff', 'nobody', 'says', 'out', 'loud', 'no', 'about'],
              solutions: [
                { text: 'Grades, family, being scared — the stuff nobody says out loud.', level: 'native', note: '“the stuff nobody says out loud” 是很地道的抽象表达。' }
              ],
              tip: '列举后用破折号收一句总结，口语里也常用。'
            },
            {
              id: 's11-a3-b3',
              speaker: 'Dr. Avery',
              avatar: '👔',
              line: "Thank you. We'll be in touch.",
              lineCn: '谢谢。我们会联系你。',
              situation: '三个人同时合上了材料，椅子往后响了一声。',
              intent: '谢谢他们的时间',
              chips: ['Thank', 'you', 'for', 'your', 'time', 'no', 'thanks', 'appreciate', 'it', 'see', 'later'],
              solutions: [
                { text: 'Thank you for your time.', level: 'native', note: '面试结束的标准句，简单就好，不要加 “I hope I can pass”。' },
                { text: 'Thanks for your time.', level: 'ok', note: 'Thanks 更短更口语，面试结尾完全可以用。' }
              ],
              tip: '结束时别求结果，一句 “Thank you for your time.” 最得体。'
            }
          ]
        }
      ],
      choice: {
        prompt: '出门后，你在走廊遇到下一个面试的人。她小声问你：“难吗？”',
        options: [
          { id: 'honest', label: '说实话：挺难的', reply: '“有点难。”', outcome: '你说 “Yeah, kind of.” 她笑了：“Great.” 你也笑了，突然没那么怕结果了。' },
          { id: 'reassure', label: '说还行，让她别紧张', reply: '“还行。”', outcome: '你说 “It’s fine.” 她松了口气。走出教学楼，你才发现自己手心全是汗。' }
        ]
      },
      personaClose: {
        warm: 'Dr. Avery 在评语里写：“he listens more than he talks.”',
        snark: 'Dr. Avery 写：“disagrees politely. Rare.”',
        chaos: 'Dr. Avery 写：“made the panel laugh twice. On purpose?”'
      }
    },

    /* ============================ 12 ============================ */
    {
      id: 'lost-in-transit',
      season: 3,
      title: 'Lost in Transit',
      cn: '转机夜',
      emoji: '🧳',
      level: 'B1–B2',
      minutes: 4,
      hook: '转机机场，广播说你的航班取消了，下一班在明天早上。行李已经托运走了。',
      callbacks: {
        honest: '面试完你说“有点难”。三周过去，通知还没来。你买了张票，决定自己去那座城市看看。',
        reassure: '面试完你说“还好”。三周过去，通知还没来。你买了张票，决定自己去那座城市看看。'
      },
      cast: [{ name: 'Denise', avatar: '🧳', role: '地勤 / 已经连续值班十小时' }],
      acts: [
        {
          id: 's12-a1',
          title: 'Act 1 · 航班牌',
          beats: [
            {
              id: 's12-a1-b1',
              speaker: 'Denise',
              avatar: '🧳',
              line: "That flight's cancelled. Weather.",
              lineCn: '那班取消了。天气原因。',
              situation: '她一边说一边敲键盘，语速快得像在念稿。',
              intent: '问最早能走的下一班',
              chips: ["What's", 'the', 'earliest', 'flight', 'you', 'have', 'tomorrow', 'can', 'get', 'next', 'morning'],
              solutions: [
                { text: "What's the earliest flight you have tomorrow?", level: 'native', note: '“the earliest … you have” 省略了 that，口语常这样。' },
                { text: "What's the next flight tomorrow morning?", level: 'ok', note: '问 next 也能拿到时间，earliest 更精确。' }
              ],
              tip: '柜台交涉先问“最早能走哪班”，别先抱怨。'
            },
            {
              id: 's12-a1-b2',
              speaker: 'Denise',
              avatar: '🧳',
              line: "Six forty. But it's full.",
              lineCn: '六点四十。但满员了。',
              situation: '她终于看了你一眼，手指还停在键盘上。',
              intent: '问能不能进候补，或者飞别的城市',
              chips: ['Can', 'I', 'get', 'on', 'the', 'waitlist', 'or', 'fly', 'into', 'another', 'city', 'maybe', 'no'],
              solutions: [
                { text: 'Can I get on the waitlist, or fly into another city?', level: 'native', note: '“get on the waitlist” = 进候补名单，机场高频。' }
              ],
              tip: '给对方两个选项（or），比只问一个问题更容易被解决。'
            },
            {
              id: 's12-a1-b3',
              speaker: 'Denise',
              avatar: '🧳',
              line: "There's one to Manchester. Two hours by train from here.",
              lineCn: '有一班去曼彻斯特。从这儿坐火车两小时。',
              situation: '她把行程单打印出来，用笔圈了一下。',
              intent: '说那就这班，问行李怎么办',
              chips: ["I'll", 'take', 'that', 'one', 'What', 'about', 'my', 'bag', 'luggage', 'no', 'yes'],
              solutions: [
                { text: "I'll take that one. What about my bag?", level: 'native', note: '“What about my bag?” 是省略句，追问最自然。' },
                { text: "I'll take that one. What about my luggage?", level: 'ok', note: 'luggage 和 bag 都能用，luggage 更正式。' }
              ],
              tip: '改签时一定问清行李是否直挂：“Will my bag go straight through?”'
            }
          ]
        },
        {
          id: 's12-a2',
          title: 'Act 2 · 柜台',
          beats: [
            {
              id: 's12-a2-b1',
              speaker: 'Denise',
              avatar: '🧳',
              line: 'Your bag will follow you. Probably.',
              lineCn: '你的行李会跟着你。大概。',
              situation: '她说 “probably” 的时候，自己都叹了口气。',
              intent: '说 “大概” 不够，问丢了怎么办',
              chips: ['Probably', "isn't", 'good', 'enough', 'What', 'if', 'it', "doesn't", 'arrive', 'no', 'yes', 'maybe'],
              solutions: [
                { text: "Probably isn't good enough. What if it doesn't arrive?", level: 'native', note: '抓住对方含糊的词（probably）再否定，很有力。' }
              ],
              tip: '交涉时抓住对方含糊的词（probably / should），要求明确。'
            },
            {
              id: 's12-a2-b2',
              speaker: 'Denise',
              avatar: '🧳',
              line: 'Then you file a claim. Keep your receipt.',
              lineCn: '那你申请理赔，保留好票据。',
              situation: '她从抽屉里抽出一张表格推过来。',
              intent: '问大概能赔多少',
              chips: ['How', 'much', 'would', 'I', 'get', 'back', 'for', 'that', 'claim', 'pay', 'money', 'no'],
              solutions: [
                { text: 'How much would I get back for that?', level: 'native', note: '“get back” = 拿回来（钱），比 “compensate” 口语。' }
              ],
              tip: '问赔偿用 “get back”，问流程用 “file a claim”。'
            },
            {
              id: 's12-a2-b3',
              speaker: 'Denise',
              avatar: '🧳',
              line: 'Depends. Up to about fifty.',
              lineCn: '看情况。最多五十左右。',
              situation: '她说这个数字时，明显也知道不够。',
              intent: '说不够，里面有不能替代的东西',
              chips: ['That', "won't", 'cover', 'it', "There's", 'something', 'in', 'there', 'I', "can't", 'replace', 'no', 'yes', 'money'],
              solutions: [
                { text: "That won't cover it. There's something in there I can't replace.", level: 'native', note: '“cover it” = 够赔，日常和商务都用。' },
                { text: "That won't cover it. There's something I can't replace.", level: 'ok', note: '省掉 in there 也成立，重点在“换不回来”。' }
              ],
              tip: '说“赔不起”用 “won’t cover it”，比 “not enough money” 专业。'
            }
          ]
        },
        {
          id: 's12-a3',
          title: 'Act 3 · 登机口',
          beats: [
            {
              id: 's12-a3-b1',
              speaker: 'Denise',
              avatar: '🧳',
              line: "I've flagged it. Someone will call you.",
              lineCn: '我标了加急。会有人打给你。',
              situation: '她把你的登机牌递过来，上面用荧光笔划了一道。',
              intent: '道谢，问能不能留号码方便确认',
              chips: ['Thanks', 'Can', 'I', 'leave', 'a', 'number', 'so', 'you', 'can', 'confirm', 'no', 'yes', 'call'],
              solutions: [
                { text: 'Thanks. Can I leave a number so you can confirm?', level: 'native', note: '“so you can confirm” 说明目的，比 “please call me” 有效。' }
              ],
              tip: '留联系方式时说明用途，对方更愿意照做。'
            },
            {
              id: 's12-a3-b2',
              speaker: 'Denise',
              avatar: '🧳',
              line: 'Sure. And sorry about this.',
              lineCn: '可以。抱歉啊。',
              situation: '她揉了揉眼睛，声音比刚才低。',
              intent: '说不是她的错，天气谁也控制不了',
              chips: ['Not', 'your', 'fault', 'Nobody', 'can', 'control', 'the', 'weather', 'no', 'yes', 'sorry', 'blame'],
              solutions: [
                { text: 'Not your fault. Nobody can control the weather.', level: 'native', note: '“Not your fault.” 三个词就能让对方松一口气。' }
              ],
              tip: '对服务人员说这句，往往比投诉更快解决问题。'
            },
            {
              id: 's12-a3-b3',
              speaker: 'Announcement',
              avatar: '📢',
              line: 'Final call for Manchester.',
              lineCn: '飞往曼彻斯特的航班最后广播。',
              situation: '整个候机厅的人同时站了起来。',
              intent: '说该跑了，谢谢帮忙',
              chips: ["That's", 'me', 'Thanks', 'for', 'your', 'help', 'really', 'no', 'go', 'bye', 'run'],
              solutions: [
                { text: "That's me. Thanks for your help.", level: 'native', note: '“That’s me.” = 说的是我 / 到我了，机场、叫号都能用。' }
              ],
              tip: '临走一句 thanks，是让下一次交涉更顺的隐形投资。'
            }
          ]
        }
      ],
      choice: {
        prompt: '到曼彻斯特已经是深夜，姐姐发消息问要不要来接你。',
        options: [
          { id: 'pickup', label: '让她来接', reply: '“来吧，我在出口。”', outcome: '她在出口举着一杯热可可。你说 “I could have taken the train.” 她说 “I know.”' },
          { id: 'myself', label: '自己坐末班车过去', reply: '“不用，我自己过去。”', outcome: '你一个人坐上末班车。车窗外的城市很陌生，但你一点都不慌。' }
        ]
      },
      personaClose: {
        warm: 'Denise 后来跟同事说：“那个学生，全程没吼过一句。”',
        snark: 'Denise 说：“他把我问住了，但很有礼貌。”',
        chaos: 'Denise 说：“他丢了行李还在讲笑话，我都不好意思了。”'
      }
    },

    /* ============================ 13 ============================ */
    {
      id: 'the-argument',
      season: 3,
      title: 'The Argument',
      cn: '志愿表',
      emoji: '📄',
      level: 'B2',
      minutes: 5,
      hook: '志愿表放在桌上，妈妈已经用铅笔圈了三个专业，没有一个是你想选的。',
      callbacks: {
        pickup: '姐姐在出口举着热可可等你。那一刻你才知道，有人接是件多好的事。',
        myself: '你一个人坐上末班车。车窗外的城市很陌生，但你一点都不慌。'
      },
      cast: [{ name: 'Mom', avatar: '👩', role: '圈了三个“安全”的专业' }, { name: 'Dad', avatar: '👨', role: '话少，但每句都算数' }],
      acts: [
        {
          id: 's13-a1',
          title: 'Act 1 · 铅笔圈',
          beats: [
            {
              id: 's13-a1-b1',
              speaker: 'Mom',
              avatar: '👩',
              line: 'We circled the safe ones.',
              lineCn: '我们把稳妥的那几个圈出来了。',
              situation: '她把纸转过来，三个圈整整齐齐，像已经决定了。',
              intent: '问她有没有看你写的那个',
              chips: ['Did', 'you', 'look', 'at', 'the', 'one', 'I', 'wrote', 'down', 'no', 'yes', 'see', 'choose'],
              solutions: [
                { text: 'Did you look at the one I wrote down?', level: 'native', note: '用 “the one” 指代前面提过的东西，避免重复专业名。' },
                { text: 'Did you look at the one I wrote?', level: 'ok', note: '省掉 down 完全没问题，意思不变。' }
              ],
              tip: '指代前面提过的东西用 “the one…”，比重复名词自然。'
            },
            {
              id: 's13-a1-b2',
              speaker: 'Mom',
              avatar: '👩',
              line: "Journalism isn't safe.",
              lineCn: '新闻不稳妥。',
              situation: '她说“稳妥”两个字时，手指在桌上敲了两下。',
              intent: '问“稳妥”到底是什么意思',
              chips: ['What', 'does', 'safe', 'even', 'mean', 'here', 'no', 'yes', 'job', 'money'],
              solutions: [
                { text: "What does 'safe' even mean here?", level: 'native', note: '“even” 加强反问语气，是争论里很有力的小词。' }
              ],
              tip: '“even” 放在疑问词后，表示“到底 / 究竟”。'
            },
            {
              id: 's13-a1-b3',
              speaker: 'Dad',
              avatar: '👨',
              line: 'It means you can pay rent.',
              lineCn: '意思是你能付得起房租。',
              situation: '他第一次开口，声音不高。',
              intent: '说你懂，但你想先试一年',
              chips: ['I', 'know', 'But', 'I', 'want', 'one', 'year', 'to', 'try', 'it', 'no', 'yes', 'maybe'],
              solutions: [
                { text: 'I know. But I want one year to try it.', level: 'native', note: '“one year to try it” 给出可验证的期限，谈判更具体。' },
                { text: 'I know. But I want one year to try.', level: 'ok', note: '省掉 it 也很自然，重点在“试一年”。' }
              ],
              tip: '跟父母谈梦想，给时间框（one year），比说“相信我”有效。'
            }
          ]
        },
        {
          id: 's13-a2',
          title: 'Act 2 · 如果失败',
          beats: [
            {
              id: 's13-a2-b1',
              speaker: 'Mom',
              avatar: '👩',
              line: "And if it doesn't work?",
              lineCn: '那要是没成呢？',
              situation: '她把铅笔放下，看着你。',
              intent: '说那就换方向，不会卡在原地',
              chips: ['Then', "I'll", 'change', 'I', "won't", 'just', 'stay', 'stuck', 'no', 'yes', 'quit', 'try'],
              solutions: [
                { text: "Then I'll change. I won't just stay stuck.", level: 'native', note: '“stay stuck” = 卡在原地，很形象。' },
                { text: "Then I'll change. I won't stay stuck.", level: 'ok', note: '去掉 just，语气更硬一点。' }
              ],
              tip: '回答“如果失败”，给出下一步，比保证成功更可信。'
            },
            {
              id: 's13-a2-b2',
              speaker: 'Dad',
              avatar: '👨',
              line: "You're asking us to trust you.",
              lineCn: '你是在让我们相信你。',
              situation: '他把“信任”这个词说得很慢。',
              intent: '说是，并问他们当年有没有被相信过',
              chips: ['Yeah', 'I', 'am', 'Did', 'anyone', 'trust', 'you', 'at', 'my', 'age', 'no', 'yes', 'when'],
              solutions: [
                { text: 'Yeah, I am. Did anyone trust you at my age?', level: 'native', note: '反问句在争论里很有效，但语气要放低。' }
              ],
              tip: '用 “Did anyone…?” 把问题抛回去，比 “You don’t understand” 好。'
            },
            {
              id: 's13-a2-b3',
              speaker: 'Mom',
              avatar: '👩',
              line: "Your grandfather didn't trust me. I did it anyway.",
              lineCn: '你外公当年也不信我。我还是做了。',
              situation: '她说完自己愣了一下，像是第一次跟你讲这件事。',
              intent: '说那她应该懂你为什么不想听话',
              chips: ['Then', 'you', 'know', 'why', 'I', "can't", 'just', 'agree', 'no', 'yes', 'understand', 'listen'],
              solutions: [
                { text: "Then you know why I can't just agree.", level: 'native', note: '“can’t just agree” 比 “won’t listen” 柔和，但同样坚定。' }
              ],
              tip: '把自己的坚持接到对方的经历上，是最高级的说服。'
            }
          ]
        },
        {
          id: 's13-a3',
          title: 'Act 3 · 写下来',
          beats: [
            {
              id: 's13-a3-b1',
              speaker: 'Dad',
              avatar: '👨',
              line: 'One year. Your own money for the first six months.',
              lineCn: '一年。前六个月用你自己的钱。',
              situation: '他伸出手，像谈生意一样。',
              intent: '答应，并问能不能把这条写下来',
              chips: ['Deal', 'Can', 'we', 'write', 'that', 'down', 'yes', 'okay', 'paper', 'no', 'sign'],
              solutions: [
                { text: 'Deal. Can we write that down?', level: 'native', note: '“write that down” 把口头承诺变成约定，很成熟。' }
              ],
              tip: '家庭谈判最后落到纸面，能避免以后反复。'
            },
            {
              id: 's13-a3-b2',
              speaker: 'Mom',
              avatar: '👩',
              line: "You're really doing this.",
              lineCn: '你真的要这么做。',
              situation: '她不是问句，是确认。',
              intent: '说是，并且你也有点怕',
              chips: ['I', 'am', 'And', "I'm", 'scared', 'too', 'no', 'yes', 'really', 'afraid'],
              solutions: [
                { text: "I am. And I'm scared too.", level: 'native', note: '“And … too” 补一句示弱，能让对方放下防御。' },
                { text: "I am. And I'm really scared too.", level: 'ok', note: '加 really 更坦白，也更容易让对方接话。' }
              ],
              tip: '坚定之后补一句害怕，反而更可信。'
            },
            {
              id: 's13-a3-b3',
              speaker: 'Mom',
              avatar: '👩',
              line: 'Call home. Not just when you need something.',
              lineCn: '给家里打电话。别只在需要东西的时候打。',
              situation: '她说完很快转过去收拾碗筷，没让你看她的脸。',
              intent: '说每周日都会打，保证',
              chips: ['Every', 'Sunday', 'I', 'promise', 'call', 'home', 'no', 'yes', 'week', 'will'],
              solutions: [
                { text: 'Every Sunday. I promise.', level: 'native', note: '短句承诺，比长篇保证更有分量。' }
              ],
              tip: '对父母，具体频率（Every Sunday）比“我会常联系”更让人安心。'
            }
          ]
        }
      ],
      choice: {
        prompt: '填志愿那晚，你把新闻放在第一志愿，还是把“安全”的放在前面？',
        options: [
          { id: 'journalism', label: '第一志愿填新闻', reply: '“我填新闻。”', outcome: '你把新闻填在第一志愿。提交前你看了三秒，然后按了下去。' },
          { id: 'safe', label: '把稳妥的放第一', reply: '“先填稳的。”', outcome: '你把“稳妥”的填在了第一。你没有后悔，只是把它当成一年后的备选。' }
        ]
      },
      personaClose: {
        warm: '妈妈后来跟邻居说：“他自己做的决定，我们支持。”',
        snark: '爸爸说：“这小子谈判比我还狠。”',
        chaos: '妈妈说：“他连志愿表都要跟我讨价还价。”'
      }
    },

    /* ============================ 14 ============================ */
    {
      id: 'small-talk',
      season: 3,
      title: 'Small Talk, Big Room',
      cn: '二十个人的线上房间',
      emoji: '🎙',
      level: 'B2',
      minutes: 4,
      hook: '一个二十人的线上会议室，屏幕上是二十张陌生面孔。主持人说：let’s go around.',
      callbacks: {
        journalism: '你把新闻填在第一志愿。提交那晚，你在备忘录里写了一句：“先做一年。”',
        safe: '你把“稳妥”的填在第一志愿，新闻放在第二。你没后悔，只是把它当成一年后的备选。'
      },
      cast: [{ name: 'Sam', avatar: '🎙', role: '主持人 / 负责不让冷场' }, { name: 'Noor', avatar: '🧕', role: '同龄 / 说话直接' }],
      acts: [
        {
          id: 's14-a1',
          title: 'Act 1 · 自我介绍',
          beats: [
            {
              id: 's14-a1-b1',
              speaker: 'Sam',
              avatar: '🎙',
              line: "Quick intro — name, one thing you're into.",
              lineCn: '简单介绍：名字，加一件你喜欢的事。',
              situation: '屏幕上已经有三个人在点头，轮到你了。',
              intent: '说你喜欢做关于校园生活的短视频',
              chips: ["I'm", 'into', 'making', 'short', 'videos', 'about', 'school', 'life', 'name', 'my', 'and', 'like'],
              solutions: [
                { text: "I'm into making short videos about school life.", level: 'native', note: '“I’m into + 动名词” 是最快让人记住你的结构。' },
                { text: "I'm into making short videos.", level: 'ok', note: '省掉 about school life 也能懂，但信息少了，别人不容易接话。' }
              ],
              tip: '自我介绍给一个“正在做的事”，比给身份标签更抓人。'
            },
            {
              id: 's14-a1-b2',
              speaker: 'Sam',
              avatar: '🎙',
              line: 'Love that. Anyone want to respond?',
              lineCn: '很好。有人想接一句吗？',
              situation: '对话框安静了两秒，这通常是最尴尬的时刻。',
              intent: '问还有谁也在做视频',
              chips: ['Does', 'anyone', 'else', 'make', 'videos', 'here', 'too', 'no', 'yes', 'who', 'some'],
              solutions: [
                { text: 'Does anyone else make videos here?', level: 'native', note: '主动把话题抛给全场，是线上活动里最容易加分的行为。' }
              ],
              tip: '多人场合用 “Does anyone else…?”，比 “What about you?” 更合适。'
            },
            {
              id: 's14-a1-b3',
              speaker: 'Noor',
              avatar: '🧕',
              line: 'I do! Mostly edits for my dance team.',
              lineCn: '我！主要是给我舞队剪片。',
              situation: '她的镜头晃了一下，背景里有人喊她名字。',
              intent: '说想看看她的作品',
              chips: ["I'd", 'love', 'to', 'see', 'one', 'sometime', 'no', 'yes', 'watch', 'video', 'your'],
              solutions: [
                { text: "I'd love to see one sometime.", level: 'native', note: '“sometime” 让邀请变得不冒犯，不给对方压力。' },
                { text: "I'd love to watch one sometime.", level: 'ok', note: 'watch 和 see 都能用，watch 更强调看完。' }
              ],
              tip: '“I’d love to…” 比 “Can you show me” 更礼貌，也更像同龄人。'
            }
          ]
        },
        {
          id: 's14-a2',
          title: 'Act 2 · 那个话题',
          beats: [
            {
              id: 's14-a2-b1',
              speaker: 'Sam',
              avatar: '🎙',
              line: 'Topic today: does social media make us more honest?',
              lineCn: '今天的题目：社交媒体让我们更诚实了吗？',
              situation: '聊天框里立刻刷过一排“no”。',
              intent: '说它让小事更假、大事更真',
              chips: ['It', 'makes', 'small', 'things', 'faker', 'and', 'big', 'things', 'more', 'honest', 'no', 'yes', 'maybe'],
              solutions: [
                { text: 'It makes small things faker and big things more honest.', level: 'native', note: '用对仗结构（small/big，faker/honest）表达观点，听起来很成熟。' }
              ],
              tip: '观点句用对仗，最容易被人记住。'
            },
            {
              id: 's14-a2-b2',
              speaker: 'Noor',
              avatar: '🧕',
              line: "That's a big claim. Examples?",
              lineCn: '这说法挺大。举个例子？',
              situation: '她往后靠，明显在等你说点具体的。',
              intent: '举例：没人发失败的那条',
              chips: ['Nobody', 'posts', 'the', 'video', 'that', 'flopped', 'They', 'post', 'the', 'one', 'that', 'worked'],
              solutions: [
                { text: 'Nobody posts the video that flopped. They post the one that worked.', level: 'native', note: '“flopped” = 作品失败了，比 “failed” 更口语。' }
              ],
              tip: '举例用对比句（the one that… / the one that…），比列举清单有力。'
            },
            {
              id: 's14-a2-b3',
              speaker: 'Sam',
              avatar: '🎙',
              line: 'So is that dishonesty or editing?',
              lineCn: '那这算不诚实，还是只是剪辑？',
              situation: '这个问题让聊天框安静了一秒。',
              intent: '说这是剪辑，但会让人以为生活很容易',
              chips: ["It's", 'editing', 'But', 'it', 'makes', 'people', 'think', 'life', 'is', 'easier', 'than', 'it', 'is', 'no', 'yes'],
              solutions: [
                { text: "It's editing. But it makes people think life is easier than it is.", level: 'native', note: '“easier than it is” 用比较从句表示“比实际更…”，很地道。' }
              ],
              tip: '“than it is” 常被省略后半句，但补全更清楚。'
            }
          ]
        },
        {
          id: 's14-a3',
          title: 'Act 3 · 会后',
          beats: [
            {
              id: 's14-a3-b1',
              speaker: 'Noor',
              avatar: '🧕',
              line: 'Do you ever feel fake online?',
              lineCn: '你在网上会觉得自己很假吗？',
              situation: '会议已经结束，只剩你们两个人还开着麦。',
              intent: '说有时候，所以开始发失败的东西',
              chips: ['Sometimes', 'So', 'I', 'started', 'posting', 'the', 'failures', 'too', 'no', 'yes', 'never', 'bad'],
              solutions: [
                { text: 'Sometimes. So I started posting the failures too.', level: 'native', note: '“the failures” 用复数泛指失败，比 “my failure” 自然。' }
              ],
              tip: '“so” 连接因果，让回答有结构。'
            },
            {
              id: 's14-a3-b2',
              speaker: 'Noor',
              avatar: '🧕',
              line: 'And people still watch?',
              lineCn: '那还有人看吗？',
              situation: '她笑了一下，像早就知道答案。',
              intent: '说反而更多，因为真实',
              chips: ['More', 'actually', 'Because', "it's", 'real', 'no', 'yes', 'watch', 'people', 'true'],
              solutions: [
                { text: "More, actually. Because it's real.", level: 'native', note: '“More, actually.” 用省略句回答，非常口语。' }
              ],
              tip: '回答数量变化时，“More.” 一个词就够，加 actually 更自然。'
            },
            {
              id: 's14-a3-b3',
              speaker: 'Sam',
              avatar: '🎙',
              line: 'Great note to end on. Thanks, everyone.',
              lineCn: '这个收尾很好。谢谢大家。',
              situation: '二十个格子开始一个个暗下去。',
              intent: '道谢，说希望还能再聊',
              chips: ['Thanks', 'everyone', 'I', 'hope', 'we', 'do', 'this', 'again', 'no', 'yes', 'bye', 'talk'],
              solutions: [
                { text: 'Thanks, everyone. I hope we do this again.', level: 'native', note: '“I hope we do this again” 用 do 代替重复动词，很地道。' },
                { text: 'Thanks, everyone. I hope we talk again.', level: 'ok', note: 'talk again 比 do this again 更直接，适合收尾。' }
              ],
              tip: '结束语用 “I hope we do this again.”，比 “Goodbye” 有温度。'
            }
          ]
        }
      ],
      choice: {
        prompt: '会后 Noor 私聊问你要不要一起做一个小项目。',
        options: [
          { id: 'yes', label: '一起做', reply: '“做吧。”', outcome: '你们约了下周对一次脚本。你第一次觉得“合作”这个词离你很近。' },
          { id: 'later', label: '说等考完再谈', reply: '“考完再聊。”', outcome: '你说等考完再谈。她回 “promise?” 你回了一个 emoji，然后把它记进了备忘录。' }
        ]
      },
      personaClose: {
        warm: 'Sam 在活动总结里写：“made the room feel smaller.”',
        snark: 'Noor 说：“he argues like he’s been waiting all day for it.”',
        chaos: 'Sam 说：“someone please give that kid a talk show.”'
      }
    },

    /* ============================ 15 ============================ */
    {
      id: 'see-you-around',
      season: 3,
      title: 'See You Around',
      cn: '操场上的最后一把椅子',
      emoji: '🌇',
      level: 'B2',
      minutes: 5,
      hook: '毕业典礼结束，操场上的椅子还没收。有人在你背后喊你的名字。',
      callbacks: {
        yes: '你和 Noor 的小项目做完了。上线那天，你把它转给了 Leo 和 Kai，他们比你还兴奋。',
        later: '你答应考完再联系 Noor。考完了，你发了第一条消息，她回得很快。'
      },
      cast: [{ name: 'Leo', avatar: '🧢', role: '还在纠结要不要哭' }, { name: 'Kai', avatar: '🌙', role: '考完就消失，今天回来了' }],
      acts: [
        {
          id: 's15-a1',
          title: 'Act 1 · 椅子',
          beats: [
            {
              id: 's15-a1-b1',
              speaker: 'Leo',
              avatar: '🧢',
              line: "So that's it. We're done.",
              lineCn: '就这样了。我们毕业了。',
              situation: '他一脚踢着地上的矿泉水瓶，没看你。',
              intent: '说感觉还不像真的',
              chips: ['It', "doesn't", 'feel', 'real', 'yet', 'no', 'yes', 'done', 'finish', 'weird'],
              solutions: [
                { text: "It doesn't feel real yet.", level: 'native', note: '“yet” 放句尾表示“还没”，是英语里很关键的时态感。' },
                { text: "It doesn't feel real.", level: 'ok', note: '去掉 yet 更干脆，像已经接受了。' }
              ],
              tip: '“not … yet” 是表达“还没”的标准结构，别用 “still not”。'
            },
            {
              id: 's15-a1-b2',
              speaker: 'Leo',
              avatar: '🧢',
              line: "Give it a week. Then it'll hit you.",
              lineCn: '给它一周。到时候你就知道了。',
              situation: '他说得像很有经验，其实声音有点抖。',
              intent: '问他明年去哪',
              chips: ['Where', 'are', 'you', 'going', 'next', 'year', 'what', 'do', 'no', 'plan', 'city'],
              solutions: [
                { text: 'Where are you going next year?', level: 'native', note: '问毕业去向就用 “next year”，比 “in the future” 具体。' }
              ],
              tip: '问去向直接问，别绕 “What’s your plan?”。'
            },
            {
              id: 's15-a1-b3',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'Same city. Different school. You?',
              lineCn: '同一个城市，换个学校。你呢？',
              situation: '他终于抬头看了你一眼。',
              intent: '说留在本地，但想先工作一年',
              chips: ['Staying', 'here', 'but', 'I', 'want', 'to', 'work', 'for', 'a', 'year', 'first', 'no', 'yes', 'leave'],
              solutions: [
                { text: 'Staying here, but I want to work for a year first.', level: 'native', note: '“Staying here, but…” 省略主语，口语里很常见。' },
                { text: 'Staying here, but first I want to work for a year.', level: 'ok', note: '把 first 提前，听起来更像在解释顺序。' }
              ],
              tip: '回答去向用省略句更自然，不必每次都说完整主谓。'
            }
          ]
        },
        {
          id: 's15-a2',
          title: 'Act 2 · 那句没说的话',
          beats: [
            {
              id: 's15-a2-b1',
              speaker: 'Kai',
              avatar: '🌙',
              line: "You're not going to disappear again, right?",
              lineCn: '你不会又消失吧？',
              situation: '他抱着两瓶汽水走过来，把其中一瓶塞给你。',
              intent: '说不会，这次换你主动',
              chips: ['Not', 'this', 'time', "I'll", 'be', 'the', 'one', 'who', 'texts', 'first', 'no', 'yes', 'again'],
              solutions: [
                { text: "Not this time. I'll be the one who texts first.", level: 'native', note: '“the one who texts first” 是定语从句，比 “I will text you” 更有担当。' }
              ],
              tip: '“the one who…” 用来给自己贴一个角色，很有表达力。'
            },
            {
              id: 's15-a2-b2',
              speaker: 'Kai',
              avatar: '🌙',
              line: "That's a big promise.",
              lineCn: '这承诺可不小。',
              situation: '他打开汽水，气泡冲出来一点。',
              intent: '说那就从今晚开始',
              chips: ['Then', "I'll", 'start', 'tonight', 'no', 'yes', 'promise', 'text'],
              solutions: [
                { text: "Then I'll start tonight.", level: 'native', note: '用 “Then” 接住对方的质疑，把大话变成行动。' }
              ],
              tip: '承诺太大时，立刻给一个今天就能做的小动作。'
            },
            {
              id: 's15-a2-b3',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'What are you actually going to miss?',
              lineCn: '你到底会想念什么？',
              situation: '他问得很轻，像怕你真的回答。',
              intent: '说食堂那张桌子，还有你们的烂笑话',
              chips: ['That', 'table', 'in', 'the', 'canteen', 'And', 'our', 'terrible', 'jokes', 'no', 'yes', 'miss'],
              solutions: [
                { text: 'That table in the canteen. And our terrible jokes.', level: 'native', note: '“terrible jokes” 这种自嘲式形容词，比 “funny jokes” 更有感情。' },
                { text: 'Our terrible jokes. And that table in the canteen.', level: 'ok', note: '顺序换一下也行，先说的那个通常更重要。' }
              ],
              tip: '说怀念什么时给一个具体物品（that table），比说 “everyone” 更动人。'
            }
          ]
        },
        {
          id: 's15-a3',
          title: 'Act 3 · 最后一张',
          beats: [
            {
              id: 's15-a3-b1',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'We should do one last thing.',
              lineCn: '我们应该再做最后一件事。',
              situation: '你大概猜到他要说什么。',
              intent: '问是不是又要拍照',
              chips: ['Let', 'me', 'guess', 'another', 'photo', 'no', 'yes', 'thing', 'last', 'not'],
              solutions: [
                { text: 'Let me guess — another photo?', level: 'native', note: '“Let me guess” 是熟人之间的调侃开场。' },
                { text: 'Let me guess — not another photo?', level: 'ok', note: '加 not 更像在哀嚎，朋友之间很常见。' }
              ],
              tip: '“Let me guess…” 用在你已经知道对方要说什么的时候。'
            },
            {
              id: 's15-a3-b2',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'Obviously. Get over here.',
              lineCn: '当然。过来。',
              situation: '他把手机塞给路过的学弟，开始指挥站位。',
              intent: '说好，但别发到群里',
              chips: ['Fine', 'but', "don't", 'post', 'it', 'in', 'the', 'group', 'no', 'yes', 'photo', 'send'],
              solutions: [
                { text: "Fine, but don't post it in the group.", level: 'native', note: '“in the group” 指群聊，冠词必须有。' }
              ],
              tip: '“Don’t post it in the group.” 是很好用的半玩笑拒绝。'
            },
            {
              id: 's15-a3-b3',
              speaker: 'Kai',
              avatar: '🌙',
              line: 'Hey. Whatever happens — you were good at this.',
              lineCn: '喂。不管以后怎样，你在这件事上很行。',
              situation: '快门响之前，他忽然说了这么一句。',
              intent: '道谢，也说他们同样',
              chips: ['Thanks', 'you', 'were', 'too', 'Both', 'of', 'you', 'no', 'yes', 'good', 'better'],
              solutions: [
                { text: 'Thanks. You were too. Both of you.', level: 'native', note: '“You were too. Both of you.” 短句收尾，情绪刚好。' }
              ],
              tip: '告别时用短句，别用长段落，越短越重。'
            }
          ]
        }
      ],
      choice: {
        prompt: '最后，你要不要说那句一直没说的话：谢谢你们没让我一个人。',
        options: [
          { id: 'say', label: '说出来', reply: '“谢谢你们没让我一个人。”', outcome: '你说完，三个人都安静了几秒。Leo 说 “okay, now I’m actually crying.” 然后你们全笑了。' },
          { id: 'keep', label: '没说，放在心里', reply: '……', outcome: '你把那句话咽了回去。但走的时候，你拍了拍他们的肩，拍得比平时久一点。' }
        ]
      },
      personaClose: {
        warm: '后来群里最常被翻出来的，是你说“谢谢”的那条语音。',
        snark: 'Leo 说：“他嘴上从不认输，毕业那天也没认。”',
        chaos: 'Kai 说：“他毕业致辞只说了一句，全场笑疯。”'
      }
    }
  ];
});
