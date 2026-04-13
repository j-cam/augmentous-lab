#!/usr/bin/env node

/**
 * augmentous-fix.js — Layer 2: LLM-Assisted Fix Proposal
 *
 * Takes a scanner finding (file + line + rule) and asks Claude to propose
 * a fix. This is the first "AI moment" — deterministic detection feeds
 * into generative remediation.
 *
 * Usage:
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   node augmentous-fix.js ./src/components/Hero.jsx 9 img-alt-missing
 *
 * Or pipe from the scanner (future integration):
 *   node audit.js ./src --json | node augmentous-fix.js --from-report
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1024;
const CONTEXT_LINES = 10; // lines above and below the finding to include

// ---------------------------------------------------------------------------
// Rule metadata — gives the LLM context about what's wrong and what good
// looks like. This is what turns a generic "fix this" into a precise ask.
// ---------------------------------------------------------------------------

const RULE_CONTEXT = {
  'img-alt-missing': {
    problem: 'The <img> element has no alt attribute. Screen readers cannot describe this image to users.',
    fix_guidance: 'Add a descriptive alt attribute. If the image is decorative, use alt="". If informational, describe the image content in 5-15 words.',
    good_example: '<img src="/hero.jpg" alt="Product lineup displayed on a wooden table" />',
    bad_example: '<img src="/hero.jpg" />',
  },
  'img-alt-empty': {
    problem: 'The <img> element has an empty alt attribute (alt=""). This is correct for decorative images, but this image appears to be informational based on context.',
    fix_guidance: 'If the image conveys information, replace alt="" with a descriptive alt text. If it is purely decorative, keep alt="".',
    good_example: '<img src="/featured-product.jpg" alt="Featured widget, currently 20% off" />',
    bad_example: '<img src="/featured-product.jpg" alt="" />',
  },
  'button-no-accessible-name': {
    problem: 'The <button> element has no text content or aria-label. Screen readers will announce it as "button" with no context.',
    fix_guidance: 'Add an aria-label describing the button action, or add visually hidden text inside the button.',
    good_example: '<button aria-label="Toggle navigation menu">',
    bad_example: '<button><svg>...</svg></button>',
  },
  'input-no-label': {
    problem: 'The form input has no associated <label> element or aria-label. Users relying on assistive technology cannot identify this field.',
    fix_guidance: 'Add a <label> element with a matching htmlFor/id pair, or add an aria-label attribute directly to the input.',
    good_example: '<label htmlFor="email">Email</label>\n<input id="email" type="email" />',
    bad_example: '<input type="email" placeholder="Enter email" />',
  },
};

// ---------------------------------------------------------------------------
// Extract code context around the finding
// ---------------------------------------------------------------------------

function getCodeContext(filePath, lineNumber) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const start = Math.max(0, lineNumber - CONTEXT_LINES - 1);
  const end = Math.min(lines.length, lineNumber + CONTEXT_LINES);

  const contextLines = lines.slice(start, end).map((line, i) => {
    const num = start + i + 1;
    const marker = num === lineNumber ? ' >> ' : '    ';
    return `${marker}${String(num).padStart(4)} | ${line}`;
  });

  return {
    snippet: contextLines.join('\n'),
    fullFile: content,
    fileName: path.basename(filePath),
    startLine: start + 1,
    endLine: end,
  };
}

// ---------------------------------------------------------------------------
// Build the prompt — this is the critical piece. A sloppy prompt gets a
// sloppy fix. A precise prompt with rule context, code context, and clear
// output format gets a deployable patch.
// ---------------------------------------------------------------------------

function buildPrompt(filePath, lineNumber, ruleId, context) {
  const ruleMeta = RULE_CONTEXT[ruleId] || {
    problem: `Violation of rule: ${ruleId}`,
    fix_guidance: 'Fix the accessibility violation on the indicated line.',
    good_example: 'N/A',
    bad_example: 'N/A',
  };

  return `You are an accessibility remediation engine. Your job is to propose a minimal, correct fix for a specific a11y violation found by a static scanner.

## Finding

- **File:** ${filePath}
- **Line:** ${lineNumber}
- **Rule:** ${ruleId}
- **Problem:** ${ruleMeta.problem}

## Fix Guidance

${ruleMeta.fix_guidance}

**Good example:**
\`\`\`jsx
${ruleMeta.good_example}
\`\`\`

**Bad example (what we have now):**
\`\`\`jsx
${ruleMeta.bad_example}
\`\`\`

## Code Context

The line marked with \`>>\` is the violation. Surrounding code is included for context.

\`\`\`jsx
${context.snippet}
\`\`\`

## Your Task

1. Propose a fix for ONLY the indicated line (and any immediately adjacent lines that must change for the fix to work).
2. Infer the best alt text / aria-label / label from the surrounding code context. Use real, descriptive text — not placeholder like "image description here".
3. Output your response in this exact format:

\`\`\`
ORIGINAL:
<the original line(s) exactly as they appear>

FIXED:
<the corrected line(s)>

EXPLANATION:
<one sentence explaining what you changed and why>
\`\`\`

Do not fix anything other than the reported violation. Do not refactor surrounding code. Minimal, surgical fix only.`;
}

// ---------------------------------------------------------------------------
// Call the Claude API — raw https, no SDK dependency
// ---------------------------------------------------------------------------

function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode !== 200) {
            reject(
              new Error(
                `API error ${res.statusCode}: ${parsed.error?.message || data}`
              )
            );
            return;
          }
          // Extract text from the response content blocks
          const text = parsed.content
            .filter((block) => block.type === 'text')
            .map((block) => block.text)
            .join('\n');
          resolve({
            text,
            inputTokens: parsed.usage?.input_tokens,
            outputTokens: parsed.usage?.output_tokens,
            model: parsed.model,
          });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`Request failed: ${e.message}`)));
    req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Parse args
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('\nUsage: node augmentous-fix.js <file> <line> <rule>\n');
    console.error('Example:');
    console.error('  node augmentous-fix.js ./src/components/Hero.jsx 9 img-alt-missing\n');
    console.error('Requires: ANTHROPIC_API_KEY environment variable\n');
    process.exit(1);
  }

  if (!ANTHROPIC_API_KEY) {
    console.error('\n❌ ANTHROPIC_API_KEY environment variable is not set.\n');
    console.error('Get your key at: https://console.anthropic.com/\n');
    process.exit(1);
  }

  const [filePath, lineStr, ruleId] = args;
  const lineNumber = parseInt(lineStr, 10);

  if (isNaN(lineNumber)) {
    console.error(`\n❌ Invalid line number: ${lineStr}\n`);
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`\n❌ File not found: ${resolvedPath}\n`);
    process.exit(1);
  }

  // Step 1: Extract code context
  console.log('\n── Augmentous Fix Proposal ──────────────────────────────\n');
  console.log(`  File:  ${filePath}`);
  console.log(`  Line:  ${lineNumber}`);
  console.log(`  Rule:  ${ruleId}`);

  const context = getCodeContext(resolvedPath, lineNumber);

  console.log(`\n── Code Context (lines ${context.startLine}–${context.endLine}) ──\n`);
  console.log(context.snippet);

  // Step 2: Build prompt and call Claude
  const prompt = buildPrompt(filePath, lineNumber, ruleId, context);

  console.log('\n── Calling Claude API... ────────────────────────────────\n');

  try {
    const response = await callClaude(prompt);

    console.log(response.text);
    console.log('\n── Usage ───────────────────────────────────────────────\n');
    console.log(`  Model:         ${response.model}`);
    console.log(`  Input tokens:  ${response.inputTokens}`);
    console.log(`  Output tokens: ${response.outputTokens}`);
    console.log('');
  } catch (err) {
    console.error(`\n❌ ${err.message}\n`);
    process.exit(1);
  }
}

main();
