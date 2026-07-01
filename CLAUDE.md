# CLAUDE.md — Low Country Shine Website
# Agent Instructions + Full Project Brief
# Drop this file in the root of the project folder.
# Claude Code reads it automatically on every session.

---

## WHO YOU ARE WORKING FOR

**Developer/owner:** Jacob (full control — design, code, 3D, structure)
**End client:** Low Country Shine (pressure washing business, Charleston SC)
**Client access level:** Photos, reviews, phone number, Instagram handle, service area towns, service descriptions. The client does NOT touch code, CSS, JS, or the 3D model — ever.

---

## YOUR ROLE AS AN AI AGENT

You are an autonomous build-and-fix agent. Your defaults:

- **Fix bugs without being asked.** If you notice a broken layout, a JS error, a missing asset reference, or a broken mobile view while working on anything else, fix it in the same pass. Do not leave known issues unfixed.
- **Never break what's already working.** Before touching any file, read it first. Run a quick mental diff of what changes and confirm nothing existing breaks.
- **Prefer surgical edits over rewrites.** Change only the lines that need changing. Do not refactor working code unless explicitly told to.
- **Test on mobile mentally.** Every layout, animation, and interaction must work on a 375px wide screen. If a feature only works on desktop, flag it and provide a graceful mobile fallback.
- **No placeholder logic in production.** If a feature isn't fully implemented, either implement it fully or remove it. Never ship a button that does nothing or a form that silently fails.
- **Keep the file structure flat and simple.** This is a static site. No build tools, no npm, no bundlers unless explicitly asked. Everything must work by opening index.html in a browser.
- **Comment your work.** Every section of HTML, CSS, and JS that you add or modify gets a brief comment explaining what it does and what a non-coder would need to change. This is non-negotiable.
- **Self-document bugs you find.** If you encounter a bug while working and fix it, add a one-line comment above the fix: `// BUGFIX: [description of what was wrong]`

---

## PROJECT OVERVIEW

**Business:** Low Country Shine — residential and commercial pressure washing
**Location:** Charleston, SC and surrounding Lowcountry
**Domain target:** lowcountryshine.com
**Hosting:** Cloudflare Pages (static, drag-and-drop deploy)
**Form backend:** Formspree (free tier — form submissions email the client directly)
**CMS for client editing:** content.json + /admin panel (described below)

**Services offered:**
- House washing (soft-wash siding, brick, stucco)
- Driveways & walkways (concrete, pavers, brick)
- Decks & fences (wood-safe, prep for staining)
- Commercial storefronts (scheduled around business hours)
- Roof washing (low-pressure, shingle-safe)
- Docks & pool decks (salt/algae/humidity specialist)

**Service area towns:**
Charleston, Mount Pleasant, James Island, Johns Island, Daniel Island,
Summerville, West Ashley, Folly Beach

---

## FILE STRUCTURE

```
lowcountry-shine/
├── CLAUDE.md              ← this file (agent instructions)
├── index.html             ← all site structure and content
├── styles.css             ← all visual design — colors, layout, animations
├── script.js              ← all JS — 3D model, slider, tilt, form
├── admin/
│   └── index.html         ← password-protected client CMS panel
├── content.json           ← single source of truth for all client-editable content
└── images/
    ├── before.jpg         ← before/after slider (client replaces)
    ├── after.jpg          ← before/after slider (client replaces)
    └── gallery/           ← client uploads job photos here (any jpg/png)
        └── .gitkeep
```

---

## CONTENT SYSTEM — HOW CLIENT EDITING WORKS

All client-editable content lives in `content.json`. The main site
reads this file on load via fetch() and populates the page dynamically.
The `/admin` panel reads and writes this file through a simple UI.

### content.json schema:
```json
{
  "business": {
    "name": "Low Country Shine",
    "phone": "(843) 555-0123",
    "phone_href": "+18435550123",
    "instagram": "lowcountryshine",
    "email": "hello@lowcountryshine.com",
    "tagline": "Tide goes out. Grime goes with it.",
    "subheadline": "Residential & commercial pressure washing for driveways, siding, decks, roofs, and everything salt air leaves behind."
  },
  "service_area": [
    "Charleston", "Mount Pleasant", "James Island", "Johns Island",
    "Daniel Island", "Summerville", "West Ashley", "Folly Beach"
  ],
  "reviews": [
    {
      "text": "Driveway looked brand new. Showed up on time, fast, and the price was fair.",
      "author": "Sarah M.",
      "location": "Mount Pleasant",
      "stars": 5
    }
  ],
  "gallery": [
    { "src": "images/gallery/job1-before.jpg", "label": "Before", "pair": "after" },
    { "src": "images/gallery/job1-after.jpg", "label": "After", "pair": "before" }
  ],
  "before_after": {
    "before_src": "images/before.jpg",
    "after_src": "images/after.jpg"
  }
}
```

