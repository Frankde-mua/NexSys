// sections/TariffGrid.jsx
import React from "react";

export default function TariffGrid({
  billingRows,
  updateRow,
  addRow,
  clearTable,
  handleSave,
  handleConvertQuote,
  setTariffModalTargetRowId,
  setShowTariffModal,
}) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm">
            Save
          </button>
          <button onClick={() => addRow()} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
            Add Row
          </button>
          <button onClick={clearTable} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
            Clear Table
          </button>
          <button
            onClick={() => { setTariffModalTargetRowId(null); setShowTariffModal(true); }}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Tariff Wizard
          </button>
          <button onClick={handleConvertQuote} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
            Convert Quote
          </button>
        </div>

        <div className="text-sm text-slate-600">Rows: {billingRows.length}</div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border table-fixed">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-2 text-left w-[90px]">Code</th>
              <th className="p-2 text-left">Tariff</th>
              <th className="p-2 text-left">Stock</th>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">Narrative</th>
              <th className="p-2 text-left">Discount</th>
              <th className="p-2 text-left">Fee</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Lens</th>
              <th className="p-2 text-left">Barcode</th>
            </tr>
          </thead>

          <tbody>
            {billingRows.map((r, i) => {
              const discountAmount = (Number(r.fee || 0) * (Number(r.discount || 0) || 0)) / 100;
              const rowTotal = (Number(r.fee || 0) - discountAmount) * (Number(r.qty || 1) || 1);

              return (
                <tr key={r.id} className="border-t">
                  {/* Code column */}
                  <td className="p-2 w-[90px]">
                    <input
                      type="text"
                      maxLength="6"
                      value={r.code || ""}
                      onChange={(e) => updateRow(r.id, { code: e.target.value.toUpperCase() })}
                      className="border rounded p-1 text-xs w-full text-center tracking-widest"
                      placeholder="CODE"
                    />
                  </td>

                  {/* Tariff column */}
                  <td className="p-2">
                    <div className="flex gap-2 items-center">
                      <button
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                        onClick={() => {
                          setTariffModalTargetRowId(r.id);
                          setShowTariffModal(true);
                        }}
                        title="Open Tariff Wizard"
                      >
                        ...
                      </button>
                      <input
                        type="text"
                        value={r.tariff}
                        onChange={(e) => updateRow(r.id, { tariff: e.target.value })}
                        className="border rounded p-1 text-xs w-full"
                      />
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="p-2">
                    <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm">...</button>
                  </td>

                  {/* Qty */}
                  <td className="p-2 w-16">
                    <input
                      type="number"
                      value={r.qty}
                      onChange={(e) => updateRow(r.id, { qty: Number(e.target.value || 1) })}
                      className="border rounded p-1 w-full text-xs"
                      min="1"
                    />
                  </td>

                  {/* Narrative */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={r.narrative}
                      onChange={(e) => updateRow(r.id, { narrative: e.target.value })}
                      className="border rounded p-1 text-xs w-full"
                      placeholder="Narrative"
                    />
                  </td>

                  {/* Discount */}
                  <td className="p-2">
                    <input
                      type="number"
                      value={r.discount}
                      onChange={(e) => updateRow(r.id, { discount: Number(e.target.value || 0) })}
                      className="border rounded p-1 text-xs w-full"
                      min="0"
                    />
                  </td>

                  {/* Fee */}
                  <td className="p-2">
                    <input
                      type="number"
                      value={r.fee}
                      onChange={(e) => updateRow(r.id, { fee: Number(e.target.value || 0) })}
                      className="border rounded p-1 text-xs w-full"
                      min="0"
                    />
                  </td>

                  {/* Total */}
                  <td className="p-2 text-right">R{rowTotal.toFixed(2)}</td>

                  {/* Lens */}
                  <td className="p-2">
                    <select
                      className="border rounded p-1 text-xs w-full"
                      value={r.lens}
                      onChange={(e) => updateRow(r.id, { lens: e.target.value })}
                    >
                      <option>None</option>
                      <option>Lens A</option>
                      <option>Lens B</option>
                    </select>
                  </td>

                  {/* Barcode */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={r.barcode}
                      onChange={(e) => updateRow(r.id, { barcode: e.target.value })}
                      className="border rounded p-1 text-xs w-full"
                      placeholder="Barcode"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
