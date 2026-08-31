import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-modern-04",
  headerAlign: "center",
  nameCase: "normal",
  sectionHeadingStyle: "pill-tag",
  skillsLayout: "pill-chips",
  showHeaderRule: true,
  contactSeparator: "dot",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Modern 04 - "Modern Centered"
 * Centered header with a teal accent and small boxed section labels.
 * A friendlier, slightly more designed feel while staying ATS-safe.
 */
export default function Modern04({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
