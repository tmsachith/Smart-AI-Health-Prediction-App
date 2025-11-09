import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { reportsAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ReportDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      console.log('📄 Fetching report ID:', id);
      
      const response = await reportsAPI.getReportById(id);
      console.log('📊 Report Response:', response);
      
      // Backend returns data as report object directly
      const reportData = response.data.report || response.data;
      setReport(reportData);
      
      console.log('✅ Report loaded:', reportData._id);
    } catch (error) {
      console.error('❌ Error fetching report details:', error);
      console.error('  - Message:', error.message);
      console.error('  - Response:', error.response?.data);
      Alert.alert('Error', 'Failed to load report details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportsAPI.deleteReport(id);
              Alert.alert('Success', 'Report deleted successfully.');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete report.');
            }
          },
        },
      ]
    );
  };

  const openFile = () => {
    if (report?.fileUrl) {
      Linking.openURL(report.fileUrl);
    }
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      blood_test: 'Blood Test',
      lipid_profile: 'Lipid Profile',
      kidney_function: 'Kidney Function',
      liver_function: 'Liver Function',
      diabetes: 'Diabetes',
      thyroid: 'Thyroid',
      ecg: 'ECG',
      urine_test: 'Urine Test',
      other: 'Other',
    };
    return labels[type] || 'Unknown';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#dc3545';
      case 'abnormal':
        return '#FF6B6B';
      case 'borderline':
        return '#FFA500';
      default:
        return '#28a745';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderParameterValue = (key, value) => {
    if (value === null || value === undefined) return null;
    
    // Format key to readable label
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    
    return (
      <View style={styles.parameterRow} key={key}>
        <Text style={styles.parameterLabel}>{label}:</Text>
        <Text style={styles.parameterValue}>{value}</Text>
      </View>
    );
  };

  const renderExtractedData = () => {
    if (!report || report.status !== 'completed') {
      console.log('⏭️ Skipping extracted data - Status:', report?.status);
      return null;
    }

    console.log('📊 Full Report Object Keys:', Object.keys(report));
    console.log('📊 Has extractedData?:', !!report.extractedData);
    console.log('📊 Direct fields:', {
      bloodTest: !!report.bloodTest,
      lipidProfile: !!report.lipidProfile,
      kidneyFunction: !!report.kidneyFunction,
      liverFunction: !!report.liverFunction,
    });

    // Check if data is in extractedData or top-level
    const hasExtractedData = report.extractedData && typeof report.extractedData === 'object';
    const hasTopLevelData = report.bloodTest || report.lipidProfile || report.kidneyFunction || report.liverFunction;

    console.log('📊 Data location:', hasExtractedData ? 'In extractedData' : hasTopLevelData ? 'Top-level' : 'None found');

    const sections = [
      { title: 'Blood Test', data: report.extractedData?.bloodTest || report.bloodTest },
      { title: 'Lipid Profile', data: report.extractedData?.lipidProfile || report.lipidProfile },
      { title: 'Kidney Function', data: report.extractedData?.kidneyFunction || report.kidneyFunction },
      { title: 'Liver Function', data: report.extractedData?.liverFunction || report.liverFunction },
      { title: 'Diabetes Markers', data: report.extractedData?.diabetes || report.diabetesMarkers },
      { title: 'Thyroid Function', data: report.extractedData?.thyroid || report.thyroidFunction },
      { title: 'ECG Results', data: report.extractedData?.ecg || report.ecgFindings },
      { title: 'Urine Test', data: report.extractedData?.urineTest || report.urineTest },
    ];

    const renderedSections = sections.map((section) => {
      if (!section.data || Object.keys(section.data).length === 0) {
        console.log(`⏭️ Skipping ${section.title} - No data`);
        return null;
      }

      console.log(`✅ Rendering ${section.title} with ${Object.keys(section.data).length} fields`);

      return (
        <View style={styles.dataSection} key={section.title}>
          <Text style={styles.dataSectionTitle}>{section.title}</Text>
          <View style={styles.dataSectionContent}>
            {Object.entries(section.data).map(([key, value]) =>
              renderParameterValue(key, value)
            )}
          </View>
        </View>
      );
    });

    const hasAnyData = renderedSections.some(section => section !== null);
    if (!hasAnyData) {
      console.log('⚠️ No extracted data found to display');
    }

    return renderedSections;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading report...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={80} color="#dc3545" />
        <Text style={styles.errorText}>Report not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={26} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Report Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="document-text" size={40} color="#4A90E2" />
            <View style={styles.infoHeaderText}>
              <Text style={styles.reportType}>{getReportTypeLabel(report.reportType)}</Text>
              <Text style={styles.uploadDate}>{formatDate(report.uploadedAt)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: report.status === 'completed' ? '#28a745' : '#FFA500' }]}>
                {report.status}
              </Text>
            </View>

            {report.ocrConfidence && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Confidence</Text>
                <Text style={styles.infoValue}>
                  {(report.ocrConfidence * 100).toFixed(1)}%
                </Text>
              </View>
            )}
          </View>

          {report.fileUrl && (
            <TouchableOpacity style={styles.viewFileButton} onPress={openFile}>
              <Ionicons name="cloud-download" size={24} color="#4A90E2" />
              <Text style={styles.viewFileText}>View Original File</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Abnormalities Section */}
        {report.abnormalities && report.abnormalities.length > 0 && (
          <View style={styles.abnormalitiesCard}>
            <View style={styles.abnormalitiesHeader}>
              <Ionicons name="warning" size={28} color="#FF6B6B" />
              <Text style={styles.abnormalitiesTitle}>
                Detected Abnormalities ({report.abnormalities.length})
              </Text>
            </View>

            {report.abnormalities.map((abnormality, index) => (
              <View
                key={index}
                style={[
                  styles.abnormalityItem,
                  { borderLeftColor: getSeverityColor(abnormality.severity) },
                ]}
              >
                <View style={styles.abnormalityHeader}>
                  <Text style={styles.abnormalityParameter}>{abnormality.parameter}</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(abnormality.severity) },
                    ]}
                  >
                    <Text style={styles.severityText}>{abnormality.severity}</Text>
                  </View>
                </View>
                <Text style={styles.abnormalityValue}>Value: {abnormality.value}</Text>
                <Text style={styles.abnormalityRange}>Normal: {abnormality.normalRange}</Text>
              </View>
            ))}
          </View>
        )}

        {/* No Abnormalities Message */}
        {report.status === 'completed' && 
         (!report.abnormalities || report.abnormalities.length === 0) && (
          <View style={styles.noAbnormalitiesCard}>
            <Ionicons name="checkmark-circle" size={50} color="#28a745" />
            <Text style={styles.noAbnormalitiesTitle}>All Parameters Normal</Text>
            <Text style={styles.noAbnormalitiesText}>
              No abnormalities detected in this report
            </Text>
          </View>
        )}

        {/* Extracted Data */}
        {report.status === 'completed' && report.extractedData && (
          <View style={styles.extractedDataCard}>
            <Text style={styles.cardTitle}>Extracted Health Data</Text>
            {renderExtractedData()}
          </View>
        )}

        {/* Processing Info */}
        {report.status === 'processing' && (
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#FFA500" />
            <Text style={styles.processingTitle}>Processing Report</Text>
            <Text style={styles.processingText}>
              Your report is being analyzed. This may take a few minutes.
            </Text>
          </View>
        )}

        {/* Failed Info */}
        {report.status === 'failed' && (
          <View style={styles.failedCard}>
            <Ionicons name="close-circle" size={60} color="#dc3545" />
            <Text style={styles.failedTitle}>Processing Failed</Text>
            <Text style={styles.failedText}>
              {report.ocrError || 'Unable to process this report. Please try uploading again.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#fff',
    elevation: 2,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  deleteButton: {
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    fontSize: 20,
    color: '#888',
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    fontSize: 24,
    color: '#333',
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoHeaderText: {
    flex: 1,
    marginLeft: 15,
  },
  reportType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  uploadDate: {
    fontSize: 16,
    color: '#888',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  viewFileText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
  abnormalitiesCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  abnormalitiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  abnormalitiesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  abnormalityItem: {
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  abnormalityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  abnormalityParameter: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  abnormalityValue: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  abnormalityRange: {
    fontSize: 16,
    color: '#888',
  },
  noAbnormalitiesCard: {
    backgroundColor: '#F0FFF4',
    borderRadius: 15,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#28a745',
  },
  noAbnormalitiesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 15,
  },
  noAbnormalitiesText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
  extractedDataCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  dataSection: {
    marginBottom: 25,
  },
  dataSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 15,
  },
  dataSectionContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
  },
  parameterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  parameterLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  parameterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  processingCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  processingText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
  failedCard: {
    backgroundColor: '#FFE5E5',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  failedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 20,
  },
  failedText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
});
