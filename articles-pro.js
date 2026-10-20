/* القافية — عرض المقالات التحريري: بطاقات وصحيفة ومحتوى متعدد الوسائط */
(()=>{
'use strict';
window.__QAFIYAH_ARTICLES_V2__=true;
const PREFIX='QAFIYAH_ARTICLE_BLOCKS_V1\n';
const $=id=>document.getElementById(id);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFKD').replace(/[\u064B-\u065F\u0670ـ]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').toLocaleLowerCase('ar').trim();
function safe(src){try{const u=new URL(String(src||''),location.href);return (u.protocol==='https:'||(u.origin===location.origin&&u.protocol==='http:'))?u.href:'';}catch{return '';}}
function link(x){return `article.html?id=${encodeURIComponent(x.id)}`;}
function authorLink(name){return `article-author.html?author=${encodeURIComponent(name||'')}`;}
function date(s){if(!s)return '';try{return new Intl.DateTimeFormat('ar-SA',{year:'numeric',month:'long',day:'numeric'}).format(new Date(s));}catch{return '';}}
function blocks(content){const text=String(content||'');if(text.startsWith(PREFIX))try{const a=JSON.parse(text.slice(PREFIX.length));if(Array.isArray(a.blocks))return a.blocks.slice(0,300);}catch(e){console.warn('تعذر قراءة عناصر المقال',e);}return text.trim()?text.split(/\n\s*\n/).map(text=>({type:'paragraph',text})):[];}
function strip(v){return String(v||'').replace(/^QAFIYAH_ARTICLE_BLOCKS_V1\n/,'');}
function plainContent(article){const b=blocks(article.content);return b.filter(x=>['paragraph','heading','quote'].includes(x.type)).map(x=>x.text||'').join(' ');}
function excerpt(article){const val=String(article.summary||'').trim();return val||plainContent(article).slice(0,205);}
const displayName=x=>String(x.author||'').trim();
function authorHtml(article){const name=displayName(article);return name?`<a href="${authorLink(name)}" class="q-article-author-name">${E(name)}</a>`:'';}
function meta(article){return `<div class="q-article-meta">${authorHtml(article)}${article.category?`<span class="q-article-category">${E(article.category)}</span>`:''}${article.created_at?`<time datetime="${E(article.created_at)}">${E(date(article.created_at))}</time>`:''}</div>`;}
function cover(article){const img=safe(article.image_url);const label=E(article.title||'المقال');return `<a href="${link(article)}" class="q-article-cover ${img?'':'q-article-cover-empty'}" aria-label="قراءة ${label}">${img?`<img src="${E(img)}" alt="${label}" loading="lazy" decoding="async">`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M6 3h9l3 3v15H6Z"/><path d="M14 3v4h4M9 11h6M9 15h6"/></svg>`}</a>`;}
function card(article,featured=false){return `<article class="q-article-card${featured?' q-article-featured':''}">
 ${cover(article)}<div class="q-article-card-content"><h2 class="q-article-card-title"><a href="${link(article)}">${E(article.title||'بدون عنوان')}</a></h2>
 ${excerpt(article)?`<p class="q-article-card-excerpt">${E(excerpt(article))}</p>`:''}${meta(article)}</div></article>`;}
async function allArticles(db){const all=[],batch=500;for(let i=0;i<10000;i+=batch){const {data,error}=await db.from('articles').select('id,title,summary,content,author,category,image_url,created_at,is_featured').order('created_at',{ascending:false}).range(i,i+batch-1);if(error)throw error;all.push(...(data||[]));if(!data||data.length<batch)break;}return all;}
async function initList(){const host=$('articlesContainer');if(!host)return;const loading=$('articlesLoading'),empty=$('articlesEmpty'),search=$('articleSearch'),category=$('articleCategory');
 try{const all=await allArticles(window.supabaseClient);const categories=[...new Set(all.map(x=>x.category).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'ar'));
 for(const name of categories){const opt=document.createElement('option');opt.value=name;opt.textContent=name;category?.append(opt);}
 const render=()=>{const q=norm(search?.value),cat=category?.value;const matched=all.filter(a=>(!cat||a.category===cat)&&(!q||norm([a.title,a.summary,a.author,a.category,plainContent(a)].join(' ')).includes(q)));
 host.innerHTML=matched.length?matched.map((x,i)=>card(x,i===0)).join(''):'';if(empty)empty.hidden=!!matched.length;if(loading)loading.hidden=true;};
 search?.addEventListener('input',render);category?.addEventListener('change',render);render();
 }catch(e){console.error('مقالات القافية',e);if(loading)loading.hidden=true;host.innerHTML='<p class="q-article-error">تعذر تحميل المقالات حالياً.</p>';}}
function contentHtml(value){return blocks(value).map(block=>{
 const type=block?.type,txt=E(block?.text||'').replace(/\n/g,'<br>');
 if(type==='paragraph')return `<p>${txt}</p>`;
 if(type==='heading')return `<h2>${txt}</h2>`;
 if(type==='quote')return `<blockquote>${txt}</blockquote>`;
 if(type==='image'||type==='video'){
 const url=safe(block.url);if(!url)return '';
 const size=['square','landscape','wide','full'].includes(block.size)?block.size:'wide';const caption=E(block.caption||'');return `<figure class="q-article-media q-article-media-${size}">${type==='image'?`<img src="${E(url)}" alt="${caption||'صورة ضمن المقال'}" loading="lazy">`:`<video src="${E(url)}" controls playsinline preload="metadata"></video>`}${caption?`<figcaption>${caption}</figcaption>`:''}</figure>`;}
 return '';
 }).join('');}
async function initDetail(){const root=$('articleDetail');if(!root)return;const id=new URLSearchParams(location.search).get('id');if(!id){root.innerHTML='<p class="q-article-error">تعذر العثور على المقال.</p>';return;}
 try{const {data:a,error}=await window.supabaseClient.from('articles').select('*').eq('id',id).maybeSingle();if(error)throw error;if(!a){root.innerHTML='<p class="q-article-error">المقال غير موجود.</p>';return;}
 document.title=`${a.title||'المقال'} | القافية`;
 root.innerHTML=`<div class="q-article-detail-shell"><a href="articles.html" class="q-article-back">العودة إلى المقالات</a><article class="q-article-detail">
 <header class="q-article-detail-heading">${a.category?`<span class="q-article-category">${E(a.category)}</span>`:''}
 <h1>${E(a.title||'بدون عنوان')}</h1>${a.summary?`<p class="q-article-deck">${E(a.summary)}</p>`:''}
 <div class="q-article-byline">${authorHtml(a)}${a.created_at?`<time datetime="${E(a.created_at)}">${E(date(a.created_at))}</time>`:''}</div></header>
 <div class="qafiyah-article-body q-article-rich-body">${contentHtml(a.content)}</div>
 </article></div>`;
 }catch(e){console.error(e);root.innerHTML='<p class="q-article-error">تعذر تحميل المقال. حاول مرة أخرى لاحقاً.</p>';}}
async function initAuthor(){const host=$('qArticleAuthorList');if(!host)return;const name=new URLSearchParams(location.search).get('author')||'';const title=$('qArticleAuthorTitle');if(title)title.textContent=name?`مقالات ${name}`:'كاتب المقال';document.title=`مقالات ${name||'الكاتب'} | القافية`;
 try{const arr=await allArticles(window.supabaseClient);const matched=arr.filter(x=>norm(x.author)===norm(name));host.innerHTML=matched.length?matched.map((x,i)=>card(x,i===0)).join(''):'<p class="q-article-error">لا توجد مقالات لهذا الكاتب حالياً.</p>';}
 catch(e){console.error(e);host.innerHTML='<p class="q-article-error">تعذر تحميل مقالات الكاتب.</p>';}}
function start(){if($('articlesContainer'))initList();if($('articleDetail'))initDetail();if($('qArticleAuthorList'))initAuthor();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
