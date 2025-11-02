import React from "react";
import { X } from "lucide-react";

const StatementModal = ({ selectedClient, onClose }) => {
  const customer = selectedClient || {
    name: "David Mokoena",
    email: "david.mokoena@example.com",
    cell: "+27 84 555 1122",
    date: new Date().toLocaleDateString(),
  };

  const transactions = [
    { date: "2025-09-01", doc: "Invoice #1001 Website Hosting", ref: "INV1001", amount: 1200, balance: 1200 },
    { date: "2025-08-15", doc: "Receipt #4005 Payment Received", ref: "REC4005", amount: -600, balance: 600 },
    { date: "2025-07-20", doc: "Invoice #1000 SEO Optimization", ref: "INV1000", amount: 1500, balance: 2100 },
  ];

  const aging = [
    { label: "Current", value: 600 },
    { label: "30 Days", value: 600 },
    { label: "60 Days", value: 400 },
    { label: "90 Days", value: 300 },
    { label: "150 Days", value: 100 },
    { label: "180+ Days", value: 100 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[850px] max-h-[90vh] rounded-2xl shadow-xl overflow-auto relative p-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 print:hidden"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="text-center mb-8 border-b pb-6">
          <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full mb-3" />
          <h2 className="text-2xl font-semibold text-gray-800">Your Company</h2>
          <p className="text-gray-500 text-sm">Customer Statement</p>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 text-sm text-gray-700 mb-6">
          <div>
            <p><strong>Name:</strong> {customer.name}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Cell:</strong> {customer.cell}</p>
          </div>
          <div className="text-right">
            <p><strong>Date:</strong> {customer.date}</p>
            <p><strong>Statement No:</strong> 2025-001</p>
          </div>
        </div>

        {/* Transactions Table */}
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mb-8">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-3 text-left">Date</th>
              <th className="py-2 px-3 text-left">Document</th>
              <th className="py-2 px-3 text-left">Reference</th>
              <th className="py-2 px-3 text-right">Amount (R)</th>
              <th className="py-2 px-3 text-right">Balance (R)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="py-2 px-3">{t.date}</td>
                <td className="py-2 px-3">{t.doc}</td>
                <td className="py-2 px-3">{t.ref}</td>
                <td
                  className={`py-2 px-3 text-right font-medium ${
                    t.amount < 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.amount.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right">{t.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Horizontal Aging Summary */}
        <div className="mb-6">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                {aging.map((a, i) => (
                  <th key={i} className="py-2 px-3 text-center">
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {aging.map((a, i) => (
                  <td key={i} className="py-2 px-3 text-center font-medium">
                    {a.value.toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total */}
        <p className="text-lg font-semibold text-right mb-8">
          Total Due: R2100.00
        </p>

        {/* Print Button */}
        <div className="flex justify-center print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatementModal;
