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

  // Also update back button icon on subcategory page
  const backIcon = document.querySelector('#subcategoryBackBtn .back-icon');
  if (backIcon) {
    const brown = backIcon.dataset.brown;
    const blue = backIcon.dataset.blue;
    if (theme === 'food' && brown) backIcon.src = brown;
    if (theme === 'clothing' && blue) backIcon.src = blue;
  }
}


// ------------------------------------------------------
// HOMEPAGE CATEGORY SWITCHING
// ------------------------------------------------------
function initHomepageCategorySwitch() {
  const pills = document.querySelectorAll('.category-icon-btn');
  const rows = document.querySelectorAll('.subcategory-row');
  if (!pills.length) return;

  function setTheme(theme) {
    document.body.classList.remove('theme-food', 'theme-clothing');
    document.body.classList.add(theme === 'food' ? 'theme-food' : 'theme-clothing');
    localStorage.setItem('activeTheme', theme);
    updateNavIconsByTheme();
  }

  function switchCategory(category) {
    pills.forEach(p => p.classList.toggle('active', p.dataset.category === category));
    rows.forEach(row => {
      row.style.display = row.dataset.category === category ? 'block' : 'none';
    });

    setTheme(category);
    // ensure products for this main category are rendered
    if (typeof renderProducts === 'function') {
      renderProducts(category);
    }
  }

  const saved = localStorage.getItem('activeTheme') || 'food';
  switchCategory(saved);

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      switchCategory(pill.dataset.category);
    });
  });

  // Wire "See all" buttons to open full subcategory page
  const seeAllButtons = document.querySelectorAll('.subcategory-see-all');
  seeAllButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.dataset.subcategory;
      const row = btn.closest('.subcategory-row');
      const main = row ? row.dataset.category : null;
      if (!sub || !main) return;

      // Persist selection for the category page
      localStorage.setItem('subcategoryMain', main);
      localStorage.setItem('subcategorySlug', sub);
      const title = row.querySelector('.subcategory-title')?.textContent || sub;
      localStorage.setItem('subcategoryTitle', title);

      window.location.href = 'category.html';
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
// PRODUCT CARDS – EXTENDED BLUR BACKGROUND
// ------------------------------------------------------
function initProductCardBackgrounds() {
  const cards = document.querySelectorAll('.product-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const img = card.querySelector('.product-image');
    const bg = card.querySelector('.image-bg-extend');
    if (!img || !bg) return;

    // Prefer a custom background source if provided, otherwise mirror main image
    const src = img.getAttribute('data-bg') || img.getAttribute('src');
    if (!src) return;

    bg.style.backgroundImage = `url(${src})`;
  });
}


// ------------------------------------------------------
// PRODUCTS DATA + RENDERING
// ------------------------------------------------------
let ALL_PRODUCTS = [];

async function loadProducts() {
  if (ALL_PRODUCTS.length) return ALL_PRODUCTS;

  try {
    const res = await fetch('data/products.json');
    if (!res.ok) return [];
    const data = await res.json();
    ALL_PRODUCTS = Array.isArray(data) ? data : [];
  } catch (e) {
    ALL_PRODUCTS = [];
  }
  return ALL_PRODUCTS;
}

function createProductCard(product) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.dataset.category = product.mainCategory;
  article.dataset.subcategory = product.subCategory;
  article.dataset.productId = product.id;

  article.innerHTML = `
    <div class="product-image-wrapper">
      <div class="product-image-box">
        <div class="image-bg-extend"></div>
        <img src="${product.image}" alt="${product.name}" class="product-image">
      </div>
    </div>
    <div class="product-info">
      <h3>${product.name}</h3>
      <p class="price">$${product.price.toFixed(2)}</p>
      ${typeof product.ratingValue === 'number' && typeof product.ratingCount === 'number'
          ? `<p class="rating">⭐${product.ratingValue.toFixed(1)} (${product.ratingCount})</p>`
        : ''}
      <p class="details"> ${product.vendor}</p>
    </div>
  `;

  // Clicking a product card opens the product detail page
  article.addEventListener('click', () => {
    localStorage.setItem('activeProductId', product.id);
    window.location.href = 'product.html';
  });

  return article;
}

async function renderProducts(mainCategory) {
  const products = await loadProducts();
  if (!products.length) return;

  const groups = document.querySelectorAll('[data-products-group]');
  if (!groups.length) return;

  groups.forEach(group => {
    const [groupMain, groupSub] = group.dataset.productsGroup.split(':');

    // Clear old content
    group.innerHTML = '';

    // Filter products for this group and current main category
    const visibleProducts = products.filter(p =>
      p.mainCategory === mainCategory &&
      p.mainCategory === groupMain &&
      p.subCategory === groupSub
    );

    visibleProducts.forEach(p => {
      const card = createProductCard(p);
      group.appendChild(card);
    });

    // Hide empty rows completely
    const row = group.closest('.subcategory-row');
    if (row) {
      row.style.display = visibleProducts.length ? 'block' : 'none';
    }
  });

  // After injecting cards, sync blur backgrounds
  initProductCardBackgrounds();
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
  initProductCardBackgrounds();
  initSubcategoryPage();
   initProductDetailPage();
  loadFooter();
});


