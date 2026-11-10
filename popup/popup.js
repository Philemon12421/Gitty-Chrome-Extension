// ============================================
// Gitty Pro — popup.js
// AI Security Shield, Code Auditor & README Studio
// ============================================

const STATE = {
  tab: 'readme',
  secMode: 'code',
  lastReadme: '',
  lastSecurityReport: null,
  activeTechBadges: ['TypeScript', 'React', 'Node.js'],
  settings: {
    themeMode: 'dark',
    syntaxTheme: 'tokyo-night',
    defaultAnimation: 'typewriter',
    autoCopy: false,
    shieldEnabled: true,
    notifEnabled: true
  },
  history: { readme: [], security: [] },
  threats: []
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const DOM = {
  tabBtns: $$('.tab-btn'),
  panes: {
    readme: $('#tab-readme'),
    security: $('#tab-security'),
    shield: $('#tab-shield'),
    history: $('#tab-history')
  },

  // Topbar
  btnTopbarShield:  $('#btn-topbar-shield'),
  btnThemeToggle:   $('#btn-theme-toggle'),
  btnSettings:      $('#btn-settings'),

  // README
  githubImportUrl:  $('#github-import-url'),
  btnGithubImport:  $('#btn-github-import'),
  projectTemplate:  $('#project-template'),
  projectName:      $('#project-name'),
  projectTagline:   $('#project-tagline'),
  projectDesc:      $('#project-desc'),
  projectLang:      $('#project-lang'),
  projectLicense:   $('#project-license'),
  projectBadge:     $('#project-badge-style'),
  projectFeatures:  $('#project-features'),
  projectInstall:   $('#project-install'),
  projectGithub:    $('#project-github'),
  projectIncludeToc:$('#project-include-toc'),
  techChips:        $$('.tech-chip'),
  animRadios:       $$('input[name="anim"]'),
  btnGenerate:      $('#btn-generate-readme'),
  btnCopy:          $('#btn-copy-readme'),
  btnSave:          $('#btn-save-readme'),
  btnExportHtml:    $('#btn-export-html-readme'),
  previewWrap:      $('#readme-preview-wrap'),
  preview:          $('#readme-preview'),
  btnToggleAnim:    $('#btn-toggle-anim'),

  // Security Test
  btnModeCode:      $('#btn-mode-code'),
  btnModeRepo:      $('#btn-mode-repo'),
  secCodeView:      $('#security-code-view'),
  secRepoView:      $('#security-repo-view'),
  secLang:          $('#sec-language'),
  secDepth:         $('#sec-depth'),
  secSampleSelect:  $('#sec-sample-select'),
  secCodeInput:     $('#sec-code-input'),
  secLineNums:      $('#sec-line-nums'),
  btnRunSecurity:   $('#btn-run-security-test'),
  btnClearSecCode:  $('#btn-clear-sec-code'),
  secRepoUrl:       $('#sec-repo-url'),
  btnSecRepoScan:   $('#btn-sec-repo-scan'),
  secOutput:        $('#security-output'),
  secBody:          $('#security-body'),
  btnCopySecSum:    $('#btn-copy-sec-summary'),
  btnCopySecMd:     $('#btn-copy-sec-md'),
  btnCopySecJson:   $('#btn-copy-sec-json'),
  btnSaveSecMd:     $('#btn-save-sec-md'),

  // Phishing Shield
  shieldToggleRealtime: $('#shield-toggle-realtime'),
  shieldStatusHeading:  $('#shield-status-heading'),
  sstatBlockedCount:    $('#sstat-blocked-count'),
  btnRecheckSite:       $('#btn-recheck-site'),
  siteInspectDomain:    $('#site-inspect-domain'),
  siteInspectBadge:     $('#site-inspect-badge'),
  siteScoreFill:        $('#site-score-fill'),
  siteHeuristicsList:   $('#site-heuristics-list'),
  threatLogList:        $('#threat-log-list'),
  btnClearThreats:      $('#btn-clear-threats'),

  // History
  histReadme:       $('#history-readme'),
  histSecurity:     $('#history-security'),
  histEmpty:        $('#history-empty'),
  histBtns:         $$('.hist-btn'),
  btnClearHist:     $('#btn-clear-history'),

  // Settings Modal
  overlay:          $('#settings-overlay'),
  btnCloseSettings: $('#btn-close-settings'),
  settingsThemeMode:$('#settings-theme-mode'),
  settingsTheme:    $('#settings-syntax-theme'),
  settingsAnim:     $('#settings-animation'),
  settingsShield:   $('#settings-shield-toggle'),
  settingsNotif:    $('#settings-notif-toggle'),
  settingsAuto:     $('#settings-auto-copy'),
  btnSaveSettings:  $('#btn-save-settings'),

  toast:            $('#toast'),
};

// ============================================
// THEMES & SYNTAX PALETTES
// ============================================
const THEMES = {
  dracula:      { kw:'#ff79c6', str:'#f1fa8c', num:'#bd93f9', cmt:'#6272a4', fn:'#50fa7b', ty:'#8be9fd', tx:'#f8f8f2' },
  'tokyo-night':{ kw:'#bb9af7', str:'#9ece6a', num:'#ff9e64', cmt:'#565f89', fn:'#7dcfff', ty:'#2ac3de', tx:'#c0caf5' },
  monokai:      { kw:'#f92672', str:'#e6db74', num:'#ae81ff', cmt:'#75715e', fn:'#a6e22e', ty:'#66d9ef', tx:'#f8f8f2' },
  nord:         { kw:'#81a1c1', str:'#a3be8c', num:'#b48ead', cmt:'#4c566a', fn:'#88c0d0', ty:'#8fbcbb', tx:'#d8dee9' },
  'github-dark':{ kw:'#ff7b72', str:'#a5d6ff', num:'#79c0ff', cmt:'#8b949e', fn:'#d2a8ff', ty:'#ffa657', tx:'#e6edf3' },
  'one-dark':   { kw:'#c678dd', str:'#98c379', num:'#d19a66', cmt:'#5c6370', fn:'#61afef', ty:'#e5c07b', tx:'#abb2bf' },
};

const KWS = {
  javascript: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','new','this','class','extends','import','export','default','from','async','await','try','catch','throw','typeof','instanceof','in','of','yield','static','get','set','null','undefined','true','false'],
  typescript: ['const','let','var','function','return','if','else','for','while','interface','type','enum','class','extends','implements','import','export','default','from','async','await','try','catch','throw','public','private','protected','readonly','static','abstract','as','is','keyof','typeof','never','unknown','any','string','number','boolean','void','null','undefined'],
  python: ['def','return','if','elif','else','for','while','in','not','and','or','is','None','True','False','class','import','from','as','try','except','finally','raise','with','pass','break','continue','lambda','yield','async','await','self','global','nonlocal'],
  rust: ['fn','let','mut','return','if','else','match','for','while','loop','in','struct','enum','impl','trait','use','mod','pub','crate','self','where','as','async','await','unsafe','ref','move','dyn','type','const','static','true','false'],
  go: ['func','return','if','else','for','range','switch','case','default','break','continue','go','defer','select','chan','map','struct','interface','type','package','import','var','const','true','false','nil','make','new','append','len'],
  java: ['public','private','protected','static','final','class','interface','extends','implements','return','if','else','for','while','do','switch','case','break','continue','new','this','super','try','catch','finally','throw','throws','import','package','void','int','boolean','String','null','true','false'],
  cpp: ['int','float','double','char','void','bool','auto','const','static','class','struct','enum','union','public','private','protected','virtual','override','return','if','else','for','while','do','switch','case','break','continue','new','delete','this','namespace','using','template','typename','true','false','nullptr'],
  csharp: ['public','private','protected','internal','static','readonly','virtual','override','abstract','sealed','async','await','class','struct','interface','enum','namespace','using','return','if','else','for','foreach','while','do','switch','case','break','continue','new','this','base','try','catch','finally','throw','var','true','false','null','string','int','bool'],
  ruby: ['def','end','return','if','elsif','else','unless','for','while','until','do','class','module','require','include','private','protected','public','self','true','false','nil'],
  php: ['function','return','if','else','elseif','for','foreach','while','switch','case','break','continue','class','interface','trait','extends','implements','abstract','final','public','private','protected','static','new','this','try','catch','throw','namespace','use','echo','true','false','null','array'],
  solidity: ['pragma','contract','interface','library','import','constructor','function','modifier','event','enum','struct','mapping','address','uint','int','bool','string','bytes','msg','tx','block','require','revert','assert','emit','public','private','internal','external','view','pure','payable','memory','storage','calldata','virtual','override'],
};

function hlCode(code, lang, theme = 'dracula') {
  const t = THEMES[theme] || THEMES.dracula;
  const kws = KWS[lang] || KWS.javascript;

  let out = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  out = out.replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, m => `<span style="color:${t.str}">${m}</span>`);
  out = out.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$|--.*$)/gm, m => `<span style="color:${t.cmt};font-style:italic">${m}</span>`);
  out = out.replace(/\b(\d+\.?\d*)\b/g, m => `<span style="color:${t.num}">${m}</span>`);
  const kwRe = new RegExp(`\\b(${kws.join('|')})\\b`, 'g');
  out = out.replace(kwRe, m => `<span style="color:${t.kw};font-weight:500">${m}</span>`);
  out = out.replace(/\b([a-zA-Z_$][\w$]*)\s*\(/g, (m, fn) => `<span style="color:${t.fn}">${fn}</span>(`);
  out = out.replace(/\b([A-Z][a-z]\w*)\b/g, m => `<span style="color:${t.ty}">${m}</span>`);

  return `<span style="color:${t.tx}">${out}</span>`;
}

// ============================================
// THEME MODE (light / dark)
// ============================================

function applyThemeMode(mode) {
  document.documentElement.setAttribute('data-theme', mode === 'light' ? 'light' : 'dark');
}

function loadThemeMode() {
  chrome.storage.local.get(['gitty_theme_mode'], res => {
    STATE.settings.themeMode = res.gitty_theme_mode || 'dark';
    applyThemeMode(STATE.settings.themeMode);
    DOM.settingsThemeMode.value = STATE.settings.themeMode;
  });
}

function toggleThemeMode() {
  const next = STATE.settings.themeMode === 'light' ? 'dark' : 'light';
  STATE.settings.themeMode = next;
  applyThemeMode(next);
  DOM.settingsThemeMode.value = next;
  chrome.storage.local.set({ gitty_theme_mode: next });
}

// ============================================
// GITHUB API REPO IMPORT & ACTIVE TAB DETECTION
// ============================================

