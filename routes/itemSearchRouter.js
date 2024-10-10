const express = require('express');
const router = express.Router();
const { searchItems } = require('../controllers/itemSearchController'); // Adjust the path as necessary

// Define the search route
router.get('/search', searchItems);

module.exports = router;
