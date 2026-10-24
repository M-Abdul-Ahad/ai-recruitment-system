"""
jobs/services/interview_kit_service.py
--------------------------------------
Generates personalized interview kits (questions, expected answers, and evaluation criteria)
for candidates based on their extracted resume text, target Job Description, and difficulty level.
Uses the dedicated GEMINI_INTERVIEW_API_KEY (falling back to GEMINI_API_KEY).
Persists results directly into the CandidateInterviewKit model.
"""
import json
import logging
import re
from typing import Tuple, Optional, Dict, Any, List

from django.conf import settings
from google import genai
from jobs.models import JobApplication, CandidateInterviewKit

logger = logging.getLogger("jobs.interview_kit_service")

# Supported models list for text generation
GEMINI_MODELS = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]


def get_gemini_client() -> genai.Client:
    """
    Initializes Google GenAI client using GEMINI_INTERVIEW_API_KEY or GEMINI_API_KEY.
    """
    api_key = (
        getattr(settings, "GEMINI_INTERVIEW_API_KEY", "")
        or getattr(settings, "GEMINI_API_KEY", "")
        or ""
    ).strip()

    if not api_key:
        raise ValueError(
            "Neither GEMINI_INTERVIEW_API_KEY nor GEMINI_API_KEY is configured in backend/.env."
        )
    return genai.Client(api_key=api_key)


def generate_candidate_interview_kit(
    application: JobApplication,
    difficulty: str = "Mid-Level"
) -> Tuple[Optional[CandidateInterviewKit], Optional[str]]:
    """
    Generates 10 tailored interview questions and model answers based on the candidate's
    actual resume claims and the job description requirements. Saves or updates the
    CandidateInterviewKit record for the application.

    Returns:
        (CandidateInterviewKit, None) on success,
        (None, error_message) on failure.
    """
    job = application.job
    resume = application.resume

    resume_text = ""
    if resume:
        resume_text = (resume.cleaned_text or resume.extracted_text or "").strip()

    if not resume_text:
        return None, "Candidate resume has no extracted text available to analyze."

    # Prepare job context
    skills_list = []
    if hasattr(job, "skills"):
        skills_list = [s.name for s in job.skills.all()]
    skills_str = ", ".join(skills_list) if skills_list else "Not specified"

    # Truncate resume text if excessively long (e.g. 15k chars is plenty for context)
    if len(resume_text) > 15000:
        resume_text = resume_text[:15000] + "\n...[truncated]"

    prompt = f"""
You are an expert technical interviewer and hiring committee chair for high-growth tech companies.

Your task is to generate exactly 10 deeply personalized interview questions and expected model answers for a candidate applying to this role.
The questions MUST specifically interrogate the actual experiences, projects, tools, frameworks, and architecture choices stated in the candidate's resume, cross-referenced with the job's requirements, to verify whether the candidate truly knows what they have written on their resume.

Target Seniority / Difficulty Level: {difficulty}

--- JOB REQUIREMENTS ---
Job Title: {job.title}
Required Experience: {job.experience_required} years
Required Skills: {skills_str}
Job Description:
{job.description}

--- CANDIDATE RESUME TEXT ---
{resume_text}

--- INSTRUCTIONS FOR GENERATION ---
1. Generate exactly 10 personalized questions divided across relevant technical & behavioral areas (e.g., Core Engineering & Architecture, Tools & Frameworks, Problem Solving & Real-world Edge Cases, Team & Delivery).
2. Every question must directly quote or probe a specific bullet point, metric, project, or technology explicitly found in the candidate's resume (e.g. "In your experience at [Company/Project], you mentioned implementing [Feature/Tool]...").
3. For each question, provide:
   - "category": High-level domain (e.g., "Architecture & Systems", "Core Technology Depth", "Troubleshooting & Edge Cases", "Collaboration & Execution")
   - "topic": Specific technology or concept (e.g., "PostgreSQL Indexing & Query Tuning")
   - "question": The exact conversational, incisive question the recruiter or interviewer should ask.
   - "expected_answer": A comprehensive summary of what an impressive, knowledgeable candidate should say.
   - "evaluation_criteria": Clear bullet-point signals and red flags for the interviewer.

4. Calibrate the complexity to the selected difficulty ({difficulty}):
   - Junior: Focus on foundational mechanics, syntax, logic, and reasoning behind choices.
   - Mid-Level: Focus on practical implementation tradeoffs, edge cases, debugging, and testing.
   - Senior: Focus on system architecture, scalability, reliability, distributed systems, and performance bottlenecks.
   - Lead / Expert: Focus on strategic architecture, org-level standards, cross-functional leadership, and deep fault tolerance.

5. IMPORTANT FORMATTING REQUIREMENT:
   You MUST return ONLY a valid, strictly formatted JSON array containing 10 objects. Do NOT include markdown code fences or conversational greetings.
   The structure must match this schema:
   [
     {{
       "id": 1,
       "category": "string",
       "topic": "string",
       "question": "string",
       "expected_answer": "string",
       "evaluation_criteria": "string"
     }}
   ]
"""

    client = get_gemini_client()

    raw_response = None
    last_err = None

    for model_name in GEMINI_MODELS:
        try:
            logger.info("Attempting interview kit generation with model %s", model_name)
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            if response and response.text:
                raw_response = response.text.strip()
                break
        except Exception as e:
            logger.warning("Model %s failed: %s", model_name, e)
            last_err = e

    if not raw_response:
        return None, f"Failed to generate questions from AI: {last_err}"

    # Extract JSON from response
    # Remove markdown code block fences if present (e.g. ```json ... ```)
    cleaned_json = raw_response
    if "```" in cleaned_json:
        # Regex to find json within code fences or between first [ and last ]
        match = re.search(r'```(?:json)?\s*(\[\s*\{.*\}\s*\])\s*```', cleaned_json, re.DOTALL)
        if match:
            cleaned_json = match.group(1)
        else:
            cleaned_json = re.sub(r'```(?:json)?|```', '', cleaned_json).strip()

    # Find bracket boundaries
    start_idx = cleaned_json.find("[")
    end_idx = cleaned_json.rfind("]")
    if start_idx != -1 and end_idx != -1:
        cleaned_json = cleaned_json[start_idx:end_idx + 1]

    try:
        questions_data = json.loads(cleaned_json)
        if not isinstance(questions_data, list) or len(questions_data) == 0:
            return None, "AI did not return a valid list of questions."
    except json.JSONDecodeError as jde:
        logger.error("JSON decode error parsing questions: %s\nRaw output:\n%s", jde, raw_response)
        return None, f"Failed to parse AI generated questions: {jde}"

    # Normalize question IDs
    for idx, q in enumerate(questions_data, start=1):
        q["id"] = idx

    # Save or update in database
    kit, created = CandidateInterviewKit.objects.update_or_create(
        application=application,
        defaults={
            "difficulty": difficulty,
            "questions": questions_data,
        }
    )

    logger.info("Successfully %s interview kit for application #%s (%d questions)",
                "created" if created else "updated", application.id, len(questions_data))
    return kit, None