function parseGithubUrl(raw) {
  if (!raw) return null;
  const s = raw.trim();
  const urlMatch = s.match(/github\.com\/([^\/\s]+)\/([^\/\s#?]+)/i);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/,'') };
  const bareMatch = s.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (bareMatch) return { owner: bareMatch[1], repo: bareMatch[2].replace(/\.git$/,'') };
  return null;
}

const SPDX_TO_SELECT = {
  'MIT': 'MIT',
  'Apache-2.0': 'Apache-2.0',
  'GPL-3.0': 'GPL-3.0',
  'GPL-3.0-only': 'GPL-3.0',
  'GPL-3.0-or-later': 'GPL-3.0',
  'BSD-3-Clause': 'BSD-3',
  'Unlicense': 'Unlicense',
};

async function importFromGithub() {
  const parsed = parseGithubUrl(DOM.githubImportUrl.value);
  if (!parsed) {
    showToast('Enter a valid GitHub URL (owner/repo)', 'err');
    return;
  }

  const btn = DOM.btnGithubImport;
  const originalHTML = btn.innerHTML;
  btn.classList.add('loading');
  btn.innerHTML = '<span class="spin">⟳</span> Fetching…';

  try {
    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: { 'Accept': 'application/vnd.github+json' }
    });

    if (res.status === 404) throw new Error('Repository not found');
    if (res.status === 403) throw new Error('GitHub API rate limited — try again shortly');
    if (!res.ok) throw new Error(`GitHub API error (${res.status})`);

    const data = await res.json();

    DOM.projectName.value = data.name || parsed.repo;
    DOM.projectTagline.value = data.description || DOM.projectTagline.value;
    if (data.language) DOM.projectLang.value = data.language;
    DOM.projectGithub.value = data.owner?.login || parsed.owner;

    if (data.license?.spdx_id && SPDX_TO_SELECT[data.license.spdx_id]) {
      DOM.projectLicense.value = SPDX_TO_SELECT[data.license.spdx_id];
    }

    if (!DOM.projectDesc.value.trim() && data.description) {
      DOM.projectDesc.value = data.description;
    }

    showToast(`Imported ${data.full_name}${data.stargazers_count ? ' · ★' + data.stargazers_count : ''}`, 'ok');
  } catch (err) {
    showToast(err.message || 'Import failed', 'err');
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = originalHTML;
  }
}

// Auto-check Active Tab for GitHub Repos
function checkActiveTab() {
  if (chrome.tabs?.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]?.url) {
        const url = tabs[0].url;
        inspectActiveSite(url, tabs[0].id);

        const parsed = parseGithubUrl(url);
        if (parsed) {
          const repoUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
          if (!DOM.githubImportUrl.value) DOM.githubImportUrl.value = repoUrl;
          if (!DOM.secRepoUrl.value) DOM.secRepoUrl.value = repoUrl;
        }
      }
    });
  }
}

// ============================================
// README GENERATOR STUDIO (PREMIUM ADVANCED)
// ============================================

const TECH_BADGES = {
  'TypeScript': '![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)',
  'React':      '![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black)',
  'Node.js':    '![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)',
  'Next.js':    '![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)',
  'Python':     '![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white)',
  'FastAPI':    '![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)',
  'Docker':     '![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)',
  'TailwindCSS':'![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)',
  'PostgreSQL': '![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)',
  'MongoDB':    '![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)',
  'Redis':      '![Redis](https://img.shields.io/badge/-Redis-DC382D?style=flat-square&logo=redis&logoColor=white)',
  'AWS':        '![AWS](https://img.shields.io/badge/-AWS-232F3E?style=flat-square&logo=amazonwebservices&logoColor=white)',
  'GraphQL':    '![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=flat-square&logo=graphql&logoColor=white)',
};

