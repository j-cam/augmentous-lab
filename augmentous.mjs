#!/usr/bin/env node

/**
 * augmentous.mjs — Scan a React codebase for a11y issues, propose AI fixes.
 *
 * Setup:  npm install eslint eslint-plugin-jsx-a11y
 * Scan:   node augmentous.mjs ./src
 * Fix:    ANTHROPIC_API_KEY=sk-ant-... node augmentous.mjs ./src --fix
 */
import 'dotenv/config';
import { ESLint } from 'eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import fs from 'fs';
import path from 'path';
import https from 'https';


// ── 1. SCAN — Run ESLint with jsx-a11y, return structured findings ──────

async function scan(targetDir) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      files: ['**/*.{js,jsx,tsx}'],
      plugins: { 'jsx-a11y': jsxA11y },
      languageOptions: {
        parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 'latest', sourceType: 'module' },
      },
      rules: jsxA11y.configs.strict.rules,
    },
  });

  const results = await eslint.lintFiles([path.join(targetDir, '**/*.{jsx,tsx,js}')]);
  // console.log('Files linted:', results.length);
  // console.log('First file:', results[0]?.filePath);
  // console.log('Messages:', results[0]?.messages?.length);

  return results.flatMap((r) =>
    r.messages
      .filter((m) => m.ruleId?.startsWith('jsx-a11y/'))
      .map((m) => ({
        file: path.relative(targetDir, r.filePath),
        absPath: r.filePath,
        line: m.line,
        rule: m.ruleId,
        message: m.message,
      }))
  );
}

// ── 2. FIX — Send a finding + code context to Claude, get a patch back ──

async function proposeFix(finding) {
  const lines = fs.readFileSync(finding.absPath, 'utf-8').split('\n');
  const start = Math.max(0, finding.line - 6);
  const end = Math.min(lines.length, finding.line + 5);

  const snippet = lines.slice(start, end).map((l, i) => {
    const num = start + i + 1;
    return `${num === finding.line ? '>>' : '  '} ${num} | ${l}`;
  }).join('\n');

  const prompt = `You are an a11y remediation engine. Fix ONLY the line marked >> below.

File: ${finding.file} | Line: ${finding.line} | Rule: ${finding.rule}
Message: ${finding.message}

\`\`\`jsx
${snippet}
\`\`\`

Respond with ONLY:
ORIGINAL: <the original line>
FIXED: <the corrected line>
WHY: <one sentence>`;

  const body = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          const parsed = JSON.parse(data);
          if (res.statusCode !== 200) return reject(new Error(parsed.error?.message || data));
          resolve(parsed.content.map((b) => b.text).join(''));
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── 3. RUN — Wire scan → fix together ───────────────────────────────────

const targetDir = process.argv[2];
const wantFix = process.argv.includes('--fix');

if (!targetDir) {
  console.log('Usage: node augmentous.mjs <dir> [--fix]');
  process.exit(1);
}

const findings = await scan(path.resolve(targetDir));

if (findings.length === 0) {
  console.log('\n✅ No a11y issues found.\n');
  process.exit(0);
}

// Print scan results
console.log(`\n Found ${findings.length} a11y issue(s):\n`);
for (const f of findings) {
  console.log(`  ${f.file}:${f.line}  ${f.rule}`);
  console.log(`    ${f.message}\n`);
}

// If --fix, send each finding to Claude
if (wantFix) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Set ANTHROPIC_API_KEY to use --fix mode.');
    process.exit(1);
  }

  console.log('── Proposing fixes ─────────────────────────────────\n');

  for (const f of findings) {
    console.log(`${f.file}:${f.line} — ${f.rule}`);
    try {
      const fix = await proposeFix(f);
      console.log(fix);
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }
    console.log('');
  }
}
