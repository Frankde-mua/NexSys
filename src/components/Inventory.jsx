import React, { useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { motion, AnimatePresence } from "framer-motion";
import { TopSaleList, LeastSales, OrderTracking } from "./Utlies/InventoryList";
import StockForm from "./Utlies/StockForm";
import StockReportsMenu from "./Utlies/StockReportsMenu";
import inventoryStock from "../data/inventory";

const InventoryGrid = ({ setLoading }) => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState(inventoryStock);
  const [modalOpen, setModalOpen] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const defaultColDef = useMemo(() => ({
    editable: true,
    filter: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
  }), []);

  const columnDefs = [
    { field: "name", minWidth: 150 },
    { field: "price", valueFormatter: (p) => `R${p.value.toLocaleString()}` },
    { field: "onHand" },
    { field: "dateReceived", valueFormatter: (p) => new Date(p.value).toLocaleDateString() },
    { field: "lastSale", valueFormatter: (p) => new Date(p.value).toLocaleDateString() },
    { field: "supplier" },
  ];

  const handleExport = () => gridRef.current.api.exportDataAsCsv({ fileName: "inventory.csv" });

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split("\n").filter(l => l.trim() !== "");
      const headers = lines[0].split(",");
      const data = lines.slice(1).map(line => {
        const values = line.split(",");
        let obj = {};
        headers.forEach((h, idx) => {
          if (h === "price" || h === "onHand") obj[h] = Number(values[idx]);
          else obj[h] = values[idx];
        });
        return obj;
      });
      setRowData(data);
    };
    reader.readAsText(file);
  };

  const handleAddClick = () => {
    setLoading(true);
    setTimeout(() => {
      setShowAddModal(true);
      setLoading(false);
    }, 1500);
  };

  const cards = [
    { title: "🔥 Top Sold Items", bg: "bg-green-300", component: <TopSaleList />, modal: "top" },
    { title: "🥈 Least Sold Items", bg: "bg-red-400", component: <LeastSales />, modal: "least" },
    { title: "🚚 Order Tracking", bg: "bg-slate-100", component: <OrderTracking />, modal: "order" },
  ];

  return (
    <div style={containerStyle} className="flex flex-col gap-6">

      {/* === TOP SECTION: Inventory Table + Buttons === */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <button onClick={handleExport} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
            Export CSV
          </button>
          <label className="bg-indigo-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-indigo-700">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </label>
          <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={handleAddClick}>
            Add
          </button>
          <button className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
            Print
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <div className="ag-theme-alpine" style={{ height: "300px", width: "100%" }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows
              rowNumbers
              headerHeight={35}
              rowHeight={30}
            />
          </div>
        </div>
      </div>

      {/* === BOTTOM SECTION: Three Cards === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className={`${card.bg} p-6 rounded-2xl shadow-sm cursor-pointer`}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}
            transition={{ type: "spring", stiffness: 120 }}
            onClick={() => setModalOpen(card.modal)}
          >
            <h4 className="text-2xl font-semibold">{card.title}</h4>
          </motion.div>
        ))}
      </div>

      {/* === Add Stock Modal === */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-lg overflow-y-auto p-6 relative">
              <h2 className="text-2xl font-bold mb-4 text-center">Add Stock</h2>
              <StockForm />
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Full Content Modal for Cards === */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 h-[90vh] overflow-auto relative">
              <button
                onClick={() => setModalOpen(null)}
                className="absolute top-4 right-6 text-gray-600 text-lg hover:text-black"
              >
                ✖
              </button>

              <h2 className="text-2xl font-semibold mb-4">
                {modalOpen === "top" && "🔥 Top Sold Items"}
                {modalOpen === "least" && "🥈 Least Sold Items"}
                {modalOpen === "order" && "🚚 Order Tracking"}
              </h2>

              {modalOpen === "top" && <TopSaleList />}
              {modalOpen === "least" && <LeastSales />}
              {modalOpen === "order" && <OrderTracking />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const renderInventory = ({ setLoading }) => (
  <div>
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-slate-600">Goods control and management.</p>
      </div>
    </header>
    <div className="flex flex-col gap-4 pb-4 pt-0">
    <StockReportsMenu />
    </div>
    <InventoryGrid setLoading={setLoading} />
  </div>
);

export default renderInventory;
