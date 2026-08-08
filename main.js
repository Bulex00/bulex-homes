/* ============================================
   BULEX HOMES REAL ESTATE
   Main JavaScript - Production Ready
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  initLoader();
  initTheme();
  initNavigation();
  initHomeSearch();
  initScrollEffects();
  initCounters();
  initTestimonialSlider();
  initPropertyFilters();
  initFavorites();
  initPropertySharing();
  initGallery();
  initLightbox();
  initMortgageCalculator();
  initROICalculator();
  initContactForm();
  initNewsletter();
  initBackToTop();
  initModal();
  initComparison();
  initScheduleViewing();
  initCookieConsent();
  initRecentlyViewed();
  initAssistant();
  highlightActiveNav();
});

/* LOADING SCREEN */
function initLoader() {
  const loader = document.querySelector('.site-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 350);
  });
}

/* THEME */
function initTheme() {
  const toggle = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('bulexTheme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark = savedTheme ? savedTheme === 'dark' : prefersDark;

  function applyTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    if (toggle) {
      toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  applyTheme(useDark);
  toggle?.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    localStorage.setItem('bulexTheme', isDark ? 'dark' : 'light');
    applyTheme(isDark);
    showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled');
  });
}

/* NAVIGATION */
function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active') ? 'true' : 'false');
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* HOME SEARCH */
function initHomeSearch() {
  const form = document.getElementById('home-search');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = new URLSearchParams(new FormData(form));
    const query = params.toString();
    const searches = JSON.parse(localStorage.getItem('bulexRecentSearches') || '[]');
    searches.unshift({
      location: params.get('location') || 'Any location',
      type: params.get('type') || 'Any property',
      budget: params.get('budget') || 'Any budget',
      date: new Date().toISOString()
    });
    localStorage.setItem('bulexRecentSearches', JSON.stringify(searches.slice(0, 8)));
    window.location.href = query ? `properties.html?${query}` : 'properties.html';
  });
}

/* SCROLL EFFECTS */
function initScrollEffects() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }
}

/* ACTIVE NAV */
function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* COUNTERS */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (counters.length === 0) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
  let current = 0;
  const increment = target / 60;
  const duration = 2000;
  const stepTime = duration / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString() + '+';
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString() + '+';
    }
  }, stepTime);
}

/* TESTIMONIALS */
function initTestimonialSlider() {
  const items = document.querySelectorAll('.testimonial-item');
  const dots = document.querySelectorAll('.dot');
  if (items.length === 0) return;
  let currentIndex = 0;
  let interval;

  function showSlide(index) {
    items.forEach((item, i) => item.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    currentIndex = index;
  }
  function nextSlide() { showSlide((currentIndex + 1) % items.length); }
  function startAutoPlay() { interval = setInterval(nextSlide, 5000); }
  function stopAutoPlay() { clearInterval(interval); }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => { stopAutoPlay(); showSlide(index); startAutoPlay(); });
  });
  const slider = document.querySelector('.testimonial-slider');
  if (slider) { slider.addEventListener('mouseenter', stopAutoPlay); slider.addEventListener('mouseleave', startAutoPlay); }
  startAutoPlay();
}

