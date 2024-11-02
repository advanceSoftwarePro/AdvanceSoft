const express = require('express');

const categoryController = require('../controllers/categoryController');
const { verifyUserToken } = require('../utils/authMiddleware');
const router = express.Router();


router.get('/parent-categories', verifyUserToken,categoryController.listParentCategories);

router.get('/categories/:parentId/subcategories',verifyUserToken,categoryController.getSubcategories);

router.post('/Category/create', verifyUserToken, categoryController.createCategory);


module.exports = router;
