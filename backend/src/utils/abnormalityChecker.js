/**
 * Check for abnormalities in health readings
 * Returns: { level: 'normal' | 'warning' | 'danger', details: string, flags: object }
 */
const checkAbnormality = (reading) => {
  const { bp, heartRate, sugar, sleepHours } = reading;
  
  const result = {
    level: 'normal',
    details: '',
    flags: {
      highBP: false,
      lowBP: false,
      highHeartRate: false,
      lowHeartRate: false,
      highSugar: false,
      lowSugar: false,
      poorSleep: false,
    },
  };

  const warnings = [];
  const dangers = [];

  // ==================== BLOOD PRESSURE CHECKS ====================
  
  // DANGER: Very high BP (Hypertensive Crisis)
  if (bp.systolic >= 180 || bp.diastolic >= 120) {
    result.flags.highBP = true;
    dangers.push('Critical high BP (Hypertensive Crisis)! Seek immediate medical attention.');
    result.level = 'danger';
  }
  // DANGER: Critically high BP
  else if (bp.systolic >= 160 || bp.diastolic >= 100) {
    result.flags.highBP = true;
    dangers.push('Very high BP detected! Please consult a doctor immediately.');
    result.level = 'danger';
  }
  // WARNING: High BP (Stage 1 Hypertension)
  else if (bp.systolic >= 140 || bp.diastolic >= 90) {
    result.flags.highBP = true;
    warnings.push('High BP detected (Stage 1 Hypertension). Monitor closely.');
  }
  // WARNING: Elevated BP
  else if (bp.systolic >= 130 || bp.diastolic >= 85) {
    result.flags.highBP = true;
    warnings.push('Elevated BP. Consider reducing salt intake and stress.');
  }
  
  // DANGER: Very low BP (Hypotension)
  if (bp.systolic < 90 && bp.diastolic < 60) {
    result.flags.lowBP = true;
    dangers.push('Very low BP (Hypotension)! Risk of dizziness and fainting.');
    result.level = 'danger';
  }
  // WARNING: Low BP
  else if (bp.systolic < 100 && bp.diastolic < 65) {
    result.flags.lowBP = true;
    warnings.push('Low BP detected. Stay hydrated and avoid sudden movements.');
  }

  // ==================== HEART RATE CHECKS ====================
  
  // DANGER: Very high heart rate (Tachycardia)
  if (heartRate >= 120) {
    result.flags.highHeartRate = true;
    dangers.push('Very high heart rate (Tachycardia)! Seek medical attention.');
    result.level = 'danger';
  }
  // WARNING: High heart rate
  else if (heartRate > 100) {
    result.flags.highHeartRate = true;
    warnings.push('Elevated heart rate. Try to rest and relax.');
  }
  
  // DANGER: Very low heart rate (Bradycardia)
  if (heartRate < 50) {
    result.flags.lowHeartRate = true;
    dangers.push('Very low heart rate (Bradycardia). Consult a doctor.');
    result.level = 'danger';
  }
  // WARNING: Low heart rate
  else if (heartRate < 60) {
    result.flags.lowHeartRate = true;
    warnings.push('Low heart rate detected. Monitor if you experience dizziness.');
  }

  // ==================== BLOOD SUGAR CHECKS ====================
  
  // DANGER: Very high sugar (Hyperglycemia)
  if (sugar >= 250) {
    result.flags.highSugar = true;
    dangers.push('Very high blood sugar! Risk of diabetic emergency. Seek immediate care.');
    result.level = 'danger';
  }
  // DANGER: High sugar
  else if (sugar >= 180) {
    result.flags.highSugar = true;
    dangers.push('High blood sugar detected. Contact your doctor.');
    result.level = 'danger';
  }
  // WARNING: Elevated sugar
  else if (sugar >= 140) {
    result.flags.highSugar = true;
    warnings.push('Elevated blood sugar. Avoid sugary foods and monitor closely.');
  }
  
  // DANGER: Very low sugar (Hypoglycemia)
  if (sugar < 70) {
    result.flags.lowSugar = true;
    dangers.push('Low blood sugar (Hypoglycemia)! Eat something sweet immediately.');
    result.level = 'danger';
  }
  // WARNING: Borderline low sugar
  else if (sugar < 80) {
    result.flags.lowSugar = true;
    warnings.push('Blood sugar is on the lower side. Have a healthy snack.');
  }

  // ==================== SLEEP CHECKS ====================
  
  // WARNING: Poor sleep
  if (sleepHours < 6) {
    result.flags.poorSleep = true;
    warnings.push('Insufficient sleep detected. Aim for 7-8 hours per night.');
  } else if (sleepHours > 10) {
    result.flags.poorSleep = true;
    warnings.push('Excessive sleep detected. This may indicate underlying issues.');
  }

  // ==================== BUILD RESULT MESSAGE ====================
  
  if (dangers.length > 0) {
    result.level = 'danger';
    result.details = '⚠️ URGENT: ' + dangers.join(' | ');
  } else if (warnings.length > 0) {
    result.level = 'warning';
    result.details = '⚠️ Warning: ' + warnings.join(' | ');
  } else {
    result.level = 'normal';
    result.details = '✅ All readings are within normal range. Keep up the good work!';
  }

  return result;
};

