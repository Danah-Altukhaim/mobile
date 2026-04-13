# CCK Brand Kit
## Canadian College of Kuwait — الكلية الكندية في الكويت

> Reference file for UI development. All tokens extracted directly from `cck.edu.kw` CSS variables.

---

## Colors

All colors are defined as CSS custom properties. Use these exact values — do not approximate.

```css
:root {
  /* Primary Green — main brand color, use for CTAs, headers, accents */
  --rt-theme:            #006341;
  --rt-primary:          #006341;
  --rt-primary-1:        #005A3A; /* hover states */
  --rt-primary-2:        #004D32; /* pressed / deep states */

  /* Secondary — lime accent, use sparingly for highlights */
  --rt-secondary:        #76B82A;

  /* Red — Canadian identity, use for urgent CTAs and alerts */
  --rt-red-primary-2:    #e20613;
  --rt-red-secondary:    #a30010; /* hover/pressed on red elements */

  /* Light green wash — backgrounds, badges, success states */
  --rt-light-growth-green: #E6F2E2;

  /* Neutrals */
  --rt-heading:          #222222; /* all headings */
  --rt-body:             #737477; /* all body text */
  --rt-white:            #ffffff;
  --light-white:         #f6f6f6;
  --rt-border:           #D9D9D9;
  --rt-line:             #eeeeee;
  --rt-hover:            #005A3A;

  /* Footer */
  --rt-footer:           #181818;
  --footer-bg:           #181818;
  --copyright-border:    #242424;

  /* Semantic */
  --color-success:       #3EB75E;
  --color-danger:        #FF0000;
  --color-warning:       #FF8F3C;
  --color-info:          #1BA2DB;

  /* Social */
  --color-facebook:      #3B5997;
  --color-twitter:       #1BA1F2;
  --color-youtube:       #ED4141;
  --color-linkedin:      #0077B5;
  --color-instagram:     #C231A1;
}
```

### Color Usage Guide

| Token | Hex | Use |
|---|---|---|
| `--rt-primary` | `#006341` | Primary buttons, links, nav active states, section headers |
| `--rt-primary-1` | `#005A3A` | Hover on green elements |
| `--rt-primary-2` | `#004D32` | Pressed states, deep backgrounds |
| `--rt-secondary` | `#76B82A` | Accent badges, highlights, secondary CTAs |
| `--rt-red-primary-2` | `#e20613` | Alert buttons, urgent badges, maple leaf brand moments |
| `--rt-red-secondary` | `#a30010` | Hover on red elements |
| `--rt-light-growth-green` | `#E6F2E2` | Card backgrounds, success badges, green washes |
| `--rt-heading` | `#222222` | All heading text |
| `--rt-body` | `#737477` | All body/paragraph text |
| `--rt-border` | `#D9D9D9` | Input borders, card borders, dividers |
| `--rt-line` | `#eeeeee` | Subtle separators, zebra rows |
| `--rt-footer` | `#181818` | Footer background |

---

## Typography

### Font Stack

```css
:root {
  --font-primary:   "Gotham", sans-serif;   /* English headings, nav, CTAs, labels */
  --font-secondary: "Gotham", sans-serif;   /* Same — Gotham is used throughout */
  --font-hind:      "Hind", sans-serif;     /* Body copy, metadata, secondary text */
}
```

- **English headings & UI:** Gotham (proprietary — load via your license or CDN)
- **English body copy:** Hind (available on Google Fonts)
- **Arabic (all):** Noto Sans Arabic or Cairo — not explicitly set in their CSS, use either

```html
<!-- Google Fonts import -->
<link href="https://fonts.googleapis.com/css2?family=Hind:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Font Weights

```css
:root {
  --f-light:      300;
  --f-regular:    400;
  --f-medium:     500;
  --f-semi-bold:  600;
  --f-bold:       700;
  --f-extra-bold: 800;
  --f-black:      900;
}
```

### Type Scale

```css
:root {
  --h1:              64px;
  --line-height-b1:  26px; /* body large */
  --line-height-b2:  26px; /* body medium */
  --line-height-b3:  1.7;  /* body small */
}
```

| Level | Font | Size | Weight | Color |
|---|---|---|---|---|
| H1 | Gotham | 64px | 900 Black | `#222222` |
| H2 | Gotham | ~40px | 700 Bold | `#222222` or `#006341` |
| H3 | Gotham | ~28px | 700 Bold | `#222222` |
| H4 | Gotham | ~20px | 600 SemiBold | `#222222` |
| Body | Hind | 14–16px | 400 Regular | `#737477` |
| Label / Caption | Hind | 11–12px | 600 SemiBold | `#737477` |
| Arabic body | Noto Sans Arabic | 15–16px | 400–500 | `#006341` or `#222222` |

### Arabic Typography Rules

- Always use `dir="rtl"` on Arabic containers
- Never add `letter-spacing` to Arabic text — breaks ligatures
- Line height: add `0.1–0.2` to English equivalent (Arabic renders taller)
- Use `#006341` (green) for Arabic brand text, never red
- Arabic body text minimum **16px**

---

## Spacing & Layout

### Border Radius

```css
:root {
  --rt-radius:      3px;  /* all interactive elements — buttons, inputs, cards */
  --rt-radius-none: none; /* explicit square corners */
}
```

CCK uses very tight radius (`3px`) — keep all components close to square. No pill buttons, no large rounded cards.

### Recommended Spacing Scale (4px base)

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## Components

### Buttons

