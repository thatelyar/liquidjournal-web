/* Installable web shell. Account and journal data remain in this browser's IndexedDB. */
(function () {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/liquidjournal-web/sw.js', { scope: '/liquidjournal-web/', updateViaCache: 'none' })
      .catch(error => console.warn('Offline app installation is unavailable:', error));
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  }, { once: true });
})();

document.addEventListener('click',event=>{const link=event.target.closest?.('a[href]');if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;const url=new URL(link.href,location.href);if(url.origin===location.origin&&url.pathname.startsWith('/demo/')){event.preventDefault();window.localLiquid?.go(url.pathname+url.search)}},true);
