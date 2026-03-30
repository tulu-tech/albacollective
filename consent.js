/**
 * Alba Collective — Consent Mode v2 + Cookie Banner
 * GDPR / KVKK compliant
 * Replace GA_MEASUREMENT_ID with your actual G-XXXXXXXX ID
 */

const GA_ID = 'G-FXY4K6LT51';

const CONSENT_KEY = 'ac_consent';
const CONSENT_VERSION = '1';

/* ── Initialise dataLayer immediately (before any scripts load) ── */
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }

// Set all consent signals to DENIED by default (Consent Mode v2 requirement)
gtag('consent', 'default', {
  analytics_storage:  'denied',
  ad_storage:         'denied',
  ad_user_data:       'denied',
  ad_personalization: 'denied',
  functionality_storage:  'granted', // always allow (site works without it but UX suffers)
  security_storage:       'granted', // always allow (session security)
  wait_for_update: 500               // ms to wait for consent update before firing
});

/* ── Load GA4 tag (with denied defaults, GA4 still fires ping-only) ── */
function loadGA4() {
  if (document.getElementById('ga4-script')) return;
  const s = document.createElement('script');
  s.id    = 'ga4-script';
  s.async = true;
  s.src   = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA_ID, { send_page_view: true });
}

/* ── Read stored consent ── */
function getStoredConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (obj.version !== CONSENT_VERSION) return null;
    return obj;
  } catch { return null; }
}

/* ── Write consent ── */
function storeConsent(accepted) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({
    version:  CONSENT_VERSION,
    accepted: accepted,
    date:     new Date().toISOString()
  }));
}

/* ── Apply consent signals to Google ── */
function applyConsent(accepted) {
  if (accepted) {
    gtag('consent', 'update', {
      analytics_storage:  'granted',
      ad_storage:         'granted',
      ad_user_data:       'granted',
      ad_personalization: 'granted',
    });
  } else {
    gtag('consent', 'update', {
      analytics_storage:  'denied',
      ad_storage:         'denied',
      ad_user_data:       'denied',
      ad_personalization: 'denied',
    });
  }
  loadGA4();
}

/* ── Banner HTML ── */
function createBanner() {
  const el = document.createElement('div');
  el.id = 'consent-banner';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Cookie Consent');
  el.innerHTML = `
    <div class="cb-inner">
      <div class="cb-text">
        <div class="cb-icon">✦</div>
        <div class="cb-copy">
          <strong>Privacy & Cookies</strong>
          <p>We use cookies and similar technologies to understand how this site is used and to improve your experience.
          Analytics data is collected only with your consent. You can change your preference at any time.</p>
          <a href="#" class="cb-more" id="cbMore">Learn more</a>
        </div>
      </div>
      <div class="cb-actions">
        <button class="cb-btn cb-btn--reject" id="cbReject">Reject non-essential</button>
        <button class="cb-btn cb-btn--accept" id="cbAccept">Accept all</button>
      </div>
    </div>`;
  document.body.appendChild(el);

  // Slide in after a tick
  requestAnimationFrame(() => { requestAnimationFrame(() => { el.classList.add('cb-visible'); }); });

  document.getElementById('cbAccept').addEventListener('click', () => handleConsent(true));
  document.getElementById('cbReject').addEventListener('click', () => handleConsent(false));
  document.getElementById('cbMore').addEventListener('click', (e) => {
    e.preventDefault();
    showPrivacyPanel();
  });
}

/* ── Dismiss banner ── */
function dismissBanner() {
  const el = document.getElementById('consent-banner');
  if (!el) return;
  el.classList.remove('cb-visible');
  el.classList.add('cb-hiding');
  setTimeout(() => el.remove(), 400);
}

/* ── Handle user choice ── */
function handleConsent(accepted) {
  storeConsent(accepted);
  applyConsent(accepted);
  dismissBanner();
}

/* ── Simple privacy info panel ── */
function showPrivacyPanel() {
  const existing = document.getElementById('consent-panel');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'consent-panel';
  panel.innerHTML = `
    <div class="cp-inner">
      <button class="cp-close" id="cpClose">✕</button>
      <h3>How We Use Data</h3>
      <div class="cp-section">
        <strong>Essential cookies</strong>
        <span class="cp-badge cp-badge--on">Always on</span>
        <p>Required for the site to function. No personal data collected. No consent needed.</p>
      </div>
      <div class="cp-section">
        <strong>Analytics cookies (Google Analytics 4)</strong>
        <span class="cp-badge" id="analyticsBadge">Requires consent</span>
        <p>We use Google Analytics to understand how visitors use this site — pages visited, time spent,
        and general behaviour patterns. This data is anonymised and used only to improve the site.
        No personally identifiable information is stored.</p>
      </div>
      <div class="cp-section">
        <strong>Advertising cookies</strong>
        <span class="cp-badge">Requires consent</span>
        <p>Used to measure the effectiveness of advertising campaigns. Only activated if you accept all cookies.</p>
      </div>
      <p class="cp-note">Your choice is stored in your browser. You can withdraw consent at any time by clearing site data or clicking below.</p>
      <button class="cp-withdraw" id="cpWithdraw">Withdraw consent & reset</button>
    </div>`;
  document.body.appendChild(panel);
  requestAnimationFrame(() => { requestAnimationFrame(() => { panel.classList.add('cp-visible'); }); });

  document.getElementById('cpClose').addEventListener('click', () => panel.remove());
  document.getElementById('cpWithdraw').addEventListener('click', () => {
    localStorage.removeItem(CONSENT_KEY);
    location.reload();
  });
}

