import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { readingsAPI } from '../../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [latestReading, setLatestReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadLatestReading();
    }
  }, [isAuthenticated, user]);

  const loadLatestReading = async () => {
    try {
      setLoading(true);
      const response = await readingsAPI.getLatestReading(user._id);
      
      if (response.success) {
        setLatestReading(response.data);
      }
    } catch (error) {
      console.error('Error loading latest reading:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLatestReading();
    setRefreshing(false);
  };

  const getStatusColor = (level) => {
    switch (level) {
      case 'normal':
        return '#10AC84';
      case 'warning':
        return '#FFA502';
      case 'danger':
        return '#EE5A6F';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (level) => {
    switch (level) {
      case 'normal':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'danger':
        return '❗';
      default:
        return '📊';
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.welcomeText}>Please login to continue</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</Text>
        </View>

        {/* Today's Health Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Health Status</Text>
          
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#2E86DE" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : latestReading ? (
            <View style={[
              styles.statusCard,
              { borderLeftColor: getStatusColor(latestReading.abnormalityStatus.level) }
            ]}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusIcon}>
                  {getStatusIcon(latestReading.abnormalityStatus.level)}
                </Text>
                <View style={styles.statusInfo}>
                  <Text style={[
                    styles.statusLevel,
                    { color: getStatusColor(latestReading.abnormalityStatus.level) }
                  ]}>
                    {latestReading.abnormalityStatus.level.toUpperCase()}
                  </Text>
                  <Text style={styles.statusTime}>
                    {new Date(latestReading.readingDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>

              {/* Reading Values */}
              <View style={styles.readingGrid}>
                <View style={styles.readingItem}>
                  <Text style={styles.readingLabel}>BP</Text>
                  <Text style={styles.readingValue}>
                    {latestReading.bp.systolic}/{latestReading.bp.diastolic}
                  </Text>
                </View>
                <View style={styles.readingItem}>
                  <Text style={styles.readingLabel}>Heart Rate</Text>
                  <Text style={styles.readingValue}>{latestReading.heartRate}</Text>
                </View>
                <View style={styles.readingItem}>
                  <Text style={styles.readingLabel}>Sugar</Text>
                  <Text style={styles.readingValue}>{latestReading.sugar}</Text>
                </View>
                <View style={styles.readingItem}>
                  <Text style={styles.readingLabel}>Weight</Text>
                  <Text style={styles.readingValue}>{latestReading.weight} kg</Text>
                </View>
              </View>

              {latestReading.abnormalityStatus.details && (
                <Text style={styles.statusDetails}>
                  {latestReading.abnormalityStatus.details}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.noDataCard}>
              <Text style={styles.noDataIcon}>📊</Text>
              <Text style={styles.noDataText}>No readings yet today</Text>
              <Text style={styles.noDataSubtext}>Add your first reading below</Text>
            </View>
          )}
        </View>

        {/* Add Reading Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-reading')}
        >
          <Text style={styles.addButtonIcon}>➕</Text>
          <Text style={styles.addButtonText}>Add Today's Readings</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>View History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/alerts')}
            >
              <Text style={styles.actionIcon}>🔔</Text>
              <Text style={styles.actionText}>Alerts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/upload-report')}
            >
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionText}>Upload Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/reports')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>My Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsIcon}>💡</Text>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Health Tip of the Day</Text>
            <Text style={styles.tipsText}>
              Remember to drink at least 8 glasses of water daily and take a 30-minute walk.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    color: '#666',
  },
  userName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E86DE',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#999',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    color: '#666',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLevel: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusTime: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  readingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  readingItem: {
    width: '50%',
    marginBottom: 16,
  },
  readingLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusDetails: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginTop: 8,
  },
  noDataCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  noDataIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    backgroundColor: '#10AC84',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 20,
  },
  tipsIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F39C12',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  welcomeText: {
    fontSize: 24,
    color: '#666',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#2E86DE',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
