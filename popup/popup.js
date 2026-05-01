// ============================================
// Gitty — Main Application Logic
// ============================================

const STATE = {
  currentTab: 'readme',
  lastReadme: '',
  lastExplanation: '',
  settings: {
    syntaxTheme: 'dracula',
    defaultAnimation: 'typewriter',
    autoCopy: false
  },
  history: {
    readme: [],
    code: []
  }
};

// ============================================
// DOM REFS
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const DOM = {
  tabs: $$('.nav-btn'),
  tabContents: {
    readme: $('#tab-readme'),
    explainer: $('#tab-explainer'),
    history: $('#tab-history')
  },
  // README
  projectName: $('#project-name'),
  projectTagline: $('#project-tagline'),
  projectDesc: $('#project-desc'),
  projectLang: $('#project-lang'),
  projectLicense: $('#project-license'),
  projectBadgeStyle: $('#project-badge-style'),
  projectFeatures: $('#project-features'),
  projectInstall: $('#project-install'),
  animRadios: $$('input[name="anim-style"]'),
  btnGenerate: $('#btn-generate-readme'),
  btnCopy: $('#btn-copy-readme'),
  btnSave: $('#btn-save-readme'),
  previewContainer: $('#readme-preview-container'),
  preview: $('#readme-preview'),
  togglePreviewAnim: $('#btn-toggle-preview-anim'),
  // EXPLAINER
  codeLanguage: $('#code-language'),
  explainDepth: $('#explain-depth'),
  syntaxTheme: $('#syntax-theme'),
  codeInput: $('#code-input'),
  btnExplain: $('#btn-explain-code'),
  btnClearCode: $('#btn-clear-code'),
  explanationOutput: $('#explanation-output'),
  explanationBody: $('#explanation-body'),
  btnCopyExplanation: $('#btn-copy-explanation'),
  // HISTORY
  histReadme: $('#history-readme'),
  histCode: $('#history-code'),
  histEmpty: $('#history-empty'),
  histTabBtns: $$('.hist-tab-btn'),
  btnClearHistory: $('#btn-clear-history'),
  // SETTINGS
  settingsPanel: $('#settings-panel'),
  btnSettings: $('#btn-settings'),
  btnCloseSettings: $('#btn-close-settings'),
  settingsSyntaxTheme: $('#settings-syntax-theme'),
  settingsAnimation: $('#settings-animation'),
  settingsAutoCopy: $('#settings-auto-copy'),
  btnSaveSettings: $('#btn-save-settings')
};

// ============================================
// SYNTAX HIGHLIGHTING (lightweight engine)
// ============================================
const SYNTAX_THEMES = {
  dracula: {
    keyword: '#ff79c6', string: '#f1fa8c', number: '#bd93f9',
    comment: '#6272a4', func: '#50fa7b', type: '#8be9fd',
    operator: '#ff79c6', variable: '#f8f8f2', bg: '#282a36',
    text: '#f8f8f2'
  },
  nord: {
    keyword: '#81a1c1', string: '#a3be8c', number: '#b48ead',
    comment: '#4c566a', func: '#88c0d0', type: '#8fbcbb',
    operator: '#81a1c1', variable: '#d8dee9', bg: '#2e3440',
    text: '#d8dee9'
  },
  monokai: {
    keyword: '#f92672', string: '#e6db74', number: '#ae81ff',
    comment: '#75715e', func: '#a6e22e', type: '#66d9ef',
    operator: '#f92672', variable: '#f8f8f2', bg: '#272822',
    text: '#f8f8f2'
  },
  'github-dark': {
    keyword: '#ff7b72', string: '#a5d6ff', number: '#79c0ff',
    comment: '#8b949e', func: '#d2a8ff', type: '#ffa657',
    operator: '#ff7b72', variable: '#e6edf3', bg: '#0d1117',
    text: '#e6edf3'
  },
  'one-dark': {
    keyword: '#c678dd', string: '#98c379', number: '#d19a66',
    comment: '#5c6370', func: '#61afef', type: '#e5c07b',
    operator: '#c678dd', variable: '#abb2bf', bg: '#1e2127',
    text: '#abb2bf'
  },
  'solarized-dark': {
    keyword: '#859900', string: '#2aa198', number: '#d33682',
    comment: '#586e75', func: '#268bd2', type: '#b58900',
    operator: '#859900', variable: '#93a1a1', bg: '#002b36',
    text: '#93a1a1'
  }
};

