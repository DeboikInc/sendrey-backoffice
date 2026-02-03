import { Routes, Route, } from "react-router-dom";
import KycDashboard from "./page/home";
import Login from "./page/login";
import ProtectedRoute from "./components/ProtectedRoute";


export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/app/sendrey" element={<KycDashboard />} />
                {/* Add more protected routes here */}
            </Route>
        </Routes>
    )
}