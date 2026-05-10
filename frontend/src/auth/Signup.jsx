import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "applicant"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role.toLowerCase()
    };

    try {
      await signup(payload);
      navigate("/login");
    } catch (err) {
      setError("Signup failed. Please verify the fields and try again.");
    }
  };

  return (
    <AuthLayout
      eyebrow="Sign Up"
      title="Build your workspace"
      subtitle="Create an applicant or recruiter account and start using the AI hiring flow."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-cyan-300 underline-offset-4 transition duration-200 hover:text-cyan-200 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Account type</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition focus:border-violet-400/60"
          >
            <option value="applicant">Applicant</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Full name</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
            placeholder="Your name"
            required
          />
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
            placeholder="name@company.com"
            required
          />
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
            placeholder="Minimum 8 characters"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Confirm password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
            placeholder="Repeat your password"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(96,80,255,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(96,80,255,0.42)] hover:brightness-110 active:translate-y-0 active:scale-[0.995] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
        >
          Create {formData.role === "applicant" ? "Applicant" : "Recruiter"} Account
        </button>
        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-4 text-sm leading-6 text-slate-400">
          Recruiters can manage hiring pipelines and jobs. Applicants get access to job discovery,
          resume analysis, and application tracking.
        </div>
      </form>
    </AuthLayout>
  );
}
