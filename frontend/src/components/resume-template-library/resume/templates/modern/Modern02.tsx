import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-modern-02",
  headerAlign: "left",
  nameCase: "normal",
  sectionHeadingStyle: "gradient-rule",
  skillsLayout: "categorized-columns",
  showHeaderRule: true,
  contactSeparator: "dot",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Modern 02 - "Modern Rule"
 * A full-width rule under both the header and each section heading,
 * giving clear visual scanning anchors without any decoration.
 */
export default function Modern02({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
