import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-classic-01",
  headerAlign: "center",
  nameCase: "uppercase",
  sectionHeadingStyle: "underline",
  skillsLayout: "categorized-block",
  showHeaderRule: true,
  contactSeparator: "dot",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Classic 01 - "Classic Professional"
 * Extremely conservative, centered header, single navy accent.
 * Ideal for finance, consulting, accounting, and general corporate roles.
 */
export default function Classic01({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
