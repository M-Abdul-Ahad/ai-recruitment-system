import React from "react";

/**
 * Applicant-facing job card for the jobs listing page.
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
    <div className="group flex min-h-[240px] flex-col rounded-[28px] border border-white/10 bg-[#111126] p-7 transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-[#151432]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-violet-200 transition-colors tracking-tight">
            {job.title}
          </h3>
          <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {job.company_name || "Company"}
          </p>
        </div>
        <span className="text-xs text-slate-500 font-medium flex-shrink-0 ml-3">
          {timeAgo(job.created_at)}
        </span>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.location && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/8 text-xs font-medium text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
        )}
        {job.experience_required != null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/8 text-xs font-medium text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.experience_required}+ yrs
          </span>
        )}
        {salary && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {salary}
          </span>
        )}
      </div>

      {/* Skills */}
      {job.skills_data?.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {job.skills_data.slice(0, 5).map((skill) => (
              <span
                key={skill.id}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-[11px] font-bold text-indigo-400 ring-1 ring-indigo-500/20"
              >
                {skill.name}
              </span>
            ))}
            {job.skills_data.length > 5 && (
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/8 text-[11px] font-medium text-slate-500">
                +{job.skills_data.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8">
        <button
          onClick={() => onViewDetails(job)}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-300 bg-white/[0.04] border border-white/10 hover:bg-white/10 rounded-xl transition"
        >
          View Details
        </button>
        {isApplied ? (
          <button
            disabled
            className="flex-1 px-4 py-2.5 text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl cursor-default flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Applied
          </button>
        ) : (
          <button
            onClick={() => onApply(job)}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl shadow-sm shadow-violet-500/20 transition-all hover:brightness-110 flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
