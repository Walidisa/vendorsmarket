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

  // clear any lingering exit state
  wrapper.classList.remove('page-exit');

  if (window.__navTransitionsBound) return;
  window.__navTransitionsBound = true;

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const url = link.getAttribute('href');
      if (!url || window.location.pathname.endsWith(url)) return;
      wrapper.classList.add('page-exit');
    });
  });
}


// ------------------------------------------------------
// THEME APPLICATION + NAV ICON COLOR SWITCHING
// ------------------------------------------------------
function applySavedBodyTheme() {
  const theme = localStorage.getItem('activeTheme') || 'food';
  document.body.classList.remove('theme-food', 'theme-clothing');
  document.body.classList.add(theme === 'food' ? 'theme-food' : 'theme-clothing');
}

function slugifyName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

  // Also update add-product card icon on profile page
  const addIcons = document.querySelectorAll('.profile-add-product-card-icon');
  addIcons.forEach(addIcon => {
    const brown = addIcon.dataset.brown;
    const blue = addIcon.dataset.blue;
    if (theme === 'food' && brown) addIcon.src = brown;
    if (theme === 'clothing' && blue) addIcon.src = blue;
    addIcon.classList.toggle('theme-food', theme === 'food');
    addIcon.classList.toggle('theme-clothing', theme === 'clothing');
  });

  // Generic back icons (e.g., add-product page)
  const backIcons = document.querySelectorAll('.back-icon');
  backIcons.forEach(icon => {
    const brown = icon.dataset.brown;
    const blue = icon.dataset.blue;
    if (theme === 'food' && brown) icon.src = brown;
    if (theme === 'clothing' && blue) icon.src = blue;
  });

  // Also update edit buttons on profile product cards
  const profileActionIcons = document.querySelectorAll('.profile-card-btn-icon');
  profileActionIcons.forEach(actionIcon => {
    const brown = actionIcon.dataset.brown;
    const blue = actionIcon.dataset.blue;
    if (theme === 'food' && brown) actionIcon.src = brown;
    if (theme === 'clothing' && blue) actionIcon.src = blue;
  });

  // Update profile header edit icon
  const profileEditIcons = document.querySelectorAll('.profile-shop-edit-icon');
  profileEditIcons.forEach(editIcon => {
    const brown = editIcon.dataset.brown;
    const blue = editIcon.dataset.blue;
    if (theme === 'food' && brown) editIcon.src = brown;
    if (theme === 'clothing' && blue) editIcon.src = blue;
  });

  // Also update back button icon on subcategory page
  const backIcon = document.querySelector('#subcategoryBackBtn .back-icon');
  if (backIcon) {
    const brown = backIcon.dataset.brown;
    const blue = backIcon.dataset.blue;
    if (theme === 'food' && brown) backIcon.src = brown;
    if (theme === 'clothing' && blue) backIcon.src = blue;
  }

  // Update back button icon on product detail page
  const productBackIcon = document.querySelector('#productBackBtn .back-icon');
  if (productBackIcon) {
    const brown = productBackIcon.dataset.brown;
    const blue = productBackIcon.dataset.blue;
    if (theme === 'food' && brown) productBackIcon.src = brown;
    if (theme === 'clothing' && blue) productBackIcon.src = blue;
  }
}


// ------------------------------------------------------
// AUTH | HARD-CODED LOGIN
// ------------------------------------------------------
function initAuth() {
  const loginForm = document.querySelector('.auth-form');
  const isLoginPage = !!document.getElementById('login-email');

  if (!loginForm) return;

  if (isLoginPage) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
        .then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Invalid credentials');
          }
          return res.json();
        })
        .then((user) => {
          localStorage.setItem('isLoggedIn', '1');
          localStorage.setItem('currentUserEmail', user.email || email);
          const uname = user.username || '';
          const shop = user.shopName || '';
          const slugSource = uname || shop;
          localStorage.setItem('loggedInVendorUsername', uname);
          localStorage.setItem('loggedInVendorName', uname || shop);
          localStorage.setItem('activeVendorName', uname || shop);
          const slug = slugifyName(slugSource) || slugSource;
          window.location.href = `/profile/${slug}`;
        })
        .catch((err) => {
          alert(err.message || 'Login failed');
        });
    });
  } else {
    // On signup page, just prevent submit and hint about demo credentials
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Sign up is not wired yet. Use demo@vendorsmarket.test with password123 on the login page.');
    });
  }
}


