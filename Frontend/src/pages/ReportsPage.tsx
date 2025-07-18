import { useEffect, useState } from "react";
import { FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaRegClock, FaTrashAlt } from "react-icons/fa";

// Add type for full plagiarism report
interface PlagiarismSource {
  score: number;
  canAccess: boolean;
  totalNumberOfWords: number;
  plagiarismWords: number;
  identicalWordCounts: number;
  similarWordCounts: number;
  url: string;
  author: string;
  description: string;
  title: string;
  publishedDate: number | string;
  source: string;
  citation: boolean;
  plagiarismFound: Array<{ startIndex: number; endIndex: number; sequence: string }>;
  is_excluded: boolean;
  similarWords: string[];
}
interface FullPlagiarismReport {
  status: number;
  scanInformation: {
    service: string;
    scanTime: string;
    inputType: string;
  };
  result: {
    score: number;
    sourceCounts: number;
    textWordCounts: number;
    totalPlagiarismWords: number;
    identicalWordCounts: number;
    similarWordCounts: number;
  };
  sources: PlagiarismSource[];
  similarWords: string[];
  indexes: Array<{ startIndex: number; endIndex: number }>;
  citations: unknown[];
  attackDetected: {
    zero_width_space: boolean;
    homoglyph_attack: boolean;
  };
  text: string;
  credits_used: number;
  credits_remaining: number;
}