function highlightSyntax(code, lang, themeName = 'dracula') {
  const theme = SYNTAX_THEMES[themeName] || SYNTAX_THEMES.dracula;
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const keywords = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class', 'extends', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'throw', 'typeof', 'instanceof', 'in', 'of', 'yield', 'static', 'get', 'set'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'interface', 'type', 'enum', 'class', 'extends', 'implements', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'throw', 'public', 'private', 'protected', 'readonly', 'static', 'abstract', 'as', 'is', 'keyof', 'typeof', 'never', 'unknown', 'any'],
    python: ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'is', 'None', 'True', 'False', 'class', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'as', 'pass', 'break', 'continue', 'lambda', 'yield', 'async', 'await', 'self', 'global', 'nonlocal'],
    rust: ['fn', 'let', 'mut', 'return', 'if', 'else', 'match', 'for', 'while', 'loop', 'in', 'struct', 'enum', 'impl', 'trait', 'use', 'mod', 'pub', 'crate', 'self', 'super', 'where', 'as', 'async', 'await', 'unsafe', 'ref', 'move', 'dyn', 'type', 'const', 'static', 'true', 'false'],
    go: ['func', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'go', 'defer', 'select', 'chan', 'map', 'struct', 'interface', 'type', 'package', 'import', 'var', 'const', 'true', 'false', 'nil', 'make', 'new', 'append', 'len', 'cap'],
    java: ['public', 'private', 'protected', 'static', 'final', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'throws', 'import', 'package', 'void', 'int', 'boolean', 'string', 'null', 'true', 'false'],
    cpp: ['int', 'float', 'double', 'char', 'void', 'bool', 'auto', 'const', 'static', 'class', 'struct', 'enum', 'union', 'public', 'private', 'protected', 'virtual', 'override', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'delete', 'this', 'namespace', 'using', 'include', 'template', 'typename', 'true', 'false', 'nullptr'],
    csharp: ['public', 'private', 'protected', 'internal', 'static', 'readonly', 'virtual', 'override', 'abstract', 'sealed', 'async', 'await', 'class', 'struct', 'interface', 'enum', 'namespace', 'using', 'return', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'base', 'try', 'catch', 'finally', 'throw', 'var', 'true', 'false', 'null', 'get', 'set', 'value'],
    ruby: ['def', 'end', 'return', 'if', 'elsif', 'else', 'unless', 'for', 'while', 'until', 'do', 'each', 'map', 'select', 'class', 'module', 'require', 'include', 'extend', 'attr_reader', 'attr_writer', 'attr_accessor', 'private', 'protected', 'public', 'self', 'true', 'false', 'nil'],
    php: ['function', 'return', 'if', 'else', 'elseif', 'for', 'foreach', 'while', 'switch', 'case', 'break', 'continue', 'class', 'interface', 'trait', 'extends', 'implements', 'abstract', 'final', 'public', 'private', 'protected', 'static', 'const', 'var', 'new', 'this', 'parent', 'self', 'try', 'catch', 'throw', 'namespace', 'use', 'require', 'include', 'echo', 'true', 'false', 'null', 'array'],
    swift: ['func', 'var', 'let', 'return', 'if', 'else', 'guard', 'for', 'while', 'repeat', 'switch', 'case', 'break', 'continue', 'class', 'struct', 'enum', 'protocol', 'extension', 'import', 'init', 'deinit', 'public', 'private', 'internal', 'fileprivate', 'static', 'override', 'throws', 'rethrows', 'async', 'await', 'true', 'false', 'nil', 'self', 'super'],
    kotlin: ['fun', 'val', 'var', 'return', 'if', 'else', 'when', 'for', 'while', 'do', 'break', 'continue', 'class', 'data', 'object', 'companion', 'interface', 'enum', 'sealed', 'open', 'abstract', 'override', 'private', 'protected', 'public', 'internal', 'import', 'package', 'suspend', 'init', 'constructor', 'true', 'false', 'null', 'this', 'super'],
    sql: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'BEGIN', 'COMMIT', 'ROLLBACK'],
    bash: ['echo', 'export', 'source', 'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'return', 'exit', 'local', 'read', 'set', 'unset', 'trap', 'exec', 'cd', 'ls', 'rm', 'mv', 'cp', 'mkdir', 'chmod', 'chown', 'grep', 'sed', 'awk', 'cat'],
    html: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'select', 'option', 'textarea', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'footer', 'section', 'article', 'nav', 'main', 'aside', 'script', 'style', 'link', 'meta', 'title'],
    css: ['color', 'background', 'margin', 'padding', 'border', 'font', 'display', 'position', 'width', 'height', 'top', 'left', 'right', 'bottom', 'flex', 'grid', 'align', 'justify', 'text', 'box', 'shadow', 'transform', 'transition', 'animation', 'opacity', 'overflow', 'z-index', 'important'],
    solidity: ['pragma', 'contract', 'interface', 'library', 'import', 'constructor', 'function', 'modifier', 'event', 'enum', 'struct', 'mapping', 'address', 'uint', 'int', 'bool', 'string', 'bytes', 'msg', 'tx', 'block', 'require', 'revert', 'assert', 'emit', 'public', 'private', 'internal', 'external', 'view', 'pure', 'payable', 'memory', 'storage', 'calldata', 'virtual', 'override', 'abstract', 'is', 'returns', 'return', 'if', 'else', 'for', 'while', 'do', 'mapping']
  };

  const langKeywords = keywords[lang] || keywords.javascript;

  let result = escaped;

  // Strings (double & single quotes, backticks)
  result = result.replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, (m) =>
    `<span style="color:${theme.string}">${m}</span>`
  );

  // Comments (line & block)
  result = result.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$|--.*$)/gm, (m) =>
    `<span style="color:${theme.comment};font-style:italic">${m}</span>`
  );

  // Numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, (m) =>
    `<span style="color:${theme.number}">${m}</span>`
  );

  // Keywords
  const kwPattern = new RegExp(`\\b(${langKeywords.join('|')})\\b`, 'gi');
  result = result.replace(kwPattern, (m) => {
    const isKeyword = langKeywords.some(kw => kw.toLowerCase() === m.toLowerCase());
    return isKeyword ? `<span style="color:${theme.keyword};font-weight:500">${m}</span>` : m;
  });

  // Function calls (word followed by parenthesis)
  result = result.replace(/\b([a-zA-Z_$][\w$]*)\s*\(/g, (m, fn) =>
    `<span style="color:${theme.func}">${fn}</span>(`
  );

  // Types / classes (PascalCase)
  result = result.replace(/\b([A-Z][a-z]\w*)\b/g, (m) => {
    if (!m.includes('(')) {
      return `<span style="color:${theme.type}">${m}</span>`;
    }
    return m;
  });

  return `<code style="color:${theme.text}">${result}</code>`;
}

