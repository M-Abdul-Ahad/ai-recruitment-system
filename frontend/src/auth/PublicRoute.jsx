import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const PublicRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (user) {
        const role = user.role?.toLowerCase();
        if (role === "applicant") return <Navigate to="/applicant" replace />;
        if (role === "recruiter" || role === "company_admin") return <Navigate to="/recruiter" replace />;
        if (role === "admin") return <Navigate to="/admin" replace />;
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default PublicRoute;