/* PROPERTY FILTERS */
function initPropertyFilters() {
  const locationFilter = document.getElementById('filter-location');
  const typeFilter = document.getElementById('filter-type');
  const priceFilter = document.getElementById('filter-price');
  const bedroomsFilter = document.getElementById('filter-bedrooms');
  const featureFilter = document.getElementById('filter-feature');
  const searchInput = document.getElementById('property-search');
  const sortSelect = document.getElementById('sort-properties');
  const resultsCount = document.getElementById('results-count');
  const noResults = document.getElementById('no-results');
  const clearButtons = [document.getElementById('clear-filters'), document.getElementById('empty-clear')].filter(Boolean);
  const grid = document.querySelector('.listing-grid');
  const cards = document.querySelectorAll('.property-card[data-location]');
  if (!locationFilter || cards.length === 0) return;

  function filterProperties() {
    const location = locationFilter.value;
    const type = typeFilter.value;
    const price = priceFilter.value;
    const bedrooms = bedroomsFilter.value;
    const feature = featureFilter ? featureFilter.value : 'all';
    const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;

    cards.forEach(card => {
      const cardLocation = card.getAttribute('data-location');
      const cardType = card.getAttribute('data-type');
      const cardPrice = parseInt(card.getAttribute('data-price'));
      const cardBedrooms = parseInt(card.getAttribute('data-bedrooms'));
      const cardFeatures = card.getAttribute('data-features') || '';
      const cardTitle = (card.getAttribute('data-title') || card.textContent).toLowerCase();
      let show = true;

      if (location !== 'all' && cardLocation !== location) show = false;
      if (type !== 'all' && cardType !== type) show = false;
      if (feature !== 'all' && !cardFeatures.includes(feature)) show = false;
      if (term && !cardTitle.includes(term)) show = false;
      if (price !== 'all') {
        if (price === 'under-50m' && cardPrice >= 50000000) show = false;
        if (price === '50m-100m' && (cardPrice < 50000000 || cardPrice > 100000000)) show = false;
        if (price === 'above-100m' && cardPrice <= 100000000) show = false;
      }
      if (bedrooms !== 'all') {
        const minBeds = parseInt(bedrooms);
        if (cardBedrooms < minBeds) show = false;
      }

      card.classList.toggle('hidden', !show);
      if (show) {
        visibleCount += 1;
        card.classList.add('fade');
      }
    });

    if (resultsCount) resultsCount.textContent = visibleCount;
    if (noResults) noResults.hidden = visibleCount !== 0;
  }

  function sortProperties() {
    if (!grid || !sortSelect) return;
    const sortedCards = Array.from(cards).sort((a, b) => {
      const sort = sortSelect.value;
      const priceA = parseInt(a.dataset.price);
      const priceB = parseInt(b.dataset.price);
      const investmentA = parseInt(a.dataset.investment || '0');
      const investmentB = parseInt(b.dataset.investment || '0');
      const viewedA = parseInt(a.dataset.viewed || '0');
      const viewedB = parseInt(b.dataset.viewed || '0');
      const dateA = new Date(a.dataset.date || 0).getTime();
      const dateB = new Date(b.dataset.date || 0).getTime();

      if (sort === 'price-low') return priceA - priceB;
      if (sort === 'price-high') return priceB - priceA;
      if (sort === 'investment') return investmentB - investmentA;
      if (sort === 'viewed') return viewedB - viewedA;
      if (sort === 'oldest') return dateA - dateB;
      return dateB - dateA;
    });
    sortedCards.forEach(card => grid.appendChild(card));
    filterProperties();
  }

  [locationFilter, typeFilter, priceFilter, bedroomsFilter, featureFilter, searchInput].forEach(el => {
    if (el) el.addEventListener('change', filterProperties);
  });
  if (searchInput) searchInput.addEventListener('input', filterProperties);
  if (sortSelect) sortSelect.addEventListener('change', sortProperties);
  clearButtons.forEach(button => button.addEventListener('click', () => {
    locationFilter.value = 'all';
    typeFilter.value = 'all';
    priceFilter.value = 'all';
    bedroomsFilter.value = 'all';
    if (featureFilter) featureFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'newest';
    sortProperties();
    showToast('Filters cleared');
  }));

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('location') && searchInput) searchInput.value = urlParams.get('location');
  if (urlParams.has('type') && typeFilter) {
    const type = urlParams.get('type');
    if ([...typeFilter.options].some(option => option.value === type)) typeFilter.value = type;
  }
  sortProperties();
}

/* FAVORITES */
function initFavorites() {
  const buttons = document.querySelectorAll('.favorite-btn');
  if (!buttons.length) return;
  const key = 'bulexFavorites';
  const favorites = new Set(JSON.parse(localStorage.getItem(key) || '[]'));

  buttons.forEach(button => {
    const card = button.closest('.property-card');
    const id = card?.dataset.id;
    if (!id) return;
    const icon = button.querySelector('i');
    const isSaved = favorites.has(id);
    button.classList.toggle('active', isSaved);
    icon.className = isSaved ? 'fas fa-heart' : 'far fa-heart';

    button.addEventListener('click', () => {
      const saved = favorites.has(id);
      if (saved) {
        favorites.delete(id);
        button.classList.remove('active');
        icon.className = 'far fa-heart';
        showToast('Property removed from favorites');
      } else {
        favorites.add(id);
        button.classList.add('active');
        icon.className = 'fas fa-heart';
        showToast('Property saved to favorites');
      }
      localStorage.setItem(key, JSON.stringify([...favorites]));
    });
  });
}

