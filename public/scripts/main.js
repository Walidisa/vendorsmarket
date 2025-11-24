// Minimal shared helpers kept for legacy static pages

function initPageTransitions() {
  const navLinks = document.querySelectorAll('.bottom-nav .nav-item');
  const wrapper = document.querySelector('.page-transition');
  if (!navLinks.length || !wrapper) return;
  wrapper.classList.remove('page-exit');
  if (window.__navTransitionsBound) return;
  window.__navTransitionsBound = true;
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const url = link.getAttribute('href');
      if (!url || window.location.pathname.endsWith(url)) return;
      wrapper.classList.add('page-exit');
    });
  });
}

function applySavedBodyTheme() {
  const theme = localStorage.getItem('activeTheme') || 'food';
  document.body.classList.remove('theme-food', 'theme-clothing');
  document.body.classList.add(theme === 'food' ? 'theme-food' : 'theme-clothing');
}

function updateNavIconsByTheme() {
  const theme = localStorage.getItem('activeTheme') || 'food';
  const swap = (selector) => {
    document.querySelectorAll(selector).forEach((icon) => {
      const brown = icon.dataset.brown;
      const blue = icon.dataset.blue;
      if (theme === 'food' && brown) icon.src = brown;
      if (theme === 'clothing' && blue) icon.src = blue;
    });
  };
  swap('.nav-icon');
  swap('.profile-add-product-card-icon');
  swap('.back-icon');
  swap('.profile-card-btn-icon');
  swap('.profile-shop-edit-icon');
}

function showRatingToast(message) {
  let toast = document.getElementById('ratingToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ratingToast';
    toast.className = 'rating-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message || 'Thanks for rating!';
  toast.classList.add('is-visible');
  setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function runAllInitializers() {
  applySavedBodyTheme();
  updateNavIconsByTheme();
  initPageTransitions();
}

window.applySavedBodyTheme = applySavedBodyTheme;
window.updateNavIconsByTheme = updateNavIconsByTheme;
window.initPageTransitions = initPageTransitions;
window.runAllInitializers = runAllInitializers;
window.showRatingToast = showRatingToast;
