"""
jobs/services/shortlist_scorer.py
-----------------------------------
LLM-powered re-ranking and insight generation for candidate shortlisting.

Architecture:
  1. Receives top N*2 candidates pre-ranked by cosine similarity.
  2. Sends a single batch Gemini LLM call with all candidates vs the JD.
  3. Returns each candidate enriched with:
       - final_score   : LLM-calibrated match score (0-100)
       - shortlist_reason : 1-sentence plain-language explanation
       - match_insights : {plus_points, concerns, similarity_score, llm_score}
  4. On ANY failure (API error, JSON parse error, quota) the caller receives
     the original candidates unchanged — shortlisting never fails because of LLM.

Environment:
  GEMINI_SHORTLIST_API_KEY in backend/.env  (falls back to GEMINI_API_KEY)
"""

import json
import logging
import re
from typing import List, Dict, Any, Optional

from django.conf import settings
from google import genai

logger = logging.getLogger("jobs.shortlist_scorer")

# Model preference order — tries newer models first, falls back gracefully
SHORTLIST_MODELS = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]

# Maximum characters of resume text sent to LLM per candidate
# Keep lean so the batch prompt doesn't blow the context window
MAX_RESUME_CHARS_PER_CANDIDATE = 4000

# Maximum candidates sent in one LLM batch call
# If top_n * 2 exceeds this, we cap it here
MAX_BATCH_SIZE = 40


def _get_shortlist_client() -> genai.Client:
    """Returns a Gemini client using GEMINI_SHORTLIST_API_KEY (or GEMINI_API_KEY fallback)."""
    api_key = (
        getattr(settings, "GEMINI_SHORTLIST_API_KEY", "")
        or getattr(settings, "GEMINI_API_KEY", "")
        or ""
    ).strip()

    if not api_key:
        raise ValueError(
            "Neither GEMINI_SHORTLIST_API_KEY nor GEMINI_API_KEY is configured. "
            "Add GEMINI_SHORTLIST_API_KEY=<your-key> to backend/.env"
        )
    return genai.Client(api_key=api_key)


def _extract_resume_text(candidate_dict: Dict[str, Any]) -> str:
    """
    Extracts the best available resume text from a candidate scoring dict.
    Works for both 'applicant' and 'temporary' candidate kinds.
    """
    kind = candidate_dict.get("kind")

    if kind == "applicant":
        app = candidate_dict.get("app")
        if app and app.resume:
            text = app.resume.cleaned_text or app.resume.extracted_text or ""
            return text[:MAX_RESUME_CHARS_PER_CANDIDATE].strip()

    elif kind == "temporary":
        tc = candidate_dict.get("temp_candidate")
        if tc:
            text = tc.cleaned_text or tc.extracted_text or ""
            return text[:MAX_RESUME_CHARS_PER_CANDIDATE].strip()

    return ""


