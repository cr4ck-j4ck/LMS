import { Routes, Route } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import Login from "../Auth/Login";
// import { useEffect } from "react";
// import axios from "axios";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    )
};

export default AppRoutes;