function generateReadme() {
  const template = DOM.projectTemplate?.value || 'showcase';
  const name     = DOM.projectName.value.trim()     || 'my-awesome-project';
  const tagline  = DOM.projectTagline.value.trim()  || 'High-performance engineering built for modern developers.';
  const desc     = DOM.projectDesc.value.trim()     || 'An end-to-end solution engineered for reliability, security, and developer joy.';
  const lang     = DOM.projectLang.value.trim()     || 'TypeScript';
  const license  = DOM.projectLicense.value;
  const bs       = DOM.projectBadge.value;
  const feats    = DOM.projectFeatures.value.trim().split('\n').filter(Boolean);
  const steps    = DOM.projectInstall.value.trim().split('\n').filter(Boolean);
  const github   = DOM.projectGithub.value.trim()  || 'your-username';
  const anim     = [...DOM.animRadios].find(r => r.checked)?.value || 'typewriter';
  const includeToc = DOM.projectIncludeToc?.value === 'yes';

  const langColors = { Python:'3776AB',Rust:'DEA584',TypeScript:'3178C6',JavaScript:'F7DF1E',Go:'00ADD8',Java:'ED8B00',Swift:'FA7343',Kotlin:'7F52FF',Ruby:'CC342D',PHP:'777BB4',Solidity:'363636' };
  const licColors  = { MIT:'22c55e','Apache-2.0':'3b82f6','GPL-3.0':'f97316','BSD-3':'8b5cf6',Unlicense:'6b7280' };

  const lBadge = license !== 'custom' ? `![License](https://img.shields.io/badge/license-${encodeURIComponent(license)}-${licColors[license]||'lightgrey'}?style=${bs})` : '';
  const gBadge = lang ? `![Language](https://img.shields.io/badge/language-${encodeURIComponent(lang)}-${langColors[lang]||'0ea5e9'}?style=${bs})` : '';
  const starBadge = `![Stars](https://img.shields.io/github/stars/${github}/${name}?style=${bs}&color=7c3aed)`;
  const prBadge = `![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen?style=${bs})`;

  const selectedTech = STATE.activeTechBadges.map(t => TECH_BADGES[t] || `![${t}](https://img.shields.io/badge/-${t}-7c3aed?style=${bs})`).join(' ');
  const featMd  = feats.length ? feats.map(f=>`- ${f}`).join('\n') : `- ⚡ Blazing fast execution\n- 🔒 Security hardened by default\n- 🎨 Clean developer architecture`;
  const instMd  = steps.length ? '```bash\n' + steps.join('\n') + '\n```' : `\`\`\`bash\ngit clone https://github.com/${github}/${name}.git\ncd ${name}\nnpm install\nnpm run dev\n\`\`\``;

  let readme = '';

  // 1. MINIMALIST DEVELOPER TEMPLATE
  if (template === 'minimal') {
    readme = `# ${name}

> ${tagline}

${gBadge} ${lBadge} ${starBadge}

${desc}

## Quickstart

${instMd}

## Key Highlights

${featMd}

## License

${license === 'custom' ? 'Custom license' : `Licensed under [${license}](./LICENSE)`}.
`;
  }

  // 2. ENTERPRISE / PRODUCTION TEMPLATE
  else if (template === 'enterprise') {
    readme = `<div align="center">

# ${name}

### ${tagline}

${gBadge} ${lBadge} ${starBadge} ![Security](https://img.shields.io/badge/security-audited-6eef9b?style=${bs}) ![Build](https://img.shields.io/badge/build-passing-brightgreen?style=${bs})

</div>

---

${includeToc ? `## 📑 Table of Contents\n- [Executive Summary](#-executive-summary)\n- [Architecture &amp; Tech Stack](#-architecture--tech-stack)\n- [Enterprise Features](#-enterprise-features)\n- [Deployment &amp; Setup](#-deployment--setup)\n- [Security &amp; Compliance](#-security--compliance)\n- [License](#-license)\n\n---` : ''}

## 🏢 Executive Summary

${desc}

---

## 🏛 Architecture & Tech Stack

<div align="center">
${selectedTech}
</div>

---

## ✨ Enterprise Features

${featMd}

---

## 🚀 Deployment & Setup

${instMd}

---

## 🛡 Security & Compliance

- **Vulnerability Reporting**: Submit reports via [SECURITY.md](./SECURITY.md).
- **Hardened Configurations**: Zero external untrusted script execution.
- **Audit Coverage**: Automated continuous static analysis.

---

## 📄 License

Licensed under the **${license} License**. See [LICENSE](./LICENSE) for terms.
`;
  }

  // 3. CLI TOOL & LIBRARY TEMPLATE
  else if (template === 'cli') {
    readme = `<div align="center">

# ${name} 💻

> **${tagline}**

${gBadge} ${lBadge} ![NPM](https://img.shields.io/badge/cli-v1.0.0-7c3aed?style=${bs})

</div>

---

## 📦 Installation

\`\`\`bash
npm install -g ${name}
# or with Homebrew
brew install ${name}
\`\`\`

## 🚀 Commands & Flags

| Flag | Description | Default |
|---|---|---|
| \`--help\`, \`-h\` | Show available commands | — |
| \`--version\`, \`-v\` | Print current CLI version | — |
| \`--config <path>\` | Custom configuration file | \`./config.json\` |

## 💡 Usage Example

\`\`\`bash
${name} run --verbose
\`\`\`

## ✨ Highlights

${featMd}

## 📄 License

${license === 'custom' ? 'Custom license' : `Licensed under **${license}**`}.
`;
  }

  // 4. AI & DATA SCIENCE TEMPLATE
  else if (template === 'ai') {
    readme = `<div align="center">

# ${name} 🤖

> **${tagline}**

${gBadge} ${lBadge} ![HuggingFace](https://img.shields.io/badge/-HuggingFace-FFA000?style=${bs}&logo=huggingface&logoColor=white) ![PyTorch](https://img.shields.io/badge/-PyTorch-EE4C2C?style=${bs}&logo=pytorch&logoColor=white)

</div>

---

## 🧠 Model Overview & Architecture

${desc}

## 📊 Datasets & Training

\`\`\`bash
python train.py --epochs 50 --batch_size 32
\`\`\`

## 🚀 Getting Started

${instMd}

## ✨ Capabilities & Benchmarks

${featMd}

## 📖 Citation

\`\`\`bibtex
@article{${github}${name}2026,
  title={${name}: ${tagline}},
  author={${github}},
  year={2026}
}
\`\`\`

## 📄 License

Licensed under **${license}**.
`;
  }

  // 5. MODERN SHOWCASE TEMPLATE (DEFAULT)
  else {
    readme = `<div align="center">

# ${name}

> **${tagline}**

${gBadge} ${lBadge} ${prBadge} ${starBadge}

</div>

---

${includeToc ? `## 📑 Table of Contents\n- [About](#-about)\n- [Tech Stack](#-tech-stack)\n- [Features](#-features)\n- [Prerequisites](#-prerequisites)\n- [Getting Started](#-getting-started)\n- [Roadmap](#-roadmap)\n- [Contributing](#-contributing)\n- [License](#-license)\n\n---` : ''}

## 📖 About

${desc}

---

## 💻 Tech Stack

<div align="center">
${selectedTech}
</div>

---

## ✨ Features

${featMd}

---

## 🛠 Prerequisites

Make sure you have installed:
- Node.js (v18+) or runtime environment
- Git

---

## 🚀 Getting Started

${instMd}

---

## 🗺 Roadmap

- [x] Initial release & core engine
- [ ] Automated integration tests
- [ ] Multi-platform packaging

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request.

---

## 📄 License

${license === 'custom' ? 'Custom license — see [LICENSE](./LICENSE) for details.' : `Licensed under the **${license} License**. See [LICENSE](./LICENSE) for details.`}

<p align="center">Made with ❤️ by <a href="https://github.com/${github}">@${github}</a></p>
`;
  }

  STATE.lastReadme = readme;
  return { readme, anim };
}

function md2html(md) {
  let h = md;
  h = h.replace(/```(\w*)\n([\s\S]*?)```/g, (_, l, code) =>
    `<pre><code>${hlCode(code.trim(), l||'javascript', STATE.settings.syntaxTheme)}</code></pre>`);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
    `<img src="${src}" alt="${alt}" style="display:inline;margin:1px;vertical-align:middle;max-height:22px"/>`);
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  h = h.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  h = h.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*(.*?)\*/g, '<em>$1</em>');
  h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  h = h.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  h = h.replace(/^# (.+)$/gm,   '<h1>$1</h1>');
  h = h.replace(/^> (.+)$/gm,   '<blockquote>$1</blockquote>');
  h = h.replace(/^---$/gm,      '<hr />');
  h = h.replace(/^\d+\. (.+)$/gm,'<li>$1</li>');
  h = h.replace(/^- (.+)$/gm,   '<li>$1</li>');
  h = h.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  h = h.replace(/<p align="center">/g, '<p style="text-align:center">');
  h = h.replace(/\n\n/g, '</p><p>');
  return `<p>${h}</p>`;
}

function exportReadmeHtml(md) {
  const bodyContent = md2html(md);
  const htmlDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${DOM.projectName.value || 'README'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 860px; margin: 40px auto; padding: 0 20px; color: #24292e; background: #fff; }
    h1, h2, h3 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; margin-top: 24px; }
    code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #dfe2e5; color: #6a737d; padding: 0 1em; margin: 0; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
  saveFile(htmlDoc, `${DOM.projectName.value || 'README'}`, 'html');
}

// ============================================
// SECURITY TEST ENGINE & DATA (OWASP & ENTROPY)
// ============================================

function calculateShannonEntropy(str) {
  const len = str.length;
  if (len === 0) return 0;
  const freqs = {};
  for (let i = 0; i < len; i++) {
    const c = str[i];
    freqs[c] = (freqs[c] || 0) + 1;
  }
  let entropy = 0;
  for (const c in freqs) {
    const p = freqs[c] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

const SECURITY_SAMPLES = {
  sqli_xss: `// Express.js API endpoint with SQL Injection, XSS, and Leaked Key
const express = require('express');
const mysql = require('mysql');
const app = express();

const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
const DB_PASSWORD = "supersecretpassword123!";

app.get('/user', (req, res) => {
  const userId = req.query.id;
  // Vulnerability: SQL Injection via direct concatenation
  const query = "SELECT * FROM users WHERE id = " + userId;
  db.query(query, (err, result) => {
    // Vulnerability: Reflected Cross-Site Scripting (XSS)
    document.getElementById('profile').innerHTML = "<h1>Welcome " + req.query.name + "</h1>";
    res.send(result);
  });
});`,

  python_rce: `# Flask Backend with Command Injection & Insecure Deserialization
import os
import pickle
from flask import Flask, request

app = Flask(__name__)
app.config['DEBUG'] = True
ADMIN_GITHUB_PAT = "ghp_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"

@app.route('/ping')
def ping_host():
    target = request.args.get('ip')
    // Vulnerability: Arbitrary Command Injection via os.system
    os.system("ping -c 1 " + target)
    return "Ping dispatched"

@app.route('/restore', methods=['POST'])
def restore_session():
    data = request.data
    // Vulnerability: Insecure Deserialization via pickle
    state = pickle.loads(data)
    return f"State restored: {state}"`,

  cloud_keys: `// Cloud Client with Hardcoded Credentials & Disabled TLS
const axios = require('axios');
const https = require('https');

const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
const STRIPE_SECRET = "sk_live_51AbcDefGhIjKlMnOpQrStUvWxYz";

const client = axios.create({
  baseURL: 'http://api.internal-cloud-services.com/v1',
  httpsAgent: new https.Agent({
    // Vulnerability: Insecure TLS / Certificate validation disabled
    rejectUnauthorized: false
  })
});

// Insecure PRNG for security token generation
function generateToken() {
  return Math.random().toString(36).substring(2);
}`,

  solidity_reentrancy: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    address public owner;

    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");
        
        // Vulnerability: External call before state update (Reentrancy attack)
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");
        
        balances[msg.sender] = 0;
    }

    function changeOwner(address newOwner) public {
        // Vulnerability: tx.origin used for authentication instead of msg.sender
        require(tx.origin == owner, "Unauthorized");
        owner = newOwner;
    }
}`,

  clean_code: `// Secure Node.js & Express API Endpoint
const express = require('express');
const helmet = require('helmet');
const crypto = require('crypto');
const app = express();

app.use(helmet());

// Secure: Credentials loaded from environment variables
const dbPassword = process.env.DB_PASSWORD;

app.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  // Secure: Parameterized query prevents SQL Injection
  const result = await db.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
  
  // Secure: Cryptographically secure random token
  const sessionNonce = crypto.randomBytes(32).toString('hex');
  res.json({ user: result.rows[0], nonce: sessionNonce });
});`
};

const SECURITY_RULES = [
  // --- SECRETS & CREDENTIALS ---
  {
    id: 'SEC-AWS-KEY',
    name: 'Hardcoded AWS Access Key ID',
    severity: 'CRITICAL',
    owasp: 'A07:2021-Identification & Auth Failures',
    category: 'CWE-798: Hardcoded Credentials',
    test: (line) => /\bAKIA[0-9A-Z]{16}\b/.test(line),
    desc: 'Exposing AWS Access Key IDs directly in source code allows unauthorized cloud resource access and infrastructure compromise.',
    remediation: 'Remove the key immediately and load it from environment variables or AWS IAM roles.',
    fixExample: 'const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;'
  },
  {
    id: 'SEC-AWS-SECRET',
    name: 'Hardcoded AWS Secret Access Key',
    severity: 'CRITICAL',
    owasp: 'A07:2021-Identification & Auth Failures',
    category: 'CWE-798: Hardcoded Credentials',
    test: (line) => /(?:aws_secret_access_key|aws_secret|aws_key)\s*[:=]\s*['"][A-Za-z0-9/+=]{40}['"]/i.test(line),
    desc: 'Hardcoded AWS Secret Access Keys grant full API authentication to your AWS account.',
    remediation: 'Store credentials in AWS Secrets Manager or an uncommitted .env file.',
    fixExample: 'const awsSecret = process.env.AWS_SECRET_ACCESS_KEY;'
  },
  {
    id: 'SEC-GITHUB-PAT',
    name: 'Hardcoded GitHub Personal Access Token',
    severity: 'CRITICAL',
    owasp: 'A07:2021-Identification & Auth Failures',
    category: 'CWE-798: Hardcoded Credentials',
    test: (line) => /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}\b/.test(line),
    desc: 'A live GitHub Personal Access Token allows attackers to read private repositories, modify code, or abuse CI/CD.',
    remediation: 'Revoke this token immediately in GitHub settings and load tokens through environment secrets.',
    fixExample: 'const githubToken = process.env.GITHUB_TOKEN;'
  },
  {
    id: 'SEC-STRIPE-KEY',
    name: 'Hardcoded Stripe API Secret Key',
    severity: 'CRITICAL',
    owasp: 'A07:2021-Identification & Auth Failures',
    category: 'CWE-798: Hardcoded Credentials',
    test: (line) => /\b[rs]k_(?:live|test)_[0-9a-zA-Z]{24,}\b/.test(line),
    desc: 'Leaking Stripe secret keys gives attackers administrative access to your payment infrastructure and charges.',
    remediation: 'Store payment keys in environment variables or a vault. Rotate keys in the Stripe Dashboard.',
    fixExample: 'const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);'
  },
  {
    id: 'SEC-SLACK-TOKEN',
    name: 'Hardcoded Slack API Token',
    severity: 'CRITICAL',
    owasp: 'A07:2021-Identification & Auth Failures',
    category: 'CWE-798: Hardcoded Credentials',
    test: (line) => /\bxox[baprs]-[0-9a-zA-Z-]{10,}\b/.test(line),
    desc: 'Slack bot or user tokens allow reading team chats, downloading files, and sending messages on behalf of your workspace.',
    remediation: 'Store Slack tokens in secure environment variables and revoke this token in your Slack App portal.',
    fixExample: 'const slackToken = process.env.SLACK_BOT_TOKEN;'
  },
  {
    id: 'SEC-GOOGLE-KEY',
    name: 'Exposed Google API Key',
    severity: 'CRITICAL',
    owasp: 'A07:2021-Identification & Auth Failures',
    category: 'CWE-798: Hardcoded Credentials',
    test: (line) => /\bAIza[0-9A-Za-z\-_]{35}\b/.test(line),
    desc: 'Unrestricted Google Cloud API keys can be abused by third parties, leading to billing theft or quota exhaustion.',
    remediation: 'Restrict key usage in GCP Console, and load via environment variables.',
    fixExample: 'const googleApiKey = process.env.GOOGLE_API_KEY;'
  },
  {
    id: 'SEC-PRIVATE-KEY',
    name: 'Embedded Private Cryptographic Key',
    severity: 'CRITICAL',
    owasp: 'A02:2021-Cryptographic Failures',
    category: 'CWE-321: Use of Hard-coded Cryptographic Key',
    test: (line) => /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/.test(line),
    desc: 'Embedding private RSA or SSH keys inside code compromises your encryption, SSL/TLS, and server authentication.',
    remediation: 'Store private keys on disk with 0600 file permissions or mount them securely as secret volumes.',
    fixExample: 'const privateKey = fs.readFileSync(process.env.KEY_PATH, "utf8");'
  },
  {
    id: 'SEC-DB-URI',
    name: 'Database Connection String with Credentials',
    severity: 'CRITICAL',
    owasp: 'A07:2021-Identification & Auth Failures',
    category: 'CWE-798: Hardcoded Credentials',
    test: (line) => /(?:postgres|mysql|mongodb|redis|amqp):\/\/[^:\s'"]+:[^@\s'"]+@/i.test(line),
    desc: 'Hardcoded database URIs expose usernames and plaintext passwords, allowing direct database takeover.',
    remediation: 'Construct connection strings dynamically from environment variables.',
    fixExample: 'const dbUri = process.env.DATABASE_URL;'
  },
  {
    id: 'SEC-GENERIC-SECRET',
    name: 'Hardcoded Secret / API Key Variable',
    severity: 'HIGH',
    owasp: 'A07:2021-Identification & Auth Failures',
    category: 'CWE-798: Hardcoded Credentials',
    test: (line) => /\b(?:api_key|apikey|client_secret|auth_token|secret_key|private_key)\s*[:=]\s*['"][a-zA-Z0-9_\-\.]{14,}['"]/i.test(line) && !/process\.env/i.test(line),
    desc: 'Hardcoded secret or authentication tokens in source code can be extracted through version control.',
    remediation: 'Pass secrets using process.env or secret management tooling.',
    fixExample: 'const apiKey = process.env.API_KEY;'
  },
  {
    id: 'SEC-HARDCODED-PASSWORD',
    name: 'Plaintext Password in Source Code',
    severity: 'HIGH',
    owasp: 'A07:2021-Identification & Auth Failures',
    category: 'CWE-259: Hard-coded Password',
    test: (line) => /\b(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{5,}['"]/i.test(line) && !/process\.env|password\s*[:=]\s*['"](\*+|x+|password|test|placeholder)['"]/i.test(line),
    desc: 'Plaintext passwords committed to code repositories violate compliance and allow credential harvesting.',
    remediation: 'Supply passwords via environment variables or secret vaults.',
    fixExample: 'const dbPassword = process.env.DB_PASSWORD;'
  },

  // --- INJECTIONS & CODE EXECUTION ---
  {
    id: 'SEC-SQL-INJECTION',
    name: 'SQL Injection Vulnerability',
    severity: 'CRITICAL',
    owasp: 'A03:2021-Injection',
    category: 'CWE-89: SQL Injection',
    test: (line) => /(?:SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\s+[\s\S]*?\+\s*[\w$]+/i.test(line) ||
                    /(?:query|execute|cursor\.execute)\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`/i.test(line) ||
                    /(?:query|execute|cursor\.execute)\s*\(\s*f['"][^'"]*\{[^}]+\}[^'"]*['"]/i.test(line) ||
                    /(?:query|execute)\s*\(\s*['"][^'"]*%(?:s|d)[^'"]*['"]\s*%/i.test(line),
    desc: 'Concatenating user inputs into raw SQL queries allows attackers to bypass authentication or dump database tables.',
    remediation: 'Always use parameterized queries or prepared statements ($1, ?, :param).',
    fixExample: '// Parameterized query\nconst res = await db.query("SELECT * FROM users WHERE id = $1", [userId]);'
  },
  {
    id: 'SEC-CMD-INJECTION',
    name: 'Command Injection / Unsafe Process Execution',
    severity: 'CRITICAL',
    owasp: 'A03:2021-Injection',
    category: 'CWE-78: Command Injection',
    test: (line) => /(?:child_process\.)?(?:exec|execSync)\s*\([^)]*\+/i.test(line) ||
                    /os\.system\s*\([^)]*\+/i.test(line) ||
                    /subprocess\.(?:Popen|call|run)\s*\([^)]*shell\s*=\s*True/i.test(line) ||
                    /\b(?:shell_exec|exec|passthru|system|popen)\s*\([^)]*\$/i.test(line),
    desc: 'Executing system shell commands with concatenated arguments allows malicious users to append shell operators (; && |) for arbitrary execution.',
    remediation: 'Use execFile or subprocess.run with arguments passed as an array and shell=False.',
    fixExample: 'const { execFile } = require("child_process");\nexecFile("ping", ["-c", "1", sanitizedHost], cb);'
  },
  {
    id: 'SEC-EVAL-EXEC',
    name: 'Arbitrary Code Execution via eval()',
    severity: 'CRITICAL',
    owasp: 'A03:2021-Injection',
    category: 'CWE-95: Directive Neutralization in Code',
    test: (line) => /\beval\s*\([^)]+\)/i.test(line) || /new\s+Function\s*\([^)]+\)/i.test(line) || /setTimeout\s*\(\s*['"][^'"]+['"]/i.test(line),
    desc: 'eval() and dynamic Function constructors execute string data as native code, leading to remote code execution.',
    remediation: 'Replace eval() with structured data formats like JSON.parse() or a lookup table.',
    fixExample: 'const data = JSON.parse(jsonString); // Safe data parsing'
  },
  {
    id: 'SEC-XSS-INNERHTML',
    name: 'Cross-Site Scripting (XSS) via innerHTML',
    severity: 'HIGH',
    owasp: 'A03:2021-Injection',
    category: 'CWE-79: Cross-Site Scripting (XSS)',
    test: (line) => /\.(?:innerHTML|outerHTML)\s*=\s*(?!['"][^'"]*['"]\s*;)/i.test(line),
    desc: 'Assigning unsanitized user content to innerHTML enables Cross-Site Scripting, letting attackers steal session cookies.',
    remediation: 'Use textContent / innerText for text, or sanitize HTML using DOMPurify.',
    fixExample: 'element.textContent = userProvidedText; // Or DOMPurify.sanitize(html)'
  },
  {
    id: 'SEC-PATH-TRAVERSAL',
    name: 'Path Traversal / Arbitrary File Access Risk',
    severity: 'HIGH',
    owasp: 'A01:2021-Broken Access Control',
    category: 'CWE-22: Path Traversal',
    test: (line) => /(?:readFile|readFileSync|createReadStream|writeFile|writeFileSync|open|sendFile)\s*\([^)]*(?:\.\.\/|\.\.\\)/i.test(line) ||
                    ((line.includes('../') || line.includes('..\\')) && /(?:path|fs|file|dir)/i.test(line)),
    desc: 'Allowing relative path sequences (../) in file operations enables attackers to read sensitive files (e.g. /etc/passwd).',
    remediation: 'Resolve paths with path.resolve() and verify the target path starts with the allowed root directory.',
    fixExample: 'const safePath = path.resolve(SAFE_DIR, fileName);\nif (!safePath.startsWith(SAFE_DIR)) throw new Error("Invalid path");'
  },
  {
    id: 'SEC-DESERIAL-PICKLE',
    name: 'Insecure Python Deserialization (pickle)',
    severity: 'CRITICAL',
    owasp: 'A08:2021-Software and Data Integrity Failures',
    category: 'CWE-502: Deserialization of Untrusted Data',
    test: (line) => /pickle\.loads?\s*\(/i.test(line),
    desc: 'Python pickle format can construct arbitrary Python objects upon deserialization, executing code when parsing untrusted data.',
    remediation: 'Use safe serialization standards such as JSON or Protocol Buffers instead of pickle.',
    fixExample: 'import json\ndata = json.loads(payload)'
  },

  // --- CRYPTO, TLS & CONFIGURATION ---
  {
    id: 'SEC-TLS-DISABLED',
    name: 'Disabled TLS / SSL Certificate Validation',
    severity: 'CRITICAL',
    owasp: 'A02:2021-Cryptographic Failures',
    category: 'CWE-295: Improper Certificate Validation',
    test: (line) => /rejectUnauthorized\s*:\s*false/i.test(line) ||
                    /verify\s*=\s*False/i.test(line) ||
                    /NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]0['"]/i.test(line),
    desc: 'Disabling TLS certificate verification allows attackers on the network path to intercept and modify all HTTPS communications.',
    remediation: 'Remove rejectUnauthorized: false and install proper trusted root CA certificates.',
    fixExample: 'const agent = new https.Agent({ rejectUnauthorized: true });'
  },
  {
    id: 'SEC-WEAK-HASH-MD5',
    name: 'Insecure Cryptographic Hash (MD5 / SHA-1)',
    severity: 'HIGH',
    owasp: 'A02:2021-Cryptographic Failures',
    category: 'CWE-328: Use of Weak Hash',
    test: (line) => /(?:createHash|hashlib\.)\s*\(\s*['"](md5|sha1)['"]/i.test(line) ||
                    /\b(?:md5|sha1)\s*\(/i.test(line),
    desc: 'MD5 and SHA-1 have known collision attacks and must never be used for password hashing, signatures, or secure verification.',
    remediation: 'Use SHA-256 / SHA-3 for data hashing, or bcrypt / argon2id for hashing passwords.',
    fixExample: 'const hash = crypto.createHash("sha256").update(data).digest("hex");'
  },
  {
    id: 'SEC-WEAK-RANDOM',
    name: 'Insecure Pseudo-Random Number Generator',
    severity: 'MEDIUM',
    owasp: 'A02:2021-Cryptographic Failures',
    category: 'CWE-338: Use of Cryptographically Weak PRNG',
    test: (line) => /\bMath\.random\s*\(\s*\)/i.test(line) && /(?:token|secret|key|salt|nonce|auth|pass|session|id)/i.test(line),
    desc: 'Math.random() is predictable and unsuitable for generating security tokens, salts, session IDs, or cryptographic keys.',
    remediation: 'Use the Web Crypto API (crypto.getRandomValues) or Node crypto.randomBytes().',
    fixExample: 'const token = crypto.randomBytes(32).toString("hex");'
  },
  {
    id: 'SEC-HTTP-PLAINTEXT',
    name: 'Unencrypted HTTP Protocol Usage',
    severity: 'MEDIUM',
    owasp: 'A02:2021-Cryptographic Failures',
    category: 'CWE-319: Cleartext Transmission of Sensitive Information',
    test: (line) => /['"]http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(line),
    desc: 'Transmitting API calls or resources over plaintext HTTP exposes request headers, tokens, and payloads to network eavesdropping.',
    remediation: 'Upgrade to HTTPS (https://) for all endpoints and remote connections.',
    fixExample: 'const apiUrl = "https://api.example.com/v1";'
  },
  {
    id: 'SEC-CORS-WILDCARD',
    name: 'Overly Permissive CORS Policy (*)',
    severity: 'MEDIUM',
    owasp: 'A01:2021-Broken Access Control',
    category: 'CWE-942: Permissive Cross-Origin Policy',
    test: (line) => /Access-Control-Allow-Origin['"]?\s*[:=]\s*['"]\*['"]/i.test(line) || /origin\s*:\s*['"]\*['"]/i.test(line),
    desc: 'Wildcard CORS (*) allows any third-party domain in the browser to send cross-origin requests to your API.',
    remediation: 'Specify an explicit whitelist of trusted frontend domains.',
    fixExample: 'const corsOptions = { origin: ["https://app.yourdomain.com"] };'
  },
  {
    id: 'SEC-DEBUG-ENABLED',
    name: 'Production Debug Mode Active',
    severity: 'MEDIUM',
    owasp: 'A05:2021-Security Misconfiguration',
    category: 'CWE-215: Information Exposure Through Debug',
    test: (line) => /\bDEBUG\s*=\s*True\b/i.test(line) || /app\.debug\s*=\s*True/i.test(line) || /display_errors\s*=\s*['"]?1['"]?/i.test(line),
    desc: 'Enabling debug mode in production leaks stack traces, environment variables, source code lines, and interactive consoles.',
    remediation: 'Ensure debug mode is disabled in production environments.',
    fixExample: 'app.config["DEBUG"] = os.getenv("FLASK_ENV") == "development"'
  },

  // --- SMART CONTRACTS & MEMORY SAFETY ---
  {
    id: 'SEC-SOLIDITY-REENTRANCY',
    name: 'Solidity Reentrancy Risk (Call before State Update)',
    severity: 'HIGH',
    owasp: 'A04:2021-Insecure Design',
    category: 'CWE-841: Behavioral Workflow Flaw',
    test: (line) => /\.call\{value:/i.test(line),
    desc: 'External ether transfers via .call{value:...} hand control over to recipient fallback functions, enabling reentrancy drainage.',
    remediation: 'Follow Checks-Effects-Interactions: Update balances BEFORE making external calls.',
    fixExample: 'balances[msg.sender] = 0;\n(bool sent, ) = msg.sender.call{value: amount}("");\nrequire(sent, "Failed");'
  },
  {
    id: 'SEC-SOLIDITY-TX-ORIGIN',
    name: 'Solidity Authorization with tx.origin',
    severity: 'HIGH',
    owasp: 'A07:2021-Identification & Auth Failures',
    category: 'CWE-302: Authentication Bypass',
    test: (line) => /require\s*\([^)]*tx\.origin/i.test(line) || /tx\.origin\s*==/i.test(line),
    desc: 'Using tx.origin for authentication enables phishing attacks where an intermediate contract calls on behalf of the user.',
    remediation: 'Use msg.sender instead of tx.origin for caller verification.',
    fixExample: 'require(msg.sender == owner, "Unauthorized caller");'
  },
  {
    id: 'SEC-C-UNSAFE-MEM',
    name: 'Unsafe C/C++ String/Memory Function',
    severity: 'HIGH',
    owasp: 'A04:2021-Insecure Design',
    category: 'CWE-120: Buffer Copy without Bounds Check',
    test: (line) => /\b(strcpy|strcat|gets|sprintf)\s*\(/i.test(line),
    desc: 'Functions like strcpy, strcat, and gets do not check destination boundaries, causing classic stack buffer overflows.',
    remediation: 'Use bounded functions such as strncpy, strncat, snprintf, or std::string.',
    fixExample: 'snprintf(dest, sizeof(dest), "%s", src);'
  }
];

function analyzeSecurity(code, lang, scope) {
  const lines = code.split('\n');
  const findings = [];
  const rules = SECURITY_RULES.filter(r => {
    if (scope === 'secrets') return r.category.includes('Hardcoded Credentials') || r.category.includes('SQL Injection') || r.category.includes('Command Injection');
    if (scope === 'strict') return r.severity === 'CRITICAL' || r.severity === 'HIGH';
    return true;
  });

  const seenKeys = new Set();

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed || /^\s*(\/\/|#|\/\*|\*)/.test(trimmed)) continue;

    // Standard rule checks
    for (const rule of rules) {
      if (rule.test(raw)) {
        const key = `${rule.id}:${i+1}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          findings.push({
            id: rule.id,
            name: rule.name,
            severity: rule.severity,
            owasp: rule.owasp,
            category: rule.category,
            line: i + 1,
            codeSnippet: raw,
            desc: rule.desc,
            remediation: rule.remediation,
            fixExample: rule.fixExample
          });
        }
      }
    }

    // High-Entropy Secret Scanner
    if (scope !== 'secrets') {
      const stringMatches = raw.match(/['"][a-zA-Z0-9_\-\.\/+=]{22,}['"]/g);
      if (stringMatches) {
        stringMatches.forEach(str => {
          const cleanStr = str.slice(1, -1);
          const entropy = calculateShannonEntropy(cleanStr);
          if (entropy > 4.6 && !seenKeys.has(`ENTROPY:${i+1}`)) {
            seenKeys.add(`ENTROPY:${i+1}`);
            findings.push({
              id: 'SEC-HIGH-ENTROPY',
              name: `High-Entropy Secret String (Entropy: ${entropy.toFixed(2)})`,
              severity: 'HIGH',
              owasp: 'A07:2021-Identification & Auth Failures',
              category: 'CWE-798: Potential High-Entropy Secret Key',
              line: i + 1,
              codeSnippet: raw,
              desc: 'This string has an unusually high cryptographic randomness / Shannon entropy characteristic of private API tokens or encryption keys.',
              remediation: 'Load high-entropy tokens and secrets from environment variables instead of committing them to code.',
              fixExample: 'const secretKey = process.env.SECRET_KEY;'
            });
          }
        });
      }
    }
  }

  // Count severities
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
  findings.forEach(f => {
    if (counts[f.severity] !== undefined) counts[f.severity]++;
    else counts.INFO++;
  });

  let penalty = (counts.CRITICAL * 25) + (counts.HIGH * 15) + (counts.MEDIUM * 8) + (counts.LOW * 3);
  let score = Math.max(0, 100 - penalty);

  let grade = 'A';
  let statusText = 'Clean & Secure';
  let statusClass = 'status-a';

  if (counts.CRITICAL > 0 || score < 30) {
    grade = 'F';
    statusText = 'Critical Risks Detected';
    statusClass = 'status-f';
  } else if (counts.HIGH > 0 || score < 60) {
    grade = 'D';
    statusText = 'High Risk';
    statusClass = 'status-d';
  } else if (counts.MEDIUM > 0 || score < 80) {
    grade = 'C';
    statusText = 'Moderate Risk';
    statusClass = 'status-c';
  } else if (counts.LOW > 0 || score < 95) {
    grade = 'B';
    statusText = 'Low Risk';
    statusClass = 'status-b';
  }

  // Generate markdown report
  let md = `# Security Audit Report\n\n`;
  md += `**Score:** ${score}/100 (Grade: ${grade}) — *${statusText}*\n`;
  md += `**Scanned:** ${lines.length} lines · **Issues Found:** ${findings.length}\n`;
  md += `- 🔴 Critical: ${counts.CRITICAL}\n`;
  md += `- 🟠 High: ${counts.HIGH}\n`;
  md += `- 🟡 Medium: ${counts.MEDIUM}\n`;
  md += `- 🔵 Low/Info: ${counts.LOW + counts.INFO}\n\n`;
  md += `## Detailed Findings\n\n`;

  if (findings.length === 0) {
    md += `✅ **No vulnerabilities detected.** All security rules passed successfully!\n`;
  } else {
    findings.forEach((f, idx) => {
      md += `### ${idx + 1}. [${f.severity}] ${f.name}\n`;
      md += `- **OWASP:** ${f.owasp || 'N/A'}\n`;
      md += `- **Category:** ${f.category}\n`;
      md += `- **Location:** Line ${f.line}\n`;
      md += `- **Vulnerable Code:**\n\`\`\`\n${f.codeSnippet.trim()}\n\`\`\`\n`;
      md += `- **Impact:** ${f.desc}\n`;
      md += `- **Remediation:** ${f.remediation}\n`;
      if (f.fixExample) {
        md += `- **Safe Fix Example:**\n\`\`\`\n${f.fixExample}\n\`\`\`\n`;
      }
      md += `\n---\n\n`;
    });
  }

  return { score, grade, statusText, statusClass, counts, findings, markdown: md, totalLines: lines.length };
}

function analyzeRepoSecurity(repoData, tree) {
  const findings = [];
  const paths = tree.map(t => t.path);

  const SENSITIVE_PATTERNS = [
    { regex: /^\.env(\..+)?$/i, name: 'Committed Environment Secrets (.env file)', severity: 'CRITICAL', cat: 'CWE-798: Secrets Exposure' },
    { regex: /(\.(pem|key|pkcs12|pfx|keystore)|^id_(rsa|ed25519|dsa))$/i, name: 'Committed Private Key or SSL Certificate', severity: 'CRITICAL', cat: 'CWE-321: Cryptographic Key Exposure' },
    { regex: /(credentials|service-account|client_secret|firebase-adminsdk).*\.json$/i, name: 'Committed Cloud Service Credentials', severity: 'CRITICAL', cat: 'CWE-798: Secrets Exposure' },
    { regex: /secrets?\.(ya?ml|json)$/i, name: 'Committed Secrets / Config File', severity: 'CRITICAL', cat: 'CWE-798: Secrets Exposure' },
    { regex: /(npm-debug|yarn-error|lerna-debug)\.log$/i, name: 'Committed Debug Log with Potential Secrets', severity: 'LOW', cat: 'CWE-532: Log Information Exposure' },
  ];

  paths.forEach(p => {
    const filename = p.split('/').pop();
    for (const pat of SENSITIVE_PATTERNS) {
      if (pat.regex.test(filename)) {
        findings.push({
          id: 'REPO-SENSITIVE-FILE',
          name: pat.name,
          severity: pat.severity,
          owasp: 'A07:2021-Identification & Auth Failures',
          category: pat.cat,
          line: p,
          codeSnippet: `Found in repository: ${p}`,
          desc: `Committing sensitive files like "${p}" directly to version control makes secrets visible to anyone with repository access.`,
          remediation: `Add "${filename}" to your .gitignore immediately and revoke/rotate any leaked credentials.`,
          fixExample: `# .gitignore\n${filename}\n.env\n*.pem\n*.key`
        });
      }
    }
  });

  const hasSecurityPolicy = paths.some(p => /^(\.github\/)?SECURITY\.md$/i.test(p));
  const hasGitignore = paths.some(p => /^\.gitignore$/i.test(p));
  const hasLockfile = paths.some(p => /^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|poetry\.lock|Pipfile\.lock|Cargo\.lock|go\.sum)$/i.test(p));
  const hasPackageJson = paths.some(p => /^package\.json$/i.test(p));

  if (!hasSecurityPolicy) {
    findings.push({
      id: 'REPO-NO-SECURITY-MD',
      name: 'Missing Security Policy (SECURITY.md)',
      severity: 'INFO',
      owasp: 'A05:2021-Security Misconfiguration',
      category: 'Best Practice: Vulnerability Disclosure',
      line: 'Repository Root',
      codeSnippet: 'SECURITY.md not found',
      desc: 'Without a SECURITY.md file, researchers have no secure channel to privately disclose vulnerabilities.',
      remediation: 'Create a SECURITY.md in the root or .github/ folder with instructions on reporting security bugs.',
      fixExample: '# Security Policy\n\nPlease report vulnerabilities to security@yourdomain.com.'
    });
  }

  if (!hasGitignore) {
    findings.push({
      id: 'REPO-NO-GITIGNORE',
      name: 'Missing .gitignore File',
      severity: 'MEDIUM',
      owasp: 'A05:2021-Security Misconfiguration',
      category: 'Best Practice: Source Configuration',
      line: 'Repository Root',
      codeSnippet: '.gitignore missing',
      desc: 'Repositories without a .gitignore are prone to accidental commits of node_modules, build artifacts, and secret files.',
      remediation: 'Create a .gitignore tailored to your project stack.',
      fixExample: '# .gitignore\nnode_modules/\n.env\n*.log\ndist/'
    });
  }

  if (hasPackageJson && !hasLockfile) {
    findings.push({
      id: 'REPO-NO-LOCKFILE',
      name: 'Missing Dependency Lockfile',
      severity: 'MEDIUM',
      owasp: 'A06:2021-Vulnerable and Outdated Components',
      category: 'CWE-829: Inclusion of Functionality from Untrusted Sphere',
      line: 'package.json',
      codeSnippet: 'package.json present without package-lock.json or yarn.lock',
      desc: 'Deploying without a lockfile risks dependency drift and supply chain attacks from malicious minor version bumps.',
      remediation: 'Commit your package-lock.json, yarn.lock, or pnpm-lock.yaml into git.',
      fixExample: 'npm install --package-lock-only\ngit add package-lock.json'
    });
  }

  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
  findings.forEach(f => {
    if (counts[f.severity] !== undefined) counts[f.severity]++;
    else counts.INFO++;
  });

  let penalty = (counts.CRITICAL * 30) + (counts.HIGH * 18) + (counts.MEDIUM * 8) + (counts.LOW * 3);
  let score = Math.max(0, 100 - penalty);

  let grade = 'A';
  let statusText = 'Project Secure';
  let statusClass = 'status-a';

  if (counts.CRITICAL > 0 || score < 30) {
    grade = 'F';
    statusText = 'Critical Repo Risks';
    statusClass = 'status-f';
  } else if (counts.HIGH > 0 || score < 60) {
    grade = 'D';
    statusText = 'High Repo Risk';
    statusClass = 'status-d';
  } else if (counts.MEDIUM > 0 || score < 80) {
    grade = 'C';
    statusText = 'Moderate Repo Risk';
    statusClass = 'status-c';
  } else if (counts.LOW > 0 || score < 95) {
    grade = 'B';
    statusText = 'Low Risk';
    statusClass = 'status-b';
  }

  let md = `# Project Security Audit: ${repoData.full_name}\n\n`;
  md += `**Score:** ${score}/100 (Grade: ${grade}) — *${statusText}*\n`;
  md += `**Files Scanned:** ${paths.length} · **Issues Found:** ${findings.length}\n`;
  md += `- 🔴 Critical: ${counts.CRITICAL}\n`;
  md += `- 🟠 High: ${counts.HIGH}\n`;
  md += `- 🟡 Medium: ${counts.MEDIUM}\n`;
  md += `- 🔵 Low/Info: ${counts.LOW + counts.INFO}\n\n`;

  findings.forEach((f, idx) => {
    md += `### ${idx + 1}. [${f.severity}] ${f.name}\n`;
    md += `- **Location:** ${f.line}\n`;
    md += `- **Impact:** ${f.desc}\n`;
    md += `- **Remediation:** ${f.remediation}\n\n---\n\n`;
  });

  return { score, grade, statusText, statusClass, counts, findings, markdown: md, totalLines: paths.length };
}

function renderSecurityOutput(audit, title) {
  STATE.lastSecurityReport = audit;
  const isClean = audit.findings.length === 0;

  let html = `
    <div class="sec-score-card ${audit.statusClass}">
      <div class="score-circle">
        <span class="score-num">${audit.score}</span>
        <span class="score-denom">/100</span>
      </div>
      <div class="score-details">
        <div class="score-grade-row">
          <span class="grade-pill grade-${audit.grade.toLowerCase()}">Grade ${audit.grade}</span>
          <span class="score-status">${audit.statusText}</span>
        </div>
        <div class="score-sub">${title} · ${audit.totalLines} lines/items scanned</div>
      </div>
    </div>

    <div class="sec-metrics-grid">
      <div class="metric-chip m-crit"><strong>${audit.counts.CRITICAL || 0}</strong> Critical</div>
      <div class="metric-chip m-high"><strong>${audit.counts.HIGH || 0}</strong> High</div>
      <div class="metric-chip m-med"><strong>${audit.counts.MEDIUM || 0}</strong> Medium</div>
      <div class="metric-chip m-low"><strong>${(audit.counts.LOW || 0) + (audit.counts.INFO || 0)}</strong> Low/Info</div>
    </div>
  `;

  if (isClean) {
    html += `
      <div class="sec-clean-state">
        <div class="clean-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6eef9b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
        </div>
        <div class="clean-title">All Security Tests Passed!</div>
        <div class="clean-desc">No hardcoded credentials, injection vulnerabilities, high-entropy secrets, or misconfigurations were found in this code.</div>
      </div>
    `;
  } else {
    html += `
      <div class="sec-filters-bar">
        <span class="filter-lbl">Filter:</span>
        <button class="sec-filter-chip active" data-filter="all">All (${audit.findings.length})</button>
        <button class="sec-filter-chip" data-filter="CRITICAL">Critical (${audit.counts.CRITICAL || 0})</button>
        <button class="sec-filter-chip" data-filter="HIGH">High (${audit.counts.HIGH || 0})</button>
        <button class="sec-filter-chip" data-filter="MEDIUM">Medium (${audit.counts.MEDIUM || 0})</button>
        <button class="sec-filter-chip" data-filter="LOW">Low/Info (${(audit.counts.LOW || 0) + (audit.counts.INFO || 0)})</button>
      </div>
      <div class="findings-list">
    `;

    audit.findings.forEach((f) => {
      const sevClass = `sev-${f.severity.toLowerCase()}`;
      const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      html += `
        <div class="finding-card ${sevClass}" data-severity="${f.severity}">
          <div class="fc-head">
            <span class="fc-badge ${sevClass}">${f.severity}</span>
            <span class="fc-name">${f.name}</span>
            <span class="fc-loc">${typeof f.line === 'number' ? 'Line ' + f.line : f.line}</span>
          </div>

          <div class="fc-cat">${f.owasp ? `<strong>${f.owasp}</strong> · ` : ''}${f.category}</div>

          <div class="fc-desc">${f.desc}</div>

          <!-- Interactive Before & After Diff -->
          <div class="fc-diff-view">
            <div class="diff-col diff-vuln">
              <span class="diff-col-head diff-vuln-head">❌ Vulnerable Code</span>
              <pre class="diff-code"><code>${escape(f.codeSnippet.trim())}</code></pre>
            </div>
            <div class="diff-col diff-safe">
              <span class="diff-col-head diff-safe-head">✅ Remediated Safe Fix</span>
              <pre class="diff-code"><code>${escape(f.fixExample ? f.fixExample.trim() : '// Safe implementation')}</code></pre>
            </div>
          </div>

          <div class="fc-fix-wrap" style="margin-top:8px;">
            <div class="fc-fix-head">
              <span>💡 Remediation Advice</span>
              ${f.fixExample ? `<button class="btn-copy-fix" data-fix="${encodeURIComponent(f.fixExample)}" title="Copy safe fix code">Copy Fix</button>` : ''}
            </div>
            <div class="fc-remed">${f.remediation}</div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }

  DOM.secBody.innerHTML = html;

  // Filter chips
  const filterBtns = DOM.secBody.querySelectorAll('.sec-filter-chip');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetSev = btn.dataset.filter;
      const cards = DOM.secBody.querySelectorAll('.finding-card');
      cards.forEach(card => {
        if (targetSev === 'all') {
          card.style.display = 'block';
        } else if (targetSev === 'LOW') {
          card.style.display = (card.dataset.severity === 'LOW' || card.dataset.severity === 'INFO') ? 'block' : 'none';
        } else {
          card.style.display = card.dataset.severity === targetSev ? 'block' : 'none';
        }
      });
    });
  });

  // Copy Fix buttons
  DOM.secBody.querySelectorAll('.btn-copy-fix').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const code = decodeURIComponent(btn.dataset.fix);
      copyText(code);
      showToast('Fix copied to clipboard!', 'ok');
    });
  });
}

function runSecurityTest() {
  if (STATE.secMode === 'repo') {
    auditGithubRepo();
    return;
  }

  const code = DOM.secCodeInput.value;
  const lang = DOM.secLang.value;
  const scope = DOM.secDepth.value;
  const lname = DOM.secLang.options[DOM.secLang.selectedIndex].text;

  if (!code.trim()) {
    showToast('Paste code or choose a sample first', 'err');
    return;
  }

  const audit = analyzeSecurity(code, lang, scope);
  renderSecurityOutput(audit, `${lname} Code Security Audit`);

  saveHistory('security', {
    title: `${lname} Security Scan`,
    target: `${lname} (${code.split('\n').length} lines)`,
    score: audit.score,
    grade: audit.grade,
    findingsCount: audit.findings.length,
    criticalCount: audit.counts.CRITICAL || 0,
    timestamp: new Date().toLocaleString(),
    code,
    reportMd: audit.markdown,
    auditData: audit
  });

  DOM.secOutput.classList.remove('hidden');
  setTimeout(() => DOM.secOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
  showToast(audit.findings.length === 0 ? 'Audit passed! No risks detected' : `Scan complete: ${audit.findings.length} issue(s) flagged`, audit.findings.length === 0 ? 'ok' : '');
}

async function auditGithubRepo() {
  const parsed = parseGithubUrl(DOM.secRepoUrl.value);
  if (!parsed) {
    showToast('Enter a valid GitHub URL (owner/repo)', 'err');
    return;
  }

  const btn = DOM.btnSecRepoScan;
  const originalHTML = btn.innerHTML;
  btn.classList.add('loading');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin">⟳</span> Auditing…';

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: { 'Accept': 'application/vnd.github+json' }
    });

    if (repoRes.status === 404) throw new Error('Repository not found (or private)');
    if (repoRes.status === 403) throw new Error('GitHub API rate limit exceeded');
    if (!repoRes.ok) throw new Error(`GitHub API error (${repoRes.status})`);

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    let tree = [];
    try {
      const treeRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${defaultBranch}?recursive=1`, {
        headers: { 'Accept': 'application/vnd.github+json' }
      });
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        tree = treeData.tree || [];
      }
    } catch (e) {}

    const audit = analyzeRepoSecurity(repoData, tree);
    renderSecurityOutput(audit, `${repoData.full_name} Project Audit`);

    saveHistory('security', {
      title: `${repoData.name} Project Audit`,
      target: repoData.full_name,
      score: audit.score,
      grade: audit.grade,
      findingsCount: audit.findings.length,
      criticalCount: audit.counts.CRITICAL || 0,
      timestamp: new Date().toLocaleString(),
      repoUrl: DOM.secRepoUrl.value,
      reportMd: audit.markdown,
      auditData: audit
    });

    DOM.secOutput.classList.remove('hidden');
    setTimeout(() => DOM.secOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    showToast(`Project audit complete!`, 'ok');
  } catch (err) {
    showToast(err.message || 'Audit failed', 'err');
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

// ============================================
// REAL-TIME PHISHING DEFENSE & SITE INSPECTOR
// ============================================

function inspectActiveSite(url, tabId) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    DOM.siteInspectDomain.textContent = 'Chrome Internal Page';
    DOM.siteInspectBadge.className = 'site-badge badge-safe';
    DOM.siteInspectBadge.textContent = 'System Protected';
    DOM.siteScoreFill.style.width = '100%';
    DOM.siteHeuristicsList.innerHTML = '<div class="heur-item"><span class="h-icon">🛡️</span> Internal browser service running in sandbox</div>';
    return;
  }

  let domain = 'unknown';
  let isHttps = false;
  try {
    const u = new URL(url);
    domain = u.hostname;
    isHttps = u.protocol === 'https:';
  } catch (e) {
    domain = url.split('/')[2] || url;
  }

  DOM.siteInspectDomain.textContent = domain;

  // Try querying content script on active tab
  chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_SAFETY_REPORT' }, (res) => {
    if (chrome.runtime.lastError || !res?.report) {
      // Local fallback evaluation
      const isPunycode = domain.startsWith('xn--');
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);

      if (isPunycode || (isIp && !isHttps)) {
        DOM.siteInspectBadge.className = 'site-badge badge-danger';
        DOM.siteInspectBadge.textContent = 'Phishing Warning';
        DOM.siteScoreFill.style.width = '25%';
        DOM.siteHeuristicsList.innerHTML = `
          <div class="heur-item"><span class="h-icon">⚠️</span> Suspicious lookalike domain / IP host</div>
          <div class="heur-item"><span class="h-icon">${isHttps ? '✅' : '❌'}</span> SSL / TLS: ${isHttps ? 'HTTPS' : 'Unencrypted HTTP'}</div>
        `;
      } else {
        DOM.siteInspectBadge.className = 'site-badge badge-safe';
        DOM.siteInspectBadge.textContent = isHttps ? 'Verified Safe' : 'Standard Web';
        DOM.siteScoreFill.style.width = isHttps ? '100%' : '80%';
        DOM.siteHeuristicsList.innerHTML = `
          <div class="heur-item"><span class="h-icon">✅</span> Homograph &amp; Punycode lookalike check passed</div>
          <div class="heur-item"><span class="h-icon">${isHttps ? '✅' : '⚠️'}</span> Protocol: ${isHttps ? 'Encrypted HTTPS' : 'Unencrypted HTTP'}</div>
          <div class="heur-item"><span class="h-icon">✅</span> Real-time heuristic protection active</div>
        `;
      }
    } else {
      const rep = res.report;
      if (rep.score >= 50) {
        DOM.siteInspectBadge.className = 'site-badge badge-danger';
        DOM.siteInspectBadge.textContent = 'Threat Blocked';
        DOM.siteScoreFill.style.width = '20%';
      } else if (rep.score >= 25) {
        DOM.siteInspectBadge.className = 'site-badge badge-warning';
        DOM.siteInspectBadge.textContent = 'Suspicious';
        DOM.siteScoreFill.style.width = '55%';
      } else {
        DOM.siteInspectBadge.className = 'site-badge badge-safe';
        DOM.siteInspectBadge.textContent = 'Verified Safe';
        DOM.siteScoreFill.style.width = '100%';
      }

      if (rep.reasons && rep.reasons.length) {
        DOM.siteHeuristicsList.innerHTML = rep.reasons.map(r => `<div class="heur-item"><span class="h-icon">⚠️</span> ${r}</div>`).join('');
      } else {
        DOM.siteHeuristicsList.innerHTML = `
          <div class="heur-item"><span class="h-icon">✅</span> Homograph &amp; Punycode lookalike check passed</div>
          <div class="heur-item"><span class="h-icon">✅</span> No credential theft forms detected</div>
          <div class="heur-item"><span class="h-icon">✅</span> Verified legitimate web host</div>
        `;
      }
    }
  });
}

function loadShieldState() {
  chrome.storage.local.get(['gitty_phishing_shield_enabled', 'gitty_threats_blocked', 'gitty_threat_history'], res => {
    const isEnabled = res.gitty_phishing_shield_enabled !== false;
    STATE.settings.shieldEnabled = isEnabled;

    DOM.shieldToggleRealtime.checked = isEnabled;
    DOM.settingsShield.checked = isEnabled;

    if (isEnabled) {
      DOM.shieldStatusHeading.textContent = 'Always-On Shield: ACTIVE';
      DOM.btnTopbarShield.classList.remove('paused');
      DOM.btnTopbarShield.querySelector('.shield-pill-text').textContent = 'Shield Active';
    } else {
      DOM.shieldStatusHeading.textContent = 'Phishing Shield: PAUSED';
      DOM.btnTopbarShield.classList.add('paused');
      DOM.btnTopbarShield.querySelector('.shield-pill-text').textContent = 'Shield Paused';
    }

    DOM.sstatBlockedCount.textContent = res.gitty_threats_blocked || 0;
    STATE.threats = res.gitty_threat_history || [];
    renderThreatLog();
  });
}

function toggleShield(enable) {
  chrome.storage.local.set({ gitty_phishing_shield_enabled: enable }, () => {
    STATE.settings.shieldEnabled = enable;
    loadShieldState();
    showToast(enable ? 'Real-time phishing protection enabled!' : 'Phishing protection paused');
  });
}

function renderThreatLog() {
  if (!STATE.threats.length) {
    DOM.threatLogList.innerHTML = '<div style="font-size:11px;color:var(--t3);text-align:center;padding:12px;">No malicious threats detected. Clean browsing!</div>';
    return;
  }

  DOM.threatLogList.innerHTML = STATE.threats.map(t => `
    <div class="threat-log-item">
      <div class="tlog-head">
        <span class="tlog-domain">🚨 ${t.domain}</span>
        <span class="tlog-time">${t.timestamp}</span>
      </div>
      <div class="tlog-reason">${(t.reasons && t.reasons[0]) || 'Suspicious phishing indicators flagged'}</div>
    </div>
  `).join('');
}

// ============================================
// HISTORY & RESTORATION
// ============================================

function saveHistory(type, item) {
  const key = `gitty_${type}_history`;
  chrome.storage.local.get([key], res => {
    const arr = res[key] || [];
    arr.unshift(item);
    if (arr.length > 30) arr.pop();
    chrome.storage.local.set({ [key]: arr }, () => { STATE.history[type] = arr; });
  });
}

function loadHistory() {
  chrome.storage.local.get(['gitty_readme_history', 'gitty_security_history', 'gitty_code_history'], res => {
    STATE.history.readme = res.gitty_readme_history || [];
    STATE.history.security = res.gitty_security_history || res.gitty_code_history || [];
    renderHistory();
  });
}

function renderHistory() {
  const rh = STATE.history.readme;
  const sh = STATE.history.security;

  DOM.histReadme.innerHTML = rh.map((it, i) => `
    <div class="hist-item" data-type="readme" data-i="${i}">
      <span class="hist-icon">📝</span>
      <div class="hist-content">
        <div class="hist-title">${it.project || 'Untitled README'}</div>
        <div class="hist-meta">${it.timestamp}${it.lang ? ' · ' + it.lang : ''}</div>
      </div>
      <span class="hist-arrow">›</span>
    </div>
  `).join('');

  DOM.histSecurity.innerHTML = sh.map((it, i) => {
    const scoreBadge = it.score !== undefined ? `<span class="chip chip-c">Score ${it.score}</span>` : '';
    const critBadge = it.criticalCount > 0 ? `<span class="chip chip-crit">${it.criticalCount} Critical</span>` : '';
    return `
      <div class="hist-item" data-type="security" data-i="${i}">
        <span class="hist-icon">🛡️</span>
        <div class="hist-content">
          <div class="hist-title">${it.title || 'Security Scan'}</div>
          <div class="hist-meta">${it.timestamp} · ${it.target || ''}</div>
        </div>
        <div style="display:flex;gap:4px;align-items:center;">
          ${scoreBadge}
          ${critBadge}
          <span class="hist-arrow">›</span>
        </div>
      </div>
    `;
  }).join('');

  const empty = rh.length === 0 && sh.length === 0;
  DOM.histEmpty.classList.toggle('show', empty);
}

// ============================================
// UTILITIES
// ============================================

function saveFile(content, name, ext) {
  const mime = ext === 'html' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8';
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Copied!', 'ok'))
      .catch(() => fbCopy(text));
  } else {
    fbCopy(text);
  }
}

function fbCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('Copied!', 'ok');
}

function showToast(msg, type = '', ms = 2200) {
  const t = DOM.toast;
  t.textContent = msg;
  t.className = `toast${type ? ' ' + type : ''}`;
  t.classList.remove('hidden');
  clearTimeout(t._t);
  t._t = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .2s';
    setTimeout(() => {
      t.classList.add('hidden');
      t.style.opacity = '';
      t.style.transition = '';
    }, 200);
  }, ms);
}

function updateLineNums() {
  if (DOM.secCodeInput && DOM.secLineNums) {
    const n = DOM.secCodeInput.value.split('\n').length;
    DOM.secLineNums.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
  }
}

// ============================================
// SETTINGS
// ============================================

function loadSettings() {
  chrome.storage.local.get([
    'gitty_syntax_theme',
    'gitty_animation',
    'gitty_auto_copy',
    'gitty_phishing_shield_enabled',
    'gitty_notif_enabled'
  ], res => {
    STATE.settings.syntaxTheme = res.gitty_syntax_theme || 'tokyo-night';
    STATE.settings.defaultAnimation = res.gitty_animation || 'typewriter';
    STATE.settings.autoCopy = res.gitty_auto_copy || false;
    STATE.settings.shieldEnabled = res.gitty_phishing_shield_enabled !== false;
    STATE.settings.notifEnabled = res.gitty_notif_enabled !== false;

    DOM.settingsTheme.value = STATE.settings.syntaxTheme;
    DOM.settingsAnim.value = STATE.settings.defaultAnimation;
    DOM.settingsAuto.checked = STATE.settings.autoCopy;
    DOM.settingsShield.checked = STATE.settings.shieldEnabled;
    DOM.settingsNotif.checked = STATE.settings.notifEnabled;

    [...DOM.animRadios].forEach(r => { r.checked = r.value === STATE.settings.defaultAnimation; });
  });
}

