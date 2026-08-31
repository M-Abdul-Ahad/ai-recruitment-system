import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-vibrant-01",
  headerAlign: "left",
  nameCase: "normal",
  sectionHeadingStyle: "left-border-bar",
  skillsLayout: "pill-chips",
  showHeaderRule: false,
  contactSeparator: "dot",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Creative 01 - "Emerald Studio & Mint"
 * Vibrant emerald green accent theme with mint pill skill chips and solid left accent bar headings.
 */
export default function Vibrant01({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
