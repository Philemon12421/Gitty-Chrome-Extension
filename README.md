<div align="center">

# Gitty — AI Security Shield, Code Auditor & README Pro

**Always-on Phishing Defense, Deep Code Vulnerability Audits, and Production-Grade README Studio right inside Google Chrome.**

![Manifest](https://img.shields.io/badge/manifest-v3-7c3aed?style=flat-square)
![JavaScript](https://img.shields.io/badge/javascript-vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)
![Status](https://img.shields.io/badge/protection-always--on-22c55e?style=flat-square)
![Stars](https://img.shields.io/github/stars/Philemon12421/Gitty-Chrome-Extension?style=flat-square&color=7c3aed)

</div>

<br/>

## What is Gitty?

**Gitty** is an all-in-one developer security shield and productivity extension built for Google Chrome (Manifest V3). It operates three powerhouse features in a single lightweight, zero-dependency package:

1. 🛡️ **Always-On Phishing & Web Attack Defense**: Real-time behavioral and heuristic threat protection across every visited tab. Catches brand typosquatting, IDN homograph spoofing, fake Web3 wallet harvesters, unencrypted credential forms, and cross-origin credential exfiltration with desktop notifications and isolated shadow-DOM warning alerts.
2. 🔬 **Deep Code Security Test & Project Auditor**: Static security testing for code snippets, individual files, and entire GitHub repositories. Maps findings to OWASP Top 10 vulnerabilities, calculates Shannon entropy for secret detection, provides interactive Before/After remediation diffs, and exports audit reports as Markdown or JSON.
3. 📝 **Pro README Studio**: Multi-layout template generation (Modern Showcase, Minimal Developer, Enterprise Standard, CLI & Tooling, AI & Data Science), interactive tech stack chip picker, customizable Table of Contents, 4 CSS keyframe animation styles, and instant export to `.md` or styled `.html`.

<br/>

<div align="center">
<table>
<tr>
<td width="25%" align="center">

**🛡️ Phishing Defense Shield**  
Always-on real-time heuristic & threat alerts for every webpage

</td>
<td width="25%" align="center">

**🔬 Code Security Test**  
OWASP audit, Shannon entropy secret detector & Before/After diffs

</td>
<td width="25%" align="center">

**📝 Pro README Studio**  
5 layout templates, interactive tech stack chips & HTML/MD export

</td>
<td width="25%" align="center">

**🕒 History & Restore**  
Auto-saves your last 30 READMEs, security scans & blocked threats

</td>
</tr>
</table>
</div>

<br/>

## Features

<details open>
<summary><b>🛡️ Always-On Phishing Attack Attempt Detector & Web Defense</b></summary>
<br/>

- **Always-On Background Monitoring**: Runs unobtrusively on all tabs and pages (`http://*/*` and `https://*/*`) without degrading browser performance.
- **Immediate Desktop Alerts**: Triggers native `chrome.notifications` desktop notifications whenever an attack or high-risk attempt is detected.
- **Actionable Red Warning Badge**: Updates the extension toolbar badge with a high-visibility `!` alert badge (`#ff3b30`) whenever an active threat is intercepted.
- **Isolated Shadow-DOM Warning Banner**: Injects an isolated shadow-root warning directly onto flagged pages that visited CSS cannot break or suppress. Provides instant **"Leave Site Safely"** and **"Dismiss"** actions.
- **10 Heuristic & Behavioral Threat Checks**:
  - 🌐 **IDN Homograph & Punycode Attacks**: Detects Cyrillic and internationalized lookalike characters (`xn--`) mimicking major services.
  - 🎭 **Brand Typosquatting & Impersonation**: Flags unauthorized domains spoofing GitHub, Google, Microsoft, Apple, PayPal, Binance, Coinbase, MetaMask, Discord, and more.
  - 🪺 **Deceptive Subdomain Nesting**: Catches trick hostnames like `github.com.attacker-server.net`.
  - 🔢 **Raw IP Login Harvesting**: Flags numeric IPv4/IPv6 hosts presenting password input forms.
  - ⚠️ **High-Risk TLDs + Auth Keywords**: Identifies dangerous TLDs (`.xyz`, `.top`, `.click`, `.tk`, `.monster`, etc.) paired with sensitive words (`login`, `verify`, `airdrop`, `wallet`, `token`).
  - 🔓 **Unencrypted HTTP Password Submissions**: Warns against plaintext password fields on insecure `http://` pages.
  - 📤 **Cross-Origin Form Exfiltration**: Intercepts forms where credentials submit to external third-party hosts.
  - 🦊 **Web3 Seed Phrase Harvesters**: Detects deceptive forms requesting 12/24-word recovery phrases or private keys.
  - 📜 **Data / Pseudo Protocols**: Flags disguised `data:` or `javascript:` URI credential captures.
  - 👁️ **Dynamic MutationObserver**: Continually watches for stealthy password fields added after page load by client-side scripts.
- **Dedicated Shield Dashboard in Popup**:
  - **Live Site Safety Inspector**: Displays the active tab's domain, real-time safety status, and 0–100 threat score gauge.
  - **Heuristic Checklist**: Evaluates SSL/TLS encryption, domain credibility, credential safety, and data flow.
  - **Recent Threat Defense Log**: Displays blocked attacks with timestamps and details, with one-click log clearing.

</details>

<details open>
<summary><b>🔬 Code Security Test & Project Auditor</b></summary>
<br/>

- **Two Audit Modes**:
  - **Code / File Scan**: Audit individual snippets or source files across 15+ languages (JavaScript, TypeScript, Python, Go, Rust, Java, C/C++, PHP, Ruby, Solidity, Bash, SQL, HTML).
  - **Whole Project / Repo Scan**: Audit entire GitHub repositories via the GitHub REST API to scan directory trees for committed sensitive files, missing security files, and workflow risks.
- **Vulnerability & Threat Detection Engine**:
  - 🔑 **Shannon Entropy & Secret Detection**: Uses mathematical Shannon entropy analysis (`H >= 4.5`) paired with high-precision regexes to detect exposed AWS keys, GitHub tokens, Stripe secrets, Slack tokens, Google Cloud API keys, private RSA/ED25519 keys, database URIs with passwords, and JWTs.
  - 💉 **Injection Vulnerabilities (OWASP A03)**: Detects SQL Injection (string concatenation, template strings, f-strings), Command Injection (`child_process.exec`, `os.system`, `subprocess` with `shell=True`, PHP `exec`), arbitrary Code Execution (`eval()`, dynamic `Function`), Cross-Site Scripting (XSS via `innerHTML`, `outerHTML`, `document.write`, React `dangerouslySetInnerHTML`), and Path Traversal (`../` in file operations).
  - 📦 **Insecure Deserialization (OWASP A08)**: Identifies unsafe Python `pickle.loads()` and unconstrained `yaml.load()` without SafeLoader.
  - 🔒 **Cryptographic Failures (OWASP A02)**: Flags disabled TLS validation (`rejectUnauthorized: false`, `verify=False`), weak hash algorithms (MD5 / SHA-1), cryptographically weak PRNGs (`Math.random()` in security contexts), plaintext HTTP URLs, and permissive wildcard CORS (`*`).
  - ⛓️ **Smart Contract & Memory Safety**: Flags Solidity reentrancy vulnerabilities (`.call{value:}` before state updates), `tx.origin` authentication, and unsafe C/C++ memory functions (`strcpy`, `gets`, `sprintf`).
  - 📁 **Repository Hygiene**: Detects committed `.env` files, private keys, missing `SECURITY.md` vulnerability disclosure policies, missing `.gitignore`, and missing lockfiles.
- **Security Score & Risk Grades**: Calculates an overall 0–100 security score with letter grades (**A**, **B**, **C**, **D**, **F**) and severity breakdowns (Critical, High, Medium, Low/Info).
- **Interactive Before / After Remediation Diffs**: Inspect side-by-side color-coded diffs directly inside finding cards showing exactly what vulnerable code to remove (`-`) and what safe implementation to add (`+`).
- **Interactive Severity Filters**: Filter findings by Critical, High, Medium, or Low with a single click.
- **Export Options**: Copy summary stats, copy Markdown report, download `security-audit-report.md`, or export structured findings as JSON for CI/CD ingestion.
- **Preloaded Test Samples**: One-click vulnerability samples for rapid testing (`SQLi + XSS + Secrets`, `Python RCE + Pickle`, `Cloud Keys + TLS`, `Solidity Reentrancy`, `Clean Code`).

</details>

<details open>
<summary><b>📝 Pro README Studio</b></summary>
<br/>

- **5 Multi-Layout Architecture Templates**:
  - 🌟 **Modern Showcase**: Badge-rich hero, animated preview cards, architecture breakdown, and full feature showcase.
  - ⚡ **Minimal Developer**: Fast, clean, direct installation, usage snippets, and concise configuration tables.
  - 🏢 **Enterprise Standard**: Compliance sections, architecture diagrams, security policy, Docker steps, and contribution guidelines.
  - 💻 **CLI & Tooling**: Terminal command references, flag tables, configuration examples, and shell script one-liners.
  - 🧠 **AI & Data Science**: Model benchmarks, dataset citations, inference pipelines, and GPU installation flags.
- **Interactive Tech Stack Chip Picker**: One-click multi-select chips across Frontend, Backend, Database, Cloud/DevOps, and AI/ML categories that automatically format verified badges in the generated README.
- **Table of Contents**: Toggleable auto-generated Markdown Table of Contents linking to major sections.
- **4 Animation Styles**: Typewriter · Fade In · Slide Up · Neon Glow.
- **Import from GitHub**: Paste any GitHub repository URL to auto-populate project name, description, primary language, and license via the GitHub API.
- **Multiple Export Formats**: Copy markdown to clipboard, download `.md`, or export as a styled standalone `.html` preview document.

</details>

<details>
<summary><b>🎨 Light & Dark Themes & Polished UX</b></summary>
<br/>

- One-click dark/light mode toggle in the top bar, remembered across sessions.
- Smooth hover animations, glowing badge indicators, custom scrollbars, and tactile active states across all buttons and inputs.
- High-contrast visual cues for Critical, High, Medium, and Low severity badges.

</details>

<details>
<summary><b>🕒 History & Instant Restoration</b></summary>
<br/>

- Auto-saves your last 30 generated READMEs, security audits, and detected threats in `chrome.storage.local`.
- Restore any previous README or security audit (code, target repo, and findings) in a single click.
- Clear history option to maintain privacy.

</details>

<br/>

## Installation

```bash
# 1. Clone or download this repository:
git clone https://github.com/Philemon12421/Gitty-Chrome-Extension.git

# 2. Open Google Chrome and navigate to:
chrome://extensions/

# 3. Turn on "Developer mode" (toggle in the top-right corner)

# 4. Click "Load unpacked"

# 5. Select the project directory (Gitty-Chrome-Extension/)
```

<br/>

## Usage Guide

<table>
<tr>
<th width="33%">1. Phishing Defense Shield</th>
<th width="33%">2. Code Security Test</th>
<th width="33%">3. Pro README Studio</th>
</tr>
<tr>
<td valign="top">

- Protection is **always active** across all tabs.
- When visiting a suspicious or malicious site:
  - A desktop warning notification appears.
  - The Gitty icon badge displays `!`.
  - An in-page warning banner offers safe exit.
- Open the **Phishing Shield** tab to inspect the current site's 0–100 threat score and view blocked attack history.

</td>
<td valign="top">

1. Open the **Security Test** tab.
2. Select **Code / Snippet** or **Whole Repo / Project**.
3. Paste code, pick a language, or load a sample.
4. Click **Run Security Test** (or **Audit Repo**).
5. Inspect the score, OWASP tags, and **Before/After diffs**.
6. Click **Copy Fix** or export as `.md` / `.json`.

</td>
<td valign="top">

1. Open the **README** tab.
2. *(Optional)* Click **Fetch** with a GitHub repo URL.
3. Select a **Template** and toggle **Tech Stack Chips**.
4. Choose an animation style.
5. Click **Generate README**.
6. Preview the result, copy, or download as `.md` or `.html`.

</td>
</tr>
</table>

<br/>

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` / `⌘` `+ Enter` | Run Security Test or Generate README (based on active tab) |
| `Esc` | Close settings panel |
| `Tab` | Insert 2-space indentation inside code editor |

<br/>

## Saving & Exporting

| Action | Target | Result |
|---|---|---|
| **Copy Summary** | Security Report | Copies compact audit score and issue totals |
| **Copy Markdown** | Security Report | Copies complete vulnerability markdown report with fixes |
| **Download .md** | Security Report | Downloads `security-audit-report.md` |
| **Export JSON** | Security Report | Downloads structured `security-audit-report.json` for CI/CD |
| **Copy Fix** | Finding Card | Copies the recommended safe replacement code snippet |
| **Copy README** | README Preview | Copies full README markdown to clipboard |
| **Save .md** | README Preview | Downloads `project-name.md` |
| **Export HTML** | README Studio | Downloads styled `project-name.html` preview document |

<br/>

## Built With

<div align="center">

![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![Chrome Extension](https://img.shields.io/badge/-Manifest%20V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)

</div>

Built with pure Vanilla JavaScript (ES6+), Manifest V3, zero build steps, and zero external runtime dependencies. Fast, secure, and self-contained.

<br/>

---

<div align="center">

Made with care by [Philemon Osei Kusi](https://github.com/Philemon12421)

</div>
