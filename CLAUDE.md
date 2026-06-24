# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Single-file HTML5 isometric game ("Wodzirej Karol: Master of the Dancefloor") built as a marketing/SEO asset for a Polish wedding MC business. The entire game — HTML, CSS, and JS — lives in `index.html`. There is no build system, no npm, no compilation step.

## Running locally

Phaser 3 is loaded from CDN, so the page must be served over HTTP (not `file://`):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Any static file server works. There are no tests and no linter configured.

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which deploys the repo root directly to GitHub Pages. No build step — the workflow uploads `.` as the artifact.

## Architecture

Everything inside `<script>` in `index.html` is wrapped in `startGame()`, which is called only after Phaser is lazy-loaded on first user click (PageSpeed optimization).

### Phaser scenes (in scene order)

| Scene | Purpose |
|-------|---------|
| `Boot` | Calls `genAssets()` to generate all textures procedurally, then starts `Hub` |
| `Hub` | Minigame selection screen; only "Load-in" (→ `Setup`) is playable |
| `Setup` | Main minigame — 7 sequential phases of wedding setup |
| `Result` | End screen with score, stars, and CTA link to the real business site |

### Coordinate system

`iso(gx, gy, z)` converts isometric grid coordinates to screen `{x, y}`. `tdepth(gx, gy, bonus)` computes Phaser depth for correct z-ordering. The room grid is `RW=12` × `RH=9` tiles.

### Procedural pixel art (`genAssets`)

All game graphics are drawn programmatically onto canvas textures in `Boot.create()` — there are no image files. The pipeline:
1. `drawChar` / `drawItem` / `drawGarment` / `drawGarmentIcon` — paint pixel rectangles via a `P(x,y,w,h,col)` helper
2. `shadePass` — top-to-bottom brightness gradient
3. `rimPass` — brightens top silhouette edge
4. `outlinePass` — 1px dark border around each sprite

Characters are defined by colour config objects (e.g. `chars.karol`); items and garments are selected by string key. `PXF=2` supersampling is applied.

### Audio

`Audio` is a self-contained IIFE using the Web Audio API — no audio files. It exposes `startMusic()`, `stopMusic()`, `sfx(type)`, `toggleMute()`. Music is a looped chord+melody sequencer at 96 BPM.

### Setup minigame phases

`phaseIndex()` returns 0–7 based on progress counters:

| Phase | Task |
|-------|------|
| 0 | Carry bags from car to staging area |
| 1 | Unpack bags (hold action) |
| 2 | Place equipment on glowing markers |
| 3 | Run cables between devices |
| 4 | Tidy messy cable coils |
| 5 | Return empty bags to car |
| 6 | Change into tailcoat at the changing screen |

Actions are context-sensitive: `getContext()` returns the relevant `{label, fn}` based on player proximity. NPCs spawn on a timer and give side-tasks worth bonus score.

### Modals

Two drag-and-drop modals share the same `this.modalObjs` / `closeModal()` pattern:
- **Dressing modal** (`openDressModal`) — drag garments onto mannequin in dependency order
- **Manager modal** (`openManagerModal`) — sort 6 wedding-schedule blocks into correct order

## Localization (PL/EN i18n)

All user-facing strings live in the `I18N = {pl:{…}, en:{…}}` dictionary at the top of the body `<script>`. Game code reads them via `t('key')`. Never hardcode display text — add a key to **both** locales and use `t()`.

- Language resolution order (`detectLang`): `?lang=pl|en` → `window.WK_LANG` → `localStorage('wk_lang')` → `<html lang>` → browser language.
- `window.WK_LANG` (set near the top of the script) forces a page's language. This is the **only** difference between the two shipped files:
  - `index.html` → `window.WK_LANG = 'pl'`
  - `index-en.html` → `window.WK_LANG = 'en'` (also `<html lang="en">`)
- The client hosts these files directly on their own server (PL site = `index.html`, EN site = `index-en.html`). Same engine, two files — keep them in sync; when editing the game, regenerate `index-en.html` from `index.html` (swap only the `WK_LANG` line and `<html lang>`).
- Syntax-check after edits: extract non-`src`, non-`ld+json` `<script>` blocks and run through `node` `vm.Script`. Optionally assert every `t('…')` key exists in both `pl` and `en`.

## Deploy & ops notes

- **Develop on branch `claude/laughing-brown-sdtwqg`.** Deploy = merge to `main` → Pages workflow runs. Only deploy on explicit user request.
- **Post-squash divergence:** PRs are squash-merged, so after each merge the feature branch diverges and the next PR shows merge conflicts. Fix: `git fetch origin main && git reset --hard origin/main && git cherry-pick <new-commit> && git push --force-with-lease`.
- **Deploy status: use `curl`, NOT the GitHub Actions MCP tool** — `actions_list`/`actions_get` return ~300k-char payloads (full repo metadata) that blow the token budget. Instead:
  `curl -s "https://api.github.com/repos/lolekST1/Wedding-MC-Poland-game/actions/workflows/pages.yml/runs?branch=main&per_page=1" | python3 -c "import sys,json;r=json.load(sys.stdin)['workflow_runs'][0];print(r['head_sha'][:7],r['status'],r['conclusion'])"`
- Live (reference) URLs: PL `https://lolekst1.github.io/Wedding-MC-Poland-game/`, EN `…/index-en.html`. No custom domain (no CNAME).
- Business site: `wodzirejkarol.pl` (external host — not reachable from here; deliver files for manual upload).
