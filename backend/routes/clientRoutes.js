import express from "express";
import { getCompanyPool } from "../db.js";

const router = express.Router();

router.get("/search-clients/:company", async (req, res) => {
  const { company } = req.params;
  const { name = "", surname = "" } = req.query;
  const pool = getCompanyPool(company);

  try {
    const { rows } = await pool.query(
      `
      SELECT id, firstname AS name, surname
      FROM patients
      WHERE ($1 = '' OR firstname ILIKE '%' || $1 || '%')
        AND ($2 = '' OR surname ILIKE '%' || $2 || '%')
      ORDER BY firstname ASC
      LIMIT 50;
      `,
      [name, surname]
    );

    res.json({ success: true, clients: rows });
  } catch (err) {
    console.error("Error searching clients:", err);
    res.status(500).json({ success: false, message: "Error searching clients" });
  }
});

// Get all clients
router.get("/patients/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  try {
    const { rows } = await pool.query(
      `SELECT 
    p.id,
    p.first_name AS name,
    p.last_name AS surname,
    p.date_of_birth,
    p.phone,
    p.email,
    p.address,
    a.id as account_id,
    a.account_number AS accountno
    FROM patients p
    LEFT JOIN account_patients ap ON ap.patient_id = p.id
    LEFT JOIN accounts a ON a.id = ap.account_id
    ORDER BY p.first_name ASC`
    );
    res.json({ success: true, patients: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching statuses" });
  }
});

export default router;
