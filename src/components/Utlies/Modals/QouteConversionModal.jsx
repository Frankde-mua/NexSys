import React, { useEffect, useState } from "react";
import axios from "axios";

const QouteConvert = ({ onClose, client, onConvert }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch client quotes (replace with your real API)
  useEffect(() => {
    const fetchQuotes = async () => {
      if (!client) return;
      try {
        const response = await axios.get(`/api/qoutes?client_id=${client.id}`);
        setQuotes(response.data || []);
      } catch (err) {
        console.error("Error fetching quotes:", err);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [client]);

  // ✅ Handle conversion
  const handleConvert = async (quote) => {
    try {
      // Optional: update quote status in DB
      await axios.put(`/api/qoutes/${quote.id}/convert`, {
        status: "converted",
      });

      // Pass quote details back to parent (Invoice.jsx)
      onConvert(quote);

      // Close modal
      onClose();
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Failed to convert quote. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Quotes for {client?.name} {client?.surname}
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Select a quote below to convert it into an invoice.
        </p>

        {loading ? (
          <p className="text-center text-slate-500 text-sm">Loading quotes...</p>
        ) : quotes.length === 0 ? (
          <div className="text-center text-slate-600 py-8 border rounded-lg">
            <p className="text-sm">No quotes found for this client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-t border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-left border-b">
                  <th className="py-2 px-3 font-semibold text-slate-700">
                    Quote #
                  </th>
                  <th className="py-2 px-3 font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="py-2 px-3 font-semibold text-slate-700">
                    Total (R)
                  </th>
                  <th className="py-2 px-3 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="py-2 px-3 font-semibold text-slate-700 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-slate-50 transition"
                  >
                    <td className="py-2 px-3">{q.quote_no || `#${idx + 1}`}</td>
                    <td className="py-2 px-3">
                      {new Date(q.date || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">
                      R{q.total?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          q.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : q.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : q.status === "converted"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {q.status || "Pending"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleConvert(q)}
                        disabled={q.status === "converted"}
                        className={`${
                          q.status === "converted"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        } text-xs px-3 py-1 rounded-lg`}
                      >
                        {q.status === "converted" ? "Converted" : "Convert"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QouteConvert;
