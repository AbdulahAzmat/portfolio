# DESIGN.md

Visual design system for the Abdullah Azmat portfolio. This documents *why* the site looks
the way it does, so future changes stay coherent instead of drifting into a generic template.

All values live in `styles.css`. This file is the reference, not a second source of truth.
If the two disagree, the stylesheet wins.

---

## Design direction

**Monochrome, editorial, restrained.** The site should read like a well-set page in a design
annual, not a consumer landing page.

The direction was set by studying four reference portfolios the owner picked
(`pacomepertant.com`, `aikawakenichi.com`, `podium-studios.com`, `vshslv.com`). What they
share, and what this site now copies:

- **No accent hue.** Hierarchy comes from size, weight, and grey level, never from colour.
- **Cool-tinted greys, not pure ones.** `#08090c` and `#f5f7fa`. Never pure `#000` or `#fff`
  on both ends; pure values read cheap and make text harsh, and perfectly neutral greys read
  flat. See the spread rule under Colour.
- **Display type is large and tight.** Negative letter-spacing (`-0.04em` to `-0.05em`) at
  large sizes so a headline reads as one shape.
- **Monospace as meta only.** IBM Plex Mono is confined to labels, nav, tags, numbers, and
  buttons. It never sets a paragraph.
- **Hairlines, not cards.** Structure comes from 1px rules and whitespace, not from filled
  panels with rounded corners.
- **Sharp corners.** Border-radius is `0` everywhere by design.

Things to avoid: any accent colour, gradients on text, drop shadows, rounded corners,
emoji as iconography, filled surface ramps.

> **Honest caveat.** Those reference sites are by a motion designer, a photographer, a video
> studio, and a brand designer. Their restraint works because heavy imagery carries the
> page. This site has no imagery. The typography and spacing therefore have to do all the
> work, which means the type scale and whitespace are load-bearing, not decorative. Adding
> real project imagery later would let the layout breathe as intended.

---

## Colour

Defined as custom properties on `:root`. **Always reference the variable, never hardcode a
hex value.**

| Variable | Hex | Role |
|---|---|---|
| Variable | Hex | Spread | Role |
|---|---|---|---|
| `--bg` | `#08090c` | 4 | Page background |
| `--bg-2` | `#0e1014` | 6 | Raised surface: cards, panels |
| `--fg` | `#f5f7fa` | 5 | Headings, primary copy, inverted button fills |
| `--muted` | `#8b919d` | 18 | Body paragraphs, descriptions |
| `--muted-2` | `#565b66` | 16 | Labels, section numbers, metadata |
| `--line` | `#1a1d22` | 8 | Hairlines, section rules, card borders |
| `--line-2` | `#2a2e36` | 12 | Hairline hover state, tag and button borders |

Seven values. Still **no accent hue**, but these are tinted greys rather than pure ones:
every value carries a slight cool cast, with the blue channel highest and red lowest. That
plus the added `--bg-2` step is what stops panels reading as flat black.

"Spread" above is `max(r,g,b) - min(r,g,b)`. The rule that replaced the old strict-neutral
check: **every colour must keep blue as its highest channel, and spread must stay at or
under about 18.** Below that it reads as a tinted grey. Push it past roughly 25 and it
starts reading as a blue theme, which is the amber-era look this design replaced.

The old check asserted spread never exceeded 12 and expected an empty result set. That is
now obsolete by design. If you re-run a hue scan, expect the values above, and treat *warm*
colours (red channel highest) or anything over 18 as the actual regression.

Hover states move up the grey ramp or invert to `--fg` on `--bg`. They never introduce colour.

---

## Typography

Two families. Loaded from Google Fonts.

| Family | Weights | Used for |
|---|---|---|
| **Inter Tight** | 400 to 600 | Everything: headings, body, display |
| **IBM Plex Mono** | 400 to 500 | Nav, buttons, tags, section numbers, labels, dates, footer |

Inter Tight replaced Space Grotesk and Inter. Space Grotesk is characterful and quirky; the
references all use *neutral* grotesks (Neue Montreal, ABC Diatype, Indivisible, Geist), which
are licensed foundry faces. Inter Tight is the closest free equivalent and its tighter default
fit suits the large negative tracking this design leans on.

