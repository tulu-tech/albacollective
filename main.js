'use strict';
/* ═══════════════════════════════════
   ALBA COLLECTIVE — Award-Level JS
   Dramatic reveals · Parallax · Motion
═══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initMobileMenu();
  initRevealEngine();
  initForm();
  initSmoothScroll();
  initParallax();
  initMarquee();
  initCountUp();
  initMagneticButtons();
  initHorizontalScroll();
});

/* ── Custom Cursor (desktop only) ── */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) {
    document.body.style.cursor = 'auto';
    const c = document.getElementById('cursor');
    if (c) c.style.display = 'none';
    return;
  }
  const cursor = document.getElementById('cursor');
  if (!cursor) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a,button,.work-item,.prob-item,.diff-pillar,.domain-tag,.cta-primary').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
  });
}

/* ── Nav ── */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let last = 0, hidden = false;
  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    // Auto-hide on scroll down, show on scroll up
    if (y > 400) {
      if (y > last && !hidden) { nav.classList.add('nav--hidden'); hidden = true; }
      if (y < last && hidden) { nav.classList.remove('nav--hidden'); hidden = false; }
    } else { nav.classList.remove('nav--hidden'); hidden = false; }
    last = y;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Mobile Menu ── */
function initMobileMenu() {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  const close = document.getElementById('mobileClose');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => { menu.classList.add('open'); document.body.style.overflow = 'hidden'; });
  const shut = () => { menu.classList.remove('open'); document.body.style.overflow = ''; };
  close?.addEventListener('click', shut);
  menu.querySelectorAll('.mm-link').forEach(l => l.addEventListener('click', shut));
}

/* ══════════════════════════════════
   REVEAL ENGINE — Fast & Dramatic
══════════════════════════════════ */
function initRevealEngine() {
  // Multiple reveal types for variety
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  els.forEach(el => io.observe(el));

  // Clip reveals (wipe animations)
  const clips = document.querySelectorAll('[data-clip]');
  const clipIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('clip-visible'); clipIO.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  clips.forEach(el => clipIO.observe(el));

  // Horizontal slide reveals
  const slides = document.querySelectorAll('[data-slide-left],[data-slide-right]');
  const slideIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('slide-visible'); slideIO.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  slides.forEach(el => slideIO.observe(el));

  // Scale reveals
  const scales = document.querySelectorAll('[data-scale]');
  const scaleIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('scale-visible'); scaleIO.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  scales.forEach(el => scaleIO.observe(el));

  // Split text reveals (character by character)
  document.querySelectorAll('[data-split-text]').forEach(el => {
    const text = el.textContent;
    el.innerHTML = '';
    el.setAttribute('aria-label', text);
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = `${i * 0.025}s`;
      el.appendChild(span);
    });
    const splitIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('split-visible'); splitIO.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    splitIO.observe(el);
  });
}

/* ── Smooth Scroll ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 68, behavior: 'smooth' });
    });
  });
}

/* ── Parallax — multi-layer ── */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layers = document.querySelectorAll('[data-speed]');
  const sculpture = document.querySelector('.hero__sculpture');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (sculpture) {
          sculpture.style.transform = `translateY(${y * 0.22}px) rotate(${y * 0.008}deg)`;
        }
        layers.forEach(l => {
          const speed = parseFloat(l.dataset.speed) || 0.1;
          const rect = l.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const offset = (window.innerHeight - rect.top) * speed;
            l.style.transform = `translateY(${offset}px)`;
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── Marquee ticker ── */
function initMarquee() {
  const marquees = document.querySelectorAll('.marquee__track');
  marquees.forEach(track => {
    // Clone content for seamless loop
    const content = track.innerHTML;
    track.innerHTML = content + content;
  });
}

/* ── Count-up animation ── */
function initCountUp() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const end = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const step = Math.max(1, Math.floor(end / 40));
        const interval = setInterval(() => {
          current += step;
          if (current >= end) { current = end; clearInterval(interval); }
          el.textContent = current + suffix;
        }, 30);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => io.observe(el));
}

/* ── Magnetic buttons ── */
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.cta-primary, .submit-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ── Horizontal scroll for capabilities (desktop) ── */
function initHorizontalScroll() {
  const track = document.querySelector('.work__hscroll');
  if (!track) return;
  if (window.innerWidth < 769) return;

  const section = track.closest('.work');
  if (!section) return;

  // Let CSS handle the sticky + horizontal transform via scroll
  const items = track.querySelectorAll('.work-item');
  const totalWidth = items.length * (window.innerWidth * 0.7);
  section.style.height = `${totalWidth}px`;

  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    if (rect.top < 0 && rect.bottom > window.innerHeight) {
      const progress = -rect.top / (rect.height - window.innerHeight);
      const maxShift = totalWidth - window.innerWidth;
      track.style.transform = `translateX(-${progress * maxShift}px)`;
    }
  }, { passive: true });
}

/* ── Form ── */
function initForm() {
  const form = document.getElementById('applyForm');
  if (!form) return;

  // Sync _replyto hidden field with email input so replies go to applicant
  const emailInput = document.getElementById('f-email');
  const replyTo = document.getElementById('replyToField');
  if (emailInput && replyTo) {
    emailInput.addEventListener('input', () => { replyTo.value = emailInput.value; });
  }

  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('focus', () => { field.style.background = 'rgba(255,255,255,0.05)'; });
    field.addEventListener('blur', () => { field.style.background = ''; });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('formSubmitBtn');
    if (btn) { btn.querySelector('span').textContent = 'Submitting…'; btn.disabled = true; }

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      const wrap = form.parentElement;
      if (res.ok) {
        if (wrap) wrap.innerHTML = `
          <div class="form-success">
            <div class="form-success__icon">✦</div>
            <h3>Application received.</h3>
            <p>I review every application personally.<br />You will hear back within 48 hours.</p>
          </div>`;
      } else {
        const json = await res.json().catch(() => ({}));
        const msg = json?.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
        if (btn) { btn.querySelector('span').textContent = 'Submit Application'; btn.disabled = false; }
        alert(msg);
      }
    } catch {
      if (btn) { btn.querySelector('span').textContent = 'Submit Application'; btn.disabled = false; }
      alert('Network error. Please check your connection and try again.');
    }
  });
}
