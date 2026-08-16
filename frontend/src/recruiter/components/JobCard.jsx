import React from 'react';

const JobCard = ({ job, onPublish, onClose, onViewApplicants, onEdit, onDelete }) => {
  const isDraft = job.status === "DRAFT";
  const isActive = job.status === "ACTIVE";
  const isClosed = job.status === "CLOSED";

  const getStatusBadge = () => {
    switch (job.status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#BAC095]/20 text-[#52564A] border border-[#BAC095]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A8F76]" />
            Draft
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#4E7A33]/15 text-[#4E7A33] border border-[#4E7A33]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4E7A33] animate-pulse" />
            Active
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#B4453D]/15 text-[#B4453D] border border-[#B4453D]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B4453D]" />
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="apl-card apl-card-hover flex flex-col justify-between relative transition-all duration-300">
      <div>
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="pr-10">
            <h3 className="text-xl font-bold text-[#22241B] dark:text-[#EBF0DA] mb-1 leading-snug">
              {job.title}
            </h3>
            <p className="text-xs font-semibold text-[#8A8F76] dark:text-[#9CA485]">
              {job.location || 'Remote'} • {job.experience_required} yrs experience
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 absolute top-6 right-6">
            {getStatusBadge()}
            <div className="flex gap-2 mt-1">
              {isDraft && (
                <button
                  onClick={() => onEdit(job)}
                  className="p-1.5 rounded-lg text-[#8A8F76] hover:text-[#3D4127] dark:hover:text-[#D4DE95] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition-colors"
                  title="Edit Job"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
              )}
              <button
                onClick={() => { if(window.confirm('Are you sure you want to delete this job?')) onDelete(job.id) }}
                className="p-1.5 rounded-lg text-[#8A8F76] hover:text-[#B4453D] hover:bg-[#B4453D]/10 transition-colors"
                title="Delete Job"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <p className="text-[#52564A] dark:text-[#9CA485] text-sm mb-4 line-clamp-3 leading-relaxed">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {job.skills_data?.map(skill => (
            <span
              key={skill.id}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D4DE95]/20 dark:bg-[#D4DE95]/10 text-[#3D4127] dark:text-[#D4DE95] border border-[#D4DE95]/30"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
        {isDraft && (
          <button 
            onClick={() => onPublish(job.id)}
            className="flex-1 apl-btn apl-btn-primary"
          >
            Publish Job
          </button>
        )}
        
        {isActive && (
          <button 
            onClick={() => onClose(job.id)}
            className="flex-1 apl-btn apl-btn-danger"
          >
            Close Job
          </button>
        )}

        <button 
          onClick={() => onViewApplicants(job)}
          className={`flex-1 apl-btn ${
            isDraft 
              ? 'opacity-50 cursor-not-allowed bg-[#ECEEDF] text-[#8A8F76] border border-[#D3D6C4]' 
              : 'apl-btn-secondary'
          }`}
          disabled={isDraft}
        >
          View Applicants
        </button>
      </div>
    </div>
  );
};

export default JobCard;
