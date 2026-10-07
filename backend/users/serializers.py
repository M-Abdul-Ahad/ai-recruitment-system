from __future__ import annotations

import logging
from typing import Any

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from companies.models import Company
from companies.email_utils import send_registration_submitted_email
from core.r2_storage import upload_company_document, upload_user_cnic, generate_presigned_view_url
from users.models import Role, User, UserRole
from users.validators import validate_company_document, validate_cnic_file

logger = logging.getLogger("users.serializers")


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    company_email = serializers.EmailField(write_only=True, required=False, allow_blank=True, default="")
    website = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    industry = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    address = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    logo = serializers.ImageField(write_only=True, required=False, allow_null=True, default=None)

    # Applicant CNIC Fields
    cnic_number = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    cnic_image = serializers.ImageField(write_only=True, required=False, allow_null=True, default=None)

    # Company Legal Verification Fields
    document_type = serializers.ChoiceField(
        choices=Company.DocumentType.choices,
        write_only=True,
        required=False,
        allow_blank=True,
        default="",
    )
    tax_id = serializers.CharField(write_only=True, required=False, allow_blank=True, default="")
    registration_document = serializers.FileField(write_only=True, required=False, allow_null=True, default=None)

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
            'cnic_number', 'cnic_image',
            'company_name', 'company_email', 'website', 'industry', 'phone', 'address', 'logo',
            'document_type', 'tax_id', 'registration_document',
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
            'cnicNumber': 'cnic_number',
            'cnicImage': 'cnic_image',
            'documentType': 'document_type',
            'docType': 'document_type',
            'taxId': 'tax_id',
            'taxNumber': 'tax_id',
            'registrationDocument': 'registration_document',
            'registrationDoc': 'registration_document',
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
        document_type = attrs.get('document_type', '')
        tax_id = attrs.get('tax_id', '')
        reg_doc = attrs.get('registration_document')
        cnic_image = attrs.get('cnic_image')

        # Applicant identity verification validation
        if role == User.Role.APPLICANT:
            cnic_number = attrs.get('cnic_number', '').strip()
            if not cnic_number:
                raise serializers.ValidationError({"cnic_number": "CNIC / National ID number is required."})
            if not cnic_image:
                raise serializers.ValidationError({"cnic_image": "CNIC document / image upload is required."})
            validate_cnic_file(cnic_image)
        elif cnic_image:
            validate_cnic_file(cnic_image)

        # Company legal verification validation
        if role == User.Role.COMPANY_ADMIN or (role == User.Role.RECRUITER and company_name):
            if not company_name.strip():
                raise serializers.ValidationError({"company_name": "Company name is required."})

            if Company.objects.filter(name__iexact=company_name.strip()).exists():
                raise serializers.ValidationError({"company_name": "A company with this name already exists."})

            if not document_type:
                raise serializers.ValidationError({
                    "document_type": "Please select a legal verification document type (SECP Certificate of Incorporation or NTN Certificate)."
                })

            if not tax_id.strip():
                raise serializers.ValidationError({
                    "tax_id": "Registration / Tax ID (NTN or SECP CUIN number) is required for company verification."
                })

            if not reg_doc:
                raise serializers.ValidationError({
                    "registration_document": "Please upload an official registration document (SECP or NTN Certificate)."
                })

            validate_company_document(reg_doc)

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

        document_type = validated_data.pop('document_type', '').strip()
        tax_id = validated_data.pop('tax_id', '').strip()
        registration_document_file = validated_data.pop('registration_document', None)

        cnic_number = validated_data.pop('cnic_number', '').strip()
        cnic_image_file = validated_data.pop('cnic_image', None)

        role = validated_data.pop('role', User.Role.APPLICANT)
        if role == User.Role.ADMIN:
            role = User.Role.APPLICANT

        with transaction.atomic():
            if role == User.Role.COMPANY_ADMIN or (role == User.Role.RECRUITER and company_name):
                # Upload company document to Cloudflare R2 under company-docs/
                r2_doc_key = ""
                if registration_document_file:
                    try:
                        r2_doc_key = upload_company_document(
                            file_obj=registration_document_file,
                            filename=registration_document_file.name,
                            company_name=company_name,
                        )
                    except Exception as e:
                        logger.error("[Company Signup] Failed to upload verification doc to R2: %s", e)
                        raise serializers.ValidationError({
                            "registration_document": "Could not upload document to secure cloud storage. Please try again."
                        })

                company = Company.objects.create(
                    name=company_name,
                    email=company_email,
                    website=website,
                    industry=industry,
                    phone=phone,
                    address=address,
                    logo=logo,
                    document_type=document_type,
                    tax_id=tax_id,
                    registration_document=r2_doc_key,
                    verification_status=Company.VerificationStatus.PENDING,
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

                # Send email confirmation that registration is under review
                target_email = company_email or user.email
                recipient_name = user.username or company_name
                try:
                    send_registration_submitted_email(
                        to_email=target_email,
                        company_name=company_name,
                        owner_name=recipient_name,
                    )
                except Exception as mail_exc:
                    logger.warning("[Company Signup] Failed to send registration email: %s", mail_exc)

                return user
            else:
                # Upload applicant CNIC image to Cloudflare R2 under users-cnic/
                r2_cnic_key = ""
                if cnic_image_file:
                    try:
                        r2_cnic_key = upload_user_cnic(
                            file_obj=cnic_image_file,
                            filename=cnic_image_file.name,
                            username=validated_data['username'],
                        )
                    except Exception as e:
                        logger.error("[User Signup] Failed to upload CNIC image to R2: %s", e)
                        raise serializers.ValidationError({
                            "cnic_image": "Could not upload CNIC image to secure storage. Please try again."
                        })

                user = User.objects.create_user(
                    email=validated_data['email'],
                    username=validated_data['username'],
                    password=validated_data['password'],
                    role=role,
                    cnic_number=cnic_number,
                    cnic_image=r2_cnic_key,
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
    company_name = serializers.CharField(source="company.name", read_only=True, default=None)
    company_verification_status = serializers.CharField(source="company.verification_status", read_only=True, default=None)
    cnic_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'is_hr', 'company', 'company_name',
            'company_verification_status', 'cnic_number', 'cnic_image', 'cnic_image_url',
        ]
        read_only_fields = ['id', 'email', 'cnic_image_url']

    def get_cnic_image_url(self, obj: User) -> str | None:
        return generate_presigned_view_url(obj.cnic_image) if obj.cnic_image else None

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
        user: User = self.user  # type: ignore[assignment]
        data.update(
            {
                'user_id': user.id,
                'email': user.email,
                'role': user.role,
                'is_hr': user.is_hr,
                'company_id': user.company_id if user.company else None,
                'company_name': user.company.name if user.company else None,
                'company_verification_status': getattr(user.company, 'verification_status', None) if user.company else None,
            }
        )
        return data


# ============================================================
# ADMIN SERIALIZERS
# ============================================================

class RoleSerializer(serializers.ModelSerializer):
    """CRUD serializer for the Role model (admin use only)."""

    class Meta:
        model = Role
        fields = ['id', 'name']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Role name cannot be blank.")
        return value


class AdminUserSerializer(serializers.ModelSerializer):
    """Full user serializer for admin list/create/update/delete."""

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        validators=[validate_password],
    )
    role_name = serializers.SerializerMethodField(read_only=True)
    company_name = serializers.SerializerMethodField(read_only=True)
    cnic_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'role_fk',
            'role_name', 'is_hr', 'company', 'company_name',
            'cnic_number', 'cnic_image', 'cnic_image_url',
            'is_active', 'date_joined', 'password',
        ]
        read_only_fields = ['id', 'date_joined', 'role_name', 'company_name', 'cnic_image_url']
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
            'role_fk': {'required': False, 'allow_null': True},
        }

    def get_role_name(self, obj):
        return obj.role_fk.name if obj.role_fk else obj.role

    def get_company_name(self, obj):
        return obj.company.name if obj.company else None

    def get_cnic_image_url(self, obj: User) -> str | None:
        return generate_presigned_view_url(obj.cnic_image) if obj.cnic_image else None

    def validate(self, attrs):
        if self.instance is None:
            password = attrs.get('password', '').strip()
            if not password:
                raise serializers.ValidationError({'password': 'Password is required when creating a user.'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', User.Role.APPLICANT)

        with transaction.atomic():
            user = User(**validated_data)
            user.set_password(password)
            user.save()

            role_obj = Role.objects.filter(name=role).first()
            if role_obj:
                user.role_fk = role_obj
                user.save(update_fields=['role_fk'])

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        role = validated_data.get('role', instance.role)

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            if password:
                instance.set_password(password)

            role_obj = Role.objects.filter(name=role).first()
            instance.role_fk = role_obj
            instance.save()

        return instance
