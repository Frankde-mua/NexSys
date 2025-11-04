import React, { useState } from "react";
import DocumentModal from "../BillingModal/DocumentModal";
import { saveInvoice, getCompanyName } from "../Utlies/Helpers/HelperFunctions";

const BillingSummary = ({ billingRows, selectedClient, userData }) => {
  const [showDocument, setShowDocument] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // === CALCULATIONS ===
  const subtotal = billingRows.reduce(
    (sum, row) => sum + Number(row.fee || 0),
    0
  );

  const vatRate = 0.15; // 15% VAT for display only
  const vatAmount = subtotal * vatRate;
  const totalBilling = subtotal + vatAmount;

  // === HANDLE SAVE ===
  const generateInvoice = async () => {
    if (!selectedClient || billingRows.length === 0) {
      alert("Please select a patient and add at least one billing item.");
      return;
    }
    
    const companyName = getCompanyName();
    setIsSaving(true);

    try {
      const res = await saveInvoice(
        companyName,
        selectedClient,
        billingRows,
        userData
      );

      if (res?.success && res?.document_number) {
        setSavedInvoice({
          document_number: res.document_number,
          patient: selectedClient,
          total: totalBilling,
          vatAmount,
          billingRows,
        });
        setShowDocument(true); // ✅ only show modal if invoice saved
      } else {
        alert("Invoice failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Billing Summary
      </h2>

      <div className="flex justify-between text-gray-600 mb-1">
        <span>Subtotal:</span>
        <span>R {subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-600 mb-1">
        <span>VAT (15%):</span>
        <span>R {vatAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-800 font-semibold border-t mt-2 pt-2">
        <span>Total Amount:</span>
        <span>R {totalBilling.toFixed(2)}</span>
      </div>

      <button
        onClick={generateInvoice}
        disabled={isSaving}
        className={`mt-4 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg shadow hover:bg-indigo-700 ${
          isSaving ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isSaving ? "Saving..." : "Generate Invoice"}
      </button>

      {showDocument && savedInvoice && (
        <DocumentModal
          isOpen={showDocument}
          onClose={() => setShowDocument(false)}
          documentData={savedInvoice}
          documentType="Invoice"
        />
      )}
    </div>
  );
};

export default BillingSummary;
