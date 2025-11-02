import React, { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import Loader from "./Utlies/Loader";
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  ValidationModule,
} from "ag-grid-community";
import { RowNumbersModule } from "ag-grid-enterprise";
import FinancialMenu from "./Utlies/FinancialMenu";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  AllCommunityModule,
  RowNumbersModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

const Expenditure = () => {
  const gridRef = useRef();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const saved = JSON.parse(localStorage.getItem("user"));
  const companyName = saved?.company_name?.toLowerCase();

  /* `https://franklin-unsprinkled-corrie.ngrok-free.dev/api - switched from remote server link to local
   host for faster reponse time. Tunnel response becomes slow as applicarions get bigger or the more
   the request/response data increases in size. */ 
   
  // --- Form state ---
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category_id: "",
    category_name: "",
    description: "",
    amount: "",
    vat_amount: "",
    receipt_no: "",
    scan: "",
  });

  // --- Fetch categories ---
  useEffect(() => {
    if (!companyName) return;
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `https://franklin-unsprinkled-corrie.ngrok-free.dev/api/expense-categories/${companyName}`,
          { headers: { "ngrok-skip-browser-warning": "true" } }
        );
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [companyName]);

  // --- Fetch expenditures ---
  const fetchExpenses = async () => {
    if (!companyName) return;
    try {
      const res = await axios.get(
        `https://franklin-unsprinkled-corrie.ngrok-free.dev/api/expenditures/${companyName}`
      );
      if (res.data.success){
        const dbExpenses = res.data.expenditures.map((e) => ({
          id: e.id,
          date: new Date(e.date).toISOString().slice(0, 10),
          supplier: e.supplier || "",
          category_name: e.category_name,
          description: e.description,
          amount: e.amount,
          payment_method: e.payment_method || "",
          receipt_no: e.receipt_no,
          scan: e.scan || "",
          notes: e.notes || "",
          vat_amount: e.vat_amount
        }));
        console.log(" here is your data from db", dbExpenses)
        setExpenses(dbExpenses);
      } 
    } catch (err) {
      console.error("Error fetching expenditures:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [companyName]);

  // --- Grid Columns ---
  const columnDefs = useMemo(
    () => [
      { field: "date", headerName: "Date", minWidth: 50 },
      { field: "supplier", headerName: "Supplier", minWidth: 50 },
      { field: "category_name", headerName: "Category", minWidth: 80 },
      { field: "description", headerName: "Description", minWidth: 80 },
      {
        field: "amount",
        headerName: "Amount",
        minWidth: 50,
        valueFormatter: (params) => `R${Number(params.value).toFixed(2)}`,
      },
      {
        field: "vat_amount",
        headerName: "VAT",
        minWidth: 50,
        valueFormatter: (params) => `R${Number(params.value || 0).toFixed(2)}`,
      },
      { field: "receipt_no", headerName: "Receipt No", minWidth: 60 },
      {
        field: "scan",
        headerName: "Scan",
        minWidth: 130,
        cellRenderer: (params) =>
          params.value ? (
            <a href={params.value} target="_blank" rel="noreferrer">
              View
            </a>
          ) : (
            "-"
          ),
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  // --- Add expense ---
  const handleAddExpense = async () => {
    setLoading(true);

    if (!form.category_id || !form.description || !form.amount) {
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const res = await axios.post(
        `https://franklin-unsprinkled-corrie.ngrok-free.dev/api/expenditures/${companyName}`,
        {
          ...form,
          amount: parseFloat(form.amount),
          vat_amount: form.vat_amount
            ? parseFloat(form.vat_amount)
            : (parseFloat(form.amount) * 15) / 100,
        }
      );

      if (res.data.success) {
        setExpenses((prev) => [res.data.expenditure, ...prev]);
        setForm({
          date: new Date().toISOString().slice(0, 10),
          category_id: "",
          category_name: "",
          description: "",
          amount: "",
          vat_amount: "",
          receipt_no: "",
          scan: "",
        });
      }
    } catch (err) {
      console.error("Error adding expense:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Export CSV ---
  const handleExport = () => {
    gridRef.current.api.exportDataAsCsv({ fileName: "expenses.csv" });
  };

  // --- Print ---
  const handlePrint = () => {
    const printContent = document.getElementById("expense-grid");
    const win = window.open("", "", "width=900,height=700");
    win.document.write(printContent.outerHTML);
    win.document.close();
    win.print();
  };

  return (
    <div>
      {/*Adding loader */}
        <Loader show={loading} label="Addig Expense.." style={{ fontSize: "0.875rem" }}/>
      
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Company Expenses</h1>
        <p className="text-sm text-slate-600">Record daily expenses.</p>
      </header>

     {/* Financiel Reporta */}
     <div className="hidden md:flex gap-4 text-sm text-slate-600 items-center pb-2">
          <FinancialMenu onSelect={(option) => {
            setLoading(true);
            setCurrentPage(option);
            setTimeout(() => setLoading(false), 500);
          }} />
        </div>

      {/* Add Expense Form */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: new Date(
      new Date(e.target.value).setDate(new Date(e.target.value).getDate() + 1)
    ) })}
          className="px-3 py-1 border rounded"
        />

        {/* ✅ Category (stores both ID + Name) */}
        <select
          value={form.category_id}
          onChange={(e) => {
            const selected = categories.find(
              (c) => c.id === parseInt(e.target.value)
            );
            setForm({
              ...form,
              category_id: selected?.id,
              category_name: selected?.category_name,
            });
          }}
          className="px-3 py-1 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.category_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="px-3 py-1 border rounded flex-1"
        />

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => {
            const amount = parseFloat(e.target.value);
            const vat_amount = (amount * 15) / 100;
            setForm({ ...form, amount, vat_amount });
          }}
          className="px-3 py-1 border rounded w-32"
        />

        <input
          type="number"
          placeholder="VAT"
          value={form.vat_amount}
          onChange={(e) =>
            setForm({ ...form, vat_amount: parseFloat(e.target.value) || 0 })
          }
          className="px-3 py-1 border rounded w-24"
        />

        <input
          type="text"
          placeholder="Receipt No"
          value={form.receipt_no}
          onChange={(e) => setForm({ ...form, receipt_no: e.target.value })}
          className="px-3 py-1 border rounded w-32"
        />

        <input
          type="text"
          placeholder="Scan URL"
          value={form.scan}
          onChange={(e) => setForm({ ...form, scan: e.target.value })}
          className="px-3 py-1 border rounded w-48"
        />

        <button
          onClick={handleAddExpense}
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          Add
        </button>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Export CSV
        </button>
        <button
          onClick={handlePrint}
          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          Print
        </button>
      </div>

      {/* Expense Table */}
      <div
        id="expense-grid"
        className="ag-theme-alpine"
        style={{ height: 400, width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={expenses}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
        />
      </div>
    </div>
  );
};

export default Expenditure;
