import { useState } from "react";
import axios from "axios";
import PlagiarismButton from "./PlagiarismButton";

interface MoodleFile {
  filename: string;
  filepath: string;
  filesize: number;
  fileurl: string;
  timemodified: number;
  mimetype: string;
  isexternalfile: boolean;
  icon: string;
}

interface MoodleFileArea {
  area: string;
  files: MoodleFile[];
}

interface MoodlePlugin {
  type: string;
  name: string;
  fileareas?: MoodleFileArea[];
}

interface MoodleSubmission {
  id: number;
  userid: number;
  status: string;
  timemodified: number;
  plugins?: MoodlePlugin[];
}

interface MoodleAssignment {
  id: number;
  assignmentid: number;
  submissions: MoodleSubmission[];
}

interface MoodleEditorField {
  name: string;
  description: string;
  text: string;
  format: number;
}

const ShowMoodleSubmissionsButton: React.FC<{ instance: number }> = ({ instance }) => {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<MoodleSubmission[] | null>(null);
  const [error, setError] = useState<string | null>(null);


  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setSubmissions(null);
    try {
      const res = await axios.post("http://localhost:3000/moodle-api", {
        url: `https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=mod_assign_get_submissions&moodlewsrestformat=json&assignmentids[0]=${instance}`
      }, { withCredentials: true });
      console.log(res.data);
      // The response structure: { assignments: [{ id, submissions: [...] }] }
      const assignments: MoodleAssignment[] = res.data.assignments || [];
      const found = assignments.find((a) => String(a.assignmentid) === String(instance));
      console.log(found);
      setSubmissions(found?.submissions || []);
    } catch {
      setError("Failed to fetch submissions.");
    } finally {
      setLoading(false);
    }
  };

  // Only show submissions with status 'submitted'
  const submittedSubmissions = submissions?.filter(sub => sub.status === 'submitted') || [];

  return (
    <div className="mt-4 py-3 Yhide">
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition-all duration-300 relative ${loading ? 'cursor-wait' : ''}`}
        disabled={loading}
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        ) : (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405M19 13V7a2 2 0 00-2-2h-4a2 2 0 00-2 2v6m0 4h6" />
          </svg>
        )}
        <span className="ml-2 text-base">
          {loading ? 'Fetching...' : 'Show Submissions'}
        </span>
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {submissions && (
        <div className="mt-8 space-y-8 animate-fade-in max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-purple-700 mb-8 text-center drop-shadow-lg tracking-tight">Moodle Assignment Submissions</h2>
          {submittedSubmissions.length === 0 && <div className="text-gray-500 italic">No submissions found.</div>}
          {submittedSubmissions.map((sub) => {
            // Find file plugin and files
            let files: MoodleFile[] = [];
            let onlineText: string | null = null;
            if (sub.plugins) {
              const filePlugin = sub.plugins.find((p) => p.type === 'file');
              if (filePlugin && filePlugin.fileareas) {
                const submissionArea = filePlugin.fileareas.find((fa) => fa.area === 'submission_files');
                if (submissionArea && submissionArea.files) {
                  files = submissionArea.files;
                }
              }
              const onlineTextPlugin = sub.plugins.find((p) => p.type === 'onlinetext');
              if (onlineTextPlugin && (onlineTextPlugin as { editorfields?: MoodleEditorField[] }).editorfields) {
                const editorField = ((onlineTextPlugin as { editorfields?: MoodleEditorField[] }).editorfields || []).find((f) => f.name === 'onlinetext');
                if (editorField && editorField.text) {
                  onlineText = editorField.text;
                }
              }
            }
            // Decide what to send to plagiarism checker: prefer file if present, else text
            let plagiarismButton = null;
            if (files.length > 0) {
              // If multiple files, send the first file (or you can combine them if needed)
              plagiarismButton = (
                <PlagiarismButton fileId={files[0].fileurl} title={files[0].filename} urlFor="moodle-file" />
              );
            } else if (onlineText) {
              plagiarismButton = (
                <PlagiarismButton fileId={String(sub.id) + "-onlinetext"} title={`OnlineText-User${sub.userid}`} urlFor="moodle-text" textContent={onlineText} />
              );
            }
            return (
              <div key={sub.id} className="bg-white/90 border border-purple-200 rounded-2xl p-8 flex flex-col gap-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  <span className="font-semibold text-purple-700 text-lg">Submission by:</span>
                  <span className="text-base text-gray-700">User {sub.userid}</span>
                  <span className="ml-auto text-xs text-gray-400">Status: {sub.status}</span>
                </div>
                {/* Show online text if any */}
                {onlineText && (
                  <div className="mt-2">
                    <h4 className="text-lg font-semibold text-purple-600 mb-2 flex items-center gap-2">Online Text:</h4>
                    <div className="prose prose-base max-w-none text-gray-900 bg-purple-50 rounded-xl p-5 shadow-inner border border-purple-100 mb-4" dangerouslySetInnerHTML={{ __html: onlineText }} />
                  </div>
                )}
                {/* Show attached files if any */}
                {files.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">Files:</h4>
                    <div className="flex flex-col gap-4">
                      {files.map((file, i) => (
                        <div key={i} className="flex flex-row items-center gap-6 bg-purple-50 rounded-xl p-5 border border-purple-100 shadow hover:bg-purple-100 transition-all w-full max-w-3xl mx-auto">
                          {file.mimetype && file.mimetype.startsWith('image/') ? (
                            <img
                              src={file.fileurl}
                              alt={file.filename}
                              className="w-20 h-20 object-contain rounded border border-purple-200 bg-gray-50"
                            />
                          ) : (
                            <span className="text-4xl text-purple-400">
                              <i className="fas fa-file-alt" />
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-purple-800 text-lg break-words w-full block">{file.filename}</span>
                            <a
                              href={file.fileurl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-400 text-white rounded font-semibold hover:scale-105 transition-transform shadow"
                              title="View or Download"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Single plagiarism checker button for the whole submission */}
                {plagiarismButton && (
                  <div className="flex justify-end mt-4">
                    {plagiarismButton}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShowMoodleSubmissionsButton;
