import React from "react";

/**
 * Applicant-facing job card for the jobs listing page.
 * Professional, compact, and polished adhering to Mossy Hollow design.
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
    if (min && max) return `PKR ${fmt(min)} – ${fmt(max)}`;
    if (min) return `From PKR ${fmt(min)}`;
    if (max) return `Up to PKR ${fmt(max)}`;
    return null;
  };

  /* ── posted-ago helper ── */
  const timeAgo = (dateStr) => {
    if (!dateStr) return "Recently";
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
    <div className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1D2015] border border-[#D3D6C4] dark:border-[#2A2E1E] shadow-sm hover:border-[#D4DE95] hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden">
      {/* Top accent highlight bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4DE95] via-[#636B2F] to-[#D4DE95] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] truncate group-hover:text-[#636B2F] dark:group-hover:text-[#D4DE95] transition-colors"
              title={job.title}
            >
              {job.title}
            </h3>
            <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-0.5 flex items-center gap-1.5 font-medium truncate">
              <span className="w-4 h-4 rounded-full bg-[#D4DE95]/30 text-[#3D4127] flex items-center justify-center text-[10px] flex-shrink-0">
                🏢
              </span>
              <span className="truncate">{job.company_name || "Company"}</span>
            </p>
          </div>
          <span className="text-[10px] font-semibold text-[#8A8F76] bg-[#ECEEDF] dark:bg-[#2A2E1E] px-2 py-0.5 rounded-full flex-shrink-0">
            {timeAgo(job.created_at)}
          </span>
        </div>

        {/* Metadata Chips: Location, Experience, Salary */}
        <div className="flex flex-wrap items-center gap-1.5">
          {job.location && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485]">
              📍 {job.location}
            </span>
          )}
          {job.experience_required != null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485]">
              ⏳ {job.experience_required}+ yrs
            </span>
          )}
          {salary && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#4E7A33]/15 text-[#4E7A33] dark:text-[#78B159]">
              💵 {salary}
            </span>
          )}
        </div>

        {/* Required Skills */}
        {job.skills_data?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {job.skills_data.slice(0, 4).map((skill) => (
              <span
                key={skill.id}
                className="px-2 py-0.5 rounded-md bg-[#D4DE95]/15 dark:bg-[#D4DE95]/10 text-[#3D4127] dark:text-[#D4DE95] text-[10px] font-semibold border border-[#D4DE95]/30 hover:bg-[#D4DE95]/25 transition-colors"
              >
                {skill.name}
              </span>
            ))}
            {job.skills_data.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76] text-[10px] font-medium">
                +{job.skills_data.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
        <button
          onClick={() => onViewDetails(job)}
          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-[#52564A] dark:text-[#BAC095] bg-[#ECEEDF] dark:bg-[#2A2E1E] hover:bg-[#D3D6C4] dark:hover:bg-[#343826] transition-all duration-200 active:scale-95 text-center"
        >
          Details
        </button>
        {isApplied ? (
          <button
            disabled
            className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-[#4E7A33]/15 text-[#4E7A33] dark:text-[#78B159] border border-[#4E7A33]/30 flex items-center justify-center gap-1 cursor-default"
          >
            ✓ Applied
          </button>
        ) : (
          <button
            onClick={() => onApply(job)}
            className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-[#D4DE95] text-[#3D4127] hover:bg-[#C6D17E] shadow-xs hover:shadow-sm transition-all duration-200 active:scale-95 text-center"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
