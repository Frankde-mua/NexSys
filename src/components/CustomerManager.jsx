import React, { useEffect, useState } from "react";

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name"); // default sort
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchCustomers = async () => {
    const res = await fetch("http://localhost:3001/customers");
    const data = await res.json();
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddOrUpdate = async () => {
    if (!name || !email) return alert("Fill in all fields");

    if (editingId) {
      await fetch(`http://localhost:3001/customers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      setEditingId(null);
    } else {
      await fetch("http://localhost:3001/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
    }

    setName("");
    setEmail("");
    fetchCustomers();
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setName(customer.name);
    setEmail(customer.email);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    await fetch(`http://localhost:3001/customers/${id}`, { method: "DELETE" });
    fetchCustomers();
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filteredCustomers = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey].toLowerCase();
      const bVal = b[sortKey].toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Customer Manager</h2>

      {/* Add / Update Form */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={handleAddOrUpdate}
          className="bg-indigo-600 text-white px-3 py-1 rounded"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* Search */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      {/* Customers Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th
              onClick={() => handleSort("name")}
              className="border px-2 py-1 cursor-pointer"
            >
              Name {sortKey === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>
            <th
              onClick={() => handleSort("email")}
              className="border px-2 py-1 cursor-pointer"
            >
              Email {sortKey === "email" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((c) => (
            <tr key={c.id}>
              <td className="border px-2 py-1">{c.name}</td>
              <td className="border px-2 py-1">{c.email}</td>
              <td className="border px-2 py-1 flex gap-1">
                <button
                  onClick={() => handleEdit(c)}
                  className="bg-yellow-400 px-2 py-0.5 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="bg-red-500 text-white px-2 py-0.5 rounded text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredCustomers.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center py-2 text-slate-500">
                No customers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
