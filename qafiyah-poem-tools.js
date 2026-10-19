'use strict';
// شريط إعدادات مستقل في صفحة القصيدة، دون تعديل قالب القصائد الحالي أو قاعدة بياناتها.
(() => {
 const STORAGE='qafiyah-poem-view-v1';
 const defaults={style:'original',size:24};
 let preferences=defaults;
 try{preferences={...defaults,...JSON.parse(localStorage.getItem(STORAGE)||'{}')}}catch{}
 const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(preferences))}catch{}};
 let host=null,lines=null,rawHTML=null,rawLines=[],controls=null,exportOpen=false;
 const sampleText=()=>rawLines.filter(Boolean);
 const poemTitle=()=>host?.querySelector('h1')?.textContent?.trim()||'قصيدة';
 const poetName=()=>host?.querySelector('.qafiyah-detail-poet')?.textContent?.replace(/\s+/g,' ').trim()||'القافية';
 function reformat(){if(!lines)return;lines.classList.remove('q-diwani','q-plain','q-modern','q-settings');lines.style.removeProperty('--q-poem-size');
 if(preferences.style==='original'&&Number(preferences.size)===defaults.size){lines.innerHTML=rawHTML;return;}
 lines.classList.add('q-settings');lines.style.setProperty('--q-poem-size',`${Math.min(42,Math.max(16,Number(preferences.size)||24))}px`);
 if(preferences.style==='original'){lines.innerHTML=rawHTML;return;}
 lines.replaceChildren();
 const cleaned=rawLines.filter(s=>s!==null);
 if(preferences.style==='diwani'){
 lines.classList.add('q-diwani');
 const chunks=[];
 for(let i=0;i<cleaned.length;i++){
  const raw=cleaned[i];if(!raw){chunks.push(null);continue;}
  // إن وُجد فاصل شطرين صريح يُستخدم، وإلا يُنسّق كل سطرين متجاورين كشطرين.
  const halves=raw.split(/\s*(?:\*{2,}|…|\.\.\.|\s\/\s)\s*/).filter(Boolean);
  if(halves.length>=2)chunks.push(halves.slice(0,2));
  else{const next=cleaned[i+1];if(next && !/\s*(?:\*{2,}|…|\.\.\.)\s*/.test(next)){chunks.push([raw,next]);i++;}else chunks.push([raw,'']);}
 }
 for(const couplet of chunks){if(!couplet){const gap=document.createElement('div');gap.className='qafiyah-poem-gap';lines.append(gap);continue;}const p=document.createElement('p');p.className='qafiyah-poem-line';for(const half of couplet){const s=document.createElement('span');s.className='q-hemistich';s.textContent=half;p.append(s);}lines.append(p);}
 }else{
 lines.classList.add(preferences.style==='modern'?'q-modern':'q-plain');
 for(const text of cleaned){if(!text){const gap=document.createElement('div');gap.className='qafiyah-poem-gap';lines.append(gap);continue;}const p=document.createElement('p');p.className='qafiyah-poem-line';p.textContent=preferences.style==='plain'?text.replace(/\s*(?:\*{2,}|…|\.\.\.)\s*/g,' ... '):text;lines.append(p);}
 }
 }
 function makeButton(label,onClick){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',onClick);return b;}
 function addControls(){if(controls||!lines)return;controls=document.createElement('div');controls.className='q-poem-actions';controls.setAttribute('aria-label','خيارات عرض القصيدة');
 const label=document.createElement('label');label.textContent='العرض:';const mode=document.createElement('select');mode.setAttribute('aria-label','طريقة عرض الأبيات');for(const [val,title]of [['original','العرض الأصلي'],['plain','سطر بعد سطر'],['diwani','شطران كالديوان'],['modern','نثري متدرج']]){const o=new Option(title,val);mode.add(o);}mode.value=preferences.style;
 const sizeLabel=document.createElement('label');sizeLabel.textContent='الخط:';const size=document.createElement('select');size.setAttribute('aria-label','حجم الخط');for(const val of [16,18,20,22,24,26,28,30,34,38,42])size.add(new Option(val+' بكسل',val));size.value=String(preferences.size);
 mode.addEventListener('change',()=>{preferences.style=mode.value;save();reformat();});size.addEventListener('change',()=>{preferences.size=+size.value;save();reformat();});
 controls.append(label,mode,sizeLabel,size,makeButton('📸 صورة القصيدة',openExport));
 lines.before(controls);reformat();
 }
 // تجهيز صور عالية الدقة لكل صفحة من أبيات القصيدة باستعمال Canvas محلياً بلا خدمات خارجية.
 async function renderImage(pageIndex){const texts=sampleText(),perPage=18,total=Math.max(1,Math.ceil(texts.length/perPage)),page=Math.min(pageIndex,total-1),chosen=texts.slice(page*perPage,(page+1)*perPage);
 try{await document.fonts.load('bold 32px Saudi')}catch{}
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');const w=1200,pad=100,fontPx=37,lineHeight=82;
 ctx.font=`${fontPx}px Saudi, Arial, sans-serif`;
 const entries=[];for(const text of chosen){let buffer='';for(const word of text.split(/\s+/)){const check=buffer?buffer+' '+word:word;if(ctx.measureText(check).width>w-2*pad && buffer){entries.push(buffer);buffer=word;}else buffer=check;}entries.push(buffer||' ');}
 const height=Math.max(630,400+entries.length*lineHeight);canvas.width=w;canvas.height=height;
 const gradient=ctx.createLinearGradient(0,0,w,height);gradient.addColorStop(0,'#fffaf5');gradient.addColorStop(1,'#f5eadd');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,height);
 ctx.strokeStyle='#986e54';ctx.lineWidth=7;ctx.strokeRect(26,26,w-52,height-52);ctx.lineWidth=2;ctx.strokeRect(43,43,w-86,height-86);
 ctx.textAlign='center';ctx.direction='rtl';ctx.fillStyle='#5b382c';ctx.font='bold 37px Saudi,Arial,sans-serif';ctx.fillText('القافية | موسوعة الشعر والأدب العربي',w/2,110);
 ctx.font='bold 49px Saudi,Arial,sans-serif';ctx.fillText(poemTitle().slice(0,55),w/2,194);
 ctx.fillStyle='#8b6250';ctx.font='28px Saudi,Arial,sans-serif';ctx.fillText(poetName().slice(0,55),w/2,247);
 ctx.strokeStyle='#bfa28d';ctx.beginPath();ctx.moveTo(pad,285);ctx.lineTo(w-pad,285);ctx.stroke();
 ctx.fillStyle='#39291f';ctx.font=`${fontPx}px Saudi,Arial,sans-serif`;entries.forEach((t,i)=>ctx.fillText(t,w/2,340+i*lineHeight));
 ctx.fillStyle='#977260';ctx.font='23px Saudi,Arial,sans-serif';ctx.fillText(`alqafiyah.com  —  ${page+1} / ${total}`,w/2,height-86);
 return canvas.toDataURL('image/png');
 }
 async function openExport(){if(exportOpen)return;exportOpen=true;const dialog=document.createElement('div');dialog.className='q-poem-export';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','حفظ صورة القصيدة');const pane=document.createElement('div');dialog.append(pane);document.body.append(dialog);const title=document.createElement('h3');title.textContent='صورة جاهزة للنشر';const img=document.createElement('img');img.alt='صورة القصيدة بإطار القافية';const actions=document.createElement('div');actions.className='q-toolbar';pane.append(title,img,actions);let page=0;const pages=Math.max(1,Math.ceil(sampleText().length/18));
 const close=()=>{dialog.remove();exportOpen=false;};
 const prev=makeButton('السابق',async()=>{page=Math.max(0,page-1);await update();}),next=makeButton('التالي',async()=>{page=Math.min(pages-1,page+1);await update();}),info=document.createElement('span');
 const saveBtn=makeButton('⬇ حفظ الصورة',()=>{const a=document.createElement('a');a.href=img.src;a.download=`القافية-${page+1}.png`;document.body.append(a);a.click();a.remove();});
 const shareBtn=makeButton('↗ مشاركة الصورة',async()=>{try{const blob=await(await fetch(img.src)).blob();const file=new File([blob],`القافية-${page+1}.png`,{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({title:poemTitle(),files:[file]});}else if(navigator.share){await navigator.share({title:poemTitle(),url:location.href});}else{saveBtn.click();}}catch(e){if(e.name!=='AbortError')alert('تعذرت المشاركة من هذا الجهاز. اختر حفظ الصورة.');}});
 actions.append(prev,info,next,saveBtn,shareBtn,makeButton('إغلاق',close));dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
 async function update(){img.alt='صورة القصيدة — الصفحة '+(page+1);img.src=await renderImage(page);info.textContent=`${page+1} من ${pages}`;prev.disabled=page===0;next.disabled=page===pages-1;}
 try{await update();}catch(err){pane.append('تعذر إنشاء الصورة على هذا المتصفح: '+err.message);}
 }
 function findPoem(){const pane=document.querySelector('#poemDetail .qafiyah-poem-lines');if(!pane||pane===lines)return;host=document.querySelector('#poemDetail');lines=pane;rawHTML=pane.innerHTML;rawLines=[...pane.children].map(n=>n.classList.contains('qafiyah-poem-gap')?null:n.textContent.trim());addControls();}
 document.addEventListener('DOMContentLoaded',()=>{findPoem();const target=document.getElementById('poemDetail');if(target){new MutationObserver(()=>findPoem()).observe(target,{childList:true,subtree:false});}});
})();
