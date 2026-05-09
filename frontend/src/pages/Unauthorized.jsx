import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(122,92,255,0.16),_transparent_30%),linear-gradient(180deg,_#090814_0%,_#0b0a18_100%)] px-8">
      <div className="w-full max-w-2xl rounded-[34px] border border-white/10 bg-white/[0.04] p-12 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="mx-auto inline-flex rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-200">
          Access denied
        </div>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white">
          You do not have permission to view this page.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
          The route you opened is protected by role-based access. Log in with the correct
          account or return to the main platform.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/" className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/8">
            Back to home
          </Link>
          <Link to="/login" className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
            Log in again
          </Link>
        </div>
      </div>
    </div>
  );
}
