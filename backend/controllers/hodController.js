const GatePass = require('../models/GatePass');
const Student = require('../models/Student');
// @desc    Get dashboard analytics
// @route   GET /api/hod/analytics
// @access  Private/HOD
const getAnalytics = async (req, res) => {
  try {
    // 1. Get all students currently outside (Exited but not yet Entered)
    const outsidePasses = await GatePass.find({
      actualExitTime: { $ne: null },
      actualEntryTime: null,
      status: 'Approved_Warden'
    }).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name email phone' }
    });
    const totalOutside = outsidePasses.length;
    // 2. Compute gender split for students outside
    let boysOutside = 0;
    let girlsOutside = 0;
    const branchBreakdown = {};
    outsidePasses.forEach((pass) => {
      if (pass.studentId) {
        const student = pass.studentId;
        // Gender counting
        if (student.gender === 'Male') {
          boysOutside++;
        } else if (student.gender === 'Female') {
          girlsOutside++;
        }
        // Branch breakdown counting
        const branch = student.branch || 'Unknown';
        branchBreakdown[branch] = (branchBreakdown[branch] || 0) + 1;
      }
    });
    // 3. Overall GatePass stats counts
    const totalRequests = await GatePass.countDocuments({});
    const pendingTG = await GatePass.countDocuments({ status: 'Pending_TG' });
    const approvedTG = await GatePass.countDocuments({ status: 'Approved_TG' });
    const approvedWarden = await GatePass.countDocuments({ status: 'Approved_Warden' });
    const rejected = await GatePass.countDocuments({ status: { $in: ['Rejected_TG', 'Rejected_Warden'] } });
    res.json({
      totalOutside,
      boysOutside,
      girlsOutside,
      branchBreakdown,
      overallStats: {
        totalRequests,
        pendingTG,
        approvedTG,
        approvedWarden,
        rejected
      },
      outsideStudents: outsidePasses.map(pass => ({
        gatePassId: pass._id,
        name: pass.studentId?.userId?.name || 'Unknown',
        rollNo: pass.studentId?.rollNo || '',
        branch: pass.studentId?.branch || '',
        division: pass.studentId?.division || '',
        roomNo: pass.studentId?.roomNo || '',
        exitTime: pass.actualExitTime,
        reason: pass.reason,
        startDate: pass.startDate,
        endDate: pass.endDate
      }))
    });
  } catch (error) {
    console.error('HOD Analytics Error:', error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getAnalytics
};