// ------------------------------------------------------
// HOMEPAGE CATEGORY SWITCHING
// ------------------------------------------------------
function initHomepageCategorySwitch() {
  const pills = document.querySelectorAll('.category-icon-btn');
  const rows = document.querySelectorAll('.subcategory-row');
  if (!pills.length) return;
  if (window.__homepageCategoriesBound) return;
  window.__homepageCategoriesBound = true;

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

      window.location.href = '/category';
    });
  });
}


// ------------------------------------------------------
// PROFILE PAGE | TAB SWITCHING
// ------------------------------------------------------
function initProfileTabs() {
  const tabs = document.querySelectorAll('.profile-tab');
  const panels = document.querySelectorAll('.profile-tab-panel');
  if (!tabs.length) return;
  if (window.__profileTabsBound) return;
  window.__profileTabsBound = true;

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

// PROFILE PAGE | DATA BINDING
async function initProfilePage() {
  const bannerEl = document.getElementById('profileBanner');
  const shopNameEl = document.getElementById('profileShopName');
  const ownerNameEl = document.getElementById('profileOwnerName');
  const locationEl = document.getElementById('profileLocation');
  const contactEl = document.getElementById('profileContact');
  const avatarEl = document.getElementById('profileAvatar');
  const aboutEl = document.getElementById('profileAboutText');
  const feedbackEmptyEl = document.getElementById('profileFeedbackEmpty');
  const feedbackListEl = document.getElementById('profileFeedbackList');
  const feedbackBtnEl = document.getElementById('profileFeedbackBtn');
  const productsGrid = document.getElementById('profileProductsGrid');
  const editProfileBtn = document.getElementById('profileEditProfileBtn');
  const logoutBtn = document.getElementById('profileLogoutBtn');
  const logoutOverlay = document.getElementById('logoutOverlay');
  const logoutCancelBtn = document.getElementById('logoutCancelBtn');
  const logoutConfirmBtn = document.getElementById('logoutConfirmBtn');
  const logoutCloseBtn = document.getElementById('logoutCloseBtn');
  const deleteOverlay = document.getElementById('deleteProductOverlay');
  const deleteCancelBtn = document.getElementById('deleteProductCancelBtn');
  const deleteConfirmBtn = document.getElementById('deleteProductConfirmBtn');
  const deleteCloseBtn = document.getElementById('deleteProductCloseBtn');
  if (!shopNameEl || !productsGrid) return; // not on profile page

  const urlParts = window.location.pathname.split('/').filter(Boolean);
  const profileSlug = urlParts[0] === 'profile' ? urlParts[1] : null;

  const activeVendorNameFromStorage = localStorage.getItem('activeVendorName') || null;

  // load profiles
  let profiles = [];
  try {
    const res = await fetch('/api/profiles');
    if (res.ok) {
      profiles = await res.json();
    }
  } catch (e) {
    profiles = [];
  }

  let profile = null;

  if (profileSlug && profiles.length) {
    profile = profiles.find(p => slugifyName(p.name) === profileSlug || slugifyName(p.id) === profileSlug) || null;
  } else if (activeVendorNameFromStorage) {
    profile = profiles.find(p => p.name === activeVendorNameFromStorage) || null;
  }

  if (!profile) {
    const page = document.querySelector('.page');
    if (page) {
      page.innerHTML = '<div style="padding:1.5rem; text-align:center"><h1 style="margin:0 auto;">Profile does not exist</h1></div>';
    } else if (shopNameEl) {
      shopNameEl.textContent = 'Profile does not exist';
    }
    return;
  }

  const activeVendorName = profile.username || profile.name;
  localStorage.setItem('activeVendorName', activeVendorName);

  // apply profile info
  if (profile) {
    shopNameEl.textContent = profile.shopName || profile.name;
    const uname = profile.username || profile.id || profile.name || 'vendor';
    const fullName = profile.ownerName || '';
    if (ownerNameEl) {
      ownerNameEl.innerHTML = fullName
        ? `@${uname}<br>${fullName}`
        : `@${uname}`;
    }
    const rawLocation = profile.location || 'Based locally';
    locationEl.textContent = `Based in ${rawLocation}`;
    if (bannerEl && profile.banner) {
      bannerEl.src = profile.banner || '/images/default-banner.jpg';
      bannerEl.alt = profile.shopName || profile.name;
    }

    if (avatarEl && profile.avatar) {
      avatarEl.src = profile.avatar;
      avatarEl.alt = profile.name;
    }
    if (aboutEl) {
      aboutEl.textContent = profile.aboutDescription || profile.tagline;
    }

    if (contactEl) {
      const wa = profile.whatsapp || '';
      const ig = profile.instagram || '';
      const parts = [];
      if (wa) parts.push(`WhatsApp: ${wa}`);
      if (ig) parts.push(`Instagram: ${ig}`);
      contactEl.textContent = parts.join(' | ');
    }
  }

  // Determine ownership: is the logged-in user viewing their own shop?
  const isLoggedIn = localStorage.getItem('isLoggedIn') === '1';
  const loggedInVendorUsername = localStorage.getItem('loggedInVendorUsername');
  const loggedInVendorName = localStorage.getItem('loggedInVendorName');
  const profileUsername = profile ? (profile.username || profile.id || '') : '';
  const profileDisplayName = profile ? (profile.name || profile.shopName || '') : '';
  const isOwnProfile = !!(
    isLoggedIn &&
    profile &&
    (
      (loggedInVendorUsername && profileUsername === loggedInVendorUsername) ||
      (loggedInVendorName && (profileDisplayName === loggedInVendorName || profileUsername === loggedInVendorName))
    )
  );

  // load and render products owned by this seller
  const products = await loadProducts();
  const owned = products.filter(p => {
    const vendorUsername = p.vendorUsername || p.vendor || '';
    const vendorName = p.vendor || '';
    const profileUsername = profile ? (profile.username || profile.id || '') : '';
    const profileName = profile ? (profile.name || profile.shopName || '') : activeVendorName;
    return (
      (profileUsername && vendorUsername === profileUsername) ||
      (profileUsername && vendorName === profileUsername) ||
      (vendorUsername && profileName && vendorUsername === slugifyName(profileName)) ||
      (vendorName && profileName && vendorName === profileName)
    );
  });
  productsGrid.innerHTML = '';
  owned.forEach(p => {
    const card = createProductCard(p);

    // If this is the logged-in seller viewing their own profile,
    // add inline edit/delete controls to the card
    if (isOwnProfile) {
      const actions = document.createElement('div');
      actions.className = 'profile-card-actions';
      actions.innerHTML = `
        <button type="button" class="profile-card-btn profile-card-edit" aria-label="Edit product">
          <img 
            src="/icons/edit.png" 
            alt="Edit" 
            class="profile-card-btn-icon" 
            data-blue="/icons/edit.png" 
            data-brown="/icons/edit-orange.png">
        </button>
        <button type="button" class="profile-card-btn profile-card-delete" aria-label="Delete product">
          <img 
            src="/icons/delete.png" 
            alt="Delete" 
            class="profile-card-btn-icon">
        </button>
      `;

      // Prevent click on action buttons from triggering card navigation
      actions.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Delete button wiring: open confirmation modal and remove card on confirm
      const deleteBtn = actions.querySelector('.profile-card-delete');
      if (deleteBtn && deleteOverlay && deleteCancelBtn && deleteConfirmBtn && deleteCloseBtn) {
        deleteBtn.addEventListener('click', () => {
          deleteOverlay.classList.add('is-open');
          deleteOverlay.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';

          // Set up a one-time confirm handler for this specific card
          const handleConfirm = () => {
            // call API to delete product
            if (p.id) {
              fetch(`/api/products/${p.id}`, { method: 'DELETE' }).catch(() => {});
            }
            if (card.parentElement) {
              card.parentElement.removeChild(card);
            }
            deleteOverlay.classList.remove('is-open');
            deleteOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            deleteConfirmBtn.removeEventListener('click', handleConfirm);
            deleteCancelBtn.removeEventListener('click', handleCancel);
            deleteCloseBtn.removeEventListener('click', handleCancel);
            deleteOverlay.removeEventListener('click', handleBackdropClick);
          };

          const handleCancel = () => {
            deleteOverlay.classList.remove('is-open');
            deleteOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            deleteConfirmBtn.removeEventListener('click', handleConfirm);
            deleteCancelBtn.removeEventListener('click', handleCancel);
            deleteCloseBtn.removeEventListener('click', handleCancel);
            deleteOverlay.removeEventListener('click', handleBackdropClick);
          };

          const handleBackdropClick = (e) => {
            if (e.target === deleteOverlay || e.target.classList.contains('feedback-backdrop')) {
              handleCancel();
            }
          };

          deleteConfirmBtn.addEventListener('click', handleConfirm);
          deleteCancelBtn.addEventListener('click', handleCancel);
          deleteCloseBtn.addEventListener('click', handleCancel);
          deleteOverlay.addEventListener('click', handleBackdropClick);
        });
      }

      card.appendChild(actions);
    }

    productsGrid.appendChild(card);
  });

  initProductCardBackgrounds();
  updateNavIconsByTheme();

  // Update bottom nav active state: profile icon should only be active
  // when viewing the logged-in user's own profile
  const navProfileLink = document.getElementById('bottomNavProfileLink');
  if (navProfileLink) {
    navProfileLink.classList.toggle('active', !!isOwnProfile);
  }

  // Feedback button: show only when viewing someone else's profile
  if (feedbackBtnEl) {
    feedbackBtnEl.style.display = isOwnProfile ? 'none' : 'block';
  }

  // Logout button: visible only on own profile
  if (logoutBtn) {
    logoutBtn.style.display = isOwnProfile ? 'inline-block' : 'none';
  }

   // Profile header edit button: only on own profile
  if (editProfileBtn) {
    editProfileBtn.style.display = isOwnProfile ? 'flex' : 'none';
  }

  // Add-product card: only for own profile
    if (isOwnProfile && productsGrid) {
      const addWrapper = document.createElement('div');
      addWrapper.className = 'product-card add-product-slot';

      const addCard = document.createElement('button');
      addCard.type = 'button';
      addCard.className = 'profile-add-product-card';
      const theme = localStorage.getItem('activeTheme') || 'food';
      const addIcon = theme === 'food' ? '/icons/add-orange.png' : '/icons/add.png';
      addCard.innerHTML = `
        <span class="profile-add-product-circle">
            <img src="${addIcon}" alt="Add" class="profile-add-product-card-icon" data-blue="/icons/add.png" data-brown="/icons/add-orange.png">
        </span>
      `;

      addCard.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/add-product';
      });

    addWrapper.appendChild(addCard);
    productsGrid.appendChild(addWrapper);
  }

  // Load existing seller feedback from JSON file + localStorage and render it
  if (feedbackEmptyEl && feedbackListEl && profile) {
    const sellerKey = profile.name;
    const listKey = `sellerFeedback_${sellerKey}`;

    // Local feedback (what this user added)
    let localEntries = [];
    const storedLocal = localStorage.getItem(listKey);
    if (storedLocal) {
      try {
        localEntries = JSON.parse(storedLocal);
        if (!Array.isArray(localEntries)) localEntries = [];
      } catch (e) {
        localEntries = [];
      }
    }

    // Seed feedback from JSON file
    let seedEntries = [];
    try {
      const seedRes = await fetch('/api/feedback');
      if (seedRes.ok) {
        const allSeed = await seedRes.json();
        if (Array.isArray(allSeed)) {
          seedEntries = allSeed.filter(item => item.sellerName === sellerKey || item.sellerId === profile.id);
        }
      }
    } catch (e) {
      seedEntries = [];
    }

    const combined = [...seedEntries, ...localEntries];

    if (combined.length) {
      const total = combined.reduce((sum, entry) => sum + (Number(entry.rating) || 0), 0);
      const count = combined.length;
      const avg = total / count;
      renderSellerFeedbackList(combined, feedbackEmptyEl, feedbackListEl, avg, count);
    } else {
      renderSellerFeedbackList([], feedbackEmptyEl, feedbackListEl);
    }
  }
  // Custom logout modal wiring
  if (logoutBtn && logoutOverlay && logoutCancelBtn && logoutConfirmBtn && logoutCloseBtn) {
    const openLogoutModal = () => {
      logoutOverlay.classList.add('is-open');
      logoutOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeLogoutModal = () => {
      logoutOverlay.classList.remove('is-open');
      logoutOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    logoutBtn.addEventListener('click', openLogoutModal);
    logoutCancelBtn.addEventListener('click', closeLogoutModal);
    logoutCloseBtn.addEventListener('click', closeLogoutModal);

    logoutOverlay.addEventListener('click', (e) => {
      if (e.target === logoutOverlay || e.target.classList.contains('feedback-backdrop')) {
        closeLogoutModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLogoutModal();
      }
    });

    logoutConfirmBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUserEmail');
      localStorage.removeItem('activeVendorName');
      window.location.href = '/homepage';
    });
  }
}
function initFeedbackModal() {
  const openBtn = document.getElementById('openFeedback');
  const overlay = document.getElementById('feedbackOverlay');
  const closeBtn = document.getElementById('closeFeedback');

  if (!openBtn || !overlay || !closeBtn) return;
  if (overlay.dataset.bound === '1') return;
  overlay.dataset.bound = '1';

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

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('feedback-backdrop')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  const form = overlay.querySelector('.feedback-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal();
      alert('Thanks for your feedback!');
    });
  }
}


