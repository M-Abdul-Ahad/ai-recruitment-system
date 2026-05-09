import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import PortalShell from "../components/PortalShell";
import { getMyCompany } from "../api/companies";
import { closeJob, deleteJob, getJobs, publishJob } from "../api/jobs";
import ApplicantListModal from "./components/ApplicantListModal";
import JobCard from "./components/JobCard";

const recruiterNav = [
  { label: "Overview", to: "/recruiter", end: true },
  { label: "Company", to: "/recruiter/company", end: true },
  { label: "Jobs Library", to: "/recruiter/jobs", end: true },
  { label: "Create Job", to: "/recruiter/jobs/create", end: true, tag: "AI" },
];

export default function Jobs() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [hasCompany, setHasCompany] = useState(true);

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

  const handlePublish = async (jobId) => {
    try {
      const response = await publishJob(jobId);
      setJobs((current) => current.map((job) => (job.id === jobId ? response.data : job)));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to publish job.");
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      const response = await closeJob(jobId);
      setJobs((current) => current.map((job) => (job.id === jobId ? response.data : job)));
    } catch (err) {
      console.error(err);
      alert("Failed to close job.");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs((current) => current.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete job.");
    }
  };

  const stats = useMemo(
    () => [
      { value: String(jobs.length).padStart(2, "0"), label: "Roles in your library" },
      { value: String(jobs.filter((job) => job.status === "ACTIVE").length).padStart(2, "0"), label: "Published openings" },
      { value: String(jobs.filter((job) => job.status === "DRAFT").length).padStart(2, "0"), label: "Draft roles" },
      { value: String(jobs.filter((job) => job.status === "CLOSED").length).padStart(2, "0"), label: "Closed requisitions" },
    ],
    [jobs]
  );

  return (
    <PortalShell
      user={user}
      onLogout={handleLogout}
      badge="Jobs library"
      title="Review every role, draft, and hiring action in one recruiter workspace."
      subtitle="Create jobs, publish openings, edit drafts, and review applicants without leaving the recruiter control panel."
      navItems={recruiterNav}
      stats={stats}
      actions={
        <button
          onClick={() => navigate(hasCompany ? "/recruiter/jobs/create" : "/recruiter/company")}
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
                Create your company profile before posting jobs so every opening is linked to the correct recruiter account.
              </p>
            </div>
            <button
              onClick={() => navigate("/recruiter/company")}
              className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Open Company Setup
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="min-h-[280px] rounded-[30px] border border-white/10 bg-white/[0.04] p-6 animate-pulse">
              <div className="mb-4 h-6 w-3/4 rounded bg-white/10"></div>
              <div className="mb-6 h-4 w-1/2 rounded bg-white/8"></div>
              <div className="space-y-3">
                <div className="h-4 rounded bg-white/8"></div>
                <div className="h-4 w-5/6 rounded bg-white/8"></div>
                <div className="h-4 w-2/3 rounded bg-white/8"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[30px] border border-rose-400/20 bg-rose-500/10 p-6 text-center text-rose-200">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="mx-auto flex min-h-[320px] w-full max-w-[760px] flex-col items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.04] p-10 text-center lg:p-12">
          <h3 className="text-2xl font-semibold text-white">No jobs posted yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
            Start with a first role brief, then publish it when you are ready to open the pipeline to applicants.
          </p>
          <button
            onClick={() => navigate(hasCompany ? "/recruiter/jobs/create" : "/recruiter/company")}
            className="mt-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
          >
            {hasCompany ? "Create your first job" : "Set up company first"}
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
              onEdit={(selectedJob) => navigate("/recruiter/jobs/create", { state: { jobToEdit: selectedJob } })}
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
    </PortalShell>
  );
}
