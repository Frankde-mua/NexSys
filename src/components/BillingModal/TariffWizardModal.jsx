import React, { useEffect, useState, useMemo } from "react";
import { getAllTariffs } from "../Utlies/Helpers/HelperFunctions";

export default function TariffWizardModal({
  setShowTariffModal,
  setTariffModalTargetRowId,
  selectTariffToRow,
}) {
  const [tariffs, setTariffs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newTariff, setNewTariff] = useState({
    code: "",
    description: "",
    category: "",
    standard_fee: "",
  });

  const loadTariffs = async () => {
    setLoading(true);
    try {
      const { tariffs, pagination } = await getAllTariffs(page, 15);
      setTariffs(tariffs);
      setPagination(pagination);
    } catch (err) {
      console.error("Error loading tariffs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTariffs();
  }, [page]);

  const handleClose = () => {
    setShowTariffModal(false);
    setTariffModalTargetRowId(null);
  };

  const handleCreateTariff = async () => {
    if (!newTariff.code || !newTariff.description) return;
    setCreating(true);
    try {
      await createTariff(newTariff);
      await loadTariffs();
      setShowCreateModal(false);
      setNewTariff({ code: "", description: "", category: "", standard_fee: "" });
    } catch (err) {
      console.error("Error creating tariff:", err);
    } finally {
      setCreating(false);
    }
  };

  const filteredTariffs = useMemo(() => {
    if (!searchTerm.trim()) return tariffs;
    const lower = searchTerm.toLowerCase();
    return tariffs.filter(
      (t) =>
        t.code?.toLowerCase().includes(lower) ||
        t.description?.toLowerCase().includes(lower) ||
        t.category?.toLowerCase().includes(lower)
    );
  }, [tariffs, searchTerm]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-md shadow-xl relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>

        <h3 className="text-base font-semibold mb-2">Tariff Wizard</h3>
        <p className="text-xs text-slate-500 mb-3">
          Click a tariff to insert into the row.
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search tariffs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          className="w-full border rounded-lg p-1.5 text-sm mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-50"
        />

        {/* Table */}
        <div className="overflow-y-auto max-h-[300px] border rounded flex items-center justify-center">
          {loading ? (
            <p className="text-gray-500 text-sm py-6 italic">
              Fetching tariff codes...
            </p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="p-1.5 text-left w-20">Code</th>
                  <th className="p-1.5 text-left">Description</th>
                  <th className="p-1.5 text-left w-20">Fee</th>
                </tr>
              </thead>
              <tbody>
                {filteredTariffs.length > 0 ? (
                  filteredTariffs.map((t) => (
                    <tr
                      key={t.id}
                      className="border-t hover:bg-slate-50 cursor-pointer"
                      onClick={() => selectTariffToRow(t)}
                    >
                      <td className="p-1.5">{t.code}</td>
                      <td className="p-1.5">{t.description}</td>
                      <td className="p-1.5 text-right">
                        R{Number(t.standard_fee).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center text-gray-400 p-3 italic"
                    >
                      No tariffs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination + Create Button */}
        {!loading && (
          <div className="mt-3 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
                className={`px-3 py-1 rounded text-sm ${
                  pagination.hasPrevPage
                    ? "bg-gray-200 hover:bg-gray-300"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Prev
              </button>

              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className={`px-3 py-1 rounded text-sm ${
                  pagination.hasNextPage
                    ? "bg-gray-200 hover:bg-gray-300"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600"
            >
              + New Tariff
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Create Tariff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-xl relative">
            <h4 className="text-base font-semibold mb-3">Create New Tariff</h4>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Code"
                value={newTariff.code}
                onChange={(e) =>
                  setNewTariff({ ...newTariff, code: e.target.value })
                }
                className="border rounded p-1.5 text-sm"
              />
              <input
                type="text"
                placeholder="Description"
                value={newTariff.description}
                onChange={(e) =>
                  setNewTariff({ ...newTariff, description: e.target.value })
                }
                className="border rounded p-1.5 text-sm"
              />
              <input
                type="text"
                placeholder="Category"
                value={newTariff.category}
                onChange={(e) =>
                  setNewTariff({ ...newTariff, category: e.target.value })
                }
                className="border rounded p-1.5 text-sm"
              />
              <input
                type="number"
                placeholder="Fee"
                value={newTariff.standard_fee}
                onChange={(e) =>
                  setNewTariff({
                    ...newTariff,
                    standard_fee: e.target.value,
                  })
                }
                className="border rounded p-1.5 text-sm"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 bg-gray-200 rounded text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                disabled={creating}
                onClick={handleCreateTariff}
                className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                {creating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
