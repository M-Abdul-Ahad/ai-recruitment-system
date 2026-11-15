import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import { useToast, Alert } from "../components/ui";

const RECRUITER_PREF_KEY = "recruiter_workflow_prefs";

export default function RecruiterSettings() {
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'templates' | 'security'
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [alert, setAlert] = useState(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
  });

  // Workflow / Template Preferences
  const [workflowPrefs, setWorkflowPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(RECRUITER_PREF_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse recruiter prefs:", e);
    }
    return {
      recruiterTitle: "Talent Acquisition Specialist",
      defaultTopN: 10,
      emailSubject: "Invitation to Interview — NOMINATE AI Screening",
      emailBody: "Congratulations! You have been shortlisted for our open requisition based on your AI match evaluation. We would love to schedule a follow-up conversation.",
      notifyOnNewApplication: true,
      dailyPipelineDigest: true,
    };
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
      console.error("Failed to load recruiter profile:", err);
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
      toast.success("Recruiter profile updated successfully!");
      setAlert({ type: "success", message: "Personal profile details updated." });
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

  const handlePrefsSubmit = (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      localStorage.setItem(RECRUITER_PREF_KEY, JSON.stringify(workflowPrefs));
      toast.success("Recruitment templates & preferences saved!");
      setAlert({ type: "success", message: "Email templates and pipeline preferences updated." });
    } catch (err) {
      console.error("Error saving workflow prefs:", err);
      toast.error("Failed to save workflow settings.");
    } finally {
      setSavingPrefs(false);
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
      toast.success("Password updated successfully!");
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

  const initials = (profile?.first_name || profile?.username || "R").charAt(0).toUpperCase();

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
          Recruiter Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">
          Configure your recruiter profile, shortlist email templates, and hiring defaults.
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
          Recruiter Profile
        </button>
        <button
          onClick={() => { setActiveTab("templates"); setAlert(null); }}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "templates"
              ? "border-[#3D4127] dark:border-[#D4DE95] text-[#22241B] dark:text-[#EBF0DA]"
              : "border-transparent text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
          }`}
        >
          Shortlist Templates & Automation
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
        {/* Left Column: Recruiter Badge Card */}
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
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95]">
              Recruiter / HR Staff
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#ECEEDF]/60 dark:border-[#2A2E1E]/60">
              <span className="text-[#8A8F76]">Organization</span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA] truncate max-w-[130px]">
                {profile?.company_name || "Company Assigned"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#ECEEDF]/60 dark:border-[#2A2E1E]/60">
              <span className="text-[#8A8F76]">Job Scope</span>
              <span className="font-bold text-[#4E7A33]">Personal Requisitions Only</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#8A8F76]">Member Since</span>
              <span className="font-mono text-[#52564A] dark:text-[#9CA485]">
                {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Tab Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: Profile */}
          {activeTab === "profile" && (
            <div className="apl-card space-y-5">
              <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Recruiter Details
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                  Update your display name and hiring partner profile details.
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
                      placeholder="e.g. Sarah"
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
                      placeholder="e.g. Jenkins"
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
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                      Official Work Email (Locked)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ""}
                      className="apl-input text-xs opacity-60 cursor-not-allowed bg-[#ECEEDF]/40 dark:bg-[#1A1D13]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    Recruiter Title / Role
                  </label>
                  <input
                    type="text"
                    value={workflowPrefs.recruiterTitle}
                    onChange={(e) => setWorkflowPrefs({ ...workflowPrefs, recruiterTitle: e.target.value })}
                    className="apl-input text-xs"
                    placeholder="e.g. Lead Technical Recruiter"
                  />
                  <p className="text-[11px] text-[#8A8F76]">Displayed on interview communications sent to candidates</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="apl-btn apl-btn-primary text-xs py-2 px-5 font-bold shadow-sm"
                  >
                    {savingProfile ? "Saving Profile..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Shortlist Templates & Automation */}
          {activeTab === "templates" && (
            <div className="apl-card space-y-5">
              <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Interview & Shortlist Email Templates
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                  Configure default email contents used when notifying shortlisted candidates.
                </p>
              </div>

              <form onSubmit={handlePrefsSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    Default Shortlist Email Subject
                  </label>
                  <input
                    type="text"
                    value={workflowPrefs.emailSubject}
                    onChange={(e) => setWorkflowPrefs({ ...workflowPrefs, emailSubject: e.target.value })}
                    className="apl-input text-xs"
                    placeholder="Subject line"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    Default Shortlist Message Body
                  </label>
                  <textarea
                    rows={4}
                    value={workflowPrefs.emailBody}
                    onChange={(e) => setWorkflowPrefs({ ...workflowPrefs, emailBody: e.target.value })}
                    className="apl-input text-xs leading-relaxed"
                    placeholder="Message to candidate..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    Default Shortlist Target Count (N)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={workflowPrefs.defaultTopN}
                    onChange={(e) => setWorkflowPrefs({ ...workflowPrefs, defaultTopN: parseInt(e.target.value, 10) || 10 })}
                    className="apl-input text-xs font-mono w-32"
                  />
                  <p className="text-[11px] text-[#8A8F76]">Default number of top candidates selected in AI ranking sessions</p>
                </div>

                <div className="pt-2 border-t border-[#ECEEDF] dark:border-[#2A2E1E] space-y-3">
                  <h4 className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA] uppercase tracking-wider">
                    Pipeline Alerts
                  </h4>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workflowPrefs.notifyOnNewApplication}
                      onChange={(e) => setWorkflowPrefs({ ...workflowPrefs, notifyOnNewApplication: e.target.checked })}
                      className="rounded text-[#3D4127] focus:ring-[#D4DE95] w-4 h-4"
                    />
                    <span className="text-xs text-[#52564A] dark:text-[#9CA485]">
                      Notify me via email immediately when a candidate applies to my job postings
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workflowPrefs.dailyPipelineDigest}
                      onChange={(e) => setWorkflowPrefs({ ...workflowPrefs, dailyPipelineDigest: e.target.checked })}
                      className="rounded text-[#3D4127] focus:ring-[#D4DE95] w-4 h-4"
                    />
                    <span className="text-xs text-[#52564A] dark:text-[#9CA485]">
                      Receive daily recruitment summary digest
                    </span>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPrefs}
                    className="apl-btn apl-btn-primary text-xs py-2 px-5 font-bold shadow-sm"
                  >
                    {savingPrefs ? "Saving Templates..." : "Save Preferences"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Password & Security */}
          {activeTab === "security" && (
            <div className="apl-card space-y-5">
              <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Account Security & Password
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                  Update your recruiter account password.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    Current Password
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
                      New Password
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
                    {savingPwd ? "Updating..." : "Update Password"}
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
