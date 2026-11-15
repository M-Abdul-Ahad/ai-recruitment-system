"""
jobs/services/preference_parser.py
-----------------------------------
Parses recruiter hiring preferences into:
1. positive_text: Desired skills, experience, and certifications (safe for vector embedding).
2. negative_terms: Technologies, keywords, or roles explicitly excluded by the recruiter
   (e.g., "don't show python", "no freshers", "exclude php").

By separating these:
- Vector embeddings ONLY represent positive desires (never accidentally boosting excluded words).
- Negative constraints are applied as hard filters during candidate screening and LLM evaluation.
"""

import re
import json
import logging
from typing import Dict, List, Any

from django.conf import settings
from google import genai

logger = logging.getLogger("jobs.preference_parser")

# Fast Gemini models list for query decomposition
PARSER_MODELS = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]

# Common negation triggers in recruitment preferences
NEGATION_PATTERNS = [
    r"(?:don't\s+show|dont\s+show|do\s+not\s+show)\s+(?:me\s+)?(?:candidates|applicants|resumes)?\s*(?:who\s+have|with|having)?\s*(?:worked\s+in|used|experience\s+in)?\s*[:\s]*([^,.;\n]+)",
    r"(?:exclude|excluding|must\s+not\s+have|must\s+not\s+be|without|no)\s+[:\s]*([^,.;\n]+)",
    r"(?:never\s+worked\s+with|never\s+used)\s+[:\s]*([^,.;\n]+)",
]

# Stop words to clean out of extracted negative terms
NEGATIVE_STOP_WORDS = {
    "me", "any", "all", "who", "have", "worked", "working", "with", "in", "or",
    "and", "a", "an", "the", "candidates", "candidate", "applicants", "applicant",
    "resumes", "resume", "profiles", "profile", "experience", "background", "freshers",
    "skills", "skill", "people", "person"
}


def parse_recruiter_preferences(raw_preferences: str) -> Dict[str, Any]:
    """
    Splits raw recruiter preference text into positive desires and negative exclusions.

    Example:
        raw: "Prefers AWS and Docker, but don't show candidates who worked in Python or PHP"
        returns:
            {
                "positive_text": "Prefers AWS and Docker",
                "negative_terms": ["python", "php"],
                "raw": "..."
            }
    """
    if not raw_preferences or not raw_preferences.strip():
        return {
            "positive_text": "",
            "negative_terms": [],
            "raw": "",
        }

    raw = raw_preferences.strip()
    negative_terms = set()
    cleaned_positive = raw

    # 1. Match and extract negative clauses using regex
    for pattern in NEGATION_PATTERNS:
        for match in re.finditer(pattern, raw, flags=re.IGNORECASE):
            full_clause = match.group(0)
            target_phrase = match.group(1).strip()

            # Split target phrase by comma, slash, or "or" (e.g. "Python or PHP", "Java, Ruby")
            tokens = re.split(r"[,/|]|\s+or\s+|\s+and\s+", target_phrase, flags=re.IGNORECASE)
            for token in tokens:
                cleaned_token = re.sub(r"[^\w\s+#.-]", "", token).strip().lower()
                # Filter out pure stop words
                words = [w for w in cleaned_token.split() if w not in NEGATIVE_STOP_WORDS]
                if words:
                    term = " ".join(words).strip()
                    if len(term) >= 2:
                        negative_terms.add(term)

            # Strip the matched negative clause from the positive text
            cleaned_positive = cleaned_positive.replace(full_clause, " ")

    # 2. Clean up positive text (remove dangling punctuation, conjunctions, extra spaces)
    cleaned_positive = re.sub(r"\b(but|and|except|also)\s*$", "", cleaned_positive.strip(), flags=re.IGNORECASE)
    cleaned_positive = re.sub(r"^[,\s;.-]+|[,\s;.-]+$", "", cleaned_positive.strip())
    cleaned_positive = re.sub(r"\s{2,}", " ", cleaned_positive)

    # If the remaining positive text is just filler or too short, set to empty
    if len(cleaned_positive) < 5 or cleaned_positive.lower() in NEGATIVE_STOP_WORDS:
        cleaned_positive = ""

    return {
        "positive_text": cleaned_positive,
        "negative_terms": sorted(list(negative_terms)),
        "raw": raw,
    }


