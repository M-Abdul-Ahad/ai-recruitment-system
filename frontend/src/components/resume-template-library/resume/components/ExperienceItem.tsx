import React from "react";
import { ExperienceEntry } from "../data/resumeTypes";
import { ThemeConfig } from "./themeTypes";

interface ExperienceItemProps {
  entry: ExperienceEntry;
  theme: ThemeConfig;
}

function formatDateRange(entry: ExperienceEntry): string {
  const end = entry.current ? "Present" : entry.endDate || "";
  return end ? `${entry.startDate} - ${end}` : entry.startDate;
}

/**
 * Renders one work-experience entry as plain, linear text:
 * Position / Company / Location / Dates, followed by bullet points.
 * `break-inside: avoid` keeps the title from being separated from its
 * bullets across a page break when printed.
 */
export default function ExperienceItem({ entry, theme }: ExperienceItemProps) {
  const dateRange = formatDateRange(entry);

  return (
    <article className="experience-item avoid-break">
      <div className={`item-heading-row date-${theme.dateStyle}`}>
        <div className="item-heading-main">
          <span className="item-position">{entry.position}</span>
          <span className="item-company"> - {entry.company}</span>
          {entry.location && (
            <span className="item-location">, {entry.location}</span>
          )}
        </div>
        <div className="item-dates">{dateRange}</div>
      </div>
      {entry.bullets && entry.bullets.length > 0 && (
        <ul className="item-bullets">
          {entry.bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
