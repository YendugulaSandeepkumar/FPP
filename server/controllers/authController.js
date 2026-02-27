const { User } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, mobile, password, role, village, secretKey } = req.body;

    if (role === 'vao') {
      // Validate secret key for VAO
      const VAO_SECRET = 'FPP-VAO-SECRET-2026'; 
      if (secretKey !== VAO_SECRET) {
        return res.status(403).send({ error: 'Invalid secret key for VAO registration.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    
    // Mongoose create
    const user = await User.create({
      name,
      mobile,
      password: hashedPassword,
      role,
      village
    });

    const token = jwt.sign({ id: user._id, role: user.role, village: user.village }, process.env.JWT_SECRET || 'fpp_jwt_secret');
    res.status(201).send({ user, token });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send({ error: 'Mobile number already registered.' });
    } else {
      res.status(400).send({ error: error.message });
    }
  }
};

const login = async (req, res) => {
  try {
    const { mobile, password, role } = req.body; 

    // Mongoose findOne
    const user = await User.findOne({ mobile });

    if (!user) {
      throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Unable to login');
    }

    if (role && user.role !== role) {
      throw new Error('Role mismatch');
    }

    const token = jwt.sign({ id: user._id, role: user.role, village: user.village }, process.env.JWT_SECRET || 'fpp_jwt_secret');
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: 'Unable to login' });
  }
};

module.exports = { register, login };
