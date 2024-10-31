/*app.post('/rate', (req, res) => {
    const { raterId, ratedUserId, rating } = req.body;

    const sql = `
        INSERT INTO Ratings (rater_id, rated_user_id, rating)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = ?`;

    db.query(sql, [raterId, ratedUserId, rating, rating], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding rating', error: err });
        }
        res.status(200).json({ message: 'Rating added successfully', result });
    });
});
*/