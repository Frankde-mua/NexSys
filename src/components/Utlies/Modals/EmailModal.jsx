import React, { useState } from "react";
import { X, Paperclip, Send } from "lucide-react";
import axios from "axios";

export default function EmailModal({ onClose }) {
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "Your Statement from Your Company",
    message: "Dear customer,\n\nPlease find attached your latest statement.\n\nKind regards,\nYour Company",
    includeStatement: true,
  });

  const handleChange = (e) =>
    setEmailData({ ...emailData, [e.target.name]: e.target.value });

  const handleCheckbox = () =>
    setEmailData({ ...emailData, includeStatement: !emailData.includeStatement });

  const handleSend = async () => {
    try {
      await axios.post("/api/send-statement-email", emailData);
      alert("Email sent successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error sending email");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-green-600" />
          Send Statement via Email
        </h2>

        <div className="space-y-3">
          <input
            type="email"
            name="to"
            value={emailData.to}
            onChange={handleChange}
            placeholder="Recipient Email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            name="message"
            value={emailData.message}
            onChange={handleChange}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          ></textarea>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={emailData.includeStatement}
              onChange={handleCheckbox}
            />
            <Paperclip className="w-4 h-4 text-gray-600" />
            Include Statement as Attachment
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
