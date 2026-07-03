// =========================================================
// LOW COUNTRY SHINE — SCRIPT
// =========================================================

// ---- Footer year ----
document.getElementById('year').textContent = new Date().getFullYear();

// ---- Before/After slider ----
const slider = document.getElementById('baSlider');
const before = document.getElementById('baBefore');
const handle = document.getElementById('baHandle');

function setSlider(percent) {
  percent = Math.max(0, Math.min(100, percent));
  before.style.width = percent + '%';
  handle.style.left = percent + '%';
  before.querySelector('img').style.width = slider.offsetWidth + 'px';
}

function handleMove(clientX) {
  const rect = slider.getBoundingClientRect();
  const percent = ((clientX - rect.left) / rect.width) * 100;
  setSlider(percent);
}

let dragging = false;
slider.addEventListener('mousedown', (e) => { dragging = true; handleMove(e.clientX); });
window.addEventListener('mouseup', () => dragging = false);
window.addEventListener('mousemove', (e) => { if (dragging) handleMove(e.clientX); });
slider.addEventListener('touchstart', (e) => { dragging = true; handleMove(e.touches[0].clientX); });
window.addEventListener('touchend', () => dragging = false);
window.addEventListener('touchmove', (e) => { if (dragging) handleMove(e.touches[0].clientX); });
window.addEventListener('resize', () => setSlider(parseFloat(before.style.width) || 50));
setSlider(50);

// ---- 3D tilt on service cards ----
const tiltCards = document.querySelectorAll('.service-card');
const isTouchDevice = window.matchMedia('(hover: none)').matches;
if (!isTouchDevice) {
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateY = ((x - midX) / midX) * 8;
      const rotateX = ((midY - y) / midY) * 8;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

// ---- Nav scroll behavior ----
// Adds a solid background + shadow to the fixed nav once the page
// has scrolled past 80px, so it stays readable over any section.
window.addEventListener('scroll', () => {
  document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 80);
});

// ---- Scroll-triggered fade-in animations ----
// Any element with class="fade-in" gets .visible added once it's
// ~12% into the viewport, which triggers the CSS transition in styles.css.
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeObserver.unobserve(e.target); // only animate once
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-in').forEach((el) => fadeObserver.observe(el));

// ---- Quote form ----
// Submits via fetch() to Formspree so there's no page reload — the
// <form action> attribute stays as a fallback in case JS fails to load.

// Reads whatever phone number is currently on the page (populateBusiness
// keeps [data-phone] elements in sync with content.json) instead of
// hardcoding the placeholder number in the error message below.
function currentPhone() {
  const el = document.querySelector('[data-phone]');
  return el ? el.textContent.trim() : '(843) 708-5972';
}

const form = document.getElementById('quoteForm');
const note = document.getElementById('formNote');
const submitBtn = document.getElementById('quoteSubmitBtn');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  note.textContent = '';

  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' },
  })
    .then((response) => {
      if (response.ok) {
        note.textContent = "Thanks — I'll text or call you shortly.";
        form.reset();
      } else {
        note.textContent = 'Something went wrong — please call or text ' + currentPhone() + ' instead.';
      }
    })
    .catch(() => {
      note.textContent = 'Something went wrong — please call or text ' + currentPhone() + ' instead.';
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Request';
    });
});

// =========================================================
// PHOTO GALLERY + LIGHTBOX
// Gallery grid is built dynamically from content.json (see
// populateGallery/buildGallery below). Lightbox opens on click,
// supports prev/next with wraparound, and closes via ✕, outside
// click, or Escape.
// =========================================================
let galleryItems = [];
let lightboxIndex = 0;
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const galleryGrid = document.getElementById('galleryGrid');

// Builds the gallery-item thumbnails from the content.json gallery array.
function buildGallery(items) {
  galleryItems = items;
  if (!galleryGrid) return;
  galleryGrid.innerHTML = '';
  items.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.innerHTML =
      '<img src="' + item.src + '" alt="' + (item.label || 'Job photo') + '" loading="lazy">' +
      '<span class="gallery-label">' + (item.label || '') + '</span>';
    el.addEventListener('click', () => openLightbox(index));
    galleryGrid.appendChild(el);
  });
}

// Opens the lightbox showing the photo at the given gallery index.
function openLightbox(index) {
  if (!galleryItems.length) return;
  lightboxIndex = index;
  const item = galleryItems[lightboxIndex];
  lightboxImg.src = item.src;
  lightboxImg.alt = item.label || 'Job photo';
  lightbox.classList.add('open');
}

// Closes the lightbox overlay.
function closeLightbox() {
  lightbox.classList.remove('open');
}

// Moves to the previous/next photo, wrapping around at either end.
function showLightboxOffset(offset) {
  if (!galleryItems.length) return;
  lightboxIndex = (lightboxIndex + offset + galleryItems.length) % galleryItems.length;
  openLightbox(lightboxIndex);
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener('click', () => showLightboxOffset(-1));
if (lightboxNext) lightboxNext.addEventListener('click', () => showLightboxOffset(1));

// Click outside the image (on the dark overlay) closes the lightbox.
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

// Keyboard support while the lightbox is open: Escape closes, arrows navigate.
window.addEventListener('keydown', (e) => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showLightboxOffset(-1);
  if (e.key === 'ArrowRight') showLightboxOffset(1);
});