### Scale

| Element | Size |
|---|---|
| Hero `h1` | `clamp(2.6rem, 8vw, 6rem)` |
| Subpage `h1` | `clamp(3rem, 11vw, 8rem)` |
| Section title | `clamp(1.9rem, 4.5vw, 3.2rem)` |
| Contact `h2` | `clamp(2rem, 5.5vw, 4rem)` |
| Card / row `h3` | `clamp(1.25rem, 2.2vw, 1.6rem)` |
| Body | `1rem`, `line-height: 1.55` |
| Mono labels | `0.66rem` to `0.76rem` |

### Letter-spacing

- Display headings: `-0.04em` to `-0.05em`
- Body: `-0.011em`
- Uppercase mono labels: `+0.10em` to `+0.16em`, because uppercase needs air to stay legible

### Line length

Prose is capped in `ch` units (`15ch` hero headline, `16ch` contact headline, `48ch` lede,
`58ch` row descriptions). Keep this.

---

## Layout

- **Container:** `.wrap`, `max-width: 1180px`, `padding: 0 32px`
- **Section rhythm:** `140px` vertical padding (`90px` under 780px), separated by a `1px`
  `--line` top border
- **Subpage hero:** `190px` top padding to clear the fixed nav
- **Corner radius:** `0`, everywhere

### The 160px rail

Every major section uses the same grid: a fixed `160px` left column holding the section
number, then content. `.section-head`, `.about-grid`, `.skill-groups`, `.idx-item`,
`.now-box`, and `.contact-inner` all share it.

**This alignment is the backbone of the design.** If a new component doesn't sit on the rail,
it will look wrong even if nothing else about it is.

The single deliberate exception is the carousel track, which centres its cards because a
dial selects what is at its centre. Its heading still sits on the rail. See the carousel
section for why.

### Breakpoints

| Width | Change |
|---|---|
| `980px` | About grid, skill groups, and contact collapse to single column |
| `900px` | Indexed rows go single-column |
| `780px` | Nav becomes a hamburger; section padding drops to 90px |

---

## Components

### Indexed list (`.idx-list` / `.idx-item`)

Used for experience, projects, and research. Rows separated by hairlines, not gaps. Hovering
any row dims the others to `0.4`, a trick lifted directly from the reference sites. Disabled
under 900px, where there's no pointer to hover with.

Rows whose `.links` div is empty collapse from three columns to two. That rule is deliberately
wrapped in `@media (min-width: 901px)`: **`:has()` carries the specificity of its argument**,
so unscoped, `.idx-item:has(.links:empty)` (0,3,0) outranks the single-column mobile rule
(0,1,0) regardless of source order, and mobile keeps a 160px rail on a 375px screen.

### Carousel (`.carousel-track` / `.card`)

Horizontal work showcase on the homepage. Native `overflow-x: auto` scrolling so touch and
trackpads work for free, plus pointer drag-to-pan, arrow buttons, and a progress bar.

**Nothing may happen on `pointerdown` alone.** Pointer capture and the `.dragging` class are
both deferred until movement passes a 6px threshold, and this is not an optimisation. Doing
either on pointerdown breaks plain clicks on the cards two ways over: `setPointerCapture`
retargets the resulting `click` event to the track instead of the card, and
`.dragging .card { pointer-events: none }` removes the card from hit testing. Either alone is
enough that a card can never be clicked.

Past the threshold, a capture-phase handler suppresses the click so a drag that happens to
end on a card does not also open it.

**This class of bug is invisible to `element.click()`**, which dispatches straight to the
target and bypasses hit testing and pointer capture entirely. It shipped once because every
test used synthetic clicks. Verify card interaction with a real pointer click at real
coordinates, and verify dragging separately by asserting that `scrollLeft` moved *and* the
panel stayed shut.

### The dial

