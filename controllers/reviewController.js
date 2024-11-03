// controllers/reviewController.js
const Review = require('../models/review');

exports.createReview = async (req, res) => {
    try {
        const { item_id, review, rating } = req.body;
        const userId = req.user.id; // Extract user ID from the token

        // Logging for debugging
        console.log("Creating review for item:", item_id);
        console.log("User ID from token:", userId);
        console.log("Review content:", review);
        console.log("Rating:", rating);

        const newReview = await Review.create({ item_id, user_id: userId, review, rating });
        res.status(201).json(newReview);
    } catch (error) {
        console.error("Error creating review:", error); // Log the error for debugging

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ error: "User has already rated this item." });
        }
        res.status(500).json({ error: "Failed to create review." });
    }
};


exports.getReviewsByItemId = async (req, res) => {
    try {
        const { item_id } = req.params;
        const reviews = await Review.findAll({ where: { item_id } });

        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve reviews.' });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { review, rating } = req.body;

        const updatedReview = await Review.update({ review, rating }, { where: { id } });

        if (!updatedReview[0]) {
            return res.status(404).json({ error: 'Review not found.' });
        }

        return res.status(200).json({ message: 'Review updated successfully!' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update review.' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await Review.destroy({ where: { id } });

        if (!deletedReview) {
            return res.status(404).json({ error: 'Review not found.' });
        }

        return res.status(200).json({ message: 'Review deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete review.' });
    }
};