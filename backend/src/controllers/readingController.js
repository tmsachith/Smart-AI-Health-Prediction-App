const Reading = require('../models/Reading');
const Alert = require('../models/Alert');
const { checkAbnormality, getWellnessSuggestions, getHealthStatusMessage } = require('../utils/abnormalityChecker');

/**
 * @desc    Add new daily reading
 * @route   POST /api/readings/add
 * @access  Private
 */
const addReading = async (req, res) => {
  try {
    const { bp, heartRate, sugar, sleepHours, weight, symptoms, notes } = req.body;

    // Validate required fields
    if (!bp || !bp.systolic || !bp.diastolic || !heartRate || !sugar || !sleepHours || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required health readings',
      });
    }

    // Check for abnormalities
    const abnormalityResult = checkAbnormality({
      bp,
      heartRate,
      sugar,
      sleepHours,
    });

    // Create reading with abnormality status
    const reading = await Reading.create({
      userId: req.user._id,
      bp,
      heartRate,
      sugar,
      sleepHours,
      weight,
      symptoms: symptoms || [],
      notes: notes || '',
      abnormalityStatus: abnormalityResult,
    });

    // If abnormal, create alert
    if (abnormalityResult.level === 'warning' || abnormalityResult.level === 'danger') {
      const statusMessage = getHealthStatusMessage(abnormalityResult.level);
      const suggestions = getWellnessSuggestions(abnormalityResult.flags);

      // Extract test recommendations
      const suggestedTests = [];
      const recommendations = [];
      
      suggestions.forEach((suggestion) => {
        if (suggestion.type === 'test') {
          suggestedTests.push(...suggestion.items);
        } else {
          recommendations.push(...suggestion.items);
        }
      });

      await Alert.create({
        userId: req.user._id,
        readingId: reading._id,
        type: 'reading_abnormal',
        severity: abnormalityResult.level,
        title: statusMessage.title,
        message: abnormalityResult.details,
        details: {
          reading: {
            bp: `${bp.systolic}/${bp.diastolic}`,
            heartRate,
            sugar,
            sleepHours,
            weight,
          },
          flags: abnormalityResult.flags,
        },
        recommendations,
        suggestedTests,
        priority: abnormalityResult.level === 'danger' ? 10 : 5,
        familyNotified: abnormalityResult.level === 'danger', // Auto-notify family for danger
      });
    }

    // Populate and return
    const populatedReading = await Reading.findById(reading._id).populate('userId', 'name email age gender');

    res.status(201).json({
      success: true,
      message: 'Reading added successfully',
      data: {
        reading: populatedReading,
        abnormality: abnormalityResult,
        healthStatus: getHealthStatusMessage(abnormalityResult.level),
        suggestions: getWellnessSuggestions(abnormalityResult.flags),
      },
    });
  } catch (error) {
    console.error('Add reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reading',
      error: error.message,
    });
  }
};

/**
 * @desc    Get readings for a user
 * @route   GET /api/readings/user/:id
 * @access  Private
 */
const getUserReadings = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 30, page = 1, startDate, endDate } = req.query;

    // Build query
    const query = { userId: id };

    // Date range filter
    if (startDate || endDate) {
      query.readingDate = {};
      if (startDate) {
        query.readingDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.readingDate.$lte = new Date(endDate);
      }
    }

    // Get readings with pagination
    const readings = await Reading.find(query)
      .sort({ readingDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email age gender');

    const total = await Reading.countDocuments(query);

    // Calculate statistics
    const stats = await calculateReadingStats(id);

    res.status(200).json({
      success: true,
      data: {
        readings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
        stats,
      },
    });
  } catch (error) {
    console.error('Get readings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching readings',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single reading by ID
 * @route   GET /api/readings/:id
 * @access  Private
 */
const getReadingById = async (req, res) => {
  try {
    const reading = await Reading.findById(req.params.id).populate('userId', 'name email age gender');

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found',
      });
    }

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    console.error('Get reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reading',
      error: error.message,
    });
  }
};

