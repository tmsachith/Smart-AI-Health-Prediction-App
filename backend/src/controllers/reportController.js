const Report = require('../models/Report');
const Alert = require('../models/Alert');
const axios = require('axios');
const { getFileDetails, deleteFromCloudinary } = require('../config/cloudinary');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Upload and process medical report
 * POST /api/reports/upload
 */
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { reportType, notes } = req.body;
    const userId = req.user.id;

    // Get file details from uploaded file
    const fileDetails = getFileDetails(req.file);

    // Create report document
    const report = new Report({
      userId,
      reportType: reportType || 'blood_test',
      ...fileDetails,
      status: 'uploaded',
      notes: notes || '',
      uploadedAt: new Date()
    });

    await report.save();

    // Start OCR processing asynchronously
    processReportOCR(report._id, fileDetails.fileUrl, reportType);

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully. Processing started.',
      data: {
        report: report
      }
    });

  } catch (error) {
    console.error('Error uploading report:', error);
    
    // Delete uploaded file from Cloudinary if report creation failed
    if (req.file && req.file.filename) {
      try {
        const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
        await deleteFromCloudinary(req.file.filename, resourceType);
      } catch (deleteError) {
        console.error('Error deleting file from Cloudinary:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading report',
      error: error.message
    });
  }
};

/**
 * Process report using ML service (OCR extraction)
 * This runs asynchronously after upload
 */
