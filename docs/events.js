// 二十一弦：事件。s＝季節（0 春 1 夏 2 秋 3 冬），prio＝劇情事件（條件成立就發生），p＝隨機事件每季機率，rep＝可重複（間隔年數）
'use strict';

const EV = {};
const lvName = () => ({ elem: '國小', jh: '國中', hs: '高中', uni: '大專' })[lv()];
const isA = () => S.mc || S.major;
const orchName = () => S.flags.orchName || '樂團';
const orchYears = () => S.age - (S.flags.orchJoin ?? S.age);
const isSolo = () => !S.student && S.recitals >= 1;
const myTeacher = () => S.major ? 'xu' : S.bg === 'adult' ? 'wang' : 'chen';

// ================= 童年起點 =================
EV.kid_start = { first: true,
  s: 0, prio: 100, w: () => S.bg === 'child' && S.age === 6, npc: 'chen', t: '第一堂古箏課',
  x: () => `媽媽牽著你走進巷口的「清音才藝教室」。牆邊靠著一整排古箏，每一台都比你還長。<br>陳老師剪了四段膠布，把義甲一片一片纏在你的右手上：「大拇指往外是『托』，食指往裡是『抹』，中指往裡是『勾』。來，試試看。」`,
  ch: [
    { t: '用力撥最粗的那根弦', h: '熱忱↑', fx: () => { add('passion', 8); add('music', 2); rel('chen', 4); return '「咚——」低音 D 在教室裡嗡嗡地響了好久。陳老師笑了：「力氣很夠喔，以後彈〈戰台風〉一定很厲害。」'; } },
    { t: '照著老師的手勢，小心地彈', h: '技巧↑', fx: () => { add('tech', 3); rel('chen', 8); return '托、抹、勾。三個音乾乾淨淨。陳老師在你的聯絡簿上畫了一朵小花。'; } },
    { t: '躲到媽媽後面說膠布好緊', h: '心情↑', fx: () => { add('mood', 6); rel('mom', 5); add('passion', 3); return '陳老師蹲下來，幫你把膠布纏鬆一點：「剛開始都不習慣，久了就會像長在手上一樣。」'; } }
  ],
  pre: () => { meet('mom'); meet('chen'); unlock('zheng'); unlock('yijia'); unlock('tuning'); }
};

EV.kid_recital = {
  s: 3, prio: 60, w: () => S.bg === 'child' && S.age === 7, npc: 'chen', t: '才藝班成果發表會',
  x: () => `年底的成果發表會辦在區民活動中心。台下坐滿了家長，媽媽在第二排舉著手機。<br>陳老師問：「要彈練得最熟的〈小星星〉，還是試試看〈茉莉花〉？」`,
  ch: [
    { t: '穩穩彈〈小星星〉', h: '安全', fx: () => { add('mood', 6); add('passion', 4); face('happy'); return '一個音都沒錯。下台時媽媽抱住你，說你是全場最棒的。'; } },
    { t: '挑戰〈茉莉花〉', h: '看技巧', fx: () => {
      learn('mlh');
      if (check(S.st.tech + S.st.music * .3, 10)) { add('passion', 9); add('fame', 2); face('happy'); return `${own('outfit', 'hanfu')}你彈完最後一個滑音，台下安靜了一秒才開始鼓掌。陳老師說：「你有耳朵。」`; }
      add('mood', -4); add('passion', 3); face('sad'); return '第三句你忘了譜，手停在半空中。台下還是有人用力鼓掌——是媽媽。';
    } }
  ]
};

EV.mc_elem = {
  s: 0, prio: 70, w: () => S.bg === 'child' && S.age === 8 && S.lessons, npc: 'chen', t: '要不要考音樂班？',
  x: () => `陳老師把你媽媽叫到一旁：「這孩子的耳朵很好，要不要試試國小音樂班？三年級就能考。」<br>鑑定要考主修、樂理、聽寫、視唱；考上以後每天都有術科課，還要副修鋼琴。`,
  ch: [
    { t: '報名音樂班鑑定', h: '技巧＋樂理', fx: () => {
      unlock('mcexam');
      const sc = S.st.tech * .55 + S.st.theory * .35 + S.st.music * .2 + ri(-4, 4);
      if (sc >= 15) { S.mc = true; meet('zhou'); add('passion', 6); face('happy'); return `放榜那天，你在名單上找到自己的名字。${own('outfit', 'blazer')}主修老師是周老師，第一堂課就說：「我教潮州箏。先把你的按音全部重練。」`; }
      add('mood', -6); face('sad'); return '名單上沒有你的名字。聽寫那一題你寫了三次又擦掉。陳老師說：「沒關係，我們國中再考。」';
    } },
    { t: '繼續在才藝班快樂地彈', h: '心情↑', fx: () => { add('mood', 6); add('passion', 3); return '媽媽說：「也好，喜歡最重要。」你每週六下午照樣去陳老師那裡，順便吃她準備的綠豆湯。'; } }
  ]
};

EV.mc_jh = {
  s: 0, prio: 70, w: () => S.bg === 'child' && S.age === 12, npc: () => S.mc ? 'zhou' : 'chen', t: '國中音樂班鑑定',
  x: () => S.mc ? '國小音樂班的同學幾乎都要考國中音樂班。周老師把這學期的曲子全換成考試曲：「主修佔最多分，但樂理和聽寫掉了就沒救。」' : '六年級了。陳老師說：「國中音樂班的鑑定，你要不要拚拚看？考不上也沒關係，國中國樂社也很好玩。」',
  ch: [
    { t: '報考國中音樂班', h: '技巧＋樂理', fx: () => {
      unlock('mcexam');
      const sc = S.st.tech * .55 + S.st.theory * .35 + S.st.music * .2 + ri(-5, 5);
      if (sc >= 27) { const was = S.mc; S.mc = true; meet('zhou'); add('passion', 5); face('happy'); return `${was ? '' : own('outfit', 'blazer')}你考上國中音樂班了。開學第一天，你在彈撥組的教室看到一排嶄新的演奏箏。`; }
      S.mc = false; S.flags.club = 1; add('mood', -5); face('sad'); return '沒考上。你讀了學區的國中，加入國樂社。社團指導老師說：「你一進來就是我們的箏首席。」';
    } },
    { t: '讀一般國中，參加國樂社', h: '心情↑', fx: () => { S.mc = false; S.flags.club = 1; add('mood', 5); return '你選了學區的國中。國樂社每週二、四練團，你第一次坐在一整個樂團裡。'; } }
  ]
};

EV.kai_meet = {
  s: 2, prio: 30, w: () => !S.met.kai && ((S.bg === 'child' && S.age === 12) || (S.bg === 'teen' && S.age === 15)), npc: 'kai', t: '打擊組的阿凱',
  x: () => '團練休息時，一個抱著小鈸的男生湊過來：「欸，你剛剛那段刮奏，是怎麼做到的？像一陣風耶。」他叫阿凱，打擊組，最大的興趣是把所有東西都敲一敲。',
  ch: [
    { t: '示範給阿凱看', h: '好感↑', fx: () => { rel('kai', 12); add('mood', 4); return '你刮了一次，阿凱跟著用鈸輕輕擦出一聲。兩個聲音疊在一起，意外地好聽。'; } },
    { t: '「秘密。」', h: '', fx: () => { rel('kai', 5); return '阿凱笑著說：「那我每天來偷看。」他真的每天都來。'; } }
  ],
  pre: () => meet('kai')
};

EV.an_meet = {
  s: 2, prio: 45, w: () => !S.met.an && S.age >= 9 && S.age <= 16 && S.st.tech >= 16, npc: 'an', t: '比賽會場的林以安',
  x: () => '縣市初賽的候考區，坐你旁邊的人正對著空氣練指法，手指快得看不清楚。對方發現你在看，挑了挑眉：「我叫林以安。你也彈箏？那我們是對手了。」',
  ch: [
    { t: '「那就比比看。」', h: '熱忱↑', fx: () => { rel('an', 6); add('passion', 5); S.flags.rival = 1; return '林以安笑了：「好啊，輸的人請珍奶。」'; } },
    { t: '「我們可以當朋友嗎？」', h: '好感↑', fx: () => { rel('an', 12); add('mood', 3); return '林以安愣了一下，然後把一卷膠布分給你：「你的快用完了吧。」'; } }
  ],
  pre: () => { meet('an'); unlock('nsmc'); }
};

EV.teen_doubt = {
  s: 1, prio: 25, w: () => S.bg === 'child' && (S.age === 13 || S.age === 14) && !S.done.teen_doubt, npc: 'mom', t: '為什麼要練琴？',
  x: () => '暑假，同學約你去西門町、去看電影、去海邊。你看著譜架上那首練了三個月還彈不好的曲子，突然很想把箏蓋起來。<br>媽媽在門口說：「你自己決定。」',
  ch: [
    { t: '跟同學出去玩一整個暑假', h: '心情↑ 技巧↓', fx: () => { add('mood', 14); add('tech', -3); add('passion', 2); return '你曬黑了，手上的繭變薄了。開學前一天你打開琴袋，雁柱還在原來的位置。'; } },
    { t: '練完琴再出門', h: '熱忱↑', fx: () => { add('tech', 3); add('mood', 2); add('passion', 6); return '早上練兩小時，下午出去玩。你發現，練完琴再出門，玩起來比較沒有罪惡感。'; } },
    { t: '跟媽媽吵了一架', h: '心情↓', fx: () => { add('mood', -6); rel('mom', -6); add('passion', -4); return '你大聲說「又不是我要學的」。說完你自己也嚇了一跳。那天晚上，你還是偷偷練了一下。'; } }
  ]
};

EV.mc_hs = {
  s: 0, prio: 70, w: () => S.bg === 'child' && S.age === 15, npc: () => S.mc ? 'zhou' : 'chen', t: '高中的路',
  x: () => '國三了。會考、高中音樂班鑑定、還有你自己的心意，全都擠在同一個春天。',
  ch: [
    { t: '報考高中音樂班', h: '技巧＋樂理', fx: () => {
      const sc = S.st.tech * .55 + S.st.theory * .35 + S.st.music * .2 + ri(-5, 5);
      if (sc >= 39) { S.mc = true; S.flags.club = 0; add('passion', 5); face('happy'); return '你考上了高中音樂班。周老師說：「接下來三年，是為了大學術科考試。」'; }
      S.mc = false; S.flags.club = 1; add('mood', -5); face('sad'); return '差了幾分。你讀了普通高中，國樂社的學長姐聽說你會彈〈漁舟唱晚〉，眼睛都亮了。';
    } },
    { t: '讀普通高中，箏當社團', h: '學業↑', fx: () => { S.mc = false; S.flags.club = 1; add('study', 4); return '你讀了普通高中，加入國樂社。箏還是每週彈，只是不再為了考試。'; } },
    { t: '先把箏收起來，專心讀書', h: '熱忱↓↓', fx: () => { S.mc = false; S.flags.club = 0; S.lessons = false; add('study', 8); add('passion', -18); return '你把箏放進琴袋，靠在衣櫃旁邊。媽媽沒有說什麼，只是常常幫它擦灰。'; } }
  ]
};

EV.an_quit = {
  s: 2, prio: 15, w: () => S.met.an && S.age === 16 && !S.flags.anQuit && R() < .55, npc: 'an', t: '林以安的決定',
  x: () => '比賽結束後，林以安約你在便利商店門口。「我要考醫學系。我媽說彈箏養不活自己。」林以安一直看著手裡的膠布，沒有看你。',
  ch: [
    { t: '「我支持你。」', h: '好感↑', fx: () => { S.flags.anQuit = 1; rel('an', 10); add('mood', -3); return '林以安點點頭，把那卷膠布塞進你手裡：「你要幫我彈下去。」'; } },
    { t: '「可是你明明這麼喜歡。」', h: '', fx: () => {
      if (R() < .45) { rel('an', 8); add('passion', 4); return '林以安沉默很久，最後說：「……好，我再試一年。」'; }
      S.flags.anQuit = 1; rel('an', -3); return '「喜歡又不能當飯吃。」林以安轉身走了。後來在學校，林以安還是會跟你打招呼，只是不再提箏。';
    } }
  ]
};

// ================= 高中起點 =================
EV.teen_start = { first: true,
  s: 0, prio: 100, w: () => S.bg === 'teen' && S.age === 15, npc: 'chen', t: '社團博覽會',
  x: () => '高一的社團博覽會，國樂社的攤位前，一位學姐正在彈〈漁舟唱晚〉。最後那段刮奏一出來，整條走廊都安靜了。<br>社團指導老師陳老師遞給你一張報名表：「沒學過也沒關係，我們從托抹勾開始。」',
  ch: [
    { t: '當場填報名表', h: '熱忱↑', fx: () => { add('passion', 8); S.flags.club = 1; return '你在「想學的樂器」那一欄寫了「古箏」，字寫得特別大。'; } },
    { t: '先問學姐：「現在開始會不會太晚？」', h: '心情↑', fx: () => { add('mood', 6); add('passion', 5); S.flags.club = 1; return '學姐笑了：「我也是高一才開始的。」'; } }
  ],
  pre: () => { meet('mom'); meet('chen'); unlock('zheng'); unlock('yijia'); unlock('tuning'); }
};

EV.teen_club = {
  s: 3, prio: 40, w: () => S.flags.club && S.age === 16 && !S.mc, npc: 'kai', t: '學生音樂比賽・國樂合奏',
  x: () => '國樂社要參加全國學生音樂比賽的國樂合奏。指揮把箏的獨奏段落交給你，阿凱在後面敲著定音鼓給你打氣。',
  ch: [
    { t: '把獨奏段落練到滾瓜爛熟', h: '技巧', fx: () => {
      add('tech', 3);
      if (check(perf(), 30)) { award('全國學生音樂比賽　高中職團體 B 組國樂合奏　優等', 4); rel('kai', 6); face('happy'); return '獨奏段落一個音都沒掉。宣布「優等」的時候，阿凱把鼓棒丟上天。'; }
      add('mood', -3); return '你在獨奏段落搶了半拍，整團跟著慌了一下。成績甲等，大家還是去吃了火鍋。';
    } },
    { t: '跟大家一起享受合奏', h: '樂感↑', fx: () => { add('music', 4); rel('kai', 8); add('mood', 5); return '比賽成績普通，但你記住了整團一起呼吸的感覺。'; } }
  ]
};

// ================= 成人起點 =================
EV.adult_start = { first: true,
  s: 0, prio: 100, w: () => S.bg === 'adult' && S.age === 28, npc: 'wang', t: '下班後的成人班',
  x: () => '加班到八點，你在捷運站出口聽見一陣箏聲。一位街頭藝人在彈〈漁舟唱晚〉，琴盒旁貼著「成人古箏班招生」。<br>週四晚上，你走進那間音樂教室。王老師說：「我們先不急著彈曲子，先學會怎麼坐。」',
  ch: [
    { t: '直接買一台入門箏', h: '－NT$ 1.8 萬', fx: () => { cash(-18000); add('passion', 8); S.flags.ownZheng = 1; return '箏送到家那天，你在客廳清出一整面牆。室友問你是不是要搬家。'; } },
    { t: '先租一台試試看', h: '－NT$ 3,000', fx: () => { cash(-3000); add('passion', 4); return '租來的箏有點舊，第五根弦一直走音。王老師說：「這樣你會比別人更快學會調音。」'; } }
  ],
  pre: () => { meet('wang'); meet('mei'); meet('mom'); unlock('zheng'); unlock('yijia'); unlock('tuning'); }
};

