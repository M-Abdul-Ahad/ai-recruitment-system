import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { getJobs, publishJob, closeJob, deleteJob } from "../api/jobs";
import JobCard from "./components/JobCard";
import ApplicantListModal from "./components/ApplicantListModal";

const Jobs = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    navigate('/recruiter/jobs/create', { state: { jobToEdit: job } });
  };

  const handleCreateJob = () => {
    navigate('/recruiter/jobs/create');
  };

  const handleViewApplicants = (job) => {
    setSelectedJobForApplicants(job);
  };

  return (
    <div className="apl-animate-fade space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
            Manage Jobs
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">
            View, edit, publish, and track applicants for your job requisitions
          </p>
        </div>
        <button
          onClick={handleCreateJob}
          className="apl-btn apl-btn-primary shadow-md hover:shadow-lg"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          Create New Job
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="apl-card animate-pulse space-y-4">
              <div className="h-6 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded"></div>
                <div className="h-4 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-[#ECEEDF] dark:bg-[#2A2E1E] rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="apl-card text-center text-[#B4453D] bg-[#B4453D]/10 border border-[#B4453D]/20 font-semibold p-6">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="apl-card p-12 text-center max-w-lg mx-auto my-8">
          <div className="mx-auto w-20 h-20 bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95] rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <h3 className="text-xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] mb-2">No jobs posted yet</h3>
          <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mb-6">
            Get started by creating your first job posting to attract top talent.
          </p>
          <button
            onClick={handleCreateJob}
            className="apl-btn apl-btn-primary px-6"
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


      <ApplicantListModal
        isOpen={!!selectedJobForApplicants}
        onClose={() => setSelectedJobForApplicants(null)}
        job={selectedJobForApplicants}
      />
    </div>
  );
};

export default Jobs;