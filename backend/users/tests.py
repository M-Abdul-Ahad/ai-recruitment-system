from django.test import TestCase
from django.contrib.auth import get_user_model
from .serializers import SignupSerializer


User = get_user_model()


class UserModelTests(TestCase):
    def test_default_role_is_applicant(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123",
        )
        self.assertEqual(user.role, User.Role.APPLICANT)

    def test_cannot_set_blank_or_null_role(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email="another@example.com",
                username="user2",
                password="password123",
                role="",
            )


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

