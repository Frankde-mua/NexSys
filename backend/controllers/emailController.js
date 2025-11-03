import axios from "axios";
import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import { decrypt } from "../utils/crypto.js";
import { getCompanyPool } from "../db.js";

// Helper to get company-specific email config
const getCompanyEmailConfig = async (companyName) => {
  const db = getCompanyPool(companyName);
  const result = await db.query(`SELECT * FROM email_settings LIMIT 1`);
  if (result.rowCount === 0) throw new Error("Email config not found");

  const row = result.rows[0];
  const decryptedPassword = decrypt(row.password);

  return {
    email: row.email,
    password: decryptedPassword,
    imapHost: row.imap_host,
    imapPort: Number(row.imap_port),
    smtpHost: row.smtp_host,
    smtpPort: Number(row.smtp_port),
  };
};

/* ----------------------------------------------
 📥 Fetch Inbox
---------------------------------------------- */
export const fetchInbox = async (req, res) => {
  const { companyName } = req.params;
  try {
    const config = await getCompanyEmailConfig(companyName);

    const imapConfig = {
      imap: {
        user: config.email,
        password: config.password,
        host: config.imapHost,
        port: config.imapPort,
        tls: true,
        authTimeout: 10000,
        tlsOptions: {
          rejectUnauthorized: false,
          servername: config.imapHost, // ensures SNI is still passed
        },
      },
    };


    const connection = await imaps.connect(imapConfig);
    await connection.openBox("INBOX");

    const searchCriteria = ["ALL"];
    const fetchOptions = {
      bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const parsedMessages = await Promise.all(
      messages.map(async (msg) => {
        const header = msg.parts.find(
          (p) => p.which === "HEADER.FIELDS (FROM TO SUBJECT DATE)"
        );
        const body = msg.parts.find((p) => p.which === "TEXT");
        let textSnippet = "";

        if (body && body.body) {
          try {
            const parsed = await simpleParser(body.body);
            textSnippet = parsed.text?.slice(0, 200) || "";
          } catch (err) {
            console.error("❌ Parser error:", err);
          }
        }

        return {
          from: header?.body?.from?.[0] || "",
          to: header?.body?.to?.[0] || "",
          subject: header?.body?.subject?.[0] || "",
          date: header?.body?.date?.[0] || "",
          snippet: textSnippet,
        };
      })
    );

    res.json({ success: true, messages: parsedMessages.reverse() }); // newest first
  } catch (err) {
    console.error("❌ Inbox fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ----------------------------------------------
 📤 Fetch Sent Mail
---------------------------------------------- */
export const fetchSent = async (req, res) => {
  const { companyName } = req.params;
  try {
    const config = await getCompanyEmailConfig(companyName);

    const imapConfig = {
      imap: {
        user: config.email,
        password: config.password,
        host: config.imapHost,
        port: config.imapPort,
        tls: true,
        authTimeout: 10000,
        tlsOptions: {
          rejectUnauthorized: false,
          servername: config.imapHost,
        },
      },
    };

    const connection = await imaps.connect(imapConfig);

    // 🔍 List all mailboxes
    const boxes = await connection.getBoxes();

    // Helper: recursively find folder that contains "sent" (case-insensitive)
    const findSentFolder = (boxTree) => {
      for (const [name, box] of Object.entries(boxTree)) {
        if (name.toLowerCase().includes("sent")) return name;
        if (box.children) {
          const found = findSentFolder(box.children);
          if (found) return `${name}/${found}`;
        }
      }
      return null;
    };

    const sentFolder = findSentFolder(boxes) || "Sent";
    console.log(`📤 Using sent folder: ${sentFolder}`);

    await connection.openBox(sentFolder);

    const searchCriteria = ["ALL"];
    const fetchOptions = {
      bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const parsedMessages = await Promise.all(
      messages.map(async (msg) => {
        const header = msg.parts.find(
          (p) => p.which === "HEADER.FIELDS (FROM TO SUBJECT DATE)"
        );
        const body = msg.parts.find((p) => p.which === "TEXT");
        let textSnippet = "";

        if (body && body.body) {
          try {
            const parsed = await simpleParser(body.body);
            textSnippet = parsed.text?.slice(0, 200) || "";
          } catch (err) {
            console.error("❌ Parser error:", err);
          }
        }

        return {
          from: header?.body?.from?.[0] || "",
          to: header?.body?.to?.[0] || "",
          subject: header?.body?.subject?.[0] || "",
          date: header?.body?.date?.[0] || "",
          snippet: textSnippet,
        };
      })
    );

    res.json({ success: true, messages: parsedMessages.reverse() });
  } catch (err) {
    console.error("❌ Sent fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ----------------------------------------------
 ✉️ Optional: Axios proxy for external APIs
---------------------------------------------- */
// If you need Axios for something (like checking mail quota or sending)
export const checkEmailStatus = async (req, res) => {
  const { companyName } = req.params;
  try {
    const config = await getCompanyEmailConfig(companyName);
    const response = await axios.get(
      `https://api.mailserver.com/status?email=${config.email}`,
      { headers: { Authorization: `Bearer ${config.password}` } }
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("❌ Axios error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
