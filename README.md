# augmentous-lab

`augmentous-lab` is a deliberately flawed React app used to test accessibility scanning and AI-assisted remediation workflows.

The repository includes:

- a sample app in `src/` with intentional a11y issues
- a scanner script in `augmentous.mjs` that runs `eslint` + `eslint-plugin-jsx-a11y`
- an optional `--fix` mode that asks Anthropic for suggested line-level fixes

## Requirements

- Node.js 18+
- npm
- optional: Anthropic API key for `--fix` mode

## Install

```bash
npm install
```

## Run the sample app

```bash
npm start
```

## Scan for accessibility issues

```bash
node augmentous.mjs ./src
```

This prints findings in the form:

```text
<relative-file>:<line>  <rule>
  <message>
```

## Ask for fix suggestions (optional)

1. Add an API key in `.env`:

```bash
ANTHROPIC_API_KEY=your-key-here
```

2. Run:

```bash
node augmentous.mjs ./src --fix
```

For each finding, the script requests a minimal single-line suggestion and prints:

```text
ORIGINAL: <original line>
FIXED: <corrected line>
WHY: <one sentence reason>
```

## Notes

- The app is intentionally broken as a scanner target.
- `--fix` mode prints suggestions only; it does not modify files automatically.
