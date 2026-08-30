import React from "react";
import { LanguageEntry } from "../data/resumeTypes";

interface LanguagesSectionProps {
  languages: LanguageEntry[];
}

export default function LanguagesSection({ languages }: LanguagesSectionProps) {
  return (
    <p className="languages-line">
      {languages
        .map((l) => (l.proficiency ? `${l.language} (${l.proficiency})` : l.language))
        .join(", ")}
    </p>
  );
}
