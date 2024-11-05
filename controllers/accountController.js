const User = require('../models/user'); // Ensure the import path is correct

exports.deactivateAccount = async (req, res) => {
  try {
    const user_id = req.user.id; // Get user ID from the authenticated request

    console.log(`Deactivating account for user ID: ${user_id}`);

    const user = await User.findByPk(user_id);
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.AccountStatus === 'Deactivated') {
      console.warn('Account is already deactivated');
      return res.status(400).json({ error: 'Account is already deactivated' });
    }

    // Log the user details before updating
    user.AccountStatus = 'Deactivated';
    user.DeactivationDate = new Date(); // Set current date as deactivation date
    await user.save();

    // Schedule account deletion in 2 minutes (120 seconds)
    setTimeout(async () => {
      const deletedUser = await User.findByPk(user_id); // Use user_id here
      if (deletedUser && deletedUser.AccountStatus === 'Deactivated') {
        await deletedUser.destroy(); // Delete user account
        console.log(`User with ID ${user_id} has been deleted after 2 minutes of deactivation.`);
      }
    }, 120000); // 2 minutes in milliseconds

    res.status(200).json({ message: 'Account deactivated successfully.' });
  } catch (error) {
    console.error('Error while deactivating account:', error);
    res.status(500).json({ error: 'Failed to deactivate account', details: error.message }); // Include error details
  }
};


// Reactivate account
exports.reactivateAccount = async (req, res) => {
  try {
    const { user_id } = req.params; // Get user_id from the request parameters

    // Find the user by primary key
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the account is deactivated
    if (user.AccountStatus !== 'Deactivated') {
      return res.status(400).json({ error: 'Account is already active' });
    }

    // Calculate one month ago from the current date
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Check if the deactivation date exceeds the one-month limit
    if (user.DeactivationDate && user.DeactivationDate < oneMonthAgo) {
      return res.status(400).json({ error: 'Reactivation period expired' });
    }

    // Reactivate the account
    user.AccountStatus = 'Active';
    user.DeactivationDate = null; // Clear the deactivation date
    await user.save();

    res.status(200).json({ message: 'Account reactivated successfully.' });
  } catch (error) {
    console.error('Error reactivating account:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to reactivate account' });
  }
};
