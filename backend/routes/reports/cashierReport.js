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
        t.description AS payment_type,
        SUM(px.credit) AS total_amount
      FROM patientx px
      JOIN transaction_types t ON t.id = px.transaction_type_id
      WHERE DATE(px.date) = $1 AND t.prefix = 'PAY'
      GROUP BY t.description;
    `;
    const result = await pool.query(query, [date || new Date().toISOString().split("T")[0]]);

    if (format === "csv") {
      const csv = new Parser().parse(result.rows);
      res.header("Content-Type", "text/csv");
      res.attachment("cashier_report.csv");
      return res.send(csv);
    }

    if (format === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=cashier_report.pdf");
      doc.pipe(res);
      doc.fontSize(16).text("Cashier Report", { align: "center" }).moveDown();
      result.rows.forEach(r => doc.fontSize(10).text(`${r.payment_type} | ${r.total_amount}`));
      doc.end();
      return;
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Cashier Report" });
  }
});

export default router;
