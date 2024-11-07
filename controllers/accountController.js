const User = require('../models/user'); 

exports.deactivateAccount = async (req, res) => {
  try {
    const user_id = req.user.id; 

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

    user.AccountStatus = 'Deactivated';
    user.DeactivationDate = new Date(); 
    await user.save();

    
    setTimeout(async () => {
      const deletedUser = await User.findByPk(user_id); 
      if (deletedUser && deletedUser.AccountStatus === 'Deactivated') {
        await deletedUser.destroy(); 
        console.log(`User with ID ${user_id} has been deleted after 2 minutes of deactivation.`);
      }
    }, 120000); 

    res.status(200).json({ message: 'Account deactivated successfully.' });
  } catch (error) {
    console.error('Error while deactivating account:', error);
    res.status(500).json({ error: 'Failed to deactivate account', details: error.message }); 
  }
};



exports.reactivateAccount = async (req, res) => {
  try {
    const { user_id } = req.params; 


    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    if (user.AccountStatus !== 'Deactivated') {
      return res.status(400).json({ error: 'Account is already active' });
    }


    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);


    if (user.DeactivationDate && user.DeactivationDate < oneMonthAgo) {
      return res.status(400).json({ error: 'Reactivation period expired' });
    }


    user.AccountStatus = 'Active';
    user.DeactivationDate = null; 
    await user.save();

    res.status(200).json({ message: 'Account reactivated successfully.' });
  } catch (error) {
    console.error('Error reactivating account:', error); 
    res.status(500).json({ error: 'Failed to reactivate account' });
  }
};
