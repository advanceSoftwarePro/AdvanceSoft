const express = require('express');
const ratingController = require('../controllers/ratingController'); 
const { verifyUserToken } = require('../utils/authMiddleware'); 

const router = express.Router();

router.use(verifyUserToken);
router.post('/', ratingController.createRating);
router.get('/:userId', ratingController.getRatingsByUserId);
router.put('/:userId', ratingController.updateRating);
router.delete('/:userId', ratingController.deleteRating);

module.exports = router;
