import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// Main Nexsys pool
export const nexsysPool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: "nexsys",
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// System pool (for creating databases)
export const systemPool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DEFAULT_DB || "postgres",
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Get company-specific DB pool
export const getCompanyPool = (companyName) => {
  const dbName = `company_${companyName.toLowerCase().replace(/\s+/g, "_")}`;
  return new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: dbName,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
};