Cards ride the rim of a large wheel whose axle sits far below the track. A card's angular
position on that rim is `atan(offsetFromCentre / R)` with `R = 1800px`. It tilts by exactly
that angle so it stays tangent to the rim, and drops by `R(1 - cos t)` as it swings away
from top dead centre, shrinking and fading with the same angle. Scrolling turns the wheel,
so each project rotates up to centre in turn.

The angle is clamped to `±0.36rad` (about 20.6°). That caps the arc drop at ~116px, which
has to stay inside the track's `124px` of bottom padding.

**That bottom padding is load-bearing.** `overflow-x: auto` forces the computed `overflow-y`
to `auto` as well, so without room to swing into, the arc is simply clipped.

Driven by the track's own `scrollLeft` on a scroll listener, not by ScrollTrigger, because
this is a native scroll container rather than a page-scroll range.

`transformPerspective` is set per card instead of `perspective` on the track. A perspective
on a container that also has `overflow-x` gets flattened in several browsers; folding it
into each card's own matrix avoids that entirely.

Because the dial owns every card transform, **`.card` must not carry `.reveal` and
`.card:hover` must not set a transform.** Either would be overwritten mid-scroll and snap.
The track carries `.reveal` instead, so the group still fades in as one.

### Modal core

`createModal(root, opts)` in `script.js` is the shared shell behind both the card detail
panel and the resume viewer: show and hide, scroll lock with scrollbar compensation, focus
in and focus back, Escape, scrim click, and a Tab trap. Each caller supplies only its own
open and close animation through `animateIn` / `animateOut`.

Markup contract: the panel element carries `data-panel`, the scrim carries `data-close`, and
any close button carries `data-close-btn`. A new modal needs those three attributes and
nothing else.

**Panels animate `opacity`, never `autoAlpha`.** autoAlpha sets `visibility: hidden` at zero,
and nothing inside a hidden subtree can take focus, so the close button silently fails to
receive it.

### Resume viewer

The hero's "View résumé" control opens the CV in a panel rather than downloading it, with
**Download PDF** and **Open in new tab** in the panel's top bar.

The trigger stays a real `<a href="Abdullah_Azmat_CV.pdf" target="_blank">` and JavaScript
intercepts the plain left click. With JS off or broken it still opens the file, and a
modified click (ctrl, meta, shift) is left alone so it opens the raw PDF in a tab as the link
promises. The `download` attribute was deliberately removed from that trigger: viewing is the
primary action now, and downloading lives inside the panel.

**The panel paints the real PDF to a `<canvas>` with PDF.js. Do not turn it back into an
`<iframe>`.** An iframe delegates to the browser's PDF plugin, and where there isn't one it
renders a silent blank box that script cannot detect. That covers iOS Safari and every
embedded webview, and it is exactly what shipped and failed once already. A canvas paints
everywhere, and unlike an HTML transcription it shows the actual file, which is the point:
the owner wants the document itself, because it looks like a document.

The panel is deliberately page-shaped, `min(92vw, 720px)` by `min(88vh, 1020px)`, so it reads
as a sheet rather than a slab.

**The cost is real and worth restating before adding anything else:** `pdf.min.js` is 312KB
and `pdf.worker.min.js` is about 1MB. Both are fetched **on first open only**, never on page
load, since most visitors never open the resume. On a cold first open the "Loading résumé"
state can sit for a few seconds while the worker downloads. If that ever becomes the wrong
trade, the cheaper option is a pre-rendered image of the page, which keeps exact fidelity and
costs nothing at runtime, at the price of regenerating it whenever the PDF changes.

Render width comes from the container's **real** content width, read via
`getComputedStyle().paddingLeft/Right`, not a hardcoded inset. The padding differs between
desktop and mobile and a fixed guess left the page floating in dead space on phones. The
backing store is multiplied by DPR, capped at 2, so the page stays crisp.

Failure never leaves a blank box: the render is wrapped so that a missing library, a missing
file or a render error all fall through to a visible message, with Download PDF and Open in
new tab still sitting in the bar above. This is tested by pointing the library at a dead URL,
not merely assumed.

Layout is a flex column: fixed bar, then `.resume-doc` taking the remaining height and
scrolling. `.resume-doc` needs `min-height: 0`, otherwise a flex child refuses to shrink
below its content size and will not scroll.

