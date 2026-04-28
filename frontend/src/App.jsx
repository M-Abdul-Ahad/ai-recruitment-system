import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./auth/AuthContext";
import RoleRoute from "./auth/RoleRoute";
import PublicRoute from "./auth/PublicRoute";
import Login from "./auth/Login";
import Signup from "./auth/Signup";

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
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root */}
          <Route path="/" element={<Home />} />

          {/* ================= APPLICANT ================= */}
          <Route
            path="/applicant"
            element={
              <RoleRoute allowedRoles={["applicant"]}>
                <ApplicantDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/applicant/resume"
            element={
              <RoleRoute allowedRoles={["applicant"]}>
                <ResumeAnalysis />
              </RoleRoute>
            }
          />

          <Route
            path="/applicant/builder"
            element={
              <RoleRoute allowedRoles={["applicant"]}>
                <ResumeBuilder />
              </RoleRoute>
            }
          />

          <Route
            path="/applicant/jobs"
            element={
              <RoleRoute allowedRoles={["applicant"]}>
                <ApplicantJobs />
              </RoleRoute>
            }
          />

          <Route
            path="/applicant/applications"
            element={
              <RoleRoute allowedRoles={["applicant"]}>
                <Applications />
              </RoleRoute>
            }
          />

          {/* ================= RECRUITER (HR INCLUDED) ================= */}
          <Route
            path="/recruiter"
            element={
              <RoleRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/recruiter/company"
            element={
              <RoleRoute allowedRoles={["recruiter"]}>
                <Company />
              </RoleRoute>
            }
          />

          <Route
            path="/recruiter/jobs"
            element={
              <RoleRoute allowedRoles={["recruiter"]}>
                <RecruiterJobs />
              </RoleRoute>
            }
          />

          <Route
            path="/recruiter/jobs/create"
            element={
              <RoleRoute allowedRoles={["recruiter"]}>
                <CreateJob />
              </RoleRoute>
            }
          />

          <Route
            path="/recruiter/shortlist/:jobId"
            element={
              <RoleRoute allowedRoles={["recruiter"]}>
                <CandidateShortlisting />
              </RoleRoute>
            }
          />

          <Route
            path="/recruiter/candidate/:id"
            element={
              <RoleRoute allowedRoles={["recruiter"]}>
                <CandidateDetail />
              </RoleRoute>
            }
          />

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