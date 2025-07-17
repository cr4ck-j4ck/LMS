import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaBookOpen, FaFilePdf, FaFileAlt, FaDownload } from "react-icons/fa";
import ShowCanvasSubmissionsButton from "../Components/ShowCanvasSubmissions";

interface CanvasSyllabusData {
  id: number;
  name: string;
  course_code: string;
  start_at?: string;
  end_at?: string;
  syllabus_body?: string;
  calendar?: { ics: string };
  workflow_state?: string;
}

interface CanvasAssignment {
  id: number;
  name?: string;
  title?: string;
  due_at?: string;
  description?: string;
  html_url?: string;
}

// Helper to extract file links from HTML and return { cleanedHtml, files: [{ href, title, filename }] }
function extractFileLinks(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const fileLinks: { href: string; title: string; filename: string }[] = [];
  doc.querySelectorAll("a.instructure_file_link").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const title = a.getAttribute("title") || a.textContent || "File";
    // Try to get filename from title or text
    let filename = title;
    if (a.textContent && a.textContent.trim()) filename = a.textContent.trim();
    fileLinks.push({ href, title, filename });
    a.remove(); // Remove from HTML
  });
  return { cleanedHtml: doc.body.innerHTML, files: fileLinks };
}

const CanvasSyllabus: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [data, setData] = useState<CanvasSyllabusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Assignments state
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(
          "http://localhost:3000/canvas-api",
          {
            url: `/api/v1/courses/${courseId}?include[]=syllabus_body`
          },
          { withCredentials: true, headers: { "Content-Type": "application/json" } }
        );
        setData(res.data || null);
      } catch {
        setError("Failed to fetch Canvas syllabus");
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchSyllabus();
  }, [courseId]);

  useEffect(() => {
    const fetchAssignments = async () => {
      setAssignmentsLoading(true);
      setAssignmentsError(null);
      try {
        const res = await axios.post(
          "http://localhost:3000/canvas-api",
          {
            url: `/api/v1/courses/${courseId}/assignments`
          },
          { withCredentials: true, headers: { "Content-Type": "application/json" } }
        );
        setAssignments(res.data || []);
      } catch {
        setAssignmentsError("Failed to fetch assignments for this course.");
      } finally {
        setAssignmentsLoading(false);
      }
    };
    if (courseId) fetchAssignments();
  }, [courseId]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-full bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 animate-fade-in">
      <span className="animate-bounce-slow">
        <FaBookOpen className="text-7xl text-purple-500 drop-shadow-lg" />
      </span>
      <span className="mt-6 text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-blue-600 to-pink-500 animate-glow">Loading Syllabus...</span>
      <div className="mt-4 w-32 h-2 rounded-full bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 animate-pulse-glow" />
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-100 py-10 px-2 animate-fade-in">
      <div className="max-w-6xl w-[80vw] mx-auto Yhide py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 px-6 py-2 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 text-white rounded-full font-semibold shadow hover:scale-105 transition-transform duration-300"
        >
          <FaArrowLeft /> Back to Canvas Courses
        </button>
        <div className="bg-white/90 rounded-3xl shadow-lg p-10 border border-purple-100 animate-fade-in py-5 Yhide">
          <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-6 drop-shadow-lg flex items-center justify-center gap-4">
            <FaBookOpen className="text-4xl text-purple-500 animate-pop" /> {data?.name || "Course Syllabus"}
          </h1>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm shadow">Course Code: {data?.course_code}</span>
            {data?.start_at && <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm shadow">Start: {new Date(data.start_at).toLocaleDateString()}</span>}
            {data?.end_at && <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full font-semibold text-sm shadow">End: {new Date(data.end_at).toLocaleDateString()}</span>}
            {data?.workflow_state && <span className="px-4 py-2 bg-purple-200 text-purple-800 rounded-full font-semibold text-sm shadow capitalize">{data.workflow_state}</span>}
          </div>
          {data?.calendar?.ics && (
            <a
              href={data.calendar.ics}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mb-8 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg font-semibold shadow hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-colors duration-200"
            >
              View Calendar
            </a>
          )}
          <div
            className="prose prose-lg max-w-none text-gray-900 bg-white rounded-2xl p-10 shadow-xl border border-purple-100 animate-fade-in syllabus-html mb-12"
            style={{ minHeight: 200, lineHeight: 1.8, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: data?.syllabus_body || '<div class="text-gray-400 italic">No syllabus available.</div>' }}
          />
          {/* Divider to separate syllabus and assignments */}
          <hr className="my-10 border-t-2 border-purple-200" />
          {/* Assignments Section */}
          <div className="mt-14">
            <h2 className="text-3xl font-extrabold text-purple-700 mb-6 flex items-center gap-3"><span>📚</span>Assignments</h2>
            {assignmentsLoading && <div className="text-purple-500 font-semibold">Loading assignments...</div>}
            {assignmentsError && <div className="text-red-500 font-semibold">{assignmentsError}</div>}
            {!assignmentsLoading && !assignmentsError && assignments.length === 0 && (
              <div className="text-gray-400 italic">No assignments found for this course.</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {assignments.map((a, idx) => {
                // Extract file links from description
                let files: { href: string; title: string; filename: string }[] = [];
                let cleanedDescription = a.description || "";
                if (a.description) {
                  const result = extractFileLinks(a.description);
                  cleanedDescription = result.cleanedHtml;
                  files = result.files;
                }
                return (
                  <div key={a.id || idx} className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl shadow p-6 border border-purple-100 animate-fade-in">
                    <h3 className="text-xl font-bold text-purple-800 mb-2">{a.name || a.title}</h3>
                    {a.due_at && <div className="text-sm text-pink-600 mb-2">Due: {new Date(a.due_at).toLocaleString()}</div>}
                    {/* Description */}
                    {cleanedDescription && (
                      <div className="text-gray-700 mb-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: cleanedDescription }} />
                    )}
                    {/* File links */}
                    {files.length > 0 && (
                      <div className="mt-4">
                        <div className="font-semibold text-purple-700 flex items-center gap-2 mb-2 text-base"><FaFileAlt className="inline-block text-purple-500" /> Attached Files</div>
                        <ul className="space-y-2">
                          {files.map((file, i) => {
                            // Pick icon by extension
                            const ext = file.filename.split('.').pop()?.toLowerCase();
                            let icon = <FaFileAlt className="text-lg text-purple-400" />;
                            if (ext === "pdf") icon = <FaFilePdf className="text-lg text-red-500" />;
                            return (
                              <li key={i} className="flex items-center gap-3 bg-white/80 rounded-lg px-4 py-2 border border-purple-100 shadow-sm">
                                {icon}
                                <span className="truncate font-medium text-gray-800" title={file.filename}>{file.filename}</span>
                                <a href={file.href} target="_blank" rel="noopener noreferrer" className="ml-auto px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-400 text-white rounded font-semibold flex items-center gap-1 hover:scale-105 transition-transform" title="View or Download">
                                  <FaDownload className="inline-block" />
                                  <span className="hidden sm:inline">Download</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {/* Show Canvas Submissions Button */}
                    <ShowCanvasSubmissionsButton courseId={courseId || ''} assignmentId={a.id} />
                  </div>
                );
              })}
            </div>
          </div>
          <style>{`
            .syllabus-html h1, .syllabus-html h2, .syllabus-html h3, .syllabus-html h4 {
              color: #7c3aed;
              font-weight: 800;
              margin-top: 2rem;
              margin-bottom: 1rem;
              letter-spacing: -0.01em;
            }
            .syllabus-html ul, .syllabus-html ol {
              padding-left: 2rem;
              margin-bottom: 1.5rem;
            }
            .syllabus-html li {
              margin-bottom: 0.5rem;
              font-size: 1.08em;
            }
            .syllabus-html table {
              width: 100%;
              border-collapse: collapse;
              margin: 2rem 0;
              background: #fff;
              box-shadow: 0 2px 8px 0 #ede9fe;
              border-radius: 0.5rem;
              overflow: hidden;
            }
            .syllabus-html th, .syllabus-html td {
              border: 1px solid #e9d5ff;
              padding: 0.75rem 1.25rem;
              text-align: center;
              font-size: 1.05em;
            }
            .syllabus-html th {
              background: #ede9fe;
              color: #7c3aed;
              font-weight: 700;
            }
            .syllabus-html tr:nth-child(even) td {
              background: #faf5ff;
            }
            .syllabus-html hr {
              border: none;
              border-top: 2px solid #a5b4fc;
              margin: 2rem 0;
            }
            .syllabus-html p {
              margin-bottom: 1.2rem;
              font-size: 1.08em;
            }
            .syllabus-html em {
              color: #a21caf;
              font-style: italic;
            }
            .syllabus-html strong {
              color: #1e293b;
              font-weight: 700;
            }
            .syllabus-html a {
              color: #6366f1;
              text-decoration: underline;
              transition: color 0.2s;
            }
            .syllabus-html a:hover {
              color: #a21caf;
            }
          `}</style>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeInUp 0.7s both; }
        @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 40px, 0); } to { opacity: 1; transform: none; } }
        .animate-pop { animation: pop 0.7s cubic-bezier(0.23, 1, 0.32, 1) both; }
        @keyframes pop { 0% { opacity: 0; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default CanvasSyllabus;