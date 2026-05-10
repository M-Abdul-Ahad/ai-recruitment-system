export default function JobCard({ job, onPublish, onClose, onViewApplicants, onEdit, onDelete }) {
  const isDraft = job.status === "DRAFT";
  const isActive = job.status === "ACTIVE";

  const getStatusBadge = () => {
    switch (job.status) {
      case "DRAFT":
        return <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">Draft</span>;
      case "ACTIVE":
        return <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">Active</span>;
      case "CLOSED":
        return <span className="rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-200">Closed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex min-h-[300px] flex-col rounded-[30px] border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0 pr-12">
          <h3 className="mb-2 text-2xl font-semibold tracking-tight text-white">{job.title}</h3>
          <p className="text-sm font-medium text-slate-400">
            {job.location || "Remote"} · {job.experience_required} yrs experience
          </p>
        </div>
        <div className="absolute right-6 top-6 flex flex-col items-end gap-2">
          {getStatusBadge()}
          <div className="mt-1 flex gap-2">
            {isDraft ? (
              <button onClick={() => onEdit(job)} className="text-slate-500 transition-colors hover:text-cyan-200" title="Edit Job">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
            ) : null}
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this job?")) onDelete(job.id);
              }}
              className="text-slate-500 transition-colors hover:text-rose-200"
              title="Delete Job"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <p className="mb-5 pr-2 text-sm leading-7 text-slate-400 line-clamp-4">{job.description}</p>

      <div className="mb-6 flex flex-wrap gap-2">
        {job.skills_data?.map((skill) => (
          <span key={skill.id} className="rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-xs font-medium text-cyan-100">
            {skill.name}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-3 border-t border-white/8 pt-4">
        {isDraft ? (
          <button onClick={() => onPublish(job.id)} className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110">
            Publish Job
          </button>
        ) : null}

        {isActive ? (
          <button onClick={() => onClose(job.id)} className="flex-1 rounded-xl border border-rose-300/20 bg-rose-400/10 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/16">
            Close Job
          </button>
        ) : null}

        <button
          onClick={() => onViewApplicants(job)}
          className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors ${isDraft
              ? "cursor-not-allowed border-white/8 bg-white/5 text-slate-500"
              : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/8"
            }`}
          disabled={isDraft}
        >
          View Applicants
        </button>
      </div>
    </div>
  );
}
