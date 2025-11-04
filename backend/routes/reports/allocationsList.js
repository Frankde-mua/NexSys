import express from "express";
import { getCompanyPool } from "../../db.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

const router = express.Router();

router.get("/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  const { format } = req.query;

  try {
    const query = `
      SELECT 
        p.id AS patient_id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        px.document_number AS invoice_number,
        px.date AS invoice_date,
        SUM(px.credit) AS payment_allocated
      FROM patientx px
      JOIN patients p ON p.id = px.patient_id
      JOIN transaction_types t ON t.id = px.transaction_type_id
      WHERE t.prefix = 'PAY'
      GROUP BY p.id, px.document_number, px.date
      ORDER BY px.date DESC;
    `;
    const result = await pool.query(query);

    if (format === "csv") {
      const csv = new Parser().parse(result.rows);
      res.header("Content-Type", "text/csv");
      res.attachment("allocations_list.csv");
      return res.send(csv);
    }

    if (format === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=allocations_list.pdf");
      doc.pipe(res);
      doc.fontSize(16).text("Allocations List Report", { align: "center" }).moveDown();
      result.rows.forEach(r => doc.fontSize(10).text(`${r.patient_name} | ${r.invoice_number} | ${r.payment_allocated}`));
      doc.end();
      return;
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Allocations List" });
  }
});

export default router;
