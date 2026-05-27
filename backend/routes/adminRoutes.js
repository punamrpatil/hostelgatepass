const express = require('express');
const router = express.Router();
const multer = require('multer');

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

const { protect, authorize } = require('../middleware/authMiddleware');

// ✅ memoryStorage — req.file.buffer is available in controller
const upload = multer({ storage: multer.memoryStorage() });

// All admin routes require authentication and Admin role
router.use(protect);
router.use(authorize('Admin'));

router.post('/upload-students', upload.single('file'), uploadExcelStudents);
router.post('/upload-tgs',      upload.single('file'), uploadExcelTGs);
router.get('/users',      getAllUsers);
router.get('/students',   searchStudent);
router.get('/gatepasses', getAllGatePasses);
router.post('/assign-tg', assignTG);
router.get('/tgs',        getAllTGs);
router.get('/stats',      getStats);

module.exports = router;