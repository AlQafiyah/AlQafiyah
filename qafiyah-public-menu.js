/* Public pages only. Admin remains unchanged. */
(() => {
  'use strict';
  const editable = (target) => target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'));

  // Hide the browser's ordinary right-click menu on public-page content.
  // Keep native editing menus for text inputs and editors.
  document.addEventListener('contextmenu', (event) => {
    if (!editable(event.target)) event.preventDefault();
  });

  // Discourage common inspect/view-source keyboard shortcuts.
  document.addEventListener('keydown', (event) => {
    if (editable(event.target)) return;
    const key = event.key.toLowerCase();
    const mod = event.ctrlKey || event.metaKey;
    const inspect = event.key === 'F12' ||
      (mod && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
      (mod && !event.shiftKey && key === 'u');
    if (inspect) event.preventDefault();
  }, true);
})();
