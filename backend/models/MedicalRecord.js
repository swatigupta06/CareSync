const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,             // e.g. "application/pdf", "image/jpeg"
      required: true,
    },

    reportType: {
      type: String,             // e.g. "Blood Test", "X-Ray", "MRI"
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ['Test', 'Surgery', 'Report'],
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Role that uploaded (denormalised for quick filtering)
    uploaderRole: {
      type: String,
      enum: ['patient', 'receptionist', 'lab', 'doctor', 'admin'],
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
      default: '',
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

MedicalRecordSchema.index({ patient: 1, createdAt: -1 });
MedicalRecordSchema.index({ uploaderRole: 1 });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
