(function(){
'use strict';
const $=id=>document.getElementById(id);
const LS={font:'qafiyah_font',theme:'qafiyah_theme',favorites:'qafiyah_favorites',read:'qafiyah_read_notifications'};
const fonts={
  saudi:"'Qafiyah Saudi','Saudi',Tahoma,Arial,sans-serif",
  expo:"'Expo Arabic','Qafiyah Saudi',sans-serif",
  expoLight:"'Expo Arabic Light','Expo Arabic','Qafiyah Saudi',sans-serif",
  amiri:"'Amiri','Qafiyah Saudi',serif",
  naskh:"'Noto Naskh Arabic','Amiri','Qafiyah Saudi',serif",
  ruqaaRegular:"'QF Ruqaa Regular','Qafiyah Saudi',serif",
  ruqaaBold:"'QF Ruqaa Bold','Qafiyah Saudi',serif",
  ruqaaThin:"'QF Ruqaa Thin','Qafiyah Saudi',serif",
  kufi:"'QF Kufi Square','Qafiyah Saudi',sans-serif",
  kufiStylistic:"'QF Kufi Stylistic','Qafiyah Saudi',sans-serif",
  andalus:"'QF Andalus','Qafiyah Saudi',serif",
  reem:"'Reem Kufi','Qafiyah Saudi',sans-serif",
  cairo:"'Cairo','Qafiyah Saudi',sans-serif",
  tajawal:"'Tajawal','Qafiyah Saudi',sans-serif",
  messiri:"'El Messiri','Qafiyah Saudi',sans-serif",
  mada:"'Mada','Qafiyah Saudi',sans-serif",
  harmattan:"'Harmattan','Qafiyah Saudi',sans-serif",
  scheherazade:"'Scheherazade New','Qafiyah Saudi',serif",
  lateef:"'Lateef','Qafiyah Saudi',serif",
  katibeh:"'Katibeh','Qafiyah Saudi',serif",
  thuluth:"'QF Thuluth','Qafiyah Saudi',serif",
  ummi:"'QF Ummi','Qafiyah Saudi',serif",
  ummiSwash:"'QF Ummi Swash','Qafiyah Saudi',serif",
  ummiSolid:"'QF Ummi Solid','Qafiyah Saudi',serif",
  sponge:"'QF Sponge','Qafiyah Saudi',sans-serif",
  adabi:"'QF Adabi','Qafiyah Saudi',serif",
  sultan:"'QF Sultan','Qafiyah Saudi',serif",
  sahra:"'QF Sahra','Qafiyah Saudi',serif",
  quranQalam:"'QF Quran Qalam','Qafiyah Saudi',serif",
  quranAmiri:"'QF Quran Amiri','Qafiyah Saudi',serif",
  quranSaleem:"'QF Quran Saleem','Qafiyah Saudi',serif",
  mushaf:"'QF Mushaf','Qafiyah Saudi',serif",
  naskhTahrir:"'QF Naskh Tahrir','Qafiyah Saudi',serif",
  helal:"'QF Helal','Qafiyah Saudi',serif",
  baghdadNaskh:"'QF Baghdad Naskh','Qafiyah Saudi',serif",
  topaz:"'QF Topaz','Qafiyah Saudi',serif",
  thuluthMadd:"'QF Thuluth Madd','Qafiyah Saudi',serif",
  diwani1:"'QF Diwani One','Qafiyah Saudi',serif",
  diwani2:"'QF Diwani Two','Qafiyah Saudi',serif",
  palestine:"'QF Palestine','Qafiyah Saudi',serif",
  uthmanBold:"'QF Uthman Taha Bold','Qafiyah Saudi',serif",
  uthmani:"'QF Uthmani','Qafiyah Saudi',serif",
  alAwwal:"'QF Al Awwal','Qafiyah Saudi',sans-serif",
  arabicPoetry:"'QF Arabic Poetry','Qafiyah Saudi',serif",
  masmak:"'QF Masmak','Qafiyah Saudi',sans-serif",
  yearCamel:"'QF Year Camel','Qafiyah Saudi',sans-serif",
  watad:"'QF Watad','Qafiyah Saudi',sans-serif",
  thmanyah:"'QF Thmanyah','Qafiyah Saudi',serif",
  alnaseeb:"'QF Alnaseeb','Qafiyah Saudi',serif",
  alAwwalBold:"'QF Al Awwal Bold Web','Qafiyah Saudi',sans-serif"
};
const allowedThemes=new Set(['natural','dark','morning','evening','night']);
function normalizeTheme(theme){return theme==='light'?'evening':(allowedThemes.has(theme)?theme:'natural')}
function applyTheme(theme){
  const t=normalizeTheme(theme);
  localStorage.setItem(LS.theme,t);
  document.documentElement.setAttribute('data-q-theme',t);
  document.body?.setAttribute('data-q-theme',t);
  const meta=document.querySelector('meta[name="theme-color"]');
  const metaColors={natural:'#3E2723',dark:'#1d1815',morning:'#fffaf1',evening:'#332832',night:'#111e2a'};
  if(meta)meta.setAttribute('content',metaColors[t]||metaColors.natural);
  if(t==='natural')document.documentElement.style.removeProperty('color-scheme');
  else document.documentElement.style.colorScheme=(t==='morning'?'light':'dark');
  return t;
}
window.QafiyahEnhancements={fonts,applyTheme,normalizeTheme};
function getJSON(k,f){try{return JSON.parse(localStorage.getItem(k)||'')||f}catch{return f}}
function setJSON(k,v){localStorage.setItem(k,JSON.stringify(v))}
function applyPrefs(){let fk=localStorage.getItem(LS.font)||'saudi';if(fk==='aref'){fk='ruqaaRegular';localStorage.setItem(LS.font,fk)}document.documentElement.style.setProperty('--qafiyah-font-family',fonts[fk]||fonts.saudi);applyTheme(localStorage.getItem(LS.theme)||'natural')}
if(document.body)applyPrefs();else document.addEventListener('DOMContentLoaded',applyPrefs);

function typeFromHref(href){if(!href)return null; if(/article\.html\?id=/.test(href))return'article';if(/poet\.html\?id=/.test(href))return'poet';if(/poem\.html\?id=/.test(href))return'poem';return null}
function itemKey(type,id){return type+':'+id}
function favorites(){return getJSON(LS.favorites,[])}
function setFavorites(v){setJSON(LS.favorites,v);document.dispatchEvent(new CustomEvent('qafiyah:favorites-changed'))}
function parseId(url){try{return new URL(url,location.href).searchParams.get('id')||''}catch{return''}}
function isFav(type,id){return favorites().some(x=>x.key===itemKey(type,id))}
function heartSVG(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg>'}
function buildItem(type,id,url,scope){const title=(scope.querySelector('h1,h2,.qafiyah-card-title')?.textContent||document.title||'عنصر محفوظ').trim();const img=scope.querySelector('img')?.getAttribute('src')||'';const meta=(scope.querySelector('.qafiyah-card-meta,.qafiyah-detail-meta,.qafiyah-poet-nickname')?.textContent||'').trim();return{key:itemKey(type,id),type,id,title,url,img,meta,savedAt:Date.now()}}
function toggleFavorite(btn){const type=btn.dataset.type,id=btn.dataset.id,url=btn.dataset.url;let list=favorites();const key=itemKey(type,id);const exists=list.some(x=>x.key===key);if(exists)list=list.filter(x=>x.key!==key);else list.unshift(buildItem(type,id,url,btn.closest('.qafiyah-content-card,.qafiyah-detail-card')||document));setFavorites(list);syncFavoriteButtons()}
function syncFavoriteButtons(){document.querySelectorAll('.q-favorite-btn').forEach(b=>{const active=isFav(b.dataset.type,b.dataset.id);b.classList.toggle('is-favorite',active);b.setAttribute('aria-label',active?'إزالة من المفضلة':'إضافة إلى المفضلة');b.title=active?'إزالة من المفضلة':'إضافة إلى المفضلة'})}
function addFavoriteButton(scope,type,id,url){if(!scope||!type||!id||scope.querySelector('.q-favorite-btn'))return;const b=document.createElement('button');b.type='button';b.className='q-favorite-btn';b.dataset.type=type;b.dataset.id=id;b.dataset.url=url;b.innerHTML=heartSVG();b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleFavorite(b)});scope.appendChild(b)}
function enhanceFavoriteTargets(){document.querySelectorAll('.qafiyah-content-card').forEach(card=>{const link=card.querySelector('a[href*="article.html?id="],a[href*="poet.html?id="],a[href*="poem.html?id="]');if(!link)return;const type=typeFromHref(link.getAttribute('href'));const id=parseId(link.href);addFavoriteButton(card,type,id,link.href)});const path=location.pathname.split('/').pop();const map={'article.html':'article','poet.html':'poet','poem.html':'poem'};if(map[path]){const host=document.querySelector('.qafiyah-detail-card');const id=new URLSearchParams(location.search).get('id');if(host&&id)addFavoriteButton(host,map[path],id,location.href)}syncFavoriteButtons()}
let favTimer;const mo=new MutationObserver(()=>{clearTimeout(favTimer);favTimer=setTimeout(enhanceFavoriteTargets,80)});document.addEventListener('DOMContentLoaded',()=>{enhanceFavoriteTargets();mo.observe(document.body,{childList:true,subtree:true});document.querySelectorAll('#favoritesLink').forEach(a=>a.href='favorites.html');document.querySelectorAll('#settingsLink').forEach(a=>a.href='settings.html')});

async function loadNotifications(){const countEl=$('notificationCount'),content=$('notificationContent');if(!countEl&&!content)return;let rows=[];try{if(window.supabaseClient){const res=await window.supabaseClient.from('notifications').select('*').order('created_at',{ascending:false}).limit(30);if(!res.error)rows=res.data||[]}}catch(e){console.warn('Qafiyah notifications:',e)}const read=new Set(getJSON(LS.read,[]).map(String));const unread=rows.filter(r=>!read.has(String(r.id)));if(countEl){countEl.textContent=unread.length>99?'99+':String(unread.length);countEl.classList.toggle('q-show',unread.length>0)}if(content){content.innerHTML=rows.length?rows.map(r=>`<div class="q-notification-item" data-id="${String(r.id).replace(/"/g,'')}"><h4>${escapeHtml(r.title||'إشعار')}</h4><p>${escapeHtml(r.message||'')}</p>${r.link?`<a href="${escapeAttr(r.link)}">فتح</a>`:''}</div>`).join(''):'<p>لا توجد إشعارات جديدة.</p>'}window.__qafiyahNotifications=rows}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}function escapeAttr(s){return escapeHtml(s)}
function markNotificationsRead(){const rows=window.__qafiyahNotifications||[];if(!rows.length)return;setJSON(LS.read,rows.map(r=>String(r.id)));const c=$('notificationCount');if(c){c.classList.remove('q-show');c.textContent='0'}}
document.addEventListener('DOMContentLoaded',()=>{loadNotifications();$('notificationButton')?.addEventListener('click',()=>setTimeout(markNotificationsRead,100));setInterval(loadNotifications,60000)});


