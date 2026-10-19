'use strict';
document.addEventListener('DOMContentLoaded', async () => {
  const $ = id => document.getElementById(id);
  const chat = $('muChat'), input = $('muInput'), action = $('muAction'), actionIcon = $('muActionIcon');
  const overlay = $('muArchiveOverlay'), archiveList = $('muArchiveList');
  const micIcon='<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8"/>';
  const sendIcon='<path d="m21 3-7.5 18-3.8-7.7L2 9.5 21 3Z"/><path d="M21 3 9.7 13.3"/>';
  let session = null, sessions = [], pendingFile = null, busy = false, disabled = false, recognizer = null;
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
  function toast(message){$('muToast').textContent=message;$('muToast').hidden=!message;}
  function makeSession(){return {id:uid(),title:'محادثة جديدة',updated:Date.now(),messages:[]};}
  function newChat(){session=makeSession();pendingFile=null;showAttachment();input.value='';updateAction();render();overlay.hidden=true;input.focus();}
  function scrollBottom(){chat.scrollTop=chat.scrollHeight;}
  function bubble(text,role,fileName){const node=document.createElement('div');node.className=`mu-bubble ${role}`;node.textContent=text;if(fileName){const tag=document.createElement('span');tag.className='mu-fileline';tag.textContent='مرفق: '+fileName;node.appendChild(tag);}chat.appendChild(node);scrollBottom();return node;}
  function render(){chat.replaceChildren();if(!session.messages.length){const welcome=document.createElement('div');welcome.className='mu-welcome';welcome.id='muWelcome';const icon=document.createElement('span');icon.className='mu-welcome-mark';icon.textContent='م';const title=document.createElement('h1');title.textContent='مرحباً، كيف يمكنني مساعدتك؟';welcome.append(icon,title);chat.appendChild(welcome);}else{session.messages.forEach(m=>bubble(m.text,m.role,m.fileName));}scrollBottom();}
  function persist(){session.updated=Date.now();const at=sessions.findIndex(x=>x.id===session.id);if(at>=0)sessions.splice(at,1);sessions.unshift(session);sessions.sort((a,b)=>b.updated-a.updated);save();}
  function archive(){archiveList.replaceChildren();if(!sessions.length){const empty=document.createElement('p');empty.className='mu-empty';empty.textContent='لا توجد محادثات سابقة';archiveList.appendChild(empty);return;}sessions.forEach(s=>{const row=document.createElement('div');row.className='mu-entry'+(session?.id===s.id?' active':'');const open=document.createElement('button');open.type='button';open.className='mu-entry-open';const title=document.createElement('strong');title.textContent=s.title||'محادثة';const date=document.createElement('small');date.textContent=new Date(s.updated).toLocaleDateString('ar-SA');open.append(title,date);open.addEventListener('click',()=>{if(busy){toast('انتظر حتى تكتمل الإجابة.');return;}session=s;render();overlay.hidden=true;toast('');});const del=document.createElement('button');del.type='button';del.className='mu-icon mu-entry-delete';del.title='حذف المحادثة';del.setAttribute('aria-label','حذف '+s.title);del.textContent='×';del.addEventListener('click',()=>{if(busy){toast('انتظر حتى تكتمل الإجابة.');return;}if(!confirm('حذف هذه المحادثة نهائياً من هذا الجهاز؟'))return;sessions=sessions.filter(x=>x.id!==s.id);save();if(session.id===s.id)newChat();archive();});row.append(open,del);archiveList.appendChild(row);});}
  $('muArchive').addEventListener('click',()=>{archive();overlay.hidden=false;});
  $('muCloseArchive').addEventListener('click',()=>overlay.hidden=true);
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.hidden=true;});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')overlay.hidden=true;});
  $('muNew').addEventListener('click',()=>{if(busy)return;newChat();toast('');});
  $('muBack').addEventListener('click',()=>{try{const ref=new URL(document.referrer);if(ref.origin===location.origin && !ref.pathname.endsWith('/mujeeb.html')){location.href=ref.href;return;}}catch{}location.href='index.html';});
  function updateAction(){const hasText=!!input.value.trim()||!!pendingFile;actionIcon.innerHTML=hasText?sendIcon:micIcon;action.setAttribute('aria-label',hasText?'إرسال الرسالة':'الإملاء الصوتي');action.title=hasText?'إرسال':'الإملاء الصوتي';action.disabled=busy||disabled;input.style.height='auto';input.style.height=Math.min(input.scrollHeight,170)+'px';}
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
  // Settings only affect availability, not the required public welcome text.
  try{if(window.supabaseClient){const {data}=await window.supabaseClient.from('qafiyah_mujeeb_settings').select('enabled').eq('id',1).maybeSingle();if(data?.enabled===false){disabled=true;toast('مُجيب غير متاح حالياً.');}}}catch{}
  newChat();updateAction();
});
