const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// ==========================================================
// @route   POST /api/auth/register
// @desc    Register a new user and return JWT token
// @access  Public
// ==========================================================
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // 1. Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 2. Create a new User instance
    user = new User({
      name,
      email,
      password,
    });

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10); 
    user.password = await bcrypt.hash(password, salt);

    // 4. Save the new user to the database
    await user.save();

    // 5. Create the JWT Payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // 6. Sign and send the Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token,
          userId: user.id,  // ✅ ADD THIS
          name: user.name,   // ✅ ADD THIS
          email: user.email, // ✅ ADD THIS
          msg: 'Registration successful. Token issued.' 
        }); 
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ==========================================================
// @route   POST /api/auth/login
// @desc    Authenticate user and get JWT token
// @access  Public
// ==========================================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Compare submitted password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Create the JWT Payload
    const payload = {
      user: {
        id: user.id, 
      },
    };

    // 4. Sign and send the Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          userId: user.id,  // ✅ ADD THIS
          name: user.name,   // ✅ ADD THIS
          email: user.email, // ✅ ADD THIS
          msg: 'Login successful. Token issued.'
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ==========================================================
// @route   PUT /api/auth/update-profile
// @desc    Update user name and email
// @access  Private
// ==========================================================
router.put('/update-profile', async (req, res) => {
  const { userId, name, email } = req.body;
  try {
    if (!userId || !name || !email) {
      return res.status(400).json({ msg: 'All fields are required.' });
    }

    // Check if email is taken by another user
    const existing = await User.findOne({ email });
    if (existing && existing._id.toString() !== userId) {
      return res.status(400).json({ msg: 'Email already in use by another account.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    );
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    res.json({ msg: 'Profile updated successfully.', name: user.name, email: user.email });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ==========================================================
// @route   PUT /api/auth/update-password
// @desc    Change password after verifying current one
// @access  Private
// ==========================================================
router.put('/update-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  try {
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'All fields are required.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found.' });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect.' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password updated successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;