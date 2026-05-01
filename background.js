// Gitty v2 — Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      gitty_syntax_theme: 'tokyo-night',
      gitty_animation: 'typewriter',
      gitty_auto_copy: false,
      gitty_readme_history: [],
      gitty_code_history: [],
      gitty_install_date: Date.now()
    });
  }
  if (details.reason === 'update') {
    // Migrate old settings if needed
    chrome.storage.local.get(['gitty_syntax_theme'], (res) => {
      if (!res.gitty_syntax_theme) {
        chrome.storage.local.set({ gitty_syntax_theme: 'tokyo-night' });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'COPY_TO_CLIPBOARD') {
    sendResponse({ success: true });
    return true;
  }
  if (message.type === 'SAVE_FILE') {
    sendResponse({ success: true });
    return true;
  }
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get(['gitty_readme_history', 'gitty_code_history'], (res) => {
      sendResponse({
        readmes: (res.gitty_readme_history || []).length,
        explanations: (res.gitty_code_history || []).length
      });
    });
    return true;
  }
});
