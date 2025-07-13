import React, { useEffect, useState } from "react";

interface Course {
  id: string;
  name: string;
  section?: string;
  description?: string;
  alternateLink?: string;
}

interface Syllabus {
  title: string;
  description: string;
  alternateLink: string;
  maxPoints?: number;
  state?: string;
}

const ShowClassroom: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [syllabusError, setSyllabusError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3000/google-api", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: "https://classroom.googleapis.com/v1/courses" })
        });
        const data = await res.json();
        setCourses(data.courses || []);
      } catch {
        setError("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const fetchSyllabus = async (courseId: string) => {
    setSyllabus(null);
    setSyllabusError(null);
    setSyllabusLoading(true);
    try {
      const res = await fetch("http://localhost:3000/google-api", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork` })
      });
      const data = await res.json();
      if (data.courseWork && data.courseWork.length > 0) {
        setSyllabus({
          title: data.courseWork[0].title,
          description: data.courseWork[0].description,
          alternateLink: data.courseWork[0].alternateLink,
          maxPoints: data.courseWork[0].maxPoints,
          state: data.courseWork[0].state
        });
      } else {
        setSyllabusError("No syllabus found for this course.");
      }
    } catch {
      setSyllabusError("Failed to fetch syllabus.");
    } finally {
      setSyllabusLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );
  if (error) return <div className="text-center text-red-600 font-semibold mt-8">{error}</div>;

  return (
    <div className="px-4 py-8 min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-10 drop-shadow-lg animate-fade-in">Google Classroom Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {courses.map((course, idx) => (
          <div
            key={course.id}
            className="bg-white/90 rounded-3xl shadow-lg p-7 flex flex-col gap-3 border border-blue-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out animate-fade-in"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {course.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-800">{course.name}</h2>
                {course.section && <p className="text-sm text-blue-500 font-medium">Section: {course.section}</p>}
              </div>
            </div>
            {course.description && <p className="text-gray-600 text-base mt-2 line-clamp-3">{course.description}</p>}
            <div className="flex justify-between items-end mt-4">
              <button
                onClick={() => fetchSyllabus(course.id)}
                className="inline-block px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold shadow hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-200"
              >
                Show Syllabus
              </button>
              <span className="text-xs text-gray-400 font-mono">ID: {course.id}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-3xl mx-auto mt-16 p-8 bg-white/80 rounded-2xl shadow-lg border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">All Fetched Syllabus</h2>
        {syllabusLoading && <div className="text-blue-500 font-semibold">Loading syllabus...</div>}
        {syllabusError && <div className="text-red-500 font-semibold">{syllabusError}</div>}
        {syllabus && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-blue-800 mb-2">{syllabus.title}</h3>
            <p className="text-gray-700 mb-2 whitespace-pre-line">{syllabus.description}</p>
            <a href={syllabus.alternateLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">View in Classroom</a>
            {syllabus.maxPoints !== undefined && <div className="mt-2 text-sm text-gray-500">Max Points: {syllabus.maxPoints}</div>}
            {syllabus.state && <div className="mt-1 text-xs text-gray-400">State: {syllabus.state}</div>}
          </div>
        )}
        {!syllabus && !syllabusLoading && !syllabusError && <div className="text-gray-400">No syllabus fetched yet.</div>}
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

export default ShowClassroom; 