// ============================================
// Gitty v2 — Main Application Logic
// ============================================

const STATE = {
  currentTab: 'readme',
  lastReadme: '',
  lastExplanation: '',
  settings: {
    syntaxTheme: 'tokyo-night',
    defaultAnimation: 'typewriter',
    autoCopy: false
  },
  history: { readme: [], code: [] }
};

// ============================================
// DOM
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const DOM = {
  // Nav
  navItems: $$('.nav-item'),
  tabPanes: { readme: $('#tab-readme'), explainer: $('#tab-explainer'), history: $('#tab-history') },

  // README
  projectName: $('#project-name'),
  projectTagline: $('#project-tagline'),
  projectDesc: $('#project-desc'),
  projectLang: $('#project-lang'),
  projectLicense: $('#project-license'),
  projectBadgeStyle: $('#project-badge-style'),
  projectFeatures: $('#project-features'),
  projectInstall: $('#project-install'),
  projectGithub: $('#project-github'),
  animRadios: $$('input[name="anim-style"]'),
  btnGenerate: $('#btn-generate-readme'),
  btnCopy: $('#btn-copy-readme'),
  btnSave: $('#btn-save-readme'),
  previewContainer: $('#readme-preview-container'),
  preview: $('#readme-preview'),
  btnToggleAnim: $('#btn-toggle-preview-anim'),

  // Explainer
  codeLanguage: $('#code-language'),
  explainDepth: $('#explain-depth'),
  syntaxTheme: $('#syntax-theme'),
  codeInput: $('#code-input'),
  lineNumbers: $('#line-numbers'),
  btnExplain: $('#btn-explain-code'),
  btnClearCode: $('#btn-clear-code'),
  explanationOutput: $('#explanation-output'),
  explanationBody: $('#explanation-body'),
  btnCopyExplanation: $('#btn-copy-explanation'),

  // History
  histReadme: $('#history-readme'),
  histCode: $('#history-code'),
  histEmpty: $('#history-empty'),
  histSegBtns: $$('.hist-seg-btn'),
  btnClearHistory: $('#btn-clear-history'),

  // Settings
  settingsOverlay: $('#settings-overlay'),
  btnSettings: $('#btn-settings'),
  btnCloseSettings: $('#btn-close-settings'),
  settingsSyntaxTheme: $('#settings-syntax-theme'),
  settingsAnimation: $('#settings-animation'),
  settingsAutoCopy: $('#settings-auto-copy'),
  btnSaveSettings: $('#btn-save-settings'),

  // Toast
  toast: $('#toast')
};

// ============================================
// SYNTAX HIGHLIGHT THEMES
// ============================================
const THEMES = {
  'tokyo-night': {
    keyword: '#bb9af7', string: '#9ece6a', number: '#ff9e64',
    comment: '#565f89', func: '#7dcfff', type: '#2ac3de',
    operator: '#89ddff', variable: '#c0caf5', bg: '#1a1b26', text: '#c0caf5'
  },
  dracula: {
    keyword: '#ff79c6', string: '#f1fa8c', number: '#bd93f9',
    comment: '#6272a4', func: '#50fa7b', type: '#8be9fd',
    operator: '#ff79c6', variable: '#f8f8f2', bg: '#282a36', text: '#f8f8f2'
  },
  nord: {
    keyword: '#81a1c1', string: '#a3be8c', number: '#b48ead',
    comment: '#4c566a', func: '#88c0d0', type: '#8fbcbb',
    operator: '#81a1c1', variable: '#d8dee9', bg: '#2e3440', text: '#d8dee9'
  },
  monokai: {
    keyword: '#f92672', string: '#e6db74', number: '#ae81ff',
    comment: '#75715e', func: '#a6e22e', type: '#66d9ef',
    operator: '#f92672', variable: '#f8f8f2', bg: '#272822', text: '#f8f8f2'
  },
  'github-dark': {
    keyword: '#ff7b72', string: '#a5d6ff', number: '#79c0ff',
    comment: '#8b949e', func: '#d2a8ff', type: '#ffa657',
    operator: '#ff7b72', variable: '#e6edf3', bg: '#0d1117', text: '#e6edf3'
  },
  'one-dark': {
    keyword: '#c678dd', string: '#98c379', number: '#d19a66',
    comment: '#5c6370', func: '#61afef', type: '#e5c07b',
    operator: '#c678dd', variable: '#abb2bf', bg: '#1e2127', text: '#abb2bf'
  }
};

