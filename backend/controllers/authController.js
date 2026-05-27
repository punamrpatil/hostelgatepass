const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const TG = require('../models/TG');
const Notification = require('../models/Notification');

// Sign JWT Utility
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, phone, ...extraDetails } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    const user = await User.create({ name, email, password, role, phone });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data provided' });
    }

    if (role === 'Student') {
      const { rollNo, branch, division, gender, studentPhone, parentPhone, roomNo } = extraDetails;

      const matchingTG = await TG.findOne({
        branch: { $regex: new RegExp(`^${branch}$`, 'i') },
        division: { $regex: new RegExp(`^${division}$`, 'i') }
      });

      await Student.create({
        userId: user._id,
        rollNo: rollNo || `ROLL-${Date.now()}`,
        branch: branch || 'General',
        division: division || 'A',
        gender: gender || 'Male',
        studentPhone: studentPhone || phone || '0000000000',
        parentPhone: parentPhone || '0000000000',
        roomNo: roomNo || 'TBD',
        tgId: matchingTG ? matchingTG._id : null
      });
    } else if (role === 'TG') {
      const { branch, division } = extraDetails;
      await TG.create({
        userId: user._id,
        tgName: name,
        branch: branch || 'General',
        division: division || 'A',
        phone: phone || '0000000000'
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let details = {};
    if (user.role === 'Student') {
      const student = await Student.findOne({ userId: user._id }).populate('tgId');
      details = { student };
    } else if (user.role === 'TG') {
      const tg = await TG.findOne({ userId: user._id });
      details = { tg };
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      ...details,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    if (user.role === 'Student') {
      const student = await Student.findOne({ userId: user._id }).populate({
        path: 'tgId',
        populate: { path: 'userId', select: 'name email' }
      });
      profileData.student = student;
    } else if (user.role === 'TG') {
      const tg = await TG.findOne({ userId: user._id });
      profileData.tg = tg;
    }

    res.json(profileData);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user notifications
// @route   GET /api/auth/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/auth/notifications/read
// @access  Private
const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUserNotifications,
  markNotificationsRead
};