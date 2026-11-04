(() => {
  const SW_URL = './sw.js?v=1';
  const MANIFEST_URL = './manifest.webmanifest';

  function injectHead() {
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = MANIFEST_URL;
      document.head.appendChild(link);
    }
    const metas = [
      ['theme-color', '#081426'],
      ['apple-mobile-web-app-capable', 'yes'],
      ['apple-mobile-web-app-status-bar-style', 'black-translucent'],
      ['mobile-web-app-capable', 'yes']
    ];
    metas.forEach(([name, content]) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const m = document.createElement('meta');
        m.name = name;
        m.content = content;
        document.head.appendChild(m);
      }
    });
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const icon = document.createElement('link');
      icon.rel = 'apple-touch-icon';
      icon.href = './icon.svg';
      document.head.appendChild(icon);
    }
  }

  async function registerSW() {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.register(SW_URL, { scope: './' });
      return reg;
    } catch (e) {
      console.warn('[notify] SW register failed', e);
      return null;
    }
  }

  async function ensurePermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    try {
      return await Notification.requestPermission();
    } catch (e) {
      return 'denied';
    }
  }

  async function showLocalNotification(title, body, data) {
    const perm = await ensurePermission();
    if (perm !== 'granted') return false;
    const reg = await registerSW();
    const opts = {
      body: body || '',
      icon: './icon.svg',
      badge: './icon.svg',
      tag: (data && data.tag) || 'gestione-ore',
      renotify: true,
      data: { url: (data && data.url) || './' },
      vibrate: [120, 60, 120]
    };
    try {
      if (reg && reg.showNotification) {
        await reg.showNotification(title, opts);
      } else {
        new Notification(title, opts);
      }
      return true;
    } catch (e) {
      console.warn('[notify] show failed', e);
      return false;
    }
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function createNotifyButton() {
    if (document.getElementById('notifyEnableBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'notifyEnableBtn';
    btn.type = 'button';
    btn.textContent = Notification.permission === 'granted' ? '🔔 Notifiche ON' : '🔔 Attiva notifiche';
    btn.title = 'Attiva notifiche stile app (su iPhone: aggiungi prima a Home)';
    btn.style.cssText = [
      'position:fixed', 'left:12px', 'bottom:max(12px, env(safe-area-inset-bottom))',
      'z-index:80', 'padding:10px 14px', 'border-radius:999px',
      'border:1px solid rgba(255,255,255,.2)', 'background:rgba(8,20,38,.92)',
      'color:#e8f6ff', 'font:700 12px/1 system-ui', 'cursor:pointer',
      'backdrop-filter:blur(12px)', '-webkit-backdrop-filter:blur(12px)',
      'box-shadow:0 8px 28px rgba(0,0,0,.35)'
    ].join(';');

    const place = () => {
      const smart = document.getElementById('coverScreen')?.classList.contains('smart-mode');
      btn.style.bottom = smart
        ? 'calc(120px + env(safe-area-inset-bottom))'
        : 'max(12px, env(safe-area-inset-bottom))';
    };
    place();
    setInterval(place, 1000);

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!isStandalone() && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
        alert('Su iPhone:\n1) Safari → Condividi → “Aggiungi a Home”\n2) Apri l’icona dalla Home\n3) Tocca di nuovo “Attiva notifiche”');
      }
      const perm = await ensurePermission();
      if (perm === 'granted') {
        btn.textContent = '🔔 Notifiche ON';
        await showLocalNotification('Gestione Ore', 'Notifiche attive. Ti avviserò qui come un messaggio.');
        localStorage.setItem('gestione_ore_notify', '1');
      } else if (perm === 'denied') {
        alert('Notifiche bloccate. Abilitale dalle Impostazioni del telefono per questa app.');
      }
    });
    document.body.appendChild(btn);
  }

  function maybeRemindToday() {
    if (localStorage.getItem('gestione_ore_notify') !== '1') return;
    if (Notification.permission !== 'granted') return;
    try {
      if (typeof DATA === 'undefined' || typeof ensureYear !== 'function') return;
      const now = new Date();
      if (now.getHours() < 17) return;
      const iso = now.toISOString().slice(0, 10);
      const y = ensureYear(now.getFullYear());
      const m = y.months[now.getMonth()];
      if (!m || !Array.isArray(m.entries)) return;
      const entry = m.entries.find(e => e && e.date === iso);
      if (!entry) return;
      if (Number(entry.ore) > 0 || entry.uscita) return;
      const key = 'gestione_ore_reminded_' + iso;
      if (localStorage.getItem(key) === '1') return;
      showLocalNotification(
        'Ore di oggi mancanti',
        'Non hai ancora inserito l’uscita di oggi. Tocca per aprire la dash.',
        { tag: 'remind-today', url: './' }
      );
      localStorage.setItem(key, '1');
    } catch (e) {
      console.warn('[notify] remind', e);
    }
  }

  window.GestioneOreNotify = {
    show: showLocalNotification,
    permission: () => (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'),
    isStandalone
  };

  injectHead();
  registerSW();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(createNotifyButton, 1200);
      setTimeout(maybeRemindToday, 4000);
    });
  } else {
    setTimeout(createNotifyButton, 1200);
    setTimeout(maybeRemindToday, 4000);
  }
})();
