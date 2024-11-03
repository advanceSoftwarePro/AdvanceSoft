const Favorite = require('../models/Favorite');

// Function to add an item to favorites
exports.addFavorite = async (req, res) => {
    try {
        const user_id = req.user.id; // Assuming user ID is stored in req.user after token verification
        const { item_id } = req.body; // Get item_id from request body

        // Check if the item is already in the user's favorites
        const existingFavoriteItem = await Favorite.findOne({ where: { user_id, item_id } });
        if (existingFavoriteItem) {
            return res.status(409).json({ error: 'Item is already in favorites' });
        }

        // Add to favorites if it doesn't already exist
        const favoriteItem = await Favorite.create({ user_id, item_id });
        res.status(201).json(favoriteItem);
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ error: 'Failed to add to favorites' });
    }
};

// Function to remove an item from favorites
exports.removeFavorite = async (req, res) => {
    try {
        const { id } = req.params; // Get the favorite ID from the URL params
        const userId = req.user.id; // Get the user ID from the authenticated request

        // Check if the favorite item exists for the user
        const favoriteItem = await Favorite.findOne({ where: { id, user_id: userId } });
        if (!favoriteItem) {
            return res.status(404).json({ error: 'Favorite item not found or does not belong to the user' });
        }

        // Proceed to delete if the favorite item exists and belongs to the user
        const deletedCount = await Favorite.destroy({ where: { id, user_id: userId } });
        if (deletedCount > 0) {
            res.status(200).json({ message: 'Favorite item removed successfully' });
        } else {
            res.status(404).json({ error: 'Favorite item not found' });
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ error: 'Failed to remove from favorites' });
    }
};

// Function to get all favorite items for the authenticated user
exports.getFavorites = async (req, res) => {
    try {
        const user_id = req.user.id; // Extract user_id from the authenticated request
        const favoriteItems = await Favorite.findAll({ where: { user_id } });
        res.json(favoriteItems);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
};
