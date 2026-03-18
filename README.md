# augmentous-lab

Deliberately broken React app for testing the [Augmentous audit CLI](https://augmentous.ai).

**Do not fix these issues.** They exist on purpose as scanner targets.

---

## Violation Map (Answer Key)

### Accessibility (a11y) Violations

| File | Line | Rule | Severity | Description |
|------|------|------|----------|-------------|
| `src/components/Hero.jsx` | 9 | `img-alt-missing` | critical | `<img>` with no `alt` attribute |
| `src/components/Hero.jsx` | 14 | `img-alt-empty` | warning | `<img>` with `alt=""` on informational image |
| `src/components/NavBar.jsx` | 12 | `button-no-accessible-name` | critical | `<button>` with icon only, no `aria-label` |
| `src/components/NavBar.jsx` | 18 | `anchor-no-content` | critical | `<a>` tag with no text content or `aria-label` |
| `src/components/ContactForm.jsx` | 10 | `input-no-label` | critical | `<input>` with no associated `<label>` or `aria-label` |
| `src/components/ContactForm.jsx` | 15 | `input-no-label` | critical | `<input>` with placeholder only, no label |
| `src/components/ContactForm.jsx` | 26 | `select-no-label` | critical | `<select>` with no associated label |
| `src/components/CardGrid.jsx` | 15 | `img-alt-missing` | critical | `<img>` in `.map()` loop, no `alt` |
| `src/components/CardGrid.jsx` | 21 | `click-no-keyboard` | warning | `<div onClick>` with no `onKeyDown` or `role` |
| `src/components/Footer.jsx` | 8 | `img-alt-missing` | critical | Logo `<img>` with no `alt` |
| `src/components/Footer.jsx` | 15 | `anchor-opens-new-tab` | warning | `target="_blank"` with no `rel="noopener"` and no warning text |
| `src/pages/Home.jsx` | 6 | `page-no-h1` | warning | Page rendered without an `<h1>` (it's an `<h2>`) |
| `src/pages/About.jsx` | 7 | `duplicate-h1` | warning | Two `<h1>` elements on the same page |
| `src/pages/About.jsx` | 15 | `img-alt-missing` | critical | Team photo with no `alt` |
| `public/index.html` | 2 | `html-no-lang` | critical | `<html>` tag missing `lang` attribute |

### SEO Violations (for future scanner)

| File | Line | Rule | Severity | Description |
|------|------|------|----------|-------------|
| `public/index.html` | 4 | `missing-meta-description` | critical | No `<meta name="description">` |
| `public/index.html` | 3 | `title-generic` | warning | `<title>` is "React App" (generic) |
| `src/pages/Home.jsx` | 6 | `no-h1` | critical | Missing `<h1>` on main landing page |
| `src/pages/About.jsx` | 7 | `duplicate-h1` | critical | Multiple `<h1>` tags |
| `src/components/CardGrid.jsx` | 14 | `missing-structured-data` | warning | Product-like cards with no schema.org markup |

---

## Total Counts

| Category | Critical | Warning | Total |
|----------|----------|---------|-------|
| a11y     | 9        | 5       | 14    |
| SEO      | 3        | 2       | 5     |

---

## Usage

This repo is a scanning target. Point the Augmentous CLI at it:

```bash
node audit.js ./augmentous-lab/src
```