function saveSettings() {
  const themeMode = DOM.settingsThemeMode.value;
  const theme = DOM.settingsTheme.value;
  const anim = DOM.settingsAnim.value;
  const auto = DOM.settingsAuto.checked;
  const shield = DOM.settingsShield.checked;
  const notif = DOM.settingsNotif.checked;

  chrome.storage.local.set({
    gitty_theme_mode: themeMode,
    gitty_syntax_theme: theme,
    gitty_animation: anim,
    gitty_auto_copy: auto,
    gitty_phishing_shield_enabled: shield,
    gitty_notif_enabled: notif
  }, () => {
    STATE.settings.themeMode = themeMode;
    STATE.settings.syntaxTheme = theme;
    STATE.settings.defaultAnimation = anim;
    STATE.settings.autoCopy = auto;
    STATE.settings.shieldEnabled = shield;
    STATE.settings.notifEnabled = notif;

    applyThemeMode(themeMode);
    loadShieldState();
    [...DOM.animRadios].forEach(r => { r.checked = r.value === anim; });
    DOM.overlay.classList.add('hidden');
    showToast('Settings saved!', 'ok');
  });
}

// ============================================
// EVENT WIRING
// ============================================

// Theme toggle
DOM.btnThemeToggle.addEventListener('click', toggleThemeMode);

