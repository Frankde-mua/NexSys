// sections/ManualAddSection.jsx
import React from "react";

export default function ManualAddSection({
  manualService,
  discountService,
  manualPrice,
  setManualService,
  setDiscountService,
  setManualPrice,
  handleAddManual,
  setBillingRows,
}) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="text-sm font-semibold mb-4">Add Tariff / Manual Billing</h2>
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <input
          type="text"
          placeholder="Tariff Name"
          value={manualService}
          onChange={(e) => setManualService(e.target.value)}
          className="border rounded-lg p-2 flex-1 text-sm"
        />
        <input
          type="number"
          placeholder="Discount %"
          value={discountService}
          onChange={(e) => setDiscountService(e.target.value)}
          className="border rounded-lg p-2 w-32 text-sm"
        />
        <input
          type="number"
          placeholder="Fee (R)"
          value={manualPrice}
          onChange={(e) => setManualPrice(e.target.value)}
          className="border rounded-lg p-2 w-32 text-sm"
        />
        <button
          onClick={handleAddManual}
          className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          Add
        </button>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setBillingRows((r) => (r.length ? r.slice(0, -1) : r))}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            title="Remove last row"
          >
            Remove Last
          </button>
        </div>
      </div>
    </div>
  );
}
