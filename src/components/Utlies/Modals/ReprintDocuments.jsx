import React, { useState } from "react";

 const ReprintDocuments = ({ selectedClient }) => {
  const [docType, setDocType] = useState("");
  const [showDoc, setShowDoc] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userProfile") || "{}");

  const headers = {
    invoice: "Reprint – Tax Invoice",
    receipt: "Reprint – Official Receipt",
    credit: "Reprint – Credit Note",
    jDebit: "Reprint – Journal Debit",
    jCredit: "Reprint – Journal Credit",
  };

  const handlePrint = () => window.print();

  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow-sm mt-6">
      <h2 className="text-sm font-semibold mb-4 text-slate-700">Reprint Documents</h2>
      <div className="flex gap-2 items-center">
        <select
          className="border rounded-lg p-2 text-sm bg-white"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
        >
          <option value="">Select document</option>
          <option value="invoice">Invoice</option>
          <option value="receipt">Receipt</option>
          <option value="credit">Credit Note</option>
          <option value="jDebit">Journal Debit</option>
          <option value="jCredit">Journal Credit</option>
        </select>
        <button
          disabled={!docType}
          onClick={() => setShowDoc(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:bg-gray-300"
        >
          View Reprint
        </button>
      </div>

      {showDoc && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowDoc(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <div className="text-center mb-4">
              {userData.logo ? (
                <img
                  src={userData.logo}
                  alt="Logo"
                  className="w-16 h-16 mx-auto rounded-full mb-2"
                />
              ) : (
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 mb-2" />
              )}
              <h2 className="text-xl font-semibold">{userData.company || "Your Company"}</h2>
              <p className="text-sm text-slate-500">{headers[docType]}</p>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>Name:</strong> {selectedClient?.name}</p>
              <p><strong>Surname:</strong> {selectedClient?.surname}</p>
              <p><strong>Cell:</strong> {selectedClient?.cell}</p>
              <p><strong>Email:</strong> {selectedClient?.email}</p>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handlePrint}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReprintDocuments;