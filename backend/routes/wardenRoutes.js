const express = require('express');
const router = express.Router();
const {
  getGatePassRequests,
  finalApprove,
  rejectRequest,
  getAllApproved
} = require('../controllers/wardenController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.use(protect);
router.use(authorize('Warden'));
router.get('/gatepasses', getGatePassRequests);
router.put('/gatepasses/:id/approve', finalApprove);
router.put('/gatepasses/:id/reject', rejectRequest);
router.get('/approved', getAllApproved);
module.exports = router;
