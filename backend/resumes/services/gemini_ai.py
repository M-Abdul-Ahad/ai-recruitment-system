from google import genai
from core.settings import GEMINI_API_KEY
import json

# ✅ keep working client code
client = genai.Client(api_key=GEMINI_API_KEY)


def generate_ai_resume_feedback(resume_data: dict):
    """
    resume_data = {
        "skills": [...],
        "education": [...],
        "experience": [...],
        "extracted_text": "...",
        "cleaned_text": "..."
    }
    """

    prompt = f"""
You are an expert AI Resume Reviewer and Career Coach.

Analyze the following resume information and generate professional resume feedback with actionable certifications recommendations.

Structured Data + Full Resume Text is provided.

Resume Data:
{json.dumps(resume_data, indent=2)}

Return STRICTLY valid JSON in the format below:

{{
  "score": 0-100,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."],
  "recommended_certifications": [
    {{
      "name": "Certification Name",
      "platform": "Coursera",
      "reason": "Why this certification will improve the resume",
      "estimated_duration": "4 weeks",
      "difficulty": "Intermediate"
    }}
  ],
  "category_scores": {{
    "skills": 0-100,
    "experience": 0-100,
    "education": 0-100,
    "formatting": 0-100
  }},
  "summary_feedback": "..."
}}

Instructions:
- Analyze the resume and identify skill gaps
- Recommend 2-3 relevant Coursera certifications that would strengthen the resume
- Each certification should directly address weaknesses or enhance existing strengths
- Include practical, industry-recognized certifications
- Focus on high-demand skills in the candidate's field

Rules:
- Only JSON
- No markdown
- No explanation
- No commentary
- No text outside JSON
"""

    # ✅ keep same working call structure
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
    )

    ai_text = response.text.strip()

    # ✅ safe JSON parsing
    try:
        # Strip code fences if present
        clean_text = ai_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        ai_json = json.loads(clean_text)
        return ai_json
    except Exception:
        raise Exception(f"Invalid Gemini JSON response: {ai_text}")


def tailor_resume_for_job_ai(resume_data: dict, job_title: str, job_description: str, requirements: str = ""):
    """
    Tailors resume data specifically to match a target job description and title
    to maximize ATS score and relevancy while strictly keeping user's authentic profile.
    """

    prompt = f"""
You are an elite ATS (Applicant Tracking System) Resume Optimization Specialist & Senior Technical Recruiter.

YOUR OBJECTIVE:
Tailor and optimize the candidate's resume specifically for the target Job Posting below to achieve maximum ATS keyword match score and recruiter shortlisting.

============================================================
TARGET JOB DETAILS:
Job Title: {job_title}
Job Description:
{job_description}

Requirements / Qualifications:
{requirements}
============================================================

CANDIDATE'S ORIGINAL RESUME DATA:
{json.dumps(resume_data, indent=2)}
============================================================

OPTIMIZATION RULES & GUARDRAILS:
1. AUTHENTICITY GUARDRAIL: Keep all actual company names, job titles, education, dates, institutions, and core project names intact. DO NOT fabricate non-existent companies or fake degrees.
2. PROFESSIONAL SUMMARY: Rewrite the summary (3-4 impactful sentences) laser-focused on the target job title, highlighting the candidate's strongest matching skills, experience depth, and value proposition using primary JD keywords.
3. EXPERIENCE BULLETS (STAR METHOD):
   - Refine and polish each experience bullet point to emphasize relevant achievements, technical tools, architectures, problem-solving, and metrics that align with the target JD.
   - Weave in high-impact ATS action verbs and target keywords (e.g. system design, performance optimization, REST APIs, agile, CI/CD, automation) based on what the candidate worked on.
   - Keep 3-5 concise, impactful bullet points per experience item.
4. PROJECTS:
   - Enhance project bullet points and listed technologies to highlight features and capabilities most relevant to the target job requirements.
5. SKILLS ALIGNMENT:
   - Organize and prioritize skills so the most critical technical and domain skills required by the JD appear prominently first.
6. FORMAT: Return strictly valid JSON adhering exactly to the structure below.

OUTPUT JSON STRUCTURE:
{{
  "personal": {{
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "address": "...",
    "title": "{job_title}",
    "linkedin": "...",
    "github": "...",
    "portfolio": "..."
  }},
  "summary": "...",
  "education": [
    {{
      "degree": "...",
      "institution": "...",
      "field": "...",
      "location": "...",
      "startDate": "...",
      "endDate": "..."
    }}
  ],
  "experience": [
    {{
      "company": "...",
      "position": "...",
      "location": "...",
      "startDate": "...",
      "endDate": "...",
      "current": false,
      "bullets": ["..."]
    }}
  ],
  "skills": [
    {{
      "category": "Technical & Professional Skills",
      "skills": ["skill1", "skill2", "..."]
    }}
  ],
  "projects": [
    {{
      "name": "...",
      "description": "...",
      "technologies": ["tech1", "tech2"],
      "bullets": ["..."]
    }}
  ],
  "certifications": [],
  "awards": [],
  "volunteerExperience": [],
  "languages": [],
  "memberships": [],
  "ats_optimization_notes": {{
    "target_role": "{job_title}",
    "matching_keywords": ["keyword1", "keyword2", "keyword3"],
    "key_improvements": ["improvement 1", "improvement 2"]
  }}
}}

STRICT RULES:
- Output only valid JSON.
- No markdown formatting fences around JSON if possible, or clean standard JSON.
- No conversational text or preamble.
"""

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
    )

    ai_text = response.text.strip()

    try:
        clean_text = ai_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        tailored_json = json.loads(clean_text)
        return tailored_json
    except Exception as e:
        raise Exception(f"Failed to parse Gemini ATS optimization response: {str(e)} | Response: {ai_text}")

