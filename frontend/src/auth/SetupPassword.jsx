import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function SetupPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [invitationData, setInvitationData] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      console.debug("[SetupPassword] No token param found in URL.");
      setError("No invitation token provided in the link.");
      setVerifying(false);
      return;
    }

    const verifyToken = async () => {
      setVerifying(true);
      setError("");
      console.debug("[SetupPassword] Verifying token...", token);
      try {
        const res = await api.get(`/companies/invitations/verify/?token=${encodeURIComponent(token)}`);
        console.debug("[SetupPassword] Token verification success:", res.data);
        setInvitationData(res.data);
        setTokenValid(true);
        if (res.data.email) {
          const suggestedUsername = res.data.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
          setUsername(suggestedUsername);
        }
      } catch (err) {
        console.error("[SetupPassword] Token verification error:", err);
        setTokenValid(false);
        setError(
          err.response?.data?.detail ||
            "This invitation link is invalid or has expired. Please request a new invitation."
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    console.debug("[SetupPassword] Submitting setup form for username:", username.trim());

    try {
      await api.post("/companies/invitations/accept/", {
        token,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        password,
      });

      console.debug("[SetupPassword] Account setup completed successfully.");
      setSuccess(true);
    } catch (err) {
      console.error("[SetupPassword] Account setup error:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.username?.[0] ||
          err.response?.data?.password?.[0] ||
          err.response?.data?.token?.[0] ||
          "Failed to set up recruiter account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#12140D] px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#3D4127] text-[#D4DE95] font-extrabold text-xl shadow-md">
            N
          </div>
          <h1 className="text-2xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
            Nominate AI
          </h1>
          <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
            Recruiter Account Activation
          </p>
        </div>

        {/* Card Body */}
        <div className="apl-card p-6 sm:p-8 space-y-6 bg-white dark:bg-[#1A1D13] border border-[#ECEEDF] dark:border-[#2A2E1E] rounded-2xl shadow-xl">
          {verifying ? (
            <div className="py-8 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-3 border-[#4E7A33] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-[#8A8F76]">
                Verifying your invitation link...
              </p>
            </div>
          ) : success ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mx-auto flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <h2 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">
                Account Created Successfully!
              </h2>
              <p className="text-xs text-[#8A8F76] leading-relaxed">
                Your recruiter account for <strong>{invitationData?.company_name}</strong> is ready. You can now log in to start using the platform.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full apl-btn apl-btn-primary py-2.5 text-xs font-bold shadow-md mt-4"
              >
                Go to Login Page &rarr;
              </button>
            </div>
          ) : !tokenValid ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center text-2xl font-bold">
                ✕
              </div>
              <h2 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">
                Invitation Invalid
              </h2>
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                {error}
              </p>
              <Link
                to="/login"
                className="inline-block w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#22241B] dark:text-[#EBF0DA] hover:opacity-90 transition-opacity mt-2"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#4E7A33]/10 border border-[#4E7A33]/20 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4E7A33]">
                  Company Invitation
                </p>
                <p className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  {invitationData?.company_name}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Invited Email (Readonly) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                  Invited Email Address
                </label>
                <input
                  type="email"
                  value={invitationData?.email || ""}
                  disabled
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-[#ECEEDF]/50 dark:bg-[#2A2E1E]/50 text-[#8A8F76] cursor-not-allowed"
                />
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-white dark:bg-[#1A1D13] text-[#22241B] dark:text-[#EBF0DA] focus:outline-none focus:ring-2 focus:ring-[#4E7A33]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-white dark:bg-[#1A1D13] text-[#22241B] dark:text-[#EBF0DA] focus:outline-none focus:ring-2 focus:ring-[#4E7A33]"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-white dark:bg-[#1A1D13] text-[#22241B] dark:text-[#EBF0DA] focus:outline-none focus:ring-2 focus:ring-[#4E7A33]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-white dark:bg-[#1A1D13] text-[#22241B] dark:text-[#EBF0DA] focus:outline-none focus:ring-2 focus:ring-[#4E7A33]"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-white dark:bg-[#1A1D13] text-[#22241B] dark:text-[#EBF0DA] focus:outline-none focus:ring-2 focus:ring-[#4E7A33]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full apl-btn apl-btn-primary py-2.5 text-xs font-bold shadow-md transition-all mt-2"
              >
                {loading ? "Activating Account..." : "Set Password & Complete Setup"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