const KEYWORDS = {
  javascript: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','new','this','class','extends','import','export','default','from','async','await','try','catch','throw','typeof','instanceof','in','of','yield','static','get','set','null','undefined','true','false'],
  typescript: ['const','let','var','function','return','if','else','for','while','interface','type','enum','class','extends','implements','import','export','default','from','async','await','try','catch','throw','public','private','protected','readonly','static','abstract','as','is','keyof','typeof','never','unknown','any','string','number','boolean','void','null','undefined'],
  python: ['def','return','if','elif','else','for','while','in','not','and','or','is','None','True','False','class','import','from','as','try','except','finally','raise','with','pass','break','continue','lambda','yield','async','await','self','global','nonlocal'],
  rust: ['fn','let','mut','return','if','else','match','for','while','loop','in','struct','enum','impl','trait','use','mod','pub','crate','self','super','where','as','async','await','unsafe','ref','move','dyn','type','const','static','true','false','Some','None','Ok','Err'],
  go: ['func','return','if','else','for','range','switch','case','default','break','continue','go','defer','select','chan','map','struct','interface','type','package','import','var','const','true','false','nil','make','new','append','len','cap','error'],
  java: ['public','private','protected','static','final','class','interface','extends','implements','return','if','else','for','while','do','switch','case','break','continue','new','this','super','try','catch','finally','throw','throws','import','package','void','int','boolean','String','null','true','false'],
  cpp: ['int','float','double','char','void','bool','auto','const','static','class','struct','enum','union','public','private','protected','virtual','override','return','if','else','for','while','do','switch','case','break','continue','new','delete','this','namespace','using','template','typename','true','false','nullptr'],
  csharp: ['public','private','protected','internal','static','readonly','virtual','override','abstract','sealed','async','await','class','struct','interface','enum','namespace','using','return','if','else','for','foreach','while','do','switch','case','break','continue','new','this','base','try','catch','finally','throw','var','true','false','null','string','int','bool'],
  ruby: ['def','end','return','if','elsif','else','unless','for','while','until','do','each','map','select','class','module','require','include','extend','attr_reader','attr_writer','attr_accessor','private','protected','public','self','true','false','nil'],
  php: ['function','return','if','else','elseif','for','foreach','while','switch','case','break','continue','class','interface','trait','extends','implements','abstract','final','public','private','protected','static','const','new','this','parent','self','try','catch','throw','namespace','use','require','include','echo','true','false','null','array'],
  swift: ['func','var','let','return','if','else','guard','for','while','repeat','switch','case','break','continue','class','struct','enum','protocol','extension','import','init','deinit','public','private','internal','fileprivate','static','override','throws','rethrows','async','await','true','false','nil','self','super'],
  kotlin: ['fun','val','var','return','if','else','when','for','while','do','break','continue','class','data','object','companion','interface','enum','sealed','open','abstract','override','private','protected','public','internal','import','package','suspend','init','constructor','true','false','null','this','super'],
  sql: ['SELECT','FROM','WHERE','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','ALTER','DROP','INDEX','JOIN','LEFT','RIGHT','INNER','OUTER','ON','AND','OR','NOT','IN','LIKE','BETWEEN','IS','NULL','AS','ORDER','BY','GROUP','HAVING','LIMIT','OFFSET','UNION','ALL','DISTINCT','COUNT','SUM','AVG','MIN','MAX','EXISTS','CASE','WHEN','THEN','ELSE','END','BEGIN','COMMIT','ROLLBACK'],
  bash: ['echo','export','source','if','then','else','elif','fi','for','while','do','done','case','esac','function','return','exit','local','read','set','unset','trap','exec','cd','ls','rm','mv','cp','mkdir','chmod','grep','sed','awk','cat'],
  html: ['html','head','body','div','span','p','a','img','ul','ol','li','table','tr','td','th','form','input','button','select','option','textarea','h1','h2','h3','h4','h5','h6','header','footer','section','article','nav','main','aside','script','style','link','meta','title'],
  css: ['color','background','margin','padding','border','font','display','position','width','height','top','left','right','bottom','flex','grid','align','justify','text','box','shadow','transform','transition','animation','opacity','overflow','z-index'],
  solidity: ['pragma','contract','interface','library','import','constructor','function','modifier','event','enum','struct','mapping','address','uint','int','bool','string','bytes','msg','tx','block','require','revert','assert','emit','public','private','internal','external','view','pure','payable','memory','storage','calldata','virtual','override','abstract','is','returns','return','if','else','for','while']
};

function syntaxHighlight(code, lang, themeName = 'tokyo-night') {
  const theme = THEMES[themeName] || THEMES['tokyo-night'];
  const kws = KEYWORDS[lang] || KEYWORDS.javascript;

  let out = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Strings
  out = out.replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, m =>
    `<span style="color:${theme.string}">${m}</span>`);

  // Comments
  out = out.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$|--.*$)/gm, m =>
    `<span style="color:${theme.comment};font-style:italic">${m}</span>`);

  // Numbers
  out = out.replace(/\b(\d+\.?\d*)\b/g, m =>
    `<span style="color:${theme.number}">${m}</span>`);

  // Keywords
  const kwRe = new RegExp(`\\b(${kws.join('|')})\\b`, 'g');
  out = out.replace(kwRe, m =>
    `<span style="color:${theme.keyword};font-weight:500">${m}</span>`);

  // Function calls
  out = out.replace(/\b([a-zA-Z_$][\w$]*)\s*\(/g, (m, fn) =>
    `<span style="color:${theme.func}">${fn}</span>(`);

  // PascalCase types
  out = out.replace(/\b([A-Z][a-z]\w*)\b/g, m =>
    `<span style="color:${theme.type}">${m}</span>`);

  return `<span style="color:${theme.text}">${out}</span>`;
}

