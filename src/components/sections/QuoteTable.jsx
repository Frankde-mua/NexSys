import React from "react";

export default function QuoteTable({ quotes = [], onEdit }) {
  return (
    <table className="min-w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Quote #</th>
          <th className="p-2 border">Client</th>
          <th className="p-2 border">Date</th>
          <th className="p-2 border">Total</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {quotes.map((q, i) => (
          <tr key={i}>
            <td className="p-2 border text-center">Q-{q.id}</td>
            <td className="p-2 border">{q.client?.name || "—"}</td>
            <td className="p-2 border">{new Date().toLocaleDateString()}</td>
            <td className="p-2 border text-right">R{q.totalBilling?.toFixed(2)}</td>
            <td className="p-2 border text-center">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  q.converted
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {q.converted ? "Invoiced" : "Pending"}
              </span>
            </td>
            <td className="p-2 border text-center">
              {!q.converted && (
                <button
                  onClick={() => onEdit(q)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
