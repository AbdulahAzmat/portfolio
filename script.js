const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* GSAP is loaded from a CDN, so treat it as optional. The html.anim class is what
   switches on every hidden start state in the stylesheet, and it is only added
   once GSAP is confirmed present. Blocked CDN means no class, which means nothing
   is ever hidden and the site degrades to a static page instead of a blank one. */
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

if (hasGSAP) {
  document.documentElement.classList.add('anim');
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.9 });
}

/* Live readout from the node-network canvas. The ambient audio reads this, so
   the drone's filter tracks how connected the network actually is right now
   rather than running on a fixed loop. Declared up here so both the audio
   module and the canvas can see it regardless of their order in the file. */
let netStats = { links: 0, density: 0 };

/* ---------- HERO INTRO ----------
   Built paused and immediately, so fromTo's immediateRender pins the start
   states before the preloader lifts. The preloader plays it. */
let heroIntro = null;

if (hasGSAP) {
  heroIntro = gsap.timeline({ paused: true })
    /* y: 0 is not redundant. The CSS start state is translateY(105%), and GSAP
       parses an existing transform into its px `y` component, not `yPercent`.
       Animating yPercent alone leaves that parsed px offset in place, so the
       lines finish 105% low. Zeroing both keeps the two models in sync. */
    .fromTo('.line > span',   { yPercent: 105, y: 0 },  { yPercent: 0, y: 0, duration: 1.1, stagger: 0.09 }, 0)
    .fromTo('.page-hero h1',  { autoAlpha: 0, y: 40 },  { autoAlpha: 1, y: 0, duration: 1.1 }, 0)
    .fromTo('.eyebrow',       { autoAlpha: 0, y: 12 },  { autoAlpha: 1, y: 0, duration: 0.8 }, 0.15)
    .fromTo('.hero p.lede, .page-hero p.lede', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.45)
    .fromTo('.hero-actions',  { autoAlpha: 0, y: 12 },  { autoAlpha: 1, y: 0, duration: 0.9 }, 0.6)
    .fromTo('.scroll-cue',    { autoAlpha: 0 },         { autoAlpha: 1, duration: 0.8 }, 0.8);
}

/* ---------- PRELOADER ----------
   Counts to 100, wipes upward, then releases the hero.
   A hard cap guarantees the overlay always clears, even if something stalls. */
(function preloader(){
  const loader = document.getElementById('loader');
  const countEl = loader && loader.querySelector('.l-count');
  let finished = false;

  function release(){
    if (heroIntro) heroIntro.play();
  }

  function finish(){
    if (finished || !loader) return;
    finished = true;

    if (hasGSAP && !reduceMotion) {
      gsap.to(loader, {
        yPercent: -101,
        duration: 0.9,
        ease: 'expo.inOut',
        onComplete: () => loader.remove()
      });
      // let the wipe get underway before the headline starts moving
      gsap.delayedCall(0.45, release);
    } else {
      loader.remove();
      release();
      if (heroIntro) heroIntro.progress(1);
    }
  }

  if (!loader) { release(); return; }

  if (reduceMotion) {
    if (countEl) countEl.textContent = '100';
    finish();
    return;
  }

  let n = 0;
  const tick = setInterval(() => {
    n = Math.min(100, n + Math.ceil(Math.random() * 9));
    if (countEl) countEl.textContent = String(n).padStart(2, '0');
    if (n >= 100) { clearInterval(tick); setTimeout(finish, 260); }
  }, 55);

  setTimeout(finish, 3000); // safety net
})();

/* ---------- MOBILE NAV ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open')));
}

/* ---------- SCROLL ANIMATION ----------
   gsap.matchMedia() is the documented way to handle prefers-reduced-motion:
   everything created inside a query is reverted automatically when it stops
   matching, so a user toggling the OS setting gets a clean switch. */
