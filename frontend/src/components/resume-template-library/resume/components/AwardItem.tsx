import React from "react";
import { AwardEntry } from "../data/resumeTypes";

interface AwardItemProps {
  entry: AwardEntry;
}

export default function AwardItem({ entry }: AwardItemProps) {
  return (
    <div className="award-item avoid-break">
      <span className="award-name">{entry.name}</span>
      {entry.issuer && <span className="award-issuer"> - {entry.issuer}</span>}
      {entry.date && <span className="award-date">, {entry.date}</span>}
      {entry.description && (
        <p className="award-description">{entry.description}</p>
      )}
    </div>
  );
}
