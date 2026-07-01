# Low Country Shine Website — Full Walkthrough

This is a complete, working website. No build tools, no npm, no Astro —
just three files (index.html, styles.css, script.js) plus an images folder.
You can open it, edit it, and put it online without writing code.

---

## 1. Look at it on your computer first

1. Unzip/find the `lowcountry-shine` folder.
2. Double-click `index.html`. It opens in your browser and works fully —
   try dragging the before/after slider.
3. Any time you make an edit, just refresh the browser tab to see it.

---

## 2. Make it yours (no coding — just find & replace)

Open `index.html` in any text editor (Notes, TextEdit, VS Code, even
Google Docs in plain text mode). Every section has a comment like:

```
<!-- EDIT: headline, subheadline -->
```

Things you'll want to change:

- **Phone number** — search for `843-555-0123` / `+18435550123` and
  replace with the real number in both places it appears (nav bar and
  quote section). Keep the `+1` format in `href="tel:..."` links.
- **Instagram link** — search for `lowcountryshine` and swap in the
  real handle.
- **Headline / subtext** — inside the `<section id="top" class="hero">`
  block, edit the text between the `<h1>` and `<p class="hero-sub">` tags.
- **Services** — each service is one `<article class="service-card">`
  block. Edit the emoji, title, and description. Copy/paste a whole
  block to add a new service, delete one to remove.
- **Service area towns** — inside `<ul class="area-list">`, each
  `<li>Town Name</li>` is one town. Add or remove lines.
- **Reviews** — once you have real Google/Facebook reviews, replace the
  placeholder text inside `.review-card` blocks.

You're only ever editing the text between tags — never delete the
`<tag>...</tag>` brackets themselves, just the words inside them.

### Changing colors or fonts
Open `styles.css` and look at the very top — there's a block like:

```css
:root {
  --marsh: #2F4B3C;
  --teak: #B98255;
  ...
}
```

Change any hex code and it updates everywhere that color is used on
the site. Don't need to touch anything else in that file.

---

## 3. Add real photos

Your buddy's actual before/after shots will sell this way better than
placeholders. In the `images` folder:

1. Take two photos of the *same spot* — one dirty, one clean — from
   the same angle/distance.
2. Rename them exactly `before.jpg` and `after.jpg`, replacing the
   placeholder files.
3. For the hero background, add a wide photo named `hero.jpg` to the
   `images` folder, then in `styles.css` find `.hero {` and add this
   line inside the curly braces:
   `background: linear-gradient(rgba(30,51,41,.55),rgba(30,51,41,.55)), url('images/hero.jpg') center/cover;`
   (This darkens the photo slightly so the white text stays readable.)

Keep photos under ~500KB each so the site loads fast — any free tool
like Squoosh.app (just drag a photo in, no install) will compress them.

---

## 4. Make the quote form actually send you emails (5 min, no code)

Right now the form just shows a thank-you message — it doesn't go
anywhere. The easiest fix:

1. Go to **formspree.io** and make a free account.
2. Create a new form, copy the form endpoint URL it gives you
   (looks like `https://formspree.io/f/abc123`).
3. In `index.html`, find:
   `<form class="quote-form" id="quoteForm">`
   and change it to:
   `<form class="quote-form" id="quoteForm" action="https://formspree.io/f/abc123" method="POST">`
4. Open `script.js` and delete this line (so the form actually submits
   instead of just resetting):
   `e.preventDefault();`

Now every submission lands in your buddy's email inbox automatically.

---

## 5. Put it online (free, no code)

**Easiest option — Cloudflare Pages (drag and drop):**

1. Go to **dash.cloudflare.com** → Workers & Pages → Create →
   Pages → "Upload assets."
2. Drag the whole `lowcountry-shine` folder in (or a zip of it).
3. Click deploy. You'll get a free URL like `lowcountry-shine.pages.dev`
   within a minute.
4. To use a real domain (e.g. lowcountryshine.com), buy it through
   Cloudflare Registrar or any registrar, then in the Pages project
   go to "Custom domains" and follow the prompts — Cloudflare handles
   the DNS for you with no manual config if you buy through them.

Every time you edit the files locally, just drag the folder back in
to redeploy — or connect it to a GitHub repo later for auto-deploys,
but that's optional and not needed to get this live today.

---

## File map (what's in this folder)

```
lowcountry-shine/
├── index.html      ← all the content/text lives here
├── styles.css      ← all colors, fonts, spacing
├── script.js       ← powers the slider + form (rarely needs editing)
├── images/
│   ├── before.jpg  ← replace with real "dirty" photo
│   └── after.jpg   ← replace with real "clean" photo
└── README.md       ← this file
```
