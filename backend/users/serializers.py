from __future__ import annotations

from typing import Any

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from companies.models import Company
from users.models import Role, User



class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    company_email = serializers.EmailField(write_only=True, required=False, allow_blank=True, default="")
    website = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    industry = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    address = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    logo = serializers.ImageField(write_only=True, required=False, allow_null=True, default=None)

    allowed_roles = [User.Role.APPLICANT, User.Role.RECRUITER, User.Role.COMPANY_ADMIN]
    role = serializers.ChoiceField(
        choices=[(r, r.title()) for r in allowed_roles],
        default=User.Role.APPLICANT,
        required=False,
    )

    class Meta:
        model = User
        fields = [
            'email', 'password', 'username', 'role',
            'company_name', 'company_email', 'website', 'industry', 'phone', 'address', 'logo'
        ]
        extra_kwargs = {
            'username': {'write_only': True},
        }

    def to_internal_value(self, data):
        # Support both camelCase (from frontend form) and snake_case fields
        if hasattr(data, 'dict'):
            data_dict = data.dict()
        elif hasattr(data, 'copy'):
            data_dict = data.copy()
        elif isinstance(data, dict):
            data_dict = data.copy()
        else:
            data_dict = dict(data)

        camel_to_snake = {
            'companyName': 'company_name',
            'companyEmail': 'company_email',
            'ownerName': 'username',
            'ownerEmail': 'email',
        }
        for camel, snake in camel_to_snake.items():
            if camel in data_dict and snake not in data_dict:
                data_dict[snake] = data_dict[camel]

        if 'username' in data_dict and isinstance(data_dict['username'], str):
            data_dict['username'] = data_dict['username'].strip().replace(' ', '_')

        return super().to_internal_value(data_dict)

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Cannot assign admin role during signup.")
        return value

    def validate(self, attrs):
        is_hr = attrs.get('is_hr', getattr(self.instance, 'is_hr', False))
        role = attrs.get('role', getattr(self.instance, 'role', User.Role.APPLICANT))
        company = attrs.get('company', getattr(self.instance, 'company', None))
        company_name = attrs.get('company_name', '')

        if role in (User.Role.COMPANY_ADMIN, User.Role.RECRUITER) and company_name:
            if Company.objects.filter(name__iexact=company_name.strip()).exists():
                raise serializers.ValidationError({"company_name": "A company with this name already exists."})
        elif role == User.Role.COMPANY_ADMIN and not company_name:
            raise serializers.ValidationError({"company_name": "Company name is required for company registration."})

        if is_hr and role not in (User.Role.RECRUITER, User.Role.COMPANY_ADMIN):
            raise serializers.ValidationError({"is_hr": "Only recruiters or company admins can be HR."})

        if role == User.Role.APPLICANT and company is not None:
            raise serializers.ValidationError({"company": "Applicants cannot belong to a company."})

        return attrs

    def create(self, validated_data):
        company_name = validated_data.pop('company_name', '').strip()
        company_email = validated_data.pop('company_email', '').strip()
        website = validated_data.pop('website', '').strip()
        industry = validated_data.pop('industry', '').strip()
        phone = validated_data.pop('phone', '').strip()
        address = validated_data.pop('address', '').strip()
        logo = validated_data.pop('logo', None)

        role = validated_data.pop('role', User.Role.APPLICANT)
        if role == User.Role.ADMIN:
            role = User.Role.APPLICANT

        with transaction.atomic():
            if role == User.Role.COMPANY_ADMIN or (role == User.Role.RECRUITER and company_name):
                company = Company.objects.create(
                    name=company_name,
                    email=company_email,
                    website=website,
                    industry=industry,
                    phone=phone,
                    address=address,
                    logo=logo,
                )
                user_role = User.Role.COMPANY_ADMIN
                user = User.objects.create_user(
                    email=validated_data['email'],
                    username=validated_data['username'],
                    password=validated_data['password'],
                    role=user_role,
                    company=company,
                    is_hr=True,
                )
                role_obj = Role.objects.filter(name=user_role).first()
                if role_obj:
                    user.role_fk = role_obj
                    user.save(update_fields=['role_fk'])
                return user
            else:
                user = User.objects.create_user(
                    email=validated_data['email'],
                    username=validated_data['username'],
                    password=validated_data['password'],
                    role=role,
                )
                role_obj = Role.objects.filter(name=role).first()
                if role_obj:
                    user.role_fk = role_obj
                    user.save(update_fields=['role_fk'])
                return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {k: data[k] for k in ('email', 'role') if k in data}


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_hr', 'company']
        read_only_fields = ['id', 'email']

    def validate(self, attrs):
        is_hr = attrs.get('is_hr', getattr(self.instance, 'is_hr', False))
        role = attrs.get('role', getattr(self.instance, 'role', User.Role.APPLICANT))
        company = attrs.get('company', getattr(self.instance, 'company', None))
        
        if role == User.Role.APPLICANT and company is not None:
            raise serializers.ValidationError({"company": "Applicants cannot belong to a company."})
            
        if is_hr and company is None:
            raise serializers.ValidationError({"is_hr": "HR must belong to a company."})
            
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extends SimpleJWT's serializer to include user info in the payload."""

    def validate(self, attrs):
        data = super().validate(attrs)
        # add custom fields, leaving tokens untouched
        user: User = self.user  # type: ignore[assignment]
        data.update(  # type: ignore[arg-type]
            {
                'user_id': user.id,
                'email': user.email,
                'role': user.role,
                'is_hr': user.is_hr,
            }
        )
        return data
