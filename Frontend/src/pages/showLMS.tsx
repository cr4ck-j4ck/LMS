import React from "react";
import { FaChalkboardTeacher, FaBookOpen, FaLayerGroup } from "react-icons/fa";

const lmsList = [
  {
    name: "Classroom",
    description: "Google Classroom for assignments, announcements, and more.",
    icon: <FaChalkboardTeacher className="text-4xl text-blue-600" />,
    bg: "from-blue-100 to-blue-300",
    shadow: "shadow-blue-200",
    link: "/showClassroom"
  },
  {
    name: "Moodle",
    description: "Moodle LMS for course content, quizzes, and resources.",
    icon: <FaBookOpen className="text-4xl text-green-600" />,
    bg: "from-green-100 to-green-300",
    shadow: "shadow-green-200",
    link: "/moodle"
  },
  {
    name: "Canvas",
    description: "Canvas LMS for modern, flexible learning experiences.",
    icon: <FaLayerGroup className="text-4xl text-purple-600" />,
    bg: "from-purple-100 to-purple-300",
    shadow: "shadow-purple-200",
    link: "/canvas"
  }
];

const MainPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-start py-12 px-2">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 mb-12 drop-shadow-lg animate-fade-in Yhide">All LMS</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 w-full max-w-5xl overflow-hidden p-5">
        {lmsList.map((lms, idx) => (
          <a
            href={lms.link}
            key={lms.name}
            className={`group block rounded-3xl bg-gradient-to-br ${lms.bg} ${lms.shadow} p-8 transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in Yhide`}
            style={{ animationDelay: `${idx * 120}ms` }}
          >
            <div className="flex flex-col items-center gap-4 Yhide">
              <div className="rounded-full bg-white shadow-lg p-5 mb-2 group-hover:scale-110 transition-transform duration-300">
                {lms.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-200">{lms.name}</h2>
              <p className="text-gray-600 text-center text-base font-medium mb-2 min-h-[48px]">{lms.description}</p>
              <span className="inline-block mt-4 px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold shadow hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-200 group-hover:scale-105">Explore</span>
            </div>
          </a>
        ))}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeInUp 0.8s both;
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

export default MainPage;
