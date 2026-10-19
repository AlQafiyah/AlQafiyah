'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  const $ = id => document.getElementById(id);
  const chat = $('muChat'), input = $('muInput'), action = $('muAction'), actionIcon = $('muActionIcon');
  const overlay = $('muArchiveOverlay'), archiveList = $('muArchiveList');
  const micIcon='<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8"/>';
  const sendIcon='<path d="M5 12h14m-7-7 7 7-7 7"/>';
  let session = null, sessions = [], pendingFile = null, busy = false, disabled = false, recognizer = null;
  // Appearance is independent from the site's theme; the typeface is NOT independent.
  const sunIcon='<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>';
  const moonIcon='<path d="M20.4 15.3A8.7 8.7 0 0 1 8.7 3.6a8.7 8.7 0 1 0 11.7 11.7Z"/>';
  const fallbackPerson='<svg class="mu-person" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/></svg>';
  let appearance = {avatar_url:null,background_dark_url:null,background_light_url:null};
  function safeImageUrl(input){try{const u=new URL(String(input||''),location.href);return ['https:','http:'].includes(u.protocol) && (u.origin===location.origin||u.hostname.endsWith('.supabase.co'))?u.href:null;}catch{return null;}}
  function setAvatar(host,src){if(!host)return;host.replaceChildren();const url=safeImageUrl(src);if(!url){host.innerHTML=fallbackPerson;return;}const im=document.createElement('img');im.alt='';im.src=url;im.loading='eager';im.addEventListener('error',()=>{host.replaceChildren();host.innerHTML=fallbackPerson;},{once:true});host.appendChild(im);}
  function themeCurrent(){return document.documentElement.dataset.muTheme==='day'?'day':'night';}
  function useTheme(mode){const d=mode==='day'?'day':'night';document.documentElement.dataset.muTheme=d;const btn=$('muTheme');btn.setAttribute('aria-label',d==='night'?'التبديل للوضع النهاري':'التبديل للوضع الليلي');btn.title=btn.getAttribute('aria-label');btn.setAttribute('aria-pressed',String(d==='day'));$('muThemeIcon').innerHTML=d==='night'?sunIcon:moonIcon;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',d==='night'?'#19191c':'#fffaf5');const url=safeImageUrl(d==='night'?appearance.background_dark_url:appearance.background_light_url);document.documentElement.style.setProperty('--mu-wall-custom',url?`url("${url}")`:'var(--mu-wall-default)');}
  $('muTheme').addEventListener('click',()=>{const next=themeCurrent()==='night'?'day':'night';try{localStorage.setItem('qafiyah_mujeeb_theme',next);}catch{}useTheme(next);});
  const fontFamilies={
    saudi:"'Qafiyah Saudi','Saudi',Tahoma,Arial,sans-serif",expo:"'Expo Arabic','Qafiyah Saudi',sans-serif",expoLight:"'Expo Arabic Light','Expo Arabic','Qafiyah Saudi',sans-serif",amiri:"'Amiri','Qafiyah Saudi',serif",naskh:"'Noto Naskh Arabic','Amiri','Qafiyah Saudi',serif",ruqaaRegular:"'QF Ruqaa Regular','Qafiyah Saudi',serif",ruqaaBold:"'QF Ruqaa Bold','Qafiyah Saudi',serif",ruqaaThin:"'QF Ruqaa Thin','Qafiyah Saudi',serif",kufi:"'QF Kufi Square','Qafiyah Saudi',sans-serif",kufiStylistic:"'QF Kufi Stylistic','Qafiyah Saudi',sans-serif",andalus:"'QF Andalus','Qafiyah Saudi',serif",reem:"'Reem Kufi','Qafiyah Saudi',sans-serif",cairo:"'Cairo','Qafiyah Saudi',sans-serif",tajawal:"'Tajawal','Qafiyah Saudi',sans-serif",messiri:"'El Messiri','Qafiyah Saudi',sans-serif",mada:"'Mada','Qafiyah Saudi',sans-serif",harmattan:"'Harmattan','Qafiyah Saudi',sans-serif",scheherazade:"'Scheherazade New','Qafiyah Saudi',serif",lateef:"'Lateef','Qafiyah Saudi',serif",katibeh:"'Katibeh','Qafiyah Saudi',serif",thuluth:"'QF Thuluth','Qafiyah Saudi',serif",ummi:"'QF Ummi','Qafiyah Saudi',serif",ummiSwash:"'QF Ummi Swash','Qafiyah Saudi',serif",ummiSolid:"'QF Ummi Solid','Qafiyah Saudi',serif",sponge:"'QF Sponge','Qafiyah Saudi',sans-serif",adabi:"'QF Adabi','Qafiyah Saudi',serif",sultan:"'QF Sultan','Qafiyah Saudi',serif",sahra:"'QF Sahra','Qafiyah Saudi',serif",quranQalam:"'QF Quran Qalam','Qafiyah Saudi',serif",quranAmiri:"'QF Quran Amiri','Qafiyah Saudi',serif",quranSaleem:"'QF Quran Saleem','Qafiyah Saudi',serif",mushaf:"'QF Mushaf','Qafiyah Saudi',serif",naskhTahrir:"'QF Naskh Tahrir','Qafiyah Saudi',serif",helal:"'QF Helal','Qafiyah Saudi',serif",baghdadNaskh:"'QF Baghdad Naskh','Qafiyah Saudi',serif",topaz:"'QF Topaz','Qafiyah Saudi',serif",thuluthMadd:"'QF Thuluth Madd','Qafiyah Saudi',serif",diwani1:"'QF Diwani One','Qafiyah Saudi',serif",diwani2:"'QF Diwani Two','Qafiyah Saudi',serif",palestine:"'QF Palestine','Qafiyah Saudi',serif",uthmanBold:"'QF Uthman Taha Bold','Qafiyah Saudi',serif",uthmani:"'QF Uthmani','Qafiyah Saudi',serif",alAwwal:"'QF Al Awwal','Qafiyah Saudi',sans-serif",arabicPoetry:"'QF Arabic Poetry','Qafiyah Saudi',serif",masmak:"'QF Masmak','Qafiyah Saudi',sans-serif",yearCamel:"'QF Year Camel','Qafiyah Saudi',sans-serif",watad:"'QF Watad','Qafiyah Saudi',sans-serif",thmanyah:"'QF Thmanyah','Qafiyah Saudi',serif",alnaseeb:"'QF Alnaseeb','Qafiyah Saudi',serif",alAwwalBold:"'QF Al Awwal Bold Web','Qafiyah Saudi',sans-serif"
  };
  function applySiteFont(){let key='saudi';try{key=localStorage.getItem('qafiyah_font')||'saudi';}catch{}if(key==='aref')key='ruqaaRegular';document.documentElement.style.setProperty('--qafiyah-font-family',fontFamilies[key]||fontFamilies.saudi);}
  applySiteFont();useTheme(themeCurrent());
  // Keep the composer above soft keyboards on browsers with visualViewport (including mobile Safari).
  function syncViewport(){
    const v=window.visualViewport;
    if(!v)return;
    const height=Math.max(240,Math.round(v.height));
    document.documentElement.style.setProperty('--mu-viewport-height',height+'px');
  }
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',syncViewport,{passive:true});
    window.visualViewport.addEventListener('scroll',syncViewport,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(syncViewport,200),{passive:true});
    syncViewport();
  }

  window.addEventListener('storage',e=>{if(e.key==='qafiyah_font')applySiteFont();if(e.key==='qafiyah_mujeeb_theme')useTheme(e.newValue);});
  window.addEventListener('pageshow',applySiteFont);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)applySiteFont();});
  async function refreshAppearance(){
    try{const db=window.supabaseClient;if(!db)return;const {data,error}=await db.from('qafiyah_mujeeb_settings').select('enabled,title,short_description,avatar_url,background_dark_url,background_light_url').eq('id',1).maybeSingle();if(error)throw error;if(!data)return;
      appearance=data;
      $('muName').textContent=String(data.title||'مُجيب').slice(0,70);
      $('muSubtitle').textContent=String(data.short_description||'مساعد القافية الأدبي').slice(0,120);
      setAvatar($('muAvatar'),data.avatar_url);setAvatar(document.querySelector('.mu-welcome-avatar'),data.avatar_url);
      useTheme(themeCurrent());
      disabled=(data.enabled===false);updateAction();
    }catch{/* SQL not yet migrated or temporary network issue: keep default accessible UI. */}
  }

  let storageKey = 'alqafiyah-mujeeb-v2-guest';
  // Account-scoped on this browser. Not cloud sync; do not save sensitive data on shared devices.
  try {
    const client=window.supabaseClient;
    if (client?.auth?.getUser) {
      const {data}=await client.auth.getUser();
      if (data?.user?.id) storageKey = `alqafiyah-mujeeb-v2-${data.user.id}`;
    }
  } catch {}
  const uid=()=> (typeof crypto!=='undefined'&&crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(sessions.slice(0,50)));}catch{toast('تعذر حفظ السجل على هذا الجهاز.');}};
  const clean = value => String(value||'').slice(0,12000);
  try {
    const loaded = JSON.parse(localStorage.getItem(storageKey)||'[]');
    if(Array.isArray(loaded)) sessions=loaded.filter(x=>x&&typeof x.id==='string'&&Array.isArray(x.messages)).slice(0,50).map(x=>({id:x.id,title:clean(x.title).slice(0,100),updated:Number(x.updated)||Date.now(),messages:x.messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.text==='string').slice(-80)}));
  } catch { sessions=[]; }
  let toastTimer;function toast(message){const el=$('muToast');clearTimeout(toastTimer);el.textContent=message;el.hidden=!message;if(message)toastTimer=setTimeout(()=>{el.hidden=true;el.textContent='';},5000);}
  function makeSession(){return {id:uid(),title:'محادثة جديدة',updated:Date.now(),messages:[]};}
  function newChat(focusInput=false){session=makeSession();pendingFile=null;showAttachment();input.value='';updateAction();render();overlay.hidden=true;if(focusInput)input.focus();}
  function scrollBottom(){chat.scrollTop=chat.scrollHeight;}
  function bubble(text,role,fileName){const line=document.createElement('div');line.className=`mu-line ${role}`;const node=document.createElement('div');node.className='mu-bubble';node.textContent=text;if(fileName){const tag=document.createElement('span');tag.className='mu-fileline';tag.textContent='مرفق: '+fileName;node.appendChild(tag);}line.appendChild(node);chat.appendChild(line);scrollBottom();return node;}
  function render(){chat.replaceChildren();if(!session.messages.length){const welcome=document.createElement('div');welcome.className='mu-welcome';welcome.id='muWelcome';const icon=document.createElement('span');icon.className='mu-welcome-avatar';setAvatar(icon,appearance.avatar_url);const title=document.createElement('h1');title.textContent='مرحباً، كيف يمكنني مساعدتك؟';welcome.append(icon,title);chat.appendChild(welcome);}else{session.messages.forEach(m=>bubble(m.text,m.role,m.fileName));}scrollBottom();}
  function persist(){session.updated=Date.now();const at=sessions.findIndex(x=>x.id===session.id);if(at>=0)sessions.splice(at,1);sessions.unshift(session);sessions.sort((a,b)=>b.updated-a.updated);save();}
  function archive(){archiveList.replaceChildren();if(!sessions.length){const empty=document.createElement('p');empty.className='mu-empty';empty.textContent='لا توجد محادثات سابقة';archiveList.appendChild(empty);return;}sessions.forEach(s=>{const row=document.createElement('div');row.className='mu-entry'+(session?.id===s.id?' active':'');const open=document.createElement('button');open.type='button';open.className='mu-entry-open';const title=document.createElement('strong');title.textContent=s.title||'محادثة';const date=document.createElement('small');date.textContent=new Date(s.updated).toLocaleDateString('ar-SA');open.append(title,date);open.addEventListener('click',()=>{if(busy){toast('انتظر حتى تكتمل الإجابة.');return;}session=s;render();overlay.hidden=true;toast('');});const del=document.createElement('button');del.type='button';del.className='mu-icon mu-entry-delete';del.title='حذف المحادثة';del.setAttribute('aria-label','حذف '+s.title);del.textContent='×';del.addEventListener('click',()=>{if(busy){toast('انتظر حتى تكتمل الإجابة.');return;}if(!confirm('حذف هذه المحادثة نهائياً من هذا الجهاز؟'))return;sessions=sessions.filter(x=>x.id!==s.id);save();if(session.id===s.id)newChat();archive();});row.append(open,del);archiveList.appendChild(row);});}
  $('muArchive').addEventListener('click',()=>{archive();overlay.hidden=false;});
  $('muCloseArchive').addEventListener('click',()=>overlay.hidden=true);
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.hidden=true;});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')overlay.hidden=true;});
  $('muNew').addEventListener('click',()=>{if(busy)return;newChat(true);toast('');});
  $('muBack').addEventListener('click',()=>{try{const ref=new URL(document.referrer);if(ref.origin===location.origin && !ref.pathname.endsWith('/mujeeb.html')){location.href=ref.href;return;}}catch{}location.href='index.html';});
  function updateAction(){const hasText=!!input.value.trim()||!!pendingFile;actionIcon.innerHTML=hasText?sendIcon:micIcon;action.classList.toggle('is-send',hasText);action.setAttribute('aria-label',hasText?'إرسال الرسالة':'الإملاء الصوتي');action.title=hasText?'إرسال':'الإملاء الصوتي';action.disabled=busy||disabled;input.style.height='auto';input.style.height=Math.min(input.scrollHeight,170)+'px';}
  input.addEventListener('input',()=>{updateAction();toast('');});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit();}});
  const maxImage=1024*1024,maxText=120*1024;
  $('muPlus').addEventListener('click',()=>$('muFile').click());
  $('muFile').addEventListener('change',async e=>{
    const file=e.target.files?.[0];e.target.value='';if(!file)return;
    const image=/^image\/(png|jpeg|webp)$/.test(file.type);
    const plain=/^(text\/plain|text\/markdown|text\/csv|application\/json)$/.test(file.type)||/\.(txt|md|csv|json)$/i.test(file.name);
    if(!image&&!plain){toast('الملفات المدعومة: صور PNG وJPG وWebP، وملفات TXT وMD وCSV وJSON.');return;}
    if(file.size>(image?maxImage:maxText)){toast(image?'الصورة كبيرة؛ الحد الأقصى 1 ميجابايت.':'الملف كبير؛ الحد الأقصى 120 كيلوبايت.');return;}
    try{if(image){const b64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});pendingFile={name:file.name,type:'image',data:b64};}else{pendingFile={name:file.name,type:'text',data:(await file.text()).slice(0,12000)};}showAttachment();updateAction();toast('');}catch{toast('تعذر قراءة الملف.');}
  });
  function showAttachment(){const el=$('muAttachments');el.replaceChildren();el.hidden=!pendingFile;if(!pendingFile)return;const wrap=document.createElement('div');wrap.className='mu-attachment';const name=document.createElement('span');name.textContent=pendingFile.name;const remove=document.createElement('button');remove.textContent='×';remove.type='button';remove.setAttribute('aria-label','إزالة المرفق');remove.addEventListener('click',()=>{pendingFile=null;showAttachment();updateAction();});wrap.append(name,remove);el.append(wrap);}
  async function submit(){if(busy||disabled)return;const message=input.value.trim();if(!message&&!pendingFile)return;const attachment=pendingFile;input.value='';pendingFile=null;showAttachment();updateAction();toast('');if(!session.messages.length){session.title=(message||`مرفق ${attachment.name}`).replace(/\s+/g,' ').slice(0,55);}
    session.messages.push({role:'user',text:message||'حلّل المرفق المرفق',fileName:attachment?.name});persist();render();busy=true;updateAction();const pending=bubble('جارٍ إعداد الإجابة…','assistant');pending.classList.add('pending');
    try{
      const previous=session.messages.slice(0,-1).slice(-8).map(x=>({role:x.role,content:x.text}));
      const payload={message:message||'اشرح محتوى المرفق',history:previous};
      if(attachment)payload.attachment=attachment;
      const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),45000);
      let response;try{response=await fetch('/api/mujeeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:abort.signal});}finally{clearTimeout(timer);}
      const data=await response.json();if(!response.ok||!data.answer)throw new Error('response');
      pending.textContent=data.answer;pending.classList.remove('pending');session.messages.push({role:'assistant',text:data.answer});persist();
    }catch{pending.textContent='تعذر الحصول على إجابة';pending.classList.remove('pending');session.messages.push({role:'assistant',text:'تعذر الحصول على إجابة'});persist();}
    finally{busy=false;updateAction();scrollBottom();}
  }
  $('muForm').addEventListener('submit',e=>{e.preventDefault();submit();});
  action.addEventListener('click',()=>{if(input.value.trim()||pendingFile)submit();else voice();});
  function voice(){const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){toast('الإملاء الصوتي غير مدعوم في هذا المتصفح.');return;}
    if(recognizer){recognizer.stop();return;}
    try{const rec=new Speech();recognizer=rec;rec.lang='ar-SA';rec.interimResults=false;rec.continuous=false;toast('أستمع إليك الآن…');rec.onresult=e=>{const words=Array.from(e.results).map(r=>r[0]?.transcript||'').join(' ');input.value=(input.value?input.value+' ':'')+words;updateAction();toast('');};rec.onerror=()=>toast('تعذر التعرف على الصوت. جرّب الكتابة.');rec.onend=()=>{recognizer=null;if($('muToast').textContent==='أستمع إليك الآن…')toast('');};rec.start();}catch{recognizer=null;toast('تعذر تشغيل الميكروفون.');}
  }
  newChat();updateAction();await refreshAppearance();
  // A change by the owner also propagates to long-open conversations.
  setInterval(()=>{if(document.visibilityState==='visible')refreshAppearance();},60000);
});
