//server\models\userRouter.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/saveUser', async (req, res) => {
  try {
    const { clerkId, email, username, firstName, lastName } = req.body;

    // Check if user already exists
    let user = await User.findOne({ clerkId });
    if (user) {
      return res.status(200).json({ 
        message: 'User already exists',
        user 
      });
    }

    // Create new user
    user = await User.create({
      clerkId,
      email,
      username,
      firstName,
      lastName
    });

    res.status(201).json({
      message: 'User saved successfully',
      user
    });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ 
      message: 'Error saving user',
      error: error.message 
    });
  }
});

module.exports = router;