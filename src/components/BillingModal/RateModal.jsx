// modals/RateModal.jsx
import React from "react";

export default function RateModal({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80">
        <h3 className="text-lg font-semibold mb-3">Add New Rate</h3>
        <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mt-3" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}