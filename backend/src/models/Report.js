const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  reportType: {
    type: String,
    enum: ['blood_test', 'urine_test', 'lipid_profile', 'ecg', 'ultrasound', 'xray', 'other'],
    default: 'blood_test'
  },
  
  fileUrl: {
    type: String,
    required: true
  },
  
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  
  fileName: {
    type: String,
    required: true
  },
  
  fileType: {
    type: String,
    enum: ['image', 'pdf'],
    required: true
  },
  
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed'],
    default: 'uploaded'
  },
  
  extractedData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Common blood test parameters
  bloodTest: {
    hemoglobin: Number,
    wbc: Number,
    rbc: Number,
    platelets: Number,
    hematocrit: Number,
    mcv: Number,
    mch: Number,
    mchc: Number
  },
  
  // Lipid profile
  lipidProfile: {
    totalCholesterol: Number,
    ldl: Number,
    hdl: Number,
    triglycerides: Number,
    vldl: Number
  },
  
  // Kidney function
  kidneyFunction: {
    creatinine: Number,
    urea: Number,
    uricAcid: Number,
    bun: Number
  },
  
  // Liver function
  liverFunction: {
    sgot: Number,
    sgpt: Number,
    alkalinePhosphatase: Number,
    totalBilirubin: Number,
    directBilirubin: Number,
    totalProtein: Number,
    albumin: Number,
    globulin: Number
  },
  
  // Diabetes markers
  diabetesMarkers: {
    fastingGlucose: Number,
    randomGlucose: Number,
    hba1c: Number,
    postprandialGlucose: Number
  },
  
  // Thyroid function
  thyroidFunction: {
    tsh: Number,
    t3: Number,
    t4: Number,
    freeT3: Number,
    freeT4: Number
  },
  
  // Urine test
  urineTest: {
    ph: Number,
    specificGravity: Number,
    protein: String,
    glucose: String,
    ketones: String,
    blood: String,
    leukocytes: String,
    nitrites: String
  },
  
  // ECG findings (text-based)
  ecgFindings: {
    heartRate: Number,
    rhythm: String,
    prInterval: Number,
    qrsDuration: Number,
    qtInterval: Number,
    findings: String,
    interpretation: String
  },
  
  // Additional findings
  additionalFindings: {
    type: String,
    default: ''
  },
  
  // Abnormality detection results
  abnormalities: [{
    parameter: String,
    value: Number,
    normalRange: String,
    severity: {
      type: String,
      enum: ['normal', 'borderline', 'abnormal', 'critical']
    },
    message: String
  }],
  
  // Processing metadata
  processingTime: Number, // in milliseconds
  
  ocrConfidence: Number, // 0-100
  
  errorMessage: String,
  
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  
  processedAt: Date,
  
  notes: String

}, {
  timestamps: true
});

// Index for faster queries
reportSchema.index({ userId: 1, uploadedAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ reportType: 1 });