EV.adult_late = {
  s: 2, prio: 20, w: () => S.bg === 'adult' && S.age === 29, npc: 'mei', t: '會不會太晚？',
  x: () => '班上的美玲姐五十多歲，每次都最早到。有一天你練不好搖指，小聲說：「我是不是太晚開始了？」美玲姐把茶推到你面前：',
  ch: [
    { t: '聽美玲姐說', h: '熱忱↑', fx: () => { add('passion', 9); rel('mei', 10); return '「我五十歲才開始，現在每天都在進步。你才二十九，太晚個頭啦。」'; } }
  ]
};

EV.adult_band = {
  p: .12, w: () => S.age >= 24 && !S.major && !S.jobs.amateur && !S.jobs.orchestra && S.st.tech >= 28, npc: 'mei', t: '業餘國樂團招團員',
  x: () => '社區業餘國樂團在招人，每週日早上練團，年底在文化中心演出。團長說：「箏的位子空了好久。」',
  ch: [
    { t: '加入！', h: '樂感↑ 人脈↑', fx: () => { job('amateur', 1); add('music', 3); add('fame', 2); return '第一次練團，你發現在樂團裡彈箏，要一直數拍子，還要看指揮。行程表多了「合奏團練」。'; } },
    { t: '週日想睡覺', h: '', fx: () => { add('mood', 2); return '你翻了個身繼續睡。'; } }
  ]
};

EV.adult_fulltime = {
  p: .1, w: () => S.jobs.office && S.grade >= 8 && S.st.passion >= 55 && S.money >= 300000, npc: 'wang', t: '辭職去教箏？',
  x: () => '你的週末已經排滿了學生，平日下班還要趕去上課。王老師說：「你教得很好。要不要乾脆全職？」<br>存款簿上的數字，大概夠撐一年。',
  ch: [
    { t: '遞出辭呈', h: '收入不穩定', fx: () => { job('office', 0); job('studio', 1); S.students = Math.max(S.students, 8); add('passion', 12); add('mood', 6); return `主管問你是不是被挖角。你說：「被二十一根弦挖走的。」${own('outfit', 'cardigan')}`; } },
    { t: '再穩一點再說', h: '', fx: () => { add('mood', -2); return '你把辭呈存回草稿夾。'; } }
  ]
};

// ---- 成人班：下班後的二十一弦 ----
EV.adult_show = {
  s: 3, prio: 40, w: () => S.bg === 'adult' && S.age === 29, npc: 'wang', t: '成人班成果展',
  x: () => '王老師的成人班要在社區活動中心辦成果展。你填報名表的時候手在抖：上一次上台，是國小的畢業典禮。',
  ch: [
    { t: '跟美玲姐雙箏合奏〈茉莉花〉', h: '心情↑ 好感↑', fx: () => { learn('mlh'); rel('mei', 10); add('mood', 6); add('passion', 5); return '美玲姐彈錯一個音，你也跟著錯一個音，兩個人在台上笑出來。台下的掌聲很大。'; } },
    { t: () => `獨奏〈${topPieces(1)[0].n}〉`, h: '看技巧', fx: () => { if (check(S.st.tech + S.st.music * .3 + ri(-5, 5), 14)) { add('passion', 8); add('fame', 1); face('happy'); return '彈完最後一個音，你才發現自己一直忘了呼吸。同事偷偷來了，坐在最後一排舉著手機。'; } add('mood', -3); add('passion', 3); return '第二段你忘了譜，乾脆從頭再彈一次。王老師在台下對你比了一個讚。'; } }
  ]
};
EV.adult_boss = {
  p: .08, w: () => S.bg === 'adult' && S.jobs.office && S.lessons && S.age <= 45 && fate('boss', .5), npc: 'wang', t: '成人班的新同學',
  x: () => '週四晚上，成人班來了一位新同學。你一抬頭——是你們部門的經理。他也看到你了，兩個人都愣住。',
  ch: [
    { t: '主動教他怎麼纏膠布', h: '心情↑', fx: () => { add('mood', 6); rel('wang', 3); return '經理的膠布纏得歪七扭八。隔天開會，他在會議記錄的角落畫了一片義甲。從此以後，週四你都能準時下班。'; } },
    { t: '假裝不認識', h: '', fx: () => { add('mood', -1); return '一整堂課你們都沒說話。下課在電梯裡，經理小聲說：「我女兒說我太晚學了。」你說：「不會。」'; } }
  ]
};
EV.adult_ot = {
  p: .12, rep: 3, w: () => S.jobs.office && S.lessons, npc: () => S.bg === 'adult' ? 'wang' : 'mom', t: '專案爆炸',
  x: () => '專案上線前一個月，主管在群組裡說：「這個月大家辛苦一點，每天晚上留下來。」<br>可是週四晚上，是你的箏課。',
  ch: [
    { t: '週四準時下班去上課', h: '熱忱↑ 心情－', fx: () => { add('passion', 4); add('mood', -2); return '你在主管的眼神裡走出辦公室。那晚的箏課，你彈得特別用力。'; } },
    { t: '留下來加班', h: '＋NT$ 3 萬 熱忱－', fx: () => { cash(30000); add('passion', -5); add('tech', -1); return '整整一個月沒碰箏。專案上線那天，你回家第一件事，是把箏上的布掀開。'; } }
  ]
};
EV.adult_neighbor = {
  p: .06, w: () => S.age >= 22 && !S.student && fate('neighbor', .5), npc: 'mom', t: '鄰居來敲門',
  x: () => '晚上九點半，門鈴響了。樓下的鄰居站在門口：「不好意思，你每天晚上彈的那個……可以小聲一點嗎？我小孩要睡覺。」',
  ch: [
    { t: '在弦底下塞一條毛巾', h: '技巧↑ 樂感－', fx: () => { add('tech', 2); add('music', -1); return '箏聲變得悶悶的，像隔著一層棉被。可是你發現，聲音小了，反而更聽得清楚自己的手指。'; } },
    { t: '送鄰居兩張音樂會的票', h: '心情↑', fx: () => { add('fame', 1); add('mood', 4); return '音樂會後，鄰居傳訊息來：「原來你彈的是這個。以後九點以前，隨便你彈。」'; } }
  ]
};
EV.adult_weiya = {
  s: 3, p: .15, w: () => S.jobs.office && S.st.tech >= 20, npc: () => S.met.mei ? 'mei' : 'mom', t: '公司尾牙',
  x: () => '尾牙的表演節目還缺一個。同事起鬨：「聽說你會彈古箏！」主管已經把你的名字寫上去了。',
  ch: [
    { t: '彈〈卡農〉', h: '名氣↑', fx: () => { add('fame', 2); add('mood', 4); if (!S.jobs.studio && S.st.tech >= 35 && R() < .5) { job('studio', 1); S.students = Math.max(S.students, 2); return '彈完，總經理第一個鼓掌。隔週，會計部的同事來問你能不能教她女兒——行程表多了「教箏」可以排。'; } return '彈完，總經理第一個鼓掌。後來好幾個同事跑來問，古箏要去哪裡學。'; } },
    { t: '挑戰〈戰台風〉的開頭', h: '看技巧', fx: () => { if (S.st.tech >= 50) { add('fame', 3); face('happy'); return '前三十秒，整個宴會廳安靜到聽得見冷氣聲。抽頭獎都沒有那麼熱烈的掌聲。'; } add('mood', -2); return '彈到一半你的手指打結，乾脆停下來說：「颱風把我吹走了。」全場大笑。'; } }
  ]
};
EV.adult_tired = {
  p: .1, rep: 4, w: () => S.jobs.office && S.st.mood < 42, npc: () => S.met.mei ? 'mei' : 'mom', t: '下班後只想躺著',
  x: () => `晚上十點，你癱在沙發上。箏就在三步之外，蓋著布。${S.met.mei ? '手機裡是美玲姐傳來的練習影片。' : ''}`,
  ch: [
    { t: '只彈十分鐘就好', h: '熱忱↑', fx: () => { add('passion', 5); add('mood', 2); return '十分鐘變成了一個小時。你彈的都是慢曲，彈完覺得整個人都鬆開了。'; } },
    { t: '今天就好好休息', h: '心情↑', fx: () => { add('mood', 6); add('passion', -1); return '你睡了一個很長的覺。夢裡有人在彈〈漁舟唱晚〉。'; } }
  ]
};
EV.mei_ill = {
  p: .08, w: () => S.met.mei && S.age >= 34 && S.age <= 55 && fate('meiIll', .45), npc: 'mei', t: '美玲姐住院了',
  x: () => '美玲姐中風了。出院以後，左手不太能動。她在電話裡說：「沒有左手，箏要怎麼彈啊。」',
  ch: [
    { t: '幫她改編只用右手的曲子', h: '樂理↑ 好感↑', fx: () => { S.flags.meiIll = S.age; add('theory', 3); rel('mei', 15); add('passion', 6); return '你把〈茉莉花〉的滑音，全部改成右手的裝飾音。美玲姐第一次彈完，說：「這樣也很好聽耶。」'; } },
    { t: '每週去她家陪她做復健', h: '心情↓ 好感↑', fx: () => { S.flags.meiIll = S.age; rel('mei', 12); add('mood', -3); return '你們一起用左手捏海綿球，一下、兩下。美玲姐說：「等我好了，我們再一起上台。」'; } }
  ]
};
EV.mei_back = {
  s: 3, prio: 25, w: () => S.flags.meiIll && S.age >= S.flags.meiIll + 2 && !S.done.mei_back, npc: 'mei', t: '美玲姐回來了',
  auto: () => { rel('mei', 10); add('passion', 8); return '成果展的節目單上，又有了美玲姐的名字。她用右手彈完〈茉莉花〉，左手放在弦上，輕輕按出最後一個音。全場站起來鼓掌。'; }
};
EV.band_concert = {
  s: 3, prio: 30, rep: 2, w: () => S.jobs.amateur, npc: 'mei', t: '業餘樂團年度音樂會',
  x: () => `年底，業餘國樂團在文化中心演出。今年的曲目有一首${pick(['臺灣民謠組曲', '〈茉莉花〉幻想曲', '〈春江花月夜〉合奏版'])}，中間有一段箏的獨奏。`,
  ch: [
    { t: '爭取那段箏獨奏', h: '看演出', fx: () => { if (perf() >= 42) { add('fame', 3); add('passion', 6); face('happy'); return '獨奏結束時，團長在台上偷偷對你比了一個讚。家人在台下拍了一百張照片。'; } add('mood', -4); return '你的獨奏搶了半拍，指揮硬是把整團拉回來。散場時團長說：「明年再來。」'; } },
    { t: '把獨奏讓給新團員', h: '心情↑ 樂感↑', fx: () => { add('mood', 5); add('music', 2); return '新團員緊張得要命。你在旁邊用很小的聲音，幫她數拍子。'; } }
  ]
};
EV.band_japan = {
  p: .08, w: () => S.jobs.amateur && S.age >= 30, npc: 'mei', t: '姊妹市交流',
  x: () => '業餘樂團受邀到日本的姊妹市交流演出。對方的團裡有一個箏的社團，大家穿著和服，彈十三根弦的箏。',
  ch: [
    { t: '去！自費也要去', h: '－NT$ 4 萬 心情↑', fx: () => { cash(-40000); unlock('family'); add('mood', 10); add('music', 3); return '語言不通，兩邊的箏手就把樂器並排放在一起。她們教你彈〈櫻花〉，你教她們彈〈茉莉花〉。'; } },
    { t: '請不了假', h: '', fx: () => { add('mood', -2); return '團員在群組裡傳了好多照片。你盯著照片裡並排的兩種箏，看了很久。'; } }
  ]
};
EV.adult_trip = {
  p: .06, w: () => S.jobs.office && S.age >= 30 && S.age <= 50 && fate('trip', .5), npc: () => S.bg === 'adult' ? 'wang' : 'mom', t: '出差到胡志明市',
  x: () => '公司派你到胡志明市出差三個月。某天晚上在餐廳吃飯，舞台上有人在彈一種長得很像箏、弦卻比較少的樂器。',
  ch: [
    { t: '去找當地老師上一堂課', h: '樂感↑', fx: () => { unlock('family'); add('music', 4); add('mood', 5); return '老師說那是越南箏，又叫「十六弦琴」。左手一按，滑音轉得比你的還彎。下課時，老師唱了一首越南的搖籃曲送你。'; } },
    { t: '在飯店用手機看譜', h: '', fx: () => { add('tech', -2); return '三個月後回到家，你掀開箏的布，手指生疏得像回到了第一堂課。'; } }
  ]
};
EV.adult_inservice = {
  p: .08, w: () => !S.student && !S.major && !S.flags.master && !S.flags.grad && S.age >= 34 && S.age <= 52 && (S.grade >= 7 || S.st.tech >= 55) && (S.jobs.office || S.jobs.studio), npc: () => S.bg === 'adult' ? 'wang' : 'chen', t: '碩士在職專班',
  x: () => '你在網路上看到：大學的中國音樂學系有開碩士在職專班，晚上和週末上課。畢業前要辦一場演講音樂會，再辦一場獨奏會。',
  ch: [
    { t: '報考', h: '技巧＋樂理', fx: () => { unlock('inserv'); if (S.st.tech * .45 + S.st.theory * .35 + S.st.music * .2 + ri(-6, 6) >= 42) { S.flags.grad = S.age + 3; S.flags.inserv = 1; add('passion', 10); face('happy'); return '你考上了。班上有國小老師、樂團團員，還有一位退休的牙醫。你們是全校最晚下課的一班。行程表可以排「研究寫作」了。'; } add('mood', -5); return '術科差了一點。口試的老師說：「你的音樂很真誠。明年再來。」'; } },
    { t: '現在的步調就很好', h: '', fx: () => '你把網頁加進書籤，關掉電腦。' }
  ]
};
EV.wang_retire = {
  p: .15, w: () => S.met.wang && S.bg === 'adult' && S.age >= 40 && (S.grade >= 6 || S.st.tech >= 45), npc: 'wang', t: '王老師要搬回臺東',
  x: () => '下課後，王老師把你留下來：「我要搬回臺東照顧爸媽了。週四晚上的成人班，你願意接嗎？這些同學，你比我還熟。」',
  ch: [
    { t: '接下週四的成人班', h: '開始教學', fx: () => { S.flags.wangClass = 1; job('studio', 1); S.students += 6; S.taught += 6; rel('wang', 15); add('passion', 10); return `第一堂課，你站在王老師以前的位子上，說了你第一天聽到的那句話：「我們先不急著彈曲子，先學會怎麼坐。」${own('outfit', 'cardigan')}`; } },
    { t: '「我還只是學生。」', h: '', fx: () => { rel('wang', 3); return '王老師笑了：「我當年也是這樣說的。」成人班換了一位年輕的老師，你還是每週四準時到。'; } }
  ]
};
EV.adult_top = {
  prio: 30, w: () => S.bg === 'adult' && S.grade >= 10 && !S.done.adult_top, npc: 'wang', t: '成人班的第一個演奏級',
  auto: () => { add('passion', 8); rel('wang', 10); rel('mei', 6); return `成人班的群組炸開了：「我們班有人考到演奏級了！」王老師傳來一則語音，前十秒都是哭聲。那年你 ${S.age} 歲，離捷運站出口那陣箏聲，已經 ${S.age - 28} 年。`; }
};
EV.adult_cafe = {
  p: .06, w: () => S.jobs.office && S.age >= 55, npc: () => S.met.mei ? 'mei' : 'mom', t: '退休以後要做什麼？',
  x: () => '離退休還有幾年。你常常想像：一間小小的店，白天賣茶，晚上牆邊擺幾台箏，誰想彈都可以坐下來。',
  ch: [
    { t: '提早退休，開「箏與茶」', h: '－NT$ 40 萬', fx: () => { S.flags.cafe = 1; cash(-400000); own('outfit', 'teagown'); job('office', 0); job('studio', 1); S.students = Math.max(S.students, 4); add('passion', 12); add('mood', 8); return `開幕那天，${S.met.mei ? '美玲姐' : S.flags.momGone ? '老同事' : '媽媽'}送來一盆蘭花。第一位客人點了一杯烏龍，然後問：「這台箏可以彈嗎？」`; } },
    { t: '再上幾年班', h: '', fx: () => '你把店名寫在記事本的最後一頁。' }
  ]
};

