# Design System — AI Recruitment Platform

Brand direction: **Mossy Hollow** (olive / sage / moss)

---

## 1. Colors — how the 4 are used

| Hex | Role | Where it shows up |
|---|---|---|
| **`#D4DE95`** | **Primary accent — your hero color** | Primary buttons, active nav highlight, key stat cards, score bars, feature highlights, hero sections. Always paired with dark text/icons on top (never used as text itself — a light-on-light legibility issue, not a style choice). |
| `#636B2F` | Secondary brand | Links, secondary buttons, icons, borders on emphasis elements |
| `#3D4127` | Dark anchor | Sidebar/header background, primary body text, dark button variant |
| `#BAC095` | Muted support | Tags, dividers, subtle fills, disabled states |

Because `#D4DE95` is light, every element built with it uses `#3D4127` (dark olive) as the text/icon color on top — that combination is high-contrast and very legible, so you can lean on it as much as you like for buttons, highlighted cards, badges, active states, progress fills, etc.

### Neutrals (added — required for a dashboard product)
| Token | Hex | Use |
|---|---|---|
| `neutral-white` | `#FFFFFF` | Cards, panels |
| `neutral-bg` | `#F8F9F1` | Page background (soft warm-white, ties into the lime undertone) |
| `neutral-100` | `#ECEEDF` | Table stripes, dividers |
| `neutral-300` | `#D3D6C4` | Borders |
| `neutral-500` | `#8A8F76` | Placeholder text, disabled states |
| `neutral-700` | `#52564A` | Secondary text |
| `neutral-900` | `#22241B` | Primary text (near-black, olive-tinted) |

### Semantic (added — needed for scoring, status, alerts)
| Token | Hex | Use |
|---|---|---|
| `success` | `#4E7A33` | High match score, approved, active |
| `warning` | `#C99A3E` | Medium match, pending review |
| `danger` | `#B4453D` | Low match, rejected, errors |
| `info` | `#3E7285` | Neutral notices, tips |

Kept muted/earthy on purpose so they still feel like part of the same family as your green palette, not a bolted-on alert kit.

### How to keep `#D4DE95` dominant without it going flat
Since it's one hex value used a lot, vary how it's applied so the UI doesn't look monotone:
- **Solid fill** at 100% for primary CTAs and the biggest highlight card on a page.
- **10–15% tint** (`rgba(212,222,149,0.12)`) for hover states, active nav row backgrounds, and subtle section highlights.
- **Full-strength as a border/left-accent bar** (3–4px) on active list items or focused cards.
- Always paired with `#3D4127` text/icons — that's what keeps it readable and "on brand" wherever it appears.

---

## 2. Typography

One primary typeface — clean and simple, matches "professional, not busy."

- **Primary (UI + headings + body):** [Inter](https://fonts.google.com/specimen/Inter) — standard for modern SaaS (Linear, Notion, Stripe). Reads well at small sizes, holds up in dense tables.
- **Numeric/data (optional):** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for match scores like "87%" or candidate IDs — gives numbers a precise feel without adding a second font personality.

### Type scale
| Style | Size | Weight |
|---|---|---|
| H1 (page title) | 28px | 700 |
| H2 (section) | 20px | 600 |
| H3 (card title) | 16px | 600 |
| Body | 14px | 400 |
| Small / caption | 12px | 400 |
| Button label | 14px | 600 |

Line height: 1.5 body, 1.2 headings.

---

## 3. Layout & Spacing

- Base unit: **8px grid** (4px for tight spacing like chip padding).
- Sidebar width: 240px (collapsible to 72px icon-only).
- Max content width: 1280px, centered, 24–32px page padding.
- Card radius: 10px. Buttons/inputs: 8px. Chips/badges: full pill (999px).
- Card shadow: subtle only — `0 1px 2px rgba(34,36,27,0.06)`. No heavy drop shadows.

---

## 4. Core Components

**Buttons**
- Primary: `#D4DE95` bg, `#3D4127` text, hover → slightly darker lime (`#C6D17E`).
- Secondary: white bg, `neutral-300` border, `neutral-900` text, hover → `neutral-100`.
- Dark variant (for use on light-heavy pages, e.g. "Post New Job"): `#3D4127` bg, white text.
- Destructive: `danger` bg, white text.

**Match/Score badges** (core to your resume-scoring feature)
- 80–100%: `success` bg (10% opacity) + `success` text → "Strong match"
- 50–79%: `warning` equivalent → "Moderate match"
- 0–49%: `danger` equivalent → "Weak match"
- Score bar fill itself can use `#D4DE95` at full strength with a `#3D4127` percentage label — ties the score visual straight back to the brand accent.

**Status tags** (application tracker)
- Applied → `info`, Shortlisted → `success`, In review → `warning`, Rejected → `danger`, Hired → `#3D4127`.

**Tables** (resume ranking, candidate lists)
- Header row: `neutral-bg`, uppercase, 12px, `neutral-700`.
- Row hover: 10% `#D4DE95` tint.
- Sticky header for long candidate lists.

**Cards**
- White bg, 1px `neutral-300` border, 10px radius, 20px padding.
- Featured/highlight cards (e.g. "Top Candidate," key stat): `#D4DE95` bg, `#3D4127` text — this is where the accent gets to be loud.

**Sidebar navigation**
- `#3D4127` background, off-white text.
- Active item: `#D4DE95` left-border (3px) + 12% lime tint background + white/lime text.

**Forms**
- Inputs: white bg, `neutral-300` border, focus ring in `#D4DE95` at full strength (2px) with a soft outer glow — makes focus states feel branded instead of generic blue.
- Labels: 12px, `neutral-700`, medium weight.

---

## 5. Iconography

Single consistent line-icon set — **Lucide** or **Feather**, 1.5px stroke, 20px default. Icon backgrounds (e.g. feature icons, stat card icons) can use `#D4DE95` circles/squares with `#3D4127` icon color for a consistent branded look across the dashboard.

---

## 6. Accessibility

- All text/background pairs meet WCAG AA (4.5:1 body text, 3:1 large text) — `#D4DE95` + `#3D4127` specifically passes comfortably.
- Every interactive element gets a visible focus ring — don't remove `outline` without replacing it.
- Never rely on color alone for status — every score/status badge keeps its text label.

---

## 7. Summary — what to hand to a developer

1. Define color tokens as CSS variables; treat `--accent` (`#D4DE95`) as the color used most often across buttons, highlights, and active states — always paired with `--brand-dark` (`#3D4127`) text.
2. Load Inter (400/500/600/700) as the only UI font; JetBrains Mono only for numeric scores.
3. Use the 8px spacing grid and the component rules above across all three user roles (recruiter, applicant, admin) so the product feels like one cohesive system.
