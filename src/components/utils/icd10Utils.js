// utils/icd10Utils.js
export function generateICD10(prescription, billingRows = []) {
  const codes = [];

  // 1️⃣ Prescription based codes
  ["right", "left"].forEach((eye) => {
    const p = prescription[eye];
    if (!p) return;

    // Example logic: if sphere/cyl/axis are non-zero, add relevant ICD-10
    if ((p.sphere && p.sphere !== 0) || (p.cyl && p.cyl !== 0)) {
      codes.push("H52.1"); // Example: Refractive error
    }
  });

  // 2️⃣ Add Z01.0 if eye exam/test is present in billingRows
  const hasEyeExam = billingRows.some((r) =>
    r.tariff?.toLowerCase().includes("eye exam") ||
    r.tariff?.toLowerCase().includes("eye test")
  );
  if (hasEyeExam && !codes.includes("Z01.0")) {
    codes.push("Z01.0"); // General eye exam
  }

  // 3️⃣ Remove duplicates
  return Array.from(new Set(codes));
}
