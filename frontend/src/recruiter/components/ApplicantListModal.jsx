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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Applicants</h2>
            <p className="text-sm text-gray-500 mt-1">{job.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex space-x-4 bg-white p-4 rounded-xl">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applicants yet</h3>
              <p className="mt-1 text-sm text-gray-500">Wait for candidates to apply to this position.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map(app => (
                <div key={app.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Applicant ID: {app.applicant}</h4>
                    <p className="text-sm text-gray-500">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                    <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                      ${app.status === 'APPLIED' ? 'bg-blue-100 text-blue-700' : ''}
                      ${app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-700' : ''}
                      ${app.status === 'REJECTED' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {app.status !== 'SHORTLISTED' && (
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                        className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        Shortlist
                      </button>
                    )}
                    {app.status !== 'REJECTED' && (
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
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
