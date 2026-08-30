import React from "react";
import { VolunteerEntry } from "../data/resumeTypes";
import { ThemeConfig } from "./themeTypes";

interface VolunteerItemProps {
  entry: VolunteerEntry;
  theme: ThemeConfig;
}

export default function VolunteerItem({ entry, theme }: VolunteerItemProps) {
  const dateRange =
    entry.startDate && entry.endDate
      ? `${entry.startDate} - ${entry.endDate}`
      : entry.endDate || entry.startDate || "";

  return (
    <article className="volunteer-item avoid-break">
      <div className={`item-heading-row date-${theme.dateStyle}`}>
        <div className="item-heading-main">
          <span className="item-role">{entry.role}</span>
          <span className="item-org"> - {entry.organization}</span>
          {entry.location && (
            <span className="item-location">, {entry.location}</span>
          )}
        </div>
        {dateRange && <div className="item-dates">{dateRange}</div>}
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