async function processReportOCR(reportId, fileUrl, reportType) {
  try {
    // Update status to processing
    await Report.findByIdAndUpdate(reportId, { 
      status: 'processing' 
    });

    const startTime = Date.now();

    // Call ML service for OCR extraction
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/extract-report`, {
      fileUrl,
      reportType: reportType || 'blood_test'
    }, {
      timeout: 120000 // 2 minutes timeout
    });

    const processingTime = Date.now() - startTime;
    const extractedData = mlResponse.data;

    // Update report with extracted data
    const report = await Report.findById(reportId);
    
    if (!report) {
      console.error('Report not found:', reportId);
      return;
    }

    // Map extracted data to appropriate fields
    if (extractedData.bloodTest) {
      report.bloodTest = extractedData.bloodTest;
    }
    if (extractedData.lipidProfile) {
      report.lipidProfile = extractedData.lipidProfile;
    }
    if (extractedData.kidneyFunction) {
      report.kidneyFunction = extractedData.kidneyFunction;
    }
    if (extractedData.liverFunction) {
      report.liverFunction = extractedData.liverFunction;
    }
    if (extractedData.diabetesMarkers) {
      report.diabetesMarkers = extractedData.diabetesMarkers;
    }
    if (extractedData.thyroidFunction) {
      report.thyroidFunction = extractedData.thyroidFunction;
    }
    if (extractedData.urineTest) {
      report.urineTest = extractedData.urineTest;
    }
    if (extractedData.ecgFindings) {
      report.ecgFindings = extractedData.ecgFindings;
    }

    report.extractedData = extractedData.raw || extractedData;
    report.ocrConfidence = extractedData.confidence || 0;
    report.processingTime = processingTime;
    report.status = 'completed';
    report.processedAt = new Date();

    // Detect abnormalities
    const abnormalities = report.detectAbnormalities();

    await report.save();

    // Create alerts for critical and abnormal findings
    await createAlertsForAbnormalities(report.userId, reportId, abnormalities);

    console.log(`Report ${reportId} processed successfully in ${processingTime}ms`);

  } catch (error) {
    console.error('Error processing report OCR:', error);
    
    // Update report status to failed
    await Report.findByIdAndUpdate(reportId, {
      status: 'failed',
      errorMessage: error.message,
      processedAt: new Date()
    });
  }
}

/**
 * Create alerts for abnormal findings
 */
async function createAlertsForAbnormalities(userId, reportId, abnormalities) {
  try {
    const criticalAbnormalities = abnormalities.filter(a => a.severity === 'critical');
    const abnormalFindings = abnormalities.filter(a => a.severity === 'abnormal');

    // Create alert for critical findings
    if (criticalAbnormalities.length > 0) {
      const criticalParams = criticalAbnormalities.map(a => a.parameter).join(', ');
      const criticalMessages = criticalAbnormalities.map(a => `${a.parameter}: ${a.message}`).join('; ');

      await Alert.create({
        userId,
        type: 'report_critical',
        severity: 'danger',
        title: '🚨 Critical Lab Results Detected',
        message: `Critical abnormalities found in your medical report: ${criticalParams}. ${criticalMessages}`,
        relatedData: {
          reportId,
          abnormalities: criticalAbnormalities
        },
        recommendedTests: ['Immediate doctor consultation', 'Repeat tests if needed'],
        recommendations: [
          'Consult your doctor immediately',
          'Do not ignore these findings',
          'Carry report to emergency if symptoms worsen'
        ]
      });
    }

    // Create alert for abnormal findings
    if (abnormalFindings.length > 0) {
      const abnormalParams = abnormalFindings.map(a => a.parameter).join(', ');
      const abnormalMessages = abnormalFindings.map(a => `${a.parameter}: ${a.message}`).join('; ');

      await Alert.create({
        userId,
        type: 'report_abnormal',
        severity: 'warning',
        title: '⚠️ Abnormal Lab Results',
        message: `Some abnormal values detected in your report: ${abnormalParams}. ${abnormalMessages}`,
        relatedData: {
          reportId,
          abnormalities: abnormalFindings
        },
        recommendedTests: ['Doctor consultation recommended', 'Follow-up tests may be needed'],
        recommendations: [
          'Schedule a doctor appointment soon',
          'Discuss these results with your physician',
          'Follow prescribed treatment if any'
        ]
      });
    }

    // Create info alert for borderline findings
    const borderlineFindings = abnormalities.filter(a => a.severity === 'borderline');
    if (borderlineFindings.length > 0) {
      const borderlineParams = borderlineFindings.map(a => a.parameter).join(', ');

      await Alert.create({
        userId,
        type: 'report_borderline',
        severity: 'info',
        title: 'ℹ️ Borderline Lab Results',
        message: `Some borderline values detected: ${borderlineParams}. Monitor these parameters.`,
        relatedData: {
          reportId,
          abnormalities: borderlineFindings
        },
        recommendations: [
          'Monitor these parameters regularly',
          'Maintain healthy lifestyle',
          'Discuss with doctor during next visit'
        ]
      });
    }

  } catch (error) {
    console.error('Error creating alerts for abnormalities:', error);
  }
}

/**
 * Get all reports for a user
 * GET /api/reports
 */
exports.getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, reportType, limit = 10, page = 1 } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (reportType) query.reportType = reportType;

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .sort({ uploadedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-extractedData'); // Exclude raw extracted data for list view

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reports',
      error: error.message
    });
  }
};

/**
 * Get single report by ID
 * GET /api/reports/:id
 */
exports.getReportById = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;

    const report = await Report.findOne({
      _id: reportId,
      userId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving report',
      error: error.message
    });
  }
};

/**
 * Delete report
 * DELETE /api/reports/:id
 */
exports.deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;

    const report = await Report.findOne({
      _id: reportId,
      userId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Delete file from Cloudinary
    try {
      const resourceType = report.fileType === 'pdf' ? 'raw' : 'image';
      await deleteFromCloudinary(report.cloudinaryPublicId, resourceType);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with deletion even if Cloudinary fails
    }

    // Delete report from database
    await Report.findByIdAndDelete(reportId);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

/**
 * Get report statistics
 * GET /api/reports/stats
 */
exports.getReportStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Report.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          completedReports: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          processingReports: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          failedReports: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          totalAbnormalities: {
            $sum: { $size: { $ifNull: ['$abnormalities', []] } }
          }
        }
      }
    ]);

    const reportTypeStats = await Report.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$reportType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalReports: 0,
          completedReports: 0,
          processingReports: 0,
          failedReports: 0,
          totalAbnormalities: 0
        },
        byType: reportTypeStats
      }
    });

  } catch (error) {
    console.error('Error getting report stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: error.message
    });
  }
};

module.exports = {
  uploadReport: exports.uploadReport,
  getUserReports: exports.getUserReports,
  getReportById: exports.getReportById,
  deleteReport: exports.deleteReport,
  getReportStats: exports.getReportStats
};
