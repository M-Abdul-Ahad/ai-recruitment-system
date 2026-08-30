import React from "react";
import { ResumeData, hasItems } from "../data/resumeTypes";
import { ThemeConfig } from "./themeTypes";
import ResumeHeader from "./ResumeHeader";
import Section from "./Section";
import ExperienceItem from "./ExperienceItem";
import EducationItem from "./EducationItem";
import SkillsSection from "./SkillsSection";
import ProjectItem from "./ProjectItem";
import CertificationItem from "./CertificationItem";
import AwardItem from "./AwardItem";
import PublicationItem from "./PublicationItem";
import VolunteerItem from "./VolunteerItem";
import LanguagesSection from "./LanguagesSection";
import MembershipsSection from "./MembershipsSection";

export interface ResumeLayoutProps {
  resume: ResumeData;
  theme: ThemeConfig;
  /** Optional per-template section title overrides, e.g. { experience: "Professional Experience" }. */
  sectionTitles?: Partial<Record<string, string>>;
}

const DEFAULT_TITLES: Record<string, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  awards: "Awards",
  publications: "Publications",
  volunteerExperience: "Volunteer Experience",
  languages: "Languages",
  memberships: "Professional Memberships",
};

/**
 * ResumeLayout is the single structural renderer used by ALL 16
 * templates. It always produces the same linear, single-column,
 * logical reading order:
 *
 *   Name -> Title -> Contact -> Summary -> Experience -> Education ->
 *   Skills -> Projects -> Certifications -> Awards -> Publications ->
 *   Volunteer Experience -> Languages -> Memberships
 *
 * Each template only supplies a `theme` (CSS scoping class + a few
 * presentational flags) and, optionally, custom section titles. This
 * guarantees every template is ATS-safe by construction: there is
 * exactly one DOM structure, and only CSS varies between templates.
 *
 * Empty sections are never rendered (no heading with empty body).
 */
export default function ResumeLayout({
  resume,
  theme,
  sectionTitles,
}: ResumeLayoutProps) {
  const titles = {
    ...DEFAULT_TITLES,
    ...sectionTitles,
  } as Record<string, string>;

  return (
    <div className={`resume-root ${theme.className} header-align-${theme.headerAlign}`}>
      <ResumeHeader personal={resume.personal} theme={theme} />

      <Section
        title={titles.summary}
        headingStyle={theme.sectionHeadingStyle}
        show={!!resume.summary}
      >
        <p className="summary-text">{resume.summary}</p>
      </Section>

      <Section
        title={titles.experience}
        headingStyle={theme.sectionHeadingStyle}
        show={hasItems(resume.experience)}
      >
        {hasItems(resume.experience) &&
          resume.experience.map((entry, i) => (
            <ExperienceItem key={i} entry={entry} theme={theme} />
          ))}
      </Section>

      <Section
        title={titles.education}
        headingStyle={theme.sectionHeadingStyle}
        show={hasItems(resume.education)}
      >
        {hasItems(resume.education) &&
          resume.education.map((entry, i) => (
            <EducationItem key={i} entry={entry} theme={theme} />
          ))}
      </Section>

      <Section
        title={titles.skills}
        headingStyle={theme.sectionHeadingStyle}
        show={hasItems(resume.skills)}
      >
        {hasItems(resume.skills) && (
          <SkillsSection groups={resume.skills} theme={theme} />
        )}
      </Section>

      <Section
        title={titles.projects}
        headingStyle={theme.sectionHeadingStyle}
        show={hasItems(resume.projects)}
      >
        {hasItems(resume.projects) &&
          resume.projects.map((entry, i) => <ProjectItem key={i} entry={entry} />)}
      </Section>

      <Section
        title={titles.certifications}
        headingStyle={theme.sectionHeadingStyle}
        show={hasItems(resume.certifications)}
      >
        {hasItems(resume.certifications) &&
          resume.certifications.map((entry, i) => (
            <CertificationItem key={i} entry={entry} />
          ))}
      </Section>

      <Section
        title={titles.awards}
        headingStyle={theme.sectionHeadingStyle}
        show={hasItems(resume.awards)}
      >
        {hasItems(resume.awards) &&
          resume.awards.map((entry, i) => <AwardItem key={i} entry={entry} />)}
      </Section>

      <Section
        title={titles.publications}
        headingStyle={theme.sectionHeadingStyle}
        show={hasItems(resume.publications)}
      >
        {hasItems(resume.publications) &&
          resume.publications.map((entry, i) => (
            <PublicationItem key={i} entry={entry} />
          ))}
      </Section>

      <Section
        title={titles.volunteerExperience}
        headingStyle={theme.sectionHeadingStyle}
        show={hasItems(resume.volunteerExperience)}
      >
        {hasItems(resume.volunteerExperience) &&
          resume.volunteerExperience.map((entry, i) => (
            <VolunteerItem key={i} entry={entry} theme={theme} />
          ))}
      </Section>

      <Section
        title={titles.languages}
        headingStyle={theme.sectionHeadingStyle}
        show={hasItems(resume.languages)}
      >
        {hasItems(resume.languages) && (
          <LanguagesSection languages={resume.languages} />
        )}
      </Section>

      <Section
        title={titles.memberships}
        headingStyle={theme.sectionHeadingStyle}
        show={hasItems(resume.memberships)}
      >
        {hasItems(resume.memberships) && (
          <MembershipsSection memberships={resume.memberships} />
        )}
      </Section>
    </div>
  );
}
