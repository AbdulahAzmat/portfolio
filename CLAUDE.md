# CLAUDE.md

Project context for Claude Code. Read this before making changes.

---

## Project

Personal portfolio website for **Abdullah Azmat**, final-year BS Data Science student at
FAST NUCES Lahore, currently an onsite intern at NASTP Delta (Lahore, Pakistan).

- **Live site:** https://abdulahazmat.github.io/portfolio/
- **Repo:** https://github.com/AbdulahAzmat/portfolio
- **Local path (owner's machine):** `C:\Users\abdul\Downloads\abdullah-portfolio`

Purpose: professional online presence showcasing projects, research, and background.
Audience is not yet fixed (job hunting vs. general showcase, owner undecided).

---

## Stack

Vanilla **HTML / CSS / JavaScript**. No frameworks, no build step, no package manager.

Two CDN dependencies, both `<script>` tags, no bundler:

| Dependency | Source | Size |
|---|---|---|
| Google Fonts (Inter Tight, IBM Plex Mono) | fonts.googleapis.com | small |
| GSAP 3.13.0 + ScrollTrigger | cdn.jsdelivr.net, pinned | 70.7 KB + 43.1 KB minified |
| PDF.js 3.11.174 | cdn.jsdelivr.net, pinned | 312 KB + 1 MB worker, **loaded only when the résumé is opened** |

GSAP was added at the owner's explicit request. It is a real tradeoff worth restating if it
ever comes up: roughly **114 KB minified** of third-party JavaScript, where the previous
CSS and IntersectionObserver version did most of the same reveals in about forty lines and
zero dependencies. What GSAP genuinely buys is the scroll-scrubbed work that CSS cannot do,
namely progress tied to scroll position rather than to elapsed time. The site is built so a
blocked CDN degrades to a static page, never a blank one (see the `html.anim` pattern in
`DESIGN.md`).

Deployed via **GitHub Pages** (Deploy from a branch → `main` → `/ (root)`).
Push to `main` = deploy. Builds take ~1 minute. No workflow file needed or wanted.

---

## File structure

All files live flat at repo root. GitHub Pages requires `index.html` at root level.

```
index.html               Homepage: hero, about, work carousel, experience, toolkit, now, contact
projects.html            Projects page
research.html            Research page
styles.css               Single shared stylesheet for all pages
script.js                Single shared script for all pages
Abdullah_Azmat_CV.pdf    Résumé, linked from hero button
CLAUDE.md                This file
DESIGN.md                Visual design system and rationale
.claude/launch.json      Local static server config (python -m http.server 4173)
.claude/skills/          Official GSAP agent skills. Gitignored, local only.
.gitignore               Excludes the skills folder and OS noise
```

The GSAP skills are **not committed**. They are 95KB of third-party MIT docs that are not
part of the site, and shipping them from a public repo without their LICENSE would be a
compliance gap. If a future session needs them back:

```bash
npx skills add https://github.com/greensock/gsap-skills
```

**Preview the site with the local server, not `file://`.** Opening the HTML directly breaks
the relative paths to `styles.css` and `script.js`, and the page renders as unstyled
Times New Roman, which looks like a CSS bug but isn't.

Do not introduce subfolders without updating all relative paths. Every page references
`styles.css`, `script.js`, and the CV by bare filename.

---

## Design system

**Monochrome, editorial.** Redesigned from an amber-accented dark theme after the owner
picked four reference portfolios (`pacomepertant.com`, `aikawakenichi.com`,
`podium-studios.com`, `vshslv.com`) and asked for a full design-language change.

See `DESIGN.md` for the full rationale, component notes, and verification steps.

### Colors (CSS custom properties in `:root`)

| Variable | Value | Use |
|---|---|---|
| `--bg` | `#08090c` | Page background |
| `--bg-2` | `#0e1014` | Raised surface: cards, panels |
| `--fg` | `#f5f7fa` | Headings, primary text, inverted button fills |
| `--muted` | `#8b919d` | Body paragraphs |
| `--muted-2` | `#565b66` | Labels, section numbers, metadata |
| `--line` | `#1a1d22` | Hairlines, rules, borders |
| `--line-2` | `#2a2e36` | Hover hairlines, tag/button borders |

**There is no accent color, and that is the entire point of the design.** These are tinted
greys, not pure ones: every value keeps blue as its highest channel with a spread
(`max - min`) of 18 or less, which reads as a cool cast rather than as a blue theme. Adding
a real hue undoes the redesign. Border-radius is `0` everywhere.

Note for future sessions: an older version of `DESIGN.md` said to assert that no colour has
a spread above 12. That check is obsolete, the tint is deliberate. See `DESIGN.md` for the
rule that replaced it.

### Typography

- `Inter Tight`: everything, headings, body, display. Large sizes use `-0.04em` to
  `-0.05em` letter-spacing.
- `IBM Plex Mono`: labels, nav, tags, buttons, section numbers, dates, footer. Never body.

Space Grotesk and Inter were removed in the redesign.

### The 160px rail

Every section shares one grid: a fixed `160px` left column for the section number, then
content. If a new component doesn't sit on that rail it will look wrong even if nothing
else about it is.

One deliberate exception: the homepage work carousel centres its cards rather than aligning
them to the rail, because it is a dial and a dial selects what sits at its centre. Its
heading still sits on the rail. Do not "fix" this back.

---

## Background animation

An animated node-network canvas (dots connected by white lines when within proximity).
This is the site's signature visual and the owner has iterated on it several times.

**Current implementation:**
- `<canvas id="netCanvas">` is the first element inside `<body>` on **all three pages**
- `position: fixed`, `inset: 0`, `z-index: -2`, which spans the full viewport, persists on scroll
- `body::before` renders a radial scrim at `z-index: -1` between canvas and content,
  keeping text readable over the animation

**Tuning dials** (owner adjusts these often):

| What | Where | Current |
|---|---|---|
| Overall visibility | `#netCanvas { opacity }` in styles.css | `0.8` |
| Text-contrast scrim | `body::before` gradient outer stop | `rgba(10,10,10,0.80)` |
| Line brightness | `ctx.strokeStyle` alpha multiplier in script.js | `0.4` |
| Line thickness | `ctx.lineWidth` | `1.1` |
| Dot color/alpha | `ctx.fillStyle` | `rgba(250,250,250,0.85)` |
| Dot size | `ctx.arc` radius multiplier | `2.2` |
| Movement speed | `vx` / `vy` multiplier in `initNodes()` | `0.35` |

The network is now **white, not amber**. White reads much hotter at the same alpha, so line
alpha dropped `0.8 → 0.4`, width `1.4 → 1.1`, and the scrim went `0.72 → 0.80`. Raising line
alpha back toward `0.8` will make body copy hard to read.

Raising canvas opacity makes the network more prominent; raising the scrim's outer alpha
darkens the overlay for readability without dimming the network itself.

`prefers-reduced-motion` is respected throughout: scroll reveals and the animation loop
both check it.

The canvas also publishes a `netStats` object (live link count plus a normalised density)
every frame. The ambient audio reads it to drive its filter cutoff, so the drone tracks how
connected the network currently is. Changing the node count or `linkDist` changes how the
site sounds, not just how it looks.

---

## Ambient audio

A generative ambient pad synthesised with the Web Audio API: sine voices on an A minor 9,
each breathing on its own slow cycle, through a runtime-generated convolution reverb, with a
sparse bell every 16 to 38 seconds. No audio files, nothing to license.

**Do not rebuild it from the integer harmonic series with triangle waves.** That was the
first attempt and it buzzed, because summing integer harmonics is how a sawtooth is made.
`DESIGN.md` has the full explanation.
Toggle sits in the nav on all three pages, **off by default**, choice remembered in
`localStorage` under `portfolio-audio`.

Do not make it autoplay. Browsers block it, and it is the fastest way to get a portfolio
closed. Full implementation notes and the non-negotiable rules are in `DESIGN.md`.

---

## Content status

**All invented placeholder content was removed during the monochrome redesign.** Everything
on the site is now real.

**Real content (done):**
- Name, hero copy, about section, education, location, contact links
- Résumé: hero "View résumé" paints the real `Abdullah_Azmat_CV.pdf` to a canvas with PDF.js
  in an on-site viewer, with Download PDF and Open in new tab inside the panel. The owner
  wants the actual document shown, not an HTML transcription of it. See `DESIGN.md`.
- `projects.html`: Customer 360 and FinSync (2 real projects)
- `research.html`: Evidence-Based Hallucination Detection (1 real entry)
- Skills section in `index.html`: real CV skills
- Experience section in `index.html`: NASTP Delta and Infotech
- Homepage carousel: the 3 real work items plus a "See all work" end card, presented as a
  rotating dial with a `01 / 04` position readout
- Long-form write-ups for all 3 items, in `.card-full` blocks inside each card, shown in the
  expanding detail panel when a card is clicked

**Removed:** the Writing section and its 3 invented article titles. There was no real
writing to put there. Re-add the section only when actual posts exist.

**Still missing:** every project and research row has an empty `.links` div because no repo
or demo URLs were available. Rows collapse gracefully without them, but adding real GitHub
links is the highest-value next edit. Do **not** fill these with `href="#"` placeholders,
the redesign deliberately removed every dead link.

**Content is thin, and the design amplifies that.** Three items is a short carousel and a
one-row research page. The reference sites carry their restraint on heavy imagery; this one
has none, so more real work is the main lever for making it feel full.

**Source material from the owner's CV:**

| Item | Details | Belongs in |
|---|---|---|
| Evidence-Based Hallucination Detection in LLMs | Python, NLP, RAG, semantic similarity. Retrieval-augmented verification framework detecting factual hallucinations. May 2026 | research.html |
| Customer 360: E-Commerce Analytics | Apriori, FP-Growth, K-Prototypes, hierarchical clustering w/ Gower distance on Olist Brazilian e-commerce dataset. May 2026 | projects.html |
| FinSync: Banking Application | C#, .NET Core, MySQL. Led UI design, relational DB with ACID compliance. Feb to May 2025 | projects.html |
| Chatbot Development Intern, Infotech | Jul to Aug 2025. Prototype chatbot, API-driven conversation workflows | experience/about |

**Real skills from CV:** Python, C++, C#, Java, SQL · React.js, Django, .NET Core ·
Pandas, NumPy, Scikit-learn, Matplotlib, Seaborn, Apriori, FP-Growth

---

## Contact details used on the site

- Email: `abdullahazmat.w@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/abdullah-azmat-236230327`
- GitHub: `https://github.com/AbdulahAzmat` (note: **one L** in "Abdulah", this is the
  actual username and a frequent source of broken links)

**Privacy note:** the CV in the repo is a deliberately phone-number-free version. The repo
is public. Never commit a CV or any file containing the owner's phone number.

---

## Working with this owner

These are established preferences. Following them avoids repeated friction:

- **Always provide complete replacement files, never diffs or partial snippets.** The owner
  has difficulty locating specific lines in HTML and prefers to overwrite whole files.
- The owner is **new to git and GitHub** but has now completed the full workflow
  (init → add → commit → branch rename → remote add → push → Pages setup) hands-on.
  Basics don't need re-explaining, but exact commands are still appreciated.
- Explain *why*, not just *what*. The owner asks good follow-up questions about how things
  work (e.g. why hosting needs GitHub at all) and values real answers over hand-waving.
- Don't oversell. When a feature has a real tradeoff, say so plainly.

---

## Deployment workflow

```bash
git add .
git commit -m "describe the change"
git push
```

Live site updates ~1 minute later. Hard refresh (`Ctrl + Shift + R`) or use incognito to
bypass browser cache when verifying.

Notes:
- The `LF will be replaced by CRLF` warning on Windows is harmless; ignore it.
- Local branch is `main` (was renamed from `master` during setup).
- Remote `origin` is already configured, so it never needs re-adding.

---

## Known open items

1. **Add real GitHub / demo links** to the project and research rows (empty `.links` divs).
   Also: more real projects, since three items is thin for a carousel and a research page.
2. **URL is hard to share.** Two options discussed, owner hasn't decided:
   - Free: rename repo to `AbdulahAzmat.github.io` → drops the `/portfolio` path, but
     the username's missing "L" still makes it awkward to dictate.
   - Paid: custom domain (~$12/yr, e.g. `abdullahazmat.com`) via the Custom domain field
     in Settings → Pages.
3. **Self-service project entry.** Owner wants to add projects from the site itself rather
   than editing code. Deferred, not abandoned. Options discussed:
   - Decap CMS: form at `/admin`, GitHub OAuth login, commits to this repo. Recommended:
     no database, no new credentials to secure.
   - Supabase/Firebase: real backend, instant saves, but introduces auth rules that must
     be configured correctly.
   - localStorage: rejected; data would be browser-local and invisible to visitors.
4. **Case-study pages** for the strongest 2 or 3 projects, discussed as a future improvement
   once real project content exists.

---

## Security posture

The site is fully static: no backend, no database, no auth, no secrets in the codebase.
The realistic attack surface is the owner's GitHub account, not the site itself.

- Keep 2FA enabled on GitHub.
- Never commit API keys, tokens, or credentials, since anything in HTML/JS is publicly readable.
- If a CMS or backend is added later, that's when input validation and auth rules become
  genuinely necessary. Flag it at that point.
