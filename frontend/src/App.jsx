import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";
import HRRoute from "./auth/HRRoute";
import Login from "./auth/Login";
import Signup from "./auth/Signup";

import ApplicantDashboard from "./applicant/Dashboard";
import ApplicantResume from "./applicant/Resume";

import RecruiterDashboard from "./recruiter/RecruiterDashboard";
import Company from "./recruiter/Company";
import HRDashboard from "./recruiter/HRDashboard";

import AdminDashboard from "./admin/AdminDashboard";

import Unauthorized from "./pages/Unauthorized";
import { useContext } from "react";

import Home from "./pages/Home";

function RootRedirect() {
  const { user } = useContext(AuthContext);
  console.log("RootRedirect user:", user);

  if (!user) return <Home />;

  const role = user?.role?.toLowerCase();
  console.log("Redirecting based on role:", role);

  if (role === "applicant") return <Navigate to="/applicant" replace />;
  if (role === "recruiter") return <Navigate to="/recruiter" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/unauthorized" replace />;
}

function FallbackRoute() {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/unauthorized" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root Redirect based on role */}
          <Route path="/" element={<RootRedirect />} />

          {/* Applicant Routes */}
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
                <ApplicantResume />
              </RoleRoute>
            }
          />

          {/* Recruiter Routes */}
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

          {/* HR Routes */}
          <Route
            path="/hr"
            element={
              <HRRoute>
                <HRDashboard />
              </HRRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDashboard />
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