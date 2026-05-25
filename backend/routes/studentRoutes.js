const express = require('express');
const router = express.Router();
const {
  applyGatePass,
  getHistory,
  getActivePass
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.use(protect);
router.use(authorize('Student'));
router.post('/gatepass', applyGatePass);
router.get('/gatepasses', getHistory);
router.get('/active-pass', getActivePass);
module.exports = router;
