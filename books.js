(function(){
'use strict';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[c]));

const list = $('booksList');
const status = $('booksStatus');
const search = $('bookSearch');
const era = $('bookEra');
const category = $('bookCategory');

let timer = null;
let serial = 0;

function menu(){
const m = $('booksSideMenu');
const o = $('booksMenuOverlay');
const open = () => {
m?.classList.add('open');
o?.classList.add('active');
m?.setAttribute('aria-hidden','false');
};
const close = () => {
m?.classList.remove('open');
o?.classList.remove('active');
m?.setAttribute('aria-hidden','true');
};
$('booksMenuButton')?.addEventListener('click',open);
$('booksCloseMenu')?.addEventListener('click',close);
o?.addEventListener('click',close);
}

function clean(v){
return String(v || '').trim();
}

function row(b){
const meta = [b.author,b.literary_category,b.era]
.filter(Boolean)
.map(x => `<span>${esc(x)}</span>`)
.join('');

return `<article class="book-row" tabindex="0" role="button" data-book-id="${esc(b.id)}">
<div>
${b.cover_url
? `<img class="book-cover" src="${esc(b.cover_url)}" alt="غلاف ${esc(b.title)}" loading="lazy">`
: `<div class="book-cover-placeholder" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z"></path><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z"></path></svg></div>`}
</div>
<div class="book-row-body">
<h2>${esc(b.title || 'بدون عنوان')}</h2>
<div class="book-row-meta">${meta}</div>
${b.description ? `<p class="book-row-desc">${esc(b.description)}</p>` : ''}
</div>
</article>`;
}

async function filterOptions(){
try {
const {data,error} = await supabaseClient
.from('books')
.select('era,literary_category')
.limit(1000);

if (error) throw error;

const eras = [...new Set((data || []).map(x => clean(x.era)).filter(Boolean))]
.sort((a,b) => a.localeCompare(b,'ar'));

const cats = [...new Set((data || []).map(x => clean(x.literary_category)).filter(Boolean))]
.sort((a,b) => a.localeCompare(b,'ar'));

if (era) {
era.innerHTML = '<option value="">جميع العصور</option>' +
eras.map(x => `<option>${esc(x)}</option>`).join('');
}

if (category) {
category.innerHTML = '<option value="">جميع الفئات الأدبية</option>' +
cats.map(x => `<option>${esc(x)}</option>`).join('');
}
} catch (e) {
console.warn('Qafiyah books filters:', e);
}
}

async function load(){
const s = ++serial;

if (status) {
status.hidden = false;
status.textContent = 'جاري تحميل الكتب...';
}

if (list) list.innerHTML = '';

let q = supabaseClient
.from('books')
.select('*')
.order('is_featured',{ascending:false})
.order('created_at',{ascending:false})
.limit(120);

const term = clean(search?.value);

if (term) {
q = q.or(`title.ilike.%${term.replace(/[,()]/g,' ')}%,author.ilike.%${term.replace(/[,()]/g,' ')}%`);
}

if (era?.value) q = q.eq('era',era.value);
if (category?.value) q = q.eq('literary_category',category.value);

try {
const {data,error} = await q;
if (error) throw error;
if (s !== serial) return;

const rows = data || [];

if (status) {
status.hidden = !!rows.length;
status.textContent = rows.length
? ''
: (term || era?.value || category?.value ? 'لا توجد كتب مطابقة لبحثك.' : '');
}

if (list) {
list.innerHTML = rows.map(row).join('');

list.querySelectorAll('.book-row').forEach((el,i) => {
const b = rows[i];
const open = () => viewer.open(b);

el.addEventListener('click',open);
el.addEventListener('keydown',e => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
open();
}
});
});
}
} catch (e) {
console.error('Qafiyah books load error:', e);
if (status) {
status.hidden = false;
status.textContent = 'تعذر تحميل الكتب.';
}
}
}

search?.addEventListener('input',() => {
clearTimeout(timer);
timer = setTimeout(load,260);
});
era?.addEventListener('change',load);
category?.addEventListener('change',load);

