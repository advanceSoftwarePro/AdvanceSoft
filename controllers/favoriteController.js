const Favorite = require('../models/Favorite');

exports.addFavorite = async (req, res) => {
    try {
        const { user_id, item_id } = req.body;
        const favorite = await Favorite.create({ user_id, item_id });
        res.status(201).json(favorite);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add favorite' });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCount = await Favorite.destroy({ where: { id } });
        if (deletedCount > 0) {
            res.status(200).json({ message: 'Favorite item removed successfully' }); // Return success message
        } else {
            res.status(404).json({ error: 'Favorite item not found' }); // Handle not found case
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const { user_id } = req.params;
        const favorites = await Favorite.findAll({ where: { user_id } });
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
};