/**
 * @desc    Get latest reading for a user
 * @route   GET /api/readings/user/:id/latest
 * @access  Private
 */
const getLatestReading = async (req, res) => {
  try {
    const reading = await Reading.findOne({ userId: req.params.id })
      .sort({ readingDate: -1 })
      .populate('userId', 'name email age gender');

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'No readings found for this user',
      });
    }

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    console.error('Get latest reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest reading',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a reading
 * @route   DELETE /api/readings/:id
 * @access  Private
 */
const deleteReading = async (req, res) => {
  try {
    const reading = await Reading.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found',
      });
    }

    // Check if user owns this reading
    if (reading.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reading',
      });
    }

    await reading.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Reading deleted successfully',
    });
  } catch (error) {
    console.error('Delete reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reading',
      error: error.message,
    });
  }
};

/**
 * Helper function to calculate reading statistics
 */
const calculateReadingStats = async (userId) => {
  try {
    const readings = await Reading.find({ userId }).sort({ readingDate: -1 }).limit(30);

    if (readings.length === 0) {
      return null;
    }

    const stats = {
      totalReadings: readings.length,
      averages: {
        systolic: 0,
        diastolic: 0,
        heartRate: 0,
        sugar: 0,
        weight: 0,
        sleepHours: 0,
      },
      trends: {
        bp: 'stable',
        heartRate: 'stable',
        sugar: 'stable',
        weight: 'stable',
      },
      abnormalCount: {
        normal: 0,
        warning: 0,
        danger: 0,
      },
    };

    // Calculate averages
    readings.forEach((reading) => {
      stats.averages.systolic += reading.bp.systolic;
      stats.averages.diastolic += reading.bp.diastolic;
      stats.averages.heartRate += reading.heartRate;
      stats.averages.sugar += reading.sugar;
      stats.averages.weight += reading.weight;
      stats.averages.sleepHours += reading.sleepHours;

      stats.abnormalCount[reading.abnormalityStatus.level]++;
    });

    Object.keys(stats.averages).forEach((key) => {
      stats.averages[key] = Math.round((stats.averages[key] / readings.length) * 10) / 10;
    });

    // Calculate trends (compare first half to second half)
    if (readings.length >= 6) {
      const midpoint = Math.floor(readings.length / 2);
      const recentAvg = {
        systolic: 0,
        heartRate: 0,
        sugar: 0,
        weight: 0,
      };
      const olderAvg = {
        systolic: 0,
        heartRate: 0,
        sugar: 0,
        weight: 0,
      };

      for (let i = 0; i < midpoint; i++) {
        recentAvg.systolic += readings[i].bp.systolic;
        recentAvg.heartRate += readings[i].heartRate;
        recentAvg.sugar += readings[i].sugar;
        recentAvg.weight += readings[i].weight;
      }

      for (let i = midpoint; i < readings.length; i++) {
        olderAvg.systolic += readings[i].bp.systolic;
        olderAvg.heartRate += readings[i].heartRate;
        olderAvg.sugar += readings[i].sugar;
        olderAvg.weight += readings[i].weight;
      }

      Object.keys(recentAvg).forEach((key) => {
        recentAvg[key] /= midpoint;
        olderAvg[key] /= readings.length - midpoint;

        const diff = recentAvg[key] - olderAvg[key];
        if (Math.abs(diff) < 5) {
          stats.trends[key] = 'stable';
        } else if (diff > 0) {
          stats.trends[key] = 'increasing';
        } else {
          stats.trends[key] = 'decreasing';
        }
      });

      // BP trend
      stats.trends.bp = stats.trends.systolic;
    }

    return stats;
  } catch (error) {
    console.error('Calculate stats error:', error);
    return null;
  }
};

module.exports = {
  addReading,
  getUserReadings,
  getReadingById,
  getLatestReading,
  deleteReading,
};
