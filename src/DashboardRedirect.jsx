import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const DashboardRedirect = () => {
    const { user } = useAuth();

    if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (user?.role === 'instructor') {
        return <Navigate to="/instructor/dashboard" replace />;
    }
    
    return <Navigate to="/login" replace />;
}

export default DashboardRedirect;
