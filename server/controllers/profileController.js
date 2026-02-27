const { User } = require('../db');

const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, village } = req.body; 

    const user = await User.findById(id);
    if (!user) return res.status(404).send({ error: 'User not found' });

    user.name = name || user.name;
    user.village = village || user.village;
    
    await user.save();

    res.send({ user });
  } catch (error) {
    res.status(400).send({ error: 'Update failed' });
  }
};

module.exports = { updateProfile };
