import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AuditTrail = () => <div>Audit Trail Content</div>;
const FramesMonthToDate = () => <div>Frames Month To Date Content</div>;
const GeneralReports = () => <div>General Reports Content</div>;
const GoodsReceived = () => <div>Goods Received / Returned Listing Content</div>;
const GrossProfit = () => <div>Gross Profit Content</div>;
const JobCost = () => <div>Job Cost Content</div>;
const ProductSalesReport = () => <div>Product Sales Report Content</div>;
const Reorder = () => <div>Reorder Content</div>;
const TagReport = () => <div>Tag Report Content</div>;
const StockOrderReport = () => <div>Stock Order Report Content</div>;
const StockUsageReport = () => <div>Stock Usage Report Content</div>;

const REPORTS = {
  "Audit Trail": AuditTrail,
  "Frames Month To Date": FramesMonthToDate,
  "General Reports": GeneralReports,
  "Goods Received/Returned Listing": GoodsReceived,
  "Gross Profit": GrossProfit,
  "Product Sales Report": ProductSalesReport,
  "Reorder": Reorder,
  "Tag Report": TagReport,
  "Stock Order Report": StockOrderReport,
  "Stock Usage Report": StockUsageReport,
};

const StockReportsMenu = () => {
  const [modalOpen, setModalOpen] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="bg-white border px-3 py-1 text-slate-600 rounded shadow-sm hover:bg-gray-100"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        Reports
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            className="absolute left-0 mt-2 w-64 bg-white shadow-lg rounded overflow-hidden z-50 border"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {Object.keys(REPORTS).map((report) => (
              <li
                key={report}
                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                onClick={() => {
                  setModalOpen(report);
                  setMenuOpen(false);
                }}
              >
                {report}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Modal for report content */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-3xl max-h-[90vh] overflow-auto relative">
              <button
                onClick={() => setModalOpen(null)}
                className="absolute top-4 right-6 text-gray-600 text-lg hover:text-black"
              >
                ✖
              </button>
              <h2 className="text-2xl font-semibold mb-4">{modalOpen}</h2>
              {modalOpen && React.createElement(REPORTS[modalOpen])}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockReportsMenu;
