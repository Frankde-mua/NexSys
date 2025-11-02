import express from 'express';
import { getCompanyPool } from '../db.js';

const router = express.Router();

// Get all quotes for a client
router.get('/quotes/:company/:clientId', async (req, res) => {
    const { company, clientId } = req.params;
    const pool = getCompanyPool(company);
    try {
        const { rows } = await pool.query(
            'SELECT * FROM quotes WHERE client_id = $1 ORDER BY created_at DESC',
            [clientId]
        );
        res.json({ success: true, quotes: rows });
    }
    catch (err) {
        console.error('Error fetching quotes:', err);
        res.status(500).json({ success: false, message: 'Error fetching quotes' });
    }
});

// Convert quote to invoice
router.post('/quotes/convert/:company/:quoteId', async (req, res) => {
    const { company, quoteId } = req.params;
    const pool = getCompanyPool(company);
    try {
        // Fetch the quote
        const { rows } = await pool.query(
            'SELECT * FROM quotes WHERE id = $1',
            [quoteId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }
        const quote = rows[0];
        // Insert into invoices table
        const insertResult = await pool.query(
            `INSERT INTO invoices (client_id, amount, status, created_at)
             VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [quote.client_id, quote.amount, 'Pending']
        );
        res.json({ success: true, invoice: insertResult.rows[0] });
    }
    catch (err) {
        console.error('Error converting quote to invoice:', err);
        res.status(500).json({ success: false, message: 'Error converting quote to invoice' });
    }

});

// set qoute as converted
router.post('/quotes/mark-converted/:company/:quoteId', async (req, res) => {
    const { company, quoteId } = req.params;   
    const pool = getCompanyPool(company);
    try {
        await pool.query(
            'UPDATE quotes SET status = $1 WHERE id = $2',
            ['Converted', quoteId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error marking quote as converted:', err);
        res.status(500).json({ success: false, message: 'Error marking quote as converted' });
    }   
}); 

export default router;