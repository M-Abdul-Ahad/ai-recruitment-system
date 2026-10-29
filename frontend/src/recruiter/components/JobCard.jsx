import React from 'react';

/**
 * Professional, compact, and animated JobCard for Recruiter workspace.
 * Adheres strictly to the Mossy Hollow theme with micro-interactions.
 */
const JobCard = ({ job, onPublish, onClose, onViewApplicants, onEdit, onDelete, onBulkUpload }) => {
  const isDraft = job.status === "DRAFT";
  const isActive = job.status === "ACTIVE";
  const isClosed = job.status === "CLOSED";

  const getStatusBadge = () => {
    switch (job.status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BAC095]/20 text-[#52564A] dark:text-[#BAC095] border border-[#BAC095]/40 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A8F76]" />
            Draft
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4E7A33]/15 text-[#4E7A33] dark:text-[#78B159] border border-[#4E7A33]/30 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4E7A33] animate-pulse" />
            Active
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B4453D]/15 text-[#B4453D] dark:text-[#E07A72] border border-[#B4453D]/30 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B4453D]" />
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : n);
    if (min && max) return `PKR ${fmt(min)}–${fmt(max)}`;
    if (min) return `From PKR ${fmt(min)}`;
    return `Up to PKR ${fmt(max)}`;
  };

  const salaryStr = formatSalary(job.salary_min, job.salary_max);

  return (
    <div className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1D2015] border border-[#D3D6C4] dark:border-[#2A2E1E] shadow-sm hover:border-[#D4DE95] hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden">
      {/* Top accent highlight bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4DE95] via-[#636B2F] to-[#D4DE95] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Main Content */}
      <div>
        {/* Top Header Row: Title & Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <h3
              className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA] truncate group-hover:text-[#636B2F] dark:group-hover:text-[#D4DE95] transition-colors"
              title={job.title}
            >
              {job.title}
            </h3>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] font-medium flex items-center gap-1.5 mt-0.5 truncate">
              {job.company_name && (
                <>
                  <span className="font-semibold text-[#52564A] dark:text-[#BAC095]">{job.company_name}</span>
                  <span>•</span>
                </>
              )}
              {job.created_by_name && (
                <span className="text-[11px] text-[#8A8F76] truncate">
                  by {job.created_by_name}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>

        {/* Metadata Chips: Location, Experience, Salary */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485]">
            <svg className="w-3 h-3 text-[#8A8F76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location || 'Remote'}
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485]">
            <svg className="w-3 h-3 text-[#8A8F76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.experience_required} yrs
          </span>

          {salaryStr && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#4E7A33]/10 text-[#4E7A33] dark:text-[#78B159]">
              💵 {salaryStr}
            </span>
          )}

          {typeof job.applications_count === 'number' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#D4DE95]/25 text-[#3D4127] dark:text-[#D4DE95]">
              👥 {job.applications_count}
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-[#52564A] dark:text-[#9CA485] text-xs line-clamp-2 leading-relaxed mb-3">
          {job.description}
        </p>

        {/* Required Skills Chips */}
        {job.skills_data?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {job.skills_data.slice(0, 4).map(skill => (
              <span
                key={skill.id}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#D4DE95]/15 dark:bg-[#D4DE95]/10 text-[#3D4127] dark:text-[#D4DE95] border border-[#D4DE95]/30 hover:bg-[#D4DE95]/30 transition-colors"
              >
                {skill.name}
              </span>
            ))}
            {job.skills_data.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76]">
                +{job.skills_data.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Compact Interactive Footer Actions */}
      <div className="pt-3 border-t border-[#ECEEDF] dark:border-[#2A2E1E] flex items-center justify-between gap-2">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <button
            onClick={() => onViewApplicants(job)}
            disabled={isDraft}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 text-center truncate ${
              isDraft
                ? 'opacity-40 cursor-not-allowed bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#8A8F76]'
                : 'bg-[#D4DE95] text-[#3D4127] hover:bg-[#C6D17E] shadow-xs hover:shadow-sm'
            }`}
          >
            Applicants
          </button>

          {isDraft && (
            <button
              onClick={() => onPublish(job.id)}
              className="py-1.5 px-3 rounded-xl text-xs font-bold bg-[#3D4127] text-white hover:bg-[#2E311D] transition-all duration-200 active:scale-95 shadow-xs"
            >
              Publish
            </button>
          )}

          {isActive && (
            <button
              onClick={() => onClose(job.id)}
              className="py-1.5 px-2.5 rounded-xl text-xs font-bold bg-[#B4453D]/10 hover:bg-[#B4453D] text-[#B4453D] hover:text-white border border-[#B4453D]/30 transition-all duration-200 active:scale-95"
              title="Close Job"
            >
              Close
            </button>
          )}

          {!isDraft && onBulkUpload && (
            <button
              onClick={() => onBulkUpload(job)}
              className="p-1.5 rounded-xl text-[#3D4127] dark:text-[#D4DE95] bg-[#D4DE95]/15 hover:bg-[#D4DE95]/30 border border-[#D4DE95]/30 transition-all duration-200 active:scale-95"
              title="Bulk Import Resumes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
          )}
        </div>

        {/* Right Utility Buttons (Edit / Delete) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isDraft && (
            <button
              onClick={() => onEdit(job)}
              className="p-1.5 rounded-lg text-[#8A8F76] hover:text-[#3D4127] dark:hover:text-[#D4DE95] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition-all active:scale-90"
              title="Edit Job"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => { if (window.confirm('Are you sure you want to delete this job?')) onDelete(job.id); }}
            className="p-1.5 rounded-lg text-[#8A8F76] hover:text-[#B4453D] hover:bg-[#B4453D]/10 transition-all active:scale-90"
            title="Delete Job"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
