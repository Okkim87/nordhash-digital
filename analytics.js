/* Google tag (gtag.js). Basic consent: the Google script loads only after opt-in. */
(() => {
  'use strict';
  const id = 'G-F93778VN28';
  const key = 'fgs.analytics-consent.v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  let started = false;
  let choice = null;
  window[`ga-disable-${id}`] = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', denied);

  try {
    const stored = JSON.parse(localStorage.getItem(key));
    if (stored && ['accepted', 'rejected'].includes(stored.value) && Number.isFinite(stored.expires) && stored.expires > Date.now()) choice = stored.value;
  } catch { /* Storage is optional; this visit can still make a choice. */ }

  function clearAnalyticsCookies() {
    const names = document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]).filter(name => /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name));
    const domains = [null];
    const host = location.hostname.split('.');
    for (let i = 0; i < host.length - 1; i++) {
      domains.push(host.slice(i).join('.'), `.${host.slice(i).join('.')}`);
    }
    for (const name of names) for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
    }
  }

  function enableAnalytics() {
    window[`ga-disable-${id}`] = false;
    window.gtag('consent', 'update', { ...denied, analytics_storage: 'granted' });
    if (started) return;
    started = true;
    window.gtag('js', new Date());
    window.gtag('config', id, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: lifetime / 1000,
      cookie_update: false,
      page_location: location.origin + location.pathname
    });
    const script = document.createElement('script');
    script.id = 'fgs-google-tag';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.append(script);
  }

  const panel = document.createElement('section');
  panel.className = 'consent-panel';
  panel.setAttribute('aria-label', 'Analytiikka-asetukset');
  panel.innerHTML = '<h2>Kävijätilastot, sinun luvallasi.</h2><p>Käytämme Google Analyticsia sivuston käytön mittaamiseen vain luvallasi. Voit kieltäytyä ja käyttää sivustoa normaalisti. Valinnan voit muuttaa sivun alareunan evästeasetuksista. <a href="tietosuoja.html#evasteet">Lisätietoja tietosuojasta</a>.</p><div class="consent-actions"><button type="button" data-consent="accepted">Hyväksy analytiikka</button><button type="button" data-consent="rejected">Vain välttämättömät</button></div>';
  panel.hidden = choice !== null;
  document.body.append(panel);

  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'consent-settings';
  settings.textContent = 'Evästeasetukset';
  settings.setAttribute('aria-expanded', String(!panel.hidden));
  const footer = document.querySelector('.footer-bottom > div');
  (footer || document.body).append(settings);
  settings.addEventListener('click', () => {
    panel.hidden = false;
    settings.setAttribute('aria-expanded', 'true');
    panel.querySelector('button').focus();
  });
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-consent]');
    if (!button) return;
    choice = button.dataset.consent;
    try { localStorage.setItem(key, JSON.stringify({ value: choice, expires: Date.now() + lifetime })); } catch { /* Per-visit choice. */ }
    panel.hidden = true;
    settings.setAttribute('aria-expanded', 'false');
    if (choice === 'accepted') enableAnalytics();
    else {
      window[`ga-disable-${id}`] = true;
      clearAnalyticsCookies();
      if (started) {
        window.gtag('consent', 'update', denied);
        location.reload(); // Unload Google's already-executed script after withdrawal.
      }
    }
    settings.focus({ preventScroll: true });
  });
  if (choice === 'accepted') enableAnalytics();
  else clearAnalyticsCookies();
})();
