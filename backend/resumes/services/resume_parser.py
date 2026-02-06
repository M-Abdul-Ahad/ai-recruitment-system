from resumes.models import Education
from resumes.utils import (
    extract_education_section,
    parse_education
)
import re

def normalize_text(text):
    # remove spaced letters like F E B
    text = re.sub(r'(\b[A-Z])\s+([A-Z]\b)', r'\1\2', text)
    
    # collapse multiple spaces BUT KEEP newlines
    text = re.sub(r'[ \t]+', ' ', text)   # ✅ only spaces, not \n
    
    return text.lower()



def save_education_data(resume):
    """
    Extract and save education information for a resume
    """
    if not resume.cleaned_text:
        return

    education_lines = extract_education_section(resume.cleaned_text)
    print("---- EDUCATION LINES ----")
    print(education_lines)
    education_data = parse_education(education_lines)

    for edu in education_data:
        Education.objects.create(
            resume=resume,
            degree=edu.get("degree", ""),
            institution=edu.get("institution", ""),
            year=edu.get("year", "")
        )

from resumes.models import Experience
from resumes.utils import (
    extract_experience_section,
    split_experience_blocks,
    parse_experience
)

def save_experience_data(resume):
    if not resume.cleaned_text:
        return

    experience_lines = extract_experience_section(resume.cleaned_text)
    print("---- EXPERIENCE LINES ----")
    print(experience_lines)
    blocks = split_experience_blocks(experience_lines)
    experience_data = parse_experience(blocks)

    for exp in experience_data:
        Experience.objects.create(
            resume=resume,
            job_title=exp.get("job_title", ""),
            company=exp.get("company", ""),
            duration=exp.get("duration", ""),
            description=exp.get("description", "")
        )

from resumes.utils import clean_resume_text, extract_skills
from resumes.models import ResumeSkill


def parse_and_store_resume_data(resume):
    if not resume.extracted_text:
        return

    normalized_text = normalize_text(resume.extracted_text)
    cleaned_text = clean_resume_text(normalized_text)

    resume.cleaned_text = cleaned_text
    resume.save()

    print("---- CLEANED TEXT ----")
    print(resume.cleaned_text[:1000])

    ResumeSkill.objects.filter(resume=resume).delete()
    skills = extract_skills(cleaned_text)

    for skill in skills:
        ResumeSkill.objects.create(
            resume=resume,
            name=skill
        )

    Education.objects.filter(resume=resume).delete()
    save_education_data(resume)

    Experience.objects.filter(resume=resume).delete()
    save_experience_data(resume)
