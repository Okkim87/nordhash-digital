/* Google Analytics ladataan vasta, kun kävijä hyväksyy analytiikkaevästeet. */
(() => {
  const consentKey = 'nordhash_analytics_consent';
  const trackingId = 'G-MMTB7ELBJY';

  const loadGoogleTag = () => {
    if (window.__nordhashAnalyticsLoaded) return;
    window.__nordhashAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', trackingId, { anonymize_ip: true });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(tag);
  };

  const saveChoice = value => {
    localStorage.setItem(consentKey, value);
    document.querySelector('.cookie-banner')?.remove();
    if (value === 'granted') loadGoogleTag();
    addSettingsButton();
  };

  const showBanner = () => {
    if (document.querySelector('.cookie-banner')) return;
    const banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('aria-label', 'Evästeasetukset');
    banner.innerHTML = `<div><b>Autat kehittämään sivustoa</b><p>Käytämme Google Analyticsia sivuston käytön mittaamiseen vain suostumuksellasi.</p><a href="tietosuoja.html#evasteet">Lue tietosuojasta</a></div><div class="cookie-actions"><button class="cookie-decline" type="button">Vain välttämättömät</button><button class="cookie-accept" type="button">Hyväksy analytiikka</button></div>`;
    document.body.appendChild(banner);
    banner.querySelector('.cookie-accept').addEventListener('click', () => saveChoice('granted'));
    banner.querySelector('.cookie-decline').addEventListener('click', () => saveChoice('denied'));
  };

  const addSettingsButton = () => {
    if (document.querySelector('.cookie-settings')) return;
    const button = document.createElement('button');
    button.className = 'cookie-settings';
    button.type = 'button';
    button.textContent = 'Evästeasetukset';
    button.addEventListener('click', () => { localStorage.removeItem(consentKey); button.remove(); showBanner(); });
    document.body.appendChild(button);
  };

  const choice = localStorage.getItem(consentKey);
  if (choice === 'granted') { loadGoogleTag(); addSettingsButton(); }
  else if (choice === 'denied') addSettingsButton();
  else showBanner();
})();
