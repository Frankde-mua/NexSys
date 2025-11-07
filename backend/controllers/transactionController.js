import { Fence } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a transaction (invoice, payment, credit note, journal, quote)
 * @param {string} type - Transaction type code ('INV', 'PAY', 'CRN', 'JRN', 'QTE')
 * @param {*} req - Express request
 * @param {*} res - Express response
 * @param {*} pool - pg.Pool for the company
 */
export const createTransaction = async (type, req, res, pool) => {
  const client = await pool.connect();
  try {
    const {
      patient_id,
      account_id = null,
      practitioner_id = null,
      date = new Date(),
      billingRows = [],
      description = null,
    } = req.body;

    if (!patient_id) return res.status(400).json({ error: "patient_id required" });
    if (!Array.isArray(billingRows) || billingRows.length === 0)
      return res.status(400).json({ error: "billingRows must be a non-empty array" });

    await client.query("BEGIN");

    // 1️⃣ Transaction type
    const txTypeRes = await client.query(
      `SELECT id, prefix, is_debit FROM transaction_types WHERE code = $1`,
      [type]
    );
    if (txTypeRes.rowCount === 0)
      return res.status(400).json({ error: "Invalid transaction type" });

    const { id: transaction_type_id, prefix, is_debit } = txTypeRes.rows[0];

    // 2️⃣ Single document number for all lines
    const seqRes = await client.query(`SELECT nextval('${prefix.toLowerCase()}_number_seq') AS seq`);
    const nextSeq = seqRes.rows[0].seq;
    const document_number = `${prefix}-${String(nextSeq).padStart(5, "0")}`;

    const insertQuery = `
      INSERT INTO patientx (
        patient_id, account_id, practitioner_id,
        optom_tariff_id, medical_tariff_id, inventory_id,
        transaction_type_id, document_number, reference_no,
        description, date, narrative, qty, fee, discount,
        patient_portion, medical_aid_portion, debit, credit, balance
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      )
      RETURNING *;
    `;

    const inserted = [];

    for (const row of billingRows) {
      // 3️⃣ Convert and sanitize numbers
      const num = v => (v === null || v === undefined || isNaN(Number(v)) ? 0 : Number(v));

      const qty = num(row.qty);
      const fee = num(row.fee);
      const discount = num(row.discount) + 0;
      const patient_portion = num(row.patient_portion ?? row.patientPortion) || 0;
      const medical_aid_portion = num(row.medical_portion ?? row.medicalPortion) || 0; 
      const debit = num(row.debit) || 0;
      console.log("patient port:", patient_portion)
      console.log("row debit", debit);
      const credit = num(
        row.credit !== undefined
          ? row.credit
          : !is_debit
            ? patient_portion + medical_aid_portion || fee
            : 0
      );
      const balance = debit;

      const values = [
        patient_id,                               // 1
        account_id,                               // 2
        practitioner_id,                          // 3
        row.optom_tariff_id ?? row.tariff_id ?? null, // 4
        row.medical_tariff_id ?? null,            // 5
        row.inventory_id ?? null,                 // 6
        transaction_type_id,                      // 7
        document_number,                          // 8
        null,                                     // 9 - reference_no (optional)
        description ?? row.narrative ?? "Transaction", // 10
        date,                                     // 11
        row.narrative ?? null,                    // 12
        qty,                                      // 13
        fee,                                      // 14
        discount,                                 // 15
        patient_portion,                          // 16
        medical_aid_portion,                      // 17
        debit,                                    // 18
        credit,                                   // 19
        balance                                   // 20 ✅ FIXED
      ];

      // console.log("Inserting values:", values);
      console.log(debit, balance, document_number);
      const result = await client.query(insertQuery, values);
      
      inserted.push(result.rows[0]);
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: `${type} created successfully`,
      document_number,
      rows: inserted,
    });
    console.log(res.status);
    return res.status;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error inserting transaction:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};


/**
 * Get transactions by type (e.g., all invoices)
 */
export const getTransactionsByType = async (type, req, res, pool) => {
  try {
    const result = await pool.query(
      `SELECT px.*, tt.code AS transaction_code, p.first_name, p.last_name, a.account_number
       FROM patientx px
       JOIN transaction_types tt ON px.transaction_type_id = tt.id
       JOIN patients p ON px.patient_id = p.id
       LEFT JOIN accounts a ON px.account_id = a.id
       WHERE tt.code = $1
       ORDER BY px.date DESC, px.id DESC`,
      [type]
    );

    res.json({ success: true, count: result.rowCount, transactions: result.rows });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};
