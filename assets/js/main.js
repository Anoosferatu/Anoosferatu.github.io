// Theme toggle, mobile nav, smooth scroll, year stamp
(function() {
  const root = document.documentElement;
  const themeBtn = document.querySelector('.theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu');
  const yearEl = document.getElementById('year');

  // Persisted theme
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved);
  }

  themeBtn?.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // Mobile menu
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    menu?.classList.toggle('show');
  });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        menu?.classList.remove('show');
        navToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Year
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  
  // Parallax hover for project screenshots (skips if reduced motion)
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    document.querySelectorAll('.media.parallax').forEach((media) => {
      const img = media.querySelector('img.screenshot');
      if (!img) return;
      const strength = 12; // px shift at edges

      function move(e) {
        const rect = media.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        img.style.setProperty('--tx', `${(relX * strength).toFixed(2)}px`);
        img.style.setProperty('--ty', `${(relY * strength).toFixed(2)}px`);
      }

      function reset() {
        img.style.setProperty('--tx', '0px');
        img.style.setProperty('--ty', '0px');
      }

      media.addEventListener('mousemove', move);
      media.addEventListener('mouseleave', reset);
      media.addEventListener('focus', reset, true);
      media.addEventListener('blur', reset, true);
    });
  }

  // Copy phone number on click (with toast feedback)
  (function initPhoneCopy() {
    const cards = Array.from(document.querySelectorAll('.contact-card[data-phone], a.contact-card[href^="tel:"]'));
    if (!cards.length) return;

    function ensureToastContainer() {
      let c = document.querySelector('.toast-container');
      if (!c) {
        c = document.createElement('div');
        c.className = 'toast-container';
        document.body.appendChild(c);
      }
      return c;
    }

    function showToast(message) {
      const container = ensureToastContainer();
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.textContent = message;
      container.appendChild(toast);
      // animate in
      requestAnimationFrame(() => toast.classList.add('show'));
      // auto-hide with transitionend for reliable fade-out
      const DURATION = 2000;
      setTimeout(() => {
        const removeAfter = () => toast.remove();
        let removed = false;
        const onEnd = (e) => {
          if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
            if (!removed) { removed = true; toast.removeEventListener('transitionend', onEnd); removeAfter(); }
          }
        };
        toast.addEventListener('transitionend', onEnd);
        // Trigger exit animation
        toast.classList.add('hiding');
        toast.classList.remove('show');
        // Fallback in case transitionend doesn't fire
        setTimeout(() => { if (!removed) { removed = true; toast.removeEventListener('transitionend', onEnd); removeAfter(); } }, 400);
      }, DURATION);
    }

    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }
      // Fallback for older browsers/insecure context
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
      document.body.removeChild(ta);
      return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
    }

    cards.forEach(el => {
      const href = el.getAttribute('href') || '';
      const dataPhone = el.getAttribute('data-phone') || '';
      const isTel = href.startsWith('tel:');
      const number = dataPhone || href.replace(/^tel:/, '');
      if (!number) return;

      el.addEventListener('click', (e) => {
        // For non-tel anchors, prevent navigation (e.g., href="#")
        if (!isTel && el.tagName === 'A') e.preventDefault();
        copyText(number)
          .then(() => showToast('Phone number copied'))
          .catch(() => showToast('Copy failed — please copy manually'));
      });
    });
  })();
})();
