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
    You are an expert ATS Resume Optimizer and Senior Technical Recruiter.

    TASK:
    Tailor the candidate's resume for the target role using ONLY facts supported by the original resume. Make it highly ATS-friendly, precise, professional, and naturally aligned with the JD.

    TARGET ROLE: {job_title}

    JOB DESCRIPTION:
    {job_description}

    REQUIREMENTS:
    {requirements}

    ORIGINAL RESUME:
    {json.dumps(resume_data, indent=2)}

    RULES:
    1. AUTHENTICITY FIRST:
    - Never invent companies, titles, dates, degrees, projects, technologies, responsibilities, achievements, certifications, or metrics.
    - Do not claim a skill simply because it appears in the JD.
    - Only use a JD keyword when it is explicitly supported by the resume or can be truthfully inferred from existing work.
    - Preserve factual identity, employment history, education, dates, and project names.

    2. JD ALIGNMENT:
    - Identify the most important skills, technologies, responsibilities, domain terms, and ATS keywords in the JD.
    - Naturally embed supported JD terminology into the summary, experience, projects, and skills.
    - Prefer the JD's terminology when it accurately describes existing candidate experience.
    - Prioritize the most relevant existing experience instead of adding irrelevant content.
    - The final resume should read like a resume genuinely written for this role, not a keyword dump.

    3. SUMMARY:
    - Write 3-4 concise, high-impact sentences.
    - Lead with the candidate's strongest experience relevant to the target role.
    - Include important supported JD keywords naturally.
    - Emphasize expertise, technical strengths, relevant domain experience, and value.

    4. EXPERIENCE:
    - Preserve every real company, position, location, date, and employment status.
    - Rewrite bullets to emphasize responsibilities and achievements most relevant to the JD.
    - Use strong action verbs and concrete technical context.
    - Preserve existing metrics; never manufacture metrics.
    - Prefer 2-4 highly relevant bullets per company. Use fewer if the role has limited relevant content.
    - Keep each bullet concise and information-dense; avoid generic filler.
    - Do not force STAR formatting when it makes a bullet unnatural.

    5. PROJECTS:
    - Keep only factual project information from the original resume.
    - Prioritize projects relevant to the target role.
    - Rewrite descriptions/bullets to emphasize JD-relevant functionality, architecture, technologies, and outcomes.
    - Do not add technologies merely because they appear in the JD.

    6. SKILLS:
    - Reorder existing skills so the strongest JD-relevant skills appear first.
    - Group skills logically by category.
    - Add no new skill unless supported by the original resume.
    - Avoid duplicate or overly generic skills.

    7. LENGTH & PRECISION:
    - Optimize for a concise professional resume, not maximum text.
    - Summary: approximately 3-4 sentences.
    - Each experience/company: approximately 2-4 concise bullets depending on relevance.
    - Projects: approximately 1-3 concise bullets each.
    - Keep bullets generally to one compact sentence; combine related information when useful.
    - Do not pad sections to meet an artificial line count.
    - Every sentence should contribute evidence, relevance, or ATS value.

    8. ATS:
    - Use exact or close JD terminology where truthful.
    - Include important acronyms and their expanded forms when supported and useful.
    - Favor standard job titles, technologies, methodologies, tools, and domain terminology.
    - Avoid keyword stuffing, repetition, vague claims, and unnatural phrasing.
    - Optimize for both ATS matching and human recruiter readability.

    9. PRIORITIZATION:
    Rank information by:
    JD relevance > demonstrated candidate strength > measurable impact > technical specificity > general information.

    Return ONLY valid JSON using exactly this structure:

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
          "skills": ["skill1", "skill2"]
        }}
      ],
      "projects": [
        {{
          "name": "...",
          "description": "...",
          "technologies": ["..."],
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
        "matching_keywords": ["..."],
        "key_improvements": ["..."]
      }}
    }}
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

