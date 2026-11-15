import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import { useToast, Alert } from "../components/ui";
import ProfileSettingsForm from "../components/ui/ProfileSettingsForm";

export default function CompanySettings() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
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
      toast.error("Could not load company details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch("/companies/me/", form);
      setCompany(res.data);
      toast.success("Company profile updated successfully!");
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

  return (
    <div className="apl-animate-fade max-w-4xl mx-auto space-y-6">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#ECEEDF] dark:border-[#2A2E1E] gap-6">
        <button
          onClick={() => setActiveTab("company")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "company"
              ? "border-[#3D4127] dark:border-[#D4DE95] text-[#22241B] dark:text-[#EBF0DA]"
              : "border-transparent text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
          }`}
        >
          Company Organization Profile
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-[#3D4127] dark:border-[#D4DE95] text-[#22241B] dark:text-[#EBF0DA]"
              : "border-transparent text-[#8A8F76] hover:text-[#22241B] dark:hover:text-[#EBF0DA]"
          }`}
        >
          Admin Personal Account & Security
        </button>
      </div>

      {activeTab === "profile" ? (
        <ProfileSettingsForm roleTitle="Company Admin" />
      ) : (
        <div className="apl-card space-y-6">
          <div className="flex items-center gap-4 border-b border-[#ECEEDF] dark:border-[#2A2E1E] pb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#3D4127] text-[#D4DE95] font-extrabold text-2xl flex items-center justify-center shadow-md">
              {(company?.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#22241B] dark:text-[#EBF0DA]">
                {loading ? "Loading..." : company?.name || "Organization"}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#4E7A33]/15 text-[#4E7A33] mt-1 capitalize">
                {company?.verification_status || "Registered Organization"}
              </span>
            </div>
          </div>

          <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="apl-input text-xs font-bold"
                  placeholder="Company Legal Name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="apl-input text-xs"
                  placeholder="contact@company.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="apl-input text-xs"
                  placeholder="e.g. Technology, Healthcare, Finance"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
                  Website Domain
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="apl-input text-xs"
                  placeholder="https://company.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="apl-input text-xs"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
                  Headquarters Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="apl-input text-xs"
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[#8A8F76] font-bold uppercase tracking-wider block text-[10px]">
                  Company Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="apl-input text-xs leading-relaxed"
                  placeholder="Describe your organization..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#ECEEDF] dark:border-[#2A2E1E]">
              <button
                type="submit"
                disabled={saving}
                className="apl-btn apl-btn-primary text-xs py-2 px-5 font-bold shadow-sm"
              >
                {saving ? "Saving..." : "Save Company Information"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