### /admin panel requirements:
- Lives at `/admin/index.html`
- Password protected — simple client-side password check.
  Default password: `shine2025` (hardcoded in the HTML — client can change it by
  editing that one line, or Jacob can update it for them)
- Shows clearly labeled form fields for every key in content.json
- Photo upload: file input that previews the image, writes it to images/gallery/,
  and adds an entry to content.json gallery array
- "Save changes" button downloads an updated content.json for the client to
  hand back to Jacob, OR (if GitHub integration is set up) commits directly
- Clean, mobile-friendly UI so the client can use it from their phone
- The client CANNOT access or edit: index.html, styles.css, script.js, CLAUDE.md,
  or anything in the 3D model code

---

## DESIGN SYSTEM — DO NOT ALTER WITHOUT JACOB'S INSTRUCTION

### Color palette (CSS variables — all in :root in styles.css):
```
--marsh:       #2F4B3C   deep marsh green, primary brand color
--marsh-dark:  #1E3329   darker green for hero background
--tide:        #5E8C7B   mid green, accents and eyebrow text
--oyster:      #F4F1E8   warm off-white, main background
--oyster-dark: #E8E2D2   slightly darker off-white for card backgrounds
--teak:        #B98255   warm bronze/gold, CTA buttons and accents
--sky:         #7FA8B8   coastal blue, process section accents
--ink:         #1C231F   near-black text
```

### Typography:
- **Display/headings:** Fraunces (Google Fonts, serif, editorial feel)
- **Body:** Inter (Google Fonts, sans-serif, clean and readable)
- Font size scale uses clamp() for fluid sizing — do not use fixed px on headings

### Design philosophy:
Coastal, premium, not generic. Avoid anything that looks like a default Bootstrap
or Tailwind template. The palette and font pairing are intentional and specific
to this brand. Maintaining this visual identity is critical.

---

## SECTIONS — CURRENT IMPLEMENTATION

### 1. NAV BAR
Fixed, frosted glass effect (backdrop-filter blur on marsh green background).
Contains: logo (text), nav links (Services, How It Works, Service Area, Reviews),
phone number. Mobile: hide nav links, keep logo and phone.

### 2. HERO — SPLIT LAYOUT WITH 3D MODEL
Left: eyebrow text, H1 headline, subheadline paragraph, two CTA buttons.
Right: Three.js 3D canvas with the pressure washer model (see 3D section below).
Background: dark marsh green gradient with subtle radial light overlays.
Wave SVG at bottom transitions to oyster background.
On mobile (< 860px): stack vertically, text on top, 3D model below.

### 3. BEFORE/AFTER COMPARISON SLIDER
Drag-to-compare slider. "Before" image clips from right based on handle position.
Images: images/before.jpg (dirty surface) and images/after.jpg (clean surface).
Must be the SAME shot from the SAME angle — only thing changing is clean vs dirty.
Slider is touch-enabled. Handle is a circular button with ⟷ arrows.
Client replaces these two image files when they have real job photos.

### 4. SERVICES GRID
Auto-fit CSS grid, min 260px columns. Each service is an <article class="service-card">.
Cards have: emoji icon, H3 title, description paragraph.
3D tilt effect on hover (mouse-tracking perspective transform, desktop only).
Current services: House Washing, Driveways & Walkways, Decks & Fences,
Commercial Storefronts, Roof Washing, Docks & Pool Decks.

### 5. HOW IT WORKS (PROCESS)
Dark marsh green background section. 4-step numbered process.
Steps: Get a quote → We schedule → We clean → You inspect.
Step numbers styled in teak (gold), text in oyster (off-white).

### 6. SERVICE AREA
Two-column: left is text + bulleted town list, right is map placeholder.
Map placeholder should be replaced with an embedded Google Maps iframe
once the client provides their Google Business Profile link.
To embed: Client goes to Google Maps, searches their business, clicks Share →
Embed a map, copies the <iframe> code, pastes it in place of the placeholder div.

