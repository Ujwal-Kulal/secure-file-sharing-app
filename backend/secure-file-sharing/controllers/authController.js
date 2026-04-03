const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY || '2d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const normalizedUsername = String(username || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedUsername || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    const existingEmailUser = await User.findOne({ email: normalizedEmail });
    if (existingEmailUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const existingUsernameUser = await User.findOne({ username: normalizedUsername });
    if (existingUsernameUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    });
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture || '',
        phoneNumber: newUser.phoneNumber || '',
        address: newUser.address || ''
      }
    });
  } catch (err) {
    if (err?.code === 11000) {
      if (err?.keyPattern?.email) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      if (err?.keyPattern?.username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verify = async (req, res) => {
  try {
    // If we reach here, the token is valid (protected route passed)
    res.json({ message: 'Token is valid', user: req.user });
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load profile', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, phoneNumber, address, profilePicture } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      user.username = username;
    }

    if (typeof phoneNumber === 'string') {
      user.phoneNumber = phoneNumber;
    }
    if (typeof address === 'string') {
      user.address = address;
    }
    if (typeof profilePicture === 'string') {
      user.profilePicture = profilePicture;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

