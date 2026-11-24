import React, { useEffect, useState } from "react";
import axios from "axios";
import.meta.env.VITE_API_URL

export default function SuperAdminDashboard() {
  const [data, setData] = useState({ companies: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", company: "" });
  const creatorUsername = JSON.parse(localStorage.getItem("user")).username;

  const fetchData = async () => {
    try {
      const usersRes = await axios.get(
        /*"https://franklin-unsprinkled-corrie.ngrok-free.dev/api/superadmin/users",
         {headers: { "ngrok-skip-browser-warning": "true" }}*/
         `${import.meta.env.VITE_API_URL}/api/superadmin/users`,
      );
      const companiesRes = await axios.get(
        /*"https://franklin-unsprinkled-corrie.ngrok-free.dev/api/superadmin/companies",
        {headers: { "ngrok-skip-browser-warning": "true" }}*/
         `${import.meta.env.VITE_API_URL}/api/superadmin/companies`,
      );
      // ✅ Update the single 'data' state
      setData({
        users: usersRes.data || [],
        companies: companiesRes.data || [],
      });
      console.log("Users:", usersRes.data);
      console.log("here before company")
      console.log("Companies:", companiesRes.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password || !newUser.company)
      return alert("All fields required");

    try {
      const res = await axios.post(
        //"https://franklin-unsprinkled-corrie.ngrok-free.dev/api/create-user",
        `${import.meta.env.VITE_API_URL}/api/create-user`,
        { ...newUser, creatorUsername }
      );
      alert(res.data.message);
      setNewUser({ username: "", email: "", password: "", company: "" });
      fetchData(); // ✅ Refresh list after creating user
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  if (loading) return <p>Loading Superadmin Dashboard...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Superadmin Dashboard</h1>

      {/* Companies */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Companies</h2>
        <ul className="list-disc ml-6">
          {Array.isArray(data.companies) && data.companies.map((c) => (
            <li key={c.id}>{c.company_name}</li>
            ))}
        </ul>
      </section>

      {/* Users */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Users</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Username</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Company</th>
              <th className="border px-2 py-1">Role</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data.users) && data.users.map((u) => (
                <tr key={u.id}>
                    <td className="border px-2 py-1">{u.username}</td>
                    <td className="border px-2 py-1">{u.email}</td>
                    <td className="border px-2 py-1">{u.company_name}</td>
                    <td className="border px-2 py-1">{u.role}</td>
                </tr>
                ))}
          </tbody>
        </table>
      </section>

      {/* Create New User */}
      <section className="mt-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-medium mb-2">Create New User</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Username"
            className="border p-2 rounded"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <input
            type="text"
            placeholder="Company"
            className="border p-2 rounded"
            value={newUser.company}
            onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
          />
          <button
            onClick={handleCreateUser}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create User
          </button>
        </div>
      </section>
    </div>
  );
}