if (hasGSAP) {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // batched reveals, cheaper and better coordinated than one trigger per element
    gsap.set('.reveal', { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch('.reveal', {
      start: 'top 88%',
      once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, overwrite: true })
    });

    /* No batch reveal on .card. The spiral owns every card transform, and a
       reveal writing y/autoAlpha to the same elements would fight it. The
       track itself carries .reveal instead, so the group still fades in. */

    // section numbers drift against the scroll, which is the one thing the old
    // CSS reveals could not do: progress tied to position rather than to time
    gsap.utils.toArray('section').forEach((sec) => {
      const num = sec.querySelector('.section-num');
      if (!num) return;
      gsap.to(num, {
        y: -50,
        ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });

    const hero = document.querySelector('.hero');
    if (hero) {
      gsap.to('.hero-content', {
        y: -70,
        autoAlpha: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    // the tape runs on a GSAP loop whose speed is pushed by scroll velocity,
    // so it reacts to the reader rather than running at one fixed pace
    const mqTrack = document.querySelector('.marquee-track');
    let mqTween = null;
    if (mqTrack) {
      mqTween = gsap.to(mqTrack, { xPercent: -50, duration: 46, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(0, 5, Math.abs(self.getVelocity()) / 400);
          gsap.to(mqTween, { timeScale: 1 + boost, duration: 0.5, overwrite: true });
        }
      });
    }

    return () => { if (mqTween) mqTween.kill(); };
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('.reveal, .card', { clearProps: 'all' });
    if (heroIntro) heroIntro.progress(1);
  });

  // web fonts land after first paint and change element heights
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

/* ---------- WORK CAROUSEL ----------
   Native horizontal scrolling (so touch and trackpads just work),
   with mouse drag-to-pan, arrow buttons, and a progress bar on top. */
(function carousel(){
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const bar  = document.getElementById('carouselBar');
  const prev = document.getElementById('carPrev');
  const next = document.getElementById('carNext');
  const behavior = reduceMotion ? 'auto' : 'smooth';

  function step(){
    const card = track.querySelector('.card');
    return card ? card.getBoundingClientRect().width + 20 : 320;
  }

  function update(){
    const max = track.scrollWidth - track.clientWidth;
    const ratio = max > 0 ? track.scrollLeft / max : 0;

    if (bar && bar.parentElement){
      const pw = bar.parentElement.clientWidth;
      const visible = Math.min(1, track.clientWidth / track.scrollWidth);
      const bw = Math.max(24, pw * visible);
      bar.style.width = bw + 'px';
      bar.style.transform = 'translateX(' + (ratio * (pw - bw)) + 'px)';
    }
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max - 2;
  }

  if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior }));
  if (next) next.addEventListener('click', () => track.scrollBy({ left:  step(), behavior }));

  /* Drag to pan (pointer only, touch keeps its native momentum scrolling).

     Nothing here may happen on pointerdown alone. Capturing the pointer or
     adding .dragging before the pointer has actually moved breaks plain clicks
     on the cards two ways over: pointer capture retargets the resulting click
     event to the track instead of the card, and `.dragging .card` sets
     pointer-events: none, which takes the card out of hit testing entirely.
     Either one is enough to stop a card ever receiving a click.

     So both are deferred until movement passes the threshold. A press that
     never moves stays an ordinary click. */
  const DRAG_THRESHOLD = 6;
  let down = false, dragging = false, startX = 0, startScroll = 0, moved = 0, pid = null;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    down = true; dragging = false; moved = 0;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    pid = e.pointerId;
  });

  track.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));

    if (!dragging) {
      if (moved <= DRAG_THRESHOLD) return;   // still just a press, leave it alone
      dragging = true;
      track.classList.add('dragging');
      try { track.setPointerCapture(pid); } catch (_) {}
    }
    track.scrollLeft = startScroll - dx;
  });

  function endDrag(){
    if (!down) return;
    down = false;
    if (dragging) {
      track.classList.remove('dragging');
      try { track.releasePointerCapture(pid); } catch (_) {}
    }
    dragging = false;
    pid = null;
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  // a drag that happens to end on a card shouldn't also open that card
  track.addEventListener('click', (e) => {
    if (moved > DRAG_THRESHOLD) { e.preventDefault(); e.stopPropagation(); }
    moved = 0;
  }, true);

  /* ---- dial ----
     The cards ride the rim of a large wheel whose axle sits far below the
     track. A card's angular position on that rim is atan(offsetFromCentre / R).
     It tilts by exactly that angle so it stays tangent to the rim, and drops by
     R(1 - cos t) as it swings away from top dead centre. Scrolling turns the
     wheel, so projects rotate past the centre one at a time.

     Driven by the track's own scrollLeft, not by ScrollTrigger, because this is
     a native scroll container rather than a page-scroll range.

     transformPerspective is set per card instead of `perspective` on the track.
     A perspective on a container that also has overflow-x flattens the 3D in
     several browsers; folding it into each card's own matrix sidesteps that. */
  const cards = [...track.querySelectorAll('.card')];
  const readout = document.getElementById('dialReadout');
  const dialOn = hasGSAP && !reduceMotion;

  const R = 1800;        // wheel radius in px. Larger reads as a flatter arc.
  const MAX_T = 0.36;    // ~20.6deg. Caps the drop at ~116px so the arc stays
                         // inside the track's 124px of bottom padding.

  function dial(){
    const mid = track.scrollLeft + track.clientWidth / 2;
    let selected = 0, best = Infinity;

    cards.forEach((card, i) => {
      const d = Math.abs((card.offsetLeft + card.offsetWidth / 2) - mid);
      if (d < best) { best = d; selected = i; }
    });

    if (dialOn) {
      for (const card of cards) {
        const dx = (card.offsetLeft + card.offsetWidth / 2) - mid;
        const t = gsap.utils.clamp(-MAX_T, MAX_T, Math.atan2(dx, R));
        const deg = t * 180 / Math.PI;
        const a = Math.abs(t);

        gsap.set(card, {
          transformPerspective: 1200,
          transformOrigin: '50% 50%',
          rotation: deg,               // tangent to the rim
          rotationY: -deg * 0.9,       // face turns back toward the centre
          y: R * (1 - Math.cos(t)),    // drop along the arc
          z: -a * 300,
          scale: 1 - a * 0.42,
          opacity: 1 - a * 1.5
        });
      }
    }

    /* The readout names whatever sits at top dead centre, which is exactly what
       the dial visually selects and what snapping settles on. Deriving it from
       scroll distance instead would skip numbers, because with only four cards
       the track runs out of scroll in fewer steps than there are cards. */
    if (readout) {
      readout.innerHTML = '<b>' + String(selected + 1).padStart(2, '0') + '</b> / ' +
                          String(cards.length).padStart(2, '0');
    }
  }

  function onScroll(){ update(); dial(); }

  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  // browsers restore a scroll container's position on reload, and web fonts
  // land after first paint, so start at 0 and re-measure once things settle
  track.scrollLeft = 0;
  onScroll();
  window.addEventListener('load', onScroll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onScroll);
})();