// ================= 共通：考級、比賽、技術 =================
EV.grade = {
  s: 1, prio: 50, rep: 1, w: () => S.lessons && S.grade < 10 && S.age >= 7 && !S.major && !S.injured && (S.age < 22 || S.bg === 'adult' || S.jobs.studio || S.jobs.amateur), npc: () => S.bg === 'adult' ? 'wang' : 'chen', t: '暑假考級',
  x: () => `暑假的考級要報名了。你目前是${S.grade ? gradeName(S.grade) : '還沒有考過'}。`,
  ch: [
    { t: () => `報考${gradeName(S.grade + 1)}`, h: () => `建議技巧 ${gradeReq(S.grade + 1)}`, fx: () => doGrade(S.grade + 1) },
    { t: () => `跳級報考${gradeName(Math.min(10, S.grade + 2))}`, h: '比較難', if: () => S.grade + 2 <= 10, fx: () => doGrade(S.grade + 2) },
    { t: '今年不考', h: '', fx: () => '你把報名表收進抽屜，今年先好好彈曲子。' }
  ]
};
function gradeReq(L) { return L < 10 ? 4 + L * 7 : 76; }
function gradeName(L) { return L >= 10 ? '演奏級' : `第 ${'一二三四五六七八九'[L - 1]} 級`; }
function doGrade(L) {
  unlock('grade');
  const p = topPieces(1)[0];
  const sc = S.st.tech * .65 + S.st.music * .25 + S.st.theory * .1 + ri(-6, 6);
  if (sc >= gradeReq(L) - 2) {
    S.grade = L; cert(`古箏考級　${gradeName(L)}`); if (L >= 10) own('acc', 'jade'); add('passion', 4); add('mood', 5); face('happy');
    return `考場裡你彈了〈${p ? p.n : '小星星'}〉。一個月後收到證書：「${gradeName(L)}　合格」。${L >= 10 ? '演奏級！你把證書框起來掛在箏的正上方。' : ''}`;
  }
  add('mood', -7); add('passion', -2); face('sad');
  return `成績單上寫著「未通過」。評語只有一行：「${pick(['左手按音音準不穩。', '速度不穩，越彈越快。', '搖指不夠均勻。', '音樂表情不足。'])}」`;
}

EV.nsmc = {
  s: 2, prio: 40, rep: 1, w: () => S.student && S.age >= 9 && S.age <= 21 && S.st.tech >= 18 && S.lessons && !S.injured && (isA() || S.met.an), npc: () => S.met.an && !S.flags.anQuit ? 'an' : (S.mc ? 'zhou' : 'chen'), t: '全國學生音樂比賽',
  x: () => `學生音樂比賽報名開始了：${lvName()}${isA() ? ' A' : ' B'} 組箏獨奏。十一月縣市初賽，表現好的才能代表縣市去全國決賽。${S.met.an && !S.flags.anQuit ? '林以安一定也會報名。' : ''}`,
  ch: [
    { t: '報名！', h: '技巧＋樂感', fx: () => doNsmc() },
    { t: '今年不比', h: '心情↑', fx: () => { add('mood', 3); return '今年你只想好好彈自己喜歡的曲子。'; } }
  ]
};
function doNsmc() {
  unlock('nsmc');
  const T = { elem: 26, jh: 38, hs: 50, uni: 60 }[lv()] + (isA() ? 5 : 0);
  const grp = `${lvName()}${isA() ? ' A' : ' B'} 組箏獨奏`;
  const sc = perf();
  const rivalIn = S.met.an && !S.flags.anQuit;
  const rv = rivalIn ? S.anLv + ri(-6, 6) : 0;
  let r = '';
  if (sc < T) {
    const g = sc >= T - 7 ? '優等' : sc >= T - 14 ? '甲等' : '';
    add('mood', -5); face('sad');
    r = g ? `縣市初賽 ${g}，差一點點沒能代表縣市。` : '初賽沒拿到等第。你在回家的公車上一直看著窗外。';
    if (g) award(`全國學生音樂比賽　縣市初賽　${grp}　${g}`, 1);
    if (rivalIn) r += rv >= T ? '林以安晉級決賽了，傳訊息說「明年換你」。' : '林以安也沒晉級，你們一起去吃了冰。';
    return r;
  }
  const s2 = perf() + 2;
  const g = s2 >= T + 13 ? '特優' : s2 >= T + 4 ? '優等' : '甲等';
  award(`全國學生音樂比賽　全國決賽　${grp}　${g}`, g === '特優' ? 8 : 4);
  add('passion', g === '特優' ? 8 : 4); add('mood', 6); face('happy');
  r = `你代表縣市進了全國決賽，最後拿到「${g}」！`;
  if (g === '特優') r += own('outfit', 'gown') + own('acc2', 'necklace');
  if (rivalIn) { r += rv > s2 ? '林以安拿得比你好一點，頒獎時對你比了個 V。' : '林以安在台下用力幫你拍手。'; rel('an', 3); }
  return r;
}

EV.liang = {
  p: .1, w: () => S.st.tech >= 26 && !S.enc.liang, npc: () => S.met.zhou ? 'zhou' : (S.met.wang ? 'wang' : 'chen'), t: '臺灣古箏之父',
  x: () => '老師拿出一本泛黃的譜：「你知道臺灣的箏是怎麼開始的嗎？梁在平先生編的《擬箏譜》，是第一本把指法寫在譜上的箏譜。」',
  ch: [{ t: '仔細聽老師說', h: '樂理↑', fx: () => { unlock('liang'); add('theory', 3); add('passion', 3); return '那天你回家查了很多資料，第一次覺得自己彈的東西，是一條很長的河的一部分。'; } }]
};

// ================= 升大學 =================
EV.uni_path = {
  s: 3, prio: 60, w: () => S.student && S.age === 17 && S.bg !== 'adult', npc: () => S.mc ? 'zhou' : 'chen', t: '高三：要不要讀音樂系？',
  x: () => '寒假就要考大學術科了：主修、副修、樂理、聽寫、視唱。也可以用學測成績讀一般大學，把箏當成一輩子的興趣。',
  ch: [
    { t: '報考中國音樂學系', h: '術科考試', if: () => S.lessons || S.flags.club, fx: () => { unlock('shuke'); chain('uni_pick'); return '你在報名表上勾了「國樂組・主修古箏」。'; } },
    { t: '用學測讀一般大學', h: '看學業', fx: () => uniGeneral() }
  ]
};
EV.uni_pick = {
  npc: () => S.mc ? 'zhou' : 'chen', t: '選填志願',
  x: () => '四間學校的中國音樂學系，你最想去哪裡？',
  ch: ['國立臺灣藝術大學', '臺北市立大學', '中國文化大學', '國立臺南藝術大學'].map(n => ({
    t: n, h: { '國立臺灣藝術大學': '新北板橋', '臺北市立大學': '臺北', '中國文化大學': '陽明山', '國立臺南藝術大學': '臺南官田' }[n], fx: () => uniExam(n)
  }))
};
function uniExam(n) {
  unlock('unicm');
  const sc = S.st.tech * .45 + S.st.music * .25 + S.st.theory * .3 + ri(-5, 5);
  if (sc >= 38) {
    S.major = true; S.uniName = n; S.mc = false; S.flags.club = 0; meet('xu'); add('passion', 8); face('happy');
    return `術科放榜，你考上了${n}中國音樂學系！主修老師是許教授。`;
  }
  face('sad'); add('mood', -8);
  S.flags.retry = (S.flags.retry || 0) + 1;
  if (S.flags.retry === 1) { chain('uni_fail'); return '術科分數不夠。'; }
  return uniGeneral();
}
EV.uni_fail = {
  npc: 'mom', t: '落榜之後', x: () => '媽媽說：「要重考一年也可以，要先去讀一般大學也可以。」',
  ch: [
    { t: '重考一年', h: '明年再拚', fx: () => { S.flags.gap = 1; S.age17again = 1; return '你決定再拚一年。這一年沒有學校，只有箏、樂理、聽寫和補習班。'; } },
    { t: '先讀一般大學', h: '', fx: () => uniGeneral() }
  ]
};
EV.uni_retry = {
  s: 3, prio: 60, w: () => S.flags.gap === 1 && S.age === 18, npc: () => S.mc ? 'zhou' : 'chen', t: '第二次術科考試',
  x: () => '又是寒假。考場還是那間，你坐在一樣的位子上。',
  ch: [{ t: '深呼吸，走進考場', h: '', fx: () => { S.flags.gap = 2; return uniPickAgain(); } }]
};
function uniPickAgain() { chain('uni_pick'); return '你重新填了志願。'; }
function uniGeneral() {
  const ok = S.st.study >= 50;
  S.major = false; S.uniName = ok ? '國立大學' : '私立大學'; S.flags.club = 1;
  return `你用學測考上了${S.uniName}${pick(['外文系', '企管系', '資工系', '心理系', '中文系'])}。開學第一週，你就找到了國樂社的社辦。`;
}

// ================= 大學 =================
EV.uni_first = {
  s: 2, prio: 30, w: () => S.major && S.age === (S.flags.gap ? 19 : 18) && !S.done.uni_first, npc: 'xu', t: '大一：主修與副修',
  x: () => '許教授翻著你的考試曲目：「傳統曲彈得太乾淨了，乾淨不等於有味道。」<br>然後你發現，副修鋼琴的老師對你的左手非常有意見。',
  ch: [
    { t: '把傳統曲從頭重練', h: '樂感↑', fx: () => { add('music', 5); rel('xu', 8); return '你開始去圖書館聽老唱片，每個箏派的錄音都聽。'; } },
    { t: '先把鋼琴救起來', h: '樂理↑', fx: () => { add('theory', 5); return '鋼琴期末考你彈了巴哈的小步舞曲。鋼琴老師說：「進步很多。」你差點哭出來。'; } }
  ]
};
EV.uni_jury = {
  s: 3, prio: 35, rep: 1, w: () => S.major && S.student && S.age >= 18 && S.age <= 20 && S.done.uni_first, npc: 'xu', t: '期末術科',
  x: () => { const sch = S.uniName === '國立臺灣藝術大學' && S.age === 20 ? '梁派箏曲' : pick(['潮州', '客家', '山東', '河南', '浙江']) + '箏派傳統曲'; S.tmp = sch; return `考前兩天中午，系辦公布抽籤結果：這次抽到的是${sch}，再加一首編創樂曲。`; },
  ch: [
    { t: '熬夜把兩首都磨好', h: '技巧＋樂感', fx: () => { add('health', -4); return jury(4); } },
    { t: '照平常的步調準備', h: '', fx: () => jury(0) }
  ]
};
function jury(b) {
  unlock('unicm');
  if (S.tmp === '梁派箏曲') unlock('liang');
  const sc = perf() + b;
  if (sc >= 58) { rel('xu', 6); add('passion', 4); face('happy'); return `評審老師在評分表上寫：「${pick(['韻味到位。', '左手細膩，有自己的想法。', '編創曲很有新意。'])}」`; }
  if (sc >= 45) return '成績中上。許教授說：「還可以。但我知道你可以更好。」';
  add('mood', -6); face('sad'); return '你在編創曲的中段斷掉了。許教授只說：「下學期見。」';
}
EV.edu_prog = {
  s: 1, prio: 25, w: () => S.student && S.age === (S.flags.gap ? 20 : 19), npc: () => S.major ? 'xu' : 'mom', t: '教育學程甄選',
  x: () => '學校的教育學程開放甄選。修完學程、考過教師資格考、實習半年，才有機會考正式老師。學分很多，暑假會變得很短。',
  ch: [
    { t: '報名教育學程', h: '學業', fx: () => { if (S.st.study + ri(-8, 8) >= 38) { S.flags.edu = 1; unlock('teacher'); add('study', 3); return '你考上了教育學程。課表多了「教育心理學」和「班級經營」。'; } add('mood', -3); return '甄選沒通過。名額只有二十幾個。'; } },
    { t: '不了，專心在箏上', h: '', fx: () => { add('tech', 2); return '你把多出來的時間全部拿去練琴。'; } }
  ]
};
EV.uni_club = {
  s: 2, prio: 30, w: () => !S.major && S.student && S.age === 18 && S.flags.club && !S.done.uni_club, npc: 'kai', t: '大學國樂社',
  x: () => '國樂社的社博攤位前，有人敲了一下你的肩膀——是阿凱！「你也來這間？太好了，我們缺箏。」',
  ch: [
    { t: '加入國樂社', h: '樂感↑', fx: () => { meet('kai'); rel('kai', 8); add('music', 3); return '社團教室在活動中心頂樓，夏天熱得像烤箱。你每週還是去三次。'; } }
  ]
};
EV.club_leader = {
  s: 1, prio: 20, w: () => !S.major && S.student && S.age === 19 && S.flags.club, npc: 'kai', t: '要不要當社長？',
  x: () => '學長畢業了，大家投票要你接國樂社社長。要辦成果發表會、申請經費、還要拉新生。',
  ch: [
    { t: '接下社長', h: '名氣↑ 心情↓', fx: () => { add('fame', 5); add('mood', -4); add('music', 2); S.flags.leader = 1; return '你辦了社團第一次在校外的演出，台下坐滿了人。'; } },
    { t: '當副社長就好', h: '', fx: () => { add('mood', 2); return '阿凱當了社長，每天在群組裡發迷因。'; } }
  ]
};
EV.grad_recital = {
  s: 3, prio: 60, w: () => S.major && S.student && S.age === (S.flags.gap ? 22 : 21), npc: 'xu', t: '畢業音樂會',
  x: () => '四十分鐘，一個人，一台箏。這是大學四年的總整理。你要怎麼排曲目？',
  ch: [
    { t: '傳統箏派巡禮', h: '樂感', fx: () => recital(S.st.music, '從山東、河南、潮州、客家一路彈到浙江，像帶觀眾走了一趟箏的地圖。') },
    { t: '炫技的近代作品', h: '技巧', fx: () => recital(S.st.tech, '最後一首的刮奏結束時，台下有人站了起來。') },
    { t: '請阿凱寫一首新作首演', h: '需要阿凱好感', if: () => (S.rel.kai || 0) >= 45, fx: () => { learn('esy'); rel('kai', 10); return recital(S.st.music + 8, '阿凱為你寫的〈二十一弦〉首演，謝幕時你們一起鞠躬。'); } }
  ]
};
function recital(base, ok) {
  S.recitals++;
  if (check(base + ri(-6, 6), 52)) { add('fame', 8); add('passion', 6); face('happy'); award('大學畢業音樂會', 0); return ok + own('outfit', 'gown'); }
  add('fame', 3); face('sad'); return '中間有一段你腦袋一片空白，手卻自己彈了下去。觀眾沒發現，你自己知道。';
}

