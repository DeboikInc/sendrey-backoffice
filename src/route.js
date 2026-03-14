import { Routes, Route, } from "react-router-dom";
import Home from "./page/home";
import Login from "./page/auth/login";
import Register from "./page/auth/register";
import ProtectedRoute from "./components/ProtectedRoute";


export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/reg-admin" element={<Register />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/home-admin" element={<Home />} />
                {/* Add more protected routes here */}
            </Route>
        </Routes>
    )
}