// Gitty — Background Service Worker
// Phishing attack detector, security notification dispatcher, and state manager

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      gitty_theme_mode: 'dark',
      gitty_syntax_theme: 'tokyo-night',
      gitty_animation: 'typewriter',
      gitty_auto_copy: false,
      gitty_phishing_shield_enabled: true,
      gitty_threats_blocked: 0,
      gitty_threat_history: [],
      gitty_readme_history: [],
      gitty_security_history: [],
      gitty_install_date: Date.now()
    });
  }
  if (details.reason === 'update') {
    chrome.storage.local.get([
      'gitty_syntax_theme',
      'gitty_theme_mode',
      'gitty_phishing_shield_enabled',
      'gitty_threats_blocked',
      'gitty_threat_history',
      'gitty_code_history',
      'gitty_security_history'
    ], (res) => {
      const patch = {};
      if (!res.gitty_syntax_theme) patch.gitty_syntax_theme = 'tokyo-night';
      if (!res.gitty_theme_mode) patch.gitty_theme_mode = 'dark';
      if (res.gitty_phishing_shield_enabled === undefined) patch.gitty_phishing_shield_enabled = true;
      if (res.gitty_threats_blocked === undefined) patch.gitty_threats_blocked = 0;
      if (!res.gitty_threat_history) patch.gitty_threat_history = [];
      if (!res.gitty_security_history && res.gitty_code_history) {
        patch.gitty_security_history = res.gitty_code_history;
      }
      if (Object.keys(patch).length) chrome.storage.local.set(patch);
    });
  }
});

// Clear badge on tab change if active tab is clean
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
      chrome.action.setBadgeText({ text: '' });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 1. Phishing Attempt Detected by Content Script Heuristics
  if (message.type === 'PHISHING_ATTEMPT_DETECTED') {
    const payload = message.payload || {};
    chrome.storage.local.get(['gitty_phishing_shield_enabled', 'gitty_threats_blocked', 'gitty_threat_history'], (res) => {
      const isEnabled = res.gitty_phishing_shield_enabled !== false;
      if (!isEnabled) {
        sendResponse({ ignored: true, reason: 'shield_disabled' });
        return;
      }

      const blockedCount = (res.gitty_threats_blocked || 0) + 1;
      const history = res.gitty_threat_history || [];
      history.unshift({
        domain: payload.domain || 'unknown-host',
        url: payload.url || '',
        score: payload.score || 80,
        reasons: payload.reasons || ['Suspicious credential phishing patterns'],
        timestamp: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString()
      });
      if (history.length > 50) history.pop();

      chrome.storage.local.set({
        gitty_threats_blocked: blockedCount,
        gitty_threat_history: history
      });

      // Show Desktop Notification
      try {
        chrome.notifications.create(`gitty-phish-${Date.now()}`, {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '🚨 Gitty Phishing Attack Blocked!',
          message: `Blocked suspicious phishing attempt on ${payload.domain || 'this site'}! Avoid entering credentials or private keys.`,
          priority: 2,
          requireInteraction: true
        });
      } catch (e) {
        console.error('Notification error:', e);
      }

      // Set Extension Badge Warning
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#ff3b30' });

      sendResponse({ success: true, count: blockedCount });
    });
    return true;
  }

  // 2. Clear Extension Badge
  if (message.type === 'CLEAR_BADGE') {
    chrome.action.setBadgeText({ text: '' });
    sendResponse({ success: true });
    return true;
  }

  // 3. Stats for Popup
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get([
      'gitty_readme_history',
      'gitty_security_history',
      'gitty_code_history',
      'gitty_threats_blocked',
      'gitty_phishing_shield_enabled'
    ], (res) => {
      const secCount = (res.gitty_security_history || res.gitty_code_history || []).length;
      sendResponse({
        readmes: (res.gitty_readme_history || []).length,
        securityScans: secCount,
        threatsBlocked: res.gitty_threats_blocked || 0,
        shieldEnabled: res.gitty_phishing_shield_enabled !== false
      });
    });
    return true;
  }
});
