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
        e.date,
        ec.category_name,
        e.counterparty,
        e.description,
        e.amount,
        e.vat_amount,
        e.payment_method
      FROM expenditure e
      LEFT JOIN expense_category ec ON ec.id = e.category_id
      WHERE e.date BETWEEN $1 AND $2
      ORDER BY e.date DESC;
    `;
    const result = await pool.query(query, [
      start || "2000-01-01",
      end || new Date().toISOString().split("T")[0],
    ]);

    if (format === "csv") {
      const csv = new Parser().parse(result.rows);
      res.header("Content-Type", "text/csv");
      res.attachment("expense_report.csv");
      return res.send(csv);
    }

    if (format === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=expense_report.pdf");
      doc.pipe(res);
      doc.fontSize(16).text("Expense Report", { align: "center" }).moveDown();
      result.rows.forEach(r => 
        doc.fontSize(10).text(`${r.date} | ${r.category_name} | ${r.counterparty} | ${r.amount}`)
      );
      doc.end();
      return;
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Expense Report" });
  }
});

export default router;
