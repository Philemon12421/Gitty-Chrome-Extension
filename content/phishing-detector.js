// ============================================
// Gitty Security Shield — Real-Time Phishing Detector
// Always-on heuristic & behavioral protection
// ============================================

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__gitty_shield_initialized) return;
  window.__gitty_shield_initialized = true;

  const TRUSTED_DOMAINS = [
    'github.com', 'github.io', 'github.blog', 'githubstatus.com',
    'google.com', 'accounts.google.com', 'mail.google.com',
    'microsoft.com', 'login.microsoftonline.com', 'live.com', 'outlook.com',
    'apple.com', 'icloud.com', 'amazon.com', 'aws.amazon.com',
    'paypal.com', 'binance.com', 'coinbase.com', 'metamask.io',
    'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 'discord.com',
    'gitlab.com', 'bitbucket.org', 'npm.js', 'npmjs.com', 'pypi.org',
    'linkedin.com', 'dropbox.com', 'slack.com', 'stackoverflow.com'
  ];

  const TARGETED_BRANDS = [
    { name: 'GitHub', pattern: /(?:g[i1l]th[u0]b|git-hub|github-.*|.*-github)/i, official: ['github.com', 'github.io'] },
    { name: 'Google', pattern: /(?:g[o0]{2}g[l1]e|accounts-google|google-verify)/i, official: ['google.com'] },
    { name: 'Microsoft', pattern: /(?:m[i1]cr[o0]s[o0]ft|login-microsoft|microsoft-auth)/i, official: ['microsoft.com', 'live.com', 'microsoftonline.com'] },
    { name: 'MetaMask', pattern: /(?:met[a@]m[a@]sk|wallet-metamask|metamask-auth)/i, official: ['metamask.io'] },
    { name: 'PayPal', pattern: /(?:p[a@]yp[a@]l|paypal-verify|paypal-security)/i, official: ['paypal.com'] },
    { name: 'Binance', pattern: /(?:b[i1]n[a@]nce|binance-security|binance-login)/i, official: ['binance.com'] },
    { name: 'Apple', pattern: /(?:[a@]pp[l1]e-id|apple-login|icloud-verify)/i, official: ['apple.com', 'icloud.com'] },
    { name: 'Coinbase', pattern: /(?:c[o0][i1]nb[a@]se|coinbase-auth)/i, official: ['coinbase.com'] },
    { name: 'Discord', pattern: /(?:d[i1]sc[o0]rd-nitro|discord-app|discord-gift)/i, official: ['discord.com'] }
  ];

  const SUSPICIOUS_TLDS = [
    '.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.fit',
    '.work', '.cn', '.rest', '.click', '.gdn', '.monster', '.live', '.space'
  ];

  const SENSITIVE_KEYWORDS = [
    'security', 'verify', 'account', 'wallet', 'signin', 'auth', 'login',
    'token', 'recover', 'airdrop', 'free-nitro', 'claim', 'passphrase', 'seed'
  ];

  let currentScanResult = null;
  let bannerInjected = false;

  function runPhishingHeuristics() {
    const loc = window.location;
    const hostname = loc.hostname.toLowerCase();
    const href = loc.href.toLowerCase();
    const protocol = loc.protocol;

    // Skip localhost and internal chrome pages
    if (hostname === 'localhost' || hostname === '127.0.0.1' || protocol === 'chrome-extension:' || protocol === 'chrome:') {
      return { score: 0, status: 'Safe', reasons: [] };
    }

    let score = 0;
    const reasons = [];

    // 1. Homograph / Punycode Lookalike attacks (e.g. xn--gthub-1qa.com)
    if (hostname.startsWith('xn--')) {
      score += 45;
      reasons.push('Punycode (IDN) domain detected — frequently used to visually impersonate trusted brands.');
    }

    // 2. Exact match against trusted whitelist
    const isWhitelisted = TRUSTED_DOMAINS.some(td => hostname === td || hostname.endsWith('.' + td));

    if (!isWhitelisted) {
      // 3. Deceptive Subdomain Brand abuse (e.g. github.com.attacker-server.com)
      for (const brand of TARGETED_BRANDS) {
        for (const officialDomain of brand.official) {
          if (hostname.includes(officialDomain) && !hostname.endsWith(officialDomain)) {
            score += 55;
            reasons.push(`Deceptive domain nesting: contains "${officialDomain}" inside an unauthorized hostname.`);
          }
        }
      }

      // 4. Typosquatting of major brands
      for (const brand of TARGETED_BRANDS) {
        if (brand.pattern.test(hostname)) {
          const isOfficial = brand.official.some(od => hostname === od || hostname.endsWith('.' + od));
          if (!isOfficial) {
            score += 50;
            reasons.push(`Brand impersonation / typosquatting targeting ${brand.name}.`);
          }
        }
      }

      // 5. Raw IP address hosting credential / login pages
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      const hasPasswordInput = document.querySelector('input[type="password"]') !== null;
      if (isIpAddress) {
        score += 35;
        if (hasPasswordInput) {
          score += 40;
          reasons.push('Raw numeric IP address hosting a password login form.');
        } else {
          reasons.push('Raw numeric IP address used instead of a registered domain.');
        }
      }

      // 6. Suspicious TLD paired with sensitive keywords
      const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
      const hasSensitiveKeyword = SENSITIVE_KEYWORDS.some(kw => hostname.includes(kw) || loc.pathname.includes(kw));

      if (hasSuspiciousTld && hasSensitiveKeyword) {
        score += 35;
        reasons.push('High-risk TLD combined with sensitive auth/credential keywords.');
      }

      // 7. Unencrypted password input over HTTP
      if (protocol === 'http:' && hasPasswordInput) {
        score += 45;
        reasons.push('Insecure HTTP connection requesting user password credentials.');
      }

      // 8. Cross-origin form submission of credentials
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      passwordInputs.forEach(pwd => {
        const form = pwd.closest('form');
        if (form && form.action) {
          try {
            const actionUrl = new URL(form.action, loc.href);
            if (actionUrl.hostname && actionUrl.hostname !== hostname && !actionUrl.hostname.endsWith('.' + hostname)) {
              score += 40;
              reasons.push(`Credential exfiltration risk: Password form submits to external host "${actionUrl.hostname}".`);
            }
          } catch (e) {}
        }
      });

      // 9. Data URI or Javascript pseudo-protocol
      if (protocol === 'data:' || protocol === 'javascript:') {
        score += 60;
        reasons.push('Disguised Data URI or script execution page.');
      }

      // 10. Fake MetaMask / Web3 Seed Phrase Harvesting
      const pageText = document.body ? document.body.innerText.toLowerCase() : '';
      if (pageText.includes('seed phrase') || pageText.includes('secret recovery phrase') || pageText.includes('12-word phrase') || pageText.includes('private key')) {
        if (!isWhitelisted && hasPasswordInput) {
          score += 55;
          reasons.push('Detected wallet seed phrase or private key harvesting pattern on non-verified domain.');
        }
      }
    }

    // Determine Status
    let status = 'Safe';
    if (score >= 60) status = 'Dangerous Phishing Attack';
    else if (score >= 35) status = 'Suspicious Site';

    return {
      score: Math.min(100, score),
      status,
      reasons: [...new Set(reasons)],
      domain: hostname,
      url: loc.href,
      protocol: protocol.replace(':', ''),
      timestamp: Date.now()
    };
  }

  function injectWarningBanner(result) {
    if (bannerInjected) return;
    bannerInjected = true;

    // Create shadow host to avoid page CSS collision
    const host = document.createElement('div');
    host.id = 'gitty-shield-banner-root';
    const shadow = host.attachShadow({ mode: 'closed' });

    const reasonsHtml = result.reasons.map(r => `<li>⚠️ ${r}</li>`).join('');

    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2147483647;
          display: block;
          box-shadow: 0 10px 40px rgba(0,0,0,0.85);
          animation: gitty-slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes gitty-slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .banner {
          background: linear-gradient(135deg, #180d19 0%, #2e0817 100%);
          border-bottom: 2px solid #ff3b30;
          color: #fff;
          padding: 14px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }
        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 59, 48, 0.2);
          border: 1px solid rgba(255, 59, 48, 0.4);
          font-size: 22px;
          flex-shrink: 0;
        }
        .content {
          flex: 1;
          min-width: 0;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }
        .badge {
          background: #ff3b30;
          color: #fff;
          font-size: 10.5px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .title {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
        }
        .desc {
          font-size: 12px;
          color: #e5e5ea;
          line-height: 1.45;
          margin-bottom: 6px;
        }
        .reasons {
          margin: 0;
          padding-left: 18px;
          font-size: 11.5px;
          color: #ff9f0a;
          line-height: 1.4;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .btn-safe {
          background: #34c759;
          color: #000;
          border: none;
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, background 0.15s;
        }
        .btn-safe:hover {
          background: #30d158;
          transform: translateY(-1px);
        }
        .btn-dismiss {
          background: transparent;
          color: #8e8e93;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .btn-dismiss:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
      </style>
      <div class="banner">
        <div class="icon-wrap">🚨</div>
        <div class="content">
          <div class="title-row">
            <span class="badge">Gitty Security Shield</span>
            <span class="title">Phishing Attack Attempt Blocked</span>
          </div>
          <div class="desc">
            This page on <strong>${result.domain}</strong> exhibits dangerous characteristics often used to steal login credentials or secret keys.
          </div>
          <ul class="reasons">
            ${reasonsHtml}
          </ul>
        </div>
        <div class="actions">
          <button class="btn-safe" id="btn-leave-safe">🛡️ Leave Site Safely</button>
          <button class="btn-dismiss" id="btn-dismiss-warning">Dismiss</button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(host);

    shadow.getElementById('btn-leave-safe').addEventListener('click', () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = 'https://google.com';
    });

    shadow.getElementById('btn-dismiss-warning').addEventListener('click', () => {
      host.remove();
    });
  }

  // Scan execution
  function evaluatePage() {
    chrome.storage.local.get(['gitty_phishing_shield_enabled'], res => {
      // Always on by default
      const isEnabled = res.gitty_phishing_shield_enabled !== false;
      if (!isEnabled) return;

      currentScanResult = runPhishingHeuristics();

      if (currentScanResult.score >= 50) {
        injectWarningBanner(currentScanResult);

        // Notify background service worker for desktop notification and threat logging
        try {
          chrome.runtime.sendMessage({
            type: 'PHISHING_ATTEMPT_DETECTED',
            payload: currentScanResult
          });
        } catch (e) {}
      }
    });
  }

  // Listen for popup inspection requests
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'GET_PAGE_SAFETY_REPORT') {
      if (!currentScanResult) currentScanResult = runPhishingHeuristics();
      sendResponse({ report: currentScanResult });
      return true;
    }
  });

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', evaluatePage);
  } else {
    evaluatePage();
  }

  // Re-evaluate if DOM dynamically injects forms (e.g. single-page apps)
  const observer = new MutationObserver(() => {
    if (!bannerInjected && document.querySelector('input[type="password"]')) {
      evaluatePage();
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

