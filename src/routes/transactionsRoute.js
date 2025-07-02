import express from 'express';
import { sql } from '../config/db.js'; // Adjust the path as necessary

const router = express.Router();

export default router;

router.post('/', async (req, res) => {
    const { user_id, title, amount, category } = req.body;
    if (!user_id || !title || amount === undefined || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const result = await sql`
            INSERT INTO transactions (user_id, title, amount, category)
            VALUES (${user_id}, ${title}, ${amount}, ${category})
            RETURNING *;
        `;
        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error inserting transaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await sql`
            SELECT * FROM transactions WHERE user_id = ${userId}
            ORDER BY created_at DESC;
        `;
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.get('/summary/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await sql`
            SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}
        `;
        res.status(200).json(result);

        const incomeResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as income FROM transactions WHERE user_id = ${userId} AND amount > 0;
        `;
        const expenseResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as expense FROM transactions WHERE user_id = ${userId} AND amount < 0;
        `;
        const summary = {
            balance: result[0].balance,
            income: incomeResult[0].income,
            expense: expenseResult[0].expense
        };
        res.status(200).json(summary);
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
);

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (isNaN(id) || !Number.isInteger(Number(id))) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }
        const transactionId = parseInt(id, 10);
        if (transactionId <= 0) {
            return res.status(400).json({ error: 'Transaction ID must be a positive integer' });
        }
        const result = await sql`
            DELETE FROM transactions WHERE id = ${id}
            RETURNING *;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

    next();
});