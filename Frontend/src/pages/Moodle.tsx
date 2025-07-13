import React, { useEffect, useState } from "react";

interface MoodleCourse {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  visible: number;
  displayname?: string;
}

const Moodle: React.FC = () => {
  const [courses, setCourses] = useState<MoodleCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3000/moodle-api", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=core_course_get_courses&moodlewsrestformat=json"
          })
        });
        const data = await res.json();
        setCourses(data || []);
      } catch {
        setError("Failed to fetch Moodle courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
    </div>
  );
  if (error) return <div className="text-center text-red-600 font-semibold mt-8">{error}</div>;

  return (
    <div className="px-4 py-8 min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <h1 className="text-4xl font-extrabold text-center text-green-700 mb-10 drop-shadow-lg animate-fade-in">Moodle Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {courses.map((course, idx) => (
          <div
            key={course.id}
            className="cursor-pointer bg-white/90 rounded-3xl shadow-lg p-7 flex flex-col gap-3 border border-green-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out animate-fade-in"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="min-w-12 min-h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {course.shortname ? course.shortname.charAt(0) : course.fullname.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">{course.fullname}</h2>
                <p className="text-sm text-green-500 font-medium">{course.shortname}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${course.visible ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-500'}`}>{course.visible ? 'Visible' : 'Hidden'}</span>
            </div>
            {course.summary && (
              <div className="text-gray-600 text-base mt-2 line-clamp-4" dangerouslySetInnerHTML={{ __html: course.summary }} />
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

export default Moodle;