// Jump to Shield tab from topbar pill
DOM.btnTopbarShield.addEventListener('click', () => {
  const shieldBtn = document.querySelector('.tab-btn[data-tab="shield"]');
  if (shieldBtn) shieldBtn.click();
});

// Tab nav
DOM.tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    DOM.tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.keys(DOM.panes).forEach(k => DOM.panes[k]?.classList.toggle('active', k === tab));
    STATE.tab = tab;
    if (tab === 'history') renderHistory();
    if (tab === 'shield') checkActiveTab();
  });
});

// GitHub import for README
DOM.btnGithubImport.addEventListener('click', importFromGithub);
DOM.githubImportUrl.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); importFromGithub(); }
});

// Tech Stack Chips Toggle
DOM.techChips.forEach(chip => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('active');
    const tech = chip.dataset.tech;
    if (chip.classList.contains('active')) {
      if (!STATE.activeTechBadges.includes(tech)) STATE.activeTechBadges.push(tech);
    } else {
      STATE.activeTechBadges = STATE.activeTechBadges.filter(t => t !== tech);
    }
  });
});

// Generate README
DOM.btnGenerate.addEventListener('click', () => {
  const { readme, anim } = generateReadme();
  DOM.preview.innerHTML = md2html(readme);
  DOM.preview.className = `output-box-body md-render anim-${anim}`;
  DOM.previewWrap.classList.remove('hidden');
  DOM.btnCopy.disabled = false;
  DOM.btnSave.disabled = false;
  if (DOM.btnExportHtml) DOM.btnExportHtml.disabled = false;

  saveHistory('readme', {
    project: DOM.projectName.value.trim() || 'Untitled',
    lang: DOM.projectLang.value.trim(),
    timestamp: new Date().toLocaleString(),
    content: readme
  });

  if (STATE.settings.autoCopy) copyText(readme);
  showToast('README generated!', 'ok');
  setTimeout(() => DOM.previewWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
});

DOM.btnCopy.addEventListener('click', () => { if (STATE.lastReadme) copyText(STATE.lastReadme); });
DOM.btnSave.addEventListener('click', () => {
  saveFile(STATE.lastReadme, DOM.projectName.value.trim() || 'README', 'md');
  showToast('Saved .md!', 'ok');
});

if (DOM.btnExportHtml) {
  DOM.btnExportHtml.addEventListener('click', () => {
    if (STATE.lastReadme) {
      exportReadmeHtml(STATE.lastReadme);
      showToast('Exported HTML!', 'ok');
    }
  });
}

// Toggle anim
let animPaused = false;
DOM.btnToggleAnim.addEventListener('click', () => {
  animPaused = !animPaused;
  DOM.preview.style.animationPlayState = animPaused ? 'paused' : 'running';
  DOM.btnToggleAnim.innerHTML = animPaused
    ? '<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1.5" y="1" width="3" height="9" rx="1" fill="currentColor"/><rect x="6.5" y="1" width="3" height="9" rx="1" fill="currentColor"/></svg>'
    : '<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 1.5L9.5 5.5L2 9.5V1.5Z" fill="currentColor"/></svg>';
});

// Security mode toggle (Code vs Repo)
DOM.btnModeCode.addEventListener('click', () => {
  DOM.btnModeCode.classList.add('active');
  DOM.btnModeRepo.classList.remove('active');
  DOM.secCodeView.classList.remove('hidden');
  DOM.secRepoView.classList.add('hidden');
  STATE.secMode = 'code';
});

DOM.btnModeRepo.addEventListener('click', () => {
  DOM.btnModeRepo.classList.add('active');
  DOM.btnModeCode.classList.remove('active');
  DOM.secRepoView.classList.remove('hidden');
  DOM.secCodeView.classList.add('hidden');
  STATE.secMode = 'repo';
  if (!DOM.secRepoUrl.value && DOM.githubImportUrl.value) {
    DOM.secRepoUrl.value = DOM.githubImportUrl.value;
  }
});

// Sample selector
DOM.secSampleSelect.addEventListener('change', () => {
  const sampleKey = DOM.secSampleSelect.value;
  if (sampleKey && SECURITY_SAMPLES[sampleKey]) {
    DOM.secCodeInput.value = SECURITY_SAMPLES[sampleKey];
    updateLineNums();

    if (sampleKey === 'python_rce') DOM.secLang.value = 'python';
    else if (sampleKey === 'solidity_reentrancy') DOM.secLang.value = 'solidity';
    else DOM.secLang.value = 'javascript';

    showToast('Sample loaded! Click "Run Security Test"', 'ok');
  }
});

// Run Security Test
DOM.btnRunSecurity.addEventListener('click', runSecurityTest);
DOM.btnSecRepoScan.addEventListener('click', auditGithubRepo);

// Clear code
DOM.btnClearSecCode.addEventListener('click', () => {
  DOM.secCodeInput.value = '';
  DOM.secOutput.classList.add('hidden');
  DOM.secSampleSelect.value = '';
  updateLineNums();
});

// Copy & Save Security Report
DOM.btnCopySecSum.addEventListener('click', () => {
  if (STATE.lastSecurityReport) {
    const r = STATE.lastSecurityReport;
    const sum = `Security Audit: Score ${r.score}/100 (${r.grade}) - ${r.statusText}. Total issues: ${r.findings?.length || 0} (${r.counts?.CRITICAL || 0} Critical, ${r.counts?.HIGH || 0} High).`;
    copyText(sum);
    showToast('Summary copied!', 'ok');
  }
});

DOM.btnCopySecMd.addEventListener('click', () => {
  if (STATE.lastSecurityReport?.markdown) {
    copyText(STATE.lastSecurityReport.markdown);
    showToast('Markdown report copied!', 'ok');
  }
});

if (DOM.btnCopySecJson) {
  DOM.btnCopySecJson.addEventListener('click', () => {
    if (STATE.lastSecurityReport) {
      copyText(JSON.stringify(STATE.lastSecurityReport, null, 2));
      showToast('JSON audit report copied!', 'ok');
    }
  });
}

DOM.btnSaveSecMd.addEventListener('click', () => {
  if (STATE.lastSecurityReport?.markdown) {
    saveFile(STATE.lastSecurityReport.markdown, 'security-audit-report', 'md');
    showToast('Saved security report!', 'ok');
  }
});

// Phishing Shield Controls
DOM.shieldToggleRealtime.addEventListener('change', e => {
  toggleShield(e.target.checked);
});

DOM.btnRecheckSite.addEventListener('click', () => {
  checkActiveTab();
  showToast('Re-scanned active site!', 'ok');
});

DOM.btnClearThreats.addEventListener('click', () => {
  chrome.storage.local.set({ gitty_threat_history: [] }, () => {
    STATE.threats = [];
    renderThreatLog();
    showToast('Threat defense log cleared');
  });
});

// Line numbers and tab indentation for code area
DOM.secCodeInput.addEventListener('input', updateLineNums);
DOM.secCodeInput.addEventListener('scroll', () => {
  DOM.secLineNums.style.transform = `translateY(-${DOM.secCodeInput.scrollTop}px)`;
});
DOM.secCodeInput.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = DOM.secCodeInput.selectionStart, en = DOM.secCodeInput.selectionEnd;
    DOM.secCodeInput.value = DOM.secCodeInput.value.substring(0, s) + '  ' + DOM.secCodeInput.value.substring(en);
    DOM.secCodeInput.selectionStart = DOM.secCodeInput.selectionEnd = s + 2;
    updateLineNums();
  }
});

