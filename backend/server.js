import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { createDatabaseIfNotExists, seedDefaultUsers } from "./utils/seedHelpers.js";

// Routers
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import emailRoutes from "./routes/emailRoutes.js"; 

import invoiceRoutes from "./routes/invoiceRoutes.js";
import creditNoteRoutes from "./routes/creditNoteRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Mount routes
app.use("/api", authRoutes);
app.use("/api", companyRoutes);
app.use("/api", userRoutes);
app.use("/api", expenseRoutes);
app.use("/api/email", emailRoutes);
app.use("/api", calendarRoutes);
app.use("/api", clientRoutes);

app.use("/api/invoices", invoiceRoutes);
app.use("/api/credit-notes", creditNoteRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/journals", journalRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await createDatabaseIfNotExists("nexsys");
  await seedDefaultUsers();
});