interface Report {
  id: string;
  fileName: string;
  status: string;
  similarity: number;
  checkedAt: string;
  link: string;
  fullReport?: FullPlagiarismReport; // Use precise type
}

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [modalReport, setModalReport] = useState<Report | null>(null);

  // Delete handler
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      const updatedReports = reports.filter(r => r.id !== id);
      setReports(updatedReports);
      localStorage.setItem("plagiarismReports", JSON.stringify(updatedReports));
    }
  };

  useEffect(() => {
    const getReports = () => {
      const localReports: Report[] = JSON.parse(localStorage.getItem("plagiarismReports") || "[]");
      setReports(localReports);
    };
    getReports();
    window.addEventListener("plagiarismReportAdded", getReports);
    return () => window.removeEventListener("plagiarismReportAdded", getReports);
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col items-center py-12 px-2">
      <div className="w-full max-w-5xl Yhide">
        <div className="flex items-center gap-4 mb-10 animate-fade-in">
          <FaFileAlt className="text-6xl text-blue-700 drop-shadow-lg" />
          <div>
            <h1 className="text-5xl font-extrabold text-blue-800 tracking-tight drop-shadow-xl py-2 -mb-4">Plagiarism Report Sheet</h1>
            <p className="text-lg text-blue-500 font-medium mt-2">All your plagiarism check results, at a glance</p>
          </div>
        </div>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <FaFileAlt className="text-7xl text-blue-200 mb-6 animate-bounce" />
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Oops! No Reports Yet</h2>
            <p className="text-lg text-blue-700 mb-4 text-center max-w-md">It seems like you haven't tried our plagiarism checker yet.<br />Run a plagiarism check on a document to see your reports here!</p>
            <div className="mt-4">
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full font-semibold shadow-lg animate-pulse">No reports found</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow-2xl bg-white/90 border border-blue-200 animate-fade-in">
            <table className="min-w-full divide-y divide-blue-100 py-4 Yhide">
              <thead className="bg-gradient-to-r from-blue-100 to-purple-100">
                <tr>
                  <th className="px-6 py-4 text-left text-lg font-bold text-blue-700 tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-blue-700 tracking-wider">File Name</th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-blue-700 tracking-wider">Checked At</th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-blue-700 tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-blue-700 tracking-wider">Similarity</th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-blue-700 tracking-wider">Report</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-50">
                {reports.map((report, idx) => (
                  <tr
                    key={report.id}
                    className="group hover:bg-blue-50 transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <td className="px-6 py-4 text-lg font-semibold text-blue-600">{idx + 1}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <FaFileAlt className="text-blue-400 text-xl" />
                      <span className="font-medium text-gray-800">{report.fileName}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                      <FaRegClock className="text-blue-300" />
                      {report.checkedAt}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-base font-bold shadow ${report.status === "Passed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 animate-pulse"}`}>
                        {report.status === "Passed" ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="text-red-500" />
                        )}
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-lg ${report.similarity > 30 ? "text-red-600" : "text-green-600"}`}>{report.similarity}%</span>
                    </td>
                    <td className="px-6 py-4 flex gap-2 items-center">
                      {report.fullReport ? (
                        <button
                          className="group relative flex items-center justify-center p-2 rounded-full cursor-pointer bg-blue-100 hover:bg-blue-200 transition-colors duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                          onClick={() => setModalReport(report)}
                          aria-label="View Report"
                          title="View Report"
                        >
                          <svg className="w-5 h-5 text-blue-700 group-hover:text-blue-900 transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                      <button
                        className="group cursor-pointer relative flex items-center justify-center p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-200 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                        title="Delete Report"
                        aria-label="Delete Report"
                        onClick={() => handleDelete(report.id)}
                      >
                        <FaTrashAlt className="w-5 h-5 text-red-600 group-hover:text-red-800 transition-colors duration-200" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal for full report */}
      {modalReport && (
        <>
          {/* Blur the background instead of black overlay, and close modal on outside click */}
          <div
            className="fixed inset-0 z-40 backdrop-blur-[6px] transition-all duration-300"
            aria-hidden="true"
            onClick={() => setModalReport(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div
              className="relative w-full max-w-5xl mx-auto animate-modal-pop pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Glassmorphism background & accent bar */}
              <div className="absolute top-0 left-0 w-full h-2 rounded-t-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-400" />
              <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-0 overflow-hidden border border-blue-100">
                {/* Header */}
                <div className="flex items-center gap-6 px-10 pt-10 pb-6 border-b border-blue-100">
                  <div className="flex-shrink-0">
                    {modalReport.status === "Passed" ? (
                      <FaCheckCircle className="text-green-500 text-5xl drop-shadow" />
                    ) : (
                      <FaExclamationTriangle className="text-red-500 text-5xl drop-shadow animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 mb-2 flex items-center gap-2 break-words py-2 Yhide">
                      {modalReport.fileName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-base text-blue-700 font-medium">
                      <span className="flex items-center gap-1"><FaRegClock className="text-blue-400" /> {modalReport.checkedAt}</span>
                      <span className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-lg font-bold shadow ${modalReport.status === "Passed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 animate-pulse"}`}>{modalReport.status}</span>
                    </div>
                  </div>
                  {/* Circular similarity score */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="relative w-20 h-20">
                      <svg className="absolute top-0 left-0" width="80" height="80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#e0e7ff" strokeWidth="10" />
                        <circle
                          cx="40" cy="40" r="34" fill="none"
                          stroke={modalReport.similarity > 30 ? '#ef4444' : '#22c55e'}
                          strokeWidth="5"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - modalReport.similarity / 100)}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.7s' }}
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${modalReport.similarity > 30 ? 'text-red-600' : 'text-green-600'}`}>{modalReport.similarity}%</span>
                    </div>
                    <span className="text-xs text-blue-500 mt-2">Similarity</span>
                  </div>
                </div>
                {/* Body */}
                <div className="px-10 py-8 space-y-8 max-h-[70vh] overflow-y-auto">
                  {/* Scan Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center shadow">
                    <div className="flex-1">
                      <div className="font-semibold text-blue-700 mb-2">Scan Service: <span className="font-normal text-gray-700">{modalReport.fullReport?.scanInformation?.service}</span></div>
                      <div className="font-semibold text-blue-700 mb-2">Scan Time: <span className="font-normal text-gray-700">{modalReport.fullReport?.scanInformation?.scanTime}</span></div>
                      <div className="font-semibold text-blue-700">Input Type: <span className="font-normal text-gray-700">{modalReport.fullReport?.scanInformation?.inputType}</span></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-blue-400">Words</span>
                      <span className="text-xl font-bold text-blue-700">{modalReport.fullReport?.result?.textWordCounts}</span>
                    </div>
                  </div>
                  {/* Document Text */}
                  <div className="bg-white/80 rounded-xl p-6 shadow border border-blue-50">
                    <div className="font-semibold text-blue-700 mb-3 flex items-center gap-2"><FaFileAlt className="text-blue-400" /> Document Text</div>
                    <div className="text-gray-700 min-h-[30rem] whitespace-pre-wrap text-base max-h-52 overflow-y-auto border-l-4 border-blue-200 pl-4">{modalReport.fullReport?.text}</div>
                  </div>
                  {/* Sources Timeline */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-10 shadow border border-purple-100">
                    <div className="font-semibold text-purple-700 mb-4 flex items-center gap-2"><FaFileAlt className="text-purple-400" /> Sources Matched</div>
                    {modalReport.fullReport?.sources?.length ? (
                      <ol className="relative border-l-4 border-purple-300 ml-2 overflow-visible z-1">
                        {modalReport.fullReport.sources.map((src, i) => (
                          <li key={i} className="mb-8 ml-6 ">
                            <span className="absolute -left-4 z-10 flex items-center justify-center w-7 h-7 bg-white rounded-full ring-4 ring-purple-200 shadow">
                              <FaCheckCircle className="text-purple-500" />
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <a href={src.url} target="_blank" rel="noopener noreferrer" className="font-bold text-purple-800 hover:underline text-lg">{src.title}</a>
                              <span className="text-xs text-gray-400">{src.author}</span>
                              <span className="text-xs text-gray-400">Score: <span className="font-bold text-purple-700">{src.score}%</span></span>
                            </div>
                            <div className="text-gray-700 text-base mt-2 mb-1">{src.description}</div>
                            {src.plagiarismFound?.length > 0 && (
                              <div className="text-xs text-gray-500 italic">Matched: "{src.plagiarismFound[0].sequence.slice(0, 100)}{src.plagiarismFound[0].sequence.length > 100 ? '...' : ''}"</div>
                            )}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="text-gray-400 italic">No sources matched.</div>
                    )}
                  </div>
                  {/* Word Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-2">
                    <div className="bg-white/90 rounded-xl p-6 flex flex-col items-center shadow border border-blue-50">
                      <span className="text-xs text-blue-400">Plagiarism Words</span>
                      <span className="text-xl font-bold text-blue-700">{modalReport.fullReport?.result?.totalPlagiarismWords}</span>
                    </div>
                    <div className="bg-white/90 rounded-xl p-6 flex flex-col items-center shadow border border-blue-50">
                      <span className="text-xs text-blue-400">Identical Words</span>
                      <span className="text-xl font-bold text-blue-700">{modalReport.fullReport?.result?.identicalWordCounts}</span>
                    </div>
                    <div className="bg-white/90 rounded-xl p-6 flex flex-col items-center shadow border border-blue-50">
                      <span className="text-xs text-blue-400">Similar Words</span>
                      <span className="text-xl font-bold text-blue-700">{modalReport.fullReport?.result?.similarWordCounts}</span>
                    </div>
                    <div className="bg-white/90 rounded-xl p-6 flex flex-col items-center shadow border border-blue-50">
                      <span className="text-xs text-blue-400">Sources Found</span>
                      <span className="text-xl font-bold text-blue-700">{modalReport.fullReport?.result?.sourceCounts}</span>
                    </div>
                  </div>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between px-10 py-6 border-t border-blue-100 bg-white/70 rounded-b-2xl">
                  <span className="text-xs text-blue-400">Checked by <span className="font-bold text-blue-700">HonestIQ</span></span>
                  <button
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200"
                    onClick={() => setModalReport(null)}
                    aria-label="Close"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
            <style>{`
              .animate-modal-pop {
                animation: modalPop 0.5s cubic-bezier(0.23, 1, 0.32, 1) both;
              }
              @keyframes modalPop {
                0% { opacity: 0; transform: scale(0.85) translateY(40px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>
          </div>
        </>
      )}
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

export default ReportsPage;
