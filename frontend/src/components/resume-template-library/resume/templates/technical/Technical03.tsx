import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-technical-03",
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
 * Technical 03 - "Technical Dense"
 * The tightest vertical rhythm in the library while staying within
 * accessible font-size ranges, for candidates with long project and
 * skills lists (data engineers, DevOps, security).
 */
export default function Technical03({ resume }: TemplateProps) {
  return (
    <ResumeLayout
      resume={resume}
      theme={theme}
      sectionTitles={{ skills: "Technical Skills" }}
    />
  );
}
