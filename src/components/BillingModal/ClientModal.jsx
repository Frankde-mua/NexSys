// modals/ClientModal.jsx
import React from "react";
import ClientList from "../Utlies/ClientList";

export default function ClientModal({ showClients, handleSelectClient }) {
  if (!showClients) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 shadow-lg text-center w-full max-w-4xl transition-all duration-300">
        <h2 className="text-2xl font-bold mb-4">Client List</h2>
        <ClientList onSelect={handleSelectClient} />
      </div>
    </div>
  );
}
