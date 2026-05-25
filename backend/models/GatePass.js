const mongoose = require('mongoose');
const gatePassSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending_TG', 'Approved_TG', 'Rejected_TG', 'Approved_Warden', 'Rejected_Warden'],
      default: 'Pending_TG'
    },
    tgRemarks: {
      type: String,
      default: ''
    },
    wardenRemarks: {
      type: String,
      default: ''
    },
    qrCode: {
      type: String,
      default: ''
    },
    actualExitTime: {
      type: Date,
      default: null
    },
    actualEntryTime: {
      type: Date,
      default: null
    },
    entryExitLogs: [
      {
        action: {
          type: String,
          enum: ['Exit', 'Entry'],
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        loggedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model('GatePass', gatePassSchema);