// ============================================
// README GENERATOR
// ============================================

function generateReadme() {
  const name = DOM.projectName.value.trim() || 'my-project';
  const tagline = DOM.projectTagline.value.trim() || 'A powerful project built with passion.';
  const desc = DOM.projectDesc.value.trim() || 'An amazing project that solves real-world problems efficiently.';
  const lang = DOM.projectLang.value.trim() || 'TypeScript';
  const license = DOM.projectLicense.value;
  const badgeStyle = DOM.projectBadgeStyle.value;
  const features = DOM.projectFeatures.value.trim().split('\n').filter(Boolean);
  const installSteps = DOM.projectInstall.value.trim().split('\n').filter(Boolean);
  const github = DOM.projectGithub.value.trim() || 'your-username';
  const animStyle = [...DOM.animRadios].find(r => r.checked)?.value || 'typewriter';

  const badge = (label, msg, color) =>
    `![${label}](https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(msg)}-${color}?style=${badgeStyle})`;

  const langColors = {
    Python: '3776AB', Rust: 'DEA584', TypeScript: '3178C6', JavaScript: 'F7DF1E',
    Go: '00ADD8', Java: 'ED8B00', Swift: 'FA7343', Kotlin: '7F52FF',
    Ruby: 'CC342D', PHP: '777BB4', Solidity: '363636'
  };

  const licenseColor = { MIT: '22c55e', 'Apache-2.0': '3b82f6', 'GPL-3.0': 'f97316', 'BSD-3': '8b5cf6', Unlicense: '6b7280' };
  const licenseBadge = license !== 'custom'
    ? badge('license', license, licenseColor[license] || 'lightgrey')
    : '';

  const langColor = langColors[lang] || '0ea5e9';
  const langBadge = lang ? `![Language](https://img.shields.io/badge/language-${encodeURIComponent(lang)}-${langColor}?style=${badgeStyle})` : '';

  const featuresMd = features.length > 0
    ? features.map(f => `- ${f}`).join('\n')
    : `- ⚡ Blazing fast performance\n- 🔒 Secure by design\n- 🎨 Beautiful user experience`;

  const installMd = installSteps.length > 0
    ? '```bash\n' + installSteps.join('\n') + '\n```'
    : `\`\`\`bash\ngit clone https://github.com/${github}/${name}.git\ncd ${name}\nnpm install\nnpm run dev\n\`\`\``;

  const readme = `# ${name}

> ${tagline}

${langBadge} ${licenseBadge} ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=${badgeStyle}) ![Stars](https://img.shields.io/github/stars/${github}/${name}?style=${badgeStyle})

---

## 📖 About

${desc}

---

## ✨ Features

${featuresMd}

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the required tools installed before proceeding.

### Installation

${installMd}

---

## 📖 Usage

\`\`\`${lang.toLowerCase()}
// Example usage here
\`\`\`

---

## 🤝 Contributing

Contributions are always welcome!

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

---

## 📄 License

${license === 'custom'
    ? 'This project uses a custom license. See [LICENSE](./LICENSE) for details.'
    : `This project is licensed under the **${license} License** — see the [LICENSE](./LICENSE) file for details.`}

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/${github}">@${github}</a>
  <br/>
  <a href="https://github.com/${github}/${name}/issues">Report Bug</a> ·
  <a href="https://github.com/${github}/${name}/issues">Request Feature</a>
</p>
`;

  STATE.lastReadme = readme;
  return { readme, animStyle };
}

