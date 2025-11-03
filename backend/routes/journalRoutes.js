import express from "express";
import { getCompanyPool } from "../db.js";
import {
  createTransaction,
  getTransactionsByType,
} from "../controllers/transactionController.js";

const router = express.Router();

// Debit journal
router.post("/:company/debit", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await createTransaction("JRN", req, res, pool);
});

// Credit journal
router.post("/:company/credit", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await createTransaction("JRN", req, res, pool);
});

// Retrieve journals
router.get("/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await getTransactionsByType("JRN", req, res, pool);
});

export default router;
