/* القافية | محرر المقالات المرئي — مستقـل عن بقية المحررات */
(()=>{
'use strict';
const PREFIX='QAFIYAH_POEM_BLOCKS_V1\n';
const types={paragraph:'أبيات القصيدة',heading:'عنوان فرعي',quote:'اقتباس',image:'صورة',video:'مقطع فيديو'};
const widths={square:'مربع 1:1',landscape:'مستطيل 4:3',wide:'عريض 16:9',full:'عرض كامل'};
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function blocksFrom(value){const raw=String(value||'');if(raw.startsWith(PREFIX)){try{const parsed=JSON.parse(raw.slice(PREFIX.length));if(Array.isArray(parsed.blocks))return parsed.blocks.filter(b=>types[b.type]).slice(0,300)}catch{}}
return raw.trim()?raw.split(/\n\s*\n/).map(text=>({type:'paragraph',text:text.trim()})):[{type:'paragraph',text:''}];}
const picker=(name,selected)=>Object.entries(widths).map(([key,label])=>`<option value="${key}" ${key===selected?'selected':''}>${label}</option>`).join('');
let lastItem=null;
let editorEvents=null;
function blockHTML(block={type:'paragraph',text:''}){
 const type=types[block.type]?block.type:'paragraph',isMedia=type==='image'||type==='video';
 return `<section class="q-article-block" data-block-type="${type}">
 <div class="q-article-block-head"><strong>${types[type]}</strong><div class="q-article-block-actions"><button type="button" data-move="up" aria-label="تحريك للأعلى" title="تحريك للأعلى">↑</button><button type="button" data-move="down" aria-label="تحريك للأسفل" title="تحريك للأسفل">↓</button><button type="button" data-remove aria-label="حذف هذا العنصر" title="حذف العنصر">×</button></div></div>
 ${isMedia?`<label class="q-article-block-caption">${type==='image'?'الصورة':'مقطع الفيديو'} (اختياري إذا كان مرفوعاً مسبقاً)<input type="file" data-block-file accept="${type==='image'?'image/png,image/jpeg,image/webp,image/avif,image/gif':'video/mp4,video/webm,video/quicktime,video/x-m4v'}"></label>
 <input type="hidden" data-old-url value="${E(block.url||'')}">
 <div class="q-article-block-media">${block.url?(type==='image'?`<img src="${E(block.url)}" alt="معاينة الصورة" loading="lazy">`:`<video src="${E(block.url)}" controls preload="metadata"></video>`):'<span class="q-article-block-empty">لم يُحدّد ملف بعد</span>'}</div>
 <div class="q-article-block-opts"><label>مقاس العرض<select data-media-width>${picker('',block.size||'wide')}</select></label><label>الوصف أسفل الملف (اختياري)<input data-caption maxlength="260" value="${E(block.caption||'')}" placeholder="وصف الصورة أو المقطع"></label></div>`:
 `<label class="q-article-block-caption">${type==='heading'?'عنوان الفقرة':type==='quote'?'نص الاقتباس':'نص الفقرة'}<textarea data-block-text rows="${type==='paragraph'?6:3}" placeholder="${type==='paragraph'?'اكتب محتوى الفقرة هنا...':'اكتب هنا...'}">${E(block.text||'')}</textarea></label>`}
 </section>`;
}
function init(item){lastItem=item||{};if(editorEvents)editorEvents.abort();editorEvents=new AbortController();const signal=editorEvents.signal;const host=document.getElementById('qPoemBlocks');if(!host)return;
 const rows=blocksFrom(item?.content);host.innerHTML=rows.map(blockHTML).join('');
 const add=document.getElementById('qPoemAddBlock');
 add?.addEventListener('click',e=>{const b=e.target.closest('button[data-add]');if(!b)return;const t=b.dataset.add;host.insertAdjacentHTML('beforeend',blockHTML({type:t,size:'wide'}));host.lastElementChild?.querySelector('textarea')?.focus();},{signal});
 host.addEventListener('click',e=>{const row=e.target.closest('.q-article-block');if(!row)return;
 if(e.target.closest('[data-remove]')){if(host.children.length===1){row.outerHTML=blockHTML({type:'paragraph',text:''});return;}row.remove();return;}
 const move=e.target.closest('[data-move]');if(!move)return;
 if(move.dataset.move==='up'&&row.previousElementSibling)row.parentElement.insertBefore(row,row.previousElementSibling);
 if(move.dataset.move==='down'&&row.nextElementSibling)row.parentElement.insertBefore(row.nextElementSibling,row);
 });
 host.addEventListener('change',e=>{const el=e.target;if(!el.matches('[data-block-file]'))return;const row=el.closest('.q-article-block'),preview=row.querySelector('.q-article-block-media');const file=el.files?.[0];if(!file)return;
 const type=row.dataset.blockType;if((type==='image'&&!file.type.startsWith('image/'))||(type==='video'&&!file.type.startsWith('video/'))){el.value='';alert('نوع الملف غير مدعوم.');return;}
 const url=URL.createObjectURL(file);if(preview.dataset.previewUrl)URL.revokeObjectURL(preview.dataset.previewUrl);preview.dataset.previewUrl=url;
 preview.innerHTML=type==='image'?'<img alt="معاينة الصورة">':'<video controls preload="metadata"></video>';preview.firstElementChild.src=url;
 },{signal});
}
function formHTML(){return `<div class="form-group full q-article-editor-intro"><strong>محتوى القصيدة (محرر متعدد العناصر)</strong><p>اكتب الأبيات في فقرات، وافصل بين الشطرين بعلامة |، ويمكنك إضافة الصور والمقاطع بين الأبيات. أضف الفقرات والصور والمقاطع بأي ترتيب، وغيّر مقاس كل صورة أو مقطع. يمكنك إعادة ترتيب العناصر بالأسهم.</p></div><input type="hidden" name="content" value="" />
<div class="form-group full"><div id="qPoemBlocks" class="q-article-blocks"></div><div id="qPoemAddBlock" class="q-article-add-block" aria-label="إضافة عنصر في القصيدة">
 <button type="button" data-add="paragraph">+ فقرة</button><button type="button" data-add="heading">+ عنوان</button><button type="button" data-add="quote">+ اقتباس</button><button type="button" data-add="image">+ صورة</button><button type="button" data-add="video">+ فيديو</button>
</div><p class="hint">الملفات لا تُرفع إلا عند حفظ القصيدة. يدعم المحرر النص والصور والمقاطع المرفوعة، ولا ينفّذ شيفرات HTML مدخلة.</p></div>`;}
async function prepare(uploadMedia){const host=document.getElementById('qPoemBlocks');if(!host)throw Error('تعذر العثور على محرر المقال');
 const blocks=[],uploaded=[];
 try{for(const row of host.querySelectorAll('.q-article-block')){
 const type=row.dataset.blockType;
 if(type==='paragraph'||type==='heading'||type==='quote'){const txt=row.querySelector('[data-block-text]')?.value.trim()||'';if(txt)blocks.push({type,text:txt});continue;}
 let url=row.querySelector('[data-old-url]')?.value||'';const file=row.querySelector('[data-block-file]')?.files?.[0];
 if(file){const result=await uploadMedia(file,type==='image'?'poems/blocks/images':'poems/blocks/videos',type,'article-block');url=result.url;uploaded.push(result.path);}
 if(!url)continue;
 const size=row.querySelector('[data-media-width]')?.value||'wide',caption=row.querySelector('[data-caption]')?.value.trim()||'';
 blocks.push({type,url,size:Object.hasOwn(widths,size)?size:'wide',caption});
 }
 if(!blocks.length)throw Error('أضف فقرة أو صورة أو مقطعاً واحداً على الأقل قبل الحفظ.');
 const content=PREFIX+JSON.stringify({version:1,blocks});return {content,uploaded,oldToDelete:[]};
 }catch(e){e.articleUploadedPaths=uploaded;throw e;}
}
window.QafiyahPoemEditor={formHTML,init,prepare,blocksFrom,PREFIX};
})();
