const GatePass = require('../models/GatePass');
const Student = require('../models/Student');
const QRLog = require('../models/QRLog');
const Notification = require('../models/Notification');
// @desc    Scan QR Code and fetch validation results
// @route   POST /api/security/scan
// @access  Private/Security
const scanQR = async (req, res) => {
  const { qrData } = req.body;
  if (!qrData) {
    return res.status(400).json({ message: 'No QR data provided' });
  }
  try {
    let parsedData;
    try {
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (e) {
      return res.status(400).json({ message: 'Invalid QR Code format' });
    }
    const { gatePassId } = parsedData;
    if (!gatePassId) {
      return res.status(400).json({ message: 'Invalid QR content: GatePass ID not found' });
    }
    const gatePass = await GatePass.findById(gatePassId).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name email phone' }
    });
    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass record not found' });
    }
    if (gatePass.status !== 'Approved_Warden') {
      return res.status(400).json({
        message: 'Invalid Gate Pass: Request has not received final Warden approval',
        status: gatePass.status
      });
    }
    // Expiry and Activation validation checks
    const now = new Date();
    let validityStatus = 'Valid';
    if (now < new Date(gatePass.startDate)) {
      validityStatus = 'Not Active Yet';
    } else if (now > new Date(gatePass.endDate)) {
      validityStatus = 'Expired';
    }
    // Determine expected action based on existing timestamps
    let nextAction = '';
    if (!gatePass.actualExitTime) {
      nextAction = 'Exit';
    } else if (gatePass.actualExitTime && !gatePass.actualEntryTime) {
      nextAction = 'Entry';
    } else {
      validityStatus = 'Pass Already Used';
      nextAction = 'None';
    }
    res.json({
      valid: validityStatus === 'Valid',
      validityStatus,
      nextAction,
      gatePass
    });
  } catch (error) {
    console.error('Scan QR Error:', error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Mark Exit/Entry log at the gate
// @route   POST /api/security/log-action
// @access  Private/Security
const markEntryExit = async (req, res) => {
  const { gatePassId, action } = req.body;
  if (!gatePassId || !action) {
    return res.status(400).json({ message: 'Please provide gatePassId and action (Exit/Entry)' });
  }
  try {
    const gatePass = await GatePass.findById(gatePassId).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name email' }
    });
    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass record not found' });
    }
    const timestamp = new Date();
    if (action === 'Exit') {
      if (gatePass.actualExitTime) {
        return res.status(400).json({ message: 'Student has already exited using this pass' });
      }
      gatePass.actualExitTime = timestamp;
      gatePass.entryExitLogs.push({
        action: 'Exit',
        timestamp,
        loggedBy: req.user._id
      });
      await gatePass.save();
      // Create QRLog audit trail
      await QRLog.create({
        gatePassId: gatePass._id,
        studentId: gatePass.studentId._id,
        action: 'Exit',
        scannedBy: req.user._id,
        timestamp,
        status: 'Success'
      });
      // Notify student
      await Notification.create({
        userId: gatePass.studentId.userId._id,
        title: 'Gate Pass Checkout',
        message: `You successfully checked out of the hostel at ${timestamp.toLocaleTimeString()}. Safe travels!`
      });
    } else if (action === 'Entry') {
      if (!gatePass.actualExitTime) {
        return res.status(400).json({ message: 'Cannot register Entry before registering Exit' });
      }
      if (gatePass.actualEntryTime) {
        return res.status(400).json({ message: 'Student has already returned using this pass' });
      }
      gatePass.actualEntryTime = timestamp;
      gatePass.entryExitLogs.push({
        action: 'Entry',
        timestamp,
        loggedBy: req.user._id
      });
      await gatePass.save();
      // Create QRLog audit trail
      await QRLog.create({
        gatePassId: gatePass._id,
        studentId: gatePass.studentId._id,
        action: 'Entry',
        scannedBy: req.user._id,
        timestamp,
        status: 'Success'
      });
      // Notify student
      await Notification.create({
        userId: gatePass.studentId.userId._id,
        title: 'Gate Pass Checkin',
        message: `Welcome back! You checked back into the hostel at ${timestamp.toLocaleTimeString()}.`
      });
    } else {
      return res.status(400).json({ message: 'Invalid action parameter' });
    }
    res.json({ message: `Successfully logged ${action}`, gatePass });
  } catch (error) {
    console.error('Mark Entry/Exit Error:', error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  scanQR,
  markEntryExit
};
