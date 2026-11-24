// 二十一弦：引擎與介面
'use strict';

const END_AGE = 65;
const SAVE_KEY = 'zheng21.save.v1', G_KEY = 'zheng21.global.v1';
const STATS = { tech: '技巧', music: '樂感', theory: '樂理', study: '學業', health: '健康', mood: '心情', passion: '熱忱', fame: '名氣' };
const PIECE = Object.fromEntries(PIECES.map(p => [p.id, p]));
let S = null;
let G = loadG();
const UI = { slot: 0, auto: false, speed: 1, busy: false, resolve: null, screen: 'start', sound: false, draft: null, encTab: '樂器' };

// ---------- 小工具 ----------
const R = Math.random;
const ri = (a, b) => Math.floor(a + R() * (b - a + 1));
const pick = a => a[Math.floor(R() * a.length)];
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const val = v => typeof v === 'function' ? v() : v;
const wan = n => { const s = n < 0 ? '−' : ''; n = Math.abs(n); return n >= 10000 ? `${s}${(n / 10000).toFixed(n >= 1e6 ? 0 : 1).replace(/\.0$/, '')} 萬` : `${s}${n.toLocaleString()}`; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 無痕視窗等情況存不了，遊戲照常進行 */ } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { } }
function loadG() { return Object.assign({ enc: {}, ends: {}, lives: [] }, lsGet(G_KEY) || {}); }
function saveG() { lsSet(G_KEY, G); }

// ---------- 給事件用的 API ----------
function add(k, v) { if (k in S.st) S.st[k] = clamp(Math.round(S.st[k] + v)); }
function gain(k, b) { const cur = S.st[k]; const age = S.age > 45 ? .8 : (S.bg === 'teen' && S.age < 19 && cur < 60) ? 1.6 : 1; add(k, Math.max(1, Math.round(b * (1 - cur / 118) * age * (.75 + R() * .55)))); }
function cash(v) { S.money = Math.round(S.money + v); }
function meet(n) { if (!S.met[n]) { S.met[n] = 1; if (S.rel[n] == null) S.rel[n] = 30; } }
function rel(n, v) { meet(n); S.rel[n] = clamp(S.rel[n] + v); }
function job(k, on) { S.jobs[k] = !!on; if (on) S.ever[k] = 1; }
function face(e) { S.expr = e; }
function chain(id) { S.chainQ.push(id); }
function award(n, fame) { S.awards.push({ age: S.age, n }); if (fame) add('fame', fame); S.cur && (S.cur.award = 1); if (S.awards.length === 1) note(own('acc2', 'necklace')); sfx('award'); }
function cert(n) { S.certs.push({ age: S.age, n }); }
function check(score, target, spread = 8) { return R() < 1 / (1 + Math.exp(-(score - target) / (spread / 2.2))); }
// 有些故事只屬於某幾段人生：每段人生第一次問到時擲一次，之後都照這個結果
function fate(k, p) { S.fate = S.fate || {}; if (S.fate[k] == null) S.fate[k] = R() < p; return S.fate[k]; }
function perf() { return S.st.tech * .55 + S.st.music * .45 + (S.flags.goodZheng ? 4 : 0) + (S.st.mood - 50) * .06 + ri(-6, 6); }
function lv() { const a = S.age; return a < 12 ? 'elem' : a < 15 ? 'jh' : a < 18 ? 'hs' : 'uni'; }
function topPieces(n) { return S.pieces.map(id => PIECE[id]).sort((a, b) => b.req - a.req).slice(0, n); }
function unlock(id) {
  if (S.enc[id]) return;
  S.enc[id] = 1; G.enc[id] = 1; saveG();
  const e = encEntry(id); if (e) line('enc', `箏譜筆記新增：${e.n}`);
}
function own(type, id) {
  if (S.own[type].includes(id)) return '';
  S.own[type].push(id);
  const name = { outfit: AV.OUTFITS, acc: AV.ACC, acc2: AV.ACC2 }[type][id];
  line('gift', `衣櫃解鎖：${name}`);
  return '';
}
function learn(id) {
  if (S.pieces.includes(id)) return;
  S.pieces.push(id); const p = PIECE[id];
  if (S.pieces.length === 10) own('acc', 'note');
  unlock('p:' + id); if (SCHOOLS[p.sch]) unlock('sch:' + p.sch);
  line('gain', `學會新曲〈${p.n}〉・${p.sch}`);
}
function note(t) { if (t) line('n', t); }
function line(k, t, extra) { if (S && S.cur) S.cur.lines.push(Object.assign({ k, t }, extra || {})); }

