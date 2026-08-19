from django.urls import path
from .views import (
    CompanyCreateView,
    CompanyDetailView,
    AddHRView,
    RemoveHRView,
    HRListView,
    CompanyMembersView,
    DeleteMemberView,
    RecruiterInvitationView,
    RevokeInvitationView,
    VerifyInvitationView,
    AcceptInvitationView,
)

urlpatterns = [
    path("register/", CompanyCreateView.as_view(), name="company-register"),
    path("me/", CompanyDetailView.as_view(), name="company-me"),
    path("members/", CompanyMembersView.as_view(), name="company-members"),
    path("members/<int:pk>/", DeleteMemberView.as_view(), name="delete-member"),
    path("delete-hr/<int:pk>/", DeleteMemberView.as_view(), name="delete-hr"),
    path("add-hr/", AddHRView.as_view(), name="add-hr"),
    path("remove-hr/", RemoveHRView.as_view(), name="remove-hr"),
    path("hr-list/", HRListView.as_view(), name="hr-list"),
    path("invitations/", RecruiterInvitationView.as_view(), name="recruiter-invitations"),
    path("invitations/<int:pk>/", RevokeInvitationView.as_view(), name="revoke-invitation"),
    path("invitations/verify/", VerifyInvitationView.as_view(), name="verify-invitation"),
    path("invitations/accept/", AcceptInvitationView.as_view(), name="accept-invitation"),
]

