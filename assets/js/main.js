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
})();
