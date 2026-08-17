from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
import hashlib
from rest_framework.test import APIClient
from rest_framework import status

from users.models import User, Role
from companies.models import Company, RecruiterInvitation


class RecruiterInvitationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Company
        self.company = Company.objects.create(name="TechCorp", email="admin@techcorp.com")

        # Create Company Admin user
        self.admin = User.objects.create_user(
            email="admin@techcorp.com",
            username="company_admin_user",
            password="Password123!",
            role=User.Role.COMPANY_ADMIN,
            company=self.company,
            is_hr=True,
        )

        # Create Recruiter Role object
        Role.objects.get_or_create(name=User.Role.RECRUITER)

    def test_send_invitation_success(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post("/api/companies/invitations/", {"email": "newrecruiter@techcorp.com"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], "newrecruiter@techcorp.com")
        self.assertEqual(response.data["status"], "pending")

        invitation = RecruiterInvitation.objects.get(email="newrecruiter@techcorp.com")
        self.assertEqual(invitation.company, self.company)
        self.assertEqual(invitation.invited_by, self.admin)
        self.assertIsNone(invitation.accepted_at)

    def test_send_invitation_duplicate_email_fails(self):
        # Create existing user
        User.objects.create_user(
            email="existing@techcorp.com",
            username="existinguser",
            password="Password123!",
            role=User.Role.RECRUITER,
            company=self.company,
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.post("/api/companies/invitations/", {"email": "existing@techcorp.com"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_list_invitations(self):
        RecruiterInvitation.objects.create(
            company=self.company,
            email="rec1@techcorp.com",
            token_hash="hash1",
            expires_at=timezone.now() + timedelta(days=2),
            invited_by=self.admin,
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/companies/invitations/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["email"], "rec1@techcorp.com")

    def test_revoke_invitation(self):
        inv = RecruiterInvitation.objects.create(
            company=self.company,
            email="revoke_me@techcorp.com",
            token_hash="hash_revoke",
            expires_at=timezone.now() + timedelta(days=2),
            invited_by=self.admin,
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f"/api/companies/invitations/{inv.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(RecruiterInvitation.objects.filter(id=inv.id).exists())

    def test_verify_and_accept_invitation_flow(self):
        raw_token = "secret-test-token-12345"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        inv = RecruiterInvitation.objects.create(
            company=self.company,
            email="accepted_recruiter@techcorp.com",
            token_hash=token_hash,
            expires_at=timezone.now() + timedelta(days=2),
            invited_by=self.admin,
        )

        # 1. Verify token
        verify_res = self.client.get(f"/api/companies/invitations/verify/?token={raw_token}")
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertTrue(verify_res.data["valid"])
        self.assertEqual(verify_res.data["email"], "accepted_recruiter@techcorp.com")
        self.assertEqual(verify_res.data["company_name"], "TechCorp")

        # 2. Accept token & set password
        accept_data = {
            "token": raw_token,
            "first_name": "Jane",
            "last_name": "Doe",
            "username": "new_recruiter_user",
            "password": "SecurePassword123!",
        }
        accept_res = self.client.post("/api/companies/invitations/accept/", accept_data)
        self.assertEqual(accept_res.status_code, status.HTTP_201_CREATED)

        # Check user created
        new_user = User.objects.get(email="accepted_recruiter@techcorp.com")
        self.assertEqual(new_user.username, "new_recruiter_user")
        self.assertEqual(new_user.first_name, "Jane")
        self.assertEqual(new_user.last_name, "Doe")
        self.assertEqual(new_user.role, User.Role.RECRUITER)
        self.assertEqual(new_user.company, self.company)
        self.assertTrue(new_user.is_hr)
        self.assertTrue(new_user.check_password("SecurePassword123!"))

        # Check invitation marked accepted
        inv.refresh_from_db()
        self.assertIsNotNone(inv.accepted_at)
