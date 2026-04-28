import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getJobs, publishJob, closeJob, deleteJob } from "../api/jobs";
import JobCard from "./components/JobCard";
import JobFormModal from "./components/JobFormModal";
import ApplicantListModal from "./components/ApplicantListModal";

const RecruiterDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getJobs();
      setJobs(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleJobSaved = (savedJob, isEdit) => {
    if (isEdit) {
      setJobs(jobs.map(j => j.id === savedJob.id ? savedJob : j));
    } else {
      setJobs([savedJob, ...jobs]);
    }
  };

  const handlePublish = async (jobId) => {
    try {
      const response = await publishJob(jobId);
      setJobs(jobs.map(j => j.id === jobId ? response.data : j));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to publish job.");
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      const response = await closeJob(jobId);
      setJobs(jobs.map(j => j.id === jobId ? response.data : j));
    } catch (err) {
      console.error(err);
      alert("Failed to close job.");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete job.");
    }
  };

  const handleEditJob = (job) => {
    setJobToEdit(job);
    setIsJobModalOpen(true);
  };

  const handleCreateJob = () => {
    setJobToEdit(null);
    setIsJobModalOpen(true);
  };

  const handleViewApplicants = (job) => {
    setSelectedJobForApplicants(job);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight mr-6">AI Recruiter</span>

              <div className="hidden md:flex items-center gap-6">
                <Link to="/recruiter/company" className="text-gray-500 font-medium hover:text-blue-600 transition-colors">
                  Company
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
            <p className="text-gray-500 mt-1">Manage your job postings and applicants</p>
          </div>
          <button
            onClick={handleCreateJob}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm shadow-blue-200 transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Create New Job
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-600">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">Get started by creating your first job posting to attract top talent.</p>
            <button
              onClick={handleCreateJob}
              className="px-6 py-2 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-colors"
            >
              Create your first job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onPublish={handlePublish}
                onClose={handleCloseJob}
                onViewApplicants={handleViewApplicants}
                onEdit={handleEditJob}
                onDelete={handleDeleteJob}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <JobFormModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onJobSaved={handleJobSaved}
        jobToEdit={jobToEdit}
      />

      <ApplicantListModal
        isOpen={!!selectedJobForApplicants}
        onClose={() => setSelectedJobForApplicants(null)}
        job={selectedJobForApplicants}
      />

      {/* Global styles for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default RecruiterDashboard;