// ------------------------------------------------------
// SUBCATEGORY LISTING PAGE
// ------------------------------------------------------
async function initSubcategoryPage() {
  const grid = document.getElementById('subcategoryPageGrid');
  const titleEl = document.getElementById('subcategoryTitle');
  const backBtn = document.getElementById('subcategoryBackBtn');
  if (!grid || !titleEl) return; // not on category.html

  const main = localStorage.getItem('subcategoryMain');
  const sub = localStorage.getItem('subcategorySlug');
  const title = localStorage.getItem('subcategoryTitle');
  if (!main || !sub) return;

  if (title) titleEl.textContent = title;

  const products = await loadProducts();
  const matching = products.filter(p => p.mainCategory === main && p.subCategory === sub);

  matching.forEach(p => {
    const card = createProductCard(p);
    grid.appendChild(card);
  });

  initProductCardBackgrounds();

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'homepage.html';
    });
  }
}


// ------------------------------------------------------
// PRODUCT DETAIL PAGE
// ------------------------------------------------------
async function initProductDetailPage() {
  const container = document.getElementById('productDetailMain');
  const titleEl = document.getElementById('productTitle');
  const backBtn = document.getElementById('productBackBtn');
  if (!container || !titleEl) return; // not on product.html

  const productId = localStorage.getItem('activeProductId');
  if (!productId) return;

  const products = await loadProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  titleEl.textContent = product.name;

  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : [product.image];

  const dots = images
    .map((_, index) => `<span class="product-detail-dot${index === 0 ? ' is-active' : ''}" data-index="${index}"></span>`)
    .join('');

  const slides = images
    .map(src => `
      <div class="product-detail-slide">
        <img src="${src}" alt="${product.name}">
      </div>
    `)
    .join('');

  container.innerHTML = `
    <div class="product-detail-hero">
      <div class="product-detail-slider">
        ${slides}
      </div>
      <div class="product-detail-dots">
        ${dots}
      </div>
    </div>
    <div class="product-detail-meta">
      <p class="price">$${product.price.toFixed(2)}</p>
      ${typeof product.ratingValue === 'number' && typeof product.ratingCount === 'number'
        ? `<p class="rating">⭐<span id="productRatingValue">${product.ratingValue.toFixed(1)}</span> (<span id="productRatingCount">${product.ratingCount}</span>) <button id="rateProductBtn" class="rate-link" type="button">Rate</button></p>`
        : ''}
      <p class="product-detail-vendor">Sold by ${product.vendor}</p>
    </div>
    ${product.description ? `<p class="product-detail-description">${product.description}</p>` : ''}
    <div class="product-detail-seller">
      <div class="product-detail-seller-avatar">
        <img src="${product.sellerAvatar || 'images/default-seller.jpg'}" alt="${product.vendor}">
      </div>
      <div class="product-detail-seller-text">
        <span class="product-detail-seller-name">${product.vendor}</span>
        <span class="product-detail-seller-extra">${product.sellerDetails || 'Trusted local vendor'}</span>
      </div>
    </div>
  `;

  // simple dot navigation slider
  const slider = container.querySelector('.product-detail-slider');
  const dotEls = Array.from(container.querySelectorAll('.product-detail-dot'));
  let activeIndex = 0;

  function updateSlider(index) {
    if (!slider) return;
    if (index < 0 || index >= images.length) return;
    activeIndex = index;
    slider.style.transform = `translateX(-${index * 100}%)`;
    dotEls.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });
  }

  dotEls.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = Number(dot.getAttribute('data-index')) || 0;
      updateSlider(index);
    });
  });

  updateSlider(0);

  // rating popup logic
  const rateBtn = document.getElementById('rateProductBtn');
  if (rateBtn && typeof product.ratingValue === 'number' && typeof product.ratingCount === 'number') {
    const ratedKey = `rated_${product.id}`;
    const stored = localStorage.getItem(ratedKey);
    if (stored) {
      rateBtn.textContent = 'Remove My Rating';
    }

    rateBtn.addEventListener('click', () => {
      const current = localStorage.getItem(ratedKey);
      if (current) {
        const userRating = Number(current);
        showRemoveRatingPopup(product, userRating, () => {
          localStorage.removeItem(ratedKey);
          rateBtn.textContent = 'Rate';
        });
      } else {
        showRatingPopup(product, (givenRating) => {
          localStorage.setItem(ratedKey, String(givenRating));
          rateBtn.textContent = 'Remove my rating';
        });
      }
    });
  }

  // swipe / drag support on mobile
  if (slider && images.length > 1) {
    let startX = 0;
    let isDragging = false;

    function handleStart(clientX) {
      isDragging = true;
      startX = clientX;
    }

    function handleEnd(clientX) {
      if (!isDragging) return;
      const deltaX = clientX - startX;
      const threshold = 40;
      if (deltaX <= -threshold && activeIndex < images.length - 1) {
        updateSlider(activeIndex + 1);
      } else if (deltaX >= threshold && activeIndex > 0) {
        updateSlider(activeIndex - 1);
      }
      isDragging = false;
    }

    slider.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches.length) return;
      handleStart(e.touches[0].clientX);
    });

    slider.addEventListener('touchend', (e) => {
      const touch = e.changedTouches && e.changedTouches[0];
      if (!touch) return;
      handleEnd(touch.clientX);
    });

    // optional mouse drag for desktop
    slider.addEventListener('mousedown', (e) => {
      handleStart(e.clientX);
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      handleEnd(e.clientX);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.back();
    });
  }
}

