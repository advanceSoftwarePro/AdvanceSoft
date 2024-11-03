const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

// Database connection using connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432, // Default PostgreSQL port
});

// Create a new rating
exports.createRating = async (req, res) => {
    const { ratedUserId, rating } = req.body;
    const raterId = req.user.id; // Get the rater ID from the authenticated user

    const sqlCheck = `
        SELECT * FROM advance.Ratings 
        WHERE rater_id = $1 AND rated_user_id = $2;
    `;

    const sqlInsert = `
        INSERT INTO advance.Ratings (rater_id, rated_user_id, rating)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    try {
        // Check if the rating already exists
        const checkResult = await pool.query(sqlCheck, [raterId, ratedUserId]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'You have already rated this user.' });
        }

        const insertResult = await pool.query(sqlInsert, [raterId, ratedUserId, rating]);
        res.status(201).json({ message: 'Rating added successfully', result: insertResult.rows[0] });
    } catch (err) {
        console.error('Error adding rating:', err);
        res.status(500).json({ message: 'Error adding rating', error: err });
    }
};

// Get ratings for a specific user
exports.getRatingsByUserId = async (req, res) => {
    const ratedUserId = req.params.userId;

    const sql = `
        SELECT * FROM advance.Ratings 
        WHERE rated_user_id = $1;
    `;

    try {
        const result = await pool.query(sql, [ratedUserId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error retrieving ratings:', err);
        res.status(500).json({ message: 'Error retrieving ratings', error: err });
    }
};

// Update an existing rating
exports.updateRating = async (req, res) => {
    const { rating } = req.body;
    const raterId = req.user.id; // Get the rater ID from the authenticated user
    const ratedUserId = req.params.userId; // The user being rated

    const sqlUpdate = `
        UPDATE advance.Ratings 
        SET rating = $1 
        WHERE rater_id = $2 AND rated_user_id = $3
        RETURNING *;
    `;

    try {
        const updateResult = await pool.query(sqlUpdate, [rating, raterId, ratedUserId]);

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ message: 'Rating not found.' });
        }

        res.status(200).json({ message: 'Rating updated successfully!', result: updateResult.rows[0] });
    } catch (err) {
        console.error('Error updating rating:', err);
        res.status(500).json({ message: 'Error updating rating', error: err });
    }
};

// Delete a rating
exports.deleteRating = async (req, res) => {
    const raterId = req.user.id; // Get the rater ID from the authenticated user
    const ratedUserId = req.params.userId; // The user being rated

    const sqlDelete = `
        DELETE FROM advance.Ratings 
        WHERE rater_id = $1 AND rated_user_id = $2
        RETURNING *;
    `;

    try {
        const deleteResult = await pool.query(sqlDelete, [raterId, ratedUserId]);

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ message: 'Rating not found.' });
        }

        res.status(200).json({ message: 'Rating deleted successfully!' });
    } catch (err) {
        console.error('Error deleting rating:', err);
        res.status(500).json({ message: 'Error deleting rating', error: err });
    }
};