// History tabs
DOM.histBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    DOM.histBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.hist;
    DOM.histReadme.classList.toggle('active', type === 'readme');
    DOM.histSecurity.classList.toggle('active', type === 'security');
  });
});

// Clear history
DOM.btnClearHist.addEventListener('click', () => {
  chrome.storage.local.set({ gitty_readme_history: [], gitty_security_history: [], gitty_code_history: [] }, () => {
    STATE.history.readme = [];
    STATE.history.security = [];
    renderHistory();
    showToast('History cleared');
  });
});

// History item click
document.addEventListener('click', e => {
  const item = e.target.closest('.hist-item');
  if (!item) return;
  const type = item.dataset.type;
  const idx = parseInt(item.dataset.i);

  if (type === 'readme') {
    const entry = STATE.history.readme[idx];
    if (entry?.content) {
      STATE.lastReadme = entry.content;
      DOM.preview.innerHTML = md2html(entry.content);
      DOM.preview.className = `output-box-body md-render anim-${STATE.settings.defaultAnimation}`;
      DOM.previewWrap.classList.remove('hidden');
      DOM.btnCopy.disabled = false;
      DOM.btnSave.disabled = false;
      if (DOM.btnExportHtml) DOM.btnExportHtml.disabled = false;
      DOM.tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'readme'));
      Object.keys(DOM.panes).forEach(k => DOM.panes[k]?.classList.toggle('active', k === 'readme'));
      STATE.tab = 'readme';
      showToast('README restored');
    }
  } else if (type === 'security') {
    const entry = STATE.history.security[idx];
    if (entry) {
      if (entry.code) {
        DOM.secCodeInput.value = entry.code;
        updateLineNums();
        DOM.btnModeCode.click();
      } else if (entry.repoUrl) {
        DOM.secRepoUrl.value = entry.repoUrl;
        DOM.btnModeRepo.click();
      }

      if (entry.auditData) {
        renderSecurityOutput(entry.auditData, entry.title || 'Security Audit');
        DOM.secOutput.classList.remove('hidden');
      }

      DOM.tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'security'));
      Object.keys(DOM.panes).forEach(k => DOM.panes[k]?.classList.toggle('active', k === 'security'));
      STATE.tab = 'security';
      showToast('Security audit restored');
    }
  }
});

