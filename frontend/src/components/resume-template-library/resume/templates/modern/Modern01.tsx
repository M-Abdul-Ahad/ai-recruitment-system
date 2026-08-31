import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-modern-01",
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
 * Modern 01 - "Modern Clean"
 * Left-aligned header, Helvetica type, understated blue accent.
 * Suited to software, product, and data roles.
 */
export default function Modern01({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