// ---------- 行程 ----------
const T = {
  lesson: () => S.bg === 'adult' && !S.major ? ['王老師今天教新的指法，你在筆記本畫滿了箭頭。', '成人班的同學互相錄影，回家對著影片糾正手型。', '你終於彈完一整首，王老師說：「有歌了。」'] :
    S.age < 12 ? ['每週六下午去陳老師那裡上課，下課可以喝綠豆湯。', '陳老師在譜上用紅筆圈出你老是彈錯的地方。', '你學會自己纏膠布了，雖然有點歪。'] :
      S.major ? ['許教授一堂課只讓你彈了八小節。', '主修課上，許教授示範了三種不同的揉法。', '你把一首曲子拆成十段，每段都重新想過。'] :
        ['老師說你的右手顆粒越來越清楚了。', '這一季的課都在磨同一首曲子。', '老師換了新的練習曲，第一週你彈得手忙腳亂。'],
  practice: () => S.age < 18 ? ['放學回家先練一小時，膠布換了一卷又一卷。', '你把難段拆開，用節拍器從 60 慢慢推到 120。', '指尖磨出一層薄繭，戴義甲終於不痛了。', '週末一整個下午都在練搖指，大拇指痠到拿不住筷子。'] :
    ['下班後練到十點，鄰居來敲過一次門。', '每天早上出門前先練二十分鐘音階。', '你重新回頭練基本功：托、抹、勾，一個音一個音聽。', '你錄下自己的練習，聽完嘆了一口氣，又重錄一次。'],
  theory: () => ['五度圈終於背起來了。', '每天十分鐘聽寫，從單音練到和弦。', '視唱課上你第一次一次就唱對。', '你把簡譜和五線譜對照著抄了一整本。'],
  study: () => ['月考前把箏蓋起來，專心讀書。', '數學補習班佔掉了週三的練琴時間。', '你的成績單漂亮了不少，媽媽很開心。'],
  concert: () => ['去聽了一場國樂團音樂會，回家路上一直在想那段箏的獨奏。', '你把同一首曲子聽了五個版本，發現每個人的揉弦都不一樣。', '在演奏廳的最後一排，你閉上眼睛聽完了整場。'],
  ensemble: () => ['合奏時你第一次聽到箏的聲音被琵琶、揚琴、笙包圍。', '團練時指揮停下來三次，都是彈撥聲部進錯拍。', '你學會一邊彈一邊看指揮，還要聽旁邊的中阮。'],
  rest: () => ['這一季你睡得很飽。', '你把箏蓋上布，讓手指休息。', '在家看了很多電影，偶爾經過箏就隨手刮一下。'],
  play: () => ['跟朋友去了海邊，回來發現手上的繭變薄了。', '逛了一整天街，買了好多可愛的東西。', '去了一趟花蓮，看海聽浪，腦中自動配上了刮奏。'],
  parttime: () => ['在飲料店打工，手搖杯搖得比搖指還快。', '當家教教國中數學。', '在書店打工，順便把音樂區的書都翻了一遍。'],
  teach: () => S.bg === 'child' && R() < .3 ? ['你幫學生纏膠布的手勢，越來越像當年的陳老師。'] : ['每週排滿了課，你發現教別人比自己彈還難。', '學生問：「老師，為什麼要戴義甲？」你講了半小時。', '一個學生終於學會按音，開心得一直按。', '成果發表會的節目單上，有十幾個學生的名字。'],
  gig: () => S.flags.busker && R() < .4 ? ['你在捷運站出口擺好箏，第一首〈漁舟唱晚〉就圍了一圈人。', '一個小孩在你的琴盒前站了二十分鐘。'] : ['婚禮、尾牙、廟會、開幕式，你背著二十一根弦跑遍北中南。', '一場商業演出，主辦方要你彈〈卡農〉。你照彈了。', '你在古蹟裡辦了一場小型箏樂會。'],
  video: () => ['你在房間架好手機，錄了一段古箏版的流行歌。', '剪片剪到半夜，標題想了二十個。', '你開了一場直播，邊彈邊回答留言。'],
  work: () => ['專案一個接一個，琴袋上積了薄薄一層灰。', '公司尾牙你被拱上台彈了一首，同事第一次知道你會古箏。', '加班的夜裡，你在捷運上用手指在膝蓋上練指法。'],
  orch: () => ['這一季排了三套曲目，每天都在排練廳。', '新作品的箏聲部寫得很難，你在譜上貼滿便利貼。', '巡迴到偏鄉學校演出，孩子們圍著箏不肯走。'],
  school: () => S.jobs.prof || S.jobs.lecturer ? ['你在大學教副修古箏，學生的程度差很多。', '這學期你開了一門「臺灣箏樂史」。'] : ['音樂課上，你讓全班輪流試彈箏。', '學校國樂團要比賽了，你每天留下來帶團練。', '你改了一百份音樂課學習單。'],
  research: () => ['你在國家圖書館找到一份老箏譜的手抄本。', '論文寫到第三章，卡住了。', '你訪問了一位八十歲的老箏人，錄了三個小時的口述。'],
  family: () => ['你把週末留給家人。', '帶家人去看了一場音樂會。', '回家吃飯，媽媽煮了你最愛的菜。']
};
const ACT = {
  lesson: { n: '上箏課', d: '技巧＋ 樂感＋', ok: () => S.lessons || S.major, cost: () => S.bg !== 'adult' && S.age < 22 ? 0 : 9000, run() { gain('tech', S.age < 12 ? 2.6 : 3); gain('music', 2.4); if (S.age < 14) gain('theory', 1.2); if (S.age >= 22) add('passion', 1); return pick(T.lesson()); } },
  practice: { n: '自主練琴', d: '技巧＋＋ 心情－ 健康－', ok: () => !S.injured, run() { gain('tech', S.age < 12 ? 3.4 : 4.2); add('mood', -ri(S.age < 22 ? 2 : 1, 3)); add('health', -ri(1, 3)); return pick(T.practice()); } },
  theory: { n: '樂理聽寫', d: '樂理＋＋', run() { gain('theory', 4.6); add('mood', -1); return pick(T.theory()); } },
  study: { n: '讀書', d: '學業＋＋ 心情－', ok: () => S.student, run() { gain('study', 4.8); add('mood', -2); return pick(T.study()); } },
  concert: { n: '聽音樂會', d: '樂感＋ 心情＋', cost: () => S.age < 18 ? 300 : 1200, run() { gain('music', 3.4); add('mood', 3); add('passion', 1); return pick(T.concert()); } },
  ensemble: { n: '合奏團練', d: '樂感＋ 名氣＋ 熱忱＋', ok: () => S.flags.club || S.mc || S.major || S.jobs.amateur, run() { gain('music', 2.8); add('fame', 1); add('mood', 2); add('passion', 2); if (S.met.kai && S.age < 25) rel('kai', 2); return pick(T.ensemble()); } },
  rest: { n: '休息', d: '健康＋＋ 心情＋', run() { add('health', ri(5, 8)); add('mood', ri(3, 6)); add('passion', 1); if (R() < .5) add('tech', -1); return pick(T.rest()); } },
  play: { n: '出去玩', d: '心情＋＋ 熱忱＋', cost: () => S.age < 18 ? 400 : 3000, run() { add('mood', ri(7, 11)); add('passion', ri(1, 3)); add('health', 1); return pick(T.play()); } },
  parttime: { n: '打工', d: '＋NT$ 1.5 萬 心情－', ok: () => S.student && S.age >= 16, run() { cash(15000); add('mood', -2); add('health', -1); return pick(T.parttime()); } },
  teach: { n: '教箏', d: '收入看學生數 名氣＋', ok: () => S.jobs.studio || (S.age >= 18 && (S.grade >= 6 || S.major)), run() {
    if (!S.jobs.studio) { job('studio', 1); own('outfit', 'cardigan'); }
    if (!S.students) { S.students = 2; S.taught += 2; }
    const n = R() < .35 + S.st.fame / 150 + (S.flags.bigStudio ? .15 : 0) ? ri(1, 2) : 0;
    S.students = Math.min(40, S.students + n); S.taught += n;
    cash(S.students * 10000); add('fame', 1); gain('music', 1.2); if (S.yun) S.yun.lv += 2;
    return pick(T.teach()) + `（學生 ${S.students} 人）`;
  } },
  gig: { n: '接演出', d: '收入看名氣 名氣＋ 健康－', ok: () => S.age >= 16 && S.st.tech >= 40, run() { cash(8000 + S.st.fame * (S.flags.agent === 1 ? 700 : 500) + (S.flags.busker ? ri(2000, 9000) : 0)); gain('fame', S.flags.agent === 1 ? 2.8 : 2.2); add('health', -2); return pick(T.gig()); } },
  video: { n: '拍影片', d: '名氣＋ 可能爆紅', ok: () => S.age >= 13, run() {
    gain('fame', 2.2); add('mood', ri(-1, 2));
    if (!S.flags.viral && R() < .01 + S.st.fame / 1500 + S.st.tech / 3000) chain('viral');
    if (S.st.fame >= 40) cash(S.st.fame * 250);
    return pick(T.video());
  } },
  work: { n: '上班', d: '＋NT$ 14 萬 心情－', ok: () => S.jobs.office, job: () => S.jobs.office, run() { cash(140000); add('mood', -2); if (R() < .5) add('tech', -1); return pick(T.work()); } },
  orch: { n: '樂團工作', d: '＋NT$ 15 萬 樂感＋', ok: () => S.jobs.orchestra, job: () => S.jobs.orchestra, run() { cash(150000 + (S.jobs.principal ? 25000 : 0)); gain('music', 2.2); gain('tech', 1.6); add('health', -1); rel('huang', 1); return pick(T.orch()); } },
  school: { n: '學校教課', d: '薪水 名氣＋', ok: () => S.jobs.schoolT || S.jobs.sub || S.jobs.lecturer || S.jobs.prof, job: () => S.jobs.schoolT || S.jobs.sub || S.jobs.prof, run() { cash(S.jobs.prof ? 240000 : S.jobs.schoolT ? 160000 : S.jobs.sub ? 120000 : 45000); add('fame', 1); add('mood', -1); return pick(T.school()); } },
  research: { n: '研究寫作', d: '樂理＋ 名氣＋', ok: () => S.flags.grad || S.flags.phd || S.flags.master || S.flags.dr, run() { gain('theory', 3.6); add('fame', 1); return pick(T.research()); } },
  family: { n: '陪家人', d: '心情＋＋', ok: () => S.age >= 20, run() { add('mood', ri(6, 9)); if (!S.flags.momGone) rel('mom', 3); if (S.partner && S.partner.st) rel('partner', 4); return pick(T.family()); } }
};
const ACT_GROUP = { lesson: '練', practice: '練', theory: '學', study: '學', concert: '學', ensemble: '練', rest: '休', play: '休', family: '休', parttime: '工', teach: '工', gig: '工', video: '工', work: '工', orch: '工', school: '工', research: '學' };

EV.broke = {
  prio: 85, rep: 2, w: () => S.money < -150000, npc: 'mom', t: '存款見底',
  x: () => `存款簿上的數字是 ${wan(S.money)}。房租、生活費、樂器保養……`,
  ch: [
    { t: '向家人借錢', h: '心情↓', fx: () => { cash(200000); add('mood', -8); return '媽媽什麼都沒問，隔天就把錢匯過來了。'; } },
    { t: '找一份正職', h: '多一份薪水', if: () => !S.jobs.office && !S.jobs.orchestra && !S.jobs.schoolT && !S.jobs.prof, fx: () => { job('office', 1); add('passion', -6); return '你找了一份辦公室工作。行程表要排至少兩季「上班」。'; } }
  ]
};

