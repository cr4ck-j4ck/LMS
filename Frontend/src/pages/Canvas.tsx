import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3000/canvas-api", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: "/api/v1/courses"
          })
        });
        const data = await res.json();
        setCourses(data || []);
      } catch {
        setError("Failed to fetch Canvas courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
    </div>
  );
  if (error) return <div className="text-center text-red-600 font-semibold mt-8">{error}</div>;

  return (
    <div className="px-4 py-8 min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-10 drop-shadow-lg animate-fade-in">Canvas Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {courses.map((course, idx) => (
          <div
            key={course.id}
            className="cursor-pointer bg-white/90 rounded-3xl shadow-lg p-7 flex flex-col gap-3 border border-purple-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out animate-fade-in"
            style={{ animationDelay: `${idx * 60}ms` }}
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
                href={course.calendar.ics}
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
