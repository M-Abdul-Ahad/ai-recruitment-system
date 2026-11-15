import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#22241B",
        color: "#D4DE95"
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: "3px solid rgba(212, 222, 149, 0.2)",
          borderTopColor: "#D4DE95",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
      </div>
    );
  }

  if (user) {
    const role = user.role?.toLowerCase();
    if (role === "applicant") return <Navigate to="/applicant" replace />;
    if (role === "company_admin") return <Navigate to="/company" replace />;
    if (role === "recruiter") return <Navigate to="/recruiter" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PublicRoute;
