import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import { usersToSeed } from "./data.js"
import bodyParser from "body-parser";
// import your other stuff like getCompanyPool etc.

const { Pool } = pkg;

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5000", // your local dev server
//       "htttp://localhost:3000", // your React dev server
//       "https://franklin-unsprinkled-corrie.ngrok-free.dev", // your ngrok URL
//     ],
//     credentials: true,
//   })
// );

// // ✅ Middleware setup
// app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// ---------------------
// ✅ System pool (to create new databases)
// ---------------------
const systemPool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DEFAULT_DB || "postgres", // default postgres DB
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: { rejectUnauthorized: false },
});

// ---------------------
// ✅ NexSys main database connection
// ---------------------
const nexsysPool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: "nexsys",
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: { rejectUnauthorized: false },
});

// ---------------------
// ✅ Helper to create DB if not exists
// ---------------------
const createDatabaseIfNotExists = async (dbName) => {
  try {
    await systemPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Created database ${dbName}`);
  } catch (err) {
    if (err.code === "42P04") {
      console.log(`⚠️ Database ${dbName} already exists, skipping creation`);
    } else {
      throw err;
    }
  }
};

// ---------------------
// ✅ Seed default users with roles
// ---------------------
const seedDefaultUsers = async () => {
  try {
    await nexsysPool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await nexsysPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50),
        password VARCHAR(255),
        email VARCHAR(255),
        cel VARCHAR(255),
        tel VARCHAR(255),
        vat_no BIGINT,
        company_name VARCHAR(100) REFERENCES companies(company_name),
        address VARCHAR(255),
        city VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        licence_no VARCHAR(100),
        business_type VARCHAR(50),
        onHold BOOLEAN DEFAULT FALSE,
        role VARCHAR(20) DEFAULT 'user'
      )
    `);

    //const usersToSeed = generatedUsers;

    for (const u of usersToSeed) {
      const companyDbName = `company_${u.company.toLowerCase().replace(/\s+/g, "_")}`;
      if (u.role !== "superadmin") {
        await createDatabaseIfNotExists(companyDbName);
      }

      await nexsysPool.query(
        `INSERT INTO companies (company_name) VALUES ($1) ON CONFLICT (company_name) DO NOTHING`,
        [u.company]
      );

      const userExists = await nexsysPool.query(
        `SELECT * FROM users WHERE username=$1 AND company_name=$2`,
        [u.username, u.company]
      );

      if (userExists.rowCount === 0) {
        await nexsysPool.query(
          `INSERT INTO users (username, password, email, company_name, role) VALUES ($1,$2,$3,$4,$5)`,
          [u.username, u.password, u.email, u.company, u.role]
        );
        console.log(`✅ Seeded user ${u.username} / ${u.company} as ${u.role}`);
      } else {
        console.log(`⚠️ User ${u.username} / ${u.company} already exists, skipping`);
      }
    }
  } catch (err) {
    console.error("❌ Error seeding default users:", err);
  }
};

// ---------------------
// ✅ API Routes
// ---------------------

