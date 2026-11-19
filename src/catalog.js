/* ALTER 内容目录 —— 把三季拼成一份 SCENES，供 App 与测试使用。
 * 浏览器：先只加载第 1 季，第 2/3 季按需注入（首屏更快，弱网也能先看见）。
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

  var sources = [season1 || null, season2 || null, season3 || null];
  var loading = {};
  var win = typeof window !== 'undefined' ? window : null;

  var api = {
    PERSONAS: (season1 && season1.PERSONAS) || [],
    SCENES: [],
    SEASONS: [],
    VERSION: '1.1.0'
  };

  function rebuild() {
    var scenes = [];
    var seasons = [];
    sources.forEach(function (data, i) {
      var list = data ? (data.SCENES || (Array.isArray(data) ? data : [])) : [];
      scenes = scenes.concat(list);
      seasons.push({
        index: i + 1,
        title: ['第 1 季 · 开学', '第 2 季 · 校外', '第 3 季 · 往前走'][i],
        scenes: list
      });
    });
    api.SCENES.length = 0;
    scenes.forEach(function (s) { api.SCENES.push(s); });
    api.SEASONS.length = 0;
    seasons.forEach(function (s) { api.SEASONS.push(s); });
  }

  api.isSeasonLoaded = function (n) {
    return !!sources[n - 1];
  };

  api.allLoaded = function () {
    return sources.every(function (s) { return !!s; });
  };

  api.addSeason = function (n, data) {
    if (n >= 1 && n <= 3 && data) sources[n - 1] = data;
    rebuild();
    return api;
  };

  /** 浏览器按需加载某一季；Node 下三季已在启动时加载完毕。 */
  api.loadSeason = function (n) {
    if (sources[n - 1]) return Promise.resolve(api);
    if (loading[n]) return loading[n];
    if (!win || !win.document) {
      return Promise.reject(new Error('无法加载第 ' + n + ' 季：当前环境没有 DOM'));
    }
    loading[n] = new Promise(function (resolve, reject) {
      var script = win.document.createElement('script');
      script.src = 'src/seasons/season' + n + '.js';
      script.async = true;
      script.onload = function () {
        var data = win['ALTER_SEASON' + n];
        if (data) api.addSeason(n, data);
        resolve(api);
      };
      script.onerror = function () {
        delete loading[n];
        reject(new Error('第 ' + n + ' 季加载失败'));
      };
      win.document.head.appendChild(script);
    });
    return loading[n];
  };

  rebuild();
  return api;
});