### 7. REVIEWS / TESTIMONIALS
3-column card grid. Star ratings if possible. Each review: quote text, author name,
location, and star rating.
Content driven by content.json reviews array — rendered dynamically via JS.

### 8. PHOTO GALLERY (TO BE BUILT)
Grid of before/after job photos uploaded by the client.
Driven by content.json gallery array.
On click: lightbox opens showing full image.
Layout: masonry or equal-height grid, max 3 columns desktop / 2 mobile / 1 small.
Should have a subtle scroll-triggered fade-in animation.

### 9. QUOTE FORM + CONTACT
Two-column: left is text + phone + Instagram link. Right is the form.
Form fields: Name (required), Phone (required), Email, "What needs cleaning?" textarea.
Form action: Formspree endpoint (client sets this up — see Formspree setup below).
On submit: success message shown inline. Form resets. No page reload.

### 10. FOOTER
Simple, dark marsh-dark background. Business name, year (auto-updating), city.
Optionally: repeat phone number and Instagram link for easy access.

---

## 3D MODEL SPEC — PRESSURE WASHER GUN

Built with Three.js r128 (loaded from cdnjs CDN — no npm needed).
The model is 100% procedural geometry — no external .glb file required.
The canvas replaces the right column of the hero section.

### Geometry breakdown:
| Part            | Geometry              | Material             |
|-----------------|-----------------------|----------------------|
| Barrel          | CylinderGeometry      | gunMat (dark gunmetal) |
| Barrel end cap  | SphereGeometry (half) | gunMat               |
| Nozzle          | CylinderGeometry (tapered) | nozzleMat (teak/bronze) |
| Nozzle tip      | ConeGeometry          | nozzleMat            |
| Handle/grip     | CylinderGeometry      | handleMat (matte black) |
| Handle cap      | SphereGeometry        | handleMat            |
| Trigger guard   | TorusGeometry (arc)   | nozzleMat            |
| Trigger         | BoxGeometry           | nozzleMat            |
| Hose connector  | CylinderGeometry      | tide green material  |
| Accent rings x2 | TorusGeometry         | nozzleMat            |
| Ground shadow   | CircleGeometry disc   | black, opacity 0.18  |

