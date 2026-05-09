import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const nextUser = await login({ email, password });
      if (nextUser.role === "applicant") navigate("/applicant");
      else if (nextUser.role === "recruiter") navigate("/recruiter");
      else if (nextUser.role === "admin") navigate("/admin");
      else navigate("/unauthorized");
    } catch (err) {
      setError("Login failed. Check your credentials and try again.");
    }
  };

  return (
    <AuthLayout
      eyebrow="Login"
      title="Welcome back"
      subtitle="Access your recruitment workspace, candidate pipelines, and AI tools."
      footer={
        <>
          New to the platform?{" "}
          <Link to="/signup" className="font-medium text-cyan-300 underline-offset-4 transition duration-200 hover:text-cyan-200 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
            Create an account
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
          <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
            placeholder="you@company.com"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60"
            placeholder="Enter your password"
            required
          />
        </div>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(96,80,255,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(96,80,255,0.42)] hover:brightness-110 active:translate-y-0 active:scale-[0.995] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
        >
          Log in
        </button>
        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-4 text-sm leading-6 text-slate-400">
          Use the credentials of your applicant, recruiter, or admin account. After login,
          you will be routed to the correct desktop dashboard automatically.
        </div>
      </form>
    </AuthLayout>
  );
}
