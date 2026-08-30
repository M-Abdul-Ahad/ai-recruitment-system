import React from "react";
import { MembershipEntry } from "../data/resumeTypes";

interface MembershipsSectionProps {
  memberships: MembershipEntry[];
}

export default function MembershipsSection({
  memberships,
}: MembershipsSectionProps) {
  return (
    <ul className="memberships-list">
      {memberships.map((m, i) => {
        const dateRange =
          m.startDate && m.endDate
            ? `${m.startDate} - ${m.endDate}`
            : m.startDate || "";
        return (
          <li key={i} className="avoid-break">
            <span className="membership-org">{m.organization}</span>
            {m.role && <span className="membership-role"> - {m.role}</span>}
            {dateRange && <span className="membership-dates">, {dateRange}</span>}
          </li>
        );
      })}
    </ul>
  );
}
