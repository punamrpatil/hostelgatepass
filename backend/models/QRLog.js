const mongoose = require('mongoose');
const qrLogSchema = new mongoose.Schema(
  {
    gatePassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GatePass',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    action: {
      type: String,
      enum: ['Exit', 'Entry'],
      required: true
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      default: 'Success'
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model('QRLog', qrLogSchema);
