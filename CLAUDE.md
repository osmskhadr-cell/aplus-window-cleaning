# A+ Window Cleaning — project notes

Client site for A+ Window Cleaning (Minneapolis / St. Paul, MN), built and maintained by Omar Khadr.
Live: https://aplus-window-cleaning.vercel.app/ (Vercel project `aplus-window-cleaning`, team `osmskhadr-cells-projects`).
Repo: `osmskhadr-cell/aplus-window-cleaning`, branch `main`.

## Rules
- Never push to `main` directly; one branch per wave, Vercel preview, Omar reviews, then merge.
- Forms (quote wizard, review form) and the Formspree endpoints are off limits unless Omar says so; never submit a real form, test with mocked requests only.
- Never change client copy claims, prices or numbers without Omar's approval.
- One agent per repo while a wave is open. Notes live only in CLAUDE.md: it is the single source of truth for this repo (no AGENTS.md or other notes files).

## Stack

- 9 static HTML pages: `index.html`, `services.html`, `about.html`, `blog.html`, `contact.html`, `reviews.html`, `blog/cost-guide.html`, `blog/hard-water-stains.html`, `blog/seasonal-timing.html`. No framework, no build step for the HTML.
- Tailwind CSS v3 as a **committed static stylesheet** (`assets/tailwind.css`), configured in `tailwind.config.js`. The Tailwind Play CDN is no longer used.
- Each page also carries its own inline `<style>` and `<script>` blocks (nav, reveal-on-scroll, quote wizard, review form).
- Fonts: Fraunces (Google Fonts) and Cabinet Grotesk (Fontshare), loaded from their CDNs.
- Forms: two Formspree endpoints. Quote wizard (`index.html`, `contact.html`) posts to `https://formspree.io/f/xjgqbyap`; review form (`reviews.html`) posts to `https://formspree.io/f/xnjyeerj`. **Never submit these while testing**; intercept `**/formspree.io/**` in the test browser instead.
- Hosting: Vercel, static. Preview deploys with `vercel --yes` from a feature branch; production only from `main`.

## CSS build

`assets/tailwind.css` must be rebuilt whenever a class is added to or removed from any HTML file (the build only emits classes it finds in `./*.html` and `./blog/*.html`):

```sh
npx -y tailwindcss@3 -c tailwind.config.js -o assets/tailwind.css --minify
```

Run it from the repo root and commit the regenerated `assets/tailwind.css` together with the HTML change. No `package.json` is kept in the repo on purpose; `npx` fetches the CLI.

## Images

- Hero (home): `assets/hero-image.jpg` (1920 px JPEG fallback) + `hero-image-960.webp` / `hero-image-1920.webp` via `<picture>`.
- Logo: `assets/logo-200.png` for nav and footers; `favicon-32.png`, `icon-512.png`, `apple-touch-icon-180.png` for icons; `assets/logo.png` (1200 px) is only used by `og:image` and JSON-LD.
- Owner photo (About): `assets/owner-image-1200.webp` / `.jpg`.
- Blog images are still hot-linked from images.unsplash.com (see audit AP-33).

## Change log

### 2026-10-06 — Wave 1 (P0), branch `fix/wave1-p0`

Source: `portfolio-audit/aplus/report.md` (audit dated 2026-10-05). IDs refer to it.