// ============================================
// README GENERATOR
// ============================================

function generateReadme() {
  const name = DOM.projectName.value.trim() || 'my-project';
  const tagline = DOM.projectTagline.value.trim() || 'A powerful project built with passion.';
  const desc = DOM.projectDesc.value.trim() || 'An amazing project that solves real-world problems efficiently and elegantly.';
  const lang = DOM.projectLang.value.trim() || 'TypeScript';
  const license = DOM.projectLicense.value;
  const badgeStyle = DOM.projectBadgeStyle.value;
  const features = DOM.projectFeatures.value.trim().split('\n').filter(Boolean);
  const installSteps = DOM.projectInstall.value.trim().split('\n').filter(Boolean);
  const animStyle = [...DOM.animRadios].find(r => r.checked)?.value || 'typewriter';

  const badgeURL = (label, message, color) =>
    `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}?style=${badgeStyle}`;

  const licenseBadge = license === 'custom' ? '' : 
    `![License](${badgeURL('license', license, license === 'MIT' ? 'green' : license === 'Apache-2.0' ? 'blue' : license === 'GPL-3.0' ? 'orange' : 'lightgrey')})`;

  const langBadge = lang ? `![Language](https://img.shields.io/badge/language-${encodeURIComponent(lang)}-${lang === 'Python' ? '3776AB' : lang === 'Rust' ? 'DEA584' : lang === 'TypeScript' ? '3178C6' : lang === 'JavaScript' ? 'F7DF1E' : lang === 'Go' ? '00ADD8' : 'blue'}?style=${badgeStyle})` : '';

  // Build Features Markdown
  const featuresMd = features.length > 0
    ? features.map(f => `- ${f}`).join('\n')
    : '- 🚀 High performance and blazing fast\n- 🔒 Enterprise-grade security\n- 🎨 Beautiful, intuitive interface';

  // Build Install Markdown
  const installMd = installSteps.length > 0
    ? installSteps.map(s => `\`\`\`bash\n${s}\n\`\`\``).join('\n\n')
    : `\`\`\`bash\ngit clone https://github.com/your-username/${name}.git\ncd ${name}\nnpm install\nnpm run dev\n\`\`\``;

  // Build complete README
  const readme = `# ${name}

> ${tagline}

${langBadge} ${licenseBadge} ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=${badgeStyle}) ![Maintained](https://img.shields.io/badge/maintained-yes-${license === 'MIT' ? 'green' : 'blue'}?style=${badgeStyle})

---

## 📖 Description

${desc}

---

## ✨ Features

${featuresMd}

---

## 🚀 Installation

${installMd}

---

## 📄 License

${license === 'custom' ? 'This project is licensed under custom terms. See the [LICENSE](./LICENSE) file for details.' : `This project is licensed under the **${license} License**.`}

---

<p align="center">Made with ❤️ by <a href="https://github.com/your-username">@your-username</a></p>
`;

  STATE.lastReadme = readme;
  return { readme, animStyle };
}

function renderPreview(readme, animStyle) {
  const preview = DOM.preview;
  
  // Convert basic markdown to HTML for preview
  const html = markdownToHtml(readme);
  
  preview.innerHTML = html;
  preview.className = 'preview-content';
  
  // Add animation class
  if (animStyle) {
    preview.classList.add(`anim-${animStyle}`);
  }

  DOM.previewContainer.classList.remove('hidden');
  DOM.btnCopy.disabled = false;
  DOM.btnSave.disabled = false;
}