// ============================================================
// توحيد الفوتر وتواصل معنا والقائمة الجانبية في جميع صفحات قافية
// ============================================================
const QAFIYAH_SOCIALS=[
  {key:'x',label:'X',href:'#',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.38L6.49 22H3.38l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.52h1.73L8.29 4.34H6.43L17.8 19.52Z"></path></svg>'},
  {key:'tiktok',label:'TikTok',href:'#',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3c.4 2.4 1.8 3.9 4.2 4.3v3.2c-1.6 0-3-.5-4.2-1.4v6.2a6.3 6.3 0 1 1-5.4-6.2v3.3a3.1 3.1 0 1 0 2.2 3V3h3.2Z"></path></svg>'},
  {key:'instagram',label:'Instagram',href:'#',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg>'},
  {key:'threads',label:'Threads',href:'#',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.8 8.4c-1.2-2-3.2-3.1-5.7-3.1-4.3 0-7 2.7-7 6.7 0 4.1 2.8 6.8 7.1 6.8 3.6 0 6.1-1.9 6.1-4.7 0-2.5-2-4.1-5-4.1-2.7 0-4.5 1.3-4.5 3.2 0 1.6 1.3 2.7 3.2 2.7 2.6 0 4.4-1.8 4.4-4.6 0-1.6-.4-3-1.2-4.2"></path></svg>'},
  {key:'facebook',label:'Facebook',href:'#',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.8 22v-8h2.7l.4-3.1h-3.1V9c0-.9.3-1.5 1.6-1.5H17V4.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.5V14h2.8v8h3.5Z"></path></svg>'},
  {key:'whatsapp',label:'WhatsApp',href:'#',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 11.8a8.4 8.4 0 0 1-12.4 7.4L3 20.6l1.4-4.9A8.4 8.4 0 1 1 20.5 11.8Z"></path><path d="M8.2 7.8c.3-.5.6-.5.9-.5h.5c.2 0 .4.1.5.4l.8 1.9c.1.3 0 .5-.1.7l-.6.8c-.2.2-.2.4 0 .7.5.9 1.2 1.6 2 2.2.9.6 1.7.9 2.1 1 .3.1.5 0 .7-.2l.9-1.1c.2-.2.4-.3.7-.2l2 .9c.3.1.4.3.4.5 0 .4-.2 1.3-.7 1.8-.6.6-1.5.9-2.4.9-1 0-2.3-.3-3.9-1.1-1.2-.6-2.5-1.5-3.7-2.8-1.1-1.2-1.9-2.5-2.3-3.6-.4-1-.4-1.8.2-2.3Z"></path></svg>'},
  {key:'telegram',label:'Telegram',href:'#',svg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 4.2 18.3 19c-.2 1-1 1.2-1.8.7l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L5.9 12.6 1 11.1c-1-.3-1.1-1 .2-1.5l19.1-7.4c.9-.3 1.7.2 1.2 2Z"></path></svg>'}
];
function qSocialLinks(className){
  return QAFIYAH_SOCIALS.map(s=>`<a href="${s.href}" class="${className||''}" data-q-social-placeholder="${s.key}" aria-label="${s.label}" title="${s.label}">${s.svg}</a>`).join('');
}
function qFooterHTML(){
  return `
    <div class="footer-container">
      <div class="footer-brand">
        <a href="index.html" class="footer-logo">القافية</a>
        <p>موسوعة عربية مختصة في الشعر والأدب العربي، تجمع القصائد والشعراء والمقالات في مكان واحد.</p>
      </div>
      <div class="footer-links">
        <h3>استكشف</h3>
        <a href="Poems.html">القصائد</a>
        <a href="poets.html">الشعراء</a>
        <a href="articles.html">المقالات</a>
        <a href="books.html">الكتب</a>
        <a href="about.html">نبذة عن القافية</a>
      </div>
      <div class="footer-links">
        <h3>الحساب</h3>
        <a href="profile.html">الملف الشخصي</a>
        <a href="favorites.html" id="footerFavoritesLink">المفضلة</a>
        <a href="settings.html" id="footerSettingsLink">الإعدادات</a>
      </div>
      <div class="footer-contact">
        <h3>تواصل معنا</h3>
        <a href="#" class="q-contact-email" data-q-email-placeholder aria-label="البريد الإلكتروني">البريد الإلكتروني</a>
        <div class="footer-socials q-contact-socials">${qSocialLinks('')}</div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 القافية — جميع الحقوق محفوظة</p>
      <span>موسوعة الشعر والأدب العربي</span>
    </div>`;
}
function qSideFooterHTML(){
  return `
    <div class="q-side-contact">
      <h4>تواصل معنا</h4>
      <a href="#" class="q-side-email" data-q-email-placeholder aria-label="البريد الإلكتروني">البريد الإلكتروني</a>
      <div class="side-menu-socials q-contact-socials">${qSocialLinks('')}</div>
    </div>
    <p>© القافية</p>`;
}
window.QafiyahEnhancements.footerHTML=qFooterHTML;
window.QafiyahEnhancements.sideFooterHTML=qSideFooterHTML;

function ensureUnifiedFooterAndContact(){
  const currentPage=(location.pathname.split('/').pop()||'').toLowerCase().replace(/\.html$/,'');
  // الإعدادات والمفضلة صفحات عادية كاملة مثل بقية الموقع.

  if(currentPage==='profile'){
    // الملف الشخصي فقط: بلا رأس وبلا ذيل، مع الإبقاء على قائمة الثلاث خطوط.
    document.querySelectorAll('body > header, body > footer, .site-header, .site-footer').forEach(el=>el.remove());
    // مهم: لا نعرض ذيل/تواصل معنا داخل قائمة الملف الشخصي.
    document.querySelectorAll('.side-menu .side-menu-footer').forEach(el=>el.remove());
    return;
  }

  // تصحيح روابط الحساب أينما كانت، حتى لو بقيت نسخة HTML قديمة في المتصفح.
  document.querySelectorAll('#footerFavoritesLink,#favoritesLink').forEach(a=>a.setAttribute('href','favorites.html'));
  document.querySelectorAll('#footerSettingsLink,#settingsLink').forEach(a=>a.setAttribute('href','settings.html'));
  document.querySelectorAll('a').forEach(a=>{
    const label=(a.textContent||'').trim();
    if(label==='المفضلة' && (!a.getAttribute('href') || a.getAttribute('href')==='#')) a.setAttribute('href','favorites.html');
    if(label==='الإعدادات' && (!a.getAttribute('href') || a.getAttribute('href')==='#')) a.setAttribute('href','settings.html');
  });

  // الفوتر موحّد في جميع صفحات الموقع العامة.
  let footer=document.querySelector('.site-footer');
  if(!footer){
    footer=document.createElement('footer');
    footer.className='site-footer';
    const scripts=[...document.body.querySelectorAll(':scope > script')];
    if(scripts.length) document.body.insertBefore(footer,scripts[0]); else document.body.appendChild(footer);
  }
  footer.innerHTML=qFooterHTML();

  // تواصل معنا في أسفل القائمة الجانبية ذات الثلاثة خطوط.
  const sideMenu=document.querySelector('.side-menu');
  if(sideMenu){
    let sideFooter=sideMenu.querySelector('.side-menu-footer');
    if(!sideFooter){
      sideFooter=document.createElement('div');
      sideFooter.className='side-menu-footer';
      sideMenu.appendChild(sideFooter);
    }
    sideFooter.innerHTML=qSideFooterHTML();
  }

  // الروابط الاجتماعية placeholders إلى أن يضيف المالك اليوزرات/الروابط.
  document.querySelectorAll('[data-q-social-placeholder],[data-q-email-placeholder]').forEach(a=>{
    if(a.getAttribute('href')==='#'){
      a.addEventListener('click',e=>e.preventDefault());
    }
  });
}
document.addEventListener('DOMContentLoaded',ensureUnifiedFooterAndContact);

})();
