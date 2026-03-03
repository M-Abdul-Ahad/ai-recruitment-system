"""Role constants for the users application.

This module exports plain string constants representing the different
roles available in the system.  Import these values rather than
hardcoding strings to keep the code base consistent and to make it
easy to change the role identifiers in one place later on.

Examples::

    from users.roles import APPLICANT, RECRUITER

    if user.role == APPLICANT:
        ...

The module also provides tuples for easy iteration and validation.
"""

APPLICANT = "applicant"
RECRUITER = "recruiter"
ADMIN = "admin"

#: all defined roles
ALL_ROLES = (APPLICANT, RECRUITER, ADMIN)
#: roles that may be assigned during public registration
PUBLIC_ROLES = (APPLICANT, RECRUITER)
