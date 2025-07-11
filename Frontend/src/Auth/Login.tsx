import React, { useState } from "react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google login logic
    console.log("Login with Google clicked");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Welcome Back
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm text-gray-500">
            <span className="bg-white px-2">or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full google flex items-center justify-center gap-3 border border-gray-500 rounded-md py-2 hover:bg-gray-100 transition duration-200"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272v95.3h146.9c-6.3 33.6-25.1 62-53.7 81v67.2h86.7c50.9-46.9 80.6-116 80.6-193.1z"
            />
            <path
              fill="#34A853"
              d="M272 544.3c72.6 0 133.6-24 178-65.4l-86.7-67.2c-24 16-55 25.4-91.3 25.4-70.3 0-130-47.5-151.3-111.5H32.2v69.8C76.7 486.2 167.4 544.3 272 544.3z"
            />
            <path
              fill="#FBBC05"
              d="M120.7 322.6c-5.3-15.7-8.3-32.4-8.3-49.6s3-33.9 8.3-49.6V153H32.2c-17.2 34.1-27 72.5-27 113.4s9.8 79.3 27 113.4l88.5-57.2z"
            />
            <path
              fill="#EA4335"
              d="M272 107.7c39.5 0 75 13.6 102.8 40.4l77.1-77.1C399.4 24.1 340.3 0 272 0 167.4 0 76.7 58.1 32.2 153l88.5 69.8c21.2-64 80.9-111.5 151.3-111.5z"
            />
          </svg>
          <a href="http://localhost:3000/login" className="la">
          Login with Google
          </a>
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
