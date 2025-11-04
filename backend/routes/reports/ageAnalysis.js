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
        px.document_number,
        px.date,
        px.balance,
        CASE
          WHEN CURRENT_DATE - px.date <= 30 THEN '0–30 days'
          WHEN CURRENT_DATE - px.date <= 60 THEN '31–60 days'
          WHEN CURRENT_DATE - px.date <= 90 THEN '61–90 days'
          WHEN CURRENT_DATE - px.date <= 120 THEN '91–120 days'
          WHEN CURRENT_DATE - px.date <= 150 THEN '121–150 days'
          ELSE '180+ days'
        END AS aging_bucket
      FROM patientx px
      JOIN patients p ON p.id = px.patient_id
      WHERE px.balance > 0
      ORDER BY p.id, px.date;
    `;
    const result = await pool.query(query);

    if (format === "csv") {
      const csv = new Parser().parse(result.rows);
      res.header("Content-Type", "text/csv");
      res.attachment("age_analysis.csv");
      return res.send(csv);
    }

    if (format === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=age_analysis.pdf");
      doc.pipe(res);
      doc.fontSize(16).text("Age Analysis Report", { align: "center" }).moveDown();
      result.rows.forEach(r => doc.fontSize(10).text(`${r.patient_name} | ${r.document_number} | ${r.balance} | ${r.aging_bucket}`));
      doc.end();
      return;
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Age Analysis Report" });
  }
});

export default router;