// ---------- 新的一生 ----------
function newGame(name, bg, look) {
  const age = { child: 6, teen: 15, adult: 28 }[bg];
  S = {
    v: 1, name: name || '若箏', bg, look, age, startAge: age, year0: new Date().getFullYear(), expr: null,
    st: { tech: 0, music: bg === 'adult' ? 12 : 6, theory: bg === 'adult' ? 14 : bg === 'teen' ? 10 : 2, study: bg === 'adult' ? 50 : 30, health: 82, mood: 62, passion: 62, fame: 0 },
    money: bg === 'adult' ? 600000 : bg === 'teen' ? 6000 : 2000,
    sched: bg === 'child' ? ['lesson', 'practice', 'lesson', 'play'] : bg === 'teen' ? ['lesson', 'study', 'ensemble', 'practice'] : ['work', 'lesson', 'work', 'practice'],
    rel: {}, met: {}, flags: {}, done: {}, cd: {}, jobs: {}, ever: {}, enc: {}, notes: {},
    own: { outfit: ['knit', 'sailor', 'hoodie'], acc: ['none', 'bow', 'sakura'], acc2: ['none', 'glasses'] },
    grade: 0, certs: [], awards: [], pieces: [], techs: [], log: [], chainQ: [],
    students: 0, taught: 0, recitals: 0, anLv: bg === 'teen' ? 30 : 18, yun: null, kid: null, partner: null,
    mc: false, major: false, student: bg !== 'adult', lessons: true, injured: 0, uniName: '', talked: false, ended: false, endReason: ''
  };
  if (!S.own.outfit.includes(look.outfit)) look.outfit = 'knit';
  if (bg === 'adult') job('office', 1);
  if (bg === 'teen') S.flags.club = 1;
  S.pieces = []; learnSilently('xxx'); S.techs = ['tmg'];
  UI.slot = 0;
  save(); show('game');
}
function learnSilently(id) { S.pieces.push(id); S.enc['p:' + id] = 1; G.enc['p:' + id] = 1; S.enc['t:tmg'] = 1; G.enc['t:tmg'] = 1; }

function save() { if (S && !S.ended) lsSet(SAVE_KEY, S); }

// ---------- 一年 ----------
function availActs() { return Object.keys(ACT).filter(k => !ACT[k].ok || ACT[k].ok()); }
function schedIssue() {
  for (const k of Object.keys(ACT)) {
    const A = ACT[k];
    if (A.job && A.job()) {
      const n = S.sched.filter(x => x === k).length;
      if (n < 2) return `你有正職工作，「${A.n}」至少要排兩季。`;
    }
  }
  const bad = S.sched.find(k => !ACT[k] || (ACT[k].ok && !ACT[k].ok()));
  if (bad) return `「${ACT[bad] ? ACT[bad].n : bad}」現在不能排，請換一個行程。`;
  return '';
}
function fixSched() {
  const av = availActs();
  S.sched = S.sched.map(k => av.includes(k) ? k : 'rest');
  // 有正職就自動排滿兩季，優先換掉休息、出去玩
  for (const k of Object.keys(ACT)) {
    const A = ACT[k];
    if (!A.job || !A.job()) continue;
    const isJob = x => ACT[x].job && ACT[x].job();
    while (S.sched.filter(x => x === k).length < 2) {
      let i = S.sched.findIndex(x => (x === 'rest' || x === 'play') && !isJob(x));
      if (i < 0) i = S.sched.findIndex(x => !isJob(x));
      if (i < 0) break;
      S.sched[i] = k;
    }
  }
}

async function runYear() {
  if (UI.busy || !S || S.ended) return;
  const issue = schedIssue();
  if (issue) { $('#planMsg').textContent = issue; UI.auto = false; renderControls(); return; }
  UI.busy = true; S.expr = null;
  S.cur = { age: S.age, y: S.year0 + S.age - S.startAge, label: stageLabel(), lines: [], acts: S.sched.slice(), award: 0 };
  S.log.unshift(S.cur); if (S.log.length > 70) S.log.length = 70;
  if (S.pendingLines) { S.cur.lines.push(...S.pendingLines); S.pendingLines = null; }
  render();
  for (let s = 0; s < 4; s++) {
    S.season = s; S.expr = null;
    for (const id of Object.keys(EV)) { const e = EV[id]; if (e.first && e.s === s && !S.done[id] && e.w()) await fire(id); }
    S.expr = null;
    let a = S.sched[s];
    if (a === 'practice' && S.injured) a = 'rest';
    const A = ACT[a];
    const before = Object.assign({}, S.st), m0 = S.money;
    const c = A.cost ? A.cost() : 0;
    let txt;
    if (c && S.money - c < -100000) { a = 'rest'; txt = '錢不夠，這一季只好待在家。' + ACT.rest.run(); }
    else { if (c) cash(-c); txt = A.run(); }
    seasonEconomy();
    if ((a === 'lesson' || a === 'practice') && R() < .45) tryLearn();
    checkTechs();
    const delta = diff(before); const dm = S.money - m0;
    S.cur.lines.push({ k: 'act', t: txt, s, a, delta, dm });
    renderScene(s, a, txt, delta, dm); renderSide(); renderLog();
    await sleep(UI.auto ? 1100 / UI.speed : 900);
    while (S.chainQ.length) await fire(S.chainQ.shift());
    for (const id of pickEvents(s)) {
      if (S.ended) break;
      if (!EV[id].w()) continue;
      await fire(id);
      while (S.chainQ.length && !S.ended) await fire(S.chainQ.shift());
    }
    if (S.ended) break;
  }
  if (!S.ended) await yearEnd();
  UI.busy = false;
  if (S.ended) { finish(); return; }
  fixSched(); S.talked = false; save(); render();
  if (UI.auto) setTimeout(() => { if (UI.auto && !UI.busy && UI.screen === 'game') runYear(); }, 700 / UI.speed);
}
function diff(b) { const d = {}; for (const k in S.st) { const v = S.st[k] - b[k]; if (v) d[k] = v; } return d; }
function seasonEconomy() {
  if (S.age < 18) cash(S.bg === 'teen' ? 1500 : 800);
  else if (S.student) cash(12000);
  else cash(-80000);
}
function tryLearn() {
  const c = PIECES.filter(p => !S.pieces.includes(p.id) && p.req <= S.st.tech + 2 && p.req < 999);
  if (!c.length) return;
  c.sort((a, b) => a.req - b.req);
  learn(R() < .7 ? c[0].id : pick(c).id);
}
function checkTechs() {
  for (const t of TECHS) if (!S.techs.includes(t.id) && S.st.tech >= t.req) {
    S.techs.push(t.id); unlock('t:' + t.id); line('gain', `學會新技法：${t.n}`);
  }
}
function pickEvents(s) {
  const out = [];
  const ok = (id, e) => (!S.done[id] || (e.rep && !(S.cd[id] > S.age))) && e.w();
  const scripted = Object.keys(EV).filter(id => { const e = EV[id]; return e.prio != null && (e.s == null || e.s === s) && ok(id, e); })
    .sort((a, b) => EV[b].prio - EV[a].prio).slice(0, 2);
  out.push(...scripted);
  if (out.length < 2) {
    const pool = Object.keys(EV).filter(id => { const e = EV[id]; return e.p && e.prio == null && (e.s == null || e.s === s) && ok(id, e); });
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    for (const id of pool) if (R() < EV[id].p) { out.push(id); break; }
  }
  return out;
}
async function fire(id) {
  const e = EV[id]; if (!e) return;
  S.done[id] = 1; if (e.rep) S.cd[id] = S.age + e.rep;
  if (e.pre) e.pre();
  const npc = val(e.npc);
  if (npc && npc !== 'partner') meet(npc);
  const text = e.x ? e.x() : '';
  if (e.auto) {
    const r = e.auto();
    line('ev', e.t, { npc }); line('res', r, { npc });
    await showCard({ title: e.t, npc, text: r, auto: true });
  } else {
    const chs = val(e.ch).filter(c => !c.if || c.if());
    const i = await showCard({ title: e.t, npc, text, choices: chs });
    const c = chs[i];
    line('ev', e.t, { npc }); line('pick', val(c.t));
    const r = c.fx();
    line('res', r);
    await showResult(r);
  }
  renderSide(); renderLog();
}
async function yearEnd() {
  const acts = S.sched;
  const has = k => acts.includes(k);
  // 熱忱會慢慢被日常磨掉：心情好磨得少，心情差磨得多
  const playing = ['lesson', 'practice', 'ensemble', 'gig', 'teach', 'orch'].some(has);
  add('passion', (playing ? -1 : -4) + Math.round((S.st.mood - 55) / 12) - (S.st.mood < 25 ? ri(2, 4) : 0));
  S.st.mood = clamp(Math.round(S.st.mood + (55 - S.st.mood) * .12));
  if (!playing) { add('passion', -4); add('tech', -3); }
  if (acts.filter(k => k === 'practice').length >= 3 && S.st.mood < 60) add('passion', -2);
  if (S.age > 45) add('health', -1);
  if (S.age > 58) add('health', -2);
  if (S.injured) S.injured--;
  if (S.students) S.students = Math.max(0, S.students - ri(0, 2));
  if (S.yun) { S.yun.age++; S.yun.lv += S.jobs.studio ? 4 : 2; }
  if (S.kid) S.kid.age++;
  if (!S.flags.anQuit) S.anLv = Math.min(90, S.anLv + ri(2, 5));
  S.age++;
  if (S.flags.gap === 2 && S.age === 19 && !S.major) S.flags.gap = 0;
  const q = PAUSES[S.age];
  if (q && S.age > S.startAge) {
    const t = await showPause(q);
    if (t) S.notes[S.age] = { q, a: t };
  }
}

