const fs = require('fs');
const xlsx = require('xlsx');
const User = require('../models/User');
const Student = require('../models/Student');
const TG = require('../models/TG');
const GatePass = require('../models/GatePass');

// @desc    Upload Students via Excel sheet
// @route   POST /api/admin/upload-students
// @access  Private/Admin
const uploadExcelStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an Excel spreadsheet file' });
  }

  let successCount = 0;
  let skippedCount = 0;
  const errors = [];

  try {
    // ✅ Read from memory buffer — no disk folder needed
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json(worksheet);

    for (const row of rawRows) {
      const name = row.name ? row.name.toString().trim() : '';
      const rollNo = row.rollNo ? row.rollNo.toString().trim() : '';
      const branch = row.branch ? row.branch.toString().trim() : '';
      const division = row.division ? row.division.toString().trim() : '';
      const gender = row.gender ? row.gender.toString().trim() : '';
      const studentPhone = row.studentPhone ? row.studentPhone.toString().trim() : '';
      const parentPhone = row.parentPhone ? row.parentPhone.toString().trim() : '';
      const roomNo = row.roomNo ? row.roomNo.toString().trim() : '';
      const email = row.email ? row.email.toString().trim().toLowerCase() : '';
      const tgNameInput = row.tgName ? row.tgName.toString().trim() : '';

      if (!name || !rollNo || !branch || !division || !gender || !studentPhone || !parentPhone || !roomNo || !email) {
        errors.push({ row, reason: 'Missing mandatory fields' });
        skippedCount++;
        continue;
      }

      const userExists = await User.findOne({ email });
      const studentExists = await Student.findOne({ rollNo });
      if (userExists || studentExists) {
        errors.push({ rollNo, email, reason: 'Duplicate email or roll number found' });
        skippedCount++;
        continue;
      }

      try {
        const user = await User.create({
          name,
          email,
          password: rollNo,
          role: 'Student',
          phone: studentPhone
        });

        let matchedTG = await TG.findOne({
          branch: { $regex: new RegExp(`^${branch}$`, 'i') },
          division: { $regex: new RegExp(`^${division}$`, 'i') }
        });
        if (!matchedTG && tgNameInput) {
          matchedTG = await TG.findOne({
            tgName: { $regex: new RegExp(`^${tgNameInput}$`, 'i') }
          });
        }

        await Student.create({
          userId: user._id,
          rollNo,
          branch,
          division,
          gender: ['Male', 'Female'].includes(gender) ? gender : 'Male',
          studentPhone,
          parentPhone,
          roomNo,
          tgId: matchedTG ? matchedTG._id : null
        });
        successCount++;
      } catch (err) {
        errors.push({ rollNo, email, reason: err.message });
        skippedCount++;
      }
    }

    res.status(200).json({
      message: 'Students file processed successfully',
      successCount,
      skippedCount,
      errors
    });

  } catch (error) {
    console.error('Students Excel Upload Error:', error);
    res.status(500).json({ message: 'Error reading Excel file: ' + error.message });
  }
};

// @desc    Upload TGs via Excel sheet
// @route   POST /api/admin/upload-tgs
// @access  Private/Admin
const uploadExcelTGs = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an Excel spreadsheet file' });
  }

  let successCount = 0;
  let skippedCount = 0;
  const errors = [];

  try {
    // ✅ Read from memory buffer — no disk folder needed
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json(worksheet);

    for (const row of rawRows) {
      const tgName = row.tgName ? row.tgName.toString().trim() : '';
      const branch = row.branch ? row.branch.toString().trim() : '';
      const division = row.division ? row.division.toString().trim() : '';
      const email = row.email ? row.email.toString().trim().toLowerCase() : '';
      const phone = row.phone ? row.phone.toString().trim() : '';

      if (!tgName || !branch || !division || !email || !phone) {
        errors.push({ row, reason: 'Missing mandatory fields' });
        skippedCount++;
        continue;
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        errors.push({ email, reason: 'User already exists with this email' });
        skippedCount++;
        continue;
      }

      try {
        const user = await User.create({
          name: tgName,
          email,
          password: phone,
          role: 'TG',
          phone
        });

        const tg = await TG.create({
          userId: user._id,
          tgName,
          branch,
          division,
          phone
        });

        await Student.updateMany(
          {
            branch: { $regex: new RegExp(`^${branch}$`, 'i') },
            division: { $regex: new RegExp(`^${division}$`, 'i') },
            tgId: null
          },
          { tgId: tg._id }
        );
        successCount++;
      } catch (err) {
        errors.push({ email, reason: err.message });
        skippedCount++;
      }
    }

    res.status(200).json({
      message: 'TGs file processed successfully',
      successCount,
      skippedCount,
      errors
    });

  } catch (error) {
    console.error('TG Excel Upload Error:', error);
    res.status(500).json({ message: 'Error reading Excel file: ' + error.message });
  }
};

// @desc    Get all users in system
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search students
// @route   GET /api/admin/students
// @access  Private/Admin
const searchStudent = async (req, res) => {
  const { query } = req.query;
  try {
    let filter = {};
    if (query) {
      const searchRegex = new RegExp(query, 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }]
      });
      const matchingUserIds = matchingUsers.map(u => u._id);
      filter = {
        $or: [
          { rollNo: searchRegex },
          { branch: searchRegex },
          { division: searchRegex },
          { userId: { $in: matchingUserIds } }
        ]
      };
    }
    const students = await Student.find(filter)
      .populate('userId', 'name email phone role')
      .populate({
        path: 'tgId',
        populate: { path: 'userId', select: 'name email phone' }
      });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all gatepass records
// @route   GET /api/admin/gatepasses
// @access  Private/Admin
const getAllGatePasses = async (req, res) => {
  try {
    const gatepasses = await GatePass.find({})
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });
    res.json(gatepasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign TG to a student
// @route   POST /api/admin/assign-tg
// @access  Private/Admin
const assignTG = async (req, res) => {
  const { studentId, tgId } = req.body;
  if (!studentId || !tgId) {
    return res.status(400).json({ message: 'Student ID and TG ID are required' });
  }
  try {
    const student = await Student.findByIdAndUpdate(
      studentId,
      { tgId },
      { new: true }
    ).populate('tgId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ success: true, message: 'TG assigned successfully', student });
  } catch (error) {
    console.error('Assign TG Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all TGs for dropdown
// @route   GET /api/admin/tgs
// @access  Private/Admin
const getAllTGs = async (req, res) => {
  try {
    const tgs = await TG.find({}).populate('userId', 'name email phone');
    res.json(tgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'Student' });
    const tgsCount = await User.countDocuments({ role: 'TG' });
    const wardensCount = await User.countDocuments({ role: 'Warden' });
    const totalGatePasses = await GatePass.countDocuments();
    res.json({ totalUsers, studentsCount, tgsCount, wardensCount, totalGatePasses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadExcelStudents,
  uploadExcelTGs,
  getAllUsers,
  searchStudent,
  getAllGatePasses,
  assignTG,
  getAllTGs,
  getStats
};