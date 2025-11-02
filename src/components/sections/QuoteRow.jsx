import React from "react";

const QuoteRow = ({ quote, index, onEdit }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-4 py-2 border text-center">{index + 1}</td>
    <td className="px-4 py-2 border">{quote?.client?.name || "N/A"}</td>
    <td className="px-4 py-2 border">R {quote.totalBilling?.toFixed(2) || 0}</td>
    <td
      className={`px-4 py-2 border font-medium ${
        quote.status === "Converted" ? "text-green-600" : "text-yellow-600"
      }`}
    >
      {quote.status}
    </td>
    <td className="px-4 py-2 border text-center">
      <button
        onClick={() => onEdit(quote, index)}
        disabled={quote.status === "Converted"}
        className={`px-3 py-1 rounded-lg text-sm ${
          quote.status === "Converted"
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-indigo-500 text-white hover:bg-indigo-600"
        }`}
      >
        Edit
      </button>
    </td>
  </tr>
);

export default QuoteRow;
