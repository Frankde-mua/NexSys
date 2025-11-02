import express from "express";
import { nexsysPool } from "../db.js";
import { createDatabaseIfNotExists } from "../utils/seedHelpers.js";

const router = express.Router();

router.post("/create-company", async (req, res) => {
  const { username, company, password, email } = req.body;

  const userRes = await nexsysPool.query(
    `SELECT role FROM users WHERE username=$1`,
    [username]
  );

  if (userRes.rows[0]?.role !== "superadmin") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Only Superadmin can create companies" });
  }

  const dbName = `company_${company.toLowerCase().replace(/\s+/g, "_")}`;

  try {
    await createDatabaseIfNotExists(dbName);

    await nexsysPool.query(
      `INSERT INTO companies (company_name) VALUES ($1) ON CONFLICT DO NOTHING`,
      [company]
    );

    await nexsysPool.query(
      `INSERT INTO users (username, password, email, company_name, role)
       VALUES ($1,$2,$3,$4,'admin')
       ON CONFLICT DO NOTHING`,
      [username, password, email, company]
    );

    res.json({ success: true, message: `Company '${company}' created successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating company" });
  }
});

export default router;
