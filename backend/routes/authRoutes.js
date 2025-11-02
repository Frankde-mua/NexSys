import express from "express";
import { nexsysPool } from "../db.js";

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
    console.log("hit login endpoint");
  const { username, company, password } = req.body;

  try {
    const { rows } = await nexsysPool.query(
      `SELECT * FROM users WHERE username=$1 AND company_name=$2 AND password=$3`,
      [username, company, password]
    );

    if (rows.length === 0)
      return res.json({ success: false, message: "Invalid credentials" });

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
