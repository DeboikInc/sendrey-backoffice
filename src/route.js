import { Routes, Route } from "react-router-dom";
import KycDashboard from "./page/home";
import Login from "./page/login";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/app" element={<KycDashboard />} />
        </Routes>
    )
}