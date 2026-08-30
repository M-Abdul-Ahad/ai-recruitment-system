import { ComponentType } from "react";
import { ResumeData } from "./data/resumeTypes";

import Classic01 from "./templates/classic/Classic01";
import Classic02 from "./templates/classic/Classic02";
import Classic03 from "./templates/classic/Classic03";
import Classic04 from "./templates/classic/Classic04";

import Modern01 from "./templates/modern/Modern01";
import Modern02 from "./templates/modern/Modern02";
import Modern03 from "./templates/modern/Modern03";
import Modern04 from "./templates/modern/Modern04";

import Executive01 from "./templates/executive/Executive01";
import Executive02 from "./templates/executive/Executive02";
import Executive03 from "./templates/executive/Executive03";
import Executive04 from "./templates/executive/Executive04";

import Technical01 from "./templates/technical/Technical01";
import Technical02 from "./templates/technical/Technical02";
import Technical03 from "./templates/technical/Technical03";
import Technical04 from "./templates/technical/Technical04";

export type TemplateCategory = "classic" | "modern" | "executive" | "technical";

export interface TemplateMeta {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  bestFor: string[];
  /**
   * Qualitative signal only - not a guarantee. Use wording such as
   * "high" / "structured for parsing", never a claim that a template
   * is "guaranteed" to pass any specific ATS.
   */
  atsScore: "high";
  recommendedFor: string;
  component: ComponentType<{ resume: ResumeData }>;
}