// ------------------------------------------------------
// PRODUCT CARDS | EXTENDED BLUR BACKGROUND
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
    const res = await fetch('/api/products');
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
      <p class="price">&#8358;${product.price.toLocaleString()}</p>
      ${typeof product.ratingValue === 'number' && typeof product.ratingCount === 'number'
          ? `<p class="rating"><span class="rating-star">&#9733;</span><span id="productRatingValue">${product.ratingValue.toFixed(1)}</span> (<span id="productRatingCount">${product.ratingCount}</span>)</p>`
        : ''}
    </div>
  `;

  // Clicking a product card opens the product detail page
  article.addEventListener('click', () => {
    localStorage.setItem('activeProductId', product.id);
    window.location.href = '/product';
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
function runAllInitializers() {
  applySavedBodyTheme();
  updateNavIconsByTheme();
  initAuth();
  initPageTransitions();
  initHomepageCategorySwitch();
  initProfileTabs();
  initProfilePage();
  initProfileNavGuard();
  initProductCardBackgrounds();
  initSubcategoryPage();
  initProductDetailPage();
  loadFooter();
  initSellerFeedback();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', runAllInitializers);
} else {
  runAllInitializers();
}

// PROFILE NAV | LOGIN GUARD
function initProfileNavGuard() {
  const navProfileLinks = document.querySelectorAll('nav.bottom-nav a[href^="/profile"]');
  if (!navProfileLinks.length) return;
  if (window.__profileNavBound) return;
  window.__profileNavBound = true;

  navProfileLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === '1';
      if (!isLoggedIn) {
        e.preventDefault();
        window.location.href = '/login';
        return;
      }

      e.preventDefault();
      const loggedInVendorUsername = localStorage.getItem('loggedInVendorUsername');
      const loggedInVendorName = localStorage.getItem('loggedInVendorName');
      const targetSlug = slugifyName(loggedInVendorUsername || loggedInVendorName || '');

      if (targetSlug) {
        if (loggedInVendorName) localStorage.setItem('activeVendorName', loggedInVendorName);
        window.location.href = `/profile/${targetSlug}`;
        return;
      }

      window.location.href = '/login';
    });
  });
}


// ------------------------------------------------------
// SUBCATEGORY LISTING PAGE
// ------------------------------------------------------
async function initSubcategoryPage() {
  const grid = document.getElementById('subcategoryPageGrid');
  const titleEl = document.getElementById('subcategoryTitle');
  const backBtn = document.getElementById('subcategoryBackBtn');
  if (!grid || !titleEl) return; // not on /category
  if (window.__subcategoryPageBound) return;
  window.__subcategoryPageBound = true;

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
      window.location.href = '/homepage';
    });
  }
}


// ------------------------------------------------------
// SELLER FEEDBACK POPUP (PROFILE PAGE)
// ------------------------------------------------------
function initSellerFeedback() {
  const feedbackBtn = document.getElementById('profileFeedbackBtn');
  if (!feedbackBtn) return; // not on profile page

  feedbackBtn.addEventListener('click', () => {
    const activeVendorName = localStorage.getItem('activeVendorName') || 'Sweet Treats';
    showSellerFeedbackPopup(activeVendorName);
  });
}

function showSellerFeedbackPopup(vendorName) {
  let overlay = document.getElementById('sellerFeedbackOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sellerFeedbackOverlay';
    overlay.className = 'rating-overlay';
    overlay.innerHTML = `
      <div class="rating-dialog">
        <h2>Rate this seller</h2>
        <p class="rating-dialog-sub">Share a quick rating and (optional) comment.</p>
        <div class="rating-buttons" id="sellerRatingButtons"></div>
        <textarea id="sellerFeedbackComment" class="feedback-comment" rows="3" placeholder="Add a short comment (optional)"></textarea>
        <div class="rating-dialog-actions">
          <button type="button" class="rating-cancel" id="sellerFeedbackCancelBtn">Cancel</button>
          <button type="button" class="rating-confirm" id="sellerFeedbackConfirmBtn" disabled>Send</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const buttonsContainer = overlay.querySelector('#sellerRatingButtons');
  const confirmBtn = overlay.querySelector('#sellerFeedbackConfirmBtn');
  const cancelBtn = overlay.querySelector('#sellerFeedbackCancelBtn');
  const commentInput = overlay.querySelector('#sellerFeedbackComment');
  if (!buttonsContainer || !confirmBtn || !cancelBtn || !commentInput) return;

  buttonsContainer.innerHTML = '';
  commentInput.value = '';
  let selected = null;

  // build 1|5 rating buttons reusing the same visual style
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

    const comment = commentInput.value.trim();

    // Persist feedback
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor_username: vendorName,
        rating: selected,
        message: comment
      })
    }).catch(() => {});

    // Persist vendor rating
    fetch('/api/ratings/vendor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_username: vendorName, rating: selected })
    })
      .then(res => res.json().catch(() => null))
      .then((payload) => {
        const emptyEl = document.getElementById('profileFeedbackEmpty');
        const listEl = document.getElementById('profileFeedbackList');
        if (emptyEl && listEl) {
          // Re-fetch feedback list to reflect latest
          fetch('/api/feedback')
            .then(r => r.json().catch(() => []))
            .then(all => {
              const entries = Array.isArray(all)
                ? all.filter(item => item.sellerId === vendorName || item.sellerName === vendorName || item.vendor_username === vendorName)
                : [];
              const avg = payload?.rating_value ?? (entries.length ? entries.reduce((s,e)=>s+(Number(e.rating)||0),0)/entries.length : null);
              const cnt = payload?.rating_count ?? entries.length;
              renderSellerFeedbackList(entries, emptyEl, listEl, avg, cnt);
            });
        }
      })
      .catch(() => {});

    showRatingToast('Thanks for your seller feedback!');
    close();
  };

  overlay.classList.add('is-visible');
}

