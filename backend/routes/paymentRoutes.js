import express from "express";
import { getCompanyPool } from "../db.js";
import {
  createTransaction,
  getTransactionsByType,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await createTransaction("PAY", req, res, pool);
});

router.get("/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await getTransactionsByType("PAY", req, res, pool);
});

export default router;
