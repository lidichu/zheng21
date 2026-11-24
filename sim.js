// 無畫面模擬：一次跑很多段人生，檢查錯誤、卡關與數值平衡
const fs = require('fs'), vm = require('vm'), dir = process.argv[2], N = +process.argv[3] || 40;
const noop = () => { };
const el = new Proxy({}, { get: (t, k) => k === 'dataset' || k === 'style' ? {} : k === 'querySelectorAll' ? () => [] : k === 'querySelector' ? () => el : typeof k === 'string' && /^(add|remove|set|focus|scroll|get)/.test(k) ? noop : el[k] = (t[k] ?? ''), set: () => true });
const ctx = { window: {}, document: { addEventListener: noop, querySelector: () => el, querySelectorAll: () => [] }, localStorage: { getItem: () => null, setItem: noop, removeItem: noop }, matchMedia: () => ({ matches: false, addEventListener: noop }), console, setTimeout, Math, JSON, Date, Object, Array, String, Number, Promise, scrollTo: noop };
ctx.window = ctx; vm.createContext(ctx);
let src = ['avatar.js', 'data.js', 'events.js', 'game.js'].map(f => fs.readFileSync(dir + '/' + f, 'utf8')).join('\n;\n');
src = src.replace(/window\.claude\?\.hot[\s\S]*$/, '').replace('const sleep = ms => new Promise(r => setTimeout(r, ms));', 'const sleep = () => Promise.resolve();');
src += `
;render = renderSide = renderPlan = renderControls = renderMap = renderLog = renderScene = renderTop = renderStart = renderEnd = () => {};
show = s => { UI.screen = s; };
finish = () => { UI.finished = true; };
showCard = ({ choices, auto }) => { globalThis.__cards = (globalThis.__cards || 0) + 1; if (!auto && (!choices || !choices.length)) throw new Error('沒有選項 ' + S.age); return Promise.resolve(auto ? 0 : Math.floor(Math.random() * choices.length)); };
showResult = () => Promise.resolve();
showPause = () => Promise.resolve('');
function planYear() {
  const av = availActs();
  const want = [];
  const pref = S.student ? ['lesson', 'practice', 'theory', 'study', 'lesson', 'practice', 'rest', 'play', 'concert', 'ensemble'] : ['teach', 'gig', 'practice', 'lesson', 'rest', 'video', 'concert', 'family', 'play', 'research', 'school', 'orch', 'work'];
  if (av.includes('lesson')) want.push('lesson');
  if (av.includes('practice') && Math.random() < .8) want.push('practice');
  if (S.student && S.age >= 15 && Math.random() < .5) want.push('theory');
  while (want.length < 4) { const c = pref.filter(k => av.includes(k)); want.push(c.length ? c[Math.floor(Math.random() * c.length)] : 'rest'); }
  for (let i = want.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [want[i], want[j]] = [want[j], want[i]]; }
  if (S.st.health < 40) want[3] = 'rest';
  if (S.st.mood < 35) want[1] = 'play';
  S.sched = want;
  fixSched();
}
globalThis.__sim = async function (bg) {
  UI.finished = false; UI.auto = false; globalThis.__cards = 0;
  newGame('測試', bg, defaultLook());
  let guard = 0;
  while (!UI.finished && guard++ < 80) {
    planYear();
    if (schedIssue()) throw new Error('排程問題 ' + schedIssue() + ' ' + S.sched);
    const age0 = S.age;
    await runYear();
    if (!UI.finished && S.age !== age0 + 1) throw new Error('年齡沒前進 ' + age0);
  }
  return { bg, age: S.age, titles: titles().map(t => t[0]), own: [...S.own.outfit, ...S.own.acc, ...S.own.acc2] };
};`;
vm.runInContext(src, ctx);
(async () => {
  const res = []; const errs = {};
  for (const bg of ['child', 'teen', 'adult']) for (let i = 0; i < N; i++) {
    try { res.push(await ctx.__sim(bg)); } catch (e) { const k = String(e.stack).split('\n').slice(0, 3).join(' | '); errs[k] = (errs[k] || 0) + 1; }
  }
  console.log('ERRORS', JSON.stringify(errs, null, 1));
  const cnt = a => { const c = {}; a.forEach(x => c[x] = (c[x] || 0) + 1); return Object.entries(c).sort((x, y) => y[1] - x[1]).map(([k, v]) => k + ':' + v).join(' '); };
  for (const bg of ['child', 'teen', 'adult']) {
    const R = res.filter(r => r.bg === bg); if (!R.length) continue;
    console.log(`== ${bg} (${R.length}) 主稱號 ${cnt(R.map(r => r.titles[0]))}`);
    console.log('   劇情拿到的衣服飾品', cnt(R.flatMap(r => r.own).filter(k => ['concert', 'teagown', 'note', 'jade', 'gown', 'necklace', 'blazer', 'cardigan', 'hanfu', 'tux'].includes(k))));
  }
})();
