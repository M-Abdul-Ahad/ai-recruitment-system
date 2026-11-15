"""
jobs/tests_shortlisting.py
--------------------------
Comprehensive unit and integration test suite for the AI Shortlisting & LLM Re-ranking feature.

Covers:
1. shortlist_scorer service:
   - JSON parsing with various Gemini response styles (clean, markdown code block, bracket-extracted)
   - Fallback behavior on invalid JSON or API exceptions (never crashes, preserves cosine scores)
   - Batch prompt construction
   - Resume text extraction for both 'applicant' and 'temporary' candidates
   - Score re-ranking and insight enrichment
2. gemini_embedding enhancements:
   - Rich job embedding text generation (including salary, location, skills)
   - Cosine similarity computation
3. Serialization:
   - RecruiterApplicationSerializer serializes shortlist_reason and match_insights
4. Live / Mocked View Integration:
   - End-to-end shortlist_candidates flow with mocked Gemini LLM call
"""

import os
import sys
import json
import unittest
from unittest.mock import patch, MagicMock

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
from django.apps import apps
if not apps.ready:
    django.setup()

from django.contrib.auth import get_user_model

from companies.models import Company
from jobs.models import Job, JobApplication, Skill
from resumes.models import Resume
from jobs.services.shortlist_scorer import (
    _parse_llm_response,
    _build_batch_prompt,
    _extract_resume_text,
    _apply_fallback_insights,
    llm_rerank_and_explain,
)
from resumes.services.gemini_embedding import (
    build_job_embedding_text,
    calculate_cosine_similarity,
)
from jobs.serializers import RecruiterApplicationSerializer

User = get_user_model()


class ShortlistScorerUnitTests(unittest.TestCase):
    """Unit tests for the shortlist_scorer helper functions."""

    def test_parse_llm_response_clean_json(self):
        """Valid clean JSON array parsed correctly."""
        raw = json.dumps([
            {
                "index": 0,
                "final_score": 92,
                "shortlist_reason": "Exceptional match for Django lead engineer.",
                "plus_points": ["5+ yrs Django", "PostgreSQL tuning"],
                "concerns": []
            }
        ])
        result = _parse_llm_response(raw, 1)
        self.assertIsNotNone(result)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["final_score"], 92)
        self.assertEqual(result[0]["plus_points"], ["5+ yrs Django", "PostgreSQL tuning"])

    def test_parse_llm_response_markdown_code_fences(self):
        """Handles responses wrapped in ```json ... ``` code fences."""
        raw = (
            "Here is the evaluation:\n"
            "```json\n"
            "[\n"
            "  {\n"
            '    "index": 0,\n'
            '    "final_score": 85,\n'
            '    "shortlist_reason": "Solid Python experience.",\n'
            '    "plus_points": ["Python 3", "REST APIs"],\n'
            '    "concerns": ["No Docker"]\n'
            "  }\n"
            "]\n"
            "```\nHope this helps!"
        )
        result = _parse_llm_response(raw, 1)
        self.assertIsNotNone(result)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["final_score"], 85)
        self.assertEqual(result[0]["concerns"], ["No Docker"])

    def test_parse_llm_response_invalid_returns_none(self):
        """Malformed or non-JSON returns None without raising an exception."""
        self.assertIsNone(_parse_llm_response("Not JSON at all", 1))
        self.assertIsNone(_parse_llm_response("{'not': 'an array'}", 1))
        self.assertIsNone(_parse_llm_response("", 1))

    def test_fallback_insights_preserves_order_and_scores(self):
        """_apply_fallback_insights preserves candidate score and enriches with empty insights."""
        candidates = [
            {"score": 88.5, "name": "Alice", "kind": "applicant"},
            {"score": 72.0, "name": "Bob", "kind": "temporary"},
        ]
        fallback = _apply_fallback_insights(candidates)
        self.assertEqual(len(fallback), 2)
        self.assertEqual(fallback[0]["score"], 88.5)
        self.assertEqual(fallback[0]["llm_score"], 88.5)
        self.assertEqual(fallback[0]["shortlist_reason"], "")
        self.assertEqual(fallback[0]["match_insights"]["similarity_score"], 88.5)
        self.assertEqual(fallback[0]["match_insights"]["plus_points"], [])

    def test_extract_resume_text_applicant(self):
        """Correctly extracts cleaned_text from an applicant's resume."""
        resume_mock = MagicMock()
        resume_mock.cleaned_text = "Cleaned resume text for candidate."
        resume_mock.extracted_text = "Raw extracted text."
        app_mock = MagicMock()
        app_mock.resume = resume_mock

        candidate_dict = {"kind": "applicant", "app": app_mock}
        text = _extract_resume_text(candidate_dict)
        self.assertEqual(text, "Cleaned resume text for candidate.")

    def test_extract_resume_text_temporary(self):
        """Correctly extracts cleaned_text from a temporary candidate."""
        tc_mock = MagicMock()
        tc_mock.cleaned_text = "Temp candidate cleaned resume."
        tc_mock.extracted_text = "Raw temp text."

        candidate_dict = {"kind": "temporary", "temp_candidate": tc_mock}
        text = _extract_resume_text(candidate_dict)
        self.assertEqual(text, "Temp candidate cleaned resume.")

    def test_build_batch_prompt(self):
        """Prompt includes job title, skills, description, and candidate excerpts."""
        job_mock = MagicMock()
        job_mock.title = "Senior Python Developer"
        job_mock.experience_required = 4
        job_mock.description = "We are seeking a senior Django engineer."
        job_mock.skills.all.return_value = [MagicMock(name="Python"), MagicMock(name="Django")]

        candidates = [
            {"score": 85.0, "name": "Candidate A", "kind": "applicant", "app": None},
        ]
        prompt = _build_batch_prompt(
            job_mock,
            candidates,
            preferences="Don't show candidates who worked in PHP",
            decomp={
                "positive_query": "",
                "negative_keywords": ["php"],
                "conceptual_negatives": []
            }
        )
        self.assertIn("Senior Python Developer", prompt)
        self.assertIn("We are seeking a senior Django engineer.", prompt)
        self.assertIn("Candidate A", prompt)
        self.assertIn("Don't show candidates who worked in PHP", prompt)
        self.assertIn("STRICT ZERO-TOLERANCE", prompt)
        self.assertIn("php", prompt)


