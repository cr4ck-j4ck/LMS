import { Routes, Route } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import Login from "../Auth/Login";
import ShowLMS from "../pages/showLMS";
import ShowClassroom from '../pages/ShowClassroom';
import Moodle from '../pages/Moodle';
import Canvas from '../pages/Canvas';
import ReportsPage from '../pages/ReportsPage';
import Welcome from '../pages/Welcome';
import MoodleAboard from "@/pages/MoodleAboard";
import CanvasAboard from "@/pages/CanvasAboard";
const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/showLMS" element={<ShowLMS />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/showClassroom" element={<ShowClassroom />} />
            <Route path="/moodle" element={<Moodle />} />
            <Route path="/canvas" element={<Canvas />} />
            <Route path="/ReportsPage" element={<ReportsPage/>} />            
            <Route path="/moodleAboard" element={<MoodleAboard/>} />
            <Route path="/canvasAboard" element={<CanvasAboard/>} />
        </Routes>
    )
};

export default AppRoutes;
