/* ALTER QR —— 极简二维码编码器（纯函数、零依赖）。
 * 固定 Version 4 / 纠错等级 L / Mask 0：容量 78 字节，足够放线上地址。
 * 浏览器：window.ALTER_QR ；Node：module.exports（供自动化测试）。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ALTER_QR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = 4;
  var SIZE = VERSION * 4 + 17;      // 33
  var DATA_CODEWORDS = 80;
  var EC_CODEWORDS = 20;
  var EC_LEVEL_BITS = 1;            // L
  var MASK = 0;

  /* ---------------- GF(256) / Reed-Solomon ---------------- */

  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xff;
  }

  function polyMul(a, b) {
    var out = [];
    var i;
    for (i = 0; i < a.length + b.length - 1; i++) out.push(0);
    for (i = 0; i < a.length; i++) {
      for (var j = 0; j < b.length; j++) out[i + j] ^= gfMul(a[i], b[j]);
    }
    return out;
  }

  function generator(degree) {
    var g = [1];
    for (var i = 0; i < degree; i++) {
      var factor = 1;
      for (var k = 0; k < i; k++) factor = gfMul(factor, 2);
      g = polyMul(g, [1, factor]);
    }
    return g;
  }

  function rsEncode(data, degree) {
    var gen = generator(degree);
    var res = data.slice();
    for (var i = 0; i < degree; i++) res.push(0);
    for (i = 0; i < data.length; i++) {
      var factor = res[i];
      if (!factor) continue;
      for (var j = 0; j < gen.length; j++) res[i + j] ^= gfMul(gen[j], factor);
    }
    return res.slice(data.length);
  }

  /* ---------------- 数据编码 ---------------- */

  function utf8Bytes(text) {
    var out = [];
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c < 0x80) {
        out.push(c);
      } else if (c < 0x800) {
        out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length) {
        var c2 = text.charCodeAt(++i);
        var cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else {
        out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      }
    }
    return out;
  }

  function makeCodewords(text) {
    var bytes = utf8Bytes(String(text));
    var capacityBits = DATA_CODEWORDS * 8;
    if (4 + 8 + bytes.length * 8 > capacityBits) {
      throw new Error('二维码内容过长：' + bytes.length + ' 字节（上限 78）');
    }
    var bits = [];
    function push(value, length) {
      for (var i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
    }
    push(4, 4);                      // byte mode
    push(bytes.length, 8);
    bytes.forEach(function (b) { push(b, 8); });
    var terminator = Math.min(4, capacityBits - bits.length);
    for (var i = 0; i < terminator; i++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    var data = [];
    for (i = 0; i < bits.length; i += 8) {
      var v = 0;
      for (var j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
      data.push(v);
    }
    var pad = 0xec;
    while (data.length < DATA_CODEWORDS) {
      data.push(pad);
      pad = pad === 0xec ? 0x11 : 0xec;
    }
    return data.concat(rsEncode(data, EC_CODEWORDS));
  }

  /* ---------------- 矩阵 ---------------- */

  function formatBits() {
    var data = (EC_LEVEL_BITS << 3) | MASK;
    var rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    return ((data << 10) | rem) ^ 0x5412;
  }

  function encode(text) {
    var codewords = makeCodewords(text);
    var modules = [];
    var isFn = [];
    var y, x;
    for (y = 0; y < SIZE; y++) {
      modules.push([]);
      isFn.push([]);
      for (x = 0; x < SIZE; x++) { modules[y].push(false); isFn[y].push(false); }
    }

    function set(x0, y0, dark) {
      if (x0 < 0 || y0 < 0 || x0 >= SIZE || y0 >= SIZE) return;
      modules[y0][x0] = !!dark;
      isFn[y0][x0] = true;
    }

    // 时序图形（先画，定位图形会覆盖它）
    for (var i = 0; i < SIZE; i++) {
      set(6, i, i % 2 === 0);
      set(i, 6, i % 2 === 0);
    }

    // 定位图形 + 分隔符
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var dist = Math.max(Math.abs(dx), Math.abs(dy));
          set(cx + dx, cy + dy, dist !== 2 && dist !== 4);
        }
      }
    }
    finder(3, 3);
    finder(SIZE - 4, 3);
    finder(3, SIZE - 4);

    // 校正图形（Version 4 只有右下角一个）
    for (var ay = -2; ay <= 2; ay++) {
      for (var ax = -2; ax <= 2; ax++) {
        set(SIZE - 7 + ax, SIZE - 7 + ay, Math.max(Math.abs(ax), Math.abs(ay)) !== 1);
      }
    }

    // 格式信息
    var fmt = formatBits();
    function bit(n) { return ((fmt >>> n) & 1) !== 0; }
    for (i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6));
    set(8, 8, bit(7));
    set(7, 8, bit(8));
    for (i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (i = 0; i < 8; i++) set(SIZE - 1 - i, 8, bit(i));
    for (i = 8; i < 15; i++) set(8, SIZE - 15 + i, bit(i));
    set(8, SIZE - 8, true);          // 固定暗模块

    // 数据区
    var totalBits = codewords.length * 8;
    var idx = 0;
    for (var right = SIZE - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < SIZE; vert++) {
        for (var j = 0; j < 2; j++) {
          x = right - j;
          var upward = ((right + 1) & 2) === 0;
          y = upward ? SIZE - 1 - vert : vert;
          if (isFn[y][x] || idx >= totalBits) continue;
          modules[y][x] = ((codewords[idx >> 3] >>> (7 - (idx & 7))) & 1) !== 0;
          idx += 1;
        }
      }
    }

    // Mask 0
    for (y = 0; y < SIZE; y++) {
      for (x = 0; x < SIZE; x++) {
        if (!isFn[y][x] && (x + y) % 2 === 0) modules[y][x] = !modules[y][x];
      }
    }

    return { size: SIZE, version: VERSION, ecLevel: 'L', mask: MASK, modules: modules, text: String(text) };
  }

  return { encode: encode, VERSION: VERSION, SIZE: SIZE };
});
