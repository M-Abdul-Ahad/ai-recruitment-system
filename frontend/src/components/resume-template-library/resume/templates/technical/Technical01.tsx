import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-technical-01",
  headerAlign: "left",
  nameCase: "normal",
  sectionHeadingStyle: "bold-caps",
  skillsLayout: "pill-chips",
  showHeaderRule: false,
  contactSeparator: "dot",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Technical 01 - "Technical Compact"
 * Dense, left-aligned layout with bold uppercase headings, tuned to
 * fit strong skills and project sections without excess whitespace.
 */
export default function Technical01({ resume }: TemplateProps) {
  return (
    <ResumeLayout
      resume={resume}
      theme={theme}
      sectionTitles={{ skills: "Technical Skills" }}
    />
  );
}
