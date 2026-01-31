import React, { useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

function scoreImprovements(extractedText) {
  const text = (extractedText || "").trim();
  if (!text) return [];

  const lower = text.toLowerCase();

  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  const hasLinkedIn = lower.includes("linkedin.com");
  const hasGithub = lower.includes("github.com");
  const hasEducation = lower.includes("education") || lower.includes("degree") || lower.includes("university");
  const hasExperience = lower.includes("experience") || lower.includes("work history") || lower.includes("employment");
  const hasSkills = lower.includes("skills") || lower.includes("technical skills");
  const hasProjects = lower.includes("projects") || lower.includes("project");
  const hasSummary = lower.includes("summary") || lower.includes("objective") || lower.includes("profile");

  const bulletsCount = (text.match(/•|\n- |\n\* /g) || []).length;

  const suggestions = [];

  if (!hasEmail) suggestions.push("Add a professional email address (easy to contact).");
  if (!hasPhone) suggestions.push("Add a phone number so recruiters can reach you quickly.");
  if (!hasLinkedIn) suggestions.push("Add your LinkedIn profile link for credibility.");
  if (!hasGithub) suggestions.push("If you’re in tech, add GitHub link (projects + code).");
  if (!hasSummary) suggestions.push("Add a short 2–3 line summary/objective at the top.");
  if (!hasExperience) suggestions.push("Add an Experience section (even internships / volunteer work).");
  if (!hasProjects) suggestions.push("Add a Projects section with 2–3 strong projects (problem → solution → tech).");
  if (!hasEducation) suggestions.push("Add an Education section (degree, institute, year).");
  if (!hasSkills) suggestions.push("Add a Skills section (group by categories: Frontend, Backend, Tools).");

  if (bulletsCount < 6) suggestions.push("Use bullet points more (improves readability and ATS scanning).");

  // Extra: basic ATS tip
  suggestions.push("Keep headings simple (Experience, Education, Skills). Avoid fancy icons or tables for ATS.");

  return suggestions;
}

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const extractedText = result?.data?.extracted_text || "";
  const improvements = useMemo(() => scoreImprovements(extractedText), [extractedText]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please select a PDF or DOCX file.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);

      // ✅ Important: use correct endpoint (your backend now uses /api/resumes/upload/)
      const res = await fetch(`${API_BASE}/api/resumes/upload/`, {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.detail || data?.error || "Upload failed.");
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Network error. Is backend running on 127.0.0.1:8000?");
    } finally {
      setLoading(false);
    }
  };

  const fileUrl = result?.data?.file ? `${API_BASE}${result.data.file}` : "";

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb", padding: 24 }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          padding: 22,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>AI Recruitment System</h1>
            <p style={{ margin: "6px 0 0", color: "#666" }}>
              Upload resume → extract text → show improvements
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "#eef2ff",
                color: "#334155",
                fontSize: 12,
              }}
            >
              Backend: {API_BASE}
            </span>
          </div>
        </div>

        {/* Upload Card */}
        <div
          style={{
            marginTop: 18,
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
            background: "#fafafa",
          }}
        >
          <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Resume Upload</h2>

          <form onSubmit={onSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 10,
                background: "#fff",
                flex: "1 1 320px",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>

          {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

          {result && (
            <div style={{ marginTop: 12 }}>
              <p style={{ margin: 0, color: "#16a34a", fontWeight: 600 }}>
                ✅ Resume uploaded successfully
              </p>

              {fileUrl && (
                <p style={{ marginTop: 8 }}>
                  Uploaded file:{" "}
                  <a href={fileUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {result && (
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 }}>
            {/* Extracted Text */}
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
              <h3 style={{ margin: "0 0 10px" }}>Extracted Text</h3>

              <div
                style={{
                  whiteSpace: "pre-wrap",
                  background: "#0b1220",
                  color: "#e5e7eb",
                  padding: 12,
                  borderRadius: 10,
                  minHeight: 260,
                  maxHeight: 420,
                  overflow: "auto",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {extractedText ? extractedText : "No extracted text returned. Check serializer fields."}
              </div>
            </div>

            {/* Improvements */}
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
              <h3 style={{ margin: "0 0 10px" }}>Improvements</h3>

              {improvements.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, color: "#111827", lineHeight: 1.6 }}>
                  {improvements.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, color: "#555" }}>Upload a resume to see suggestions.</p>
              )}

              {/* Raw JSON (optional) */}
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: "pointer", color: "#2563eb" }}>Show API Response</summary>
                <pre style={{ marginTop: 8, background: "#f5f5f5", padding: 10, overflow: "auto" }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
