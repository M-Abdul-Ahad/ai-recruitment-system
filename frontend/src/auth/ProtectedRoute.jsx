import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { jwtDecode } from "jwt-decode";

// mapping user roles to their dashboard paths
const roleRedirects = {
  applicant: "/applicant-dashboard",
  recruiter: "/recruiter-dashboard",
  admin: "/admin-dashboard",
};

const ProtectedRoute = ({ children }) => {
  const { user: contextUser } = useContext(AuthContext);
  const location = useLocation();

  // try to obtain a user object from context first, otherwise fall back to decoding
  // token from localStorage so routes work even if context hasn't hydrated yet.
  let user = contextUser;
  if (!user) {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        user = jwtDecode(token);
      } catch (e) {
        // invalid token, ignore
      }
    }
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const desiredPath = roleRedirects[user.role];
  if (!desiredPath) {
    // unknown role: treat as unauthenticated
    return <Navigate to="/login" />;
  }

  // if user is on a dashboard path that doesn't match their role, send them to
  // the correct one. Also handle the generic /dashboard entry point.
  const isDashboardPath =
    location.pathname === "/dashboard" ||
    Object.values(roleRedirects).includes(location.pathname);

  if (isDashboardPath && location.pathname !== desiredPath) {
    return <Navigate to={desiredPath} replace />;
  }

  return children;
};

export default ProtectedRoute;