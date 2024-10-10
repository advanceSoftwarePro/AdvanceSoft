const { Op } = require('sequelize');
const Item = require('../models/Items');  // Ensure you import the correct model

exports.searchItems = async (req, res) => {
    const { query } = req.query; // Extract the query parameter from the request

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required.' });
    }

    try {
        const items = await Item.findAll({
            where: {
                Title: {
                    [Op.iLike]: `%${query}%`, // Use iLike for case-insensitive matching
                },
            },
        });

        if (items.length === 0) {
            return res.status(404).json({ message: 'No items found' });
        }

        res.status(200).json(items);
    } catch (error) {
        console.error('Error while searching items:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
