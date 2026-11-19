/* ALTER 内容库 —— 场景 / 幕 / 回合 / 分支 / 人设
 * 纯数据，无副作用。浏览器挂到 window.ALTER_CONTENT，Node 走 module.exports。
 * 约定：
 *  - chips 是玩家可用的词块（可重复），必须覆盖 solutions 里所有单词（multiset 包含）。
 *  - solutions[].level: 'native'（母语者说法，100 分）| 'ok'（能懂，82 分）
 *  - 所有文本均为真实可用语料，不用占位符。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ALTER_CONTENT = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PERSONAS = [
    {
      id: 'warm',
      name: '暖场怪',
      en: 'The Softie',
      emoji: '🌤',
      color: '#ffd166',
      tagline: '你不太会说狠话，但所有人都愿意坐你旁边。'
    },
    {
      id: 'snark',
      name: '嘴替',
      en: 'The Roaster',
      emoji: '😼',
      color: '#c9f75d',
      tagline: '你嘴上从不认输，但你说的话总有人截图。'
    },
    {
      id: 'chaos',
      name: '气氛组',
      en: 'The Wildcard',
      emoji: '🌀',
      color: '#a78bfa',
      tagline: '正经场面你也能一句话带跑偏，但没人真的生气。'
    }
  ];

  var SCENES = [
    /* ============================= 1 ============================= */
    {
      id: 'first-day',
      title: 'First Day, Zero Friends',
      cn: '开学第一天，零个朋友',
      emoji: '🎒',
      level: 'A2–B1',
      minutes: 3,
      hook: '教室后排只剩一个空位，旁边坐着全校消息最灵通、也最不好惹的人。',
      cast: [{ name: 'Mia', avatar: '😼', role: '同桌 / 全校消息中枢' }],
      acts: [
        {
          id: 's1-a1',
          title: 'Act 1 · 最后一个空位',
          beats: [
            {
              id: 's1-a1-b1',
              speaker: 'Mia',
              avatar: '😼',
              line: 'Is this seat taken?',
              lineCn: '这个位子有人吗？',
              situation: '她的书包已经甩在你桌上，眼睛看着你旁边的空位。',
              intent: '说没人坐，让她坐（友好一点）',
              chips: ["No", "it's", "all", "yours", "Go", "ahead", "Sorry", "busy", "here", "mine"],
              solutions: [
                { text: "No, it's all yours.", level: 'native', note: '“all yours” 是让座最自然的说法，比 “you can sit” 更像同龄人。' },
                { text: 'Go ahead.', level: 'ok', note: '简短有力，但少了点友好度，适合你不想多聊的时候。' }
              ],
              tip: '“Is this seat taken?” 是校园里最高频的搭话句型。回答 “No, it’s all yours.” 万能。'
            },
            {
              id: 's1-a1-b2',
              speaker: 'Mia',
              avatar: '😼',
              line: "I'm Mia. You're the new kid, right?",
              lineCn: '我叫 Mia。你就是新来的那个吧？',
              situation: '她拉开椅子坐下，把耳机挂到脖子上，一副要聊两句的样子。',
              intent: '承认，并简单说自己刚从哪搬来',
              chips: ['Yeah', 'I', 'just', 'moved', 'here', 'from', 'Chengdu', 'live', 'new', 'am', 'the'],
              solutions: [
                { text: 'Yeah, I just moved here from Chengdu.', level: 'native', note: '“moved here from + 城市” 明确说明你是新搬来的，信息量刚好。' }
              ],
              tip: '自报来历别只说 “I am from…”，加一句 “I just moved here”，对方就知道你是新同学。'
            },
            {
              id: 's1-a1-b3',
              speaker: 'Mia',
              avatar: '😼',
              line: "Fair warning — Mr. Lin's class is brutal.",
              lineCn: '提前警告你——林老师的课很要命。',
              situation: '她说 “brutal” 的时候挑了下眉，明显在等你接话。',
              intent: '追问到底有多狠（比如他真会查作业吗）',
              chips: ['Brutal', 'how', 'Does', 'he', 'actually', 'check', 'homework', 'What', 'do', 'you', 'mean', 'by', 'really'],
              solutions: [
                { text: 'Brutal how? Does he actually check homework?', level: 'native', note: '“Brutal how?” 是省略句追问，母语者日常就这么说，比 “How brutal is it?” 更随意。' },
                { text: 'What do you mean by brutal?', level: 'ok', note: '语法完整、完全能懂，但听起来更像课本，不像同学聊天。' }
              ],
              tip: '口语里常把疑问词扔到句尾：“Brutal how?” “Serious how?” 语气轻，还显得你听得很认真。'
            }
          ]
        },
        {
          id: 's1-a2',
          title: 'Act 2 · 三楼走廊',
          beats: [
            {
              id: 's1-a2-b1',
              speaker: 'Mia',
              avatar: '😼',
              line: 'You look lost.',
              lineCn: '你看起来迷路了。',
              situation: '走廊尽头有三道一模一样的门，你已经来回走了两趟。',
              intent: '有点，说你在找科学实验室',
              chips: ['Kind', 'of', "I'm", 'looking', 'for', 'the', 'science', 'lab', 'Yeah', 'where', 'is', 'you'],
              solutions: [
                { text: "Kind of. I'm looking for the science lab.", level: 'native', note: '“Kind of” = 有点儿，承认但不把话说重，是英语里非常重要的软化词。' },
                { text: "Yeah, I'm looking for the science lab.", level: 'ok', note: '直接承认也没问题，只是少了点自嘲的松弛感。' }
              ],
              tip: '“I’m looking for + 地点/东西” 比 “Where is…?” 更礼貌，也不会让对方觉得被当成人形地图。'
            },
            {
              id: 's1-a2-b2',
              speaker: 'Mia',
              avatar: '😼',
              line: "Third floor. I'll walk you.",
              lineCn: '三楼。我带你过去。',
              situation: '她已经转身，往楼梯口走了半步，回头看你。',
              intent: '说那太好了，谢谢',
              chips: ["That'd", 'be', 'great', 'thanks', 'would', 'That', 'no', 'need', 'please', "You're"],
              solutions: [
                { text: "That'd be great, thanks.", level: 'native', note: '“That’d be great” 是接受帮助的万能句，' + "'d' 就是 would。" },
                { text: 'That would be great, thanks.', level: 'ok', note: '说全 “would” 完全正确，只是口语里几乎都会缩成 “That’d”。' }
              ],
              tip: '别人主动帮忙时，最自然的反应是 “That’d be great.” —— 接受，且不显得理所当然。'
            },
            {
              id: 's1-a2-b3',
              speaker: 'Mia',
              avatar: '😼',
              line: 'So what do you do for fun?',
              lineCn: '那你平时玩什么？',
              situation: '她一边上楼梯一边问，语气很随意，像在筛人。',
              intent: '说自己主要打游戏，偶尔做点 beat',
              chips: ["I'm", 'into', 'gaming', 'mostly', 'And', 'I', 'make', 'beats', 'sometimes', 'like', 'play', 'music'],
              solutions: [
                { text: "I'm into gaming, mostly. And I make beats sometimes.", level: 'native', note: '“I’m into + 名词/动名词” 是青少年说“我喜欢”最常用的方式，带身份感。' },
                { text: "I'm into gaming, mostly.", level: 'ok', note: '只说一半也能接住话题，但少了让对方继续问的钩子。' }
              ],
              tip: '“I’m into…” 比 “I like…” 更像同龄人；后面加 “mostly” 显得你没那么绝对。'
            }
          ]
        },
        {
          id: 's1-a3',
          title: 'Act 3 · 他们的那张桌子',
          beats: [
            {
              id: 's1-a3-b1',
              speaker: 'Mia',
              avatar: '😼',
              line: 'You wanna sit with us?',
              lineCn: '要不要跟我们坐？',
              situation: '食堂很吵，她用下巴指了指靠窗那张桌子，坐着四五个人。',
              intent: '答应，说只要他们不介意',
              chips: ['Yeah', 'sure', 'if', 'you', "don't", 'mind', "I'd", 'love', 'to', 'No', 'thanks', 'maybe'],
              solutions: [
                { text: "Yeah, sure, if you don't mind.", level: 'native', note: '“if you don’t mind” 是客气又不过分卑微的加入方式。' },
                { text: "Yeah, I'd love to.", level: 'ok', note: '很热情，但用在刚认识的人身上会稍微用力过猛。' }
              ],
              tip: '被邀请时，加一句 “if you don’t mind” 会让人觉得你懂分寸。'
            },
            {
              id: 's1-a3-b2',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'Mia says you make music. Prove it.',
              lineCn: 'Mia 说你会做音乐。证明一下。',
              situation: '一个戴帽子的男生把手机往桌上一放，全桌都看向你。',
              intent: '谦虚一点，但答应给他们听一首',
              chips: ['I', 'only', 'started', 'this', 'summer', 'but', 'I', 'can', 'show', 'you', 'a', 'track', 'mean', 'beats'],
              solutions: [
                { text: 'I only started this summer, but I can show you a track.', level: 'native', note: '“only started … but I can …” 先降低预期再给东西，是最舒服的谦虚方式。' },
                { text: 'I mean, I only started this summer.', level: 'ok', note: '“I mean” 是口语缓冲垫，用来给自己争取思考时间。' }
              ],
              tip: '被要求“证明一下”时，别急着辩解，先给一个具体的作品名（a track），比形容词有用。'
            },
            {
              id: 's1-a3-b3',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'Send it to the group chat.',
              lineCn: '发到群里。',
              situation: '他把群二维码推到你面前，笑得有点欠。',
              intent: '答应，但让他们别笑',
              chips: ['Deal', 'Just', "don't", 'laugh', 'Okay', 'but', 'send', 'it', 'later', 'you', 'promise'],
              solutions: [
                { text: "Deal. Just don't laugh.", level: 'native', note: '“Deal.” 一个词就表示成交，比 “I agree” 更像同龄人。' },
                { text: "Okay, but don't laugh.", level: 'ok', note: '能懂，但 “but” 会让拒绝的意味提前出现。' }
              ],
              tip: '“Just don’t laugh.” 是给自己留台阶的经典说法，先示弱反而更容易被认真对待。'
            }
          ]
        }
      ],
      choice: {
        prompt: '回到宿舍，你把 track 拖进群里，手指悬在“发送”上。',
        options: [
          { id: 'send', label: '发了。反正他们先问的', reply: '“发了。”', outcome: '群里安静了 30 秒。然后 Leo 发来一句：“okay this actually goes hard.” 你把手机扣在桌上，笑了很久。' },
          { id: 'hold', label: '算了，等下次', reply: '“算了。”', outcome: '你把手机塞回口袋。Mia 看了你一眼：“Your loss.” 但她笑了，还把自己的耳机分你一半。' }
        ]
      },
      personaClose: {
        warm: 'Mia 后来跟别人说：“新来的那个，坐旁边挺舒服的。”',
        snark: 'Mia 后来跟别人说：“新来的嘴挺硬，但我喜欢。”',
        chaos: 'Mia 后来跟别人说：“新来的那个，笑点很奇怪，但挺好玩的。”'
      }
    },

    /* ============================= 2 ============================= */
    {
      id: 'canteen',
      title: 'Canteen, 12:05',
      cn: '食堂十二点零五分',
      emoji: '🍜',
      level: 'A2–B1',
      minutes: 3,
      hook: '排队到窗口，阿姨已经在看下一个人的碗了。你身后还有二十个人。',
      cast: [{ name: 'Auntie Chen', avatar: '👩‍🍳', role: '三号窗口' }, { name: 'Leo', avatar: '🧢', role: '昨天那个戴帽子的' }],
      acts: [
        {
          id: 's2-a1',
          title: 'Act 1 · 三号窗口',
          beats: [
            {
              id: 's2-a1-b1',
              speaker: 'Auntie Chen',
              avatar: '👩‍🍳',
              line: 'What can I get you?',
              lineCn: '你要点什么？',
              situation: '蒸汽糊了她的眼镜。你只有三秒钟决定。',
              intent: '点辣面，不要香菜',
              chips: ['Can', 'I', 'get', 'the', 'spicy', 'noodles', 'no', 'cilantro', 'please', 'rice', 'want', 'a'],
              solutions: [
                { text: 'Can I get the spicy noodles, no cilantro?', level: 'native', note: '点单万能句 “Can I get…”，配料直接说 “no + 配料”，不用背 without。' }
              ],
              tip: '点单三步：Can I get + 东西，+ no + 不要的，最后加 please。'
            },
            {
              id: 's2-a1-b2',
              speaker: 'Auntie Chen',
              avatar: '👩‍🍳',
              line: 'Noodles are out. Rice?',
              lineCn: '面没了。米饭行吗？',
              situation: '她手里的勺子已经伸向饭桶，等你点头。',
              intent: '说米饭也行，谢谢',
              chips: ['Rice', 'works', 'thanks', 'is', 'fine', 'No', 'I', 'will', 'wait', 'okay', 'give', 'me'],
              solutions: [
                { text: 'Rice works, thanks.', level: 'native', note: '“Something works” = 这个也行，比 “OK” 更有分寸，也不会显得失望。' },
                { text: 'Rice is fine, thanks.', level: 'ok', note: '完全能懂，但 “is fine” 有点像勉强接受。' }
              ],
              tip: '“That works.” 是英语里极高频的“可以/行”，商店、饭堂、约时间都能用。'
            },
            {
              id: 's2-a1-b3',
              speaker: 'Auntie Chen',
              avatar: '👩‍🍳',
              line: 'Twelve yuan. Scan here.',
              lineCn: '十二块，这儿扫码。',
              situation: '你扫完码，看到旁边锅里还躺着最后一个煎蛋。',
              intent: '问能不能再加个煎蛋',
              chips: ['Can', 'I', 'add', 'a', 'fried', 'egg', 'too', 'here', 'you', 'go', 'how', 'much'],
              solutions: [
                { text: 'Can I add a fried egg too?', level: 'native', note: '加料用 “add”；句尾的 “too” 表示“也来一个”。' }
              ],
              tip: '“add” 是加料，“extra” 是加量：“extra rice” = 加饭。'
            }
          ]
        },
        {
          id: 's2-a2',
          title: 'Act 2 · 找座位',
          beats: [
            {
              id: 's2-a2-b1',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'Is anyone sitting here?',
              lineCn: '这儿有人坐吗？',
              situation: '他端着盘子站在你对面，整张桌子其实只有你一个人。',
              intent: '整张桌子都空，让他坐',
              chips: ['Go', 'for', 'it', 'the', 'whole', "table's", 'empty', 'No', 'one', 'here', 'sit', 'please'],
              solutions: [
                { text: "Go for it, the whole table's empty.", level: 'native', note: '“Go for it” = 拿去/上吧，是鼓励别人行动的高频短语。' }
              ],
              tip: '“Go for it.” 还能用来鼓励人：“想报名？Go for it.”'
            },
            {
              id: 's2-a2-b2',
              speaker: 'Leo',
              avatar: '🧢',
              line: "You're the new kid from Mr. Lin's class, right?",
              lineCn: '你就是林老师班那个新来的吧？',
              situation: '他坐下，筷子还没拆，先盯着你看了两秒。',
              intent: '感叹消息传得真快',
              chips: ['Word', 'travels', 'fast', 'huh', 'You', 'know', 'me', 'already', 'yes', 'I', 'am', 'news'],
              solutions: [
                { text: 'Word travels fast, huh?', level: 'native', note: '句尾加 “huh” 是在邀请对方同意，非常口语。' }
              ],
              tip: '“Word travels fast.” = 消息传得真快。想显得更随意，就加个 huh。'
            },
            {
              id: 's2-a2-b3',
              speaker: 'Leo',
              avatar: '🧢',
              line: "Sit with us. We're arguing about the math test.",
              lineCn: '跟我们一起坐。我们在吵数学考试。',
              situation: '他说“吵”的时候，隔壁两个人都抬起了头。',
              intent: '说你不想再回忆那场灾难',
              chips: ["I'd", 'rather', 'not', 'relive', 'that', 'disaster', 'No', 'thanks', 'it', 'was', 'fine', 'really'],
              solutions: [
                { text: "I'd rather not relive that disaster.", level: 'native', note: '“I’d rather not” 是礼貌拒绝，比 “I don’t want to” 软很多。' }
              ],
              tip: '拒绝时用 “I’d rather not”，既清楚又不伤人；再补一句自嘲，气氛就救回来了。'
            }
          ]
        },
        {
          id: 's2-a3',
          title: 'Act 3 · 那杯水',
          beats: [
            {
              id: 's2-a3-b1',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'Oh no — sorry, that was me.',
              lineCn: '啊——对不起，是我干的。',
              situation: '半杯水顺着桌沿流到你袖子上。他手忙脚乱地站起来。',
              intent: '说没事，只是水',
              chips: ["It's", 'fine', "it's", 'just', 'water', "Don't", 'worry', 'no', 'problem', 'really', 'my', 'bad'],
              solutions: [
                { text: "It's fine, it's just water.", level: 'native', note: '小事故一句 “It’s fine” 就够，不需要长篇安慰，反而显得你没那么在意。' }
              ],
              tip: '“It’s just water.” 的意思是“这不算事”，比 “Never mind” 更轻。'
            },
            {
              id: 's2-a3-b2',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'Let me get you napkins.',
              lineCn: '我去给你拿纸巾。',
              situation: '他已经半站起来，你的袖子还在滴水。',
              intent: '真的不用，别麻烦',
              chips: ["Don't", 'worry', 'about', 'it', 'Seriously', 'No', 'need', 'thanks', 'please', 'I', 'can'],
              solutions: [
                { text: "Don't worry about it. Seriously.", level: 'native', note: '“Seriously.” 单独成句 = 我是认真的，比 please 更有说服力。' }
              ],
              tip: '“Don’t worry about it.” 是英语里最常用的“没事”，后面加 Seriously 表示真的不用再管。'
            },
            {
              id: 's2-a3-b3',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'At least let me buy you a drink.',
              lineCn: '至少让我请你喝点什么。',
              situation: '他掏出饭卡，一脸“你不答应我不走”的表情。',
              intent: '那好，来杯冰茶',
              chips: ['Okay', 'deal', "I'll", 'take', 'an', 'iced', 'tea', 'Fine', 'No', 'thanks', 'water', 'buy'],
              solutions: [
                { text: "Okay, deal. I'll take an iced tea.", level: 'native', note: '“I’ll take…” 是接受/点单时最自然的说法。' },
                { text: "Fine, I'll take an iced tea.", level: 'ok', note: '“Fine” 带一点不情愿，熟人之间可以，刚认识会显得有点冷。' }
              ],
              tip: '接受请客时，“I’ll take…” 比 “I want…” 礼貌得多。'
            }
          ]
        }
      ],
      choice: {
        prompt: '他掏出饭卡：“说真的，想喝什么？”',
        options: [
          { id: 'accept', label: '让他请，点最便宜的', reply: '“那我要冰茶。”', outcome: '冰茶放过来时他说：“We’re even.” 你发现这个人其实挺会照顾人的。' },
          { id: 'decline', label: '摆手说不用', reply: '“真不用。”', outcome: '他耸耸肩：“Suit yourself.” 但走之前，还是把纸巾盒推到了你手边。' }
        ]
      },
      personaClose: {
        warm: 'Leo 后来跟人形容你：“那个新人，被泼了一身还在说 it’s fine。”',
        snark: 'Leo 后来总结你：“嘴比冰茶还凉，但人不错。”',
        chaos: 'Leo 后来学你说话，学得特别像，全桌都笑了。'
      }
    },

    /* ============================= 3 ============================= */
    {
      id: 'group-chat',
      title: 'The Group Chat',
      cn: '群聊里的那句话',
      emoji: '💬',
      level: 'B1',
      minutes: 4,
      hook: '昨晚你在 47 人的班级群里，把 Lily 的作品说成了 “mid”。现在她私聊你了。',
      cast: [{ name: 'Lily', avatar: '🎧', role: '班上做视频最认真的那个人' }, { name: 'Leo', avatar: '🧢', role: '看热闹不嫌事大' }],
      acts: [
        {
          id: 's3-a1',
          title: 'Act 1 · 已读 23:41',
          beats: [
            {
              id: 's3-a1-b1',
              speaker: 'Lily',
              avatar: '🎧',
              line: "So my project was 'mid'?",
              lineCn: '所以我的作品就是“一般般”？',
              situation: '她打了一个引号，把那个词原样还给你。',
              intent: '解释话说出口就变味了，你指的是群里的气氛，不是她的作品',
              chips: ['That', 'came', 'out', 'wrong', 'I', 'meant', 'the', 'group', 'chat', 'not', 'your', 'work', "didn't", 'mean'],
              solutions: [
                { text: 'That came out wrong. I meant the group chat, not your work.', level: 'native', note: '“came out wrong” = 话说出口就变味了，承认失误但不过度道歉。' },
                { text: "That came out wrong. I didn't mean your work.", level: 'ok', note: '同样能懂，但少了解释“我原本指什么”，对方还是不知道你在说什么。' }
              ],
              tip: '道歉时先说 “That came out wrong”，再解释本意 —— 比直接说 sorry 更有效，因为你在解决误会，不是在求原谅。'
            },
            {
              id: 's3-a1-b2',
              speaker: 'Lily',
              avatar: '🎧',
              line: 'Everyone laughed.',
              lineCn: '所有人都笑了。',
              situation: '这句话后面跟了一个句号，不是省略号。她真的生气了。',
              intent: '道歉，并说会在群里也公开说一遍',
              chips: ["I'm", 'sorry', "I'll", 'say', 'it', 'in', 'the', 'group', 'too', 'not', 'really', 'laugh'],
              solutions: [
                { text: "I'm sorry. I'll say it in the group too.", level: 'native', note: '把道歉放到公开场合，比私聊一句 sorry 更有分量。' }
              ],
              tip: '“say it in the group too” = 我也在群里说一遍。承担公开造成的伤害，就要公开修复。'
            },
            {
              id: 's3-a1-b3',
              speaker: 'Lily',
              avatar: '🎧',
              line: 'It took me three weeks.',
              lineCn: '我做了三个星期。',
              situation: '你想起她午休时一直抱着电脑剪片的样子。',
              intent: '承认你该当面说，而不是在群里',
              chips: ['I', 'know', 'I', "should've", 'said', 'that', 'in', 'person', 'group', 'chat', 'but', 'really'],
              solutions: [
                { text: "I know. I should've said that in person.", level: 'native', note: '“should’ve” = should have，口语里几乎永远缩写。' }
              ],
              tip: '“in person” = 当面。这三个词在道歉里非常关键：有些话不该出现在群里。'
            }
          ]
        },
        {
          id: 's3-a2',
          title: 'Act 2 · 对方正在输入',
          beats: [
            {
              id: 's3-a2-b1',
              speaker: 'Lily',
              avatar: '🎧',
              line: 'So what do you want me to do?',
              lineCn: '那你想让我怎么办？',
              situation: '“对方正在输入”跳了三次，最后只来了这一句。',
              intent: '不用她做什么，你只想把误会讲清楚',
              chips: ['Nothing', 'I', 'just', 'wanted', 'to', 'clear', 'it', 'up', 'say', 'sorry', 'you', 'do'],
              solutions: [
                { text: 'Nothing. I just wanted to clear it up.', level: 'native', note: '“clear it up” = 把误会讲清楚，不要求对方立刻原谅，很有分寸。' }
              ],
              tip: '道歉时别急着要一个“没关系”。说 “I just wanted to clear it up.” 反而更容易被接受。'
            },
            {
              id: 's3-a2-b2',
              speaker: 'Lily',
              avatar: '🎧',
              line: 'Fine. But you owe me.',
              lineCn: '行吧。但你欠我的。',
              situation: '她发了一个翻白眼的表情，但语气明显松了。',
              intent: '认了，说请一周奶茶',
              chips: ['Name', 'it', "I'll", 'bring', 'you', 'bubble', 'tea', 'for', 'a', 'week', 'pay', 'back'],
              solutions: [
                { text: "Name it. I'll bring you bubble tea for a week.", level: 'native', note: '“Name it.” = 你开口吧，答应得又快又飒。' }
              ],
              tip: '“You owe me.” 是朋友间半开玩笑的讨债；“Name it.” 是标准回应。'
            },
            {
              id: 's3-a2-b3',
              speaker: 'Lily',
              avatar: '🎧',
              line: 'Starting tomorrow.',
              lineCn: '从明天开始。',
              situation: '她补了一句，“少糖，去冰。”',
              intent: '成交，明天见',
              chips: ['Deal', 'See', 'you', 'tomorrow', 'No', 'way', 'okay', 'later', 'fine', 'bye'],
              solutions: [
                { text: 'Deal. See you tomorrow.', level: 'native', note: '“Deal.” 用在讨价还价结尾，一锤定音。' }
              ],
              tip: '短句连着用（Deal. See you tomorrow.）在聊天里比长句更自然。'
            }
          ]
        },
        {
          id: 's3-a3',
          title: 'Act 3 · 第二天',
          beats: [
            {
              id: 's3-a3-b1',
              speaker: 'Leo',
              avatar: '🧢',
              line: 'So? Did you two make up?',
              lineCn: '怎么样？你俩和好了？',
              situation: '早读前，Leo 靠在你桌边，一脸八卦。',
              intent: '说算是吧，还欠她一周奶茶',
              chips: ['Pretty', 'much', 'I', 'owe', 'her', 'a', 'week', 'of', 'bubble', 'tea', 'no', 'idea', 'maybe'],
              solutions: [
                { text: 'Pretty much. I owe her a week of bubble tea.', level: 'native', note: '“Pretty much” = 差不多是这样，口语超高频。' }
              ],
              tip: '别小看 “Pretty much.” —— 一个短语就能接住“是/否”类问题，还不显得敷衍。'
            },
            {
              id: 's3-a3-b2',
              speaker: 'Leo',
              avatar: '🧢',
              line: "That's a lot of tea.",
              lineCn: '那可是不少奶茶。',
              situation: '他掰着手指数了数，笑了。',
              intent: '自嘲活该，但值得',
              chips: ['I', 'deserve', 'it', 'it', 'but', "it's", 'worth', 'No', 'yes', 'maybe', 'really', 'not'],
              solutions: [
                { text: "I deserve it, but it's worth it.", level: 'native', note: '“deserve” 用来自嘲特别自然；“worth it” 表示值。' }
              ],
              tip: '“I deserve it.” 在自嘲语境里 = 我活该，不是“我应得”。语气轻松，别用得太重。'
            },
            {
              id: 's3-a3-b3',
              speaker: 'Leo',
              avatar: '🧢',
              line: "You're weird. I like it.",
              lineCn: '你挺怪的。我喜欢。',
              situation: '他说完就转回去抄作业，好像刚才那句不算什么。',
              intent: '回一句“彼此彼此”',
              chips: ['Takes', 'one', 'one', 'to', 'know', 'Right', 'back', 'at', 'you', 'thanks', 'same', 'weird'],
              solutions: [
                { text: 'Takes one to know one.', level: 'native', note: '“Takes one to know one.” = 彼此彼此，反击式幽默，朋友之间非常好用。' },
                { text: 'Right back at you.', level: 'native', note: '“Right back at you.” 更温和，同样自然。' }
              ],
              tip: '被朋友调侃时，“Takes one to know one.” 是最高效的反击，而且不会真吵起来。'
            }
          ]
        }
      ],
      choice: {
        prompt: '放学路上，Lily 突然问：“你那天到底为什么那么说？”',
        options: [
          { id: 'truth', label: '说实话：自己考砸了，心里不平衡', reply: '“我考砸了，看到你的东西，酸了。”', outcome: 'Lily 沉默了两秒，然后说：“...okay, that’s actually fair.” 她没有原谅得很快，但你们的对话第一次不像在吵架。' },
          { id: 'light', label: '打个哈哈带过去', reply: '“就嘴欠，别问了。”', outcome: 'Lily 没再追问，只说了一句 “Sure.” 你知道她记住了。有些话，晚一点说也来得及。' }
        ]
      },
      personaClose: {
        warm: 'Lily 后来把你拉进了一个 8 人小群。她说：“大群太吵了。”',
        snark: 'Lily 在群里说：“以后要骂我，私聊。” 然后把你设成了管理员。',
        chaos: '你们的聊天记录被 Lily 截了图，配文：这人道歉都像在讲段子。'
      }
    },

    /* ============================= 4 ============================= */
    {
      id: 'club-audition',
      title: 'Club Audition',
      cn: '社团面试那三分钟',
      emoji: '🎬',
      level: 'B1',
      minutes: 4,
      hook: '广播站招新，候场区坐了十二个人，只招两个。你是一号。',
      cast: [{ name: 'Ren', avatar: '🎬', role: '广播站学姐 / 负责吓人' }, { name: 'Ms. Zhou', avatar: '👓', role: '评委' }],
      acts: [
        {
          id: 's4-a1',
          title: 'Act 1 · 候场区',
          beats: [
            {
              id: 's4-a1-b1',
              speaker: 'Ren',
              avatar: '🎬',
              line: 'Nervous?',
              lineCn: '紧张？',
              situation: '她抱着一叠报名表，靠在你旁边的墙上。',
              intent: '有点，看得出来吗',
              chips: ['A', 'little', 'Is', 'it', 'that', 'obvious', 'No', 'not', 'really', 'yes', 'very', 'much'],
              solutions: [
                { text: 'A little. Is it that obvious?', level: 'native', note: '“Is it that obvious?” 自嘲式反问，能迅速拉近距离。' }
              ],
              tip: '承认紧张不可怕，“A little.” 就够了，比嘴硬说 “No.” 更讨喜。'
            },
            {
              id: 's4-a1-b2',
              speaker: 'Ren',
              avatar: '🎬',
              line: "You'll be fine. Just don't apologize before you start.",
              lineCn: '你会没事的。就是别一上来先道歉。',
              situation: '她说完指了指门，“他们最烦这个。”',
              intent: '记下了，不预先道歉',
              chips: ['Noted', 'No', 'pre-apologizing', 'thanks', 'I', "won't", 'sorry', 'promise', 'okay'],
              solutions: [
                { text: 'Noted. No pre-apologizing.', level: 'native', note: '“Noted.” = 收到，比 “I understand” 更干脆。' }
              ],
              tip: '“Noted.” 是职场/面试里非常干练的回应，一个词就够。'
            },
            {
              id: 's4-a1-b3',
              speaker: 'Ren',
              avatar: '🎬',
              line: "You're up.",
              lineCn: '到你了。',
              situation: '门开了一条缝，里面有人叫你的名字。',
              intent: '说那就上吧（硬着头皮）',
              chips: ['Okay', 'Here', 'goes', 'nothing', 'Wish', 'me', 'luck', 'thanks', "let's", 'go', 'now'],
              solutions: [
                { text: 'Okay. Here goes nothing.', level: 'native', note: '“Here goes nothing.” = 反正也没什么好失去的，硬着头皮上。' }
              ],
              tip: '面试前说 “Here goes nothing.” 是在给自己打气，语气轻松，不会显得没自信。'
            }
          ]
        },
        {
          id: 's4-a2',
          title: 'Act 2 · 那三分钟',
          beats: [
            {
              id: 's4-a2-b1',
              speaker: 'Ms. Zhou',
              avatar: '👓',
              line: 'Why do you want to join?',
              lineCn: '你为什么想加入？',
              situation: '三个人坐在长桌后面，中间那位没有抬头。',
              intent: '想做真的有人看的东西，不是来凑人头',
              chips: ['I', 'want', 'to', 'make', 'stuff', 'things', 'people', 'actually', 'watch', 'not', 'just', 'fill'],
              solutions: [
                { text: 'I want to make stuff people actually watch.', level: 'native', note: '“stuff people actually watch” 是定语从句省略 that，口语里极常见。' },
                { text: 'I want to make things people actually watch.', level: 'ok', note: '完全正确；things 比 stuff 稍正式一点。' }
              ],
              tip: '“actually” 在这里是“真的、确实”，比 very 有力，也更像母语者的强调方式。'
            },
            {
              id: 's4-a2-b2',
              speaker: 'Ms. Zhou',
              avatar: '👓',
              line: "That's a bold answer.",
              lineCn: '这个回答挺大胆。',
              situation: '她终于抬头，眼镜反了一下光。',
              intent: '宁愿诚实，也不想只是说得好听',
              chips: ["I'd", 'rather', 'be', 'honest', 'than', 'impressive', 'No', 'yes', 'sorry', 'maybe', 'really'],
              solutions: [
                { text: "I'd rather be honest than impressive.", level: 'native', note: '“I’d rather A than B” 是表达价值观的高分句型，简洁有力量。' }
              ],
              tip: '“I’d rather be A than B” 可以直接背下来，面试、辩论、写作文都能用。'
            },
            {
              id: 's4-a2-b3',
              speaker: 'Ms. Zhou',
              avatar: '👓',
              line: 'What can you bring to the team?',
              lineCn: '你能给团队带来什么？',
              situation: '这个问题她显然问了十二遍。',
              intent: '剪片快，而且不怕出镜',
              chips: ['I', 'can', 'edit', 'fast', 'and', "I'm", 'not', 'scared', 'of', 'being', 'on', 'camera', 'slow', 'shy'],
              solutions: [
                { text: "I can edit fast, and I'm not scared of being on camera.", level: 'native', note: '具体能力 > 形容词。说 “edit fast” 比 “I’m hardworking” 有说服力。' }
              ],
              tip: '“be scared of + 动名词”：be scared of being on camera（怕出镜）。'
            }
          ]
        },
        {
          id: 's4-a3',
          title: 'Act 3 · 结果',
          beats: [
            {
              id: 's4-a3-b1',
              speaker: 'Ms. Zhou',
              avatar: '👓',
              line: "We don't usually take first-years.",
              lineCn: '我们一般不带高一新生。',
              situation: '她把笔放下，等你知难而退。',
              intent: '那就让我当例外，给我一个月',
              chips: ['Then', 'let', 'me', 'be', 'the', 'exception', 'Give', 'me', 'one', 'month', 'please', 'sorry', 'no'],
              solutions: [
                { text: 'Then let me be the exception. Give me one month.', level: 'native', note: '“Then let me be the exception.” 是主动争取的经典句式。' }
              ],
              tip: '“Then let me be the exception.” —— 不反驳规则，只申请例外，姿态很好。'
            },
            {
              id: 's4-a3-b2',
              speaker: 'Ms. Zhou',
              avatar: '👓',
              line: 'One month?',
              lineCn: '一个月？',
              situation: '她挑了下眉，笔尖停在纸上。',
              intent: '一个月，剪得不好我自己走',
              chips: ['One', 'month', 'If', 'my', 'edits', 'are', 'bad', "I'll", 'leave', 'quietly', 'stay', 'no'],
              solutions: [
                { text: "One month. If my edits are bad, I'll leave quietly.", level: 'native', note: '给自己设一个可验证的期限，是最有说服力的承诺。' }
              ],
              tip: '“leave quietly” = 安静地走人，不闹不赖，比 “I will quit” 更有分寸。'
            },
            {
              id: 's4-a3-b3',
              speaker: 'Ms. Zhou',
              avatar: '👓',
              line: 'Deal. Welcome to the team.',
              lineCn: '成交。欢迎加入。',
              situation: '她伸手，掌心朝上。',
              intent: '说不会让你后悔',
              chips: ['You', "won't", 'regret', 'it', 'Thanks', 'sorry', 'I', 'promise', 'really', 'no'],
              solutions: [
                { text: "You won't regret it.", level: 'native', note: '“You won’t regret it.” 比 “I will do my best” 更有底气。' }
              ],
              tip: '“You won’t regret it.” 是接受机会时最有力量的一句话，短、稳、不用喊。'
            }
          ]
        }
      ],
      choice: {
        prompt: '走出教室，手机在震。你先回谁？',
        options: [
          { id: 'mia', label: '先告诉 Mia', reply: '“我进了。”', outcome: 'Mia 秒回了一串感叹号，然后说：“Told you. Don’t let them make you boring.”' },
          { id: 'home', label: '先给家里打电话', reply: '“妈，我进广播站了。”', outcome: '电话那头愣了一下，然后说：“...那你要顾得上学习啊。” 你笑着说知道了，心里第一次觉得这句话不烦。' }
        ]
      },
      personaClose: {
        warm: 'Ren 在群里评价你：“first-year，但不像。”',
        snark: 'Ren 说：“这孩子进来说的第一句话就挺冲，我喜欢。”',
        chaos: 'Ren 说：“面试全程没人笑，除了他自己。”'
      }
    },

    /* ============================= 5 ============================= */
    {
      id: 'night-before',
      title: 'The Night Before',
      cn: '考前一晚一点半',
      emoji: '🌙',
      level: 'B1',
      minutes: 4,
      hook: '明天上午九点，物理。现在是凌晨一点半，你和 Kai 都还醒着。',
      cast: [{ name: 'Kai', avatar: '🌙', role: '隔壁班 / 一起熬夜的战友' }],
      acts: [
        {
          id: 's5-a1',
          title: 'Act 1 · 1:31 AM',
          beats: [
            {
              id: 's5-a1-b1',
              speaker: 'Kai',
              avatar: '🌙',
              line: 'You still awake?',
              lineCn: '你还醒着？',
              situation: '屏幕亮起来的时候，你已经盯着同一页看了二十分钟。',
              intent: '勉强醒着，脑子一小时前就不转了',
              chips: ['Barely', 'My', 'brain', 'stopped', 'working', 'an', 'hour', 'ago', 'Yes', 'no', 'still', 'tired'],
              solutions: [
                { text: 'Barely. My brain stopped working an hour ago.', level: 'native', note: '“Barely” 一个词就能表达“勉强”，比 “I am very tired” 生动得多。' }
              ],
              tip: '“Barely.” = 勉强、几乎不。问 “Can you hear me?” 也能答 “Barely.”'
            },
            {
              id: 's5-a1-b2',
              speaker: 'Kai',
              avatar: '🌙',
              line: "Same. I've read the same page four times.",
              lineCn: '一样。同一页我读了四遍。',
              situation: '他发来一张照片，书页上全是划到一半的线。',
              intent: '说你只是盯着字看，根本没读进去',
              chips: ['At', 'at', 'this', 'point', "I'm", 'just', 'staring', 'the', 'words', 'reading', 'nothing', 'same', 'really'],
              solutions: [
                { text: "At this point I'm just staring at the words.", level: 'native', note: '“At this point” = 到这会儿，是很自然的时间过渡词。' }
              ],
              tip: '“stare at” = 盯着看。熬夜看书的人最懂这个动作。'
            },
            {
              id: 's5-a1-b3',
              speaker: 'Kai',
              avatar: '🌙',
              line: 'Want to quiz each other?',
              lineCn: '要不要互相抽背？',
              situation: '凌晨一点半，这个提议居然有点诱人。',
              intent: '说实话想，你需要有人骂醒你',
              chips: ['Honestly', 'yes', 'I', 'need', 'someone', 'to', 'yell', 'at', 'me', 'No', 'thanks', 'maybe', 'sure'],
              solutions: [
                { text: 'Honestly? Yes. I need someone to yell at me.', level: 'native', note: '“Honestly?” 单独用，是在坦白之前的停顿，非常口语。' }
              ],
              tip: '“yell at someone” = 冲某人大吼。这里是玩笑用法：需要有人督促我。'
            }
          ]
        },
        {
          id: 's5-a2',
          title: 'Act 2 · 1:52 AM',
          beats: [
            {
              id: 's5-a2-b1',
              speaker: 'Kai',
              avatar: '🌙',
              line: "Okay, what's the formula for the area?",
              lineCn: '好，面积公式是什么？',
              situation: '你脑子里同时冒出三个版本，其中一个肯定是错的。',
              intent: '让他别问，说错一次你就会记住错的',
              chips: ["Don't", 'If', 'I', 'say', 'it', 'wrong', 'wrong', "I'll", 'remember', 'the', 'one', 'no', 'sorry'],
              solutions: [
                { text: "Don't. If I say it wrong, I'll remember the wrong one.", level: 'native', note: '“Don’t.” 一个词打断对方，语气要轻，熟人之间完全没问题。' }
              ],
              tip: '“remember the wrong one” —— 记错的东西最难改，这个表达很地道。'
            },
            {
              id: 's5-a2-b2',
              speaker: 'Kai',
              avatar: '🌙',
              line: 'Fair. Then explain it to me.',
              lineCn: '有道理。那你讲给我听。',
              situation: '你深吸一口气，发现自己其实会。',
              intent: '好，诀窍是先把它翻过来',
              chips: ['Okay', 'so', 'the', 'trick', 'is', 'you', 'flip', 'it', 'first', 'No', 'what', 'really'],
              solutions: [
                { text: 'Okay, so the trick is you flip it first.', level: 'native', note: '“the trick is…” 是讲方法的开场句，比 “the method” 自然得多。' }
              ],
              tip: '“Here’s the trick.” / “The trick is…” —— 讲诀窍的标准开场。'
            },
            {
              id: 's5-a2-b3',
              speaker: 'Kai',
              avatar: '🌙',
              line: 'You actually get it.',
              lineCn: '你是真的懂了。',
              situation: '他发来一个“佩服”的表情，你有点飘。',
              intent: '自嘲：现在懂，明天就忘',
              chips: ['I', 'get', 'it', 'now', 'but', 'ask', 'me', 'tomorrow', 'and', "it's", 'gone', 'really'],
              solutions: [
                { text: "I get it now, but ask me tomorrow and it's gone.", level: 'native', note: '用 but 转折自嘲，是英语口语里很常见的幽默结构。' }
              ],
              tip: '“and it’s gone” = 就没了。省略主语，口语里很自然。'
            }
          ]
        },
        {
          id: 's5-a3',
          title: 'Act 3 · 2:14 AM',
          beats: [
            {
              id: 's5-a3-b1',
              speaker: 'Kai',
              avatar: '🌙',
              line: "If I fail this, my mom's going to freak out.",
              lineCn: '这次要是挂了，我妈会疯的。',
              situation: '这句话他打了又删，删了又打。',
              intent: '那就别挂；不过说到底这只是一次考试',
              chips: ['Then', "don't", 'fail', 'But', 'also', "it's", 'one', 'test', 'not', 'a', 'big', 'deal', 'sorry'],
              solutions: [
                { text: "Then don't fail. But also, it's one test.", level: 'native', note: '“But also” 是在给完建议后补上安慰，朋友之间很常见。' }
              ],
              tip: '“freak out” = 崩溃/炸毛，青少年日常高频词。'
            },
            {
              id: 's5-a3-b2',
              speaker: 'Kai',
              avatar: '🌙',
              line: 'Easy for you to say.',
              lineCn: '你说得倒轻松。',
              situation: '屏幕那头安静了几秒。',
              intent: '也不是，你也怕，但你们都复习了',
              chips: ["It's", 'not', "I'm", 'scared', 'too', 'But', "we've", 'done', 'the', 'work', 'easy', 'really'],
              solutions: [
                { text: "It's not. I'm scared too. But we've done the work.", level: 'native', note: '“It’s not.” 短句反驳，比长篇解释更有力。' }
              ],
              tip: '“Easy for you to say.” 是“站着说话不腰疼”；最好的回应是先承认，再讲事实。'
            },
            {
              id: 's5-a3-b3',
              speaker: 'Kai',
              avatar: '🌙',
              line: 'Thanks. I needed that.',
              lineCn: '谢了。我需要这句话。',
              situation: '两点十四分，你俩都笑了。',
              intent: '随时；现在去睡，说真的',
              chips: ['Anytime', 'Now', 'sleep', 'Seriously', 'No', 'thanks', 'you', 'too', 'good', 'night'],
              solutions: [
                { text: 'Anytime. Now sleep. Seriously.', level: 'native', note: '“Anytime.” 是最轻的“不客气”，朋友之间最常用。' }
              ],
              tip: '“Anytime.” 比 “You’re welcome.” 更亲近，适合朋友。'
            }
          ]
        }
      ],
      choice: {
        prompt: '屏幕暗下去之前，Kai 又发来一条：“明天考完，去不去吃那家新开的？”',
        options: [
          { id: 'yes', label: '去，考完就该庆祝', reply: '“去。考完就去。”', outcome: '他回了一个 OK 的手势。你关了灯，脑子里还在转公式，但心跳慢下来了。' },
          { id: 'maybe', label: '说看情况，先睡', reply: '“看情况吧，先睡。”', outcome: '他回：“Fair. Night.” 你把手机反扣在桌上，第一次在两点前睡着。' }
        ]
      },
      personaClose: {
        warm: '第二天 Kai 跟人说：“昨晚要不是他，我可能通宵了。”',
        snark: 'Kai 说：“他一边说困一边给我讲题，嘴硬得要命。”',
        chaos: 'Kai 说：“他讲题讲到一半自己睡着了，我盯着屏幕等了十分钟。”'
      }
    }
  ];

  return { PERSONAS: PERSONAS, SCENES: SCENES, VERSION: '0.1.0' };
});
