'use strict';
/* سِجال: ألعاب أدبية، جولات فردية وفرق، وترتيب الأفراد الحقيقي بالخادم. */
document.addEventListener('DOMContentLoaded',()=>{
 const db=window.supabaseClient, $=id=>document.getElementById(id);
 const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
 const types={quiz:'أسئلة الأدب',complete:'أكمل البيت',speaker:'من القائل',guesspoet:'خمن الشاعر',truefalse:'صح أو خطأ',riddle:'ألغاز القافية'};
 const icons={quiz:'<path d="M8 7h12M8 12h9M8 17h7M4 7h.01M4 12h.01M4 17h.01"/>',complete:'<path d="M4 7h16M4 12h9M4 17h12m3 0h5"/>',speaker:'<path d="M4 8h16v10H9l-5 4zM8 12h8"/>',guesspoet:'<circle cx="12" cy="7" r="4"/><path d="M5 22a7 7 0 0 1 14 0"/>',truefalse:'<path d="m3 12 5 5L21 4M3 4h6M15 20h6"/>',riddle:'<path d="M9 9a3 3 0 1 1 4.5 2.6C12 12.6 12 13 12 15M12 19h.01"/>'};
 const symbol=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[k]||icons.quiz}</svg>`;
 let games=[],questions=[],chosen=new Set(),user=null,round=null,settings={enabled:true,leaderboard_enabled:true};
 const show=(id,visible)=>{const e=$(id);if(e)e.hidden=!visible;};
 const note=(message,error=false)=>{const e=$('sjNotice');e.textContent=message;e.hidden=!message;e.classList.toggle('error',error);};
 const scrollTo=id=>$(id)?.scrollIntoView({behavior:'smooth',block:'start'});
 const selectedMode=()=>document.querySelector('input[name="sjMode"]:checked')?.value||'solo';
 const viewIds={play:'sjViewPlay',ranking:'sjViewRanking',guide:'sjViewGuide'};
 function switchTab(key){if(key==='ranking'&&!settings.leaderboard_enabled)return;
  for(const [tab,id] of Object.entries(viewIds))show(id,tab===key);
  show('sjRound',false);
  document.querySelectorAll('[data-sj-tab]').forEach(b=>{const active=b.dataset.sjTab===key;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
  if(key==='ranking')refreshRanking();
 }
 function gameCount(id){return questions.filter(q=>q.challenge_id===id).length;}
 function renderGames(){
  const term=$('sjSearchGames').value.trim().toLocaleLowerCase('ar'),cat=$('sjCategoryFilter').value;
  const box=$('sjGameCards');box.replaceChildren();
  for(const g of games){const count=gameCount(g.id);
   if(cat&&g.category!==cat)continue;
   if(term&&!`${g.title} ${g.description} ${g.category} ${types[g.kind]}`.toLocaleLowerCase('ar').includes(term))continue;
   const lab=element('label','sj-game'),input=element('input'),card=element('span','sj-game-card'),top=element('span','sj-game-top'),badge=element('span','sj-game-icon'),check=element('span','sj-tick','✓');
   input.type='checkbox';input.checked=chosen.has(g.id);input.disabled=count===0;badge.innerHTML=symbol(g.kind);top.append(badge,check);
   card.append(top,element('strong','sj-game-title',g.title),element('span','sj-game-desc',g.description||types[g.kind]),element('span','sj-game-meta',`${g.category||'الأدب العربي'} · ${count} سؤال`));
   lab.append(input,card);input.addEventListener('change',()=>{if(input.checked)chosen.add(g.id);else chosen.delete(g.id);updateSelectAllLabel();});box.append(lab);
  }
  if(!box.childElementCount)box.append(element('p','sj-small-note','لا توجد ألعاب مطابقة لهذا البحث.'));
  updateSelectAllLabel();
 }
 function updateSelectAllLabel(){const enabled=games.filter(g=>gameCount(g.id)>0),all=enabled.length&&enabled.every(g=>chosen.has(g.id));$('sjSelectAll').textContent=all?'إلغاء التحديد':'تحديد الكل';}
 function renderTeams(){
  const host=$('sjTeamFields'),count=Number($('sjTeamCount').value),detailed=$('sjDetailedPlayers').checked;
  const previous=[...host.querySelectorAll('.sj-team-unit')].map(x=>({name:x.querySelector('.sj-team-name')?.value||'',players:x.querySelector('.sj-team-members')?.value||''}));host.replaceChildren();
  for(let i=0;i<count;i++){
   const field=element('div','sj-team-unit'),label=element('label',null,`اسم الفريق ${i+1}`),name=element('input','sj-field sj-team-name');
   name.type='text';name.required=true;name.maxLength=45;name.value=previous[i]?.name||`الفريق ${i+1}`;label.append(name);field.append(label);
   if(detailed){const players=element('textarea','sj-field sj-team-members'),cap=element('label',null,'اللاعبون، كل اسم في سطر');players.maxLength=800;players.rows=3;players.placeholder='اللاعب الأول\nاللاعب الثاني';players.value=previous[i]?.players||'';cap.append(players);field.append(cap);}
   host.append(field);
  }
 }
 function newRound(){
  note('');if(round)return;
  if(!chosen.size)return note('اختر لعبة واحدة على الأقل.',true);
  const pool=questions.filter(q=>chosen.has(q.challenge_id));if(!pool.length)return note('لا توجد أسئلة منشورة في الألعاب المختارة.',true);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const take=Math.min(pool.length,Number($('sjQuestionLimit').value)||10);pool.length=take;
  let teams=[];
  if(selectedMode()==='teams'){
   teams=[...document.querySelectorAll('.sj-team-unit')].map((x,i)=>({id:i,name:x.querySelector('.sj-team-name').value.trim(),players:(x.querySelector('.sj-team-members')?.value||'').split(/\r?\n/).map(t=>t.trim()).filter(Boolean),score:0}));
   if(teams.length<2||teams.length>4||teams.some(t=>t.name.length<2))return note('سمِّ فريقين إلى أربعة فرق، باسم من حرفين على الأقل.',true);
   if(new Set(teams.map(t=>t.name.toLocaleLowerCase('ar'))).size!==teams.length)return note('أسماء الفرق يجب أن تكون مختلفة.',true);
   if($('sjDetailedPlayers').checked&&teams.some(t=>!t.players.length))return note('أدخل اسم لاعب واحد على الأقل لكل فريق، أو ألغ خيار تفصيل اللاعبين.',true);
  }
  round={pool,index:0,teams,solo:selectedMode()==='solo',score:0,busy:false,answered:false,session:null};
  show('sjViewPlay',false);show('sjViewRanking',false);show('sjViewGuide',false);show('sjRound',true);
  renderQuestion();scrollTo('sjRound');
  // نتتبع الجولات الفردية المكتملة، دون التأثير على اللعب إذا تعذر تسجيلها.
  if(round.solo&&user){
   const thisRound=round;
   db.rpc('qafiyah_sijal_start_session').then(({data,error})=>{
     if(!error&&data){thisRound.session=data;
       if(thisRound.completed)db.rpc('qafiyah_sijal_finish_session',{p_session:data}).catch(()=>{});
     }
   }).catch(()=>{});
  }
 }
 function safeMedia(url){try{const u=new URL(url,location.href);return (u.protocol==='https:'||u.origin===location.origin)?u.href:null;}catch{return null;}}
 function appendMedia(q,card){const src=q.media_url&&safeMedia(q.media_url);
  if(!src||!['image','audio','video'].includes(q.media_type))return;
  const el=element({image:'img',audio:'audio',video:'video'}[q.media_type],'sj-question-media');el.src=src;
  if(q.media_type==='image'){el.alt=q.media_caption||'صورة السؤال';el.loading='lazy';}
  else{el.controls=true;el.preload='none';}
  card.append(el);if(q.media_caption)card.append(element('p','sj-small-note',q.media_caption));
 }
 function drawScores(){const host=$('sjTeamScores');host.replaceChildren();
  if(round.solo){$('sjTotalScore').textContent=`${round.score} نقطة`;return;}
  $('sjTotalScore').textContent='نتائج الفرق';
  const turn=round.index%round.teams.length;
  round.teams.forEach((t,i)=>{
   const card=element('div','sj-team-score'+(i===turn?' active':''));card.append(element('strong',null,t.name),element('small','sj-score-value',`${t.score} نقطة`));
   if(t.players.length)card.title='اللاعبون: '+t.players.join('، ');
   const control=element('div','sj-score-actions');for(const [sign,change,label] of [['+',10,'إضافة عشر نقاط'],['−',-10,'خصم عشر نقاط']]){
    const b=element('button','sj-score-manual',sign);b.type='button';b.title=`${label} لفريق ${t.name}`;b.setAttribute('aria-label',b.title);
    b.addEventListener('click',()=>{t.score=Math.max(0,t.score+change);drawScores();});control.append(b);
   }card.append(control);host.append(card);
  });
 }
 function renderQuestion(){const q=round?.pool[round.index];if(!q)return finish();
  round.busy=false;round.answered=false;const g=games.find(x=>x.id===q.challenge_id);
  $('sjCounter').textContent=`السؤال ${round.index+1} من ${round.pool.length}`;
  $('sjProgressFill').style.width=`${Math.round(round.index/round.pool.length*100)}%`;
  $('sjTurnLabel').textContent=round.solo?'':`الدور الآن: ${round.teams[round.index%round.teams.length].name}`;
  drawScores();
  const host=$('sjQuestionHost'),card=element('article','sj-question-card');
  card.append(element('span','sj-question-kind',g?.title||types.quiz),element('h2',null,q.question_text));appendMedia(q,card);
  const opts=element('div','sj-options');(Array.isArray(q.options)?q.options:[]).forEach((value,i)=>{
   const btn=element('button','sj-option');btn.type='button';btn.append(element('strong',null,String(i+1)),element('span',null,value));btn.addEventListener('click',()=>submitAnswer(i));opts.append(btn);
  });card.append(opts);
  const result=element('div','sj-response');result.id='sjResponse';result.hidden=true;result.setAttribute('aria-live','polite');card.append(result);host.replaceChildren(card);
 }
 async function submitAnswer(index){if(!round||round.busy||round.answered)return;
  round.busy=true;note('');const q=round.pool[round.index];let answer,extra='';
  try{
   if(round.solo&&user){let r=await db.rpc('qafiyah_submit_game_answer',{p_question:q.id,p_index:index});
    if(r.error&&/من قبل|سبق/.test(r.error.message)){
     r=await db.rpc('qafiyah_sijal_check_answer',{p_question:q.id,p_index:index});if(r.error)throw Error(r.error.message);
     answer={...r.data,points:0};extra='سبق احتساب هذا السؤال لحسابك؛ هذه المحاولة للتدريب فقط.';
    }else if(r.error)throw Error(r.error.message);else answer=r.data;
   }else{const r=await db.rpc('qafiyah_sijal_check_answer',{p_question:q.id,p_index:index});if(r.error)throw Error(r.error.message);answer=r.data;}
   round.answered=true;
   if(answer.correct){const pts=Number(answer.points||0);if(round.solo)round.score+=pts;else round.teams[round.index%round.teams.length].score+=pts;}
   drawScores();const options=document.querySelectorAll('#sjQuestionHost .sj-option');options.forEach((b,i)=>{b.disabled=true;if(i===Number(answer.correct_index))b.classList.add('correct');else if(i===index)b.classList.add('wrong');});
   const response=$('sjResponse');response.hidden=false;response.replaceChildren(element('strong',null,answer.correct?'إجابة صحيحة':'إجابة غير صحيحة'));
   if(extra)response.append(element('p',null,extra));if(answer.explanation)response.append(element('p',null,answer.explanation));
   const next=element('button','sj-btn sj-primary',round.index+1===round.pool.length?'عرض النتائج':'السؤال التالي');next.type='button';next.onclick=nextQuestion;response.append(next);
   if(round.solo&&user)refreshRanking();
  }catch(e){round.busy=false;note('تعذر التحقق من الإجابة. '+(e?.message||'يرجى المحاولة مجدداً.'),true);}
 }
 function nextQuestion(){if(!round?.answered)return;round.index++;if(round.index>=round.pool.length)finish();else{renderQuestion();scrollTo('sjRound');}}
 function finish(){if(!round)return;
  $('sjCounter').textContent='انتهت الجولة';$('sjProgressFill').style.width='100%';$('sjTurnLabel').textContent='';
  const host=$('sjQuestionHost'),card=element('article','sj-result'),result=round.solo?[{name:user?'نتيجتك الشخصية':'نتيجة الجولة التجريبية',score:round.score}]:[...round.teams].sort((a,b)=>b.score-a.score);
  card.append(element('h2',null,'اكتملت الجولة'),element('p',null,round.solo?'أحسنت! إليك نتيجة جولتك.':'ترتيب الفرق في هذه الجولة:'));
  const table=element('div','sj-result-table');result.forEach((r,i)=>{const line=element('div');line.append(element('strong',null,`${i+1}. ${r.name}`),element('span',null,`${r.score} نقطة`));table.append(line);});card.append(table);
  if(round.solo&&!user)card.append(element('p','sj-small-note','سجّل الدخول لحفظ نقاط إجاباتك الأولى في التصنيف العام.'));
  const another=element('button','sj-btn sj-primary','جولة جديدة');another.type='button';another.onclick=reset;card.append(another);
  host.replaceChildren(card);$('sjTeamScores').replaceChildren();$('sjTotalScore').textContent='';
  const completed=round;completed.completed=true;round=null;
  if(completed.session&&user)db.rpc('qafiyah_sijal_finish_session',{p_session:completed.session}).catch(()=>{});
 }
 function reset(){round=null;show('sjRound',false);switchTab('play');show('sjViewPlay',true);scrollTo('sjSetup');}
 async function refreshRanking(){if(!settings.leaderboard_enabled)return;
  const box=$('sjLeaderboard');try{const r=await db.rpc('qafiyah_game_leaderboard');if(r.error)throw Error(r.error.message);
   box.replaceChildren();const rows=r.data||[];$('sjPlayersCount').textContent=rows.length>=100?'100+':String(rows.length);
   if(!rows.length)box.append(element('p','sj-small-note','لا توجد نتائج بعد. كن أول المتصدرين.'));
   rows.forEach((p,i)=>{const row=element('div','sj-rank');row.append(element('span','sj-rank-index',i+1),element('strong','sj-rank-name',p.player||'متسابق'),element('b','sj-rank-points',Number(p.points||0).toLocaleString('ar-SA')+' نقطة'));box.append(row);});
  }catch{box.textContent='تعذر تحميل التصنيف مؤقتاً.';}
 }
 async function loadPage(){if(!db)return note('تعذر الاتصال بخدمة القافية حالياً.',true);
  try{
   const auth=await db.auth.getUser();user=auth.data?.user||null;
   const pref=await db.from('qafiyah_sijal_settings').select('enabled,leaderboard_enabled').eq('id',1).single();
   if(pref.error)throw Error('لم تُنفّذ ترقية قاعدة بيانات سِجال بعد.');settings=pref.data;
   if(!settings.enabled){show('sjUnavailable',true);return;}
   const [gamesResult,questionsResult]=await Promise.all([
    db.from('qafiyah_challenges').select('id,title,description,kind,category').eq('published',true).order('created_at',{ascending:true}),
    db.from('qafiyah_game_questions_public').select('id,challenge_id,question_text,options,points,position,media_url,media_type,media_caption').order('position',{ascending:true}).limit(5000)
   ]);
   if(gamesResult.error||questionsResult.error)throw Error(gamesResult.error?.message||questionsResult.error.message);
   games=gamesResult.data||[];questions=questionsResult.data||[];
   $('sjGamesCount').textContent=games.length.toLocaleString('ar-SA');$('sjQuestionsCount').textContent=questions.length.toLocaleString('ar-SA');
   const select=$('sjCategoryFilter');for(const cat of [...new Set(games.map(g=>g.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'))){const o=new Option(cat,cat);select.add(o);}
   chosen=new Set(games.filter(g=>gameCount(g.id)).map(g=>g.id));renderGames();
   if(!settings.leaderboard_enabled)document.querySelector('[data-sj-tab="ranking"]')?.setAttribute('hidden','');
   show('sjExperience',true);refreshRanking();
  }catch(e){note(e.message||'تعذر تحميل ألعاب سِجال.',true);}
 }
 $('sjSelectAll').addEventListener('click',()=>{const available=games.filter(g=>gameCount(g.id)).map(g=>g.id);chosen=new Set(available.every(id=>chosen.has(id))?[]:available);renderGames();});
 $('sjSearchGames').addEventListener('input',renderGames);$('sjCategoryFilter').addEventListener('change',renderGames);
 document.querySelectorAll('[data-sj-tab]').forEach(b=>b.addEventListener('click',()=>{if(round&&!confirm('هل تريد إنهاء الجولة والانتقال إلى قسم آخر؟'))return;round=null;switchTab(b.dataset.sjTab);}));
 document.querySelectorAll('input[name="sjMode"]').forEach(b=>b.addEventListener('change',()=>show('sjTeamSetup',selectedMode()==='teams')));
 $('sjTeamCount').addEventListener('change',renderTeams);$('sjDetailedPlayers').addEventListener('change',renderTeams);
 $('sjStart').addEventListener('click',newRound);$('sjQuit').addEventListener('click',()=>{if(confirm('إنهاء الجولة دون حفظ نتيجتها؟'))reset();});
 $('sjRefreshRanking').addEventListener('click',refreshRanking);
 renderTeams();loadPage();
 // تحديث دوري خفيف للنتائج المفتوحة بدلاً من تحديث الصفحة بأكملها.
 setInterval(()=>{if(!document.hidden&&!$('sjViewRanking').hidden)refreshRanking();},10000);
});
