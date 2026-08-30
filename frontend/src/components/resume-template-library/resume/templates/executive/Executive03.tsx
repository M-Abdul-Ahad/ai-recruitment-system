import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-executive-03",
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
 * Executive 03 - "Executive Formal"
 * Times New Roman with small boxed section labels for strong scanning
 * anchors. A formal register for boards, law, and finance leadership.
 */
export default function Executive03({ resume }: TemplateProps) {
  return (
    <ResumeLayout
      resume={resume}
      theme={theme}
      sectionTitles={{ experience: "Professional Experience" }}
    />
  );
}