function markdownToHtml(md) {
  let html = md;

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const highlighted = highlightSyntax(code.trim(), lang || 'javascript', STATE.settings.syntaxTheme);
    return `<pre>${highlighted}</pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  
  // Clean up consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br />');

  // Align center
  html = html.replace(/<p align="center">/g, '<p style="text-align:center">');

  return `<p>${html}</p>`;
}

// ============================================
// CODE EXPLAINER
// ============================================

function explainCode() {
  const code = DOM.codeInput.value;
  const lang = DOM.codeLanguage.value;
  const depth = DOM.explainDepth.value;
  const themeName = DOM.syntaxTheme.value;

  if (!code.trim()) {
    DOM.explanationBody.innerHTML = '<p style="color:var(--red)">Please paste some code first.</p>';
    DOM.explanationOutput.classList.remove('hidden');
    return;
  }

  const lines = code.split('\n');
  const langName = DOM.codeLanguage.options[DOM.codeLanguage.selectedIndex].text;
  const theme = SYNTAX_THEMES[themeName] || SYNTAX_THEMES.dracula;

  // Generate intelligent explanations based on code analysis
  const explanation = generateCodeExplanation(code, lines, lang, depth, theme);
  
  DOM.explanationBody.innerHTML = explanation;
  DOM.explanationOutput.classList.remove('hidden');
  STATE.lastExplanation = explanation;

  // Save to history
  saveToHistory('code', {
    lang: langName,
    code: code,
    preview: code.substring(0, 60) + (code.length > 60 ? '...' : ''),
    timestamp: new Date().toLocaleString()
  });
}

function generateCodeExplanation(code, lines, lang, depth, theme) {
  const sections = [];
  
  // First analyze the code structure
  const analysis = analyzeCode(code, lang);
  
  // Overview section
  sections.push(`<div class="section-title">📋 Overview</div>`);
  sections.push(`<p style="margin-bottom:10px">${analysis.overview}</p>`);

  if (analysis.complexity) {
    sections.push(`<p style="color:var(--text-secondary);margin-bottom:10px;font-size:11px">
      Complexity: <strong>${analysis.complexity}</strong> | 
      Lines: <strong>${lines.length}</strong> | 
      Language: <strong>${DOM.codeLanguage.options[DOM.codeLanguage.selectedIndex].text}</strong>
    </p>`);
  }

  // Structure section if applicable
  if (analysis.structure) {
    sections.push(`<div class="section-title">🏗️ Structure</div>`);
    sections.push(`<p style="margin-bottom:10px">${analysis.structure}</p>`);
  }

  // Line-by-line explanation
  sections.push(`<div class="section-title">🔍 Line-by-Line Breakdown</div>`);

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const trimmed = line.trim();
    
    if (!trimmed) {
      sections.push(`
        <div class="code-line">
          <span class="line-num">${lineNum}</span>
          <span class="line-code" style="color:${theme.text}">&nbsp;</span>
          <span class="line-explain" style="color:var(--text-muted)">&nbsp;</span>
        </div>
      `);
      return;
    }

    const highlighted = highlightSyntax(line, lang, DOM.syntaxTheme.value);
    const lineExplain = explainLine(trimmed, lang, depth);
    
    sections.push(`
      <div class="code-line">
        <span class="line-num">${lineNum}</span>
        <span class="line-code">${highlighted}</span>
        <span class="line-explain">${lineExplain}</span>
      </div>
    `);
  });

  // Key concepts section
  if (analysis.concepts && analysis.concepts.length > 0) {
    sections.push(`<div class="section-title">💡 Key Concepts</div>`);
    analysis.concepts.forEach(concept => {
      sections.push(`<p style="margin-bottom:6px">• <strong>${concept.name}:</strong> ${concept.description}</p>`);
    });
  }

  // Suggestions
  if (depth === 'advanced' && analysis.suggestions) {
    sections.push(`<div class="section-title">🔧 Suggestions & Improvements</div>`);
    analysis.suggestions.forEach(s => {
      sections.push(`<p style="margin-bottom:4px;color:var(--orange)">• ${s}</p>`);
    });
  }

  return sections.join('\n');
}

function analyzeCode(code, lang) {
  const analysis = {};

  // Detect patterns
  const hasClass = /\bclass\s+\w+/.test(code);
  const hasFunction = /\b(function|def|fn|func)\s+\w+/.test(code);
  const hasLoop = /\b(for|while|each|loop)\b/.test(code);
  const hasConditional = /\b(if|else|switch|match|case)\b/.test(code);
  const hasAsync = /\b(async|await|defer|\.then|\.catch)\b/.test(code);
  const hasImport = /\b(import|require|use|include|#include|package|from)\b/.test(code);
  const hasErrorHandling = /\b(try|catch|except|throw|revert|require|rescue)\b/.test(code);
  const hasArrow = /=>/.test(code);
  const hasPromise = /\bPromise\b|\.then\(|async/.test(code);
  
  const lineCount = code.split('\n').length;

  // Overview
  const patterns = [];
  if (hasClass) patterns.push('Object-Oriented');
  if (hasFunction) patterns.push('Function-Based');
  if (hasAsync) patterns.push('Asynchronous');
  if (hasLoop) patterns.push('Iterative Logic');
  if (hasConditional) patterns.push('Decision Logic');
  if (hasImport) patterns.push('Modular (imports)');
  if (hasErrorHandling) patterns.push('Error Handling');

  const patternStr = patterns.length > 0 ? patterns.join(', ') : 'Procedural';
  
  if (lineCount <= 10) {
    analysis.overview = `This is a short ${lang} snippet (${lineCount} lines) using ${patternStr.toLowerCase()} patterns. It appears to be a focused piece of logic with clear intent.`;
    analysis.complexity = 'Low';
  } else if (lineCount <= 30) {
    analysis.overview = `This ${lang} code (${lineCount} lines) combines ${patternStr.toLowerCase()} patterns. The code has moderate structure with well-defined operations.`;
    analysis.complexity = 'Low-Medium';
  } else if (lineCount <= 80) {
    analysis.overview = `This ${lang} module (${lineCount} lines) demonstrates ${patternStr.toLowerCase()} architecture. The code is organized into logical sections with multiple operations.`;
    analysis.complexity = 'Medium';
  } else {
    analysis.overview = `This is a substantial ${lang} codebase (${lineCount} lines) following ${patternStr.toLowerCase()} paradigms. It contains complex logic spanning multiple concerns.`;
    analysis.complexity = 'Medium-High';
  }

  // Structure
  if (hasClass) {
    const classMatch = code.match(/class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'ClassName';
    const methodCount = (code.match(/\b(function|def|fn|func)\s+\w+/g) || []).length;
    analysis.structure = `The code defines a class <strong>${className}</strong> with ${methodCount > 0 ? `${methodCount} method${methodCount > 1 ? 's' : ''}` : 'properties'}. ${hasImport ? 'External dependencies are imported at the top.' : ''}`;
  } else if (hasFunction) {
    const funcCount = (code.match(/\b(function|def|fn|func)\s+\w+/g) || []).length;
    analysis.structure = `The code contains ${funcCount} function${funcCount > 1 ? 's' : ''} with ${hasImport ? 'imports at the top and ' : ''}${hasConditional ? 'conditional logic' : 'sequential execution'}.`;
  }

  // Key concepts
  analysis.concepts = [];
  
  if (hasAsync) {
    analysis.concepts.push({
      name: 'Asynchronous Execution',
      description: 'This code uses async/await (or promise chaining) for non-blocking operations, allowing the program to continue executing while waiting for I/O, network, or timer events.'
    });
  }
  
  if (hasClass) {
    analysis.concepts.push({
      name: 'Object-Oriented Design',
      description: 'Classes encapsulate data and behavior. This promotes code reuse, maintainability, and clear separation of concerns.'
    });
  }
  
  if (hasArrow) {
    analysis.concepts.push({
      name: 'Arrow Functions / Lambdas',
      description: 'Concise function syntax with lexical scoping of `this`. Commonly used for callbacks, array methods, and functional programming patterns.'
    });
  }
  
  if (hasErrorHandling) {
    analysis.concepts.push({
      name: 'Error Handling',
      description: 'The code implements structured error handling to gracefully manage runtime exceptions and edge cases.'
    });
  }
  
  if (hasPromise) {
    analysis.concepts.push({
      name: 'Promise Pattern',
      description: 'Promises represent values that may be available now, later, or never. They provide a clean way to handle asynchronous operations.'
    });
  }

  // Suggestions (advanced mode)
  analysis.suggestions = [];
  if (lineCount > 50 && !hasClass && !hasFunction) {
    analysis.suggestions.push('Consider breaking this long script into functions or classes for better maintainability.');
  }
  if (!hasErrorHandling && (hasAsync || hasPromise)) {
    analysis.suggestions.push('Add error handling (try/catch) around async operations to prevent unhandled promise rejections.');
  }
  if (code.includes('var ')) {
    analysis.suggestions.push('Consider using `const` or `let` instead of `var` for better scoping and to avoid hoisting issues.');
  }
  if (code.includes('== ') && !code.includes('===')) {
    analysis.suggestions.push('Consider using strict equality (`===`) instead of loose equality (`==`) to avoid type coercion bugs.');
  }

  return analysis;
}

function explainLine(line, lang, depth) {
  const trimmed = line.trim();
  const isDetailed = depth === 'detailed' || depth === 'advanced';

  // Empty
  if (!trimmed) return '';

  // Comments
  if (/^(\/\/|#|--|\/\*|\*)/.test(trimmed)) {
    const commentText = trimmed.replace(/^(\/\/|#|--|\/\*|\*\/?)\s*/, '');
    if (commentText) {
      return isDetailed ? `📝 Comment: "${commentText}"` : commentText;
    }
    return '📝 Comment separator';
  }

  // Import/require/include
  if (/^(import|require|use|include|#include|from)\b/.test(trimmed)) {
    const match = trimmed.match(/['"]([^'"]+)['"]/) || trimmed.match(/\b(\w+)\s*$/);
    const target = match ? match[1] : 'external module';
    return isDetailed
      ? `📦 Imports <strong>${target}</strong> — makes external code available for use. Dependency management keeps code modular.`
      : `📦 Import: ${target}`;
  }

  // Function/def/fn declaration
  if (/^\s*(function|def|fn|func|fun)\s+\w+\s*\(/.test(trimmed)) {
    const match = trimmed.match(/(function|def|fn|func|fun)\s+(\w+)/);
    const funcName = match ? match[2] : 'anonymous';
    const params = trimmed.match(/\(([^)]*)\)/);
    const paramList = params ? params[1] : '';
    return isDetailed
      ? `🔧 Defines function <strong>${funcName}(${paramList})</strong> — a reusable block of code. ${paramList ? `Parameters: ${paramList}` : 'No parameters.'}`
      : `🔧 Function: ${funcName}(${paramList})`;
  }

  // Class declaration
  if (/^\s*class\s+\w+/.test(trimmed)) {
    const match = trimmed.match(/class\s+(\w+)/);
    const className = match ? match[1] : 'ClassName';
    const parent = trimmed.match(/extends\s+(\w+)/);
    const parentStr = parent ? ` extending <strong>${parent[1]}</strong>` : '';
    return isDetailed
      ? `📐 Defines class <strong>${className}</strong>${parentStr} — a blueprint for creating objects with shared properties and methods.`
      : `📐 Class: ${className}${parent ? ` extends ${parent[1]}` : ''}`;
  }

  // If/else/switch
  if (/^\s*(if|elsif|elif|else|switch|when|case)/.test(trimmed)) {
    if (/^\s*else\s*{?$/.test(trimmed)) {
      return isDetailed ? '🔀 Else branch — executes when the preceding condition is false.' : '🔀 Else branch';
    }
    if (/^\s*else\s+if/.test(trimmed) || /^\s*elsif/.test(trimmed) || /^\s*elif/.test(trimmed)) {
      const cond = trimmed.replace(/^\s*(elsif|elif|else\s+if)\s*/, '').replace(/[:{]\s*$/, '').trim();
      return isDetailed
        ? `🔀 Else-if: checks <strong>${cond}</strong> — alternative condition when previous checks fail.`
        : `🔀 Else-if: ${cond}`;
    }
    const cond = trimmed.replace(/^\s*(if|when|case)\s*/, '').replace(/[:{]\s*$/, '').trim();
    return isDetailed
      ? `🔀 Conditional: checks if <strong>${cond}</strong> — controls flow based on a boolean expression.`
      : `🔀 If: ${cond}`;
  }

  // For/while loops
  if (/^\s*(for|while|loop|foreach)\b/.test(trimmed)) {
    const loopType = trimmed.match(/^\s*(for|while|loop|foreach)\b/)[1];
    const details = trimmed.replace(/^\s*(for|while|loop|foreach)\s*/, '').replace(/[:{]\s*$/, '').trim();
    return isDetailed
      ? `🔄 <strong>${loopType}</strong> loop: iterates ${details ? `over <strong>${details}</strong>` : 'over a collection'} — repeats a block of code multiple times.`
      : `🔄 ${loopType}: ${details || 'loop iteration'}`;
  }

  // Return
  if (/^\s*return\b/.test(trimmed)) {
    const val = trimmed.replace(/^\s*return\s*/, '').replace(/;?\s*$/, '').trim();
    return isDetailed
      ? `↩️ Returns${val ? ` <strong>${val}</strong>` : ''} — exits the current function and optionally sends a value back to the caller.`
      : `↩️ Return${val ? `: ${val}` : ''}`;
  }

  // Try/catch
  if (/^\s*try\b/.test(trimmed)) {
    return isDetailed ? '🛡️ Try block — wraps code that may throw an error, allowing graceful recovery.' : '🛡️ Try block';
  }
  if (/^\s*catch\b/.test(trimmed)) {
    const match = trimmed.match(/catch\s*\(([^)]*)\)/);
    const err = match ? match[1] : 'error';
    return isDetailed
      ? `🛡️ Catch block: handles <strong>${err}</strong> — executes when an error is thrown in the try block.`
      : `🛡️ Catch: ${err}`;
  }
  if (/^\s*finally\b/.test(trimmed)) {
    return isDetailed ? '🛡️ Finally block — always executes after try/catch for cleanup operations.' : '🛡️ Finally';
  }

  // Throw / revert
  if (/^\s*(throw|revert|raise)\b/.test(trimmed)) {
    const msg = trimmed.replace(/^\s*(throw|revert|raise)\s*/, '').trim();
    return isDetailed
      ? `⚠️ Throws error: ${msg} — intentionally signals an exceptional condition.`
      : `⚠️ Throw: ${msg}`;
  }

  // Variable/constant declaration
  if (/^\s*(const|let|var|val|let\s+mut)\s+\w+\s*=/.test(trimmed)) {
    const match = trimmed.match(/^\s*(const|let|var|val|let\s+mut)\s+(\w+)\s*=\s*(.+)/);
    if (match) {
      const [_, kw, varName, value] = match;
      const kwLabel = { const: 'Constant', let: 'Variable', var: 'Variable', val: 'Immutable', 'let mut': 'Mutable' }[kw];
      const cleanValue = value.replace(/;?$/, '').trim();
      return isDetailed
        ? `📝 Declares <strong>${kwLabel}: ${varName}</strong> = ${cleanValue} — ${kw === 'const' || kw === 'val' ? 'a value that cannot be reassigned.' : 'a named memory location for storing data.'}`
        : `📝 ${kwLabel}: ${varName} = ${cleanValue}`;
    }
  }

  // Arrow functions
  if (/=>/.test(trimmed) && !trimmed.includes('=> {') && !trimmed.includes('=> (')) {
    return isDetailed ? '🏹 Arrow function expression — concise syntax for defining functions with lexical `this` binding.' : '🏹 Arrow function';
  }

  // Async/await
  if (/^\s*await\b/.test(trimmed)) {
    const expr = trimmed.replace(/^\s*await\s*/, '').replace(/;?$/, '').trim();
    return isDetailed
      ? `⏳ Await: pauses execution until <strong>${expr}</strong> resolves — enables non-blocking async code flow.`
      : `⏳ Await: ${expr}`;
  }

  // Default: generic explanation
  return isDetailed ? `⚙️ Executes statement: ${trimmed.substring(0, 50)}${trimmed.length > 50 ? '...' : ''}` : '';
}

// ============================================
// HISTORY
// ============================================

function saveToHistory(type, item) {
  chrome.storage.local.get([`gitty_${type}_history`], (result) => {
    const key = `gitty_${type}_history`;
    const history = result[key] || [];
    history.unshift(item);
    // Keep max 20 items
    if (history.length > 20) history.pop();
    
    chrome.storage.local.set({ [key]: history }, () => {
      STATE.history[type] = history;
      if (DOM.currentTab === 'history') renderHistory();
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
  const rHist = STATE.history.readme;
  const cHist = STATE.history.code;

  // README history
  if (rHist.length > 0) {
    DOM.histReadme.innerHTML = rHist.map((item, i) => `
      <div class="history-item" data-type="readme" data-index="${i}">
        <div class="history-item-title">📝 ${item.project || 'Untitled README'}</div>
        <div class="history-item-meta">${item.timestamp} · ${item.lang || ''}</div>
      </div>
    `).join('');
    DOM.histReadme.classList.add('active');
  } else {
    DOM.histReadme.innerHTML = '';
    DOM.histReadme.classList.remove('active');
  }

  // Code history
  if (cHist.length > 0) {
    DOM.histCode.innerHTML = cHist.map((item, i) => `
      <div class="history-item" data-type="code" data-index="${i}">
        <div class="history-item-title">💡 ${item.lang || 'Code'} explanation</div>
        <div class="history-item-meta">${item.timestamp} · ${item.preview}</div>
      </div>
    `).join('');
    DOM.histCode.classList.add('active');
  } else {
    DOM.histCode.innerHTML = '';
    DOM.histCode.classList.remove('active');
  }

  // Show empty state if both are empty
  if (rHist.length === 0 && cHist.length === 0) {
    DOM.histEmpty.style.display = 'block';
  } else {
    DOM.histEmpty.style.display = 'none';
  }
}

// ============================================
// FILE SAVE
// ============================================

function saveAsFile(content, filename, extension) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${extension}`;
  a.click();
  URL.revokeObjectURL(url);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  showToast('Copied to clipboard!');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, duration = 2000) {
  const existing = document.querySelector('.gitty-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'gitty-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    z-index: 200;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: toast-in 0.2s ease;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

// ============================================
// SETTINGS
// ============================================

function loadSettings() {
  chrome.storage.local.get([
    'gitty_syntax_theme', 'gitty_animation', 'gitty_auto_copy'
  ], (result) => {
    STATE.settings.syntaxTheme = result.gitty_syntax_theme || 'dracula';
    STATE.settings.defaultAnimation = result.gitty_animation || 'typewriter';
    STATE.settings.autoCopy = result.gitty_auto_copy || false;

    DOM.syntaxTheme.value = STATE.settings.syntaxTheme;
    DOM.settingsSyntaxTheme.value = STATE.settings.syntaxTheme;
    DOM.settingsAnimation.value = STATE.settings.defaultAnimation;
    DOM.settingsAutoCopy.checked = STATE.settings.autoCopy;

    // Set default animation radio
    [...DOM.animRadios].forEach(r => {
      r.checked = r.value === STATE.settings.defaultAnimation;
    });
  });
}

function saveSettings() {
  const theme = DOM.settingsSyntaxTheme.value;
  const anim = DOM.settingsAnimation.value;
  const autoCopy = DOM.settingsAutoCopy.checked;

  chrome.storage.local.set({
    gitty_syntax_theme: theme,
    gitty_animation: anim,
    gitty_auto_copy: autoCopy
  }, () => {
    STATE.settings.syntaxTheme = theme;
    STATE.settings.defaultAnimation = anim;
    STATE.settings.autoCopy = autoCopy;

    DOM.syntaxTheme.value = theme;
    [...DOM.animRadios].forEach(r => {
      r.checked = r.value === anim;
    });

    DOM.settingsPanel.classList.add('hidden');
    showToast('Settings saved!');
  });
}

// ============================================
// EVENT HANDLERS
// ============================================

// Tab switching
DOM.tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    DOM.tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    Object.keys(DOM.tabContents).forEach(key => {
      DOM.tabContents[key].classList.toggle('active', key === tab);
    });

    STATE.currentTab = tab;
    if (tab === 'history') renderHistory();
  });
});