- **AP-01** `reviews.html`: the live template review card ("PASTE REAL REVIEW TEXT HERE") was removed from the rendered grid and moved into the existing "HOW TO ADD A REAL REVIEW" HTML comment. The three placeholder cards, the "Reviews Coming Soon" strip and the original stat return automatically.
- **AP-02** all pages: `<link rel="canonical">`, `og:url`, and every JSON-LD `url` / `image` / `logo` now point at `https://aplus-window-cleaning.vercel.app/<same path>` instead of the parked `apluswindowcleaning.com`. `og:image` is now an absolute URL. The LocalBusiness `image` pointed at `/logo.png` (did not exist); it now uses `/assets/logo.png`. **Temporary until the client confirms ownership of apluswindowcleaning.com.**
- **AP-03** `index.html`, `contact.html` quote wizard: `res.ok` is checked before the success step. Non-OK response or network error shows an inline error box inside step 3 (plain sentence, phone (612) 369-1867 as fallback, "Try again" button that re-enables submit and resends the same data). Submit is disabled while sending. The old `mailto:` fallback was dropped because it always showed success. Field names, endpoint and hidden fields unchanged. Verified in Playwright with mocked 500 and 200 at 360 and 1440 on both pages.
- **AP-05** `reviews.html`: the star rating is a `<fieldset>` with a legend and five real `<input type="radio" name="rating">` (values 1–5, same payload as the old hidden input), labels styled as the existing stars, focus ring on the focused star. Arrow keys, Space and screen readers work natively.
- **AP-11** `index.html`: removed the leftover `hv.pause()` script (threw a TypeError on mobile).
- **Mobile LCP (AP-18, AP-23, AP-24, AP-45 and the fontshare preconnect)**:
  - Tailwind Play CDN → `assets/tailwind.css` static build + `tailwind.config.js`; CDN script, inline config and its preconnect removed from all 9 pages. Rendered pages diffed before/after at 360 and 1440 (see "Verification").
  - Hero image resized to 1920 px with WebP 960/1920 variants, `width`/`height`, `fetchpriority="high"`, never lazy.
  - Logo exported at 200 px for nav/footers, 32/180/512 px icons; `logo.png` shrunk to 1200 px for OG/JSON-LD only.
  - Owner photo → 1200 px WebP + JPEG fallback via `<picture>` (3 MB → ~270–290 KB); filename typo `owner-iamge.jpeg` fixed (only `about.html` referenced it).
  - `width`/`height` added to the two service photos. Blog post hero images are no longer `loading="lazy"` and get `fetchpriority="high"`.
  - `.reveal` removed from every above-the-fold hero element on all 9 pages (badge, h1, intro paragraph, CTAs, trust row, the three floating hero cards on home, the blog post meta row, title, standfirst and hero image frame). Everything below the fold still reveals on scroll.
  - `<link rel="preconnect">` for `api.fontshare.com` and `cdn.fontshare.com` added on all pages.
- `.gitignore`: `.env*` added by `vercel link` (the CLI writes a `.env.local` with an OIDC token; never commit it).
- `CLAUDE.md` (this file) created.

#### Verification (local, same machine, same throttling for before and after)

Lighthouse 12 mobile (simulated throttling), local static server. "Before" is a `main` worktree, "after" is this branch. The live host could not be measured on 2026-10-06 because Vercel Attack Challenge Mode was returning a 403 checkpoint to non-browser clients; Omar runs the official PSI himself.

| Page | Before: perf / LCP / FCP / SI / CLS / weight | After: perf / LCP / FCP / SI / CLS / weight |
|---|---|---|
| Home `/` | 59 / 15.2 s / 3.6 s / 9.5 s / 0.015 / 2,525 KB | 70 / 4.1 s / 4.1 s / 9.3 s / 0.024 / 310 KB |
| About | 58 / 24.5 s / 4.1 s / 10.1 s / 0.024 / 4,317 KB | 61 / 6.0 s / 5.3 s / 8.8 s / 0.035 / 931 KB |
| Reviews | 59 / 8.6 s / 4.0 s / 9.3 s / 0.029 / 1,192 KB | 73 / 3.6 s / 3.6 s / 11.7 s / 0.055 / 218 KB |

TBT was 0 ms in every run. Remaining cost is the two render-blocking font stylesheets (Google Fonts + Fontshare) on simulated 4G, which keep FCP at about 4 s; self-hosting the four WOFF2 files (audit AP-44) is the next step and was out of scope for this wave.

Visual regression: every page captured at 360 and 1440 (full page) from the `main` worktree and from this branch with animations frozen; pixel-diffed with pixelmatch (`scratchpad/audit/compare.mjs`). Expected differences only: reviews.html (AP-01 restores the placeholders and the Coming Soon strip) and the inline error box markup, which is hidden by default.

