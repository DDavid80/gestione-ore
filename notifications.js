(() => {
  const SW_URL = './sw.js?v=2';
  const MANIFEST_URL = './manifest.webmanifest';
  const PREFS_KEY = 'gestione_ore_notify_prefs_v1';
  const ENABLED_KEY = 'gestione_ore_notify';

  const DEFAULT_PREFS = {
    enabled: false,
    missingHours: true,
    exitReminder: true,
    oncallSoon: true,
    oncallDays: 3,
    syncOk: false
  };

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return { ...DEFAULT_PREFS, enabled: localStorage.getItem(ENABLED_KEY) === '1' };
      return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULT_PREFS };
    }
  }

  function savePrefs(p) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
    localStorage.setItem(ENABLED_KEY, p.enabled ? '1' : '0');
  }

  function injectHead() {
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = MANIFEST_URL;
      document.head.appendChild(link);
    }
    [
      ['theme-color', '#081426'],
      ['apple-mobile-web-app-capable', 'yes'],
      ['apple-mobile-web-app-status-bar-style', 'black-translucent'],
      ['mobile-web-app-capable', 'yes']
    ].forEach(([name, content]) => {
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
      return await navigator.serviceWorker.register(SW_URL, { scope: './' });
    } catch (e) {
      console.warn('[notify] SW', e);
      return null;
    }
  }

  async function ensurePermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    try { return await Notification.requestPermission(); }
    catch (e) { return 'denied'; }
  }

  async function showLocalNotification(title, body, data) {
    const prefs = loadPrefs();
    if (!prefs.enabled && !(data && data.force)) return { ok:false, reason:'disabled' };
    if (!('Notification' in window)) return { ok:false, reason:'unsupported' };
    const perm = await ensurePermission();
    if (perm !== 'granted') return { ok:false, reason:'permission:'+perm };

    const opts = {
      body: body || '',
      icon: './icon.svg',
      badge: './icon.svg',
      tag: (data && data.tag) || 'gestione-ore-' + Date.now(),
      renotify: true,
      requireInteraction: !!(data && data.force),
      data: { url: (data && data.url) || './' }
    };

    try {
      let reg = await registerSW();
      if (reg) {
        try { reg = await navigator.serviceWorker.ready; } catch (e) {}
        if (reg && reg.showNotification) {
          await reg.showNotification(title, opts);
          return { ok:true, via:'service-worker' };
        }
      }
      const n = new Notification(title, opts);
      return { ok:true, via:'notification-api', notification:n };
    } catch (e) {
      console.warn('[notify] show', e);
      return { ok:false, reason:String(e && e.message || e) };
    }
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function todayISO() {
    const n = new Date();
    return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  }

  function getTodayEntry() {
    if (typeof DATA === 'undefined' || typeof ensureYear !== 'function') return null;
    const now = new Date();
    const y = ensureYear(now.getFullYear());
    const m = y && y.months && y.months[now.getMonth()];
    if (!m || !Array.isArray(m.entries)) return null;
    const iso = todayISO();
    return m.entries.find(e => e && e.date === iso) || null;
  }

  function oncePerDay(key) {
    const k = 'gestione_ore_nflag_' + key + '_' + todayISO();
    if (localStorage.getItem(k) === '1') return false;
    localStorage.setItem(k, '1');
    return true;
  }

  function runReminders() {
    const prefs = loadPrefs();
    if (!prefs.enabled || Notification.permission !== 'granted') return;
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const entry = getTodayEntry();

    if (prefs.missingHours && hour >= 17 && entry) {
      if (!(Number(entry.ore) > 0 || entry.uscita)) {
        if (oncePerDay('missing')) {
          showLocalNotification(
            'Ore di oggi mancanti',
            'Non hai ancora inserito l’uscita di oggi.',
            { tag: 'missing-hours' }
          );
        }
      }
    }

    if (prefs.exitReminder && hour === 15 && minute >= 5 && minute <= 25 && entry) {
      if (!entry.uscita && !(Number(entry.ore) > 0)) {
        if (oncePerDay('exit')) {
          showLocalNotification(
            'Promemoria uscita',
            'Orario base 15:21. Se esci dopo, registra l’ora in agenda.',
            { tag: 'exit-reminder' }
          );
        }
      }
    }

    if (prefs.oncallSoon && typeof DATA !== 'undefined') {
      try {
        const days = Math.max(1, Math.min(14, Number(prefs.oncallDays) || 3));
        if (typeof window.__coverOncallDays === 'number' && window.__coverOncallDays >= 0 && window.__coverOncallDays <= days) {
          if (oncePerDay('oncall')) {
            showLocalNotification(
              'Reperibilità in arrivo',
              window.__coverOncallDays === 0
                ? 'Reperibilità attiva da oggi.'
                : `Tra ${window.__coverOncallDays} giorni inizia la reperibilità.`,
              { tag: 'oncall-soon' }
            );
          }
        }
      } catch (e) {}
    }
  }

  function ensureStyles() {
    if (document.getElementById('notify-prefs-style')) return;
    const s = document.createElement('style');
    s.id = 'notify-prefs-style';
    s.textContent = `
      #notifyEnableBtn{
        position:fixed;left:12px;bottom:max(12px,env(safe-area-inset-bottom));z-index:80;
        padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.2);
        background:rgba(8,20,38,.92);color:#e8f6ff;font:700 12px/1 system-ui;cursor:pointer;
        backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
        box-shadow:0 8px 28px rgba(0,0,0,.35);
      }
      #notifyPrefsPanel{
        display:none;position:fixed;inset:0;z-index:120;background:rgba(0,0,0,.55);
        align-items:flex-end;justify-content:center;padding:12px;
      }
      #notifyPrefsPanel.open{display:flex}
      #notifyPrefsSheet{
        width:min(480px,100%);max-height:min(86vh,640px);overflow:auto;
        background:linear-gradient(165deg,#0d1a2b,#0a1420);border:1px solid rgba(255,255,255,.14);
        border-radius:18px 18px 14px 14px;padding:18px 16px 20px;color:#e8f2ff;
        box-shadow:0 24px 64px rgba(0,0,0,.5);
      }
      #notifyPrefsSheet h2{margin:0 0 4px;font:800 1.15rem/1.2 system-ui}
      #notifyPrefsSheet .sub{margin:0 0 14px;color:#8aa0b8;font-size:.82rem;line-height:1.4}
      .np-row{
        display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
        padding:12px 0;border-top:1px solid rgba(255,255,255,.08);
      }
      .np-row label{font:700 .9rem/1.25 system-ui;color:#e8f2ff}
      .np-row p{margin:4px 0 0;font-size:.75rem;color:#8aa0b8;line-height:1.35}
      .np-row input[type=checkbox]{width:20px;height:20px;accent-color:#4fdcff;margin-top:2px}
      .np-row input[type=number]{
        width:64px;padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.18);
        background:rgba(255,255,255,.06);color:#e8f2ff;font-weight:700;
      }
      .np-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
      .np-actions button{
        flex:1;min-width:120px;min-height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.16);
        font:800 13px/1 system-ui;cursor:pointer;
      }
      .np-actions .primary{background:linear-gradient(105deg,#4fdcff,#3b8cff);color:#041018;border:0}
      .np-actions .ghost{background:rgba(255,255,255,.06);color:#d5e6f7}
      .np-status{margin-top:10px;font-size:.75rem;color:#7dd3e8}
      #notifySideCard{
        margin-top:16px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.05);
      }
      #notifySideCard h4{margin:0 0 6px;font:800 .78rem/1.2 system-ui;letter-spacing:.04em;text-transform:uppercase;color:#9eb6cc}
      #notifySideCard button{
        width:100%;min-height:40px;border-radius:10px;border:1px solid rgba(79,220,255,.35);
        background:rgba(79,220,255,.12);color:#d9f8ff;font:700 12px system-ui;cursor:pointer;
      }
    `;
    document.head.appendChild(s);
  }

  function openPrefs() {
    const panel = document.getElementById('notifyPrefsPanel');
    if (!panel) return;
    const p = loadPrefs();
    panel.querySelector('#npEnabled').checked = !!p.enabled;
    panel.querySelector('#npMissing').checked = !!p.missingHours;
    panel.querySelector('#npExit').checked = !!p.exitReminder;
    panel.querySelector('#npOncall').checked = !!p.oncallSoon;
    panel.querySelector('#npOncallDays').value = p.oncallDays || 3;
    panel.querySelector('#npStatus').textContent =
      'Stato permesso: ' + (typeof Notification !== 'undefined' ? Notification.permission : 'non supportato') +
      (isStandalone() ? ' · App Home' : ' · Browser');
    panel.classList.add('open');
  }

  function closePrefs() {
    document.getElementById('notifyPrefsPanel')?.classList.remove('open');
  }

  function createPrefsUI() {
    if (document.getElementById('notifyPrefsPanel')) return;
    ensureStyles();

    const panel = document.createElement('div');
    panel.id = 'notifyPrefsPanel';
    panel.innerHTML = `
      <div id="notifyPrefsSheet" role="dialog" aria-label="Impostazioni notifiche">
        <h2>Notifiche</h2>
        <p class="sub">Scegli cosa vuoi ricevere. Su iPhone apri la dash dall’icona in Home.</p>
        <div class="np-row">
          <div><label for="npEnabled">Notifiche attive</label><p>Master switch: spegne tutto se disattivo.</p></div>
          <input type="checkbox" id="npEnabled">
        </div>
        <div class="np-row">
          <div><label for="npMissing">Ore mancanti oggi</label><p>Dopo le 17, se non hai inserito uscita/ore.</p></div>
          <input type="checkbox" id="npMissing">
        </div>
        <div class="np-row">
          <div><label for="npExit">Promemoria uscita</label><p>Verso le 15:10, se non hai ancora registrato l’uscita.</p></div>
          <input type="checkbox" id="npExit">
        </div>
        <div class="np-row">
          <div><label for="npOncall">Reperibilità in arrivo</label><p>Avviso quando manca poco alla reperibilità.</p></div>
          <input type="checkbox" id="npOncall">
        </div>
        <div class="np-row">
          <div><label for="npOncallDays">Giorni di anticipo</label><p>Quanti giorni prima avvisare (1–14).</p></div>
          <input type="number" id="npOncallDays" min="1" max="14" step="1">
        </div>
        <div class="np-actions">
          <button type="button" class="primary" id="npSave">Salva</button>
          <button type="button" class="ghost" id="npTest">Prova notifica</button>
          <button type="button" class="ghost" id="npClose">Chiudi</button>
        </div>
        <div class="np-status" id="npStatus"></div>
      </div>`;
    document.body.appendChild(panel);

    panel.addEventListener('click', (e) => { if (e.target === panel) closePrefs(); });
    panel.querySelector('#npClose').onclick = closePrefs;
    panel.querySelector('#npSave').onclick = async () => {
      const p = loadPrefs();
      p.enabled = panel.querySelector('#npEnabled').checked;
      p.missingHours = panel.querySelector('#npMissing').checked;
      p.exitReminder = panel.querySelector('#npExit').checked;
      p.oncallSoon = panel.querySelector('#npOncall').checked;
      p.oncallDays = Math.max(1, Math.min(14, Number(panel.querySelector('#npOncallDays').value) || 3));
      if (p.enabled) {
        if (!isStandalone() && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
          alert('Su iPhone: apri la dash dall’icona Home, poi salva di nuovo se serve.');
        }
        const perm = await ensurePermission();
        if (perm !== 'granted') {
          p.enabled = false;
          panel.querySelector('#npEnabled').checked = false;
          alert('Permesso notifiche non concesso.');
        }
      }
      savePrefs(p);
      syncButtons();
      panel.querySelector('#npStatus').textContent = 'Salvato.';
      if (typeof showToast === 'function') showToast('Preferenze notifiche salvate');
    };
    panel.querySelector('#npTest').onclick = async () => {
      const status = panel.querySelector('#npStatus');
      const standalone = isStandalone();
      const ua = navigator.userAgent || '';
      const isIOS = /iPhone|iPad|iPod/.test(ua);
      status.textContent = 'Invio prova…';
      if (isIOS && !standalone) {
        status.textContent = 'Su iPhone le notifiche funzionano solo aprendo la dash dall’icona Home (non da Safari). Aggiungi a Home → apri da lì → riprova.';
        return;
      }
      const res = await showLocalNotification(
        'Prova Gestione Ore',
        'Se vedi questo banner/centro notifiche, funziona.',
        { force: true, tag: 'test-' + Date.now() }
      );
      if (res && res.ok) {
        status.textContent = 'Inviata via ' + res.via + '. Se non la vedi: Centro notifiche iOS, oppure Impostazioni → Notifiche → Gestione Ore.';
      } else {
        status.textContent = 'Fallita: ' + (res && res.reason || 'sconosciuto');
      }
    };
  }

  function createNotifyButton() {
    if (document.getElementById('notifyEnableBtn')) return;
    ensureStyles();
    const btn = document.createElement('button');
    btn.id = 'notifyEnableBtn';
    btn.type = 'button';
    btn.textContent = '🔔 Notifiche';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      createPrefsUI();
      openPrefs();
    });
    document.body.appendChild(btn);
    const place = () => {
      const smart = document.getElementById('coverScreen')?.classList.contains('smart-mode');
      btn.style.bottom = smart ? 'calc(120px + env(safe-area-inset-bottom))' : 'max(12px, env(safe-area-inset-bottom))';
    };
    place();
    setInterval(place, 1500);
  }

  function injectSideCard() {
    const side = document.querySelector('.side');
    if (!side || document.getElementById('notifySideCard')) return;
    const card = document.createElement('div');
    card.id = 'notifySideCard';
    card.innerHTML = `<h4>Notifiche</h4><button type="button" id="notifySideOpen">Impostazioni notifiche</button>`;
    const foot = side.querySelector('.side-foot');
    if (foot) side.insertBefore(card, foot);
    else side.appendChild(card);
    card.querySelector('#notifySideOpen').onclick = () => {
      createPrefsUI();
      openPrefs();
    };
  }

  function syncButtons() {
    const p = loadPrefs();
    const btn = document.getElementById('notifyEnableBtn');
    if (btn) btn.textContent = p.enabled && Notification.permission === 'granted' ? '🔔 Notifiche ON' : '🔔 Notifiche';
  }

  window.GestioneOreNotify = {
    show: showLocalNotification,
    openSettings: () => { createPrefsUI(); openPrefs(); },
    prefs: loadPrefs,
    permission: () => (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'),
    isStandalone
  };

  injectHead();
  registerSW();

  const bootUI = () => {
    createNotifyButton();
    createPrefsUI();
    injectSideCard();
    syncButtons();
    setTimeout(runReminders, 5000);
    setInterval(runReminders, 10 * 60 * 1000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(bootUI, 900));
  else setTimeout(bootUI, 900);

  setInterval(injectSideCard, 2500);
})();
