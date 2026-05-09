import { NavLink } from "react-router-dom";

const baseNav = "rounded-2xl px-4 py-3 text-sm font-medium transition";

export default function PortalShell({
  user,
  onLogout,
  badge,
  title,
  subtitle,
  navItems = [],
  stats = [],
  actions,
  children,
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(122,92,255,0.24),_transparent_32%),linear-gradient(180deg,_#0b0a1d_0%,_#0a0a15_100%)] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 gap-6 px-4 py-4 md:px-6 md:py-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-8">
        <aside className="w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/5 px-5 py-6 shadow-[0_20px_80px_rgba(3,2,10,0.45)] backdrop-blur-xl lg:sticky lg:top-8 lg:flex lg:h-[calc(100vh-4rem)] lg:flex-col lg:px-6 lg:py-7">
          <div className="lg:flex lg:h-full lg:flex-col lg:overflow-y-auto lg:pr-1">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-200/70">
              RecuroAI
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Talent OS
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Structured hiring workflows, AI screening, and decision-ready dashboards.
            </p>
          </div>

          <div className="mt-8 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200 w-fit">
            Navigation
          </div>

          <nav className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${baseNav} min-h-[56px] ${isActive
                    ? "bg-gradient-to-r from-violet-500/25 to-cyan-400/20 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-slate-300 hover:bg-white/6 hover:text-white"}`
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{item.label}</span>
                  {item.tag ? (
                    <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-200">
                      {item.tag}
                    </span>
                  ) : null}
                </div>
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 rounded-[28px] border border-white/10 bg-black/20 p-5 lg:mt-8 lg:p-6">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Signed In</div>
            <div className="mt-5 truncate text-[1.05rem] font-semibold text-white">{user?.email || "Guest session"}</div>
            <div className="mt-3 text-sm capitalize text-slate-400">{user?.role || "Unknown role"}</div>
            <button
              onClick={onLogout}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/18"
            >
              Log out
            </button>
          </div>
          </div>
        </aside>

        <main className="min-w-0 w-full">
          <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,_rgba(31,25,66,0.92),_rgba(8,10,22,0.92))] px-6 py-7 shadow-[0_25px_100px_rgba(5,4,14,0.55)] md:px-8 md:py-8 lg:px-10 lg:py-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
              <div className="max-w-3xl">
                {badge ? (
                  <div className="mb-4 inline-flex rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-100">
                    {badge}
                  </div>
                ) : null}
                <h1 className="max-w-4xl text-3xl font-semibold leading-[1.05] tracking-tight text-white md:text-4xl xl:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  {subtitle}
                </p>
              </div>
              {actions ? <div className="shrink-0 self-start lg:self-center">{actions}</div> : null}
            </div>

            {stats.length ? (
              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:mt-10">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex min-h-[132px] flex-col justify-between rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-5 lg:px-6 lg:py-6"
                  >
                    <div className="text-3xl font-semibold tracking-tight text-white">{stat.value}</div>
                    <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <div className="mt-6 lg:mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
