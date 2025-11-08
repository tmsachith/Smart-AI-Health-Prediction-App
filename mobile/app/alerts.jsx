import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { alertsAPI } from '../services/api';

export default function AlertsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({ unreadCount: 0 });

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertsAPI.getUserAlerts(user._id, { limit: 50 });

      if (response.success) {
        setAlerts(response.data.alerts);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await alertsAPI.markAsRead(alertId);
      loadAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
      case 'danger':
        return '#EE5A6F';
      case 'warning':
        return '#FFA502';
      case 'info':
        return '#2E86DE';
      default:
        return '#999';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'danger':
        return '❗';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Alerts & Notifications</Text>
        {summary.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{summary.unreadCount} New</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E86DE" />
            <Text style={styles.loadingText}>Loading alerts...</Text>
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Alerts</Text>
            <Text style={styles.emptyText}>
              You're all caught up! Alerts will appear here when there are important health updates.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <TouchableOpacity
              key={alert._id}
              style={[
                styles.alertCard,
                !alert.isRead && styles.unreadCard,
                { borderLeftColor: getSeverityColor(alert.severity) },
              ]}
              onPress={() => handleMarkAsRead(alert._id)}
            >
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>
                  {getSeverityIcon(alert.severity)}
                </Text>
                <View style={styles.alertHeaderInfo}>
                  <Text style={[
                    styles.alertSeverity,
                    { color: getSeverityColor(alert.severity) }
                  ]}>
                    {alert.severity.toUpperCase()}
                  </Text>
                  <Text style={styles.alertTime}>
                    {new Date(alert.createdAt).toLocaleDateString()} at{' '}
                    {new Date(alert.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                {!alert.isRead && (
                  <View style={styles.unreadDot} />
                )}
              </View>

              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>

              {alert.suggestedTests && alert.suggestedTests.length > 0 && (
                <View style={styles.testsContainer}>
                  <Text style={styles.testsTitle}>🏥 Recommended Tests:</Text>
                  {alert.suggestedTests.map((test, index) => (
                    <Text key={index} style={styles.testItem}>• {test}</Text>
                  ))}
                </View>
              )}

              {alert.recommendations && alert.recommendations.length > 0 && (
                <View style={styles.recommendationsContainer}>
                  <Text style={styles.recommendationsTitle}>💡 Suggestions:</Text>
                  {alert.recommendations.map((rec, index) => (
                    <Text key={index} style={styles.recommendationItem}>• {rec}</Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 20,
    color: '#2E86DE',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E86DE',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#EE5A6F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  unreadCard: {
    backgroundColor: '#FFF9E6',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  alertHeaderInfo: {
    flex: 1,
  },
  alertSeverity: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertTime: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EE5A6F',
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 18,
    color: '#666',
    lineHeight: 26,
    marginBottom: 12,
  },
  testsContainer: {
    backgroundColor: '#E8F4FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  testsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86DE',
    marginBottom: 8,
  },
  testItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8,
  },
  recommendationsContainer: {
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F39C12',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8,
  },
});
