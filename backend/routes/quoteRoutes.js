import express from "express";
import { getCompanyPool } from "../db.js";
import {
  createTransaction,
  getTransactionsByType,
} from "../controllers/transactionController.js";
import { convertQuoteToInvoice } from "../controllers/conversionController.js";

const router = express.Router();

router.post("/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await createTransaction("QTE", req, res, pool);
});

router.get("/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await getTransactionsByType("QTE", req, res, pool);
});

router.post("/:company/:quote_id/convert-to-invoice", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await convertQuoteToInvoice(req, res, pool);
});

export default router;
