import React, { useState } from "react";

export default function Profile({ user }) {
  const [form, setForm] = useState(user);
  console.log("Profile user data:", user);
  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(form));
    alert("Profile updated successfully!");
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-600">Manage your profile information.</p>
      </header>

      <div className="p-6 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Company</label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
