import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import PortalShell from "../components/PortalShell";

const applicantNav = [
    { label: "Overview", to: "/applicant", end: true },
    { label: "Resume Analysis", to: "/applicant/resume", end: true },
    { label: "Resume Builder", to: "/applicant/builder", end: true },
    { label: "Jobs", to: "/applicant/jobs", end: true },
    { label: "Applications", to: "/applicant/applications", end: true },
];

const ResumeBuilder = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        role: "",
        skills: "",
    });
    const [generated, setGenerated] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleGenerate = () => {
        setGenerated(
            `Professional summary for ${formData.role || "your target role"}: results-driven candidate with strengths in ${formData.skills || "communication, ownership, and execution"}.`
        );
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <PortalShell
            user={user}
            onLogout={handleLogout}
            badge="Resume builder"
            title="Draft stronger resume copy for the role you want next."
            subtitle="Use a cleaner desktop writing flow to shape profile summaries, skill framing, and role-specific positioning."
            titleClass="text-2xl md:text-3xl xl:text-4xl"
            navItems={applicantNav}
            stats={[
                { value: "04", label: "Draft sections" },
                { value: "18", label: "Suggested keywords" },
                { value: "02", label: "Role variants" },
                { value: "1.6x", label: "Faster first draft creation" },
            ]}
        >
            <div className="grid grid-cols-[0.9fr_1.1fr] gap-8">
                <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8">
                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Target role</label>
                            <input
                                type="text"
                                name="role"
                                placeholder="Senior Frontend Developer"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Skills and highlights</label>
                            <textarea
                                name="skills"
                                placeholder="React, dashboards, API integrations, stakeholder communication..."
                                value={formData.skills}
                                onChange={handleChange}
                                rows="8"
                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                        >
                            Generate draft
                        </button>
                    </div>
                </section>

                <section className="rounded-[32px] border border-white/10 bg-[#111126] p-8">
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">
                        Draft output
                    </div>
                    <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 p-6 text-sm leading-7 text-slate-300">
                        {generated || "Your generated resume summary will appear here once you provide a target role and skills."}
                    </div>
                </section>
            </div>
        </PortalShell>
    );
};

export default ResumeBuilder;