/* SHARING */
function initPropertySharing() {
  document.querySelectorAll('.share-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const card = button.closest('.property-card');
      const title = card?.querySelector('h3')?.textContent || 'Bulex Homes property';
      const detailLink = card?.querySelector('a[href*="property-details"]')?.getAttribute('href') || 'properties.html';
      const url = new URL(detailLink, window.location.href).href;

      if (navigator.share) {
        try {
          await navigator.share({ title, text: `View ${title} on Bulex Homes`, url });
          return;
        } catch (error) {
          if (error.name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        showToast('Property link copied');
      } catch {
        showToast(url);
      }
    });
  });
}

/* GALLERY */
function initGallery() {
  const mainImage = document.getElementById('gallery-main-img');
  const thumbs = document.querySelectorAll('.gallery-thumbs img');
  if (!mainImage || thumbs.length === 0) return;
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      mainImage.src = thumb.src;
      mainImage.alt = thumb.alt;
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

/* LIGHTBOX */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const galleryImages = document.querySelectorAll('.gallery-image');
  const openBtn = document.getElementById('view-gallery-btn');
  if (!lightbox || galleryImages.length === 0) return;

  let currentImageIndex = 0;
  const images = Array.from(galleryImages).map(img => img.src);

  function openLightbox(index) {
    currentImageIndex = index;
    lightboxImg.src = images[index];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
  function showPrev() { currentImageIndex = (currentImageIndex - 1 + images.length) % images.length; lightboxImg.src = images[currentImageIndex]; }
  function showNext() { currentImageIndex = (currentImageIndex + 1) % images.length; lightboxImg.src = images[currentImageIndex]; }

  if (openBtn) openBtn.addEventListener('click', () => openLightbox(0));
  document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-prev')?.addEventListener('click', showPrev);
  document.querySelector('.lightbox-next')?.addEventListener('click', showNext);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}

/* MORTGAGE CALCULATOR */
function initMortgageCalculator() {
  const calcBtn = document.getElementById('calculate-mortgage');
  if (!calcBtn) return;
  calcBtn.addEventListener('click', () => {
    const price = parseFloat(document.getElementById('calc-price').value);
    const downPaymentPercent = parseFloat(document.getElementById('calc-down').value);
    const interestRate = parseFloat(document.getElementById('calc-rate').value);
    const loanTerm = parseFloat(document.getElementById('calc-term').value);

    if ([price, downPaymentPercent, interestRate, loanTerm].some(isNaN)) {
      alert('Please fill in all fields with valid numbers.');
      return;
    }

    const downPayment = price * (downPaymentPercent / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = (interestRate / 100) / 12;
    const numberOfPayments = loanTerm * 12;

    let monthlyPayment;
    if (interestRate === 0) {
      monthlyPayment = loanAmount / numberOfPayments;
    } else {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const resultBox = document.getElementById('calc-result');
    const resultAmount = document.getElementById('calc-result-amount');
    resultAmount.textContent = '₦' + monthlyPayment.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    resultBox.classList.add('show');
  });
}

/* ROI CALCULATOR */
function initROICalculator() {
  const calcBtn = document.getElementById('calculate-roi');
  if (!calcBtn) return;
  calcBtn.addEventListener('click', () => {
    const purchasePrice = parseFloat(document.getElementById('roi-purchase').value);
    const monthlyRent = parseFloat(document.getElementById('roi-rent').value);
    const annualExpenses = parseFloat(document.getElementById('roi-expenses').value);
    const appreciationRate = parseFloat(document.getElementById('roi-appreciation').value);

    if ([purchasePrice, monthlyRent, annualExpenses, appreciationRate].some(isNaN)) {
      alert('Please fill in all fields with valid numbers.');
      return;
    }

    const annualRent = monthlyRent * 12;
    const netIncome = annualRent - annualExpenses;
    const roi = (netIncome / purchasePrice) * 100;
    const fiveYearValue = purchasePrice * Math.pow(1 + appreciationRate / 100, 5);

    const resultBox = document.getElementById('roi-result');
    const resultRoi = document.getElementById('roi-result-percent');
    const resultFiveYear = document.getElementById('roi-result-fiveyear');
    resultRoi.textContent = roi.toFixed(2) + '% per year';
    resultFiveYear.textContent = '₦' + fiveYearValue.toLocaleString('en-NG', { maximumFractionDigits: 0 });
    resultBox.classList.add('show');
  });
}

/* CONTACT FORM */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const validateField = (id, errorId, minLen, customCheck) => {
      const field = document.getElementById(id);
      const error = document.getElementById(errorId);
      if (!field) return true;
      const group = field.closest('.form-group');
      let valid = true;

      if (customCheck) {
        valid = customCheck(field.value.trim());
      } else if (field.value.trim().length < minLen) {
        valid = false;
      }

      if (!valid) {
        group?.classList.add('error');
        error?.classList.add('show');
        isValid = false;
      } else {
        group?.classList.remove('error');
        error?.classList.remove('show');
      }
    };

    validateField('contact-name', 'name-error', 2);
    validateField('contact-email', 'email-error', 0, v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    validateField('contact-phone', 'phone-error', 0, v => v.replace(/\D/g, '').length >= 10);
    validateField('contact-message', 'message-error', 10);

    const successMsg = document.getElementById('form-success');
    if (isValid && successMsg) {
      successMsg.classList.add('show');
      form.reset();
      setTimeout(() => successMsg.classList.remove('show'), 5000);
      showToast('Message sent successfully!');
    }
  });

  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      const error = group?.querySelector('.error-message');
      if (group?.classList.contains('error')) {
        group.classList.remove('error');
        error?.classList.remove('show');
      }
    });
  });
}

