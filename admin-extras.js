'use strict';
// فروع الإدارة الجديدة: صلاحيات العرض محمية أيضاً بسياسات RLS في SQL.
(() => {
 const db=window.supabaseClient,$=id=>document.getElementById(id);
 let director=false,owner=false,challengeRows=[],questionRows=[],teamRows=[];
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const toast=(s,err=false)=>typeof showToast==='function'?showToast(s,err?'error':'success'):alert(s);
 function guard(){if(!director){toast('هذه الخاصية مخصصة للمالك والمدير فقط.',true);return false;}return true;}
 const dataFrom=f=>Object.fromEntries(new FormData(f).entries());
 function clearForm(f){f.reset();f.elements.namedItem('id').value='';}
 // لا تُفتح إعدادات مُجيب إلا للمالك؛ سياسات RLS وStorage تمنع المدير كذلك.
 const muAssetKeys={avatar_url:{id:'muAdminAvatar',preview:'muAdminAvatarPreview',folder:'avatar',max:2*1024*1024},background_dark_url:{id:'muAdminNight',preview:'muAdminNightPreview',folder:'night',max:6*1024*1024},background_light_url:{id:'muAdminDay',preview:'muAdminDayPreview',folder:'day',max:6*1024*1024}};
 const defaultPerson='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/></svg>';
 let muAssets={avatar_url:null,background_dark_url:null,background_light_url:null};
 const muRemoved=new Set(),muLocalPreviews=new Map();
 function muStatus(message,isError){const el=$('muAdminStatus');if(el){el.textContent=message||'';el.style.color=isError?'#cf7777':'';} }
 function muSafeUrl(value){try{const u=new URL(String(value||''),location.href);return (u.protocol==='https:'&&(u.hostname.endsWith('.supabase.co')||u.origin===location.origin))?u.href:null;}catch{return null;}}
 function muPreview(key){const spec=muAssetKeys[key],box=$(spec.preview),file=$(spec.id)?.files?.[0];if(!box)return;
  const previous=muLocalPreviews.get(key);if(previous){URL.revokeObjectURL(previous);muLocalPreviews.delete(key);}
  const custom= !muRemoved.has(key) && (file?URL.createObjectURL(file):muSafeUrl(muAssets[key]));
  if(file&&custom)muLocalPreviews.set(key,custom);
  if(key==='avatar_url'){
    box.replaceChildren();if(custom){const im=document.createElement('img');im.alt='معاينة صورة مُجيب';im.src=custom;box.appendChild(im);}else box.innerHTML=defaultPerson;
  }else{box.style.backgroundImage=custom?`url("${custom}")`:'';}
 }
 function muAllPreviews(){Object.keys(muAssetKeys).forEach(muPreview);}
 Object.entries(muAssetKeys).forEach(([key,spec])=>$(spec.id)?.addEventListener('change',()=>{muRemoved.delete(key);muPreview(key);}));
 document.querySelectorAll('#section-mujeeb [data-mu-remove]').forEach(button=>button.addEventListener('click',()=>{
   const key=button.dataset.muRemove,conf=muAssetKeys[key];if(!owner||!conf)return;
   $(conf.id).value='';muRemoved.add(key);muPreview(key);muStatus('اضغط «حفظ ونشر التغييرات» لتطبيق الإزالة للزوار.');
 }));
 async function loadMujeeb(){if(!owner)return;
  const {data,error}=await db.from('qafiyah_mujeeb_settings').select('*').eq('id',1).maybeSingle();
  if(error){muStatus('تعذر تحميل إعدادات مُجيب؛ تأكد من تنفيذ ملف SQL الجديد: '+error.message,true);return;}
  if(!data)return;
  const form=$('mujeebAdminForm');for(const k of ['title','short_description','greeting','system_prompt'])form.elements[k].value=data[k]??(k==='short_description'?'مساعد القافية الأدبي':'');
  form.elements.enabled.value=String(data.enabled);
  for(const k of Object.keys(muAssetKeys)){muAssets[k]=data[k]||null;$(muAssetKeys[k].id).value='';}
  muRemoved.clear();muAllPreviews();muStatus('');
 }
 function muPreviousStoragePath(url){try{const u=new URL(url),tag='/storage/v1/object/public/mujeeb-assets/';const i=u.pathname.indexOf(tag);return i>=0?decodeURIComponent(u.pathname.slice(i+tag.length)):null;}catch{return null;}}
 async function muUpload(key,file){
  const spec=muAssetKeys[key];if(!file)return null;
  const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
  if(!ext)throw new Error('صيغة الصورة غير مدعومة: '+file.name);
  if(file.size>spec.max)throw new Error('الصورة كبيرة: '+file.name);
  if(file.size<100)throw new Error('الملف ليس صورة صالحة: '+file.name);
  const name=`${spec.folder}/${Date.now()}-${Math.random().toString(36).slice(2,12)}.${ext}`;
  const result=await db.storage.from('mujeeb-assets').upload(name,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
  if(result.error)throw new Error(result.error.message);
  const publicUrl=db.storage.from('mujeeb-assets').getPublicUrl(name).data?.publicUrl;
  if(!publicUrl)throw new Error('تعذر الحصول على رابط الصورة');
  return {url:publicUrl,path:name};
 }
 $('mujeebAdminForm')?.addEventListener('submit',async e=>{
  e.preventDefault();if(!owner){muStatus('التخصيص متاح للمالك وحده.',true);return;}
  const form=e.currentTarget,d=dataFrom(form),button=$('muAdminSave');
  if(!d.title.trim()||!d.short_description.trim()||!d.system_prompt.trim()){muStatus('أكمل الاسم والوصف وتعليمات المساعد.',true);return;}
  const values={id:1,title:d.title.trim(),short_description:d.short_description.trim(),greeting:d.greeting.trim(),system_prompt:d.system_prompt.trim(),enabled:d.enabled==='true',updated_at:new Date().toISOString()};
  const uploaded=[];
  button.disabled=true;muStatus('جارٍ رفع الصور وحفظ الإعدادات…');
  try{
   for(const [key,spec] of Object.entries(muAssetKeys)){
    const chosen=$(spec.id)?.files?.[0];
    if(chosen){const result=await muUpload(key,chosen);values[key]=result.url;uploaded.push(result.path);}
    else values[key]=muRemoved.has(key)?null:muAssets[key];
   }
   const {error}=await db.from('qafiyah_mujeeb_settings').update(values).eq('id',1);
   if(error)throw new Error(error.message);
   const old=[];
   for(const key of Object.keys(muAssetKeys))if(muAssets[key]&&muAssets[key]!==values[key]){
     const path=muPreviousStoragePath(muAssets[key]);if(path)old.push(path);
   }
   muAssets={avatar_url:values.avatar_url,background_dark_url:values.background_dark_url,background_light_url:values.background_light_url};
   muRemoved.clear();Object.values(muAssetKeys).forEach(spec=>$(spec.id).value='');
   muAllPreviews();muStatus('تم حفظ مظهر مُجيب ونشره للزوار.');toast('تم تحديث مُجيب.');
   // Cleaning older images is best-effort; the DB update is already committed.
   if(old.length)db.storage.from('mujeeb-assets').remove(old).catch(()=>{});
  }catch(err){if(uploaded.length)db.storage.from('mujeeb-assets').remove(uploaded).catch(()=>{});muStatus('تعذر حفظ التغييرات: '+(err?.message||'خطأ غير متوقع'),true);}
  finally{button.disabled=false;}
 });
 // «سِجال»: إدارة المالك والمدير فقط. تفحص RLS الصلاحية أيضاً داخل Supabase.
 let sijalGames=[],sijalQuestions=[],sijalTeams=[],sijalPlayers=[],sijalLoading=false;
 const sjTypes={quiz:'أسئلة الأدب',complete:'أكمل البيت',guesspoet:'خمن الشاعر',speaker:'من القائل',truefalse:'صح أو خطأ',riddle:'ألغاز القافية'};
 const sjButton=(label,attr,id,variant='secondary')=>`<button class="btn btn-${variant} btn-small" type="button" data-${attr}="${escape(id)}">${label}</button>`;
 const sjDate=value=>value?new Date(value).toLocaleString('ar-SA'):'—';
 const sjMsg=(text,error=false)=>{const el=$('sjAdminNotice');if(!el)return;el.textContent=text||'';el.hidden=!text;el.style.color=error?'#ba4141':'';};
 async function sjRun(query){const {data,error}=await query;if(error)throw new Error(error.message);return data;}
 const sjWorking=(element,working)=>{if(element)element.disabled=working;};
 function sjOptions(selectId,firstText,selected=''){
  const el=$(selectId);if(!el)return;
  const old=selected||el.value;
  el.replaceChildren(new Option(firstText,''),...sijalGames.map(g=>new Option(g.title,g.id)));
  if(old&&sijalGames.some(g=>g.id===old))el.value=old;
 }
 function sjRenderGames(){
  const host=$('sjAdminGameRows');if(!host)return;
  const term=String($('sjAdminGameSearch')?.value||'').trim().toLocaleLowerCase('ar');
  const filtered=sijalGames.filter(g=>`${g.title} ${g.kind} ${g.category} ${g.description}`.toLocaleLowerCase('ar').includes(term));
  host.innerHTML=filtered.map(g=>`<tr><td><strong>${escape(g.title)}</strong><small style="display:block">${escape(sjTypes[g.kind]||g.kind)}</small></td><td>${escape(g.category||'—')}</td><td>${sijalQuestions.filter(q=>q.challenge_id===g.id).length}</td><td>${g.published?'منشورة':'مخفية'}</td><td>${sjButton('تعديل','sj-game-edit',g.id)} ${sjButton(g.published?'إخفاء':'نشر','sj-game-toggle',g.id)} ${sjButton('حذف','sj-game-delete',g.id,'danger')}</td></tr>`).join('')||'<tr><td colspan="5">لا توجد ألعاب مطابقة.</td></tr>';
 }
 function sjRenderQuestions(){
  const host=$('sjAdminQuestionRows');if(!host)return;
  const term=String($('sjAdminQuestionSearch')?.value||'').trim().toLocaleLowerCase('ar'),filter=$('sjAdminQuestionFilter')?.value||'';
  const filtered=sijalQuestions.filter(q=>(!filter||q.challenge_id===filter)&&`${q.question_text} ${q.explanation}`.toLocaleLowerCase('ar').includes(term));
  host.innerHTML=filtered.map(q=>`<tr><td>${escape(q.question_text.slice(0,110))}</td><td>${escape(sijalGames.find(g=>g.id===q.challenge_id)?.title||'—')}</td><td>${q.media_url?escape(q.media_type||'مرفق'):'—'}</td><td>${sjButton('تعديل','sj-question-edit',q.id)} ${sjButton('حذف','sj-question-delete',q.id,'danger')}</td></tr>`).join('')||'<tr><td colspan="4">لا توجد أسئلة مطابقة.</td></tr>';
 }
 function sjRenderTeams(){const host=$('sjAdminTeamRows');if(!host)return;
  host.innerHTML=sijalTeams.map(t=>`<tr><td>${escape(t.name)}</td><td><code>${escape(t.id)}</code></td><td>${sjButton('حذف الفريق','sj-team-delete',t.id,'danger')}</td></tr>`).join('')||'<tr><td colspan="3">لا توجد فرق دائمة مسجلة.</td></tr>';
 }
 function sjRenderPlayers(){const host=$('sjAdminPlayerRows');if(!host)return;
  const term=String($('sjAdminPlayerSearch')?.value||'').trim().toLocaleLowerCase('ar');
  const found=sijalPlayers.filter(p=>`${p.player} ${p.email}`.toLocaleLowerCase('ar').includes(term));
  host.innerHTML=found.map(p=>`<tr><td><strong>${escape(p.player||'متسابق')}</strong><small style="display:block">${escape(p.email||'')}</small>${p.hidden?'<small>مخفي من الترتيب</small>':''}</td><td>${Number(p.rounds||0)}</td><td>${Number(p.answers||0)}</td><td>${Number(p.correct||0)}</td><td>${Number(p.points||0).toLocaleString('ar-SA')}</td><td>${sjDate(p.last_played)}</td><td>${sjButton('التفاصيل','sj-player-detail',p.user_id)} ${sjButton(p.hidden?'إظهاره':'إخفاؤه','sj-player-hide',p.user_id)} ${sjButton('تصفير','sj-player-reset',p.user_id,'danger')}</td></tr>`).join('')||'<tr><td colspan="7">لا يوجد متنافسون مطابقون.</td></tr>';
 }
 async function loadSijal(){
  if(!director||sijalLoading)return;
  sijalLoading=true;sjMsg('');
  try{
   const [games,questions,teams,settings,players]=await Promise.all([
    sjRun(db.from('qafiyah_challenges').select('*').order('created_at',{ascending:false}).limit(1000)),
    sjRun(db.from('qafiyah_game_questions').select('*').order('position',{ascending:true}).limit(5000)),
    sjRun(db.from('qafiyah_game_teams').select('id,name,captain').order('created_at',{ascending:false}).limit(1000)),
    sjRun(db.from('qafiyah_sijal_settings').select('*').eq('id',1).single()),
    sjRun(db.rpc('qafiyah_sijal_admin_players'))
   ]);
   sijalGames=games||[];sijalQuestions=questions||[];sijalTeams=teams||[];sijalPlayers=players||[];
   $('sjAdminEnabled').checked=!!settings.enabled;$('sjAdminLeaderboard').checked=!!settings.leaderboard_enabled;
   $('sjAdminGames').textContent=sijalGames.length;$('sjAdminQuestions').textContent=sijalQuestions.length;$('sjAdminPlayers').textContent=sijalPlayers.length;
   sjOptions('sjAdminQuestionGame','اختر اللعبة');sjOptions('sjAdminImportGame','اختر اللعبة');sjOptions('sjAdminQuestionFilter','جميع الألعاب');
   const categoryList=$('sjAdminCategories');if(categoryList)categoryList.replaceChildren(...[...new Set(sijalGames.map(g=>g.category).filter(Boolean))].map(c=>{const e=document.createElement('option');e.value=c;return e;}));
   sjRenderGames();sjRenderQuestions();sjRenderTeams();sjRenderPlayers();
  }catch(e){sjMsg('تعذر تحميل إدارة سِجال: '+e.message+'. تأكد من تنفيذ QAFIYAH-SIJAL-UPGRADE.sql',true);}
  finally{sijalLoading=false;}
 }
 $('sjAdminSaveSettings')?.addEventListener('click',async e=>{
  if(!guard())return;const b=e.currentTarget;sjWorking(b,true);
  try{await sjRun(db.from('qafiyah_sijal_settings').update({enabled:$('sjAdminEnabled').checked,leaderboard_enabled:$('sjAdminLeaderboard').checked,updated_at:new Date().toISOString()}).eq('id',1));sjMsg('حُفظت إعدادات ظهور سِجال والتصنيف.');toast('تم الحفظ.');}
  catch(ex){sjMsg(ex.message,true);toast(ex.message,true);}finally{sjWorking(b,false);}
 });
 $('sjAdminGameForm')?.addEventListener('submit',async e=>{
  e.preventDefault();if(!guard())return;const f=e.currentTarget,d=dataFrom(f),b=f.querySelector('[type=submit]');sjWorking(b,true);
  try{
   const data={title:String(d.title||'').trim(),kind:d.kind,category:String(d.category||'').trim(),description:String(d.description||'').trim(),published:d.published==='true',updated_at:new Date().toISOString()};
   if(data.title.length<3||!data.category)throw Error('اكتب اسم اللعبة والتصنيف الأدبي.');
   if(!sjTypes[data.kind])throw Error('اختر نوع لعبة صحيحاً.');
   await sjRun(d.id?db.from('qafiyah_challenges').update(data).eq('id',d.id):db.from('qafiyah_challenges').insert(data));
   f.reset();f.elements.namedItem('id').value='';toast('تم حفظ اللعبة.');await loadSijal();
  }catch(ex){toast(ex.message,true);}finally{sjWorking(b,false);}
 });
 $('sjAdminResetGame')?.addEventListener('click',()=>clearForm($('sjAdminGameForm')));
 $('sjAdminGameSearch')?.addEventListener('input',sjRenderGames);
 $('sjAdminGameRows')?.addEventListener('click',async e=>{
  if(!guard())return;const button=e.target.closest('[data-sj-game-edit],[data-sj-game-delete],[data-sj-game-toggle]');if(!button)return;
  const id=button.dataset.sjGameEdit||button.dataset.sjGameDelete||button.dataset.sjGameToggle;
  const game=sijalGames.find(g=>g.id===id);if(!game)return;
  if(button.dataset.sjGameEdit){const f=$('sjAdminGameForm');for(const key of ['id','title','description','kind','category'])f.elements.namedItem(key).value=game[key]||'';f.elements.namedItem('published').value=String(game.published);f.scrollIntoView({behavior:'smooth',block:'center'});return;}
  if(button.dataset.sjGameDelete&&!confirm(`حذف «${game.title}» وجميع أسئلته ونتائجه نهائياً؟`))return;
  sjWorking(button,true);
  try{await sjRun(button.dataset.sjGameToggle?db.from('qafiyah_challenges').update({published:!game.published}).eq('id',id):db.from('qafiyah_challenges').delete().eq('id',id));toast('تم تحديث اللعبة.');await loadSijal();}
  catch(ex){toast(ex.message,true);}finally{sjWorking(button,false);}
 });
 const sjMimeTypes={image:['image/jpeg','image/png','image/webp','image/gif'],audio:['audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/webm'],video:['video/mp4','video/webm']};
 const sjMimeKind=mime=>Object.entries(sjMimeTypes).find(([,types])=>types.includes(mime))?.[0]||null;
 async function sjUpload(file){
  if(file.size>10*1024*1024)throw Error('ملف المرفق أكبر من 10 ميجابايت.');
  const kind=sjMimeKind(file.type);if(!kind)throw Error('صيغة الملف غير مدعومة.');
  const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','audio/mpeg':'mp3','audio/mp4':'m4a','audio/ogg':'ogg','audio/wav':'wav','audio/webm':'webm','video/mp4':'mp4','video/webm':'webm'}[file.type];
  const path=`questions/${crypto.randomUUID()}.${extension}`;
  await sjRun(db.storage.from('sijal-media').upload(path,file,{contentType:file.type,upsert:false}));
  const link=db.storage.from('sijal-media').getPublicUrl(path).data?.publicUrl;
  if(!link)throw Error('تعذر إنشاء رابط الملف.');return {url:link,kind,path};
 }
 $('sjAdminQuestionForm')?.addEventListener('submit',async e=>{
  e.preventDefault();if(!guard())return;const f=e.currentTarget,d=dataFrom(f),b=f.querySelector('[type=submit]');sjWorking(b,true);let uploaded=null;
  try{
   const options=String(d.options||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean),correct=Number(d.correct_number)-1;
   if(options.length<2||options.length>6||!Number.isInteger(correct)||correct<0||correct>=options.length)throw Error('أدخل من خيارين إلى ستة خيارات وحدد الإجابة الصحيحة.');
   const data={challenge_id:d.challenge_id,question_text:String(d.question_text||'').trim(),options,answer_index:correct,points:Number(d.points),position:Number(d.position||0),explanation:String(d.explanation||'').trim(),media_caption:String(d.media_caption||'').trim()};
   if(data.question_text.length<3||data.question_text.length>1500||!data.challenge_id)throw Error('اختر اللعبة وأدخل السؤال كاملاً.');
   if(!Number.isInteger(data.points)||data.points<1||data.points>100||!Number.isInteger(data.position)||data.position<0)throw Error('القيم الرقمية غير صالحة.');
   const old=sijalQuestions.find(q=>q.id===d.id);const uploadFile=$('sjAdminMediaFile')?.files?.[0];
   data.media_url=old?.media_url||null;data.media_type=old?.media_type||'none';
   const typed=String(d.media_url||'').trim(),type=d.media_type;
   if(uploadFile){uploaded=await sjUpload(uploadFile);if(type!=='none'&&type!==uploaded.kind)throw Error('نوع المرفق المختار لا يطابق الملف.');data.media_url=uploaded.url;data.media_type=uploaded.kind;}
   else if(typed){const link=new URL(typed);if(link.protocol!=='https:')throw Error('رابط المرفق يجب أن يبدأ بـ https://');if(!['image','audio','video'].includes(type))throw Error('حدد نوع المرفق لإضافة الرابط.');data.media_url=link.href;data.media_type=type;}
   else if(type==='none'){data.media_url=null;data.media_type='none';}
   else if(type!==data.media_type)throw Error('اختر ملفاً أو رابطاً مطابقاً لنوع المرفق.');
   await sjRun(d.id?db.from('qafiyah_game_questions').update(data).eq('id',d.id):db.from('qafiyah_game_questions').insert(data));
   f.reset();f.elements.namedItem('id').value='';$('sjAdminMediaFile').value='';toast('حُفظ السؤال.');await loadSijal();
  }catch(ex){if(uploaded)db.storage.from('sijal-media').remove([uploaded.path]).catch(()=>{});toast(ex.message,true);}
  finally{sjWorking(b,false);}
 });
 $('sjAdminResetQuestion')?.addEventListener('click',()=>{clearForm($('sjAdminQuestionForm'));$('sjAdminMediaFile').value='';});
 $('sjAdminQuestionSearch')?.addEventListener('input',sjRenderQuestions);
 $('sjAdminQuestionFilter')?.addEventListener('change',sjRenderQuestions);
 $('sjAdminQuestionRows')?.addEventListener('click',async e=>{
  if(!guard())return;const button=e.target.closest('[data-sj-question-edit],[data-sj-question-delete]');if(!button)return;
  const id=button.dataset.sjQuestionEdit||button.dataset.sjQuestionDelete;const q=sijalQuestions.find(q=>q.id===id);if(!q)return;
  if(button.dataset.sjQuestionEdit){const f=$('sjAdminQuestionForm');for(const key of ['id','challenge_id','question_text','position','points','explanation','media_caption'])f.elements.namedItem(key).value=q[key]??'';
   f.elements.namedItem('options').value=(q.options||[]).join('\n');f.elements.namedItem('correct_number').value=Number(q.answer_index)+1;f.elements.namedItem('media_type').value=q.media_type||'none';f.elements.namedItem('media_url').value=q.media_url||'';$('sjAdminMediaFile').value='';f.scrollIntoView({behavior:'smooth',block:'center'});return;}
  if(!confirm('حذف السؤال وإجابات المستخدمين عليه نهائياً؟'))return;
  sjWorking(button,true);try{await sjRun(db.from('qafiyah_game_questions').delete().eq('id',id));toast('حُذف السؤال.');await loadSijal();}catch(ex){toast(ex.message,true);}finally{sjWorking(button,false);}
 });
 $('sjAdminTeamRows')?.addEventListener('click',async e=>{
  if(!guard())return;const b=e.target.closest('[data-sj-team-delete]');if(!b||!confirm('حذف هذا الفريق الدائم وعضوياته؟'))return;
  try{await sjRun(db.from('qafiyah_game_teams').delete().eq('id',b.dataset.sjTeamDelete));toast('حُذف الفريق.');await loadSijal();}catch(ex){toast(ex.message,true);}
 });
 $('sjAdminPlayerSearch')?.addEventListener('input',sjRenderPlayers);
 $('sjAdminRefreshPlayers')?.addEventListener('click',loadSijal);
 $('sjAdminPlayerRows')?.addEventListener('click',async e=>{
  if(!guard())return;const b=e.target.closest('[data-sj-player-detail],[data-sj-player-hide],[data-sj-player-reset]');if(!b)return;
  const id=b.dataset.sjPlayerDetail||b.dataset.sjPlayerHide||b.dataset.sjPlayerReset;
  const p=sijalPlayers.find(x=>x.user_id===id);if(!p)return;
  if(b.dataset.sjPlayerDetail){const box=$('sjAdminPlayerDetails');box.hidden=false;box.replaceChildren();const h=document.createElement('h3');h.textContent='سجل مشاركة '+p.player;box.append(h);
   const summary=document.createElement('p');summary.textContent=`${Number(p.rounds||0)} جولات مكتملة، ${Number(p.answers||0)} إجابة، ${Number(p.correct||0)} صحيحة، ${Number(p.points||0)} نقطة. آخر نشاط: ${sjDate(p.last_played)}.`;box.append(summary);
   try{const answers=await sjRun(db.from('qafiyah_game_answers').select('question_id,is_correct,points,answered_at').eq('user_id',id).order('answered_at',{ascending:false}).limit(100));
    const perGame=new Map();for(const a of answers){const q=sijalQuestions.find(x=>x.id===a.question_id),key=sijalGames.find(g=>g.id===q?.challenge_id)?.title||'لعبة غير معروفة';const record=perGame.get(key)||{count:0,points:0};record.count++;record.points+=Number(a.points)||0;perGame.set(key,record);}
    for(const [name,v] of perGame){const row=document.createElement('p');row.textContent=`${name}: ${v.count} إجابات، ${v.points} نقطة (آخر 100 إجابة).`;box.append(row);}
    for(const a of answers.slice(0,10)){const row=document.createElement('p');row.textContent=`${sjDate(a.answered_at)} — ${a.is_correct?'صحيحة':'خاطئة'} — ${a.points} نقطة`;box.append(row);}
   }catch(err){sjMsg(err.message,true);}box.scrollIntoView({behavior:'smooth',block:'nearest'});return;
  }
  if(b.dataset.sjPlayerReset&&!confirm(`تصفير نقاط «${p.player}» وحذف سجل إجاباته نهائياً؟`))return;
  if(b.dataset.sjPlayerHide&&!confirm(p.hidden?'إعادته إلى التصنيف العام؟':'إخفاؤه من التصنيف العام دون حذف حسابه؟'))return;
  sjWorking(b,true);try{await sjRun(b.dataset.sjPlayerReset?db.rpc('qafiyah_sijal_reset_points',{p_user:id}):db.rpc('qafiyah_sijal_set_hidden',{p_user:id,p_hidden:!p.hidden}));toast('تم تحديث بيانات المتسابق.');await loadSijal();}catch(ex){toast(ex.message,true);}finally{sjWorking(b,false);}
 });
 function sjParseCsv(raw){const rows=[];let row=[],cell='',quote=false;
  for(let i=0;i<raw.length;i++){const ch=raw[i];if(ch==='"'){if(quote&&raw[i+1]==='"'){cell+='"';i++;}else quote=!quote;}
   else if(ch===','&&!quote){row.push(cell);cell='';}
   else if((ch==='\r'||ch==='\n')&&!quote){if(ch==='\r'&&raw[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}
   else cell+=ch;}
  row.push(cell);if(row.some(x=>x.trim()))rows.push(row);if(rows.length<2)return [];
  const keys=rows.shift().map(s=>s.trim().replace(/^\uFEFF/,''));return rows.map(r=>Object.fromEntries(keys.map((k,i)=>[k,r[i]??''])));
 }
 function sjImportRow(raw,i,game){
  if(!raw||typeof raw!=='object')throw Error(`السؤال ${i+1} غير صالح.`);
  const options=Array.isArray(raw.options)?raw.options:typeof raw.options==='string'?(()=>{try{const p=JSON.parse(raw.options);return Array.isArray(p)?p:raw.options.split('|');}catch{return raw.options.split('|');}})():[];
  const list=options.map(x=>String(x).trim()).filter(Boolean),num=raw.answer_index!==undefined&&String(raw.answer_index).trim()!==''?Number(raw.answer_index):Number(raw.correct_number)-1;
  const points=Number(raw.points??10),position=Number(raw.position??i);
  const text=String(raw.question_text||'').trim();
  if(text.length<3||text.length>1500||list.length<2||list.length>6||!Number.isInteger(num)||num<0||num>=list.length||!Number.isInteger(points)||points<1||points>100||!Number.isInteger(position)||position<0)throw Error(`السؤال ${i+1}: تحقق من النص والخيارات والإجابة والنقاط.`);
  const link=String(raw.media_url||'').trim(),kind=String(raw.media_type||'none');
  if(link){let u;try{u=new URL(link);}catch{throw Error(`السؤال ${i+1}: رابط المرفق غير صحيح.`);}if(u.protocol!=='https:'||!['image','audio','video'].includes(kind))throw Error(`السؤال ${i+1}: رابط المرفق أو نوعه غير صالح.`);}
  return {challenge_id:game.id,question_text:text,options:list,answer_index:num,points,position,explanation:String(raw.explanation||'').trim(),media_url:link||null,media_type:link?kind:'none',media_caption:String(raw.media_caption||'')};
 }
 $('sjAdminDownloadTemplate')?.addEventListener('click',()=>{
  const sample={questions:[{question_text:'من القائل: على قدر أهل العزم تأتي العزائم؟',options:['المتنبي','أبو تمام','البحتري','أحمد شوقي'],answer_index:0,explanation:'أبو الطيب المتنبي.',points:10,position:1}]};
  const url=URL.createObjectURL(new Blob([JSON.stringify(sample,null,2)],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='sijal-questions-template.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
 });
 $('sjAdminImport')?.addEventListener('click',async e=>{
  if(!guard())return;const b=e.currentTarget,file=$('sjAdminImportFile').files[0],game=sijalGames.find(x=>x.id===$('sjAdminImportGame').value);
  if(!game)return sjMsg('اختر اللعبة التي ستستورد الأسئلة إليها.',true);
  if(!file)return sjMsg('اختر ملف JSON أو CSV أولاً.',true);
  if(file.size>2*1024*1024)return sjMsg('ملف الاستيراد أكبر من 2 ميجابايت.',true);
  sjWorking(b,true);
  try{
   const raw=await file.text(),parsed=/\.csv$/i.test(file.name)?sjParseCsv(raw):JSON.parse(raw),items=Array.isArray(parsed)?parsed:parsed.questions;
   if(!Array.isArray(items)||!items.length||items.length>1000)throw Error('يجب أن يحوي الملف بين سؤال واحد و1000 سؤال.');
   const normalized=items.map((item,i)=>sjImportRow(item,i,game)),existing=new Set(sijalQuestions.filter(q=>q.challenge_id===game.id).map(q=>q.question_text.trim().toLocaleLowerCase('ar')));
   const batch=normalized.filter(row=>{const key=row.question_text.toLocaleLowerCase('ar');if(existing.has(key))return false;existing.add(key);return true;});
   if(!batch.length){sjMsg('جميع الأسئلة موجودة مسبقاً؛ لم تُضف أي نسخة مكررة.');return;}
   if(!confirm(`سيتم استيراد ${batch.length} سؤالاً جديداً إلى «${game.title}» وتجاهل ${items.length-batch.length} مكرراً. هل تريد المتابعة؟`))return;
   let count=0;for(let i=0;i<batch.length;i+=100){await sjRun(db.from('qafiyah_game_questions').insert(batch.slice(i,i+100)));count+=Math.min(100,batch.length-i);sjMsg(`تمت إضافة ${count} من ${batch.length} سؤالاً.`);}
   $('sjAdminImportFile').value='';toast('اكتمل استيراد الأسئلة.');await loadSijal();sjMsg('اكتمل الاستيراد: '+count+' سؤالاً جديداً.');
  }catch(ex){sjMsg('تعذر الاستيراد: '+ex.message,true);}finally{sjWorking(b,false);}
 });
 // إبقاء حماية الصفحة القديمة وملفات مُجيب بلا تعديل.
 if(typeof SECTION_INFO!=='undefined'){
  SECTION_INFO.mujeeb=['مُجيب','تخصيص المُساعد للمالك فقط',loadMujeeb];
  SECTION_INFO.sijal=['سِجال','الألعاب والأسئلة والتصنيف والمتنافسون — المالك والمدير فقط',loadSijal];
 }
 (async()=>{try{
  const data=await sjRun(db.rpc('get_my_admin_role'));const role=Array.isArray(data)?data[0]:null;
  owner=!!role?.is_active&&role.role==='owner';director=!!role?.is_active&&['owner','manager'].includes(role.role);
  if(owner)$('mujeebAdminNav')?.style.removeProperty('display');else{$('mujeebAdminNav')?.style.setProperty('display','none');$('section-mujeeb')?.style.setProperty('display','none');}
  if(director)$('sijalAdminNav')?.style.removeProperty('display');else{$('sijalAdminNav')?.style.setProperty('display','none');$('section-sijal')?.style.setProperty('display','none');}
 }catch{owner=false;director=false;$('sijalAdminNav')?.style.setProperty('display','none');}})();
 // قائمة الشعراء الأصلية تبقى قائمة اختيار فعلية؛ حقل البحث يصفّي القائمة فقط.
 window.setupQafiyahPoetSearch = async function(select, initialId){
  if(!select || select.dataset.enhanced === 'true') return;
  select.dataset.enhanced = 'true';
  select.style.display = '';
  select.required = true;
  select.setAttribute('aria-label', 'اختر الشاعر من القائمة');

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'form-control';
  search.placeholder = 'ابحث داخل قائمة الشعراء بالاسم أو اللقب...';
  search.autocomplete = 'off';
  search.setAttribute('aria-label', 'البحث داخل قائمة الشعراء');
  search.style.marginBottom = '8px';
  const status = document.createElement('div');
  status.setAttribute('aria-live','polite');
  status.style.cssText = 'font-size:12px;opacity:.7;margin-top:5px;';
  select.insertAdjacentElement('beforebegin',search);
  select.insertAdjacentElement('afterend',status);

  // النسخة القديمة من لوحة الإدارة قد تجلب أول 1000 شاعر فقط.
  // نكمل تحميل الشعراء على دفعات مع إبقاء معرّف الشاعر الأصلي.
  const byId = new Map();
  if(typeof poetsCache !== 'undefined') {
   for(const poet of poetsCache) if(poet?.id != null) byId.set(String(poet.id),poet);
  }
  for(const option of Array.from(select.options)) {
   if(option.value && !byId.has(String(option.value))) {
    byId.set(String(option.value),{id:option.value,name:option.textContent.trim(),nickname:''});
   }
  }
  const chosenId = String(initialId ?? select.value ?? '');
  let selectedId = chosenId;
  let queryText = '';
  let loading = true;
  const normalize = v => String(v ?? '')
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g,'')
    .replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي')
    .toLocaleLowerCase('ar').trim();

  function redraw(){
   const previous = selectedId;
   const needle = normalize(queryText);
   const all = Array.from(byId.values()).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ar'));
   const matching = needle ? all.filter(p=>normalize(`${p.name||''} ${p.nickname||''} ${(Array.isArray(p.aliases)?p.aliases.join(' '):p.aliases)||''}`).includes(needle)) : all;
   const options = [new Option('اختر الشاعر', '')];
   for(const poet of matching){
    options.push(new Option(`${poet.name||'شاعر بلا اسم'}${poet.nickname?' — '+poet.nickname:''}`,String(poet.id)));
   }
   // نُبقي الشاعر المختار ظاهراً عند البحث حتى لا نفقد علاقة القصيدة به.
   if(previous && byId.has(previous) && !matching.some(p=>String(p.id)===previous)){
    const poet = byId.get(previous);
    options.splice(1,0,new Option(`${poet.name||'الشاعر المحدد'}${poet.nickname?' — '+poet.nickname:''} (المختار حالياً)`,previous));
   }
   select.replaceChildren(...options);
   select.value = previous && byId.has(previous) ? previous : '';
   status.textContent = loading ? `جارٍ استكمال تحميل الشعراء… (${all.length})` :
      needle ? `نتائج البحث: ${matching.length} شاعر${previous&&!matching.some(p=>String(p.id)===previous)?'، بالإضافة إلى الشاعر المختار':''}` : `عدد الشعراء في القائمة: ${all.length}`;
  }

  search.addEventListener('input',()=>{queryText=search.value;redraw();});
  select.addEventListener('change',()=>{
   selectedId=select.value;
   const poet=byId.get(selectedId);
   if(poet && typeof poetsCache !== 'undefined' && !poetsCache.some(p=>String(p.id)===selectedId)){
    poetsCache.push(poet);
   }
  });
  redraw();
  try {
   const pageSize = 500;
   // لا نعتمد على حدّ Supabase الافتراضي البالغ 1000 سجل.
   for(let from=0; from<100000; from+=pageSize){
    const {data,error}=await db.from('poets')
     .select('id,name,nickname,era').order('id',{ascending:true})
     .range(from,from+pageSize-1);
    if(error) throw error;
    const batch=data||[];
    for(const poet of batch){
     byId.set(String(poet.id),poet);
     if(typeof poetsCache !== 'undefined' && !poetsCache.some(p=>String(p.id)===String(poet.id))){
      poetsCache.push(poet);
     }
    }
    if(batch.length<pageSize)break;
   }
   if(chosenId && !byId.has(chosenId)){
    const {data}=await db.from('poets').select('id,name,nickname,era').eq('id',chosenId).maybeSingle();
    if(data){byId.set(String(data.id),data);if(typeof poetsCache !== 'undefined' && !poetsCache.some(p=>String(p.id)===String(data.id))) poetsCache.push(data);}
   }
  } catch(err) {
   console.warn('تعذر تحميل القائمة الكاملة للشعراء؛ ستظل القائمة الحالية صالحة للاستخدام:',err);
   status.textContent='تعذر استكمال القائمة؛ يمكنك الاختيار من الشعراء المحمّلين.';
  } finally {
   loading=false;
   // قد يُغلق المستخدم النافذة قبل اكتمال جلب البيانات.
   if(select.isConnected)redraw();
  }
 };

})();
