/* Installable web shell. Account and journal data remain in this browser's IndexedDB. */
(function () {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  // A new app version took over: reload once so the phone runs the new code instead of the cached one.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/liquidjournal-web/sw.js', { scope: '/liquidjournal-web/', updateViaCache: 'none' })
      .then((reg) => {
        const check = () => reg.update().catch(() => {});
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
        setInterval(check, 5 * 60 * 1000);
        check();
      })
      .catch(error => console.warn('Offline app installation is unavailable:', error));
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  }, { once: true });
  // Manual fix for a stuck cache: drops cached app files and the service worker, then reloads.
  // Journal data is kept (it lives in IndexedDB / localStorage and in your account).
  window.refreshApp = async () => {
    try { for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); } catch {}
    try { for (const k of await caches.keys()) await caches.delete(k); } catch {}
    location.reload();
  };
})();

document.addEventListener('click',event=>{const link=event.target.closest?.('a[href]');if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;const url=new URL(link.href,location.href);if(url.origin===location.origin&&url.pathname.startsWith('/demo/')){event.preventDefault();window.localLiquid?.go(url.pathname+url.search)}},true);