// Generate README
DOM.btnGenerate.addEventListener('click', () => {
  const { readme, animStyle } = generateReadme();
  renderPreview(readme, animStyle);

  // Save to history
  saveToHistory('readme', {
    project: DOM.projectName.value.trim() || 'Untitled',
    lang: DOM.projectLang.value.trim(),
    timestamp: new Date().toLocaleString(),
    content: readme
  });

  if (STATE.settings.autoCopy) {
    copyToClipboard(readme);
  }
});

// Copy README
DOM.btnCopy.addEventListener('click', () => {
  if (STATE.lastReadme) copyToClipboard(STATE.lastReadme);
});

// Save README
DOM.btnSave.addEventListener('click', () => {
  const name = DOM.projectName.value.trim() || 'README';
  saveAsFile(STATE.lastReadme, name, 'md');
  showToast('README saved!');
});

// Toggle preview animation
let previewAnimPaused = false;
DOM.togglePreviewAnim.addEventListener('click', () => {
  previewAnimPaused = !previewAnimPaused;
  const preview = DOM.preview;
  preview.style.animationPlayState = previewAnimPaused ? 'paused' : 'running';
  DOM.togglePreviewAnim.textContent = previewAnimPaused ? '⏸' : '▶';
});

// Explain code
DOM.btnExplain.addEventListener('click', explainCode);

