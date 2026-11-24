import React, { useState, useEffect } from "react";
import "./app.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import NexSysLogo from "./assets/nexsys-logo.png";
import { Menu, X } from "lucide-react";
import { METRICS, CHART_DATA } from "./data/dashboard_data";
import Login from "./components/Auth/Login";
import Loader from "./components/Utlies/Loader";
import Billing from "./components/Billing";
import Calendar from "./components/Calendar";
import ClientGrid from "./components/Customers";
import renderInventory from "./components/Inventory";
import Profile from "./components/Profile";
import Expenditure from "./components/Expenditure";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import {
  startOfMonth,
  endOfMonth,
  addDays,
  formatISO,
  handleLogoutHelper,
} from "./helpers/HelperFunctions.jsx";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(formatISO(new Date()));
  const [current, setCurrent] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [loaderLabel, setLoaderLabel] = useState("NexSys");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    const logoutTimer = setTimeout(() => {
      localStorage.removeItem("user");
      setUser(null);
      alert("Session expired. You’ve been logged out automatically.");
    }, 60 * 60 * 1000);
    return () => clearTimeout(logoutTimer);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () =>
  handleLogoutHelper({
    setLoaderLabel,
    setLoading,
    setUser,
    setCurrentPage,
  });

  if (checkingAuth) return <Loader show={true} label="Loading..." />;
  if (!user) return <Login onLogin={setUser} />;

  // ✅ Define role-based navigation
  const NAV_ITEMS = {
    superadmin: [
      ["dashboard", "Dashboard"],
      ["companies", "Companies"],
      ["users", "Users"],
      ["profile", "Profile"],
    ],
    admin: [
      ["dashboard", "Dashboard"],
      ["users", "Users"],
      ["calendar", "Calendar"],
      ["billing", "Billing"],
      ["inventory", "Inventory"],
      ["expense", "Expense"],
      ["customer", "Customer"],
      ["profile", "Profile"],
    ],
    user: [
      ["dashboard", "Dashboard"],
      ["calendar", "Calendar"],
      ["billing", "Billing"],
      ["customer", "Customer"],
      ["profile", "Profile"],
    ],
  };

  const role = user.role?.toLowerCase() || "user";
  const navList = NAV_ITEMS[role] || NAV_ITEMS.user;

  const renderDashboard = () => (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-600">Overview of key metrics.</p>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {METRICS.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-2xl shadow-sm"
          >
            <div className="text-sm text-slate-500">{m.label}</div>
            <div className="text-2xl font-medium mt-2">{m.value}</div>
          </motion.div>
        ))}
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Visitors (last 7 days)</h2>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DATA}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-indigo-100">
      {/* ✅ Navbar */}
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-30 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-6" style={{ marginLeft: "-2.5rem" }}>
            <div className="flex items-center h-24">
              <img
                src={NexSysLogo}
                alt="NexSys"
                className="h-24 w-auto object-contain -mt-2"
              />
            </div>

            {/* Desktop nav */}
            <ul className="hidden md:flex gap-4 text-sm text-slate-600">
              {navList.map(([page, label]) => (
                <li
                  key={page}
                  onClick={() => {
                    setLoading(true);
                    setCurrentPage(page);
                    setTimeout(() => setLoading(false), 3000);
                  }}
                  className={`cursor-pointer ${
                    currentPage === page ? "text-indigo-600 font-medium" : ""
                  }`}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* User info + logout */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.username}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-500 border border-red-400 px-2 py-1 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ✅ Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-t shadow-sm md:hidden">
            <ul className="flex flex-col text-sm text-slate-700">
              {navList.map(([page, label]) => (
                <li
                  key={page}
                  onClick={() => {
                    setMobileOpen(false);
                    setLoading(true);
                    setCurrentPage(page);
                    setTimeout(() => setLoading(false), 3000);
                  }}
                  className={`px-4 py-2 border-b cursor-pointer hover:bg-indigo-50 ${
                    currentPage === page ? "text-indigo-600 font-medium" : ""
                  }`}
                >
                  {label}
                </li>
              ))}
              <li className="px-4 py-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left text-red-500 border border-red-400 px-2 py-1 rounded hover:bg-red-50 text-xs"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

      <Loader show={loading} label={loaderLabel} />

      {/* ✅ Page content */}
      <main className="flex-1 overflow-y-auto bg-indigo-100 mt-16 px-4 pb-6">
        <div className="max-w-7xl mx-auto w-full">
          {currentPage === "dashboard" && role === "superadmin" && <SuperAdminDashboard />}
          {currentPage === "dashboard" && role !== "superadmin" && renderDashboard()}

          {currentPage === "calendar" && (
            <Calendar
              current={current}
              setCurrent={setCurrent}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              startOfMonth={startOfMonth}
              endOfMonth={endOfMonth}
              addDays={addDays}
              formatISO={formatISO}
            />
          )}
          {currentPage === "billing" && <Billing />}
          {currentPage === "inventory" && renderInventory({ setLoading })}
          {currentPage === "expense" && <Expenditure />}
          {currentPage === "customer" && <ClientGrid setCurrentPage={setCurrentPage} />}
          {currentPage === "profile" && <Profile user={user} />}

          {/* placeholders for new pages */}
          {currentPage === "companies" && role === "superadmin" && (
            <div className="p-6 bg-white rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Manage Companies</h2>
              <p>Superadmin can view or create new companies here.</p>
            </div>
          )}

          {currentPage === "users" && role !== "user" && (
            <div className="p-6 bg-white rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
              <p>Admins and Superadmins can view or create new users here.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} NexSys. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-indigo-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-indigo-600">
              Terms
            </a>
            <a href="#" className="hover:text-indigo-600">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
