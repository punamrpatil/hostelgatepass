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

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage });

router.post('/upload-students', upload.single('file'), uploadExcelStudents);
router.post('/upload-tgs', upload.single('file'), uploadExcelTGs);
router.get('/users', getAllUsers);
router.get('/students', searchStudent);
router.get('/gatepasses', getAllGatePasses);
router.post('/assign-tg', assignTG);
router.get('/tgs', getAllTGs);
router.get('/stats', getStats);

module.exports = router;