// ---------- 標籤 ----------
function stageLabel() {
  const a = S.age;
  if (S.student) {
    if (a < 12) return `國小${'一二三四五六'[a - 6] || ''}年級${S.mc ? '・音樂班' : ''}`;
    if (a < 15) return `國中${'七八九'[a - 12]}年級${S.mc ? '・音樂班' : S.flags.club ? '・國樂社' : ''}`;
    if (a < 18) return `高${'一二三'[a - 15]}${S.mc ? '・音樂班' : S.flags.club ? '・國樂社' : ''}`;
    if (S.flags.phd) return '博士班';
    if (S.flags.grad) return '研究所';
    if (S.flags.gap === 1) return '重考生';
    if (S.uniName) return `${S.uniName}${S.major ? '中國音樂學系' : '・國樂社'}`;
    return '學生';
  }
  const L = [];
  const J = S.jobs;
  if (J.orchestra) L.push(J.principal ? '國樂團箏首席' : '國樂團團員');
  if (J.prof) L.push('大學教授');
  if (J.schoolT) L.push('音樂老師');
  if (J.sub) L.push('代理代課老師');
  if (J.lecturer) L.push('大學兼任講師');
  if (S.flags.cafe && J.studio) L.push('「箏與茶」老闆');
  else if (S.flags.wangClass === 1 && J.studio) L.push('成人班老師');
  else if (J.studio) L.push('箏樂教室老師');
  if (J.office) L.push('上班族');
  if (J.freelance) L.push('自由演奏者');
  if (J.amateur) L.push('業餘樂團');
  if (S.age >= 65 && !L.length) L.push('退休');
  return L.slice(0, 2).join('・') || '自由業';
}
function ageStage(a) { return a < 12 ? 'child' : a < 18 ? 'teen' : a < 50 ? 'adult' : 'elder'; }
function lookOf(who) {
  if (who === 'me' || !who) {
    const e = S.expr || (S.st.mood < 28 ? 'sad' : 'smile');
    return Object.assign({}, S.look, { age: ageStage(S.age), expr: e });
  }
  if (who === 'partner') return Object.assign({}, AV.NPC_LOOK[S.partner ? S.partner.look : 'partnerA'], { age: ageStage(Math.max(22, S.age)) });
  const L = Object.assign({}, AV.NPC_LOOK[who]);
  if (who === 'an' || who === 'kai') { L.age = ageStage(S.age); if (S.age >= 18) L.outfit = who === 'an' ? (S.flags.anQuit ? 'cardigan' : S.flags.anOrch ? 'concert' : 'hanfu') : 'knit'; }
  if (who === 'yun' && S.yun) { L.age = ageStage(S.yun.age); if (S.yun.age >= 12) L.outfit = 'sailor'; }
  if (who === 'hao' && S.flags.haoAge) { const a = 8 + S.age - S.flags.haoAge; L.age = ageStage(a); if (a >= 12) L.expr = 'smile'; }
  if (who === 'su' && orchYears() >= 15) L.age = 'elder';
  if ((who === 'mom' || who === 'chen') && S.age >= (who === 'chen' ? 22 : 35)) L.age = 'elder';
  return L;
}
function npcName(n) { return n === 'partner' ? (S.partner ? S.partner.n : '') : NPC[n] ? NPC[n].n : ''; }

