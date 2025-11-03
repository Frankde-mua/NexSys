import express from "express";
import { getCompanyPool } from "../db.js";
import {
  createTransaction,
  getTransactionsByType,
} from "../controllers/transactionController.js";
import { convertInvoiceToCreditNote } from "../controllers/conversionController.js";

const router = express.Router();

router.post("/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await createTransaction("INV", req, res, pool);
});

router.get("/:company", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await getTransactionsByType("INV", req, res, pool);
});

router.post("/:company/:invoice_id/convert-to-credit", async (req, res) => {
  const { company } = req.params;
  const pool = getCompanyPool(company);
  await convertInvoiceToCreditNote(req, res, pool);
});

export default router;
