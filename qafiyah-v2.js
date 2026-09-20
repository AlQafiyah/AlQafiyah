(function(){
'use strict';
if(window.__QAFIYAH_V2__) return; window.__QAFIYAH_V2__=true;
const path=()=>String(location.pathname||'').replace(/\/+$/,'').split('/').pop().toLowerCase().replace(/\.html$/,'');
const bookIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22Z"></path><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22Z"></path></svg>';
const icons={home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5 10.5V20h5v-6h4v6h5v-9.5"></path></svg>',poems:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg>',poets:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20h6"></path><path d="M14.5 4.5a2.12 2.12 0 0 1 3 3L9 16l-4 1 1-4Z"></path></svg>',articles:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l3 3v15H6Z"></path><path d="M14 3v4h4M9 11h6M9 15h6"></path></svg>',star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9Z"></path></svg>',gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"></circle><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.5 1A8 8 0 0 0 14 5.6L13.6 3h-4L9.2 5.6A8 8 0 0 0 6.7 7L4.2 6l-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.5-1A8 8 0 0 0 9.2 18.4l.4 2.6h4l.4-2.6a8 8 0 0 0 2.5-1.4l2.5 1 2-3.4-2-1.6c.1-.3.1-.7.1-1Z"></path></svg>'};
function navLink(href,label,icon,extra=''){return `<a href="${href}" ${extra}><span class="menu-icon ${label==='الكتب'?'qv2-books-icon':''}">${icon}</span><span>${label}</span></a>`}
function injectBooksLinks(){
  document.querySelectorAll('.side-navigation').forEach(nav=>{if(nav.querySelector('a[href="books.html"]'))return;const anchor=[...nav.querySelectorAll('a')].find(a=>(a.getAttribute('href')||'').toLowerCase().includes('articles'));const html=navLink('books.html','الكتب',bookIcon);anchor?anchor.insertAdjacentHTML('afterend',html):nav.insertAdjacentHTML('beforeend',html)});
  document.querySelectorAll('.footer-links').forEach(box=>{if((box.querySelector('h3')?.textContent||'').trim()==='استكشف'&&!box.querySelector('a[href="books.html"]')){const a=[...box.querySelectorAll('a')].find(x=>(x.getAttribute('href')||'').toLowerCase().includes('articles'));a?a.insertAdjacentHTML('afterend','<a href="books.html">الكتب</a>'):box.insertAdjacentHTML('beforeend','<a href="books.html">الكتب</a>')}});
}
function createChromeIfNeeded(){
  const p=path(); if(!['settings','favorites'].includes(p))return;
  document.querySelectorAll('#q-no-chrome-page').forEach(x=>x.remove());
  document.querySelectorAll('.q-page-return').forEach(x=>x.remove());
  if(!document.querySelector('.site-header,.qv2-header')){
    document.body.insertAdjacentHTML('afterbegin',`<header class="qv2-header site-header"><div class="qv2-header-inner"><button class="menu-button" id="qv2MenuButton" type="button" aria-label="فتح القائمة"><span></span><span></span><span></span></button><a class="qv2-header-title" href="index.html">القافية</a></div></header>`);
  }
  if(!document.querySelector('.side-menu')){
    document.body.insertAdjacentHTML('beforeend',`<div class="menu-overlay" id="qv2MenuOverlay"></div><aside class="side-menu qv2-side-menu" id="qv2SideMenu" aria-hidden="true"><div class="side-menu-header"><h2>القافية</h2><button class="close-menu-button" id="qv2CloseMenu" type="button" aria-label="إغلاق">×</button></div><nav class="side-navigation" aria-label="القائمة الرئيسية">${navLink('index.html','الرئيسية',icons.home)}${navLink('Poems.html','القصائد',icons.poems)}${navLink('poets.html','الشعراء',icons.poets)}${navLink('articles.html','المقالات',icons.articles)}${navLink('books.html','الكتب',bookIcon)}${navLink('favorites.html','المفضلة',icons.star)}${navLink('settings.html','الإعدادات',icons.gear)}<a href="about.html"><span class="menu-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"></circle><path d="M12 10v6M12 7h.01"></path></svg></span><span>نبذة عن القافية</span></a></nav><div class="side-menu-footer">${window.QafiyahEnhancements?.sideFooterHTML?window.QafiyahEnhancements.sideFooterHTML():''}</div></aside>`);
  }
  const menu=document.getElementById('qv2SideMenu'),overlay=document.getElementById('qv2MenuOverlay'); const open=()=>{menu?.classList.add('open');menu?.setAttribute('aria-hidden','false');overlay?.classList.add('active')}; const close=()=>{menu?.classList.remove('open');menu?.setAttribute('aria-hidden','true');overlay?.classList.remove('active')};
  document.getElementById('qv2MenuButton')?.addEventListener('click',open); document.getElementById('qv2CloseMenu')?.addEventListener('click',close); overlay?.addEventListener('click',close);
  if(!document.querySelector('.site-footer')){const f=document.createElement('footer');f.className='site-footer';f.innerHTML=window.QafiyahEnhancements?.footerHTML?window.QafiyahEnhancements.footerHTML():`<div class="footer-container"><div class="footer-brand"><a href="index.html" class="footer-logo">القافية</a><p>موسوعة الشعر والأدب العربي.</p></div><div class="footer-links"><h3>استكشف</h3><a href="Poems.html">القصائد</a><a href="poets.html">الشعراء</a><a href="articles.html">المقالات</a><a href="books.html">الكتب</a><a href="about.html">نبذة عن القافية</a></div><div class="footer-links"><h3>الحساب</h3><a href="profile.html">الملف الشخصي</a><a href="favorites.html">المفضلة</a><a href="settings.html">الإعدادات</a></div></div><div class="footer-bottom"><p>© 2026 القافية — جميع الحقوق محفوظة</p></div>`;document.body.appendChild(f)}
}
function profileCleanup(){
  if(path()!=='profile')return;
  const clean=()=>document.querySelectorAll('body>header,body>footer,.site-header,.site-footer,.qv2-header,.side-menu .side-menu-footer').forEach(x=>x.remove());
  clean();
  // حماية دائمة: أي سكربت يحاول إعادة رأس/ذيل الصفحة أو ذيل القائمة يُزال فورًا.
  const observer=new MutationObserver(clean);
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}
function renameAdmin(){document.querySelectorAll('a,button,span,p,h1,h2,h3').forEach(el=>{if(el.childElementCount===0&&el.textContent.includes('لوحة الإدارة'))el.textContent=el.textContent.replaceAll('لوحة الإدارة','لوحة الإدارة')})}
function randomId(){return crypto?.randomUUID?.()||('qv2-'+Date.now()+'-'+Math.random().toString(36).slice(2))}
async function track(){
  let tries=0; while(!window.supabaseClient&&tries++<25) await new Promise(r=>setTimeout(r,160)); if(!window.supabaseClient)return;
  let device=localStorage.getItem('qafiyah_device_id'); if(!device){device=randomId();localStorage.setItem('qafiyah_device_id',device)}
  const sessionKey='qafiyah_visit_recorded'; const record=!sessionStorage.getItem(sessionKey); if(record)sessionStorage.setItem(sessionKey,'1');
  try{await window.supabaseClient.rpc('qafiyah_track_visit',{p_device_id:device,p_record_visit:record})}catch{}
  setInterval(()=>window.supabaseClient?.rpc('qafiyah_track_visit',{p_device_id:device,p_record_visit:false}).catch(()=>{}),60000);
  window.supabaseClient.auth?.onAuthStateChange?.(()=>window.supabaseClient.rpc('qafiyah_track_visit',{p_device_id:device,p_record_visit:false}).catch(()=>{}));
}
function boot(){createChromeIfNeeded();profileCleanup();renameAdmin();setTimeout(injectBooksLinks,0);setTimeout(injectBooksLinks,250);track()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
