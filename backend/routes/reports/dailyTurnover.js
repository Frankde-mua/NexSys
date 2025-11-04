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
        DATE(px.date) AS date,
        SUM(px.debit) AS total_turnover
      FROM patientx px
      JOIN transaction_types t ON t.id = px.transaction_type_id
      WHERE t.prefix = 'INV'
        AND px.date BETWEEN $1 AND $2
      GROUP BY DATE(px.date)
      ORDER BY DATE(px.date);
    `;
    const result = await pool.query(query, [
      start || new Date().toISOString().split("T")[0],
      end || new Date().toISOString().split("T")[0],
    ]);

    if (format === "csv") {
      const csv = new Parser().parse(result.rows);
      res.header("Content-Type", "text/csv");
      res.attachment("daily_turnover.csv");
      return res.send(csv);
    }

    if (format === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=daily_turnover.pdf");
      doc.pipe(res);
      doc.fontSize(16).text("Daily Turnover Report", { align: "center" }).moveDown();
      result.rows.forEach(r => doc.fontSize(10).text(`${r.date} | ${r.total_turnover}`));
      doc.end();
      return;
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Daily Turnover" });
  }
});

export default router;
