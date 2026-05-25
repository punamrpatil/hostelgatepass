const Student = require('../models/Student');
const TG = require('../models/TG');
const GatePass = require('../models/GatePass');
const Notification = require('../models/Notification');

// @desc    Apply for a gate pass
// @route   POST /api/student/gatepass
// @access  Private/Student
const applyGatePass = async (req, res) => {
  const { reason, startDate, endDate } = req.body;

  if (!reason || !startDate || !endDate) {
    return res.status(400).json({
      message: 'Please provide reason, start date, and end date'
    });
  }

  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    if (!student.tgId) {
      return res.status(400).json({
        message: 'No Tutor Guardian assigned. Contact Admin.'
      });
    }

    // Check active request
    const activePass = await GatePass.findOne({
      studentId: student._id,
      actualEntryTime: null,
      status: { $nin: ['Rejected_TG', 'Rejected_Warden'] }
    });

    if (activePass) {
      return res.status(400).json({
        message: 'You already have an active/pending request',
        activePass
      });
    }

    // Create gate pass
    const gatePass = await GatePass.create({
      studentId: student._id,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'Pending_TG'
    });

    // ✅ FIXED TG FETCH (IMPORTANT)
    const tg = await TG.findById(student.tgId).populate('userId');

    if (tg && tg.userId) {
      await Notification.create({
        userId: tg.userId._id,
        title: 'New Gate Pass Request',
        message: `Student ${req.user.name} (${student.rollNo}) applied for gate pass`
      });
    }

    res.status(201).json(gatePass);

  } catch (error) {
    console.error('Apply GatePass Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student history
// @route   GET /api/student/gatepasses
// @access  Private/Student
const getHistory = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const history = await GatePass.find({ studentId: student._id })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .sort({ createdAt: -1 });

    res.json(history);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active pass
// @route   GET /api/student/active-pass
const getActivePass = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.status(404).json({
        message: 'Student profile not found'
      });
    }

    const gatePass = await GatePass.findOne({
      studentId: student._id,
      actualEntryTime: null,
      status: { $nin: ['Rejected_TG', 'Rejected_Warden'] }
    })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .populate('entryExitLogs.loggedBy', 'name email');

    res.json(gatePass || null);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyGatePass,
  getHistory,
  getActivePass
};