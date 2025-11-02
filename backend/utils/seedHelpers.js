import { systemPool, nexsysPool } from "../db.js";
import { usersToSeed } from "../data.js";

export const createDatabaseIfNotExists = async (dbName) => {
  try {
    await systemPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Created database ${dbName}`);
  } catch (err) {
    if (err.code === "42P04") {
      console.log(`⚠️ Database ${dbName} already exists`);
    } else {
      throw err;
    }
  }
};

export const seedDefaultUsers = async () => {
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
        company_name VARCHAR(100) REFERENCES companies(company_name),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    for (const u of usersToSeed) {
      const dbName = `company_${u.company.toLowerCase().replace(/\s+/g, "_")}`;
      if (u.role !== "superadmin") await createDatabaseIfNotExists(dbName);

      await nexsysPool.query(
        `INSERT INTO companies (company_name) VALUES ($1) ON CONFLICT DO NOTHING`,
        [u.company]
      );

      const userExists = await nexsysPool.query(
        `SELECT * FROM users WHERE username=$1 AND company_name=$2`,
        [u.username, u.company]
      );

      if (userExists.rowCount === 0) {
        await nexsysPool.query(
          `INSERT INTO users (username, password, email, company_name, role)
           VALUES ($1,$2,$3,$4,$5)`,
          [u.username, u.password, u.email, u.company, u.role]
        );
        console.log(`✅ Seeded ${u.username} (${u.role})`);
      }
    }
  } catch (err) {
    console.error("❌ Error seeding:", err);
  }
};
