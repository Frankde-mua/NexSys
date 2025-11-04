import React, { useEffect } from "react";
import { generateICD10 } from "../utils/icd10Utils";

export default function PrescriptionForm({
  prescription,
  setPrescription,
  setIcd10Codes,
}) {
  // Update ICD-10 codes whenever prescription changes
  useEffect(() => {
    if (prescription) {
      const codes = generateICD10(prescription);
      setIcd10Codes(codes);
    }
  }, [prescription, setIcd10Codes]);

  // Handle changes in inputs
  const handleChange = (eye, field, value) => {
    setPrescription((prev) => ({
      ...prev,
      [eye]: { ...prev[eye], [field]: parseFloat(value) || 0 },
    }));
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h2 className="text-sm font-semibold mb-4">Prescription</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-t border-b table-fixed">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-2 text-left w-[10%]">Eye</th>
              <th className="p-2 text-left w-[18%]">Sphere</th>
              <th className="p-2 text-left w-[18%]">Cyl</th>
              <th className="p-2 text-left w-[18%]">Axis</th>
              <th className="p-2 text-left w-[18%]">Add</th>
              <th className="p-2 text-left w-[18%]">Date</th>
            </tr>
          </thead>

          <tbody>
            {["right", "left"].map((eye) => (
              <tr key={eye} className="border-t">
                <td className="p-2 font-medium">
                  {eye.charAt(0).toUpperCase() + eye.slice(1)}
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    step="0.25"
                    className="border rounded p-1 text-xs w-full"
                    value={prescription[eye]?.sphere ?? 0}
                    onChange={(e) =>
                      handleChange(eye, "sphere", e.target.value)
                    }
                  />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    step="0.25"
                    className="border rounded p-1 text-xs w-full"
                    value={prescription[eye]?.cyl ?? 0}
                    onChange={(e) => handleChange(eye, "cyl", e.target.value)}
                  />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    className="border rounded p-1 text-xs w-full"
                    value={prescription[eye]?.axis ?? 0}
                    onChange={(e) => handleChange(eye, "axis", e.target.value)}
                  />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    step="0.25"
                    className="border rounded p-1 text-xs w-full"
                    value={prescription[eye]?.add ?? 0}
                    onChange={(e) => handleChange(eye, "add", e.target.value)}
                  />
                </td>

                <td className="p-2">
                  <input
                    type="date"
                    className="border rounded p-1 text-xs w-full"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