function renderSellerFeedbackList(entries, emptyEl, listEl, avgValue, count) {
  const hasEntries = entries && entries.length > 0;

  if (!hasEntries) {
    emptyEl.textContent = 'No feedback yet.';
    listEl.innerHTML = '';
    return;
  }

  // If average rating info was provided, show summary text; otherwise derive from stored rating if available
  if (typeof avgValue === 'number' && typeof count === 'number') {
    emptyEl.innerHTML = `<span class="rating-star">&#9733;</span> ${avgValue.toFixed(1)} (${count} rating${count === 1 ? '' : 's'})`;
  } else {
    // Fallback: show simple count
    emptyEl.textContent = `Seller has ${entries.length} feedback${entries.length === 1 ? '' : 's'}`;
  }

  listEl.innerHTML = '';

  // Show newest first
  const sorted = [...entries].sort((a, b) => {
    const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
    return bd - ad;
  });

  sorted.forEach(entry => {
    const li = document.createElement('li');
    li.className = 'profile-feedback-item';

    const createdDate = entry.createdAt ? new Date(entry.createdAt) : null;
    const dateLabel = createdDate && !Number.isNaN(createdDate.getTime())
      ? createdDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : '';

    const comment = entry.comment || '';

    li.innerHTML = `
      <div class="profile-feedback-item-header">
        <span class="profile-feedback-item-rating"><span class="rating-star">&#9733;</span> ${entry.rating}</span>
        <span class="profile-feedback-item-date">${dateLabel}</span>
      </div>
      ${comment ? `<p class="profile-feedback-item-comment">${comment}</p>` : ''}
    `;

    listEl.appendChild(li);
  });
}