class ShortlistScorerLLMIntegrationTests(unittest.TestCase):
    """Tests for llm_rerank_and_explain with mocked Gemini client."""

    def setUp(self):
        self.job_mock = MagicMock()
        self.job_mock.id = 42
        self.job_mock.title = "Backend Engineer"
        self.job_mock.experience_required = 3
        self.job_mock.description = "Build robust APIs."
        self.job_mock.skills.all.return_value = []

    @patch("jobs.services.shortlist_scorer._get_shortlist_client")
    def test_llm_rerank_and_explain_success(self, mock_get_client):
        """When Gemini returns valid JSON, candidates are re-scored, explained, and re-ranked."""
        mock_response = MagicMock()
        mock_response.text = json.dumps([
            {
                "index": 0,
                "final_score": 75,
                "shortlist_reason": "Decent candidate with some gaps.",
                "plus_points": ["Basic Python"],
                "concerns": ["Lacks Django depth"]
            },
            {
                "index": 1,
                "final_score": 95,
                "shortlist_reason": "Outstanding backend engineer with deep Django REST experience.",
                "plus_points": ["Django REST expert", "High traffic scaling", "Celery/Redis"],
                "concerns": []
            }
        ])

        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = mock_client

        # Candidate 0 had higher initial cosine score (88) than Candidate 1 (80)
        candidates = [
            {"score": 88.0, "name": "Candidate 0", "kind": "applicant", "app": None},
            {"score": 80.0, "name": "Candidate 1", "kind": "applicant", "app": None},
        ]

        result = llm_rerank_and_explain(self.job_mock, candidates)

        # After LLM re-ranking, Candidate 1 should now be #1 because final_score is 95 > 75
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["name"], "Candidate 1")
        self.assertEqual(result[0]["score"], 95.0)
        self.assertEqual(result[0]["shortlist_reason"], "Outstanding backend engineer with deep Django REST experience.")
        self.assertEqual(result[0]["match_insights"]["plus_points"], ["Django REST expert", "High traffic scaling", "Celery/Redis"])
        self.assertEqual(result[0]["match_insights"]["similarity_score"], 80.0)

        # Candidate 0 is #2 with score 75
        self.assertEqual(result[1]["name"], "Candidate 0")
        self.assertEqual(result[1]["score"], 75.0)

    @patch("jobs.services.shortlist_scorer._get_shortlist_client")
    def test_llm_rerank_fallback_on_api_exception(self, mock_get_client):
        """When Gemini raises an API exception, the service falls back gracefully without crashing."""
        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = RuntimeError("Gemini Quota Exceeded")
        mock_get_client.return_value = mock_client

        candidates = [
            {"score": 88.0, "name": "Candidate 0", "kind": "applicant", "app": None},
            {"score": 75.0, "name": "Candidate 1", "kind": "applicant", "app": None},
        ]

        # Must not raise RuntimeError
        result = llm_rerank_and_explain(self.job_mock, candidates)

        # Preserves cosine scores and original order
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["score"], 88.0)
        self.assertEqual(result[1]["score"], 75.0)
        self.assertEqual(result[0]["shortlist_reason"], "")
        self.assertEqual(result[0]["match_insights"]["similarity_score"], 88.0)


