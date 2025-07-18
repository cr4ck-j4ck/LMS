import { useState } from "react";
import axios from "axios";
import PlagiarismButton from "./PlagiarismButton";

interface SubmissionAttachment {
  driveFile?: {
    alternateLink: string;
    id: string;
    thumbnailUrl?: string;
    title: string;
  };
}

interface StudentSubmission {
  alternateLink: string;
  assignmentSubmission?: {
    attachments?: SubmissionAttachment[];
  };
  state: string;
  id: string;
  userId: string;
}

const ShowSubmissionsButton: React.FC<{ courseId: string; courseWorkId: string }> = ({ courseId, courseWorkId }) => {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<StudentSubmission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  if(!courseId && courseWorkId ){
    console.log(`Please give the Appropriate Details Course id "${courseId}" and CourseWorkID is "${courseWorkId}"`);
    return (<h1 className="text-black">Wrong Info</h1>);
  }
  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setSubmissions(null);
    try {
      const res = await axios.post("http://localhost:3000/google-api", {
        url: `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`
      }, { withCredentials: true });
      setSubmissions(res.data.studentSubmissions || []);
    } catch {
      setError("Failed to fetch submissions.");
    } finally {
      setLoading(false);
    }
  };

  // Only keep submissions that have at least one attachment
  const submissionsWithAttachments = submissions?.filter(
    sub => sub.assignmentSubmission?.attachments && sub.assignmentSubmission.attachments.length > 0
  ) || [];

  return (
    <div className="mt-4">
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-green-500 to-blue-500 shadow hover:from-blue-500 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-300 relative ${loading ? 'cursor-wait' : ''}`}
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
          {submissionsWithAttachments.length === 0 && <div className="text-gray-500 italic">No submissions found.</div>}
          {submissionsWithAttachments.map((sub) => (
            <div key={sub.id} className="bg-white border border-green-200 rounded-lg p-4 flex flex-col gap-2 shadow">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-700">Submission by:</span>
                <span className="text-sm text-gray-700">{sub.userId}</span>
                <span className="ml-auto text-xs text-gray-400">State: {sub.state}</span>
              </div>
              <a href={sub.alternateLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">View Submission in Classroom</a>
              <div className="flex flex-wrap gap-4 mt-2">
                {sub.assignmentSubmission?.attachments?.map((att, i) =>
                  att.driveFile ? (
                    <div key={i} className="flex items-center gap-2">
                      <a
                        href={att.driveFile.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-blue-50 rounded shadow hover:bg-blue-100 transition"
                      >
                        {att.driveFile.thumbnailUrl && (
                          <img
                            src={att.driveFile.thumbnailUrl}
                            alt={att.driveFile.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <span className="font-medium text-blue-700">{att.driveFile.title}</span>
                      </a>
                      {/* Plagiarism checker button for submission attachment */}
                      {att.driveFile.id && <PlagiarismButton fileId={att.driveFile.id} title={att.driveFile.title} urlFor="google"/>} 
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowSubmissionsButton;
