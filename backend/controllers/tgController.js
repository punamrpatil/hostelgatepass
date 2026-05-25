const TG = require('../models/TG');
const Student = require('../models/Student');
const User = require('../models/User');
const GatePass = require('../models/GatePass');
const Notification = require('../models/Notification');

// @desc    Get students assigned to TG
// @route   GET /api/tg/students
// @access  Private/TG
const getAssignedStudents = async (req, res) => {
  try {
    const tg = await TG.findOne({ userId: req.user._id });

    if (!tg) {
      return res.status(404).json({
        message: 'TG profile not found'
      });
    }

    const students = await Student.find({
      tgId: tg._id
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(students);

  } catch (error) {
    console.error('Get Assigned Students Error:', error);

    res.status(500).json({
      message: error.message
    });
  }
};

// @desc    Get pending gate pass requests for TG
// @route   GET /api/tg/gatepasses
// @access  Private/TG
const getGatePassRequests = async (req, res) => {
  try {
    const tg = await TG.findOne({ userId: req.user._id });

    if (!tg) {
      return res.status(404).json({
        message: 'TG profile not found'
      });
    }

    // Find students assigned to this TG
    const students = await Student.find({
      tgId: tg._id
    }).select('_id');

    const studentIdList = students.map(student => student._id);

    // Get all pending gate passes
    const gatepasses = await GatePass.find({
      studentId: { $in: studentIdList },
      status: 'Pending_TG'
    })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .sort({ createdAt: -1 });

    res.json(gatepasses);

  } catch (error) {
    console.error('Get TG GatePass Requests Error:', error);

    res.status(500).json({
      message: error.message
    });
  }
};

// @desc    Approve gate pass
// @route   PUT /api/tg/gatepasses/:id/approve
// @access  Private/TG
const approveRequest = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  try {
    const gatePass = await GatePass.findById(id).populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name email phone'
      }
    });

    if (!gatePass) {
      return res.status(404).json({
        message: 'Gate pass request not found'
      });
    }

    const tg = await TG.findOne({
      userId: req.user._id
    });

    if (!tg || String(gatePass.studentId.tgId) !== String(tg._id)) {
      return res.status(403).json({
        message: 'Unauthorized: Student is not assigned to you'
      });
    }

    gatePass.status = 'Approved_TG';
    gatePass.tgRemarks =
      remarks || 'Approved by Tutor Guardian';

    await gatePass.save();

    // Notify wardens
    const wardens = await User.find({
      role: 'Warden'
    });

    for (const warden of wardens) {
      await Notification.create({
        userId: warden._id,
        title: 'Gate Pass Forwarded',
        message: `Gate pass for ${gatePass.studentId.userId.name} was approved by TG and requires final approval.`
      });
    }

    // Notify student
    await Notification.create({
      userId: gatePass.studentId.userId._id,
      title: 'TG Approved Your Gate Pass',
      message:
        'Your gate pass has been approved by your TG and forwarded to the Warden.'
    });

    res.json({
      message: 'Request approved and forwarded to Warden',
      gatePass
    });

  } catch (error) {
    console.error('TG Approve Error:', error);

    res.status(500).json({
      message: error.message
    });
  }
};

// @desc    Reject gate pass
// @route   PUT /api/tg/gatepasses/:id/reject
// @access  Private/TG
const rejectRequest = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  try {
    const gatePass = await GatePass.findById(id).populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'name email phone'
      }
    });

    if (!gatePass) {
      return res.status(404).json({
        message: 'Gate pass request not found'
      });
    }

    const tg = await TG.findOne({
      userId: req.user._id
    });

    if (!tg || String(gatePass.studentId.tgId) !== String(tg._id)) {
      return res.status(403).json({
        message: 'Unauthorized: Student is not assigned to you'
      });
    }

    gatePass.status = 'Rejected_TG';
    gatePass.tgRemarks =
      remarks || 'Rejected by Tutor Guardian';

    await gatePass.save();

    // Notify student
    await Notification.create({
      userId: gatePass.studentId.userId._id,
      title: 'Gate Pass Rejected',
      message: `Your gate pass request was rejected by your TG. Remarks: ${gatePass.tgRemarks}`
    });

    res.json({
      message: 'Request rejected',
      gatePass
    });

  } catch (error) {
    console.error('TG Reject Error:', error);

    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getAssignedStudents,
  getGatePassRequests,
  approveRequest,
  rejectRequest
};