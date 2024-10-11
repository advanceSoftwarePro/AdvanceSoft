const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { verifyUserToken } = require('../utils/authMiddleware');

// Protected routes for item management
router.post('/', verifyUserToken, itemController.createItem);  // Create an item (protected)
router.get('/',verifyUserToken, itemController.getAllItems);  // Get all items (public)
router.put('/:id', verifyUserToken, itemController.updateItem);  // Update an item (protected)
router.delete('/:id', verifyUserToken, itemController.deleteItem);  // Delete an item (protected)
router.get('/filter', verifyUserToken, itemController.getFilteredItems); // New endpoint for customers
router.get('/details/:itemId', verifyUserToken, itemController.getItemDetails);

router.get('/search', verifyUserToken,itemController.searchItems); 
module.exports = router;
