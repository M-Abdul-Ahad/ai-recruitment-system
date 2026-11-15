import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import { useToast, Alert } from "../components/ui";

const CAREER_PREF_KEY = "applicant_career_prefs";

export default function ApplicantSettings() {
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'preferences' | 'security'
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
    cnic_number: "",
  });

  // Career Preferences
  const [careerPrefs, setCareerPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(CAREER_PREF_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse career prefs:", e);
    }
    return {
      desiredRole: "Software Engineer",
      workMode: "remote",
      minSalary: "150000",
      emailAlerts: true,
      shortlistNotification: true,
      bio: "",
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
        cnic_number: res.data.cnic_number || "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
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
      toast.success("Profile information updated successfully!");
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

  const handleCareerPrefsSubmit = (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      localStorage.setItem(CAREER_PREF_KEY, JSON.stringify(careerPrefs));
      toast.success("Career preferences saved successfully!");
      setAlert({ type: "success", message: "Career alert preferences updated." });
    } catch (err) {
      console.error("Error saving preferences:", err);
      toast.error("Failed to save career preferences.");
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

  const initials = (profile?.first_name || profile?.username || "A").charAt(0).toUpperCase();

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
          Applicant Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">
          Manage your candidate profile, career preferences, and account security.
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
          Profile & Identity
        </button>
        <button
          onClick={() => { setActiveTab("preferences"); setAlert(null); }}
          className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "preferences"
              ? "border-[#3D4127] dark:border-[#D4DE95] text-[#22241B] dark:text-[#EBF0DA]"
              : "border-transparent text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
          }`}
        >
          Career Preferences & Alerts
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
        {/* Left Column: Candidate Card */}
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
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#4E7A33]/15 text-[#4E7A33]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4E7A33] animate-pulse" />
              Active Job Seeker
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#ECEEDF]/60 dark:border-[#2A2E1E]/60">
              <span className="text-[#8A8F76]">Account Type</span>
              <span className="font-bold text-[#3D4127] dark:text-[#D4DE95] capitalize">Applicant</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#ECEEDF]/60 dark:border-[#2A2E1E]/60">
              <span className="text-[#8A8F76]">Desired Role</span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA] truncate max-w-[120px]">
                {careerPrefs.desiredRole || "Not set"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#ECEEDF]/60 dark:border-[#2A2E1E]/60">
              <span className="text-[#8A8F76]">Work Mode</span>
              <span className="font-bold text-[#22241B] dark:text-[#EBF0DA] capitalize">
                {careerPrefs.workMode}
              </span>
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
          {/* TAB 1: Profile & Identity */}
          {activeTab === "profile" && (
            <div className="apl-card space-y-5">
              <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Personal & Identity Information
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                  This information appears on applications submitted to employers.
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
                      placeholder="e.g. John"
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
                      placeholder="e.g. Doe"
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
                      Email Address (Locked)
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
                    CNIC / National Identity Document Number
                  </label>
                  <input
                    type="text"
                    value={profileForm.cnic_number}
                    onChange={(e) => setProfileForm({ ...profileForm, cnic_number: e.target.value })}
                    className="apl-input text-xs font-mono"
                    placeholder="e.g. 42101-1234567-1"
                  />
                  <p className="text-[11px] text-[#8A8F76]">Used for employer candidate verification</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="apl-btn apl-btn-primary text-xs py-2 px-5 font-bold shadow-sm"
                  >
                    {savingProfile ? "Saving Details..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Career Preferences & Alerts */}
          {activeTab === "preferences" && (
            <div className="apl-card space-y-5">
              <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
                <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  Career Aspirations & Job Alert Settings
                </h3>
                <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                  Configure your target positions and recruitment notification channels.
                </p>
              </div>

              <form onSubmit={handleCareerPrefsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                      Target Job Title / Role
                    </label>
                    <input
                      type="text"
                      value={careerPrefs.desiredRole}
                      onChange={(e) => setCareerPrefs({ ...careerPrefs, desiredRole: e.target.value })}
                      className="apl-input text-xs"
                      placeholder="e.g. Full Stack Developer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                      Preferred Work Mode
                    </label>
                    <select
                      value={careerPrefs.workMode}
                      onChange={(e) => setCareerPrefs({ ...careerPrefs, workMode: e.target.value })}
                      className="apl-input text-xs"
                    >
                      <option value="remote">Remote Only</option>
                      <option value="hybrid">Hybrid (Office + Remote)</option>
                      <option value="onsite">On-site / Office</option>
                      <option value="any">Flexible / Any</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    Minimum Expected Monthly Salary (PKR)
                  </label>
                  <input
                    type="number"
                    value={careerPrefs.minSalary}
                    onChange={(e) => setCareerPrefs({ ...careerPrefs, minSalary: e.target.value })}
                    className="apl-input text-xs font-mono"
                    placeholder="e.g. 180000"
                  />
                </div>

                <div className="pt-2 border-t border-[#ECEEDF] dark:border-[#2A2E1E] space-y-3">
                  <h4 className="text-xs font-bold text-[#22241B] dark:text-[#EBF0DA] uppercase tracking-wider">
                    Notification Channels
                  </h4>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={careerPrefs.shortlistNotification}
                      onChange={(e) => setCareerPrefs({ ...careerPrefs, shortlistNotification: e.target.checked })}
                      className="rounded text-[#3D4127] focus:ring-[#D4DE95] w-4 h-4"
                    />
                    <span className="text-xs text-[#52564A] dark:text-[#9CA485]">
                      Receive instant email notifications when shortlisted or invited to interview
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={careerPrefs.emailAlerts}
                      onChange={(e) => setCareerPrefs({ ...careerPrefs, emailAlerts: e.target.checked })}
                      className="rounded text-[#3D4127] focus:ring-[#D4DE95] w-4 h-4"
                    />
                    <span className="text-xs text-[#52564A] dark:text-[#9CA485]">
                      Send me weekly recommended jobs matching my resume skills
                    </span>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPrefs}
                    className="apl-btn apl-btn-primary text-xs py-2 px-5 font-bold shadow-sm"
                  >
                    {savingPrefs ? "Saving..." : "Save Preferences"}
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
                  Update your authentication credentials to keep your candidate account secure.
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
