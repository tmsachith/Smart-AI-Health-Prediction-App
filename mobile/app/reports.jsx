import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { reportsAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, processing

  useEffect(() => {
    fetchReports();
  }, [filter]); // Re-fetch when filter changes

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await reportsAPI.getUserReports(params);
      console.log('📊 Reports Response:', response);
      
      // Backend returns data as array directly, not nested in reports property
      const reportsData = Array.isArray(response.data) ? response.data : (response.data.reports || []);
      setReports(reportsData);
      
      console.log('📋 Reports loaded:', reportsData.length);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [filter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'processing':
        return '#FFA500';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAbnormalityCount = (report) => {
    return report.abnormalities?.length || 0;
  };

  const renderReportCard = ({ item }) => {
    const abnormalityCount = getAbnormalityCount(item);
    const hasAbnormalities = abnormalityCount > 0;

    return (
      <TouchableOpacity
        style={[
          styles.reportCard,
          hasAbnormalities && styles.reportCardWithAbnormalities,
        ]}
        onPress={() => router.push({ pathname: '/report-details', params: { id: item._id } })}
      >
        {/* Header */}
        <View style={styles.reportHeader}>
          <View style={styles.reportIcon}>
            <Ionicons name="document-text" size={32} color="#4A90E2" />
          </View>
          
          <View style={styles.reportInfo}>
            <Text style={styles.reportType}>
              {getReportTypeLabel(item.reportType)}
            </Text>
            <Text style={styles.reportDate}>{formatDate(item.uploadedAt)}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* OCR Info */}
        {item.status === 'completed' && (
          <View style={styles.ocrInfo}>
            <View style={styles.ocrInfoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <Text style={styles.ocrInfoText}>
                Confidence: {(item.ocrConfidence * 100).toFixed(1)}%
              </Text>
            </View>
            
            {hasAbnormalities && (
              <View style={styles.ocrInfoItem}>
                <Ionicons name="warning" size={20} color="#FF6B6B" />
                <Text style={[styles.ocrInfoText, { color: '#FF6B6B' }]}>
                  {abnormalityCount} Abnormalit{abnormalityCount === 1 ? 'y' : 'ies'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Processing Info */}
        {item.status === 'processing' && (
          <View style={styles.processingInfo}>
            <ActivityIndicator size="small" color="#FFA500" />
            <Text style={styles.processingText}>Analyzing report...</Text>
          </View>
        )}

        {/* Failed Info */}
        {item.status === 'failed' && (
          <View style={styles.failedInfo}>
            <Ionicons name="close-circle" size={20} color="#dc3545" />
            <Text style={styles.failedText}>Processing failed</Text>
          </View>
        )}

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={24} color="#ccc" style={styles.arrowIcon} />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Reports Yet</Text>
      <Text style={styles.emptyText}>
        Upload your first medical report to get started
      </Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => router.push('/upload-report')}
      >
        <Ionicons name="cloud-upload" size={24} color="#fff" />
        <Text style={styles.uploadButtonText}>Upload Report</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reports</Text>
        <TouchableOpacity 
          onPress={() => router.push('/upload-report')}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={32} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'processing' && styles.filterButtonActive]}
          onPress={() => setFilter('processing')}
        >
          <Text style={[styles.filterText, filter === 'processing' && styles.filterTextActive]}>
            Processing
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4A90E2']}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
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
  addButton: {
    padding: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    backgroundColor: '#fff',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportCardWithAbnormalities: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  reportIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportInfo: {
    flex: 1,
    marginLeft: 15,
  },
  reportType: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  reportDate: {
    fontSize: 16,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ocrInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  ocrInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ocrInfoText: {
    fontSize: 16,
    color: '#555',
  },
  processingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  processingText: {
    fontSize: 16,
    color: '#FFA500',
  },
  failedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  failedText: {
    fontSize: 16,
    color: '#dc3545',
  },
  arrowIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
    marginTop: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
