const Wishlist = require('../models/wishlist');
const Item = require('../models/items'); 


// Function to add an item to the wishlist
exports.addToWishlist = async (req, res) => {
    try {
        // Extract user_id from the authenticated request
        const user_id = req.user.id; // Assuming user ID is stored in req.user after token verification
        const { item_id } = req.body; // Get item_id from request body

        // Check for missing item_id
        if (!item_id) {
            return res.status(400).json({ message: 'Item ID is required.' });
        }

        // Check if the item is already in the user's wishlist
        const existingWishlistItem = await Wishlist.findOne({ where: { user_id, item_id } });
        if (existingWishlistItem) {
            return res.status(409).json({ message: 'Item is already in wishlist.' });
        }

        console.log("Attempting to find item with ID:", item_id);
        const itemExists = await Item.findByPk(item_id);
        if (!itemExists) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        

        // Add to wishlist if it doesn't already exist
        const wishlistItem = await Wishlist.create({ user_id, item_id });
        res.status(201).json({ message: 'Item added to wishlist successfully.', wishlistItem });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Failed to add to wishlist.', error });
    }
};

// Function to remove an item from the wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { id } = req.params; // Get the wishlist ID from the URL params
        const userId = req.user.id; // Get the user ID from the authenticated request

        // Check if the wishlist item exists for the user
        const wishlistItem = await Wishlist.findOne({ where: { id, user_id: userId } });
        if (!wishlistItem) {
            return res.status(404).json({ message: 'Wishlist item not found or does not belong to the user.' });
        }

        // Proceed to delete if the wishlist item exists and belongs to the user
        const deletedCount = await Wishlist.destroy({ where: { id, user_id: userId } });
        if (deletedCount > 0) {
            res.status(200).json({ message: 'Wishlist item removed successfully.' });
        } else {
            res.status(404).json({ message: 'Wishlist item not found.' });
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Failed to remove from wishlist.', error });
    }
};

// Function to get all wishlist items for the authenticated user
exports.getUserWishlist = async (req, res) => {
    try {
        const user_id = req.user.id; // Extract user_id from the authenticated request
        const wishlistItems = await Wishlist.findAll({ where: { user_id } });

        // Check if the wishlist is empty
        if (wishlistItems.length === 0) {
            return res.status(200).json({ message: 'Wishlist is empty.' });
        }

        res.json(wishlistItems);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Failed to fetch wishlist.', error });
    }
};
