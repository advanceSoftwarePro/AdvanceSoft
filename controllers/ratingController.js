const { Pool } = require('pg');
require('dotenv').config(); 

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432, 
});

async function updateUserRating(userId, newRating) {
    try {
        const userResult = await pool.query(`
            SELECT * FROM advance."Users" WHERE "UserID" = $1;
        `, [userId]);

        if (userResult.rows.length === 0) {
            console.log('User not found.');
            return;
        }

        const user = userResult.rows[0];
        const totalRatings = user.numberOfRatings;
        const currentRating = user.Rating;

        const newTotalRating = ((currentRating * totalRatings) + newRating) / (totalRatings + 1);

        await pool.query(`
            UPDATE advance."Users" 
            SET "Rating" = $1, "numberOfRatings" = $2 
            WHERE "UserID" = $3;
        `, [newTotalRating, totalRatings + 1, userId]);

        console.log(`User's new rating: ${newTotalRating}`);

        if (newTotalRating < 2.5 && newTotalRating > 1.5) {
            console.log(`Sending notification to user with email ${user.Email}`);
            await sendEmail(
                user.Email,
                '🚨 Important: Your Rating Has Dropped Below 2.5',
                `Hello ${user.FullName},\n\nWe noticed that your rating has dropped below 2.5. This could impact your ability to maintain your account on our platform. Please take a moment to review and improve your service to ensure a positive experience for all users.\n\nThank you,\nRental Platform Team`,
                `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #d9534f;">🚨 Important: Your Rating Has Dropped Below 2.5</h2>
                    <p>Hello <strong>${user.FullName}</strong>,</p>
                    <p>We noticed that your rating has dropped below <strong>2.5</strong>. This could impact your ability to maintain your account on our platform.</p>
                    <p>Please take a moment to review and improve your service to ensure a positive experience for all users.</p>
                    <p>Thank you,<br>Rental Platform Team</p>
                    <hr style="border: none; border-top: 1px solid #eee;" />
                    <p style="font-size: 0.9em; color: #666;">If you have any questions, please contact our support team.</p>
                </div>
                `
            );
        }

        if (newTotalRating <= 1.5) {
            console.log(`Deleting user with UserID ${user.UserID} due to low rating.`);
            await sendEmail(
                user.Email,
                '⚠️ Important: Account Deletion Due to Low Rating',
                `Hello ${user.FullName},\n\nWe regret to inform you that your account has been deleted due to a low rating of ${newTotalRating}. Unfortunately, this rating did not meet the platform's required standards for active accounts.\n\nIf you believe this action was taken in error, please contact our support team.\n\nThank you for your understanding,\nRental Platform Team`,
                `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #d9534f;">⚠️ Important: Account Deletion Due to Low Rating</h2>
                    <p>Hello <strong>${user.FullName}</strong>,</p>
                    <p>We regret to inform you that your account has been deleted due to a low rating of <strong>${newTotalRating}</strong>. Unfortunately, this rating did not meet the platform's required standards for active accounts.</p>
                    <p>If you believe this action was taken in error, please contact our support team for further assistance.</p>
                    <p>Thank you for your understanding,<br>Rental Platform Team</p>
                    <hr style="border: none; border-top: 1px solid #eee;" />
                    <p style="font-size: 0.9em; color: #666;">For further inquiries, please reach out to our support team.</p>
                </div>
                `
            );
            await pool.query(`DELETE FROM advance."Users" WHERE "UserID" = $1;`, [userId]);
        }

    } catch (error) {
        console.error('Error updating user rating:', error);
    }
}

exports.createRating = async (req, res) => {
    const { ratedUserId, rating } = req.body;
    const raterId = req.user.id; 

    if (!ratedUserId) {
        return res.status(400).json({ message: 'Rated user ID is required.' });
    }
    if (rating === undefined) { 
        return res.status(400).json({ message: 'Rating value is required.' });
    }


    
    if (raterId === ratedUserId) {
        return res.status(400).json({ message: 'You cannot rate yourself.' });
    }

    
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
        
        const checkResult = await pool.query(sqlCheck, [raterId, ratedUserId]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'You have already rated this user.' });
        }

        const insertResult = await pool.query(sqlInsert, [raterId, ratedUserId, rating]);
        await updateUserRating(ratedUserId, rating);
        res.status(201).json({ message: 'Rating added successfully', result: insertResult.rows[0] });
    } catch (err) {
        console.error('Error adding rating:', err);
        res.status(500).json({ message: 'Error adding rating', error: err });
    }
};


exports.getRatingsByUserId = async (req, res) => {
    const ratedUserId = parseInt(req.params.userId, 10);
    
    
    if (isNaN(ratedUserId)) {
        return res.status(400).json({ message: 'Invalid userId format.' });
    }

    
    const sqlCheckUser = `
        SELECT * FROM advance."Users" 
        WHERE "UserID" = $1;
    `;

    const sqlGetRatings = `
        SELECT * FROM advance."ratings" 
        WHERE rated_user_id = $1;
    `;

    try {
        
        const userResult = await pool.query(sqlCheckUser, [ratedUserId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const ratingsResult = await pool.query(sqlGetRatings, [ratedUserId]);
        res.status(200).json(ratingsResult.rows);
        
    } catch (err) {
        console.error('Error retrieving ratings:', err);
        res.status(500).json({ message: 'Error retrieving ratings', error: err.message });
    }
};


exports.updateRating = async (req, res) => {
    const { rating } = req.body;
    const raterId = req.user.id; 
    const ratedUserId = req.params.userId; 

    if (rating === undefined) {
        return res.status(400).json({ message: "Rating field is required." });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

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

        await updateUserRating(ratedUserId, rating);
        res.status(200).json({ message: 'Rating updated successfully!', result: updateResult.rows[0] });
    } catch (err) {
        console.error('Error updating rating:', err);
        res.status(500).json({ message: 'Error updating rating', error: err });
    }
};


exports.deleteRating = async (req, res) => {
    const raterId = req.user.id; 
    const ratedUserId = req.params.userId; 

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