export const resumeTemplates: TemplateMeta[] = [
  // ---------------- Classic / Corporate ----------------
  {
    id: "classic-01",
    name: "Classic Professional",
    category: "classic",
    description:
      "Centered header, navy accent, underlined section headings. Extremely conservative and ATS-friendly.",
    bestFor: ["Finance", "Accounting", "Operations", "General corporate roles"],
    atsScore: "high",
    recommendedFor: "Entry-level to mid-level corporate professionals",
    component: Classic01,
  },
  {
    id: "classic-02",
    name: "Traditional Serif",
    category: "classic",
    description:
      "Left-aligned header with Georgia serif type and a full-width rule beneath each heading.",
    bestFor: ["Accounting", "Business", "Administration"],
    atsScore: "high",
    recommendedFor: "Mid-level professionals in traditional industries",
    component: Classic02,
  },
  {
    id: "classic-03",
    name: "Traditional Formal",
    category: "classic",
    description:
      "Times New Roman body copy with letter-spaced uppercase headings for a formal register.",
    bestFor: ["Legal", "Government-adjacent roles", "Finance"],
    atsScore: "high",
    recommendedFor: "Professionals targeting conservative institutions",
    component: Classic03,
  },
  {
    id: "classic-04",
    name: "Corporate Structured",
    category: "classic",
    description:
      "Verdana body copy with small boxed section labels and a centered header rule.",
    bestFor: ["Operations", "Administration", "Business"],
    atsScore: "high",
    recommendedFor: "Candidates who want clearly delineated sections",
    component: Classic04,
  },

  // ---------------- Modern Professional ----------------
  {
    id: "modern-01",
    name: "Modern Clean",
    category: "modern",
    description:
      "Left-aligned header, Helvetica type, understated blue accent, and column-style skills.",
    bestFor: ["Software Engineering", "Product", "Data"],
    atsScore: "high",
    recommendedFor: "Mid-level professional roles",
    component: Modern01,
  },
  {
    id: "modern-02",
    name: "Modern Rule",
    category: "modern",
    description:
      "A full-width rule under the header and each section heading for clean scanning anchors.",
    bestFor: ["IT", "Marketing", "Sales"],
    atsScore: "high",
    recommendedFor: "Professionals who want a structured, modern look",
    component: Modern02,
  },
  {
    id: "modern-03",
    name: "Modern Bold",
    category: "modern",
    description:
      "Bold uppercase section headings with a compact indigo accent and denser rhythm.",
    bestFor: ["Marketing", "Sales", "Product"],
    atsScore: "high",
    recommendedFor: "Professionals with a strong track record to highlight",
    component: Modern03,
  },
  {
    id: "modern-04",
    name: "Modern Centered",
    category: "modern",
    description:
      "Centered header with a teal accent and small boxed section labels.",
    bestFor: ["Product", "Design-adjacent roles", "Marketing"],
    atsScore: "high",
    recommendedFor: "Candidates who prefer a centered, symmetrical layout",
    component: Modern04,
  },

  // ---------------- Executive / Senior Professional ----------------
  {
    id: "executive-01",
    name: "Executive Classic",
    category: "executive",
    description:
      "Generous whitespace, centered header, and a deep navy accent for a premium, boardroom-ready look.",
    bestFor: ["Executives", "Directors", "Senior Consultants"],
    atsScore: "high",
    recommendedFor: "Senior leaders and executives",
    component: Executive01,
  },
  {
    id: "executive-02",
    name: "Executive Left",
    category: "executive",
    description:
      "Left-aligned header with Cambria serif type and generous spacing for a quieter, understated look.",
    bestFor: ["Directors", "Senior Managers"],
    atsScore: "high",
    recommendedFor: "Senior professionals moving into leadership roles",
    component: Executive02,
  },
  {
    id: "executive-03",
    name: "Executive Formal",
    category: "executive",
    description:
      "Times New Roman with boxed section labels for a formal, high-authority presentation.",
    bestFor: ["Board Roles", "Finance Leadership", "Legal Leadership"],
    atsScore: "high",
    recommendedFor: "Executives targeting formal institutions",
    component: Executive03,
  },
  {
    id: "executive-04",
    name: "Executive Warm",
    category: "executive",
    description:
      "A warmer neutral palette with letter-spaced uppercase headings for general senior-leadership roles.",
    bestFor: ["Consulting", "General Leadership"],
    atsScore: "high",
    recommendedFor: "Senior consultants and general management leaders",
    component: Executive04,
  },

  // ---------------- Technical / Minimal ----------------
  {
    id: "technical-01",
    name: "Technical Compact",
    category: "technical",
    description:
      "Dense, left-aligned layout with bold uppercase headings, tuned for strong skills and project sections.",
    bestFor: ["Software Engineering", "DevOps", "Data Engineering"],
    atsScore: "high",
    recommendedFor: "Engineers with substantial project/skills content",
    component: Technical01,
  },
  {
    id: "technical-02",
    name: "Technical Mono",
    category: "technical",
    description:
      "Standard sans-serif body copy with a monospace name and section headings for a subtle engineering feel.",
    bestFor: ["Software Engineering", "Cybersecurity"],
    atsScore: "high",
    recommendedFor: "Engineers and technical specialists",
    component: Technical02,
  },
  {
    id: "technical-03",
    name: "Technical Dense",
    category: "technical",
    description:
      "The tightest vertical rhythm in the library, for candidates with long project and skills lists.",
    bestFor: ["Data Engineering", "DevOps", "Security"],
    atsScore: "high",
    recommendedFor: "Senior technical candidates with extensive experience",
    component: Technical03,
  },
  {
    id: "technical-04",
    name: "Technical Structured",
    category: "technical",
    description:
      "A rule under the header and each heading for clear separation in long, project-heavy resumes.",
    bestFor: ["Data Science", "Research", "Software Engineering"],
    atsScore: "high",
    recommendedFor: "Technical professionals and researchers",
    component: Technical04,
  },
];

export function getTemplateById(id: string): TemplateMeta | undefined {
  return resumeTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(
  category: TemplateCategory
): TemplateMeta[] {
  return resumeTemplates.filter((t) => t.category === category);
}

export const TEMPLATE_CATEGORIES: {
  id: TemplateCategory;
  label: string;
}[] = [
  { id: "classic", label: "Classic / Corporate" },
  { id: "modern", label: "Modern Professional" },
  { id: "executive", label: "Executive / Senior Professional" },
  { id: "technical", label: "Technical / Minimal" },
];
