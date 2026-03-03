"""Utility helpers for role inspection.

These functions encapsulate common checks against user roles and are
intended to be imported wherever role-based logic is necessary (views,
serializers, permissions, etc.). They gracefully handle ``None`` or
``AnonymousUser`` instances by returning ``False`` instead of raising
attribute errors.
"""

from django.contrib.auth.models import AnonymousUser

from .roles import APPLICANT, RECRUITER, ADMIN


def _get_role(user):
    """Return the role string for a user, or ``None`` if unavailable."""
    if not user or isinstance(user, AnonymousUser):
        return None
    # some code paths may supply a raw dict (e.g. decoded JWT)
    if isinstance(user, dict):
        return user.get("role")
    return getattr(user, "role", None)


def is_applicant(user) -> bool:
    """Return ``True`` if the given user has the applicant role."""
    return _get_role(user) == APPLICANT


def is_recruiter(user) -> bool:
    """Return ``True`` if the given user has the recruiter role."""
    return _get_role(user) == RECRUITER


def is_admin(user) -> bool:
    """Return ``True`` if the given user has the admin role."""
    return _get_role(user) == ADMIN
