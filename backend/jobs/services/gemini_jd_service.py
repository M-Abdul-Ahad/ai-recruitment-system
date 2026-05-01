from google import genai
from core.settings import GEMINI_API_KEY
import json

client = genai.Client(api_key=GEMINI_API_KEY)

def generate_job_description(data: dict) -> str:
    """
    Generates a job description using Gemini AI.
    Expected data:
    {
        "title": "",
        "job_type": "",
        "location": "",
        "timings": "",
        "experience_required": "",
        "experience_details": "",
        "skills": [],
        "additional_requirements": "",
        "jd_prompt": ""
    }
    """
    title = data.get("title", "")
    job_type = data.get("job_type", "")
    location = data.get("location", "")
    timings = data.get("timings", "")
    experience_required = data.get("experience_required", "")
    experience_details = data.get("experience_details", "")
    skills = data.get("skills", [])
    if isinstance(skills, list):
        skills_str = ", ".join(skills)
    else:
        skills_str = str(skills)
    additional_requirements = data.get("additional_requirements", "")
    jd_prompt = data.get("jd_prompt", "")

    prompt=prompt = f"""
You are a senior HR professional and expert recruiter.

Generate a clean, professional, ATS-friendly Job Description.

IMPORTANT FORMATTING RULES:
- Output MUST be simple plain text (NO markdown, NO symbols like ## or **)
- Use CAPITAL LETTERS for section headings
- Keep spacing clean between sections
- Use "-" for bullet points
- Keep it readable in Notepad, Word, and web UI
- Do NOT over-style or decorate text

---

JOB DETAILS:

Job Title: {title}
Job Type: {job_type}
Location: {location}
Work Timings: {timings}
Experience Required: {experience_required} years

Detailed Experience:
{experience_details}

Core Skills:
{skills_str}

Additional Requirements:
{additional_requirements}

Recruiter Instructions:
{jd_prompt}

---

GENERATE OUTPUT IN THIS FORMAT:

JOB OVERVIEW
Write a short, clear summary of the role including job title, location, job type, and experience.

KEY RESPONSIBILITIES
- Write 5 to 7 practical responsibilities
- Keep them realistic and not overly fancy

REQUIRED SKILLS AND QUALIFICATIONS
- List must-have skills clearly
- Keep them simple and relevant

PREFERRED QUALIFICATIONS
- Add a few good-to-have skills

EXPERIENCE REQUIREMENTS
- Clearly describe expected experience

WORK DETAILS
Job Title: {title}
Job Type: {job_type}
Location: {location}
Work Timings: {timings}

BENEFITS AND PERKS
- Add 3 to 4 simple and realistic benefits

---

FINAL RULES:
- Keep language simple and professional
- Avoid buzzwords and over-complex sentences
- Make it look clean in plain text
- Do NOT use markdown or special formatting
"""

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
    )

    return response.text.strip()
