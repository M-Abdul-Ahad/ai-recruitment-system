/**
 * themeTypes.ts
 *
 * All 16 templates share ONE structural renderer (`ResumeLayout`) and
 * differ only through:
 *   1. a CSS file (colors, fonts, spacing, borders, weights) scoped to
 *      a unique root class name, and
 *   2. a small set of purely-presentational theme flags below
 *      (alignment, text case, heading treatment, divider usage).
 *
 * This keeps every template ATS-safe by construction: the DOM/reading
 * order is identical for all 16 templates, only CSS-level presentation
 * changes. It also avoids duplicating section-rendering logic 16 times.
 */

export type SectionHeadingStyle =
  | "underline" // simple bottom border under the heading text
  | "rule-below" // full-width horizontal rule under the heading
  | "uppercase-spaced" // uppercase, letter-spaced, no rule
  | "boxed-label" // small bordered label box, common in executive styles
  | "bold-caps"; // bold, uppercase, tight, no rule (dense technical look)

export type HeaderAlign = "left" | "center";

export type SkillsLayout =
  | "categorized-block" // "Category: skill, skill, skill" stacked lines
  | "categorized-columns" // category label left, skills right, single line
  | "flat-list"; // one flat comma-separated list (used when no categories)

export interface ThemeConfig {
  /** Unique root class name used for CSS scoping, e.g. "tpl-classic-01". */
  className: string;
  headerAlign: HeaderAlign;
  nameCase: "normal" | "uppercase";
  sectionHeadingStyle: SectionHeadingStyle;
  skillsLayout: SkillsLayout;
  /** Show a horizontal rule directly beneath the header block. */
  showHeaderRule: boolean;
  /** Show a thin rule between contact items instead of a bullet separator. */
  contactSeparator: "dot" | "pipe" | "space";
  /** Divider line between date and other experience meta text. */
  dateStyle: "inline" | "block";
}
