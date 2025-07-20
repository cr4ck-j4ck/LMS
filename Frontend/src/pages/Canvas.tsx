import { useEffect, useState } from "react";
import axios from "axios";
import { FaLayerGroup } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  start_at: string | null;
  end_at: string | null;
  calendar?: { ics: string };
  workflow_state: string;
}

const Canvas: React.FC = () => {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/canvas-api`,
          {
            url: "/api/v1/courses"
          },
          { withCredentials: true, headers: { "Content-Type": "application/json" } }
        );
        // Check for 401 or login error in response
        if (
          res.status === 401 ||
          (typeof res.data === 'string' && (res.data.includes('Please Login') || res.data.includes('not loginned'))) ||
          (typeof res.data === 'object' && res.data.message && (res.data.message.includes('Please Login') || res.data.message.includes('not loginned')))
        ) {
          navigate('/canvasAboard', { replace: true });
          return;
        }
        setCourses(res.data || []);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const res = err.response;
          if (
            res?.status === 401 ||
            (typeof res?.data === 'string' && (res.data.includes('Please Login') || res.data.includes('not loginned')))
          ) {
            navigate('/canvasAboard', { replace: true });
            return;
          }
        }
        setError("Failed to fetch Canvas courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-full bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 animate-fade-in">
      <div className="relative flex flex-col items-center py-5 ">
        <span className="animate-bounce-slow">
          <FaLayerGroup className="text-7xl text-purple-500 drop-shadow-lg" />
        </span>
        <span className="mt-6 text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-blue-600 to-pink-500 animate-glow">Loading Canvas Courses...</span>
        <div className="mt-4 w-32 h-2 rounded-full bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 animate-pulse-glow" />
      </div>
      <style>{`
        .animate-bounce-slow { animation: bounce 2s infinite alternate; }
        @keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-24px); } }
        .animate-glow { animation: glow 1.5s ease-in-out infinite alternate; }
        @keyframes glow { 0% { text-shadow: 0 0 8px #c4b5fd, 0 0 16px #f472b6; } 100% { text-shadow: 0 0 24px #c4b5fd, 0 0 32px #f472b6; } }
        .animate-pulse-glow { animation: pulseGlow 1.2s infinite alternate; }
        @keyframes pulseGlow { 0% { opacity: 0.7; } 100% { opacity: 1; box-shadow: 0 0 24px #c4b5fd, 0 0 32px #f472b6; } }
        .animate-fade-in { animation: fadeInUp 1s both; }
        @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 40px, 0); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
  if (error) return <div className="text-center text-red-600 font-semibold mt-8">{error}</div>;

  return (
    <div className="px-4 py-8 min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-10 drop-shadow-lg animate-fade-in">Canvas Courses</h1>
      <div className="Yhide py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {courses.map((course, idx) => (
          <div
            key={course.id}
            className="cursor-pointer bg-white/90 rounded-3xl shadow-lg p-7 flex flex-col gap-3 border border-purple-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out animate-fade-in"
            style={{ animationDelay: `${idx * 60}ms` }}
            onClick={() => navigate(`/canvas-syllabus/${course.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="min-w-12 min-h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {course.course_code ? course.course_code.charAt(0) : course.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-purple-800">{course.name}</h2>
                <p className="text-sm text-purple-500 font-medium">{course.course_code}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${course.workflow_state === 'available' ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-500'}`}>{course.workflow_state}</span>
            </div>
            <div className="text-gray-600 text-base mt-2">
              {course.start_at && <span className="block">Start: {new Date(course.start_at).toLocaleDateString()}</span>}
              {course.end_at && <span className="block">End: {new Date(course.end_at).toLocaleDateString()}</span>}
            </div>
            {course.calendar?.ics && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-4 py-2 bg-purple-700 rounded-lg font-semibold shadow hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-colors duration-200"
              >
                View Syllabus 
              </a>
            )}
            <span className="text-xs text-gray-400 font-mono mt-2">ID: {course.id}</span>
          </div>
        ))}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeInUp 0.7s both;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Canvas;
