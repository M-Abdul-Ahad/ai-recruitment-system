import React from "react";
import { PublicationEntry } from "../data/resumeTypes";

interface PublicationItemProps {
  entry: PublicationEntry;
}

export default function PublicationItem({ entry }: PublicationItemProps) {
  return (
    <div className="publication-item avoid-break">
      <span className="pub-title">{entry.title}</span>
      {entry.authors && <span className="pub-authors"> - {entry.authors}</span>}
      {entry.publisher && (
        <span className="pub-publisher">, {entry.publisher}</span>
      )}
      {entry.date && <span className="pub-date">, {entry.date}</span>}
      {entry.url && (
        <span className="pub-url">
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
