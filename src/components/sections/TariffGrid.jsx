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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm"
          >
            Save
          </button>
          <button
            onClick={() => addRow()}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Add Row
          </button>
          <button
            onClick={clearTable}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Clear Table
          </button>
          <button
            onClick={() => {
              setTariffModalTargetRowId(null);
              setShowTariffModal(true);
            }}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Tariff Wizard
          </button>
          <button
            onClick={handleConvertQuote}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Convert Quote
          </button>
        </div>

        <div className="text-sm text-slate-600">Rows: {billingRows.length}</div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[1300px] text-sm border table-fixed">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-2 text-left w-[80px]">Code</th>
              <th className="p-2 text-left w-[160px]">Tariff</th>
              <th className="p-2 text-left w-[160px]">Stock</th>
              <th className="p-2 text-left w-[20px]"></th>
              <th className="p-2 text-left w-[60px]">Qty</th>
              <th className="p-2 text-left w-[150px]">Narrative</th>
              <th className="p-2 text-left w-[70px]">Discount</th>
              <th className="p-2 text-left w-[100px]">Fee</th>
              <th className="p-2 text-left w-[80px]">P/Portion</th>
              <th className="p-2 text-left w-[80px]">M/Portion</th>
              <th className="p-2 text-left w-[100px]">Total</th>
              <th className="p-2 text-left w-[100px]">Lens</th>
              <th className="p-2 text-left w-[100px]">Barcode</th>
            </tr>
          </thead>

          <tbody>
            {billingRows.map((r, i) => {
              const discountAmount =
                (Number(r.fee || 0) * (Number(r.discount || 0) || 0)) / 100;
              const rowTotal =
                (Number(r.fee || 0) - discountAmount) *
                (Number(r.qty || 1) || 1);

              return (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  {/* Code */}
                  <td className="p-2">
                    <input
                      type="text"
                      maxLength="6"
                      value={r.code || ""}
                      onChange={(e) =>
                        updateRow(r.id, { code: e.target.value.toUpperCase() })
                      }
                      className="border rounded p-1 text-xs w-full text-center tracking-widest"
                      placeholder="CODE"
                    />
                  </td>

                  {/* Tariff */}
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
                        onChange={(e) =>
                          updateRow(r.id, { tariff: e.target.value })
                        }
                        className="border rounded p-1 text-xs w-full"
                      />
                    </div>
                  </td>

                  {/* Stock button */}
                  <td className="p-2">
                    <div className="flex gap-2 items-center">
                    <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                      ...
                    </button>
                        <input
                      type="text"
                      value={r.stock_input || ""}
                      onChange={(e) =>
                        updateRow(r.id, { stock_input: e.target.value })
                      }
                      className="border rounded p-1 text-xs w-full"
                     
                    />
                    </div>
                  </td>

                  {/* Stock input field */}
                  <td className="p-2">
                    
                  </td>

                  {/* Qty */}
                  <td className="p-2">
                    <input
                      type="number"
                      value={r.qty || 1}
                      onChange={(e) =>
                        updateRow(r.id, { qty: Number(e.target.value || 1) })
                      }
                      className="border rounded p-1 text-xs w-full text-center"
                      min="1"
                    />
                  </td>

                  {/* Narrative */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={r.narrative || ""}
                      onChange={(e) =>
                        updateRow(r.id, { narrative: e.target.value })
                      }
                      className="border rounded p-1 text-xs w-full"
                      placeholder="Narrative"
                    />
                  </td>

                  {/* Discount */}
                  <td className="p-2 w-[70px]">
                    <input
                      type="number"
                      value={r.discount || 0}
                      onChange={(e) =>
                        updateRow(r.id, { discount: Number(e.target.value || 0) })
                      }
                      className="border rounded p-1 text-xs w-full text-center"
                      min="0"
                      max="999"
                    />
                  </td>

                  {/* Fee */}
                  <td className="p-2">
                    <input
                      type="number"
                      value={r.fee || 0}
                      onChange={(e) =>
                        updateRow(r.id, { fee: Number(e.target.value || 0) })
                      }
                      className="border rounded p-1 text-xs w-full text-center"
                      min="0"
                    />
                  </td>

                  {/* Patient Portion */}
<td className="p-2">
  <input
    type="number"
    value={r.discount ? Number(r.fee) - (Number(r.fee) * (Number(r.discount) / 100))
        : Number(r.patient_portion) || Number(r.fee) || 0
    }
    onChange={(e) => {
      updateRow(r.id, {patient_portion: Number(e.target.value || 0) });
      console.log(patient_portion);
    }}
    className="border rounded p-1 text-xs w-full text-center"
    min="0"
  />
</td>


                  {/* Medical Aid Portion */}
                  <td className="p-2">
                    <input
                      type="number"
                      value={r.medical_portion || 0}
                      onChange={(e) =>
                        updateRow(r.id, {
                          medical_portion: Number(e.target.value || 0),
                        })
                      }
                      className="border rounded p-1 text-xs w-full text-center"
                      min="0"
                    />
                  </td>

                  {/* Total */}
                  <td className="p-2 text-right font-semibold text-slate-700">
                    R{rowTotal.toFixed(2)}
                  </td>

                  {/* Lens */}
                  <td className="p-2">
                    <select
                      className="border rounded p-1 text-xs w-full"
                      value={r.lens}
                      onChange={(e) =>
                        updateRow(r.id, { lens: e.target.value })
                      }
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
                      value={r.barcode || ""}
                      onChange={(e) =>
                        updateRow(r.id, { barcode: e.target.value })
                      }
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
