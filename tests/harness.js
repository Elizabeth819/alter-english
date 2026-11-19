/* 极简测试框架 —— 同时支持 Node 与浏览器，零依赖。
 * 用法：const h = ALTER_TEST.create(); h.test(name, fn); h.run()
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ALTER_TEST = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function create() {
    var tests = [];
    var api = {};

    api.test = function (name, fn) {
      tests.push({ name: name, fn: fn });
    };

    api.ok = function (value, msg) {
      if (!value) throw new Error(msg || '期望为真，实际为 ' + JSON.stringify(value));
    };

    api.eq = function (actual, expected, msg) {
      if (actual !== expected) {
        throw new Error((msg || '值不相等') + '：期望 ' + JSON.stringify(expected) + '，实际 ' + JSON.stringify(actual));
      }
    };

    api.deepEq = function (actual, expected, msg) {
      var a = JSON.stringify(actual);
      var b = JSON.stringify(expected);
      if (a !== b) throw new Error((msg || '结构不相等') + '：期望 ' + b + '，实际 ' + a);
    };

    api.throws = function (fn, msg) {
      var threw = false;
      try { fn(); } catch (e) { threw = true; }
      if (!threw) throw new Error(msg || '期望抛出异常，但没有');
    };

    api.run = function () {
      var results = [];
      tests.forEach(function (t) {
        try {
          t.fn();
          results.push({ name: t.name, pass: true });
        } catch (e) {
          results.push({ name: t.name, pass: false, error: e && e.message ? e.message : String(e) });
        }
      });
      var failed = results.filter(function (r) { return !r.pass; });
      return {
        total: results.length,
        passed: results.length - failed.length,
        failed: failed.length,
        results: results
      };
    };

    return api;
  }

  return { create: create };
});
