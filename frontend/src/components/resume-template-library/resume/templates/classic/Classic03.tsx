import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-classic-03",
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
 * Classic 03 - "Traditional Formal"
 * Times New Roman body copy with letter-spaced uppercase headings.
 * A formal register suited to legal, accounting, and government-adjacent roles.
 */
export default function Classic03({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