function renderMarkdown(md) {
  let html = md;

  // Fenced code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, l, code) => {
    const hl = syntaxHighlight(code.trim(), l || 'javascript', STATE.settings.syntaxTheme);
    return `<pre><code class="hl-block">${hl}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images (badge-style)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => {
    if (src.includes('shields.io') || src.includes('badge')) {
      return `<img src="${src}" alt="${alt}" style="display:inline-block;margin:1px;vertical-align:middle" />`;
    }
    return `<img src="${src}" alt="${alt}" />`;
  });

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Bold + italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // HR
  html = html.replace(/^---$/gm, '<hr />');

  // Lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);

  // Center align
  html = html.replace(/<p align="center">/g, '<p style="text-align:center">');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');

  return `<p>${html}</p>`;
}

// ============================================
// CODE EXPLAINER
// ============================================

function explainCode() {
  const code = DOM.codeInput.value;
  const lang = DOM.codeLanguage.value;
  const depth = DOM.explainDepth.value;
  const langName = DOM.codeLanguage.options[DOM.codeLanguage.selectedIndex].text;

  if (!code.trim()) {
    showToast('Paste some code first', 'error');
    return;
  }

  const html = buildExplanationHTML(code, lang, langName, depth);
  DOM.explanationBody.innerHTML = html;
  DOM.explanationOutput.classList.remove('hidden');
  STATE.lastExplanation = DOM.explanationBody.innerText;

  saveToHistory('code', {
    lang: langName,
    code,
    preview: code.substring(0, 60) + (code.length > 60 ? '…' : ''),
    timestamp: new Date().toLocaleString()
  });

  // Scroll into view
  setTimeout(() => {
    DOM.explanationOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function buildExplanationHTML(code, lang, langName, depth) {
  const lines = code.split('\n');
  const analysis = analyzeCode(code, lang, langName, lines.length);
  const detailed = depth !== 'simple';
  const advanced = depth === 'advanced';
  const theme = THEMES[STATE.settings.syntaxTheme] || THEMES['tokyo-night'];

  const parts = [];

  // Overview
  parts.push(`
    <div class="section-header">📋 Overview</div>
    <div class="overview-block">
      <div class="overview-text">${analysis.overview}</div>
      <div class="meta-chips">
        <span class="chip chip-complexity">Complexity: ${analysis.complexity}</span>
        <span class="chip chip-lines">${lines.length} lines</span>
        <span class="chip chip-lang">${langName}</span>
      </div>
    </div>
  `);

  // Structure
  if (analysis.structure) {
    parts.push(`
      <div class="section-header">🏗️ Structure</div>
      <div class="overview-block">
        <div class="overview-text">${analysis.structure}</div>
      </div>
    `);
  }

  // Line breakdown
  parts.push(`<div class="section-header">🔍 Line Breakdown</div>`);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const lineNum = i + 1;

    if (!trimmed) {
      parts.push(`<div class="code-line-row"><span class="ln">${lineNum}</span><span class="lc">&nbsp;</span><span class="le"></span></div>`);
      continue;
    }

    const hl = syntaxHighlight(raw, lang, STATE.settings.syntaxTheme);
    const explain = explainLine(trimmed, lang, depth);

    parts.push(`
      <div class="code-line-row">
        <span class="ln">${lineNum}</span>
        <span class="lc">${hl}</span>
        <span class="le">${explain}</span>
      </div>
    `);
  }

  // Key concepts
  if (analysis.concepts.length > 0) {
    parts.push(`<div class="section-header">💡 Key Concepts</div>`);
    for (const c of analysis.concepts) {
      parts.push(`
        <div class="concept-card">
          <div class="concept-name">${c.name}</div>
          <div class="concept-desc">${c.description}</div>
        </div>
      `);
    }
  }

  // Suggestions (advanced)
  if (advanced && analysis.suggestions.length > 0) {
    parts.push(`<div class="section-header">🔧 Suggestions</div>`);
    for (const s of analysis.suggestions) {
      parts.push(`<div class="suggestion-item"><span>⚠</span><span>${s}</span></div>`);
    }
  }

  return parts.join('');
}

function analyzeCode(code, lang, langName, lineCount) {
  const has = (re) => re.test(code);

  const hasClass = has(/\bclass\s+\w+/);
  const hasFunc = has(/\b(function|def|fn|func|fun)\s+\w+/);
  const hasAsync = has(/\b(async|await|defer|\.then|\.catch)\b/);
  const hasLoop = has(/\b(for|while|each|loop)\b/);
  const hasCond = has(/\b(if|else|switch|match|case)\b/);
  const hasImport = has(/\b(import|require|use|include|from|package)\b/);
  const hasError = has(/\b(try|catch|except|throw|revert|require|rescue)\b/);
  const hasArrow = has(/=>/);
  const hasPromise = has(/\bPromise\b|\.then\(|async/);

  const patterns = [];
  if (hasClass) patterns.push('Object-Oriented');
  if (hasFunc) patterns.push('Function-Based');
  if (hasAsync) patterns.push('Asynchronous');
  if (hasLoop) patterns.push('Iterative');
  if (hasCond) patterns.push('Conditional Logic');
  if (hasImport) patterns.push('Modular');
  if (hasError) patterns.push('Error-Handling');
  const patStr = patterns.length ? patterns.join(', ') : 'Procedural';

  let complexity, overview;
  if (lineCount <= 10) { complexity = 'Low'; overview = `A concise ${langName} snippet (${lineCount} lines) using ${patStr.toLowerCase()} patterns. Focused and easy to follow.`; }
  else if (lineCount <= 30) { complexity = 'Low–Medium'; overview = `A moderate ${langName} function or module (${lineCount} lines) combining ${patStr.toLowerCase()} patterns.`; }
  else if (lineCount <= 80) { complexity = 'Medium'; overview = `A structured ${langName} module (${lineCount} lines) demonstrating ${patStr.toLowerCase()} architecture across multiple operations.`; }
  else { complexity = 'Medium–High'; overview = `A substantial ${langName} codebase (${lineCount} lines) following ${patStr.toLowerCase()} paradigms with complex multi-concern logic.`; }

  let structure = '';
  if (hasClass) {
    const m = code.match(/class\s+(\w+)/);
    const cls = m ? m[1] : 'ClassName';
    const methods = (code.match(/\b(function|def|fn|func)\s+\w+/g) || []).length;
    structure = `Defines class <strong>${cls}</strong> with ${methods > 0 ? `${methods} method${methods > 1 ? 's' : ''}` : 'properties'}. ${hasImport ? 'External dependencies imported.' : ''}`;
  } else if (hasFunc) {
    const count = (code.match(/\b(function|def|fn|func|fun)\s+\w+/g) || []).length;
    structure = `Contains ${count} function${count > 1 ? 's' : ''} with ${hasImport ? 'imports and ' : ''}${hasCond ? 'conditional logic' : 'sequential execution'}.`;
  }

  const concepts = [];
  if (hasAsync) concepts.push({ name: 'Asynchronous Execution', description: 'Uses async/await (or promise chaining) for non-blocking operations, letting the program continue while waiting for I/O or network responses.' });
  if (hasClass) concepts.push({ name: 'Object-Oriented Design', description: 'Classes encapsulate data and behaviour together, promoting code reuse, modularity, and clear separation of concerns.' });
  if (hasArrow) concepts.push({ name: 'Arrow Functions / Lambdas', description: 'Concise function syntax with lexical `this` binding. Commonly used for callbacks, array transforms, and functional programming patterns.' });
  if (hasError) concepts.push({ name: 'Error Handling', description: 'Structured try/catch (or equivalent) blocks manage runtime exceptions gracefully, preventing crashes and enabling recovery paths.' });
  if (hasPromise) concepts.push({ name: 'Promise Pattern', description: 'Promises represent values available now, later, or never — providing a clean API for async operations and chained transformations.' });

  const suggestions = [];
  if (lineCount > 50 && !hasClass && !hasFunc) suggestions.push('Consider breaking this long script into named functions or classes for better readability and maintainability.');
  if (!hasError && (hasAsync || hasPromise)) suggestions.push('Add try/catch around async operations to handle rejections and prevent silent failures.');
  if (code.includes('var ')) suggestions.push('Replace `var` with `const` (for values) or `let` (for reassigned variables) to avoid hoisting bugs and improve scope clarity.');
  if (/[^=!]=[^=>]/.test(code) && !code.includes('===') && code.includes('==')) suggestions.push('Use strict equality `===` instead of `==` to avoid unexpected type coercion.');

  return { complexity, overview, structure, concepts, suggestions };
}

function explainLine(line, lang, depth) {
  const t = line.trim();
  const d = depth !== 'simple';

  if (!t) return '';

  // Comment
  if (/^(\/\/|#|--|\/\*|\*)/.test(t)) {
    const text = t.replace(/^(\/\/|#|--|\/\*|\*\/?)\s*/, '');
    return text ? (d ? `💬 Comment: <em>${text}</em>` : text) : '💬 Separator comment';
  }

  // Import
  if (/^(import|require|use|include|#include|from)\b/.test(t)) {
    const m = t.match(/['"]([^'"]+)['"]/) || t.match(/\b(\w[\w/]+)\s*$/) || [];
    const target = m[1] || 'module';
    return d ? `📦 Imports <strong>${target}</strong> — makes external code available in this file.` : `📦 Import: ${target}`;
  }

  // Function/def/fn
  if (/^\s*(export\s+)?(async\s+)?(function|def|fn|func|fun)\s+\w+/.test(t) || /^\s*(const|let)\s+\w+\s*=\s*(async\s*)?\(/.test(t)) {
    const m = t.match(/(function|def|fn|func|fun)\s+(\w+)/) || t.match(/(?:const|let)\s+(\w+)/);
    const name = m ? (m[2] || m[1]) : 'fn';
    const params = (t.match(/\(([^)]*)\)/) || [])[1] || '';
    const isAsync = /async/.test(t);
    return d ? `🔧 Defines${isAsync ? ' async' : ''} function <strong>${name}(${params})</strong> — ${params ? `takes ${params.split(',').length} param(s).` : 'no parameters.'}` : `🔧 Function: ${name}(${params})`;
  }

  // Class
  if (/^\s*(export\s+)?(abstract\s+)?class\s+\w+/.test(t)) {
    const m = t.match(/class\s+(\w+)/);
    const cls = m ? m[1] : 'Class';
    const ext = (t.match(/extends\s+(\w+)/) || [])[1];
    return d ? `📐 Declares class <strong>${cls}</strong>${ext ? ` extending <strong>${ext}</strong>` : ''} — a blueprint for creating objects.` : `📐 Class: ${cls}`;
  }

  // If / else / switch
  if (/^\s*(if|elsif|elif|else|switch|when)\b/.test(t)) {
    if (/^\s*else\s*[{$]/.test(t)) return d ? '🔀 Else — fallback when all prior conditions are false.' : '🔀 Else';
    if (/\belse\s+if|elsif|elif\b/.test(t)) {
      const cond = t.replace(/^.*?(else\s+if|elsif|elif)\s*/, '').replace(/[:{]\s*$/, '').trim();
      return d ? `🔀 Else-if: <strong>${cond}</strong> — checked when previous condition failed.` : `🔀 Else-if: ${cond}`;
    }
    const cond = t.replace(/^\s*(if|when|switch)\s*/, '').replace(/[:{]\s*$/, '').trim();
    return d ? `🔀 If <strong>${cond}</strong> — controls execution path based on this condition.` : `🔀 If: ${cond}`;
  }

  // Loops
  if (/^\s*(for|while|loop|foreach|each)\b/.test(t)) {
    const type = (t.match(/^\s*(for|while|loop|foreach|each)\b/) || [])[1];
    const detail = t.replace(/^\s*(for|while|loop|foreach|each)\s*/, '').replace(/[:{]\s*$/, '').trim();
    return d ? `🔄 <strong>${type}</strong> loop — repeats over <strong>${detail || 'a collection'}</strong>.` : `🔄 ${type}: ${detail || 'loop'}`;
  }

  // Return
  if (/^\s*return\b/.test(t)) {
    const val = t.replace(/^\s*return\s*/, '').replace(/;?\s*$/, '').trim();
    return d ? `↩️ Returns${val ? ` <strong>${val}</strong>` : ' nothing'} — exits function${val ? ' with a value.' : '.'}` : `↩️ Return${val ? `: ${val}` : ''}`;
  }

  // Try/catch/finally
  if (/^\s*try\b/.test(t)) return d ? '🛡️ Try block — wraps risky code to allow graceful error recovery.' : '🛡️ Try';
  if (/^\s*(catch|except|rescue)\b/.test(t)) {
    const err = ((t.match(/(?:catch|except|rescue)\s*[\(:]?\s*(\w+)/) || [])[1]) || 'error';
    return d ? `🛡️ Catches <strong>${err}</strong> — handles errors thrown in the try block.` : `🛡️ Catch: ${err}`;
  }
  if (/^\s*finally\b/.test(t)) return d ? '🛡️ Finally — always runs after try/catch for cleanup.' : '🛡️ Finally';

  // Throw / revert / raise
  if (/^\s*(throw|revert|raise)\b/.test(t)) {
    const msg = t.replace(/^\s*(throw|revert|raise)\s*/, '').trim();
    return d ? `⚠️ Throws error: <em>${msg}</em> — signals an exceptional condition.` : `⚠️ Throw: ${msg}`;
  }

  // Variable declaration
  if (/^\s*(const|let|var|val|let\s+mut)\s+\w+\s*=/.test(t)) {
    const m = t.match(/^\s*(const|let|var|val|let\s+mut)\s+(\w+)\s*=\s*(.+)/);
    if (m) {
      const [, kw, name, val] = m;
      const label = { const: 'Constant', let: 'Variable', var: 'Variable', val: 'Immutable', 'let mut': 'Mutable' }[kw] || 'Variable';
      const clean = val.replace(/;?$/, '').trim();
      return d ? `📝 <strong>${label} ${name}</strong> = ${clean.substring(0, 40)}${clean.length > 40 ? '…' : ''} — ${kw === 'const' || kw === 'val' ? 'cannot be reassigned.' : 'mutable binding.'}` : `📝 ${label}: ${name}`;
    }
  }

  // Await
  if (/^\s*await\b/.test(t)) {
    const expr = t.replace(/^\s*await\s*/, '').replace(/;?$/, '').trim();
    return d ? `⏳ Awaits <strong>${expr}</strong> — pauses until this async operation resolves.` : `⏳ Await: ${expr}`;
  }

  // Default
  return d ? `⚙️ Statement: <em>${t.substring(0, 60)}${t.length > 60 ? '…' : ''}</em>` : '';
}

// ============================================
// HISTORY
// ============================================

function saveToHistory(type, item) {
  const key = `gitty_${type}_history`;
  chrome.storage.local.get([key], (result) => {
    const arr = result[key] || [];
    arr.unshift(item);
    if (arr.length > 30) arr.pop();
    chrome.storage.local.set({ [key]: arr }, () => {
      STATE.history[type] = arr;
    });
  });
}

function loadHistory() {
  chrome.storage.local.get(['gitty_readme_history', 'gitty_code_history'], (result) => {
    STATE.history.readme = result.gitty_readme_history || [];
    STATE.history.code = result.gitty_code_history || [];
    renderHistory();
  });
}

function renderHistory() {
  const rh = STATE.history.readme;
  const ch = STATE.history.code;

  DOM.histReadme.innerHTML = rh.length > 0
    ? rh.map((item, i) => `
        <div class="history-item" data-type="readme" data-index="${i}">
          <span class="history-item-icon">📝</span>
          <div class="history-item-content">
            <div class="history-item-title">${item.project || 'Untitled README'}</div>
            <div class="history-item-meta">${item.timestamp}${item.lang ? ` · ${item.lang}` : ''}</div>
          </div>
          <span class="history-item-arrow">›</span>
        </div>
      `).join('')
    : '';

  DOM.histCode.innerHTML = ch.length > 0
    ? ch.map((item, i) => `
        <div class="history-item" data-type="code" data-index="${i}">
          <span class="history-item-icon">💡</span>
          <div class="history-item-content">
            <div class="history-item-title">${item.lang || 'Code'} explanation</div>
            <div class="history-item-meta">${item.timestamp} · ${item.preview}</div>
          </div>
          <span class="history-item-arrow">›</span>
        </div>
      `).join('')
    : '';

  const isEmpty = rh.length === 0 && ch.length === 0;
  DOM.histEmpty.classList.toggle('visible', isEmpty);
}

// ============================================
// UTILITIES
// ============================================

function saveAsFile(content, name, ext) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
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
      .then(() => showToast('Copied to clipboard!', 'success'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('Copied!', 'success');
}

function showToast(message, type = '', duration = 2200) {
  const t = DOM.toast;
  t.textContent = message;
  t.className = `toast${type ? ' ' + type : ''}`;
  t.classList.remove('hidden');

  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.2s ease';
    setTimeout(() => {
      t.classList.add('hidden');
      t.style.opacity = '';
      t.style.transition = '';
    }, 200);
  }, duration);
}

function updateLineNumbers() {
  const lines = DOM.codeInput.value.split('\n').length;
  DOM.lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

// ============================================
// SETTINGS
// ============================================

function loadSettings() {
  chrome.storage.local.get(['gitty_syntax_theme', 'gitty_animation', 'gitty_auto_copy'], (res) => {
    STATE.settings.syntaxTheme = res.gitty_syntax_theme || 'tokyo-night';
    STATE.settings.defaultAnimation = res.gitty_animation || 'typewriter';
    STATE.settings.autoCopy = res.gitty_auto_copy || false;

    DOM.syntaxTheme.value = STATE.settings.syntaxTheme;
    DOM.settingsSyntaxTheme.value = STATE.settings.syntaxTheme;
    DOM.settingsAnimation.value = STATE.settings.defaultAnimation;
    DOM.settingsAutoCopy.checked = STATE.settings.autoCopy;

    [...DOM.animRadios].forEach(r => { r.checked = r.value === STATE.settings.defaultAnimation; });
  });
}

function saveSettings() {
  const theme = DOM.settingsSyntaxTheme.value;
  const anim = DOM.settingsAnimation.value;
  const auto = DOM.settingsAutoCopy.checked;

  chrome.storage.local.set({
    gitty_syntax_theme: theme,
    gitty_animation: anim,
    gitty_auto_copy: auto
  }, () => {
    STATE.settings.syntaxTheme = theme;
    STATE.settings.defaultAnimation = anim;
    STATE.settings.autoCopy = auto;

    DOM.syntaxTheme.value = theme;
    [...DOM.animRadios].forEach(r => { r.checked = r.value === anim; });

    DOM.settingsOverlay.classList.add('hidden');
    showToast('Settings saved!', 'success');
  });
}

// ============================================
// EVENT WIRING
// ============================================

// Navigation
DOM.navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    DOM.navItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.keys(DOM.tabPanes).forEach(k => {
      DOM.tabPanes[k].classList.toggle('active', k === tab);
    });
    STATE.currentTab = tab;
    if (tab === 'history') renderHistory();
  });
});

// Generate README
DOM.btnGenerate.addEventListener('click', () => {
  const { readme, animStyle } = generateReadme();

  const html = renderMarkdown(readme);
  DOM.preview.innerHTML = html;
  DOM.preview.className = `output-panel-body markdown-render anim-${animStyle}`;
  DOM.previewContainer.classList.remove('hidden');
  DOM.btnCopy.disabled = false;
  DOM.btnSave.disabled = false;

  saveToHistory('readme', {
    project: DOM.projectName.value.trim() || 'Untitled',
    lang: DOM.projectLang.value.trim(),
    timestamp: new Date().toLocaleString(),
    content: readme
  });

  if (STATE.settings.autoCopy) copyText(readme);

  showToast('README generated!', 'success');

  setTimeout(() => {
    DOM.previewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
});

// Copy README
DOM.btnCopy.addEventListener('click', () => {
  if (STATE.lastReadme) copyText(STATE.lastReadme);
});

// Save README
DOM.btnSave.addEventListener('click', () => {
  const name = DOM.projectName.value.trim() || 'README';
  saveAsFile(STATE.lastReadme, name, 'md');
  showToast('README saved!', 'success');
});

// Toggle preview animation
let animPaused = false;
DOM.btnToggleAnim.addEventListener('click', () => {
  animPaused = !animPaused;
  DOM.preview.style.animationPlayState = animPaused ? 'paused' : 'running';
  DOM.btnToggleAnim.innerHTML = animPaused
    ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="1.5" width="3" height="9" rx="1" fill="currentColor"/><rect x="7" y="1.5" width="3" height="9" rx="1" fill="currentColor"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 2L10 6L3 10V2Z" fill="currentColor"/></svg>';
});

// Explain code
DOM.btnExplain.addEventListener('click', explainCode);

// Clear code
DOM.btnClearCode.addEventListener('click', () => {
  DOM.codeInput.value = '';
  DOM.explanationOutput.classList.add('hidden');
  updateLineNumbers();
});

// Copy explanation
DOM.btnCopyExplanation.addEventListener('click', () => {
  copyText(DOM.explanationBody.innerText);
});

// Code editor: update line numbers, tab key
DOM.codeInput.addEventListener('input', updateLineNumbers);

DOM.codeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = DOM.codeInput.selectionStart;
    const end = DOM.codeInput.selectionEnd;
    DOM.codeInput.value = DOM.codeInput.value.substring(0, start) + '  ' + DOM.codeInput.value.substring(end);
    DOM.codeInput.selectionStart = DOM.codeInput.selectionEnd = start + 2;
    updateLineNumbers();
  }
});

// Sync scroll between code and line numbers
DOM.codeInput.addEventListener('scroll', () => {
  DOM.lineNumbers.style.transform = `translateY(-${DOM.codeInput.scrollTop}px)`;
});

// History tab switch
DOM.histSegBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    DOM.histSegBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.hist;
    DOM.histReadme.classList.toggle('active', type === 'readme');
    DOM.histCode.classList.toggle('active', type === 'code');
  });
});

// Clear history
DOM.btnClearHistory.addEventListener('click', () => {
  chrome.storage.local.set({ gitty_readme_history: [], gitty_code_history: [] }, () => {
    STATE.history.readme = [];
    STATE.history.code = [];
    renderHistory();
    showToast('History cleared');
  });
});

// History item restore
document.addEventListener('click', (e) => {
  const item = e.target.closest('.history-item');
  if (!item) return;

  const type = item.dataset.type;
  const idx = parseInt(item.dataset.index);

  if (type === 'readme') {
    const entry = STATE.history.readme[idx];
    if (entry?.content) {
      STATE.lastReadme = entry.content;
      const html = renderMarkdown(entry.content);
      DOM.preview.innerHTML = html;
      DOM.preview.className = `output-panel-body markdown-render anim-${STATE.settings.defaultAnimation}`;
      DOM.previewContainer.classList.remove('hidden');
      DOM.btnCopy.disabled = false;
      DOM.btnSave.disabled = false;
      DOM.navItems.forEach(b => b.classList.toggle('active', b.dataset.tab === 'readme'));
      Object.keys(DOM.tabPanes).forEach(k => { DOM.tabPanes[k].classList.toggle('active', k === 'readme'); });
      STATE.currentTab = 'readme';
      showToast('Restored README');
    }
  } else if (type === 'code') {
    const entry = STATE.history.code[idx];
    if (entry?.code) {
      DOM.codeInput.value = entry.code;
      updateLineNumbers();
      DOM.navItems.forEach(b => b.classList.toggle('active', b.dataset.tab === 'explainer'));
      Object.keys(DOM.tabPanes).forEach(k => { DOM.tabPanes[k].classList.toggle('active', k === 'explainer'); });
      STATE.currentTab = 'explainer';
      showToast('Code restored');
    }
  }
});

// Settings
DOM.btnSettings.addEventListener('click', () => {
  DOM.settingsSyntaxTheme.value = STATE.settings.syntaxTheme;
  DOM.settingsAnimation.value = STATE.settings.defaultAnimation;
  DOM.settingsAutoCopy.checked = STATE.settings.autoCopy;
  DOM.settingsOverlay.classList.remove('hidden');
});

DOM.btnCloseSettings.addEventListener('click', () => {
  DOM.settingsOverlay.classList.add('hidden');
});

DOM.settingsOverlay.addEventListener('click', (e) => {
  if (e.target === DOM.settingsOverlay) DOM.settingsOverlay.classList.add('hidden');
});

DOM.btnSaveSettings.addEventListener('click', saveSettings);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (STATE.currentTab === 'readme') DOM.btnGenerate.click();
    else if (STATE.currentTab === 'explainer') DOM.btnExplain.click();
  }
  if (e.key === 'Escape') DOM.settingsOverlay.classList.add('hidden');
});

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadHistory();
  updateLineNumbers();
});