const viewer = (function(){
let pdf = null;
let page = 1;
let scale = 1;
let renderTask = null;
let startX = null;

const root = $('bookViewer');
const canvas = $('bookCanvas');
const wrap = $('bookCanvasWrap');
const stage = $('bookStage');
const msg = $('bookViewerMessage');
const ctx = canvas?.getContext('2d');

function friendlyError(){
if (msg) {
msg.hidden = false;
msg.textContent = 'تعذر فتح الكتاب';
}
if (wrap) wrap.hidden = true;
}

function getBookUrl(book){
const url = clean(book?.file_url);
if (!url) return '';

try {
const parsed = new URL(url, window.location.href);
if (!['http:','https:'].includes(parsed.protocol)) return '';
return parsed.href;
} catch {
return '';
}
}

function fileKind(url){
try {
const pathname = new URL(url).pathname.toLowerCase();
if (pathname.endsWith('.epub')) return 'epub';
if (pathname.endsWith('.pdf')) return 'pdf';
} catch {}
return 'unknown';
}

async function pdfjs(){
if (window.pdfjsLib) return window.pdfjsLib;

try {
const m = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
m.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
return m;
} catch (e) {
console.error('Qafiyah PDF.js load error:', e);
throw e;
}
}

async function render(){
if (!pdf || !canvas || !ctx || !stage) return;

try {
renderTask?.cancel?.();
} catch {}

const p = await pdf.getPage(page);
const baseViewport = p.getViewport({scale:1});
const fitScale = Math.min(
1.8,
Math.max(.55,(stage.clientWidth - 28) / (baseViewport.width || 800))
);
const viewport = p.getViewport({scale:scale * fitScale});

canvas.width = Math.floor(viewport.width);
canvas.height = Math.floor(viewport.height);
canvas.style.width = viewport.width + 'px';
canvas.style.height = viewport.height + 'px';

if (wrap) wrap.hidden = false;
if (msg) msg.hidden = true;

renderTask = p.render({canvasContext:ctx,viewport});

try {
await renderTask.promise;
} catch (e) {
if (e?.name !== 'RenderingCancelledException') throw e;
}

const pageCount = $('bookPageCount');
const zoomLabel = $('bookZoomLabel');
if (pageCount) pageCount.textContent = `${page} / ${pdf.numPages}`;
if (zoomLabel) zoomLabel.textContent = Math.round(scale * 100) + '%';

stage.scrollTop = 0;
stage.scrollLeft = 0;
}

async function open(book){
const url = getBookUrl(book);

if (!url) {
if (root) {
root.classList.add('open');
root.setAttribute('aria-hidden','false');
}
document.body.style.overflow = 'hidden';
if ($('bookViewerTitle')) $('bookViewerTitle').textContent = book?.title || 'الكتاب';
friendlyError();
return;
}

/* EPUB: يفتح الملف العام مباشرة. PDF يبقى داخل قارئ قافية. */
if (fileKind(url) === 'epub') {
const opened = window.open(url,'_blank','noopener,noreferrer');
if (!opened) {
if (root) {
root.classList.add('open');
root.setAttribute('aria-hidden','false');
}
document.body.style.overflow = 'hidden';
if ($('bookViewerTitle')) $('bookViewerTitle').textContent = book?.title || 'الكتاب';
friendlyError();
}
return;
}

if (root) {
root.classList.add('open');
root.setAttribute('aria-hidden','false');
}
document.body.style.overflow = 'hidden';

if ($('bookViewerTitle')) $('bookViewerTitle').textContent = book?.title || 'الكتاب';
if (msg) {
msg.hidden = false;
msg.textContent = 'جاري فتح الكتاب...';
}
if (wrap) wrap.hidden = true;

page = 1;
scale = 1;
pdf = null;

try {
const lib = await pdfjs();
pdf = await lib.getDocument({
url,
withCredentials:false
}).promise;
await render();
} catch (e) {
console.error('Qafiyah book open error:', e);
friendlyError();
}
}

function close(){
root?.classList.remove('open');
root?.setAttribute('aria-hidden','true');
document.body.style.overflow = '';
pdf = null;
try {
renderTask?.cancel?.();
} catch {}
}

async function prev(){
if (pdf && page > 1) {
page--;
try { await render(); } catch (e) { console.error(e); friendlyError(); }
}
}

async function next(){
if (pdf && page < pdf.numPages) {
page++;
try { await render(); } catch (e) { console.error(e); friendlyError(); }
}
}

async function zoom(delta){
if (!pdf) return;
scale = Math.max(.6,Math.min(2.6,scale + delta));
try { await render(); } catch (e) { console.error(e); friendlyError(); }
}

$('bookClose')?.addEventListener('click',close);
$('bookPrev')?.addEventListener('click',prev);
$('bookBottomPrev')?.addEventListener('click',prev);
$('bookNext')?.addEventListener('click',next);
$('bookBottomNext')?.addEventListener('click',next);
$('bookZoomOut')?.addEventListener('click',() => zoom(-.15));
$('bookZoomIn')?.addEventListener('click',() => zoom(.15));
$('bookFullscreen')?.addEventListener('click',async() => {
try {
if (!document.fullscreenElement) await root?.requestFullscreen();
else await document.exitFullscreen();
} catch {}
});

document.addEventListener('keydown',e => {
if (!root?.classList.contains('open')) return;
if (e.key === 'Escape') close();
if (e.key === 'ArrowRight') prev();
if (e.key === 'ArrowLeft') next();
if (e.key === '+') zoom(.15);
if (e.key === '-') zoom(-.15);
});

stage?.addEventListener('touchstart',e => {
startX = e.touches?.[0]?.clientX ?? null;
},{passive:true});

stage?.addEventListener('touchend',e => {
if (startX === null) return;
const end = e.changedTouches?.[0]?.clientX ?? startX;
const d = end - startX;
startX = null;
if (Math.abs(d) > 70) {
if (d > 0) next();
else prev();
}
},{passive:true});

stage?.addEventListener('dblclick',() => zoom(.2));

return {open,close};
})();

menu();
filterOptions();
load();
})();
