const express = require('express');
const router = express.Router();
const {
  scanQR,
  markEntryExit
} = require('../controllers/securityController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.use(protect);
router.use(authorize('Security'));
router.post('/scan', scanQR);
router.post('/log-action', markEntryExit);
module.exports = router;
