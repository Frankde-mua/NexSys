import React, { useState } from "react";

const FINANCIAL_OPTIONS = [
  "Age Analysis",
  "Allocations List",
  "Cashier Report",
  "Daily Invoice Listing",
  "Daily Turnover",
  "Discount Listing",
  "Credit Sundry Report",
];

export default function FinancialMenu({ onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="bg-white border px-3 py-1 rounded shadow-sm hover:bg-gray-100"
      >
        Reports
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 bg-white border rounded shadow-lg z-50">
          <ul>
            {FINANCIAL_OPTIONS.map((opt) => (
              <li
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-indigo-50 text-sm text-gray-700"
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
