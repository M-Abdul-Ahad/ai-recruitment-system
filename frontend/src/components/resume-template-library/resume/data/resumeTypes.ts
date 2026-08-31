/**
 * resumeTypes.ts
 *
 * Canonical data model for the resume template library.
 * Every template (all 16) renders from this SAME shape.
 *
 * Rules enforced by convention across the whole library:
 *  - Every top-level section except `personal` is optional.
 *  - A template must not render a section heading if the corresponding
 *    array/field is empty, undefined, or null.
 *  - Templates are pure presentation: they must not mutate, truncate,
 *    reorder, or rewrite any of this content.
 */

export interface PersonalInfo {
  fullName: string;
  professionalTitle?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  /** Any additional single-line contact/link the AI generator wants to surface. */
  otherLinks?: { label: string; url: string }[];
}

export interface ExperienceEntry {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  details?: string[];
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface ProjectEntry {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
  bullets?: string[];
}

export interface CertificationEntry {
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
}

export interface AwardEntry {
  name: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface PublicationEntry {
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
  authors?: string;
}

export interface VolunteerEntry {
  organization: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets?: string[];
}

export interface LanguageEntry {
  language: string;
  proficiency?: string;
}

export interface MembershipEntry {
  organization: string;
  role?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  summary?: string;
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  skills?: SkillGroup[];
  projects?: ProjectEntry[];
  certifications?: CertificationEntry[];
  awards?: AwardEntry[];
  publications?: PublicationEntry[];
  volunteerExperience?: VolunteerEntry[];
  languages?: LanguageEntry[];
  memberships?: MembershipEntry[];
}

/**
 * Every resume section a template may render, in the canonical/default
 * ATS-preferred order. Individual templates may reorder this (e.g. an
 * "executive" template might place Awards before Projects) but should
 * stay close to this order for parsing predictability.
 */
export const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "awards",
  "publications",
  "volunteerExperience",
  "languages",
  "memberships",
] as const;

export type SectionKey = (typeof DEFAULT_SECTION_ORDER)[number];

/** Small helper: true when an array field has at least one entry with non-empty content. */
export function hasItems<T>(arr: T[] | undefined | null): arr is T[] {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some((item) => {
    if (!item) return false;
    if (typeof item === "string") return item.trim().length > 0;
    if (typeof item === "object") {
      return Object.values(item).some((val) => {
        if (typeof val === "string") return val.trim().length > 0;
        if (Array.isArray(val)) return val.some((v) => typeof v === "string" && v.trim().length > 0);
        return Boolean(val);
      });
    }
    return true;
  });
}

/** Fresh empty resume data default state. */
export const emptyResumeData: ResumeData = {
  personal: {
    fullName: "",
    professionalTitle: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  awards: [],
  volunteerExperience: [],
  languages: [],
  memberships: [],
};