### Card detail panel

Clicking a dial card expands it into a modal panel: `min(75vw, 1040px)` by `78vh` on desktop,
`94vw` by `86vh` under 780px, over a scrim at `rgba(8,9,12,0.55)` with `backdrop-filter:
blur(7px)`. The blur is deliberately partial, enough to pull focus to the panel while leaving
the page legible behind it.

The panel animates out from the clicked card's own rect, so the expansion reads as coming
from that card. It uses a **uniform** scale rather than separate scaleX and scaleY matched to
the card's box. Matching both axes would be a truer FLIP, but it stretches the text on the
way out, which looks worse than the slight imprecision of one scale factor.

**The three expandable cards are `<article role="button" tabindex="0">`, not `<a>`.** They
have to be. The expanded content contains its own link, and an `<a>` nested inside an `<a>`
is invalid, so the parser tears the outer anchor apart: the symptom is the carousel reporting
ten cards instead of four with every `.card-full` orphaned as a sibling of the cards rather
than a child. The "See all work" end card has no detail content and stays a real link.

Because they are not buttons or links, Enter and Space are wired by hand.

Content lives in a `display: none` `.card-full` inside each card and is cloned into the panel
on open. Keeping it in the markup rather than in a JS string means the copy sits next to the
card it belongs to.

Panel behaviour that must not regress: Escape closes, the scrim closes, focus moves to the
close button on open and returns to the originating card on close, Tab is trapped inside the
panel while it is open, and body scroll is locked with scrollbar-width compensation so the
page behind does not jump sideways.

**Testing note.** The panel uses `opacity`, not `autoAlpha`. `autoAlpha` sets
`visibility: hidden` at zero, and nothing inside a hidden subtree can take focus, so the
close button silently fails to receive it. Relatedly, a card cannot be focused until the
carousel has been scrolled into view, because `.carousel-track` carries `.reveal` and is
`visibility: hidden` until its batch fires. A test that clicks cards programmatically without
scrolling first will wrongly report focus handling as broken.

### Why the carousel centres instead of sitting on the rail

This is the one component that deliberately breaks the 160px rail rule, and it has to.

A dial selects whatever is at top dead centre. If cards snapped to the left rail while the
arc pivoted around the track centre, the highlighted card and the snapped card would be
different cards. So the track is padded symmetrically by
`max(rail, 50% - cardWidth / 2)` and cards use `scroll-snap-align: center`, which lets the
first and last cards actually reach the centre.

The padding uses **`100%`, not `100vw`**, inside the rail calculation. `100vw` includes the
scrollbar and knocks the track ~8px out of alignment.

The readout is derived from **which card is nearest the centre**, not from scroll distance.
Deriving it from `scrollLeft / step` skips numbers, because with only four cards the track
runs out of scroll in fewer steps than there are cards, so it would jump 01, 02, 04.

### Testing note

Programmatic `track.scrollLeft = n` is unreliable here. `scroll-behavior: smooth` animates
the assignment and `scroll-snap-type: mandatory` then pulls it to the nearest snap point, so
a test that sets a value and reads transforms 500ms later can sample the same position three
times and wrongly conclude the dial is dead. Drive it with the arrow buttons, and assert on
`scrollLeft` alongside the transform.

### Marquee

A moving tape between the Now section and Contact reading **Observe · Analyse · Predict ·
Strategise**, repeating. It replaced an earlier tape that read "Let's talk". A static
four-column version of the same words was tried in between and rejected by the owner, so
**do not turn this back into a static band**.

The track holds two identical halves and travels exactly `-50%`, which is one half width,
which is what makes the loop seamless. Both halves must stay identical for that to hold.

Each half repeats the phrase **four times**, giving a half about `3440px` wide at the desktop
type cap. That is not padding for its own sake: the font tops out at `2.6rem` while the
viewport keeps growing, so on a wide monitor a shorter tape would run out and leave an
unintended gap before the loop point. The rule is that one half must always be wider than
the widest viewport you care about.

