import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const RoleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SkillsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

const ResumeBuilder = () => {
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        role: "",
        skills: "",
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPreview, setGeneratedPreview] = useState(null);

    console.log("PAGE LOADED: Resume Builder");
    console.log("CURRENT USER:", user);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleGenerate = () => {
        console.log("GENERATE RESUME WITH:", formData);
        setIsGenerating(true);
        setTimeout(() => {
          setIsGenerating(false);
          setGeneratedPreview({
            role: formData.role || "Target Role",
            summary: `Driven and results-oriented professional targeting ${formData.role || "Target Position"}. Proven expertise in key technology stack: ${formData.skills || "Core technical & soft skills"}.`,
            highlights: [
              `Architected scalable applications tailored for ${formData.role || "enterprise engineering"}.`,
              `Applied modern best practices including automated CI/CD and unit test coverage.`,
              `Collaborated cross-functionally to drive features from discovery to production.`
            ]
          });
        }, 600);
    };

    const quickRoles = [
      "Fullstack Developer",
      "Frontend Engineer",
      "Backend Engineer",
      "Data Scientist",
      "Product Manager",
      "DevOps Engineer"
    ];

    return (
        <div className="apl-animate-fade space-y-8">
            {/* PAGE HEADER */}
            <div className="border-b border-[#D3D6C4] dark:border-[#383D28] pb-5">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] dark:text-[#9CA485]">
                AI Generation Studio
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#22241B] dark:text-[#EBF0DA] tracking-tight mt-1">
                AI Resume Builder
              </h1>
              <p className="text-xs sm:text-sm text-[#52564A] dark:text-[#9CA485] mt-1">
                Generate high-impact bullet points and tailored resume profiles calibrated for recruiter tracking algorithms.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* FORM SECTION */}
              <div className="lg:col-span-6 space-y-6">
                <div className="apl-card space-y-6">
                  {/* TARGET ROLE INPUT */}
                  <div>
                    <label className="apl-label flex items-center gap-2">
                      <RoleIcon />
                      <span>Target Role Title</span>
                    </label>
                    <input
                      type="text"
                      name="role"
                      placeholder="e.g. Senior Fullstack Engineer"
                      value={formData.role}
                      onChange={handleChange}
                      className="apl-input"
                    />

                    {/* QUICK ROLE SUGGESTIONS */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {quickRoles.map((roleTitle) => (
                        <button
                          key={roleTitle}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: roleTitle })}
                          className="px-2.5 py-1 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] text-[11px] font-semibold text-[#52564A] dark:text-[#9CA485] hover:bg-[#D4DE95] hover:text-[#3D4127] transition"
                        >
                          + {roleTitle}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SKILLS INPUT */}
                  <div>
                    <label className="apl-label flex items-center gap-2">
                      <SkillsIcon />
                      <span>Skills & Core Competencies</span>
                    </label>
                    <textarea
                      name="skills"
                      placeholder="e.g. React, Node.js, TypeScript, PostgreSQL, AWS, GraphQL, Docker..."
                      value={formData.skills}
                      onChange={handleChange}
                      rows={5}
                      className="apl-textarea"
                    />
                    <p className="text-[11px] text-[#8A8F76] mt-1.5">
                      Separate skills with commas or enter key responsibilities to include in your draft.
                    </p>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || (!formData.role && !formData.skills)}
                    className="apl-btn apl-btn-primary w-full py-3 shadow-md"
                  >
                    <SparklesIcon />
                    <span>{isGenerating ? "Synthesizing Draft..." : "Generate AI Resume Draft"}</span>
                  </button>
                </div>
              </div>

              {/* PREVIEW SECTION */}
              <div className="lg:col-span-6 space-y-6">
                <div className="apl-card h-full flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex justify-between items-center pb-3 border-b border-[#D3D6C4] dark:border-[#383D28] mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] dark:text-[#9CA485]">
                        AI Draft Preview
                      </span>
                      <span className="apl-pill apl-pill-accent text-[10px]">
                        AI Model V4
                      </span>
                    </div>

                    {generatedPreview ? (
                      <div className="space-y-4 apl-animate-scale">
                        <div className="p-4 rounded-xl bg-[#F8F9F1] dark:bg-[#171911] border border-[#D3D6C4] dark:border-[#383D28]">
                          <h3 className="text-lg font-bold text-[#3D4127] dark:text-[#D4DE95]">
                            {generatedPreview.role}
                          </h3>
                          <p className="text-xs text-[#52564A] dark:text-[#9CA485] mt-2 leading-relaxed">
                            {generatedPreview.summary}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-[#8A8F76] mb-2">
                            Generated Key Highlights
                          </h4>
                          <ul className="space-y-2">
                            {generatedPreview.highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-[#22241B] dark:text-[#EBF0DA] p-2.5 rounded-lg bg-[#ECEEDF]/60 dark:bg-[#2A2E1E]/60">
                                <span className="text-[#636B2F] dark:text-[#D4DE95] font-bold">•</span>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 text-center text-[#8A8F76] space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#ECEEDF] dark:bg-[#2A2E1E] flex items-center justify-center mx-auto text-[#636B2F] dark:text-[#D4DE95]">
                          <SparklesIcon />
                        </div>
                        <p className="text-xs font-semibold">
                          Fill in target role and skills on the left, then click "Generate AI Resume Draft".
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#D3D6C4] dark:border-[#383D28] text-right">
                    <span className="text-[11px] text-[#8A8F76]">Logged in as: {user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;