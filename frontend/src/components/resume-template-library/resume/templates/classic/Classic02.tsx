import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-classic-02",
  headerAlign: "left",
  nameCase: "normal",
  sectionHeadingStyle: "rule-below",
  skillsLayout: "categorized-block",
  showHeaderRule: false,
  contactSeparator: "pipe",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Classic 02 - "Traditional Serif"
 * Left-aligned header, Georgia serif type, full-width rule under
 * headings. A traditional, slightly warmer take on the corporate resume.
 */
export default function Classic02({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