// ------------------------------------------------------
// PRODUCT DETAIL PAGE
// ------------------------------------------------------
async function initProductDetailPage() {
  const container = document.getElementById('productDetailMain');
  const titleEl = document.getElementById('productTitle');
  const backBtn = document.getElementById('productBackBtn');
  if (!container || !titleEl) return; // not on /product
  if (window.__productDetailBound) return;
  window.__productDetailBound = true;

  const productId = localStorage.getItem('activeProductId');
  if (!productId) return;

  const products = await loadProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // seller rating from storage or fallback seed data
  const sellerRatingKeys = Array.from(new Set([
    product.vendorUsername,
    product.vendor,
    product.vendorShopName
  ].filter(Boolean)));
  let sellerRatingValue = null;
  let sellerRatingCount = null;

  for (const key of sellerRatingKeys) {
    const storedSellerRating = localStorage.getItem(`sellerRating_${key}`);
    if (!storedSellerRating) continue;
    try {
      const parsedSeller = JSON.parse(storedSellerRating);
      if (parsedSeller && typeof parsedSeller.value === 'number' && typeof parsedSeller.count === 'number') {
        sellerRatingValue = parsedSeller.value;
        sellerRatingCount = parsedSeller.count;
        break;
      }
    } catch (e) {
      sellerRatingValue = null;
      sellerRatingCount = null;
    }
  }

  if (sellerRatingValue === null && typeof fetch === 'function') {
    try {
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const seedEntries = await response.json();
        if (Array.isArray(seedEntries)) {
          const normalizedKeys = sellerRatingKeys.map(key => String(key).toLowerCase());
          const vendorEntries = seedEntries.filter(entry => {
            const entryKeys = [entry.sellerId, entry.sellerName]
              .filter(Boolean)
              .map(value => String(value).toLowerCase());
            return entryKeys.some(value => normalizedKeys.includes(value));
          });

          if (vendorEntries.length) {
            const total = vendorEntries.reduce((sum, entry) => sum + (Number(entry.rating) || 0), 0);
            sellerRatingCount = vendorEntries.length;
            sellerRatingValue = total / sellerRatingCount;
            sellerRatingKeys.forEach(key => {
              localStorage.setItem(`sellerRating_${key}`, JSON.stringify({
                value: sellerRatingValue,
                count: sellerRatingCount
              }));
            });
          }
        }
      }
    } catch (e) {
      // ignore network errors
    }
  }

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
        <img src="${src}" alt="${product.name}" class="product-image">
      </div>
    `)
    .join('');

  container.innerHTML = `
    <div class="product-detail-hero">
      <button class="product-detail-nav prev" id="productDetailPrev" aria-label="Previous image">
        <img src="/icons/left.png" alt="Previous" />
      </button>
      <button class="product-detail-nav next" id="productDetailNext" aria-label="Next image">
        <img src="/icons/right.png" alt="Next" />
      </button>
      <div class="product-detail-slider">
        ${slides}
      </div>
      <div class="product-detail-dots">
        ${dots}
      </div>
    </div>
    <div class="product-detail-meta">
      <p class="price">&#8358;${product.price.toLocaleString()}</p>
      ${typeof product.ratingValue === 'number' && typeof product.ratingCount === 'number'
        ? `<p class="rating">&#9733;<span id="productRatingValue">${product.ratingValue.toFixed(1)}</span> (<span id="productRatingCount">${product.ratingCount}</span>) <button id="rateProductBtn" class="rate-link" type="button">Rate</button></p>`
        : ''}
      <p class="product-detail-vendor">
        Sold by ${product.vendorShopName}
      </p>
    </div>
    ${product.description ? `<p class="product-detail-description">${product.description}</p>` : ''}
    <div class="product-detail-seller">
      <div class="product-detail-seller-avatar">
        <img src="${product.sellerAvatar || '/images/default-seller.jpg'}" alt="${product.vendor}">
      </div>
      <div class="product-detail-seller-text" id="productSellerLink">
        <span class="product-detail-seller-name">
          ${product.vendorShopName || product.vendor}
          ${typeof sellerRatingValue === 'number' && typeof sellerRatingCount === 'number'
            ? `<span class="product-detail-seller-rating">&#9733; ${sellerRatingValue.toFixed(1)} (${sellerRatingCount})</span>`
            : ''}
        </span>
        <span class="product-detail-seller-extra">${product.sellerDetails || 'Trusted local vendor'}</span>
      </div>
    </div>
  `;

  // simple dot navigation slider
  const slider = container.querySelector('.product-detail-slider');
  const dotEls = Array.from(container.querySelectorAll('.product-detail-dot'));
  const prevBtn = container.querySelector('#productDetailPrev');
  const nextBtn = container.querySelector('#productDetailNext');
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

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateSlider(Math.max(0, activeIndex - 1));
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateSlider(Math.min(images.length - 1, activeIndex + 1));
    });
  }

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

  // make seller area clickable to open profile
  const sellerLink = document.getElementById('productSellerLink');
  if (sellerLink) {
    sellerLink.style.cursor = 'pointer';
    sellerLink.addEventListener('click', () => {
      if (product && product.vendor) {
        localStorage.setItem('activeVendorName', product.vendor);
        const slug = product.vendorUsername;
        if (!slug) {
          window.location.href = '/login';
          return;
        }
        window.location.href = `/profile/${slug}`;
        return;
      }
      window.location.href = '/profile/sweet-treats';
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

  confirmBtn.onclick = async () => {
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

    // Persist rating to Supabase and sync with DB response
    try {
      const res = await fetch('/api/ratings/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, rating: selected })
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && payload && typeof payload.rating_value === 'number' && typeof payload.rating_count === 'number') {
        product.ratingValue = payload.rating_value;
        product.ratingCount = payload.rating_count;
        if (valueEl) valueEl.textContent = payload.rating_value.toFixed(1);
        if (countEl) countEl.textContent = String(payload.rating_count);
      }
    } catch (e) {
      // ignore network errors; optimistic UI already updated
    }

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
  // Footer markup is already rendered by Next; just wire modal behavior.
  initFeedbackModal();
}

















