// Minimal shared helpers kept for legacy static pages

function getStoredTheme(defaultTheme = 'clothing') {
  const stored = localStorage.getItem('activeTheme');
  return stored === 'food' || stored === 'clothing' ? stored : defaultTheme;
}

function getStoredDarkMode() {
  const stored = localStorage.getItem('darkMode');
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) || true;
}

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
  const theme = getStoredTheme();
  const isDark = getStoredDarkMode();
  document.body.classList.remove('theme-food', 'theme-clothing', 'dark');
  document.body.classList.add(theme === 'food' ? 'theme-food' : 'theme-clothing');
  if (isDark) document.body.classList.add('dark');
  document.documentElement.classList.toggle('dark', !!isDark);
  return { theme, isDark };
}

function updateNavIconsByTheme() {
  const theme = getStoredTheme();
  const isDark = getStoredDarkMode();
  const swap = (selector) => {
    document.querySelectorAll(selector).forEach((icon) => {
      const brown = icon.dataset.brown;
      const blue = icon.dataset.blue;

      if (theme === 'clothing' && isDark) {
        const src = icon.getAttribute('src') || '';
        if (src.includes('home')) icon.src = '/icons/home-clothing-dark.png';
        else if (src.includes('search')) icon.src = '/icons/search-clothing-dark.png';
        else if (src.includes('profile')) icon.src = '/icons/profile-clothing-dark.png';
        else if (icon.classList.contains('back-icon')) icon.src = '/icons/back-button-clothing-dark.png';
        else if (src.includes('add.png')) icon.src = '/icons/add-clothing-dark.png';
        else if (blue) icon.src = blue;
      } else {
        if (theme === 'food' && brown) icon.src = brown;
        if (theme === 'clothing' && blue) icon.src = blue;
      }
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

// Keep icons/classes in sync when theme changes elsewhere
window.addEventListener('vm-theme-change', () => {
  applySavedBodyTheme();
  updateNavIconsByTheme();
});

window.applySavedBodyTheme = applySavedBodyTheme;
window.updateNavIconsByTheme = updateNavIconsByTheme;
window.initPageTransitions = initPageTransitions;
window.runAllInitializers = runAllInitializers;
window.showRatingToast = showRatingToast;
