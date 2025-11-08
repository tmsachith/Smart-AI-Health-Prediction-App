import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/welcome');
          },
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{user.age} years</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{user.gender}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>
                {user.role === 'elder' ? 'Patient' : 'Family'}
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Contacts */}
        {user.emergencyContacts && user.emergencyContacts.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🚨 Emergency Contacts</Text>
            {user.emergencyContacts.map((contact, index) => (
              <View key={index} style={styles.contactItem}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRelation}>{contact.relation}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Medical Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏥 Medical Information</Text>

          {user.medicalConditions && user.medicalConditions.length > 0 && (
            <View style={styles.medicalSection}>
              <Text style={styles.medicalLabel}>Conditions:</Text>
              <Text style={styles.medicalText}>
                {user.medicalConditions.join(', ') || 'None'}
              </Text>
            </View>
          )}

          {user.allergies && user.allergies.length > 0 && (
            <View style={styles.medicalSection}>
              <Text style={styles.medicalLabel}>Allergies:</Text>
              <Text style={styles.medicalText}>
                {user.allergies.join(', ') || 'None'}
              </Text>
            </View>
          )}

          {user.medications && user.medications.length > 0 && (
            <View style={styles.medicalSection}>
              <Text style={styles.medicalLabel}>Medications:</Text>
              <Text style={styles.medicalText}>
                {user.medications.join(', ') || 'None'}
              </Text>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Settings</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>📬 Notifications</Text>
            <Text style={styles.settingValue}>
              {user.notificationsEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>🔒 Privacy</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>ℹ️ About</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
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
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2E86DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contactItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contactRelation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  contactPhone: {
    fontSize: 18,
    color: '#2E86DE',
    fontWeight: '600',
  },
  medicalSection: {
    marginBottom: 16,
  },
  medicalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  medicalText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    fontSize: 20,
    color: '#333',
  },
  settingValue: {
    fontSize: 18,
    color: '#2E86DE',
    fontWeight: '600',
  },
  settingArrow: {
    fontSize: 28,
    color: '#CCC',
  },
  logoutButton: {
    backgroundColor: '#EE5A6F',
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
});
