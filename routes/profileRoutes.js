const express = require('express');
const multer = require('multer');
const path = require('path'); 

const profileController = require('../controllers/profileController');
const { verifyUserToken } = require('../utils/authMiddleware');
const { validateUserProfile, validateImageFile } = require('../utils/validators');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});


const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

const router = express.Router();

router.get('/profile', verifyUserToken, profileController.getProfile);

router.put('/profile', 
    verifyUserToken,
    upload.single('profilePicture'), 
    validateImageFile, 
    validateUserProfile, 
    profileController.editProfile 
);

module.exports = router;