/* ── Inject CSS ── */
function injectStyles() {
  const css = `
/* ─── Consent Banner ─── */
#consent-banner {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
  background: rgba(15,14,24,0.97);
  border-top: 1px solid rgba(214,58,143,0.3);
  backdrop-filter: blur(20px);
  transform: translateY(100%);
  transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
  font-family: 'Space Grotesk', system-ui, sans-serif;
}
#consent-banner.cb-visible { transform: translateY(0); }
#consent-banner.cb-hiding { transform: translateY(100%); }

.cb-inner {
  max-width: 1240px; margin: 0 auto;
  padding: 1.5rem 3rem;
  display: flex; align-items: center; justify-content: space-between;
  gap: 3rem;
}
.cb-text { display: flex; align-items: flex-start; gap: 1.25rem; flex: 1; }
.cb-icon { color: #D63A8F; font-size: 1.1rem; padding-top: 0.15rem; flex-shrink: 0; }
.cb-copy strong { font-size: 0.82rem; font-weight: 600; color: #f2f0f5; letter-spacing: 0.02em; display: block; margin-bottom: 0.35rem; }
.cb-copy p { font-size: 0.78rem; line-height: 1.6; color: #9e9aad; margin: 0; max-width: 560px; }
.cb-more { font-size: 0.72rem; color: #D63A8F; text-decoration: none; display: inline-block; margin-top: 0.4rem; }
.cb-more:hover { text-decoration: underline; }

.cb-actions { display: flex; gap: 0.75rem; flex-shrink: 0; align-items: center; }
.cb-btn {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; border: none; cursor: pointer;
  padding: 0.65rem 1.4rem; border-radius: 2px;
  transition: opacity 0.2s; white-space: nowrap;
}
.cb-btn--accept { background: #D63A8F; color: #09090f; }
.cb-btn--reject { background: transparent; color: #9e9aad; border: 1px solid rgba(255,255,255,0.12); }
.cb-btn:hover { opacity: 0.82; }

/* ─── Privacy Panel ─── */
#consent-panel {
  position: fixed; right: 1.5rem; bottom: 5rem; z-index: 10000;
  width: 380px; max-width: calc(100vw - 3rem);
  background: #0f0e18;
  border: 1px solid rgba(214,58,143,0.25);
  border-radius: 4px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  font-family: 'Space Grotesk', system-ui, sans-serif;
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.3s, transform 0.3s cubic-bezier(0.16,1,0.3,1);
}
#consent-panel.cp-visible { opacity: 1; transform: none; }

.cp-inner { padding: 2rem; }
.cp-close {
  position: absolute; top: 1rem; right: 1rem;
  background: none; border: none; color: #9e9aad;
  font-size: 0.85rem; cursor: pointer; padding: 0.25rem 0.5rem;
}
.cp-inner h3 { font-size: 0.95rem; font-weight: 600; color: #f2f0f5; margin-bottom: 1.25rem; }
.cp-section { margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.cp-section strong { font-size: 0.78rem; font-weight: 600; color: #f2f0f5; display: block; margin-bottom: 0.35rem; }
.cp-section p { font-size: 0.74rem; line-height: 1.65; color: #9e9aad; margin-top: 0.5rem; }
.cp-badge { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 8px; border-radius: 2px; background: rgba(255,255,255,0.06); color: #9e9aad; }
.cp-badge--on { background: rgba(214,58,143,0.15); color: #D63A8F; }
.cp-note { font-size: 0.72rem; color: rgba(158,154,173,0.6); line-height: 1.6; margin-top: 1rem; }
.cp-withdraw { margin-top: 1rem; font-family: 'Space Grotesk', system-ui, sans-serif; font-size: 0.68rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; background: none; border: 1px solid rgba(255,255,255,0.1); color: #9e9aad; padding: 0.5rem 1rem; cursor: pointer; border-radius: 2px; transition: color 0.2s, border-color 0.2s; }
.cp-withdraw:hover { color: #f2f0f5; border-color: rgba(255,255,255,0.25); }

@media (max-width: 768px) {
  .cb-inner { flex-direction: column; gap: 1.25rem; padding: 1.5rem; }
  .cb-actions { width: 100%; }
  .cb-btn { flex: 1; text-align: center; }
}
`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  injectStyles();

  const stored = getStoredConsent();
  if (stored !== null) {
    // Already decided — apply stored consent silently
    applyConsent(stored.accepted);
  } else {
    // No decision yet — show banner
    loadGA4(); // Load GA4 with default denied mode (ping-only)
    createBanner();
  }
});
