// controllers/reviewController.js
const Review = require('../models/review');

exports.createReview = async (req, res) => {
    try {
      const { item_id, user_id, review, rating } = req.body;
  
      const newReview = await Review.create({ item_id, user_id, review, rating });
      res.status(201).json(newReview);
    } catch (error) {
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
