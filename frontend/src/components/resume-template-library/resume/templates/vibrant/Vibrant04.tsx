import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-vibrant-04",
  headerAlign: "left",
  nameCase: "uppercase",
  sectionHeadingStyle: "left-border-bar",
  skillsLayout: "pill-chips",
  showHeaderRule: false,
  contactSeparator: "pipe",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Creative 04 - "Rose Crimson & Slate"
 * Crimson rose section highlights with dark slate typography and pink chip tags.
 */
export default function Vibrant04({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