**The gap between repeats lives on `padding-right` of every `.phrase`, never on a flex
`gap`.** A flex gap sits only *between* items, so the track would be 8 phrases and 7 gaps,
and half of that is not a whole number of units, which puts the `-50%` loop point one gap
out of step and makes the tape visibly jump once per cycle. Uniform padding keeps every unit
exactly `phrase + gap`, so half the track is exactly four units. Verified: phrase unit
`573px`, half `2293px`, track `4585px`, which is `4.000` units per half.

The gap is set in `em` so it scales with the type rather than shrinking away at large sizes.

Speed is `46s` per half. That works out around 15 to 20 percent slower than the original
tape, because the phrase gaps made each half shorter in px while the duration went up.

Contained by `overflow: hidden`, because the track is legitimately wider than the viewport
and that is not an overflow bug.

The track is `aria-hidden` and a visually hidden `.sr-only` span carries the words once, so
a screen reader hears the phrase rather than eight repetitions of it.

### Preloader

Fixed overlay counting `00` to `100`, then wiping upward with GSAP and playing the hero
intro timeline. Three safeguards, all necessary:

- a 3s `setTimeout` hard cap so the overlay always clears
- a `reduced-motion` path that skips straight to done
- a `<noscript>` block in each page's `<head>` that hides it outright, since without JS the
  overlay would otherwise cover the page permanently

### Ambient audio

Synthesised live with the Web Audio API. **No audio files**, so there is nothing to license,
nothing to download, and no weight added to the page.

**Sine oscillators voicing an A minor 9 spread across four octaves**, plus two very quiet
voices an octave and two above for air. Each voice breathes on its own slow amplitude cycle
with a period between 19 and 45 seconds, and the periods share no common factor so the pad
never audibly repeats. Everything runs through a lowpass, then a convolution reverb whose
impulse response is generated at runtime from decaying noise, so there is still no file to
download. Voices are panned apart for width.

**Why the first version buzzed, and what not to repeat.** It stacked *triangle* waves on the
*integer harmonic series* (1x, 2x, 3x, 4x… of a 65Hz fundamental) with a lowpass parked
around 230 to 1080Hz. Summing integer harmonics is how you synthesise a sawtooth, so the
result was a buzzy low cluster sitting exactly in the register the filter emphasised. The
fixes were all three at once: sine waves instead of triangles, a musical chord voicing
instead of the harmonic series, and a filter that lives up at 1500 to 4100Hz.

A related trap: sine waves carry no harmonics, so a chord of sines has literally zero energy
above its top note. The first sine version measured a spectral mix of 0.40 low, 0.60 mid and
**0.00 high**, and read as muffled. The two quiet high voices exist purely to fix that.

A sparse bell is struck every 16 to 38 seconds, fast attack and a 4.5s decay, fed through the
same reverb. The interval is deliberately long and randomised: often enough to notice, rare
enough that it never becomes a rhythm.

**The filter cutoff follows the node network.** `script.js` publishes a `netStats` object
each canvas frame holding the live link count and a normalised density, and the audio maps
that to cutoff as `1500 + density × 2600` Hz, updated at about 8Hz. When nodes cluster the
sound opens up; when they drift apart it closes down. The background animation and the drone
are the same signal, which is the point.

Rules that are not negotiable:

- **Off by default.** Browsers block autoplay, and a portfolio that makes noise on its own
  gets closed.
- The `AudioContext` is built lazily on first enable, never at page load.
- Master gain ramps with `setTargetAtTime` over more than a second. Setting gain directly
  produces an audible click.
- A stored "on" preference cannot start audio by itself, since a context created without a
  user gesture starts suspended. The preference is remembered and applied on the first
  interaction of any kind, and that listener is dropped if the toggle is pressed directly,
  otherwise someone who arrives and immediately mutes would have their next click anywhere
  switch it back on.
- Audio ducks on `visibilitychange` rather than following someone into another tab.

---

## The node-network background

Retained from the previous design, recoloured to monochrome. Drifting dots connected by white
lines when within proximity.

### Architecture

| Layer | z-index | What |
|---|---|---|
| `#netCanvas` | `-2` | `position: fixed`, full viewport, the animation |
| `body::before` | `-1` | Radial scrim, keeps text readable |
| Page content | auto | Everything else |

