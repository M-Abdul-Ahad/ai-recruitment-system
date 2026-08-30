import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-executive-02",
  headerAlign: "left",
  nameCase: "normal",
  sectionHeadingStyle: "underline",
  skillsLayout: "categorized-columns",
  showHeaderRule: false,
  contactSeparator: "pipe",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Executive 02 - "Executive Left"
 * Left-aligned header with Cambria serif type and generous spacing.
 * A quieter, understated executive presentation.
 */
export default function Executive02({ resume }: TemplateProps) {
  return (
    <ResumeLayout
      resume={resume}
      theme={theme}
      sectionTitles={{ experience: "Professional Experience" }}
    />
  );
}
