const Review = require('../models/review');
const Item = require('../models/items'); 

exports.createReview = async (req, res) => {
    try {
        const { item_id, review, rating } = req.body;
        const userId = req.user.id; 
        if (!item_id) {
            return res.status(400).json({ error: "Missing item ID." });
        }
        if (!review) {
            return res.status(400).json({ error: "Missing review." });
        }
        if (rating === undefined) {
            return res.status(400).json({ error: "Missing rating." });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Invalid rating value. Rating must be between 1 and 5." });
        }
        const item = await Item.findByPk(item_id);
        if (!item) {
            return res.status(404).json({ error: "Item not found." });
        }
        if (item.user_id === userId) {
            return res.status(403).json({ error: "You cannot rate your own item." });
        }
        console.log("Creating review for item:", item_id);
        console.log("User ID from token:", userId);
        console.log("Review content:", review);
        console.log("Rating:", rating);

        const newReview = await Review.create({ item_id, user_id: userId, review, rating });
        res.status(201).json(newReview);
    } catch (error) {
        console.error("Error creating review:", error); 

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ error: "User has already rated this item." });
        }
        
        res.status(500).json({ error: "Failed to create review." });
    }
};



exports.getReviewsByItemId = async (req, res) => {
    try {
        const { item_id } = req.params;
        const item = await Item.findByPk(item_id);
        if (!item) {
            return res.status(404).json({ error: 'User not found.' });
        }
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
        const existingReview = await Review.findByPk(id);
        if (!existingReview) {
            return res.status(404).json({ error: 'Review not found.' });
        }
        const userId = req.user.id; 
        if (existingReview.user_id !== userId) {
            return res.status(403).json({ error: "You can only update your own reviews." });
        }
        if (!review && rating === undefined) {
            return res.status(400).json({ error: "At least one of review or rating must be provided." });
        }
        if (rating !== undefined) {
            if (typeof rating !== 'number' || rating < 1 || rating > 5) {
                return res.status(400).json({ error: "Invalid rating value. Rating must be a number between 1 and 5." });
            }
        }
        await Review.update({ review, rating }, { where: { id } });

        return res.status(200).json({ message: 'Review updated successfully!' });
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ error: 'Failed to update review.' });
    }
};



exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id; 
        const existingReview = await Review.findByPk(id);
        if (!existingReview) {
            return res.status(404).json({ error: 'Review not found.' });
        }
        if (existingReview.user_id !== userId) {
            return res.status(403).json({ error: "You can only delete your own reviews." });
        }
        await Review.destroy({ where: { id } });

        return res.status(200).json({ message: 'Review deleted successfully!' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ error: 'Failed to delete review.' });
    }
};
