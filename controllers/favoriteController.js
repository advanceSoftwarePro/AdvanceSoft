const Favorite = require('../models/Favorite');
const Item = require('../models/items'); 
exports.addFavorite = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { item_id } = req.body;

        if (!item_id) {
            return res.status(400).json({ error: 'Item ID is required in the request body' });
        }

        if (!Number.isInteger(item_id) || item_id <= 0) {
            return res.status(400).json({ error: 'Invalid item ID format' });
        }

        const item = await Item.findByPk(item_id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found in the database' });
        }
        const existingFavoriteItem = await Favorite.findOne({ where: { user_id, item_id } });
        if (existingFavoriteItem) {
            return res.status(409).json({ error: 'Item is already in favorites' });
        }
        const favoriteItem = await Favorite.create({ user_id, item_id });
        res.status(201).json(favoriteItem);
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ error: 'Failed to add to favorites' });
    }
};



exports.removeFavorite = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id; 

        const favoriteItem = await Favorite.findOne({ where: { id, user_id: userId } });
        if (!favoriteItem) {
            return res.status(404).json({ error: 'Favorite item not found or does not belong to the user' });
        }
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


exports.getFavorites = async (req, res) => {
    try {
        const user_id = req.user.id; 
        const favoriteItems = await Favorite.findAll({ where: { user_id } });
        if (favoriteItems.length === 0) {
            return res.status(200).json({ message: 'Favorite is empty.' });
        }

        res.json(favoriteItems);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
};
