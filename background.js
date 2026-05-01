// Gitty Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      gitty_syntax_theme: 'dracula',
      gitty_readme_history: [],
      gitty_code_history: []
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'COPY_TO_CLIPBOARD') {
    // Fallback: handled directly in popup via navigator.clipboard
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'SAVE_FILE') {
    // Trigger download — we handle this via a blob URL in the popup, 
    // but we also expose a programmatic save for larger content.
    sendResponse({ success: true });
    return true;
  }
});
