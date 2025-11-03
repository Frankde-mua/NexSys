/**
 * Convert an invoice into a credit note
 */
export const convertInvoiceToCreditNote = async (req, res, pool) => {
  const client = await pool.connect();
  try {
    const { invoice_id } = req.params;

    await client.query("BEGIN");

    const invRes = await client.query(
      `SELECT * FROM patientx WHERE id = $1`,
      [invoice_id]
    );
    if (invRes.rowCount === 0)
      return res.status(404).json({ error: "Invoice not found" });

    const invoice = invRes.rows[0];

    const txTypeRes = await client.query(
      `SELECT id, prefix FROM transaction_types WHERE code = 'CRN'`
    );
    const { id: transaction_type_id, prefix } = txTypeRes.rows[0];

    const seqRes = await client.query(`SELECT nextval($1) AS seq`, [
      `${prefix.toLowerCase()}_number_seq`,
    ]);
    const nextSeq = seqRes.rows[0].seq;
    const document_number = `${prefix}-${String(nextSeq).padStart(5, "0")}`;

    const credit = invoice.debit;
    const new_balance = invoice.balance - credit;

    const crnInsert = await client.query(
      `INSERT INTO patientx (
        patient_id, account_id, practitioner_id,
        optom_tariff_id, medical_tariff_id, inventory_id, transaction_type_id,
        document_number, description, narrative, qty, fee, discount,
        patient_portion, medical_aid_portion, debit, credit, balance, date
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
      )
      RETURNING *;`,
      [
        invoice.patient_id,
        invoice.account_id,
        invoice.practitioner_id,
        invoice.optom_tariff_id,
        invoice.medical_tariff_id,
        invoice.inventory_id,
        transaction_type_id,
        document_number,
        `Credit note for ${invoice.document_number}`,
        invoice.narrative,
        invoice.qty,
        invoice.fee,
        invoice.discount,
        invoice.patient_portion,
        invoice.medical_aid_portion,
        0,
        credit,
        new_balance,
        new Date(),
      ]
    );

    await client.query(
      `UPDATE accounts
       SET current_balance = $1, updated_at = NOW()
       WHERE id = $2`,
      [new_balance, invoice.account_id]
    );

    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      message: "Credit note created successfully",
      credit_note: crnInsert.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error converting invoice to credit note:", err);
    res.status(500).json({ error: "Failed to convert invoice" });
  } finally {
    client.release();
  }
};

/**
 * Convert a quote into an invoice
 */
export const convertQuoteToInvoice = async (req, res, pool) => {
  const client = await pool.connect();
  try {
    const { quote_id } = req.params;

    await client.query("BEGIN");

    const quoteRes = await client.query(
      `SELECT * FROM patientx WHERE id = $1`,
      [quote_id]
    );
    if (quoteRes.rowCount === 0)
      return res.status(404).json({ error: "Quote not found" });

    const quote = quoteRes.rows[0];

    const txTypeRes = await client.query(
      `SELECT id, prefix FROM transaction_types WHERE code = 'INV'`
    );
    const { id: transaction_type_id, prefix } = txTypeRes.rows[0];

    const seqRes = await client.query(`SELECT nextval($1) AS seq`, [
      `${prefix.toLowerCase()}_number_seq`,
    ]);
    const nextSeq = seqRes.rows[0].seq;
    const document_number = `${prefix}-${String(nextSeq).padStart(5, "0")}`;

    const debit = quote.patient_portion + quote.medical_aid_portion;

    const new_balance =
      (quote.balance || 0) + (quote.patient_portion + quote.medical_aid_portion);

    const invInsert = await client.query(
      `INSERT INTO patientx (
        patient_id, account_id, practitioner_id,
        optom_tariff_id, medical_tariff_id, inventory_id, transaction_type_id,
        document_number, description, narrative, qty, fee, discount,
        patient_portion, medical_aid_portion, debit, credit, balance, date
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
      )
      RETURNING *;`,
      [
        quote.patient_id,
        quote.account_id,
        quote.practitioner_id,
        quote.optom_tariff_id,
        quote.medical_tariff_id,
        quote.inventory_id,
        transaction_type_id,
        document_number,
        `Converted from quote ${quote.document_number}`,
        quote.narrative,
        quote.qty,
        quote.fee,
        quote.discount,
        quote.patient_portion,
        quote.medical_aid_portion,
        debit,
        0,
        new_balance,
        new Date(),
      ]
    );

    await client.query(
      `UPDATE accounts
       SET current_balance = $1, updated_at = NOW()
       WHERE id = $2`,
      [new_balance, quote.account_id]
    );

    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      message: "Quote converted to invoice successfully",
      invoice: invInsert.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error converting quote to invoice:", err);
    res.status(500).json({ error: "Failed to convert quote" });
  } finally {
    client.release();
  }
};
