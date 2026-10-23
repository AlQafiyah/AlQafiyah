/* أدوات القراءة والمشاركة | القافية | نسخة 2
   ترتبط بمحتوى الصفحة الحالي دون تعديل البيانات أو خط الموقع العام. */
(()=>{
'use strict';
const FORMATS={diwan:'الشكل الأول',original:'الشكل الثاني',star:'الشكل الثالث'};
const FONT_LABELS={saudi:'السعودي (الأساسي)',expo:'المعرض العربي',expoLight:'المعرض العربي الخفيف',amiri:'أميري',naskh:'النسخ',ruqaaRegular:'الرقعة العادي',ruqaaBold:'الرقعة العريض',ruqaaThin:'الرقعة الرفيع',kufi:'الكوفي المربع',kufiStylistic:'الكوفي',andalus:'الأندلسي',reem:'ريم كوفي',cairo:'القاهرة',tajawal:'تجوال',messiri:'المسيري',mada:'مدى',harmattan:'هارماتان',scheherazade:'شهرزاد',lateef:'لطيف',katibeh:'كتيبة',thuluth:'الثلث',ummi:'أمّي',ummiSwash:'أمّي المزخرف',ummiSolid:'أمّي المصمت',sponge:'الإسفنجي العربي',adabi:'الأدبي',sultan:'السلطان',sahra:'الصحراء',quranQalam:'قرآن القلم',quranAmiri:'قرآن أميري',quranSaleem:'قرآن سليم',mushaf:'المصحف',naskhTahrir:'نسخ تحرير',helal:'الهلال',baghdadNaskh:'بغداد',topaz:'توباز',thuluthMadd:'الثلث بالمد',diwani1:'الديواني الأول',diwani2:'الديواني الثاني',palestine:'فلسطين',uthmanBold:'عثمان طه',uthmani:'النسخ العثماني',alAwwal:'الأول',arabicPoetry:'الشعر العربي',masmak:'المصمك',yearCamel:'الإبل',watad:'وتد',thmanyah:'ثمانية',alnaseeb:'النسيب',alAwwalBold:'الأول العريض'};
const ICONS={heart:'<path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"/>',eye:'<path d="M3 12s3.4-6 9-6 9 6 9 6-3.4 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="3"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',font:'<path d="m4 19 7-14 7 14M6 15h10"/><path d="M20 8v11"/>',space:'<path d="M8 4h12M8 20h12M4 7v10m-2-8 2-2 2 2m-4 6 2 2 2-2"/>',share:'<path d="M18 8a3 3 0 1 0-2.9-3.8L8.9 8.4a3 3 0 1 0 0 7.2l6.2 4.2a3 3 0 1 0 1.1-2.4L10 13.2M10 10.8l6.2-4.2"/>',image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 11v7m-3-3 3 3 3-3"/>',link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',chev:'<path d="m6 9 6 6 6-6"/>',close:'<path d="M18 6 6 18M6 6l12 12"/>'};
const svg=(name)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||''}</svg>`;
const $=(parent,selector)=>parent.querySelector(selector);
const pageType=()=>document.body?.dataset.qafiyahDetail|| (location.pathname.toLowerCase().endsWith('poem.html')?'poem':location.pathname.toLowerCase().endsWith('article.html')?'article':location.pathname.toLowerCase().endsWith('poet.html')?'poet':null);
const max=(a,b,c)=>Math.min(c,Math.max(b,a));
let active=null;
function button(icon,label,fn){const b=document.createElement('button');b.type='button';b.className='q-reader-icon';b.innerHTML=svg(icon);b.title=label;b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b;}
function splitCouplet(text){
 // نفصل فقط عند وجود فاصل شطرين صريح، دون المساس بالعلامات داخل أي شطر.
 const segments=String(text).trim().split(/\s*(?:\*\*\*+|\*\*|···|۞|\s+\.\.\.\s+|\s+…\s+|\s+[|¦]\s+|\s+\/\s+)\s*/).filter(Boolean);
 return segments.length===2?segments:null;
}
function parseVerses(raw){
 const output=[];let pending=null;
 // Explicit delimiters are authoritative. Two separate lines form a verse only when
 // the source DOM marks them as two hemistichs; do not guess from character counts.
 for(const item of raw){
  if(item===null){if(pending){output.push({first:pending,second:''});pending=null;}output.push(null);continue;}
  const value=String(item).trim();if(!value)continue;
  const pair=splitCouplet(value);
  if(pair){if(pending){output.push({first:pending,second:''});pending=null;}output.push({first:pair[0],second:pair[1]});continue;}
  output.push({first:value,second:''});
 }
 if(pending)output.push({first:pending,second:''});
 return output;
}
function extractLines(target,type){if(type==='poem')return [...target.children].map(n=>{if(n.classList.contains('qafiyah-poem-gap'))return null;const halves=n.querySelectorAll('.q-reader-first,.q-reader-second,.hemistich,.poem-half');if(halves.length===2)return halves[0].textContent.trim()+' ۞ '+halves[1].textContent.trim();return n.textContent.trim();});return target.innerText.split(/\n+/).map(x=>x.trim()).filter(Boolean);}
function effectiveFont(s){const fonts=window.QafiyahEnhancements?.fonts||{};const selected=s.settings.font;return selected==='default'?(s.type==='poem'?'"Qafiyah Saudi", "Saudi", sans-serif':s.baseFont||getComputedStyle(s.target).fontFamily):(fonts[selected]||s.baseFont||getComputedStyle(document.body).fontFamily);}
function apply(s){
 const {target,type,settings}=s;target.classList.add('q-reader-content');target.style.setProperty('--q-reader-size',`${settings.size}px`);target.style.setProperty('--q-reader-gap',`${settings.gap}px`);target.style.setProperty('--q-reader-line-height',String(settings.lineHeight||1.9));target.style.setProperty('--q-reader-font',effectiveFont(s));
 if(type!=='poem')return;
 target.classList.toggle('q-poem-original',settings.mode==='original');target.classList.toggle('q-poem-diwan',settings.mode==='diwan');target.classList.toggle('q-poem-star',settings.mode==='star');
 if(s.richContent){
  target.querySelectorAll('.qafiyah-poem-line').forEach(p=>{
   if(!p.hasAttribute('data-q-original-text'))p.dataset.qOriginalText=p.textContent;
   const raw=p.dataset.qOriginalText;
   const pair=splitCouplet(raw);
   const strip=t=>settings.vowels?t:t.replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g,'');
   p.replaceChildren();
   if(pair&&settings.mode==='diwan'){
    const a=document.createElement('span');a.className='q-reader-first';a.textContent=strip(pair[0]);
    const b=document.createElement('span');b.className='q-reader-second';b.textContent=strip(pair[1]);p.append(a,b);
   }else p.textContent=pair?strip(pair[0])+(settings.mode==='star'?'    ۞    ':'    ···    ')+strip(pair[1]):strip(raw);
  });return;
 }
 target.replaceChildren();
 for(const rawVerse of s.verses){const verse=rawVerse&&!settings.vowels?{first:rawVerse.first.replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g,''),second:rawVerse.second.replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g,'')}:rawVerse;if(!verse){const gap=document.createElement('div');gap.className='qafiyah-poem-gap';target.append(gap);continue;}
  const p=document.createElement('p');p.className='qafiyah-poem-line q-reader-verse';
  if(settings.mode==='original'||settings.mode==='star'){
   // في العرض الأصلي كل بيت في سطر واحد، لا نصفان متجاوران.
   p.textContent=verse.first+(verse.second?(settings.mode==='star'?'    ۞    ':'    ···    ')+verse.second:'');
  }else{
   const first=document.createElement('span');first.className='q-reader-first';first.textContent=verse.first;p.append(first);
   if(verse.second){const second=document.createElement('span');second.className='q-reader-second';second.textContent=verse.second;p.append(second);}
  }target.append(p);
 }
}
function notice(s,msg){const el=s.message;el.textContent=msg;clearTimeout(s.msgTimer);s.msgTimer=setTimeout(()=>{el.textContent='';},3500);}
function addToolbar(s){const tool=document.createElement('div');tool.className='q-reader-toolbar';tool.setAttribute('role','toolbar');tool.setAttribute('aria-label','إعدادات القراءة والمشاركة');
 const d=document.createElement('div');d.className='q-reader-group';
 d.append(button('minus','تصغير الخط 2 بكسل',()=>{s.settings.size=max(s.settings.size-2,12,60);apply(s);notice(s,`حجم الخط ${s.settings.size} بكسل`);}),button('plus','تكبير الخط 2 بكسل',()=>{s.settings.size=max(s.settings.size+2,12,60);apply(s);notice(s,`حجم الخط ${s.settings.size} بكسل`);}));
 const sizeTitle=document.createElement('span');sizeTitle.className='q-reader-hint';sizeTitle.textContent='حجم الخط';d.prepend(sizeTitle);tool.append(d);
 const gap=document.createElement('div');gap.className='q-reader-group';gap.append(button('minus','تقليل التباعد بين الأسطر',()=>{s.settings.gap=max(s.settings.gap-2,0,48);apply(s);notice(s,`التباعد ${s.settings.gap} بكسل`);}),button('space','زيادة التباعد بين الأسطر',()=>{s.settings.gap=max(s.settings.gap+2,0,48);apply(s);notice(s,`التباعد ${s.settings.gap} بكسل`);}));
 gap.prepend(Object.assign(document.createElement('span'),{className:'q-reader-hint',textContent:'بين الأبيات'}));tool.append(gap);
 if(s.type==='poem'){const lineGap=document.createElement('div');lineGap.className='q-reader-group';lineGap.append(Object.assign(document.createElement('span'),{className:'q-reader-hint',textContent:'بين السطور'}),button('minus','تقليل المسافة بين السطور',()=>{s.settings.lineHeight=max(s.settings.lineHeight-.1,1.2,3);apply(s);}),button('plus','زيادة المسافة بين السطور',()=>{s.settings.lineHeight=max(s.settings.lineHeight+.1,1.2,3);apply(s);}));tool.append(lineGap);}
 if(s.type==='poem'){
  const group=document.createElement('div');group.className='q-reader-group';const label=document.createElement('label');label.className='q-reader-hint';label.textContent='العرض';const sel=document.createElement('select');sel.className='q-reader-select';sel.setAttribute('aria-label','طريقة عرض القصيدة');for(const [key,name] of Object.entries(FORMATS))sel.add(new Option(name,key));sel.value=s.settings.mode;sel.addEventListener('change',()=>{s.settings.mode=sel.value;apply(s);});group.append(label,sel);tool.append(group);
 }
 const fontsGroup=document.createElement('div');fontsGroup.className='q-reader-group';const fontsLabel=document.createElement('label');fontsLabel.className='q-reader-hint';fontsLabel.textContent='الخط';const fontSelect=document.createElement('select');fontSelect.className='q-reader-select q-reader-font-select';fontSelect.setAttribute('aria-label','تغيير خط المحتوى فقط');fontSelect.add(new Option('السعودي (الافتراضي)','default'));const available=window.QafiyahEnhancements?.fonts||{};Object.keys(available).forEach(key=>fontSelect.add(new Option(FONT_LABELS[key]||key,key)));fontSelect.value='default';fontSelect.addEventListener('change',()=>{s.settings.font=fontSelect.value;apply(s);});fontsGroup.append(fontsLabel,fontSelect);tool.append(fontsGroup);
 if(s.type==='poem'){const vowels=button('eye','إزالة أو إظهار التشكيل',()=>{s.settings.vowels=!s.settings.vowels;apply(s)});tool.append(vowels);const themes=document.createElement('select');themes.className='q-reader-select';themes.setAttribute('aria-label','مظهر القصيدة المؤقت');[['','مظهر الموقع'],['natural','الطبيعي'],['morning','النهاري'],['evening','المسائي'],['night','الليلي'],['dark','الداكن']].forEach(([k,v])=>themes.add(new Option(v,k)));themes.addEventListener('change',()=>{const val=themes.value;if(val)s.root.setAttribute('data-q-reader-theme',val);else s.root.removeAttribute('data-q-reader-theme')});tool.append(themes);const fav=button('heart','إضافة القصيدة إلى المفضلة',()=>{const original=document.querySelector('#poemDetail .q-favorite-btn[data-type="poem"],#poemDetail .q-favorite-btn');if(original)original.click();else notice(s,'سجّل الدخول أولًا لإضافة القصيدة للمفضلة')});tool.append(fav);const syncFavorite=()=>{const original=document.querySelector('#poemDetail .q-favorite-btn[data-type="poem"],#poemDetail .q-favorite-btn');if(!original)return;const selected=original.classList.contains('active')||original.classList.contains('is-favorite')||original.getAttribute('aria-pressed')==='true';fav.classList.toggle('active',selected);fav.setAttribute('aria-pressed',String(selected));};syncFavorite();document.addEventListener('qafiyah:favorites-changed',syncFavorite);const favObserver=new MutationObserver(()=>{if(!s.root.isConnected){favObserver.disconnect();return;}syncFavorite();});favObserver.observe(s.root,{attributes:true,childList:true,subtree:true,attributeFilter:['class','aria-pressed']});}
 const share=button('share','المشاركة',()=>showSharing(s));share.classList.add('q-reader-share');share.insertAdjacentText('beforeend','مشاركة');tool.append(share);
 const msg=document.createElement('div');msg.className='q-reader-status';msg.setAttribute('aria-live','polite');s.message=msg;
 s.target.before(tool,msg);s.toolbar=tool;
}
function url(){const u=new URL(location.href);u.hash='';return u.href;}
async function copyText(s,value){try{await navigator.clipboard.writeText(value);notice(s,'تم النسخ بنجاح');}catch{const input=document.createElement('textarea');input.value=value;document.body.append(input);input.select();const ok=document.execCommand('copy');input.remove();notice(s,ok?'تم النسخ':'تعذّر النسخ، انسخ الرابط من شريط العنوان');}}
function excerpt(s){return s.type==='poem'&&!s.richContent?s.verses.filter(Boolean).map(v=>v.first+(v.second?'    ···    '+v.second:'')).join('\n'):s.target.innerText.trim();}
function closeDialog(box){box.remove();}
function dialog(s,heading){const overlay=document.createElement('div');overlay.className='q-reader-overlay';overlay.setAttribute('role','presentation');const sheet=document.createElement('section');sheet.className='q-reader-dialog';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label',heading);
 const header=document.createElement('div');header.className='q-reader-dialog-title';const h=document.createElement('h3');h.textContent=heading;header.append(h,button('close','إغلاق',()=>closeDialog(overlay)));sheet.append(header);overlay.append(sheet);document.body.append(overlay);overlay.addEventListener('click',e=>{if(e.target===overlay)closeDialog(overlay);});const esc=e=>{if(e.key==='Escape'){closeDialog(overlay);document.removeEventListener('keydown',esc);}};document.addEventListener('keydown',esc);return{overlay,sheet};}
function menuAction(icon,title,click){const b=document.createElement('button');b.type='button';b.className='q-reader-menu-option';b.innerHTML=svg(icon);b.append(document.createTextNode(title));b.addEventListener('click',click);return b;}
async function nativeShare(s,shareImage){try{
 if(!navigator.share){notice(s,'المشاركة المباشرة غير مدعومة؛ يمكنك نسخ الرابط');return;}
 if(shareImage){const blob=await makeImage(s,0);const file=new File([blob],`القافية-${s.type}.png`,{type:'image/png'});
 if(navigator.canShare?.({files:[file]})){await navigator.share({title:s.title,text:'من القافية',files:[file],url:url()});return;}}
 await navigator.share({title:s.title,text:`${s.title} — القافية`,url:url()});
 }catch(e){if(e?.name!=='AbortError')notice(s,'تعذّرت المشاركة من هذا المتصفح');}}
function showSharing(s){const {overlay,sheet}=dialog(s,'مشاركة '+(s.type==='poem'?'القصيدة':s.type==='poet'?'سيرة الشاعر':'المقال'));const options=document.createElement('div');options.className='q-reader-menu';const close=()=>closeDialog(overlay);
 options.append(menuAction('copy','نسخ النص',()=>{copyText(s,excerpt(s));close();}),menuAction('link','نسخ رابط الصفحة',()=>{copyText(s,url());close();}),menuAction('image','حفظ كصورة',()=>{close();showImage(s);}),menuAction('file','حفظ في الملفات',()=>{close();saveToFiles(s);}),menuAction('share','مشاركة عبر التطبيقات',()=>{close();nativeShare(s,false);}));sheet.append(options);
}
function drawWrap(ctx,str,maxWidth){const items=[];const words=String(str).trim().split(/\s+/);let line='';for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>maxWidth&&line){items.push(line);line=word;}else line=next;}
 if(line)items.push(line);return items.length?items:[''];}
async function renderPages(s){let family=effectiveFont(s);const face=family.split(',')[0].trim().replace(/^['"]|['"]$/g,'');try{await document.fonts.load(`${s.settings.size}px "${face}"`);}catch{}
 const wrapCanvas=document.createElement('canvas');const measure=wrapCanvas.getContext('2d');const w=1120,margin=95,font=Math.max(26,Math.min(48,s.settings.size+7));measure.font=`${font}px ${family}`;measure.direction='rtl';
 const entries=[];
 if(s.type==='poem'&&!s.richContent){
  for(const v of s.verses){if(!v){entries.push({gap:1});continue;}
   if(s.settings.mode==='diwan'&&v.second){for(const row of drawWrap(measure,v.first,w-2*margin))entries.push({text:row,side:'right'});for(const row of drawWrap(measure,v.second,w-2*margin))entries.push({text:row,side:'left'});entries.push({gap:1});}
   else {for(const row of drawWrap(measure,v.first+(v.second?(s.settings.mode==='star'?'   ۞   ':'   ···   ')+v.second:''),w-2*margin))entries.push({text:row,side:'center'});entries.push({gap:1});}
  }
 }else{
  const rows=excerpt(s).split('\n').filter(Boolean);for(const line of rows){for(const row of drawWrap(measure,line,w-2*margin))entries.push({text:row,side:'right'});entries.push({gap:1});}
 }
 const perPage=15,pages=[];let page=[];for(const x of entries){if(page.length>=perPage){pages.push(page);page=[];}page.push(x);}if(page.length||!pages.length)pages.push(page);
 const yStep=font*1.75;
 return pages.map((rows,idx)=>{
 const height=Math.max(510,Math.ceil(272+rows.reduce((total,item)=>total+(item.gap?Math.min(22,5+s.settings.gap):yStep),0)+115));
 const canvas=document.createElement('canvas');canvas.width=w*2;canvas.height=height*2;const ctx=canvas.getContext('2d');ctx.scale(2,2);const bg=ctx.createLinearGradient(0,0,w,height);bg.addColorStop(0,'#fffaf5');bg.addColorStop(1,'#f3e8dd');ctx.fillStyle=bg;ctx.fillRect(0,0,w,height);ctx.strokeStyle='#96765d';ctx.lineWidth=5;ctx.strokeRect(22,22,w-44,height-44);ctx.lineWidth=1.5;ctx.strokeRect(38,38,w-76,height-76);
 ctx.direction='rtl';ctx.textAlign='center';ctx.fillStyle='#76513c';ctx.font='bold 28px "Qafiyah Saudi",Arial';ctx.fillText('القافية  |  موسوعة الشعر والأدب العربي',w/2,104);
 ctx.fillStyle='#4b3328';ctx.font='bold 39px "Qafiyah Saudi",Arial';let title=s.title;if(ctx.measureText(title).width>w-2*margin){title=title.slice(0,40)+'…';}ctx.fillText(title,w/2,169);
 ctx.strokeStyle='#b79a81';ctx.beginPath();ctx.moveTo(margin,204);ctx.lineTo(w-margin,204);ctx.stroke();ctx.fillStyle='#362820';ctx.font=`${font}px ${family}`;let y=272;
 for(const item of rows){if(item.gap){y+=Math.min(22,5+s.settings.gap);continue;}ctx.textAlign=item.side==='right'?'right':item.side==='left'?'left':'center';ctx.fillText(item.text,item.side==='right'?w-margin:item.side==='left'?margin:w/2,y);y+=yStep;}
 ctx.textAlign='center';ctx.font='23px "Qafiyah Saudi",Arial';ctx.fillStyle='#937b69';ctx.fillText(`alqafiyah.com   •   ${idx+1} / ${pages.length}`,w/2,height-75);return canvas;
 });
}
async function toBlob(canvas){return new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('تعذّر إنشاء الصورة')),'image/png'));}
async function makeImage(s,index=0){const pages=await renderPages(s);return toBlob(pages[Math.min(index,pages.length-1)]);}
function download(blob,filename){const addr=URL.createObjectURL(blob),a=document.createElement('a');a.href=addr;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(addr),2000);}
async function saveToFiles(s){try{const blob=await makeImage(s,0);if(window.showSaveFilePicker){try{const handle=await showSaveFilePicker({suggestedName:`القافية-${s.type}.png`,types:[{description:'صورة PNG',accept:{'image/png':['.png']}}]});const writable=await handle.createWritable();await writable.write(blob);await writable.close();notice(s,'تم حفظ الصورة في الملفات');return;}catch(e){if(e?.name==='AbortError')return;}}
 download(blob,`القافية-${s.type}.png`);notice(s,'نُزّلت الصورة؛ يمكن نقلها إلى الملفات');}catch(e){notice(s,'تعذّر حفظ الصورة');}}
async function showImage(s){const {sheet}=dialog(s,'صورة جاهزة للحفظ والمشاركة');const img=document.createElement('img');img.className='q-reader-preview';img.alt='معاينة صورة المحتوى';const nav=document.createElement('div');nav.className='q-reader-preview-nav';const note=document.createElement('span');note.textContent='جارٍ إعداد الصورة…';sheet.append(img,nav);let page=0,canvases=[],activeUrl='';
 try{canvases=await renderPages(s);}catch(e){note.textContent='تعذّر إنشاء الصورة';nav.append(note);return;}
 const update=async()=>{if(activeUrl)URL.revokeObjectURL(activeUrl);const b=await toBlob(canvases[page]);activeUrl=URL.createObjectURL(b);img.src=activeUrl;note.textContent=`${page+1} من ${canvases.length}`;prev.disabled=page===0;next.disabled=page===canvases.length-1;};
 const prev=button('minus','الصورة السابقة',()=>{page--;update();});const next=button('plus','الصورة التالية',()=>{page++;update();});const save=menuAction('image','حفظ الصورة',async()=>download(await toBlob(canvases[page]),`القافية-${page+1}.png`));const share=menuAction('share','إرسال الصورة للتطبيقات',async()=>{try{const b=await toBlob(canvases[page]);const f=new File([b],`القافية-${page+1}.png`,{type:'image/png'});if(navigator.canShare?.({files:[f]})){await navigator.share({title:s.title,url:url(),files:[f]});}else await nativeShare(s,false);}catch(e){if(e?.name!=='AbortError')notice(s,'تعذّرت المشاركة');}});
 nav.append(prev,note,next,save,share);await update();new MutationObserver(()=>{if(!img.isConnected&&activeUrl)URL.revokeObjectURL(activeUrl);}).observe(document.body,{childList:true});
}
function enhance(){const type=pageType();if(!type)return;const root=document.getElementById(type==='poem'?'poemDetail':type==='article'?'articleDetail':'poetDetail');if(!root)return;
 const target=$(root,type==='poem'?'.qafiyah-poem-lines':'.qafiyah-article-body');if(!target||!target.textContent.trim()||active?.target===target)return; if(active?.toolbar?.isConnected)active.toolbar.remove(); if(active?.message?.isConnected)active.message.remove();
 const title=$(root,'h1')?.textContent?.trim()||document.title;
 const settings={size:type==='poem'?24:18,gap:10,lineHeight:1.9,mode:'diwan',font:'default',vowels:true};
 const richContent=type==='poem'&&!!target.querySelector('img,video,iframe,figure,h1,h2,h3,h4,blockquote,table,[data-block-type]');
 const s={target,root,type,title,settings,richContent,baseFont:getComputedStyle(target).fontFamily,verses:type==='poem'&&!richContent?parseVerses(extractLines(target,type)):[],message:null};active=s;addToolbar(s);apply(s);
}
function init(){enhance();const type=pageType();if(!type)return;const root=document.getElementById(type==='poem'?'poemDetail':type==='article'?'articleDetail':'poetDetail');if(!root)return;new MutationObserver(()=>enhance()).observe(root,{childList:true,subtree:false});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
