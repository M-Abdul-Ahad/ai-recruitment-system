from django.test import TestCase
from users.models import User
from .serializers import SignupSerializer



class UserModelTests(TestCase):
    def test_default_role_is_applicant(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123",
        )
        self.assertEqual(user.role, User.Role.APPLICANT)

    def test_cannot_set_blank_or_null_role(self):
        user = User(
            email="another@example.com",
            username="user2",
            password="password123",
            role="",
        )
        with self.assertRaises(Exception):
            user.full_clean()


class SignupSerializerTests(TestCase):
    def test_serializer_defaults_role(self):
        data = {
            "email": "new@test.com",
            "username": "newuser",
            "password": "Strongpass123",
        }
        serializer = SignupSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.role, User.Role.APPLICANT)
        response = serializer.data
        self.assertEqual(set(response.keys()), {"email", "role"})

    def test_serializer_allows_setting_role(self):
        data = {
            "email": "hire@test.com",
            "username": "recruiter",
            "password": "AnotherPass1",
            "role": User.Role.RECRUITER,
        }
        serializer = SignupSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.role, User.Role.RECRUITER)

    def test_serializer_rejects_admin_role(self):
        data = {
            "email": "evil@test.com",
            "username": "badguy",
            "password": "Badpass123",
            "role": User.Role.ADMIN,
        }
        serializer = SignupSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('role', serializer.errors)

    def test_token_serializer_includes_user_info(self):
        # create user and run through custom token serializer
        user = User.objects.create_user(
            email="token@test.com",
            username="tokenuser",
            password="Tokenpass1",
            role=User.Role.RECRUITER,
        )
        try:
            from users.serializers import CustomTokenObtainPairSerializer
        except ImportError:
            from backend.users.serializers import CustomTokenObtainPairSerializer
        data = {'email': user.email, 'password': 'Tokenpass1'}
        serializer = CustomTokenObtainPairSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        result = serializer.validated_data
        # Should still include tokens
        self.assertIn('access', result)
        self.assertIn('refresh', result)
        # plus our additional fields
        self.assertEqual(result['user_id'], user.id)
        self.assertEqual(result['email'], user.email)
        self.assertEqual(result['role'], user.role)

    def test_company_signup_success(self):
        from companies.models import Company
        data = {
            "role": "company_admin",
            "ownerName": "Alice_CEO",
            "ownerEmail": "alice@acmecorp.com",
            "password": "StrongPassword123!",
            "companyName": "Acme Corp",
            "companyEmail": "contact@acmecorp.com",
            "website": "https://acmecorp.com",
            "industry": "technology",
            "phone": "+15551234567",
            "address": "100 Acme Way",
        }
        serializer = SignupSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        # Check user created correctly
        self.assertEqual(user.email, "alice@acmecorp.com")
        self.assertEqual(user.role, User.Role.COMPANY_ADMIN)
        self.assertTrue(user.is_hr)
        self.assertIsNotNone(user.company)

        # Check company details saved in companies_company
        company = user.company
        self.assertEqual(company.name, "Acme Corp")
        self.assertEqual(company.email, "contact@acmecorp.com")
        self.assertEqual(company.website, "https://acmecorp.com")
        self.assertEqual(company.industry, "technology")
        self.assertEqual(company.phone, "+15551234567")
        self.assertEqual(company.address, "100 Acme Way")

    def test_company_signup_duplicate_name_rejected(self):
        from companies.models import Company
        Company.objects.create(name="Existing Corp")

        data = {
            "role": "company_admin",
            "ownerName": "Bob_Owner",
            "ownerEmail": "bob@existing.com",
            "password": "StrongPassword123!",
            "companyName": "Existing Corp",
        }
        serializer = SignupSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("company_name", serializer.errors)

    def test_company_signup_rollback_on_error(self):
        from companies.models import Company
        # Existing user with email
        User.objects.create_user(email="taken@company.com", username="existinguser", password="password123")

        data = {
            "role": "company_admin",
            "ownerName": "New_Owner",
            "ownerEmail": "taken@company.com",  # Duplicate email to trigger failure
            "password": "StrongPassword123!",
            "companyName": "Rollback Corp",
        }
        serializer = SignupSerializer(data=data)
        # Email uniqueness fails
        self.assertFalse(serializer.is_valid())
        self.assertFalse(Company.objects.filter(name="Rollback Corp").exists())



