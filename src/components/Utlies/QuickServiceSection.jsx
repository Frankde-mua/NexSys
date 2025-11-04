import React, { useState } from "react";

export default function QuickServiceSection({ BILLING_SERVICES, billingRows, setBillingRows }) {
  const [visibleServices, setVisibleServices] = useState(BILLING_SERVICES.slice(0, 6));
  const [selectedServices, setSelectedServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [newService, setNewService] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // 🔹 Select or deselect a service (LEFT CLICK)
  const handleSelectService = (service) => {
    const alreadySelected = selectedServices.find((s) => s.id === service.id);

    if (alreadySelected) {
      // Deselect service
      setSelectedServices((prev) => prev.filter((s) => s.id !== service.id));
      setBillingRows((prev) =>
        prev.map((r) =>
          r.tariff === service.name ? { ...r, tariff: "", tariffCode: "", fee: 0 } : r
        )
      );
    } else {
      // Select service
      setSelectedServices((prev) => {
        if (prev.length >= 6) return [...prev.slice(1), service]; // keep only 6
        return [...prev, service];
      });

      // Update billing rows
      let updated = false;
      setBillingRows((prev) => {
        const newRows = prev.map((r) => {
          if (!updated && (!r.tariff || r.tariff.trim() === "")) {
            updated = true;
            return {
              ...r,
              tariff: service.name,
              tariffCode: service.code || "—",
              fee: service.price || 0,
              discount: service.discount || 0,
              qty: 1,
            };
          }
          return r;
        });

        if (!updated) {
          newRows.push({
            id: Date.now(),
            tariff: service.name,
            tariffCode: service.code || "—",
            fee: service.price || 0,
            discount: service.discount || 0,
            qty: 1,
          });
        }

        return newRows;
      });
    }
  };

  // 🔹 Right-click (open modal)
  const handleRightClick = (e, service) => {
    e.preventDefault();
    setServiceToEdit(service);
    setModalOpen(true);
  };

  // 🔹 Request confirmation if the old service is already used
  const handleUpdateRequest = () => {
    const updated = BILLING_SERVICES.find((s) => s.id.toString() === newService);
    if (!updated) return;

    const isUsed = billingRows.some((r) => r.tariff === serviceToEdit.name);
    if (isUsed) {
      setShowConfirm(true);
    } else {
      applyServiceUpdate(updated);
    }
  };

  // 🔹 Confirm replacement
  const handleConfirmReplace = () => {
    const updated = BILLING_SERVICES.find((s) => s.id.toString() === newService);
    if (updated) applyServiceUpdate(updated);
    setShowConfirm(false);
  };

  // 🔹 Apply the actual replacement
  const applyServiceUpdate = (updated) => {
    setVisibleServices((prev) =>
      prev.map((s) => (s.id === serviceToEdit.id ? updated : s))
    );

    setSelectedServices((prev) =>
      prev.map((s) => (s.id === serviceToEdit.id ? updated : s))
    );

    setBillingRows((prev) =>
      prev.map((r) =>
        r.tariff === serviceToEdit.name
          ? {
              ...r,
              tariff: updated.name,
              tariffCode: updated.code,
              fee: updated.price,
            }
          : r
      )
    );

    setModalOpen(false);
    setServiceToEdit(null);
    setNewService("");
  };

  const handleChangeVisible = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, (opt) => opt.value);
    const selected = BILLING_SERVICES.filter((s) => selectedIds.includes(s.id.toString()));
    setVisibleServices(selected.slice(0, 6));
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Quick Services</h2>
      </div>

      {/* Quick service buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {visibleServices.map((service) => {
          const isSelected = selectedServices.some((s) => s.id === service.id);
          return (
            <button
              key={service.id}
              onClick={() => handleSelectService(service)}
              onContextMenu={(e) => handleRightClick(e, service)}
              className={`p-3 border rounded-xl text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "bg-gray-50 hover:bg-blue-50 border-gray-300 text-gray-800"
              }`}
            >
              {service.name}
            </button>
          );
        })}
      </div>

      {/* 🔹 Modal for updating service */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Update Quick Service</h3>

            <select
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="w-full border rounded-md px-2 py-1 mb-4 text-sm"
            >
              <option value="">Select new service</option>
              {BILLING_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1 text-sm border rounded-md text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRequest}
                disabled={!newService}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Replace existing service?
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              The service <strong>{serviceToEdit?.name}</strong> is currently used in billing.
              Replacing it will update all related rows.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 text-sm border rounded-md text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReplace}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md"
              >
                Confirm Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
