import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import { useToast, Alert } from "../components/ui";
import ProfileSettingsForm from "../components/ui/ProfileSettingsForm";

/* ── Inline SVG Icons ── */
const SettingsIcons = {
  Building: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Save: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
};

export default function CompanySettings() {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("company"); // 'company' | 'profile'
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res = await api.get("/companies/me/");
      setCompany(res.data);
      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        website: res.data.website || "",
        industry: res.data.industry || "",
        address: res.data.address || "",
        description: res.data.description || "",
      });
    } catch (err) {
      console.error("Fetch company error:", err);
      toast.error("Could not load organization details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      const res = await api.patch("/companies/me/", form);
      setCompany(res.data);
      toast.success("Organization profile updated successfully!");
      setAlert({ type: "success", message: "Company profile updated successfully." });
    } catch (err) {
      console.error("Error updating company:", err);
      const msg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.error ||
        "Failed to update company settings.";
      toast.error(msg);
      setAlert({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  const verificationStatus = (company?.verification_status || "").toLowerCase();
  const isVerified = verificationStatus === "verified";
  const isPending = verificationStatus === "pending";
  const isRejected = verificationStatus === "rejected";

  return (
    <div className="apl-animate-fade max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* ── Page Header ── */}
      <div className="border-b border-[var(--apl-neutral-100)] pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--apl-neutral-900)] tracking-tight">
          Organization & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-[var(--apl-neutral-500)] mt-1">
          Manage your company legal identity, public profile, and personal administrative security credentials.
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* ── Modern Pill Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-[var(--apl-neutral-100)] pb-3">
        <button
          onClick={() => setActiveTab("company")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "company"
              ? "bg-[#3D4127] text-[#D4DE95] shadow-xs"
              : "text-[var(--apl-neutral-700)] hover:bg-[var(--apl-neutral-100)]"
          }`}
        >
          <SettingsIcons.Building />
          Company Organization Profile
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-[#3D4127] text-[#D4DE95] shadow-xs"
              : "text-[var(--apl-neutral-700)] hover:bg-[var(--apl-neutral-100)]"
          }`}
        >
          <SettingsIcons.Shield />
          Admin Account & Password
        </button>
      </div>

      {activeTab === "profile" ? (
        <ProfileSettingsForm roleTitle="Company Admin" />
      ) : (
        <div className="apl-card space-y-6">
          {/* Header Card with Initials & Verification Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--apl-neutral-100)] pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--apl-sb-bg)] text-[#D4DE95] font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0 border border-[#D4DE95]/30">
                {(company?.name || "C").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[var(--apl-neutral-900)]">
                  {loading ? "Loading..." : company?.name || "Organization Profile"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold capitalize ${
                      isVerified
                        ? "bg-[#4E7A33]/15 text-[#4E7A33]"
                        : isPending
                        ? "bg-[#C99A3E]/15 text-[#C99A3E]"
                        : isRejected
                        ? "bg-[#B4453D]/15 text-[#B4453D]"
                        : "bg-[var(--apl-neutral-100)] text-[var(--apl-neutral-700)]"
                    }`}
                  >
                    {isVerified ? (
                      <SettingsIcons.CheckCircle />
                    ) : isPending ? (
                      <SettingsIcons.Clock />
                    ) : null}
                    {company?.verification_status ? company.verification_status.replace("_", " ") : "Registered"}
                  </span>

                  {company?.industry && (
                    <span className="text-xs text-[var(--apl-neutral-500)]">
                      &bull; {company.industry}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {company?.tax_id && (
              <div className="text-right sm:text-right">
                <span className="text-[10px] uppercase font-bold text-[var(--apl-neutral-500)] tracking-wider block">
                  Registration / Tax ID
                </span>
                <span className="font-mono text-xs font-bold text-[var(--apl-neutral-900)] bg-[var(--apl-neutral-bg)] px-2.5 py-1 rounded-lg border border-[var(--apl-neutral-100)] inline-block mt-0.5">
                  {company.tax_id}
                </span>
              </div>
            )}
          </div>

          {/* Verification Notice Banner if Pending or Rejected */}
          {isPending && (
            <div className="p-3.5 rounded-xl bg-[#C99A3E]/10 border border-[#C99A3E]/20 text-[#C99A3E] text-xs flex items-center gap-2">
              <SettingsIcons.Clock />
              <span>
                Your company registration is currently under review by Nominate AI verification administrators. You can update details at any time.
              </span>
            </div>
          )}

          {isRejected && (
            <div className="p-3.5 rounded-xl bg-[#B4453D]/10 border border-[#B4453D]/20 text-[#B4453D] text-xs">
              <p className="font-bold">Verification review requires attention:</p>
              <p className="mt-0.5">{company?.rejection_reason || "Please ensure all legal entity details and documents match official government registers."}</p>
            </div>
          )}

          {/* Company Settings Form */}
          <form onSubmit={handleCompanySubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="apl-label">
                  Company Legal Entity Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="apl-input font-bold"
                  placeholder="Official registered company name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="apl-label">
                  Corporate Contact Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="apl-input"
                  placeholder="contact@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="apl-label">
                  Industry / Business Sector
                </label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="apl-input"
                  placeholder="e.g. Information Technology, Fintech, Healthcare"
                />
              </div>

              <div className="space-y-1.5">
                <label className="apl-label">
                  Official Website
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="apl-input"
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="apl-label">
                  Official Phone Contact
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="apl-input"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="space-y-1.5">
                <label className="apl-label">
                  Headquarters / Office Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="apl-input"
                  placeholder="Building, Street, City, Country"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="apl-label">
                  Organization Overview / Mission
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="apl-textarea text-xs leading-relaxed"
                  placeholder="Brief overview of your company, core domain, and what you build..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--apl-neutral-100)]">
              <span className="text-[11px] text-[var(--apl-neutral-500)]">
                Organization details are visible to candidates viewing your job requisitions.
              </span>
              <button
                type="submit"
                disabled={saving}
                className="apl-btn apl-btn-primary text-xs py-2.5 px-6 font-bold shadow-xs inline-flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[var(--apl-dark)] border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SettingsIcons.Save />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