/**
 * Get health status message based on level
 */
const getHealthStatusMessage = (level) => {
  const messages = {
    normal: {
      emoji: '✅',
      title: 'All Good!',
      color: 'green',
      advice: 'Your health readings are normal. Continue your healthy lifestyle!',
    },
    warning: {
      emoji: '⚠️',
      title: 'Attention Needed',
      color: 'yellow',
      advice: 'Some readings need attention. Follow the recommendations and monitor closely.',
    },
    danger: {
      emoji: '❗',
      title: 'Urgent Care Required',
      color: 'red',
      advice: 'Critical readings detected! Please seek medical attention immediately.',
    },
  };

  return messages[level] || messages.normal;
};

/**
 * Get wellness suggestions based on abnormalities
 */
const getWellnessSuggestions = (flags) => {
  const suggestions = [];

  if (flags.highBP) {
    suggestions.push({
      type: 'test',
      title: 'Recommended Tests',
      items: ['Kidney Function Test', 'Lipid Profile', 'ECG', 'Echocardiogram'],
    });
    suggestions.push({
      type: 'lifestyle',
      title: 'Lifestyle Changes',
      items: ['Reduce salt intake', 'Exercise 30 mins daily', 'Manage stress', 'Limit alcohol'],
    });
  }

  if (flags.highSugar) {
    suggestions.push({
      type: 'test',
      title: 'Recommended Tests',
      items: ['HbA1c', 'Fasting Blood Sugar', 'Kidney Function', 'Eye Examination'],
    });
    suggestions.push({
      type: 'lifestyle',
      title: 'Lifestyle Changes',
      items: ['Avoid sugary foods', 'Eat more fiber', 'Regular exercise', 'Monitor carb intake'],
    });
  }

  if (flags.highHeartRate) {
    suggestions.push({
      type: 'test',
      title: 'Recommended Tests',
      items: ['ECG', 'Thyroid Profile', 'Complete Blood Count', 'Stress Test'],
    });
    suggestions.push({
      type: 'lifestyle',
      title: 'Lifestyle Changes',
      items: ['Practice deep breathing', 'Reduce caffeine', 'Get adequate rest', 'Manage anxiety'],
    });
  }

  if (flags.poorSleep) {
    suggestions.push({
      type: 'lifestyle',
      title: 'Sleep Improvement',
      items: ['Maintain sleep schedule', 'Avoid screens before bed', 'Create dark environment', 'Limit evening caffeine'],
    });
  }

  return suggestions;
};

module.exports = {
  checkAbnormality,
  getHealthStatusMessage,
  getWellnessSuggestions,
};
