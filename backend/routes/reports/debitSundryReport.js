import express from "express";
import { getCompanyPool } from "../../db.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

const router = express.Router();

router.get("/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  const { start, end, format } = req.query;

  try {
    const query = `
      SELECT 
        px.date,
        px.document_number,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        px.description,
        px.debit
      FROM patientx px
      JOIN patients p ON p.id = px.patient_id
      JOIN transaction_types t ON t.id = px.transaction_type_id
      WHERE t.prefix = 'JRN'
        AND px.date BETWEEN $1 AND $2
      ORDER BY px.date DESC;
    `;
    const result = await pool.query(query, [
      start || "2000-01-01",
      end || new Date().toISOString().split("T")[0],
    ]);

    if (format === "csv") {
      const csv = new Parser().parse(result.rows);
      res.header("Content-Type", "text/csv");
      res.attachment("debit_sundry_report.csv");
      return res.send(csv);
    }

    if (format === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=debit_sundry_report.pdf");
      doc.pipe(res);
      doc.fontSize(16).text("Debit Sundry Report", { align: "center" }).moveDown();
      result.rows.forEach(r => doc.fontSize(10).text(`${r.date} | ${r.patient_name} | ${r.debit}`));
      doc.end();
      return;
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Debit Sundry Report" });
  }
});

export default router;
