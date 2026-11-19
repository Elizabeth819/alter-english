/* ALTER 内容目录 —— 把三季拼成一份 SCENES，供 App 与测试使用。
 * 浏览器：index.html 先加载三个 season 文件，最后加载本文件。
 * Node：本文件按顺序 require 三季，方便测试。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./content.js'),
      require('./seasons/season2.js'),
      require('./seasons/season3.js')
    );
  } else {
    root.ALTER_CONTENT = factory(root.ALTER_CONTENT, root.ALTER_SEASON2, root.ALTER_SEASON3);
  }
})(typeof self !== 'undefined' ? self : this, function (season1, season2, season3) {
  'use strict';
  var s2 = season2 || [];
  var s3 = season3 || [];
  var scenes = season1.SCENES.concat(s2).concat(s3);
  return {
    PERSONAS: season1.PERSONAS,
    SCENES: scenes,
    VERSION: '0.3.0',
    SEASONS: [
      { index: 1, title: '第 1 季 · 开学', scenes: season1.SCENES },
      { index: 2, title: '第 2 季 · 校外', scenes: s2 },
      { index: 3, title: '第 3 季 · 往前走', scenes: s3 }
    ]
  };
});
