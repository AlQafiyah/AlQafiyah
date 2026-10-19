'use strict';
/* سِجال: اللعب الفردي، ألعاب الأصدقاء، والبطولات المنفصلة عن التصنيف. */
document.addEventListener('DOMContentLoaded', () => {
 const db=window.supabaseClient,$=id=>document.getElementById(id);
 const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
 const types={quiz:'أسئلة الأدب',complete:'أكمل البيت',speaker:'من القائل',guesspoet:'خمن الشاعر',truefalse:'صح أو خطأ',riddle:'ألغاز القافية'};
 const icons={quiz:'<path d="M8 7h12M8 12h9M8 17h7M4 7h.01M4 12h.01M4 17h.01"/>',complete:'<path d="M4 7h16M4 12h9M4 17h12m3 0h5"/>',speaker:'<path d="M4 8h16v10H9l-5 4zM8 12h8"/>',guesspoet:'<circle cx="12" cy="7" r="4"/><path d="M5 22a7 7 0 0 1 14 0"/>',truefalse:'<path d="m3 12 5 5L21 4M3 4h6M15 20h6"/>',riddle:'<path d="M9 9a3 3 0 1 1 4.5 2.6C12 12.6 12 13 12 15M12 19h.01"/>'};
 const illustrations={
  quiz:'<path d="M40 65h100v99H40zM60 88h60M60 108h45M60 130h37"/><path d="M145 72q22-31 36-12 6 14-20 28m-10 2-11 14 5-22"/><circle cx="165" cy="135" r="22"/><path d="M165 121v28m-14-14h28"/>',
  complete:'<path d="M38 150l94-100 22 21-94 100-33 7zM116 66l22 20"/><path d="M71 171q58-14 98-4M166 48q23 22 13 48"/><path d="M84 95h66M91 113h51"/>',
  speaker:'<path d="M51 57h128v81H99l-32 27v-27H51z"/><path d="M77 85h72M77 104h48"/><path d="m154 89 10 14-12 14"/>',
  guesspoet:'<circle cx="119" cy="83" r="29"/><path d="M73 164c2-49 91-49 95 0M103 81q16 22 33 0M87 49q33-40 67 0"/><path d="M43 55l6-11m-6 29-10 4m151-23 9-9m0 28 11 6"/>',
  truefalse:'<circle cx="83" cy="105" r="49"/><path d="m57 102 18 19 39-47"/><circle cx="167" cy="76" r="31"/><path d="m155 62 24 28m0-28-24 28"/>',
  riddle:'<path d="M90 83c-7-53 78-50 77-2 0 22-34 28-34 48M132 159h.5"/><path d="M76 46l-20-17m5 69H33m50 46-20 18m132-111 19-15m-5 68h17"/><path d="M88 186h85"/>'
 };
 const artSvg=k=>`<svg viewBox="0 0 240 210" fill="none" stroke="currentColor" stroke-width="3.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${illustrations[k]||illustrations.quiz}</svg>`;
 const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[k]||icons.quiz}</svg>`;
 const show=(id,on)=>{if($(id))$(id).hidden=!on;};
 const info=(message,error=false)=>{const el=$('sjNotice');el.textContent=message||'';el.hidden=!message;el.classList.toggle('error',error);};
 const jump=id=>$(id)?.scrollIntoView({behavior:'smooth',block:'start'});
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 let games=[],questions=[],chosen=new Set(),mode='solo',user=null,round=null,tournament=null,settings={enabled:true,leaderboard_enabled:true},serverSeen=new Set(),history=new Set();
 const historyKey=()=>`qafiyah_sijal_seen_v2_${user?.id||'guest'}`;
 function loadHistory(){try{const ids=JSON.parse(localStorage.getItem(historyKey())||'[]');history=new Set(Array.isArray(ids)?ids.slice(-10000):[]);}catch{history=new Set();}}
 function saveHistory(){try{localStorage.setItem(historyKey(),JSON.stringify([...history].slice(-10000)));}catch{/* Private browsing may deny storage. */}}
 function rememberQuestion(id){history.add(id);saveHistory();if(mode==='solo'&&user)serverSeen.add(id);}
 function poolForRound(maxCount,requirePairs=false){
  const pool=questions.filter(q=>chosen.has(q.challenge_id));if(!pool.length)return [];
  // Do not repeat a question until all questions in the selected pool have been shown.
  // Score eligibility is always verified server-side (this client history is UX only).
  let available=pool.filter(q=>!history.has(q.id)&&!serverSeen.has(q.id));
  if(!available.length){
   for(const q of pool){history.delete(q.id);serverSeen.delete(q.id);}
   saveHistory();available=[...pool];
  }
  const size=Math.min(pool.length,Number.isFinite(maxCount)?Math.max(1,maxCount):pool.length);
  let result=shuffle([...available]).slice(0,size);
  if(requirePairs&&result.length%2){
   if(result.length>=3){
    // Keep the unused question for the next match in this cycle.
    result.pop();
   }else if(pool.length>=2){
    // The final never-seen question must be played before a new cycle starts.
    // Include one previously seen question, without repeating within this match.
    const second=shuffle(pool.filter(q=>q.id!==result[0].id))[0];
    result.push(second);
   }
  }
  return result;
 }
 const sections={play:'sjViewPlay',ranking:'sjViewRanking',guide:'sjViewGuide'};
 function switchTab(key){if(key==='ranking'&&!settings.leaderboard_enabled)return;
  for(const [tab,id] of Object.entries(sections))show(id,tab===key);show('sjRound',false);
  document.querySelectorAll('[data-sj-tab]').forEach(button=>{const active=button.dataset.sjTab===key;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
  if(key==='ranking')refreshRanking();
 }
 function chooseMode(next){if(round)return;mode=next;tournament=null;document.body.dataset.sjMode=next;
  document.querySelectorAll('[data-sj-entry]').forEach(button=>{const on=button.dataset.sjEntry===mode;button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on));});
  const titles={solo:['اللعب الفردي','اختر الألعاب واضغط ابدأ؛ تُحتسب نقاطك المعتمدة في تصنيف الأفراد فقط.'],teams:['إنشاء لعبة جماعية','سمِّ فريقين أو ثلاثة أو أربعة، ويمكنك تفصيل أسماء اللاعبين إن أحببت.'],tournament:['إنشاء بطولة','سمِّ البطولة وأضف من ٤ إلى ١٦ فريقاً؛ يتأهل الفائز من كل مواجهة.']};
  $('sjModeTitle').textContent=titles[mode][0];$('sjModeDescription').textContent=titles[mode][1];
  show('sjTeamSetup',mode==='teams');show('sjTournamentSetup',mode==='tournament');
  $('sjStart').querySelector('span').textContent=mode==='solo'?'ابدأ اللعب':mode==='teams'?'إنشاء اللعبة':'إنشاء البطولة';
  updateSelection();
 }
 const countFor=id=>questions.filter(q=>q.challenge_id===id).length;
 function updateSelection(){const selected=games.filter(g=>chosen.has(g.id)&&countFor(g.id));$('sjSelectedSummary').textContent=selected.length?`اخترت ${selected.length.toLocaleString('ar-SA')} ${selected.length===1?'لعبة':'ألعاب'} · يمكنك التغيير قبل البدء.`:'اختر لعبة واحدة على الأقل للمتابعة.';
  const available=games.filter(g=>countFor(g.id)),all=available.length&&available.every(g=>chosen.has(g.id));$('sjSelectAll').textContent=all?'إلغاء التحديد':'تحديد الكل';$('sjStart').disabled=!selected.length;
 }
 function renderGames(){const term=$('sjSearchGames').value.trim().toLocaleLowerCase('ar'),cat=$('sjCategoryFilter').value,box=$('sjGameCards');box.replaceChildren();
  for(const g of games){const count=countFor(g.id);if(cat&&g.category!==cat)continue;
   if(term&&!`${g.title} ${g.description||''} ${g.category||''} ${types[g.kind]||''}`.toLocaleLowerCase('ar').includes(term))continue;
   const label=make('label','sj-game sj-art-'+(g.kind in icons?g.kind:'quiz')),
    input=make('input'),card=make('span','sj-game-card'),art=make('span','sj-game-art'),graphic=make('span','sj-art-graphic'),
    tick=make('span','sj-tick');input.type='checkbox';input.checked=chosen.has(g.id);input.disabled=count===0;tick.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="m4 12 5 5L20 6"/></svg>';graphic.innerHTML=artSvg(g.kind);art.append(graphic,tick);
   const words=make('span','sj-game-words');words.append(make('strong','sj-game-title',g.title),make('span','sj-game-desc',g.description||types[g.kind]||'الشعر والأدب'),make('span','sj-game-meta',`${count} سؤال · ${g.category||'الأدب العربي'}`));
   card.append(art,words);label.append(input,card);input.addEventListener('change',()=>{if(input.checked)chosen.add(g.id);else chosen.delete(g.id);updateSelection();});box.append(label);
  }
  if(!box.childElementCount)box.append(make('p','sj-small-note','لا توجد ألعاب مطابقة لبحثك.'));
  updateSelection();
 }
 function createPlayerInput(value=''){const row=make('div','sj-player-row'),input=make('input','sj-field sj-player-input'),add=make('button','sj-add-player'),remove=make('button','sj-remove-player');input.type='text';input.maxLength=55;input.placeholder='اسم اللاعب';input.value=value;add.type=remove.type='button';add.textContent='+';add.setAttribute('aria-label','إضافة لاعب جديد');remove.textContent='−';remove.setAttribute('aria-label','حذف اللاعب');
  add.onclick=()=>{if(row.parentElement.children.length>=12)return info('الحد الأقصى ١٢ لاعباً في الفريق.',true);const next=createPlayerInput();row.after(next);next.querySelector('input').focus();};
  remove.onclick=()=>{if(row.parentElement.children.length>1)row.remove();else input.value='';};row.append(input,add,remove);return row;
 }
 function renderTeams(){const host=$('sjTeamFields'),count=Number($('sjTeamCount').value),detailed=$('sjDetailedPlayers').checked;
  const previous=[...host.querySelectorAll('.sj-team-unit')].map(el=>({name:el.querySelector('.sj-team-name')?.value||'',players:[...el.querySelectorAll('.sj-player-input')].map(x=>x.value)}));host.replaceChildren();
  for(let i=0;i<count;i++){const field=make('div','sj-team-unit'),nameLabel=make('label',null,`الفريق ${i+1}`),name=make('input','sj-field sj-team-name');name.type='text';name.maxLength=45;name.value=previous[i]?.name||`الفريق ${i+1}`;name.required=true;nameLabel.append(name);field.append(nameLabel);
   if(detailed){field.append(make('p','sj-team-player-label','أسماء اللاعبين (اختياري)'));const players=make('div','sj-player-list');(previous[i]?.players?.length?previous[i].players:['']).forEach(value=>players.append(createPlayerInput(value)));field.append(players);}
   host.append(field);
  }
 }
 function renderTournamentTeams(){const host=$('sjTournamentFields'),old=[...host.querySelectorAll('input')].map(x=>x.value),count=Number($('sjTournamentCount').value);host.replaceChildren();
  for(let i=0;i<count;i++){const field=make('label','sj-tournament-team',`الفريق ${i+1}`),input=make('input','sj-field sj-tournament-name');input.type='text';input.maxLength=45;input.value=old[i]||`الفريق ${i+1}`;input.required=true;field.append(input);host.append(field);}
 }
 function getGroupTeams(){const units=[...document.querySelectorAll('.sj-team-unit')];const teams=units.map((box,i)=>({id:i,name:box.querySelector('.sj-team-name').value.trim(),players:[...box.querySelectorAll('.sj-player-input')].map(el=>el.value.trim()).filter(Boolean),score:0}));
  if(teams.length<2||teams.length>4||teams.some(t=>t.name.length<2))throw Error('أدخل أسماء فريقين إلى أربعة فرق بشكل صحيح.');
  if(new Set(teams.map(t=>t.name.toLocaleLowerCase('ar'))).size!==teams.length)throw Error('أسماء الفرق يجب أن تكون مختلفة.');
  return teams;
 }
 function getTournamentTeams(){const teams=[...document.querySelectorAll('.sj-tournament-name')].map((x,i)=>({id:i,name:x.value.trim(),players:[],score:0}));
  if(teams.some(t=>t.name.length<2))throw Error('اكتب اسماً من حرفين على الأقل لكل فريق.');
  if(new Set(teams.map(t=>t.name.toLocaleLowerCase('ar'))).size!==teams.length)throw Error('أسماء فرق البطولة يجب أن تكون مختلفة.');
  return teams;
 }
 function startPlay(){info('');if(round)return;
  if(!chosen.size)return info('اختر لعبة واحدة على الأقل.',true);
  if(!questions.some(q=>chosen.has(q.challenge_id)))return info('لا توجد أسئلة متاحة في الألعاب المختارة.',true);
  try{
   if(mode==='tournament'){const name=$('sjTournamentName').value.trim();if(name.length<2)throw Error('اكتب اسم البطولة أولاً.');tournament={name,stage:1,entrants:getTournamentTeams(),slots:[],index:0,completed:[]};
    if(questions.filter(q=>chosen.has(q.challenge_id)).length<2)throw Error('البطولة تحتاج إلى سؤالين مختلفين على الأقل.');
    startTournamentStage();return;
   }
   const teams=mode==='teams'?getGroupTeams():[];
   const limit=mode==='solo'?10:Number($('sjQuestionLimit').value)||10;
   beginRound(mode==='solo'?'solo':'teams',teams,limit);
  }catch(e){info(e.message,true);}
 }
 function beginRound(kind,teams,limit){const pool=poolForRound(limit,kind==='tournament');if(!pool.length)throw Error('لا توجد أسئلة متاحة الآن.');
  // A match should have an equal number of questions for each team whenever possible.
  if(!pool.length)throw Error('يلزم سؤالان مختلفان على الأقل لبدء المباراة.');
  round={kind,pool,index:0,teams,score:0,busy:false,answered:false,session:null,completed:false};
  show('sjViewPlay',false);show('sjViewRanking',false);show('sjViewGuide',false);show('sjRound',true);renderQuestion();jump('sjRound');
  if(kind==='solo'&&user){const current=round;db.rpc('qafiyah_sijal_start_session').then(({data,error})=>{if(!error&&data){current.session=data;if(current.completed)Promise.resolve(db.rpc('qafiyah_sijal_finish_session',{p_session:data})).catch(()=>{});}}).catch(()=>{});}
 }
 // Bracket supports any number from 4 to 16: a bye advances directly, without a fake match.
 function startTournamentStage(){if(!tournament)return;
  const entrants=tournament.entrants;if(entrants.length===1){renderChampion(entrants[0]);return;}
  const power=2**Math.ceil(Math.log2(entrants.length)),byes=power-entrants.length;
  tournament.slots=entrants.slice(0,byes).map(team=>({winner:team,pair:null}));
  for(let i=byes;i<entrants.length;i+=2)tournament.slots.push({winner:null,pair:[entrants[i],entrants[i+1]]});
  tournament.index=0;startNextMatch();
 }
 function startNextMatch(){const next=tournament.slots.findIndex(x=>x.pair&&!x.winner);
  if(next<0){const winners=tournament.slots.map(x=>x.winner);tournament.completed.push({stage:tournament.stage,teams:winners.map(x=>x.name)});tournament.entrants=winners;tournament.stage++;startTournamentStage();return;}
  tournament.index=next;const pair=tournament.slots[next].pair.map(t=>({...t,score:0}));beginRound('tournament',pair,Number($('sjTournamentLimit').value)||10);
 }
 const safeMedia=url=>{try{const u=new URL(url,location.href);return u.protocol==='https:'||u.origin===location.origin?u.href:null;}catch{return null;}};
 function appendMedia(q,card){const src=q.media_url&&safeMedia(q.media_url);if(!src||!['image','audio','video'].includes(q.media_type))return;
  const el=make({image:'img',audio:'audio',video:'video'}[q.media_type],'sj-question-media');el.src=src;
  if(q.media_type==='image'){el.alt=q.media_caption||'صورة السؤال';el.loading='lazy';}else{el.controls=true;el.preload='none';}card.append(el);
  if(q.media_caption)card.append(make('p','sj-small-note',q.media_caption));
 }
 const activeIndex=()=>round.index%round.teams.length;
 function turnLabel(){if(round.kind==='solo')return '';
  const team=round.teams[activeIndex()];if(round.kind==='tournament')return `بطولة ${tournament.name} · الدور ${tournament.stage} · ${team.name}`;
  if(team.players?.length){const turns=Math.floor(round.index/round.teams.length);return `دور ${team.name} — اللاعب ${team.players[turns%team.players.length]}`;}
  return `دور ${team.name}`;
 }
 function drawScores(){const host=$('sjTeamScores');host.replaceChildren();if(round.kind==='solo'){$('sjTotalScore').textContent=`${round.score} نقطة`;return;}
  $('sjTotalScore').textContent=round.kind==='tournament'?`بطولة ${tournament.name}`:'نتائج الفرق';
  round.teams.forEach((team,i)=>{const card=make('div','sj-team-score'+(i===activeIndex()?' active':''));card.append(make('strong',null,team.name),make('small','sj-score-value',`${team.score} نقطة`));
   const control=make('div','sj-score-actions');for(const [sign,change,label] of [['+',10,'إضافة عشر نقاط'],['−',-10,'خصم عشر نقاط']]){const b=make('button','sj-score-manual',sign);b.type='button';b.title=label; b.setAttribute('aria-label',`${label} لفريق ${team.name}`);
    b.addEventListener('click',()=>{team.score=Math.max(0,team.score+change);drawScores();});control.append(b);}card.append(control);host.append(card);
  });
 }
 function renderQuestion(){const q=round?.pool[round.index];if(!q){finishRound();return;}
  round.busy=false;round.answered=false;const game=games.find(g=>g.id===q.challenge_id);
  $('sjCounter').textContent=`السؤال ${round.index+1} من ${round.pool.length}`;
  $('sjProgressFill').style.width=`${Math.round(round.index/round.pool.length*100)}%`;
  $('sjTurnLabel').textContent=turnLabel();drawScores();
  const card=make('article','sj-question-card');card.append(make('span','sj-question-kind',game?.title||types.quiz),make('h2',null,q.question_text));appendMedia(q,card);
  const opts=make('div','sj-options');(Array.isArray(q.options)?q.options:[]).forEach((value,i)=>{const b=make('button','sj-option');b.type='button';b.append(make('strong',null,String(i+1)),make('span',null,value));b.onclick=()=>answer(i);opts.append(b);});card.append(opts);
  const result=make('div','sj-response');result.id='sjResponse';result.hidden=true;result.setAttribute('aria-live','polite');card.append(result);$('sjQuestionHost').replaceChildren(card);
 }
 async function answer(index){if(!round||round.busy||round.answered)return;
  round.busy=true;info('');const current=round,q=current.pool[current.index];let verdict,extra='';
  try{
   if(current.kind==='solo'&&user){let res=await db.rpc('qafiyah_submit_game_answer',{p_question:q.id,p_index:index});
    if(res.error&&/من قبل|سبق/.test(res.error.message)){res=await db.rpc('qafiyah_sijal_check_answer',{p_question:q.id,p_index:index});if(res.error)throw Error(res.error.message);verdict={...res.data,points:0};extra='سبق احتساب هذا السؤال؛ يمكنك الاستمرار للتدرب.';}
    else if(res.error)throw Error(res.error.message);else verdict=res.data;
   }else{const res=await db.rpc('qafiyah_sijal_check_answer',{p_question:q.id,p_index:index});if(res.error)throw Error(res.error.message);verdict=res.data;}
   if(round!==current)return;current.answered=true;rememberQuestion(q.id);
   if(verdict.correct){const points=Number(verdict.points)||0;if(current.kind==='solo')current.score+=points;else current.teams[activeIndex()].score+=points;}
   drawScores();document.querySelectorAll('#sjQuestionHost .sj-option').forEach((b,i)=>{b.disabled=true;if(i===Number(verdict.correct_index))b.classList.add('correct');else if(i===index)b.classList.add('wrong');});
   const result=$('sjResponse');result.hidden=false;result.replaceChildren(make('strong',null,verdict.correct?'إجابة صحيحة':'إجابة غير صحيحة'));
   if(extra)result.append(make('p',null,extra));if(verdict.explanation)result.append(make('p',null,verdict.explanation));
   const next=make('button','sj-btn sj-primary',current.index+1===current.pool.length?'عرض النتيجة':'السؤال التالي');next.type='button';next.onclick=nextQuestion;result.append(next);
  }catch(e){if(round===current)current.busy=false;info('تعذر التحقق من الإجابة: '+(e?.message||'حاول مجدداً.'),true);}
 }
 function nextQuestion(){if(!round?.answered)return;round.index++;if(round.index>=round.pool.length)finishRound();else{renderQuestion();jump('sjRound');}}
 function showResult(title,subtitle,rows){$('sjCounter').textContent='نهاية الجولة';$('sjProgressFill').style.width='100%';$('sjTurnLabel').textContent='';$('sjTotalScore').textContent='';$('sjTeamScores').replaceChildren();
  const card=make('article','sj-result');card.append(make('span','sj-eyebrow','سِجال · القافية'),make('h2',null,title),make('p',null,subtitle));
  const table=make('div','sj-result-table');rows.forEach((row,i)=>{const div=make('div');div.append(make('strong',null,`${i+1}. ${row.name}`),make('span',null,`${row.score} نقطة`));table.append(div);});card.append(table);$('sjQuestionHost').replaceChildren(card);return card;
 }
 function endSession(done){done.completed=true;if(done.session&&user)Promise.resolve(db.rpc('qafiyah_sijal_finish_session',{p_session:done.session})).catch(()=>{});}
 function finishRound(){if(!round)return;const finished=round;round=null;
  if(finished.kind==='tournament'){
   const ranked=[...finished.teams].sort((a,b)=>b.score-a.score);const card=showResult('نتيجة المواجهة',`بطولة ${tournament.name} · الدور ${tournament.stage}`,ranked);
   const commit=winner=>{tournament.slots[tournament.index].winner=winner;const b=make('button','sj-btn sj-primary','المواجهة التالية');b.type='button';b.onclick=()=>{if(!round)startNextMatch();};card.append(b);};
   if(ranked[0].score===ranked[1].score){card.append(make('p','sj-small-note','تعادلت النتيجة؛ اختر الفريق المتأهل بعد حسم التعادل بينكما.'));
    for(const team of ranked){const b=make('button','sj-btn sj-outline',`تأهيل ${team.name}`);b.type='button';b.onclick=()=>{card.querySelectorAll('button').forEach(x=>x.remove());commit(team);};card.append(b);}
   }else commit(ranked[0]);return;
  }
  const ranked=finished.kind==='solo'?[{name:user?'نتيجتك الشخصية':'نتيجة الجولة',score:finished.score}]:[...finished.teams].sort((a,b)=>b.score-a.score);
  const card=showResult('اكتملت الجولة',finished.kind==='solo'?'أحسنت! إليك حصيلة جولتك.':'ترتيب الفرق في هذه الجولة:',ranked);
  if(finished.kind==='solo'&&!user)card.append(make('p','sj-small-note','سجّل الدخول لحفظ النقاط المعتمدة في التصنيف العام.'));
  const again=make('button','sj-btn sj-primary','جولة جديدة');again.type='button';again.onclick=reset;card.append(again);if(finished.kind==='solo')endSession(finished);
 }
 function renderChampion(winner){round=null;show('sjViewPlay',false);show('sjViewRanking',false);show('sjViewGuide',false);show('sjRound',true);
  const card=showResult('بطل سِجال',`اكتملت بطولة «${tournament.name}»`,[{name:winner.name,score:'—'}]);card.append(make('p','sj-champion','مبارك الفوز!'));
  const next=make('button','sj-btn sj-primary','إنشاء بطولة جديدة');next.type='button';next.onclick=()=>{tournament=null;reset();};card.append(next);
 }
 function reset(){round=null;tournament=null;show('sjRound',false);switchTab('play');show('sjViewPlay',true);jump('sjSetup');}
 async function refreshRanking(){if(!settings.leaderboard_enabled)return;const box=$('sjLeaderboard');try{const {data,error}=await db.rpc('qafiyah_game_leaderboard');if(error)throw Error(error.message);
  box.replaceChildren();const list=data||[];if(!list.length)box.append(make('p','sj-small-note','لا توجد نتائج بعد. كن أول المتصدرين.'));
  list.forEach((p,i)=>{const item=make('div','sj-rank');item.append(make('span','sj-rank-index',i+1),make('strong','sj-rank-name',p.player||'متسابق'),make('b','sj-rank-points',`${Number(p.points||0).toLocaleString('ar-SA')} نقطة`));box.append(item);});
 }catch{box.textContent='تعذر تحميل التصنيف حالياً.';}}
 async function fetchRecorded(){serverSeen.clear();if(!user)return;
  try{let offset=0;while(offset<10000){const {data,error}=await db.from('qafiyah_game_answers').select('question_id').eq('user_id',user.id).range(offset,offset+999);if(error)throw error;
   for(const x of data||[])serverSeen.add(x.question_id);if(!data||data.length<1000)break;offset+=1000;}
  }catch{/* If RLS limits history, the local anti-repeat list still applies. */}
 }
 async function loadPage(){if(!db)return info('تعذر الاتصال بخدمة القافية حالياً.',true);
  try{const auth=await db.auth.getUser();user=auth.data?.user||null;loadHistory();
   const cfg=await db.from('qafiyah_sijal_settings').select('enabled,leaderboard_enabled').eq('id',1).single();if(cfg.error)throw Error('تعذر تحميل إعدادات سِجال.');settings=cfg.data;
   if(!settings.enabled){show('sjUnavailable',true);return;}
   const [gamesRes,questionsRes]=await Promise.all([
    db.from('qafiyah_challenges').select('id,title,description,kind,category').eq('published',true).order('created_at',{ascending:true}),
    db.from('qafiyah_game_questions_public').select('id,challenge_id,question_text,options,points,position,media_url,media_type,media_caption').limit(5000)
   ]);
   if(gamesRes.error||questionsRes.error)throw Error(gamesRes.error?.message||questionsRes.error.message);
   games=gamesRes.data||[];questions=questionsRes.data||[];await fetchRecorded();
   const categories=$('sjCategoryFilter');for(const cat of [...new Set(games.map(g=>g.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar')))categories.add(new Option(cat,cat));
   chosen=new Set();renderGames();
   if(!settings.leaderboard_enabled)document.querySelector('[data-sj-tab="ranking"]')?.setAttribute('hidden','');
   show('sjExperience',true);refreshRanking();
  }catch(e){info(e.message||'تعذر تحميل ألعاب سِجال.',true);}
 }
 $('sjSelectAll').addEventListener('click',()=>{const ids=games.filter(g=>countFor(g.id)).map(g=>g.id);chosen=new Set(ids.every(id=>chosen.has(id))?[]:ids);renderGames();});
 $('sjSearchGames').addEventListener('input',renderGames);$('sjCategoryFilter').addEventListener('change',renderGames);
 document.querySelectorAll('[data-sj-entry]').forEach(b=>b.addEventListener('click',()=>{if(round){if(!confirm('هل تريد إنهاء الجولة الحالية؟'))return;round=null;}switchTab('play');chooseMode(b.dataset.sjEntry);jump('sjSetup');}));
 document.querySelectorAll('[data-sj-tab]').forEach(b=>b.addEventListener('click',()=>{if(round&&!confirm('هل تريد إنهاء الجولة والانتقال إلى قسم آخر؟'))return;round=null;tournament=null;switchTab(b.dataset.sjTab);}));
 $('sjTeamCount').addEventListener('change',renderTeams);$('sjDetailedPlayers').addEventListener('change',renderTeams);
 $('sjTournamentCount').addEventListener('change',renderTournamentTeams);
 $('sjStart').addEventListener('click',startPlay);$('sjQuit').addEventListener('click',()=>{if(confirm('إنهاء الجولة الحالية؟'))reset();});$('sjRefreshRanking').addEventListener('click',refreshRanking);
 for(let i=4;i<=16;i++)$('sjTournamentCount').add(new Option(`${i} فرق`,String(i)));
 $('sjTournamentCount').value='4';renderTeams();renderTournamentTeams();chooseMode('solo');loadPage();
 setInterval(()=>{if(!document.hidden&&!$('sjViewRanking').hidden)refreshRanking();},10000);
});
