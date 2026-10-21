/* AlQafiyah: non-destructive common media enhancements */
(()=>{'use strict';
const targets='.poem-card img,.poet-card img,.book-card img,.poet-photo,.poem-image,.book-cover';
function update(root){const imgs=(root||document).querySelectorAll(targets);imgs.forEach(img=>{if(img.dataset.qMediaReady)return;img.dataset.qMediaReady='1';img.addEventListener('load',()=>{if(!img.naturalWidth)return;const src=(img.currentSrc||img.src||'').split('?')[0].toLowerCase();const transparent=/\.png$|\.webp$|\.svg$/.test(src);if(transparent){img.style.background='transparent';img.style.boxShadow='none';img.style.border='0';img.dataset.qTransparent='true';} },{once:true});});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>update(document));else update(document);
let timer;const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>update(document),120)});observer.observe(document.documentElement,{subtree:true,childList:true});
})();