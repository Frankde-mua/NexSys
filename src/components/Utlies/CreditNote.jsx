import React, { useState } from "react";
import TariffGrid from "../sections/TariffGrid";
import TariffWizardModal from "../BillingModal/TariffWizardModal";

// ⚙️ Utils
import { BILLING_SERVICES, DUMMY_TARIFFS, blankRow } from "../utils/billingUtils";

const CreditNote = ({ selectedClient, userData,  mode = "", initialData = []}) => {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const isQuoteMode = mode;

  const [billingRows, setBillingRows] = useState(initialData?.rows || [blankRow()]);
  const [showTariffModal, setShowTariffModal] = useState(false);
  const [tariffModalTargetRowId, setTariffModalTargetRowId] = useState(null);
  
    const addRow = () => setBillingRows((prev) => [...prev, blankRow()]);
    const updateRow = (id, updates) =>
      setBillingRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    const clearTable = () => setBillingRows([blankRow()]);
  
    const handleSave = () => {
        const creditNoteData = {
            date,
            reason,
            notes,
            selectedClient,
            userData,
            billingRows,
        };
        console.log("Credit Note Data:", creditNoteData);
        // Further processing like sending to backend or generating PDF can be done here
    }

   const handleConvertInvoice = () => {
    // Logic to convert quote to invoice
    };

//     const handleSelectClient = (client) => {
//     setSelectedClient(client);
//     setShowClients(false);
//   };

  const selectTariffToRow = (tariff) => {
    if (!tariffModalTargetRowId) return;
    updateRow(tariffModalTargetRowId, {
      tariff: tariff.desc,
      tariffCode: tariff.code,
      fee: tariff.fee,
    });
    setShowTariffModal(false);
    setTariffModalTargetRowId(null);
  };

  const handlePrint = () => window.print();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <h2 className="text-xl font-semibold text-slate-700 mb-4">
        ↩️ Credit Note
      </h2>

      {/* === Date & Reason Row === */}
      <div className="grid grid-cols-4 gap-4 items-start">
        {/* Date + Patient Details */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[160px] border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Patient Details */}
          {selectedClient && (
            <div className="bg-gray-50 p-3 mt-3 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
                Patient Details
              </h3>
              <p className="text-sm text-slate-600 leading-snug">
                <strong>
                  {selectedClient.firstname} {selectedClient.surename}
                </strong>
                <br />
                ID: {selectedClient.id_no || "N/A"} <br />
                Tel: {selectedClient.tel || "N/A"} <br />
                Email: {selectedClient.email || "N/A"}
              </p>
            </div>
          )}
        </div>

        {/* Empty space (replaces Amount/Method) */}
        <div className="col-span-1" />

        {/* Reason + Company Details */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reason
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Company Details */}
          {userData && (
            <div className="bg-gray-50 p-3 mt-3 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
                Company Details
              </h3>
              <p className="text-sm text-slate-600 leading-snug">
                <strong>{userData.company}</strong>
                <br />
                Email: {userData.email}
                <br />
                VAT No: {userData.vatNumber || "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* === Notes === */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* === Credit Note Grid + Button === */}
      <div className="bg-gray-50 p-4 rounded-xl border border-slate-200 mt-4">
        <h3 className="text-base font-semibold text-slate-800 mb-3">
          Credit Note Summary
        </h3>
        <TariffGrid
                      billingRows={billingRows}
                      updateRow={updateRow}
                      addRow={addRow}
                      clearTable={clearTable}
                      handleSave={handleSave}
                      handleConvertQuote={handleConvertInvoice}
                      setTariffModalTargetRowId={setTariffModalTargetRowId}
                      setShowTariffModal={setShowTariffModal}
                      isQuoteMode={isQuoteMode}
                    />

        {/* Generate Credit Note Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowPreview(true)}
            className="bg-purple-600 text-white px-5 py-2 rounded-lg shadow hover:bg-purple-700 transition-all"
          >
            Generate Credit Note
          </button>
        </div>
      </div>

      {/* === Modal Preview === */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800"
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-4 text-center">
              Credit Note Preview
            </h3>

            <div className="text-sm space-y-3">
              <div>
                <strong>Date:</strong> {date}
              </div>
              <div>
                <strong>Reason:</strong> {reason || "N/A"}
              </div>
              <div>
                <strong>Patient:</strong>{" "}
                {selectedClient
                  ? `${selectedClient.firstname} ${selectedClient.surename}`
                  : "N/A"}
              </div>
              <div>
                <strong>Company:</strong> {userData?.company || "N/A"}
              </div>
              <div>
                <strong>Notes:</strong> {notes || "None"}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition-all"
              >
                Print Credit Note
              </button>
            </div>
          </div>
        </div>
      )}

      {showTariffModal && (
              <TariffWizardModal
                setShowTariffModal={setShowTariffModal}
                selectTariffToRow={selectTariffToRow}
                DUMMY_TARIFFS={DUMMY_TARIFFS}
              />
            )}

    </div>
  );
};

export default CreditNote;
