import { Link, useLocation } from "react-router-dom";
import { FaUserGraduate } from "react-icons/fa";

const Navbar: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="navbar z-50 w-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between overflow-y-hidden">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 group overflow-y-hidden">
          <span className="rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-2 shadow-lg transition-transform group-hover:scale-110">
            <FaUserGraduate className="text-3xl text-white drop-shadow" />
          </span>
          <span className="text-2xl overflow-y-hidden font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 drop-shadow animate-fade-in">HonestIQ</span>
        </Link>
        {/* Nav Buttons */}
        <div className="flex gap-4 Yhide">
          <Link
            to="/ReportsPage"
            className={`px-6 py-2 rounded-full font-semibold text-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:scale-105 hover:from-blue-600 hover:to-pink-600 ${location.pathname === "/ReportsPage" ? "ring-2 ring-blue-400" : ""}`}
          >
            Reports
          </Link>
          <Link
            to="/rubricMainPage"
            className={`px-6 py-2 rounded-full font-semibold text-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white hover:scale-105 hover:from-green-600 hover:to-purple-600 ${location.pathname === "/rubricMainPage" ? "ring-2 ring-green-400" : ""}`}
          >
            Rubric Generator
          </Link>
          <Link
            to="/login"
            className={`px-6 py-2 rounded-full font-semibold text-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:scale-105 hover:from-pink-600 hover:to-blue-600 ${location.pathname === "/login" ? "ring-2 ring-purple-400" : ""}`}
          >
            Login
          </Link>
        </div>
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
    </nav>
  );
};

export default Navbar;
