import React, { useState } from "react";

const Payment = () => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    method: "",
    reference: "",
    notes: "",
  });

  const [payments, setPayments] = useState([
    {
      date: "2025-10-25",
      amount: 750.0,
      method: "EFT",
      reference: "INV-1023",
      notes: "Invoice 1023",
    },
    {
      date: "2025-10-20",
      amount: 1200.0,
      method: "Card",
      reference: "INV-1018",
      notes: "Invoice 1018",
    },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.method) {
      alert("Please fill in the required fields.");
      return;
    }

    const newPayment = { ...form, amount: parseFloat(form.amount) };
    setPayments([newPayment, ...payments]);
    setForm({
      date: new Date().toISOString().split("T")[0],
      amount: "",
      method: "",
      reference: "",
      notes: "",
    });
    alert("✅ Payment recorded successfully!");
  };

  return (
    <div>
    <div className="p-6 bg-white rounded-2xl shadow-sm mx-auto">
      <h2 className="text-xl font-semibold text-slate-700 mb-4">💳 Payments</h2>

      {/* Payment Form */}
      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-4 gap-4 border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Amount (R)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Method
          </label>
          <select
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Method</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="EFT">EFT</option>
            <option value="Medical Aid">Medical Aid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Reference
          </label>
          <input
            type="text"
            placeholder="INV-XXXX"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Notes
          </label>
          <textarea
            rows={2}
            placeholder="Optional notes..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            Record Payment
          </button>
        </div>
      </form>

      {/* Payment History Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3 border-b">Date</th>
              <th className="py-2 px-3 border-b">Amount (R)</th>
              <th className="py-2 px-3 border-b">Method</th>
              <th className="py-2 px-3 border-b">Reference</th>
              <th className="py-2 px-3 border-b">Notes</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-gray-500 py-4 italic"
                >
                  No payments recorded yet.
                </td>
              </tr>
            ) : (
              payments.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2 px-3 border-b">
                    {new Date(p.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 border-b">R {p.amount.toFixed(2)}</td>
                  <td className="py-2 px-3 border-b">{p.method}</td>
                  <td className="py-2 px-3 border-b">{p.reference}</td>
                  <td className="py-2 px-3 border-b">{p.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};

export default Payment;
