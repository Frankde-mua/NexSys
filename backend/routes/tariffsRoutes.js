import express from "express";
import { getCompanyPool } from "../db.js";

const router = express.Router();

// Get paginated tariffs
router.get("/all-tariffs/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);

  // Default pagination params
  const limit = parseInt(req.query.limit) || 100;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  try {
    // Fetch paginated data
    const { rows } = await pool.query(
      `SELECT id, code, description, category, standard_fee
       FROM optom_tariffs
       ORDER BY code ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count for pagination metadata
    const { rows: countRows } = await pool.query(
      "SELECT COUNT(*) AS total FROM optom_tariffs"
    );
    const total = parseInt(countRows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      tariffs: rows,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching tariffs:", err);
    res.status(500).json({ success: false, message: "Error fetching tariffs" });
  }
});

export default router;
