import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./home.css";

/* ── Icon helpers (inline SVGs — no extra dependency) ─────────── */
const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const icons = {
  brain: <><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></>,
  zap: <><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  fileSearch: <><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="5" cy="17" r="3"/><path d="m9 21-1.5-1.5"/></>,
  star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  building: <><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></>,
  chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  mail: <><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
  check: <><polyline points="20 6 9 17 4 12"/></>,
  checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  chevronDown: <><polyline points="6 9 12 15 18 9"/></>,
  menu: <><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></>,
  x: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  fileText: <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></>,
  briefcase: <><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  sparkles: <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  trendingUp: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  layers: <><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
  filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  award: <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></>,
  layout: <><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></>,
  settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></>,
  plusCircle: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>,
  clipboard: <><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></>,
  twitter: <><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></>,
  linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></>,
  github: <><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></>,
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></>,
  lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></>,
  mapPin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
  info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
};

/* ── Scroll-reveal hook ───────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); observer.unobserve(el); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Reusable Reveal wrapper ─────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal reveal-delay-${delay} ${className}`}>
      {children}
    </div>
  );
}

/* ── FAQ Accordion item ───────────────────────────────────────── */
const faqs = [
  { q: "What is NOMINATE AI and who is it for?", a: "NOMINATE AI is an AI-powered recruitment and applicant tracking system designed for companies and job seekers. Companies get intelligent hiring tools — AI resume ranking, bulk parsing, and automated shortlisting. Applicants get AI resume builders, cover letter generators, and one-click applications." },
  { q: "How does the AI resume ranking work?", a: "Our AI parses every applicant's resume and compares it against the job description using natural language processing and semantic matching. Each candidate gets an explainable match score (0–100%) with a breakdown of why they ranked where they did — not a black box." },
  { q: "How do recruiters invite team members?", a: "Recruiters (HR staff) are not created via public signup. A Company Owner registers the company account, then invites individual recruiters directly from their company dashboard. Each recruiter receives an email invitation to set up their account." },
  { q: "Can applicants track their application status?", a: "Yes. Applicants have a dedicated dashboard showing the status of every application (Applied → Shortlisted → In Review → Hired / Rejected) along with any feedback shared by the recruiter." },
  { q: "Is my data secure?", a: "Absolutely. All data is encrypted at rest and in transit. We follow industry-standard security practices, and you control what information is shared between applicants and companies. Resumes are only visible to the companies applicants apply to." },
  { q: "How is NOMINATE AI different from other ATS platforms?", a: "Most ATS platforms are just tracking databases. NOMINATE AI adds a full AI intelligence layer: resume parsing at bulk scale, explainable match scores, AI-generated job descriptions, external profile discovery, and skill assessment integration — all in one cohesive system." },
];

function FaqItem({ faq, idx }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={Math.min(idx % 3, 4)}>
      <div className={`faq-item${open ? " open" : ""}`}>
        <button className="faq-question" onClick={() => setOpen(!open)}
          aria-expanded={open} id={`faq-btn-${idx}`}>
          {faq.q}
          <span className="faq-chevron">
            <Icon size={14}>{icons.chevronDown}</Icon>
          </span>
        </button>
        {open && <div className="faq-answer" role="region" aria-labelledby={`faq-btn-${idx}`}>{faq.a}</div>}
      </div>
    </Reveal>
  );
}

