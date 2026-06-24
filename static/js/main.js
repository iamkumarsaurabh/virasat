/**
 * VIRASAT — main.js
 * Global site JavaScript:
 *   - GSAP + ScrollTrigger scroll reveal animations
 *   - Navbar scroll behaviour (transparent → frosted glass)
 *   - Mobile hamburger menu toggle
 *   - Hero parallax
 *   - Gold particle canvas animation
 *   - Testimonial slider
 *   - Newsletter form handler
 *   - Toast notification system (shared)
 */

'use strict';

/* ════════════════════════════════════════════════════════════════════════════
   TOAST SYSTEM — exported for use by reserve.js and contact.js
   ════════════════════════════════════════════════════════════════════════════ */
window.Virasat = window.Virasat || {};

window.Virasat.showToast = function(type, title, message, durationMs = 5000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = { success: '✓', error: '✕', info: '✦' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || '✦'}</span>
    <div class="toast-body">
      <p class="toast-title">${title}</p>
      <p class="toast-msg">${message}</p>
    </div>
    <button class="toast-close" aria-label="Close notification">✕</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const dismiss = () => {
    toast.classList.add('toast-leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  closeBtn.addEventListener('click', dismiss);
  if (durationMs > 0) setTimeout(dismiss, durationMs);

  container.appendChild(toast);
};


/* ════════════════════════════════════════════════════════════════════════════
   GSAP SETUP
   ════════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  // Only register if GSAP is loaded
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);


  /* ── Splash Screen Pre-loader ──────────────────────────────────────────── */
  const splash = document.getElementById('splash-screen');
  const splashLogo = document.getElementById('splash-logo');
  const splashLine = document.getElementById('splash-line');
  
  if (splash) {
    // Start entry animation immediately
    requestAnimationFrame(() => {
      if(splashLogo) {
        splashLogo.style.opacity = '1';
        splashLogo.style.transform = 'translateY(0)';
      }
      if(splashLine) {
        splashLine.style.opacity = '1';
      }
    });

    // Fade out on window load, ensuring a min duration of 1.2s for the cinematic feel
    window.addEventListener('load', () => {
      setTimeout(() => {
        splash.style.opacity = '0';
        splash.style.pointerEvents = 'none';
        document.body.classList.remove('overflow-hidden');
        
        // Remove from DOM after fade out
        setTimeout(() => splash.remove(), 1000);
      }, 1200);
    });
  }


  /* ── Navbar Scroll Behaviour ─────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // check on load
  }


  /* ── Mobile Hamburger Toggle ─────────────────────────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      if (isOpen) {
        mobileMenu.classList.remove('hidden');
        requestAnimationFrame(() => mobileMenu.classList.add('open'));
      } else {
        mobileMenu.classList.remove('open');
        mobileMenu.addEventListener('transitionend', () => {
          mobileMenu.classList.add('hidden');
        }, { once: true });
      }
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.addEventListener('transitionend', () => {
          mobileMenu.classList.add('hidden');
        }, { once: true });
      }
    });
  }


  /* ── Hero Entrance Animations ────────────────────────────────────────────── */
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero-ornament',  { opacity: 1, y: 0, duration: 0.7, delay: 0.15 })
      .to('.hero-title',     { opacity: 1, y: 0, duration: 1.0 }, '-=0.4')
      .to('.hero-divider',   { opacity: 1, duration: 0.6 }, '-=0.5')
      .to('.hero-body',      { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
      .to('.hero-cta',       { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .to('.hero-countdown', { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');

    // Hero parallax
    const heroBg = heroEl.querySelector('.hero-bg');
    if (heroBg) {
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
          heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.25}px)`;
        }
      }, { passive: true });
    }
  }


  /* ── Scroll-Triggered Reveals ────────────────────────────────────────────── */

  // .reveal-up
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 48 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // .reveal-left
  gsap.utils.toArray('.reveal-left').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, x: -60 },
      {
        opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // .reveal-right
  gsap.utils.toArray('.reveal-right').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, x: 60 },
      {
        opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });


  /* ── Gold Particle Canvas (Hero) ─────────────────────────────────────────── */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    initParticles(canvas);
  }


  /* ── Testimonial Slider ──────────────────────────────────────────────────── */
  initTestimonialSlider();


  /* ── Newsletter Form ─────────────────────────────────────────────────────── */
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email || !email.includes('@')) {
        window.Virasat.showToast('error', 'Invalid Email', 'Please enter a valid email address.');
        return;
      }
      window.Virasat.showToast('success', 'Subscribed!', 'You\'re now on the VIRASAT royal mailing list. Welcome.');
      newsletterForm.reset();
    });
  }

}); // end DOMContentLoaded


/* ════════════════════════════════════════════════════════════════════════════
   GOLD PARTICLE CANVAS
   ════════════════════════════════════════════════════════════════════════════ */
function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  const createParticles = (count) => Array.from({ length: count }, () => ({
    x:     rand(0, W),
    y:     rand(0, H),
    r:     rand(0.5, 2),
    speed: rand(0.1, 0.4),
    dx:    rand(-0.2, 0.2),
    opacity: rand(0.2, 0.7),
    opacityDir: Math.random() > 0.5 ? 1 : -1,
  }));

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      // Update
      p.y -= p.speed;
      p.x += p.dx;
      p.opacity += 0.004 * p.opacityDir;
      if (p.opacity >= 0.7 || p.opacity <= 0.1) p.opacityDir *= -1;
      if (p.y < -5) { p.y = H + 5; p.x = rand(0, W); }
      if (p.x < -5 || p.x > W + 5) p.x = rand(0, W);

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', () => { resize(); particles = createParticles(60); }, { passive: true });
  particles = createParticles(60);
  draw();
}


/* ════════════════════════════════════════════════════════════════════════════
   TESTIMONIAL SLIDER
   ════════════════════════════════════════════════════════════════════════════ */
function initTestimonialSlider() {
  const slides     = document.getElementById('testimonial-slides');
  const dotsWrap   = document.getElementById('testimonial-dots');
  const prevBtn    = document.getElementById('prev-btn');
  const nextBtn    = document.getElementById('next-btn');
  if (!slides || !dotsWrap) return;

  const dots  = dotsWrap.querySelectorAll('.t-dot, .testimonial-dot');
  const total = dots.length;
  let current = 0;
  let autoInterval;

  const goTo = (idx) => {
    current = (idx + total) % total;
    slides.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const startAuto = () => {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => goTo(current + 1), 5000);
  };

  const prevBtnEl = document.getElementById('prev-btn');
  const nextBtnEl = document.getElementById('next-btn');
  prevBtnEl && prevBtnEl.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtnEl && nextBtnEl.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((d) => {
    d.addEventListener('click', () => { goTo(parseInt(d.dataset.index, 10)); startAuto(); });
  });

  // Touch/swipe support
  let touchStartX = 0;
  slides.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slides.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { goTo(dx < 0 ? current + 1 : current - 1); startAuto(); }
  }, { passive: true });

  startAuto();
}
