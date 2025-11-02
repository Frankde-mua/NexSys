// modals/TariffWizardModal.jsx
import React from "react";

export default function TariffWizardModal({
  setShowTariffModal,
  setTariffModalTargetRowId,
  selectTariffToRow,
  DUMMY_TARIFFS,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg relative">
        <button
          onClick={() => { setShowTariffModal(false); setTariffModalTargetRowId(null); }}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-3">Tariff Wizard</h3>
        <p className="text-xs text-slate-500 mb-3">Click a tariff to insert into the row.</p>

        <table className="w-full text-sm border">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Code</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Fee</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_TARIFFS.map((t) => (
              <tr
                key={t.id}
                className="border-t hover:bg-slate-50 cursor-pointer"
                onClick={() => selectTariffToRow(t)}
              >
                <td className="p-2">{t.code}</td>
                <td className="p-2">{t.desc}</td>
                <td className="p-2">R{t.fee.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => { setShowTariffModal(false); setTariffModalTargetRowId(null); }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
