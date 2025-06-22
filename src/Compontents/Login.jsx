import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      email,
      password,
    };

    try {
      const res = await axios.post(
        "https://www.blackstonevoicechatroom.online/login",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token, user } = res.data;

      // Check if user is admin
      if (user.role === "admin") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        alert("Admin login successful.");
        // Redirect or navigate to dashboard
        // e.g., window.location.href = "/admin-dashboard";
        navigation("/dashboard");
      } else {
        setError("Access denied. Only admin can log in.");
      }

    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center px-4">
      <div className="bg-[#2a2a2a] text-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.svg" alt="Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-xl font-semibold text-yellow-400">Sign In</h2>
          <p className="text-sm text-gray-400">Enter your email and password to sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded focus:outline-none focus:border-yellow-400"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 bg-[#1e1e1e] border border-gray-600 rounded focus:outline-none focus:border-yellow-400"
              placeholder="********"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
