/**
 * Main site interactivity
 * - Mobile navigation toggle
 * - GitHub-style contribution heatmap generation
 */

(function () {
  'use strict';

  /* ─── Mobile Navigation ────────────────────────────────────── */

  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a nav link is clicked (mobile)
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ─── Contribution Heatmap ─────────────────────────────────── */

  const heatmapContainer = document.querySelector('.contribution-heatmap');

  if (heatmapContainer) {
    // 52 weeks × 7 days = 364 cells (GitHub-style grid)
    const WEEKS = 52;
    const DAYS = 7;

    // Seeded pseudo-random for consistent visual on reload
    let seed = 42;
    function random() {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    const fragment = document.createDocumentFragment();

    for (let week = 0; week < WEEKS; week++) {
      for (let day = 0; day < DAYS; day++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';

        // Weight toward lower activity with occasional spikes
        const roll = random();
        let level = 0;
        if (roll > 0.55) level = 1;
        if (roll > 0.72) level = 2;
        if (roll > 0.85) level = 3;
        if (roll > 0.93) level = 4;

        if (level > 0) {
          cell.setAttribute('data-level', String(level));
        }

        cell.title = `Week ${week + 1}, Day ${day + 1}: ${level} contributions`;
        fragment.appendChild(cell);
      }
    }

    heatmapContainer.appendChild(fragment);
  }

  /* ─── Smooth scroll for in-page anchor links ───────────────── */

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
})();
