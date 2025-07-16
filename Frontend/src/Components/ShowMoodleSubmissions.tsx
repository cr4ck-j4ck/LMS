import React from "react";
import axios from "axios";

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

const ShowMoodleSubmissionsButton: React.FC<{ instance: number }> = ({ instance }) => {
  const [loading, setLoading] = React.useState(false);
  const [submissions, setSubmissions] = React.useState<MoodleSubmission[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);


  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setSubmissions(null);
    try {
      console.log("Yeh dekh Assignment ID", instance);
      const res = await axios.post("http://localhost:3000/moodle-api", {
        url: `https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=mod_assign_get_submissions&moodlewsrestformat=json&assignmentids[0]=${instance}`
      }, { withCredentials: true });

      // The response structure: { assignments: [{ id, submissions: [...] }] }
      console.log(res.data);
      const assignments: MoodleAssignment[] = res.data.assignments || [];
      const found = assignments.find((a) => String(a.assignmentid) === String(instance));
      console.log("assignments",assignments)
      console.log("found",found)
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
        <div className="mt-6 space-y-4 animate-fade-in">
          {submittedSubmissions.length === 0 && <div className="text-gray-500 italic">No submissions found.</div>}
          {submittedSubmissions.map((sub) => {
            // Find file plugin and files
            let files: MoodleFile[] = [];
            const filePlugin = sub.plugins?.find((p) => p.type === 'file');
            if (filePlugin && filePlugin.fileareas) {
              const submissionArea = filePlugin.fileareas.find((fa) => fa.area === 'submission_files');
              if (submissionArea && submissionArea.files) {
                files = submissionArea.files;
              }
            }
            return (
              <div key={sub.id} className="bg-white border border-purple-200 rounded-lg p-4 flex flex-col gap-2 shadow">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-purple-700">Submission by:</span>
                  <span className="text-sm text-gray-700">User {sub.userid}</span>
                  <span className="ml-auto text-xs text-gray-400">Status: {sub.status}</span>
                </div>
                {/* Show attached files if any */}
                {files.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-base font-semibold text-purple-600 mb-2 flex items-center gap-2">Files:</h4>
                    <div className="flex flex-wrap gap-4">
                      {files.map((file, i) => (
                        <a
                          key={i}
                          href={file.fileurl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded shadow hover:bg-purple-100 transition w-40 max-w-full"
                        >
                          {file.mimetype && file.mimetype.startsWith('image/') ? (
                            <img
                              src={file.fileurl}
                              alt={file.filename}
                              className="w-20 h-20 object-contain rounded border border-purple-200 bg-gray-50"
                            />
                          ) : (
                            <span className="text-3xl text-purple-400">
                              <i className="fas fa-file-alt" />
                            </span>
                          )}
                          <span className="font-medium text-purple-800 text-center break-words w-full">{file.filename}</span>
                        </a>
                      ))}
                    </div>
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
