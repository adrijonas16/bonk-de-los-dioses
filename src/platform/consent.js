/* Bonk de los Dioses · consentimiento de cookies y Google Analytics 4 (solo se carga si el jugador acepta) */
const CONSENT_KEY = 'bonk-consent-v1'; // 'granted' | 'denied'
const GA4_ID = (window.BONK_CFG && window.BONK_CFG.ga4) || '';
let gaLoaded = false;

function consentState() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch (err) {
    return null;
  }
}

function loadAnalytics() {
  if (gaLoaded || !GA4_ID) return;
  gaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  gtag('js', new Date());
  gtag('config', GA4_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
  document.head.appendChild(s);
}

// Borra las cookies de Analytics si el jugador retira el consentimiento
function clearAnalyticsCookies() {
  const host = location.hostname;
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (!/^_ga/.test(name)) return;
    const past = '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = name + past;
    document.cookie = name + past + '; domain=' + host;
    document.cookie = name + past + '; domain=.' + host;
  });
}

function setConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch (err) {}
  const bar = document.getElementById('cookieBar');
  if (bar) bar.hidden = true;
  if (value === 'granted') loadAnalytics();
  else {
    if (window.gtag) gtag('consent', 'update', { analytics_storage: 'denied' });
    clearAnalyticsCookies();
  }
}

// Evento de analítica; no hace nada sin consentimiento o sin ID de GA4
function track(name, params) {
  if (!gaLoaded || !window.gtag) return;
  try {
    gtag('event', name, params || {});
  } catch (err) {}
}

function showCookieBar() {
  let bar = document.getElementById('cookieBar');
  if (!bar) {
    bar = document.createElement('section');
    bar.id = 'cookieBar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', 'Preferencias de cookies');
    bar.innerHTML =
      '<p><b>Cookies</b> Usamos almacenamiento propio para guardar tu partida y tu sesión (necesario). ' +
      'Con tu permiso, también Google Analytics para saber cuánta gente juega y mejorar el juego. ' +
      '<a href="/privacidad#cookies">Más información</a></p>' +
      '<div class="cbtns"><button class="btn" id="cookieNo">Solo necesarias</button>' +
      '<button class="btn green" id="cookieYes">Aceptar analítica</button></div>';
    document.body.appendChild(bar);
    bar.querySelector('#cookieNo').onclick = () => setConsent('denied');
    bar.querySelector('#cookieYes').onclick = () => setConsent('granted');
  }
  bar.hidden = false;
}

function initConsent() {
  const st = consentState();
  if (st === 'granted') loadAnalytics();
  else if (st !== 'denied' && GA4_ID) showCookieBar(); // sin analítica configurada no hay nada que pedir
  if (/[?&]cookies=1\b/.test(location.search)) showCookieBar();
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('[data-cookie-prefs]');
    if (!a) return;
    e.preventDefault();
    showCookieBar();
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initConsent);
else initConsent();
