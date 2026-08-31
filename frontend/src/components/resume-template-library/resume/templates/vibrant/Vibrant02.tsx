import React from "react";
import ResumeLayout from "../../components/ResumeLayout";
import { ResumeData } from "../../data/resumeTypes";
import { ThemeConfig } from "../../components/themeTypes";
import "./styles.css";

const theme: ThemeConfig = {
  className: "tpl-vibrant-02",
  headerAlign: "left",
  nameCase: "normal",
  sectionHeadingStyle: "pill-tag",
  skillsLayout: "pill-chips",
  showHeaderRule: true,
  contactSeparator: "pipe",
  dateStyle: "inline",
};

interface TemplateProps {
  resume: ResumeData;
}

/**
 * Creative 02 - "Sapphire Luxe & Indigo"
 * Royal blue top border banner with pill-tag section headers and sapphire skill badges.
 */
export default function Vibrant02({ resume }: TemplateProps) {
  return <ResumeLayout resume={resume} theme={theme} />;
}