// Login API
app.post("/api/login", async (req, res) => {
  const { username, company, password } = req.body;

  try {
    const { rows } = await nexsysPool.query(
      `SELECT * FROM users WHERE username=$1 AND company_name=$2 AND password=$3`,
      [username, company, password]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    console.log(`✅ User ${username} from company ${company} logged in successfully`);
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create company (Superadmin only)
app.post("/api/create-company", async (req, res) => {
  const { username, company, password, email } = req.body;

  const userRes = await nexsysPool.query(`SELECT role FROM users WHERE username=$1`, [username]);
  const userRole = userRes.rows[0]?.role;

  if (userRole !== "superadmin") {
    return res.status(403).json({ success: false, message: "Forbidden: Only Superadmin can create companies" });
  }

  const dbName = `company_${company.toLowerCase().replace(/\s+/g, "_")}`;

  try {
    await createDatabaseIfNotExists(dbName);

    await nexsysPool.query(
      `INSERT INTO companies (company_name) VALUES ($1) ON CONFLICT (company_name) DO NOTHING`,
      [company]
    );

    const userExists = await nexsysPool.query(
      `SELECT * FROM users WHERE username=$1 AND company_name=$2`,
      [username, company]
    );

    if (userExists.rowCount === 0) {
      await nexsysPool.query(
        `INSERT INTO users (username, password, email, company_name, role) VALUES ($1,$2,$3,$4,'admin')`,
        [username, password, email, company]
      );
    }

    res.send(`✅ Company '${company}' and user '${username}' created successfully!`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating company or user");
  }
});

// Create user (Admin only)
app.post("/api/create-user", async (req, res) => {
  const { username, email, password, company, creatorUsername } = req.body;

  try {
    const creatorRes = await nexsysPool.query(
      `SELECT role, company_name FROM users WHERE username=$1`,
      [creatorUsername]
    );
    const creator = creatorRes.rows[0];

    if (!creator) return res.status(404).json({ success: false, message: "Creator not found" });

    if (creator.role !== "admin" && creator.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Forbidden: Only admins can create users" });
    }

    if (creator.role === "admin" && creator.company_name !== company) {
      return res.status(403).json({ success: false, message: "Forbidden: Cannot create user outside your company" });
    }

    const userExists = await nexsysPool.query(
      `SELECT * FROM users WHERE username=$1 AND company_name=$2`,
      [username, company]
    );

    if (userExists.rowCount > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    await nexsysPool.query(
      `INSERT INTO users (username, password, email, company_name, role) VALUES ($1,$2,$3,$4,'user')`,
      [username, password, email, company]
    );

    res.json({ success: true, message: `User ${username} created successfully for company ${company}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Superadmin overview
app.get("/api/superadmin/overview", async (req, res) => {
  try {
    const companiesRes = await nexsysPool.query(`SELECT * FROM companies`);
    const usersRes = await nexsysPool.query(`SELECT * FROM users`);

    res.json({
      success: true,
      companies: companiesRes.rows,
      users: usersRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all users (Superadmin)
app.get("/api/superadmin/users", async (req, res) => {
  try {
    const { rows } = await nexsysPool.query("SELECT id, username, email, company_name, role FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// Get all companies (Superadmin)
app.get("/api/superadmin/companies", async (req, res) => {
  try {
    const { rows } = await nexsysPool.query("SELECT id, company_name FROM companies");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});


// ---------------------
// ✅ Expenditure / Expense Category API
// ---------------------
// Helper: get company pool
const getCompanyPool = (companyName) => {
  const dbName = `company_${companyName.toLowerCase().replace(/\s+/g, "_")}`;
  return new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: dbName,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: { rejectUnauthorized: false },
  });
};

// Get all expense categories for a company
app.get("/api/expense-categories/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const { rows } = await companyPool.query("SELECT id, category_name FROM expense_category ORDER BY category_name ASC");
    res.json({ success: true, categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching expense categories" });
  }
});

// getting all expenses
app.get("/api/expenditures/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const insertQuery = `
      SELECT
        date,
        supplier,
        category_name,
        description,
        amount,
        payment_method,
        receipt_no,
        scan,
        notes,
        created_at,
        category_id,
        vat_amount
      
      FROM expenditure
    `;


    const { rows } = await companyPool.query(insertQuery);
    res.json({ success: true, expenditures: rows });
  } catch (err) {
    console.error("❌ Error getting all expenditure:", err);
    res.status(500).json({ success: false, message: "Error getting expenditures" });
  }
});

// Post a new expenditure
app.post("/api/expenditures/:company", async (req, res) => {
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
        date,
        supplier,
        category_name,
        description,
        amount,
        payment_method,
        receipt_no,
        scan,
        notes,
        created_at,
        category_id,
        vat_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11)
      RETURNING *
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
    res.status(500).json({ success: false, message: "Error creating expenditure" });
  }
});

// ---------------------
// ✅ Calendar API (Updated)
// ---------------------

// Get all calender status for a company
app.get("/api/status/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const { rows } = await companyPool.query("SELECT id, status_desc FROM calendar_status ORDER BY status_desc ASC");
    res.json({ success: true, statuses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching expense categories" });
  }
});

// Get all calendar entries for a company (joined with clients + status)
app.get("/api/calendar/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const query = `
      SELECT 
        c.id,
        c.agenda,
        c.time,
        c.date,
        c.status_id,
        s.status_desc,
        c.client_id,
        cl.firstname AS name,
        cl.surname
      FROM calendar c
      LEFT JOIN calendar_status s ON c.status_id = s.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.date ASC, c.time ASC;
    `;

    const { rows } = await companyPool.query(query);
    res.json({ success: true, entries: rows });
  } catch (err) {
    console.error("❌ Error fetching calendar entries:", err);
    res.status(500).json({ success: false, message: "Error fetching calendar entries" });
  }
});

// Create new status
app.post("/api/status/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);
  const { status_desc } = req.body;

  try {
    const insertQuery = `
      INSERT INTO calendar_status (status_desc)
      VALUES ($1)
      RETURNING *;
    `;
    const values = [status_desc];
    const { rows } = await companyPool.query(insertQuery, values);

    res.json({ success: true, status: rows[0] });
  } catch (err) {
    console.error("Error inserting new status:", err);
    res.status(500).json({ success: false, message: "Error adding status" });
  }
});

// Add a new agenda entry (returns joined record)
app.post("/api/calendar/:company", async (req, res) => {
  const { company } = req.params;
  const companyPool = getCompanyPool(company);
  const { agenda, status_id, time, date, client_id } = req.body;

  try {
    // 1️⃣ Insert the agenda
    const insertQuery = `
      INSERT INTO calendar (agenda, status_id, client_id, time, date, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id;
    `;
    const values = [agenda, status_id || null, client_id || null, time || "00:00", date];
    const insertResult = await companyPool.query(insertQuery, values);
    const newId = insertResult.rows[0].id;

    // 2️⃣ Fetch the inserted record joined with status + client
    const joinedQuery = `
      SELECT 
        c.id,
        c.agenda,
        c.time,
        c.date,
        c.status_id,
        s.status_desc,
        c.client_id,
        cl.firstname AS name,
        cl.surname
      FROM calendar c
      LEFT JOIN calendar_status s ON c.status_id = s.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = $1;
    `;
    const { rows } = await companyPool.query(joinedQuery, [newId]);

    res.json({ success: true, agenda: rows[0] });
  } catch (err) {
    console.error("❌ Error inserting calendar entry:", err);
    res.status(500).json({ success: false, message: "Error adding agenda" });
  }
});

// Update an existing agenda by ID (returns joined record)
app.put("/api/calendar/:company/:id", async (req, res) => {
  const { company, id } = req.params;
  const { title, time, status_id, date } = req.body;
  const companyPool = getCompanyPool(company);

  try {
    await companyPool.query(
      `UPDATE calendar
       SET agenda = $1,
           time = $2,
           status_id = $3,
           date = $4
       WHERE id = $5`,
      [title, time, status_id, date, id]
    );

    const { rows } = await companyPool.query(
      `SELECT c.*, s.status_desc, cl.firstname AS name, cl.surname
       FROM calendar c
       LEFT JOIN calendar_status s ON c.status_id = s.id
       LEFT JOIN clients cl ON c.client_id = cl.id
       ORDER BY c.date`
    );

    res.json({ success: true, entries: rows });
  } catch (err) {
    console.error("Update agenda error:", err);
    res.status(500).json({ success: false, message: "Failed to update agenda" });
  }
});



// Delete an agenda entry
app.delete("/api/calendar/:company/:id", async (req, res) => {
  const { company, id } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const { rowCount } = await companyPool.query(`DELETE FROM calendar WHERE id = $1`, [id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: "Agenda not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting agenda:", err);
    res.status(500).json({ success: false, message: "Error deleting agenda" });
  }
});

// Delete a status by id
app.delete("/api/status/:company/:id", async (req, res) => {
  const { company, id } = req.params;
  const companyPool = getCompanyPool(company);

  try {
    const { rowCount } = await companyPool.query(
      `DELETE FROM calendar_status WHERE id = $1`,
      [id]
    );

    if (rowCount === 0) {
      return res.json({
        success: false,
        message: "Cannot delete status. It is used in the diary or does not exist."
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting status" });
  }
});

// ---------------------
// Client Router
// ---------------------

// search for clientss
app.get("/api/search-clients/:company", async (req, res) => {
  const { company } = req.params;
  const { name = "", surname = "" } = req.query;
  const companyPool = getCompanyPool(company);

  try {
    const searchQuery = `
      SELECT id, firstname AS name, surname
      FROM clients
      WHERE 
        ($1 = '' OR firstname ILIKE '%' || $1 || '%')
        AND ($2 = '' OR surname ILIKE '%' || $2 || '%')
      ORDER BY firstname  ASC
      LIMIT 50;
    `;

    const { rows } = await companyPool.query(searchQuery, [name, surname]);

    res.json({ success: true, clients: rows });
  } catch (err) {
    console.error("Error searching clients:", err);
    res.status(500).json({ success: false, message: "Error searching clients" });
  }
});

// ---------------------
// ✅ Start Server
// ---------------------
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await createDatabaseIfNotExists("nexsys");
  await seedDefaultUsers();
});