def _build_batch_prompt(
    job,
    candidates: List[Dict[str, Any]],
    preferences: str = "",
    decomp: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Builds the LLM prompt for batch candidate evaluation.

    Each candidate is represented by their name and resume excerpt.
    The LLM returns a JSON array with one entry per candidate, in input order.
    """
    # Gather job skills
    skills_str = ""
    try:
        if hasattr(job, "skills"):
            skills_list = [s.name for s in job.skills.all()]
            skills_str = ", ".join(skills_list)
    except Exception:
        pass

    # Truncate job description to avoid context overflow
    jd_text = (job.description or "")[:3000]

    # Build candidate array for the prompt
    candidates_data = []
    for i, cand in enumerate(candidates):
        resume_text = _extract_resume_text(cand)
        candidates_data.append({
            "index": i,
            "name": cand.get("name", f"Candidate {i + 1}"),
            "similarity_score": round(cand.get("score", 0), 1),
            "resume_excerpt": resume_text or "(No resume text available)",
        })

    candidates_json = json.dumps(candidates_data, indent=2, ensure_ascii=False)

    pref_section = ""
    if preferences and preferences.strip():
        pos_query = decomp.get("positive_query", "") if decomp else ""
        neg_keys = decomp.get("negative_keywords", []) if decomp else []
        conc_negs = decomp.get("conceptual_negatives", []) if decomp else []

        neg_keys_str = ", ".join(neg_keys) if neg_keys else "None"
        conc_negs_str = ", ".join(conc_negs) if conc_negs else "None"

        pref_section = f"""
--- RECRUITER CUSTOM PREFERENCES & CONSTRAINTS ---
Raw Recruiter Request:
"{preferences.strip()}"

1. Positive Desires (Award higher final_scores & highlight in 'plus_points'):
   {pos_query or preferences.strip()}

2. Hard Excluded Keywords (STRICT ZERO-TOLERANCE: If resume contains these, assign final_score = 0):
   {neg_keys_str}

3. Conceptual Disqualifiers (Heavily penalize in final_score & note in 'concerns'):
   {conc_negs_str}

INSTRUCTIONS FOR CONSTRAINTS:
- If a candidate explicitly has any technology, tool, or trait listed in Hard Excluded Keywords, assign final_score = 0 and note "Excluded: Contains prohibited technology [keyword] per recruiter constraints" in 'shortlist_reason' and 'concerns'.
--- END RECRUITER PREFERENCES ---
"""

    prompt = f"""You are an expert senior technical recruiter performing final candidate evaluation.

You are given a Job Description and {len(candidates)} candidate resume excerpts that have already passed an initial semantic similarity filter. Your job is to intelligently re-score and explain each candidate.

--- JOB DESCRIPTION ---
Title: {job.title}
Experience Required: {getattr(job, 'experience_required', 'Not specified')} years
Required Skills: {skills_str or 'Not specified'}
Description:
{jd_text}
--- END JOB DESCRIPTION ---
{pref_section}
--- CANDIDATES (pre-ranked by vector similarity) ---
{candidates_json}
--- END CANDIDATES ---

TASK:
For each candidate, evaluate their fit for this exact role and return:
- final_score: integer 0-100 reflecting true match quality (not just keyword overlap)
- shortlist_reason: ONE concise sentence (max 20 words) explaining why this candidate is or isn't a strong fit
- plus_points: array of 2-4 SHORT strings (each max 10 words) listing genuine candidate strengths relevant to this JD
- concerns: array of 0-2 SHORT strings (each max 10 words) listing key gaps or preference violations (empty array if none)

SCORING GUIDANCE:
- 85-100: Exceptional fit — directly matches all key requirements and recruiter preferences, strong relevant experience
- 70-84: Good fit — meets most requirements, minor gaps
- 50-69: Moderate fit — meets some requirements, notable gaps
- Below 50: Weak fit or violates recruiter exclusion criteria

RULES:
- Base scoring on actual resume content, not just keyword presence
- Strictly respect all negative/exclusion preferences provided by the recruiter
- Use the similarity_score as a hint but override it if you see clear mismatch or stronger fit
- If resume text is missing or very short, use similarity_score with a 10-point penalty and note it
- Return ONLY valid JSON — no markdown, no code fences, no commentary

REQUIRED OUTPUT FORMAT (JSON array, one object per candidate, same order as input):
[
  {{
    "index": 0,
    "final_score": 82,
    "shortlist_reason": "5+ years Python/Django experience directly matches the backend engineer role.",
    "plus_points": ["Strong Django REST API experience", "PostgreSQL optimization skills", "Led cross-functional team"],
    "concerns": ["No Kubernetes experience mentioned"]
  }}
]"""

    return prompt


def _parse_llm_response(raw_text: str, expected_count: int) -> Optional[List[Dict[str, Any]]]:
    """
    Robustly parses the LLM JSON response.
    Returns list of candidate result dicts, or None on parse failure.
    """
    if not raw_text:
        return None

    cleaned = raw_text.strip()

    # Strip markdown code fences if present
    if "```" in cleaned:
        match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', cleaned, re.DOTALL)
        if match:
            cleaned = match.group(1)
        else:
            cleaned = re.sub(r'```(?:json)?|```', '', cleaned).strip()

    # Find JSON array boundaries
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start == -1 or end == -1:
        logger.warning("No JSON array found in LLM shortlist response")
        return None

    cleaned = cleaned[start:end + 1]

    try:
        data = json.loads(cleaned)
        if not isinstance(data, list):
            logger.warning("LLM shortlist response is not a list")
            return None
        if len(data) != expected_count:
            logger.warning(
                "LLM returned %d results but expected %d — using what we got",
                len(data), expected_count
            )
        return data
    except json.JSONDecodeError as e:
        logger.error("JSON parse error in shortlist LLM response: %s", e)
        return None


def llm_rerank_and_explain(
    job,
    candidates: List[Dict[str, Any]],
    preferences: str = "",
    decomp: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Public API — called from shortlist_candidates view.

    Takes a pre-scored list of candidate dicts (each with 'score', 'kind', 'name', etc.),
    sends them through the Gemini LLM for re-ranking and insight generation against
    the Job Description and recruiter preferences/negative constraints.
    Returns the enriched list sorted by final LLM score descending.

    On ANY failure, logs the error and returns the input list unchanged
    (preserving cosine similarity scores) so shortlisting never breaks.

    Args:
        job: Job model instance (needs .title, .description, .skills, .experience_required)
        candidates: list of candidate dicts from shortlist_candidates view
        preferences: Optional raw recruiter preferences string containing positive or negative constraints
        decomp: Optional structured query decomposition dict from decompose_preferences_with_llm

    Returns:
        Same list, each dict enriched with:
            'llm_score': float (LLM final score, same as 'score' on fallback)
            'shortlist_reason': str
            'match_insights': dict with plus_points, concerns, similarity_score, llm_score
        Sorted descending by llm_score.
    """
    if not candidates:
        return candidates

    # Cap batch size
    batch = candidates[:MAX_BATCH_SIZE]

    try:
        client = _get_shortlist_client()
    except ValueError as e:
        logger.error("Shortlist LLM client setup failed: %s — falling back to cosine scores", e)
        return _apply_fallback_insights(candidates)

    prompt = _build_batch_prompt(job, batch, preferences=preferences, decomp=decomp)
    raw_response = None
    last_err = None

    for model_name in SHORTLIST_MODELS:
        try:
            logger.info("Attempting shortlist LLM re-ranking with model %s for job #%s", model_name, job.id)
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            if response and response.text:
                raw_response = response.text.strip()
                logger.info("Shortlist LLM call succeeded with model %s", model_name)
                break
        except Exception as e:
            logger.warning("Shortlist LLM model %s failed: %s", model_name, e)
            last_err = e

    if not raw_response:
        logger.error(
            "All shortlist LLM models failed for job #%s. Last error: %s — falling back to cosine scores",
            job.id, last_err
        )
        return _apply_fallback_insights(candidates)

    # Parse LLM response
    llm_results = _parse_llm_response(raw_response, len(batch))

    if not llm_results:
        logger.error("Could not parse LLM shortlist response for job #%s — falling back to cosine scores", job.id)
        return _apply_fallback_insights(candidates)

    # Build index mapping: index → llm result
    llm_by_index = {item.get("index", i): item for i, item in enumerate(llm_results)}

    # Enrich each candidate in the batch with LLM insights
    enriched_batch = []
    for i, cand in enumerate(batch):
        similarity_score = round(cand.get("score", 0), 1)
        llm_data = llm_by_index.get(i, {})

        llm_score = float(llm_data.get("final_score", similarity_score))
        # Clamp to [0, 100]
        llm_score = max(0.0, min(100.0, llm_score))

        shortlist_reason = str(llm_data.get("shortlist_reason", "")).strip()
        plus_points = llm_data.get("plus_points", [])
        concerns = llm_data.get("concerns", [])

        # Sanitise list fields
        if not isinstance(plus_points, list):
            plus_points = []
        if not isinstance(concerns, list):
            concerns = []

        enriched = {
            **cand,
            "score": llm_score,          # override score with LLM score for ranking
            "llm_score": llm_score,
            "shortlist_reason": shortlist_reason,
            "match_insights": {
                "similarity_score": similarity_score,
                "llm_score": llm_score,
                "plus_points": plus_points[:4],  # cap at 4
                "concerns": concerns[:2],         # cap at 2
            },
        }
        enriched_batch.append(enriched)

    # Candidates beyond MAX_BATCH_SIZE get fallback treatment (shouldn't happen in normal use)
    remainder = [_enrich_with_fallback(c) for c in candidates[MAX_BATCH_SIZE:]]

    # Merge and sort by LLM score descending
    all_candidates = enriched_batch + remainder
    all_candidates.sort(key=lambda x: x.get("llm_score", x.get("score", 0)), reverse=True)

    logger.info(
        "Shortlist LLM re-ranking complete for job #%s: %d candidates enriched",
        job.id, len(enriched_batch)
    )
    return all_candidates


def _enrich_with_fallback(cand: Dict[str, Any]) -> Dict[str, Any]:
    """Enriches a single candidate with empty insight fields (fallback mode)."""
    similarity_score = round(cand.get("score", 0), 1)
    return {
        **cand,
        "llm_score": similarity_score,
        "shortlist_reason": "",
        "match_insights": {
            "similarity_score": similarity_score,
            "llm_score": similarity_score,
            "plus_points": [],
            "concerns": [],
        },
    }


def _apply_fallback_insights(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Fallback: enriches all candidates with empty insight fields
    but preserves original cosine similarity scores and ordering.
    Called when the LLM is unavailable or fails.
    """
    return [_enrich_with_fallback(c) for c in candidates]