/* NEWSLETTER */
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value.trim() !== '') {
        showToast('Thank you for subscribing!');
        input.value = '';
      }
    });
  });
}

/* TOAST */
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* BACK TO TOP */
function initBackToTop() {
  const backToTop = document.querySelector('.back-to-top');
  if (!backToTop) return;
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 300);
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* MODAL */
function initModal() {
  const modal = document.getElementById('agent-modal');
  const openBtn = document.getElementById('contact-agent-btn');
  const closeBtn = document.querySelector('.modal-close');
  if (!modal || !openBtn) return;

  openBtn.addEventListener('click', () => { modal.classList.add('active'); document.body.style.overflow = 'hidden'; });
  closeBtn?.addEventListener('click', () => { modal.classList.remove('active'); document.body.style.overflow = ''; });
  modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('active'); document.body.style.overflow = ''; } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) { modal.classList.remove('active'); document.body.style.overflow = ''; } });
}

/* COMPARISON */
function initComparison() {
  const checkboxes = document.querySelectorAll('.compare-checkbox input');
  const compareBar = document.getElementById('compare-bar');
  const compareCount = document.getElementById('compare-count');
  const compareBtn = document.getElementById('compare-btn');
  const comparisonModal = document.getElementById('comparison-modal');
  const comparisonClose = document.querySelector('.comparison-close');

  if (checkboxes.length === 0) return;

  let selected = [];

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const card = cb.closest('.property-card');
      const data = {
        id: card.getAttribute('data-id'),
        title: card.querySelector('h3').textContent,
        price: card.querySelector('.price').textContent,
        location: card.querySelector('.location').textContent,
        beds: card.querySelector('.property-meta span:nth-child(1)').textContent,
        baths: card.querySelector('.property-meta span:nth-child(2)').textContent,
        sqft: card.querySelector('.property-meta span:last-child').textContent,
        image: card.querySelector('.property-image img').src,
        type: card.getAttribute('data-type'),
        investment: (card.getAttribute('data-investment') || '0') + '%',
        locationVal: card.getAttribute('data-location')
      };

      if (cb.checked) {
        if (selected.length >= 3) { cb.checked = false; showToast('You can compare up to 3 properties'); return; }
        selected.push(data);
      } else {
        selected = selected.filter(item => item.id !== data.id);
      }

      compareCount.textContent = selected.length;
      compareBar.classList.toggle('active', selected.length > 0);
    });
  });

  compareBtn?.addEventListener('click', () => {
    if (selected.length < 2) { showToast('Select at least 2 properties to compare'); return; }
    const tbody = document.getElementById('comparison-body');
    tbody.innerHTML = '';

    const rows = [
      { label: 'Image', key: 'image', isImage: true },
      { label: 'Price', key: 'price' },
      { label: 'Location', key: 'location' },
      { label: 'Type', key: 'type' },
      { label: 'Bedrooms', key: 'beds' },
      { label: 'Bathrooms', key: 'baths' },
      { label: 'Size', key: 'sqft' },
      { label: 'Investment Score', key: 'investment' }
    ];

    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.label}</td>` + selected.map(item => {
        if (row.isImage) return `<td><img src="${item[row.key]}" alt="${item.title}" style="width:80px;height:60px;object-fit:cover;border-radius:8px;"></td>`;
        return `<td>${item[row.key]}</td>`;
      }).join('');
      tbody.appendChild(tr);
    });

    comparisonModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  comparisonClose?.addEventListener('click', () => {
    comparisonModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  comparisonModal?.addEventListener('click', (e) => {
    if (e.target === comparisonModal) {
      comparisonModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* SCHEDULE VIEWING */
function initScheduleViewing() {
  const form = document.getElementById('schedule-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('schedule-name').value;
    const phone = document.getElementById('schedule-phone').value;
    const date = document.getElementById('schedule-date').value;
    const time = document.getElementById('schedule-time').value;

    if (name && phone && date && time) {
      const bookings = JSON.parse(localStorage.getItem('bulexBookings') || '[]');
      bookings.push({ name, phone, date, time, property: 'Luxury 5-Bedroom Villa', id: Date.now() });
      localStorage.setItem('bulexBookings', JSON.stringify(bookings));
      showToast(`Viewing scheduled for ${date} at ${time}. We will contact you shortly!`);
      form.reset();
    } else {
      showToast('Please fill in all fields.');
    }
  });
}

/* COOKIE CONSENT */
function initCookieConsent() {
  if (localStorage.getItem('bulexCookies')) return;
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="container">
      <p>We use cookies to enhance your experience on Bulex Homes. By continuing, you agree to our <a href="privacy-policy.html">Privacy Policy</a>.</p>
      <div class="cookie-actions">
        <button class="btn btn-primary" id="cookie-accept">Accept All</button>
        <button class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.4);" id="cookie-reject">Reject Non-Essential</button>
      </div>
    </div>`;
  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add('show'), 1000);

  banner.querySelector('#cookie-accept').addEventListener('click', () => {
    localStorage.setItem('bulexCookies', 'all');
    banner.classList.remove('show');
  });
  banner.querySelector('#cookie-reject').addEventListener('click', () => {
    localStorage.setItem('bulexCookies', 'essential');
    banner.classList.remove('show');
  });
}