// ================= 出社會 =================
EV.career = {
  s: 0, prio: 90, w: () => S.student && S.age === (S.flags.gap ? 23 : 22), npc: () => S.major ? 'xu' : 'mom', t: '畢業了，接下來呢？',
  x: () => '學生證要繳回去了。你看著那台陪你很多年的箏，想了很久。',
  ch: [
    { t: '準備考職業國樂團', h: '技巧要夠', if: () => S.st.tech >= 45, fx: () => { endSchool(); S.flags.seekOrch = 1; job('freelance', 1); unlock('orch'); return '箏的職缺很少。你一邊當特約演奏員、接演出，一邊等招考公告。'; } },
    { t: '讀研究所', h: '樂理＋學業', if: () => S.major || S.st.theory >= 50, fx: () => {
      if (S.st.theory * .5 + S.st.study * .3 + S.st.music * .3 + ri(-5, 5) >= 42) { endSchool(); S.student = true; S.flags.grad = S.age + 2; unlock('grad'); return '你考上了研究所，題目想做的是臺灣的箏樂發展。'; }
      endSchool(); job('studio', 1); S.students = 3; return '研究所沒考上。你先開始在家教箏，打算明年再考。';
    } },
    { t: '開箏樂教室教學生', h: '名氣決定學生數', if: () => S.major || S.grade >= 7, fx: () => { endSchool(); job('studio', 1); S.students = Math.max(3, Math.round(S.st.fame / 8)); return `你在租來的小套房掛上「箏樂教室」的牌子，第一批收了 ${S.students} 個學生。${own('outfit', 'cardigan')}`; } },
    { t: '走教師之路', h: '需要教育學程', if: () => S.flags.edu, fx: () => { endSchool(); S.flags.teachPath = 1; job('sub', 1); unlock('teacher'); return '先考教師資格考，再去實習，再考教甄。路很長，但你想站在講台上。這段時間，你先在國中當代理代課老師。'; } },
    { t: '當上班族，箏當興趣', h: '收入穩定', fx: () => { endSchool(); job('office', 1); return '你找到一份辦公室工作。箏放在房間的角落，週末才打開。'; } }
  ]
};
function endSchool() { S.student = false; S.mc = false; if (!S.flags.club && !S.jobs.amateur) S.flags.club = 0; cash(50000); }

EV.orch_aud = {
  s: 0, p: .5, rep: 1, w: () => S.flags.seekOrch && !S.jobs.orchestra && S.age >= 22 && S.age <= 40, npc: 'huang', t: '國樂團招考',
  x: () => { S.tmp = pick(['臺灣國樂團', '臺北市立國樂團', '高雄市國樂團']); return `公告出來了：${S.tmp}彈撥聲部，箏，招考一名。初試、複試，最後還要跟樂團合奏。`; },
  ch: [
    { t: '報名！', h: '技巧＋樂感', fx: () => {
      unlock('orch');
      const sc = perf(), rival = S.met.an && !S.flags.anQuit && !S.flags.anOrch;
      if (sc >= 66) { job('orchestra', 1); job('freelance', 0); job('office', 0); S.flags.orchJoin = S.age; S.flags.orchName = S.tmp; meet('huang'); add('passion', 10); face('happy'); return `複試後一週，電話響了：「恭喜你，歡迎加入${S.tmp}。」第一次排練，黃指揮看了你一眼：「箏，大聲一點。」${own('outfit', 'concert')}`; }
      if (rival && S.anLv >= 66 && R() < .5) { S.flags.anOrch = 1; face('sad'); add('mood', -6); return '錄取的是林以安。對方打電話給你，聲音很小：「下次換你。」'; }
      add('mood', -6); face('sad'); return '你進了複試，最後還是差了一點。只取一名，真的太少了。';
    } },
    { t: '這次先不考', h: '', fx: () => '你把公告存起來，告訴自己再練一年。' }
  ]
};

EV.teach_exam = {
  s: 1, prio: 50, w: () => S.flags.teachPath === 1, npc: 'mom', t: '教師資格考試',
  x: () => '教育理念、學習者發展、課程教學與評量……你在書桌前貼滿了便利貼。',
  ch: [{ t: '上考場', h: '樂理＋學業', fx: () => { if (S.st.study * .5 + S.st.theory * .4 + ri(-6, 6) >= 34) { S.flags.teachPath = 2; return '你通過了教師資格考試！秋天開始半年的教育實習。'; } add('mood', -6); return '差了幾分，明年再考。'; } }]
};
EV.teach_intern = {
  s: 2, prio: 50, w: () => S.flags.teachPath === 2, npc: 'mom', t: '教育實習',
  auto: () => { S.flags.teachPath = 3; job('sub', 1); add('music', 2); return '你在一所國中實習半年，帶了國樂社的箏分部，拿到了教師證書。在考上正式老師之前，你先當代理代課老師。'; }
};
EV.teach_hire = {
  s: 1, prio: 50, rep: 1, w: () => S.flags.teachPath === 3, npc: 'mom', t: '教師甄試',
  x: () => `音樂科只開了 ${ri(1, 4)} 個名額，報名的有上百人。初試筆試、複試教學演示，還要現場演奏。`,
  ch: [{ t: '全力以赴', h: '綜合能力', fx: () => {
    S.flags.tries = (S.flags.tries || 0) + 1;
    const sc = (S.st.music + S.st.tech + S.st.theory) / 3 + S.flags.tries * 2 + ri(-8, 8);
    if (sc >= 58) { S.flags.teachPath = 4; job('sub', 0); job('office', 0); job('schoolT', 1); add('passion', 8); face('happy'); return `第 ${S.flags.tries} 次考，終於考上了！你成為正式音樂老師，還接下學校國樂團的指導。${own('outfit', 'cardigan')}`; }
    add('mood', -5); face('sad'); return `第 ${S.flags.tries} 次，還是沒上。代理老師的合約還有一年。`;
  } }]
};

EV.grad_done = {
  s: 2, prio: 50, w: () => S.flags.grad && S.age >= S.flags.grad, npc: 'xu', t: '碩士論文口試',
  x: () => '口試委員翻著你的論文：「梁在平《擬箏譜》與臺灣早期箏樂教學」。',
  ch: [
    { t: '畢業後去大學兼課', h: '研究↑', fx: () => { gradDone(); job('lecturer', 1); return '你拿到碩士學位，開始在大學兼任講師，教副修古箏。'; } },
    { t: '繼續讀博士', h: '四年', fx: () => { gradDone(); S.student = true; S.flags.phd = S.age + 4; return '你決定繼續讀博士。許教授說：「好，那就要做一輩子的研究。」'; } }
  ]
};
function gradDone() { S.student = false; S.flags.grad = 0; S.flags.master = 1; unlock('liang'); add('theory', 6); cert(S.flags.inserv ? '碩士學位（在職專班）' : '碩士學位'); if (S.flags.inserv) S.recitals++; }
EV.phd_done = {
  s: 2, prio: 50, w: () => S.flags.phd && S.age >= S.flags.phd, npc: 'xu', t: '博士畢業',
  auto: () => { S.student = false; S.flags.phd = 0; S.flags.dr = 1; cert('博士學位'); job('lecturer', 1); add('theory', 8); return '你拿到博士學位了。系上的專任缺，要等。你先繼續兼課、發表論文、辦音樂會。'; }
};
EV.prof_hire = {
  s: 1, p: .35, rep: 1, w: () => S.flags.dr && !S.jobs.prof, npc: 'xu', t: '專任教職',
  x: () => '母系開了一個專任助理教授的缺。審查學歷、論文、演出紀錄，還要試教。',
  ch: [{ t: '投件', h: '名氣＋樂理', fx: () => { if (S.st.fame * .5 + S.st.theory * .5 + ri(-8, 8) >= 52) { job('prof', 1); job('lecturer', 0); job('office', 0); add('passion', 8); face('happy'); return '你成為專任助理教授了。第一次走進主修教室，坐在當年許教授的位子上。'; } return '這次錄取的是國外回來的博士。你繼續兼課、繼續寫。'; } }]
};

// ================= 樂團生活 =================
EV.orch_concert = {
  p: .18, rep: 1, w: () => S.jobs.orchestra, npc: 'huang', t: '定期音樂會',
  x: () => '這一季的定期音樂會，曲目裡有一段箏的獨奏樂句。黃指揮排練時停下來：「箏，這裡你想怎麼彈？」',
  ch: [
    { t: '照譜穩穩彈', h: '安全', fx: () => { add('tech', 2); rel('huang', 3); return '演出很順。黃指揮謝幕時朝彈撥聲部點了點頭。'; } },
    { t: '加一點自己的揉弦', h: '看樂感', fx: () => { if (check(S.st.music + ri(-6, 6), 60)) { add('fame', 4); rel('huang', 8); face('happy'); return '那一句你揉得特別深，樂評隔天寫：「箏的那段獨白令人難忘。」'; } rel('huang', -4); return '黃指揮皺了眉：「下次先跟我說。」'; } }
  ]
};
EV.orch_tour = {
  p: .1, rep: 2, w: () => S.jobs.orchestra, npc: 'huang', t: '出國巡演',
  x: () => `樂團要去${pick(['日本', '捷克', '新加坡', '法國', '馬來西亞'])}巡演，箏要跟著搭飛機。你要自己的演奏箏託運，還是用當地借的箏？`,
  ch: [
    { t: '託運自己的箏', h: '－NT$ 1 萬', fx: () => { cash(-10000); add('fame', 5); add('mood', 5); return '箏平安到達，雁柱一個都沒倒。當地觀眾排隊來看這台「有二十一根弦的琴」。'; } },
    { t: '借當地的箏', h: '', fx: () => { add('fame', 3); add('mood', -2); return '借來的箏弦距不同，你花了一整晚重新調雁柱。演出還是很成功。'; } }
  ]
};
EV.orch_principal = {
  p: .15, w: () => S.jobs.orchestra && !S.jobs.principal && S.st.tech >= 76, npc: 'huang', t: '聲部首席甄選',
  x: () => '彈撥聲部的首席要退休了，團內辦首席甄選。',
  ch: [{ t: '報名', h: '技巧', fx: () => { if (perf() >= 76) { job('principal', 1); add('fame', 8); face('happy'); return `你成為${orchName()}的箏首席。${own('outfit', 'tux')}`; } return '這次沒選上。黃指揮說：「再一年。」'; } }]
};
EV.orch_concerto = {
  p: .12, w: () => S.jobs.orchestra && (S.jobs.principal || S.st.fame >= 50), npc: 'huang', t: '與樂團協奏',
  x: () => '黃指揮把一份總譜放在你面前：「明年的開季音樂會，箏協奏曲，你來獨奏。」',
  ch: [
    { t: () => `協奏〈${(PIECES.find(p => p.id === 'lay') || {}).n}〉`, h: '技巧＋樂感', fx: () => concerto('臨安遺恨') },
    { t: '請阿凱寫新的協奏曲', h: '需要阿凱好感', if: () => (S.rel.kai || 0) >= 50, fx: () => { learn('esy'); rel('kai', 10); return concerto('二十一弦'); } }
  ]
};
function concerto(n) {
  if (perf() >= 70) { add('fame', 12); add('passion', 8); S.recitals++; award(`與樂團協奏〈${n}〉`, 0); face('happy'); return `〈${n}〉演完，全場起立。你抱著箏鞠躬時，看見媽媽坐在第一排。`; }
  add('fame', 4); return `〈${n}〉的快板段落有點趕，但整體還是很動人。`;
}

