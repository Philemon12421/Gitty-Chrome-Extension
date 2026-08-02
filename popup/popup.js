// ============================================
// Gitty v2 — popup.js
// ============================================

const STATE = {
  tab: 'readme',
  lastReadme: '',
  settings: { themeMode: 'dark', syntaxTheme: 'dracula', defaultAnimation: 'typewriter', autoCopy: false },
  history: { readme: [], code: [] }
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const DOM = {
  tabBtns: $$('.tab-btn'),
  panes: { readme: $('#tab-readme'), explainer: $('#tab-explainer'), history: $('#tab-history') },

  // Theme
  btnThemeToggle:  $('#btn-theme-toggle'),

  // README
  githubImportUrl: $('#github-import-url'),
  btnGithubImport: $('#btn-github-import'),
  projectName:     $('#project-name'),
  projectTagline:  $('#project-tagline'),
  projectDesc:     $('#project-desc'),
  projectLang:     $('#project-lang'),
  projectLicense:  $('#project-license'),
  projectBadge:    $('#project-badge-style'),
  projectFeatures: $('#project-features'),
  projectInstall:  $('#project-install'),
  projectGithub:   $('#project-github'),
  animRadios:      $$('input[name="anim"]'),
  btnGenerate:     $('#btn-generate-readme'),
  btnCopy:         $('#btn-copy-readme'),
  btnSave:         $('#btn-save-readme'),
  previewWrap:     $('#readme-preview-wrap'),
  preview:         $('#readme-preview'),
  btnToggleAnim:   $('#btn-toggle-anim'),

  // Explainer
  codeLang:        $('#code-language'),
  explainDepth:    $('#explain-depth'),
  syntaxTheme:     $('#syntax-theme'),
  codeInput:       $('#code-input'),
  lineNums:        $('#line-nums'),
  btnExplain:      $('#btn-explain-code'),
  btnClearCode:    $('#btn-clear-code'),
  expOutput:       $('#explanation-output'),
  expBody:         $('#explanation-body'),
  btnCopyExp:      $('#btn-copy-explanation'),

  // History
  histReadme:      $('#history-readme'),
  histCode:        $('#history-code'),
  histEmpty:       $('#history-empty'),
  histBtns:        $$('.hist-btn'),
  btnClearHist:    $('#btn-clear-history'),

  // Settings
  overlay:         $('#settings-overlay'),
  btnSettings:     $('#btn-settings'),
  btnCloseSettings:$('#btn-close-settings'),
  settingsThemeMode:$('#settings-theme-mode'),
  settingsTheme:   $('#settings-syntax-theme'),
  settingsAnim:    $('#settings-animation'),
  settingsAuto:    $('#settings-auto-copy'),
  btnSaveSettings: $('#btn-save-settings'),

  toast:           $('#toast'),
};

// ============================================
// THEMES (syntax highlighting palettes)
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
  swift: ['func','var','let','return','if','else','guard','for','while','repeat','switch','case','break','continue','class','struct','enum','protocol','extension','import','init','public','private','static','override','async','await','true','false','nil','self'],
  kotlin: ['fun','val','var','return','if','else','when','for','while','do','break','continue','class','data','object','companion','interface','enum','sealed','open','abstract','override','private','protected','public','import','package','suspend','true','false','null','this'],
  sql: ['SELECT','FROM','WHERE','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','ALTER','DROP','JOIN','LEFT','RIGHT','INNER','ON','AND','OR','NOT','IN','LIKE','IS','NULL','AS','ORDER','BY','GROUP','HAVING','LIMIT','UNION','ALL','DISTINCT','COUNT','SUM','AVG','MIN','MAX','CASE','WHEN','THEN','ELSE','END'],
  bash: ['echo','export','source','if','then','else','elif','fi','for','while','do','done','case','esac','function','return','exit','local','read','set','cd','ls','rm','mv','cp','mkdir','chmod','grep','sed','awk','cat'],
  html: ['html','head','body','div','span','p','a','img','ul','ol','li','table','tr','td','th','form','input','button','select','option','textarea','h1','h2','h3','header','footer','section','article','nav','main','script','style','link','meta'],
  css: ['color','background','margin','padding','border','font','display','position','width','height','flex','grid','align','justify','transform','transition','animation','opacity','overflow','shadow'],
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
// GITHUB API IMPORT
// ============================================

function parseGithubUrl(raw) {
  const s = raw.trim();
  // supports full URLs and bare "owner/repo"
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
    if (res.status === 403) throw new Error('Rate limited by GitHub — try again shortly');
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

// ============================================
// README GENERATOR
// ============================================

function generateReadme() {
  const name    = DOM.projectName.value.trim()     || 'my-project';
  const tagline = DOM.projectTagline.value.trim()  || 'A powerful project built with passion.';
  const desc    = DOM.projectDesc.value.trim()     || 'An amazing project that solves real-world problems.';
  const lang    = DOM.projectLang.value.trim()     || 'TypeScript';
  const license = DOM.projectLicense.value;
  const bs      = DOM.projectBadge.value;
  const feats   = DOM.projectFeatures.value.trim().split('\n').filter(Boolean);
  const steps   = DOM.projectInstall.value.trim().split('\n').filter(Boolean);
  const github  = DOM.projectGithub.value.trim()  || 'your-username';
  const anim    = [...DOM.animRadios].find(r => r.checked)?.value || 'typewriter';

  const langColors = { Python:'3776AB',Rust:'DEA584',TypeScript:'3178C6',JavaScript:'F7DF1E',Go:'00ADD8',Java:'ED8B00',Swift:'FA7343',Kotlin:'7F52FF',Ruby:'CC342D',PHP:'777BB4',Solidity:'363636' };
  const licColors  = { MIT:'22c55e','Apache-2.0':'3b82f6','GPL-3.0':'f97316','BSD-3':'8b5cf6',Unlicense:'6b7280' };

  const lBadge = license !== 'custom' ? `![License](https://img.shields.io/badge/license-${encodeURIComponent(license)}-${licColors[license]||'lightgrey'}?style=${bs})` : '';
  const gBadge = lang ? `![Language](https://img.shields.io/badge/language-${encodeURIComponent(lang)}-${langColors[lang]||'0ea5e9'}?style=${bs})` : '';

  const featMd  = feats.length ? feats.map(f=>`- ${f}`).join('\n') : `- ⚡ Blazing fast\n- 🔒 Secure by design\n- 🎨 Beautiful UI`;
  const instMd  = steps.length ? '```bash\n'+steps.join('\n')+'\n```' : `\`\`\`bash\ngit clone https://github.com/${github}/${name}.git\ncd ${name}\nnpm install\nnpm run dev\n\`\`\``;

  const readme = `# ${name}

> ${tagline}

${gBadge} ${lBadge} ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=${bs}) ![Stars](https://img.shields.io/github/stars/${github}/${name}?style=${bs})

---

## 📖 About

${desc}

---

## ✨ Features

${featMd}

---

## 🚀 Getting Started

${instMd}

---

## 📖 Usage

\`\`\`${lang.toLowerCase()}
// Example usage
\`\`\`

---

## 🤝 Contributing

1. Fork the project
2. Create your branch (\`git checkout -b feature/amazing\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing\`)
5. Open a Pull Request

---

## 📄 License

${license === 'custom' ? 'Custom license — see [LICENSE](./LICENSE) for details.' : `Licensed under the **${license} License**. See [LICENSE](./LICENSE) for details.`}

---

<p align="center">Made with ❤️ by <a href="https://github.com/${github}">@${github}</a></p>
`;

  STATE.lastReadme = readme;
  return { readme, anim };
}

function md2html(md) {
  let h = md;
  // fenced code
  h = h.replace(/```(\w*)\n([\s\S]*?)```/g, (_, l, code) =>
    `<pre><code>${hlCode(code.trim(), l||'javascript', STATE.settings.syntaxTheme)}</code></pre>`);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  // images (inline badges)
  h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
    src.includes('shields.io')||src.includes('badge')
      ? `<img src="${src}" alt="${alt}" style="display:inline;margin:1px;vertical-align:middle"/>`
      : `<img src="${src}" alt="${alt}"/>`);
  // links
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

// ============================================
// CODE EXPLAINER
// ============================================

function explainCode() {
  const code  = DOM.codeInput.value;
  const lang  = DOM.codeLang.value;
  const depth = DOM.explainDepth.value;
  const lname = DOM.codeLang.options[DOM.codeLang.selectedIndex].text;

  if (!code.trim()) { showToast('Paste some code first', 'err'); return; }

  const html = buildExplanation(code, lang, lname, depth);
  DOM.expBody.innerHTML = html;
  DOM.expOutput.classList.remove('hidden');

  saveHistory('code', {
    lang: lname,
    code,
    preview: code.substring(0,60) + (code.length>60 ? '…':''),
    timestamp: new Date().toLocaleString()
  });

  setTimeout(() => DOM.expOutput.scrollIntoView({ behavior:'smooth', block:'nearest' }), 80);
}

function buildExplanation(code, lang, lname, depth) {
  const lines = code.split('\n');
  const A = analyzeCode(code, lang, lname, lines.length);
  const det = depth !== 'simple';
  const adv = depth === 'advanced';
  const parts = [];

  parts.push(`<div class="sec-head">📋 Overview</div>`);
  parts.push(`
    <div class="overview-card">
      <div class="ov-text">${A.overview}</div>
      <div class="chips">
        <span class="chip chip-c">Complexity: ${A.complexity}</span>
        <span class="chip chip-l">${lines.length} lines</span>
        <span class="chip chip-g">${lname}</span>
      </div>
    </div>
  `);

  if (A.structure) {
    parts.push(`<div class="sec-head">🏗️ Structure</div>`);
    parts.push(`<div class="overview-card"><div class="ov-text">${A.structure}</div></div>`);
  }

  parts.push(`<div class="sec-head">🔍 Line Breakdown</div>`);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    const ln = i + 1;
    if (!t) {
      parts.push(`<div class="code-line"><span class="cl-num">${ln}</span><span class="cl-code">&nbsp;</span><span class="cl-exp"></span></div>`);
      continue;
    }
    const hl = hlCode(raw, lang, STATE.settings.syntaxTheme);
    const ex = explainLine(t, lang, depth);
    parts.push(`<div class="code-line"><span class="cl-num">${ln}</span><span class="cl-code">${hl}</span><span class="cl-exp">${ex}</span></div>`);
  }

  if (A.concepts.length) {
    parts.push(`<div class="sec-head">💡 Key Concepts</div>`);
    A.concepts.forEach(c => parts.push(`<div class="concept-card"><div class="c-name">${c.name}</div><div class="c-desc">${c.desc}</div></div>`));
  }

  if (adv && A.suggestions.length) {
    parts.push(`<div class="sec-head">🔧 Suggestions</div>`);
    A.suggestions.forEach(s => parts.push(`<div class="suggestion"><span>⚠</span><span>${s}</span></div>`));
  }

  return parts.join('');
}

function analyzeCode(code, lang, lname, n) {
  const has = r => r.test(code);
  const hasClass = has(/\bclass\s+\w+/);
  const hasFunc  = has(/\b(function|def|fn|func|fun)\s+\w+/);
  const hasAsync = has(/\b(async|await|defer|\.then)\b/);
  const hasLoop  = has(/\b(for|while|each|loop)\b/);
  const hasCond  = has(/\b(if|else|switch|match)\b/);
  const hasImport= has(/\b(import|require|use|include|from)\b/);
  const hasError = has(/\b(try|catch|except|throw|revert|rescue)\b/);
  const hasArrow = has(/=>/);
  const hasProm  = has(/\bPromise\b|\.then\(|async/);

  const patterns = [];
  if (hasClass) patterns.push('Object-Oriented');
  if (hasFunc)  patterns.push('Function-Based');
  if (hasAsync) patterns.push('Asynchronous');
  if (hasLoop)  patterns.push('Iterative');
  if (hasCond)  patterns.push('Conditional');
  if (hasImport)patterns.push('Modular');
  if (hasError) patterns.push('Error-Handling');
  const ps = patterns.length ? patterns.join(', ') : 'Procedural';

  let complexity, overview;
  if      (n <= 10)  { complexity='Low';         overview=`Concise ${lname} snippet (${n} lines) using ${ps.toLowerCase()} patterns.`; }
  else if (n <= 30)  { complexity='Low–Medium';  overview=`Moderate ${lname} code (${n} lines) combining ${ps.toLowerCase()} patterns.`; }
  else if (n <= 80)  { complexity='Medium';      overview=`Structured ${lname} module (${n} lines) demonstrating ${ps.toLowerCase()} architecture.`; }
  else               { complexity='Medium–High'; overview=`Substantial ${lname} codebase (${n} lines) following ${ps.toLowerCase()} paradigms.`; }

  let structure = '';
  if (hasClass) {
    const m = code.match(/class\s+(\w+)/);
    const methods = (code.match(/\b(function|def|fn|func)\s+\w+/g)||[]).length;
    structure = `Defines class <strong>${m?m[1]:'ClassName'}</strong> with ${methods||'0'} method${methods!==1?'s':''}.`;
  } else if (hasFunc) {
    const count = (code.match(/\b(function|def|fn|func|fun)\s+\w+/g)||[]).length;
    structure = `Contains ${count} function${count!==1?'s':''} with ${hasCond?'conditional logic':'sequential execution'}.`;
  }

  const concepts = [];
  if (hasAsync) concepts.push({ name:'Asynchronous Execution', desc:'Uses async/await for non-blocking operations, allowing the program to continue while waiting for I/O or network responses.' });
  if (hasClass) concepts.push({ name:'Object-Oriented Design', desc:'Classes encapsulate data and behaviour, promoting code reuse, modularity, and clear separation of concerns.' });
  if (hasArrow) concepts.push({ name:'Arrow Functions / Lambdas', desc:'Concise function syntax with lexical `this` binding. Commonly used for callbacks and functional programming patterns.' });
  if (hasError) concepts.push({ name:'Error Handling', desc:'Try/catch blocks manage runtime exceptions gracefully, preventing crashes and enabling recovery paths.' });
  if (hasProm)  concepts.push({ name:'Promise Pattern', desc:'Promises represent values available now, later, or never — providing a clean API for async operations.' });

  const suggestions = [];
  if (n > 50 && !hasClass && !hasFunc) suggestions.push('Consider breaking this into named functions or classes for readability.');
  if (!hasError && (hasAsync||hasProm)) suggestions.push('Add try/catch around async operations to handle rejections.');
  if (code.includes('var ')) suggestions.push('Replace `var` with `const` or `let` to avoid hoisting bugs.');

  return { complexity, overview, structure, concepts, suggestions };
}

function explainLine(t, lang, depth) {
  const d = depth !== 'simple';

  if (!t) return '';
  if (/^(\/\/|#|--|\/\*|\*)/.test(t)) {
    const txt = t.replace(/^(\/\/|#|--|\/\*|\*\/?)\s*/,'');
    return txt ? (d ? `💬 Comment: <em>${txt}</em>` : txt) : '💬 Separator';
  }
  if (/^(import|require|use|include|#include|from)\b/.test(t)) {
    const m = t.match(/['"]([^'"]+)['"]/) || t.match(/\b(\w[\w/]+)\s*$/) || [];
    return d ? `📦 Imports <strong>${m[1]||'module'}</strong>` : `📦 ${m[1]||'import'}`;
  }
  if (/\b(async\s+)?(function|def|fn|func|fun)\s+\w+/.test(t) || /^\s*(const|let)\s+\w+\s*=\s*(async\s*)?\(/.test(t)) {
    const m = t.match(/(function|def|fn|func|fun)\s+(\w+)/) || t.match(/(?:const|let)\s+(\w+)/);
    const name = m ? (m[2]||m[1]) : 'fn';
    const params = (t.match(/\(([^)]*)\)/)||[])[1]||'';
    const isAsync = /async/.test(t);
    return d ? `🔧 Defines${isAsync?' async':''} function <strong>${name}(${params})</strong>` : `🔧 fn: ${name}`;
  }
  if (/\b(export\s+)?(abstract\s+)?class\s+\w+/.test(t)) {
    const m = t.match(/class\s+(\w+)/);
    const ext = (t.match(/extends\s+(\w+)/)||[])[1];
    return d ? `📐 Class <strong>${m?m[1]:'Class'}</strong>${ext?` extends <strong>${ext}</strong>`:''}` : `📐 class: ${m?m[1]:''}`;
  }
  if (/^\s*(if|elsif|elif|else|switch|when)\b/.test(t)) {
    if (/^\s*else\s*[{$]/.test(t)) return d ? '🔀 Else — fallback branch.' : '🔀 else';
    if (/else\s+if|elsif|elif/.test(t)) return d ? `🔀 Else-if condition` : '🔀 else-if';
    const cond = t.replace(/^\s*(if|when|switch)\s*/,'').replace(/[:{]\s*$/,'').trim();
    return d ? `🔀 If <strong>${cond.substring(0,40)}</strong>` : `🔀 if: ${cond.substring(0,30)}`;
  }
  if (/^\s*(for|while|loop|foreach|each)\b/.test(t)) {
    const type = (t.match(/^\s*(for|while|loop|foreach|each)\b/)||[])[1];
    return d ? `🔄 <strong>${type}</strong> loop — iterates over a collection.` : `🔄 ${type}`;
  }
  if (/^\s*return\b/.test(t)) {
    const val = t.replace(/^\s*return\s*/,'').replace(/;?\s*$/,'').trim();
    return d ? `↩️ Returns${val?` <strong>${val.substring(0,40)}</strong>`:''}` : `↩️ return`;
  }
  if (/^\s*try\b/.test(t))     return d ? '🛡️ Try block — wrap risky code.' : '🛡️ try';
  if (/^\s*(catch|except|rescue)\b/.test(t)) {
    const err = ((t.match(/(?:catch|except|rescue)\s*[\(:]?\s*(\w+)/)||[])[1])||'error';
    return d ? `🛡️ Catches <strong>${err}</strong>` : `🛡️ catch`;
  }
  if (/^\s*finally\b/.test(t)) return d ? '🛡️ Finally — cleanup block.' : '🛡️ finally';
  if (/^\s*(throw|revert|raise)\b/.test(t)) {
    return d ? `⚠️ Throws error` : '⚠️ throw';
  }
  if (/^\s*(const|let|var|val|let\s+mut)\s+\w+\s*=/.test(t)) {
    const m = t.match(/^\s*(const|let|var|val|let\s+mut)\s+(\w+)\s*=\s*(.+)/);
    if (m) {
      const [,kw,name,val] = m;
      const lbl = {const:'Constant',let:'Variable',var:'Variable',val:'Immutable','let mut':'Mutable'}[kw]||'Var';
      const clean = val.replace(/;?$/,'').trim();
      return d ? `📝 <strong>${lbl} ${name}</strong> = ${clean.substring(0,35)}${clean.length>35?'…':''}` : `📝 ${lbl}: ${name}`;
    }
  }
  if (/^\s*await\b/.test(t)) {
    const expr = t.replace(/^\s*await\s*/,'').replace(/;?$/,'').trim();
    return d ? `⏳ Awaits <strong>${expr.substring(0,40)}</strong>` : '⏳ await';
  }
  return d ? `⚙️ <em>${t.substring(0,55)}${t.length>55?'…':''}</em>` : '';
}

// ============================================
// HISTORY
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
  chrome.storage.local.get(['gitty_readme_history','gitty_code_history'], res => {
    STATE.history.readme = res.gitty_readme_history || [];
    STATE.history.code   = res.gitty_code_history   || [];
    renderHistory();
  });
}

function renderHistory() {
  const rh = STATE.history.readme;
  const ch = STATE.history.code;

  DOM.histReadme.innerHTML = rh.map((it,i) => `
    <div class="hist-item" data-type="readme" data-i="${i}">
      <span class="hist-icon">📝</span>
      <div class="hist-content">
        <div class="hist-title">${it.project||'Untitled README'}</div>
        <div class="hist-meta">${it.timestamp}${it.lang?' · '+it.lang:''}</div>
      </div>
      <span class="hist-arrow">›</span>
    </div>
  `).join('');

  DOM.histCode.innerHTML = ch.map((it,i) => `
    <div class="hist-item" data-type="code" data-i="${i}">
      <span class="hist-icon">💡</span>
      <div class="hist-content">
        <div class="hist-title">${it.lang||'Code'} explanation</div>
        <div class="hist-meta">${it.timestamp} · ${it.preview}</div>
      </div>
      <span class="hist-arrow">›</span>
    </div>
  `).join('');

  const empty = rh.length === 0 && ch.length === 0;
  DOM.histEmpty.classList.toggle('show', empty);
}

// ============================================
// UTILITIES
// ============================================

function saveFile(content, name, ext) {
  const blob = new Blob([content], { type:'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${name}.${ext}`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Copied!', 'ok'))
      .catch(() => fbCopy(text));
  } else { fbCopy(text); }
}

function fbCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('Copied!', 'ok');
}

function showToast(msg, type='', ms=2200) {
  const t = DOM.toast;
  t.textContent = msg;
  t.className = `toast${type?' '+type:''}`;
  t.classList.remove('hidden');
  clearTimeout(t._t);
  t._t = setTimeout(() => {
    t.style.opacity='0'; t.style.transition='opacity .2s';
    setTimeout(() => { t.classList.add('hidden'); t.style.opacity=''; t.style.transition=''; }, 200);
  }, ms);
}

function updateLineNums() {
  const n = DOM.codeInput.value.split('\n').length;
  DOM.lineNums.textContent = Array.from({length:n},(_,i)=>i+1).join('\n');
}

// ============================================
// SETTINGS
// ============================================

function loadSettings() {
  chrome.storage.local.get(['gitty_syntax_theme','gitty_animation','gitty_auto_copy'], res => {
    STATE.settings.syntaxTheme       = res.gitty_syntax_theme  || 'dracula';
    STATE.settings.defaultAnimation  = res.gitty_animation     || 'typewriter';
    STATE.settings.autoCopy          = res.gitty_auto_copy     || false;

    DOM.syntaxTheme.value     = STATE.settings.syntaxTheme;
    DOM.settingsTheme.value   = STATE.settings.syntaxTheme;
    DOM.settingsAnim.value    = STATE.settings.defaultAnimation;
    DOM.settingsAuto.checked  = STATE.settings.autoCopy;
    [...DOM.animRadios].forEach(r => { r.checked = r.value === STATE.settings.defaultAnimation; });
  });
}

function saveSettings() {
  const themeMode = DOM.settingsThemeMode.value;
  const theme = DOM.settingsTheme.value;
  const anim  = DOM.settingsAnim.value;
  const auto  = DOM.settingsAuto.checked;
  chrome.storage.local.set({ gitty_theme_mode:themeMode, gitty_syntax_theme:theme, gitty_animation:anim, gitty_auto_copy:auto }, () => {
    STATE.settings.themeMode = themeMode;
    STATE.settings.syntaxTheme = theme;
    STATE.settings.defaultAnimation = anim;
    STATE.settings.autoCopy = auto;
    applyThemeMode(themeMode);
    DOM.syntaxTheme.value = theme;
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

// Tab nav
DOM.tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    DOM.tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.keys(DOM.panes).forEach(k => DOM.panes[k].classList.toggle('active', k === tab));
    STATE.tab = tab;
    if (tab === 'history') renderHistory();
  });
});

// GitHub import
DOM.btnGithubImport.addEventListener('click', importFromGithub);
DOM.githubImportUrl.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); importFromGithub(); }
});

// Generate README
DOM.btnGenerate.addEventListener('click', () => {
  const { readme, anim } = generateReadme();
  DOM.preview.innerHTML = md2html(readme);
  DOM.preview.className = `output-box-body md-render anim-${anim}`;
  DOM.previewWrap.classList.remove('hidden');
  DOM.btnCopy.disabled = false;
  DOM.btnSave.disabled = false;

  saveHistory('readme', {
    project: DOM.projectName.value.trim() || 'Untitled',
    lang: DOM.projectLang.value.trim(),
    timestamp: new Date().toLocaleString(),
    content: readme
  });

  if (STATE.settings.autoCopy) copyText(readme);
  showToast('README generated!', 'ok');
  setTimeout(() => DOM.previewWrap.scrollIntoView({ behavior:'smooth', block:'nearest' }), 80);
});

DOM.btnCopy.addEventListener('click', () => { if (STATE.lastReadme) copyText(STATE.lastReadme); });
DOM.btnSave.addEventListener('click', () => {
  saveFile(STATE.lastReadme, DOM.projectName.value.trim()||'README', 'md');
  showToast('Saved!', 'ok');
});

// Toggle anim
let animPaused = false;
DOM.btnToggleAnim.addEventListener('click', () => {
  animPaused = !animPaused;
  DOM.preview.style.animationPlayState = animPaused ? 'paused' : 'running';
  DOM.btnToggleAnim.innerHTML = animPaused
    ? '<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1.5" y="1" width="3" height="9" rx="1" fill="currentColor"/><rect x="6.5" y="1" width="3" height="9" rx="1" fill="currentColor"/></svg>'
    : '<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 1.5L9.5 5.5L2 9.5V1.5Z" fill="currentColor"/></svg>';
});

// Explain
DOM.btnExplain.addEventListener('click', explainCode);

// Clear code
DOM.btnClearCode.addEventListener('click', () => {
  DOM.codeInput.value = '';
  DOM.expOutput.classList.add('hidden');
  updateLineNums();
});

// Copy explanation
DOM.btnCopyExp.addEventListener('click', () => copyText(DOM.expBody.innerText));

// Line numbers
DOM.codeInput.addEventListener('input', updateLineNums);
DOM.codeInput.addEventListener('scroll', () => {
  DOM.lineNums.style.transform = `translateY(-${DOM.codeInput.scrollTop}px)`;
});
DOM.codeInput.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = DOM.codeInput.selectionStart, en = DOM.codeInput.selectionEnd;
    DOM.codeInput.value = DOM.codeInput.value.substring(0,s) + '  ' + DOM.codeInput.value.substring(en);
    DOM.codeInput.selectionStart = DOM.codeInput.selectionEnd = s + 2;
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
    DOM.histCode.classList.toggle('active', type === 'code');
  });
});