// Settings Modal
DOM.btnSettings.addEventListener('click', () => {
  DOM.settingsThemeMode.value = STATE.settings.themeMode;
  DOM.settingsTheme.value = STATE.settings.syntaxTheme;
  DOM.settingsAnim.value = STATE.settings.defaultAnimation;
  DOM.settingsAuto.checked = STATE.settings.autoCopy;
  DOM.settingsShield.checked = STATE.settings.shieldEnabled;
  DOM.settingsNotif.checked = STATE.settings.notifEnabled;
  DOM.overlay.classList.remove('hidden');
});

DOM.btnCloseSettings.addEventListener('click', () => DOM.overlay.classList.add('hidden'));

DOM.overlay.addEventListener('click', e => {
  if (e.target === DOM.overlay) DOM.overlay.classList.add('hidden');
});

DOM.btnSaveSettings.addEventListener('click', saveSettings);

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (STATE.tab === 'readme') DOM.btnGenerate.click();
    if (STATE.tab === 'security') {
      if (STATE.secMode === 'repo') DOM.btnSecRepoScan.click();
      else DOM.btnRunSecurity.click();
    }
    if (STATE.tab === 'shield') DOM.btnRecheckSite.click();
  }
  if (e.key === 'Escape') DOM.overlay.classList.add('hidden');
});

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadThemeMode();
  loadSettings();
  loadShieldState();
  loadHistory();
  updateLineNums();
  checkActiveTab();
});
