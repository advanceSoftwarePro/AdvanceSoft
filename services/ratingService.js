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

// Rating route - Create a new rating
router.post('/', async (req, res) => {
    const { ratedUserId, rating } = req.body; // Get ratedUserId and rating from body
    const raterId = req.user.id; // Get the raterId from the token

    try {
        // Check if the user has already rated this user
        const existingRating = await pool.query(
            `SELECT * FROM advance.Ratings WHERE rater_id = $1 AND rated_user_id = $2`,
            [raterId, ratedUserId]
        );

        if (existingRating.rows.length > 0) {
            return res.status(400).json({ message: 'You can only rate a user once.' });
        }

        // Insert the new rating
        const result = await pool.query(
            `INSERT INTO advance.Ratings (rater_id, rated_user_id, rating) VALUES ($1, $2, $3) RETURNING *`,
            [raterId, ratedUserId, rating]
        );

        res.status(200).json({ message: 'Rating added successfully', result: result.rows[0] });
    } catch (err) {
        console.error('Error adding rating:', err);
        res.status(500).json({ message: 'Error adding rating', error: err });
    }
});

// Get ratings for the logged-in user
router.get('/', async (req, res) => {
    const userId = req.user.id; // Get userId from token

    try {
        const result = await pool.query(
            `SELECT * FROM advance.Ratings WHERE rated_user_id = $1`,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error retrieving ratings:', err);
        res.status(500).json({ message: 'Error retrieving ratings', error: err });
    }
});

// Update a rating
router.put('/:rate_id', async (req, res) => {
    const { rating } = req.body; // Get new rating from body
    const rateId = req.params.rate_id; // Get rate ID from URL

    try {
        const result = await pool.query(
            `UPDATE advance.Ratings SET rating = $1 WHERE id = $2 RETURNING *`,
            [rating, rateId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        res.status(200).json({ message: 'Rating updated successfully', result: result.rows[0] });
    } catch (err) {
        console.error('Error updating rating:', err);
        res.status(500).json({ message: 'Error updating rating', error: err });
    }
});

// Delete a rating
router.delete('/:rate_id', async (req, res) => {
    const rateId = req.params.rate_id; // Get rate ID from URL

    try {
        const deletedCount = await pool.query(
            `DELETE FROM advance.Ratings WHERE id = $1`,
            [rateId]
        );

        if (deletedCount.rowCount === 0) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (err) {
        console.error('Error deleting rating:', err);
        res.status(500).json({ message: 'Error deleting rating', error: err });
    }
});

module.exports = router;
