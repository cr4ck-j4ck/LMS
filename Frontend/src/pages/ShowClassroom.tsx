import React, { useEffect, useState } from "react";

interface DriveFile {
  driveFile: {
    alternateLink: string;
    id: string;
    thumbnailUrl?: string;
    title: string;
  };
  shareMode?: string;
}

interface Material {
  driveFile?: DriveFile;
}

interface Course {
  id: string;
  name: string;
  section?: string;
  description?: string;
  alternateLink?: string;
}

interface CourseWork {
  title: string;
  description: string;
  alternateLink: string;
  maxPoints?: number;
  state?: string;
  id?: string;
  materials?: Material[];
}

const ShowClassroom: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syllabus, setSyllabus] = useState<CourseWork[]>([]);
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
    setSyllabus([]);
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
        const syllabusData: CourseWork[] = data.courseWork.map((work: CourseWork) => ({
          title: work.title,
          description: work.description,
          alternateLink: work.alternateLink,
          maxPoints: work.maxPoints,
          state: work.state,
          id: work.id,
          materials: work.materials || []
        }));
        setSyllabus(syllabusData);
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
      <div className="max-w-4xl mx-auto mt-16 p-8 bg-white/80 rounded-2xl shadow-lg border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">All Fetched Syllabus</h2>
        {syllabusLoading && <div className="text-blue-500 font-semibold">Loading syllabus...</div>}
        {syllabusError && <div className="text-red-500 font-semibold">{syllabusError}</div>}
        {syllabus.length > 0 && (
          <div className="space-y-8">
            {syllabus.map((item, idx) => (
              <div key={item.id || idx} className="relative mb-45">
                {/* Syllabus Item */}
                <div className="animate-fade-in border border-blue-200 rounded-xl p-6 bg-white/50">
                  <h3 className="text-xl font-bold text-blue-800 mb-2">{item.title}</h3>
                  <p className="text-gray-700 mb-2 whitespace-pre-line">{item.description}</p>
                  <a href={item.alternateLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">View in Classroom</a>
                  {item.maxPoints !== undefined && <div className="mt-2 text-sm text-gray-500">Max Points: {item.maxPoints}</div>}
                  {item.state && <div className="mt-1 text-xs text-gray-400">State: {item.state}</div>}
                </div>

                {/* Hand-drawn L line */}
                <svg width="70" height="120" className="my-[-8px] ml-2">
                  <defs>
                    <linearGradient id="blueL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                  <path d="M15 10 Q15 70 65 70" stroke="url(#blueL)" strokeWidth="5" fill="none" strokeLinecap="round"/>
                </svg>

                {/* Document Box  */}
                <div className="absolute left-18 -bottom-35 w-2/3 bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-md">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">Documents</h4>
                  {item.materials && item.materials.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {item.materials.map((mat, i) =>
                        mat.driveFile && mat.driveFile.driveFile ? (
                          <a
                            key={i}
                            href={mat.driveFile.driveFile.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white rounded shadow hover:bg-blue-50 transition"
                          >
                            {mat.driveFile.driveFile.thumbnailUrl && (
                              <img
                                src={mat.driveFile.driveFile.thumbnailUrl}
                                alt={mat.driveFile.driveFile.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <span className="font-medium text-blue-700">{mat.driveFile.driveFile.title}</span>
                          </a>
                        ) : null
                      )}
                      {/* Plagiarism checker button */}
                      <PlagiarismButton />
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">No documents yet.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!syllabus.length && !syllabusLoading && !syllabusError && <div className="text-gray-400">No syllabus fetched yet.</div>}
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

// Add this component at the bottom of the file
const PlagiarismButton: React.FC = () => {
  const [sending, setSending] = React.useState(false);

  const handleClick = () => {
    setSending(true);
    setTimeout(() => setSending(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      className={`mt-4 flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 relative ${sending ? 'cursor-wait' : ''}`}
      disabled={sending}
    >
      {sending ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      ) : (
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
        </svg>
      )}
      <span className="ml-2 text-base">
        {sending ? 'Checking....' : 'Send file to plagiarism checker'}
      </span>
    </button>
  );
}; 