/* ════════════════════════════════════════════════════════════════
   HOME PAGE
   ════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState("recruiter");
  const [activeHowTab, setActiveHowTab] = useState("recruiter");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Recruiter features ─────────────────────────────────── */
  const recruiterFeatures = [
    { icon: icons.sparkles, title: "AI Job Description Generator", desc: "Generate compelling, inclusive job descriptions in seconds using AI. Customise tone, requirements, and format." },
    { icon: icons.upload, title: "Bulk Resume Parsing", desc: "Upload hundreds of resumes at once. AI extracts structured data from every format — PDF, DOCX, and more." },
    { icon: icons.chart, title: "AI Resume Ranking", desc: "Candidates are automatically ranked by AI match score against your job, saving hours of manual screening." },
    { icon: icons.target, title: "Explainable AI Scores", desc: "Every score comes with a transparent breakdown — see exactly which skills matched and which didn't." },
    { icon: icons.filter, title: "Candidate Filtering", desc: "Filter by experience, skills, score range, education, and more. Find your ideal candidate instantly." },
    { icon: icons.layers, title: "Resume Recommendations", desc: "AI surfaces candidates from your existing talent pool who match new roles — no new applications needed." },
    { icon: icons.globe, title: "External Profile Discovery", desc: "Discover qualified candidates beyond your applicant pool using external profile intelligence." },
    { icon: icons.briefcase, title: "Job Management", desc: "Create, publish, pause, and close jobs with full lifecycle control and analytics built in." },
    { icon: icons.users, title: "Candidate Dashboard", desc: "A unified view of all candidates per job — stage, score, notes, and history in one place." },
    { icon: icons.mail, title: "Email Shortlisted Candidates", desc: "Send personalised shortlist emails directly from the platform with one click, powered by templates." },
    { icon: icons.settings, title: "Recruiter Management", desc: "Company Owners can invite, manage, and control access for all recruiter accounts in their organisation." },
  ];

  /* ── Applicant features ─────────────────────────────────── */
  const applicantFeatures = [
    { icon: icons.fileText, title: "AI Resume Builder", desc: "Build a professional ATS-optimised resume with AI assistance. Choose from modern templates." },
    { icon: icons.sparkles, title: "AI Cover Letter Generator", desc: "Generate tailored cover letters for each job in seconds. No more starting from a blank page." },
    { icon: icons.briefcase, title: "Job Board", desc: "Browse hundreds of live job openings filtered by role, location, industry, and salary range." },
    { icon: icons.zap, title: "One-Click Apply", desc: "Apply to any job instantly using your saved profile and resume — no lengthy forms each time." },
    { icon: icons.clipboard, title: "Application Tracking", desc: "Track the status of every application from a single dashboard. Always know where you stand." },
    { icon: icons.mail, title: "HR Feedback", desc: "Receive structured feedback from recruiters when available — understand how to improve your applications." },
    { icon: icons.award, title: "Skill Assessments", desc: "Complete skill assessments to strengthen your profile and stand out to recruiters looking for verified talent." },
  ];

  /* ── How it works steps ─────────────────────────────────── */
  const howStepsRecruiter = [
    { num: "01", title: "Register Company", desc: "Create your company account as an Owner. Invite your recruiter team." },
    { num: "02", title: "Post a Job", desc: "Use the AI generator to write a compelling job description and publish it live." },
    { num: "03", title: "Review AI Rankings", desc: "Candidates are automatically parsed and ranked by AI match score." },
    { num: "04", title: "Hire the Best", desc: "Shortlist, email candidates, and track the full pipeline to a hire." },
  ];
  const howStepsApplicant = [
    { num: "01", title: "Create Profile", desc: "Sign up and build your profile with the AI Resume Builder." },
    { num: "02", title: "Browse Jobs", desc: "Explore curated listings tailored to your skills and experience." },
    { num: "03", title: "One-Click Apply", desc: "Apply instantly with your saved resume and AI-generated cover letter." },
    { num: "04", title: "Track Progress", desc: "Monitor application status and receive recruiter feedback in real time." },
  ];

  /* ── Testimonials ───────────────────────────────────────── */
  const testimonials = [
    {
      quote: "NOMINATE AI cut our time-to-hire from 6 weeks to under 2. The AI ranking is genuinely accurate — we stopped wasting hours on unqualified candidates.",
      name: "Sarah Mitchell",
      role: "Head of Talent, Nexora Tech",
      initials: "SM",
      stars: 5,
      featured: true,
    },
    {
      quote: "The explainable scores changed everything for us. Our hiring managers finally understand why a candidate ranks where they do — no more black-box complaints.",
      name: "James Okafor",
      role: "HR Director, Vertex Solutions",
      initials: "JO",
      stars: 5,
      featured: false,
    },
    {
      quote: "As a job seeker, the AI Resume Builder helped me tailor my CV properly. I got 3 interview calls in my first week using NOMINATE AI.",
      name: "Priya Sharma",
      role: "Software Engineer (Applicant)",
      initials: "PS",
      stars: 5,
      featured: false,
    },
  ];

  return (
    <div style={{ overflowX: "hidden" }}>
      {/* ── NAVBAR ── */}
      <nav className={`home-nav${scrolled ? " scrolled" : ""}`} role="navigation" aria-label="Main navigation">
        <div className="home-nav-inner">
          <Link to="/" className="home-nav-logo" aria-label="NOMINATE AI Home">
            <span className="home-nav-logo-icon">
              <Icon size={18}>{icons.brain}</Icon>
            </span>
            <span className="home-nav-logo-text">NOMINATE <span>AI</span></span>
          </Link>

          <ul className="home-nav-links">
            {[["#features", "Features"], ["#how", "How It Works"], ["#why", "Why Us"], ["#faq", "FAQ"]].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="home-nav-link">{label}</a>
              </li>
            ))}
          </ul>

          <div className="home-nav-spacer" />

          <div className="home-nav-cta">
            <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>

          <button className="home-nav-menu-btn" onClick={() => setMobileNav(!mobileNav)}
            aria-label="Toggle mobile menu" aria-expanded={mobileNav}>
            <Icon size={18}>{mobileNav ? icons.x : icons.menu}</Icon>
          </button>
        </div>

        {mobileNav && (
          <div className="home-mobile-nav">
            {[["#features", "Features"], ["#how", "How It Works"], ["#why", "Why Us"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className="home-mobile-nav-link" onClick={() => setMobileNav(false)}>{label}</a>
            ))}
            <div className="home-mobile-nav-divider" />
            <Link to="/login" className="home-mobile-nav-link" onClick={() => setMobileNav(false)}>Log In</Link>
            <Link to="/signup" className="btn btn-primary" style={{ marginTop: "8px", justifyContent: "center" }} onClick={() => setMobileNav(false)}>Get Started Free</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-orb hero-orb-1" aria-hidden="true" />
        <div className="hero-orb hero-orb-2" aria-hidden="true" />
        <div className="hero-orb hero-orb-3" aria-hidden="true" />

        <div className="container">
          <div className="hero-grid">
            {/* Left: copy */}
            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                <span className="hero-badge-icon">
                  <Icon size={12}>{icons.sparkles}</Icon>
                </span>
                AI-Powered Recruitment Platform
              </div>

              <h1 className="hero-h1" id="hero-heading">
                Hire Smarter.<br />
                <span className="accent-underline">Not Harder.</span>
              </h1>

              <p className="hero-desc">
                NOMINATE AI brings the full power of artificial intelligence to your hiring process — from AI resume parsing and ranking to explainable match scores and one-click candidate shortlisting.
              </p>

              <div className="hero-actions">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started Free
                  <Icon size={18}>{icons.arrowRight}</Icon>
                </Link>
                <a href="#how" className="btn btn-dark btn-lg">
                  See How It Works
                </a>
              </div>

              <div className="hero-trust">
                <div className="hero-trust-avatars">
                  {["SM", "JO", "PR", "AL"].map((init) => (
                    <div key={init} className="hero-trust-avatar">{init}</div>
                  ))}
                </div>
                <span><strong style={{ color: "var(--n700)" }}>500+</strong> companies trust NOMINATE AI</span>
              </div>
            </div>

            {/* Right: dashboard mockup */}
            <div className="hero-visual">
              <div style={{ position: "relative" }}>
                <div className="hero-mockup">
                  <div className="hero-mockup-header">
                    <span className="hero-mockup-dot" style={{ background: "#FF5F57" }} />
                    <span className="hero-mockup-dot" style={{ background: "#FEBC2E" }} />
                    <span className="hero-mockup-dot" style={{ background: "#28C840" }} />
                    <span className="hero-mockup-title" style={{ marginLeft: 12 }}>NOMINATE AI — Recruiter Dashboard</span>
                  </div>
                  <div className="hero-mockup-body">
                    <div className="hero-mockup-stat-row">
                      {[["247", "Applications"], ["89%", "Avg Score"], ["12", "Shortlisted"]].map(([val, lbl]) => (
                        <div key={lbl} className="hero-mockup-stat">
                          <div className="hero-mockup-stat-val">{val}</div>
                          <div className="hero-mockup-stat-label">{lbl}</div>
                        </div>
                      ))}
                    </div>
                    {[
                      { init: "SM", name: "Sarah M.", role: "Senior Engineer", score: "94%", pct: 94 },
                      { init: "JO", name: "James O.", role: "Full-Stack Dev", score: "87%", pct: 87 },
                      { init: "PR", name: "Priya R.", role: "Backend Eng.", score: "81%", pct: 81 },
                    ].map((c) => (
                      <div key={c.name} className="hero-mockup-candidate">
                        <div className="hero-mockup-avatar">{c.init}</div>
                        <div className="hero-mockup-cand-info">
                          <div className="hero-mockup-cand-name">{c.name}</div>
                          <div className="hero-mockup-cand-role">{c.role}</div>
                          <div className="hero-mockup-bar-wrap">
                            <div className="hero-mockup-bar-fill" style={{ width: c.pct + "%" }} />
                          </div>
                        </div>
                        <div className="hero-mockup-score">{c.score}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating badges */}
                <div className="hero-float-badge hero-fb-1">
                  <div className="hero-float-badge-icon" style={{ background: "rgba(212, 222, 149, 0.15)" }}>
                    <Icon size={14}>{icons.zap}</Icon>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--n500)", marginBottom: 1 }}>AI Score</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--brand-dark)" }}>94% Match</div>
                  </div>
                </div>
                <div className="hero-float-badge hero-fb-2">
                  <div className="hero-float-badge-icon" style={{ background: "var(--success-bg)" }}>
                    <Icon size={14}>{icons.checkCircle}</Icon>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--n500)", marginBottom: 1 }}>Status</div>
                    <div style={{ fontWeight: 700, color: "var(--success)" }}>Shortlisted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="stats-bar" aria-label="Platform statistics">
        <div className="container">
          <div className="stats-grid">
            {[
              { val: "10K+", label: "Successful Hires" },
              { val: "500+", label: "Companies Onboarded" },
              { val: "95%", label: "Time-to-Hire Reduced" },
              { val: "4.9★", label: "Average Rating" },
            ].map((s, i) => (
              <div key={s.label} className={`stat-item${i < 3 ? " stat-item-divider" : ""}`}>
                <div className="stat-value">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI CAPABILITIES ── */}
      <section className="section ai-section" id="ai" aria-labelledby="ai-title">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
              <span className="section-label">
                <Icon size={14}>{icons.sparkles}</Icon>
                AI-Powered Core
              </span>
              <h2 className="section-title" id="ai-title">
                Intelligence Baked Into <span className="highlight">Every Layer</span>
              </h2>
              <p className="section-subtitle" style={{ margin: "0 auto" }}>
                From parsing to ranking to recommendations, NOMINATE AI's engine works silently in the background so your team can focus on decisions, not data entry.
              </p>
            </div>
          </Reveal>

          <div className="ai-grid">
            {[
              { title: "Resume Parsing at Scale", desc: "Bulk-upload any format — PDF, DOCX, scanned — and get structured candidate data in seconds. 99.2% extraction accuracy.", icon: icons.upload, featured: true },
              { title: "AI Match Scoring", desc: "Semantic NLP models compare candidates against job descriptions and assign explainable scores from 0–100%.", icon: icons.target },
              { title: "AI Job Description Writer", desc: "Generate inclusive, complete, bias-reduced job descriptions by simply describing the role in plain English.", icon: icons.sparkles },
              { title: "Resume Recommendations", desc: "Surface past applicants from your talent pool who match new roles — no wasted candidate data.", icon: icons.layers },
              { title: "External Talent Discovery", desc: "Identify external candidates through profile intelligence and expand your talent pipeline proactively.", icon: icons.globe },
              { title: "AI Resume Builder", desc: "Applicants build ATS-optimised resumes with AI suggestions, content prompts, and professional templates.", icon: icons.fileText },
            ].map((card, i) => (
              <Reveal key={card.title} delay={(i % 3) + 1}>
                <div className={`ai-card${card.featured ? " ai-card-featured" : ""}`}>
                  <div className="ai-card-icon">
                    <Icon size={22}>{card.icon}</Icon>
                  </div>
                  <div className="ai-card-title">{card.title}</div>
                  <div className="ai-card-desc">{card.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section" id="features" style={{ background: "var(--bg)" }} aria-labelledby="features-title">
        <div className="container">
          <Reveal>
            <div>
              <span className="section-label">
                <Icon size={14}>{icons.layout}</Icon>
                Full Feature Set
              </span>
              <h2 className="section-title" id="features-title">
                Everything You Need to <span className="highlight">Hire</span>
              </h2>
              <p className="section-subtitle">
                Whether you're a recruiter or an applicant, NOMINATE AI has purpose-built tools for every step of the journey.
              </p>
            </div>
          </Reveal>

          <div className="features-tabs" role="tablist" aria-label="Feature categories">
            {[["recruiter", "For Recruiters"], ["applicant", "For Applicants"]].map(([id, label]) => (
              <button key={id} role="tab" aria-selected={activeFeatureTab === id}
                className={`features-tab${activeFeatureTab === id ? " active" : ""}`}
                onClick={() => setActiveFeatureTab(id)}>
                {label}
              </button>
            ))}
          </div>

          <div className="features-grid" role="tabpanel">
            {(activeFeatureTab === "recruiter" ? recruiterFeatures : applicantFeatures).map((f, i) => (
              <Reveal key={f.title} delay={(i % 4) + 1}>
                <div className="feature-card">
                  <div className="feature-icon">
                    <Icon size={20}>{f.icon}</Icon>
                  </div>
                  <div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section how-section" id="how" aria-labelledby="how-title">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto" }}>
              <span className="section-label">
                <Icon size={14}>{icons.clock}</Icon>
                Workflow
              </span>
              <h2 className="section-title" id="how-title">
                From Sign-Up to <span className="highlight">Hire</span> in 4 Steps
              </h2>
            </div>
          </Reveal>

          <div className="how-tabs" style={{ justifyContent: "center" }} role="tablist">
            {[["recruiter", icons.briefcase, "Recruiter Workflow"], ["applicant", icons.user, "Applicant Workflow"]].map(([id, icon, label]) => (
              <button key={id} role="tab" aria-selected={activeHowTab === id}
                className={`how-tab${activeHowTab === id ? " active" : ""}`}
                onClick={() => setActiveHowTab(id)}>
                <Icon size={16}>{icon}</Icon>
                {label}
              </button>
            ))}
          </div>

          <div className="how-steps" role="tabpanel">
            {(activeHowTab === "recruiter" ? howStepsRecruiter : howStepsApplicant).map((step, i) => (
              <Reveal key={step.num} delay={i + 1}>
                <div className="how-step">
                  <div className="how-step-num">{step.num}</div>
                  <div>
                    <div className="how-step-title">{step.title}</div>
                    <div className="how-step-desc">{step.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section" id="why" style={{ background: "var(--bg)" }} aria-labelledby="why-title">
        <div className="container">
          <div className="why-grid">
            <div>
              <Reveal>
                <span className="section-label">
                  <Icon size={14}>{icons.shield}</Icon>
                  Why NOMINATE AI
                </span>
                <h2 className="section-title" id="why-title">
                  Built for the <span className="highlight">Modern Recruiter</span>
                </h2>
                <p className="section-subtitle">
                  NOMINATE AI isn't just another ATS. It's a full intelligence layer on top of your recruitment process.
                </p>
              </Reveal>

              <div className="why-benefits">
                {[
                  { icon: icons.zap, title: "5× Faster Screening", desc: "AI does the first-pass resume review in seconds, not days. Focus your time where it matters." },
                  { icon: icons.target, title: "Explainable AI — No Black Box", desc: "Every recommendation comes with a transparent breakdown. Build trust with your hiring team." },
                  { icon: icons.users, title: "Works for Every Stakeholder", desc: "Recruiters, company owners, and applicants each get a purpose-built experience in one platform." },
                  { icon: icons.trendingUp, title: "Better Hire Quality Over Time", desc: "The more you use NOMINATE AI, the smarter it gets at surfacing candidates that actually succeed." },
                ].map((b, i) => (
                  <Reveal key={b.title} delay={(i % 3) + 1}>
                    <div className="why-benefit">
                      <div className="why-benefit-icon">
                        <Icon size={20}>{b.icon}</Icon>
                      </div>
                      <div>
                        <div className="why-benefit-title">{b.title}</div>
                        <div className="why-benefit-desc">{b.desc}</div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={2}>
              <div className="why-visual-card">
                <div className="why-vc-header">
                  <div className="why-vc-header-title">Candidate AI Report</div>
                </div>
                <div className="why-vc-body">
                  {[
                    { label: "Overall Match", val: "94%", pct: 94 },
                    { label: "Technical Skills", val: "97%", pct: 97 },
                    { label: "Experience Level", val: "88%", pct: 88 },
                    { label: "Education Fit", val: "91%", pct: 91 },
                    { label: "Soft Skills", val: "85%", pct: 85 },
                  ].map((row) => (
                    <div key={row.label} className="why-vc-row">
                      <span className="why-vc-label">{row.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="why-vc-score-bar">
                          <div className="why-vc-score-fill" style={{ width: row.pct + "%" }} />
                        </div>
                        <span className="why-vc-val">{row.val}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, padding: "12px 0 0", borderTop: "1px solid var(--n100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--n700)", fontWeight: 500 }}>AI Verdict</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--success)", background: "var(--success-bg)", padding: "3px 10px", borderRadius: 999 }}>Strong Match ✓</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section testi-section" aria-labelledby="testi-title">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto" }}>
              <span className="section-label">
                <Icon size={14}>{icons.star}</Icon>
                Testimonials
              </span>
              <h2 className="section-title" id="testi-title">
                Loved by Recruiters & <span className="highlight">Job Seekers</span>
              </h2>
            </div>
          </Reveal>

          <div className="testi-grid">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={(i % 3) + 1}>
                <div className={`testi-card${t.featured ? " testi-card-featured" : ""}`}>
                  <div className="testi-stars">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="testi-quote">"{t.quote}"</p>
                  <div className="testi-author">
                    <div className="testi-avatar">{t.initials}</div>
                    <div>
                      <div className="testi-name">{t.name}</div>
                      <div className="testi-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section faq-section" id="faq" aria-labelledby="faq-title">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
              <span className="section-label">
                <Icon size={14}>{icons.info}</Icon>
                FAQs
              </span>
              <h2 className="section-title" id="faq-title">
                Frequently Asked <span className="highlight">Questions</span>
              </h2>
            </div>
          </Reveal>

          <div className="faq-list">
            {faqs.map((faq, i) => <FaqItem key={i} faq={faq} idx={i} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" aria-labelledby="cta-title">
        <div className="container">
          <Reveal>
            <div className="cta-inner">
              <span className="cta-label">
                <Icon size={14}>{icons.sparkles}</Icon>
                Get Started Today
              </span>
              <h2 className="cta-title" id="cta-title">
                Ready to Transform<br /><span>Your Hiring?</span>
              </h2>
              <p className="cta-desc">
                Join 500+ companies using NOMINATE AI to hire faster, smarter, and with greater confidence. No credit card required.
              </p>
              <div className="cta-actions">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Start for Free
                  <Icon size={18}>{icons.arrowRight}</Icon>
                </Link>
                <Link to="/login" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--white)" }}>
                  Already have an account?
                </Link>
              </div>
              <p className="cta-note">✓ Free forever plan &nbsp;&nbsp; ✓ No credit card required &nbsp;&nbsp; ✓ Cancel any time</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer" aria-label="Site footer">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <Link to="/" className="footer-brand-logo">
                <span className="footer-brand-icon">
                  <Icon size={18}>{icons.brain}</Icon>
                </span>
                <span className="footer-brand-name">NOMINATE <span>AI</span></span>
              </Link>
              <p className="footer-brand-desc">
                AI-powered recruitment and applicant tracking system. Making hiring smarter, faster, and fairer for everyone.
              </p>
              <div className="footer-social">
                {[["Twitter", icons.twitter], ["LinkedIn", icons.linkedin], ["GitHub", icons.github]].map(([label, icon]) => (
                  <button key={label} className="footer-social-btn" aria-label={label} title={label}>
                    <Icon size={16}>{icon}</Icon>
                  </button>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <div className="footer-col-title">Product</div>
              <ul className="footer-links">
                {["Features", "AI Capabilities", "How It Works", "Pricing", "Changelog"].map((l) => (
                  <li key={l}><a href="#" className="footer-link">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links">
                {["About Us", "Blog", "Careers", "Press", "Contact"].map((l) => (
                  <li key={l}><a href="#" className="footer-link">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="footer-col-title">Legal</div>
              <ul className="footer-links">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Security"].map((l) => (
                  <li key={l}><a href="#" className="footer-link">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">© {new Date().getFullYear()} NOMINATE AI. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#" className="footer-legal-link">Privacy</a>
              <a href="#" className="footer-legal-link">Terms</a>
              <a href="#" className="footer-legal-link">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