// Clear history
DOM.btnClearHist.addEventListener('click', () => {
  chrome.storage.local.set({ gitty_readme_history:[], gitty_code_history:[] }, () => {
    STATE.history.readme = []; STATE.history.code = [];
    renderHistory();
    showToast('History cleared');
  });
});

// History item click
document.addEventListener('click', e => {
  const item = e.target.closest('.hist-item');
  if (!item) return;
  const type = item.dataset.type;
  const idx  = parseInt(item.dataset.i);

  if (type === 'readme') {
    const entry = STATE.history.readme[idx];
    if (entry?.content) {
      STATE.lastReadme = entry.content;
      DOM.preview.innerHTML = md2html(entry.content);
      DOM.preview.className = `output-box-body md-render anim-${STATE.settings.defaultAnimation}`;
      DOM.previewWrap.classList.remove('hidden');
      DOM.btnCopy.disabled = false; DOM.btnSave.disabled = false;
      DOM.tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'readme'));
      Object.keys(DOM.panes).forEach(k => DOM.panes[k].classList.toggle('active', k === 'readme'));
      STATE.tab = 'readme';
      showToast('README restored');
    }
  } else {
    const entry = STATE.history.code[idx];
    if (entry?.code) {
      DOM.codeInput.value = entry.code;
      updateLineNums();
      DOM.tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'explainer'));
      Object.keys(DOM.panes).forEach(k => DOM.panes[k].classList.toggle('active', k === 'explainer'));
      STATE.tab = 'explainer';
      showToast('Code restored');
    }
  }
});

// Settings
DOM.btnSettings.addEventListener('click', () => {
  DOM.settingsThemeMode.value = STATE.settings.themeMode;
  DOM.settingsTheme.value = STATE.settings.syntaxTheme;
  DOM.settingsAnim.value  = STATE.settings.defaultAnimation;
  DOM.settingsAuto.checked= STATE.settings.autoCopy;
  DOM.overlay.classList.remove('hidden');
});

DOM.btnCloseSettings.addEventListener('click', () => DOM.overlay.classList.add('hidden'));

DOM.overlay.addEventListener('click', e => {
  if (e.target === DOM.overlay) DOM.overlay.classList.add('hidden');
});

DOM.btnSaveSettings.addEventListener('click', saveSettings);

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (STATE.tab === 'readme')    DOM.btnGenerate.click();
    if (STATE.tab === 'explainer') DOM.btnExplain.click();
  }
  if (e.key === 'Escape') DOM.overlay.classList.add('hidden');
});

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadThemeMode();
  loadSettings();
  loadHistory();
  updateLineNums();
});
