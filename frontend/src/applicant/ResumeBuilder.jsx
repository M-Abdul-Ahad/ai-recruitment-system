import { useContext, useState, useRef } from "react";
import { AuthContext } from "../auth/AuthContext";
import {
  TEMPLATE_CATEGORIES,
  resumeTemplates,
  getTemplateById,
  sampleResume,
} from "../components/resume-template-library/resume";
import "../components/resume-template-library/resume/styles/base.css";

/* Inline Icons */
const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const PrinterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ResumeBuilder = () => {
  const { user } = useContext(AuthContext);

  // Active Category Tab: "all" | "classic" | "modern" | "executive" | "technical"
  const [activeCategory, setActiveCategory] = useState("all");

  // Active Selected Template ID (null = viewing gallery, string = building resume)
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Modal Preview Template ID
  const [modalTemplateId, setModalTemplateId] = useState(null);

  // Editable Resume Data (initialized with user email & sample resume as fallback)
  const [resumeData, setResumeData] = useState(() => ({
    ...sampleResume,
    personal: {
      ...sampleResume.personal,
      email: user?.email || sampleResume.personal.email,
    },
  }));

  // Active Editor Section Tab
  const [editorTab, setEditorTab] = useState("personal");

  // AI Enhancer state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiPromptRole, setAiPromptRole] = useState(sampleResume.personal.professionalTitle || "");
  const [aiPromptSkills, setAiPromptSkills] = useState("React, Node.js, Python, PostgreSQL, AWS");
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");

  const printRef = useRef(null);

  // Filter templates by active category
  const filteredTemplates = activeCategory === "all"
    ? resumeTemplates
    : resumeTemplates.filter((t) => t.category === activeCategory);

  // Handle personal info changes
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setResumeData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [name]: value,
      },
    }));
  };

  // Handle summary change
  const handleSummaryChange = (e) => {
    setResumeData((prev) => ({
      ...prev,
      summary: e.target.value,
    }));
  };

  // Handle AI Content Enhancement
  const handleAiEnhance = () => {
    setIsEnhancing(true);
    setAiSuccessMsg("");
    setTimeout(() => {
      setIsEnhancing(false);
      const role = aiPromptRole || "Senior Professional";
      const enhancedSummary = `Results-driven ${role} with extensive experience architecting high-performance applications and scaling systems. Skilled in ${aiPromptSkills}. Track record of driving engineering best practices, optimizing system latency by 30%+, and mentoring cross-functional teams.`;
      
      const enhancedExperience = resumeData.experience?.map((exp, idx) => {
        if (idx === 0) {
          return {
            ...exp,
            position: role,
            bullets: [
              `Architected scalable enterprise solutions targeting ${role} domain objectives.`,
              `Automated deployment pipelines and improved system reliability using modern cloud infrastructure.`,
              `Spearheaded cross-functional team initiatives resulting in a 25% throughput optimization.`,
              `Maintained high code quality standards with comprehensive test coverage and CI/CD automation.`
            ]
          };
        }
        return exp;
      });

      setResumeData((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          professionalTitle: role,
        },
        summary: enhancedSummary,
        experience: enhancedExperience || prev.experience,
      }));

      setAiSuccessMsg("Resume content successfully enhanced with AI!");
      setTimeout(() => setAiSuccessMsg(""), 4000);
    }, 800);
  };

  // Trigger Print / Export to PDF
  const handlePrint = () => {
    window.print();
  };

  const currentTemplate = selectedTemplateId ? getTemplateById(selectedTemplateId) : null;
  const SelectedComponent = currentTemplate ? currentTemplate.component : null;

  const modalTemplate = modalTemplateId ? getTemplateById(modalTemplateId) : null;
  const ModalComponent = modalTemplate ? modalTemplate.component : null;

  return (
    <div className="apl-animate-fade space-y-6">
      {/* ── PRINT ONLY STYLES ── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume, #printable-resume * {
            visibility: visible;
          }
          #printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div className="border-b border-[#D3D6C4] dark:border-[#383D28] pb-5 no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] dark:text-[#9CA485]">
            AI Generation Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight mt-1">
            ATS Resume Builder & Template Library
          </h1>
          <p className="text-xs sm:text-sm text-[#52564A] dark:text-[#9CA485] mt-1">
            Select an ATS-engineered template, customize your info, polish bullet points with AI, and download as a formatted PDF.
          </p>
        </div>

        {selectedTemplateId && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedTemplateId(null)}
              className="apl-btn bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] hover:bg-[#D3D6C4]"
            >
              <ArrowLeftIcon />
              <span>Back to Templates</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="apl-btn apl-btn-primary shadow-md"
            >
              <PrinterIcon />
              <span>Download / Print PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* ── VIEW 1: TEMPLATE GALLERY & CATEGORIES ── */}
      {!selectedTemplateId ? (
        <div className="space-y-6 no-print">
          {/* CATEGORY TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#D3D6C4] dark:border-[#383D28]">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-[#3D4127] text-[#D4DE95] dark:bg-[#D4DE95] dark:text-[#3D4127] shadow-sm"
                  : "bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] hover:bg-[#D4DE95]/50"
              }`}
            >
              All Templates ({resumeTemplates.length})
            </button>

            {TEMPLATE_CATEGORIES.map((cat) => {
              const count = resumeTemplates.filter((t) => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeCategory === cat.id
                      ? "bg-[#3D4127] text-[#D4DE95] dark:bg-[#D4DE95] dark:text-[#3D4127] shadow-sm"
                      : "bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485] hover:bg-[#D4DE95]/50"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* TEMPLATE CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const TemplateComp = template.component;
              return (
                <div
                  key={template.id}
                  className="apl-card apl-card-hover flex flex-col justify-between space-y-4 group border border-[#D3D6C4] dark:border-[#383D28] overflow-hidden"
                >
                  {/* TOP CARD HEADER */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="apl-pill apl-pill-accent text-[10px] uppercase tracking-wider font-bold">
                        {template.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2E8D5] text-[#3D4127] dark:bg-[#2F3422] dark:text-[#D4DE95]">
                        ✓ High ATS Score
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">
                      {template.name}
                    </h3>
                    <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-1 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* MINI SCALED PREVIEW BOX */}
                  <div className="relative w-full h-56 bg-white rounded-lg border border-[#D3D6C4] overflow-hidden select-none pointer-events-none">
                    <div
                      className="absolute top-0 left-0 w-[800px] origin-top-left transform scale-[0.38] bg-white p-4"
                      style={{ height: "600px" }}
                    >
                      <TemplateComp resume={resumeData} />
                    </div>
                  </div>

                  {/* BEST FOR TAGS */}
                  <div className="flex flex-wrap gap-1">
                    {template.bestFor.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#D3D6C4] dark:border-[#383D28]">
                    <button
                      type="button"
                      onClick={() => setModalTemplateId(template.id)}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-bold border border-[#8A8F76] text-[#3D4127] dark:text-[#EBF0DA] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E] transition flex items-center justify-center gap-1.5"
                    >
                      <EyeIcon />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateId(template.id)}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-[#3D4127] text-[#D4DE95] hover:bg-[#2C301B] dark:bg-[#D4DE95] dark:text-[#3D4127] transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckIcon />
                      <span>Use Template</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── VIEW 2: BUILDER & LIVE PREVIEW EDITOR ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: FORM EDITOR & AI ENHANCER (6 cols) */}
          <div className="lg:col-span-5 space-y-6 no-print">
            {/* TEMPLATE INFO BANNER */}
            <div className="p-4 rounded-2xl bg-[#ECEEDF] dark:bg-[#2A2E1E] border border-[#D3D6C4] dark:border-[#383D28] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8A8F76]">Active Template</span>
                <h4 className="text-base font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  {currentTemplate?.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplateId(null)}
                className="text-xs font-bold text-[#636B2F] dark:text-[#D4DE95] underline hover:opacity-80"
              >
                Change Template
              </button>
            </div>

            {/* AI ENHANCER CARD */}
            <div className="apl-card space-y-4 border-2 border-[#D4DE95] dark:border-[#3D4127]">
              <div className="flex items-center justify-between border-b border-[#D3D6C4] dark:border-[#383D28] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#D4DE95] text-[#3D4127] flex items-center justify-center">
                    <SparklesIcon />
                  </div>
                  <h3 className="text-sm font-bold text-[#22241B] dark:text-[#EBF0DA]">
                    AI Content Enhancer
                  </h3>
                </div>
                <span className="apl-pill apl-pill-accent text-[10px]">Gemini AI</span>
              </div>

              {aiSuccessMsg && (
                <div className="p-3 rounded-lg bg-[#E2E8D5] text-[#3D4127] text-xs font-semibold flex items-center gap-2">
                  <span>✓</span>
                  <span>{aiSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="apl-label text-xs">Target Job Title / Role</label>
                  <input
                    type="text"
                    value={aiPromptRole}
                    onChange={(e) => setAiPromptRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="apl-input text-xs"
                  />
                </div>
                <div>
                  <label className="apl-label text-xs">Key Tech Stack / Competencies</label>
                  <input
                    type="text"
                    value={aiPromptSkills}
                    onChange={(e) => setAiPromptSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, Python, AWS"
                    className="apl-input text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={isEnhancing}
                  className="apl-btn apl-btn-primary w-full py-2.5 text-xs shadow-sm flex items-center justify-center gap-2"
                >
                  <SparklesIcon />
                  <span>{isEnhancing ? "Enhancing Resume..." : "Auto-Enhance Resume with AI"}</span>
                </button>
              </div>
            </div>

            {/* EDITOR TABS */}
            <div className="apl-card space-y-5">
              <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#D3D6C4] dark:border-[#383D28]">
                {["personal", "summary", "experience", "education", "skills"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEditorTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                      editorTab === tab
                        ? "bg-[#3D4127] text-[#D4DE95] dark:bg-[#D4DE95] dark:text-[#3D4127]"
                        : "text-[#52564A] dark:text-[#9CA485] hover:bg-[#ECEEDF] dark:hover:bg-[#2A2E1E]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* SECTION 1: PERSONAL INFO */}
              {editorTab === "personal" && (
                <div className="space-y-3">
                  <div>
                    <label className="apl-label text-xs">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={resumeData.personal.fullName}
                      onChange={handlePersonalChange}
                      className="apl-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="apl-label text-xs">Professional Title</label>
                    <input
                      type="text"
                      name="professionalTitle"
                      value={resumeData.personal.professionalTitle || ""}
                      onChange={handlePersonalChange}
                      className="apl-input text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="apl-label text-xs">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={resumeData.personal.email || ""}
                        onChange={handlePersonalChange}
                        className="apl-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="apl-label text-xs">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={resumeData.personal.phone || ""}
                        onChange={handlePersonalChange}
                        className="apl-input text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="apl-label text-xs">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={resumeData.personal.location || ""}
                        onChange={handlePersonalChange}
                        className="apl-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="apl-label text-xs">LinkedIn</label>
                      <input
                        type="text"
                        name="linkedin"
                        value={resumeData.personal.linkedin || ""}
                        onChange={handlePersonalChange}
                        className="apl-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: SUMMARY */}
              {editorTab === "summary" && (
                <div className="space-y-3">
                  <label className="apl-label text-xs">Professional Summary</label>
                  <textarea
                    rows={6}
                    value={resumeData.summary || ""}
                    onChange={handleSummaryChange}
                    className="apl-textarea text-xs"
                    placeholder="Write a compelling executive summary..."
                  />
                </div>
              )}

              {/* SECTION 3: EXPERIENCE */}
              {editorTab === "experience" && (
                <div className="space-y-4">
                  {resumeData.experience?.map((exp, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-[#D3D6C4] dark:border-[#383D28] space-y-2 bg-[#F8F9F1] dark:bg-[#171911]"
                    >
                      <span className="text-[10px] font-bold uppercase text-[#8A8F76]">
                        Position #{index + 1}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const newExp = [...resumeData.experience];
                            newExp[index].position = e.target.value;
                            setResumeData({ ...resumeData, experience: newExp });
                          }}
                          placeholder="Position Title"
                          className="apl-input text-xs"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...resumeData.experience];
                            newExp[index].company = e.target.value;
                            setResumeData({ ...resumeData, experience: newExp });
                          }}
                          placeholder="Company Name"
                          className="apl-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="apl-label text-[11px] mt-1">Bullet Achievements (one per line)</label>
                        <textarea
                          rows={4}
                          value={exp.bullets.join("\n")}
                          onChange={(e) => {
                            const newExp = [...resumeData.experience];
                            newExp[index].bullets = e.target.value.split("\n");
                            setResumeData({ ...resumeData, experience: newExp });
                          }}
                          className="apl-textarea text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION 4: EDUCATION */}
              {editorTab === "education" && (
                <div className="space-y-4">
                  {resumeData.education?.map((edu, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-[#D3D6C4] dark:border-[#383D28] space-y-2 bg-[#F8F9F1] dark:bg-[#171911]"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].degree = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                          placeholder="Degree"
                          className="apl-input text-xs"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].institution = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                          placeholder="Institution"
                          className="apl-input text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION 5: SKILLS */}
              {editorTab === "skills" && (
                <div className="space-y-4">
                  {resumeData.skills?.map((sg, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-[#D3D6C4] dark:border-[#383D28] space-y-2 bg-[#F8F9F1] dark:bg-[#171911]"
                    >
                      <input
                        type="text"
                        value={sg.category}
                        onChange={(e) => {
                          const newSkills = [...resumeData.skills];
                          newSkills[index].category = e.target.value;
                          setResumeData({ ...resumeData, skills: newSkills });
                        }}
                        placeholder="Category Name"
                        className="apl-input text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={sg.skills.join(", ")}
                        onChange={(e) => {
                          const newSkills = [...resumeData.skills];
                          newSkills[index].skills = e.target.value.split(",").map((s) => s.trim());
                          setResumeData({ ...resumeData, skills: newSkills });
                        }}
                        placeholder="Skills (comma separated)"
                        className="apl-input text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: LIVE PRINTABLE TEMPLATE PREVIEW (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between no-print">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8A8F76]">
                Live ATS Resume Preview
              </span>
              <span className="text-xs font-semibold text-[#4E7A33]">
                ✓ ATS Compliant Layout
              </span>
            </div>

            {/* PREVIEW CONTAINER */}
            <div
              id="printable-resume"
              ref={printRef}
              className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-[#D3D6C4] min-h-[800px]"
            >
              {SelectedComponent && <SelectedComponent resume={resumeData} />}
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {modalTemplateId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#171911] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#D3D6C4] dark:border-[#383D28] overflow-hidden">
            <div className="p-4 border-b border-[#D3D6C4] dark:border-[#383D28] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#22241B] dark:text-[#EBF0DA]">
                  {modalTemplate?.name} Preview
                </h3>
                <span className="text-xs text-[#8A8F76] uppercase tracking-wider">
                  Category: {modalTemplate?.category}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(modalTemplateId);
                    setModalTemplateId(null);
                  }}
                  className="apl-btn apl-btn-primary py-2 text-xs"
                >
                  Use This Template
                </button>
                <button
                  type="button"
                  onClick={() => setModalTemplateId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[#52564A] dark:text-[#9CA485]"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-100 flex justify-center">
              <div className="bg-white p-8 shadow-lg max-w-[800px] w-full">
                {ModalComponent && <ModalComponent resume={resumeData} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;