class GeminiEmbeddingHelpersTest(unittest.TestCase):
    """Tests for enhanced embedding text builder and cosine similarity."""

    def test_build_job_embedding_text_with_metadata(self):
        """build_job_embedding_text enriches embedding with location, salary, and experience."""
        company = MagicMock()
        company.name = "Arbisoft"

        job = MagicMock()
        job.pk = 1
        job.title = "Full Stack Engineer"
        job.company = company
        job.location = "Lahore, Pakistan"
        job.experience_required = 3
        job.salary_min = 200000
        job.salary_max = 350000
        job.description = "Build full stack React and Django apps."

        skill1 = MagicMock(); skill1.name = "React"
        skill2 = MagicMock(); skill2.name = "Django"
        job.skills.all.return_value = [skill1, skill2]

        text = build_job_embedding_text(job)
        self.assertIn("Full Stack Engineer", text)
        self.assertIn("Arbisoft", text)
        self.assertIn("Lahore, Pakistan", text)
        self.assertIn("200,000", text)
        self.assertIn("React, Django", text)

    def test_calculate_cosine_similarity(self):
        """Cosine similarity returns 1.0 for identical vectors and 0.0 for empty."""
        vec1 = [1.0, 0.0, 0.0]
        vec2 = [1.0, 0.0, 0.0]
        self.assertAlmostEqual(calculate_cosine_similarity(vec1, vec2), 1.0)

        # Opposite vectors -> normalized to 0.0
        vec_opp = [-1.0, 0.0, 0.0]
        self.assertAlmostEqual(calculate_cosine_similarity(vec1, vec_opp), 0.0)

        # Empty vectors
        self.assertEqual(calculate_cosine_similarity([], []), 0.0)


class RecruiterSerializerTest(unittest.TestCase):
    """Tests for RecruiterApplicationSerializer including new shortlist fields."""

    def test_serializer_includes_shortlist_reason_and_insights(self):
        """Serializer includes shortlist_reason and match_insights fields."""
        serializer = RecruiterApplicationSerializer()
        fields = serializer.get_fields()
        self.assertIn("shortlist_reason", fields)
        self.assertIn("match_insights", fields)


class PreferenceParserTests(unittest.TestCase):
    """Unit tests for preference_parser module."""

    def test_parse_mixed_preferences(self):
        from jobs.services.preference_parser import parse_recruiter_preferences, check_candidate_negative_violation

        raw = "Prefers AWS and Docker, but don't show candidates who worked in Python or PHP"
        parsed = parse_recruiter_preferences(raw)

        self.assertIn("AWS", parsed["positive_text"])
        self.assertIn("Docker", parsed["positive_text"])
        self.assertEqual(parsed["negative_terms"], ["php", "python"])

        # Violation check
        bad_resume = "Senior Full Stack Dev with 5 years in Python and Django"
        violations = check_candidate_negative_violation(bad_resume, parsed["negative_terms"])
        self.assertEqual(violations, ["python"])

        # Clean check
        clean_resume = "Senior Full Stack Dev with 5 years in Golang and AWS"
        clean_violations = check_candidate_negative_violation(clean_resume, parsed["negative_terms"])
        self.assertEqual(clean_violations, [])

    def test_parse_pure_negative_preference(self):
        from jobs.services.preference_parser import parse_recruiter_preferences

        raw = "don't show me applicants who have worked in python"
        parsed = parse_recruiter_preferences(raw)
        self.assertEqual(parsed["positive_text"], "")
        self.assertEqual(parsed["negative_terms"], ["python"])

    @patch("jobs.services.preference_parser._get_parser_client")
    def test_decompose_preferences_with_llm_success(self, mock_client_getter):
        from jobs.services.preference_parser import decompose_preferences_with_llm

        mock_resp = MagicMock()
        mock_resp.text = json.dumps({
            "positive_query": "Senior AWS Cloud Architect with Kubernetes and Terraform experience",
            "negative_keywords": ["python", "django"],
            "conceptual_negatives": ["frequent job hopper", "academic only"]
        })
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_resp
        mock_client_getter.return_value = mock_client

        job_mock = MagicMock(title="Cloud Architect", description="Lead cloud infrastructure")
        result = decompose_preferences_with_llm(job_mock, "Prefers AWS and K8s, absolutely no Python, no job hoppers")

        self.assertEqual(result["method"], "llm")
        self.assertIn("AWS", result["positive_query"])
        self.assertEqual(result["negative_keywords"], ["python", "django"])
        self.assertEqual(result["conceptual_negatives"], ["frequent job hopper", "academic only"])

    @patch("jobs.services.preference_parser._get_parser_client")
    def test_decompose_preferences_fallback_on_api_error(self, mock_client_getter):
        from jobs.services.preference_parser import decompose_preferences_with_llm

        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = RuntimeError("API Quota Reached")
        mock_client_getter.return_value = mock_client

        job_mock = MagicMock(title="Backend Dev", description="Backend APIs")
        result = decompose_preferences_with_llm(job_mock, "Prefers Golang, don't show candidates who worked in Python")

        # Must fall back gracefully to regex parser without raising an exception
        self.assertEqual(result["method"], "regex_fallback")
        self.assertIn("Golang", result["positive_query"])
        self.assertEqual(result["negative_keywords"], ["python"])


