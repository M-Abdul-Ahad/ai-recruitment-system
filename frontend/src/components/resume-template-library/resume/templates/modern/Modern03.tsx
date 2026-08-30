import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-modern-03",
  headerAlign: "left",
  nameCase: "uppercase",
  sectionHeadingStyle: "bold-caps",
  skillsLayout: "categorized-columns",
  showHeaderRule: false,
  contactSeparator: "pipe",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Modern 03 - "Modern Bold"
 * Bold, uppercase section headings with a compact indigo accent.
 * Slightly denser rhythm, suited to marketing and sales roles.
 */
export default function Modern03({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
