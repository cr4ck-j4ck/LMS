import { useState } from "react";
import axios from "axios";
interface PlagiarismButtonProps {
  fileId: string;
  title: string;
  urlFor: string;
  textContent?: string;
}

const PlagiarismButton: React.FC<PlagiarismButtonProps> = ({ fileId, title, urlFor, textContent }) => {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const handleClick = async () => {
    setSending(true);
    setSuccess(null);
    let url: string;
    try {
      if (textContent) {
        // Send text for plagiarism check
        const res = await axios.post("http://localhost:3000/plagiarismCheck", { text: textContent, urlFor }, { withCredentials: true });
        if (res.status === 200) {
          setSuccess(true);
          // Save report to localStorage
          const now = new Date();
          const checkedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const similarity = res.data?.result?.score ?? 0;
          const status = similarity > 30 ? "Flagged" : "Passed";
          const report = {
            id: `${fileId}-${now.getTime()}`,
            fileName: title,
            status,
            similarity,
            checkedAt,
            link: "#",
            fullReport: res.data
          };
          const prev = JSON.parse(localStorage.getItem("plagiarismReports") || "[]");
          localStorage.setItem("plagiarismReports", JSON.stringify([report, ...prev]));
          window.dispatchEvent(new Event("plagiarismReportAdded"));
        } else {
          setSuccess(false);
        }
      } else {
        // Build the URL as in Dashboard.tsx
        if (urlFor == "google") {
          url = title.split(".").pop() == "pdf"
            ? `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
            : `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
        } else {
          url = fileId;
        }
        const res = await axios.post("http://localhost:3000/plagiarismCheck", { url, urlFor }, { withCredentials: true });
        console.log(res.data);
        if (res.status === 200 && res.data != "error aa gayi bhai") {
          setSuccess(true);
          // Save report to localStorage
          const now = new Date();
          const checkedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const similarity = res.data?.result?.score ?? 0;
          const status = similarity > 30 ? "Flagged" : "Passed";
          const report = {
            id: `${fileId}-${now.getTime()}`,
            fileName: title,
            status,
            similarity,
            checkedAt,
            link: "#", 
            fullReport: res.data
          };
          const prev = JSON.parse(localStorage.getItem("plagiarismReports") || "[]");
          localStorage.setItem("plagiarismReports", JSON.stringify([report, ...prev]));
          window.dispatchEvent(new Event("plagiarismReportAdded"));
        } else {
          setSuccess(false);
        }
      }
    } catch {
      setSuccess(false);
    } finally {
      setSending(false);
    }
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
        {sending ? 'Sending...' : success === true ? 'Sent!' : success === false ? 'Failed!' : 'Send file to plagiarism checker'}
      </span>
    </button>
  );
};

export default PlagiarismButton;

