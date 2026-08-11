import React from "react";

/**
 * Applicant-facing job card for the jobs listing page.
 * Strictly adheres to DESIGN.md Mossy Hollow specs.
 *
 * @param {{
 *   job: object,
 *   isApplied: boolean,
 *   onViewDetails: (job) => void,
 *   onApply: (job) => void
 * }} props
 */
const JobCard = ({ job, isApplied, onViewDetails, onApply }) => {
  /* ── salary display helper ── */
  const formatSalary = (min, max) => {
    const fmt = (n) => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
      return n?.toLocaleString();
    };
    if (min && max) return `$${fmt(min)} – $${fmt(max)}`;
    if (min) return `From $${fmt(min)}`;
    if (max) return `Up to $${fmt(max)}`;
    return null;
  };

  /* ── posted-ago helper ── */
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <div className="apl-card apl-card-hover group relative flex flex-col justify-between overflow-hidden">
      {/* Top accent highlight bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4DE95] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] truncate group-hover:text-[#636B2F] dark:group-hover:text-[#D4DE95] transition-colors">
              {job.title}
            </h3>
            <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-1 flex items-center gap-1.5 font-medium">
              <span>🏢</span>
              <span>{job.company_name || "Company"}</span>
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#8A8F76] flex-shrink-0">
            {timeAgo(job.created_at)}
          </span>
        </div>

        {/* Metadata Chips */}
        <div className="flex flex-wrap gap-1.5">
          {job.location && (
            <span className="apl-pill bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] text-[11px]">
              📍 {job.location}
            </span>
          )}
          {job.experience_required != null && (
            <span className="apl-pill bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] text-[11px]">
              ⏳ {job.experience_required}+ yrs
            </span>
          )}
          {salary && (
            <span className="apl-pill apl-pill-success text-[11px]">
              💵 {salary}
            </span>
          )}
        </div>

        {/* Required Skills */}
        {job.skills_data?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {job.skills_data.slice(0, 4).map((skill) => (
              <span
                key={skill.id}
                className="px-2 py-0.5 rounded-md bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95] text-[11px] font-semibold border border-[#D4DE95]/40"
              >
                {skill.name}
              </span>
            ))}
            {job.skills_data.length > 4 && (
              <span className="px-2 py-0.5 rounded-md bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76] text-[11px]">
                +{job.skills_data.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
        <button
          onClick={() => onViewDetails(job)}
          className="apl-btn apl-btn-secondary text-xs flex-1"
        >
          Details
        </button>
        {isApplied ? (
          <button
            disabled
            className="apl-btn apl-pill-success text-xs flex-1 flex justify-center"
          >
            ✓ Applied
          </button>
        ) : (
          <button
            onClick={() => onApply(job)}
            className="apl-btn apl-btn-primary text-xs flex-1 shadow-sm"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
