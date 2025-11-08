const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    // Blood Pressure
    bp: {
      systolic: {
        type: Number,
        required: [true, 'Systolic BP is required'],
        min: [40, 'Systolic BP seems too low'],
        max: [300, 'Systolic BP seems too high'],
      },
      diastolic: {
        type: Number,
        required: [true, 'Diastolic BP is required'],
        min: [30, 'Diastolic BP seems too low'],
        max: [200, 'Diastolic BP seems too high'],
      },
    },
    // Heart Rate (beats per minute)
    heartRate: {
      type: Number,
      required: [true, 'Heart rate is required'],
      min: [30, 'Heart rate seems too low'],
      max: [250, 'Heart rate seems too high'],
    },
    // Blood Sugar (mg/dL)
    sugar: {
      type: Number,
      required: [true, 'Blood sugar is required'],
      min: [20, 'Blood sugar seems too low'],
      max: [600, 'Blood sugar seems too high'],
    },
    // Sleep Hours
    sleepHours: {
      type: Number,
      required: [true, 'Sleep hours is required'],
      min: [0, 'Sleep hours cannot be negative'],
      max: [24, 'Sleep hours cannot exceed 24'],
    },
    // Weight (kg)
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [20, 'Weight seems too low'],
      max: [300, 'Weight seems too high'],
    },
    // Optional symptoms
    symptoms: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    // Abnormality status (set by backend)
    abnormalityStatus: {
      level: {
        type: String,
        enum: ['normal', 'warning', 'danger'],
        default: 'normal',
      },
      details: {
        type: String,
      },
      flags: {
        highBP: { type: Boolean, default: false },
        lowBP: { type: Boolean, default: false },
        highHeartRate: { type: Boolean, default: false },
        lowHeartRate: { type: Boolean, default: false },
        highSugar: { type: Boolean, default: false },
        lowSugar: { type: Boolean, default: false },
        poorSleep: { type: Boolean, default: false },
      },
    },
    // Reading timestamp
    readingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
readingSchema.index({ userId: 1, createdAt: -1 });
readingSchema.index({ userId: 1, readingDate: -1 });

const Reading = mongoose.model('Reading', readingSchema);

module.exports = Reading;
