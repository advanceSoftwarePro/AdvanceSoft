const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { verifyUserToken } = require('../utils/authMiddleware');

router.post('/', verifyUserToken, itemController.createItem);  
router.get('/',verifyUserToken, itemController.getAllItems);  
router.put('/:id', verifyUserToken, itemController.updateItem);  
router.delete('/:id', verifyUserToken, itemController.deleteItem);  
router.get('/filter', verifyUserToken, itemController.getFilteredItems); 
router.get('/details/:itemId', verifyUserToken, itemController.getItemDetails);

router.get('/search', verifyUserToken,itemController.searchItems); 
module.exports = router;
