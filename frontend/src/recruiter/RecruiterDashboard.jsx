import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";
import { closeJob, deleteJob, getJobs, publishJob } from "../api/jobs";
import { getMyCompany } from "../api/companies";
import ApplicantListModal from "./components/ApplicantListModal";
import JobCard from "./components/JobCard";
import JobFormModal from "./components/JobFormModal";

const recruiterNav = [
  { label: "Overview", to: "/recruiter", end: true },
  { label: "Company", to: "/recruiter/company", end: true },
  { label: "Jobs Library", to: "/recruiter/jobs", end: true },
  { label: "Create Job", to: "/recruiter/jobs/create", end: true, tag: "AI" },
];

export default function RecruiterDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCompany, setHasCompany] = useState(true);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchCompanyStatus();
  }, []);

  const fetchCompanyStatus = async () => {
    try {
      await getMyCompany();
      setHasCompany(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setHasCompany(false);
      }
    }
  };

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
      setJobs(jobs.map((job) => (job.id === savedJob.id ? savedJob : job)));
    } else {
      setJobs([savedJob, ...jobs]);
    }
  };

  const handlePublish = async (jobId) => {
    try {
      const response = await publishJob(jobId);
      setJobs(jobs.map((job) => (job.id === jobId ? response.data : job)));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to publish job.");
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      const response = await closeJob(jobId);
      setJobs(jobs.map((job) => (job.id === jobId ? response.data : job)));
    } catch (err) {
      console.error(err);
      alert("Failed to close job.");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete job.");
    }
  };

  return (
    <PortalShell
      user={user}
      onLogout={handleLogout}
      badge="Recruiter workspace"
      title="Manage your hiring pipeline from one structured desktop dashboard."
      subtitle="Create jobs, publish openings, review applicants, and keep your recruiting operation moving with less manual coordination."
      navItems={recruiterNav}
      stats={[
        { value: String(jobs.length).padStart(2, "0"), label: "Jobs in your workspace" },
        { value: String(jobs.filter((job) => job.status === "ACTIVE").length).padStart(2, "0"), label: "Active openings" },
        { value: String(jobs.filter((job) => job.status === "DRAFT").length).padStart(2, "0"), label: "Draft roles" },
        { value: "24h", label: "Target turnaround for first review" },
      ]}
      actions={
        <button
          onClick={() => {
            if (!hasCompany) {
              navigate("/recruiter/company");
              return;
            }
            navigate("/recruiter/jobs/create");
          }}
          className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
        >
          {hasCompany ? "Create New Job" : "Set Up Company"}
        </button>
      }
    >
      {!hasCompany ? (
        <div className="mb-6 rounded-[30px] border border-white/10 bg-white/[0.04] p-6 lg:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-lg font-semibold text-white">Company setup required</div>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                Your recruiter account is not linked to a company yet. Create your company profile first, then you can post jobs immediately.
              </p>
            </div>
            <button
              onClick={() => navigate("/recruiter/company")}
              className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Create Company
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="min-h-[250px] rounded-[30px] border border-white/10 bg-white/[0.04] p-6 animate-pulse">
              <div className="mb-4 h-6 w-3/4 rounded bg-white/10"></div>
              <div className="mb-6 h-4 w-1/2 rounded bg-white/10"></div>
              <div className="space-y-2">
                <div className="h-4 rounded bg-white/8"></div>
                <div className="h-4 w-5/6 rounded bg-white/8"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[30px] border border-rose-400/20 bg-rose-500/10 p-6 text-center text-rose-200">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="mx-auto flex min-h-[300px] w-full max-w-[760px] flex-col items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.04] p-10 text-center lg:p-12">
          <h3 className="text-2xl font-semibold text-white">No jobs posted yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
            Create your first job posting to start building a cleaner recruiting pipeline.
          </p>
          <button
            onClick={() => {
              navigate(hasCompany ? "/recruiter/jobs/create" : "/recruiter/company");
            }}
            className="mt-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
          >
            Create your first job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPublish={handlePublish}
              onClose={handleCloseJob}
              onViewApplicants={setSelectedJobForApplicants}
              onEdit={(selectedJob) => {
                setJobToEdit(selectedJob);
                setIsJobModalOpen(true);
              }}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      )}

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
    </PortalShell>
  );
}
