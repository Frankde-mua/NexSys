import React, { useEffect, useState } from "react";
import axios from "axios";
import EmailSettings from "./Email/EmailSettings.jsx";

const API_URL = "http://localhost:5000/api";
const user = JSON.parse(localStorage.getItem("user"));

const Email = () => {
  const [emails, setEmails] = useState([]);
  const [tab, setTab] = useState("inbox");
  const [form, setForm] = useState({ to: "", subject: "", message: "" });
  const [showModal, setShowModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const companyName = user?.company_name?.toLowerCase() || "";

  // ✅ Load emails (Inbox, Sent, etc.)
  const loadEmails = async (type) => {
    if (!companyName) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/email/${type}/${companyName}`);
      if (res.data.success) {
        setEmails(res.data.messages || []);
      } else {
        setEmails([]);
      }
    } catch (err) {
      console.error("❌ Error loading emails:", err);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load inbox immediately when connected
  useEffect(() => {
    const isConnected = window.location.search.includes("connected=true");
    if (isConnected) {
      setLoading(true); // show loader immediately
      loadEmails("inbox");
    }
  }, [companyName]);

  // ✅ Send new email
  const sendEmail = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/email/send/${companyName}`, form);
      alert(res.data.message || "Email sent!");
      setShowModal(false);
      setForm({ to: "", subject: "", message: "" });
    } catch (err) {
      console.error("❌ Error sending email:", err);
      alert("Failed to send email.");
    }
  };

  const sendReply = async (emailId) => {
    if (!reply.trim()) return alert("Enter a reply message");
    try {
      const res = await axios.post(
        `${API_URL}/email/reply/${emailId}/${companyName}`,
        { message: reply }
      );
      alert(res.data.message || "Reply sent!");
      setReply("");
    } catch (err) {
      console.error("❌ Error sending reply:", err);
      alert("Failed to send reply.");
    }
  };

  return (
    <div className="flex h-[500px] bg-gray-50">
      {/* Sidebar - smaller and tighter */}
      <aside className="w-48 bg-white border-r border-gray-200 flex flex-col p-4">
        <h4 className="text-xl text-slate-500 font-bold mb-6">📧 eMail</h4>
        <nav className="flex-1 space-y-2">
          {["inbox", "sent", "drafts", "settings"].map((type) => (
            <button
              key={type}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                tab === type
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                setTab(type);
                if (type !== "settings") loadEmails(type);
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content - slightly narrower & centered */}
      <main className="flex-1 px-6 py-8 overflow-y-auto max-w-[1100px] mx-auto">
        <h4 className="text-2xl font-bold mb-4 capitalize">{tab}</h4>

        {/* Email List */}
        {tab !== "settings" && (
          <>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500 text-lg animate-pulse">
                  Loading {tab}...
                </div>
              </div>
            ) : emails.length === 0 ? (
              <p className="text-gray-500">Welcome to your mailbox.</p>
            ) : (
              <div className="space-y-4">
                {emails.map((m, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg bg-white p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => setSelectedEmail(m)}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-800">
                        {m.from || "Unknown Sender"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {m.date ? new Date(m.date).toLocaleString() : ""}
                      </span>
                    </div>
                    <div className="font-medium text-gray-900">
                      {m.subject || "No Subject"}
                    </div>
                    <p className="text-gray-700 text-sm mt-1 line-clamp-2">
                      {m.snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="text-gray-700">
            <h5 className="text-lg font-semibold mb-2">⚙️ Settings</h5>
            <EmailSettings
              companyName={companyName}
              userId={user?.id}
              onConfigured={() => loadEmails("inbox")}
            />
          </div>
        )}

        {/* Selected Email Modal */}
        {selectedEmail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
            <div className="bg-white w-[90%] max-w-3xl h-[85vh] overflow-y-auto rounded-xl shadow-xl p-5 sm:p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedEmail(null)}
              >
                ✕
              </button>
              <h3 className="text-xl font-bold mb-2">{selectedEmail.subject}</h3>
              <p className="text-sm text-gray-600 mb-1">
                From: {selectedEmail.from || "Unknown Sender"}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {selectedEmail.date
                  ? new Date(selectedEmail.date).toLocaleString()
                  : ""}
              </p>
              <p className="text-gray-800 mb-4">{selectedEmail.snippet}</p>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-2">Reply</h4>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your reply..."
                  rows={4}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => sendReply(selectedEmail.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Compose Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white w-14 h-14 rounded-full text-3xl shadow-lg hover:bg-blue-700 transition"
      >
        ＋
      </button>

      {/* Compose Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-30 p-4">
          <div className="bg-white h-[500px] rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h4 className="text-xl font-bold mb-4">✉️ New Email</h4>
            <form onSubmit={sendEmail} className="space-y-4">
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="To"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
              />
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Email;