def check_candidate_negative_violation(resume_text: str, negative_terms: List[str]) -> List[str]:
    """
    Checks if a candidate's resume text contains any of the explicitly excluded terms.
    Uses word-boundary regex matching to avoid false partial substring matches
    (e.g., "go" should not match "Django").
    
    Returns list of matched violating terms (empty if candidate is clean).
    """
    if not resume_text or not negative_terms:
        return []

    text_lower = resume_text.lower()
    violations = []

    for term in negative_terms:
        term_clean = term.strip().lower()
        if not term_clean:
            continue
        
        # Word boundary pattern: handles terms with symbols like c++, c#, .net
        escaped_term = re.escape(term_clean)
        # If term starts/ends with alphanumeric, enforce word boundary
        pattern = r""
        if term_clean[0].isalnum():
            pattern += r"\b"
        pattern += escaped_term
        if term_clean[-1].isalnum():
            pattern += r"\b"

        if re.search(pattern, text_lower):
            violations.append(term)

    return violations


def _get_parser_client() -> genai.Client:
    """Returns GenAI client using GEMINI_SHORTLIST_API_KEY (or fallback)."""
    api_key = (
        getattr(settings, "GEMINI_SHORTLIST_API_KEY", "")
        or getattr(settings, "GEMINI_API_KEY", "")
        or ""
    ).strip()
    if not api_key:
        raise ValueError("No Gemini API key configured for preference parsing.")
    return genai.Client(api_key=api_key)


def decompose_preferences_with_llm(job, raw_preferences: str) -> Dict[str, Any]:
    """
    Uses Gemini LLM to semantically decompose recruiter preferences into:
    1. positive_query: Clean, enriched positive technical criteria for vector embedding.
    2. negative_keywords: Array of specific excluded tools/languages (used for pre-filtering).
    3. conceptual_negatives: Array of qualitative red flags (used in final LLM evaluation).

    Guaranteed fallback: If LLM fails, automatically falls back to deterministic regex parser.
    """
    if not raw_preferences or not raw_preferences.strip():
        return {
            "positive_query": "",
            "negative_keywords": [],
            "conceptual_negatives": [],
            "raw": "",
            "method": "empty",
        }

    raw = raw_preferences.strip()

    job_title = getattr(job, "title", "Job Role")
    job_desc = (getattr(job, "description", "") or "")[:1500]

    prompt = f"""You are an expert AI Search Engineer optimizing technical recruitment queries.

TASK:
Decompose the recruiter's hiring preferences for a '{job_title}' role into:
1. "positive_query": Enriched, dense technical description representing ONLY positive criteria, desired skills, and experience. Exclude ALL negation words, negative sentences, or exclusion wishes. (This text will be converted into a vector search embedding).
2. "negative_keywords": Array of specific technical keywords, languages, frameworks, or titles that the recruiter explicitly wants to EXCLUDE or NOT see (e.g., ["python", "php", "wordpress", "intern"]).
3. "conceptual_negatives": Array of qualitative traits or soft criteria to avoid (e.g., ["frequent job hopper", "academic only background", "no production experience"]).

CONTEXT:
Role: {job_title}
Job Summary: {job_desc}

RECRUITER PREFERENCES:
"{raw}"

OUTPUT FORMAT:
Return STRICTLY valid JSON with no markdown fences, no formatting tags, and no commentary:
{{
  "positive_query": "string",
  "negative_keywords": ["keyword1", "keyword2"],
  "conceptual_negatives": ["trait1", "trait2"]
}}"""

    try:
        client = _get_parser_client()
        raw_response = None

        for model_name in PARSER_MODELS:
            try:
                logger.info("Decomposing recruiter preferences with model %s", model_name)
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    raw_response = response.text.strip()
                    break
            except Exception as e:
                logger.warning("Parser model %s failed: %s", model_name, e)

        if raw_response:
            # Clean markdown fences if present
            cleaned = raw_response
            if "```" in cleaned:
                cleaned = re.sub(r"```(?:json)?|```", "", cleaned).strip()
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1:
                cleaned = cleaned[start:end + 1]
                data = json.loads(cleaned)

                pos_query = str(data.get("positive_query", "")).strip()
                neg_keys = [str(k).strip().lower() for k in data.get("negative_keywords", []) if str(k).strip()]
                conc_negs = [str(c).strip() for c in data.get("conceptual_negatives", []) if str(c).strip()]

                return {
                    "positive_query": pos_query,
                    "negative_keywords": neg_keys,
                    "conceptual_negatives": conc_negs,
                    "raw": raw,
                    "method": "llm",
                }

    except Exception as e:
        logger.warning("LLM preference decomposition failed (%s) — using deterministic regex fallback", e)

    # Deterministic regex fallback
    fallback = parse_recruiter_preferences(raw)
    return {
        "positive_query": fallback["positive_text"],
        "negative_keywords": fallback["negative_terms"],
        "conceptual_negatives": [],
        "raw": raw,
        "method": "regex_fallback",
    }


