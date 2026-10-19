'use strict';
// أضف روابط الميزات الجديدة إلى القائمة الحالية دون إعادة بنائها أو تغيير تصميمها.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.side-navigation').forEach(nav => {
    const anchor=nav.querySelector('a[href*="articles.html"]') || nav.querySelector('a:last-of-type');
    for(const [href,title,symbol] of [['mujeeb.html','مُجيب','✦'],['midmar.html','مِضمار','♜']]) {
      if(nav.querySelector(`a[href="${href}"]`)) continue;
      const link=document.createElement('a');link.href=href;link.className='q-new-link';
      link.innerHTML=`<span class="menu-icon q-new-symbol" aria-hidden="true">${symbol}</span><span>${title}</span>`;
      if(location.pathname.endsWith('/'+href)) link.classList.add('active');
      anchor?.insertAdjacentElement('afterend',link);
    }
  });
});
