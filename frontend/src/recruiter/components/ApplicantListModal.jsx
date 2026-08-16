import React, { useState, useEffect } from 'react';
import { getApplicants, updateApplicantStatus } from '../../api/jobs';

const ApplicantListModal = ({ isOpen, onClose, job }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && job) {
      fetchApplicants();
    }
  }, [isOpen, job]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await getApplicants(job.id);
      setApplicants(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch applicants.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await updateApplicantStatus(job.id, appId, newStatus);
      // Update local state
      setApplicants(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22241B]/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-[#222518] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#D3D6C4] dark:border-[#383D28] overflow-hidden apl-animate-scale">
        <div className="flex justify-between items-center p-6 border-b border-[#ECEEDF] dark:border-[#2A2E1E]">
          <div>
            <h2 className="text-2xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">Applicants</h2>
            <p className="text-xs font-semibold text-[#8A8F76] dark:text-[#9CA485] mt-1">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-[#F8F9F1] dark:bg-[#171911]">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex space-x-4 bg-white dark:bg-[#222518] p-5 rounded-xl border border-[#D3D6C4] dark:border-[#383D28]">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-[#B4453D] bg-[#B4453D]/10 p-4 rounded-xl border border-[#B4453D]/20 font-semibold">{error}</div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#D4DE95]/20 flex items-center justify-center mb-3">
                <svg className="h-8 w-8 text-[#3D4127] dark:text-[#D4DE95]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-2 text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">No applicants yet</h3>
              <p className="mt-1 text-xs text-[#8A8F76]">Wait for candidates to apply to this position.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map(app => (
                <div key={app.id} className="apl-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                  <div>
                    <h4 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">Applicant ID: {app.applicant}</h4>
                    <p className="text-xs text-[#8A8F76] mt-0.5">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                      ${app.status === 'APPLIED' ? 'bg-[#3E7285]/10 text-[#3E7285] border-[#3E7285]/20' : ''}
                      ${app.status === 'SHORTLISTED' ? 'bg-[#4E7A33]/15 text-[#4E7A33] border-[#4E7A33]/30' : ''}
                      ${app.status === 'REJECTED' ? 'bg-[#B4453D]/15 text-[#B4453D] border-[#B4453D]/30' : ''}
                    `}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {app.status !== 'SHORTLISTED' && (
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                        className="apl-btn apl-btn-primary py-2 px-4 text-xs"
                      >
                        Shortlist
                      </button>
                    )}
                    {app.status !== 'REJECTED' && (
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        className="apl-btn apl-btn-danger py-2 px-4 text-xs"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantListModal;