// ---------- 畫面 ----------
function show(screen) {
  UI.screen = screen;
  for (const id of ['start', 'game', 'end']) $('#' + id).hidden = id !== screen;
  if (screen === 'start') renderStart();
  if (screen === 'game') render();
  window.scrollTo(0, 0);
}
function render() { renderTop(); renderSide(); renderPlan(); renderControls(); renderMap(); renderLog(); }
function renderTop() {
  $('#topName').textContent = S.name;
  $('#topAge').textContent = `${S.year0 + S.age - S.startAge} 年・${S.age} 歲`;
  $('#topStage').textContent = stageLabel();
}
function bar(k) {
  const v = S.st[k];
  return `<div class="stat"><span class="stat-k">${STATS[k]}</span><span class="stat-bar"><i style="width:${v}%" class="b-${k}"></i></span><span class="stat-v">${v}</span></div>`;
}
function renderSide() {
  if (!S) return;
  $('#portrait').innerHTML = AV.render(lookOf('me'), { label: S.name });
  const keys = ['tech', 'music', 'theory'].concat(S.student ? ['study'] : [], ['health', 'mood', 'passion', 'fame']);
  $('#stats').innerHTML = keys.map(bar).join('');
  const facts = [
    ['存款', `NT$ ${wan(S.money)}`],
    ['考級', S.grade ? gradeName(S.grade) : '—'],
    ['技法', `${S.techs.length} / ${TECHS.length}`],
    ['曲目', `${S.pieces.length} 首`]
  ];
  if (S.students || S.jobs.studio) facts.push(['學生', `${S.students} 人`]);
  if (S.awards.length) facts.push(['獎項', `${S.awards.length} 項`]);
  $('#facts').innerHTML = facts.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
  const people = Object.keys(S.met).filter(n => NPC[n] && n !== 'partner' || (n === 'partner' && S.partner && S.partner.st));
  $('#people').innerHTML = people.map(n => `<li><span class="mini">${AV.render(lookOf(n), { bust: true })}</span><span class="pp"><b>${esc(npcName(n))}</b><small>${NPC[n].r}</small></span><span class="heart" title="好感 ${S.rel[n]}"><i style="width:${S.rel[n]}%"></i></span></li>`).join('');
}
function renderPlan() {
  const plan = $('#plan');
  if (UI.busy) return;
  plan.hidden = false; $('#stage').hidden = true;
  $('#slots').innerHTML = S.sched.map((k, i) => `<button class="slot${UI.slot === i ? ' on' : ''}" data-slot="${i}" aria-pressed="${UI.slot === i}"><span class="slot-s">${SEASONS[i].n}<small>${SEASONS[i].m}</small></span><span class="slot-a g-${ACT_GROUP[k]}">${ACT[k] ? ACT[k].n : '—'}</span></button>`).join('');
  const av = availActs();
  $('#acts').innerHTML = av.map(k => {
    const A = ACT[k]; const c = A.cost ? A.cost() : 0;
    return `<button class="act g-${ACT_GROUP[k]}" data-act="${k}"><b>${A.n}</b><small>${A.d}${c ? `　－NT$ ${wan(c)}` : ''}</small></button>`;
  }).join('');
  const people = Object.keys(S.met).filter(n => n !== 'partner' ? !!NPC[n] && TALK[n] && !(n === 'mom' && S.flags.momGone) : S.partner && S.partner.st);
  $('#talk').innerHTML = people.map(n => `<button class="chip" data-talk="${n}" ${S.talked ? 'disabled' : ''}><span class="mini">${AV.render(lookOf(n), { bust: true })}</span>${esc(npcName(n))}</button>`).join('');
  $('#talkNote').textContent = S.talked ? '今年已經聊過了' : '每年可以找一個人聊聊';
  $('#planMsg').textContent = schedIssue();
}
function renderControls() {
  $('#go').disabled = UI.busy;
  $('#auto').setAttribute('aria-pressed', UI.auto);
  $('#auto').textContent = UI.auto ? '自動中・點擊暫停' : '自動往前';
  document.querySelectorAll('[data-speed]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.speed === UI.speed));
  $('#soundBtn').setAttribute('aria-pressed', UI.sound);
  $('#soundBtn').textContent = UI.sound ? '聲音：開' : '聲音：關';
}
function renderMap() {
  let h = '';
  for (let a = S.startAge; a < END_AGE + 1; a++) {
    const y = S.log.find(l => l.age === a && l.acts);
    const g = y ? dominant(y.acts) : '';
    h += `<i class="${y ? 'm-' + g : ''}${a === S.age ? ' now' : ''}${y && y.award ? ' aw' : ''}" title="${a} 歲"></i>`;
  }
  $('#map').innerHTML = h;
}
function dominant(acts) { const c = {}; acts.forEach(k => c[ACT_GROUP[k]] = (c[ACT_GROUP[k]] || 0) + 1); return Object.keys(c).sort((a, b) => c[b] - c[a])[0]; }
function deltaChips(d, dm) {
  const out = Object.keys(d).map(k => `<span class="d ${d[k] > 0 ? 'up' : 'dn'}">${STATS[k]} ${d[k] > 0 ? '+' : '−'}${Math.abs(d[k])}</span>`);
  if (dm) out.push(`<span class="d ${dm > 0 ? 'up' : 'dn'}">NT$ ${dm > 0 ? '+' : ''}${wan(dm)}</span>`);
  return out.join('');
}
function renderLog() {
  if (!S) return;
  $('#log').innerHTML = S.log.map(y => `<article class="yr"><h3><span>${y.y} 年</span>${y.age} 歲・${esc(y.label)}</h3><ul>${y.lines.map(l => {
    if (l.k === 'act') return `<li class="l-act"><span class="sea">${SEASONS[l.s].n}・${ACT[l.a] ? ACT[l.a].n : ''}</span><span class="tx">${esc(l.t)}</span><span class="ds">${deltaChips(l.delta || {}, l.dm)}</span></li>`;
    if (l.k === 'ev') return `<li class="l-ev">${esc(l.t)}${l.npc ? `<small>${esc(npcName(l.npc))}</small>` : ''}</li>`;
    if (l.k === 'pick') return `<li class="l-pick">你選擇：${esc(l.t)}</li>`;
    return `<li class="l-${l.k}">${esc(l.t)}</li>`;
  }).join('')}</ul></article>`).join('');
}
function renderScene(s, a, txt, d, dm) {
  $('#plan').hidden = true; const st = $('#stage'); st.hidden = false;
  st.innerHTML = `<div class="scene"><div class="scene-av">${AV.render(lookOf('me'))}</div><div class="scene-tx"><p class="scene-k">${SEASONS[s].n}　${SEASONS[s].m}・<b>${ACT[a].n}</b></p><p class="scene-say">${esc(txt)}</p><p class="ds">${deltaChips(d, dm)}</p></div></div>`;
}

// ---------- 事件卡 ----------
function showCard({ title, npc, text, choices, auto }) {
  return new Promise(res => {
    $('#plan').hidden = true;
    const st = $('#stage'); st.hidden = false;
    const who = npc ? `<div class="card-av">${AV.render(lookOf(npc))}<p><b>${esc(npcName(npc))}</b><small>${npc && NPC[npc] ? NPC[npc].r : ''}</small></p></div>` : '';
    const btns = auto ? `<button class="btn primary" data-pick="0">繼續</button>` :
      choices.map((c, i) => `<button class="choice" data-pick="${i}"><b>${esc(val(c.t))}</b>${c.h ? `<small>${esc(val(c.h))}</small>` : ''}</button>`).join('');
    st.innerHTML = `<div class="card${auto ? ' auto' : ''}">${who}<div class="card-body"><p class="card-k">${SEASONS[S.season || 0].n}・${auto ? '事件' : '抉擇'}</p><h2>${esc(title)}</h2><p class="card-say">${text}</p><div class="card-ch">${btns}</div></div></div>`;
    st.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const first = st.querySelector('[data-pick]'); if (first) first.focus({ preventScroll: true });
    UI.resolve = i => { UI.resolve = null; res(i); };
    if (auto && UI.auto) setTimeout(() => UI.resolve && UI.resolve(0), 2600 / UI.speed);
  });
}
function showResult(r) {
  return new Promise(res => {
    const body = $('#stage .card-body'); if (!body) return res();
    body.querySelector('.card-ch').innerHTML = `<p class="card-res">${esc(r)}</p><button class="btn primary" data-pick="0">繼續</button>`;
    const av = $('#stage .card-av svg'); if (av && S.expr) { /* 主角表情留給下一季 */ }
    body.querySelector('[data-pick]').focus({ preventScroll: true });
    renderSide();
    UI.resolve = () => { UI.resolve = null; res(); };
    if (UI.auto) setTimeout(() => UI.resolve && UI.resolve(), 2400 / UI.speed);
  });
}
function showPause(q) {
  return new Promise(res => {
    $('#plan').hidden = true; const st = $('#stage'); st.hidden = false;
    st.innerHTML = `<div class="card pause"><div class="card-av">${AV.render(lookOf('me'))}<p><b>${esc(S.name)}</b><small>${S.age} 歲</small></p></div><div class="card-body"><p class="card-k">暫停片刻</p><h2>${esc(q)}</h2><label class="sr" for="pauseTx">寫下一句話</label><textarea id="pauseTx" rows="2" maxlength="80" placeholder="寫一句話給自己（可以不寫）"></textarea><div class="card-ch row"><button class="btn primary" data-pause="1">寫下</button><button class="btn" data-pause="0">略過</button></div></div></div>`;
    UI.auto = false; renderControls();
    UI.resolve = v => { UI.resolve = null; res(v); };
  });
}
function talkTo(n) {
  if (S.talked || UI.busy) return;
  const opts = TALK[n].filter(o => o.w());
  const o = pick(opts.length ? opts : TALK[n]);
  S.talked = true; rel(n, ri(2, 5));
  const before = Object.assign({}, S.st); o.fx();
  const d = diff(before);
  if (!S.log.length || S.log[0].age !== S.age) { /* 對話記在今年的紀錄裡 */ }
  S.talkLog = { n, t: o.t };
  $('#plan').hidden = true; const st = $('#stage'); st.hidden = false;
  st.innerHTML = `<div class="card"><div class="card-av">${AV.render(lookOf(n))}<p><b>${esc(npcName(n))}</b><small>${n === 'partner' ? '伴侶' : NPC[n].r}</small></p></div><div class="card-body"><p class="card-k">閒聊・好感 ${S.rel[n]}</p><p class="card-say big">「${esc(o.t)}」</p><p class="ds">${deltaChips(d, 0)}</p><div class="card-ch"><button class="btn primary" data-closetalk="1">好</button></div></div></div>`;
  renderSide();
}

// ---------- 衣櫃與商店 ----------
const OPT_ROWS = [
  ['back', '髮型', () => AV.BACKS, false], ['bang', '瀏海', () => AV.BANGS, false],
  ['hair', '髮色', () => AV.HAIR, 'sw'], ['eye', '瞳色', () => AV.EYES, 'sw'], ['skin', '膚色', () => AV.SKIN, 'sw'],
  ['outfit', '服裝', () => AV.OUTFITS, 'outfit'], ['oc', '服裝顏色', () => AV.OC, 'sw'],
  ['acc', '髮飾', () => AV.ACC, 'acc'], ['acc2', '配件', () => AV.ACC2, 'acc2']
];
function dressEditor(look, owned, onBuy) {
  return OPT_ROWS.map(([k, label, src, kind]) => {
    const items = src();
    const btns = Object.entries(items).map(([id, v]) => {
      const val2 = kind === 'sw' ? v : id;
      const on = look[k] === val2;
      if (kind === 'sw') return `<button class="sw${on ? ' on' : ''}" data-k="${k}" data-v="${val2}" aria-pressed="${on}" aria-label="${label}：${id}" title="${id}" style="--c:${v}"></button>`;
      const shopType = kind === 'outfit' ? 'outfit' : kind === 'acc' ? 'acc' : kind === 'acc2' ? 'acc2' : null;
      const has = !shopType || !owned || owned[shopType].includes(id) || SHOP[shopType][id].p === 0;
      if (has) return `<button class="opt${on ? ' on' : ''}" data-k="${k}" data-v="${val2}" aria-pressed="${on}">${v}</button>`;
      const it = SHOP[shopType][id];
      return `<button class="opt locked" ${onBuy ? `data-buy="${shopType}:${id}"` : 'disabled'} title="${it.why || ''}">${v}<small>${onBuy ? `NT$ ${wan(it.p)}` : '遊戲中解鎖'}</small></button>`;
    }).join('');
    return `<div class="orow"><span class="olbl">${label}</span><div class="opts${kind === 'sw' ? ' sws' : ''}">${btns}</div></div>`;
  }).join('');
}
function openWardrobe() {
  if (UI.busy) return;
  const m = $('#modal');
  m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="wdT"><header><h2 id="wdT">衣櫃與商店</h2><span class="muted">存款 NT$ ${wan(S.money)}</span><button class="btn x" data-close="1" aria-label="關閉">關閉</button></header><div class="dress"><div class="dress-av">${AV.render(Object.assign({}, S.look, { age: ageStage(S.age), expr: 'happy' }))}</div><div class="dress-opts">${dressEditor(S.look, S.own, true)}</div></div><p class="muted small">灰色的衣服和飾品可以直接用存款買；有些也會在劇情中解鎖（例如考上音樂班、第一次特優、開獨奏會）。</p></div>`;
  m.hidden = false; m.querySelector('[data-close]').focus();
  m.dataset.mode = 'ward';
}
function buy(type, id) {
  const it = SHOP[type][id];
  if (S.money < it.p) { toast(`存款不夠，還差 NT$ ${wan(it.p - S.money)}`); return; }
  cash(-it.p); S.own[type].push(id);
  const name = { outfit: AV.OUTFITS, acc: AV.ACC, acc2: AV.ACC2 }[type][id];
  S.look[type === 'outfit' ? 'outfit' : type] = id;
  toast(`買下了${name}`); save(); openWardrobe(); renderSide();
}

// ---------- 圖鑑 ----------
function encEntry(id) {
  if (ENC_BASE[id]) return ENC_BASE[id];
  if (id.startsWith('p:')) { const p = PIECE[id.slice(2)]; return p && { c: '曲目', n: `〈${p.n}〉`, t: `${p.sch}。${p.t}` }; }
  if (id.startsWith('t:')) { const t = TECHS.find(x => x.id === id.slice(2)); return t && { c: '技法', n: t.n, t: t.t }; }
  if (id.startsWith('sch:')) { const n = id.slice(4); return SCHOOLS[n] && { c: '流派', n, t: SCHOOLS[n].t }; }
  return null;
}
function allEnc() {
  return Object.keys(ENC_BASE).concat(PIECES.map(p => 'p:' + p.id), TECHS.map(t => 't:' + t.id), Object.keys(SCHOOLS).map(n => 'sch:' + n));
}
function openEnc() {
  const m = $('#modal'); const ids = allEnc();
  const cats = ['樂器', '技法', '曲目', '流派', '制度', '人物'];
  const got = id => G.enc[id] || (S && S.enc[id]);
  const n = ids.filter(got).length;
  const tab = UI.encTab;
  const list = ids.filter(id => encEntry(id).c === tab);
  m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="encT"><header><h2 id="encT">箏譜筆記</h2><span class="muted">已收集 ${n} / ${ids.length}（跨每一段人生累積）</span><button class="btn x" data-close="1" aria-label="關閉">關閉</button></header>
  <div class="tabs" role="tablist">${cats.map(c => `<button role="tab" data-enctab="${c}" aria-selected="${c === tab}">${c}<small>${ids.filter(id => encEntry(id).c === c && got(id)).length}/${ids.filter(id => encEntry(id).c === c).length}</small></button>`).join('')}</div>
  <div class="enc">${list.map(id => { const e = encEntry(id); return got(id) ? `<article><h3>${esc(e.n)}</h3><p>${esc(e.t)}</p></article>` : `<article class="lock"><h3>？？？</h3><p>還沒在遊戲中遇到。</p></article>`; }).join('')}</div>
  <p class="muted small">遊戲中的制度與數字參考臺灣實際的學箏路徑（音樂班鑑定、全國學生音樂比賽、大學中國音樂學系、考級、教師資格、職業國樂團等）簡化而成，實際規定以各單位當年公告為準。人物皆為虛構。</p></div>`;
  m.hidden = false; m.dataset.mode = 'enc';
  const t = m.querySelector('[aria-selected="true"]'); if (t) t.focus();
}

// ---------- 結局 ----------
function titles() {
  const T2 = [];
  const E = S.ever;
  if (S.endReason === 'quit') T2.push(['放下琴的人', `你在 ${S.age} 歲那年，把箏收進衣櫃。很多年後，偶爾聽到箏聲，你還是會停下腳步。`]);
  const oy = S.flags.orchJoin != null ? Math.max(1, S.age - S.flags.orchJoin) : 0;
  const inOrch = oy ? `你在${S.flags.orchName || '職業樂團'}彈了 ${oy} 年的箏` : '你在職業樂團裡彈了很多年的箏';
  if (S.jobs.principal || E.principal) T2.push(['國樂團箏首席', `${inOrch}，坐在彈撥聲部的第一個位子，讓整個樂團都聽得見箏。`]);
  else if (E.orchestra) T2.push(['國樂團團員', `${inOrch}，跟著樂團走過很多城市。`]);
  if (S.recitals >= 4 && S.st.fame >= 70) T2.push(['箏樂演奏家', `你開過 ${S.recitals} 場獨奏會與協奏，名字印在海報最上面。`]);
  if (S.flags.gma) T2.push(['傳藝金曲獎得主', '你拿下傳藝金曲獎最佳演奏獎。那座獎，一直放在箏的旁邊。']);
  else if (S.flags.nch && !(S.recitals >= 4 && S.st.fame >= 70)) T2.push(['國家音樂廳的獨奏者', '你在國家音樂廳演奏廳辦過自己的獨奏會。那一晚的節目單，你一直留著。']);
  if (S.flags.chamberAlbum) T2.push(['五弦以上', '你和蘇姐的彈撥五重奏，錄下了自己的專輯。']);
  if (E.prof) T2.push([S.flags.fullProf ? '大學教授' : '大學助理教授', '你坐在當年許教授的位子上，教下一代讀懂傳統曲。']);
  if (S.flags.legacy) T2.push(['傳承者', '你的學生小芸，也開始幫小孩纏膠布了。']);
  if (S.flags.wangClass === 1) T2.push(['下班後的箏老師', '你從成人班的學生，變成了成人班的老師。']);
  if (S.flags.cafe) T2.push(['「箏與茶」的老闆', '你的小店裡擺著幾台箏，誰想彈都可以坐下來。']);
  if (S.taught >= 120) T2.push(['桃李滿天下', `你教過大約 ${S.taught} 個學生。${S.flags.book ? '你寫的《小手托抹勾》，還在很多教室裡被翻開。' : ''}`]);
  else if (S.taught >= 25) T2.push(['箏樂老師', `你教過大約 ${S.taught} 個學生。${S.flags.book ? '你寫的《小手托抹勾》，還在很多教室裡被翻開。' : ''}`]);
  if (E.schoolT) T2.push(['音樂老師', S.flags.bandAward ? '你帶的學校國樂團拿過全國比賽的好成績，很多孩子在那裡第一次摸到箏。' : '你在學校帶國樂團，讓很多孩子第一次摸到箏。']);
  if (S.flags.inserv && S.flags.master) T2.push(['在職進修的碩士', '你一邊工作，一邊讀完了中國音樂學系的碩士在職專班。']);
  if (S.flags.viral) T2.push(['網路上的箏聲', '你的影片讓很多人第一次聽見古箏。']);
  if (S.grade >= 10 && !E.orchestra && !S.major) T2.push(['演奏級的箏友', '你沒有走上職業的路，卻一路考到了演奏級。']);
  if (E.amateur && S.st.tech >= 55) T2.push(['業餘樂團的台柱', '每個週日早上，團練室裡最準時的就是你和你的箏。']);
  if (S.flags.busker) T2.push(['街角的箏聲', '捷運站出口那個彈古箏的人，很多路人都記得。']);
  if (!T2.length) T2.push(['一輩子的箏友', '箏沒有成為你的工作，卻一直陪在你身邊。']);
  return T2;
}
function epilogues() {
  const L = [];
  if (S.met.an) L.push(['林以安', S.flags.anQuit ? '後來當了醫生，在醫院的國樂社彈箏給病人聽。' : S.flags.anOrch ? '一直在國樂團裡彈箏，偶爾還會傳訊息說「輸的人請珍奶」。' : '換了好幾個工作，但每年都會來聽你的音樂會。']);
  if (S.met.kai) L.push(['阿凱', S.pieces.includes('esy') ? '成了作曲家。〈二十一弦〉後來被很多人演奏。' : '一直在敲各種東西，現在是打擊樂老師。']);
  if (S.yun) L.push(['小芸', S.flags.legacy ? '成了箏樂老師，教室裡也有一排比孩子還長的箏。' : S.yun.uni ? '讀了中國音樂學系，還在路上。' : '把箏當成一輩子的興趣。']);
  if (S.met.chen) L.push(['陳老師', S.flags.chenGone ? '退休後每天在公園打太極，偶爾來教室看看。' : '一直守著清音才藝教室。']);
  if (S.met.su) L.push(['蘇姐', S.flags.chamber === 1 ? '退休後還在帶「五弦以上」，每場演出都替你留一個位子。' : '從琵琶首席的位子退休，開了一間琵琶教室。']);
  if (S.met.ivy) L.push(['Ivy', S.flags.agent === 1 ? '後來開了自己的經紀公司，辦公室最顯眼的地方，掛著你的海報。' : '偶爾還會傳訊息問你：「真的不考慮簽約嗎？」']);
  if (S.met.hao) L.push(['小豪', S.flags.hao === 1 ? '後來成了遊戲配樂的作曲家，每一款遊戲裡都藏著一段箏。' : (S.rel.hao || 0) >= 35 ? '讀了音樂班，基本功是同學裡最紮實的。' : '很多年後寄來一張卡片：「老師，我現在又開始彈了。」']);
  if (S.met.wang) L.push(['王老師', S.flags.wangClass === 1 ? '在臺東開了一間小小的箏教室，每年都回來聽成人班的成果展。' : '一直教著週四晚上的成人班。']);
  if (S.met.mei) L.push(['美玲姐', S.flags.meiIll ? '用一隻右手，彈到了八十歲。' : '一直是成人班最早到的那一個。']);
  if (S.partner && S.partner.st === 2) L.push([S.partner.n, '聽了你一輩子的箏，還是說不出曲名，卻都記得旋律。']);
  return L;
}
function finish() {
  lsDel(SAVE_KEY);
  const T2 = titles();
  const life = { name: S.name, title: T2[0][0], age: S.age, start: S.startAge, look: S.look, date: new Date().toISOString().slice(0, 10), awards: S.awards.length, pieces: S.pieces.length, grade: S.grade, last: S.lastPiece || '' };
  G.lives.unshift(life); G.lives = G.lives.slice(0, 10);
  T2.forEach(t => G.ends[t[0]] = 1); saveG();
  UI.auto = false; UI.lastLife = life;
  renderEnd(T2);
  show('end');
}
function renderEnd(T2) {
  const look = Object.assign({}, S.look, { age: ageStage(S.age), expr: S.endReason === 'quit' ? 'neutral' : 'smile', outfit: S.own.outfit.includes('gown') ? 'gown' : S.look.outfit });
  const notes = Object.keys(S.notes).map(a => `<li><span>${a} 歲・${esc(S.notes[a].q)}</span>${esc(S.notes[a].a)}</li>`).join('');
  const aw = S.awards.slice(-8).map(a => `<li><span>${a.age} 歲</span>${esc(a.n)}</li>`).join('');
  const ce = S.certs.map(a => `<li><span>${a.age} 歲</span>${esc(a.n)}</li>`).join('');
  $('#endBody').innerHTML = `
  <div class="end-hero"><div class="end-av">${AV.render(look)}</div><div><p class="eyebrow">${S.year0} – ${S.year0 + S.age - S.startAge}　${S.startAge} 歲到 ${S.age} 歲</p><h1 class="end-title">${esc(T2[0][0])}</h1><p class="end-name">${esc(S.name)}</p><p>${esc(T2[0][1])}</p>${T2.length > 1 ? `<p class="also">${T2.slice(1).map(t => `<span>${esc(t[0])}</span>`).join('')}</p>` : ''}</div></div>
  <dl class="end-facts"><div><dt>學箏</dt><dd>${S.age - S.startAge} 年</dd></div><div><dt>考級</dt><dd>${S.grade ? gradeName(S.grade) : '—'}</dd></div><div><dt>曲目</dt><dd>${S.pieces.length} 首</dd></div><div><dt>技法</dt><dd>${S.techs.length}/${TECHS.length}</dd></div><div><dt>教過的學生</dt><dd>${S.taught} 人</dd></div><div><dt>名氣</dt><dd>${S.st.fame}</dd></div></dl>
  ${S.lastPiece ? `<p class="end-last">最後一次上台，你彈了〈${esc(S.lastPiece)}〉。</p>` : ''}
  <div class="end-cols">
    ${aw ? `<section><h2>獎項</h2><ul class="tl">${aw}</ul></section>` : ''}
    ${ce ? `<section><h2>證書與學位</h2><ul class="tl">${ce}</ul></section>` : ''}
    ${epilogues().length ? `<section><h2>後來的他們</h2><ul class="tl">${epilogues().map(e => `<li><span>${esc(e[0])}</span>${esc(e[1])}</li>`).join('')}</ul></section>` : ''}
    ${notes ? `<section><h2>暫停片刻</h2><ul class="tl">${notes}</ul></section>` : ''}
  </div>
  <div class="end-last-word"><label for="lastWord">對這一段箏途，說一句話</label><div class="row"><input id="lastWord" maxlength="60" placeholder="寫下來，會存在前世紀錄裡"><button class="btn" id="saveWord">留下</button></div></div>`;
}

// ---------- 開始畫面 ----------
function defaultLook() { return { back: 'long', bang: 'air', hair: AV.HAIR.深棕, eye: AV.EYES.蜜茶, skin: AV.SKIN.暖杏, outfit: 'knit', oc: AV.OC.櫻, acc: 'sakura', acc2: 'none' }; }
function renderStart() {
  if (!UI.draft) UI.draft = { name: '', bg: 'child', look: defaultLook() };
  const d = UI.draft;
  const saved = lsGet(SAVE_KEY);
  $('#resume').hidden = !saved;
  if (saved) $('#resumeInfo').textContent = `${saved.name}・${saved.age} 歲`;
  document.querySelectorAll('[data-bg]').forEach(b => b.setAttribute('aria-pressed', b.dataset.bg === d.bg));
  const age = d.bg === 'child' ? 'child' : d.bg === 'teen' ? 'teen' : 'adult';
  $('#prevAv').innerHTML = AV.render(Object.assign({}, d.look, { age, expr: 'happy' }), { label: '角色預覽' });
  $('#dressStart').innerHTML = dressEditor(d.look, { outfit: ['knit', 'sailor', 'hoodie'], acc: ['none', 'bow', 'sakura'], acc2: ['none', 'glasses'] }, false);
  const ids = allEnc(); const n = ids.filter(id => G.enc[id]).length;
  $('#encProg').textContent = `${n} / ${ids.length}`;
  $('#lives').innerHTML = G.lives.length ? G.lives.map(l => `<li><span class="mini">${AV.render(Object.assign({}, l.look, { age: ageStage(l.age) }), { bust: true })}</span><span><b>${esc(l.title)}</b><small>${esc(l.name)}・${l.start}–${l.age} 歲・${l.pieces} 首曲子${l.word ? `・「${esc(l.word)}」` : ''}</small></span></li>`).join('') : '<li class="muted">還沒有前世紀錄。</li>';
}

// ---------- 提示 ----------
let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 2400); }

