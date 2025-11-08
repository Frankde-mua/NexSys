import React, { useState, useEffect } from "react";

// 🧩 Section Components
import ClientDetails from "../sections/ClientDetails";
import PrescriptionForm from "../sections/PrescriptionForm";
import ManualAddSection from "../sections/ManualAddSection";
import TariffGrid from "../sections/TariffGrid";
import BillingSummary from "../sections/BillingSummary";
import QuickServiceSection from "../Utlies/QuickServiceSection";

// 🪟 Modal Components
import TariffWizardModal from "../BillingModal/TariffWizardModal";
import ClientModal from "../BillingModal/ClientModal";
import RateModal from "../BillingModal/RateModal";
import SalesModal from "../BillingModal/SalesModal";
import DocumentModal from "../BillingModal/DocumentModal";

// ⚙️ Utils
import { saveInvoice } from "./Helpers/HelperFunctions";
import { BILLING_SERVICES, DUMMY_TARIFFS, blankRow } from "../utils/billingUtils";

export default function Invoice({ mode = "invoice", onSave, initialData }) {
  const isQuoteMode = mode === "quote";

  // ===== STATE =====
  const [selectedClient, setSelectedClient] = useState(initialData?.client || null);
  const [showClients, setShowClients] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  const [showTariffModal, setShowTariffModal] = useState(false);
  const [tariffModalTargetRowId, setTariffModalTargetRowId] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);

  const [billingRows, setBillingRows] = useState(initialData?.rows || [blankRow()]);
  const [manualService, setManualService] = useState("");
  const [discountService, setDiscountService] = useState("");
  const [manualPrice, setManualPrice] = useState("");

  const [userData, setUserData] = useState({
    logo: null,
    company: "Your Company",
    email: "info@example.com",
  });

  const [prescription, setPrescription] = useState({
    right: { sphere: 0, cyl: 0, axis: 0, add: 0 },
    left: { sphere: 0, cyl: 0, axis: 0, add: 0 },
  });

  const [icd10Codes, setIcd10Codes] = useState([]);

  // ===== LOGIC =====
  const addRow = () => setBillingRows((prev) => [...prev, blankRow()]);
  const updateRow = (id, updates) =>
    setBillingRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  const clearTable = () => setBillingRows([blankRow()]);

  const handleAddManual = () => {
    if (!manualService || !manualPrice) return;
    setBillingRows((prev) => [
      ...prev,
      { ...blankRow(), tariff: manualService, fee: Number(manualPrice), discount: Number(discountService) },
    ]);
    setManualService("");
    setManualPrice("");
    setDiscountService("");
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setShowClients(false);
  };

  const selectTariffToRow = (tariff) => {
    if (!tariffModalTargetRowId) return;
    updateRow(tariffModalTargetRowId, {
      tariff: tariff.description,
      code: tariff.code,
      fee: tariff.standard_fee,
    });
    setShowTariffModal(false);
    setTariffModalTargetRowId(null);
  };

  const handleSave = () => {
    const data = { client: selectedClient, rows: billingRows, totalBilling, totalVAt, mode };
    if (onSave) onSave(data);
    alert(`${isQuoteMode ? "Quote" : "Invoice"} saved successfully!`);
  };

const generateInvoice = async () => {
  try {
    const res = await saveInvoice(userData.company, selectedClient, billingRows, userData);

    if (res.success && res.document_number) {
      alert(`Invoice ${res.document_number} saved successfully!`);
      setShowDocument(true); // ✅ open modal only if invoice is saved
    } else {
      alert("Failed to save invoice.");
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to save invoice.");
  }
};


  const handleConvertQuote = () => {
    alert("Quote converted to invoice successfully!");
  };

  const totalBilling = billingRows.reduce((sum, r) => {
    const discountAmount = (r.fee * (Number(r.discount) || 0)) / 100;
    const discountedPrice = r.fee - discountAmount;
    return sum + discountedPrice * (r.qty || 1);
  }, 0);

  const totalVAt = totalBilling * 0.15;

  useEffect(() => {
    const savedData = localStorage.getItem("userData");
    if (savedData) setUserData(JSON.parse(savedData));
  }, []);

  // ===== RENDER =====
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="overflow-y-auto pr-2 pb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
          {/* Header */}
          <header className="mb-4">
            <h1 className="text-2xl font-semibold text-slate-800 mb-1">
              {isQuoteMode ? "💬 Quote" : "🧾 Invoice"}
            </h1>
          </header>

          {/* Quick Services */}
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <QuickServiceSection
              BILLING_SERVICES={BILLING_SERVICES}
              billingRows={billingRows}
              setBillingRows={setBillingRows}
            />
          </div>

          {/* Client Details */}
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <ClientDetails selectedClient={selectedClient} setShowClients={setShowClients} />
          </div>

          {/* Prescription */}
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <PrescriptionForm
              prescription={prescription}
              setPrescription={setPrescription}
              setIcd10Codes={setIcd10Codes}
            />
          </div>

          {/* Manual Add */}
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <ManualAddSection
              manualService={manualService}
              discountService={discountService}
              manualPrice={manualPrice}
              setManualService={setManualService}
              setDiscountService={setDiscountService}
              setManualPrice={setManualPrice}
              handleAddManual={handleAddManual}
            />
          </div>

          {/* Tariff Table */}
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <TariffGrid
              billingRows={billingRows}
              updateRow={updateRow}
              addRow={addRow}
              clearTable={clearTable}
              handleSave={handleSave}
              handleConvertQuote={handleConvertQuote}
              setTariffModalTargetRowId={setTariffModalTargetRowId}
              setShowTariffModal={setShowTariffModal}
              isQuoteMode={isQuoteMode}
            />
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
            <BillingSummary
              billingRows={billingRows}
              selectedClient={selectedClient}
              userData={userData}
              totalVAt={totalVAt}
              totalBilling={totalBilling}
              generateInvoice={generateInvoice}
            />
          </div>
        </div>
      </div>

      {/* === MODALS === */}
      {showClients && <ClientModal showClients={showClients} handleSelectClient={handleSelectClient} />}

      {showTariffModal && (
        <TariffWizardModal
          setShowTariffModal={setShowTariffModal}
          selectTariffToRow={selectTariffToRow}
        />
      )}

      {showDocument && (
        <DocumentModal
          type={isQuoteMode ? "quote" : "invoice"}
          show={showDocument}
          onClose={() => setShowDocument(false)}
          billingRows={billingRows}
          selectedClient={{ ...selectedClient, prescription }}
          userData={userData}
          totalVAt={totalVAt}
          totalBilling={totalBilling}
          icd10Codes={icd10Codes}
          className={isQuoteMode ? "max-w-4xl max-h-[85vh] overflow-y-auto" : ""}
        />
      )}

      {showRateModal && <RateModal show={showRateModal} onClose={() => setShowRateModal(false)} />}
      {showSalesModal && <SalesModal show={showSalesModal} onClose={() => setShowSalesModal(false)} />}
    </div>
  );
}
