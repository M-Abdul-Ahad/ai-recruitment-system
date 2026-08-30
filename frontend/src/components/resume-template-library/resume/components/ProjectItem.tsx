import React from "react";
import { ProjectEntry } from "../data/resumeTypes";

interface ProjectItemProps {
  entry: ProjectEntry;
}

export default function ProjectItem({ entry }: ProjectItemProps) {
  const dateRange =
    entry.startDate && entry.endDate
      ? `${entry.startDate} - ${entry.endDate}`
      : entry.endDate || entry.startDate || "";

  return (
    <article className="project-item avoid-break">
      <div className="item-heading-row">
        <div className="item-heading-main">
          <span className="item-project-name">{entry.name}</span>
          {entry.url && (
            <span className="item-project-url">
              {" "}
              -{" "}
              <a href={entry.url.startsWith("http") ? entry.url : `https://${entry.url}`}>
                {entry.url}
              </a>
            </span>
          )}
        </div>
        {dateRange && <div className="item-dates">{dateRange}</div>}
      </div>
      {entry.description && (
        <p className="item-description">{entry.description}</p>
      )}
      {entry.technologies && entry.technologies.length > 0 && (
        <p className="item-technologies">
          <span className="tech-label">Technologies: </span>
          {entry.technologies.join(", ")}
        </p>
      )}
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
