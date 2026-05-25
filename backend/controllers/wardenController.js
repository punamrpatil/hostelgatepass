const qrcode = require('qrcode');
const GatePass = require('../models/GatePass');
const Notification = require('../models/Notification');
// @desc    Get all gatepass requests pending Warden approval
// @route   GET /api/warden/gatepasses
// @access  Private/Warden
const getGatePassRequests = async (req, res) => {
  try {
    const gatepasses = await GatePass.find({ status: 'Approved_TG' })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ updatedAt: -1 });
    res.json(gatepasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Warden final approval & QR generation
// @route   PUT /api/warden/gatepasses/:id/approve
// @access  Private/Warden
const finalApprove = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  try {
    const gatePass = await GatePass.findById(id).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name email phone' }
    });
    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass request not found' });
    }
    if (gatePass.status !== 'Approved_TG') {
      return res.status(400).json({ message: 'Gate pass is not approved by TG yet' });
    }
    // Generate secure QR code payload
    const qrPayload = JSON.stringify({
      gatePassId: gatePass._id,
      studentId: gatePass.studentId._id,
      rollNo: gatePass.studentId.rollNo,
      name: gatePass.studentId.userId.name,
      status: 'Approved_Warden',
      expiresAt: gatePass.endDate
    });
    // Generate Base64 Data URL for QR Code image
    const qrCodeBase64 = await qrcode.toDataURL(qrPayload);
    // Save final status and QR code data URL
    gatePass.status = 'Approved_Warden';
    gatePass.wardenRemarks = remarks || 'Approved by Warden';
    gatePass.qrCode = qrCodeBase64;
    await gatePass.save();
    // Notify Student
    await Notification.create({
      userId: gatePass.studentId.userId._id,
      title: 'Gate Pass Approved!',
      message: `Your gate pass has been approved by the Warden. Your QR code is now generated and ready for download.`
    });
    res.json({ message: 'Gate pass approved and QR code generated', gatePass });
  } catch (error) {
    console.error('Warden Approve Error:', error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Warden reject request
// @route   PUT /api/warden/gatepasses/:id/reject
// @access  Private/Warden
const rejectRequest = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  try {
    const gatePass = await GatePass.findById(id).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name' }
    });
    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass request not found' });
    }
    gatePass.status = 'Rejected_Warden';
    gatePass.wardenRemarks = remarks || 'Rejected by Warden';
    await gatePass.save();
    // Notify Student
    await Notification.create({
      userId: gatePass.studentId.userId._id,
      title: 'Gate Pass Rejected by Warden',
      message: `Your gate pass request was rejected by the Warden. Remarks: ${gatePass.wardenRemarks}`
    });
    res.json({ message: 'Gate pass rejected', gatePass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all gatepasses approved by warden
// @route   GET /api/warden/approved
// @access  Private/Warden
const getAllApproved = async (req, res) => {
  try {
    const gatepasses = await GatePass.find({ status: 'Approved_Warden' })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ updatedAt: -1 });
    res.json(gatepasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getGatePassRequests,
  finalApprove,
  rejectRequest,
  getAllApproved
};
