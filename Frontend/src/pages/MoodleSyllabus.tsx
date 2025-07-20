import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBookOpen, FaArrowLeft, FaFileAlt, FaClipboardList, FaPaperclip } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ShowSubmissionsButton from "../Components/ShowMoodleSubmissions";

interface Section {
  id: number;
  name: string;
  summary: string;
  modules: Array<{ id: number; name: string; modname: string; url: string; intro?: string,instance: number }>;
}

interface Attachment {
  filename: string;
  fileurl: string;
  icon?: string; // Added for potential icon display
  mimetype?: string; // Added for image/file type detection
}

interface AssignmentType {
  id: number;
  cmid: number;
  introattachments?: Attachment[];
}

const MoodleSyllabus: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // State for assignment attachments
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>({});
  const [attachmentsLoading, setAttachmentsLoading] = useState<Record<string, boolean>>({});
  const [attachmentsError, setAttachmentsError] = useState<Record<string, string | null>>({});
  // State to control showing/hiding attachments for each assignment
  const [showAttachments, setShowAttachments] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/moodle-api`,
          {
            url: `https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=${courseId}&options[0][name]=includestealthmodules&options[0][value]=1`
          },
          { withCredentials: true, headers: { "Content-Type": "application/json" } }
        );
        setSections(res.data || []);
      } catch {
        setError("Failed to fetch syllabus for this course.");
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchSyllabus();
  }, [courseId]);

  // Fetch attachments for a given assignment
  const handleShowAttachments = async (assignId: number) => {
    setAttachmentsLoading(prev => ({ ...prev, [assignId]: true }));
    setAttachmentsError(prev => ({ ...prev, [assignId]: null }));
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/moodle-api`,
        {
          url: `https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=mod_assign_get_assignments&moodlewsrestformat=json&courseids[0]=${courseId}`
        },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      // Debug logs
      const assignments = res.data.courses
        ?.flatMap((course: { assignments: AssignmentType[] }) => course.assignments);
      const found = assignments?.find((assignment: AssignmentType) => assignment.cmid === assignId);
      setAttachments(prev => ({ ...prev, [assignId]: found?.introattachments || [] }));
    } catch {
      setAttachmentsError(prev => ({ ...prev, [assignId]: "Failed to fetch attachments." }));
    } finally {
      setAttachmentsLoading(prev => ({ ...prev, [assignId]: false }));
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-full bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 animate-fade-in">
      <span className="animate-bounce-slow">
        <FaBookOpen className="text-7xl text-green-500 drop-shadow-lg" />
      </span>
      <span className="mt-6 text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-700 via-blue-600 to-purple-500 animate-glow">Loading Syllabus...</span>
      <div className="mt-4 w-32 h-2 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-pulse-glow" />
      <style>{`
        .animate-bounce-slow { animation: bounce 2s infinite alternate; }
        @keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-24px); } }
        .animate-glow { animation: glow 1.5s ease-in-out infinite alternate; }
        @keyframes glow { 0% { text-shadow: 0 0 8px #a7f3d0, 0 0 16px #38bdf8; } 100% { text-shadow: 0 0 24px #a7f3d0, 0 0 32px #38bdf8; } }
        .animate-pulse-glow { animation: pulseGlow 1.2s infinite alternate; }
        @keyframes pulseGlow { 0% { opacity: 0.7; } 100% { opacity: 1; box-shadow: 0 0 24px #a7f3d0, 0 0 32px #38bdf8; } }
        .animate-fade-in { animation: fadeInUp 1s both; }
        @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 40px, 0); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
  if (error) return <div className="text-center text-red-600 font-semibold mt-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-100 py-10 px-2">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 px-6 py-2 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white rounded-full font-semibold shadow hover:scale-105 transition-transform duration-300"
        >
          <FaArrowLeft /> Back to Courses
        </button>
        <h1 className="overflow-y-hidden text-4xl font-extrabold text-center text-green-700 mb-10 drop-shadow-lg animate-fade-in flex items-center justify-center gap-4">
          <FaBookOpen className="text-4xl text-green-500 animate-pop" /> Syllabus
        </h1>
        <div className="space-y-8 py-10">
          {sections.map((section, idx) => {
            const assignments = section.modules?.filter(mod => mod.modname === "assign") || [];
            return (
              <div key={section.id || idx} className="bg-white/90 rounded-3xl shadow-lg p-8 border border-green-100 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <FaFileAlt className="text-2xl text-blue-500 animate-pop" />
                  <h2 className="text-2xl font-bold text-green-800">{section.name}</h2>
                </div>
                {section.summary && (
                  <div className="text-gray-600 text-base mb-3" dangerouslySetInnerHTML={{ __html: section.summary }} />
                )}
                {/* Assignments */}
                {assignments.length > 0 && (
                  <div className="mt-6 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FaClipboardList className="text-xl text-purple-500 animate-pop" />
                      <span className="text-xl font-bold text-purple-700">Assignments</span>
                    </div>
                    <div className="space-y-4 py-4 Yhide">
                      {assignments.map((mod) => {
                        // Debug log for attachments rendering
                        const handleAttachmentsClick = () => {
                          if (attachments[mod.id]) {
                            // Already fetched, just toggle dropdown
                            setShowAttachments(prev => ({
                              ...prev,
                              [mod.id]: !prev[mod.id]
                            }));
                          } else {
                            // Not fetched yet, fetch and open dropdown
                            handleShowAttachments(mod.id);
                            setShowAttachments(prev => ({
                              ...prev,
                              [mod.id]: true
                            }));
                          }
                        };
                        return (
                          <div key={mod.id} className="mb-8 animate-fade-in border border-purple-200 rounded-xl p-6 bg-white/50 shadow-lg">
                            <h3 className="text-lg font-bold text-purple-800 mb-2 flex items-center gap-2">
                              <FaFileAlt className="text-purple-400" /> {mod.name}
                            </h3>
                            {mod.intro && <p className="text-gray-700 mb-2 whitespace-pre-line">{mod.intro}</p>}
                            <div className="flex items-center gap-3 mt-2">
                              {mod.url && (
                                <a href={mod.url} target="_blank" rel="noopener noreferrer" className="px-4 py-1 bg-purple-600 text-white rounded-lg font-semibold shadow hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-colors duration-200">Open Assignment</a>
                              )}
                              <button
                                onClick={handleAttachmentsClick}
                                className="flex items-center gap-2 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200"
                                disabled={attachmentsLoading[mod.id]}
                              >
                                <FaPaperclip />
                                {attachmentsLoading[mod.id]
                                  ? "Loading..."
                                  : (showAttachments[mod.id] ? "Hide Attachments" : "Show Attachments")}
                                {showAttachments[mod.id]
                                  ? <FaChevronUp className="transition-transform duration-200" />
                                  : <FaChevronDown className="transition-transform duration-200" />}
                              </button>
                            </div>
                            {/* Show Submissions Button */}
                            <div className="mt-4 mb-2 border-t border-dashed border-purple-200 pt-4">
                              <ShowSubmissionsButton instance={mod.instance}/>
                            </div>
                            {attachmentsError[mod.id] && <div className="text-red-500 mt-2">{attachmentsError[mod.id]}</div>}
                            {/* Attachments display - improved UI */}
                            {showAttachments[mod.id] && attachments[Number(mod.id)] && attachments[Number(mod.id)].length > 0 && (
                              <div className="mt-8 border-t border-gray-200 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><FaPaperclip className="text-blue-400" /> Attachments</h4>
                                  <button
                                    onClick={() => setShowAttachments(prev => ({ ...prev, [mod.id]: false }))}
                                    className="ml-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-white rounded-full text-sm font-semibold transition"
                                  >
                                    Close
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-6">
                                  {attachments[Number(mod.id)].map((att, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow hover:bg-blue-50 transition w-48 max-w-full">
                                      <a
                                        href={att.fileurl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2"
                                      >
                                        {/* Show image preview if image, else show file icon */}
                                        {att.mimetype && att.mimetype.startsWith('image/') ? (
                                          <img
                                            src={att.fileurl}
                                            alt={att.filename}
                                            className="w-32 h-32 object-contain rounded border border-blue-200 bg-gray-50"
                                          />
                                        ) : (
                                          <FaFileAlt className="text-4xl text-blue-400" />
                                        )}
                                        <span className="font-medium text-blue-700 text-center break-words w-full">{att.filename}</span>
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Other modules */}
                {section.modules && section.modules.length > 0 && (
                  <div className="mt-2 space-y-2 p-5">
                    {section.modules.filter(mod => mod.modname !== "assign").map((mod) => (
                      <div key={mod.id} className="py-2 Yhide flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-xl shadow hover:scale-105 transition-transform duration-200">
                        <span className="text-lg font-semibold text-blue-700">{mod.modname}:</span>
                        <span className="font-medium text-gray-800">{mod.name}</span>
                        {mod.url && (
                          <a href={mod.url} target="_blank" rel="noopener noreferrer" className="ml-auto px-4 py-1 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-200">Open</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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

export default MoodleSyllabus;
