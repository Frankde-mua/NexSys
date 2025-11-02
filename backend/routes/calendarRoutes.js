import express from "express";
import { getCompanyPool } from "../db.js";

const router = express.Router();

// Get all statuses
router.get("/status/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  try {
    const { rows } = await pool.query(
      "SELECT id, status_desc FROM calendar_status ORDER BY status_desc ASC"
    );
    res.json({ success: true, statuses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching statuses" });
  }
});

// Create new status
router.post("/status/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  const { status_desc } = req.body;

  try {
    const { rows } = await pool.query(
      "INSERT INTO calendar_status (status_desc) VALUES ($1) RETURNING *",
      [status_desc]
    );
    res.json({ success: true, status: rows[0] });
  } catch (err) {
    console.error("Error adding status:", err);
    res.status(500).json({ success: false, message: "Error adding status" });
  }
});

// Get all calendar entries
router.get("/calendar/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);

  try {
    const { rows } = await pool.query(`
      SELECT 
        c.id, c.agenda, c.time, c.date, c.status_id, s.status_desc,
        c.client_id, cl.firstname AS name, cl.surname
      FROM calendar c
      LEFT JOIN calendar_status s ON c.status_id = s.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.date ASC, c.time ASC;
    `);
    res.json({ success: true, entries: rows });
  } catch (err) {
    console.error("Error fetching calendar:", err);
    res.status(500).json({ success: false, message: "Error fetching calendar" });
  }
});

// Create new calendar entry
router.post("/calendar/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  const { agenda, status_id, time, date, client_id } = req.body;

  try {
    const insertRes = await pool.query(
      "INSERT INTO calendar (agenda, status_id, client_id, time, date, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id",
      [agenda, status_id || null, client_id || null, time || "00:00", date]
    );
    const newId = insertRes.rows[0].id;

    const { rows } = await pool.query(
      `SELECT c.*, s.status_desc, cl.firstname AS name, cl.surname
       FROM calendar c
       LEFT JOIN calendar_status s ON c.status_id = s.id
       LEFT JOIN clients cl ON c.client_id = cl.id
       WHERE c.id=$1`,
      [newId]
    );

    res.json({ success: true, agenda: rows[0] });
  } catch (err) {
    console.error("Error creating calendar entry:", err);
    res.status(500).json({ success: false, message: "Error creating entry" });
  }
});

// Update calendar entry
router.put("/calendar/:company/:id", async (req, res) => {
  const { company, id } = req.params;
  const { title, time, status_id, date } = req.body;
  const pool = getCompanyPool(company);

  try {
    await pool.query(
      "UPDATE calendar SET agenda=$1, time=$2, status_id=$3, date=$4 WHERE id=$5",
      [title, time, status_id, date, id]
    );

    const { rows } = await pool.query(
      `SELECT c.*, s.status_desc, cl.firstname AS name, cl.surname
       FROM calendar c
       LEFT JOIN calendar_status s ON c.status_id = s.id
       LEFT JOIN clients cl ON c.client_id = cl.id
       ORDER BY c.date`
    );

    res.json({ success: true, entries: rows });
  } catch (err) {
    console.error("Error updating calendar:", err);
    res.status(500).json({ success: false, message: "Error updating entry" });
  }
});

// Delete entry or status
router.delete("/calendar/:company/:id", async (req, res) => {
  const { company, id } = req.params;
  const pool = getCompanyPool(company);
  try {
    const { rowCount } = await pool.query("DELETE FROM calendar WHERE id=$1", [id]);
    if (!rowCount) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting calendar entry:", err);
    res.status(500).json({ success: false, message: "Error deleting entry" });
  }
});

router.delete("/status/:company/:id", async (req, res) => {
  const { company, id } = req.params;
  const pool = getCompanyPool(company);
  try {
    const { rowCount } = await pool.query("DELETE FROM calendar_status WHERE id=$1", [id]);
    if (!rowCount)
      return res.json({
        success: false,
        message: "Cannot delete status (used or not found)",
      });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting status:", err);
    res.status(500).json({ success: false, message: "Error deleting status" });
  }
});

export default router;
