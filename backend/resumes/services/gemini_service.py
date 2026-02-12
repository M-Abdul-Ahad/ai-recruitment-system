from django.conf import settings
from google import genai

# Create Gemini client (NEW SDK)
client = genai.Client(api_key=settings.GEMINI_API_KEY)


def generate_resume_feedback(structured_resume_data: dict) -> str:
    """
    Generate AI resume improvement feedback using Gemini
    """

    prompt = f"""
    You are a professional HR recruiter and resume expert.

    Analyze the resume and generate improvement feedback.

    Provide:
    1. Professional summary of resume quality
    2. Strengths
    3. Weaknesses
    4. Missing or weak skills
    5. Experience improvement suggestions
    6. Resume formatting suggestions
    7. ATS optimization tips
    8. Career growth suggestions

    Resume Data:
    ----------------
    Skills: {structured_resume_data.get('skills')}
    Education: {structured_resume_data.get('education')}
    Experience: {structured_resume_data.get('experience')}
    Projects: {structured_resume_data.get('projects')}
    ----------------
    """

    response = client.models.generate_content(
    model="models/gemini-1.5-flash",
    contents=prompt
    )


    return response.text
