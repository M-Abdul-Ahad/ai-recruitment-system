import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-classic-04",
  headerAlign: "center",
  nameCase: "uppercase",
  sectionHeadingStyle: "boxed-label",
  skillsLayout: "categorized-block",
  showHeaderRule: true,
  contactSeparator: "space",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Classic 04 - "Corporate Structured"
 * Verdana body copy, small boxed section labels, centered header rule.
 * A slightly more structured, administrative-friendly variant.
 */
export default function Classic04({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