// ---- 樂團：從聲部最邊邊，到服務二十年 ----
EV.orch_first = {
  s: 1, prio: 45, w: () => S.jobs.orchestra && !S.done.orch_first, npc: 'su', t: '彈撥聲部的第一天',
  x: () => '你的位子在彈撥聲部最邊邊，左邊是琵琶，右邊是中阮。琵琶首席蘇姐把一疊譜放在你的箏上：「我是彈撥聲部的聲部長。下週三套曲目，這些是你的。」<br>譜上密密麻麻，全是前一位箏手留下的鉛筆記號。',
  ch: [
    { t: '把譜帶回家，一個晚上全部看完', h: '技巧↑', fx: () => { add('tech', 3); add('health', -2); rel('su', 6); return '第一次排練，你一個音都沒彈錯。蘇姐沒說什麼，只是把下一季的譜也先給了你。'; } },
    { t: '問蘇姐：「箏在樂團裡要聽誰？」', h: '樂感↑ 好感↑', fx: () => { add('music', 3); rel('su', 12); unlock('pluck'); return '蘇姐笑了：「先聽揚琴和琵琶的顆粒，跟它們對齊。長音要比你想的再收一點——輪到你的時候，再一口氣出來。」'; } }
  ],
  pre: () => meet('su')
};
EV.orch_newwork = {
  p: .14, rep: 2, w: () => S.jobs.orchestra && orchYears() >= 1, npc: 'huang', t: '新作首演',
  x: () => '樂團委託的新作品譜送來了。箏的聲部有一段要雙手同時刮奏、左手還要按出半音，速度標著每分鐘一百六十拍。<br>蘇姐瞄了一眼：「作曲家是不是以為箏有四隻手？」',
  ch: [
    { t: '去找作曲家討論', h: '樂感↑', fx: () => { add('music', 3); rel('huang', 3); if (S.met.kai && (S.rel.kai || 0) >= 40 && R() < .4) { rel('kai', 6); return '作曲家是阿凱的學弟。你們在排練室改了一下午，那段變得更好彈，也更好聽。'; } return '你示範了三種彈法給作曲家聽。他把其中一種寫進定稿，譜的角落多了一行小字：「感謝箏手的建議」。'; } },
    { t: '硬是練到彈出來', h: '技巧＋ 健康－', fx: () => { add('health', -4); if (check(S.st.tech + ri(-5, 5), 70)) { add('tech', 4); add('fame', 3); face('happy'); return '首演那晚，你把那段「不可能」彈得乾乾淨淨。謝幕時，作曲家衝上台跟你握手。'; } add('mood', -4); return '首演時你掉了好幾個音。作曲家倒是很滿意：「聽起來就是我要的混亂。」'; } }
  ]
};
EV.orch_school = {
  p: .12, rep: 3, w: () => S.jobs.orchestra, npc: 'su', t: '校園巡迴',
  x: () => `樂團到${pick(['屏東', '臺東', '南投', '雲林', '澎湖'])}的國小巡迴演出。下課鐘一響，一群小朋友圍住你的箏，一個綁馬尾的女生小聲問：「可以摸摸看嗎？」`,
  ch: [
    { t: '讓每個小朋友都撥一下', h: '熱忱↑', fx: () => { add('passion', 6); add('mood', 4); return '二十一根弦被撥得亂七八糟，你重新調音調了二十分鐘。回程的遊覽車上，你一直在笑。'; } },
    { t: '幫她纏上膠布、戴上義甲', h: '熱忱↑ 名氣↑', fx: () => { add('passion', 4); add('fame', 2); return S.bg === 'child' ? '「大拇指往外是『托』。」說完你才發現，這是陳老師的口氣。' : '她撥出第一個音，整個人跳了起來。導師說她下學期要加入學校的國樂社。'; } }
  ]
};
EV.orch_cover = {
  p: .1, rep: 3, w: () => S.jobs.orchestra && orchYears() >= 1, npc: 'huang', t: '臨時救火',
  x: () => '開演前兩小時，另一位箏手急性腸胃炎送醫。黃指揮走過來：「兩個箏聲部，你一個人扛得下來嗎？還有第三樂章那段獨奏。」',
  ch: [
    { t: '「交給我。」', h: '看演出', fx: () => { if (perf() >= 60) { add('fame', 5); rel('huang', 10); face('happy'); return '你在後台用三十分鐘把兩份譜合成一份。第三樂章的獨奏結束時，黃指揮在指揮台上朝你點了點頭。'; } add('mood', -5); rel('huang', 2); return '獨奏那段你彈得很保守，還漏了一句。散場時黃指揮說：「謝謝你。真的。」'; } },
    { t: '「獨奏請別的聲部代吧。」', h: '安全', fx: () => { rel('su', 4); return '蘇姐用琵琶接下了那段獨奏。你們兩個在台上交換了一個眼神。'; } }
  ]
};
EV.orch_sound = {
  p: .1, w: () => S.jobs.orchestra && orchYears() >= 2, npc: 'huang', t: '箏的聲音不見了',
  x: () => '樂團搬進新的音樂廳，兩千個座位。排練錄音放出來，打擊組一進來，箏就不見了。音響師問：「要不要幫箏加一支收音麥克風？」',
  ch: [
    { t: '跟音響師一起研究收音', h: '名氣↑ 樂理↑', fx: () => { add('fame', 3); add('theory', 2); return '你們試了五個麥克風的位置，最後夾在琴尾的那一支最自然。觀眾說：「今年的箏好清楚。」'; } },
    { t: '堅持原音，換厚一點的義甲', h: '技巧↑ 健康－', fx: () => { add('tech', 3); add('health', -3); rel('huang', 5); return '每一個音你都彈得更深、更沉。黃指揮說：「這才是我要的箏。」你的指尖腫了一個禮拜。'; } }
  ]
};
EV.orch_eval = {
  s: 2, prio: 30, rep: 3, w: () => S.jobs.orchestra && orchYears() >= 2, npc: 'su', t: '團員考核',
  x: () => '每隔幾年，樂團要辦一次團員考核：一首指定曲、一段樂團片段，評審就坐在你平常坐的位子對面。',
  ch: [
    { t: '提早三個月準備', h: '健康－', fx: () => { add('health', -3); return orchEval(6); } },
    { t: '平常心', h: '', fx: () => orchEval(0) }
  ]
};
function orchEval(b) {
  if (perf() + b >= 58) { rel('su', 4); add('passion', 3); return pick(['評語只有四個字：「穩定可靠。」', '評審說你的樂團片段「聽得出在聽別人」。這是最好的評語。']); }
  S.flags.orchWarn = (S.flags.orchWarn || 0) + 1; add('mood', -8); face('sad');
  return S.flags.orchWarn >= 2 ? '又是「待改進」。團長找你談話：「我們都知道你很努力。」那天你在排練廳坐到很晚。' : '考核結果「待改進」。蘇姐拍拍你的肩：「我第一次也沒過。下一次就好。」';
}
EV.orch_chamber = {
  p: .1, w: () => S.jobs.orchestra && (S.rel.su || 0) >= 40, npc: 'su', t: '彈撥五重奏',
  x: () => '排練後，蘇姐約你喝咖啡：「我想組一個彈撥五重奏。柳琴、琵琶、中阮、揚琴，再加你的箏。不用指揮，自己聽彼此。」',
  ch: [
    { t: '「我加入！」', h: '樂感↑ 名氣↑', fx: () => { S.flags.chamber = 1; add('music', 4); add('fame', 3); rel('su', 10); return '團名叫「五弦以上」。第一場演出在一間老倉庫，椅子不夠，觀眾就坐在地上。'; } },
    { t: '「樂團的工作已經很滿了。」', h: '', fx: () => { rel('su', -2); return '蘇姐點點頭：「位子先幫你留著。」'; } }
  ]
};
EV.chamber_album = {
  p: .12, w: () => S.flags.chamber === 1 && orchYears() >= 4, npc: 'su', t: '五重奏的第一張專輯',
  x: () => '「五弦以上」演了幾年，終於有唱片公司願意幫你們出專輯。錄音室只租得起三天。',
  ch: [
    { t: '全部錄臺灣作曲家的新作', h: '名氣↑', fx: () => { S.flags.chamberAlbum = 1; add('fame', 6); add('music', 3); return '三天錄完十一首。最後一首錄完，揚琴手哭了。'; } },
    { t: '把傳統曲改編成五重奏', h: '樂感↑', fx: () => { S.flags.chamberAlbum = 1; add('fame', 4); add('music', 5); unlock('sch:潮州箏派'); return '你們把〈寒鴉戲水〉拆成五個聲部，每個人輪流唱主旋律。'; } }
  ]
};
EV.orch_kids = {
  s: 1, p: .1, rep: 4, w: () => S.jobs.orchestra, npc: 'su', t: '暑假親子音樂劇',
  x: () => '暑假的親子音樂劇一個月要演二十場。導演說：「箏手要穿成一棵會彈琴的樹。」',
  ch: [
    { t: '穿上樹的衣服', h: '心情↑ 名氣↑', fx: () => { add('mood', 6); add('fame', 2); return '每場謝幕，小朋友都大喊「樹樹好棒」。蘇姐演的是一朵雲。'; } },
    { t: '請導演讓你穿自己的演出服', h: '', fx: () => { add('mood', -1); return '導演勉強同意了，條件是你的箏要掛滿葉子。'; } }
  ]
};
EV.orch_yun = {
  prio: 25, w: () => S.jobs.orchestra && S.yun && S.yun.uni && S.yun.age >= 22 && S.yun.age <= 30 && !S.done.orch_yun && R() < .5, npc: 'yun', t: '新進團員',
  x: () => `${orchName()}的箏聲部招考放榜了。新進團員的名單上，有一個你很熟的名字——小芸。`,
  ch: [{ t: '把自己的鉛筆記號全部抄給她', h: '傳承', fx: () => { S.flags.yunOrch = 1; rel('yun', 12); add('passion', 8); return '第一次排練，小芸坐在你旁邊，緊張到義甲纏反了。你幫她重纏的時候，想起她六歲的樣子。'; } }]
};
EV.orch_rookie = {
  p: .1, w: () => S.jobs.orchestra && orchYears() >= 8 && !S.flags.yunOrch, npc: 'su', t: '新來的箏手',
  x: () => '新進的箏手剛從大學畢業，第一週排練就被黃指揮停了三次。休息時間，一個人躲在樓梯間練。',
  ch: [
    { t: '去樓梯間找人聊聊', h: '熱忱↑', fx: () => { add('passion', 5); return '你說了自己第一次排練被罵的事。對方笑了，然後問你那段刮奏要從哪一根弦開始。'; } },
    { t: '讓新人自己撐過去', h: '', fx: () => { add('music', 1); return '一個月後，新人不再被停了。你在譜架上發現一張便利貼：「前輩，謝謝你什麼都沒說。」'; } }
  ]
};
EV.orch_anniv = {
  s: 3, prio: 30, w: () => S.jobs.orchestra && orchYears() >= 20 && !S.done.orch_anniv, npc: 'su', t: '服務二十年',
  x: () => `年終團務會議上，團長唸到你的名字：「在${orchName()}彈了二十年的箏。」大家都轉過頭來看你。`,
  ch: [{ t: '站起來鞠躬', h: '', fx: () => { award(`${orchName()}　資深團員表揚（服務二十年）`, 3); add('passion', 6); return '蘇姐帶頭鼓掌。你想起第一天坐在彈撥聲部最邊邊、連鉛筆記號都看不懂的樣子。'; } }]
};
EV.orch_farewell = {
  s: 1, prio: 45, w: () => S.jobs.orchestra && S.age === 64, npc: 'huang', t: '最後一場定期音樂會',
  x: () => '這是你退休前最後一場定期音樂會。黃指揮把曲目單遞給你：「最後一首的箏獨奏我改寫了——整段都交給你。」',
  ch: [
    { t: '彈得像第一天一樣認真', h: '', fx: () => { add('passion', 8); add('fame', 4); face('happy'); return '謝幕時，整個彈撥聲部一起站起來，朝你的方向拍手。你的箏上被放了一束花。'; } },
    { t: '把最後一段改成即興', h: '看樂感', fx: () => { if (check(S.st.music + ri(-5, 5), 70)) { add('fame', 6); face('happy'); return '你閉上眼睛，彈了一段只屬於這一晚的旋律。黃指揮沒有打拍子，只是看著你。'; } return '即興有點散，但沒有人在意。這一晚屬於你。'; } }
  ]
};

// ================= 演奏家 =================
EV.recital = {
  p: .14, rep: 2, w: () => S.age >= 23 && !S.student && S.st.tech >= 55 && (S.st.fame >= 18 || S.major), npc: () => S.met.kai ? 'kai' : 'mom', t: '辦一場獨奏會？',
  x: () => `朋友問你：要不要辦一場自己的獨奏會？你現在的名氣是 ${S.st.fame}。`,
  ch: [
    { t: '租演奏廳（約 300 席）', h: '－NT$ 8 萬，看名氣賣票', fx: () => { cash(-80000); const sold = Math.min(300, Math.round(40 + S.st.fame * 3.2 + ri(-20, 20))); cash(sold * 500); S.recitals++; add('fame', 7); add('passion', 5); if (sold > 200) face('happy'); return `${own('outfit', 'gown')}賣出 ${sold} 張票。${sold > 250 ? '幾乎滿場！' : sold < 120 ? '一半以上是空位，但來的人都聽得很專心。' : '坐了大半。'}`; } },
    { t: '在咖啡館辦小型沙龍', h: '－NT$ 1 萬', fx: () => { cash(-10000); cash(ri(8, 20) * 600); add('fame', 3); add('mood', 5); S.recitals++; return '四十個座位全滿。你一邊彈一邊介紹每首曲子的故事，觀眾聽得很開心。'; } },
    { t: '今年先不辦', h: '', fx: () => '你把場地的報價單收進資料夾。' }
  ]
};
EV.album = {
  p: .08, w: () => S.st.fame >= 40 && S.st.tech >= 60 && !S.flags.album, npc: 'kai', t: '錄專輯',
  x: () => '唱片公司來談錄音。他們想要一張「好入門」的古箏專輯。',
  ch: [
    { t: '傳統箏派精選', h: '樂感', fx: () => { S.flags.album = 1; add('fame', 8); cash(60000); return '專輯叫《箏道》。銷量普通，但好幾所音樂班把它當成教材。'; } },
    { t: '古箏彈流行歌', h: '名氣↑↑', fx: () => { S.flags.album = 1; add('fame', 14); cash(150000); add('passion', -2); return '專輯上了串流平台的排行榜。也有前輩說你「不務正業」。'; } }
  ]
};
EV.crossover = {
  p: .07, w: () => S.st.fame >= 30 && S.age >= 22 && !S.flags.cross, npc: 'kai', t: '跨界合作',
  x: () => `${pick(['一個獨立樂團', '一款手機遊戲的配樂團隊', '一位電子音樂製作人'])}找你合作，想在作品裡放進古箏。`,
  ch: [
    { t: '接！', h: '名氣↑', fx: () => { S.flags.cross = 1; add('fame', 8); cash(40000); add('music', 3); return '你第一次戴著耳機、對著節拍軌彈箏。成品出來的那天，你重播了二十次。'; } },
    { t: '婉拒', h: '', fx: () => '你覺得現在還不是時候。' }
  ]
};
EV.intl = {
  p: .06, w: () => S.st.tech >= 70 && S.age <= 35 && S.age >= 18 && !S.flags.intl, npc: () => S.major ? 'xu' : 'chen', t: '國際箏樂比賽',
  x: () => '海外有一場國際箏樂比賽，初賽寄錄影，決賽要飛過去現場比。',
  ch: [{ t: '報名', h: '技巧＋樂感', fx: () => { S.flags.intl = 1; cash(-30000); const sc = perf(); if (sc >= 80) { award('國際箏樂比賽　金獎', 15); face('happy'); return '你站上頒獎台，手上的獎盃比義甲還閃。'; } if (sc >= 68) { award('國際箏樂比賽　銀獎', 8); return '銀獎！評審說你的左手「很有臺灣的味道」。'; } return '決賽沒得名，但你在那裡認識了好多國家的箏人。'; } }, { t: '不去', h: '', fx: () => '你在網路上看了決賽直播。' }]
};

