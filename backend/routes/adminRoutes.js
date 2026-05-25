const express = require('express');
const router = express.Router();

const {
  uploadExcelStudents,
  uploadExcelTGs,
  getAllUsers,
  searchStudent,
  getAllGatePasses,
  assignTG,
  getAllTGs,
  getStats
} = require('../controllers/adminController');

// Upload Excel Files
router.post('/upload-students', uploadExcelStudents);
router.post('/upload-tgs', uploadExcelTGs);

// Users & Students
router.get('/users', getAllUsers);
router.get('/students', searchStudent);

// Gate Passes
router.get('/gatepasses', getAllGatePasses);

// TG Management
router.post('/assign-tg', assignTG);
router.get('/tgs', getAllTGs);

// Dashboard Stats
router.get('/stats', getStats);

// Export router correctly
module.exports = router;