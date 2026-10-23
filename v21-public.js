/* القافية V21: صيانة وإعلانات وروابط التواصل */
(()=>{'use strict';
const db=()=>window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:null}catch{return null}};
const css=document.createElement('style');css.textContent=`.v21-maintenance{position:fixed;inset:0;z-index:2147483646;background:var(--bg,#f8f5ef);color:var(--text,#302a24);display:flex;align-items:center;justify-content:center;text-align:center;direction:rtl;padding:24px}.v21-maintenance>div{max-width:530px}.v21-maintenance h1{font-size:32px}.v21-ad-layer{position:fixed;inset:0;z-index:2147483600;background:#0008;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl}.v21-ad-box{position:relative;background:var(--card-bg,#fff);color:var(--text,#29241f);width:min(570px,100%);max-height:85vh;overflow:auto;border-radius:14px;box-shadow:0 20px 70px #0005;padding:24px;text-align:center}.v21-ad-box img,.v21-ad-box video{width:100%;max-height:65vh;object-fit:contain;border-radius:8px}.v21-ad-close{position:absolute;top:9px;left:10px;border:1px solid #aaa;background:transparent;color:inherit;border-radius:50%;width:34px;height:34px;font-size:20px;cursor:pointer}.v21-ad-link{display:inline-block;padding:10px 20px;border:1px solid currentColor;border-radius:8px;color:inherit;text-decoration:none;margin-top:10px}`;document.head.append(css);
function sessionId(){try{let k=localStorage.getItem('qafiyah-v21-visitor');if(!k){k=crypto.randomUUID();localStorage.setItem('qafiyah-v21-visitor',k)}return k}catch{return crypto.randomUUID()}}
async function maintenance(){try{const r=await db().from('qafiyah_maintenance').select('enabled,message').eq('id',1).maybeSingle();if(r.error||!r.data?.enabled)return false;const allow=await db().rpc('qafiyah_v21_maintenance_access');if(!allow.error&&allow.data===true)return false;const layer=document.createElement('div');layer.className='v21-maintenance';const box=document.createElement('div');const title=document.createElement('h1');title.textContent='القافية في صيانة مؤقتة';const msg=document.createElement('p');msg.textContent=r.data.message||'نعمل على تحسين الموقع، نعود قريبًا.';box.append(title,msg);layer.append(box);document.body.append(layer);document.documentElement.style.overflow='hidden';return true}catch(e){console.warn('maintenance check',e);return false}}
let socialRequestVersion=0;
async function social(){const requestVersion=++socialRequestVersion;try{
 const r=await db().from('qafiyah_social_links').select('*').order('sort_order');
 if(requestVersion!==socialRequestVersion)return;
 if(r.error||!r.data){console.warn('social links unavailable',r.error);return;}
 const platforms=new Set(['x','tiktok','instagram','threads','facebook','whatsapp','telegram','email']);
 for(const el of document.querySelectorAll('[data-q-social-placeholder],[data-q-email-placeholder]')){
  const platform=(el.getAttribute('data-q-social-placeholder')||'email').toLowerCase();
  if(!platforms.has(platform)){el.remove();continue}
  const placement=el.closest('.q-side-contact,.side-menu-socials,.side-menu,.mobile-menu,.sidebar,.side-menu-footer,.q-side-footer')?'sidebar':'footer';
  // Compatibility with both historical "sidebar:x" keys and current placement column.
  const normalized=r.data.map(x=>{const raw=String(x.platform||'').toLowerCase();const legacy=raw.match(/^(footer|sidebar):(.+)$/);return {...x,_platform:legacy?legacy[2]:raw,_placement:legacy?legacy[1]:(x.placement||'footer')};});
  const candidates=normalized.filter(x=>x._platform===platform&&x._placement===placement);
  // Older installations stored a single link for both placements. Preserve it until a scoped row exists.
  const fallback=placement==='sidebar'&&!candidates.length?normalized.filter(x=>x._platform===platform&&x._placement==='footer'):[];
  const match=[...(candidates.length?candidates:fallback)].sort((a,b)=>new Date(b.updated_at||0)-new Date(a.updated_at||0)||Number(b.id||0)-Number(a.id||0))[0];
  if(!match||match.is_visible===false){el.hidden=true;el.setAttribute('aria-hidden','true');el.style.setProperty('display','none','important');continue}
  let url=String(match?.url||'').trim();
  if(platform==='email'){
   if(url&&!url.startsWith('mailto:'))url='mailto:'+url;
   if(url&&!/^mailto:[^\s@]+@[^\s@?]+(?:\?[^\s]*)?$/.test(url))url='';
  }else url=validUrl(url)||'';
  if(!url){el.hidden=true;el.setAttribute('aria-hidden','true');el.style.setProperty('display','none','important');continue;}
  el.hidden=false;el.removeAttribute('aria-hidden');el.style.removeProperty('display');el.style.removeProperty('visibility');
  el.setAttribute('href',url);el.onclick=null;el.removeAttribute('disabled');el.target=url.startsWith('https:')?'_blank':'_self';el.rel='noopener noreferrer';el.style.pointerEvents=url?'auto':'none';el.setAttribute('aria-disabled',url?'false':'true');
 }
 for(const holder of document.querySelectorAll('.side-menu-socials,.footer-socials')){
   if(!holder.querySelector('a:not([hidden])')){holder.hidden=true;holder.style.setProperty('display','none','important');}
   else {holder.hidden=false;holder.style.removeProperty('display');}
 }
 // لا تُنشأ روابط جديدة؛ تُحدَّث فقط العناصر الأصلية.
 }catch(e){console.warn('social',e)} }

