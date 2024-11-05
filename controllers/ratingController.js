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

    if (!ratedUserId) {
        return res.status(400).json({ message: 'Rated user ID is required.' });
    }
    if (rating === undefined) { // Explicit check for undefined to allow 0 or falsy values
        return res.status(400).json({ message: 'Rating value is required.' });
    }


    // Check if the user is trying to rate themselves
    if (raterId === ratedUserId) {
        return res.status(400).json({ message: 'You cannot rate yourself.' });
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

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
// Get ratings for a specific user
exports.getRatingsByUserId = async (req, res) => {
    const ratedUserId = parseInt(req.params.userId, 10);
    
    // Validate if userId is a valid integer
    if (isNaN(ratedUserId)) {
        return res.status(400).json({ message: 'Invalid userId format.' });
    }

    // SQL query to check if the user exists
    const sqlCheckUser = `
        SELECT * FROM advance."Users" 
        WHERE "UserID" = $1;
    `;

    const sqlGetRatings = `
        SELECT * FROM advance."Ratings" 
        WHERE rated_user_id = $1;
    `;

    try {
        // Check if the user exists in the database
        const userResult = await pool.query(sqlCheckUser, [ratedUserId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Get ratings for the existing user
        const ratingsResult = await pool.query(sqlGetRatings, [ratedUserId]);
        res.status(200).json(ratingsResult.rows);
        
    } catch (err) {
        console.error('Error retrieving ratings:', err);
        res.status(500).json({ message: 'Error retrieving ratings', error: err.message });
    }
};

// Update an existing rating
// Update an existing rating
exports.updateRating = async (req, res) => {
    const { rating } = req.body;
    const raterId = req.user.id; // Get the rater ID from the authenticated user
    const ratedUserId = req.params.userId; // The user being rated

    // Check if the rating field is provided
    if (rating === undefined) {
        return res.status(400).json({ message: "Rating field is required." });
    }

    // Validate the rating value
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Validate the user ID format
    if (isNaN(ratedUserId) || !Number.isInteger(Number(ratedUserId))) {
        return res.status(400).json({ message: "Invalid userId format." });
    }

    const sqlUpdate = `
        UPDATE advance.Ratings 
        SET rating = $1 
        WHERE rater_id = $2 AND rated_user_id = $3
        RETURNING *;
    `;

    try {
        // Check if the user is authorized to update the rating
        const checkAuth = await pool.query(`
            SELECT * FROM advance.Ratings 
            WHERE rater_id = $1 AND rated_user_id = $2;
        `, [raterId, ratedUserId]);

        if (checkAuth.rows.length === 0) {
            return res.status(403).json({ message: "You are not authorized to update this rating." });
        }

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
