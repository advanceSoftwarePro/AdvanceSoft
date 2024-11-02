const User = require('../models/user');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};
exports.updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await User.update(req.body, { where: { UserID: id } });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Error updating user' });
    }
  };
  exports.banUser = async (req, res) => {
    try {
      const { id } = req.params;
      await User.update({ active: false }, { where: { UserID: id } });
      res.status(200).json({ message: 'User banned successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error banning user' });
    }
  };
    