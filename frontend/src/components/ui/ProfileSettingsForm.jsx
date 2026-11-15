import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useToast, Alert } from "./index";

export default function ProfileSettingsForm({ roleTitle = "Profile" }) {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    username: "",
    first_name: "",
    last_name: "",
    cnic_number: "",
  });

  // Password state
  const [passwordValues, setPasswordValues] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // Notifications
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me/");
      setProfile(res.data);
      setFormValues({
        username: res.data.username || "",
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        cnic_number: res.data.cnic_number || "",
      });
    } catch (err) {
      console.error("Failed to load user profile:", err);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.patch("/auth/me/", formValues);
      setProfile(res.data);
      toast.success("Profile information updated successfully!");
      setAlert({ type: "success", message: "Profile updated successfully." });
    } catch (err) {
      console.error("Error updating profile:", err);
      const errMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.detail ||
        "Could not update profile.";
      toast.error(errMsg);
      setAlert({ type: "error", message: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordValues.new_password !== passwordValues.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }
    setPwdSubmitting(true);
    try {
      await api.post("/auth/change-password/", passwordValues);
      setPasswordValues({ old_password: "", new_password: "", confirm_password: "" });
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
      setPwdSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#D4DE95] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto apl-animate-fade">
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
          {roleTitle} Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F76] dark:text-[#9CA485] mt-1">
          Manage your personal details, credentials, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card / Overview */}
        <div className="apl-card h-fit space-y-4">
          <div className="flex flex-col items-center text-center p-4 border-b border-[#ECEEDF] dark:border-[#2A2E1E]">
            <div className="w-20 h-20 rounded-2xl bg-[#3D4127] text-[#D4DE95] flex items-center justify-center text-3xl font-black shadow-md mb-3">
              {(profile?.first_name || profile?.username || "U").charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">
              {profile?.first_name || profile?.last_name
                ? `${profile?.first_name} ${profile?.last_name}`.trim()
                : profile?.username}
            </h2>
            <p className="text-xs text-[#8A8F76] dark:text-[#9CA485] truncate max-w-full">
              {profile?.email}
            </p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#D4DE95]/20 text-[#3D4127] dark:text-[#D4DE95]">
              {profile?.role?.replace("_", " ")}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#ECEEDF]/60 dark:border-[#2A2E1E]/60">
              <span className="text-[#8A8F76]">Account Status</span>
              <span className="font-bold text-[#4E7A33]">Active</span>
            </div>
            {profile?.company_name && (
              <div className="flex justify-between py-1 border-b border-[#ECEEDF]/60 dark:border-[#2A2E1E]/60">
                <span className="text-[#8A8F76]">Organization</span>
                <span className="font-bold text-[#22241B] dark:text-[#EBF0DA] truncate max-w-[120px]">
                  {profile.company_name}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-[#8A8F76]">Member Since</span>
              <span className="font-mono text-[#52564A] dark:text-[#9CA485]">
                {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="apl-card space-y-5">
            <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
              <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                Personal Information
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Update your contact details and display names.
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
                    value={formValues.first_name}
                    onChange={(e) => setFormValues({ ...formValues, first_name: e.target.value })}
                    className="apl-input text-xs"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formValues.last_name}
                    onChange={(e) => setFormValues({ ...formValues, last_name: e.target.value })}
                    className="apl-input text-xs"
                    placeholder="Enter last name"
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
                    value={formValues.username}
                    onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
                    className="apl-input text-xs font-mono"
                    placeholder="Username"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="apl-input text-xs opacity-60 cursor-not-allowed bg-[#ECEEDF]/40 dark:bg-[#1A1D13]"
                  />
                </div>
              </div>

              {profile?.role === "applicant" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    CNIC / National Identity Number
                  </label>
                  <input
                    type="text"
                    value={formValues.cnic_number}
                    onChange={(e) => setFormValues({ ...formValues, cnic_number: e.target.value })}
                    className="apl-input text-xs font-mono"
                    placeholder="e.g. 42101-1234567-1"
                  />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="apl-btn apl-btn-primary text-xs py-2 px-5 font-bold shadow-sm"
                >
                  {submitting ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="apl-card space-y-5">
            <div className="border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-3">
              <h3 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                Account Security & Password
              </h3>
              <p className="text-xs text-[#8A8F76] dark:text-[#9CA485]">
                Ensure your account uses a secure password.
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
                  value={passwordValues.old_password}
                  onChange={(e) => setPasswordValues({ ...passwordValues, old_password: e.target.value })}
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
                    value={passwordValues.new_password}
                    onChange={(e) => setPasswordValues({ ...passwordValues, new_password: e.target.value })}
                    className="apl-input text-xs"
                    placeholder="New password (min 8 chars)"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#52564A] dark:text-[#9CA485]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordValues.confirm_password}
                    onChange={(e) => setPasswordValues({ ...passwordValues, confirm_password: e.target.value })}
                    className="apl-input text-xs"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={pwdSubmitting}
                  className="apl-btn apl-btn-dark text-xs py-2 px-5 font-bold shadow-sm"
                >
                  {pwdSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
