// ======================================================
// Shared JavaScript for Vendors Market
// ======================================================


// ------------------------------------------------------
// PAGE TRANSITION NAVIGATION
// ------------------------------------------------------
function initPageTransitions() {
  const navLinks = document.querySelectorAll('.bottom-nav .nav-item');
  const wrapper = document.querySelector('.page-transition');

  if (!navLinks.length || !wrapper) return;

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const url = link.getAttribute('href');

      if (!url || window.location.pathname.endsWith(url)) return;

      e.preventDefault();
      wrapper.classList.add('page-exit');

      setTimeout(() => {
        window.location.href = url;
      }, 180);
    });
  });
}


// ------------------------------------------------------
// THEME APPLICATION + NAV ICON COLOR SWITCHING
// ------------------------------------------------------
function applySavedBodyTheme() {
  const theme = localStorage.getItem('activeTheme') || 'food';
  document.body.classList.add(theme === 'food' ? 'theme-food' : 'theme-clothing');
}

function updateNavIconsByTheme() {
  const theme = localStorage.getItem('activeTheme') || 'food';
  const icons = document.querySelectorAll('.nav-icon');

  icons.forEach(icon => {
    const brown = icon.dataset.brown;
    const blue = icon.dataset.blue;

    if (theme === 'food' && brown) icon.src = brown;
    if (theme === 'clothing' && blue) icon.src = blue;
  });
}


// ------------------------------------------------------
// HOMEPAGE CATEGORY SWITCHING
// ------------------------------------------------------
function initHomepageCategorySwitch() {
  const pills = document.querySelectorAll('.category-icon-btn');
  const products = document.querySelectorAll('.product-card');
  if (!pills.length) return;

  function setTheme(theme) {
    document.body.classList.remove('theme-food', 'theme-clothing');
    document.body.classList.add(theme === 'food' ? 'theme-food' : 'theme-clothing');
    localStorage.setItem('activeTheme', theme);
    updateNavIconsByTheme();
  }

  function switchCategory(category) {
    pills.forEach(p => p.classList.toggle('active', p.dataset.category === category));
    products.forEach(card => {
      card.style.display = card.dataset.category === category ? 'block' : 'none';
    });

    setTheme(category);
  }

  const saved = localStorage.getItem('activeTheme') || 'food';
  switchCategory(saved);

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      switchCategory(pill.dataset.category);
    });
  });
}


// ------------------------------------------------------
// PROFILE PAGE – TAB SWITCHING
// ------------------------------------------------------
function initProfileTabs() {
  const tabs = document.querySelectorAll('.profile-tab');
  const panels = document.querySelectorAll('.profile-tab-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('is-active'));
      panels.forEach(p => p.classList.remove('is-active'));

      tab.classList.add('is-active');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('is-active');
    });
  });
}
function initFeedbackModal() {
  const openBtn = document.getElementById('openFeedback');
  const overlay = document.getElementById('feedbackOverlay');
  const closeBtn = document.getElementById('closeFeedback');

  if (!openBtn || !overlay || !closeBtn) return;

  function openModal() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  // Close when clicking the dark backdrop
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('feedback-backdrop')) {
      closeModal();
    }
  });

  // ESC key closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // (Optional) block actual submit for now
  const form = overlay.querySelector('.feedback-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // You can connect this to backend later
      closeModal();
      alert('Thanks for your feedback!');
    });
  }
}


// ------------------------------------------------------
// INITIALIZER
// ------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  applySavedBodyTheme();
  updateNavIconsByTheme();
  initPageTransitions();
  initHomepageCategorySwitch();
  initProfileTabs();
  initFeedbackModal();
  loadFooter();
});


// ------------------------------------------------------
// FOOTER LOADER (shared footer.html)
// ------------------------------------------------------
async function loadFooter() {
  const container = document.getElementById('site-footer');
  if (!container) return;

  try {
    const response = await fetch('footer.html');
    if (!response.ok) return;
    const html = await response.text();
    container.innerHTML = html;
  } catch (e) {
    // fail silently on local file restrictions
  }
}
