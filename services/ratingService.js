const express = require('express');
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

const router = express.Router();

// Database connection using connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432, // Default PostgreSQL port
});

// Rating route
router.post('/', async (req, res) => {
    const { raterId, ratedUserId, rating } = req.body;

    const sql = `
        INSERT INTO advance.Ratings (rater_id, rated_user_id, rating)
        VALUES ($1, $2, $3)
        ON CONFLICT (rater_id, rated_user_id) 
        DO UPDATE SET rating = EXCLUDED.rating
        RETURNING *;
    `;

    try {
        const result = await pool.query(sql, [raterId, ratedUserId, rating]);
        res.status(200).json({ message: 'Rating added successfully', result: result.rows[0] });
    } catch (err) {
        console.error('Error adding rating:', err);
        res.status(500).json({ message: 'Error adding rating', error: err });
    }
});

module.exports = router;
