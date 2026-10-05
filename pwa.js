let installEvent = null;
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const dismissed = () => { try { return sessionStorage.getItem('pharmatap-install-dismissed') === 'yes'; } catch { return false; } };
function hideInstall() { document.querySelector('#install-prompt')?.remove(); }
function dismissInstall() {
  try { sessionStorage.setItem('pharmatap-install-dismissed', 'yes'); } catch {}
  hideInstall();
}
function showInstall(ios = false) {
  if (standalone() || dismissed() || document.querySelector('#install-prompt')) return;
  const panel = document.createElement('section');
  panel.id = 'install-prompt';
  panel.className = 'install-prompt';
  panel.setAttribute('aria-label', 'Install PharmaTap');
  panel.innerHTML = `<div><strong>Install PharmaTap</strong><p>${ios ? 'Tap Share, then Add to Home Screen.' : 'Open your pharmacy workspace as an app.'}</p></div><div class="install-buttons">${ios ? '' : '<button id="install-app">Install</button>'}<button id="install-later" class="secondary">${ios ? 'Got it' : 'Not now'}</button></div>`;
  document.body.append(panel);
  panel.querySelector('#install-later').addEventListener('click', dismissInstall);
  panel.querySelector('#install-app')?.addEventListener('click', async () => {
    const event = installEvent;
    if (!event) return;
    installEvent = null;
    hideInstall();
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === 'dismissed') dismissInstall();
    } catch { dismissInstall(); }
  });
}
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installEvent = event;
  showInstall();
});
window.addEventListener('appinstalled', () => { installEvent = null; hideInstall(); });
const displayMode = window.matchMedia('(display-mode: standalone)');
displayMode.addEventListener('change', () => { if (standalone()) hideInstall(); });
const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (ios) showInstall(true);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch(error => console.warn('PharmaTap installation support unavailable:', error));
  });
}
