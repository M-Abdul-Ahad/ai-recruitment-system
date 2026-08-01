import React from "react";

/**
 * Status tag mapping aligned with DESIGN.md Section 4:
 * Applied -> Info (#3E7285)
 * Shortlisted -> Success (#4E7A33)
 * Interview / In review -> Warning (#C99A3E)
 * Rejected -> Danger (#B4453D)
 * Hired / Accepted -> Dark Anchor (#3D4127)
 */
const STATUS_MAP = {
  APPLIED: {
    label: "Applied",
    pillClass: "apl-pill-info",
    icon: "📩"
  },
  SHORTLISTED: {
    label: "Shortlisted",
    pillClass: "apl-pill-success",
    icon: "⭐"
  },
  INTERVIEW: {
    label: "Interview",
    pillClass: "apl-pill-warning",
    icon: "📅"
  },
  REJECTED: {
    label: "Rejected",
    pillClass: "apl-pill-danger",
    icon: "✕"
  },
  HIRED: {
    label: "Hired",
    pillClass: "apl-pill-accent",
    icon: "🎉"
  }
};

const FALLBACK = {
  label: "In Review",
  pillClass: "apl-pill-warning",
  icon: "⏳"
};

const ApplicationStatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] || FALLBACK;

  return (
    <span className={`apl-pill ${cfg.pillClass} font-bold text-xs`}>
      <span className="text-[11px]">{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  );
};

export default ApplicationStatusBadge;