// =========================================================
// DYNAMIC CONTENT — loads content.json and populates the page.
// Client edits content.json (via the /admin panel) instead of
// touching this file or index.html. If the fetch fails for any
// reason, all existing hardcoded HTML stays in place as a fallback.
// =========================================================

// Updates every phone link (nav, hero CTA, quote section) at once.
function populateBusiness(business) {
  if (!business) return;

  if (business.name) {
    // navLogo wraps a logo <img> — update its alt text, not textContent,
    // or the image would get wiped out.
    const navLogoImg = document.querySelector('#navLogo img');
    if (navLogoImg) navLogoImg.alt = business.name + ' Pressure Washing';
    const heroBrand = document.getElementById('heroBrand');
    if (heroBrand) heroBrand.textContent = business.name;
    const footerName = document.getElementById('footerBusinessName');
    if (footerName) footerName.textContent = business.name;
  }

  if (business.phone && business.phone_href) {
    document.querySelectorAll('[data-phone]').forEach((el) => {
      el.href = 'tel:' + business.phone_href;
      // Preserve any emoji/icon prefix already in the link text, replace only the number.
      el.textContent = el.textContent.replace(/\(?\+?[\d][\d\s().-]{6,}/, business.phone);
    });
  }

  if (business.instagram) {
    const igLink = document.getElementById('instagramLink');
    if (igLink) {
      igLink.href = 'https://instagram.com/' + business.instagram;
      igLink.textContent = '@' + business.instagram;
    }
  }

  if (business.tagline) {
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle) heroTitle.textContent = business.tagline;
  }

  if (business.subheadline) {
    const heroSub = document.getElementById('heroSubheadline');
    if (heroSub) heroSub.textContent = business.subheadline;
  }
}

// Rebuilds the service-area town list from an array of town names.
function populateServiceArea(towns) {
  if (!Array.isArray(towns) || towns.length === 0) return;
  const list = document.getElementById('areaList');
  if (!list) return;
  list.innerHTML = '';
  towns.forEach((town) => {
    const li = document.createElement('li');
    li.textContent = town;
    list.appendChild(li);
  });
}

// Rebuilds the review cards grid. Stars render as filled/empty ★ characters.
function populateReviews(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) return;
  const grid = document.getElementById('reviewGrid');
  if (!grid) return;
  grid.innerHTML = '';
  reviews.forEach((review) => {
    const card = document.createElement('div');
    card.className = 'review-card fade-in';
    const stars = '★'.repeat(review.stars || 0) + '☆'.repeat(5 - (review.stars || 0));
    card.innerHTML =
      '<p>"' + review.text + '"</p>' +
      '<span class="review-stars">' + stars + '</span>' +
      '<span>— ' + review.author + ', ' + review.location + '</span>';
    grid.appendChild(card);
  });
  // Newly created cards need to be picked up by the fade-in observer.
  if (typeof fadeObserver !== 'undefined') {
    grid.querySelectorAll('.fade-in').forEach((el) => fadeObserver.observe(el));
  }
}

// Updates the before/after slider images (src + alt) from content.json.
function populateBeforeAfter(beforeAfter) {
  if (!beforeAfter) return;
  const afterImg = document.getElementById('baAfterImg');
  const beforeImg = document.getElementById('baBeforeImg');
  if (afterImg && beforeAfter.after_src) {
    afterImg.src = beforeAfter.after_src;
    afterImg.alt = beforeAfter.after_alt || afterImg.alt;
  }
  if (beforeImg && beforeAfter.before_src) {
    beforeImg.src = beforeAfter.before_src;
    beforeImg.alt = beforeAfter.before_alt || beforeImg.alt;
  }
  // Re-run the slider sizing logic since image sources changed.
  if (typeof setSlider === 'function') setSlider(50);
}

// Shows and builds the gallery section if content.json has photos,
// otherwise leaves it hidden (default state in index.html).
function populateGallery(gallery) {
  const section = document.getElementById('gallery');
  if (!section) return;
  if (!Array.isArray(gallery) || gallery.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';
  if (typeof buildGallery === 'function') buildGallery(gallery);
}

// Fetches content.json and populates every dynamic section of the page.
// Called last so it never blocks the slider/tilt/3D model from initializing.
function loadContent() {
  fetch('content.json')
    .then((res) => {
      if (!res.ok) throw new Error('content.json responded with ' + res.status);
      return res.json();
    })
    .then((data) => {
      populateBusiness(data.business);
      populateServiceArea(data.service_area);
      populateReviews(data.reviews);
      populateBeforeAfter(data.before_after);
      populateGallery(data.gallery);
    })
    .catch((err) => {
      // Fail silently for the visitor — hardcoded fallback content in
      // index.html remains visible. Log for the developer/client debugging.
      console.error('Could not load content.json — showing fallback content.', err);
    });
}

loadContent();
