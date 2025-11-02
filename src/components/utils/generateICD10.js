// utils/generateICD10.js
export function generateICD10(prescription, billingRows = []) {
  const codes = [];

  const analyzeEye = (eye, data) => {
    const { sphere, cyl, axis, add } = data;
    if (sphere < -0.5) codes.push(`${eye}: H52.1 - Myopia`);
    else if (sphere > 0.5) codes.push(`${eye}: H52.0 - Hypermetropia`);
    if (Math.abs(cyl) > 0.5) codes.push(`${eye}: H52.2 - Astigmatism`);
    if (add && add > 0.75) codes.push(`${eye}: H52.4 - Presbyopia`);
  };

  if (prescription.right) analyzeEye("Right Eye", prescription.right);
  if (prescription.left) analyzeEye("Left Eye", prescription.left);

  // Add Z01.0 if any billing row is Eye Exam / Eye Test
  const hasEyeExam = billingRows.some((r) =>
    r.tariff?.toLowerCase().includes("eye exam") ||
    r.tariff?.toLowerCase().includes("eye test")
  );
  if (hasEyeExam) codes.push("Z01.0 - General eye examination");

  return codes.length ? codes : ["No ICD-10 findings based on prescription."];
}
