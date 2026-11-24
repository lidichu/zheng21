// 二十一弦：少女風 SVG 立繪（主角與 NPC 共用同一套繪製）
(function () {
  'use strict';
  let uid = 0;
  const hx = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
  const dk = (c, t) => mix(c, '#24121c', t);
  const lt = (c, t) => mix(c, '#ffffff', t);
  const f = n => Math.round(n * 10) / 10;

  const HAIR = { 墨黑: '#2E2630', 深棕: '#5B3A2F', 栗子: '#8A593B', 蜂蜜: '#C99859', 櫻粉: '#E9A2B6', 薰衣草: '#A897D8', 薄荷: '#86C8BA', 月白: '#DCD8E6' };
  const EYES = { 墨玉: '#3B2C35', 琥珀: '#B9742E', 蜜茶: '#8E5A3B', 櫻桃: '#D7647F', 紫晶: '#7B5FBE', 湖水: '#3C8FA2', 翡翠: '#3D9468' };
  const SKIN = { 瓷白: '#FCEAE0', 暖杏: '#F7D8C3', 小麥: '#ECC09F', 蜜糖: '#D49E78' };
  const OC = { 櫻: '#F2A7BC', 桃: '#F7B9A1', 藤: '#B7A3E0', 霧藍: '#9DB9E3', 青瓷: '#8FCBBB', 月白: '#EEF0F6', 胭脂: '#C9566E', 墨紺: '#3C4468' };

  const BACKS = { long: '長直髮', wave: '大波浪捲髮', twin: '雙馬尾', pony: '高馬尾', halfup: '公主頭', odango: '雙丸子頭', bob: '鮑伯短髮', bun: '古典盤髮', braid: '側編辮', lowtwin: '低雙麻花辮', short: '清爽短髮' };
  const BANGS = { blunt: '齊瀏海', air: '空氣瀏海', side: '斜瀏海', curtain: '八字瀏海', part: '中分', open: '露額頭', spiky: '碎短瀏海' };
  const OUTFITS = {
    knit: '針織毛衣', sailor: '水手制服', blazer: '音樂班制服', hanfu: '交領漢服', ruqun: '齊胸襦裙',
    qipao: '旗袍風上衣', lace: '蕾絲洋裝', gown: '演出禮服', concert: '黑色演出服', cardigan: '教師針織外套', teagown: '棉麻茶服',
    hoodie: '連帽上衣', coat: '雙排扣大衣', cape: '雪絨斗篷', suit: '西裝', tux: '指揮燕尾服'
  };
  const ACC = { none: '不戴', bow: '蝴蝶結', sakura: '櫻花髮夾', note: '音符髮夾', buyao: '流蘇步搖', jade: '玉簪', pearl: '珍珠髮箍', beret: '貝雷帽' };
  const ACC2 = { none: '不戴', glasses: '細框眼鏡', earring: '珍珠耳墜', tassel: '流蘇耳墜', necklace: '音符頸鍊', choker: '緞帶頸鍊', mole: '淚痣' };

  const AGE = {
    child: { w: 40.5, chin: 143, ey: 110, erx: 11.8, ery: 13.8, sy: 160, sh: 0.82 },
    teen: { w: 39, chin: 150, ey: 105, erx: 10.6, ery: 12.6, sy: 168, sh: 1 },
    adult: { w: 38, chin: 154, ey: 103, erx: 10, ery: 11.4, sy: 172, sh: 1.05 },
    elder: { w: 38, chin: 154, ey: 103, erx: 9.6, ery: 10.6, sy: 172, sh: 1.05 }
  };

  function facePath(g) {
    const w = g.w, c = g.chin, L = 100 - w, R = 100 + w;
    return `M${L} 90 C${L} ${c - 34} ${f(100 - w * .66)} ${c - 15} ${f(100 - w * .28)} ${c - 5} Q100 ${c + 1} ${f(100 + w * .28)} ${c - 5} C${f(100 + w * .66)} ${c - 15} ${R} ${c - 34} ${R} 90 C${R} 58 ${f(100 + w * .55)} 44 100 44 C${f(100 - w * .55)} 44 ${L} 58 ${L} 90Z`;
  }
  function bodyPath(g) {
    const s = g.sh, y = g.sy;
    return `M${f(100 - 74 * s)} 224 C${f(100 - 72 * s)} ${y + 24} ${f(100 - 54 * s)} ${y + 8} ${f(100 - 25 * s)} ${y} L${f(100 + 25 * s)} ${y} C${f(100 + 54 * s)} ${y + 8} ${f(100 + 72 * s)} ${y + 24} ${f(100 + 74 * s)} 224Z`;
  }
  const mirror = d => `<g transform="translate(200 0) scale(-1 1)">${d}</g>`;

  // ---------- 後髮 ----------
  function backHair(o, p) {
    const ol = dk(o.hair, .55);
    const F = `fill="url(#${p}hb)" stroke="${ol}" stroke-width="1" stroke-linejoin="round"`;
    const sl = `fill="none" stroke="${dk(o.hair, .45)}" stroke-width=".9" stroke-linecap="round" opacity=".55"`;
    const gl = `fill="none" stroke="${lt(o.hair, .4)}" stroke-width=".8" stroke-linecap="round" opacity=".35"`;
    // 頭後面看得到的內層頭髮，顏色壓暗，脖子兩側才有深度
    const inner = d => `<path fill="${dk(o.hair, .42)}" d="${d}"/>`;
    const cap = `<path ${F} d="M56 88 C52 42 76 30 100 30 C124 30 148 42 144 88 L144 106 L56 106Z"/>`;
    switch (o.back) {
      case 'long': return `<path ${F} d="M56 80 C52 40 76 28 100 28 C124 28 148 40 144 80 C150 126 154 176 160 214 Q148 222 132 215 Q116 222 100 216 Q84 222 68 215 Q52 222 40 214 C46 176 50 126 56 80Z"/>` +
        inner('M70 116 C70 150 72 186 74 216 L126 216 C128 186 130 150 130 116 Q100 128 70 116Z') +
        `<path ${sl} d="M54 112 C52 150 48 182 44 208 M146 112 C148 150 152 182 156 208 M62 140 C60 168 58 192 56 212 M138 140 C140 168 142 192 144 212"/><path ${gl} d="M51 128 C49 156 47 178 44 198 M149 128 C151 156 153 178 156 198"/>`;
      case 'bob': return `<path ${F} d="M52 86 C48 42 74 28 100 28 C126 28 152 42 148 86 C150 114 152 140 148 158 Q138 165 128 156 L72 156 Q62 165 52 158 C48 140 50 114 52 86Z"/>` +
        inner('M64 118 C64 136 66 148 70 156 L130 156 C134 148 136 136 136 118 Q100 128 64 118Z') +
        `<path ${sl} d="M54 116 C52 132 52 146 56 156 M146 116 C148 132 148 146 144 156"/>`;
      case 'twin': {
        const tail = `<path ${F} d="M62 58 C36 62 24 100 28 140 C31 172 26 196 16 216 C38 212 54 188 56 154 C58 120 60 92 72 72Z"/><path ${sl} d="M50 80 C38 110 40 150 30 196 M58 90 C50 120 52 160 44 200"/><path ${gl} d="M40 86 C32 112 33 140 33 160"/>`;
        return cap + tail + mirror(tail);
      }
      case 'pony': return cap + `<path ${F} d="M118 38 C152 28 174 58 170 100 C167 140 176 176 162 214 C150 186 146 154 146 124 C146 96 140 70 124 58Z"/><path ${sl} d="M150 60 C162 90 156 130 162 190 M158 56 C170 80 166 120 170 160"/><path ${gl} d="M142 50 C154 70 156 92 154 116"/>`;
      case 'bun': return `<circle cx="100" cy="25" r="18" fill="url(#${p}hb)" stroke="${ol}" stroke-width="1"/><path ${sl} d="M86 22 Q100 8 114 22 M88 30 Q100 18 112 30 M84 28 Q92 16 104 12"/><path ${gl} d="M92 14 Q100 10 108 13"/>` + cap;
      case 'wave': return `<path ${F} d="M56 80 C52 40 76 28 100 28 C124 28 148 40 144 80 C154 96 142 110 152 124 C162 140 146 154 156 170 C166 186 150 200 160 216 Q146 222 132 215 Q116 222 100 216 Q84 222 68 215 Q54 222 40 216 C50 200 34 186 44 170 C54 154 38 140 48 124 C58 110 46 96 56 80Z"/>` +
        inner('M70 116 C74 140 66 160 72 186 C76 200 70 210 74 216 L126 216 C130 210 124 200 128 186 C134 160 126 140 130 116 Q100 128 70 116Z') +
        `<path ${sl} d="M56 104 C50 120 58 134 52 150 C46 166 56 180 50 196 M144 104 C150 120 142 134 148 150 C154 166 144 180 150 196 M64 132 C58 148 66 162 60 178 C56 192 62 202 58 212 M136 132 C142 148 134 162 140 178 C144 192 138 202 142 212"/><path ${gl} d="M51 122 C48 132 52 140 49 150 M149 122 C152 132 148 140 151 150 M47 172 C45 182 49 190 46 198 M153 172 C155 182 151 190 154 198"/>`;
      case 'halfup': return `<path ${F} d="M56 80 C52 40 76 28 100 28 C124 28 148 40 144 80 C150 126 154 176 160 214 Q148 222 132 215 Q116 222 100 216 Q84 222 68 215 Q52 222 40 214 C46 176 50 126 56 80Z"/>` +
        inner('M70 116 C70 150 72 186 74 216 L126 216 C128 186 130 150 130 116 Q100 128 70 116Z') +
        `<path ${sl} d="M54 112 C52 150 48 182 44 208 M146 112 C148 150 152 182 156 208"/><path ${gl} d="M51 128 C49 156 47 178 44 198 M149 128 C151 156 153 178 156 198"/>` +
        // 頭頂後方綁起的小髮髻
        `<ellipse cx="100" cy="22" rx="13" ry="9" fill="url(#${p}hb)" stroke="${ol}" stroke-width="1"/><path ${sl} d="M90 21 Q100 13 110 21 M92 26 Q100 19 108 26"/>`;
      case 'odango': {
        const bun = `<circle cx="68" cy="30" r="14" fill="url(#${p}hb)" stroke="${ol}" stroke-width="1"/><path ${sl} d="M58 30 Q60 19 70 18 Q79 20 80 28 M61 37 Q66 27 76 31"/><path ${gl} d="M62 23 Q67 19 73 20"/>`;
        return bun + mirror(bun) + cap;
      }
      case 'braid':
      case 'lowtwin': return cap;
      case 'short': return `<path ${F} d="M56 98 C50 46 76 30 100 30 C124 30 150 46 144 98 L144 106 L56 106Z"/>`;
    }
    return cap;
  }
  // 天使光環：沿著頭頂弧線的一條光帶，上緣平滑、下緣順著髮流長短交錯，兩端收細
  function shine(o) {
    // 露額頭的髮際線比較高，光帶跟著往上移
    const N = 17, top = [], bot = [], up0 = o.bang === 'open' ? 7 : 0;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1), a = Math.PI * (1.13 + .74 * t);
      const px = 100 + 34 * Math.cos(a), py = 69 - up0 + 22 * Math.sin(a);
      const dx = px - 100, dy = py - 24, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const k = Math.sin(Math.PI * t), up = 1.6 * k, dn = (i % 2 ? 1.4 : [4.2, 5.6, 3.4][i % 3]) * k + .2;
      top.push(`${f(px - ux * up)} ${f(py - uy * up)}`);
      bot.unshift(`${f(px + ux * dn)} ${f(py + uy * dn)}`);
    }
    return `<path d="M${top.join(' L')} L${bot.join(' L')}Z" fill="${lt(o.hair, .62)}" opacity=".6"/>` +
      `<path d="M76 ${56 - up0} Q84 ${50.5 - up0} 92 ${49 - up0}" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".45"/>`;
  }

  // ---------- 瀏海與鬢髮 ----------
  const BANG_D = {
    blunt: 'M56 98 C52 52 74 33 100 33 C126 33 148 52 144 98 C141 91 139 85 137 80 L129 89 L121 80 L111 88 L100 79 L89 88 L79 80 L71 89 L63 80 C61 86 59 92 56 98Z',
    air: 'M56 98 C52 52 74 33 100 33 C126 33 148 52 144 98 C141 84 133 73 125 68 L121 88 L113 70 L105 90 L97 70 L89 88 L81 68 C71 72 61 84 56 98Z',
    side: 'M56 100 C52 52 74 33 100 33 C128 33 148 54 144 100 C139 87 133 75 126 68 C117 82 99 90 74 93 C67 93 61 96 56 100Z',
    part: 'M56 102 C52 52 74 33 100 33 C126 33 148 52 144 102 C139 81 125 62 103 52 L100 59 L97 52 C75 62 61 81 56 102Z',
    spiky: 'M56 98 C50 50 74 31 100 31 C128 31 150 50 144 98 L138 83 L132 92 L124 75 L116 88 L106 73 L98 88 L88 73 L82 90 L72 77 L66 92Z',
    // 八字瀏海：中間分開、往兩側掀開，露出拱形的額頭
    curtain: 'M56 100 C52 52 74 33 100 33 C126 33 148 52 144 100 C141 90 134 84 126 82 C116 80 108 74 103 62 L100 66 L97 62 C92 74 84 80 74 82 C66 84 59 90 56 100Z',
    // 露額頭：沒有瀏海，髮際線帶一點美人尖
    open: 'M56 100 C52 52 74 33 100 33 C126 33 148 52 144 100 C142 80 136 62 126 54 C116 48 106 47 100 50 C94 47 84 48 74 54 C64 62 58 80 56 100Z'
  };
  const bangPath = o => BANG_D[o.bang] || BANG_D.blunt;
  function frontHair(o, p, g) {
    const F = `fill="url(#${p}hf)" stroke="${dk(o.hair, .55)}" stroke-width=".9" stroke-linejoin="round"`;
    const line = `fill="none" stroke="${dk(o.hair, .42)}" stroke-width=".9" stroke-linecap="round" opacity=".55"`;
    const gloss = `fill="none" stroke="${lt(o.hair, .45)}" stroke-width=".7" stroke-linecap="round" opacity=".4"`;
    let out = '';
    // 鬢髮
    if (o.back === 'long') {
      const s = `<path ${F} d="M61 80 C54 110 58 150 50 194 Q58 200 66 190 C71 156 71 114 73 90Z"/><path ${line} d="M62 100 C60 130 60 160 56 186 M68 110 C67 140 66 164 63 184"/><path ${gloss} d="M65 96 C64 120 63 140 61 160"/>`;
      out += s + mirror(s);
    } else if (o.back === 'wave') {
      const s = `<path ${F} d="M61 80 C50 98 67 114 56 134 C45 154 65 168 52 186 C47 195 55 205 65 199 C71 194 65 186 67 182 C76 166 61 152 70 136 C79 120 66 104 73 90Z"/><path ${line} d="M64 98 C56 112 67 124 59 140 C51 156 65 168 57 182 M66 186 C64 192 58 194 55 191"/><path ${gloss} d="M66 104 C62 112 67 120 63 130 M62 150 C58 158 62 166 58 174"/>`;
      out += s + mirror(s);
    } else if (o.back === 'halfup') {
      // 公主頭：鬢邊的頭髮往後收，只留細細一綹
      const s = `<path ${F} d="M60 84 C55 108 57 136 54 160 Q60 164 64 156 C66 132 67 108 69 92Z"/><path ${line} d="M61 100 C60 120 60 136 58 152"/>`;
      out += s + mirror(s);
    } else if (o.back === 'bob') {
      const s = `<path ${F} d="M57 84 C51 112 53 140 59 157 Q69 160 74 151 C70 130 70 104 72 88Z"/><path ${line} d="M62 100 C60 120 61 138 64 152"/>`;
      out += s + mirror(s);
    } else if (o.back === 'short') {
      const s = `<path ${F} d="M59 86 L61 116 L67 98Z"/>`;
      out += s + mirror(s);
    } else {
      const s = `<path ${F} d="M60 82 C55 104 57 132 62 148 C67 141 69 118 70 94Z"/><path ${line} d="M62 98 C61 116 62 130 63 140"/>`;
      out += s + mirror(s);
    }
    // 瀏海：本體、髮尾漸暗、髮絲線、反光線
    out += `<path ${F} d="${bangPath(o)}"/><path fill="url(#${p}hs)" d="${bangPath(o)}"/>`;
    const strands = {
      blunt: 'M70 56 C67 68 66 78 66 86 M79 50 C77 62 78 72 79 82 M90 47 C89 60 89 72 89 84 M100 46 C99 60 100 70 100 80 M110 47 C111 60 111 72 111 84 M121 50 C123 62 122 72 121 82 M130 56 C133 68 134 78 134 86',
      air: 'M81 58 C80 66 80 72 81 80 M89 52 C88 66 89 78 89 88 M97 52 C96 62 97 70 97 80 M105 50 C104 66 105 80 105 90 M113 52 C113 62 113 70 113 80 M121 52 C122 62 121 74 121 88',
      side: 'M120 46 C110 62 92 78 76 90 M132 56 C124 70 112 80 98 88 M110 42 C100 56 86 70 70 86 M138 66 C134 74 128 80 120 84',
      part: 'M100 40 C96 46 84 56 72 72 M100 40 C104 46 116 56 128 72 M98 44 C90 52 78 66 66 86 M102 44 C110 52 122 66 134 86',
      spiky: 'M78 52 C78 62 77 70 76 77 M88 46 C88 58 88 66 88 73 M98 46 C98 58 98 66 98 80 M106 44 C106 58 106 66 106 73 M116 48 C116 58 116 68 116 80 M126 54 C126 64 126 70 125 76',
      curtain: 'M100 40 C100 50 101 56 102 60 M104 42 C108 56 116 70 126 80 M96 42 C92 56 84 70 74 80 M110 44 C118 58 128 72 136 88 M90 44 C82 58 72 72 64 88',
      open: 'M100 36 Q100 42 100 48 M90 38 C84 42 76 48 68 58 M110 38 C116 42 124 48 132 58 M80 44 C72 52 66 62 62 76 M120 44 C128 52 134 62 138 76'
    };
    const glosses = {
      blunt: 'M84 50 C83 60 83 70 84 78 M116 50 C117 60 117 70 116 78',
      air: 'M93 54 C92 64 93 72 93 80 M117 54 C117 62 117 70 117 78',
      side: 'M126 52 C118 64 106 74 92 82',
      part: 'M96 48 C88 56 80 66 74 78 M104 48 C112 56 120 66 126 78',
      spiky: 'M83 50 C83 58 83 64 82 70 M111 48 C111 56 111 64 111 70',
      curtain: 'M93 48 C88 60 82 70 76 76 M107 48 C112 60 118 70 124 76',
      open: 'M86 42 C80 46 74 52 70 60 M114 42 C120 46 126 52 130 60'
    };
    out += `<path ${line} d="${strands[o.bang] || strands.blunt}"/><path ${gloss} d="${glosses[o.bang] || glosses.blunt}"/>`;
    out += shine(o);
    // 麻花辮：一節一節交錯的辮子，垂在肩膀前面
    const braid = (x0, y0, n, sz) => {
      let b = `<path ${F} d="M${x0 - 4} 86 C${x0 - 8} 98 ${x0 - 6} 108 ${x0} ${y0 + 2} L${x0 + 8} ${y0 - 4} C${x0 + 6} 100 ${x0 + 6} 92 ${x0 + 8} 86Z"/>`;
      const N = Math.round(n * 1.45), gap = 9 * sz;
      for (let i = 0; i < N; i++) {
        const y = y0 + i * gap, x = x0 + Math.sin(i * .35) * 2 + i * .4, r = i % 2 ? 32 : -32;
        b += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f((8.8 - i * .22) * sz)}" ry="${f(6.2 * sz)}" fill="url(#${p}hf)" stroke="${dk(o.hair, .45)}" stroke-width=".8" transform="rotate(${r} ${f(x)} ${f(y)})"/>` +
          `<path d="M${f(x - 5 * sz)} ${f(y - 1.4 * sz)} Q${f(x)} ${f(y - 4.6 * sz)} ${f(x + 5 * sz)} ${f(y - 1.4 * sz)}" fill="none" stroke="${lt(o.hair, .45)}" stroke-width=".7" opacity=".5" transform="rotate(${r} ${f(x)} ${f(y)})"/>`;
      }
      const ex = f(x0 + Math.sin(N * .35) * 2 + N * .4), ey = f(y0 + N * gap - 3 * sz);
      return b + `<path fill="none" stroke="${dk(o.hair, .4)}" stroke-width="1.2" d="M${ex - 2} ${ey + 2} l-5 11 M${ex} ${ey + 2} v12 M${ex + 2} ${ey + 2} l5 11"/>` +
        `<circle cx="${ex}" cy="${f(ey - 1)}" r="3.2" fill="#F2A7BC" stroke="#fff" stroke-width=".8"/>`;
    };
    if (o.back === 'braid') out += braid(62, 112, 8, 1);
    if (o.back === 'lowtwin') { const b = braid(60, 124, 6, .9); out += b + mirror(b); }
    if (o.back === 'twin') {
      const tie = `<circle cx="64" cy="62" r="5" fill="#F07C9E"/><circle cx="62.5" cy="60.5" r="1.6" fill="#fff" opacity=".8"/>`;
      out += tie + mirror(tie);
    }
    if (o.back === 'odango') {
      // 丸子底下綁一圈髮帶，垂下兩條短緞帶
      const tie = `<path d="M57 40 Q68 46 80 40" fill="none" stroke="#F07C9E" stroke-width="2.6" stroke-linecap="round"/><path d="M62 43 l-3 9 l3 -2 l2 3Z M66 44 l1 10 l2 -3 l3 1Z" fill="#E0566F"/>`;
      out += tie + mirror(tie);
    }
    if (o.back === 'halfup') out += `<path d="M88 27 Q100 33 112 27" fill="none" stroke="#F07C9E" stroke-width="2.4" stroke-linecap="round"/>`;
    if (o.back === 'pony') out += `<path d="M118 40 Q124 32 130 40 Q124 46 118 40Z" fill="#F07C9E"/>`;
    return out;
  }

  // ---------- 五官 ----------
  // 二次曲線的中點會落在 (起點 + 2×控制點 + 終點) / 4；反推控制點，讓眼皮剛好蓋住眼白上緣
  const ctrlFor = (mid, a, b) => (4 * mid - a - b) / 2;
  function eyeOne(o, p, g, cx, side, ey) {
    const rx = g.erx * (o.m ? .9 : 1), ry = g.ery * (o.m ? .82 : 1);
    const lash = o.m ? dk(o.hair, .62) : dk(mix(o.hair, '#2a1820', .65), .45);
    const id = `${p}e${side < 0 ? 'l' : 'r'}`;
    const top = ey - ry, out = cx + side * (rx + 2.6), inn = cx - side * (rx + 1.2);
    const ix = cx - side * .4, iy = ey + 1.6, irx = rx * .84, iry = ry * .92;
    let s = `<clipPath id="${id}"><ellipse cx="${cx}" cy="${ey}" rx="${rx}" ry="${ry}"/></clipPath>`;
    s += `<ellipse cx="${cx}" cy="${ey}" rx="${rx}" ry="${ry}" fill="url(#${p}sc)"/>`;
    s += `<g clip-path="url(#${id})">`;
    s += `<ellipse cx="${f(ix)}" cy="${f(iy)}" rx="${f(irx)}" ry="${f(iry)}" fill="url(#${p}ir)"/>`;
    // 虹膜紋理：從瞳孔放射出去的細線
    let rays = '';
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * Math.PI * 2;
      rays += `M${f(ix + Math.cos(a) * irx * .44)} ${f(iy + Math.sin(a) * iry * .44)}L${f(ix + Math.cos(a) * irx * .88)} ${f(iy + Math.sin(a) * iry * .88)}`;
    }
    s += `<path d="${rays}" stroke="${lt(o.eye, .5)}" stroke-width=".5" opacity=".4"/>`;
    // 下半部的透光：一彎淺色月牙
    s += `<path d="M${f(ix - irx * .72)} ${f(iy + iry * .28)} Q${f(ix)} ${f(iy + iry * 1.08)} ${f(ix + irx * .72)} ${f(iy + iry * .28)} Q${f(ix)} ${f(iy + iry * .66)} ${f(ix - irx * .72)} ${f(iy + iry * .28)}Z" fill="${lt(o.eye, .66)}" opacity=".75"/>`;
    s += `<ellipse cx="${f(ix)}" cy="${f(iy + .6)}" rx="${f(rx * .33)}" ry="${f(ry * .42)}" fill="${dk(o.eye, .66)}"/>`;
    s += `<ellipse cx="${f(ix)}" cy="${f(iy)}" rx="${f(irx)}" ry="${f(iry)}" fill="none" stroke="${dk(o.eye, .55)}" stroke-width="${f(rx * .1)}"/>`;
    // 上眼皮投下的陰影
    s += `<ellipse cx="${cx}" cy="${f(top + ry * .08)}" rx="${f(rx * 1.2)}" ry="${f(ry * .5)}" fill="${dk(o.eye, .62)}" opacity=".42"/>`;
    s += `</g>`;
    // 高光：主光、反光，女生多一顆小星光
    const hx1 = cx - rx * .3, hy1 = ey - ry * .28;
    s += `<ellipse cx="${f(hx1)}" cy="${f(hy1)}" rx="${f(rx * .28)}" ry="${f(ry * .22)}" transform="rotate(-28 ${f(hx1)} ${f(hy1)})" fill="#fff"/>`;
    s += `<circle cx="${f(cx + rx * .36)}" cy="${f(ey + ry * .42)}" r="${f(rx * .11)}" fill="#fff" opacity=".9"/>`;
    if (!o.m) s += star(cx + rx * .42, ey - ry * .16, rx * .065, '#fff');
    // 上眼皮：一條外粗內細的實心弧
    const ay = ey - ry * .28, by = ey - ry * .52, th = o.m ? 1.4 : 2.4;
    const kx = f(cx - side * rx * .15);
    s += `<path d="M${f(inn)} ${f(ay)} Q${kx} ${f(ctrlFor(top - 1, ay, by))} ${f(out)} ${f(by)} L${f(out - side * 1.4)} ${f(by + th)} Q${kx} ${f(ctrlFor(top + th, ay + 1, by + th))} ${f(inn + side * .6)} ${f(ay + 1)}Z" fill="${lash}"/>`;
    // 雙眼皮摺線
    s += `<path d="M${f(cx - side * rx * .5)} ${f(top - 3.4)} Q${f(cx + side * rx * .25)} ${f(top - 6.2)} ${f(cx + side * rx * 1.05)} ${f(top - 2.4)}" fill="none" stroke="${lash}" stroke-width=".8" stroke-linecap="round" opacity=".45"/>`;
    if (!o.m) {
      // 眼尾翹起的兩根睫毛
      s += `<path d="M${f(out - side * 1.2)} ${f(by + .4)} Q${f(out + side * 2.4)} ${f(by - 1)} ${f(out + side * 4)} ${f(by - 3.6)} Q${f(out + side * 1.8)} ${f(by + .4)} ${f(out - side * .4)} ${f(by + 2.6)}Z" fill="${lash}"/>`;
      s += `<path d="M${f(out - side * 3.6)} ${f(by - 1.2)} Q${f(out - side * .6)} ${f(by - 3.2)} ${f(out + side * .8)} ${f(by - 5.4)} Q${f(out - side * .8)} ${f(by - 2)} ${f(out - side * 2.6)} ${f(by)}Z" fill="${lash}"/>`;
      // 下睫毛：眼尾一小段和兩根短睫毛
      s += `<path d="M${f(cx + side * rx * .3)} ${f(ey + ry * 1.02)} Q${f(cx + side * rx * .92)} ${f(ey + ry * .78)} ${f(out - side * .9)} ${f(ey + ry * .08)}" fill="none" stroke="${lash}" stroke-width=".9" stroke-linecap="round" opacity=".6"/>`;
      s += `<path d="M${f(cx + side * rx * .86)} ${f(ey + ry * .66)} l${f(side * 1.1)} 1.1" stroke="${lash}" stroke-width=".6" stroke-linecap="round" opacity=".45"/>`;
    }
    s += `<path d="M${f(cx - rx * .55)} ${f(ey + ry + .7)} Q${cx} ${f(ey + ry + 2)} ${f(cx + rx * .55)} ${f(ey + ry + .7)}" fill="none" stroke="#D9899B" stroke-width=".8" stroke-linecap="round" opacity=".6"/>`;
    return s;
  }
  function closedEye(o, g, cx, side, ey) {
    const rx = g.erx, lash = o.m ? dk(o.hair, .62) : dk(mix(o.hair, '#2a1820', .65), .45);
    let s = `<path d="M${f(cx - rx)} ${f(ey + 2)} Q${cx} ${f(ey - 8)} ${f(cx + rx)} ${f(ey + 2)}" fill="none" stroke="${lash}" stroke-width="2.8" stroke-linecap="round"/>`;
    if (!o.m) s += `<path d="M${f(cx + side * rx * .92)} ${f(ey + .6)} q${f(side * 2.6)} -1.2 ${f(side * 4)} -3.4 q${f(-side * .6)} 2.6 ${f(-side * 3)} 4.6Z" fill="${lash}"/>`;
    return s;
  }
  function brows(o, g, ey, expr) {
    const c = dk(o.hair, .3), w = o.m ? 2.8 : 1.9, y = ey - g.ery - 9;
    const t = expr === 'sad' ? [4, -3] : expr === 'surprised' ? [-3, -3] : expr === 'neutral' ? [0, 0] : [-1, 0];
    // 眉頭粗、眉尾收尖
    const one = (xi, xo) => {
      const mx = (xi + xo) / 2, yi = y + t[0], yo = y + t[1] + 2, my = y - 3 + t[1];
      return `<path d="M${xi} ${f(yi)} Q${f(mx)} ${f(my)} ${xo} ${f(yo)} Q${f(mx)} ${f(my + w * .9)} ${xi} ${f(yi + w)}Z" fill="${c}"/>`;
    };
    return one(91, 68) + one(109, 132);
  }
  function mouth(o, g, expr) {
    const y = g.chin - 16, lip = '#B4566A';
    switch (expr) {
      case 'happy': return `<path d="M91 ${y - 2} Q100 ${y - 1} 109 ${y - 2} Q107 ${y + 8} 100 ${y + 8} Q93 ${y + 8} 91 ${y - 2}Z" fill="#B84A62" stroke="#9C3A52" stroke-width=".8" stroke-linejoin="round"/><path d="M92.6 ${y - 1.4} Q100 ${y - .6} 107.4 ${y - 1.4} L107 ${y + .4} Q100 ${y + 1} 93 ${y + .4}Z" fill="#fff" opacity=".9"/><path d="M94 ${y + 4.4} Q100 ${y + 1.6} 106 ${y + 4.4} Q103 ${y + 7.2} 100 ${y + 7.2} Q97 ${y + 7.2} 94 ${y + 4.4}Z" fill="#F29AAE"/>`;
      case 'sad': return `<path d="M94 ${y + 3} Q100 ${y - 1} 106 ${y + 3}" fill="none" stroke="${lip}" stroke-width="1.6" stroke-linecap="round"/>`;
      case 'surprised': return `<ellipse cx="100" cy="${y + 2}" rx="3.4" ry="4.2" fill="#B84A62" stroke="#9C3A52" stroke-width=".7"/><ellipse cx="100" cy="${y + 4}" rx="2" ry="1.6" fill="#F29AAE"/>`;
      case 'neutral': return `<path d="M95 ${y + 1} Q100 ${y + 1.8} 105 ${y + 1}" fill="none" stroke="${lip}" stroke-width="1.5" stroke-linecap="round"/>`;
      default: return `<path d="M93 ${y} Q100 ${y + 5.5} 107 ${y}" fill="none" stroke="${lip}" stroke-width="1.6" stroke-linecap="round"/><path d="M97.6 ${y + 5.4} Q100 ${y + 6.6} 102.4 ${y + 5.4}" fill="none" stroke="#E79AAC" stroke-width=".9" stroke-linecap="round" opacity=".7"/>`;
    }
  }
  function face(o, p, g) {
    const expr = o.expr || 'smile', ey = g.ey;
    let s = '';
    if (expr === 'happy') s += closedEye(o, g, 81, -1, ey) + closedEye(o, g, 119, 1, ey);
    else s += eyeOne(o, p, g, 81, -1, ey) + eyeOne(o, p, g, 119, 1, ey);
    s += brows(o, g, ey, expr);
    // 鼻子：一筆陰影加一點鼻樑高光
    s += `<path d="M99.8 ${ey + 14} q-1.4 2.8 -.8 4.4" fill="none" stroke="${dk(o.skin, .3)}" stroke-width="1.1" stroke-linecap="round"/><ellipse cx="101.6" cy="${ey + 13}" rx=".8" ry="1.6" fill="#fff" opacity=".5"/>`;
    if (!o.m || expr === 'happy') {
      const by = ey + 17;
      s += `<ellipse cx="75" cy="${by}" rx="9" ry="4.4" fill="url(#${p}bl)"/><ellipse cx="125" cy="${by}" rx="9" ry="4.4" fill="url(#${p}bl)"/>`;
      s += `<path d="M71 ${by - 1} l-1.8 3 M75 ${by - 1.4} l-1.8 3 M79 ${by - 1} l-1.8 3 M121 ${by - 1} l1.8 3 M125 ${by - 1.4} l1.8 3 M129 ${by - 1} l1.8 3" stroke="#E07C93" stroke-width=".9" stroke-linecap="round" opacity=".55"/>`;
      s += `<ellipse cx="70" cy="${by - 3.4}" rx="1.6" ry=".9" fill="#fff" opacity=".7"/><ellipse cx="120" cy="${by - 3.4}" rx="1.6" ry=".9" fill="#fff" opacity=".7"/>`;
    }
    if (o.age === 'elder') {
      // 眼尾笑紋與法令紋，淡淡的
      const w = dk(o.skin, .3);
      s += `<path d="M${f(81 - g.erx - 4)} ${ey + 3} l-3.4 1.6 M${f(81 - g.erx - 4)} ${ey + 6} l-3 2.6 M${f(119 + g.erx + 4)} ${ey + 3} l3.4 1.6 M${f(119 + g.erx + 4)} ${ey + 6} l3 2.6 M90 ${g.chin - 24} q-3 4 -2 9 M110 ${g.chin - 24} q3 4 2 9" fill="none" stroke="${w}" stroke-width=".8" stroke-linecap="round" opacity=".45"/>`;
    }
    if (expr === 'sad') s += `<path d="M${120 + g.erx} ${ey + 6} q2 5 0 8 q-2 -3 0 -8Z" fill="#9FD3F0" opacity=".85"/><path d="M${120.6 + g.erx} ${ey + 9} l.4 2" stroke="#fff" stroke-width=".7" stroke-linecap="round"/>`;
    s += mouth(o, g, expr);
    return s;
  }

  // ---------- 服裝 ----------
  function outfit(o, p, g) {
    const y = g.sy, s = g.sh, c = o.oc;
    const X = d => f(100 + d * s);
    const base = col => `<path d="${bodyPath(g)}" fill="${col}"/>`;
    const shade = `<path d="${bodyPath(g)}" fill="url(#${p}bs)"/><path d="${bodyPath(g)}" fill="url(#${p}bt)"/>`;
    const edge = `<path d="${bodyPath(g)}" fill="none" stroke="#4A2A38" stroke-opacity=".38" stroke-width="1.8"/>`;
    // 腋下到肩膀的衣褶
    const fold = (col, op = .4) => `<path d="M${X(-62)} 224 C${X(-61)} ${y + 42} ${X(-56)} ${y + 28} ${X(-48)} ${y + 20} M${X(62)} 224 C${X(61)} ${y + 42} ${X(56)} ${y + 28} ${X(48)} ${y + 20} M${X(-52)} 224 C${X(-52)} ${y + 50} ${X(-50)} ${y + 42} ${X(-46)} ${y + 36}" fill="none" stroke="${col}" stroke-width="1.1" stroke-linecap="round" opacity="${op}"/>`;
    const ln = (d, col, w = 1, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"${extra.includes('linecap') ? '' : ' stroke-linecap="round"'} stroke-linejoin="round"${extra}/>`;
    let out = '', over = '';
    switch (o.outfit) {
      case 'sailor': {
        const nc = o.oc === OC.月白 ? '#3C4468' : c, rib = '#E0566F', ribD = '#B83E57';
        out += base('#FBFAFD') + fold('#8A7A90', .35) +
          `<path d="M${X(-70)} ${y + 22} L100 ${y + 62} L${X(70)} ${y + 22} L${X(26)} ${y - 4} L100 ${y + 38} L${X(-26)} ${y - 4}Z" fill="${nc}" stroke="${dk(nc, .35)}" stroke-width=".9" stroke-linejoin="round"/>` +
          ln(`M${X(-63)} ${y + 23} L100 ${y + 56} L${X(63)} ${y + 23}`, '#fff', 1.6) + ln(`M${X(-57)} ${y + 24.5} L100 ${y + 51} L${X(57)} ${y + 24.5}`, '#fff', .9) +
          ln(`M${X(-24)} ${y + 1} L100 ${y + 42} L${X(24)} ${y + 1}`, dk(nc, .3), 1.2, ' opacity=".5"') +
          // 領巾：兩個蝴蝶結圈、結、兩條尾巴，加上摺痕
          `<path d="M100 ${y + 42} C90 ${y + 34} 80 ${y + 38} 84 ${y + 48} C88 ${y + 54} 96 ${y + 48} 100 ${y + 44}Z M100 ${y + 42} C110 ${y + 34} 120 ${y + 38} 116 ${y + 48} C112 ${y + 54} 104 ${y + 48} 100 ${y + 44}Z" fill="${rib}" stroke="${ribD}" stroke-width=".8" stroke-linejoin="round"/>` +
          ln(`M98 ${y + 42.6} C93 ${y + 39} 88 ${y + 40} 87 ${y + 45} M102 ${y + 42.6} C107 ${y + 39} 112 ${y + 40} 113 ${y + 45}`, ribD, .8, ' opacity=".7"') +
          ln(`M86 ${y + 40} Q89 ${y + 37.5} 93 ${y + 38.4} M114 ${y + 40} Q111 ${y + 37.5} 107 ${y + 38.4}`, '#fff', .9, ' opacity=".55"') +
          `<path d="M97 ${y + 45} L90 ${y + 66} L96 ${y + 63} L100 ${y + 47} L104 ${y + 63} L110 ${y + 66} L103 ${y + 45}Z" fill="${ribD}" stroke="${dk(ribD, .25)}" stroke-width=".7" stroke-linejoin="round"/>` +
          `<ellipse cx="100" cy="${y + 44}" rx="3.6" ry="3.2" fill="${ribD}" stroke="${dk(ribD, .25)}" stroke-width=".7"/><ellipse cx="99" cy="${y + 43}" rx="1.3" ry=".8" fill="#fff" opacity=".5"/>`;
        break;
      }
      case 'blazer': {
        const jc = c === OC.月白 ? '#3C4468' : dk(c, .25), lap = lt(jc, .08), lapD = dk(jc, .35);
        out += base(jc) + fold(dk(jc, .45), .55) + `<path d="M${X(-15)} ${y - 2} L100 ${y + 46} L${X(15)} ${y - 2}Z" fill="#FBFAFD"/>` +
          // 襯衫領尖
          `<path d="M${X(-15)} ${y - 3} L${X(-3)} ${y + 11} L${X(-12)} ${y + 13}Z M${X(15)} ${y - 3} L${X(3)} ${y + 11} L${X(12)} ${y + 13}Z" fill="#fff" stroke="#CFC4D2" stroke-width=".7" stroke-linejoin="round"/>` +
          `<path d="M${X(-15)} ${y - 2} L${X(-33)} ${y + 6} L${X(-13)} ${y + 54} L100 ${y + 46}Z M${X(15)} ${y - 2} L${X(33)} ${y + 6} L${X(13)} ${y + 54} L100 ${y + 46}Z" fill="${lap}" stroke="${lapD}" stroke-width=".9" stroke-linejoin="round"/>` +
          ln(`M${X(-29)} ${y + 8} L${X(-12)} ${y + 49} M${X(29)} ${y + 8} L${X(12)} ${y + 49}`, lt(jc, .35), .6, ' stroke-dasharray="1.6 1.4" opacity=".7"') +
          // 領結緞帶
          `<path d="M100 ${y + 8} C96 ${y + 3} 90 ${y + 1} 89 ${y + 5} C88 ${y + 10} 92 ${y + 14} 100 ${y + 9}Z M100 ${y + 8} C104 ${y + 3} 110 ${y + 1} 111 ${y + 5} C112 ${y + 10} 108 ${y + 14} 100 ${y + 9}Z" fill="#E0566F" stroke="#B83E57" stroke-width=".7"/>` +
          `<path d="M98.6 ${y + 9} L95 ${y + 22} L98 ${y + 20} L100 ${y + 10} L102 ${y + 20} L105 ${y + 22} L101.4 ${y + 9}Z" fill="#C9445D"/><ellipse cx="100" cy="${y + 8.6}" rx="2.4" ry="2.2" fill="#C9445D"/>` +
          // 胸前校徽：盾形，裡面一個音符
          `<path d="M${X(35)} ${y + 28} h${f(10 * s)} v5 q0 5 -${f(5 * s)} 7.4 q-${f(5 * s)} -2.4 -${f(5 * s)} -7.4Z" fill="${dk(jc, .15)}" stroke="#E2C27A" stroke-width="1"/>` +
          `<path d="M${X(41)} ${y + 30.6} v5.4" stroke="#E2C27A" stroke-width=".8"/><ellipse cx="${X(39.6)}" cy="${y + 36}" rx="1.5" ry="1.1" fill="#E2C27A"/>` +
          ln(`M${X(30)} ${y + 44} h${f(18 * s)}`, lapD, .9);
        break;
      }
      case 'hanfu': {
        const trim = dk(c, .28);
        // 交領右衽：外襟從右肩（畫面右）斜向胸前中線，內襯白領露出 V 字
        const lap = `M${X(16)} ${y - 4} C${X(8)} ${y + 16} ${X(-6)} ${y + 30} ${X(-12)} ${y + 44} L${X(-14)} 224`;
        const inner = `M${X(-16)} ${y - 4} C${X(-11)} ${y + 6} ${X(-5)} ${y + 14} ${X(1)} ${y + 21}`;
        out += base(c) + fold(dk(c, .3), .45) + `<path d="M${X(-16)} ${y - 4} L${X(16)} ${y - 4} L${X(-8)} ${y + 34}Z" fill="#FFF9F7"/>` +
          ln(inner, lt(c, .55), 9, ' stroke-linecap="butt"') + ln(inner, '#FFF9F7', 5.5, ' stroke-linecap="butt"') + ln(inner, lt(c, .1), .9) +
          ln(lap, '#E7C982', 9.8) + ln(lap, trim, 8) + ln(lap, '#E7C982', 1.1, ' stroke-dasharray="3 2.5"') +
          ln(`M${X(-74)} 210 C${X(-58)} ${y + 30} ${X(-46)} ${y + 18} ${X(-30)} ${y + 8} M${X(74)} 210 C${X(58)} ${y + 30} ${X(46)} ${y + 18} ${X(30)} ${y + 8}`, dk(c, .15), 1, ' opacity=".55"');
        for (const [dx, dy, r] of [[34, 28, 3.2], [48, 44, 3.6], [24, 46, 2.4], [-44, 40, 3.4], [-58, 24, 2.4]]) out += flower(X(dx), y + dy, r, lt(c, .62), '#86BFA2');
        break;
      }
      case 'qipao': {
        const gold = '#E7C982';
        out += base(c) + fold(dk(c, .3), .45) +
          // 緞面的斜向反光
          `<path d="M${X(-76)} ${y + 6} L${X(-46)} 224 L${X(-34)} 224 L${X(-64)} ${y + 2}Z" fill="#fff" opacity=".13"/>` +
          flower(X(-38), y + 30, 4, lt(c, .55), '#86BFA2') + flower(X(-22), y + 50, 3, lt(c, .55), '#86BFA2') + flower(X(46), y + 46, 3.6, lt(c, .55), '#86BFA2') + flower(X(-56), y + 48, 3, lt(c, .55), '#86BFA2') +
          ln(`M${X(6)} ${y + 4} C${X(14)} ${y + 20} ${X(30)} ${y + 26} ${X(44)} ${y + 30}`, dk(c, .3), 3.4) + ln(`M${X(6)} ${y + 4} C${X(14)} ${y + 20} ${X(30)} ${y + 26} ${X(44)} ${y + 30}`, gold, 1.6) +
          frog(X(10), y + 8, 20, gold) + frog(X(28), y + 23, 28, gold);
        over = `<path d="M89 ${y - 12} Q100 ${y - 9} 111 ${y - 12} L112 ${y + 3} Q100 ${y + 8} 88 ${y + 3}Z" fill="${dk(c, .12)}" stroke="${gold}" stroke-width="1.3" stroke-linejoin="round"/>` +
          ln(`M89.6 ${y - 8} Q100 ${y - 5} 110.4 ${y - 8}`, lt(c, .3), .6, ' opacity=".6"') + `<g transform="translate(104 ${y - 1}) scale(.6) translate(-104 ${1 - y})">${frog(104, y - 1, -8, gold)}</g>`;
        break;
      }
      case 'gown': {
        const lace = lt(c, .72);
        // 平口禮服：上緣是兩段二次曲線，沿線排一圈小圓當蕾絲花邊
        const segs = [[[-58, 44], [-30, 30], [-4, 40]], [[4, 40], [30, 30], [58, 44]]];
        let dots = '';
        for (const [[ax, ay], [bx, by], [ex, ey]] of segs) for (let i = 0; i <= 9; i++) {
          const t = i / 9, u = 1 - t;
          const px = u * u * ax + 2 * u * t * bx + t * t * ex, py = u * u * ay + 2 * u * t * by + t * t * ey;
          dots += `<circle cx="${X(px)}" cy="${f(y + py - .6)}" r="2.1" fill="${lace}" stroke="${lt(c, .4)}" stroke-width=".5"/>`;
        }
        out += base(o.skin) +
          ln(`M${X(-30)} ${y + 12} Q${X(-18)} ${y + 8.6} ${X(-6)} ${y + 12.6} M${X(30)} ${y + 12} Q${X(18)} ${y + 8.6} ${X(6)} ${y + 12.6}`, dk(o.skin, .2), 1, ' opacity=".7"') +
          ln(`M${X(-2)} ${y + 14} Q100 ${y + 22} ${X(2)} ${y + 14}`, dk(o.skin, .16), .8, ' opacity=".5"') + dots +
          `<path d="M${X(-58)} ${y + 44} Q${X(-30)} ${y + 30} ${X(-4)} ${y + 40} Q100 ${y + 34} ${X(4)} ${y + 40} Q${X(30)} ${y + 30} ${X(58)} ${y + 44} L${X(76)} 224 L${X(-76)} 224Z" fill="url(#${p}gw)" stroke="${dk(c, .3)}" stroke-width=".8" stroke-linejoin="round"/>` +
          ln(`M${X(-4)} ${y + 41} Q${X(-9)} ${y + 50} ${X(-7)} ${y + 60} M${X(4)} ${y + 41} Q${X(9)} ${y + 50} ${X(7)} ${y + 60} M${X(-22)} ${y + 37} Q${X(-26)} ${y + 48} ${X(-22)} ${y + 60} M${X(22)} ${y + 37} Q${X(26)} ${y + 48} ${X(22)} ${y + 60}`, dk(c, .22), .8, ' opacity=".45"') +
          `<path d="M${X(-46)} ${y + 40} Q${X(-40)} ${y + 50} ${X(-42)} 224 L${X(-34)} 224 Q${X(-34)} ${y + 50} ${X(-38)} ${y + 36}Z" fill="#fff" opacity=".18"/>` +
          // 肩上的兩層荷葉邊
          `<path d="M${X(-76)} ${y + 54} Q${X(-66)} ${y + 32} ${X(-48)} ${y + 44} Q${X(-50)} ${y + 54} ${X(-60)} ${y + 58} Q${X(-68)} ${y + 60} ${X(-76)} ${y + 54}Z M${X(76)} ${y + 54} Q${X(66)} ${y + 32} ${X(48)} ${y + 44} Q${X(50)} ${y + 54} ${X(60)} ${y + 58} Q${X(68)} ${y + 60} ${X(76)} ${y + 54}Z" fill="${lt(c, .3)}" stroke="${dk(c, .2)}" stroke-width=".7"/>` +
          `<path d="M${X(-72)} ${y + 50} Q${X(-64)} ${y + 38} ${X(-52)} ${y + 46} Q${X(-58)} ${y + 54} ${X(-72)} ${y + 50}Z M${X(72)} ${y + 50} Q${X(64)} ${y + 38} ${X(52)} ${y + 46} Q${X(58)} ${y + 54} ${X(72)} ${y + 50}Z" fill="${lt(c, .55)}"/>` +
          ln(`M${X(-66)} ${y + 40} Q${X(-62)} ${y + 46} ${X(-64)} ${y + 54} M${X(66)} ${y + 40} Q${X(62)} ${y + 46} ${X(64)} ${y + 54}`, dk(c, .15), .7, ' opacity=".5"');
        for (const [dx, dy, r] of [[-30, 52, 1.6], [-12, 62, 1.1], [16, 56, 1.5], [36, 64, 1.2], [-44, 66, 1.1], [4, 72, 1.3], [50, 58, 1]]) out += sparkle(X(dx), y + dy, r);
        break;
      }
      case 'cardigan': {
        const panel = side => `M${X(-74 * side)} 224 L${X(-72 * side)} ${y + 22} C${X(-60 * side)} ${y + 6} ${X(-40 * side)} ${y + 2} ${X(-25 * side)} ${y} L${X(-10 * side)} ${y + 18} L${X(-12 * side)} 224Z`;
        const rim = side => `M${X(-25 * side)} ${y + 1} L${X(-11 * side)} ${y + 19} L${X(-13 * side)} 224`;
        out += base('#FBFAFD') + ln(`M100 ${y + 14} L100 224`, '#E4DCE6', .8) +
          `<path d="${panel(1)}" fill="${c}"/><path d="${panel(-1)}" fill="${c}"/>` + fold(dk(c, .3), .45) +
          // 前襟的羅紋邊
          ln(rim(1), dk(c, .14), 4.2) + ln(rim(-1), dk(c, .14), 4.2) + ln(rim(1), lt(c, .25), 4.2, ' stroke-dasharray=".9 1.5"') + ln(rim(-1), lt(c, .25), 4.2, ' stroke-dasharray=".9 1.5"') +
          // 圓領（彼得潘領）加小緞帶
          `<path d="M100 ${y + 3} C94 ${y + 2} 88 ${y + 1} ${X(-16)} ${y - 1} C${X(-20)} ${y + 6} ${X(-14)} ${y + 13} 100 ${y + 8}Z M100 ${y + 3} C106 ${y + 2} 112 ${y + 1} ${X(16)} ${y - 1} C${X(20)} ${y + 6} ${X(14)} ${y + 13} 100 ${y + 8}Z" fill="#fff" stroke="#CFC4D2" stroke-width=".7" stroke-linejoin="round"/>` +
          `<path d="M100 ${y + 8} C96 ${y + 5} 92 ${y + 6} 93 ${y + 9} C94 ${y + 12} 98 ${y + 10} 100 ${y + 9}Z M100 ${y + 8} C104 ${y + 5} 108 ${y + 6} 107 ${y + 9} C106 ${y + 12} 102 ${y + 10} 100 ${y + 9}Z" fill="${dk(c, .1)}"/>` +
          ln(`M99 ${y + 9.4} L96.4 ${y + 20} M101 ${y + 9.4} L103.6 ${y + 20}`, dk(c, .1), 1.4) +
          [y + 30, y + 44, y + 58].map(yy => `<circle cx="${X(-17)}" cy="${yy}" r="2.1" fill="${lt(c, .6)}" stroke="${dk(c, .2)}" stroke-width=".6"/><circle cx="${f(+X(-17) - .6)}" cy="${yy}" r=".35" fill="${dk(c, .3)}"/><circle cx="${f(+X(-17) + .6)}" cy="${yy}" r=".35" fill="${dk(c, .3)}"/>`).join('');
        break;
      }
      case 'hoodie': {
        out += base(c) + fold(dk(c, .3), .5) +
          `<path d="M${X(-42)} ${y + 4} C${X(-36)} ${y - 6} ${X(-20)} ${y - 8} ${X(-14)} ${y - 4} Q100 ${y + 22} ${X(14)} ${y - 4} C${X(20)} ${y - 8} ${X(36)} ${y - 6} ${X(42)} ${y + 4} Q100 ${y + 42} ${X(-42)} ${y + 4}Z" fill="${dk(c, .12)}" stroke="${dk(c, .3)}" stroke-width=".8" stroke-linejoin="round"/>` +
          ln(`M${X(-36)} ${y + 4} Q100 ${y + 34} ${X(36)} ${y + 4}`, lt(c, .3), .9, ' opacity=".6"') +
          // 落肩縫線
          ln(`M${X(-44)} ${y + 8} C${X(-52)} ${y + 24} ${X(-58)} ${y + 40} ${X(-60)} 224 M${X(44)} ${y + 8} C${X(52)} ${y + 24} ${X(58)} ${y + 40} ${X(60)} 224`, dk(c, .25), .7, ' stroke-dasharray="1.6 1.4" opacity=".6"') +
          // 抽繩：金屬扣眼、繩子、繩頭
          `<circle cx="94" cy="${y + 17}" r="1.6" fill="none" stroke="#C9C3CF" stroke-width=".9"/><circle cx="106" cy="${y + 17}" r="1.6" fill="none" stroke="#C9C3CF" stroke-width=".9"/>` +
          ln(`M94 ${y + 18} Q93 ${y + 30} 92 ${y + 42} M106 ${y + 18} Q107 ${y + 30} 108 ${y + 42}`, '#fff', 1.6) +
          `<rect x="90.8" y="${y + 42}" width="2.4" height="4" rx=".8" fill="#C9C3CF"/><rect x="106.8" y="${y + 42}" width="2.4" height="4" rx=".8" fill="#C9C3CF"/>` +
          // 胸口一枚小小的音符圖案
          `<path d="M${X(32)} ${y + 30} v-7 l5 -1.4 v7" fill="none" stroke="${lt(c, .6)}" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="${f(+X(30.6))}" cy="${y + 30.2}" rx="1.7" ry="1.3" fill="${lt(c, .6)}"/><ellipse cx="${f(+X(35.6))}" cy="${y + 28.8}" rx="1.7" ry="1.3" fill="${lt(c, .6)}"/>`;
        break;
      }
      case 'suit':
      case 'tux': {
        const tux = o.outfit === 'tux';
        const jc = tux ? '#26222E' : (c === OC.月白 ? '#4A4F66' : dk(c, .45));
        const lap = tux ? '#3A3444' : lt(jc, .12);
        out += base(jc) + fold(lt(jc, .25), .5) + `<path d="M${X(-14)} ${y - 2} L100 ${y + 50} L${X(14)} ${y - 2}Z" fill="#FBFAFD"/>`;
        if (tux) out += ln(`M97 ${y + 14} L97 ${y + 48} M103 ${y + 14} L103 ${y + 48}`, '#DCD5E0', .7);
        out += `<path d="M${X(-14)} ${y - 3} L${X(-3)} ${y + 9} L${X(-11)} ${y + 11}Z M${X(14)} ${y - 3} L${X(3)} ${y + 9} L${X(11)} ${y + 11}Z" fill="#fff" stroke="#CFC4D2" stroke-width=".7" stroke-linejoin="round"/>` +
          `<path d="M${X(-14)} ${y - 2} L${X(-30)} ${y + 8} L${X(-12)} ${y + 56} L100 ${y + 50}Z M${X(14)} ${y - 2} L${X(30)} ${y + 8} L${X(12)} ${y + 56} L100 ${y + 50}Z" fill="${lap}" stroke="${dk(jc, .4)}" stroke-width=".9" stroke-linejoin="round"/>`;
        // 西裝領有缺角；燕尾服是緞面，畫一道反光
        out += tux
          ? ln(`M${X(-26)} ${y + 10} L${X(-13)} ${y + 46} M${X(26)} ${y + 10} L${X(13)} ${y + 46}`, '#fff', 1.4, ' opacity=".16"')
          : `<path d="M${X(-27)} ${y + 6} l${f(-5 * s)} 2 l${f(3 * s)} 4Z M${X(27)} ${y + 6} l${f(5 * s)} 2 l${f(-3 * s)} 4Z" fill="${jc}"/>`;
        // 口袋巾
        out += `<path d="M${X(-44)} ${y + 34} l${f(4 * s)} -4 l${f(3 * s)} 3 l${f(3 * s)} -3 l${f(2 * s)} 4Z" fill="${tux ? '#fff' : lt(c, .5)}"/>` + ln(`M${X(-46)} ${y + 34} h${f(14 * s)}`, dk(jc, .4), .9);
        if (tux) {
          out += `<path d="M100 ${y + 6} C96 ${y + 2} 90 ${y} 89.4 ${y + 3} L89.4 ${y + 9} C90 ${y + 12} 96 ${y + 10} 100 ${y + 6}Z M100 ${y + 6} C104 ${y + 2} 110 ${y} 110.6 ${y + 3} L110.6 ${y + 9} C110 ${y + 12} 104 ${y + 10} 100 ${y + 6}Z" fill="#1A1720"/>` +
            ln(`M92 ${y + 4} Q95 ${y + 6} 92 ${y + 8} M108 ${y + 4} Q105 ${y + 6} 108 ${y + 8}`, '#4A4352', .7) +
            `<rect x="97.6" y="${y + 3.6}" width="4.8" height="4.8" rx="1.2" fill="#2E2836"/>` + flower(X(24), y + 18, 2.2, '#F2A7BC');
        } else {
          const tc = '#C9566E';
          out += `<path d="M100 ${y + 8} L96.4 ${y + 12} L98 ${y + 42} L100 ${y + 47} L102 ${y + 42} L103.6 ${y + 12}Z" fill="${tc}"/>` +
            ln(`M97.4 ${y + 18} L103 ${y + 13} M97.6 ${y + 26} L103.2 ${y + 21} M97.8 ${y + 34} L102.8 ${y + 29.6}`, lt(tc, .35), 1, ' opacity=".7"') +
            `<path d="M97 ${y + 3} L103 ${y + 3} L102 ${y + 9} L98 ${y + 9}Z" fill="${dk(tc, .2)}"/>`;
        }
        break;
      }
      case 'ruqun': {
        const top = lt(c, .72), band = dk(c, .22), rib = mix(c, '#E0566F', .55);
        out += base(top) + fold(dk(top, .25), .5) +
          // 對襟短襦：領口兩條平行的滾邊，中間露出白色內衣
          `<path d="M${X(-12)} ${y - 2} L${X(12)} ${y - 2} L${X(6)} ${y + 26} L${X(-6)} ${y + 26}Z" fill="#FFFCFA"/>` +
          ln(`M${X(-12)} ${y - 2} L${X(-6)} ${y + 26} M${X(12)} ${y - 2} L${X(6)} ${y + 26}`, dk(c, .1), 3.4) +
          ln(`M${X(-12)} ${y - 2} L${X(-6)} ${y + 26} M${X(12)} ${y - 2} L${X(6)} ${y + 26}`, '#E7C982', .8, ' stroke-dasharray="2 1.6"') +
          // 齊胸的裙子：從胸口以上就開始，加百褶線
          `<path d="M${X(-76)} ${y + 28} Q100 ${y + 19} ${X(76)} ${y + 28} L${X(76)} 224 L${X(-76)} 224Z" fill="url(#${p}gw)"/>` +
          ln([-42, -28, -14, 14, 28, 42].map(d => `M${X(d)} ${y + 27} L${X(d * 1.2)} 224`).join(' '), dk(c, .25), .8, ' opacity=".4"') +
          ln(`M${X(-76)} ${y + 27} Q100 ${y + 18} ${X(76)} ${y + 27}`, band, 5.2) + ln(`M${X(-76)} ${y + 27} Q100 ${y + 18} ${X(76)} ${y + 27}`, '#E7C982', .8, ' stroke-dasharray="3 2"') +
          // 胸前繫帶的蝴蝶結，兩條飄帶一路垂下去
          `<path d="M98.6 ${y + 25} C96 ${y + 40} 94 ${y + 52} 92 224 L96 224 C97 ${y + 52} 99 ${y + 40} 100 ${y + 26}Z M101.4 ${y + 25} C104 ${y + 40} 106 ${y + 52} 108 224 L104 224 C103 ${y + 52} 101 ${y + 40} 100 ${y + 26}Z" fill="${dk(rib, .1)}"/>` +
          `<path d="M100 ${y + 23} C94 ${y + 16} 86 ${y + 17} 87 ${y + 23} C88 ${y + 29} 95 ${y + 27} 100 ${y + 24}Z M100 ${y + 23} C106 ${y + 16} 114 ${y + 17} 113 ${y + 23} C112 ${y + 29} 105 ${y + 27} 100 ${y + 24}Z" fill="${rib}" stroke="${dk(rib, .25)}" stroke-width=".7"/>` +
          ln(`M89 ${y + 20} Q92 ${y + 18.4} 95 ${y + 19.6} M111 ${y + 20} Q108 ${y + 18.4} 105 ${y + 19.6}`, '#fff', .8, ' opacity=".5"') +
          `<ellipse cx="100" cy="${y + 23.6}" rx="2.6" ry="2.4" fill="${dk(rib, .2)}"/>`;
        for (const [dx, dy, r] of [[-30, 40, 2.6], [34, 44, 2.8], [-50, 52, 2.2], [20, 58, 2]]) out += flower(X(dx), y + dy, r, lt(c, .55), '#86BFA2');
        // 披帛：一條半透明的薄紗，從肩膀繞到手臂
        out += `<path d="M${X(-76)} ${y + 24} C${X(-64)} ${y + 6} ${X(-46)} ${y + 2} ${X(-34)} ${y + 6} C${X(-44)} ${y + 14} ${X(-58)} ${y + 32} ${X(-62)} 224 L${X(-74)} 224Z M${X(76)} ${y + 24} C${X(64)} ${y + 6} ${X(46)} ${y + 2} ${X(34)} ${y + 6} C${X(44)} ${y + 14} ${X(58)} ${y + 32} ${X(62)} 224 L${X(74)} 224Z" fill="${lt(c, .85)}" opacity=".6" stroke="${lt(c, .3)}" stroke-width=".6"/>`;
        break;
      }
      case 'cape': {
        const cc = c === OC.月白 ? '#E3E6EF' : c;
        out += base(cc) + fold(dk(cc, .3), .45) +
          `<path d="M100 ${y + 20} L${X(-5)} 224 L${X(5)} 224Z" fill="${dk(cc, .35)}" opacity=".55"/>` + ln(`M100 ${y + 20} V224`, dk(cc, .4), 1) +
          [[-40, 34], [-24, 52], [30, 40], [48, 56], [-56, 54], [16, 30]].map(([dx, dy]) => snow(X(dx), y + dy, 3.2, lt(cc, .7))).join('');
        // 毛毛領：一圈白色絨球沿著領口，畫在裁切外面才圍得住脖子
        let fur = '';
        for (let i = 0; i <= 12; i++) {
          const t = i / 12, u = 1 - t;
          const px = u * u * (100 - 34 * s) + 2 * u * t * 100 + t * t * (100 + 34 * s), py = u * u * (y + 6) + 2 * u * t * (y + 26) + t * t * (y + 6);
          fur += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(5.4 - Math.abs(t - .5) * 2.4)}" fill="#FFFDFB" stroke="#E2D8E0" stroke-width=".6"/>`;
        }
        over = fur + ln(`M98 ${y + 20} Q96 ${y + 28} 95 ${y + 34} M102 ${y + 20} Q104 ${y + 28} 105 ${y + 34}`, '#FFFDFB', 1.3) +
          `<circle cx="95" cy="${y + 36}" r="3.2" fill="#FFFDFB" stroke="#E2D8E0" stroke-width=".6"/><circle cx="105" cy="${y + 36}" r="3.2" fill="#FFFDFB" stroke="#E2D8E0" stroke-width=".6"/>`;
        break;
      }
      case 'lace': {
        out += base(c) + fold(dk(c, .3), .45) +
          // 胸前的細褶與一排珍珠扣
          ln(`M${X(-9)} ${y + 30} V224 M${X(-5)} ${y + 30} V224 M${X(5)} ${y + 30} V224 M${X(9)} ${y + 30} V224`, dk(c, .18), .7, ' opacity=".5"') +
          [y + 34, y + 42, y + 50].map(yy => `<circle cx="100" cy="${yy}" r="1.9" fill="#FFF8F2" stroke="#E6D3C8" stroke-width=".6"/>`).join('') +
          // 泡泡袖：肩頭鼓起來，有抓皺
          [-1, 1].map(sd => `<path d="M${X(-76 * sd)} ${y + 42} C${X(-79 * sd)} ${y + 18} ${X(-62 * sd)} ${y + 6} ${X(-46 * sd)} ${y + 12} C${X(-42 * sd)} ${y + 26} ${X(-54 * sd)} ${y + 40} ${X(-76 * sd)} ${y + 42}Z" fill="${lt(c, .14)}" stroke="${dk(c, .22)}" stroke-width=".7"/>` +
            ln(`M${X(-50 * sd)} ${y + 13} Q${X(-56 * sd)} ${y + 22} ${X(-60 * sd)} ${y + 34} M${X(-58 * sd)} ${y + 10} Q${X(-64 * sd)} ${y + 22} ${X(-68 * sd)} ${y + 36}`, dk(c, .2), .7, ' opacity=".55"')).join('');
        // 大圓領：白色，外緣一圈扇形蕾絲，領面打一排小洞
        for (const sd of [-1, 1]) {
          const P = [[X(-34 * sd), y + 5], [X(-40 * sd), y + 20], [X(-26 * sd), y + 32], [X(-6 * sd), y + 29]];
          for (let i = 0; i <= 9; i++) { const [px, py] = cub(P, i / 9); out += `<circle cx="${f(px)}" cy="${f(py)}" r="2.3" fill="#FFFDFB" stroke="#DCD0DA" stroke-width=".5"/>`; }
          out += `<path d="M100 ${y + 2} C${X(-10 * sd)} ${y + 1} ${X(-24 * sd)} ${y + 1} ${X(-34 * sd)} ${y + 5} C${X(-40 * sd)} ${y + 20} ${X(-26 * sd)} ${y + 32} ${X(-6 * sd)} ${y + 29} Q100 ${y + 27} 100 ${y + 20}Z" fill="#FFFDFB" stroke="#DCD0DA" stroke-width=".6" stroke-linejoin="round"/>`;
          for (let i = 1; i <= 7; i++) { const [px, py] = cub(P, i / 8); out += `<circle cx="${f(px + (100 - px) * .16)}" cy="${f(py + (y + 14 - py) * .3)}" r=".8" fill="${lt(c, .3)}"/>`; }
        }
        out += `<path d="M100 ${y + 20} C96 ${y + 16} 92 ${y + 17} 92.6 ${y + 20.4} C93.4 ${y + 23.6} 97.6 ${y + 22} 100 ${y + 21}Z M100 ${y + 20} C104 ${y + 16} 108 ${y + 17} 107.4 ${y + 20.4} C106.6 ${y + 23.6} 102.4 ${y + 22} 100 ${y + 21}Z" fill="${dk(c, .18)}"/><circle cx="100" cy="${y + 20.6}" r="1.6" fill="${dk(c, .3)}"/>`;
        break;
      }
      case 'coat': {
        const cc = c === OC.月白 ? '#D9CBB8' : dk(c, .2), sw = lt(c, .55);
        out += base(cc) + fold(dk(cc, .35), .55) +
          // 裡面的高領毛衣，直條羅紋
          `<path d="M${X(-16)} ${y - 2} L${X(16)} ${y - 2} L${X(8)} ${y + 36} L${X(-8)} ${y + 36}Z" fill="${sw}"/>` +
          ln(`M${X(-9)} ${y + 6} V${y + 36} M${X(-4)} ${y + 6} V${y + 36} M${X(4)} ${y + 6} V${y + 36} M${X(9)} ${y + 6} V${y + 36}`, dk(sw, .15), .7, ' opacity=".6"') +
          // 寬大的翻領，有缺角
          [-1, 1].map(sd => `<path d="M${X(-16 * sd)} ${y - 2} L${X(-42 * sd)} ${y + 8} L${X(-31 * sd)} ${y + 14} L${X(-39 * sd)} ${y + 18} L${X(-14 * sd)} ${y + 50} L${X(-8 * sd)} ${y + 36}Z" fill="${lt(cc, .1)}" stroke="${dk(cc, .42)}" stroke-width=".9" stroke-linejoin="round"/>` +
            ln(`M${X(-36 * sd)} ${y + 20} L${X(-15 * sd)} ${y + 46}`, lt(cc, .35), .6, ' stroke-dasharray="1.6 1.4" opacity=".7"')).join('') +
          // 雙排扣
          [y + 42, y + 54].map(yy => [-12, 12].map(dx => `<circle cx="${X(dx)}" cy="${yy}" r="2.6" fill="${dk(cc, .35)}" stroke="${dk(cc, .55)}" stroke-width=".6"/><circle cx="${f(+X(dx) - .8)}" cy="${yy - .8}" r=".7" fill="#fff" opacity=".5"/>`).join('')).join('');
        // 圍巾繞在脖子上，一端垂在胸前，尾巴有流蘇
        const sc = c === OC.月白 ? '#C9566E' : mix('#F6F0E6', c, .22), scD = dk(sc, .22);
        over = `<path d="M${X(-18)} ${y - 6} Q100 ${y + 6} ${X(18)} ${y - 6} L${X(23)} ${y + 6} Q100 ${y + 24} ${X(-23)} ${y + 6}Z" fill="${sc}" stroke="${scD}" stroke-width=".8" stroke-linejoin="round"/>` +
          ln(`M${X(-21)} ${y} Q100 ${y + 15} ${X(21)} ${y}`, scD, .8, ' stroke-dasharray="2 1.6" opacity=".7"') +
          `<path d="M${X(8)} ${y + 12} L${X(22)} ${y + 9} L${X(27)} ${y + 46} L${X(13)} ${y + 48}Z" fill="${sc}" stroke="${scD}" stroke-width=".8" stroke-linejoin="round"/>` +
          ln(`M${X(10)} ${y + 22} L${X(24)} ${y + 19.6} M${X(12)} ${y + 34} L${X(25.6)} ${y + 31.6}`, scD, 1.4, ' opacity=".45"') +
          ln([0, 1, 2, 3, 4].map(i => `M${f(+X(14) + i * 3 * s)} ${f(y + 48 - i * .5)} l.4 5`).join(' '), scD, .9);
        break;
      }
      case 'teagown': {
        const lin = mix(c, '#EDE3D3', .62), trim = dk(lin, .32), plum = mix(c, '#D9667F', .5);
        out += base(lin) + fold(dk(lin, .3), .45) +
          // 棉麻的織紋：細細的橫紋，加幾段粗節
          ln([0, 1, 2, 3, 4, 5, 6, 7].map(i => `M${X(-76)} ${y + 8 + i * 7} H${X(76)}`).join(' '), dk(lin, .08), .5, ' opacity=".5"') +
          ln(`M${X(-50)} ${y + 22} h5 M${X(36)} ${y + 36} h6 M${X(-30)} ${y + 50} h4 M${X(52)} ${y + 15} h4`, dk(lin, .2), .9, ' opacity=".5"') +
          // 對襟滾邊與三顆盤扣
          ln(`M100 ${y + 2} V224`, trim, 2.4) + frog(100, y + 14, 0, trim) + frog(100, y + 28, 0, trim) + frog(100, y + 42, 0, trim) +
          // 左胸繡一枝梅花
          ln(`M${X(-48)} ${y + 46} Q${X(-40)} ${y + 34} ${X(-27)} ${y + 28} M${X(-39)} ${y + 36} q-2 -5 -1 -9`, '#7A5A48', 1, ' opacity=".8"') +
          flower(X(-27), y + 28, 2.2, plum) + flower(X(-40), y + 26, 1.8, plum) + flower(X(-45), y + 40, 1.6, plum);
        over = `<path d="M90 ${y - 6} Q100 ${y - 4} 110 ${y - 6} L111 ${y + 3} Q100 ${y + 7} 89 ${y + 3}Z" fill="${lin}" stroke="${trim}" stroke-width="1.1" stroke-linejoin="round"/>`;
        break;
      }
      case 'concert': {
        const bk = '#26222E';
        out += base(o.skin) +
          ln(`M${X(-30)} ${y + 12} Q${X(-18)} ${y + 8.6} ${X(-6)} ${y + 12.6} M${X(30)} ${y + 12} Q${X(18)} ${y + 8.6} ${X(6)} ${y + 12.6}`, dk(o.skin, .2), 1, ' opacity=".6"') +
          // 肩膀和袖子是半透明的黑紗，上面有細細的點點
          `<path d="${bodyPath(g)}" fill="${bk}" opacity=".6"/>` +
          [[-56, 16], [-44, 22], [-62, 30], [48, 18], [58, 28], [40, 26], [-34, 14], [32, 12], [-50, 8], [52, 6]].map(([dx, dy]) => `<circle cx="${X(dx)}" cy="${y + dy}" r=".8" fill="#4A4352"/>`).join('') +
          ln(`M${X(-16)} ${y} Q100 ${y + 10} ${X(16)} ${y}`, bk, 2.6) +
          // 緞面上身：甜心領口，一道淡淡的反光
          `<path d="M${X(-76)} ${y + 34} Q${X(-44)} ${y + 22} ${X(-10)} ${y + 32} Q100 ${y + 38} ${X(10)} ${y + 32} Q${X(44)} ${y + 22} ${X(76)} ${y + 34} L${X(76)} 224 L${X(-76)} 224Z" fill="#2B2634" stroke="#151219" stroke-width=".8"/>` +
          ln(`M${X(-60)} ${y + 32} Q${X(-40)} ${y + 26} ${X(-20)} ${y + 34}`, '#fff', 1.2, ' opacity=".2"') +
          ln(`M${X(-42)} ${y + 36} Q${X(-38)} ${y + 46} ${X(-40)} 224`, '#fff', 2.6, ' opacity=".07"') +
          // 左胸的珍珠胸針
          `<g transform="translate(${X(-32)} ${y + 42})">${[0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3; return `<circle cx="${f(Math.cos(a) * 3.2)}" cy="${f(Math.sin(a) * 3.2)}" r="1.6" fill="#FFF8F2" stroke="#D6C6BD" stroke-width=".4"/>`; }).join('')}<circle r="1.9" fill="#E2C27A"/></g>`;
        break;
      }
      default: { // knit
        const cable = x => ln(`M${f(x - 2.6)} ${y + 16} q5.2 5 0 10 q-5.2 5 0 10 q5.2 5 0 10 q-5.2 5 0 10`, dk(c, .22), 1.3, ' opacity=".55"') +
          ln(`M${f(x + 2.6)} ${y + 16} q-5.2 5 0 10 q5.2 5 0 10 q-5.2 5 0 10 q5.2 5 0 10`, dk(c, .22), 1.3, ' opacity=".55"') +
          ln(`M${f(x - 6)} ${y + 14} V224 M${f(x + 6)} ${y + 14} V224`, dk(c, .18), .8, ' stroke-dasharray="1.4 1.6" opacity=".55"');
        out += base(c) + fold(dk(c, .3), .45) + cable(+X(-26)) + cable(+X(26)) +
          ln(`M${X(-17)} ${y - 1} Q100 ${y + 18} ${X(17)} ${y - 1}`, dk(c, .14), 6.4) +
          ln(`M${X(-17)} ${y - 1} Q100 ${y + 18} ${X(17)} ${y - 1}`, lt(c, .22), 6.4, ' stroke-linecap="butt" stroke-dasharray=".9 1.6"') +
          ln(`M${X(-20)} ${y + 2.4} Q100 ${y + 22} ${X(20)} ${y + 2.4}`, dk(c, .25), .7, ' opacity=".6"');
      }
    }
    return `<g clip-path="url(#${p}bd)">${out}${shade}${edge}</g>${over}`;
  }
  function flower(x, y, r, col, leaf) {
    let s = '';
    if (leaf) s += `<ellipse cx="${f(+x + r * 1.5)}" cy="${f(y + r * .9)}" rx="${f(r * .9)}" ry="${f(r * .4)}" transform="rotate(30 ${f(+x + r * 1.5)} ${f(y + r * .9)})" fill="${leaf}" opacity=".7"/>`;
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 - 90) * Math.PI / 180;
      s += `<circle cx="${f(+x + Math.cos(a) * r)}" cy="${f(y + Math.sin(a) * r)}" r="${f(r * .7)}" fill="${col}"/>`;
    }
    return s + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * .45)}" fill="#F3D27E"/><circle cx="${f(x - r * .12)}" cy="${f(y - r * .12)}" r="${f(r * .16)}" fill="#fff" opacity=".7"/>`;
  }
  // 三次貝茲曲線上取點（蕾絲領沿邊排花邊用）
  function cub(P, t) {
    const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [0, 1].map(k => a * P[0][k] + b * P[1][k] + c * P[2][k] + d * P[3][k]);
  }
  // 斗篷上的雪花刺繡：三條交叉線加中心一點
  function snow(x, y, r, col) {
    let d = '';
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + Math.PI / 6; d += `M${f(x - Math.cos(a) * r)} ${f(y - Math.sin(a) * r)}L${f(+x + Math.cos(a) * r)} ${f(y + Math.sin(a) * r)}`; }
    return `<path d="${d}" stroke="${col}" stroke-width=".8" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="1" fill="${col}"/>`;
  }
  // 旗袍的盤扣：兩個繩圈、中間一顆結
  function frog(x, y, rot, col) {
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-7 0 H7" stroke="${col}" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="-4.6" cy="0" rx="3" ry="1.9" fill="none" stroke="${col}" stroke-width="1.1"/><ellipse cx="4.6" cy="0" rx="3" ry="1.9" fill="none" stroke="${col}" stroke-width="1.1"/><circle r="1.7" fill="${col}"/><circle cx="-.5" cy="-.5" r=".5" fill="#fff" opacity=".7"/></g>`;
  }
  function star(x, y, r, col) {
    const k = r * 3;
    return `<path d="M${f(x)} ${f(y - k)} Q${f(x + r * .5)} ${f(y - r * .5)} ${f(x + k)} ${f(y)} Q${f(x + r * .5)} ${f(y + r * .5)} ${f(x)} ${f(y + k)} Q${f(x - r * .5)} ${f(y + r * .5)} ${f(x - k)} ${f(y)} Q${f(x - r * .5)} ${f(y - r * .5)} ${f(x)} ${f(y - k)}Z" fill="${col}"/>`;
  }
  const sparkle = (x, y, r) => star(x, y, r, '#FFF3C9');

  // ---------- 飾品 ----------
  function accessory(o, g) {
    let s = '';
    switch (o.acc) {
      case 'bow':
        s += `<g transform="translate(134 50) rotate(18)"><path d="M0 0 C-14 -12 -20 4 -12 8 C-6 10 -2 4 0 0Z M0 0 C14 -12 20 4 12 8 C6 10 2 4 0 0Z" fill="#F07C9E" stroke="#C9445D" stroke-width=".8"/><path d="M-2 2 L-8 16 L-3 14 L0 4 L3 14 L8 16 L2 2Z" fill="#E0566F"/><circle r="3" fill="#C9445D"/><path d="M-12 -2 Q-8 -4 -5 0 M12 -2 Q8 -4 5 0" stroke="#fff" stroke-width=".9" fill="none" opacity=".7"/></g>`;
        break;
      case 'sakura': {
        let pet = '';
        for (let i = 0; i < 5; i++) pet += `<path transform="rotate(${i * 72})" d="M0 0 C-4 -4 -4 -9 -1.5 -10 L0 -8.5 L1.5 -10 C4 -9 4 -4 0 0Z" fill="#F8C3D2" stroke="#E98AA6" stroke-width=".6"/>`;
        s += `<g transform="translate(136 66) rotate(10)">${pet}<circle r="2" fill="#F3C25C"/></g><g transform="translate(127 58) scale(.6)">${pet}<circle r="2" fill="#F3C25C"/></g>`;
        break;
      }
      case 'buyao': {
        const bx = o.back === 'bun' ? 112 : 128, by = o.back === 'bun' ? 26 : 44;
        s += `<path d="M${bx - 26} ${by + 14} L${bx + 6} ${by - 6}" stroke="#D6B46B" stroke-width="2.2" stroke-linecap="round"/>` + flower(bx + 4, by - 4, 4, '#F2A7BC');
        for (let i = 0; i < 3; i++) {
          const x = bx + 2 + i * 4, len = 18 + i * 6;
          s += `<path d="M${x} ${by} L${x + 1} ${by + len}" stroke="#D6B46B" stroke-width=".8"/><circle cx="${x + 1}" cy="${by + len + 2}" r="2" fill="${['#F2A7BC', '#9DD5C6', '#F3D27E'][i]}"/><circle cx="${x + .6}" cy="${by + len * .55}" r="1.2" fill="#fff"/>`;
        }
        break;
      }
      case 'pearl':
        for (let i = 0; i <= 12; i++) {
          const t = i / 12, x = 60 + t * 80, y = 62 - Math.sin(t * Math.PI) * 30;
          s += `<circle cx="${f(x)}" cy="${f(y)}" r="2.6" fill="#FFF8F2" stroke="#E6D3C8" stroke-width=".6"/><circle cx="${f(x - .8)}" cy="${f(y - .8)}" r=".8" fill="#fff"/>`;
        }
        break;
      case 'note': {
        // 兩個八分音符連在一起的髮夾
        const head = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="2.8" transform="rotate(-20 ${x} ${y})" fill="#F07C9E" stroke="#C9445D" stroke-width=".8"/><circle cx="${x - 1}" cy="${y - 1}" r=".9" fill="#fff" opacity=".8"/>`;
        s += `<g transform="translate(128 48) rotate(12)"><path d="M0 13 V0 L12 -3 V10" fill="none" stroke="#C9445D" stroke-width="2.2" stroke-linejoin="round"/>${head(-2.6, 13.6)}${head(9.4, 10.6)}</g>` + sparkle(148, 44, 1.1);
        break;
      }
      case 'jade': {
        // 玉簪：盤髮就斜插在髮髻上，其他髮型插在右側，尾端垂一束紅流蘇
        const onBun = ['bun', 'halfup'].includes(o.back);
        const [x1, y1, x2, y2] = onBun ? [76, 30, 126, 14] : [110, 48, 146, 30];
        s += `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#5E9C7E" stroke-width="3.2" stroke-linecap="round"/><path d="M${x1 + 1} ${y1 - .8} L${x2 - 1} ${y2 - .6}" stroke="#B4E2CD" stroke-width="1" stroke-linecap="round" opacity=".8"/>` +
          `<circle cx="${x2}" cy="${y2}" r="3.8" fill="#7FBFA4" stroke="#4E8A6E" stroke-width=".7"/><circle cx="${x2 - 1.2}" cy="${y2 - 1.2}" r="1.1" fill="#fff" opacity=".7"/>` +
          `<path d="M${x2} ${y2 + 3.8} V${y2 + 9}" stroke="#D6B46B" stroke-width=".8"/><circle cx="${x2}" cy="${y2 + 10}" r="1.7" fill="#E2C27A"/>` +
          `<path d="M${x2 - 1.6} ${y2 + 11} L${x2 - 2.8} ${y2 + 22} M${x2} ${y2 + 11.4} V${y2 + 23} M${x2 + 1.6} ${y2 + 11} L${x2 + 2.8} ${y2 + 22}" stroke="#C9445D" stroke-width="1" stroke-linecap="round"/>`;
        break;
      }
      case 'beret': {
        // 貝雷帽的顏色跟著服裝配色，再壓深一點
        const bc = mix(o.oc, '#7A2E44', .5), bd = dk(bc, .3);
        // 帽沿貼著頭頂的弧度，帽沿下面在頭髮上投一道影子
        s += `<path d="M64 54 Q102 66 146 52" fill="none" stroke="${dk(o.hair, .5)}" stroke-width="3" stroke-linecap="round" opacity=".3"/>` +
          `<path d="M64 52 C56 30 90 16 118 19 C148 22 160 38 146 50 Q104 62 64 52Z" fill="${bc}" stroke="${bd}" stroke-width="1"/>` +
          `<path d="M65 51 Q104 61 145 50" fill="none" stroke="${bd}" stroke-width="2.8" stroke-linecap="round"/>` +
          `<path d="M80 32 Q104 21 130 25" fill="none" stroke="${lt(bc, .4)}" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>` +
          `<path d="M113 19.4 l1 -5 l3 .4 l-1 5Z" fill="${bd}"/>`;
        break;
      }
    }
    switch (o.acc2) {
      case 'glasses': {
        const ey = g.ey + 1;
        s += `<g fill="none" stroke="#8B6A55" stroke-width="1.3"><ellipse cx="81" cy="${ey}" rx="14" ry="12.5"/><ellipse cx="119" cy="${ey}" rx="14" ry="12.5"/><path d="M95 ${ey - 2} Q100 ${ey - 5} 105 ${ey - 2}"/></g><path d="M72 ${ey - 8} l5 -2" stroke="#fff" stroke-width="1.5" opacity=".7"/>`;
        break;
      }
      case 'earring':
        s += `<path d="M61 116 v6 M139 116 v6" stroke="#D6B46B" stroke-width=".9"/><circle cx="61" cy="125" r="3" fill="#FFF8F2" stroke="#E6D3C8" stroke-width=".6"/><circle cx="139" cy="125" r="3" fill="#FFF8F2" stroke="#E6D3C8" stroke-width=".6"/>`;
        break;
      case 'necklace': {
        const y = g.sy;
        s += `<path d="M86 ${y - 2} Q100 ${y + 16} 114 ${y - 2}" fill="none" stroke="#D6B46B" stroke-width="1"/><g transform="translate(100 ${y + 12})"><ellipse cx="-1.5" cy="4" rx="3" ry="2.2" fill="#D6B46B"/><path d="M1.2 4 V-4 Q4 -3 5 -1" fill="none" stroke="#D6B46B" stroke-width="1.2"/></g>`;
        break;
      }
      case 'tassel': {
        const one = x => `<path d="M${x} 115 v4" stroke="#D6B46B" stroke-width=".8"/><circle cx="${x}" cy="120" r="1.8" fill="#E2C27A"/>` +
          `<path d="M${f(x - 1.4)} 121 Q${f(x - 2.4)} 126 ${f(x - 2.2)} 132 M${x} 121.4 V133 M${f(x + 1.4)} 121 Q${f(x + 2.4)} 126 ${f(x + 2.2)} 132" stroke="#C9445D" stroke-width="1.1" stroke-linecap="round" fill="none"/><path d="M${f(x - 2.4)} 123 h4.8" stroke="#E2C27A" stroke-width="1"/>`;
        s += one(f(100 - g.w + 1)) + one(f(100 + g.w - 1));
        break;
      }
      case 'choker': {
        const yy = f(g.chin + (g.sy - g.chin) * .55);
        s += `<path d="M90 ${yy} Q100 ${f(yy + 2.4)} 110 ${yy}" fill="none" stroke="#3A2333" stroke-width="2.8"/><path d="M90.6 ${f(yy - .8)} Q100 ${f(yy + 1.4)} 109.4 ${f(yy - .8)}" fill="none" stroke="#fff" stroke-width=".5" opacity=".3"/>` +
          `<path d="M100 ${f(yy + 1.4)} l-2.4 3 l2.4 3 l2.4 -3Z" fill="#E2C27A"/><circle cx="100" cy="${f(yy + 7.6)}" r="1.5" fill="#FFF8F2" stroke="#E6D3C8" stroke-width=".4"/>`;
        break;
      }
      case 'mole':
        s += `<circle cx="${f(119 + g.erx * .85)}" cy="${f(g.ey + g.ery + 3.4)}" r=".95" fill="${dk(o.skin, .6)}"/>`;
        break;
    }
    return s;
  }

  function render(input, opts) {
    const o = Object.assign({ back: 'long', bang: 'blunt', hair: HAIR.深棕, eye: EYES.蜜茶, skin: SKIN.暖杏, outfit: 'knit', oc: OC.櫻, acc: 'none', acc2: 'none', age: 'teen', m: false, expr: 'smile' }, input || {});
    opts = opts || {};
    const g = AGE[o.age] || AGE.teen;
    if (o.age === 'elder') o.hair = mix(o.hair, '#E6E2EA', .55);
    const p = 'av' + (++uid) + '_';
    const skinS = dk(o.skin, .14);
    const defs = `<defs>
<linearGradient id="${p}hf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lt(o.hair, .16)}"/><stop offset=".55" stop-color="${o.hair}"/><stop offset="1" stop-color="${dk(o.hair, .22)}"/></linearGradient>
<linearGradient id="${p}hb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dk(o.hair, .1)}"/><stop offset="1" stop-color="${dk(o.hair, .32)}"/></linearGradient>
<linearGradient id="${p}ir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dk(o.eye, .5)}"/><stop offset=".5" stop-color="${o.eye}"/><stop offset="1" stop-color="${lt(o.eye, .4)}"/></linearGradient>
<linearGradient id="${p}sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4D6E0"/><stop offset=".45" stop-color="#FFFFFF"/></linearGradient>
<linearGradient id="${p}hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dk(o.hair, .5)}" stop-opacity="0"/><stop offset=".6" stop-color="${dk(o.hair, .5)}" stop-opacity="0"/><stop offset="1" stop-color="${dk(o.hair, .5)}" stop-opacity=".45"/></linearGradient>
<radialGradient id="${p}bl"><stop offset="0" stop-color="#F28CA6" stop-opacity=".55"/><stop offset="1" stop-color="#F28CA6" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}fs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skinS}" stop-opacity=".0"/><stop offset=".7" stop-color="${skinS}" stop-opacity=".0"/><stop offset="1" stop-color="${skinS}" stop-opacity=".35"/></linearGradient>
<linearGradient id="${p}bs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1420" stop-opacity=".16"/><stop offset=".25" stop-color="#2a1420" stop-opacity="0"/><stop offset=".75" stop-color="#2a1420" stop-opacity="0"/><stop offset="1" stop-color="#2a1420" stop-opacity=".16"/></linearGradient>
<linearGradient id="${p}bt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".32" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="${p}gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lt(o.oc, .15)}"/><stop offset="1" stop-color="${dk(o.oc, .2)}"/></linearGradient>
<clipPath id="${p}bd"><path d="${bodyPath(g)}"/></clipPath>
</defs>`;
    const c = g.chin;
    const skinL = dk(o.skin, .36);
    const neck = `<path d="M90 ${c - 12} L90 ${g.sy + 6} Q100 ${g.sy + 12} 110 ${g.sy + 6} L110 ${c - 12}Z" fill="${o.skin}" stroke="${skinL}" stroke-width=".8"/><path d="M89 ${c - 8} Q100 ${c + 8} 111 ${c - 8} L111 ${c + 5} Q100 ${c + 15} 89 ${c + 5}Z" fill="${skinS}" opacity=".55"/>`;
    const ear = x => `<ellipse cx="${f(x)}" cy="106" rx="5" ry="9" fill="${o.skin}" stroke="${skinL}" stroke-width=".8"/>`;
    const ears = ear(100 - g.w + 1) + ear(100 + g.w - 1) + `<path d="M${f(100 - g.w + 1)} 101 q-2 5 0 10 M${f(100 + g.w - 1)} 101 q2 5 0 10" stroke="${skinS}" stroke-width="1.2" fill="none"/>`;
    const fp = facePath(g);
    const body = backHair(o, p) + neck + outfit(o, p, g) + ears +
      `<path d="${fp}" fill="${o.skin}"/><path d="${fp}" fill="url(#${p}fs)"/><path d="${fp}" fill="none" stroke="${skinL}" stroke-width=".9"/>` +
      `<clipPath id="${p}fc"><path d="${fp}"/></clipPath><path clip-path="url(#${p}fc)" d="${bangPath(o)}" transform="translate(0 4.5)" fill="${skinS}" opacity=".5"/>` +
      face(o, p, g) + frontHair(o, p, g) + accessory(o, g);
    const vb = opts.bust ? '30 20 140 140' : '0 0 200 220';
    const lbl = opts.label ? `<title>${opts.label}</title>` : '';
    return `<svg class="${opts.cls || 'av'}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img"${opts.label ? ` aria-label="${opts.label}"` : ' aria-hidden="true"'}>${lbl}${defs}${body}</svg>`;
  }

  const NPC_LOOK = {
    mom: { back: 'bob', bang: 'side', hair: HAIR.深棕, eye: EYES.蜜茶, outfit: 'cardigan', oc: OC.桃, age: 'adult' },
    chen: { back: 'bun', bang: 'part', hair: HAIR.墨黑, eye: EYES.墨玉, outfit: 'qipao', oc: OC.青瓷, acc: 'buyao', age: 'adult' },
    zhou: { back: 'long', bang: 'part', hair: HAIR.墨黑, eye: EYES.墨玉, outfit: 'blazer', oc: OC.墨紺, acc2: 'glasses', age: 'adult', expr: 'neutral' },
    an: { back: 'pony', bang: 'side', hair: HAIR.墨黑, eye: EYES.紫晶, outfit: 'sailor', oc: OC.墨紺, age: 'teen' },
    kai: { back: 'short', bang: 'spiky', hair: HAIR.栗子, eye: EYES.琥珀, outfit: 'hoodie', oc: OC.霧藍, age: 'teen', m: true },
    xu: { back: 'short', bang: 'part', hair: HAIR.深棕, eye: EYES.墨玉, outfit: 'suit', oc: OC.墨紺, acc2: 'glasses', age: 'elder', m: true },
    huang: { back: 'short', bang: 'side', hair: HAIR.墨黑, eye: EYES.墨玉, outfit: 'tux', oc: OC.墨紺, age: 'adult', m: true, expr: 'neutral' },
    yun: { back: 'odango', bang: 'blunt', hair: HAIR.栗子, eye: EYES.櫻桃, outfit: 'knit', oc: OC.櫻, age: 'child' },
    wang: { back: 'braid', bang: 'air', hair: HAIR.深棕, eye: EYES.蜜茶, outfit: 'teagown', oc: OC.青瓷, age: 'adult' },
    mei: { back: 'bob', bang: 'part', hair: HAIR.栗子, eye: EYES.琥珀, outfit: 'cardigan', oc: OC.藤, acc2: 'earring', age: 'elder' },
    partnerA: { back: 'short', bang: 'air', hair: HAIR.深棕, eye: EYES.湖水, outfit: 'knit', oc: OC.霧藍, age: 'adult', m: true },
    partnerB: { back: 'wave', bang: 'curtain', hair: HAIR.栗子, eye: EYES.翡翠, outfit: 'cardigan', oc: OC.月白, acc: 'pearl', age: 'adult' },
    su: { back: 'bun', bang: 'side', hair: HAIR.墨黑, eye: EYES.琥珀, outfit: 'concert', oc: OC.胭脂, acc: 'jade', acc2: 'tassel', age: 'adult' },
    ivy: { back: 'bob', bang: 'curtain', hair: HAIR.墨黑, eye: EYES.紫晶, outfit: 'coat', oc: OC.墨紺, acc2: 'choker', age: 'adult' },
    hao: { back: 'short', bang: 'spiky', hair: HAIR.墨黑, eye: EYES.墨玉, outfit: 'hoodie', oc: OC.青瓷, age: 'child', m: true, expr: 'neutral' }
  };

  window.AV = { render, mix, HAIR, EYES, SKIN, OC, BACKS, BANGS, OUTFITS, ACC, ACC2, NPC_LOOK };
})();
