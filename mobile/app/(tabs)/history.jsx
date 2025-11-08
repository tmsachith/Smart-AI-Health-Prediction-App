import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { readingsAPI } from '../../services/api';

export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [readings, setReadings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadReadings();
    }
  }, [user]);

  const loadReadings = async () => {
    try {
      setLoading(true);
      const response = await readingsAPI.getUserReadings(user._id, { limit: 10 });

      if (response.success) {
        setReadings(response.data.readings);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReadings();
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health History</Text>
        <Text style={styles.subtitle}>Your past readings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics */}
        {stats && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 Your Averages</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Blood Pressure</Text>
                <Text style={styles.statValue}>
                  {stats.averages.systolic}/{stats.averages.diastolic}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Heart Rate</Text>
                <Text style={styles.statValue}>{stats.averages.heartRate}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Blood Sugar</Text>
                <Text style={styles.statValue}>{stats.averages.sugar}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Weight</Text>
                <Text style={styles.statValue}>{stats.averages.weight} kg</Text>
              </View>
            </View>

            {/* Status Distribution */}
            <View style={styles.distributionContainer}>
              <Text style={styles.distributionTitle}>Health Status Distribution</Text>
              <View style={styles.distributionBar}>
                <View style={[
                  styles.distributionSegment,
                  { flex: stats.abnormalCount.normal, backgroundColor: '#10AC84' }
                ]} />
                <View style={[
                  styles.distributionSegment,
                  { flex: stats.abnormalCount.warning, backgroundColor: '#FFA502' }
                ]} />
                <View style={[
                  styles.distributionSegment,
                  { flex: stats.abnormalCount.danger, backgroundColor: '#EE5A6F' }
                ]} />
              </View>
              <View style={styles.distributionLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10AC84' }]} />
                  <Text style={styles.legendText}>Normal: {stats.abnormalCount.normal}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FFA502' }]} />
                  <Text style={styles.legendText}>Warning: {stats.abnormalCount.warning}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EE5A6F' }]} />
                  <Text style={styles.legendText}>Danger: {stats.abnormalCount.danger}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Readings List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Readings</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E86DE" />
            </View>
          ) : readings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No readings yet</Text>
            </View>
          ) : (
            readings.map((reading) => (
              <View
                key={reading._id}
                style={[
                  styles.readingCard,
                  { borderLeftColor: getStatusColor(reading.abnormalityStatus.level) }
                ]}
              >
                <View style={styles.readingHeader}>
                  <Text style={styles.readingIcon}>
                    {getStatusIcon(reading.abnormalityStatus.level)}
                  </Text>
                  <View style={styles.readingHeaderInfo}>
                    <Text style={styles.readingDate}>
                      {new Date(reading.readingDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                    <Text style={styles.readingTime}>
                      {new Date(reading.readingDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <Text style={[
                    styles.readingStatus,
                    { color: getStatusColor(reading.abnormalityStatus.level) }
                  ]}>
                    {reading.abnormalityStatus.level.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.readingValues}>
                  <View style={styles.valueItem}>
                    <Text style={styles.valueLabel}>BP</Text>
                    <Text style={styles.valueText}>
                      {reading.bp.systolic}/{reading.bp.diastolic}
                    </Text>
                  </View>
                  <View style={styles.valueItem}>
                    <Text style={styles.valueLabel}>HR</Text>
                    <Text style={styles.valueText}>{reading.heartRate}</Text>
                  </View>
                  <View style={styles.valueItem}>
                    <Text style={styles.valueLabel}>Sugar</Text>
                    <Text style={styles.valueText}>{reading.sugar}</Text>
                  </View>
                  <View style={styles.valueItem}>
                    <Text style={styles.valueLabel}>Sleep</Text>
                    <Text style={styles.valueText}>{reading.sleepHours}h</Text>
                  </View>
                </View>
              </View>
            ))
          )}
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
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E86DE',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statItem: {
    width: '50%',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86DE',
  },
  distributionContainer: {
    marginTop: 12,
  },
  distributionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  distributionSegment: {
    height: '100%',
  },
  distributionLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 20,
    color: '#999',
  },
  readingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  readingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  readingIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  readingHeaderInfo: {
    flex: 1,
  },
  readingDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  readingTime: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  readingStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  readingValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueItem: {
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