Canvas is **fixed, not absolute**, and is the first element in `<body>` on all three pages.
`pointer-events: none` so it never intercepts clicks.

### Tuning

| Parameter | Location | Current |
|---|---|---|
| Canvas opacity | `#netCanvas { opacity }` | `0.8` |
| Scrim outer alpha | `body::before` gradient | `rgba(10,10,10,0.80)` |
| Line alpha multiplier | `ctx.strokeStyle` | `0.4` |
| Line width | `ctx.lineWidth` | `1.1` |
| Dot fill | `ctx.fillStyle` | `rgba(250,250,250,0.85)` |
| Dot radius | `ctx.arc` multiplier | `2.2` |
| Drift speed | `vx`/`vy` in `initNodes()` | `0.35` |
| Connection distance | `linkDist` | `140px` |
| Node count cap | `NODE_COUNT_BASE` | `70` |

**White reads much hotter than the old amber did at the same alpha.** Line alpha dropped from
`0.8` to `0.4`, line width from `1.4` to `1.1`, and the scrim went from `0.72` to `0.80` to
compensate. Raising the line alpha back toward `0.8` will make body copy hard to read.

Two independent dials, often confused: canvas `opacity` controls network strength; scrim outer
alpha controls text contrast *without* dimming the network. If text is hard to read, raise the
scrim first.

Line opacity fades with distance (`1 - dist/linkDist`) so connections dissolve rather than
snap. The connection check is O(n²), so raising the node cap costs frame rate on low-end devices.

---

## Motion

| Effect | Detail |
|---|---|
Animation runs on **GSAP 3.13 with ScrollTrigger**, loaded from jsDelivr. The official
GreenSock agent skills are vendored into `.claude/skills/` (MIT) so future sessions have the
API reference locally.

| Effect | Detail |
|---|---|
| Preloader wipe | GSAP `yPercent: -101`, `0.9s`, `expo.inOut` |
| Hero intro | Paused timeline, played by the preloader. Line masks slide `yPercent 105` to `0`, `1.1s`, staggered `90ms`; eyebrow, lede, buttons, scroll cue follow on `autoAlpha` |
| Scroll reveal | `ScrollTrigger.batch('.reveal')`, `start: 'top 88%'`, `once: true`, `autoAlpha` and `y` with `0.1s` stagger |
| Card reveal | Same batch pattern on `.card`, `start: 'top 92%'` |
| Section number drift | Scrubbed `y: -50` across each section's scroll range |
| Hero parallax | Scrubbed `y: -70` and fade to `0.2` as the hero scrolls away |
| Work dial | Cards ride a wheel rim, driven by the track's `scrollLeft`. See Carousel |
| Marquee | GSAP loop whose `timeScale` is pushed by scroll velocity, clamped to 1x to 6x |
| Canvas | Continuous `requestAnimationFrame`, not GSAP |

### The `html.anim` pattern

GSAP arrives over a CDN, which can fail or be blocked. **No element is ever hidden by CSS
alone.** Every hidden start state is scoped to `html.anim`, and `script.js` adds that class
only after confirming both `gsap` and `ScrollTrigger` are defined. A blocked CDN means the
class never lands, nothing is hidden, and the site degrades to a static page rather than a
blank one. This is verified, not assumed: stripping the two script tags leaves every reveal
and card visible, the tape falls back to its CSS keyframe loop, and the carousel, canvas and
audio toggle all still work. That fallback is why `.anim .marquee-track { animation: none }`
exists rather than the keyframes simply being deleted.

**Do not move a hidden start state out of an `.anim` selector.**

### The yPercent trap

The hero line masks hit a bug worth remembering. The CSS start state is `translateY(105%)`.
GSAP parses an existing transform into its **px** `y` component, never into `yPercent`, so a
tween animating `yPercent` from `105` to `0` leaves that parsed px offset untouched and the
lines finish exactly 105% too low, while the timeline still reports `progress() === 1`. The
fix is to animate both: `{ yPercent: 105, y: 0 }` to `{ yPercent: 0, y: 0 }`.

