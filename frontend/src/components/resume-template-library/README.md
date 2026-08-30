# ATS-Friendly Resume Template Library

16 production React/TypeScript resume templates across 4 categories
(Classic/Corporate, Modern Professional, Executive/Senior Professional,
Technical/Minimal), all consuming a single shared `ResumeData` schema.
Type-checked with `tsc --strict` and zero errors.

## Why the file count is manageable

Per the ATS rules, visual differentiation between templates is only
allowed to come from typography, spacing, borders, alignment, and
heading treatment — **not** structural/layout differences. So instead
of duplicating section-rendering logic 16 times, every template is a
thin wrapper around one shared renderer:

```
ResumeLayout (components/ResumeLayout.tsx)
  -> always the same single-column DOM structure & reading order
  -> takes a `theme: ThemeConfig` prop (a few presentational flags)

Classic01.tsx, Modern03.tsx, Executive02.tsx, Technical04.tsx, ...
  -> each just defines a `ThemeConfig` + imports its own styles.css
  -> zero section-rendering logic of their own
```

This means: one place to fix an ATS bug (affects all 16 templates at
once), and true structural identity across templates, which is what
actually keeps them ATS-safe — not per-template discipline.

## File structure

```
resume/
├── data/
│   ├── resumeTypes.ts       # ResumeData interface + hasItems() helper
│   └── sampleResume.ts      # realistic sample + minimal sample
├── components/
│   ├── themeTypes.ts        # ThemeConfig type shared by all templates
│   ├── ResumeLayout.tsx     # the single structural renderer
│   ├── ResumeHeader.tsx
│   ├── Section.tsx          # heading + content, or nothing if empty
│   ├── ExperienceItem.tsx
│   ├── EducationItem.tsx
│   ├── SkillsSection.tsx
│   ├── ProjectItem.tsx
│   ├── CertificationItem.tsx
│   ├── AwardItem.tsx
│   ├── PublicationItem.tsx
│   ├── VolunteerItem.tsx
│   ├── LanguagesSection.tsx
│   └── MembershipsSection.tsx
├── styles/
│   └── base.css              # shared structure, heading variants, print rules
├── templates/
│   ├── classic/    Classic01-04.tsx + styles.css
│   ├── modern/     Modern01-04.tsx + styles.css
│   ├── executive/  Executive01-04.tsx + styles.css
│   └── technical/  Technical01-04.tsx + styles.css
├── gallery/
│   ├── TemplateGallery.tsx   # preview grid, grouped by category
│   └── gallery.css           # gallery chrome only, never applied to output
├── templateRegistry.ts       # resumeTemplates[], getTemplateById(), metadata
├── ExampleUsage.tsx           # two integration patterns
└── index.ts                   # barrel export
```

## Integrating into your existing React app

1. **Copy the `resume/` folder** into your frontend source tree, e.g.
   `src/resume/`.

2. **Import `resume/styles/base.css` once**, globally (e.g. in your
   app's root layout or `index.tsx`). Do not import it per-template —
   each template's own `styles.css` only sets CSS custom properties
   and assumes `base.css` is already loaded.

   ```tsx
   import "src/resume/styles/base.css";
   ```

3. **Build your `ResumeData` object** from whatever your AI resume
   generator returns. The Django/DRF backend should serialize directly
   into this shape (see `resume/data/resumeTypes.ts`) — no
   transformation should be needed on the frontend.

4. **Render a specific template by id:**

   ```tsx
   import { getTemplateById, resumeTemplates } from "src/resume/templateRegistry";

   function ResumePreview({ resume, templateId }: { resume: ResumeData; templateId: string }) {
     const template = getTemplateById(templateId) ?? resumeTemplates[0];
     const Template = template.component;
     return <Template resume={resume} />;
   }
   ```

5. **Let the user browse and pick a template:**

   ```tsx
   import TemplateGallery from "src/resume/gallery/TemplateGallery";

   <TemplateGallery onSelectTemplate={(templateId) => saveTemplateChoice(templateId)} />
   ```

   Persist the returned `templateId` string (e.g. `"modern-03"`) on
   your Django `Resume`/`Application` model. It's just a string field —
   no need to store which component it maps to.

6. **PDF/DOCX generation (future step):** Because every template
   renders to a single-column, semantic-HTML DOM with a shared
   `@page`/print stylesheet, you can point a headless-Chrome
   HTML-to-PDF pipeline (e.g. Playwright/Puppeteer print-to-PDF) at
   the rendered template route and get a print-accurate PDF without
   any template changes. DOCX generation should be done from the same
   `ResumeData` object via a separate DOCX-specific renderer (python-docx
   on the backend, for example) — do not try to convert the rendered
   HTML/CSS into DOCX directly, since Word's layout model differs
   enough that fidelity will suffer either way.

## Adding a 17th template

Because of the shared-renderer architecture, adding a new template is
three steps:

1. Add a new `.tpl-yourname { --accent-color: ...; --font-family: ...; }`
   block to a `styles.css` (or a new one).
2. Create `YourTemplate.tsx`:
   ```tsx
   import ResumeLayout from "../../components/ResumeLayout";
   const theme: ThemeConfig = { className: "tpl-yourname", ... };
   export default function YourTemplate({ resume }: { resume: ResumeData }) {
     return <ResumeLayout resume={resume} theme={theme} />;
   }
   ```
3. Register it in `templateRegistry.ts`.

No section-rendering logic needs to be touched.

## ATS design decisions baked into the architecture

- **Single shared renderer** (`ResumeLayout.tsx`) means all 16
  templates have byte-identical DOM structure and reading order —
  differences are CSS-only (custom properties + a small heading-style
  class), so there's no way for a new template to accidentally
  introduce a multi-column layout, table, or absolutely-positioned
  content.
- **Empty sections never render** (`Section.tsx` returns `null` when
  `show` is `false`), so no blank/orphaned headings.
- **Contact info and links are always real, visible text** —
  `ResumeHeader.tsx` never renders an icon as the sole representation
  of an email, phone number, or link; link text is always the visible
  URL.
- **Page-break safety**: `.avoid-break` (`break-inside: avoid` /
  `page-break-inside: avoid`) is applied to every experience,
  education, project, certification, award, publication, and
  volunteer entry, and headings use `break-after: avoid` so a heading
  is never orphaned from its content across a page break.
- **No content mutation**: no template truncates, rewrites, or hides
  AI-generated bullet/summary text. Length is left entirely to the
  content layer, and pages grow naturally (1–3 pages) rather than
  forcing content to fit via shrunken fonts.
- **Fonts**: every template uses widely supported system fonts (Arial,
  Helvetica, Georgia, Verdana, Times New Roman, Cambria, Trebuchet MS,
  Segoe UI, Consolas as a heading-only accent in `technical-02`) at
  10–12pt body / 13–18pt(ish) headings / ~24–28pt name, matching the
  brief's typography constraints.
- **Metadata wording**: `templateRegistry.ts` uses `atsScore: "high"`
  and descriptive `bestFor`/`recommendedFor` fields — no "guaranteed
  to pass ATS" language anywhere.

## Testing

The library was type-checked end-to-end with `tsc --strict --noEmit`
(zero errors) using `typescript@5`, `react@18`, and `@types/react@18`.
It has not been run through a bundler/dev-server in this environment,
since your app's build tooling (webpack/vite/CRA/etc.) wasn't
specified — plug it into your existing React build and it should work
as-is, since it uses no dependencies beyond `react`/`react-dom`.
