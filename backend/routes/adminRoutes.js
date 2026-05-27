const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

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

// ✅ memoryStorage — no uploads folder needed
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-students', upload.single('file'), uploadExcelStudents);
router.post('/upload-tgs', upload.single('file'), uploadExcelTGs);
router.get('/users', getAllUsers);
router.get('/students', searchStudent);
router.get('/gatepasses', getAllGatePasses);
router.post('/assign-tg', assignTG);
router.get('/tgs', getAllTGs);
router.get('/stats', getStats);

module.exports = router;