import React from "react";
import { CertificationEntry } from "../data/resumeTypes";

interface CertificationItemProps {
  entry: CertificationEntry;
}

export default function CertificationItem({ entry }: CertificationItemProps) {
  return (
    <div className="certification-item avoid-break">
      <span className="cert-name">{entry.name}</span>
      {entry.issuer && <span className="cert-issuer"> - {entry.issuer}</span>}
      {entry.date && <span className="cert-date">, {entry.date}</span>}
      {entry.url && (
        <span className="cert-url">
          {" "}
          -{" "}
          <a href={entry.url.startsWith("http") ? entry.url : `https://${entry.url}`}>
            {entry.url}
          </a>
        </span>
      )}
    </div>
  );
}