Any time a CSS transform and a GSAP tween touch the same axis, set both components.

### Reduced motion

Handled with **`gsap.matchMedia()`**, the documented approach: everything created inside a
query is reverted automatically when the query stops matching, so toggling the OS setting
gives a clean switch rather than a stale half-animated page.

- The `no-preference` branch holds every scroll animation, including the dial and the tape
- The `reduce` branch clears props and jumps the hero timeline to its end
- CSS still covers the no-GSAP path and the first paint before JS runs
- JS also finishes the preloader instantly, sets carousel scrolling to `auto`, and stops the
  canvas rAF loop after one frame, so a static network still renders

**Any new animation must respect this.** It is an accessibility requirement, not a preference.

### ScrollTrigger rules to keep

- Create triggers top to bottom, or set `refreshPriority`
- Call `ScrollTrigger.refresh()` after `document.fonts.ready`, because web fonts change
  element heights after first paint and every trigger position derives from those heights
- Never put a ScrollTrigger on a child tween inside a timeline, only on the timeline itself
- Never combine `scrub` and `toggleActions` on one trigger
- Never ship `markers: true`

### Testing note

Staggered batch reveals take roughly `duration + stagger × count` to finish, close to **two
seconds** for the longest group. A verification script that samples opacity sooner than that
reports elements as hidden when they are simply mid animation. Wait at least three seconds
after the last scroll before asserting anything about opacity.

---

## Accessibility

- `a:focus-visible` / `button:focus-visible` get a `1px` `--fg` outline at `4px` offset.
  Never remove focus outlines.
- `--muted-2` at `#565656` is the dimmest value used for text. Do not go dimmer for anything
  that matters. It is used only for uppercase mono labels, which are short and high-contrast
  in form.
- The scrim exists partly for contrast, so reducing it is an accessibility regression, not just
  an aesthetic one.
- Nav toggle and both carousel arrows have `aria-label`. Any new icon-only control needs one.
- `::selection` inverts to `--fg` on `--bg`.

---

## Verification

There is a local static server config at `.claude/launch.json` (`python -m http.server 4173`).
Opening the HTML files directly as `file://` will not work for checking layout, because relative
paths to `styles.css` and `script.js` break. Serve them.

Worth re-checking after layout changes:

1. Blue stays the highest channel everywhere and spread stays at or under 18 (see Colour)
2. `document.documentElement.scrollWidth === clientWidth` at 375px and 1280px
3. Every `.reveal` reaches full opacity after a slow full-page scroll. Scroll in small steps with
   real delays, or `IntersectionObserver` silently skips elements and the result is a false
   negative
4. Carousel card 1's `getBoundingClientRect().left` equals `.section-num`'s

---

## Adding new components

| Need | Reuse |
|---|---|
| Item with index + description + links | `.idx-item` |
| A horizontal showcase | `.card` in `.carousel-track` |
| A key/value info panel | `.facts` |
| A titled section with a number | `.section-head` + `.section-num` |
| A row of small metadata pills | `.tag` |

If a new component is genuinely needed:

1. Use existing custom properties, no new hex values, and no colour
2. Sit on the 160px rail
3. Match the section rhythm (`140px`) and container (`.wrap`)
4. Add `.reveal` for scroll-in consistency
5. Verify at 375px and 1280px
6. Confirm it reads over the animated background, not just over flat `--bg`

---

## Constraints

- **No frameworks.** No Tailwind, no React, no build step. Plain CSS in one file.
- **No CSS-in-JS, no preprocessors.** The stylesheet must be directly editable.
- **One stylesheet, one script**, shared by all pages. Don't fragment into per-page CSS.
- **External dependencies are Google Fonts and GSAP only.** Both are pinned CDN script or
  link tags. Adding a third needs a real reason.
- **Two colours.** This is the whole idea. Adding an accent undoes the redesign.
- **No em dashes anywhere in user-facing copy.** Use a colon for a name and subtitle, a
  comma for apposition, `to` for date ranges, `|` in page titles, `/` for numbered labels,
  and `·` for decorative separators.