// ---------- 古箏聲音（Karplus–Strong 撥弦） ----------
const AUD = { ctx: null, buf: {} };
const PENTA = [0, 2, 4, 7, 9];
function freqOf(i) { const j = 20 - i; const midi = 38 + 12 * Math.floor(j / 5) + PENTA[j % 5]; return 440 * Math.pow(2, (midi - 69) / 12); }
function audio() {
  if (!AUD.ctx) { try { AUD.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (AUD.ctx.state === 'suspended') AUD.ctx.resume();
  return AUD.ctx;
}
function pluck(i, vol = .5) {
  const ctx = audio(); if (!ctx) return;
  if (!AUD.buf[i]) {
    const sr = ctx.sampleRate, f0 = freqOf(i), dur = 2.4, n = Math.floor(sr * dur), N = Math.round(sr / f0);
    const b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
    let last = 0;
    for (let k = 0; k < N; k++) { const r = Math.random() * 2 - 1; last = last * .55 + r * .45; d[k] = last; }
    const decay = .994 + Math.min(.005, (20 - i) * .00022);
    for (let k = N; k < n; k++) d[k] = decay * .5 * (d[k - N] + d[k - N + 1 < k ? k - N + 1 : k - N]);
    AUD.buf[i] = b;
  }
  const src = ctx.createBufferSource(); src.buffer = AUD.buf[i];
  const g = ctx.createGain(); g.gain.value = vol;
  src.connect(g); g.connect(ctx.destination); src.start();
}
function sfx(kind) {
  if (!UI.sound) return;
  if (kind === 'award') [10, 8, 6, 5, 3, 2, 0].forEach((s, k) => setTimeout(() => pluck(s, .35), k * 70));
}

// 二十一根弦（可以撥、可以刮）
function zhengCanvas(cv) {
  const amp = new Array(21).fill(0);
  let raf = 0, lastIdx = -1, down = false;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function geo() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
    return { w: r.width, h: r.height, dpr };
  }
  function draw(t) {
    const { w, h, dpr } = geo(); const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    const cs = getComputedStyle(document.documentElement);
    const str = cs.getPropertyValue('--string').trim(), brg = cs.getPropertyValue('--bridge').trim();
    const pad = h * .08, gap = (h - pad * 2) / 20;
    let busy = false;
    for (let i = 0; i < 21; i++) {
      const y = pad + i * gap, bx = w * (.86 - .5 * Math.pow(i / 20, .85));
      const a = amp[i]; if (a > .01) busy = true;
      c.strokeStyle = str; c.globalAlpha = .55 + .45 * (i / 20); c.lineWidth = .6 + i * .06;
      c.beginPath();
      if (a > .01 && !reduce) {
        for (let x = 0; x <= w; x += 6) { const env = Math.sin(Math.PI * x / w); c.lineTo(x, y + Math.sin(t / 18 + x / 30) * a * 3 * env); }
      } else { c.moveTo(0, y); c.lineTo(w, y); }
      c.stroke(); c.globalAlpha = 1;
      c.fillStyle = brg;
      c.beginPath(); c.moveTo(bx - 4, y + 3.2); c.lineTo(bx, y - 1.5); c.lineTo(bx + 4, y + 3.2); c.closePath(); c.fill();
      amp[i] *= .94;
    }
    if (busy) raf = requestAnimationFrame(draw); else raf = 0;
  }
  function idxAt(e) { const r = cv.getBoundingClientRect(); const y = e.clientY - r.top; const pad = r.height * .08, gap = (r.height - pad * 2) / 20; return Math.max(0, Math.min(20, Math.round((y - pad) / gap))); }
  function hit(i) { if (i === lastIdx) return; lastIdx = i; amp[i] = 1; pluck(i, .4); if (!raf) raf = requestAnimationFrame(draw); }
  cv.addEventListener('pointerdown', e => { down = true; lastIdx = -1; cv.setPointerCapture(e.pointerId); hit(idxAt(e)); });
  cv.addEventListener('pointermove', e => { if (down) hit(idxAt(e)); });
  cv.addEventListener('pointerup', () => { down = false; lastIdx = -1; });
  cv.addEventListener('pointercancel', () => { down = false; });
  cv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); [20, 17, 14, 11, 8, 5, 2, 0].forEach((s, k) => setTimeout(() => { amp[s] = 1; pluck(s, .35); if (!raf) raf = requestAnimationFrame(draw); }, k * 60)); } });
  new ResizeObserver(() => draw(0)).observe(cv);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => draw(0));
  draw(0);
}

