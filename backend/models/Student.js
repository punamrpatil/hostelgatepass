const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rollNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    branch: {
      type: String,
      required: true,
      trim: true
    },
    division: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
    studentPhone: {
      type: String,
      required: true,
      trim: true
    },
    parentPhone: {
      type: String,
      required: true,
      trim: true
    },
    roomNo: {
      type: String,
      required: true,
      trim: true
    },
    tgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TG',
      default: null
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model('Student', studentSchema);
