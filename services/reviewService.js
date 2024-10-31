const express = require('express');
const { Pool } = require('pg'); // Use pg for PostgreSQL

const router = express.Router();

// Database connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432, // Default PostgreSQL port, configurable
});

// Add a review
router.post('/', async (req, res) => {
    const { item_id, user_id, review, rating } = req.body; // Using snake_case for consistency

    // Basic parameter validation
    if (!item_id || !user_id || !review || rating == null) {
        return res.status(400).json({ message: 'Invalid input. Please provide item_id, user_id, review, and rating.' });
    }

    try {
        const sql = `
            INSERT INTO Reviews (item_id, user_id, review, rating)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

        const result = await pool.query(sql, [item_id, user_id, review, rating]);
        res.status(201).json({
            message: 'Review added successfully',
            review: result.rows[0],
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Error adding review' }); // Generic error message
    }
});

// Get reviews for an item
router.get('/:item_id', async (req, res) => { // Changed to snake_case for consistency
    const { item_id } = req.params;

    try {
        const sql = 'SELECT * FROM Reviews WHERE item_id = $1';
        const result = await pool.query(sql, [item_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Error fetching reviews' }); // Generic error message
    }
});

module.exports = router;
