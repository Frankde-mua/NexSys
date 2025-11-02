import express from "express";
import { nexsysPool } from "../db.js";

const router = express.Router();

// Create a new user (Admin or Superadmin)
router.post("/create-user", async (req, res) => {
  const { username, email, password, company, creatorUsername } = req.body;

  try {
    const creatorRes = await nexsysPool.query(
      `SELECT role, company_name FROM users WHERE username=$1`,
      [creatorUsername]
    );
    const creator = creatorRes.rows[0];

    if (!creator)
      return res.status(404).json({ success: false, message: "Creator not found" });

    if (creator.role !== "admin" && creator.role !== "superadmin")
      return res
        .status(403)
        .json({ success: false, message: "Only admins can create users" });

    if (creator.role === "admin" && creator.company_name !== company)
      return res
        .status(403)
        .json({ success: false, message: "Cannot create users outside your company" });

    const userExists = await nexsysPool.query(
      `SELECT * FROM users WHERE username=$1 AND company_name=$2`,
      [username, company]
    );

    if (userExists.rowCount > 0)
      return res.status(400).json({ success: false, message: "User already exists" });

    await nexsysPool.query(
      `INSERT INTO users (username, password, email, company_name, role)
       VALUES ($1, $2, $3, $4, 'user')`,
      [username, password, email, company]
    );

    res.json({ success: true, message: `✅ User ${username} created successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Superadmin overview
router.get("/superadmin/overview", async (req, res) => {
  try {
    const companiesRes = await nexsysPool.query(`SELECT * FROM companies`);
    const usersRes = await nexsysPool.query(`SELECT * FROM users`);
    res.json({ success: true, companies: companiesRes.rows, users: usersRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching overview" });
  }
});

// Get all users
router.get("/superadmin/users", async (req, res) => {
  try {
    const { rows } = await nexsysPool.query(
      `SELECT id, username, email, company_name, role FROM users`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// Get all companies
router.get("/superadmin/companies", async (req, res) => {
  try {
    const { rows } = await nexsysPool.query(
      `SELECT id, company_name FROM companies ORDER BY company_name`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

export default router;
