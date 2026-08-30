import React from "react";
import { SkillGroup } from "../data/resumeTypes";
import { ThemeConfig } from "./themeTypes";

interface SkillsSectionProps {
  groups: SkillGroup[];
  theme: ThemeConfig;
}

/**
 * Renders skills as plain text lines - never as progress bars, ratings,
 * or charts, per ATS requirements. Layout (categorized block,
 * categorized columns, or a flat comma list) is controlled by the
 * theme, not by structural differences that would affect parsing.
 */
export default function SkillsSection({ groups, theme }: SkillsSectionProps) {
  if (theme.skillsLayout === "flat-list") {
    const allSkills = groups.flatMap((g) => g.skills);
    return <p className="skills-flat">{allSkills.join(", ")}</p>;
  }

  return (
    <div className={`skills-${theme.skillsLayout}`}>
      {groups.map((group, i) => (
        <p key={i} className="skills-group-line">
          <span className="skills-category">{group.category}: </span>
          <span className="skills-list">{group.skills.join(", ")}</span>
        </p>
      ))}
    </div>
  );
}