/* RECENTLY VIEWED TRACKING */
function initRecentlyViewed() {
  // Track property details page visits
  if (document.querySelector('.property-details')) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'lekki-villa-001';
    const title = document.querySelector('.details-header h1')?.textContent || 'Property';
    const price = document.querySelector('.details-price')?.textContent || '';
    const image = document.getElementById('gallery-main-img')?.src || '';
    const location = document.querySelector('.details-header .location')?.textContent || '';

    const viewed = JSON.parse(localStorage.getItem('bulexRecentlyViewed') || '[]');
    const filtered = viewed.filter(item => item.id !== id);
    filtered.unshift({ id, title, price, image, location, date: new Date().toISOString() });
    localStorage.setItem('bulexRecentlyViewed', JSON.stringify(filtered.slice(0, 12)));
  }
}

/* ASSISTANT */
function initAssistant() {
  if (document.querySelector('.assistant-fab')) return;

  const fab = document.createElement('button');
  fab.className = 'assistant-fab';
  fab.setAttribute('aria-label', 'Open Bulex assistant');
  fab.innerHTML = '<i class="fas fa-comments"></i>';

  const panel = document.createElement('div');
  panel.className = 'assistant-panel';
  panel.innerHTML = `
    <div class="assistant-header">
      <div>
        <strong>Bulex Assistant</strong>
        <p>Ask about homes, mortgages, or viewings.</p>
      </div>
      <button type="button" class="assistant-close" aria-label="Close assistant"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="assistant-body">
      <div class="assistant-bubble assistant-bubble-bot">I can help you compare homes, explain financing, or guide you to the right listing.</div>
      <div class="assistant-quick-actions">
        <button type="button" class="assistant-chip" data-query="show homes under my budget">Budget homes</button>
        <button type="button" class="assistant-chip" data-query="compare properties">Compare homes</button>
        <button type="button" class="assistant-chip" data-query="help book a viewing">Book viewing</button>
      </div>
      <form class="assistant-form">
        <input type="text" placeholder="Ask something..." aria-label="Assistant question">
        <button type="submit"><i class="fas fa-paper-plane"></i></button>
      </form>
    </div>`;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  fab.addEventListener('click', () => {
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) panel.querySelector('input')?.focus();
  });

  panel.querySelector('.assistant-close')?.addEventListener('click', () => panel.classList.remove('active'));

  panel.querySelectorAll('.assistant-chip').forEach(button => {
    button.addEventListener('click', () => {
      const text = button.getAttribute('data-query');
      if (text) handleAssistantInput(text, panel);
    });
  });

  panel.querySelector('.assistant-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = panel.querySelector('input');
    if (input) handleAssistantInput(input.value, panel);
  });

  function handleAssistantInput(query, panel) {
    if (!query) return;
    const body = panel.querySelector('.assistant-body');
    const bubble = document.createElement('div');
    bubble.className = 'assistant-bubble assistant-bubble-user';
    bubble.textContent = query;
    body.insertBefore(bubble, body.querySelector('.assistant-form'));

    const answer = getAssistantReply(query);
    const reply = document.createElement('div');
    reply.className = 'assistant-bubble assistant-bubble-bot';
    reply.textContent = answer;
    body.insertBefore(reply, body.querySelector('.assistant-form'));

    panel.querySelector('input').value = '';
  }

  function getAssistantReply(query) {
    const text = query.toLowerCase();
    if (text.includes('budget')) return 'You can browse homes under your ideal range on the properties page and use the mortgage calculator to compare affordability.';
    if (text.includes('compare')) return 'Select up to three properties and use the compare bar to review side-by-side details.';
    if (text.includes('viewing') || text.includes('book')) return 'You can book a viewing directly from the booking page and we will confirm your preferred time quickly.';
    if (text.includes('mortgage')) return 'Use the mortgage calculator to estimate monthly repayments, debt-to-income ratio, and recommended budget.';
    if (text.includes('investment')) return 'Our property cards highlight investment score, rental yield, and appreciation outlook for each listing.';
    return 'I can help with home selection, mortgage planning, comparisons, and booking a viewing. Try asking about your budget or a specific neighborhood.';
  }
}

