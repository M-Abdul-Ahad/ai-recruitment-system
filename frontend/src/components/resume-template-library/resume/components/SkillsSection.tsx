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

  if (theme.skillsLayout === "pill-chips") {
    return (
      <div className="skills-pill-chips">
        {groups.map((group, i) => (
          <div key={i} className="skills-group-row">
            <span className="skills-category-label">{group.category}: </span>
            <div className="skills-chips-wrapper">
              {group.skills.map((skill, idx) => (
                <span key={idx} className="skill-pill-chip">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
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