Form checks (`scratchpad/audit/wizard-test.mjs`, `star-test.mjs`): Formspree intercepted and fulfilled locally with 500 then 200; 44 wizard assertions and 16 star-rating assertions pass at 360 and 1440.

## Rejected / held

- **Nothing was reverted in Wave 1.**
- **AP-04 — NEEDS CLIENT CONFIRMATION, not edited.** Every instance of the social-proof claims (file:line as of commit f152330; verified by grep):
  - `index.html:264-267` JSON-LD `aggregateRating` (`ratingValue` "5.0", `reviewCount` "200")
  - `index.html:415` hero badge "5-Star Rated · Minnesota's Trusted Window Cleaner"
  - `index.html:439` mobile hero card "200+ / Happy Homes"; `index.html:472` desktop hero card "200+ / Happy Minnesota Homes"
  - `index.html:506`, `index.html:514` trust strip "5-Star Rated" (mobile and desktop rows)
  - `index.html:766` quote sidebar "★★★★★ 5.0 rating"; `index.html:767` "200+ MN homes cleaned"; `index.html:775` "Booked Monday, cleaned Tuesday. Windows look incredible." — Mike T., Minneapolis (mobile sidebar)
  - `index.html:986` "5.0 rating"; `index.html:988` "200+ Minnesota homes cleaned"; `index.html:994` Mike T., Minneapolis; `index.html:998` Sarah R., St. Paul; `index.html:1002` James K., Bloomington (desktop sidebar quotes)
  - `index.html:1132` "Join 200+ homeowners across Minnesota who stopped settling for streaky."
  - `index.html:1156` footer "★★★★★ 5-Star Rated"; `index.html:1210` mobile footer "★★★★★ 5-Star Rated"
  - `reviews.html:173` stat "200+" (`#review-count`, rewritten by the counter script once a real review exists); `reviews.html:417` "Join 200+ Minnesota homeowners who stopped settling for streaky."; `reviews.html:441` footer "★★★★★ 5-Star Rated"; `reviews.html:490` "5-Star Rated · 200+ Cleanings"
  - Footer pairs "★★★★★ 5-Star Rated" / "5-Star Rated · 200+ Cleanings": `about.html:293` / `:342`; `services.html:432` / `:481`; `blog.html:224` / `:273`; `contact.html:413` / `:462`; `blog/cost-guide.html:303` / `:352`; `blog/hard-water-stains.html:286` / `:335`; `blog/seasonal-timing.html:289` / `:338`
  - `blog/cost-guide.html:212` "based on hundreds of completed jobs"
  - Note: contact.html's quote sidebar does **not** repeat the named quotes or the 200+ figure (the audit's "same block in contact.html" was only true of the wizard). Line numbers drift as files change; `grep -n -E "200\+|5-Star Rated|5\.0 |aggregateRating|Mike T\.|Sarah R\.|James K\.|hundreds of completed" *.html blog/*.html` lists them all.
- **Blog JSON-LD `image` paths** (`/assets/blog-cost.jpg`, `/assets/blog-hardwater.jpg`, `/assets/blog-seasonal.jpg`) now sit on the Vercel host as instructed, but those files do not exist in the repo (the posts hot-link Unsplash). Held for a later wave with AP-33.
- **Unsplash hot-linked blog images** (AP-33) unchanged.
- **apluswindowcleaning.com**: domain ownership unconfirmed; canonical/OG stay on the Vercel host until it is.

### 2026-10-06 — merge approval and payload proof
- Omar reviewed the preview and approved merging everything on `fix/wave1-p0`, including the held items (temporary canonical, form error state, star rating).
- Payload proof before merge: the Formspree request captured on `main` and on the branch with the network mocked (nothing left the machine) is byte-identical for the home quote wizard, the contact quote wizard and the review form: same method, endpoint, `Accept`, content type, field order and values (multipart boundary normalised).

### Wave 2 backlog added by Omar (P1)
- Self-host the two font stylesheets (Fraunces from Google Fonts, Cabinet Grotesk from Fontshare) with preload.
- Home mobile LCP under 2.5 s on official PSI.