```css
/* Primary — use for main CTAs (Apply Now, Submit) */
.btn-primary {
  background:    var(--rt-primary);       /* #006341 */
  color:         var(--rt-white);
  border:        none;
  border-radius: var(--rt-radius);        /* 3px */
  font-family:   var(--font-primary);     /* Gotham */
  font-weight:   var(--f-bold);           /* 700 */
  padding:       10px 24px;
}
.btn-primary:hover {
  background:    var(--rt-primary-1);     /* #005A3A */
}

/* Secondary — outlined */
.btn-secondary {
  background:    transparent;
  color:         var(--rt-primary);
  border:        1.5px solid var(--rt-primary);
  border-radius: var(--rt-radius);
  font-family:   var(--font-primary);
  font-weight:   var(--f-bold);
  padding:       10px 24px;
}

/* Red / Alert — urgent actions */
.btn-danger {
  background:    var(--rt-red-primary-2); /* #e20613 */
  color:         var(--rt-white);
  border:        none;
  border-radius: var(--rt-radius);
  font-family:   var(--font-primary);
  font-weight:   var(--f-bold);
  padding:       10px 24px;
}
.btn-danger:hover {
  background:    var(--rt-red-secondary); /* #a30010 */
}
```

### Cards

```css
.card {
  background:    var(--rt-white);
  border:        1px solid var(--rt-border);   /* #D9D9D9 */
  border-radius: var(--rt-radius);             /* 3px */
  padding:       24px;
}
```

### Inputs

```css
.input {
  height:        44px;
  border:        1px solid var(--rt-border);   /* #D9D9D9 */
  border-radius: var(--rt-radius);             /* 3px */
  font-family:   var(--font-hind);
  font-size:     14px;
  color:         var(--rt-heading);
  padding:       0 12px;
}
.input:focus {
  border-color:  var(--rt-primary);            /* #006341 */
  outline:       none;
}
```

### Badges

```css
/* Green — accredited, active, success */
.badge-green {
  background:    var(--rt-light-growth-green); /* #E6F2E2 */
  color:         var(--rt-primary-2);          /* #004D32 */
  border-radius: var(--rt-radius);
  padding:       3px 10px;
  font-size:     11px;
  font-weight:   var(--f-bold);
}

/* Lime — secondary highlight */
.badge-lime {
  background:    var(--rt-secondary);          /* #76B82A */
  color:         var(--rt-white);
  border-radius: var(--rt-radius);
  padding:       3px 10px;
  font-size:     11px;
  font-weight:   var(--f-bold);
}

/* Red — urgent, alert */
.badge-red {
  background:    var(--rt-red-primary-2);      /* #e20613 */
  color:         var(--rt-white);
  border-radius: var(--rt-radius);
  padding:       3px 10px;
  font-size:     11px;
  font-weight:   var(--f-bold);
}
```

### Navigation Active State

```css
.nav-item.active {
  color:            var(--rt-primary);     /* #006341 */
  border-bottom:    2px solid var(--rt-primary);
}
.nav-item:hover {
  color:            var(--rt-hover);       /* #005A3A */
}
```

### Footer

```css
.footer {
  background: var(--footer-bg);            /* #181818 */
  color:      var(--rt-white);
  border-top: 1px solid var(--copyright-border); /* #242424 */
}
```

---

## Logo

### Variants

| Variant | Background | Use |
|---|---|---|
| Full color | White `#ffffff` | Default — all digital and print |
| White reverse | Green `#006341` | Dark/green backgrounds |
| Monochrome | Any | Black-and-white print only |

### Rules

- **Never** separate the shield from the wordmark
- **Never** recolor the maple leaf (always red `#e20613`) or shield (always green `#006341`)
- **Never** place on a busy photographic background without a solid color panel
- **Always** include Arabic line `الكلية الكندية في الكويت` on official documents
- English wordmark: red `#e20613`
- Arabic wordmark: green `#006341`
- Minimum clear space: equal to the shield height on all four sides

---

## RTL / Arabic Layout

```css
/* RTL container */
[dir="rtl"] {
  direction:  rtl;
  text-align: right;
}

/* Use logical properties everywhere */
/* margin-inline-start  not  margin-left  */
/* padding-inline-end   not  padding-right */
/* border-inline-start  not  border-left  */
/* inset-inline-start   not  left         */
```

### What flips in RTL
- Sidebar position (right side)
- Navigation order (reversed)
- Text alignment
- Directional icons (chevrons, arrows, back buttons)
- Progress bars

### What does NOT flip
- Logo
- Phone numbers
- Media playback controls
- Social media icons

---

## Brand Voice

### Tone
Ambitious but accessible. Direct, not bureaucratic. Warm, not casual.

| ✓ Do | ✗ Don't |
|---|---|
| "Your future begins here." | "Kindly submit the required application form." |
| "Education that empowers. Skills that endure." | "This institution provides post-secondary educational services." |
| "Start your journey — apply today." | "Please be informed that the deadline is approaching." |
| "60% scholarship available now." | "A scholarship of up to 60% may be applicable to eligible candidates." |
| Write Arabic natively | Translate from English into Arabic |

---

## Institutional Partners

For co-branding or partnership pages, always display these logos:

- Algonquin College (Canada) — primary academic partner
- Rasiyat Holding — parent company
- ACCA — accounting accreditation
- CIM — marketing accreditation
- Cisco NetAcad — tech programs
- PUC Kuwait — government accreditation
- VIT University — partnership
- Ministry of Education Kuwait

---

*CCK Brand Kit — extracted from cck.edu.kw · April 2026*
