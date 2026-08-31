import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-vibrant-03",
  headerAlign: "left",
  nameCase: "normal",
  sectionHeadingStyle: "pill-tag",
  skillsLayout: "pill-chips",
  showHeaderRule: false,
  contactSeparator: "dot",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Creative 03 - "Sunset Violet & Amber"
 * Rich violet section headers with warm amber pill skill badges.
 */
export default function Vibrant03({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
