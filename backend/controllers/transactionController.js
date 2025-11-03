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
      account_id,
      practitioner_id,
      optom_tariff_id,
      medical_tariff_id,
      inventory_id,
      description,
      narrative,
      qty = 1,
      fee = 0.0,
      discount = 0.0,
      patient_portion = 0.0,
      medical_aid_portion = 0.0,
      date = new Date(),
    } = req.body;

    await client.query("BEGIN");

    // 1️⃣ Get transaction type
    const txTypeRes = await client.query(
      `SELECT id, prefix, is_debit FROM transaction_types WHERE code = $1`,
      [type]
    );
    if (txTypeRes.rowCount === 0)
      return res.status(400).json({ error: "Invalid transaction type" });

    const { id: transaction_type_id, prefix, is_debit } = txTypeRes.rows[0];

    // 2️⃣ Get next sequence number for this prefix
    const seqName = `${prefix.toLowerCase()}_number_seq`;
    const seqRes = await client.query(`SELECT nextval($1) AS seq`, [seqName]);
    const nextSeq = seqRes.rows[0].seq;
    const document_number = `${prefix}-${String(nextSeq).padStart(5, "0")}`;

    // 3️⃣ Calculate debit / credit values
    const totalFee = qty * fee - discount;
    const totalPortion = patient_portion + medical_aid_portion;

    const debit = is_debit ? totalPortion : 0;
    const credit = !is_debit ? totalPortion : 0;

    // 4️⃣ Get previous balance
    const balanceRes = await client.query(
      `SELECT COALESCE(SUM(debit - credit), 0) AS balance
       FROM patientx WHERE patient_id = $1`,
      [patient_id]
    );
    const prev_balance = balanceRes.rows[0].balance || 0;
    const new_balance = is_debit
      ? prev_balance + totalPortion
      : prev_balance - totalPortion;

    // 5️⃣ Insert transaction
    const insertQuery = `
      INSERT INTO patientx (
        patient_id, account_id, practitioner_id,
        optom_tariff_id, medical_tariff_id, inventory_id, transaction_type_id,
        document_number, description, narrative, qty, fee, discount,
        patient_portion, medical_aid_portion, debit, credit, balance, date
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
      )
      RETURNING *;
    `;

    const values = [
      patient_id,
      account_id,
      practitioner_id,
      optom_tariff_id,
      medical_tariff_id,
      inventory_id,
      transaction_type_id,
      document_number,
      description,
      narrative,
      qty,
      fee,
      discount,
      patient_portion,
      medical_aid_portion,
      debit,
      credit,
      new_balance,
      date,
    ];

    const insertRes = await client.query(insertQuery, values);
    const transaction = insertRes.rows[0];

    // 6️⃣ Update account balance
    await client.query(
      `UPDATE accounts
       SET current_balance = $1, updated_at = NOW()
       WHERE id = $2`,
      [new_balance, account_id]
    );

    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      message: `${type} created successfully`,
      document_number,
      transaction,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Failed to create transaction" });
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