### Lighting (3-point setup):
- Ambient: white, intensity 0.45
- Key light: warm teak (#f0c990), intensity 1.6, position (3, 4, 3), casts shadows
- Fill light: cool sky blue (#7fa8b8), intensity 0.8, position (-3, 1, -2)
- Rim light: marsh green (#5e8c7b), intensity 0.6, position (0, -2, -4)

### Animations:
- Auto-rotation: slow Y-axis rotation (+=0.004 per frame)
- Floating: sine wave on Y position (amplitude 0.06, frequency 0.8)
- Water particles: 320 Points emitted from nozzle tip, travel along +X axis,
  reset when they travel too far or lifetime expires. Pulsing opacity.
- Drag to rotate: mouse/touch drag updates targetRotY and targetRotX.
  Smooth lerp (0.08 factor) to target. Auto-rotation resumes 3s after drag ends.
- Max tilt on X axis: ±0.6 radians (prevents model from flipping)

### If upgrading to a real .glb model:
Use THREE.GLTFLoader (add CDN link for it alongside Three.js).
Recommended free source: sketchfab.com — search "pressure washer" → filter Free.
Download .glb format. Drop in images/ folder. Load with:
```javascript
const loader = new THREE.GLTFLoader();
loader.load('images/model.glb', (gltf) => {
  scene.add(gltf.scene);
});
```
The rest of the scene (lighting, camera, drag controls, animation loop) stays identical.

### Canvas behavior:
- Transparent background (alpha: true) — hero gradient shows through
- "drag to rotate" hint text shown below canvas
- canvas:grab cursor, canvas:active = grabbing
- Resize handler updates camera aspect ratio and renderer size
- Respects prefers-reduced-motion: if set, disable auto-rotation and particles

---

## ANIMATIONS & INTERACTIONS

### Scroll-triggered fade-in (to be implemented if not already present):
All section headings and cards should fade up into view as they scroll into
the viewport. Use IntersectionObserver — no library needed.
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
```
CSS: `.fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.5s ease, transform 0.5s ease; }` and `.fade-in.visible { opacity: 1; transform: none; }`
Add class="fade-in" to: all section h2s, all .service-card, all .review-card,
all .step, .ba-slider.

### Service card 3D tilt:
Mouse-tracking perspective tilt, desktop only (hover: none check).
Max 8deg rotation on X and Y axes. Smooth on mouseleave back to 0.
Icon element gets translateZ(30px) so it pops toward the viewer.

### Before/after slider:
Drag or touch. Handle position drives clip-width of before overlay.
Before image gets explicit pixel width to prevent squishing.
Slider starts at 50% center.

### Nav scroll behavior (to implement):
Nav background should increase opacity and add a subtle shadow after
the user scrolls past 80px. Smooth transition.
```javascript
window.addEventListener('scroll', () => {
  document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 80);
});
```
CSS: `.nav.scrolled { background: rgba(47,75,60,0.98); box-shadow: 0 2px 20px rgba(0,0,0,0.2); }`

---

## FORMSPREE SETUP (for the agent to document and/or configure)

1. Client creates account at formspree.io
2. Creates a new form named "Low Country Shine Quote"
3. Copies endpoint URL (e.g. https://formspree.io/f/xabcd123)
4. In index.html, update: `<form ... action="YOUR_ENDPOINT" method="POST">`
5. In script.js, remove the `e.preventDefault()` line inside the form handler
   (currently there to prevent real submission during development)
6. Formspree free tier: 50 submissions/month. Enough for a local service business.
   If client needs more: $10/mo paid tier = 1000/mo.

The agent should detect whether the Formspree endpoint is still the placeholder
and warn in a comment if so.

---

## GOOGLE MAPS EMBED

Replace the `.area-map-placeholder` div with a real embed once the client
provides their Google Business Profile or a location:

```html
<div class="area-map">
  <iframe
    src="https://www.google.com/maps/embed?pb=PASTE_EMBED_CODE_HERE"
    width="100%"
    height="100%"
    style="border:0; border-radius:16px;"
    allowfullscreen=""
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
</div>
```
CSS: `.area-map { border-radius: 16px; overflow: hidden; aspect-ratio: 4/3; }`

---

## SEO REQUIREMENTS

Every page must have:
```html
<title>Low Country Shine | Pressure Washing Charleston SC</title>
<meta name="description" content="Residential & commercial pressure washing in Charleston, SC. Driveways, siding, decks, roofs & more. Free quotes — same day response.">
<meta property="og:title" content="Low Country Shine | Pressure Washing Charleston SC">
<meta property="og:description" content="Professional pressure washing for Charleston & the Lowcountry. Request a free quote today.">
<meta property="og:image" content="https://lowcountryshine.com/images/og-image.jpg">
<meta property="og:url" content="https://lowcountryshine.com">
<link rel="canonical" href="https://lowcountryshine.com">
```
Create a 1200×630px `og-image.jpg` in images/ — the before/after side-by-side
with the business name overlaid in the brand font works well.
Add `<meta name="robots" content="index, follow">`.
All images must have descriptive alt text. No img tags without alt attributes.
H1 appears exactly once per page (the hero headline).
H2s for each major section. No skipped heading levels.

---

## PERFORMANCE REQUIREMENTS

- Page load target: under 2 seconds on a 4G connection
- All images: compress to under 300KB each using squoosh.app or similar
- Three.js canvas: renders only when in viewport (pause animation when hero is
  not visible using IntersectionObserver on the canvas wrapper)
- No render-blocking resources: fonts use `display=swap`, scripts at bottom of body
- Cloudflare Pages provides automatic CDN, gzip, and HTTP/2 — no config needed

---

## BROWSER/DEVICE SUPPORT

- Chrome, Safari, Firefox, Edge — latest 2 versions
- iOS Safari 15+, Android Chrome
- Three.js canvas: gracefully hide (display:none) if WebGL is not supported.
  Show a static high-quality photo of a pressure washer job as fallback.
  Detection:
  ```javascript
  function webglSupported() {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch(e) { return false; }
  }
  if (!webglSupported()) {
    document.getElementById('hero3dWrap').innerHTML =
      '<img src="images/hero-fallback.jpg" alt="Pressure washing in Charleston SC" style="width:100%;height:100%;object-fit:cover;border-radius:24px;">';
  }
  ```

---

## DEPLOYMENT CHECKLIST

The agent should be able to verify all of these before calling a build "done":

- [ ] index.html opens without console errors in Chrome DevTools
- [ ] 3D canvas renders and responds to drag on desktop
- [ ] 3D canvas renders and responds to touch on mobile (375px viewport)
- [ ] Before/after slider drags smoothly on desktop and touch
- [ ] Service card tilt activates on desktop hover, is absent on mobile
- [ ] All nav links scroll to correct sections
- [ ] Quote form shows success message on submit (or submits to Formspree)
- [ ] All images have alt text
- [ ] No broken image references (all src paths resolve)
- [ ] content.json loads successfully via fetch() and populates dynamic content
- [ ] /admin panel is accessible, password-protected, and saves to content.json
- [ ] Mobile layout (375px): no horizontal scroll, no overlapping elements
- [ ] Fonts loaded from Google Fonts (or bundled if offline support needed)
- [ ] OG tags present and correct
- [ ] No Formspree endpoint placeholder remaining in production

---

## HOW TO DEPLOY (CLOUDFLARE PAGES)

1. Push this entire folder to a GitHub repo (or drag-and-drop to Cloudflare)
2. Go to dash.cloudflare.com → Workers & Pages → Create → Pages
3. Connect to GitHub repo OR upload assets directly
4. No build command needed (static site)
5. Output directory: leave blank (root)
6. Deploy. Live in ~60 seconds.
7. Custom domain: Pages project → Custom domains → add lowcountryshine.com
8. If domain is on Cloudflare Registrar: auto-connects.
   If on Namecheap: update nameservers to Cloudflare's (shown in dashboard).

Auto-deploy on push: if GitHub-connected, every git push to main redeploys automatically.
This means Jacob can make a change, push it, and the site is live in 60 seconds.

---

## HOW TO USE THIS PROMPT IN CLAUDE CODE OR CURSOR

### Claude Code (terminal):
```bash
cd lowcountry-shine
claude
```
Claude Code reads CLAUDE.md automatically. Then prompt:
> "Read CLAUDE.md and build everything that isn't already implemented.
>  Fix any bugs you find. Run through the deployment checklist at the end."

### Cursor:
Open the lowcountry-shine folder in Cursor.
Use Cmd+L (chat) and paste:
> "Read CLAUDE.md in this project. Build all missing features, fix all bugs,
>  and verify the deployment checklist before finishing."

For bug fixes specifically:
> "There is a bug where [describe bug]. Read CLAUDE.md for context,
>  fix the bug without breaking anything else, and add a BUGFIX comment."

For new features:
> "Add [feature] to this site. Follow all design system rules in CLAUDE.md.
>  Make sure it works on mobile and passes the deployment checklist."

---

## WHAT THE AGENT MUST NEVER DO

- Never change the color palette without explicit instruction from Jacob
- Never remove the Three.js 3D model or simplify it to a static image
  (unless implementing a proper .glb upgrade)
- Never add npm, webpack, Vite, or any build tool to this project
- Never expose the admin password in any public-facing file other than /admin/index.html
- Never let the client edit index.html, styles.css, script.js, or CLAUDE.md directly
- Never remove the before/after slider
- Never add external tracking scripts (Google Analytics, Meta Pixel, etc.)
  without Jacob explicitly asking
- Never use inline styles on elements that already have CSS classes
- Never use !important in CSS
- Never commit API keys, form endpoints, or passwords to any public repo —
  use a .env file or Cloudflare environment variables for anything sensitive

---

## CURRENT BUILD STATUS

As of initial build:
- [x] Nav bar
- [x] Hero split layout
- [x] Three.js 3D pressure washer model with drag-to-rotate
- [x] Water particle spray animation
- [x] Before/after slider (touch + mouse)
- [x] Services grid with 3D tilt effect
- [x] How it works / process section
- [x] Service area with town list (map placeholder)
- [x] Reviews section (placeholder content)
- [x] Quote form (Formspree-ready, needs endpoint)
- [x] Footer with auto year
- [ ] content.json + dynamic content loading
- [ ] /admin CMS panel
- [ ] Photo gallery section with lightbox
- [ ] Scroll-triggered fade-in animations
- [ ] Nav scroll behavior (opacity + shadow on scroll)
- [ ] WebGL fallback detection
- [ ] SEO meta tags (OG tags)
- [ ] Google Maps embed
- [ ] Real before/after photos (client to provide)
- [ ] Real reviews (client to provide once jobs are done)
- [ ] Formspree endpoint (client to set up)
- [ ] hero-fallback.jpg for no-WebGL devices
