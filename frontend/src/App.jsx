import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./auth/AuthContext";
import RoleRoute from "./auth/RoleRoute";
import PublicRoute from "./auth/PublicRoute";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import SetupPassword from "./auth/SetupPassword";
import ApplicantLayout from "./layouts/ApplicantLayout";
import RecruiterLayout from "./layouts/RecruiterLayout";
import CompanyLayout from "./layouts/CompanyLayout";

import ApplicantDashboard from "./applicant/Dashboard";
import ResumeAnalysis from "./applicant/ResumeAnalysis";
import ResumeBuilder from "./applicant/ResumeBuilder";
import ApplicantJobs from "./applicant/Jobs";
import Applications from "./applicant/Applications";

import RecruiterDashboard from "./recruiter/RecruiterDashboard";
import Company from "./recruiter/Company";
import CandidateDetail from "./recruiter/CandidateDetail";
import CreateJob from "./recruiter/CreateJob";
import RecruiterJobs from "./recruiter/Jobs";
import CandidateShortlisting from "./recruiter/CandidateShortlisting";
import CandidateManagement from "./recruiter/CandidateManagement";

import CompanyDashboard from "./company/CompanyDashboard";
import RecruiterManagement from "./company/RecruiterManagement";
import CompanySettings from "./company/CompanySettings";

import AdminDashboard from "./admin/AdminDashboard";
import Users from "./admin/Users";
import Companies from "./admin/Companies";
import Jobs from "./admin/Jobs";

import Unauthorized from "./pages/Unauthorized";
import Home from "./pages/Home";

import { useContext } from "react";

/* ---------------- FALLBACK ---------------- */

function FallbackRoute() {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/unauthorized" replace />;
}

/* ---------------- APP ---------------- */

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/setup-password" element={
            <PublicRoute>
              <SetupPassword />
            </PublicRoute>
          } />
          <Route path="/accept-invitation" element={
            <PublicRoute>
              <SetupPassword />
            </PublicRoute>
          } />
          <Route path="/unauthorized" element={<Unauthorized />} />


          {/* Root */}
          <Route path="/" element={<Home />} />

          {/* ================= APPLICANT ================= */}
          <Route
            path="/applicant"
            element={
              <RoleRoute allowedRoles={["applicant"]}>
                <ApplicantLayout />
              </RoleRoute>
            }
          >
            <Route index element={<ApplicantDashboard />} />
            <Route path="resume"       element={<ResumeAnalysis />} />
            <Route path="builder"      element={<ResumeBuilder />} />
            <Route path="jobs"         element={<ApplicantJobs />} />
            <Route path="applications" element={<Applications />} />
          </Route>

          {/* ================= RECRUITER (HR INCLUDED) ================= */}
          <Route
            path="/recruiter"
            element={
              <RoleRoute allowedRoles={["recruiter", "company_admin"]}>
                <RecruiterLayout />
              </RoleRoute>
            }
          >
            <Route index                   element={<RecruiterDashboard />} />
            <Route path="company"          element={<Company />} />
            <Route path="jobs"             element={<RecruiterJobs />} />
            <Route path="jobs/create"      element={<CreateJob />} />
            <Route path="candidates"       element={<CandidateManagement />} />
            <Route path="shortlist/:jobId" element={<CandidateShortlisting />} />
            <Route path="candidate/:id"    element={<CandidateDetail />} />
          </Route>

          {/* ================= COMPANY MANAGEMENT ================= */}
          <Route
            path="/company"
            element={
              <RoleRoute allowedRoles={["company_admin"]}>
                <CompanyLayout />
              </RoleRoute>
            }
          >
            <Route index element={<CompanyDashboard />} />
            <Route path="recruiters" element={<RecruiterManagement />} />
            <Route path="settings" element={<CompanySettings />} />
          </Route>

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Users />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/companies"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Companies />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/jobs"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Jobs />
              </RoleRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<FallbackRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}