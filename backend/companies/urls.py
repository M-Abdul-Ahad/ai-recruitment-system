from django.urls import path
from .views import CompanyCreateView, CompanyDetailView, AddHRView, RemoveHRView, HRListView, CompanyMembersView

urlpatterns = [
    path("register/", CompanyCreateView.as_view(), name="company-register"),
    path("me/", CompanyDetailView.as_view(), name="company-me"),
    path("members/", CompanyMembersView.as_view(), name="company-members"),
    path("add-hr/", AddHRView.as_view(), name="add-hr"),
    path("remove-hr/", RemoveHRView.as_view(), name="remove-hr"),
    path("hr-list/", HRListView.as_view(), name="hr-list"),
]
