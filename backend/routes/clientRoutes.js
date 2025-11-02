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
      FROM clients
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

export default router;
