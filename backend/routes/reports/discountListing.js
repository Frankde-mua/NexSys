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
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        px.document_number,
        px.description,
        px.fee,
        px.discount,
        (px.fee * px.qty) - COALESCE(px.discount, 0) AS total_after_discount
      FROM patientx px
      JOIN patients p ON p.id = px.patient_id
      WHERE px.discount > 0
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
      res.attachment("discount_listing.csv");
      return res.send(csv);
    }

    if (format === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=discount_listing.pdf");
      doc.pipe(res);
      doc.fontSize(16).text("Discount Listing Report", { align: "center" }).moveDown();
      result.rows.forEach(r =>
        doc.fontSize(10).text(`${r.date} | ${r.patient_name} | ${r.description} | Discount: ${r.discount}`)
      );
      doc.end();
      return;
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate Discount Listing" });
  }
});

export default router;
