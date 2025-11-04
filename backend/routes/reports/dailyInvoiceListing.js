import express from "express";
import { getCompanyPool } from "../../db.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

const router = express.Router();

router.get("/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  const { date, format } = req.query;

  try {
    const query = `
      SELECT 
        px.document_number,
        px.date,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        px.description,
        px.qty,
        px.fee,
        px.discount,
        (px.qty * px.fee) - COALESCE(px.discount, 0) AS total
      FROM patientx px
      JOIN patients p ON p.id = px.patient_id
      JOIN transaction_types t ON t.id = px.transaction_type_id
      WHERE t.prefix = 'INV' AND DATE(px.date) = $1
      ORDER BY px.date DESC;
    `;
    const result = await pool.query(query, [date || new Date().toISOString().split("T")[0]]);

    if (format === "csv") {
      const csv = new Parser().parse(result.rows);
      res.header("Content-Type", "text/csv");
      res.attachment("daily_invoice_listing.csv");
      return res.send(csv);
    }

    if (format === "pdf") {
      const doc = new PDFDocument({ margin: 40 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=daily_invoice_listing.pdf");
      doc.pipe(res);
      doc.fontSize(16).text("Daily Invoice Listing", { align: "center" }).moveDown();
      result.rows.forEach(r => doc.fontSize(10).text(`${r.date} | ${r.patient_name} | ${r.description} | ${r.total}`));
      doc.end();
      return;
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Daily Invoice Listing" });
  }
});

export default router;
