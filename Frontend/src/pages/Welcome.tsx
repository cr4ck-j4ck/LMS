import React from "react";
import { FaChalkboardTeacher, FaBookOpen, FaLayerGroup, FaRocket, FaSmileBeam, FaMagic, FaUserGraduate } from "react-icons/fa";
import { Link } from "react-router-dom";
const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-30 blur-3xl animate-blob1 z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400 to-yellow-300 rounded-full opacity-30 blur-3xl animate-blob2 z-0" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-green-300 to-blue-300 rounded-full opacity-20 blur-2xl animate-blob3 z-0" style={{transform: 'translate(-50%, -50%)'}} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-16">
        <div className="flex items-center gap-4 mb-6 animate-fade-in Yhide py-5 overflow-hidden">
          <FaRocket className="text-6xl text-pink-500 animate-bounce" />
          <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 drop-shadow-xl animate-fade-in overflow-hidden">Welcome to HonestIQ!</h1>
          <FaSmileBeam className="text-6xl text-yellow-400 animate-wiggle" />
        </div>
        <p className="text-2xl text-gray-700 font-medium mb-10 animate-fade-in" style={{animationDelay: '0.2s'}}>Your one-stop platform for <span className="text-blue-600 font-bold">learning</span>, <span className="text-purple-600 font-bold">collaboration</span>, and <span className="text-pink-600 font-bold">success</span>.</p>
        <div className="flex flex-wrap justify-center gap-8 mb-12 animate-fade-in Yhide" style={{animationDelay: '0.4s'}}>
          <div className="flex flex-col items-center bg-white/80 rounded-2xl shadow-lg p-8 min-w-[220px] hover:scale-105 transition-transform duration-300">
            <FaChalkboardTeacher className="text-5xl text-blue-600 mb-3 animate-pop" />
            <h2 className="text-xl font-bold text-blue-800 mb-1">Google Classroom</h2>
            <p className="text-gray-600 text-base">Assignments, announcements, and more.</p>
          </div>
          <div className="flex flex-col items-center bg-white/80 rounded-2xl shadow-lg p-8 min-w-[220px] hover:scale-105 transition-transform duration-300">
            <FaBookOpen className="text-5xl text-green-600 mb-3 animate-pop" />
            <h2 className="text-xl font-bold text-green-800 mb-1">Moodle</h2>
            <p className="text-gray-600 text-base">Course content, quizzes, and resources.</p>
          </div>
          <div className="flex flex-col items-center bg-white/80 rounded-2xl shadow-lg p-8 min-w-[220px] hover:scale-105 transition-transform duration-300">
            <FaLayerGroup className="text-5xl text-purple-600 mb-3 animate-pop" />
            <h2 className="text-xl font-bold text-purple-800 mb-1">Canvas</h2>
            <p className="text-gray-600 text-base">Modern, flexible learning experiences.</p>
          </div>
        </div>
        
        <Link to="/showLMS" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-2xl font-bold rounded-full shadow-lg hover:scale-110 transition-transform duration-300 animate-fade-in" style={{animationDelay: '0.6s'}}>
          <FaMagic className="text-3xl animate-spin-slow" />
          Explore LMS
        </Link>
        <div className="mt-16 flex flex-col items-center gap-2 animate-fade-in" style={{animationDelay: '0.8s'}}>
          <FaUserGraduate className="text-4xl text-green-500 animate-bounce" />
          <span className="text-lg text-gray-500">Empowering students and teachers for a brighter future.</span>
        </div>
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
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
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
      `}</style>
    </div>
  );
};

export default Welcome;