// ---- 演奏家：經紀人、國家音樂廳、傳藝金曲獎 ----
EV.agent = {
  p: .12, w: () => isSolo() && S.st.fame >= 30 && S.st.tech >= 55, npc: 'ivy', t: '經紀人',
  x: () => '演出結束後，一位穿著俐落套裝的人遞上名片：「我是 Ivy，做藝術經紀。你的演出我看了三場。要不要簽約？檔期、合約、宣傳我來處理，你只要負責彈。」',
  ch: [
    { t: '簽約', h: '演出收入↑ 自由↓', fx: () => { S.flags.agent = 1; add('fame', 5); rel('ivy', 10); return 'Ivy 第一個禮拜就幫你排了三場演出、兩個訪問，還有一場「請穿得仙一點」的拍照。行程表的「接演出」收入變高了。'; } },
    { t: '「我想自己來。」', h: '熱忱↑', fx: () => { S.flags.agent = -1; add('passion', 3); rel('ivy', 3); return 'Ivy 把名片塞進你的琴盒：「哪天改變主意，打給我。」'; } }
  ],
  pre: () => meet('ivy')
};
EV.agent_brand = {
  p: .1, rep: 3, w: () => S.flags.agent === 1, npc: 'ivy', t: '廣告邀約',
  x: () => `Ivy 傳來訊息：「${pick(['一個精品錶', '一款新手機', '一家航空公司'])}的廣告想找你。鏡頭三秒，酬勞 NT$ 20 萬。不過……他們要你對嘴，箏聲是電腦做的。」`,
  ch: [
    { t: '接，三秒而已', h: '＋NT$ 20 萬 熱忱－', fx: () => { cash(200000); add('fame', 5); add('passion', -4); return '廣告播出後，很多人來問那段箏聲是不是你彈的。你每次都要解釋一遍。'; } },
    { t: '要求用你自己的錄音', h: '看名氣', fx: () => { if (S.st.fame >= 50) { cash(250000); add('fame', 7); rel('ivy', 6); face('happy'); return '廣告商答應了，還加了預算。廣告的最後一秒，畫面打上了你的名字。'; } rel('ivy', -3); return '廣告商換了別人。Ivy 說：「下次。等你再紅一點。」'; } },
    { t: '推掉', h: '', fx: () => { add('passion', 2); rel('ivy', -5); return 'Ivy 嘆了一口氣，還是幫你回了一封很客氣的信。'; } }
  ]
};
EV.commission = {
  p: .09, w: () => isSolo() && S.recitals >= 2 && S.money >= 150000, npc: 'kai', t: '委託一首新曲',
  x: () => '你發現自己的曲目單上，全是別人為別人寫的曲子。你想委託作曲家，專門為你寫一首箏獨奏曲。委託費大約 NT$ 10 萬。',
  ch: [
    { t: '委託年輕作曲家', h: '－NT$ 10 萬 新曲目', fx: () => { cash(-100000); learn('dao'); add('music', 4); add('passion', 6); return '作曲家在東北角住了一個月，寄來的譜叫〈島嶼風聲〉。第一頁寫著：「刮奏要像十月的東北季風。」'; } },
    { t: '請阿凱寫', h: '需要阿凱好感', if: () => S.met.kai && (S.rel.kai || 0) >= 45 && !S.pieces.includes('esy'), fx: () => { learn('esy'); rel('kai', 10); add('passion', 8); return '阿凱不肯收錢：「我等你開口，等很久了。」'; } },
    { t: '再等等', h: '', fx: () => '你把作曲家的名片夾進譜裡。' }
  ]
};
EV.nch = {
  p: .12, w: () => isSolo() && S.recitals >= 2 && S.st.fame >= 48 && S.st.tech >= 62, npc: () => S.flags.agent === 1 ? 'ivy' : 'kai', t: '國家音樂廳',
  x: () => '國家音樂廳演奏廳的檔期申請通過了。場地、宣傳、節目單全部要自己來，票提早半年開賣。<br>這是很多箏人一輩子的目標。你要怎麼排這一晚？',
  ch: [
    { t: '六個箏派，一個晚上', h: '樂感', fx: () => nchNight(S.st.music, '你從山東彈到浙江。中場休息時，大廳裡有人在討論潮州箏的「重六」。') },
    { t: '近代炫技曲目', h: '技巧', fx: () => nchNight(S.st.tech, '〈戰台風〉最後那段颱風過境的刮奏，你彈完時聽見有人倒吸了一口氣。') },
    { t: '首演委託的新作', h: '需要先有新曲', if: () => S.pieces.includes('dao') || S.pieces.includes('esy'), fx: () => nchNight(S.st.music + 6, `下半場首演〈${S.pieces.includes('dao') ? '島嶼風聲' : '二十一弦'}〉。最後一個泛音消失之後，全場安靜了五秒。`) }
  ]
};
function nchNight(base, ok) {
  unlock('nch'); S.flags.nch = 1; S.recitals++;
  const full = check(S.st.fame + ri(-5, 5), 55);
  cash(-150000 + (full ? 300000 : 170000));
  if (check(base + ri(-6, 6), 62)) { award('國家音樂廳演奏廳　個人獨奏會', 8); add('passion', 8); face('happy'); return `${full ? '票全部賣完了。' : '坐了七成。'}${ok}${own('outfit', 'gown')}`; }
  add('fame', 4); add('mood', -3); return `${full ? '票全部賣完了。' : '坐了七成。'}整場很順，可是你一直在想下一首，沒有真的聽見自己。散場後你在後台坐了很久。`;
}
EV.stage_fright = {
  p: .1, rep: 4, w: () => isSolo() || S.jobs.orchestra, npc: () => S.flags.agent === 1 ? 'ivy' : 'mom', t: '上台前十五分鐘',
  x: () => '開演前十五分鐘，你的手在抖，義甲一碰到弦就發出細細的雜音。後台鏡子裡，你的臉色很白。',
  ch: [
    { t: '閉上眼睛，在心裡彈第一句', h: '看心情', fx: () => { if (S.st.mood + ri(-10, 10) >= 50) { add('passion', 3); return '第一句在心裡彈了三次，第四次在台上。手不抖了。'; } add('mood', -4); return '手一直抖到第二首才停。觀眾大概沒發現，你自己一直記得。'; } },
    { t: '去找表演焦慮的諮商', h: '－NT$ 1.2 萬 心情↑', fx: () => { cash(-12000); add('mood', 8); add('passion', 3); return '諮商師說：「緊張是身體在幫你準備。」你學會在上台前慢慢吐氣，數到八。'; } }
  ]
};
EV.review = {
  p: .08, w: () => isSolo() && S.recitals >= 2 && S.st.fame >= 35, npc: myTeacher, t: '一篇樂評',
  x: () => '報紙藝文版刊出一篇樂評：「技巧無懈可擊，但聽完整場，我不知道這位演奏者想說什麼。」',
  ch: [
    { t: () => `回去找${npcName(myTeacher())}`, h: '樂感↑', fx: () => { add('music', 6); add('mood', -2); return { xu: '許教授聽你彈完，只說：「你在彈譜，不是在彈曲子。」你們從第一小節重新開始。', wang: '王老師泡了一壺茶：「你還記得第一次在捷運站聽到箏的感覺嗎？彈那個。」', chen: '陳老師泡了一壺茶，聽你彈完一首：「你好久沒有彈給自己聽了吧？」' }[myTeacher()]; } },
    { t: '把樂評剪下來貼在譜架上', h: '熱忱↑', fx: () => { add('passion', 5); add('tech', 2); return '每天練琴前，你都看它一眼。半年後，同一位樂評人寫：「這次，我聽到了。」'; } },
    { t: '不看樂評了', h: '心情↑', fx: () => { add('mood', 4); return '你把那份報紙拿去墊了雁柱盒。'; } }
  ]
};
EV.festival = {
  p: .08, w: () => !S.student && S.st.fame >= 40 && S.st.tech >= 58, npc: 'kai', t: '亞洲箏樂節',
  x: () => '你受邀參加一場亞洲箏樂節。同一個舞台上有日本箏、韓國伽倻琴、越南箏，還有你的二十一弦箏。排練休息時，大家把樂器並排放在一起數弦。',
  ch: [
    { t: '跟伽倻琴即興對話', h: '樂感↑ 名氣↑', fx: () => { unlock('family'); add('music', 4); add('fame', 4); return '伽倻琴手不戴義甲，直接用手指撥弦，聲音比你的更沙、更近。你們用五聲音階一來一往，玩了十分鐘。'; } },
    { t: '跟日本箏家學一段〈六段〉', h: '樂理↑', fx: () => { unlock('family'); add('theory', 3); add('music', 2); return '十三根弦、不同的調弦，讓你的右手完全不聽使喚。老師笑說：「我第一次彈你的箏，也是這樣。」'; } }
  ]
};
EV.gma = {
  p: .2, w: () => (S.flags.album || S.flags.chamberAlbum) && S.st.fame >= 55 && !S.student, npc: () => S.flags.agent === 1 ? 'ivy' : 'kai', t: '傳藝金曲獎入圍',
  x: () => `${S.flags.album ? '你的專輯' : '「五弦以上」的專輯'}入圍了傳藝金曲獎「最佳演奏獎」。頒獎典禮那天，你要穿什麼？`,
  ch: () => [['gown', '演出禮服'], ['qipao', '旗袍風洋裝'], ['hanfu', '漢服'], ['tux', '燕尾服'], ['suit', '西裝']].filter(([id]) => S.own.outfit.includes(id)).slice(0, 2)
    .concat([[S.look.outfit, '平常最喜歡的那套']]).map(([id, n]) => ({ t: `穿${n}`, h: '換上立繪', fx: () => gmaNight(id, n) }))
};
function gmaNight(id, n) {
  unlock('gma'); S.look.outfit = id;
  if (R() < .15 + clamp((perf() + (S.flags.chamberAlbum ? 3 : 0) - 70) / 60, 0, .4)) { S.flags.gma = 1; award('傳藝金曲獎　最佳演奏獎', 12); add('passion', 10); face('happy'); return `你穿著${n}走上台。唸到你的名字時，你愣了兩秒才站起來。得獎感言你只記得最後一句：「謝謝那個幫我纏第一卷膠布的人。」`; }
  add('fame', 4); add('mood', -2); return `獎頒給了一位琵琶演奏家。你穿著${n}在台下用力拍手，心裡想：入圍，已經很好了。`;
}
EV.young_star = {
  p: .08, w: () => !S.student && S.age >= 36 && S.st.fame >= 40, npc: () => S.flags.agent === 1 ? 'ivy' : 'kai', t: '箏壇新星',
  x: () => '一位十九歲的箏手在網路上爆紅，媒體標題寫著：「箏壇新星，前輩們該緊張了」。記者打電話來問你的看法。',
  ch: [
    { t: '「她彈得真好，大家快去聽。」', h: '名氣↑ 熱忱↑', fx: () => { add('fame', 2); add('passion', 4); return `那位年輕箏手私訊你：「${S.flags.album ? '我是聽你的專輯長大的。' : '我小時候看過你的演出。'}」`; } },
    { t: '掛掉電話，回去練新曲', h: '技巧↑', fx: () => { add('tech', 3); add('mood', -2); return '你練到半夜，突然笑了出來：原來你也會不甘心。'; } }
  ]
};
EV.solo_tour = {
  p: .08, rep: 4, w: () => isSolo() && S.recitals >= 3 && S.st.fame >= 40 && S.age <= 60, npc: () => S.flags.agent === 1 ? 'ivy' : 'kai', t: '環島巡演',
  x: () => '有人提議：把獨奏會帶到沒有音樂廳的地方。十個鄉鎮，廟口、老戲院、國小禮堂。',
  ch: [
    { t: '租一台車，自己載箏環島', h: '健康－ 名氣↑ 心情↑', fx: () => { add('health', -5); add('fame', 5); add('mood', 8); cash(60000); return `最難忘的是${pick(['臺東池上的稻田邊', '澎湖的老戲院', '屏東的廟口', '花蓮的海邊國小'])}。一位阿嬤聽完，塞給你一袋自己種的${pick(['柚子', '地瓜', '芭樂'])}。`; } },
    { t: '只去大城市', h: '收入↑', fx: () => { cash(90000); add('fame', 3); return '五場、三座城市，場場順利。只是偶爾，你會想起那些沒有去的地方。'; } }
  ]
};
EV.perf_retro = {
  p: .15, w: () => isSolo() && S.age >= 52 && S.recitals >= 4, npc: () => S.flags.legacy ? 'yun' : 'kai', t: '回顧獨奏會',
  x: () => '你決定辦一場回顧獨奏會：從第一首〈小星星〉開始，把這輩子彈過的曲子挑幾首，一首一首彈。',
  ch: [{ t: '把〈小星星〉排在第一首', h: '', fx: () => { add('passion', 8); add('fame', 4); face('happy'); const p = topPieces(1)[0]; return `${p ? `從〈小星星〉到〈${p.n}〉，` : ''}一個晚上，好像把一輩子又彈了一遍。安可時你又彈了一次〈小星星〉，這次台下有人跟著哼。`; } }]
};

// ================= 教學與傳承 =================
EV.yun_arrive = {
  p: .2, w: () => S.jobs.studio && !S.yun && S.age >= 24, npc: 'yun', t: '小芸',
  x: () => '一位媽媽牽著小女孩走進教室。小女孩躲在媽媽後面，看著牆邊那排比她還長的箏。<br>「她叫小芸，六歲。」',
  ch: [{ t: '蹲下來幫她纏膠布', h: '', fx: () => { S.yun = { age: 6, lv: 4 }; meet('yun'); rel('yun', 20); add('passion', 8); return S.bg === 'child' ? '「大拇指往外是『托』……」你說到一半停住了，想起很多年前陳老師也是這樣蹲在你面前。' : '「大拇指往外是『托』。」小芸小心地撥了一下，眼睛亮了起來。'; } }]
};
EV.yun_mc = {
  s: 0, prio: 30, w: () => S.yun && S.yun.age === 8 && !S.done.yun_mc, npc: 'yun', t: '小芸要考音樂班',
  x: () => '小芸的媽媽問你：「老師，她可以考音樂班嗎？」小芸抓著你的衣角。',
  ch: [
    { t: '加課陪她準備', h: '心情↓', fx: () => { add('mood', -2); if (S.yun.lv + S.st.music * .3 + ri(-6, 6) >= 22) { S.yun.mc = 1; S.yun.lv += 6; rel('yun', 10); face('happy'); return '小芸考上了！她把錄取單拿來給你看，上面還畫了一台箏。'; } return '小芸沒考上，哭了一整節課。你說：「老師當年也沒考上呀。」'; } },
    { t: '讓她快樂地學就好', h: '', fx: () => { rel('yun', 5); return '小芸的媽媽點點頭：「也是，喜歡最重要。」'; } }
  ]
};
EV.yun_award = {
  s: 2, prio: 25, w: () => S.yun && S.yun.age === 13 && !S.done.yun_award, npc: 'yun', t: '小芸的比賽',
  auto: () => { const g = S.yun.lv >= 40 ? '特優' : S.yun.lv >= 28 ? '優等' : '甲等'; S.taughtAward = 1; add('passion', 6); return `小芸參加全國學生音樂比賽，拿到「${g}」。頒獎台下，你比她還緊張。`; }
};
EV.yun_uni = {
  s: 3, prio: 25, w: () => S.yun && S.yun.age === 17 && !S.done.yun_uni, npc: 'yun', t: '小芸的術科考試',
  auto: () => { if (S.yun.lv >= 45) { S.yun.uni = 1; rel('yun', 10); return '小芸考上中國音樂學系了！她說以後也要像你一樣當老師。'; } return '小芸決定讀一般大學，但說會一直彈下去。'; }
};
EV.yun_teacher = {
  s: 2, prio: 25, w: () => S.yun && S.yun.age === 24 && !S.done.yun_teacher, npc: 'yun', t: '小芸也收學生了',
  auto: () => { S.flags.legacy = 1; add('passion', 10); return '小芸傳來一張照片：她蹲在一個小孩面前，正在幫對方纏膠布。訊息寫著：「老師，我也有學生了。」'; }
};
EV.parent = {
  p: .1, rep: 2, w: () => S.jobs.studio && S.students >= 4, npc: 'mom', t: '家長的問題',
  x: () => '一位家長下課後留下來：「老師，隔壁班的孩子都考到八級了，我們家的為什麼還在五級？」',
  ch: [
    { t: '解釋學琴不是比賽', h: '可能流失學生', fx: () => { if (R() < .5) { S.students = Math.max(0, S.students - 1); return '家長點點頭，下個月還是轉去別的教室了。'; } add('fame', 1); return '家長聽完沉默了一下：「那就照老師的步調吧。」'; } },
    { t: '幫孩子排加課衝級數', h: '收入↑ 心情↓', fx: () => { cash(12000); add('mood', -3); return '孩子考過了，但上課時越來越常發呆。'; } }
  ]
};
EV.chen_retire = {
  p: .2, w: () => S.bg === 'child' && S.flags.chenHint && S.jobs.studio && !S.flags.chenGone, npc: 'chen', t: '陳老師要退休了',
  x: () => '陳老師把你叫到清音才藝教室：「我要退休了。這些學生，還有這一排箏，你願意接下來嗎？」',
  ch: [
    { t: '接下清音才藝教室', h: '學生＋12', fx: () => { S.flags.chenGone = 1; S.students += 12; S.taught += 12; rel('chen', 15); add('passion', 10); return '你在教室門口重新掛上招牌。陳老師留下一張字條：「右手是聲，左手是韻。」'; } },
    { t: '「我還沒準備好。」', h: '', fx: () => { S.flags.chenGone = 1; rel('chen', 2); return '陳老師笑笑：「那我把箏送給你一台吧。」'; } }
  ]
};
EV.side_teach = {
  p: .12, w: () => !S.jobs.studio && !S.student && S.age >= 23 && (S.grade >= 7 || S.major), npc: 'mom', t: '有人想跟你學箏',
  x: () => '同事（或鄰居）問你：「我女兒想學古箏，你可以教她嗎？」',
  ch: [
    { t: '好啊', h: '開始教學', fx: () => { job('studio', 1); S.students = Math.max(S.students, 2); return `你開始週末教學。行程表多了「教箏」可以排。${own('outfit', 'cardigan')}`; } },
    { t: '我沒空', h: '', fx: () => '你推薦了以前的老師給對方。' }
  ]
};

