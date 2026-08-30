import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-executive-04",
  headerAlign: "left",
  nameCase: "normal",
  sectionHeadingStyle: "uppercase-spaced",
  skillsLayout: "categorized-columns",
  showHeaderRule: false,
  contactSeparator: "dot",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Executive 04 - "Executive Warm"
 * A warmer neutral palette with letter-spaced uppercase headings.
 * Suited to consulting and general senior-leadership roles.
 */
export default function Executive04({ resume }: TemplateProps) {
  return (
    <ResumeLayout
      resume={resume}
      theme={theme}
      sectionTitles={{ experience: "Professional Experience" }}
    />
  );
}
