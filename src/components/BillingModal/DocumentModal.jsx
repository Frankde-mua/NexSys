import React from "react";

export default function DocumentModal({
  type = "invoice",
  show,
  onClose,
  billingRows = [],
  selectedClient,
  userData = {},
  totalVAt = 0,
  totalBilling = 0,
  icd10Codes = [],
}) {
  if (!show) return null;
  const isQuote = type === "quote";
  const prescription = selectedClient?.prescription || {};
  const icd10Short = icd10Codes.map((c) => c.split(" - ")[0]).join(" • ");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 print:bg-transparent">
      <div
        className={`bg-white relative rounded-xl shadow-lg transition-all duration-300 ${
          isQuote
            ? "w-[900px] h-[90vh] overflow-y-auto" // 👈 fixed width & height + scroll for quote mode
            : "w-[210mm] max-h-[90vh] overflow-y-auto print:w-full print:max-h-none" // 👈 full-page for invoice
        } p-10`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 print:hidden"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          {userData.logo && (
            <img
              src={userData.logo}
              alt="Logo"
              className="w-16 h-16 mx-auto rounded-full mb-2"
            />
          )}
          <h1 className="text-2xl font-bold">{userData.company}</h1>
          <p className="text-gray-600 text-sm">{userData.email}</p>
          <h2 className="text-lg font-semibold mt-2">
            {isQuote ? "Quote Document" : "Invoice Document"}
          </h2>
        </div>

        {/* Info Section */}
        <div className="flex justify-between text-sm mb-4">
          <div>
            <p>
              <strong>{isQuote ? "Quote No:" : "Invoice No:"}</strong> #00001
            </p>
            <p>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p>
              <strong>Client:</strong> {selectedClient?.name || "—"}{" "}
              {selectedClient?.surname || ""}
            </p>
            <p>
              <strong>Cell:</strong> {selectedClient?.cell || "—"}
            </p>
          </div>
        </div>

        {/* Billing Table */}
        <h2 className="font-semibold text-sm mb-2">Billing Details</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Code</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Discount</th>
              <th className="border p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {billingRows.map((r, i) => {
              const discount = (r.fee * (r.discount || 0)) / 100;
              const total = (r.fee - discount) * (r.qty || 1);
              return (
                <tr key={i}>
                  <td className="border p-2 text-center">{r.code || "—"}</td>
                  <td className="border p-2">{r.tariff || "—"}</td>
                  <td className="border p-2 text-right">{r.discount || 0}%</td>
                  <td className="border p-2 text-right">
                    R{total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-4 text-sm">
          <div className="w-1/3">
            <div className="flex justify-between border-t border-gray-300 py-1">
              <span>VAT:</span>
              <span>R{totalVAt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 py-1 font-semibold">
              <span>Total:</span>
              <span>R{totalBilling.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
