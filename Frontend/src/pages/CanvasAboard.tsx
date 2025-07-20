import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLayerGroup, FaRocket, FaSmileBeam, FaKey, FaUniversity } from "react-icons/fa";

const CanvasAboard: React.FC = () => {
  const [authToken, setAuthToken] = useState("");
  const [institute, setInstitute] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown === 0) {
      navigate("/canvas", { replace: true });
    }
    if (countdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/canvas-login`,{
      institute,authToken
    },{
      withCredentials:true
    });
    setSubmitted(true);
    setTimeout(() => {
      setCountdown(3);
    }, 800); // show success for a moment before countdown
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 relative overflow-hidden py-16 px-6">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-30 blur-3xl animate-blob1 z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400 to-blue-300 rounded-full opacity-30 blur-3xl animate-blob2 z-0" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-20 blur-2xl animate-blob3 z-0" style={{transform: 'translate(-50%, -50%)'}} />

      <div className="relative z-10 flex flex-col items-center text-center px-10 py-20 w-full">
        <div className="flex items-center gap-6 mb-12 animate-fade-in overflow-visible pt-10" style={{minHeight: '90px'}}>
          <FaRocket className="text-5xl text-pink-500 animate-bounce relative" style={{top: 0}} />
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-blue-600 to-pink-500 drop-shadow-xl animate-fade-in overflow-y-hidden">Canvas Onboard</h1>
          <FaSmileBeam className="text-5xl text-yellow-400 animate-wiggle" />
        </div>
        <p className="text-xl sm:text-2xl text-gray-700 font-medium mb-14 animate-fade-in" style={{animationDelay: '0.2s'}}>Connect your <span className="text-purple-600 font-bold">Canvas</span> by providing your <span className="text-blue-600 font-bold">Auth Token</span> and <span className="text-pink-600 font-bold">Institute Name</span>.</p>
        {!countdown && (
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl p-14 flex flex-col gap-10 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="flex flex-col gap-4 text-left">
              <label className="font-bold text-lg text-blue-700 flex items-center gap-2" htmlFor="institute">
                <FaUniversity className="text-2xl text-purple-500 animate-pop" />
                Institute Name
              </label>
              <input
                id="institute"
                type="text"
                required
                value={institute}
                onChange={e => setInstitute(e.target.value)}
                className="px-7 py-4 rounded-xl border-2 border-purple-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg font-medium transition-all duration-200 bg-white shadow-sm text-gray-900 placeholder-gray-500"
                placeholder="Enter your Institute Name (e.g. HonestIQ University)"
              />
            </div>
            <div className="flex flex-col gap-4 text-left">
              <label className="font-bold text-lg text-purple-700 flex items-center gap-2" htmlFor="authToken">
                <FaKey className="text-2xl text-blue-500 animate-pop" />
                Auth Token
              </label>
              <input
                id="authToken"
                type="text"
                required
                value={authToken}
                onChange={e => setAuthToken(e.target.value)}
                className="px-7 py-4 rounded-xl border-2 border-blue-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-lg font-medium transition-all duration-200 bg-white shadow-sm text-gray-900 placeholder-gray-500"
                placeholder="Enter your Canvas Auth Token"
              />
            </div>
            <button type="submit" className="mt-8 px-10 py-4 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-300">Connect</button>
            {submitted && !countdown && (
              <div className="flex items-center gap-2 mt-2 text-purple-600 font-semibold animate-fade-in">
                <FaLayerGroup className="text-xl animate-bounce" /> Successfully submitted!
              </div>
            )}
          </form>
        )}
        {countdown !== null && (
          <div className="flex flex-col items-center justify-center mt-10 animate-fade-in">
            <FaRocket className="text-7xl text-purple-500 animate-launch" />
            <div className="mt-8 text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-blue-600 to-pink-500 animate-glow">
              Navigating to Canvas in <span className="text-5xl">{countdown}</span>...
            </div>
          </div>
        )}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeInUp 1s both;
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
        .animate-bounce {
          animation: bounce 1.5s infinite alternate;
        }
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-18px); }
        }
        .animate-wiggle {
          animation: wiggle 1.2s infinite alternate;
        }
        @keyframes wiggle {
          0% { transform: rotate(-10deg); }
          100% { transform: rotate(10deg); }
        }
        .animate-pop {
          animation: pop 0.7s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        @keyframes pop {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-blob1 {
          animation: blobMove1 12s ease-in-out infinite alternate;
        }
        .animate-blob2 {
          animation: blobMove2 14s ease-in-out infinite alternate;
        }
        .animate-blob3 {
          animation: blobMove3 16s ease-in-out infinite alternate;
        }
        @keyframes blobMove1 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(60px, 40px) scale(1.1); }
        }
        @keyframes blobMove2 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(-80px, 60px) scale(1.15); }
        }
        @keyframes blobMove3 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(30px, -50px) scale(1.05); }
        }
        .animate-launch {
          animation: launch 1s infinite alternate;
        }
        @keyframes launch {
          0% { transform: translateY(0) scale(1); filter: brightness(1); }
          100% { transform: translateY(-30px) scale(1.15); filter: brightness(1.3); }
        }
        .animate-glow {
          animation: glow 1.5s ease-in-out infinite alternate;
        }
        @keyframes glow {
          0% { text-shadow: 0 0 8px #c4b5fd, 0 0 16px #f472b6; }
          100% { text-shadow: 0 0 24px #c4b5fd, 0 0 32px #f472b6; }
        }
      `}</style>
    </div>
  );
};

export default CanvasAboard;
