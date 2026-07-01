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

// =========================================================
// THREE.JS — ROTATING LOGO HERO
// Replaces the procedural pressure-washer geometry with the
// real logo (images/logo.png) loaded as a texture on a plane,
// rotating in 3D with a transparent background. Water spray
// particles emit from the nozzle area of the logo artwork.
// =========================================================
(function () {
  const wrap = document.getElementById('hero3dWrap');
  const canvas = document.getElementById('threeCanvas');
  if (!wrap || !canvas || typeof THREE === 'undefined') return;

  // Detect WebGL support before spending any effort building the scene.
  function webglSupported() {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  if (!webglSupported()) {
    // Graceful fallback: show the flat logo image so devices/browsers
    // without WebGL still see something meaningful in the hero.
    const fallback = document.createElement('img');
    fallback.src = 'images/logo.png';
    fallback.alt = 'Low Country Shine Pressure Washing';
    fallback.style.cssText = 'width:80%;height:auto;object-fit:contain;opacity:0.85;margin:auto;display:block;';
    wrap.innerHTML = '';
    wrap.appendChild(fallback);
    const hint = document.querySelector('.canvas-hint');
    if (hint) hint.style.display = 'none';
    return; // skip all Three.js setup below
  }

  // Respect the user's motion preference: skip auto-rotate/float/spray,
  // drag-to-rotate still works since that's a deliberate user action.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Renderer ---
  const W = wrap.clientWidth;
  const H = wrap.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // fully transparent — CSS gradient shows through

  // --- Scene + Camera ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
  camera.position.set(0, 0, 5);

  // --- Lighting ---
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 0.6);
  key.position.set(-2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7EC8F4, 0.4); // brand-light rim
  rim.position.set(3, -2, 2);
  scene.add(rim);

  // --- Group that holds the logo plane, halo, and particles ---
  const group = new THREE.Group();
  scene.add(group);

  // --- Load logo texture and build the plane ---
  const loader = new THREE.TextureLoader();
  loader.load(
    'images/logo.png',
    function (texture) {
      const imgW = texture.image.naturalWidth || texture.image.width || 1160;
      const imgH = texture.image.naturalHeight || texture.image.height || 700;
      const aspect = imgW / imgH;

      const planeW = 3.8;
      const planeH = planeW / aspect;

      const geo = new THREE.PlaneGeometry(planeW, planeH);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.05, // clips fully transparent pixels; raise if export has white fringing
        side: THREE.DoubleSide,
        roughness: 0.4,
        metalness: 0.1,
      });

      const logoMesh = new THREE.Mesh(geo, mat);
      group.add(logoMesh);

      // Glow halo behind the logo for depth — slightly larger, brand blue
      const haloGeo = new THREE.PlaneGeometry(planeW * 1.15, planeH * 1.15);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x3D9FE0,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.z = -0.08;
      group.add(halo);

      // Water spray particles — emitted from the nozzle tip in the artwork,
      // approximately 60% across / 38% down the logo image.
      const nozzleX = (0.60 - 0.5) * planeW;
      const nozzleY = (0.5 - 0.38) * planeH;

      const PARTICLE_COUNT = 280;
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const velocities = [];

      function randomParticle(i) {
        const spread = 0.06;
        positions[i * 3]     = nozzleX + Math.random() * 0.04;
        positions[i * 3 + 1] = nozzleY + (Math.random() - 0.5) * spread;
        positions[i * 3 + 2] = 0.05;
        velocities[i] = {
          x: 0.035 + Math.random() * 0.035,
          y: (Math.random() - 0.45) * 0.015,
          z: (Math.random() - 0.5) * 0.008,
        };
      }

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        randomParticle(i);
        positions[i * 3] += Math.random() * 1.4; // stagger so spray is visible immediately
      }

      const partGeo = new THREE.BufferGeometry();
      partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const partMat = new THREE.PointsMaterial({
        color: 0x7EC8F4, // logo spray blue
        size: 0.025,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(partGeo, partMat);
      if (!reducedMotion) group.add(particles);

      // --- Drag to rotate ---
      let isDragging = false;
      let prevX = 0, prevY = 0;
      let targetRotY = 0;
      let targetRotX = 0;
      let autoRotate = !reducedMotion;

      canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        autoRotate = false;
        prevX = e.clientX;
        prevY = e.clientY;
      });
      window.addEventListener('mouseup', () => {
        isDragging = false;
        if (!reducedMotion) setTimeout(() => { autoRotate = true; }, 3000);
      });
      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        targetRotY += dx * 0.010;
        targetRotX += dy * 0.006;
        targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX));
        prevX = e.clientX;
        prevY = e.clientY;
      });

      // Touch support
      canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        autoRotate = false;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
        e.preventDefault();
      }, { passive: false });
      window.addEventListener('touchend', () => {
        isDragging = false;
        if (!reducedMotion) setTimeout(() => { autoRotate = true; }, 3000);
      });
      window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - prevX;
        const dy = e.touches[0].clientY - prevY;
        targetRotY += dx * 0.010;
        targetRotX += dy * 0.006;
        targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX));
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      });

      // --- Pause rendering when scrolled out of view ---
      let isVisible = true;
      const visObserver = new IntersectionObserver(
        (entries) => { isVisible = entries[0].isIntersecting; },
        { threshold: 0 }
      );
      visObserver.observe(wrap);

      // --- Resize ---
      window.addEventListener('resize', () => {
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });

      // --- Animation loop ---
      const clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;

        const t = clock.getElapsedTime();

        if (autoRotate) targetRotY += 0.003;

        group.rotation.y += (targetRotY - group.rotation.y) * 0.07;
        group.rotation.x += (targetRotX - group.rotation.x) * 0.07;

        if (!reducedMotion) {
          group.position.y = Math.sin(t * 0.7) * 0.07;

          const pos = partGeo.attributes.position.array;
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            pos[i * 3]     += velocities[i].x;
            pos[i * 3 + 1] += velocities[i].y;
            pos[i * 3 + 2] += velocities[i].z;
            if (pos[i * 3] > nozzleX + 2.2) randomParticle(i);
          }
          partGeo.attributes.position.needsUpdate = true;
          partMat.opacity = 0.6 + Math.sin(t * 2.2) * 0.15;
        }

        renderer.render(scene, camera);
      }

      animate();
    },
    undefined,
    function (err) {
      // BUGFIX: if logo.png fails to load, fall back to text instead of
      // leaving a blank canvas with no explanation.
      console.error('Logo texture failed to load:', err);
      wrap.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:2rem;font-size:0.85rem;">Low Country Shine</p>';
    }
  );
})();

// ---- Quote form ----
const form = document.getElementById('quoteForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', function (e) {
  e.preventDefault();
  note.textContent = "Thanks — we'll text or call you shortly.";
  form.reset();
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
    // BUGFIX: navLogo now wraps an <img> (the logo), not text — setting
    // textContent would erase the logo image. Update its alt text instead.
    const navLogo = document.getElementById('navLogo');
    if (navLogo) {
      const navLogoImg = navLogo.querySelector('img');
      if (navLogoImg) navLogoImg.alt = business.name;
      else navLogo.textContent = business.name;
    }
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
      igLink.textContent = '📷 @' + business.instagram;
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