// ---------- 事件委派 ----------
document.addEventListener('click', e => {
  const t = e.target.closest('button, [data-bg]'); if (!t) return;
  const d = t.dataset;
  if (d.pick != null && UI.resolve) return UI.resolve(+d.pick);
  if (d.pause != null && UI.resolve) { const v = d.pause === '1' ? $('#pauseTx').value.trim() : ''; return UI.resolve(v); }
  if (d.closetalk) { const tl = S.talkLog; if (tl) (S.pendingLines = S.pendingLines || []).push({ k: 'say', t: `${npcName(tl.n)}：「${tl.t}」` }); save(); render(); return; }
  if (d.slot != null) { UI.slot = +d.slot; renderPlan(); return; }
  if (d.act) { S.sched[UI.slot] = d.act; UI.slot = (UI.slot + 1) % 4; renderPlan(); save(); return; }
  if (d.talk) return talkTo(d.talk);
  if (d.speed) { UI.speed = +d.speed; renderControls(); return; }
  if (d.close) { $('#modal').hidden = true; return; }
  if (d.enctab) { UI.encTab = d.enctab; openEnc(); return; }
  if (d.buy) { const [ty, id] = d.buy.split(':'); return buy(ty, id); }
  if (d.k && d.v != null) {
    const look = UI.screen === 'start' ? UI.draft.look : S.look;
    look[d.k] = d.v;
    if (UI.screen === 'start') renderStart(); else { openWardrobe(); renderSide(); save(); }
    return;
  }
  if (d.bg) { UI.draft.bg = d.bg; renderStart(); return; }
  switch (t.id) {
    case 'go': UI.slot = 0; return runYear();
    case 'auto': UI.auto = !UI.auto; renderControls(); if (UI.auto && !UI.busy) runYear(); return;
    case 'soundBtn': UI.sound = !UI.sound; if (UI.sound) { audio(); pluck(10, .3); } renderControls(); return;
    case 'wardBtn': return openWardrobe();
    case 'encBtn': case 'encBtn2': case 'encBtn3': return openEnc();
    case 'quitBtn': UI.auto = false; save(); show('start'); return;
    case 'startBtn': { const nm = $('#nameIn').value.trim(); return newGame(nm, UI.draft.bg, Object.assign({}, UI.draft.look)); }
    case 'resumeBtn': { const sv = lsGet(SAVE_KEY); if (sv) { S = sv; S.chainQ = []; if (S.partner) NPC.partner.n = S.partner.n; show('game'); } return; }
    case 'randLook': { const k = o => { const v = Object.values(o); return v[Math.floor(R() * v.length)]; }; const ks = o => { const v = Object.keys(o); return v[Math.floor(R() * v.length)]; }; Object.assign(UI.draft.look, { back: ks(AV.BACKS), bang: ks(AV.BANGS), hair: k(AV.HAIR), eye: k(AV.EYES), oc: k(AV.OC), outfit: pick(['knit', 'sailor', 'hoodie']), acc: pick(['none', 'bow', 'sakura']) }); renderStart(); return; }
    case 'againBtn': UI.draft = null; show('start'); return;
    case 'saveWord': { const w = $('#lastWord').value.trim(); if (w && G.lives[0]) { G.lives[0].word = w; saveG(); toast('留下了'); } return; }
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) $('#modal').hidden = true; });
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') $('#modal').hidden = true; });

// ---------- 啟動 ----------
function boot(data) {
  document.querySelectorAll('canvas.zheng').forEach(zhengCanvas);
  if (data && data.S) { S = data.S; S.chainQ = []; UI.screen = data.screen || 'game'; }
  if (S && UI.screen === 'game' && !S.ended) show('game'); else show('start');
}
window.claude?.hot?.snapshot?.(() => ({ S: UI.busy ? null : S, screen: UI.busy ? 'start' : UI.screen }));
window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
