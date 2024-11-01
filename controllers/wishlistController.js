
const Wishlist = require('../models/Wishlist');

// Add to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { user_id, item_id } = req.body;
    const newWishlistItem = await Wishlist.create({ user_id, item_id });
    res.status(201).json(newWishlistItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get User Wishlist
exports.getUserWishlist = async (req, res) => {
  try {
    const { user_id } = req.params;
    const wishlistItems = await Wishlist.findAll({ where: { user_id } });
    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error retrieving wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove from Wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCount = await Wishlist.destroy({ where: { id } });
      if (deletedCount > 0) {
        res.status(200).json({ message: 'Wishlist item deleted successfully' }); // Change to 200 OK with a message
      } else {
        res.status(404).json({ message: 'Wishlist item not found' });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