// Clear code
DOM.btnClearCode.addEventListener('click', () => {
  DOM.codeInput.value = '';
  DOM.explanationOutput.classList.add('hidden');
});

// Copy explanation
DOM.btnCopyExplanation.addEventListener('click', () => {
  const text = DOM.explanationBody.innerText;
  copyToClipboard(text);
});

// History tab switching
DOM.histTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.id === 'btn-clear-history') return;
    DOM.histTabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const type = btn.dataset.hist;
    DOM.histReadme.classList.toggle('active', type === 'readme');
    DOM.histCode.classList.toggle('active', type === 'code');
  });
});

// Clear history
DOM.btnClearHistory.addEventListener('click', () => {
  chrome.storage.local.set({
    gitty_readme_history: [],
    gitty_code_history: []
  }, () => {
    STATE.history.readme = [];
    STATE.history.code = [];
    renderHistory();
    showToast('History cleared!');
  });
});

// History item click to restore
document.addEventListener('click', (e) => {
  const item = e.target.closest('.history-item');
  if (!item) return;

  const type = item.dataset.type;
  const index = parseInt(item.dataset.index);

  if (type === 'readme') {
    const entry = STATE.history.readme[index];
    if (entry && entry.content) {
      STATE.lastReadme = entry.content;
      renderPreview(entry.content, STATE.settings.defaultAnimation);
      // Switch to README tab
      [...DOM.tabs].find(b => b.dataset.tab === 'readme')?.click();
      showToast('Restored from history');
    }
  } else if (type === 'code') {
    const entry = STATE.history.code[index];
    if (entry && entry.code) {
      DOM.codeInput.value = entry.code;
      // Switch to explainer tab
      [...DOM.tabs].find(b => b.dataset.tab === 'explainer')?.click();
      showToast('Code restored from history');
    }
  }
});

// Settings
DOM.btnSettings.addEventListener('click', () => {
  DOM.settingsSyntaxTheme.value = STATE.settings.syntaxTheme;
  DOM.settingsAnimation.value = STATE.settings.defaultAnimation;
  DOM.settingsAutoCopy.checked = STATE.settings.autoCopy;
  DOM.settingsPanel.classList.remove('hidden');
});

DOM.btnCloseSettings.addEventListener('click', () => {
  DOM.settingsPanel.classList.add('hidden');
});

DOM.settingsPanel.addEventListener('click', (e) => {
  if (e.target === DOM.settingsPanel) {
    DOM.settingsPanel.classList.add('hidden');
  }
});

DOM.btnSaveSettings.addEventListener('click', saveSettings);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter to generate/explain
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    if (STATE.currentTab === 'readme') {
      DOM.btnGenerate.click();
    } else if (STATE.currentTab === 'explainer') {
      DOM.btnExplain.click();
    }
  }
  // Escape to close settings
  if (e.key === 'Escape') {
    DOM.settingsPanel.classList.add('hidden');
  }
});

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadHistory();
  
  // Add toast animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(-50%) translateY(8px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
});
