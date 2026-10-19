'use strict';
// فروع الإدارة الجديدة: صلاحيات العرض محمية أيضاً بسياسات RLS في SQL.
(() => {
 const db=window.supabaseClient,$=id=>document.getElementById(id);
 let director=false,challengeRows=[],questionRows=[],teamRows=[];
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const toast=(s,err=false)=>typeof showToast==='function'?showToast(s,err?'error':'success'):alert(s);
 function guard(){if(!director){toast('هذه الخاصية مخصصة للمالك والمدير فقط.',true);return false;}return true;}
 const dataFrom=f=>Object.fromEntries(new FormData(f).entries());
 function clearForm(f){f.reset();f.elements.namedItem('id').value='';}
 async function loadMujeeb(){if(!guard())return;const {data,error}=await db.from('qafiyah_mujeeb_settings').select('*').eq('id',1).maybeSingle();if(error)return toast('تعذر جلب إعدادات مُجيب: '+error.message,true);const form=$('mujeebAdminForm');if(!data)return;for(const k of ['title','greeting','system_prompt'])form.elements[k].value=data[k]??'';form.elements.enabled.value=String(data.enabled);}
 $('mujeebAdminForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!guard())return;const d=dataFrom(e.currentTarget);if(!d.system_prompt.trim())return toast('أدخل تعليمات المساعد.',true);const {error}=await db.from('qafiyah_mujeeb_settings').upsert({id:1,title:d.title.trim(),greeting:d.greeting.trim(),system_prompt:d.system_prompt.trim(),enabled:d.enabled==='true',updated_at:new Date().toISOString()},{onConflict:'id'});toast(error?.message||'تم حفظ إعدادات مُجيب.',!!error);});
 async function loadMidmar(){if(!guard())return;
 const [c,q,t]=await Promise.all([db.from('qafiyah_challenges').select('*').order('created_at',{ascending:false}),db.from('qafiyah_game_questions').select('*').order('position'),db.from('qafiyah_game_teams').select('id,name,captain').order('created_at',{ascending:false})]);
 if(c.error||q.error||t.error)return toast('تعذر قراءة بيانات مِضمار. تأكد من تشغيل ملف SQL المرفق. '+(c.error||q.error||t.error).message,true);
 challengeRows=c.data||[];questionRows=q.data||[];teamRows=t.data||[];
 $('challengeAdminRows').innerHTML=challengeRows.map(x=>`<tr><td>${escape(x.title)}</td><td>${escape(x.kind)}</td><td>${x.published?'منشورة':'مسودة'}</td><td><button class="btn btn-secondary btn-small" type="button" data-challenge-edit="${x.id}">تعديل</button> <button class="btn btn-danger btn-small" type="button" data-challenge-delete="${x.id}">حذف</button></td></tr>`).join('')||'<tr><td colspan="4">لا توجد مسابقات بعد.</td></tr>';
 $('questionChallenge').innerHTML='<option value="">اختر المسابقة</option>'+challengeRows.map(x=>`<option value="${x.id}">${escape(x.title)}</option>`).join('');
 $('questionsAdminRows').innerHTML=questionRows.map(x=>`<tr><td>${escape(x.question_text.slice(0,90))}</td><td>${escape(challengeRows.find(c=>c.id===x.challenge_id)?.title||'—')}</td><td><button type="button" class="btn btn-secondary btn-small" data-question-edit="${x.id}">تعديل</button> <button type="button" class="btn btn-danger btn-small" data-question-delete="${x.id}">حذف</button></td></tr>`).join('')||'<tr><td colspan="3">لا توجد أسئلة.</td></tr>';
 $('teamsAdminRows').innerHTML=teamRows.map(x=>`<tr><td>${escape(x.name)}</td><td><button class="btn btn-danger btn-small" type="button" data-team-delete="${x.id}">حذف الفريق</button></td></tr>`).join('')||'<tr><td colspan="2">لا توجد فرق.</td></tr>';
 }
 $('challengeAdminForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!guard())return;const form=e.currentTarget,d=dataFrom(form),id=d.id;const payload={title:d.title.trim(),description:d.description.trim(),kind:d.kind,category:d.category.trim(),published:d.published==='true',updated_at:new Date().toISOString()};const r=id?await db.from('qafiyah_challenges').update(payload).eq('id',id):await db.from('qafiyah_challenges').insert(payload);if(r.error)return toast(r.error.message,true);clearForm(form);toast('تم حفظ المسابقة.');loadMidmar();});
 $('questionAdminForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!guard())return;const form=e.currentTarget,d=dataFrom(form);const options=d.options.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(options.length<2||options.length>6)return toast('أدخل من خيارين إلى ستة خيارات.',true);const answer=Number(d.correct_number)-1;if(answer<0||answer>=options.length)return toast('رقم الإجابة الصحيحة خارج الخيارات.',true);if(!d.challenge_id)return toast('اختر مسابقة.',true);const payload={challenge_id:d.challenge_id,question_text:d.question_text.trim(),options,answer_index:answer,points:Number(d.points),position:Number(d.position),explanation:d.explanation.trim()};const r=d.id?await db.from('qafiyah_game_questions').update(payload).eq('id',d.id):await db.from('qafiyah_game_questions').insert(payload);if(r.error)return toast(r.error.message,true);clearForm(form);toast('تم حفظ السؤال.');loadMidmar();});
 $('resetChallengeForm')?.addEventListener('click',()=>clearForm($('challengeAdminForm')));
 $('resetQuestionForm')?.addEventListener('click',()=>clearForm($('questionAdminForm')));
 $('challengeAdminRows')?.addEventListener('click',async e=>{if(!guard())return;const edit=e.target.closest('[data-challenge-edit]'),del=e.target.closest('[data-challenge-delete]');if(edit){const x=challengeRows.find(v=>v.id===edit.dataset.challengeEdit),f=$('challengeAdminForm');if(!x)return;for(const k of ['id','title','description','kind','category'])f.elements[k].value=x[k]||'';f.elements.published.value=String(x.published);f.scrollIntoView({behavior:'smooth',block:'center'});}if(del&&confirm('حذف المسابقة وجميع أسئلتها المرتبطة؟')){const r=await db.from('qafiyah_challenges').delete().eq('id',del.dataset.challengeDelete);toast(r.error?.message||'حُذفت المسابقة.',!!r.error);loadMidmar();}});
 $('questionsAdminRows')?.addEventListener('click',async e=>{if(!guard())return;const edit=e.target.closest('[data-question-edit]'),del=e.target.closest('[data-question-delete]');if(edit){const x=questionRows.find(v=>v.id===edit.dataset.questionEdit),f=$('questionAdminForm');if(!x)return;for(const k of ['id','challenge_id','question_text','points','position','explanation'])f.elements[k].value=x[k]??'';f.elements.options.value=(x.options||[]).join('\n');f.elements.correct_number.value=x.answer_index+1;f.scrollIntoView({behavior:'smooth',block:'center'});}if(del&&confirm('حذف السؤال ونتائجه السابقة؟')){const r=await db.from('qafiyah_game_questions').delete().eq('id',del.dataset.questionDelete);toast(r.error?.message||'حُذف السؤال.',!!r.error);loadMidmar();}});
 $('teamsAdminRows')?.addEventListener('click',async e=>{if(!guard())return;const del=e.target.closest('[data-team-delete]');if(del&&confirm('حذف الفريق وإلغاء عضوية لاعبيه؟')){const r=await db.from('qafiyah_game_teams').delete().eq('id',del.dataset.teamDelete);toast(r.error?.message||'حُذف الفريق.',!!r.error);loadMidmar();}});
 // نسجل الأقسام الجديدة في نفس نظام التنقل الموجود دون تغيير الأقسام القديمة.
 if(typeof SECTION_INFO!=='undefined'){SECTION_INFO.mujeeb=['مُجيب','إعدادات المساعد الأدبي — المالك والمدير فقط',loadMujeeb];SECTION_INFO.midmar=['مِضمار','المسابقات والأسئلة والفرق — المالك والمدير فقط',loadMidmar];}
 (async()=>{try{const r=await db.rpc('get_my_admin_role');const role=r.data?.[0];director=!!role?.is_active&&['owner','manager'].includes(role.role);if(!director){$('mujeebAdminNav')?.style.setProperty('display','none');$('midmarAdminNav')?.style.setProperty('display','none');}else{$('mujeebAdminNav')?.style.removeProperty('display');$('midmarAdminNav')?.style.removeProperty('display');}}catch{director=false;}})();
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
