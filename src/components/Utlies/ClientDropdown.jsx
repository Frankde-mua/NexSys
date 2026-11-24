import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import { getCompanyName } from "./Helpers/HelperFunctions";

export default function ClientDropdown({ onSelectClient }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({ name: "", surname: "" });
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---- getting company name  -----
  const companyName = getCompanyName();

  // Search clients by name/surname
  const handleSearch = async () => {
    if (!filters.name && !filters.surname) return alert("Enter name or surname");
    console.log("Searching for:", filters.name, filters.surname);
    setLoading(true);

    try {
      console.log("Searching clients for company:", companyName); // last thing that gets logged
      const res = await axios.get(
        `http://localhost:5000/api/search-clients/${companyName}`,
        { params: { name: filters.name, surname: filters.surname } }
      );
      if (res.data.success){ setClients(res.data.clients);
        console.log("after setting data");
        console.log(res.data.clients);
      }
      else setClients([]);
    } catch (err) {
      console.error("Search error:", err);
      alert("Failed to search clients");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative mb-4">
      <label className="block text-sm mb-1">Client</label>
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="w-full border rounded px-2 py-1 text-sm flex justify-between items-center"
      >
        {selectedClient ? `${selectedClient.name} ${selectedClient.surname}` : "Select client"}
        <span className="ml-2">▾</span>
      </button>

      {showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg p-3"
        >
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Name"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="w-1/2 border rounded px-2 py-1 text-sm"
            />
            <input
              type="text"
              placeholder="Surname"
              value={filters.surname}
              onChange={(e) => setFilters({ ...filters, surname: e.target.value })}
              className="w-1/2 border rounded px-2 py-1 text-sm"
            />
          </div>

          <button
            onClick={handleSearch}
            className="w-full mb-2 px-2 py-1 text-sm rounded bg-indigo-500 text-white hover:bg-indigo-600"
          >
            {loading ? "Searching..." : "Go"}
          </button>

          <div className="max-h-40 overflow-y-auto text-sm">
            {clients.length > 0 ? (
              clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    onSelectClient(client);
                    setSelectedClient(client);
                    setShowDropdown(false);
                  }}
                  className="px-2 py-1 hover:bg-slate-100 cursor-pointer rounded"
                >
                  {client.name} {client.surname}
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-center text-xs py-2">
                No results
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
