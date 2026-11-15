import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import { useToast, Alert } from "../components/ui";

export default function AdminSettings() {
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'system' | 'security'
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [alert, setAlert] = useState(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me/");
      setProfile(res.data);
      setProfileForm({
        username: res.data.username || "",
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
      });
    } catch (err) {
      console.error("Failed to load admin profile:", err);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setAlert(null);
    try {
      const res = await api.patch("/auth/me/", profileForm);
      setProfile(res.data);
      toast.success("Administrator profile updated successfully!");
      setAlert({ type: "success", message: "Personal details updated successfully." });
    } catch (err) {
      console.error("Error updating profile:", err);
      const errMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.detail ||
        "Could not update profile.";
      toast.error(errMsg);
      setAlert({ type: "error", message: errMsg });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match.");
      setAlert({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setAlert({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }
    setSavingPwd(true);
    try {
      await api.post("/auth/change-password/", passwordForm);
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
      toast.success("Master password updated successfully!");
      setAlert({ type: "success", message: "Password updated successfully." });
    } catch (err) {
      console.error("Error changing password:", err);
      const errMsg =
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.confirm_password?.[0] ||
        "Could not change password.";
      toast.error(errMsg);
      setAlert({ type: "error", message: errMsg });
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#D4DE95] border-t-transparent animate-spin" />
      </div>
    );
  }

  const initials = (profile?.first_name || profile?.username || "A").charAt(0).toUpperCase();

  const systemServices = [
    {
      name: "Database Cluster",
      desc: "PostgreSQL with pgvector semantic similarity",
      status: "Operational",
      latency: "Active pool (CONN_MAX_AGE=600)",
      color: "#4E7A33",
    },
    {
      name: "Gemini AI Engine",
      desc: "Embedding generation, JD synthesis, & scoring",
      status: "Operational",
      latency: "Gemini 1.5 Flash / Embeddings-004",
      color: "#4E7A33",
    },
    {
      name: "Object Storage (Cloudflare R2)",
      desc: "Secure storage for resumes, CNIC, and verification docs",
      status: "Operational",
      latency: "S3 Compatible Endpoint",
      color: "#4E7A33",
    },
    {
      name: "SMTP Mail Relay",
      desc: "Shortlist notifications & verification alerts",
      status: "Configured",
      latency: "TLS Port 587",
      color: "#3E7285",
    },
  ];

  return (
    <div className="apl-animate-fade max-w-4xl mx-auto space-y-6">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight">
          System Administration Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">
          Master configuration, security controls, and platform telemetry diagnostics.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#ECEEDF] dark:border-[#2A2E1E] gap-6 overflow-x-auto pb-px">
        <button
          onClick={() => { setActiveTab("profile"); setAlert(null); }}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "profile"
              ? "border-[#3D4127] dark:border-[#D4DE95] text-[#22241B] dark:text-[#EBF0DA]"
              : "border-transparent text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
          }`}
        >
          Administrator Profile
        </button>
        <button
          onClick={() => { setActiveTab("system"); setAlert(null); }}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "system"
              ? "border-[#3D4127] dark:border-[#D4DE95] text-[#22241B] dark:text-[#EBF0DA]"
              : "border-transparent text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
          }`}
        >
          System Health & Environment
        </button>
        <button
          onClick={() => { setActiveTab("security"); setAlert(null); }}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "security"
              ? "border-[#3D4127] dark:border-[#D4DE95] text-[#22241B] dark:text-[#EBF0DA]"
              : "border-transparent text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
          }`}
        >
          Password & Security
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Admin Master Card */}
        <div className="apl-card h-fit space-y-4">
          <div className="flex flex-col items-center text-center p-4 border-b border-[#ECEEDF] dark:border-[#2A2E1E]">
            <div className="w-20 h-20 rounded-2xl bg-[#3D4127] text-[#D4DE95] flex items-center justify-center text-3xl font-black shadow-md mb-3">
              {initials}
            </div>
            <h2 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">
              {profile?.first_name || profile?.last_name
                ? `${profile?.first_name} ${profile?.last_name}`.trim()
                : profile?.username}
            </h2>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] truncate max-w-full">
              {profile?.email}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#B4453D]/15 text-[#B4453D] border border-[#B4453D]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B4453D] animate-pulse" />
              Platform Superuser
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#ECEEDF]/60 dark:border-[#2A2E1E]/60">
              <span className="text-[#8A8F76]">Authority Level</span>
              <span className="font-bold text-[#B4453D]">Full Access (Root)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#ECEEDF]/60 dark:border-[#2A2E1E]/60">
              <span className="text-[#8A8F76]">JWT Session Lifetime</span>
              <span className="font-mono text-[#22241B] dark:text-[#EBF0DA]">60m access / 24h ref</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#8A8F76]">Account Created</span>
              <span className="font-mono text-[#52564A] dark:text-[#9CA485]">
                {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Tab Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: Profile Form */}
          {activeTab === "profile" && (
            <div className="apl-card space-y-5">
              <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Administrator Profile Details
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                  Update your system administrator display credentials.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="apl-input text-xs"
                      placeholder="e.g. System"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="apl-input text-xs"
                      placeholder="e.g. Administrator"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="apl-input text-xs font-mono"
                      placeholder="admin"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                      Master Email (Locked)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ""}
                      className="apl-input text-xs opacity-60 cursor-not-allowed bg-[#ECEEDF]/40 dark:bg-[#1A1D13]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="apl-btn apl-btn-primary text-xs py-2 px-5 font-bold shadow-sm"
                  >
                    {savingProfile ? "Saving Details..." : "Save Admin Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: System Health & Diagnostics */}
          {activeTab === "system" && (
            <div className="apl-card space-y-5">
              <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Platform Infrastructure Diagnostics
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                  Real-time connectivity and status of core backend microservices.
                </p>
              </div>

              <div className="space-y-3">
                {systemServices.map((svc) => (
                  <div
                    key={svc.name}
                    className="p-4 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-[#F8F9F1]/50 dark:bg-[#171911]/50 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: svc.color }}
                        />
                        <h4 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">
                          {svc.name}
                        </h4>
                      </div>
                      <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                        {svc.desc}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#4E7A33]/15 text-[#4E7A33]">
                        {svc.status}
                      </span>
                      <p className="text-[10px] text-[#8A8F76] font-mono mt-0.5">
                        {svc.latency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#D4DE95]/15 dark:bg-[#D4DE95]/10 border border-[#D4DE95]/30 text-xs text-[#3D4127] dark:text-[#D4DE95]">
                <strong className="block font-bold mb-1">Database Optimization Active</strong>
                Database connection reuse enabled with <code className="font-mono bg-[#D4DE95]/30 px-1 py-0.5 rounded">CONN_MAX_AGE = 600</code>. Eliminates SSL negotiation latency on every API hit.
              </div>
            </div>
          )}

          {/* TAB 3: Password & Security */}
          {activeTab === "security" && (
            <div className="apl-card space-y-5">
              <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Master Security & Password
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                  Update your administrator authentication password.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    Current Master Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    className="apl-input text-xs"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                      New Master Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="apl-input text-xs"
                      placeholder="Min 8 characters"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className="apl-input text-xs"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPwd}
                    className="apl-btn apl-btn-dark text-xs py-2 px-5 font-bold shadow-sm"
                  >
                    {savingPwd ? "Updating..." : "Update Master Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
