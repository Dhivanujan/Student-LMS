import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import StudentDashboard from "../components/RoleDashboards/StudentDashboard";
import LecturerDashboard from "../components/RoleDashboards/LecturerDashboard";
import AdminDashboard from "../components/RoleDashboards/AdminDashboard";

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    switch (user.role) {
        case "admin":
            return <AdminDashboard />;
        case "lecturer":
            return <LecturerDashboard />;
        case "student":
        default:
            return <StudentDashboard />;
    }
};

export default Dashboard;
