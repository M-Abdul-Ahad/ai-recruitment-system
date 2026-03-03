from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    # expose only applicant and recruiter during public signup; admin cannot be chosen
    allowed_roles = [User.Role.APPLICANT, User.Role.RECRUITER]
    role = serializers.ChoiceField(
        choices=[(r, r.title()) for r in allowed_roles],
        default=User.Role.APPLICANT,
        required=False,
    )

    class Meta:
        model = User
        fields = ['email', 'password', 'username', 'role']
        extra_kwargs = {
            'username': {'write_only': True},
        }

    def validate_role(self, value):
        # additional guard in case someone bypasses the field choices
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Cannot assign admin role during signup.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', User.Role.APPLICANT)
        # safeguard: if somehow ADMIN got through, fall back
        if role == User.Role.ADMIN:
            role = User.Role.APPLICANT
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            role=role,
        )
        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # only return email and role in signup responses
        return {k: data[k] for k in ('email', 'role') if k in data}


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extends SimpleJWT's serializer to include user info in the payload."""

    def validate(self, attrs):
        data = super().validate(attrs)
        # add custom fields, leaving tokens untouched
        data.update(
            {
                'user_id': self.user.id,
                'email': self.user.email,
                'role': self.user.role,
            }
        )
        return data
