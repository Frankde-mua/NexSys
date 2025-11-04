// sections/ClientDetails.jsx
import React from "react";

export default function ClientDetails({ selectedClient, setShowClients }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="text-sm font-semibold mb-4">Client Details</h2>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="First Name"
          value={selectedClient?.name || ""}
          className="border rounded-lg p-2 flex-1 text-sm"
          disabled
        />
        <input
          type="text"
          placeholder="Last Name"
          value={selectedClient?.surname || ""}
          className="border rounded-lg p-2 flex-1 text-sm"
          disabled
        />
        <input
          type="text"
          placeholder="Email"
          value={selectedClient?.email || ""}
          className="border rounded-lg p-2 flex-1 text-sm"
          disabled
        />
        <button
          onClick={() => setShowClients(true)}
          className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          {selectedClient ? "Change" : "Search"}
        </button>
      </div>

      {selectedClient && (
        <div className="mt-3 text-xs text-slate-500">
          <p><strong>Cell:</strong> {selectedClient.cell}</p>
          <p><strong>Type:</strong> {selectedClient.type}</p>
          <p><strong>Address:</strong> {selectedClient.address}</p>
        </div>
      )}
    </div>
  );
}
