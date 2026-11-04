# beatbaah.github.io

Portfolio of Beatrice Baah, Software & AI Engineer. Live at https://beatbaah.github.io

Plain HTML, CSS and JavaScript (ES modules). No build step, no frameworks. GitHub Pages serves the `main` branch.

| File | What it holds |
|---|---|
| `index.html` | All page content. Works with JavaScript off. |
| `styles.css` | Colour tokens on `:root`, layout, components. |
| `js/data.js` | Content the terminal prints (keep in step with `index.html`; a test checks project ids match). |
| `js/terminal-core.js` | Terminal commands: pure logic, unit-tested. |
| `js/terminal-ui.js` | Terminal wiring: typing, history, Tab completion, chips. |
| `js/effects.js` | Decrypt headings, scroll reveals, progress bar, card spotlight, testimonials. |

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Tests

```bash
npm install
npm test          # unit tests (Node) + browser tests (Playwright/Chromium)
```

## Adding a project

1. Add an `<article class="card project" id="project-<slug>">` (featured) or an `<li id="project-<slug>">` (more work) to `index.html`.
2. Add the same `slug` to `featured` or `more` in `js/data.js`, so `open <slug>` works in the terminal.
3. Images go in `assets/projects/` as WebP (~1200px wide, plus an `-800` version for featured cards).
