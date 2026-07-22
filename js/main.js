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

  /* ─── Newsletter Popup Modal ───────────────────────────────── */

  (function initNewsletterModal() {
    const STORAGE_KEY = 'ambursa_newsletter_dismissed';

    // Do not display if already dismissed or subscribed in localStorage
    if (localStorage.getItem(STORAGE_KEY)) {
      return;
    }

    // Dynamic HTML template in case #newsletter-modal is not in the static DOM
    const modalHTML = `
      <div id="newsletter-modal" class="newsletter-modal" role="dialog" aria-modal="true" aria-labelledby="newsletter-modal-title" aria-describedby="newsletter-modal-desc" aria-hidden="true">
        <div class="newsletter-modal-overlay" data-dismiss="modal" tabindex="-1"></div>
        <div class="newsletter-modal-card">
          <button type="button" class="newsletter-modal-close" data-dismiss="modal" aria-label="Close newsletter signup modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="newsletter-modal-header">
            <span class="newsletter-modal-badge"><span class="badge-dot"></span> Engineering Logs</span>
            <h2 id="newsletter-modal-title" class="newsletter-modal-title">Subscribe to Technical Updates</h2>
            <p id="newsletter-modal-desc" class="newsletter-modal-desc">
              Get practical logs on EV powertrain firmware, CAN bus scheduling, and RTOS architecture directly in your inbox.
            </p>
          </div>
          <form id="newsletter-form" class="newsletter-modal-form" novalidate>
            <div class="newsletter-modal-input-group">
              <input type="email" id="newsletter-email" name="email" class="newsletter-modal-input" placeholder="engineer@domain.com" required aria-label="Email address" autocomplete="email">
              <button type="submit" id="newsletter-submit" class="newsletter-modal-submit">
                Subscribe
              </button>
            </div>
            <p id="newsletter-form-feedback" class="newsletter-modal-feedback" aria-live="polite"></p>
          </form>
          <div class="newsletter-modal-footer">
            <button type="button" class="newsletter-modal-dismiss-btn" data-dismiss="modal">
              No thanks, I'll check back manually
            </button>
          </div>
        </div>
      </div>
    `;

    let modal = document.getElementById('newsletter-modal');
    if (!modal) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      modal = document.getElementById('newsletter-modal');
    }

    const emailInput = modal.querySelector('#newsletter-email');
    const form = modal.querySelector('#newsletter-form');
    const feedback = modal.querySelector('#newsletter-form-feedback');
    let previouslyFocusedElement = null;

    // Show popup automatically after brief page load delay (800ms)
    if (document.readyState === 'complete') {
      setTimeout(openModal, 800);
    } else {
      window.addEventListener('load', () => setTimeout(openModal, 800));
    }

    function openModal() {
      if (localStorage.getItem(STORAGE_KEY)) return;

      previouslyFocusedElement = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Set focus inside modal
      if (emailInput) {
        emailInput.focus();
      }
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      // Save dismissal to localStorage so it only appears once per visitor session
      localStorage.setItem(STORAGE_KEY, 'true');

      // Restore focus to previous element
      if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus();
      }
    }

    // Event Delegation for dismissal (Close button, overlay, "No thanks" button)
    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-dismiss="modal"]')) {
        closeModal();
      }
    });

    // Escape Key handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Accessibility: Focus Trap inside modal
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return;

      const focusables = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });

    // Form Submission Handling
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailValue = emailInput ? emailInput.value.trim() : '';

        // Basic HTML5 email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailValue || !emailPattern.test(emailValue)) {
          feedback.textContent = 'Please enter a valid email address.';
          feedback.className = 'newsletter-modal-feedback is-error';
          if (emailInput) emailInput.focus();
          return;
        }

        // Display success feedback
        feedback.textContent = "✓ Subscribed! You're on the list.";
        feedback.className = 'newsletter-modal-feedback is-success';

        // Record subscription in localStorage
        localStorage.setItem(STORAGE_KEY, 'subscribed');

        // Dismiss modal after short delay to show confirmation
        setTimeout(() => {
          closeModal();
        }, 1400);
      });
    }
  })();
})();

