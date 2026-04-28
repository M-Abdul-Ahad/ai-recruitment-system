import React from 'react';

const JobCard = ({ job, onPublish, onClose, onViewApplicants, onEdit, onDelete }) => {
  const isDraft = job.status === "DRAFT";
  const isActive = job.status === "ACTIVE";
  const isClosed = job.status === "CLOSED";

  const getStatusBadge = () => {
    switch (job.status) {
      case "DRAFT":
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Draft</span>;
      case "ACTIVE":
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Active</span>;
      case "CLOSED":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Closed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 relative">
      <div className="flex justify-between items-start mb-4">
        <div className="pr-12">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
          <p className="text-sm text-gray-500 font-medium">{job.location || 'Remote'} • {job.experience_required} yrs experience</p>
        </div>
        <div className="flex flex-col items-end gap-2 absolute top-6 right-6">
          {getStatusBadge()}
          <div className="flex gap-2 mt-1">
            {isDraft && (
              <button onClick={() => onEdit(job)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Job">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
            )}
            <button onClick={() => { if(window.confirm('Are you sure you want to delete this job?')) onDelete(job.id) }} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete Job">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3 pr-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {job.skills_data?.map(skill => (
          <span key={skill.id} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-medium">
            {skill.name}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
        {isDraft && (
          <button 
            onClick={() => onPublish(job.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
          >
            Publish Job
          </button>
        )}
        
        {isActive && (
          <button 
            onClick={() => onClose(job.id)}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Close Job
          </button>
        )}

        <button 
          onClick={() => onViewApplicants(job)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${
            isDraft 
              ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
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
