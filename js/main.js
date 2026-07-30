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
            <span class="newsletter-modal-badge"><span class="badge-dot"></span> Builds &amp; Updates</span>
            <h2 id="newsletter-modal-title" class="newsletter-modal-title">Stay posted on new builds and project drops</h2>
            <p id="newsletter-modal-desc" class="newsletter-modal-desc">
              Get the newest PC build releases, robotics project updates, and AI notes directly in your inbox.
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

    // Form Submission Handling for Buttondown Integration
    if (form) {
      form.addEventListener('submit', async (e) => {
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

        const submitBtn = form.querySelector('#newsletter-submit');
        if (submitBtn) submitBtn.disabled = true;

        feedback.textContent = 'Subscribing...';
        feedback.className = 'newsletter-modal-feedback';

        // Buttondown username (defaults to 'ambursa', can be customized via window.BUTTONDOWN_USERNAME)
        const username = window.BUTTONDOWN_USERNAME || 'ambursa';
        const buttondownUrl = `https://buttondown.com/api/emails/embed-subscribe/${username}`;

        try {
          const formData = new FormData();
          formData.append('email', emailValue);
          formData.append('tag', 'website-popup');

          const response = await fetch(buttondownUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // Buttondown embed endpoint accepts cross-origin form posts
          });

          // Display success feedback
          feedback.textContent = "✓ Subscribed! Please check your inbox to confirm.";
          feedback.className = 'newsletter-modal-feedback is-success';

          // Record subscription in localStorage
          localStorage.setItem(STORAGE_KEY, 'subscribed');

          // Dismiss modal after short delay to show confirmation
          setTimeout(() => {
            closeModal();
          }, 2000);
        } catch (err) {
          console.error('Buttondown signup error:', err);
          feedback.textContent = 'Unable to subscribe right now. Please try again.';
          feedback.className = 'newsletter-modal-feedback is-error';
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  })();

  /* ─── Theme Switcher (Dark, Light, System) ───────────────── */

  (function initThemeSwitcher() {
    const MEDIA_QUERY = window.matchMedia('(prefers-color-scheme: dark)');
    const THEME_KEY = 'theme';
    const VALID_THEMES = new Set(['light', 'dark', 'system']);

    function readThemePreference() {
      try {
        return localStorage.getItem(THEME_KEY);
      } catch (err) {
        return null;
      }
    }

    function writeThemePreference(preference) {
      try {
        localStorage.setItem(THEME_KEY, preference);
      } catch (err) {
        // Ignore storage write failures (private mode or restricted storage)
      }
    }

    function getSavedPreference() {
      const saved = readThemePreference();
      return VALID_THEMES.has(saved) ? saved : 'system';
    }

    function applyTheme(preference) {
      const normalizedPreference = VALID_THEMES.has(preference) ? preference : 'system';
      let effectiveTheme = normalizedPreference;
      if (normalizedPreference === 'system') {
        effectiveTheme = MEDIA_QUERY.matches ? 'dark' : 'light';
      }

      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.setAttribute('data-theme-preference', normalizedPreference);

      // Update button state
      document.querySelectorAll('.theme-btn').forEach((btn) => {
        const val = btn.getAttribute('data-theme-val');
        const isActive = val === normalizedPreference;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
        btn.setAttribute('aria-checked', String(isActive));
      });
    }

    function setTheme(preference) {
      const normalizedPreference = VALID_THEMES.has(preference) ? preference : 'system';
      writeThemePreference(normalizedPreference);
      applyTheme(normalizedPreference);
    }

    // React dynamically to OS system theme changes when set to 'system'
    const onSystemThemeChange = () => {
      if (getSavedPreference() === 'system') {
        applyTheme('system');
      }
    };

    if (typeof MEDIA_QUERY.addEventListener === 'function') {
      MEDIA_QUERY.addEventListener('change', onSystemThemeChange);
    } else if (typeof MEDIA_QUERY.addListener === 'function') {
      MEDIA_QUERY.addListener(onSystemThemeChange);
    }

    // Apply on DOM load
    applyTheme(getSavedPreference());

    // Event delegation for theme switcher buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-btn');
      if (btn) {
        const val = btn.getAttribute('data-theme-val');
        if (val && VALID_THEMES.has(val)) {
          setTheme(val);
        }
      }
    });

    // Keep theme in sync if preference changes in another tab/window.
    window.addEventListener('storage', (e) => {
      if (e.key === THEME_KEY) {
        applyTheme(getSavedPreference());
      }
    });
  })();

  /* ─── Local Storage Manager for PC Builds ─────────────────── */

  const STORAGE_KEY_BUILDS = 'ambursa_pc_builds';

  function getSavedBuilds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BUILDS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading saved builds:', e);
    }
    // Fallback to sample data if empty
    const initial = (window.PC_BUILD_DATA && window.PC_BUILD_DATA.initialSavedBuilds) || [];
    localStorage.setItem(STORAGE_KEY_BUILDS, JSON.stringify(initial));
    return initial;
  }

  function saveBuild(buildObj) {
    const builds = getSavedBuilds();
    const existingIndex = builds.findIndex((b) => b.id === buildObj.id);
    if (existingIndex >= 0) {
      builds[existingIndex] = buildObj;
    } else {
      builds.unshift(buildObj);
    }
    localStorage.setItem(STORAGE_KEY_BUILDS, JSON.stringify(builds));
  }

  function deleteBuild(buildId) {
    let builds = getSavedBuilds();
    builds = builds.filter((b) => b.id !== buildId);
    localStorage.setItem(STORAGE_KEY_BUILDS, JSON.stringify(builds));
  }

  function toggleFavorite(buildId) {
    const builds = getSavedBuilds();
    const target = builds.find((b) => b.id === buildId);
    if (target) {
      target.isFavorite = !target.isFavorite;
      localStorage.setItem(STORAGE_KEY_BUILDS, JSON.stringify(builds));
    }
  }

  /* Helper to resolve component details by category & ID */
  function getComponent(catId, compId) {
    if (!window.PC_BUILD_DATA || !window.PC_BUILD_DATA.components) return null;
    const catList = window.PC_BUILD_DATA.components[catId] || [];
    return catList.find((c) => c.id === compId) || catList[0] || null;
  }

  /* ─── Custom PC Builds Shop & Configurator Engine ─────────── */

  (function initConfiguratorPage() {
    const gridEl = document.getElementById('premade-builds-grid');
    const configContainer = document.getElementById('configurator-rows-container');
    const presetSelect = document.getElementById('load-preset-select');
    const futureGridEl = document.getElementById('future-builds-grid');
    const futureBuildsInput = document.getElementById('future-builds-input');
    const saveFutureBuildsBtn = document.getElementById('save-future-builds-btn');
    const resetFutureBuildsBtn = document.getElementById('reset-future-builds-btn');
    const futureBuildsFeedback = document.getElementById('future-builds-feedback');
    const FUTURE_DROPS_KEY = 'ambursa_future_builds';

    if (!gridEl && !configContainer && !futureGridEl && !futureBuildsInput) return; // Not on builds.html

    const data = window.PC_BUILD_DATA;
    if (!data) return;

    function getFutureDrops() {
      try {
        const raw = localStorage.getItem(FUTURE_DROPS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (err) {
        console.error('Error reading future drops:', err);
      }

      return Array.isArray(data.futureDrops) ? data.futureDrops : [];
    }

    function saveFutureDrops(drops) {
      localStorage.setItem(FUTURE_DROPS_KEY, JSON.stringify(drops));
    }

    // Current configurator selection state
    let activeState = {
      id: 'custom-' + Date.now(),
      name: 'My Custom Rig',
      tier: 'gaming',
      tierLabel: 'Gaming Tier',
      components: {
        cpu: 'cpu-gaming',
        gpu: 'gpu-mid',
        motherboard: 'mb-gaming',
        ram: 'ram-32gb',
        storage: 'ssd-2tb-gen4',
        psu: 'psu-750w',
        case: 'case-gaming',
        cooler: 'cooler-aio-240'
      }
    };

    /* 1. Render Pre-made Builds Cards */
    function renderPremadeGrid(filterTier = 'all') {
      if (!gridEl) return;

      const filtered = data.buildTemplates.filter((t) => {
        if (filterTier === 'all') return true;
        return t.tier === filterTier;
      });

      if (filtered.length === 0) {
        gridEl.innerHTML = `
          <div class="empty-state-box" style="grid-column: 1 / -1;">
            <p>No builds found for tier "${filterTier}".</p>
          </div>
        `;
        return;
      }

      gridEl.innerHTML = filtered
        .map((t) => {
          const cpu = getComponent('cpu', t.components.cpu);
          const gpu = getComponent('gpu', t.components.gpu);
          const ram = getComponent('ram', t.components.ram);
          const storage = getComponent('storage', t.components.storage);

          // Check if any part in build template is out of stock
          const hasOutOfStock = Object.keys(t.components).some((catId) => {
            const part = getComponent(catId, t.components[catId]);
            return part && part.stockStatus === 'out_of_stock';
          });

          const stockTagHTML = hasOutOfStock
            ? `<span class="stock-badge stock-badge--out" style="margin-left: 8px;">Out of Stock Parts</span>`
            : `<span class="stock-badge stock-badge--in" style="margin-left: 8px;">In Stock</span>`;

          const scorePercent = t.performanceScore || 85;

          return `
          <div class="card build-card">
            <div>
              <div class="build-card-visual" style="background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 1rem; border: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    <line x1="8" y1="6" x2="16" y2="6"></line>
                    <line x1="8" y1="10" x2="16" y2="10"></line>
                  </svg>
                  <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase;">RIG ID: #${t.id.replace('build-', '')}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;" title="Performance Score: ${scorePercent}/100">
                  <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--color-accent-green);">SCORE: ${scorePercent}/100</span>
                </div>
              </div>

              <div class="build-card-top">
                <span class="tier-badge tier-badge--${t.tier}">${t.tierLabel}</span>
                <span class="build-card-price">$${t.totalPrice.toLocaleString()}</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
                <h3 class="build-card-title" style="margin-bottom: 0;">${t.name}</h3>
                ${stockTagHTML}
              </div>
              <p class="build-card-tag">${t.tag}</p>
              <p class="build-card-desc">${t.description}</p>

              <div class="build-specs-list">
                <div class="spec-item"><span class="spec-key">CPU</span><span class="spec-val" title="${cpu ? cpu.name : ''}">${cpu ? cpu.name : 'N/A'}</span></div>
                <div class="spec-item"><span class="spec-key">GPU</span><span class="spec-val" title="${gpu ? gpu.name : ''}">${gpu ? gpu.name : 'N/A'}</span></div>
                <div class="spec-item"><span class="spec-key">RAM</span><span class="spec-val">${ram ? ram.specs.capacity : 'N/A'} ${ram ? ram.specs.type : ''}</span></div>
                <div class="spec-item"><span class="spec-key">STORAGE</span><span class="spec-val">${storage ? storage.specs.capacity : 'N/A'} NVMe</span></div>
              </div>
            </div>

            <div class="build-card-actions">
              <button type="button" class="btn-support btn-support--kofi customize-template-btn" data-template-id="${t.id}" style="flex: 1; text-align: center; justify-content: center;">
                Customize in Builder
              </button>
              <button type="button" class="btn-secondary quick-save-btn" data-template-id="${t.id}" title="Save setup">
                ★ Save
              </button>
            </div>
          </div>
        `;
        })
        .join('');
    }

    function renderFutureDrops() {
      if (!futureGridEl) return;

      const drops = getFutureDrops();
      if (!drops.length) {
        futureGridEl.innerHTML = `
          <div class="empty-state-box" style="grid-column: 1 / -1;">
            <p>No future drops queued yet. Add some from the dashboard.</p>
          </div>
        `;
        return;
      }

      futureGridEl.innerHTML = drops
        .map((drop) => `
          <article class="card build-card build-card--future">
            <div>
              <div class="build-card-top">
                <span class="tier-badge tier-badge--workstation">${drop.status || 'Coming Soon'}</span>
                <span class="build-card-price">$${Number(drop.price || 0).toLocaleString()}</span>
              </div>
              <h3 class="build-card-title">${drop.name}</h3>
              <p class="build-card-desc">${drop.note || ''}</p>
            </div>
            <div class="build-card-actions">
              <button type="button" class="btn-secondary btn-full quick-save-btn" disabled>Launching Soon</button>
            </div>
          </article>
        `)
        .join('');
    }

    /* 2. Tier Filter Bar Click Handlers */
    const filterButtonsContainer = document.getElementById('tier-filter-buttons');
    if (filterButtonsContainer) {
      filterButtonsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        filterButtonsContainer.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const tier = btn.getAttribute('data-filter') || 'all';
        renderPremadeGrid(tier);
      });
    }

    /* 3. Populate Configurator Selectors */
    function renderConfiguratorRows() {
      if (!configContainer) return;

      configContainer.innerHTML = data.categories
        .map((cat) => {
          const compList = data.components[cat.id] || [];
          const selectedId = activeState.components[cat.id];
          const selectedComp = getComponent(cat.id, selectedId);

          const optionsHTML = compList
            .map((item) => {
              const isSelected = item.id === selectedId ? 'selected' : '';
              let stockLabel = '';
              if (item.stockStatus === 'out_of_stock') {
                stockLabel = ' [OUT OF STOCK]';
              } else if (item.stockStatus === 'low_stock') {
                stockLabel = ' [LOW STOCK]';
              }
              return `<option value="${item.id}" ${isSelected}>${item.name} (+$${item.price})${stockLabel}</option>`;
            })
            .join('');

          // Spec details line & stock badge
          let specDetails = '';
          if (selectedComp && selectedComp.specs) {
            specDetails = Object.values(selectedComp.specs).slice(0, 3).join(' • ');
          }

          let stockBadgeHTML = '';
          if (selectedComp) {
            if (selectedComp.stockStatus === 'out_of_stock') {
              stockBadgeHTML = `<span class="stock-badge stock-badge--out" style="margin-left: 8px;">Out of Stock</span>`;
            } else if (selectedComp.stockStatus === 'low_stock') {
              stockBadgeHTML = `<span class="stock-badge stock-badge--low" style="margin-left: 8px;">Low Stock (${selectedComp.stockQuantity || 1} left)</span>`;
            }
          }

          return `
          <div class="config-row" data-cat-id="${cat.id}">
            <div class="config-cat-info">
              <span class="cat-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                </svg>
              </span>
              <span class="cat-name">${cat.name}</span>
            </div>

            <div class="config-select-wrapper">
              <div style="display: flex; align-items: center;">
                <select class="select-input comp-select" data-cat-id="${cat.id}" style="flex: 1;">
                  ${optionsHTML}
                </select>
                ${stockBadgeHTML}
              </div>
              <span class="spec-tag" id="spec-tag-${cat.id}">${specDetails}</span>
            </div>

            <div class="config-price-cell" id="price-cell-${cat.id}">
              $${selectedComp ? selectedComp.price : 0}
            </div>
          </div>
        `;
        })
        .join('');

      // Add event listeners to select elements
      configContainer.querySelectorAll('.comp-select').forEach((select) => {
        select.addEventListener('change', (e) => {
          const catId = select.getAttribute('data-cat-id');
          const compId = select.value;
          activeState.components[catId] = compId;
          updateCalculations();
        });
      });
    }

    /* 4. Populate Preset Dropdown */
    if (presetSelect) {
      presetSelect.innerHTML =
        '<option value="">-- Load Template Preset --</option>' +
        data.buildTemplates
          .map((t) => `<option value="${t.id}">${t.name} ($${t.totalPrice})</option>`)
          .join('');

      presetSelect.addEventListener('change', () => {
        const tId = presetSelect.value;
        if (!tId) return;
        loadTemplateIntoConfigurator(tId);
      });
    }

    function loadTemplateIntoConfigurator(templateId) {
      const template = data.buildTemplates.find((t) => t.id === templateId);
      if (!template) return;

      activeState.id = 'custom-' + Date.now();
      activeState.name = template.name + ' (Custom)';
      activeState.components = { ...template.components };

      const nameInput = document.getElementById('build-name-input');
      if (nameInput) nameInput.value = activeState.name;

      renderConfiguratorRows();
      updateCalculations();

      // Scroll smoothly to configurator
      const configSec = document.getElementById('configurator-section');
      if (configSec) {
        configSec.scrollIntoView({ behavior: 'smooth' });
      }
    }

    /* 5. Live Calculations (Price, Wattage, Rating & Stock Check) */
    function updateCalculations() {
      let totalPrice = 0;
      let totalWattage = 0;
      let totalScore = 0;
      const outOfStockParts = [];

      const miniComponentsList = [];

      data.categories.forEach((cat) => {
        const compId = activeState.components[cat.id];
        const comp = getComponent(cat.id, compId);

        if (comp) {
          totalPrice += comp.price || 0;
          totalWattage += comp.wattage || 0;

          if (comp.score) {
            totalScore += comp.score;
          }

          if (comp.stockStatus === 'out_of_stock') {
            outOfStockParts.push(comp.name);
          }

          // Update spec tag & price cell in DOM
          const tagEl = document.getElementById(`spec-tag-${cat.id}`);
          if (tagEl && comp.specs) {
            tagEl.textContent = Object.values(comp.specs).slice(0, 3).join(' • ');
          }

          const priceEl = document.getElementById(`price-cell-${cat.id}`);
          if (priceEl) {
            priceEl.textContent = `$${comp.price}`;
          }

          miniComponentsList.push({ catName: cat.name, compName: comp.name, price: comp.price });
        }
      });

      // Selected PSU capacity
      const psuComp = getComponent('psu', activeState.components.psu);
      const psuCapacity = psuComp ? psuComp.capacityWattage || 750 : 750;

      // Calculate performance score (0-100)
      const cpuComp = getComponent('cpu', activeState.components.cpu);
      const gpuComp = getComponent('gpu', activeState.components.gpu);
      const perfScore = Math.round(((cpuComp ? cpuComp.score : 50) + (gpuComp ? gpuComp.score : 50)) / 2);

      // Determine tier label based on total price
      let tier = 'budget';
      let tierLabel = 'Budget';
      if (totalPrice >= 1200) {
        tier = 'gaming';
        tierLabel = 'Gaming';
      }
      if (totalPrice >= 2200) {
        tier = 'enthusiast';
        tierLabel = 'Enthusiast';
      }
      if (totalPrice >= 3800) {
        tier = 'workstation';
        tierLabel = 'Workstation';
      }

      activeState.totalPrice = totalPrice;
      activeState.totalWattage = totalWattage;
      activeState.performanceScore = perfScore;
      activeState.tier = tier;
      activeState.tierLabel = tierLabel;

      // Update Summary Sidebar Elements
      const summaryPriceEl = document.getElementById('summary-total-price');
      if (summaryPriceEl) summaryPriceEl.textContent = `$${totalPrice.toLocaleString()}`;

      const summaryBadgeEl = document.getElementById('summary-tier-badge');
      if (summaryBadgeEl) {
        summaryBadgeEl.className = `summary-badge tier-badge tier-badge--${tier}`;
        summaryBadgeEl.textContent = `${tierLabel} Tier`;
      }

      // Wattage meter
      const wattageTextEl = document.getElementById('summary-wattage-text');
      if (wattageTextEl) wattageTextEl.textContent = `${totalWattage}W / ${psuCapacity}W`;

      const wattageBarEl = document.getElementById('summary-wattage-bar');
      const wattagePct = Math.min(100, Math.round((totalWattage / psuCapacity) * 100));
      if (wattageBarEl) {
        wattageBarEl.style.width = `${wattagePct}%`;
        if (wattagePct > 85) {
          wattageBarEl.className = 'meter-bar-fill meter-bar-fill--warning';
        } else {
          wattageBarEl.className = 'meter-bar-fill';
        }
      }

      const wattageStatusEl = document.getElementById('summary-wattage-status');
      if (wattageStatusEl) {
        if (outOfStockParts.length > 0) {
          wattageStatusEl.innerHTML = `<span style="color: #ef4444; font-weight: 600;">⚠ Out of Stock Component Selected: ${outOfStockParts.join(', ')}</span>`;
        } else if (totalWattage > psuCapacity) {
          wattageStatusEl.textContent = `⚠ Warning: System wattage (${totalWattage}W) exceeds PSU capacity (${psuCapacity}W)!`;
          wattageStatusEl.className = 'meter-note meter-note--warning';
        } else if (wattagePct > 80) {
          wattageStatusEl.textContent = `High PSU load (${wattagePct}% capacity). Consider upgrading PSU for headroom.`;
          wattageStatusEl.className = 'meter-note meter-note--warning';
        } else {
          wattageStatusEl.textContent = `✓ Power Headroom OK (${psuCapacity - totalWattage}W remaining)`;
          wattageStatusEl.className = 'meter-note meter-note--success';
        }
      }

      // Score bar
      const scoreTextEl = document.getElementById('summary-score-text');
      if (scoreTextEl) scoreTextEl.textContent = `${perfScore} / 100`;

      const scoreBarEl = document.getElementById('summary-score-bar');
      if (scoreBarEl) scoreBarEl.style.width = `${perfScore}%`;

      // Mini component breakdown
      const miniListEl = document.getElementById('summary-components-mini');
      if (miniListEl) {
        miniListEl.innerHTML = miniComponentsList
          .map(
            (item) => `
            <div class="mini-comp-row">
              <span class="mini-comp-name" title="${item.compName}">${item.compName}</span>
              <span>$${item.price}</span>
            </div>
          `
          )
          .join('');
      }
    }

    /* 6. Event Listeners for Pre-made Grid Actions */
    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
        const customizeBtn = e.target.closest('.customize-template-btn');
        if (customizeBtn) {
          const tId = customizeBtn.getAttribute('data-template-id');
          loadTemplateIntoConfigurator(tId);
          return;
        }

        const quickSaveBtn = e.target.closest('.quick-save-btn');
        if (quickSaveBtn) {
          const tId = quickSaveBtn.getAttribute('data-template-id');
          const template = data.buildTemplates.find((t) => t.id === tId);
          if (template) {
            const buildToSave = {
              id: 'saved-' + Date.now(),
              name: template.name,
              tier: template.tier,
              tierLabel: template.tierLabel,
              dateSaved: new Date().toISOString().split('T')[0],
              status: 'Saved Draft',
              isFavorite: false,
              totalPrice: template.totalPrice,
              totalWattage: template.totalWattage,
              performanceScore: template.performanceScore,
              components: { ...template.components }
            };
            saveBuild(buildToSave);
            quickSaveBtn.textContent = '✓ Saved!';
            setTimeout(() => {
              quickSaveBtn.textContent = '★ Save';
            }, 2000);
          }
        }
      });
    }

    renderFutureDrops();

    /* 7. Reset Configurator Button */
    const resetBtn = document.getElementById('reset-configurator-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        loadTemplateIntoConfigurator('build-gaming-apex');
      });
    }

    if (futureBuildsInput) {
      futureBuildsInput.value = JSON.stringify(getFutureDrops(), null, 2);
    }

    if (saveFutureBuildsBtn && futureBuildsInput) {
      saveFutureBuildsBtn.addEventListener('click', () => {
        try {
          const parsed = JSON.parse(futureBuildsInput.value);
          if (!Array.isArray(parsed)) throw new Error('Queue must be an array');
          saveFutureDrops(parsed);
          renderFutureDrops();
          if (futureBuildsFeedback) {
            futureBuildsFeedback.textContent = 'Saved coming soon queue.';
            futureBuildsFeedback.className = 'summary-feedback-msg is-success';
          }
        } catch (err) {
          if (futureBuildsFeedback) {
            futureBuildsFeedback.textContent = 'Invalid JSON. Use an array of objects.';
            futureBuildsFeedback.className = 'summary-feedback-msg is-error';
          }
        }
      });
    }

    if (resetFutureBuildsBtn && futureBuildsInput) {
      resetFutureBuildsBtn.addEventListener('click', () => {
        localStorage.removeItem(FUTURE_DROPS_KEY);
        futureBuildsInput.value = JSON.stringify(getFutureDrops(), null, 2);
        renderFutureDrops();
        if (futureBuildsFeedback) {
          futureBuildsFeedback.textContent = 'Reset coming soon queue.';
          futureBuildsFeedback.className = 'summary-feedback-msg is-success';
        }
      });
    }

    /* 8. Save Build Handler */
    const saveBuildBtn = document.getElementById('save-build-btn');
    const nameInput = document.getElementById('build-name-input');
    const feedbackEl = document.getElementById('summary-feedback');

    if (saveBuildBtn) {
      saveBuildBtn.addEventListener('click', () => {
        const title = nameInput ? nameInput.value.trim() || 'My Custom Rig' : 'My Custom Rig';

        const buildRecord = {
          id: activeState.id || 'custom-' + Date.now(),
          name: title,
          tier: activeState.tier,
          tierLabel: activeState.tierLabel,
          dateSaved: new Date().toISOString().split('T')[0],
          status: 'Saved Draft',
          isFavorite: false,
          totalPrice: activeState.totalPrice,
          totalWattage: activeState.totalWattage,
          performanceScore: activeState.performanceScore,
          components: { ...activeState.components }
        };

        saveBuild(buildRecord);

        if (feedbackEl) {
          feedbackEl.innerHTML = `✓ Configuration Saved locally!`;
          feedbackEl.className = 'summary-feedback-msg is-success';
          setTimeout(() => {
            feedbackEl.textContent = '';
          }, 3000);
        }
      });
    }

    /* 9. Order Confirmation Modal Handler */
    const orderModal = document.getElementById('order-modal');
    const orderBtn = document.getElementById('order-build-btn');
    const orderSummaryBox = document.getElementById('order-modal-summary');

    if (orderBtn && orderModal) {
      orderBtn.addEventListener('click', () => {
        // Populate modal summary
        if (orderSummaryBox) {
          const compRows = data.categories
            .map((cat) => {
              const comp = getComponent(cat.id, activeState.components[cat.id]);
              return `
              <div class="mini-comp-row" style="margin-bottom: 4px;">
                <span style="color: var(--color-text-subtle);">${cat.name}:</span>
                <span style="font-weight: 500;">${comp ? comp.name : 'N/A'} ($${comp ? comp.price : 0})</span>
              </div>
            `;
            })
            .join('');

          orderSummaryBox.innerHTML = `
            <div style="font-family: var(--font-mono); font-size: var(--text-xs); margin-bottom: 8px;">
              <strong>SYSTEM:</strong> ${nameInput ? nameInput.value : 'Custom Rig'}<br>
              <strong>ESTIMATED TOTAL:</strong> <span style="color: var(--color-accent-green); font-weight: 600;">$${activeState.totalPrice.toLocaleString()}</span>
            </div>
            <div style="border-top: 1px solid var(--color-border); padding-top: 8px; font-size: var(--text-xs);">
              ${compRows}
            </div>
          `;
        }

        orderModal.classList.add('is-open');
        orderModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });

      // Dismiss handler
      orderModal.addEventListener('click', (e) => {
        if (e.target.closest('[data-dismiss="order-modal"]')) {
          orderModal.classList.remove('is-open');
          orderModal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });

      // Form submission (sends order POST to REST API)
      const orderForm = document.getElementById('order-form');
      const orderFeedback = document.getElementById('order-form-feedback');
      if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('order-email').value;
          const name = document.getElementById('order-name').value;

          if (!email || !email.includes('@')) {
            if (orderFeedback) {
              orderFeedback.textContent = 'Please enter a valid email address.';
              orderFeedback.className = 'newsletter-modal-feedback is-error';
            }
            return;
          }

          try {
            // Post order to Express backend /api/orders
            await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerName: name || 'Customer',
                customerEmail: email,
                buildTitle: nameInput ? nameInput.value : 'Custom Rig',
                tier: activeState.tier,
                totalPrice: activeState.totalPrice,
                components: activeState.components
              })
            });
          } catch (err) {
            console.log('Posting order to API failed (running static mode):', err);
          }

          if (orderFeedback) {
            orderFeedback.textContent = '✓ Order Reservation Submitted! Our team will email your quote.';
            orderFeedback.className = 'newsletter-modal-feedback is-success';
          }

          setTimeout(() => {
            orderModal.classList.remove('is-open');
            orderModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
          }, 2500);
        });
      }
    }

    /* 10. Copy Specs Text Handler */
    const copySpecsBtn = document.getElementById('copy-specs-btn');
    if (copySpecsBtn) {
      copySpecsBtn.addEventListener('click', () => {
        const specLines = [
          `=== AMBURSA CUSTOM PC BUILD SPECIFICATION ===`,
          `Build Name: ${nameInput ? nameInput.value : 'Custom Rig'}`,
          `Tier: ${activeState.tierLabel}`,
          `Total Estimated Price: $${activeState.totalPrice}`,
          `Estimated Wattage: ${activeState.totalWattage}W`,
          `Performance Rating: ${activeState.performanceScore}/100`,
          `-------------------------------------------`
        ];

        data.categories.forEach((cat) => {
          const comp = getComponent(cat.id, activeState.components[cat.id]);
          if (comp) {
            specLines.push(`${cat.name.padEnd(24, ' ')}: ${comp.name} ($${comp.price})`);
          }
        });

        specLines.push(`===========================================`);

        navigator.clipboard.writeText(specLines.join('\n')).then(() => {
          copySpecsBtn.textContent = '✓ Specs Copied!';
          setTimeout(() => {
            copySpecsBtn.textContent = 'Copy Specs text';
          }, 2000);
        });
      });
    }

    /* Initial Page Render */
    renderPremadeGrid('all');
    renderConfiguratorRows();
    updateCalculations();

    // Check URL parameters (e.g. ?preset=budget or ?buildId=xxx)
    const urlParams = new URLSearchParams(window.location.search);
    const presetParam = urlParams.get('preset');
    const buildIdParam = urlParams.get('buildId');

    if (presetParam) {
      const match = data.buildTemplates.find((t) => t.tier === presetParam || t.id === presetParam);
      if (match) loadTemplateIntoConfigurator(match.id);
    } else if (buildIdParam) {
      const saved = getSavedBuilds().find((b) => b.id === buildIdParam);
      if (saved) {
        activeState.id = saved.id;
        activeState.name = saved.name;
        activeState.components = { ...saved.components };
        if (nameInput) nameInput.value = saved.name;
        renderConfiguratorRows();
        updateCalculations();
      }
    }
  })();

  /* ─── OWNER INVENTORY & ORDER MANAGEMENT DASHBOARD ───────── */

  (function initOwnerDashboardPage() {
    const tableContainerEl = document.getElementById('admin-inventory-table-container');
    if (!tableContainerEl) return; // Not on dashboard.html

    const data = window.PC_BUILD_DATA;
    if (!data) return;

    let currentTab = 'inventory'; // 'inventory' or 'orders'
    let currentSearchTerm = '';
    let currentCategoryFilter = 'all';
    let currentStockFilter = 'all';

    /* Helper: Save Inventory to LocalStorage & Backend API */
    async function updateComponentStock(catId, compId, newStatus, newQty, newPrice) {
      const catList = data.components[catId];
      if (!catList) return;
      const comp = catList.find((c) => c.id === compId);
      if (comp) {
        if (newStatus !== undefined) comp.stockStatus = newStatus;
        if (newQty !== undefined) comp.stockQuantity = Number(newQty);
        if (newPrice !== undefined) comp.price = Number(newPrice);
      }

      // Try sending PATCH to backend REST API
      try {
        await fetch(`/api/inventory/${catId}/${compId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stockStatus: newStatus,
            stockQuantity: newQty,
            price: newPrice
          })
        });
      } catch (err) {
        // API offline fallback
      }

      renderAdminDashboard();
    }

    /* Update Stat Counter Badges */
    function updateAdminStats() {
      let inStockCount = 0;
      let lowStockCount = 0;
      let outStockCount = 0;

      Object.keys(data.components).forEach((catId) => {
        data.components[catId].forEach((item) => {
          if (item.stockStatus === 'out_of_stock') outStockCount++;
          else if (item.stockStatus === 'low_stock') lowStockCount++;
          else inStockCount++;
        });
      });

      const ordersCount = (data.orders || []).length;

      const instockEl = document.getElementById('stat-instock-count');
      const lowstockEl = document.getElementById('stat-lowstock-count');
      const outstockEl = document.getElementById('stat-outstock-count');
      const ordersEl = document.getElementById('stat-orders-count');
      const tabBadgeEl = document.getElementById('orders-tab-badge');

      if (instockEl) instockEl.textContent = inStockCount;
      if (lowstockEl) lowstockEl.textContent = lowStockCount;
      if (outstockEl) outstockEl.textContent = outStockCount;
      if (ordersEl) ordersEl.textContent = ordersCount;
      if (tabBadgeEl) tabBadgeEl.textContent = ordersCount;
    }

    /* Render Tab 1: Hardware Component Inventory Matrix Table */
    function renderInventoryTable() {
      if (!tableContainerEl) return;

      updateAdminStats();

      // Collect all components across categories
      let allItems = [];
      data.categories.forEach((cat) => {
        const list = data.components[cat.id] || [];
        list.forEach((item) => {
          allItems.push({ ...item, catId: cat.id, catName: cat.name });
        });
      });

      // Filter by Category
      if (currentCategoryFilter !== 'all') {
        allItems = allItems.filter((item) => item.catId === currentCategoryFilter);
      }

      // Filter by Stock Status
      if (currentStockFilter !== 'all') {
        allItems = allItems.filter((item) => item.stockStatus === currentStockFilter);
      }

      // Filter by Search Query
      if (currentSearchTerm) {
        const q = currentSearchTerm.toLowerCase();
        allItems = allItems.filter(
          (item) => item.name.toLowerCase().includes(q) || item.catName.toLowerCase().includes(q)
        );
      }

      if (allItems.length === 0) {
        tableContainerEl.innerHTML = `
          <div class="empty-state-box">
            <p>No inventory items match your filter selection.</p>
          </div>
        `;
        return;
      }

      tableContainerEl.innerHTML = `
        <table class="dash-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Component Name</th>
              <th>Key Specs</th>
              <th>Price ($)</th>
              <th>Quantity</th>
              <th>Stock Status Control</th>
            </tr>
          </thead>
          <tbody>
            ${allItems
              .map((item) => {
                let specStr = item.specs ? Object.values(item.specs).slice(0, 2).join(' • ') : 'N/A';
                const status = item.stockStatus || 'in_stock';

                const inActive = status === 'in_stock' ? 'is-active-in' : '';
                const lowActive = status === 'low_stock' ? 'is-active-low' : '';
                const outActive = status === 'out_of_stock' ? 'is-active-out' : '';

                return `
                <tr data-cat-id="${item.catId}" data-comp-id="${item.id}">
                  <td><span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-text-subtle);">${item.catName}</span></td>
                  <td><strong>${item.name}</strong></td>
                  <td><span style="font-size: 0.75rem; color: var(--color-text-muted);">${specStr}</span></td>
                  <td>
                    <input type="number" class="input-mini edit-price-input" value="${item.price}" min="0" data-cat-id="${item.catId}" data-comp-id="${item.id}">
                  </td>
                  <td>
                    <input type="number" class="input-mini edit-qty-input" value="${item.stockQuantity || 0}" min="0" data-cat-id="${item.catId}" data-comp-id="${item.id}">
                  </td>
                  <td>
                    <div class="stock-toggle-group">
                      <button type="button" class="stock-toggle-btn ${inActive} set-status-btn" data-cat-id="${item.catId}" data-comp-id="${item.id}" data-status="in_stock">In Stock</button>
                      <button type="button" class="stock-toggle-btn ${lowActive} set-status-btn" data-cat-id="${item.catId}" data-comp-id="${item.id}" data-status="low_stock">Low Stock</button>
                      <button type="button" class="stock-toggle-btn ${outActive} set-status-btn" data-cat-id="${item.catId}" data-comp-id="${item.id}" data-status="out_of_stock">Out of Stock</button>
                    </div>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      `;
    }

    /* Render Tab 2: Customer Orders Table */
    function renderOrdersTable() {
      const ordersContainerEl = document.getElementById('admin-orders-table-container');
      if (!ordersContainerEl) return;

      const orders = data.orders || [];

      if (orders.length === 0) {
        ordersContainerEl.innerHTML = `
          <div class="empty-state-box">
            <p>No customer build orders recorded yet.</p>
          </div>
        `;
        return;
      }

      ordersContainerEl.innerHTML = `
        <table class="dash-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Requested Build</th>
              <th>Date</th>
              <th>Price</th>
              <th>Processing Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map((ord) => {
                return `
                <tr>
                  <td><strong style="font-family: var(--font-mono);">${ord.id}</strong></td>
                  <td><strong>${ord.customerName}</strong><br><span style="font-size: 0.72rem; color: var(--color-accent-cyan);">${ord.customerEmail}</span></td>
                  <td>${ord.buildTitle} <span class="tier-badge tier-badge--${ord.tier}">${ord.tier}</span></td>
                  <td><span style="font-family: var(--font-mono); font-size: 0.75rem;">${ord.orderDate}</span></td>
                  <td><strong style="font-family: var(--font-mono); color: var(--color-accent-green);">$${ord.totalPrice.toLocaleString()}</strong></td>
                  <td>
                    <select class="select-input select-input--sm update-order-status" data-order-id="${ord.id}">
                      <option value="Pending" ${ord.status === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="In Assembly" ${ord.status === 'In Assembly' ? 'selected' : ''}>In Assembly</option>
                      <option value="Shipped" ${ord.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                      <option value="Completed" ${ord.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" class="btn-secondary btn-sm view-order-btn" data-order-id="${ord.id}">View Specs</button>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      `;
    }

    function renderAdminDashboard() {
      if (currentTab === 'inventory') {
        document.getElementById('admin-inventory-panel').style.display = 'block';
        document.getElementById('admin-orders-panel').style.display = 'none';
        renderInventoryTable();
      } else {
        document.getElementById('admin-inventory-panel').style.display = 'none';
        document.getElementById('admin-orders-panel').style.display = 'block';
        renderOrdersTable();
      }
    }

    /* Tab Click Listeners */
    const tabInventoryBtn = document.getElementById('tab-inventory-btn');
    const tabOrdersBtn = document.getElementById('tab-orders-btn');

    if (tabInventoryBtn && tabOrdersBtn) {
      tabInventoryBtn.addEventListener('click', () => {
        currentTab = 'inventory';
        tabInventoryBtn.classList.add('is-active');
        tabOrdersBtn.classList.remove('is-active');
        renderAdminDashboard();
      });

      tabOrdersBtn.addEventListener('click', () => {
        currentTab = 'orders';
        tabOrdersBtn.classList.add('is-active');
        tabInventoryBtn.classList.remove('is-active');
        renderAdminDashboard();
      });
    }

    /* Filter & Search Inputs */
    const adminSearchInput = document.getElementById('admin-search-input');
    if (adminSearchInput) {
      adminSearchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        renderInventoryTable();
      });
    }

    const adminCatFilter = document.getElementById('admin-cat-filter');
    if (adminCatFilter) {
      adminCatFilter.addEventListener('change', (e) => {
        currentCategoryFilter = e.target.value;
        renderInventoryTable();
      });
    }

    const adminStockFilter = document.getElementById('admin-stock-filter');
    if (adminStockFilter) {
      adminStockFilter.addEventListener('change', (e) => {
        currentStockFilter = e.target.value;
        renderInventoryTable();
      });
    }

    /* Event Delegation for Stock Control Actions */
    if (tableContainerEl) {
      tableContainerEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.set-status-btn');
        if (btn) {
          const catId = btn.getAttribute('data-cat-id');
          const compId = btn.getAttribute('data-comp-id');
          const status = btn.getAttribute('data-status');
          updateComponentStock(catId, compId, status);
        }
      });

      tableContainerEl.addEventListener('change', (e) => {
        const priceInput = e.target.closest('.edit-price-input');
        if (priceInput) {
          const catId = priceInput.getAttribute('data-cat-id');
          const compId = priceInput.getAttribute('data-comp-id');
          updateComponentStock(catId, compId, undefined, undefined, priceInput.value);
          return;
        }

        const qtyInput = e.target.closest('.edit-qty-input');
        if (qtyInput) {
          const catId = qtyInput.getAttribute('data-cat-id');
          const compId = qtyInput.getAttribute('data-comp-id');
          updateComponentStock(catId, compId, undefined, qtyInput.value);
        }
      });
    }

    /* Orders Panel Status Updates */
    const ordersContainerEl = document.getElementById('admin-orders-table-container');
    if (ordersContainerEl) {
      ordersContainerEl.addEventListener('change', async (e) => {
        const statusSelect = e.target.closest('.update-order-status');
        if (statusSelect) {
          const orderId = statusSelect.getAttribute('data-order-id');
          const newStatus = statusSelect.value;

          const order = (data.orders || []).find((o) => o.id === orderId);
          if (order) order.status = newStatus;

          try {
            await fetch(`/api/orders/${orderId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            });
          } catch (err) {}
        }
      });
    }

    /* Sidebar Owner Control Buttons */
    const restockBtn = document.getElementById('admin-restock-all-btn');
    if (restockBtn) {
      restockBtn.addEventListener('click', () => {
        if (confirm('Mark ALL hardware components as "In Stock"?')) {
          Object.keys(data.components).forEach((catId) => {
            data.components[catId].forEach((item) => {
              item.stockStatus = 'in_stock';
              item.stockQuantity = 10;
            });
          });
          renderAdminDashboard();
        }
      });
    }

    const exportBtn = document.getElementById('admin-export-json-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ambursa_inventory_export.json';
        a.click();
      });
    }

    const syncApiBtn = document.getElementById('admin-sync-api-btn');
    if (syncApiBtn) {
      syncApiBtn.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/inventory');
          if (res.ok) {
            const apiData = await res.json();
            if (apiData.components) data.components = apiData.components;
            alert('✓ Synced with Node Express Backend Server!');
            renderAdminDashboard();
          }
        } catch (err) {
          alert('Server API endpoint (/api/inventory) unreachable. Ensure node server/index.js is running!');
        }
      });
    }

    const resetBtn = document.getElementById('admin-reset-defaults-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset inventory stock statuses to factory default values?')) {
          localStorage.removeItem('ambursa_inventory_overrides');
          window.location.reload();
        }
      });
    }

    /* Owner Authentication Gate Logic */
    const authModal = document.getElementById('owner-auth-modal');
    const authForm = document.getElementById('owner-auth-form');
    const authInput = document.getElementById('owner-passcode-input');
    const authFeedback = document.getElementById('owner-auth-feedback');
    const lockPortalBtn = document.getElementById('admin-lock-portal-btn');

    function checkOwnerAuth() {
      if (!authModal) return true;
      const isAuthed = sessionStorage.getItem('ambursa_owner_authed') === 'true';
      if (!isAuthed) {
        authModal.classList.add('is-open');
        authModal.setAttribute('aria-hidden', 'false');
        if (authInput) authInput.focus();
        return false;
      } else {
        authModal.classList.remove('is-open');
        authModal.setAttribute('aria-hidden', 'true');
        return true;
      }
    }

    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = authInput ? authInput.value.trim() : '';
        // Owner passcodes: 'admin' or 'ambursa2026'
        if (code === 'admin' || code === 'ambursa2026' || code === 'owner') {
          sessionStorage.setItem('ambursa_owner_authed', 'true');
          authFeedback.textContent = '✓ Unlocked Owner Control Center!';
          authFeedback.className = 'newsletter-modal-feedback is-success';
          setTimeout(() => {
            authModal.classList.remove('is-open');
            authModal.setAttribute('aria-hidden', 'true');
            renderAdminDashboard();
          }, 800);
        } else {
          authFeedback.textContent = 'Invalid owner passcode. (Default: admin)';
          authFeedback.className = 'newsletter-modal-feedback is-error';
        }
      });
    }

    if (lockPortalBtn) {
      lockPortalBtn.addEventListener('click', () => {
        sessionStorage.removeItem('ambursa_owner_authed');
        alert('Owner Portal Locked.');
        checkOwnerAuth();
      });
    }

    /* Initial Owner Dashboard Render */
    if (checkOwnerAuth()) {
      renderAdminDashboard();
    }
  })();
})();