// ---- 箏樂教室 ----
EV.studio_show = {
  s: 3, prio: 35, rep: 2, w: () => S.jobs.studio && S.students >= 4, npc: () => S.yun ? 'yun' : 'mom', t: '教室成果發表會',
  x: () => `年底的成果發表會，${S.students} 個學生都想上台，場地卻只租到兩個小時。`,
  ch: [
    { t: '每個人都上台，一人一首', h: '熱忱↑ 學生↑', fx: () => { add('passion', 5); add('health', -2); const n = ri(1, 3); S.students += n; S.taught += n; return `發表會拖到第三個小時，場地管理員一直看手錶。散場時，有 ${n} 位家長來問報名。`; } },
    { t: '只排程度最好的幾個', h: '名氣↑', fx: () => { add('fame', 3); if (R() < .5) { S.students = Math.max(0, S.students - 1); return '節目很精彩。但有一個沒被排上的孩子，下個月就沒有來了。'; } return '節目很精彩，大家都說你的學生程度好。'; } },
    { t: '全體學生一起大合奏', h: '樂感↑ 心情↑', fx: () => { add('music', 3); add('mood', 5); return `你把〈${pick(['茉莉花', '紫竹調', '瀏陽河'])}〉改編成五個聲部，六歲到六十歲的學生坐成一整排。最後的刮奏，像一陣很長的風。`; } }
  ]
};
EV.studio_move = {
  p: .1, w: () => S.jobs.studio && S.students >= 8, npc: 'mom', t: '教室要搬家',
  x: () => '房東說租約到期要漲三成。附近剛好有一間一樓店面，空間大一倍，騎樓還能停機車。',
  ch: [
    { t: '搬到一樓店面', h: '－NT$ 25 萬 招生更容易', fx: () => { cash(-250000); S.flags.bigStudio = 1; S.students += 4; S.taught += 4; return '你在玻璃門上貼了「箏樂教室」四個字。路過的小孩常常把臉貼在玻璃上看。'; } },
    { t: '咬牙付漲價的房租', h: '－NT$ 6 萬', fx: () => { cash(-60000); add('mood', -3); return '教室還是那一間。門邊的牆上，還留著每一屆學生量身高的鉛筆線。'; } }
  ]
};
EV.studio_grandpa = {
  p: .08, w: () => S.jobs.studio && fate('grandpa', .6), npc: 'mom', t: '七十二歲的新學生',
  x: () => '一位拄著拐杖的阿公走進教室：「老師，我想學〈望春風〉。我太太以前最愛唱，她走了以後，家裡太安靜了。」',
  ch: [
    { t: '幫阿公編一個簡單的版本', h: '熱忱↑', fx: () => { unlock('wcf'); add('passion', 8); add('music', 2); S.students++; S.taught++; return '阿公學了八個月。發表會那天他彈得很慢，一個音一個音，台下沒有人催他。'; } },
    { t: '照一般進度，從基本功教起', h: '', fx: () => { unlock('wcf'); S.students++; S.taught++; add('tech', 1); return '阿公每週都來，練習曲一首也沒漏。半年後他問：「老師，我可以開始彈〈望春風〉了吧？」'; } }
  ]
};
EV.hao_arrive = {
  p: .1, w: () => S.jobs.studio && S.age >= 25 && fate('hao', .6), npc: 'hao', t: '不想學箏的小豪',
  x: () => '小豪八歲，是被媽媽拖進教室的。第一堂課，他把雁柱一根一根推倒；第二堂課，他在義甲上畫了骷髏頭。<br>他媽媽說：「老師，拜託，他在家只會打電動。」',
  ch: [
    { t: '問他最喜歡哪一款遊戲的配樂', h: '好感↑', fx: () => { S.flags.hao = 1; rel('hao', 15); S.students++; S.taught++; return '你花三堂課把那首配樂扒成箏譜。小豪第一次從頭彈到尾，轉頭問你：「下一首可以彈魔王關的嗎？」'; } },
    { t: '先把規矩說清楚，照進度教', h: '基本功紮實', fx: () => { S.flags.hao = 2; rel('hao', -5); S.students++; S.taught++; return '小豪噘著嘴，把雁柱一根一根排回去。三個月後，他的托抹勾是全班最穩的，但上課時從來不笑。'; } }
  ],
  pre: () => { meet('hao'); S.flags.haoAge = S.age; }
};
EV.hao_grow = {
  prio: 20, w: () => S.flags.hao && S.age >= S.flags.haoAge + 6 && !S.done.hao_grow, npc: 'hao', t: '小豪的消息',
  auto: () => {
    if (S.flags.hao === 1) { rel('hao', 10); add('passion', 8); return '小豪上國中後加入國樂社，現在是箏首席。他寄來一支影片：成果發表會上，他用箏彈了一整組遊戲配樂，最後一首，是當年你幫他扒的那首。'; }
    if ((S.rel.hao || 0) >= 35) { add('passion', 5); return '小豪考上了國中音樂班。他媽媽傳訊息來：「他說，是老師的規矩救了他的手。」'; }
    add('mood', -3); return '小豪升上國中就沒有再來了。有一天你在捷運上看見他，耳機裡傳出來的，好像是箏的聲音。';
  }
};
EV.studio_online = {
  p: .06, w: () => S.jobs.studio && S.age >= 26, npc: () => S.yun ? 'yun' : 'mom', t: '海外的來信',
  x: () => '一位住在溫哥華的媽媽寫信來：「這裡找不到古箏老師，可以線上上課嗎？」你盯著手機，想著鏡頭要架在哪裡才拍得到左手。',
  ch: [
    { t: '架三支鏡頭，開線上班', h: '－NT$ 3 萬 學生↑ 名氣↑', fx: () => { cash(-30000); const n = ri(3, 6); S.students += n; S.taught += n; add('fame', 3); return `一支拍右手、一支拍左手、一支拍譜。第一個月就有 ${n} 個海外學生，時差最遠的在倫敦。`; } },
    { t: '箏還是要面對面教', h: '', fx: () => { add('music', 1); return '你回信推薦了幾支教學影片，最後附上一句：「回臺灣的時候，來教室坐坐。」'; } }
  ]
};
EV.studio_book = {
  p: .08, w: () => S.jobs.studio && S.taught >= 25, npc: 'mom', t: '寫一本教材',
  x: () => `出版社來問：要不要把你的教學整理成一本兒童古箏教材？你教過 ${S.taught} 個學生，筆記本已經寫滿了五本。`,
  ch: [
    { t: '寫！', h: '樂理↑ 名氣↑', fx: () => { S.flags.book = 1; add('theory', 5); add('fame', 5); cash(80000); return '書名叫《小手托抹勾》，第一頁畫的是一雙纏著膠布的小手。後來好幾間才藝教室都拿它當教材。'; } },
    { t: '先教好眼前的學生', h: '', fx: () => '你把五本筆記本收回抽屜。' }
  ]
};
EV.yun_help = {
  prio: 20, w: () => S.yun && S.yun.age === 19 && S.jobs.studio && !S.done.yun_help, npc: 'yun', t: '小芸回來當助教',
  x: () => `小芸${S.yun.uni ? '讀中國音樂學系' : '上大學'}了，暑假回到教室：「老師，我可以來幫忙嗎？我想學怎麼教小朋友。」`,
  ch: [
    { t: '讓她帶初級班', h: '學生↑', fx: () => { rel('yun', 10); S.students += 2; S.taught += 2; return '小芸蹲下來幫小朋友纏膠布的樣子，跟你一模一樣。'; } },
    { t: '先讓她在旁邊看一學期', h: '', fx: () => { rel('yun', 5); S.yun.lv += 4; return '小芸在筆記本上，寫滿了你上課時說過的話。'; } }
  ]
};

// ---- 學校與大學 ----
EV.school_band = {
  s: 3, prio: 35, rep: 2, w: () => S.jobs.schoolT, npc: 'mom', t: '學校國樂團比賽',
  x: () => '你帶的學校國樂團要參加全國學生音樂比賽的國樂合奏。笛子組有兩個人感冒，打擊組的鼓棒斷了一支。',
  ch: [
    { t: '每天放學留下來帶團練', h: '健康－ 心情－', fx: () => { add('health', -4); add('mood', -3); return schoolBand(6); } },
    { t: '讓學生自己決定曲目', h: '熱忱↑', fx: () => { add('passion', 3); return schoolBand(0); } }
  ]
};
function schoolBand(b) {
  unlock('nsmc');
  const sc = S.st.music * .6 + S.st.theory * .3 + ri(-8, 8) + b;
  if (sc >= 50) { const g = sc >= 60 ? '特優' : '優等'; S.flags.bandAward = 1; award(`全國學生音樂比賽　國中團體 B 組國樂合奏　${g}（指導老師）`, 3); face('happy'); return `宣布「${g}」的時候，全團尖叫。你握著指揮棒的手還在抖。`; }
  return '成績甲等。回程的遊覽車上，學生們唱了一路的歌。你覺得這樣也很好。';
}
EV.school_cut = {
  p: .1, w: () => S.jobs.schoolT, npc: 'mom', t: '國樂團要停了？',
  x: () => '校務會議上，總務主任說：「明年經費不夠，國樂團的樂器維修費要先砍。」好幾個學生在走廊等你的消息。',
  ch: [
    { t: '寫計畫申請補助', h: '看樂理＋學業', fx: () => { if (S.st.theory * .5 + S.st.study * .5 + ri(-8, 8) >= 42) { add('passion', 6); face('happy'); return '你熬了三個週末寫計畫。補助下來了，還多了一筆錢可以換新的箏弦。'; } add('mood', -6); cash(-20000); return '計畫沒通過。這學期的維修費，你自己掏了一部分。'; } },
    { t: '辦一場募款音樂會', h: '看名氣', fx: () => { if (S.st.fame + ri(-8, 8) >= 25) { add('fame', 3); add('passion', 5); return '家長、校友、社區的阿伯阿嬤都來了。樂團保住了，還多買了兩台箏。'; } add('mood', -4); cash(-20000); return '來的人不多。你和幾位家長一起把缺的錢補上了。'; } }
  ]
};
EV.school_poor = {
  p: .1, w: () => S.jobs.schoolT || S.jobs.sub, npc: 'mom', t: '放學後的箏聲',
  x: () => '每天放學後，音樂教室都會傳出箏聲。是一個國一的學生，沒參加國樂社，每天偷偷來彈學校那台舊箏。「我們家沒有錢學這個。」',
  ch: [
    { t: '每週留一個下午免費教', h: '熱忱↑ 健康－', fx: () => { add('passion', 8); add('health', -2); S.taught++; return '這孩子學得比誰都快。學期末，第一次在國樂社的成果發表會上了台。'; } },
    { t: '把學校的舊箏借回家練', h: '熱忱↑', fx: () => { add('passion', 5); S.taught++; return '孩子一個人扛著箏走了二十分鐘回家。隔天跑來說：「我媽聽了一整晚。」'; } }
  ]
};
EV.sub_life = {
  p: .4, rep: 2, w: () => S.jobs.sub && !S.jobs.schoolT, npc: 'mom', t: '又換了一間學校',
  x: () => `代理合約又到期了。今年你要去${pick(['山上的國中', '海邊的國中', '市區的明星國中', '只有六個班的小國中'])}。辦公桌、學生、國樂社，全部重新開始。`,
  ch: [{ t: '收拾紙箱', h: '', fx: () => { add('mood', -2); add('music', 1); return pick(['新學校的國樂社只有三個人。你把自己的箏搬了過去。', '開學第一天，有學生問：「老師，你明年還會在嗎？」你不知道怎麼回答。', '你把前一間學校學生寫的卡片，貼在新辦公桌的抽屜裡。']); } }]
};
EV.lecturer_run = {
  p: .12, w: () => S.jobs.lecturer && !S.jobs.prof, npc: 'xu', t: '兼任講師的一週',
  x: () => '星期一在臺北、星期三在臺中、星期五在臺南。一學期下來，你在高鐵上改的作業比在家裡多。',
  ch: [
    { t: '繼續跑，這是在累積', h: '名氣↑ 健康－', fx: () => { add('fame', 3); add('health', -3); add('theory', 2); return '期末考，有一個學生彈得讓你起雞皮疙瘩。回程的高鐵上，你一直想著那段揉弦。'; } },
    { t: '少接一間，多收私人學生', h: '開始教箏', fx: () => { job('studio', 1); S.students = Math.max(S.students, 3); return '你在家裡開了小班。晚上，終於有時間練自己的琴。'; } }
  ]
};
EV.prof_promo = {
  p: .15, rep: 2, w: () => S.jobs.prof && !S.flags.fullProf, npc: 'xu', t: '升等教授',
  x: () => '升等教授的資料堆了半張桌子：論文、演出紀錄、教學評量，還有指導學生的成果。',
  ch: [{ t: '送出升等', h: '樂理＋名氣', fx: () => { if (S.st.theory * .5 + S.st.fame * .4 + S.recitals * 2 + ri(-8, 8) >= 52) { S.flags.fullProf = 1; cert('教授證書'); add('passion', 6); face('happy'); return '升等通過了。你打電話告訴許教授，他只說：「好。那你要開始想，下一個坐在你位子上的是誰。」'; } add('mood', -5); return '外審意見寫著「研究成果不足」。你把意見書看了三遍，打開一個新的論文檔案。'; } }]
};
EV.prof_alumni = {
  p: .12, w: () => (S.jobs.prof || S.jobs.lecturer) && S.age >= 38, npc: 'xu', t: '學生考上樂團了',
  x: () => '你教過的學生傳訊息來：「老師！我考上國樂團了！」後面接著十個哭臉。',
  ch: [{ t: '打電話過去', h: '熱忱↑', fx: () => { add('passion', 8); S.taught++; return `電話那頭在哭，你也是。你想起自己${S.ever.orchestra ? '第一次接到樂團電話的那一天' : '當年一張一張看招考公告的日子'}。`; } }]
};

