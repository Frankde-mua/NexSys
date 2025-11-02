import React from "react";
import { generateICD10 } from "../utils/generateICD10";

export default function InvoiceModal({
  showInvoice,
  setShowInvoice,
  billingRows = [],
  selectedClient,
  userData = {},
  totalVAt = 0,
  totalBilling = 0,
}) {
  if (!showInvoice) return null;

  const prescription = {
    right: selectedClient?.prescription?.right || {},
    left: selectedClient?.prescription?.left || {},
  };

  const icd10Codes = generateICD10(prescription);
  const icd10Short = icd10Codes
    .map((c) => (typeof c === "string" ? c.split(" - ")[0] : c.code))
    .join(" • ");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 print:bg-transparent">
      {/* Modal Container */}
      <div className="bg-white w-[210mm] max-h-[90vh] overflow-y-auto p-10 rounded-xl shadow-lg relative print:shadow-none print:w-full print:max-h-none">
        {/* Close Button */}
        <button
          onClick={() => setShowInvoice(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 print:hidden"
        >
          ✕
        </button>

        {/* Header Section */}
        <div className="text-center mb-6">
          {userData.logo && (
            <img
              src={userData.logo}
              alt="Logo"
              className="w-16 h-16 mx-auto rounded-full mb-2"
            />
          )}
          <h1 className="text-2xl font-bold">
            {userData.company || "Your Company"}
          </h1>
          <p className="text-gray-600 text-sm">
            {userData.email || "info@example.com"}
          </p>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between text-sm mb-4">
          <div>
            <p>
              <strong>Invoice No:</strong> #00001
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

        {/* Prescription Table */}
        <h2 className="font-semibold text-sm mb-2">Prescription</h2>
        <table className="w-full mb-6 border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2">Eye</th>
              <th className="border border-gray-300 p-2">Sphere</th>
              <th className="border border-gray-300 p-2">Cyl</th>
              <th className="border border-gray-300 p-2">Axis</th>
              <th className="border border-gray-300 p-2">Add</th>
            </tr>
          </thead>
          <tbody>
            {["right", "left"].map((side) => (
              <tr key={side}>
                <td className="border border-gray-300 p-2 capitalize">
                  {side}
                </td>
                <td className="border border-gray-300 p-2">
                  {prescription[side]?.sphere || "0"}
                </td>
                <td className="border border-gray-300 p-2">
                  {prescription[side]?.cyl || "0"}
                </td>
                <td className="border border-gray-300 p-2">
                  {prescription[side]?.axis || "0"}
                </td>
                <td className="border border-gray-300 p-2">
                  {prescription[side]?.add || "0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Billing Table */}
        <h2 className="font-semibold text-sm mb-2">Billing Details</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 w-20">Code</th>
              <th className="border border-gray-300 p-2">Narrative</th>
              <th className="border border-gray-300 p-2">Diagnosis</th>
              <th className="border border-gray-300 p-2 text-right">
                Discount
              </th>
              <th className="border border-gray-300 p-2 text-right">
                Patient Portion
              </th>
              <th className="border border-gray-300 p-2 text-right">
                Medical Aid Portion
              </th>
              <th className="border border-gray-300 p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {billingRows.map((r, index) => {
              const discountAmount = (r.fee * (Number(r.discount) || 0)) / 100;
              const discountedPrice = r.fee - discountAmount;
              const total = discountedPrice * (r.qty || 1);

              return (
                <tr key={index}>
                  <td className="border border-gray-300 p-2 text-center">
                    {r.code || "—"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {r.tariff_desc || r.tariff || "—"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {icd10Short || "—"}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {r.discount ? `${r.discount}%` : "0%"}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    R{r.patient_portion?.toFixed(2) || "0.00"}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    R{r.medical_portion?.toFixed(2) || "0.00"}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
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

        {/* ICD-10 Codes */}
        <div className="mt-6 text-sm">
          <h3 className="font-semibold mb-1">ICD-10 Codes</h3>
          <ul className="list-disc list-inside text-gray-700">
            {icd10Codes.length > 0 ? (
              icd10Codes.map((code, i) => <li key={i}>{code}</li>)
            ) : (
              <li>No ICD-10 findings based on prescription.</li>
            )}
          </ul>
        </div>

        {/* Print Button */}
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
