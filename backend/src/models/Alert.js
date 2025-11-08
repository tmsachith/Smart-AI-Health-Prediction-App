const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    readingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reading',
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    },
    type: {
      type: String,
      enum: [
        'reading_abnormal',
        'report_abnormal',
        'prediction_risk',
        'medication_reminder',
        'checkup_suggestion',
        'critical_alert',
        'wellness_advice',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'danger', 'critical'],
      default: 'info',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Suggested actions
    recommendations: [
      {
        type: String,
      },
    ],
    suggestedTests: [
      {
        type: String,
      },
    ],
    // Alert status
    isRead: {
      type: Boolean,
      default: false,
    },
    isAcknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedAt: {
      type: Date,
    },
    // Notification status
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
    },
    // Family notification
    familyNotified: {
      type: Boolean,
      default: false,
    },
    familyNotifiedAt: {
      type: Date,
    },
    // Priority
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    // Expiration
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, isRead: 1 });
alertSchema.index({ userId: 1, severity: 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
