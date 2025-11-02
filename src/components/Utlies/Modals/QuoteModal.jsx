import React, { useState, useEffect } from "react";

const QuoteModal = ({ quote, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    description: "",
    amount: "",
    status: "Pending",
  });

  useEffect(() => {
    if (quote) setFormData(quote);
  }, [quote]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4">
          {quote ? "Edit Quote" : "New Quote"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="customerName"
            placeholder="Customer Name"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount (R)"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="Pending">Pending</option>
            <option value="Converted">Converted</option>
          </select>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {quote ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteModal;
