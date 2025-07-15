import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import Login from "../Auth/Login";
import MainPage from "../pages/MainPage";
import ShowClassroom from '../pages/ShowClassroom';
import Moodle from '../pages/Moodle';
import Canvas from '../pages/Canvas';
import ReportsPage from '../pages/ReportsPage';
const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/showClassroom" element={<ShowClassroom />} />
            <Route path="/moodle" element={<Moodle />} />
            <Route path="/canvas" element={<Canvas />} />
            <Route path="/ReportsPage" element={<ReportsPage/>} />
        </Routes>
    )
};

export default AppRoutes;
