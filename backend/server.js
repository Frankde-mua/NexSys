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

import ageAnalysis from "./routes/reports/ageAnalysis.js";
import allocationsList from "./routes/reports/allocationsList.js";
import cashierReport from "./routes/reports/cashierReport.js";
import dailyInvoiceListing from "./routes/reports/dailyInvoiceListing.js";
import dailyTurnover from "./routes/reports/dailyTurnover.js";
import discountListing from "./routes/reports/discountListing.js";
import creditSundryReport from "./routes/reports/creditSundryReport.js";
import debitSundryReport from "./routes/reports//debitSundryReport.js";
import expenseReport from "./routes/reports/expenseReport.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Mount routes - Pages
app.use("/api", authRoutes);
app.use("/api", companyRoutes);
app.use("/api", userRoutes);
app.use("/api", expenseRoutes);
app.use("/api/email", emailRoutes);
app.use("/api", calendarRoutes);
app.use("/api", clientRoutes);

// Financial routes
app.use("/api/invoices", invoiceRoutes);
app.use("/api/credit-notes", creditNoteRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/journals", journalRoutes);

// Report routes
app.use("/api/reports/age-analysis", ageAnalysis);
app.use("/api/reports/allocations-list", allocationsList);
app.use("/api/reports/cashier-report", cashierReport);
app.use("/api/reports/daily-invoice-listing", dailyInvoiceListing);
app.use("/api/reports/daily-turnover", dailyTurnover);
app.use("/api/reports/discount-listing", discountListing);
app.use("/api/reports/credit-sundry-report", creditSundryReport);
app.use("/api/reports/debit-sundry-report", debitSundryReport);
app.use("/api/reports/expense-report", expenseReport);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // await createDatabaseIfNotExists("nexsys");
  // await seedDefaultUsers();
});
