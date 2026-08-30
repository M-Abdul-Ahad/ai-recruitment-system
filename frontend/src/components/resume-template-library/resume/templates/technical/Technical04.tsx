import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-technical-04",
  headerAlign: "left",
  nameCase: "uppercase",
  sectionHeadingStyle: "rule-below",
  skillsLayout: "categorized-block",
  showHeaderRule: true,
  contactSeparator: "dot",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Technical 04 - "Technical Structured"
 * A rule under the header and each heading for clear section
 * separation in long, project-heavy resumes.
 */
export default function Technical04({ resume }: TemplateProps) {
  return (
    <ResumeLayout
      resume={resume}
      theme={theme}
      sectionTitles={{ skills: "Technical Skills" }}
    />
  );
}
