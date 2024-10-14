const User = require('../models/User');
const { sendEmail } = require('../services/NotificationService'); // Import the email service

// Helper function to calculate the new rating, send notifications, or delete the user
async function updateUserRating(user, newRating) {
    // Calculate the new average rating
    const totalRatings = user.numberOfRatings;
    const currentRating = user.Rating;
    const newTotalRating = (currentRating * totalRatings + newRating) / (totalRatings + 1);

    // Update the user's rating and increment the number of ratings
    user.Rating = newTotalRating;
    user.numberOfRatings += 1;
    await user.save();

    console.log(`User's new rating: ${newTotalRating}`);

    // Notify the user if their rating falls below 2
    if (newTotalRating < 2 && newTotalRating > 1) {
        console.log(`Sending notification to user with email ${user.Email}`);
        
        // Send email notification
        await sendEmail(
            user.Email,
            'Your Rating Has Dropped Below 2',
            `Hello ${user.FullName},\n\nYour rating has dropped below 2. Please improve your service to maintain your account.`,
            `<p>Hello ${user.FullName},</p><p>Your rating has dropped below 2. Please improve your service to maintain your account.</p>`
        );
    }

    // Delete the user if the rating is 1 or below
    if (newTotalRating <= 1) {
        console.log(`Deleting user with UserID ${user.UserID} due to low rating.`);
        
        // Send final notification before deletion
        await sendEmail(
            user.Email,
            'Account Deletion Due to Low Rating',
            `Hello ${user.FullName},\n\nYour account has been deleted due to your low rating of ${newTotalRating}.`,
            `<p>Hello ${user.FullName},</p><p>Your account has been deleted due to your low rating of ${newTotalRating}.</p>`
        );

        // Delete the user
        await user.destroy();
    }
}

// Submit a new rating for a user
exports.submitRating = async (req, res) => {
    const { UserID } = req.params; // Capture the user ID from the request parameters
    const { Rating } = req.body; // Capture the new rating from the request body

    console.log(`Received request to rate user ID: ${UserID} with rating: ${Rating}`);

    try {
        // Validate Rating (must be between 1 and 5)
        if (Rating < 1 || Rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Find the user to be rated
        const user = await User.findByPk(UserID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's total rating
        await updateUserRating(user, Rating); // Pass the user object to the function

        // Respond with success
        res.status(200).json({ message: 'Rating submitted successfully' });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
