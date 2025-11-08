const Alert = require('../models/Alert');

/**
 * @desc    Get alerts for a user
 * @route   GET /api/alerts/user/:id
 * @access  Private
 */
const getUserAlerts = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      limit = 50, 
      page = 1, 
      severity, 
      type, 
      isRead,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { userId: id };

    if (severity) {
      query.severity = severity;
    }

    if (type) {
      query.type = type;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Get alerts with pagination
    const alerts = await Alert.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email')
      .populate('readingId')
      .populate('reportId');

    const total = await Alert.countDocuments(query);
    const unreadCount = await Alert.countDocuments({ userId: id, isRead: false });

    // Group alerts by severity
    const groupedBySeverity = await Alert.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(id) } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        alerts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
        summary: {
          unreadCount,
          groupedBySeverity: groupedBySeverity.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
      },
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message,
    });
  }
};

/**
 * @desc    Get alert by ID
 * @route   GET /api/alerts/:id
 * @access  Private
 */
const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('userId', 'name email age gender')
      .populate('readingId')
      .populate('reportId');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark alert as read
 * @route   PUT /api/alerts/:id/read
 * @access  Private
 */
const markAlertAsRead = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    alert.isRead = true;
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert marked as read',
      data: alert,
    });
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating alert',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark alert as acknowledged
 * @route   PUT /api/alerts/:id/acknowledge
 * @access  Private
 */
const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    alert.isAcknowledged = true;
    alert.acknowledgedAt = new Date();
    alert.isRead = true;
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged',
      data: alert,
    });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark all alerts as read for a user
 * @route   PUT /api/alerts/user/:id/read-all
 * @access  Private
 */
const markAllAlertsAsRead = async (req, res) => {
  try {
    const result = await Alert.updateMany(
      { userId: req.params.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} alerts marked as read`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Mark all alerts as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating alerts',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete alert
 * @route   DELETE /api/alerts/:id
 * @access  Private
 */
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    await alert.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting alert',
      error: error.message,
    });
  }
};

/**
 * @desc    Create manual alert (for testing or admin use)
 * @route   POST /api/alerts/create
 * @access  Private
 */
const createAlert = async (req, res) => {
  try {
    const { 
      userId, 
      type, 
      severity, 
      title, 
      message, 
      details, 
      recommendations, 
      suggestedTests 
    } = req.body;

    if (!userId || !type || !severity || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const alert = await Alert.create({
      userId,
      type,
      severity,
      title,
      message,
      details: details || {},
      recommendations: recommendations || [],
      suggestedTests: suggestedTests || [],
      priority: severity === 'critical' ? 10 : severity === 'danger' ? 8 : severity === 'warning' ? 5 : 3,
    });

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert,
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating alert',
      error: error.message,
    });
  }
};

module.exports = {
  getUserAlerts,
  getAlertById,
  markAlertAsRead,
  acknowledgeAlert,
  markAllAlertsAsRead,
  deleteAlert,
  createAlert,
};
