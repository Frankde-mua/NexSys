// sections/BillingSummary.jsx
import React from "react";

export default function BillingSummary({ totalVAt, totalBilling, setShowInvoice }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="text-sm font-semibold mb-4">Billing Summary</h2>
      <table className="w-full text-sm border-t">
        <tbody>
          <tr>
            <td className="py-2 font-medium">VAT</td>
            <td className="py-2 font-semibold">R{totalVAt.toFixed(2)}</td>
          </tr>
          <tr>
            <td className="py-2 font-medium">Total</td>
            <td className="py-2 font-semibold">R{totalBilling.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-4">
        <button
          onClick={() => setShowInvoice(true)}
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
        >
          Generate Invoice
        </button>
      </div>
    </div>
  );
}