/* ==========================================
   BLOG SEARCH + CATEGORY FILTER
========================================== */

const blogSearch = document.getElementById("blogSearch");
const categoryButtons = document.querySelectorAll(".category-btn");
const blogCards = document.querySelectorAll(".blog-card");

if (blogSearch && categoryButtons.length && blogCards.length) {

    let activeCategory = "all";

    function filterBlogs() {

        const searchText = blogSearch.value.toLowerCase().trim();

        blogCards.forEach(card => {

            const title = card.querySelector("h3").textContent.toLowerCase();
            const text = card.querySelector("p").textContent.toLowerCase();
            const category = card.dataset.category;

            const matchesSearch =
                title.includes(searchText) ||
                text.includes(searchText);

            const matchesCategory =
                activeCategory === "all" ||
                category === activeCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }

        });

    }

    blogSearch.addEventListener("input", filterBlogs);

    categoryButtons.forEach(button => {

        button.addEventListener("click", () => {

            categoryButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            activeCategory = button.dataset.category;

            filterBlogs();

        });

    });

}



/* ==========================================
   NEWSLETTER CTA
========================================== */

const newsletterCTA = document.querySelector(".newsletter-cta-form");

if (newsletterCTA) {

    newsletterCTA.addEventListener("submit", function (e) {

        e.preventDefault();

        alert("Thank you for subscribing to Bulex Homes!");

        this.reset();

    });

}