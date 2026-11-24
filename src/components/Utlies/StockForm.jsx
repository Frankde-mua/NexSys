import React, { useState } from "react";

export default function StockForm() {
    const [form, setForm] = useState({
        name: "",
        price: "",
        qtyOrdered: "",
        dateReceived: "",
        supplier: "",
        sale: false,
        amountSold: "",
        lastSaleDate: "",
        amountRemain: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(form);
        alert("Stock data submitted successfully!");
    };

    return (
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Stock Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter stock name"
                        required
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Price
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter price"
                        required
                    />
                </div>

                {/* Quantity Ordered */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Quantity Ordered
                    </label>
                    <input
                        type="number"
                        name="qtyOrdered"
                        value={form.qtyOrdered}
                        onChange={handleChange}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter quantity ordered"
                        required
                    />
                </div>

                {/* Status */}
                <div className="mb-4">
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue="Received"
                    >
                        <option value="Received">Received</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Not Received">Not Received</option>
                    </select>
                </div>

                {/* Date Received */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Date Received
                    </label>
                    <input
                        type="date"
                        name="dateReceived"
                        value={form.dateReceived}
                        onChange={handleChange}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>

                {/* Supplier */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Supplier
                    </label>
                    <input
                        type="text"
                        name="supplier"
                        value={form.supplier}
                        onChange={handleChange}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter supplier name"
                        required
                    />
                </div>

                {/* Sale Checkbox */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="sale"
                        checked={form.sale}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">
                        Was there a sale?
                    </label>
                </div>

                {/* Conditional Sale Section */}
                {form.sale && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4 transition-all duration-300">
                        <h3 className="text-md font-semibold text-gray-800 mb-2">
                            Sale Details
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Amount Sold
                            </label>
                            <input
                                type="number"
                                name="amountSold"
                                value={form.amountSold}
                                onChange={handleChange}
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter amount sold"
                                required={form.sale}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Last Sale Date
                            </label>
                            <input
                                type="date"
                                name="lastSaleDate"
                                value={form.lastSaleDate}
                                onChange={handleChange}
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                required={form.sale}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Amount Remaining
                            </label>
                            <input
                                type="number"
                                name="amountRemain"
                                value={form.amountRemain}
                                onChange={handleChange}
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter remaining amount"
                                required={form.sale}
                            />
                        </div>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}
