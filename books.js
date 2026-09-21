(function(){
'use strict';
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=$('booksList'),status=$('booksStatus'),search=$('bookSearch'),era=$('bookEra'),category=$('bookCategory');let timer=null,serial=0;
function menu(){const m=$('booksSideMenu'),o=$('booksMenuOverlay');const open=()=>{m.classList.add('open');o.classList.add('active');m.setAttribute('aria-hidden','false')};const close=()=>{m.classList.remove('open');o.classList.remove('active');m.setAttribute('aria-hidden','true')};$('booksMenuButton')?.addEventListener('click',open);$('booksCloseMenu')?.addEventListener('click',close);o?.addEventListener('click',close)}
function clean(v){return String(v||'').trim()}
function row(b){const meta=[b.author,b.literary_category,b.era].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('');return `<article class="book-row" tabindex="0" role="button" data-book-id="${esc(b.id)}"><div>${b.cover_url?`<img class="book-cover" src="${esc(b.cover_url)}" alt="غلاف ${esc(b.title)}" loading="lazy">`:`<div class="book-cover-placeholder" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z"></path><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z"></path></svg></div>`}</div><div class="book-row-body"><h2>${esc(b.title||'بدون عنوان')}</h2><div class="book-row-meta">${meta}</div>${b.description?`<p class="book-row-desc">${esc(b.description)}</p>`:''}</div></article>`}
async function filterOptions(){try{const {data,error}=await supabaseClient.from('books').select('era,literary_category').limit(1000);if(error)throw error;const eras=[...new Set((data||[]).map(x=>clean(x.era)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));const cats=[...new Set((data||[]).map(x=>clean(x.literary_category)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));era.innerHTML='<option value="">جميع العصور</option>'+eras.map(x=>`<option>${esc(x)}</option>`).join('');category.innerHTML='<option value="">جميع الفئات الأدبية</option>'+cats.map(x=>`<option>${esc(x)}</option>`).join('')}catch(e){console.warn(e)}}
async function load(){const s=++serial;status.hidden=false;status.textContent='جاري تحميل الكتب...';list.innerHTML='';let q=supabaseClient.from('books').select('*').order('is_featured',{ascending:false}).order('created_at',{ascending:false}).limit(120);const term=clean(search.value);if(term)q=q.or(`title.ilike.%${term.replace(/[,()]/g,' ')}%,author.ilike.%${term.replace(/[,()]/g,' ')}%`);if(era.value)q=q.eq('era',era.value);if(category.value)q=q.eq('literary_category',category.value);try{const {data,error}=await q;if(error)throw error;if(s!==serial)return;const rows=data||[];status.hidden=!!rows.length;status.textContent=rows.length?'':(term||era.value||category.value?'لا توجد كتب مطابقة لبحثك.':'لا توجد كتب مضافة حتى الآن.');list.innerHTML=rows.map(row).join('');list.querySelectorAll('.book-row').forEach((el,i)=>{const b=rows[i];const open=()=>viewer.open(b);el.addEventListener('click',open);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})})}catch(e){console.error(e);status.hidden=false;status.textContent='تعذر تحميل الكتب.'}}
search?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(load,260)});era?.addEventListener('change',load);category?.addEventListener('change',load);
const viewer=(function(){
let mode=null,epubBook=null,epubRendition=null,epubFontSize=100;
const root=$('bookViewer'),wrap=$('bookCanvasWrap'),stage=$('bookStage'),msg=$('bookViewerMessage');
const MEDIA_BUCKET='qafiyah-media';

let nativeWrap=$('bookNativeWrap');
let nativeFrame=null;
if(!nativeWrap){
    nativeWrap=document.createElement('div');
    nativeWrap.id='bookNativeWrap';
    nativeWrap.hidden=true;
    nativeWrap.style.width='100%';
    nativeWrap.style.height='100%';
    nativeWrap.style.minHeight='76vh';
    nativeWrap.style.margin='0';
    nativeWrap.style.background='#fff';
    nativeWrap.style.overflow='hidden';
    nativeFrame=document.createElement('iframe');
    nativeFrame.id='bookNativeFrame';
    nativeFrame.title='قارئ الكتاب';
    nativeFrame.loading='eager';
    nativeFrame.referrerPolicy='no-referrer';
    nativeFrame.setAttribute('allowfullscreen','');
    nativeFrame.style.width='100%';
    nativeFrame.style.height='100%';
    nativeFrame.style.minHeight='76vh';
    nativeFrame.style.border='0';
    nativeFrame.style.background='#fff';
    nativeWrap.appendChild(nativeFrame);
    stage.appendChild(nativeWrap);
}else{
    nativeFrame=nativeWrap.querySelector('iframe');
}

let epubWrap=$('bookEpubWrap');
if(!epubWrap){
    epubWrap=document.createElement('div');
    epubWrap.id='bookEpubWrap';
    epubWrap.hidden=true;
    epubWrap.style.width='100%';
    epubWrap.style.maxWidth='980px';
    epubWrap.style.height='100%';
    epubWrap.style.minHeight='70vh';
    epubWrap.style.margin='0 auto';
    epubWrap.style.background='#fff';
    epubWrap.style.borderRadius='8px';
    epubWrap.style.overflow='hidden';
    stage.appendChild(epubWrap);
}

function loadScript(src,test){
    if(test())return Promise.resolve();
    return new Promise((resolve,reject)=>{
        const existing=[...document.scripts].find(s=>s.src===src);
        if(existing){
            if(test())return resolve();
            existing.addEventListener('load',resolve,{once:true});
            existing.addEventListener('error',reject,{once:true});
            return;
        }
        const script=document.createElement('script');
        script.src=src;
        script.async=true;
        script.onload=resolve;
        script.onerror=reject;
        document.head.appendChild(script);
    });
}

async function epubjs(){
    if(window.ePub)return window.ePub;
    await loadScript('https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js',()=>!!window.ePub);
    if(!window.ePub)throw new Error('EPUB_READER_LOAD_FAILED');
    return window.ePub;
}

function publicUrlForPath(path){
    const cleaned=clean(path).replace(/^\/+/, '').replace(/^qafiyah-media\//i,'');
    if(!cleaned)return '';
    try{
        const {data}=supabaseClient.storage.from(MEDIA_BUCKET).getPublicUrl(cleaned);
        return data?.publicUrl||'';
    }catch{
        return '';
    }
}

function normalizeBookUrl(value){
    let raw=clean(value).replace(/^['\"]|['\"]$/g,'');
    if(!raw)return '';

    try{
        const parsed=new URL(raw,window.location.href);
        if(/^https?:$/i.test(parsed.protocol)){
            const markers=[
                `/storage/v1/object/public/${MEDIA_BUCKET}/`,
                `/storage/v1/object/authenticated/${MEDIA_BUCKET}/`,
                `/storage/v1/object/sign/${MEDIA_BUCKET}/`
            ];
            for(const marker of markers){
                const i=parsed.pathname.indexOf(marker);
                if(i!==-1){
                    const path=decodeURIComponent(parsed.pathname.slice(i+marker.length));
                    return publicUrlForPath(path);
                }
            }
            return parsed.href;
        }
    }catch{}

    raw=raw.replace(/^storage\/v1\/object\/(?:public|authenticated|sign)\/qafiyah-media\//i,'');
    return publicUrlForPath(raw);
}

function fileType(url){
    try{
        const path=new URL(url,window.location.href).pathname.toLowerCase();
        if(path.endsWith('.epub'))return 'epub';
        if(path.endsWith('.pdf'))return 'pdf';
    }catch{}
    return 'pdf';
}

function setPdfControls(nativeMode){
    const ids=['bookPrev','bookBottomPrev','bookNext','bookBottomNext','bookZoomOut','bookZoomIn'];
    ids.forEach(id=>{const el=$(id);if(el)el.disabled=!!nativeMode;});
}

function setGenericError(error){
    console.error('قافية: تعذر فتح الكتاب:',error);
    msg.hidden=false;
    msg.textContent='تعذر فتح الكتاب';
    wrap.hidden=true;
    nativeWrap.hidden=true;
    epubWrap.hidden=true;
    if(nativeFrame)nativeFrame.src='about:blank';
    $('bookPageCount').textContent='—';
    $('bookZoomLabel').textContent='—';
    setPdfControls(false);
}

function isIOS(){
    return /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
        (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
}

function openPdf(url){
    mode='pdf';
    wrap.hidden=true;
    epubWrap.hidden=true;
    msg.hidden=true;
    $('bookPageCount').textContent='PDF';
    $('bookZoomLabel').textContent='—';
    setPdfControls(true);

    // على iPhone/iPad عارض Safari الأصلي أكثر ثباتًا من PDF.js والـ iframe.
    if(isIOS()){
        window.location.href=url;
        return;
    }

    if(!nativeFrame)throw new Error('NATIVE_PDF_FRAME_MISSING');
    nativeWrap.hidden=false;
    nativeFrame.src=url + (url.includes('#')?'':'#view=FitH');
}

async function openEpub(url){
    mode='epub';
    setPdfControls(false);
    const ePub=await epubjs();
    wrap.hidden=true;
    nativeWrap.hidden=true;
    if(nativeFrame)nativeFrame.src='about:blank';
    epubWrap.hidden=false;
    epubWrap.innerHTML='';
    epubBook=ePub(url);
    epubRendition=epubBook.renderTo(epubWrap,{
        width:'100%',
        height:'100%',
        spread:'auto',
        flow:'paginated'
    });
    epubRendition.themes.default({
        body:{
            'font-family':'serif',
            'line-height':'1.9',
            'padding':'0 4%'
        }
    });
    await epubRendition.display();
    msg.hidden=true;
    $('bookPageCount').textContent='EPUB';
    $('bookZoomLabel').textContent='100%';
}

async function open(book){
    const url=normalizeBookUrl(book?.file_url);
    if(!url){
        root.classList.add('open');
        root.setAttribute('aria-hidden','false');
        document.body.style.overflow='hidden';
        $('bookViewerTitle').textContent=book?.title||'الكتاب';
        setGenericError(new Error('BOOK_FILE_URL_MISSING'));
        return;
    }

    // PDF على iOS يفتح مباشرة قبل أي await حتى لا يمنع المتصفح الفتح.
    if(fileType(url)==='pdf' && isIOS()){
        openPdf(url);
        return;
    }

    root.classList.add('open');
    root.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    $('bookViewerTitle').textContent=book?.title||'الكتاب';
    msg.hidden=false;
    msg.textContent='جاري فتح الكتاب...';
    wrap.hidden=true;
    nativeWrap.hidden=true;
    epubWrap.hidden=true;
    epubFontSize=100;
    mode=null;

    try{
        if(epubRendition){try{epubRendition.destroy()}catch{}}
        if(epubBook){try{epubBook.destroy()}catch{}}
        epubRendition=null;
        epubBook=null;
        if(fileType(url)==='epub')await openEpub(url);
        else openPdf(url);
    }catch(e){
        setGenericError(e);
    }
}

function close(){
    root.classList.remove('open');
    root.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    mode=null;
    try{epubRendition?.destroy?.()}catch{}
    try{epubBook?.destroy?.()}catch{}
    epubRendition=null;
    epubBook=null;
    epubWrap.innerHTML='';
    epubWrap.hidden=true;
    nativeWrap.hidden=true;
    if(nativeFrame)nativeFrame.src='about:blank';
    setPdfControls(false);
}

async function prev(){
    try{
        if(mode==='epub'&&epubRendition)await epubRendition.prev();
    }catch(e){setGenericError(e)}
}

async function next(){
    try{
        if(mode==='epub'&&epubRendition)await epubRendition.next();
    }catch(e){setGenericError(e)}
}

async function zoom(delta){
    try{
        if(mode==='epub'&&epubRendition){
            epubFontSize=Math.max(70,Math.min(180,epubFontSize+(delta>0?10:-10)));
            epubRendition.themes.fontSize(epubFontSize+'%');
            $('bookZoomLabel').textContent=epubFontSize+'%';
        }
    }catch(e){setGenericError(e)}
}

$('bookClose')?.addEventListener('click',close);
$('bookPrev')?.addEventListener('click',prev);
$('bookBottomPrev')?.addEventListener('click',prev);
$('bookNext')?.addEventListener('click',next);
$('bookBottomNext')?.addEventListener('click',next);
$('bookZoomOut')?.addEventListener('click',()=>zoom(-.15));
$('bookZoomIn')?.addEventListener('click',()=>zoom(.15));
$('bookFullscreen')?.addEventListener('click',async()=>{try{if(!document.fullscreenElement)await root.requestFullscreen();else await document.exitFullscreen()}catch{}});
document.addEventListener('keydown',e=>{if(!root.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowRight')prev();if(e.key==='ArrowLeft')next();if(e.key==='+')zoom(.15);if(e.key==='-')zoom(-.15)});
return{open,close};
})();
menu();filterOptions();load();
})();
