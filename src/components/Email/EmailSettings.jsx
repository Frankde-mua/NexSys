import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function EmailSettings({ companyName, userId, onConfigured }) {
  const [form, setForm] = useState({
    smtpHost: "",
    smtpPort: "",
    imapHost: "",
    imapPort: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // --------------------------
  // 🧩 Load Existing Config
  // --------------------------
  useEffect(() => {
    const loadConfig = async () => {
      if (!companyName) return;

      setLoadingConfig(true);
      try {
        const res = await axios.get(`${API}/email/config/${companyName}`);
        if (res.data && res.data.email) {
          setForm({
            smtpHost: res.data.smtp_host || "",
            smtpPort: res.data.smtp_port || "",
            imapHost: res.data.imap_host || "",
            imapPort: res.data.imap_port || "",
            email: res.data.email || "",
            password: res.data.password || "",
          });
        }
      } catch (err) {
        console.warn("No existing config found for this company.");
      } finally {
        setLoadingConfig(false);
      }
    };

    loadConfig();
  }, [companyName]);

  // --------------------------
  // 💾 Save Config
  // --------------------------
  const handleSave = async () => {
    if (!companyName) return alert("Company not selected!");

    setLoading(true);
    try {
      const res = await axios.post(`${API}/email/config/${companyName}`, {
        userId,
        ...form,
      });

      if (res.data.success) {
        alert("✅ Email configuration saved successfully!");
        onConfigured?.();
      } else {
        alert("❌ Error: " + (res.data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Save email config error:", err);
      alert("⚠️ Could not save configuration. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // 🎨 Render
  // --------------------------
  return (
    <div className="p-6 bg-white shadow-md rounded-xl border border-gray-100 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        📧 Email Settings
      </h2>

      {loadingConfig ? (
        <div className="text-center text-gray-500 py-10 animate-pulse">
          Loading configuration...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                SMTP Host
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="smtp.gmail.com"
                value={form.smtpHost}
                onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                SMTP Port
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="465"
                value={form.smtpPort}
                onChange={(e) => setForm({ ...form, smtpPort: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                IMAP Host
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="imap.gmail.com"
                value={form.imapHost}
                onChange={(e) => setForm({ ...form, imapHost: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                IMAP Port
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="993"
                value={form.imapPort}
                onChange={(e) => setForm({ ...form, imapPort: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">
              Password / App Key
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="App-specific password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className={`mt-6 w-full py-3 rounded-lg font-semibold transition ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        </>
      )}
    </div>
  );
}
