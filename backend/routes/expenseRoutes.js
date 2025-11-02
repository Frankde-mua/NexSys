import express from "express";
import { getCompanyPool } from "../db.js";

const router = express.Router();

// Get all expense categories
router.get("/expense-categories/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const { rows } = await companyPool.query(
      "SELECT id, category_name FROM expense_category ORDER BY category_name ASC"
    );
    res.json({ success: true, categories: rows });
  } catch (err) {
    console.error("❌ Error fetching categories:", err);
    res.status(500).json({ success: false, message: "Error fetching categories" });
  }
});

// Get all expenditures
router.get("/expenditures/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const { rows } = await companyPool.query(`
      SELECT date, supplier, category_name, description, amount, payment_method,
             receipt_no, scan, notes, created_at, category_id, vat_amount
      FROM expenditure
    `);
    res.json({ success: true, expenditures: rows });
  } catch (err) {
    console.error("❌ Error getting expenditures:", err);
    res.status(500).json({ success: false, message: "Error fetching expenditures" });
  }
});

// Post a new expenditure
router.post("/expenditures/:company", async (req, res) => {
  const { company } = req.params;
  const {
    date,
    supplier,
    category_id,
    category_name,
    description,
    amount,
    vat_amount,
    payment_method,
    receipt_no,
    scan,
    notes,
  } = req.body;

  if (!category_id || !description || !amount) {
    return res.status(400).json({
      success: false,
      message: "Category, description, and amount are required",
    });
  }

  const companyPool = getCompanyPool(company);

  try {
    const insertQuery = `
      INSERT INTO expenditure (
        date, supplier, category_name, description, amount, payment_method,
        receipt_no, scan, notes, created_at, category_id, vat_amount
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),$10,$11)
      RETURNING *;
    `;

    const values = [
      date,
      supplier || null,
      category_name,
      description,
      parseFloat(amount),
      payment_method || null,
      receipt_no || null,
      scan || null,
      notes || null,
      category_id,
      vat_amount ? parseFloat(vat_amount) : 0,
    ];

    const { rows } = await companyPool.query(insertQuery, values);
    res.json({ success: true, expenditure: rows[0] });
  } catch (err) {
    console.error("❌ Error inserting expenditure:", err);
    res.status(500).json({ success: false, message: "Error saving expenditure" });
  }
});

export default router;
