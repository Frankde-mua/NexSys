import React, { useState } from "react";
import ClientList from "./Utlies/ClientList"


export default function ClientGrid({ setCurrentPage }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  return (
    <div>
      {/* --- Header Section --- */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Clientel</h1>
          <p className="text-sm text-slate-600">Manage your clientel.</p>
        </div>
      </header>
      
      {/* ⚡ 3 Cards Section */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {/* Add Client Card */}
        <div
          onClick={() => setShowAddModal(true)}
          className="w-64 h-36 bg-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer text-lg font-semibold hover:bg-blue-100 transition"
        >
          ➕ Add Client
        </div>

        {/* Update Client Card */}
        <div
          onClick={() => setShowUpdateModal(true)}
          className="w-64 h-36 bg-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer text-lg font-semibold hover:bg-green-100 transition"
        >
          ✏️ Update Client
        </div>

        {/* Bill Client Card */}
        <div
          onClick={() => setCurrentPage("billing")}
          className="w-64 h-36 bg-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer text-lg font-semibold hover:bg-red-100 transition"
        >
          💳 Bill Client
        </div>
      </div>

      {/* ✅ AG Grid Section */}
        <ClientList />
    
      {/* 🟦 Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Add Client</h2>
            <p className="mb-4">Form or content for adding a client goes here.</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🟩 Update Client Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Update Client</h2>
            <p className="mb-4">
              Content or update form for client information goes here.
            </p>
            <button
              onClick={() => setShowUpdateModal(false)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
