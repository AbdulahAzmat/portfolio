// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

// Scroll reveal
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');
if (!reduceMotion && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// Ambient node-network canvas in hero (only runs if #netCanvas exists on the page)
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

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i+1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < linkDist) {
          ctx.strokeStyle = `rgba(255,180,84,${(1 - dist/linkDist) * 0.8})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = 'rgba(245,248,252,0.95)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.6 * devicePixelRatio, 0, Math.PI*2);
      ctx.fill();
    }

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  function setup(){
    resize();
    initNodes();
    ctx.clearRect(0,0,w,h);
    frame();
  }

  // Only rebuild on a real resize — mobile browsers fire resize when the
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