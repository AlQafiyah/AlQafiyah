'use strict';
// فروع القافية: مُجيب وسِجال. رموز خطية متوافقة مع أيقونات القائمة القديمة.
document.addEventListener('DOMContentLoaded',()=>{
 const icons={sijal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="m8 13-2 8 6-3 6 3-2-8"/></svg>',mujeeb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 4h14v12H9l-4 4V4Z"/><path d="M9 9h6M9 12h4"/></svg>'};
 document.querySelectorAll('.side-navigation').forEach(nav=>{
  nav.querySelectorAll('a[href="midmar.html"]').forEach(a=>a.remove());
  if(location.pathname.endsWith('/sijal.html'))nav.querySelectorAll('a.active').forEach(a=>a.classList.remove('active'));
  let anchor=nav.querySelector('a[href*="articles.html"]')||nav.querySelector('a:last-of-type');
  for(const [href,name,key] of [['mujeeb.html','مُجيب','mujeeb'],['sijal.html','سِجال','sijal']]){
   if(nav.querySelector(`a[href="${href}"]`))continue;
   const a=document.createElement('a');a.href=href;a.className='q-new-link';a.innerHTML=`<span class="menu-icon q-new-symbol" aria-hidden="true">${icons[key]}</span><span>${name}</span>`;
   anchor?.insertAdjacentElement('afterend',a);anchor=a;
   if(location.pathname.endsWith('/'+href))a.classList.add('active');
  }
 });
 // إيقاف سِجال من لوحة الإدارة يخفي الرابط عن قوائم الزوار فور تحميل بياناته.
 // يبقى العنوان المباشر صفحة صيانة غير قابلة للعب.
 const db=window.supabaseClient;
 if(db && typeof db.from==='function'){
  db.from('qafiyah_sijal_settings').select('enabled').eq('id',1).maybeSingle()
   .then(({data,error})=>{
    if(error || !data || data.enabled!==false)return;
    document.querySelectorAll('.side-navigation a[href="sijal.html"]').forEach(a=>a.remove());
   }).catch(()=>{});
 }
});