/* ---------- CARD DETAIL PANEL ----------
   Clicking a dial card expands it into a panel over a blurred page. The panel
   animates out from the clicked card's own rect, so the expansion reads as
   coming from that card rather than appearing from nowhere.

   Uniform scale, not scaleX/scaleY matched to the card's box. Matching both
   axes would be a truer FLIP but it stretches the text on the way out, which
   looks worse than the slight imprecision of a single scale factor. */
(function cardDetail(){
  const root = document.getElementById('cardDetail');
  if (!root) return;

  const panel = root.querySelector('.detail-panel');
  const scrim = root.querySelector('.detail-scrim');
  const body = document.getElementById('detailBody');
  const closeBtn = document.getElementById('detailClose');
  const cards = [...document.querySelectorAll('.card')].filter(c => c.querySelector('.card-full'));
  if (!cards.length) return;

  let opener = null;

  /* These cards are <article role="button" tabindex="0">, not <a>. They have to
     be: the expanded content contains its own link, and an <a> inside an <a> is
     invalid, so the parser tears the outer anchor apart and the detail blocks
     end up as siblings of the cards instead of children. Keeping them as
     buttons means supplying Enter and Space by hand. */
  cards.forEach((card) => {
    card.setAttribute('data-expandable', '');
    card.addEventListener('click', () => open(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        open(card);
      }
    });
  });

  // offsets that map the panel's resting rect onto the clicked card's rect
  function originFrom(card){
    const from = card.getBoundingClientRect();
    const to = panel.getBoundingClientRect();
    return {
      x: (from.left + from.width / 2) - (to.left + to.width / 2),
      y: (from.top + from.height / 2) - (to.top + to.height / 2),
      scale: Math.max(0.2, Math.min(1, from.width / to.width))
    };
  }

  function lockScroll(){
    // compensate for the scrollbar so the page behind does not jump sideways
    const sb = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (sb > 0) document.body.style.paddingRight = sb + 'px';
  }
  function unlockScroll(){
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  function open(card){
    opener = card;
    body.innerHTML = card.querySelector('.card-full').innerHTML;
    root.hidden = false;
    panel.scrollTop = 0;
    lockScroll();

    if (hasGSAP && !reduceMotion) {
      const o = originFrom(card);
      /* opacity, not autoAlpha. autoAlpha sets visibility:hidden at 0, and an
         element inside a hidden subtree cannot take focus, so the close button
         would silently fail to receive it. */
      gsap.fromTo(panel, { x: o.x, y: o.y, scale: o.scale, opacity: 0 },
                         { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'power3.out' });
      gsap.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
      gsap.fromTo(body.children, { autoAlpha: 0, y: 14 },
                                 { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.03, delay: 0.16 });
    }
    closeBtn.focus();
  }

  function close(){
    if (root.hidden) return;

    const finish = () => {
      root.hidden = true;
      unlockScroll();
      if (opener) opener.focus();
      opener = null;
    };

    if (hasGSAP && !reduceMotion && opener) {
      const o = originFrom(opener);
      gsap.to(panel, { x: o.x, y: o.y, scale: o.scale, opacity: 0, duration: 0.4, ease: 'power2.in' });
      gsap.to(scrim, { autoAlpha: 0, duration: 0.35, onComplete: finish });
    } else {
      finish();
    }
  }

  closeBtn.addEventListener('click', close);
  root.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) close(); });

  document.addEventListener('keydown', (e) => {
    if (root.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;

    // keep focus inside the panel while it is modal
    const f = panel.querySelectorAll('a[href], button');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();

/* ---------- AMBIENT AUDIO ----------
   Synthesised live with the Web Audio API. No audio files, so nothing to
   license, nothing to download, and no weight added to the page.

   A drone stack on C2 with a just-intoned harmonic series, run through one
   lowpass filter whose cutoff follows how densely connected the background
   node network currently is. When nodes cluster the sound opens up; when they
   drift apart it closes down. The visual and the audio are the same signal.

   Off by default and gated behind the toggle. Browsers block autoplay, and a
   portfolio that makes noise on its own gets closed. */
(function ambientAudio(){
  const btn = document.getElementById('soundBtn');
  if (!btn || !(window.AudioContext || window.webkitAudioContext)) return;

  const KEY = 'portfolio-audio';
  const LEVEL = 0.10;
  let ctx = null, master = null, filter = null, bus = null;
  let on = false, tickId = 0, bellId = 0;

  const store = {
    get(){ try { return localStorage.getItem(KEY); } catch (_) { return null; } },
    set(v){ try { localStorage.setItem(KEY, v); } catch (_) {} }
  };

  /* An A minor 9 spread wide across four octaves. A chord voicing, deliberately
     NOT the integer harmonic series: stacking 1x 2x 3x 4x of a low fundamental
     rebuilds a sawtooth, which is what made the first version buzz. Sine waves
     only, for the same reason. */
  /* The last two voices are the air. Sine waves carry no harmonics, so without
     something sounding up there the whole pad has zero energy above the top
     note and reads as muffled. They sit very low in the mix on purpose. */
  const CHORD = [110.00, 164.81, 220.00, 261.63, 329.63, 392.00, 493.88, 880.00, 1318.51];
  const LEVELS = [0.22, 0.14, 0.12, 0.11, 0.095, 0.07, 0.06, 0.032, 0.022];
  const BELLS = [523.25, 659.25, 783.99, 987.77];   // an octave up, for sparse tones

  // A reverb impulse generated from decaying noise. Real convolution, no file to
  // download and nothing to license. Slightly different noise per channel is
  // what gives it width.
  function impulse(seconds, decay){
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  function build(){
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2200;
    filter.Q.value = 0.5;

    bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(filter);

    // mostly wet: the long tail is what makes it feel like a room rather than
    // a synth sitting on top of the page
    const verb = ctx.createConvolver();
    verb.buffer = impulse(3.4, 2.6);
    const wet = ctx.createGain(); wet.gain.value = 0.9;
    const dry = ctx.createGain(); dry.gain.value = 0.45;

    filter.connect(dry); dry.connect(master);
    filter.connect(verb); verb.connect(wet); wet.connect(master);

    CHORD.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const g = ctx.createGain();
      g.gain.value = LEVELS[i] * 0.5;

      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) pan.pan.value = (i % 2 ? 1 : -1) * (0.12 + i * 0.07);

      osc.connect(g);
      if (pan) { g.connect(pan); pan.connect(bus); } else { g.connect(bus); }
      osc.start();

      /* Each voice breathes on its own slow cycle, with periods that share no
         common factor so the pad never repeats audibly. This is what stops it
         sounding like a held chord. */
      const swell = ctx.createOscillator();
      const swellDepth = ctx.createGain();
      swell.type = 'sine';
      swell.frequency.value = 1 / (19 + i * 4.3);      // one cycle every 19 to 45s
      swellDepth.gain.value = LEVELS[i] * 0.45;
      swell.connect(swellDepth);
      swellDepth.connect(g.gain);
      swell.start();

      // a touch of detune drift, small enough to warm the tone without beating
      const drift = ctx.createOscillator();
      const driftDepth = ctx.createGain();
      drift.frequency.value = 0.017 + i * 0.009;
      driftDepth.gain.value = 1.1;                     // cents
      drift.connect(driftDepth);
      driftDepth.connect(osc.detune);
      drift.start();
    });
  }

  /* A sparse bell, struck every 16 to 38 seconds. Fast attack, long decay, fed
     through the same reverb. This is the part that keeps the pad from reading
     as a flat wash, and it is why the interval is long: often enough to notice,
     rare enough that it never becomes a rhythm. */
  function scheduleBell(){
    if (bellId) clearTimeout(bellId);
    bellId = setTimeout(() => {
      if (on && ctx && bus) {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = BELLS[Math.floor(Math.random() * BELLS.length)];

        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);

        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (pan) pan.pan.value = Math.random() * 1.2 - 0.6;

        osc.connect(g);
        if (pan) { g.connect(pan); pan.connect(bus); } else { g.connect(bus); }
        osc.start(t);
        osc.stop(t + 4.8);
      }
      scheduleBell();
    }, 16000 + Math.random() * 22000);
  }

  // ~8Hz is plenty for a filter sweep and far cheaper than every frame
  function startTracking(){
    stopTracking();
    tickId = setInterval(() => {
      if (!on || !ctx) return;
      // a gentle opening and closing well above the buzz region
      const target = 1500 + netStats.density * 2600;
      filter.frequency.setTargetAtTime(target, ctx.currentTime, 1.2);
    }, 120);
  }
  function stopTracking(){
    if (tickId) { clearInterval(tickId); tickId = 0; }
    if (bellId) { clearTimeout(bellId); bellId = 0; }
  }

  function enable(){
    if (!ctx) build();
    if (ctx.state === 'suspended') ctx.resume();
    on = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(LEVEL, ctx.currentTime, 1.8);   // slow fade in
    btn.setAttribute('aria-pressed', 'true');
    store.set('on');
    startTracking();
    scheduleBell();
  }

  function disable(){
    on = false;
    if (master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
    btn.setAttribute('aria-pressed', 'false');
    store.set('off');
    stopTracking();
  }

  btn.addEventListener('click', () => {
    dropKick();                 // an explicit choice outranks the stored one
    on ? disable() : enable();
  });

  // duck while the tab is in the background rather than following someone
  // into another tab
  document.addEventListener('visibilitychange', () => {
    if (!on || !ctx) return;
    master.gain.setTargetAtTime(document.hidden ? 0 : LEVEL, ctx.currentTime, 0.4);
  });

  /* A stored preference cannot start audio on its own: an AudioContext created
     without a user gesture starts suspended. So remember the choice, then wait
     for the first interaction of any kind before resuming.

     dropKick() is also called from the button handler. Without that, someone
     arriving with the preference set to on who immediately hits the toggle
     would have their next click anywhere on the page switch the sound back on. */
  function kick(){ dropKick(); enable(); }
  function dropKick(){
    window.removeEventListener('pointerdown', kick);
    window.removeEventListener('keydown', kick);
  }

  if (store.get() === 'on') {
    window.addEventListener('pointerdown', kick);
    window.addEventListener('keydown', kick);
  }
})();

/* ---------- BACKGROUND NODE NETWORK ----------
   Monochrome: white nodes and links on the near-black ground.
   White reads much hotter than the old amber did, so the line alpha
   is deliberately lower than the dot alpha to keep text legible. */
const canvas = document.getElementById('netCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, nodes;
  const NODE_COUNT_BASE = 70;

  function resize(){
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }

  function initNodes(){
    const count = Math.min(NODE_COUNT_BASE, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 14000));
    nodes = Array.from({length: count}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.35 * devicePixelRatio,
    }));
  }

  function frame(){
    ctx.clearRect(0,0,w,h);
    const linkDist = 140 * devicePixelRatio;

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    let links = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i+1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < linkDist) {
          links++;
          ctx.strokeStyle = `rgba(245,247,250,${(1 - dist/linkDist) * 0.4})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = 'rgba(245,247,250,0.85)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.2 * devicePixelRatio, 0, Math.PI*2);
      ctx.fill();
    }

    // publish for the ambient audio. Real link counts sit well below the
    // theoretical maximum, so normalise against a realistic ceiling instead.
    const pairs = nodes.length * (nodes.length - 1) / 2;
    netStats.links = links;
    netStats.density = pairs ? Math.min(1, links / (pairs * 0.16)) : 0;

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  function setup(){
    resize();
    initNodes();
    ctx.clearRect(0,0,w,h);
    frame();
  }

  // Only rebuild on a real resize. Mobile browsers fire resize when the
  // address bar hides/shows on scroll, which would otherwise reset the animation.
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - lastW) < 40) { resize(); return; }
    lastW = window.innerWidth;
    resize();
    initNodes();
  });

  setup();
}