// ================= 網路與街頭 =================
EV.viral = {
  npc: 'kai', t: '影片爆紅了',
  x: () => `你上傳的古箏版${pick(['動畫主題曲', '流行情歌', '電玩配樂', '搖滾名曲'])}，一夜之間衝上一百萬次觀看。留言區有一萬則留言。`,
  ch: [
    { t: '趁勢多拍幾支', h: '名氣↑↑', fx: () => { S.flags.viral = 1; add('fame', 14); add('passion', 4); return '訂閱數翻了十倍。開始有人在你的直播裡問：「古箏去哪裡學？」'; } },
    { t: '回去彈傳統曲', h: '樂感↑', fx: () => { S.flags.viral = 1; add('fame', 6); add('music', 3); return '你接著上傳了一支〈寒鴉戲水〉。觀看數少了很多，但留言都很溫暖。'; } }
  ]
};
EV.troll = {
  p: .08, rep: 3, w: () => S.flags.viral || S.st.fame >= 35, npc: 'kai', t: '酸民留言',
  x: () => '留言區出現一則：「古箏彈流行歌，不倫不類。」按讚數比你的影片還多。',
  ch: [
    { t: '認真回一篇長文', h: '名氣↑ 心情↓', fx: () => { add('fame', 3); add('mood', -4); return '你寫了箏從民間音樂走到現代舞台的歷史。那則回覆被置頂了。'; } },
    { t: '關掉手機去練琴', h: '心情↑', fx: () => { add('mood', 3); add('tech', 2); return '阿凱傳訊息說：「酸民不會彈箏。」你笑了。'; } }
  ]
};
EV.busker = {
  p: .1, w: () => S.age >= 20 && !S.student && S.st.tech >= 35 && !S.flags.busker, npc: () => S.met.mei ? 'mei' : 'kai', t: '街頭藝人審議',
  x: () => '縣市文化局在辦街頭藝人審議。通過的話，就能拿到展演許可證，在指定地點表演。',
  ch: [
    { t: '報名審議', h: '技巧', fx: () => { unlock('busker'); if (S.st.tech + ri(-6, 6) >= 38) { S.flags.busker = 1; cert('街頭藝人展演許可證'); add('fame', 3); return '你通過了！行程表的「接演出」可以去街頭表演了。'; } return '這次沒過。評審說：「表演很好，但跟觀眾的互動可以再多一點。」'; } },
    { t: '不了', h: '', fx: () => '箏太重了，你還沒想好怎麼搬。' }
  ]
};

// ================= 生活 =================
EV.injury = {
  prio: 80, w: () => S.st.health < 28 && !S.injured, npc: 'mom', t: '手腕痛',
  x: () => '你的右手腕從上個月開始痛，現在連拿筷子都痛。醫生說是腱鞘炎：「至少休息半年，不能再這樣練了。」',
  ch: [
    { t: '乖乖休息、做復健', h: '一年不能練琴', fx: () => { S.injured = 1; add('health', 18); add('tech', -4); add('mood', -6); return '你把義甲收進盒子裡。這一年，你學會了用耳朵練琴：聽錄音、看譜、在心裡彈。'; } },
    { t: '貼著痠痛貼布繼續練', h: '很危險', fx: () => { S.injured = 2; add('health', -6); add('tech', -8); add('passion', -8); face('sad'); return '三個月後手痛到完全不能動。你被迫休息了兩年。'; } }
  ]
};
EV.doubt = {
  prio: 75, rep: 4, w: () => S.st.passion < 22 && S.st.passion > 0, npc: () => S.met.chen ? 'chen' : 'mom', t: '你還喜歡彈箏嗎？',
  x: () => '你已經好幾個禮拜沒有打開琴袋了。看到箏，心裡只有「應該要練」的壓力。',
  ch: [
    { t: '去聽一場音樂會', h: '熱忱↑', fx: () => { add('passion', 14); add('music', 2); return '台上的人彈的是你小時候練過的曲子。散場時你在想：原來它可以這麼好聽。'; } },
    { t: '只彈自己喜歡的歌', h: '心情↑', fx: () => { add('passion', 10); add('mood', 8); return '你彈了一首動畫歌，沒有譜，自己扒的。很久沒有這麼開心了。'; } },
    { t: '休息一陣子', h: '', fx: () => { add('mood', 10); add('passion', 4); return '你把箏蓋上布，讓它也休息一下。'; } }
  ]
};
EV.quit = {
  prio: 99, w: () => S.st.passion <= 0, npc: 'mom', t: '把箏收起來',
  x: () => '你把雁柱一根一根拔下來，收進盒子裡。琴袋拉鍊拉上的聲音，比想像中還響。',
  ch: [
    { t: '就這樣吧', h: '結束這一段箏途', fx: () => { S.ended = true; S.endReason = 'quit'; return '那台箏被放到衣櫃最上層。'; } },
    { t: '再給自己一次機會', h: '熱忱回到 20', fx: () => { S.st.passion = 20; add('mood', 10); return '拉鍊拉到一半，你又打開了。你彈了一個低音 D，就像六歲那天一樣。'; } }
  ]
};
EV.zheng_buy = {
  p: .1, w: () => !S.flags.goodZheng && S.money >= 150000 && S.age >= 20, npc: () => S.major ? 'xu' : 'chen', t: '換一台演奏箏',
  x: () => '樂器行來了一批名家製作的演奏箏，梧桐木面板，音色又亮又透。標價 NT$ 12 萬。',
  ch: [
    { t: '買下來', h: '－NT$ 12 萬，演出更穩', fx: () => { cash(-120000); S.flags.goodZheng = 1; add('passion', 6); add('music', 3); return '新箏搬回家的那晚，你彈到半夜，捨不得停。'; } },
    { t: '舊箏還可以', h: '', fx: () => '你摸了摸舊箏的琴頭，那裡有你十歲時不小心撞出來的凹痕。' }
  ]
};
EV.string_break = {
  p: .05, rep: 3, w: () => S.age >= 10, npc: () => S.met.chen ? 'chen' : 'mom', t: '演出前斷弦',
  x: () => '演出前十分鐘，「啪」一聲，第七弦斷了。',
  ch: [
    { t: '衝去後台換弦', h: '看技巧', fx: () => { unlock('strings'); if (S.st.tech >= 40) return '你在五分鐘內穿好弦、調好音，上台時手還在抖，但一個音都沒錯。'; add('mood', -4); return '弦換好了，音卻一直往下掉。整場你都在偷偷用左手按音救援。'; } },
    { t: '移雁柱，用別的弦借音', h: '看樂感', fx: () => { unlock('strings'); if (S.st.music >= 45) { add('fame', 2); return '你臨時改了幾個指法，觀眾完全沒發現。'; } add('mood', -3); return '有一句旋律怎麼樣都湊不出來，你只好跳過。'; } }
  ]
};
EV.typhoon = {
  s: 1, p: .08, rep: 3, w: () => S.age >= 18 && !S.student, npc: 'kai', t: '颱風天',
  auto: () => { add('mood', -2); return '颱風來了，週末的戶外演出取消。你在家彈了一整晚〈戰台風〉的開頭，窗外的風聲幫你伴奏。'; }
};
EV.love = {
  p: .06, w: () => S.age >= 21 && S.age <= 34 && !S.partner, npc: () => 'partner', t: '散場之後',
  pre: () => { const A = R() < .5; S.partner = { n: pick(['子晴', '柏宇', '品妤', '承恩', '宥辰', '語桐']), look: A ? 'partnerA' : 'partnerB', st: 0 }; NPC.partner.n = S.partner.n; },
  x: () => `演出散場後，有人在後台門口等你。「你彈的〈出水蓮〉，讓我想起我外婆家。我叫${S.partner.n}。」`,
  ch: [
    { t: '一起去吃宵夜', h: '心情↑', fx: () => { S.partner.st = 1; meet('partner'); rel('partner', 25); add('mood', 10); return '你們聊到店家打烊。' + S.partner.n + '說不懂音樂，但很喜歡看你講箏的樣子。'; } },
    { t: '道謝，然後回家', h: '', fx: () => { S.partner = null; return '你說了謝謝，背著箏走進夜色。'; } }
  ]
};
EV.marry = {
  p: .15, w: () => S.partner && S.partner.st === 1 && S.age >= 26 && (S.rel.partner || 0) >= 40, npc: 'partner', t: '求婚',
  x: () => `${S.partner.n}把一枚戒指放在你的箏上，就在第一弦的雁柱旁邊。`,
  ch: [
    { t: '「好。」', h: '', fx: () => { S.partner.st = 2; add('mood', 15); add('passion', 5); return '婚禮上，你彈了〈茉莉花〉。媽媽哭得比誰都大聲。'; } },
    { t: '「再等等我。」', h: '', fx: () => { rel('partner', -10); return `${S.partner.n}笑著把戒指收起來：「好，我等你。」`; } }
  ]
};
EV.kid = {
  p: .1, w: () => S.partner && S.partner.st === 2 && !S.kid && S.age <= 42, npc: 'partner', t: '新的家人',
  auto: () => { S.kid = { age: 0 }; add('mood', 12); return '孩子出生了。你在嬰兒床邊輕輕刮了一次箏，孩子停止了哭泣。'; }
};
EV.kid_learn = {
  s: 2, prio: 30, w: () => S.kid && S.kid.age === 6 && !S.done.kid_learn, npc: 'partner', t: '孩子六歲了',
  x: () => '孩子六歲了，常常趴在你的箏旁邊看你教課。',
  ch: [
    { t: '幫孩子纏上膠布', h: '', fx: () => { S.kid.zheng = 1; add('passion', 6); return '「大拇指往外是『托』。」孩子撥了一下最粗的那根弦，「咚——」'; } },
    { t: '讓孩子自己選', h: '', fx: () => { add('mood', 4); return `孩子選了${pick(['街舞', '足球', '畫畫', '小提琴'])}。你笑了：沒關係，箏一直都在。`; } }
  ]
};
EV.mom_ill = {
  p: .12, w: () => S.age >= (S.bg === 'adult' ? 45 : 50) && !S.flags.momIll, npc: 'mom', t: '媽媽住院了',
  x: () => '媽媽住院了。病房很安靜，媽媽說：「好久沒聽你彈琴了。」',
  ch: [
    { t: '把箏搬進病房', h: '', fx: () => { S.flags.momIll = 1; rel('mom', 15); add('passion', 6); return '護理師幫你挪開了床邊的桌子。你彈了〈茉莉花〉，隔壁床的阿嬤也跟著哼。'; } },
    { t: '錄一段影片給媽媽', h: '', fx: () => { S.flags.momIll = 1; rel('mom', 8); return '媽媽把影片設成手機鈴聲。每次電話響，整間病房都是箏聲。'; } }
  ]
};
EV.mom_bye = {
  p: .1, w: () => S.flags.momIll && !S.flags.momGone && S.age >= (S.bg === 'adult' ? 50 : 56), npc: 'mom', t: '告別',
  auto: () => { S.flags.momGone = 1; add('mood', -12); add('passion', 3); return '媽媽走了。整理遺物時，你找到一個信封，裡面是你六歲第一張考級證書的影本，和一卷用了一半的膠布。'; }
};
EV.hands = {
  p: .15, w: () => S.age >= 56 && !S.flags.hands, npc: () => S.met.chen ? 'chen' : 'mom', t: '手指不如從前',
  x: () => '快四點越來越跟不上了。以前一遍就能彈好的段落，現在要練一個禮拜。',
  ch: [
    { t: '改彈慢曲，專心在韻味', h: '樂感↑', fx: () => { S.flags.hands = 1; add('music', 8); add('passion', 4); return '你重新彈〈出水蓮〉。慢下來之後，每一個按音都有了重量。'; } },
    { t: '每天堅持練快四點', h: '健康↓', fx: () => { S.flags.hands = 1; add('tech', 3); add('health', -6); return '你練到手指發熱。速度回來了一點，膝蓋和肩膀卻開始抗議。'; } }
  ]
};
EV.an_return = {
  p: .1, w: () => S.met.an && S.age >= 38 && !S.flags.anBack, npc: 'an', t: '林以安的消息',
  x: () => S.flags.anQuit ? '林以安傳訊息給你：「我在醫院成立了一個國樂社，大家都是醫生跟護理師。你要不要來當指導老師？」' : '林以安約你吃飯：「我們合辦一場雙箏音樂會吧，就叫『當年的對手』。」',
  ch: [
    { t: '答應！', h: '名氣↑ 心情↑', fx: () => { S.flags.anBack = 1; rel('an', 15); add('fame', 4); add('mood', 8); return '你們在台上相視而笑。謝幕的時候，林以安小聲說：「輸的人請珍奶。」'; } },
    { t: '最近太忙了', h: '', fx: () => { S.flags.anBack = 1; return '你們約好「下次一定」。'; } }
  ]
};
EV.kai_work = {
  p: .1, w: () => S.met.kai && S.age >= 26 && (S.rel.kai || 0) >= 50 && !S.pieces.includes('esy'), npc: 'kai', t: '阿凱的新曲',
  x: () => '阿凱現在是作曲家了。他把一疊手寫譜放在你面前：「〈二十一弦〉。寫給你的，用上了每一根弦。」',
  ch: [{ t: '收下譜，開始練', h: '新曲目', fx: () => { learn('esy'); add('music', 5); add('passion', 8); rel('kai', 8); return '你翻到最後一頁，上面寫著：「給那個在社團教室刮奏的人。」'; } }]
};
EV.retire = {
  s: 2, prio: 40, w: () => S.age === 64 && (S.jobs.orchestra || S.jobs.schoolT || S.jobs.prof || S.jobs.office), npc: () => S.jobs.orchestra ? 'huang' : 'mom', t: '退休',
  auto: () => { const was = S.jobs.orchestra ? '樂團' : S.jobs.schoolT ? '學校' : S.jobs.prof ? '系上' : '公司'; ['orchestra', 'schoolT', 'prof', 'office', 'principal'].forEach(k => job(k, 0)); add('mood', 6); return `${was}為你辦了退休歡送會。你把工作的鑰匙交出去，箏還是留在身邊。`; }
};
EV.final = {
  s: 3, prio: 100, w: () => S.age >= END_AGE, npc: () => S.flags.legacy ? 'yun' : (S.partner && S.partner.st === 2 ? 'partner' : 'mom'), t: '最後一次上台',
  x: () => '有人邀你在年底的音樂會彈一首。主持人問：「這一首，對你來說是什麼？」',
  ch: () => {
    const list = topPieces(3);
    const mlh = PIECES.find(p => p.id === 'mlh');
    if (S.pieces.includes('mlh') && !list.includes(mlh)) list.push(mlh);
    return list.map(p => ({ t: `〈${p.n}〉`, h: p.sch, fx: () => { S.ended = true; S.endReason = 'life'; S.lastPiece = p.n; return `你彈了〈${p.n}〉。最後一個音停下來的時候，觀眾等了很久才鼓掌。`; } }));
  }
};