async function ads(){try{const r=await db().from('qafiyah_ads').select('*').eq('is_active',true).order('priority',{ascending:false});if(r.error||!r.data?.length)return;const page=location.pathname.split('/').pop()||'index.html';const visitor=sessionId();const eligible=r.data.filter(a=>a.pages?.includes('all')||a.pages?.includes(page)||a.pages?.includes(page.replace('.html','')));for(const a of eligible){const key=`qv21-ad-${a.id}`;let shown=false;try{if(a.frequency==='once')shown=localStorage.getItem(key)==='1';if(a.frequency==='session')shown=sessionStorage.getItem(key)==='1';if(a.frequency==='home'&&page!=='index.html')shown=true;if(a.frequency==='navigation')shown=false}catch{}if(shown)continue;const overlay=document.createElement('div');overlay.className='v21-ad-layer';const box=document.createElement('div');box.className='v21-ad-box';const close=document.createElement('button');close.className='v21-ad-close';close.textContent='×';close.setAttribute('aria-label','إغلاق الإعلان');close.onclick=()=>overlay.remove();const title=document.createElement('h3');title.textContent=a.title;box.append(close,title);if(a.body){const p=document.createElement('p');p.textContent=a.body;box.append(p)}const media=validUrl(a.media_url);if(media&&a.media_type==='image'){const img=document.createElement('img');img.src=media;img.alt=a.title;box.append(img)}if(media&&a.media_type==='video'){const video=document.createElement('video');video.src=media;video.controls=true;video.playsInline=true;box.append(video)}const link=validUrl(a.target_url);if(link){const btn=document.createElement('a');btn.href=link;btn.target='_blank';btn.rel='noopener noreferrer';btn.className='v21-ad-link';btn.textContent='عرض التفاصيل';btn.onclick=()=>db().rpc('qafiyah_v21_record_ad_event',{p_ad_id:a.id,p_event_type:'click',p_visitor_key:visitor});box.append(btn);if(media&&a.media_type==='image')box.querySelector('img').onclick=()=>btn.click()}overlay.append(box);document.body.append(overlay);db().rpc('qafiyah_v21_record_ad_event',{p_ad_id:a.id,p_event_type:'view',p_visitor_key:visitor}).then(()=>{});try{if(a.frequency==='once')localStorage.setItem(key,'1');if(a.frequency==='session')sessionStorage.setItem(key,'1');if(a.frequency==='navigation')sessionStorage.setItem(key+':'+page,'1')}catch{}if(a.duration_seconds>0)setTimeout(()=>overlay.remove(),a.duration_seconds*1000);break}}catch(e){console.warn('ads',e)}}
async function init(){if(!db())return;const closed=await maintenance();if(closed)return;await social();await ads();document.addEventListener('visibilitychange',()=>{if(!document.hidden)social()});window.addEventListener('pageshow',()=>social());setInterval(()=>{if(!document.hidden)social()},30000)}
// Refresh existing footer/sidebar links if another layout script re-renders them.
let socialRefreshTimer=0;
function watchSocialMounts(){
 const observer=new MutationObserver(records=>{
  if(!records.some(rec=>[...rec.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('[data-q-social-placeholder],[data-q-email-placeholder],.footer-socials,.side-menu-socials,.q-side-contact,.footer-contact')||n.querySelector?.('[data-q-social-placeholder],[data-q-email-placeholder]')))))return;
  clearTimeout(socialRefreshTimer);
  socialRefreshTimer=setTimeout(()=>{if(db())social()},120);
 });
 observer.observe(document.body,{childList:true,subtree:true});
}
let attempts=0;function start(){if(!attempts)watchSocialMounts();if(db())init();else if(++attempts<40)setTimeout(start,250)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
