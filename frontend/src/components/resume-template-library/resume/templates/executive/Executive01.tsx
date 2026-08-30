import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-executive-01",
  headerAlign: "center",
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
 * Executive 01 - "Executive Classic"
 * Generous whitespace, centered header, deep navy accent. Reads as a
 * premium, boardroom-appropriate resume while remaining single-column
 * and fully ATS-parseable.
 */
export default function Executive01({ resume }: TemplateProps) {
  return (
    <ResumeLayout
      resume={resume}
      theme={theme}
      sectionTitles={{ experience: "Professional Experience" }}
    />
  );
}
