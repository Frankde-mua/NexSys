import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";

const FinancialEnquiries = () => {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [activeTab, setActiveTab] = useState("current");

  // 🧾 Sample transactions
  const [transactions] = useState([
    {
      date: "2025-10-10",
      service: "CONS001",
      user: "Dr. Smith",
      client: "John Doe",
      narrative: "Eye Examination",
      debit: 950.0,
      credit: 0.0,
      balance: 950.0,
    },
    {
      date: "2025-10-12",
      service: "LENS002",
      user: "Dr. Smith",
      client: "John Doe",
      narrative: "Contact Lens Fitting",
      debit: 580.0,
      credit: 0.0,
      balance: 1530.0,
    },
    {
      date: "2025-10-15",
      service: "FRM003",
      user: "Dr. Brown",
      client: "John Doe",
      narrative: "Spectacle Frame Purchase",
      debit: 799.99,
      credit: 0.0,
      balance: 2329.99,
    },
    {
      date: "2025-10-16",
      service: "PAY001",
      user: "Admin",
      client: "John Doe",
      narrative: "Payment received (EFT)",
      debit: 0.0,
      credit: 1000.0,
      balance: 1329.99,
    },
    {
      date: "2025-10-20",
      service: "CHK004",
      user: "Dr. Smith",
      client: "John Doe",
      narrative: "Follow-up Checkup",
      debit: 650.0,
      credit: 0.0,
      balance: 1979.99,
    },
  ]);

  // 🧮 Auto-calculate summary
  const summary = useMemo(() => {
    const totalDebits = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalCredits = transactions.reduce(
      (sum, t) => sum + (t.credit || 0),
      0
    );
    const outstanding = totalDebits - totalCredits;

    const debitDates = transactions
      .filter((t) => t.debit > 0)
      .map((t) => new Date(t.date));
    const creditDates = transactions
      .filter((t) => t.credit > 0)
      .map((t) => new Date(t.date));

    const lastDebitDate =
      debitDates.length > 0
        ? new Date(Math.max(...debitDates)).toLocaleDateString()
        : "-";
    const lastCreditDate =
      creditDates.length > 0
        ? new Date(Math.max(...creditDates)).toLocaleDateString()
        : "-";

    const today = new Date();
    const ageing = {
      current: 0,
      older30: 0,
      older60: 0,
      older90: 0,
      older120: 0,
      older150: 0,
    };

    transactions.forEach((t) => {
      const diffDays =
        (today - new Date(t.date)) / (1000 * 60 * 60 * 24); // days difference
      const balance = t.debit - t.credit;

      if (balance > 0) {
        if (diffDays <= 30) ageing.current += balance;
        else if (diffDays <= 60) ageing.older30 += balance;
        else if (diffDays <= 90) ageing.older60 += balance;
        else if (diffDays <= 120) ageing.older90 += balance;
        else if (diffDays <= 150) ageing.older120 += balance;
        else ageing.older150 += balance;
      }
    });

    return {
      totalDebits,
      totalCredits,
      outstanding,
      lastDebitDate,
      lastCreditDate,
      clientLiable: outstanding,
      companyLiable: 0,
      ...ageing,
    };
  }, [transactions]);

  // 📥 Download Excel
  const handleDownloadExcel = () => {
    const data = transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Service: t.service,
      User: t.user,
      Client: t.client,
      Narrative: t.narrative,
      Debit: t.debit,
      Credit: t.credit,
      Balance: t.balance,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Financial_Transactions.xlsx");
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-slate-700">
          💼 Enquiries
        </h2>

        {/* Download Button */}
        <button
          onClick={handleDownloadExcel}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          ⬇️ Export XLSX
        </button>
      </div>

      {/* Header Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Left Info */}
        <div className="space-y-2">
          <div>
            <label className="text-sm text-gray-600">Account Number</label>
            <input
              type="text"
              value={selectedCustomer ? "ACC-102398" : ""}
              readOnly
              className="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-50 text-gray-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Customer</option>
              <option value="John Doe">John Doe</option>
              <option value="Sarah Smith">Sarah Smith</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Account Address</label>
            <input
              type="text"
              value={
                selectedCustomer
                  ? "219B Gloxinia Street, Centurion, Pretoria"
                  : ""
              }
              readOnly
              className="border border-gray-200 bg-gray-50 rounded-md px-3 py-2 w-full text-gray-700"
            />
          </div>
        </div>

        {/* Right Side Summaries */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Debits / Credits Summary */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-700 mb-2">
              📋 Account Summary
            </h4>
            <div className="grid grid-cols-2 text-sm gap-y-1">
              <span className="text-gray-600">Debits To Date:</span>
              <span className="text-gray-800 font-medium">
                R {summary.totalDebits.toFixed(2)}
              </span>
              <span className="text-gray-600">Credits To Date:</span>
              <span className="text-gray-800 font-medium">
                R {summary.totalCredits.toFixed(2)}
              </span>
              <span className="text-gray-600">Last Debit Date:</span>
              <span className="text-gray-800 font-medium">
                {summary.lastDebitDate}
              </span>
              <span className="text-gray-600">Last Credit Date:</span>
              <span className="text-gray-800 font-medium">
                {summary.lastCreditDate}
              </span>
              <span className="text-gray-600">Client Liable:</span>
              <span className="text-gray-800 font-medium">
                R {summary.clientLiable.toFixed(2)}
              </span>
              <span className="text-gray-600">Company Liable:</span>
              <span className="text-gray-800 font-medium">
                R {summary.companyLiable.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Ageing Summary */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-700 mb-2">
              📊 Ageing Summary
            </h4>
            <div className="grid grid-cols-2 text-sm gap-y-1">
              <span className="text-gray-600">Current:</span>
              <span className="text-gray-800 font-medium">
                R {summary.current.toFixed(2)}
              </span>
              <span className="text-gray-600">30 Days:</span>
              <span className="text-gray-800 font-medium">
                R {summary.older30.toFixed(2)}
              </span>
              <span className="text-gray-600">60 Days:</span>
              <span className="text-gray-800 font-medium">
                R {summary.older60.toFixed(2)}
              </span>
              <span className="text-gray-600">90 Days:</span>
              <span className="text-gray-800 font-medium">
                R {summary.older90.toFixed(2)}
              </span>
              <span className="text-gray-600">120 Days:</span>
              <span className="text-gray-800 font-medium">
                R {summary.older120.toFixed(2)}
              </span>
              <span className="text-gray-600">150 Days:</span>
              <span className="text-gray-800 font-medium">
                R {summary.older150.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 flex space-x-4">
        {["current", "all", "summary"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab === "current"
              ? "Current Transactions"
              : tab === "all"
              ? "All Transactions"
              : "Summary"}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      {(activeTab === "current" || activeTab === "all") && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-2 px-3 border-b">Date</th>
                <th className="py-2 px-3 border-b">Service</th>
                <th className="py-2 px-3 border-b">User</th>
                <th className="py-2 px-3 border-b">Client</th>
                <th className="py-2 px-3 border-b">Narrative</th>
                <th className="py-2 px-3 border-b text-right">Debit (R)</th>
                <th className="py-2 px-3 border-b text-right">Credit (R)</th>
                <th className="py-2 px-3 border-b text-right">Balance (R)</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center text-gray-500 py-4 italic"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 px-3 border-b">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 border-b">{t.service}</td>
                    <td className="py-2 px-3 border-b">{t.user}</td>
                    <td className="py-2 px-3 border-b">{t.client}</td>
                    <td className="py-2 px-3 border-b">{t.narrative}</td>
                    <td className="py-2 px-3 border-b text-right">
                      {t.debit ? t.debit.toFixed(2) : ""}
                    </td>
                    <td className="py-2 px-3 border-b text-right">
                      {t.credit ? t.credit.toFixed(2) : ""}
                    </td>
                    <td className="py-2 px-3 border-b text-right">
                      {t.balance.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FinancialEnquiries;
