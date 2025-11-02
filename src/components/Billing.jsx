import React, { useState } from "react";
import FinancialEnquiries from "./Utlies/Enquiries";
import Payment from "./Utlies/Payment";
import Invoice from "./Utlies/Invoice";
import Quote from "./Utlies/Quote"
import CreditNote from "./Utlies/CreditNote";
import ETransact from "./Utlies/ETransact";

const SemiNavbar = () => {
  const tabs = [ "Invoice", "Payment", "Credit Note", "Enquiries", "Quote", "E-Transact"];
  const [activeTab, setActiveTab] = useState("Invoice");

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

  const handleSave = () => {
    console.log("Saving billing data:", billingRows);
    alert("Billing data saved successfully!");
  };

  const handleConvertQuote = () => {
    alert("Quote converted successfully!");
  };

  // ========== TOTALS ==========
  const totalBilling = billingRows.reduce((sum, r) => {
    const discountAmount = (r.fee * (Number(r.discount || 0))) / 100;
    const discountedPrice = r.fee - discountAmount;
    return sum + discountedPrice * (r.qty || 1);
  }, 0);

  const totalVAt = totalBilling * 0.15; // 15% VAT

  // ========== EFFECTS ==========
  useEffect(() => {
    const savedData = localStorage.getItem("userData");
    if (savedData) setUserData(JSON.parse(savedData));
  }, []);

  // ========== RENDER ==========
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="text-sm text-slate-600">Financial works.</p>
        </div>
        </header>
    <nav className=" px-3 py-1 rounded-xl shadow-sm w-full max-w-full overflow-x-auto">
      <ul className="flex space-x-4">
        {tabs.map((tab, idx) => (
          <li key={tab} className="flex items-center">
            <button
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium transition px-2 py-1 rounded-md ${
                activeTab === tab
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab}
            </button>
            {/* Add separator except for last item */}
            {idx < tabs.length - 1 && (
              <span className="text-gray-400 mx-2">{"\\"}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
    <div className="mt-6">
    {activeTab === "Invoice" && <Invoice />}
    {activeTab === "Payment" && <Payment />}
    {activeTab === "Enquiries" && <FinancialEnquiries />}
    {activeTab === "E-Transact" && <ETransact />}
    {activeTab === "Quote" && <Quote />}
    {activeTab === "Credit Note" && <CreditNote />}
    </div>
    </div>
  );
};

export default SemiNavbar;
