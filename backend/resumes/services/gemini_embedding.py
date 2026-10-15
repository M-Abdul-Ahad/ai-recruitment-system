import math
import logging
from django.conf import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768


def get_embedding_client() -> genai.Client:
    """
    Initializes and returns the Google GenAI client using the dedicated
    GEMINI_EMBEDDING_API_KEY. Raises ValueError if not configured.
    """
    api_key = getattr(settings, "GEMINI_EMBEDDING_API_KEY", "") or ""
    api_key = api_key.strip()
    if not api_key:
        raise ValueError(
            "GEMINI_EMBEDDING_API_KEY is not configured in .env. "
            "Please add your Gemini API key to .env to generate embeddings."
        )
    return genai.Client(api_key=api_key)


def build_job_embedding_text(job) -> str:
    """
    Constructs a rich, semantically dense representation of a Job
    for generating high-quality JD embeddings.
    """
    skills = ""
    if getattr(job, "pk", None) and hasattr(job, "skills"):
        skills = ", ".join([s.name for s in job.skills.all()])

    parts = [
        f"Job Title: {job.title}",
        f"Required Experience: {job.experience_required} years" if getattr(job, "experience_required", None) is not None else "",
        f"Required Skills: {skills}" if skills else "",
        f"Job Description:\n{job.description or ''}"
    ]
    return "\n\n".join([p for p in parts if p.strip()])


def build_resume_embedding_text(resume) -> str:
    """
    Constructs a structured representation of a candidate resume.
    Prefers structured skills, experience, and cleaned_text.
    """
    skills = []
    experiences = []
    educations = []

    if getattr(resume, "pk", None):
        if hasattr(resume, "skills"):
            skills = [s.name for s in resume.skills.all()]

        if hasattr(resume, "experience"):
            for exp in resume.experience.all()[:5]:
                exp_str = f"{exp.job_title} at {exp.company}"
                if exp.description:
                    exp_str += f": {exp.description[:150]}"
                experiences.append(exp_str)

        if hasattr(resume, "education"):
            for edu in resume.education.all()[:3]:
                educations.append(f"{edu.degree} from {edu.institution}")

    body_text = (resume.cleaned_text or resume.extracted_text or "")[:12000]

    parts = []
    if skills:
        parts.append(f"Candidate Skills: {', '.join(skills)}")
    if experiences:
        parts.append(f"Work Experience:\n" + "\n".join(experiences))
    if educations:
        parts.append(f"Education:\n" + "\n".join(educations))
    if body_text:
        parts.append(f"Resume Content:\n{body_text}")

    return "\n\n".join([p for p in parts if p.strip()])


def build_temporary_candidate_embedding_text(candidate) -> str:
    """
    Constructs representation for a temporary bulk-imported resume candidate.
    Extracts explicit skills and preserves full document text up to 12,000 characters
    so that zero critical candidate experience is missed.
    """
    from resumes.utils import extract_skills
    cleaned = candidate.cleaned_text or candidate.extracted_text or ""
    detected_skills = extract_skills(cleaned) if cleaned else []

    parts = []
    if detected_skills:
        parts.append(f"Candidate Skills: {', '.join(detected_skills)}")
    if cleaned:
        parts.append(f"Resume Document ({candidate.file_name}):\n{cleaned[:12000]}")

    return "\n\n".join(parts) if parts else candidate.file_name


def calculate_cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Computes cosine similarity between two float vectors.
    Returns float in range [0.0, 1.0].
    """
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    cos_sim = dot_product / (norm_a * norm_b)
    cos_sim = max(-1.0, min(1.0, cos_sim))
    # Normalize [-1, 1] to [0, 1]
    return (cos_sim + 1.0) / 2.0



def generate_embedding(text: str) -> list[float]:
    """
    Generates a 768-dimensional embedding vector for a given text string.
    Returns a list of 768 floats, or an empty list on failure.
    """
    if not text or not text.strip():
        return []

    client = get_embedding_client()
    # Clamp text to avoid exceeding token limit (approx 25,000 chars)
    clamped_text = text.strip()[:25000]

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=clamped_text,
        config={"output_dimensionality": EMBEDDING_DIMENSIONS},
    )

    if response.embeddings and len(response.embeddings) > 0:
        return list(response.embeddings[0].values)
    return []


def generate_embeddings_batch(texts: list[str], batch_size: int = 15) -> list[list[float]]:
    """
    Generates embeddings for a list of texts in chunks to respect API rate limits.
    """
    if not texts:
        return []

    client = get_embedding_client()
    all_vectors = []

    for i in range(0, len(texts), batch_size):
        chunk = [t.strip()[:25000] if t and t.strip() else "Empty" for t in texts[i:i + batch_size]]
        try:
            response = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=chunk,
                config={"output_dimensionality": EMBEDDING_DIMENSIONS},
            )
            for emb in response.embeddings:
                all_vectors.append(list(emb.values))
        except Exception as e:
            logger.error(f"Error in batch embedding generation: {e}")
            # Fall back to single-item processing for this batch so one failed item doesn't drop the rest
            for t in chunk:
                try:
                    vec = generate_embedding(t)
                    all_vectors.append(vec)
                except Exception as inner_e:
                    logger.error(f"Error embedding single item: {inner_e}")
                    all_vectors.append([])

    return all_vectors