function showRatingPopup(product, onRated) {
  let overlay = document.getElementById('ratingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'ratingOverlay';
    overlay.className = 'rating-overlay';
    overlay.innerHTML = `
      <div class="rating-dialog">
        <h2>Rate this product</h2>
        <p class="rating-dialog-sub">How would you rate it out of 5?</p>
        <div class="rating-buttons" id="ratingButtons"></div>
        <div class="rating-dialog-actions">
          <button type="button" class="rating-cancel" id="ratingCancelBtn">Cancel</button>
          <button type="button" class="rating-confirm" id="ratingConfirmBtn" disabled>Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const buttonsContainer = overlay.querySelector('#ratingButtons');
  const confirmBtn = overlay.querySelector('#ratingConfirmBtn');
  const cancelBtn = overlay.querySelector('#ratingCancelBtn');
  if (!buttonsContainer || !confirmBtn || !cancelBtn) return;

  buttonsContainer.innerHTML = '';
  let selected = null;

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = String(i);
    btn.className = 'rating-value-btn';
    btn.addEventListener('click', () => {
      selected = i;
      confirmBtn.disabled = false;
      Array.from(buttonsContainer.children).forEach(el => {
        el.classList.toggle('is-selected', el === btn);
      });
    });
    buttonsContainer.appendChild(btn);
  }

  function close() {
    overlay.classList.remove('is-visible');
  }

  cancelBtn.onclick = () => {
    close();
  };

  confirmBtn.onclick = () => {
    if (!selected) return;
    const currentValue = Number(product.ratingValue) || 0;
    const currentCount = Number(product.ratingCount) || 0;
    const total = currentValue * currentCount + selected;
    const newCount = currentCount + 1;
    const newValue = total / newCount;

    product.ratingValue = newValue;
    product.ratingCount = newCount;

    const valueEl = document.getElementById('productRatingValue');
    const countEl = document.getElementById('productRatingCount');
    if (valueEl) valueEl.textContent = newValue.toFixed(1);
    if (countEl) countEl.textContent = String(newCount);

    if (typeof onRated === 'function') {
      onRated(selected);
    }

    showRatingToast();

    close();
  };

  overlay.classList.add('is-visible');
}

function showRemoveRatingPopup(product, userRating, onRemoved) {
  let overlay = document.getElementById('removeRatingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'removeRatingOverlay';
    overlay.className = 'rating-overlay';
    overlay.innerHTML = `
      <div class="rating-dialog">
        <h2>Remove your rating?</h2>
        <p class="rating-dialog-sub">This will remove your score from the average.</p>
        <div class="rating-dialog-actions">
          <button type="button" class="rating-cancel" id="removeRatingCancelBtn">Cancel</button>
          <button type="button" class="rating-confirm" id="removeRatingConfirmBtn">Remove</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const cancelBtn = overlay.querySelector('#removeRatingCancelBtn');
  const confirmBtn = overlay.querySelector('#removeRatingConfirmBtn');
  if (!cancelBtn || !confirmBtn) return;

  function close() {
    overlay.classList.remove('is-visible');
  }

  cancelBtn.onclick = () => {
    close();
  };

  confirmBtn.onclick = () => {
    const currentValue = Number(product.ratingValue) || 0;
    const currentCount = Number(product.ratingCount) || 0;
    if (currentCount <= 1) {
      // if this was the only rating, keep value but avoid divide-by-zero
      product.ratingCount = 0;
    } else {
      const total = currentValue * currentCount - userRating;
      const newCount = currentCount - 1;
      const newValue = total / newCount;
      product.ratingValue = newValue;
      product.ratingCount = newCount;
    }

    const valueEl = document.getElementById('productRatingValue');
    const countEl = document.getElementById('productRatingCount');
    if (valueEl && typeof product.ratingValue === 'number') {
      valueEl.textContent = product.ratingCount > 0
        ? product.ratingValue.toFixed(1)
        : product.ratingValue.toFixed(1);
    }
    if (countEl) countEl.textContent = String(product.ratingCount);

    if (typeof onRemoved === 'function') {
      onRemoved();
    }

    showRatingToast('Your rating was removed');
    close();
  };

  overlay.classList.add('is-visible');
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
  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 1800);
}


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

    // Now that footer + feedback markup exist, wire up the modal
    initFeedbackModal();
  } catch (e) {
    // fail silently on local file restrictions
  }
}