// Method to check for abnormalities
reportSchema.methods.detectAbnormalities = function() {
  const abnormalities = [];
  
  // Blood Test Checks
  if (this.bloodTest) {
    const { hemoglobin, wbc, rbc, platelets } = this.bloodTest;
    
    if (hemoglobin) {
      if (hemoglobin < 12) {
        abnormalities.push({
          parameter: 'Hemoglobin',
          value: hemoglobin,
          normalRange: '12-16 g/dL',
          severity: hemoglobin < 8 ? 'critical' : 'abnormal',
          message: 'Low hemoglobin - Anemia suspected'
        });
      } else if (hemoglobin > 16) {
        abnormalities.push({
          parameter: 'Hemoglobin',
          value: hemoglobin,
          normalRange: '12-16 g/dL',
          severity: 'abnormal',
          message: 'High hemoglobin - Polycythemia suspected'
        });
      }
    }
    
    if (wbc) {
      if (wbc < 4000) {
        abnormalities.push({
          parameter: 'WBC',
          value: wbc,
          normalRange: '4000-11000 cells/μL',
          severity: wbc < 2000 ? 'critical' : 'abnormal',
          message: 'Low WBC count - Immune system weakness'
        });
      } else if (wbc > 11000) {
        abnormalities.push({
          parameter: 'WBC',
          value: wbc,
          normalRange: '4000-11000 cells/μL',
          severity: wbc > 20000 ? 'critical' : 'abnormal',
          message: 'High WBC count - Possible infection'
        });
      }
    }
    
    if (platelets) {
      if (platelets < 150000) {
        abnormalities.push({
          parameter: 'Platelets',
          value: platelets,
          normalRange: '150000-450000 cells/μL',
          severity: platelets < 50000 ? 'critical' : 'abnormal',
          message: 'Low platelet count - Bleeding risk'
        });
      } else if (platelets > 450000) {
        abnormalities.push({
          parameter: 'Platelets',
          value: platelets,
          normalRange: '150000-450000 cells/μL',
          severity: 'abnormal',
          message: 'High platelet count - Clotting risk'
        });
      }
    }
  }
  
  // Lipid Profile Checks
  if (this.lipidProfile) {
    const { totalCholesterol, ldl, hdl, triglycerides } = this.lipidProfile;
    
    if (totalCholesterol) {
      if (totalCholesterol > 240) {
        abnormalities.push({
          parameter: 'Total Cholesterol',
          value: totalCholesterol,
          normalRange: '<200 mg/dL',
          severity: totalCholesterol > 300 ? 'critical' : 'abnormal',
          message: 'High cholesterol - Heart disease risk'
        });
      } else if (totalCholesterol > 200) {
        abnormalities.push({
          parameter: 'Total Cholesterol',
          value: totalCholesterol,
          normalRange: '<200 mg/dL',
          severity: 'borderline',
          message: 'Borderline high cholesterol'
        });
      }
    }
    
    if (ldl && ldl > 160) {
      abnormalities.push({
        parameter: 'LDL Cholesterol',
        value: ldl,
        normalRange: '<100 mg/dL',
        severity: ldl > 190 ? 'critical' : 'abnormal',
        message: 'High LDL - Bad cholesterol elevated'
      });
    }
    
    if (hdl && hdl < 40) {
      abnormalities.push({
        parameter: 'HDL Cholesterol',
        value: hdl,
        normalRange: '>40 mg/dL',
        severity: 'abnormal',
        message: 'Low HDL - Good cholesterol too low'
      });
    }
    
    if (triglycerides && triglycerides > 200) {
      abnormalities.push({
        parameter: 'Triglycerides',
        value: triglycerides,
        normalRange: '<150 mg/dL',
        severity: triglycerides > 500 ? 'critical' : 'abnormal',
        message: 'High triglycerides - Heart disease risk'
      });
    }
  }
  
  // Kidney Function Checks
  if (this.kidneyFunction) {
    const { creatinine, urea } = this.kidneyFunction;
    
    if (creatinine && creatinine > 1.3) {
      abnormalities.push({
        parameter: 'Creatinine',
        value: creatinine,
        normalRange: '0.6-1.3 mg/dL',
        severity: creatinine > 2.0 ? 'critical' : 'abnormal',
        message: 'High creatinine - Kidney function issue'
      });
    }
    
    if (urea && urea > 45) {
      abnormalities.push({
        parameter: 'Urea',
        value: urea,
        normalRange: '15-45 mg/dL',
        severity: urea > 100 ? 'critical' : 'abnormal',
        message: 'High urea - Kidney function concern'
      });
    }
  }
  
  // Liver Function Checks
  if (this.liverFunction) {
    const { sgot, sgpt, totalBilirubin } = this.liverFunction;
    
    if (sgot && sgot > 40) {
      abnormalities.push({
        parameter: 'SGOT/AST',
        value: sgot,
        normalRange: '5-40 U/L',
        severity: sgot > 100 ? 'critical' : 'abnormal',
        message: 'Elevated SGOT - Liver damage possible'
      });
    }
    
    if (sgpt && sgpt > 56) {
      abnormalities.push({
        parameter: 'SGPT/ALT',
        value: sgpt,
        normalRange: '7-56 U/L',
        severity: sgpt > 100 ? 'critical' : 'abnormal',
        message: 'Elevated SGPT - Liver inflammation'
      });
    }
    
    if (totalBilirubin && totalBilirubin > 1.2) {
      abnormalities.push({
        parameter: 'Total Bilirubin',
        value: totalBilirubin,
        normalRange: '0.1-1.2 mg/dL',
        severity: totalBilirubin > 3.0 ? 'critical' : 'abnormal',
        message: 'High bilirubin - Liver/bile duct issue'
      });
    }
  }
  
  // Diabetes Markers
  if (this.diabetesMarkers) {
    const { fastingGlucose, hba1c } = this.diabetesMarkers;
    
    if (fastingGlucose) {
      if (fastingGlucose > 126) {
        abnormalities.push({
          parameter: 'Fasting Glucose',
          value: fastingGlucose,
          normalRange: '70-100 mg/dL',
          severity: fastingGlucose > 200 ? 'critical' : 'abnormal',
          message: 'High fasting glucose - Diabetes indicated'
        });
      } else if (fastingGlucose > 100) {
        abnormalities.push({
          parameter: 'Fasting Glucose',
          value: fastingGlucose,
          normalRange: '70-100 mg/dL',
          severity: 'borderline',
          message: 'Pre-diabetes range'
        });
      }
    }
    
    if (hba1c) {
      if (hba1c > 6.5) {
        abnormalities.push({
          parameter: 'HbA1c',
          value: hba1c,
          normalRange: '<5.7%',
          severity: hba1c > 9 ? 'critical' : 'abnormal',
          message: 'High HbA1c - Diabetes confirmed'
        });
      } else if (hba1c > 5.7) {
        abnormalities.push({
          parameter: 'HbA1c',
          value: hba1c,
          normalRange: '<5.7%',
          severity: 'borderline',
          message: 'Pre-diabetes range'
        });
      }
    }
  }
  
  // Thyroid Function
  if (this.thyroidFunction) {
    const { tsh } = this.thyroidFunction;
    
    if (tsh) {
      if (tsh > 4.5) {
        abnormalities.push({
          parameter: 'TSH',
          value: tsh,
          normalRange: '0.4-4.5 mIU/L',
          severity: tsh > 10 ? 'critical' : 'abnormal',
          message: 'High TSH - Hypothyroidism suspected'
        });
      } else if (tsh < 0.4) {
        abnormalities.push({
          parameter: 'TSH',
          value: tsh,
          normalRange: '0.4-4.5 mIU/L',
          severity: tsh < 0.1 ? 'critical' : 'abnormal',
          message: 'Low TSH - Hyperthyroidism suspected'
        });
      }
    }
  }
  
  this.abnormalities = abnormalities;
  return abnormalities;
};

// Virtual for getting severity summary
reportSchema.virtual('severitySummary').get(function() {
  const summary = {
    normal: 0,
    borderline: 0,
    abnormal: 0,
    critical: 0
  };
  
  this.abnormalities.forEach(abn => {
    summary[abn.severity] = (summary[abn.severity] || 0) + 1;
  });
  
  return summary;
});

reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Report', reportSchema);
