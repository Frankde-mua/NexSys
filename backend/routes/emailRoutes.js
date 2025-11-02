import express from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { getCompanyPool } from "../db.js";
import { fetchInbox, fetchSent, checkEmailStatus } from "../controller/emailController.js";
const router = express.Router();

// ------------------------------
// 🔐 Encryption setup
// ------------------------------
const algorithm = "aes-256-cbc";

// derive key safely from .env (works with plain text key)
const key =
  process.env.ENCRYPTION_KEY.length === 64
    ? Buffer.from(process.env.ENCRYPTION_KEY, "hex") // hex key
    : crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY).digest();

const iv = Buffer.alloc(16, 0); // static IV (could randomize if desired)

// encrypt/decrypt helpers
const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  return cipher.update(text, "utf8", "hex") + cipher.final("hex");
};

const decrypt = (text) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return decipher.update(text, "hex", "utf8") + decipher.final("utf8");
};

// ------------------------------
// 📩 Save Email Configuration
// ------------------------------
router.post("/config/:companyName", async (req, res) => {
    console.log("hit email config save endpoint");
  const { companyName } = req.params;
  const { smtpHost, smtpPort, imapHost, imapPort, email, password } = req.body;

  try {
    const db = getCompanyPool(companyName);
    const encryptedPass = encrypt(password);

    // Create table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id SERIAL PRIMARY KEY,
        smtp_host VARCHAR(255),
        smtp_port INT,
        imap_host VARCHAR(255),
        imap_port INT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        CHECK (
          (smtp_host IS NOT NULL AND smtp_port IS NOT NULL)
          OR
          (imap_host IS NOT NULL AND imap_port IS NOT NULL)
        )
      );
    `);

    // UPSERT (Postgres style)
    const query = `
      INSERT INTO email_settings (smtp_host, smtp_port, imap_host, imap_port, email, password)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE
      SET smtp_host = EXCLUDED.smtp_host,
          smtp_port = EXCLUDED.smtp_port,
          imap_host = EXCLUDED.imap_host,
          imap_port = EXCLUDED.imap_port,
          password = EXCLUDED.password
      RETURNING *;
    `;

    const values = [smtpHost, smtpPort, imapHost, imapPort, email, encryptedPass];
    const result = await db.query(query, values);

    res.json({ success: true, config: result.rows[0] });
  } catch (err) {
    console.error("❌ Save email config error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------
// ⚙️ Get Email Configuration
// ------------------------------
router.get("/config/:companyName", async (req, res) => {
  const { companyName } = req.params;
  try {
    const db = getCompanyPool(companyName);
    const result = await db.query(`SELECT * FROM email_settings LIMIT 1`);
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, error: "No configuration found" });

    const row = result.rows[0];
    const decryptedPassword = decrypt(row.password);

    res.json({ ...row, password: decryptedPassword });
  } catch (err) {
    console.error("❌ Get email config error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------
// 📤 Send Email
// ------------------------------
router.post("/send/:companyName", async (req, res) => {
  const { companyName } = req.params;
  const { to, subject, message } = req.body;

  try {
    const db = getCompanyPool(companyName);
    const result = await db.query(`SELECT * FROM email_settings LIMIT 1`);
    if (result.rowCount === 0)
      return res.status(400).json({ success: false, error: "Email config not found" });

    const row = result.rows[0];
    const decryptedPassword = decrypt(row.password);

    const transporter = nodemailer.createTransport({
      host: row.smtp_host,
      port: Number(row.smtp_port),
      secure: Number(row.smtp_port) === 465, // true for SSL
      auth: { user: row.email, pass: decryptedPassword },
    });

    await transporter.sendMail({
      from: row.email,
      to,
      subject,
      text: message,
    });

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("❌ Send email error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------
// 📥 Fetch Inbox
// ------------------------------
router.get("/inbox/:companyName", fetchInbox);

// ------------------------------
// 📥 Fetch sent
// ------------------------------
router.get("/sent/:companyName", fetchSent);

// ------------------------------
// 📥 Fetch status
// ------------------------------
router.get("/status/:companyName", checkEmailStatus);

export default router;
