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
        ai_json = json.loads(ai_text)
        return ai_json
    except Exception:
        raise Exception(f"Invalid Gemini JSON response: {ai_text}")
