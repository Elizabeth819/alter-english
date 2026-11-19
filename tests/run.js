#!/usr/bin/env node
/* 测试入口（Node）：node tests/run.js
 * 无任何第三方依赖，Node >= 12 即可运行。
 */
'use strict';

var TEST = require('./harness.js');
var E = require('../src/engine.js');
var C = require('../src/content.js');
var register = require('./spec.js');

var h = TEST.create();
register(h, E, C);

var res = h.run();

res.results.forEach(function (r) {
  console.log((r.pass ? '  \u2713 ' : '  \u2717 ') + r.name + (r.pass ? '' : '\n      ' + r.error));
});

console.log('');
console.log('--------------------------------------------------');
console.log('  通过 ' + res.passed + ' / ' + res.total + '，失败 ' + res.failed);
console.log('--------------------------------------------------');

if (res.failed > 0) process.exitCode = 1;
