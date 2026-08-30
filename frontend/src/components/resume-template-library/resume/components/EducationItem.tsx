import React from "react";
import { EducationEntry } from "../data/resumeTypes";
import { ThemeConfig } from "./themeTypes";

interface EducationItemProps {
  entry: EducationEntry;
  theme: ThemeConfig;
}

function formatDateRange(entry: EducationEntry): string {
  if (entry.startDate && entry.endDate) {
    return `${entry.startDate} - ${entry.endDate}`;
  }
  return entry.endDate || entry.startDate || "";
}

export default function EducationItem({ entry, theme }: EducationItemProps) {
  const dateRange = formatDateRange(entry);
  const degreeLine = entry.field
    ? `${entry.degree}, ${entry.field}`
    : entry.degree;

  return (
    <article className="education-item avoid-break">
      <div className={`item-heading-row date-${theme.dateStyle}`}>
        <div className="item-heading-main">
          <span className="item-institution">{entry.institution}</span>
          <span className="item-degree"> - {degreeLine}</span>
          {entry.location && (
            <span className="item-location">, {entry.location}</span>
          )}
        </div>
        {dateRange && <div className="item-dates">{dateRange}</div>}
      </div>
      {entry.gpa && <p className="item-gpa">GPA: {entry.gpa}</p>}
      {entry.details && entry.details.length > 0 && (
        <ul className="item-bullets">
          {entry.details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
