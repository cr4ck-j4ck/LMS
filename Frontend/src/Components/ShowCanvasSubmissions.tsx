import { useState } from "react";
import axios from "axios";
import PlagiarismButton from "./PlagiarismButton";

interface CanvasSubmissionFile {
  id: number;
  display_name: string;
  url: string;
  content_type: string;
  size: number;
}

interface CanvasSubmission {
  id: number;
  user_id: number;
  submitted_at?: string;
  workflow_state?: string;
  attachments?: CanvasSubmissionFile[];
  body?: string | null;
  preview_url?: string;
}

// Helper to extract file links from HTML and return { cleanedHtml, files: [{ href, title, filename }] }
function extractFileLinks(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const fileLinks: { href: string; title: string; filename: string }[] = [];
  doc.querySelectorAll("a.instructure_file_link").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const title = a.getAttribute("title") || a.textContent || "File";
    let filename = title;
    if (a.textContent && a.textContent.trim()) filename = a.textContent.trim();
    fileLinks.push({ href, title, filename });
    a.remove();
  });
  return { cleanedHtml: doc.body.innerHTML, files: fileLinks };
}

// Helper to convert Canvas file URLs to direct download links
function getCanvasDownloadUrl(url: string): string {
  // Match: https://canvas.instructure.com/users/{user_id}/files/{file_id}?...verifier=...
  const match = url.match(/canvas\.instructure\.com\/users\/\d+\/files\/(\d+)[^?]*\?[^#]*verifier=([\w-]+)/);
  if (match) {
    const fileId = match[1];
    const verifier = match[2];
    return `https://canvas.instructure.com/files/${fileId}/download?verifier=${verifier}`;
  }
  return url;
}

const ShowCanvasSubmissionsButton: React.FC<{ courseId: string | number; assignmentId: string | number }> = ({ courseId, assignmentId }) => {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<CanvasSubmission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleClick = async () => {
    if (!fetched) {
      setLoading(true);
      setError(null);
      setSubmissions(null);
      try {
        const res = await axios.post("http://localhost:3000/canvas-api", {
          url: `/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`
        }, { withCredentials: true });
        setSubmissions(res.data || []);
        setFetched(true);
        setOpen(true);
      } catch {
        setError("Failed to fetch submissions.");
      } finally {
        setLoading(false);
      }
    } else {
      setOpen((prev) => !prev);
    }
  };

  return (
    <div className="mt-4 py-5 Yhide">
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 shadow hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-all duration-300 relative ${loading ? 'cursor-wait' : ''}`}
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
          {loading
            ? 'Fetching...'
            : !fetched
              ? 'Show Submissions'
              : open
                ? 'Hide Submissions'
                : 'Show Submissions'}
        </span>
        {fetched && (
          <span className="ml-2">
            {open ? (
              <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            ) : (
              <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            )}
          </span>
        )}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {open && submissions && (
        <div className="mt-6 space-y-6 animate-fade-in">
          {(() => {
            const filtered = submissions.filter(sub => {
              const hasBody = !!sub.body && sub.body.trim() !== "";
              const hasAttachments = sub.attachments && sub.attachments.length > 0;
              let hasFilesInBody = false;
              if (sub.body) {
                const result = extractFileLinks(sub.body);
                hasFilesInBody = result.files.length > 0;
              }
              if (sub.workflow_state === 'unsubmitted' && !hasBody && !hasAttachments && !hasFilesInBody) return false;
              return hasBody || hasAttachments || hasFilesInBody;
            });
            if (filtered.length === 0) return <div className="text-gray-500 italic">No submissions found.</div>;
            return filtered.map((sub) => {
              let files: { href: string; title: string; filename: string }[] = [];
              let cleanedBody = sub.body || "";
              if (sub.body) {
                const result = extractFileLinks(sub.body);
                cleanedBody = result.cleanedHtml;
                files = result.files;
              }
              return (
                <div key={sub.id} className="bg-white border border-purple-200 rounded-2xl p-5 flex flex-col gap-2 shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-purple-700">Submission by:</span>
                    <span className="text-sm text-gray-700">User {sub.user_id}</span>
                    <span className="ml-auto text-xs text-gray-400">State: {sub.workflow_state || 'N/A'}</span>
                  </div>
                  {sub.submitted_at && <div className="text-xs text-gray-500">Submitted at: {new Date(sub.submitted_at).toLocaleString()}</div>}
                  {sub.preview_url && (
                    <a href={sub.preview_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline font-medium">Preview Submission</a>
                  )}
                  {/* Submission body */}
                  {sub.body ? (
                    <div className="prose prose-sm max-w-none text-gray-900 bg-purple-50 rounded-xl p-4 shadow-inner border border-purple-100 mt-2" dangerouslySetInnerHTML={{ __html: cleanedBody }} />
                  ) : null}
                  {/* File links from body */}
                  {files.length > 0 && (
                    <div className="mt-3">
                      <div className="font-semibold text-purple-700 flex items-center gap-2 mb-2 text-base">📎 Attached Files</div>
                      <ul className="space-y-2">
                        {files.map((file, i) => (
                          <li key={i} className="flex items-center gap-3 bg-white/80 rounded-lg px-4 py-2 border border-purple-100 shadow-sm">
                            <span className="text-lg text-purple-400"><i className="fas fa-file-alt" /></span>
                            <span className="truncate font-medium text-gray-800" title={file.filename}>{file.filename}</span>
                            <a href={getCanvasDownloadUrl(file.href)} target="_blank" rel="noopener noreferrer" className="ml-auto px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-400 text-white rounded font-semibold flex items-center gap-1 hover:scale-105 transition-transform" title="View or Download">
                              <span className="hidden sm:inline">Download</span>
                            </a>
                            {/* Plagiarism checker button for file in body */}
                            <PlagiarismButton fileId={getCanvasDownloadUrl(file.href)} title={file.filename} urlFor="canvas" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Attachments (API-level, not body) */}
                  {sub.attachments && sub.attachments.length > 0 && (
                    <div className="mt-3">
                      <div className="font-semibold text-purple-700 flex items-center gap-2 mb-2 text-base">📎 Attachments</div>
                      <div className="flex flex-wrap gap-4">
                        {sub.attachments.map((file, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded shadow hover:bg-purple-100 transition w-40 max-w-full">
                            <span className="text-3xl text-purple-400">
                              <i className="fas fa-file-alt" />
                            </span>
                            <span className="font-medium text-purple-800 text-center break-words w-full">{file.display_name}</span>
                            <a
                              href={getCanvasDownloadUrl(file.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-400 text-white rounded font-semibold flex items-center gap-1 hover:scale-105 transition-transform mt-1"
                              title="View or Download"
                            >
                              <span className="hidden sm:inline">Download</span>
                            </a>
                            {/* Plagiarism checker button for attachment */}
                            <PlagiarismButton fileId={getCanvasDownloadUrl(file.url)} title={file.display_name} urlFor="canvas" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
};

export default ShowCanvasSubmissionsButton;
