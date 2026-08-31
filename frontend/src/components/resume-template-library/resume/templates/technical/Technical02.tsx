import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-technical-02",
  headerAlign: "left",
  nameCase: "normal",
  sectionHeadingStyle: "tech-code-block",
  skillsLayout: "pill-chips",
  showHeaderRule: false,
  contactSeparator: "pipe",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Technical 02 - "Technical Mono"
 * Body copy stays in a standard sans-serif for readability; only the
 * name and section headings use a monospace font for a subtle
 * engineering feel. No layout differences from other templates.
 */
export default function Technical02({ resume }: TemplateProps) {
  return (
    <ResumeLayout
      resume={resume}
      theme={theme}
      sectionTitles={{ skills: "Technical Skills" }}
    />
  );
}
