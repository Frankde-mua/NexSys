import React, { useState } from "react";
import Loader from "../Utlies/Loader";
import axios from "axios";
import NexSysLogo from "../../assets/nexsys-logo.png";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({
    username: "",
    company: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    //https://franklin-unsprinkled-corrie.ngrok-free.dev  http://localhost:5000 - switched to localhost for development
    try {
      const res = await axios.post(
        "http://localhost:5000/api/login",
        form
      );

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        onLogin(res.data.user);
      } else {
        alert("Invalid login details. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-indigo-100 relative space-y-6">
      <Loader show={loading} label="Logging in..." />

      {/* Logo sits above the card */}
      <img
        src={NexSysLogo}
        alt="NexSys Logo"
        className="w-36 object-contain mb-2"
      />

      {/* Login card */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[350px]">
        <h2 className="text-2xl font-semibold text-center mb-2">Login</h2>
        <p className="text-sm text-center text-slate-500 mb-6">
          Enter your credentials to access your dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full mb-3 border rounded p-2"
          />
          <input
            type="text"
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full mb-3 border rounded p-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full mb-4 border rounded p-2"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-all"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
