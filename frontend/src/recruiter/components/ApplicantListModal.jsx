import React, { useEffect, useState } from "react";
import { getApplicants, updateApplicantStatus } from "../../api/jobs";

export default function ApplicantListModal({ isOpen, onClose, job }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && job) fetchApplicants();
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
      setApplicants((prev) => prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app)));
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm transition-opacity">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-[30px] border border-white/10 bg-[#0f1021] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Applicants</h2>
            <p className="mt-1 text-sm text-slate-400">{job.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 transition-colors hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#0b0c1a] p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex space-x-4 rounded-xl bg-white/[0.04] p-4 animate-pulse">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 w-3/4 rounded bg-white/10"></div>
                    <div className="h-4 rounded bg-white/10"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center text-rose-200">{error}</div>
          ) : applicants.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-sm font-medium text-white">No applicants yet</h3>
              <p className="mt-1 text-sm text-slate-400">Wait for candidates to apply to this position.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((app) => (
                <div key={app.id} className="flex flex-col justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.04] p-5 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{app.applicant_name || `Applicant ID: ${app.applicant}`}</h4>
                    <p className="text-sm text-slate-400">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${
                        app.status === "APPLIED" ? "bg-cyan-300/10 text-cyan-200" : ""
                      } ${app.status === "SHORTLISTED" ? "bg-emerald-400/10 text-emerald-200" : ""} ${
                        app.status === "REJECTED" ? "bg-rose-400/10 text-rose-200" : ""
                      }`}>
                        {app.status}
                      </span>
                      {app.resume_file ? (
                        <a
                          href={app.resume_file.startsWith("http") ? app.resume_file : `http://localhost:8000${app.resume_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-violet-400/10 px-2.5 py-1 text-xs font-medium text-violet-200 transition hover:bg-violet-400/20"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Resume
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600 italic">No resume</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {app.status !== "SHORTLISTED" ? (
                      <button onClick={() => handleUpdateStatus(app.id, "SHORTLISTED")} className="rounded-lg bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/16">
                        Shortlist
                      </button>
                    ) : null}
                    {app.status !== "REJECTED" ? (
                      <button onClick={() => handleUpdateStatus(app.id, "REJECTED")} className="rounded-lg bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-400/16">
                        Reject
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
