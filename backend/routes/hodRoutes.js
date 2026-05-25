const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/hodController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.use(protect);
router.use(authorize('HOD'));
router.get('/analytics', getAnalytics);
module.exports = router;
