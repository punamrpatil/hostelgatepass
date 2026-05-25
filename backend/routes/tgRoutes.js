const express = require('express');
const router = express.Router();
const {
  getAssignedStudents,
  getGatePassRequests,
  approveRequest,
  rejectRequest
} = require('../controllers/tgController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.use(protect);
router.use(authorize('TG'));
router.get('/students', getAssignedStudents);
router.get('/gatepasses', getGatePassRequests);
router.put('/gatepasses/:id/approve', approveRequest);
router.put('/gatepasses/:id/reject', rejectRequest);
module.exports = router;
