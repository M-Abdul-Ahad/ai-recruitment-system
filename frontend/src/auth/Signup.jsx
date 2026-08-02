import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";
import { AuthContext } from "./AuthContext";

/* ── Inline icon helper ──────────────────────────────────────── */
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const BrainIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);

/* ── Icon path fragments ─────────────────────────────────────── */
const I = {
  email:     <><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
  lock:      <><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  user:      <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  building:  <><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></>,
  globe:     <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  phone:     <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></>,
  mapPin:    <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
  upload:    <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  eye:       <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff:    <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></>,
  info:      <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
  check:     <><polyline points="20 6 9 17 4 12"/></>,
  briefcase: <><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  users:     <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  layers:    <><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></>,
};

/* ── Styled input ────────────────────────────────────────────── */
function AuthInput({ id, label, type = "text", icon, placeholder, value, onChange, required = false, autoComplete, children }) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        {icon && <span className="auth-input-icon"><Icon size={16} d={icon} /></span>}
        <input
          id={id}
          type={type}
          className={`auth-input${!icon ? " no-icon" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
        />
        {children}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SIGNUP PAGE
   ════════════════════════════════════════════════════════════════ */
export default function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  // "applicant" | "company"
  const [activeTab, setActiveTab] = useState("applicant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  /* ── Applicant form state ─────────────────────────────────── */
  const [applicantForm, setApplicantForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /* ── Company form state ──────────────────────────────────── */
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    companyEmail: "",
    website: "",
    industry: "",
    address: "",
    phone: "",
    ownerName: "",
    ownerEmail: "",
    password: "",
    confirmPassword: "",
  });

  /* ── Logo file pick ──────────────────────────────────────── */
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  /* ── Applicant submit ────────────────────────────────────── */
  const handleApplicantSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Current formData state:", applicantForm);
    console.log("Current role value:", "applicant");

    if (applicantForm.password !== applicantForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const payload = {
      username: applicantForm.username,
      email: applicantForm.email,
      password: applicantForm.password,
      role: "applicant",
    };
    console.log("API Payload before call:", payload);

    setLoading(true);
    try {
      await signup(payload);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("API Error during signup:", err);
      setError("Signup failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Company submit ──────────────────────────────────────── */
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Current formData state:", companyForm);
    console.log("Current role value:", "recruiter");

    if (companyForm.password !== companyForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const payload = {
      username: companyForm.ownerName,
      email: companyForm.ownerEmail,
      password: companyForm.password,
      role: "recruiter",
    };
    console.log("API Payload before call:", payload);

    setLoading(true);
    try {
      await signup(payload);
      alert("Company account created! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("API Error during signup:", err);
      setError("Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwToggleBtn = (show, setShow) => (
    <button type="button" className="auth-input-toggle" onClick={() => setShow(!show)}
      aria-label={show ? "Hide password" : "Show password"}>
      <Icon size={16} d={show ? I.eyeOff : I.eye} />
    </button>
  );

  const features = activeTab === "applicant" ? [
    { title: "AI Resume Builder", desc: "Build tailored bullet points designed for ATS screening" },
    { title: "One-Click Application", desc: "Apply directly with your stored AI resume profile" },
    { title: "Real-Time Tracking", desc: "Track application statuses & HR reviews instantly" },
    { title: "AI Skill Gap Score", desc: "Get metric feedback to boost candidate ranking" },
  ] : [
    { title: "AI Candidate Ranking", desc: "Rank applicants automatically with explainable match scores" },
    { title: "Bulk Resume Parsing", desc: "Parse PDF and DOCX files instantly at any scale" },
    { title: "Recruiter Management", desc: "Invite your hiring team with role-based access" },
    { title: "Pipeline Workflow", desc: "Shortlist, schedule interviews, and track status" },
  ];

  return (
    <div className="auth-page">
      {/* ── Left brand panel (50% Split) ── */}
      <aside className="auth-brand-panel" aria-hidden="true">
        <div className="auth-brand-orb auth-brand-orb-1" />
        <div className="auth-brand-orb auth-brand-orb-2" />
        <div className="auth-brand-orb auth-brand-orb-3" />

        <Link to="/" className="auth-brand-logo">
          <span className="auth-brand-logo-icon"><BrainIcon /></span>
          <span className="auth-brand-logo-name">NOMINATE <span>AI</span></span>
        </Link>

        <div className="auth-brand-content">
          <div className="auth-brand-badge">
            <span className="w-2 h-2 rounded-full bg-[#D4DE95] animate-pulse" />
            {activeTab === "applicant" ? "Job Seeker Career Platform" : "Enterprise Hiring Intelligence"}
          </div>

          <h1 className="auth-brand-headline">
            {activeTab === "applicant" ? (
              <>Land Your Next<br /><span>Dream Career</span></>
            ) : (
              <>Start Hiring<br /><span>Intelligently</span></>
            )}
          </h1>
          <p className="auth-brand-desc">
            {activeTab === "applicant"
              ? "Create your applicant account to build AI-optimized resumes, receive match scores, and track your applications."
              : "Create your company account to automate candidate ranking, manage recruiter pipelines, and hire faster."}
          </p>

          {/* AI ATS Glassmorphism Graphic Card */}
          <div className="auth-graphic-card">
            <div className="auth-gc-header">
              <div className="auth-gc-user">
                <div className="auth-gc-avatar">
                  {activeTab === "applicant" ? "JS" : "HR"}
                </div>
                <div>
                  <div className="auth-gc-title">
                    {activeTab === "applicant" ? "AI Resume Builder Active" : "AI Candidate Screening Active"}
                  </div>
                  <div className="auth-gc-sub">
                    {activeTab === "applicant" ? "Automated Skill Benchmark" : "Bulk Resume Parsing Engine"}
                  </div>
                </div>
              </div>
              <div className="auth-gc-score">95% Score</div>
            </div>

            <div className="auth-gc-progress-bar">
              <div className="auth-gc-progress-fill" style={{ width: "95%" }} />
            </div>

            <div className="auth-gc-skills">
              <span>Resume Analysis</span>
              <span>Explainable AI</span>
              <span>Match Scoring</span>
            </div>
          </div>

          {/* 4 Feature Highlights */}
          <ul className="auth-feature-list">
            {features.map((f) => (
              <li key={f.title} className="auth-feature-item">
                <span className="auth-feature-check">
                  <Icon size={12} d={I.check} />
                </span>
                <div>
                  <div className="auth-feature-title">{f.title}</div>
                  <div className="auth-feature-desc">{f.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-brand-footer">
          <p className="auth-brand-quote">
            {activeTab === "applicant"
              ? "\"I got 3 interview calls in my first week using NOMINATE AI's resume builder.\""
              : "\"NOMINATE AI cut our time-to-hire from 6 weeks to under 2. The AI ranking is genuinely accurate.\""}
          </p>
          <p className="auth-brand-quote-author">
            {activeTab === "applicant"
              ? "— Priya Sharma, Software Engineer"
              : "— Sarah Mitchell, Head of Talent at Nexora Tech"}
          </p>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="auth-form-panel">
        <div className="auth-form-wrap">

          {/* Mobile logo */}
          <Link to="/" className="auth-mobile-logo">
            <span className="auth-mobile-logo-icon"><BrainIcon /></span>
            <span className="auth-mobile-logo-name">NOMINATE <span>AI</span></span>
          </Link>

          <div className="auth-form-header">
            <h2 className="auth-form-title">Create Account</h2>
            <p className="auth-form-subtitle">Join thousands of recruiters and job seekers on NOMINATE AI.</p>
          </div>

          {/* Role toggle tabs */}
          <div className="auth-role-tabs" role="tablist" aria-label="Account type">
            <button
              role="tab"
              aria-selected={activeTab === "applicant"}
              id="tab-applicant"
              className={`auth-role-tab${activeTab === "applicant" ? " active" : ""}`}
              onClick={() => { setActiveTab("applicant"); setError(""); }}
            >
              <Icon size={16} d={I.user} />
              Job Seeker
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "company"}
              id="tab-company"
              className={`auth-role-tab${activeTab === "company" ? " active" : ""}`}
              onClick={() => { setActiveTab("company"); setError(""); }}
            >
              <Icon size={16} d={I.building} />
              Company
            </button>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" style={{
              background: "var(--danger-bg)",
              border: "1px solid rgba(180, 69, 61, 0.25)",
              borderRadius: "var(--r-btn)",
              padding: "12px 16px",
              fontSize: 13,
              color: "var(--danger)",
              marginBottom: "var(--sp-4)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Icon size={15} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>} />
              {error}
            </div>
          )}

          {/* ═══════════ APPLICANT FORM ═══════════ */}
          {activeTab === "applicant" && (
            <form className="auth-form" onSubmit={handleApplicantSubmit} role="tabpanel" aria-labelledby="tab-applicant" noValidate>
              <AuthInput
                id="apl-name"
                label="Full Name"
                icon={I.user}
                placeholder="e.g. Jane Smith"
                value={applicantForm.username}
                onChange={(e) => setApplicantForm({ ...applicantForm, username: e.target.value })}
                required
                autoComplete="name"
              />

              <AuthInput
                id="apl-email"
                label="Email Address"
                type="email"
                icon={I.email}
                placeholder="you@email.com"
                value={applicantForm.email}
                onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                required
                autoComplete="email"
              />

              <div className="auth-field">
                <label className="auth-label" htmlFor="apl-password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Icon size={16} d={I.lock} /></span>
                  <input
                    id="apl-password"
                    type={showPw ? "text" : "password"}
                    className="auth-input"
                    placeholder="Minimum 8 characters"
                    value={applicantForm.password}
                    onChange={(e) => setApplicantForm({ ...applicantForm, password: e.target.value })}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  {pwToggleBtn(showPw, setShowPw)}
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="apl-confirm-pw">Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Icon size={16} d={I.lock} /></span>
                  <input
                    id="apl-confirm-pw"
                    type={showConfirmPw ? "text" : "password"}
                    className="auth-input"
                    placeholder="Repeat your password"
                    value={applicantForm.confirmPassword}
                    onChange={(e) => setApplicantForm({ ...applicantForm, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  {pwToggleBtn(showConfirmPw, setShowConfirmPw)}
                </div>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading
                  ? <><span className="auth-spinner" /><span>Creating account…</span></>
                  : "Create Applicant Account"
                }
              </button>
            </form>
          )}

          {/* ═══════════ COMPANY FORM ═══════════ */}
          {activeTab === "company" && (
            <form className="auth-form" onSubmit={handleCompanySubmit} role="tabpanel" aria-labelledby="tab-company" noValidate>

              {/* Company section */}
              <div className="auth-section-divider">Company Information</div>

              <AuthInput
                id="co-name"
                label="Company Name"
                icon={I.building}
                placeholder="e.g. Nexora Technologies"
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                required
                autoComplete="organization"
              />

              <div className="auth-form-grid-2">
                <AuthInput
                  id="co-email"
                  label="Company Email"
                  type="email"
                  icon={I.email}
                  placeholder="hr@company.com"
                  value={companyForm.companyEmail}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyEmail: e.target.value })}
                  required
                  autoComplete="email"
                />
                <AuthInput
                  id="co-website"
                  label="Website"
                  icon={I.globe}
                  placeholder="https://company.com"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  autoComplete="url"
                />
              </div>

              <div className="auth-form-grid-2">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="co-industry">Industry</label>
                  <select
                    id="co-industry"
                    className="auth-select"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    required
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail & E-commerce</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="consulting">Consulting</option>
                    <option value="media">Media & Entertainment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <AuthInput
                  id="co-phone"
                  label="Phone Number"
                  type="tel"
                  icon={I.phone}
                  placeholder="+1 (555) 000-0000"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  autoComplete="tel"
                />
              </div>

              <AuthInput
                id="co-address"
                label="Company Address"
                icon={I.mapPin}
                placeholder="123 Main St, City, Country"
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                autoComplete="street-address"
              />

              {/* Logo upload */}
              <div className="auth-field">
                <label className="auth-label">Company Logo</label>
                <label className="auth-logo-upload" htmlFor="co-logo" title="Upload company logo">
                  <div className="auth-logo-upload-preview">
                    {logoPreview
                      ? <img src={logoPreview} alt="Company logo preview" />
                      : <Icon size={20} d={I.upload} />
                    }
                  </div>
                  <div className="auth-logo-upload-text">
                    <div className="auth-logo-upload-label">
                      {logoPreview ? "Logo selected" : "Upload Logo"}
                    </div>
                    <div className="auth-logo-upload-hint">PNG, JPG or SVG · Max 2MB</div>
                  </div>
                  <input
                    id="co-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    style={{ display: "none" }}
                    onChange={handleLogoChange}
                  />
                </label>
              </div>

              {/* Owner section */}
              <div className="auth-section-divider" style={{ marginTop: "var(--sp-2)" }}>Owner Account</div>

              <div className="auth-info-box">
                <Icon size={15} d={I.info} />
                <span>This creates your <strong>Company Owner</strong> account. You can invite Recruiters to join your team after setup.</span>
              </div>

              <div className="auth-form-grid-2">
                <AuthInput
                  id="owner-name"
                  label="Owner Name"
                  icon={I.user}
                  placeholder="e.g. Alex Johnson"
                  value={companyForm.ownerName}
                  onChange={(e) => setCompanyForm({ ...companyForm, ownerName: e.target.value })}
                  required
                  autoComplete="name"
                />
                <AuthInput
                  id="owner-email"
                  label="Owner Email"
                  type="email"
                  icon={I.email}
                  placeholder="owner@company.com"
                  value={companyForm.ownerEmail}
                  onChange={(e) => setCompanyForm({ ...companyForm, ownerEmail: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="owner-password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Icon size={16} d={I.lock} /></span>
                  <input
                    id="owner-password"
                    type={showPw ? "text" : "password"}
                    className="auth-input"
                    placeholder="Minimum 8 characters"
                    value={companyForm.password}
                    onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  {pwToggleBtn(showPw, setShowPw)}
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="owner-confirm-pw">Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Icon size={16} d={I.lock} /></span>
                  <input
                    id="owner-confirm-pw"
                    type={showConfirmPw ? "text" : "password"}
                    className="auth-input"
                    placeholder="Repeat your password"
                    value={companyForm.confirmPassword}
                    onChange={(e) => setCompanyForm({ ...companyForm, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  {pwToggleBtn(showConfirmPw, setShowConfirmPw)}
                </div>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading
                  ? <><span className="auth-spinner" /><span>Creating company account…</span></>
                  : "Register Company"
                }
              </button>
            </form>
          )}

          <div className="auth-form-footer" style={{ marginTop: "var(--sp-5)" }}>
            Already have an account?{" "}
            <Link to="/login" className="auth-form-link">Sign in</Link>
          </div>

          {/* Recruiter note */}
          <div style={{ marginTop: "var(--sp-4)", paddingTop: "var(--sp-4)", borderTop: "1px solid var(--n100)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--n500)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--n700)" }}>Are you a Recruiter (HR)?</strong><br />
              You don't need to sign up. Your Company Owner will send you an invitation email to join their team.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
