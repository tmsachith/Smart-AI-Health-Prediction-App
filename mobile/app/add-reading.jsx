import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { readingsAPI } from '../services/api';

export default function AddReadingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    sugar: '',
    weight: '',
    sleepHours: '',
    symptoms: '',
    notes: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateInputs = () => {
    const { systolic, diastolic, heartRate, sugar, weight, sleepHours } = formData;

    if (!systolic || !diastolic || !heartRate || !sugar || !weight || !sleepHours) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return false;
    }

    // Validate ranges
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const hr = parseInt(heartRate);
    const sug = parseInt(sugar);
    const wt = parseInt(weight);
    const sleep = parseInt(sleepHours);

    if (sys < 40 || sys > 300) {
      Alert.alert('Invalid Input', 'Systolic BP should be between 40-300');
      return false;
    }

    if (dia < 30 || dia > 200) {
      Alert.alert('Invalid Input', 'Diastolic BP should be between 30-200');
      return false;
    }

    if (hr < 30 || hr > 250) {
      Alert.alert('Invalid Input', 'Heart rate should be between 30-250');
      return false;
    }

    if (sug < 20 || sug > 600) {
      Alert.alert('Invalid Input', 'Blood sugar should be between 20-600');
      return false;
    }

    if (wt < 20 || wt > 300) {
      Alert.alert('Invalid Input', 'Weight should be between 20-300 kg');
      return false;
    }

    if (sleep < 0 || sleep > 24) {
      Alert.alert('Invalid Input', 'Sleep hours should be between 0-24');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);

      const readingData = {
        bp: {
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
        },
        heartRate: parseInt(formData.heartRate),
        sugar: parseInt(formData.sugar),
        weight: parseInt(formData.weight),
        sleepHours: parseInt(formData.sleepHours),
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : [],
        notes: formData.notes,
      };

      const response = await readingsAPI.addReading(readingData);

      if (response.success) {
        const abnormality = response.data.abnormality;
        const healthStatus = response.data.healthStatus;

        // Show result based on status
        Alert.alert(
          `${healthStatus.emoji} ${healthStatus.title}`,
          abnormality.details,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error adding reading:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add reading. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Today's Readings</Text>
            <Text style={styles.subtitle}>Enter your health measurements</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Blood Pressure */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🩸 Blood Pressure</Text>
              <View style={styles.bpContainer}>
                <View style={styles.bpInput}>
                  <Text style={styles.label}>Systolic</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="120"
                    placeholderTextColor="#999"
                    value={formData.systolic}
                    onChangeText={(value) => updateField('systolic', value)}
                    keyboardType="numeric"
                    maxLength={3}
                    editable={!loading}
                  />
                  <Text style={styles.unit}>mmHg</Text>
                </View>
                <Text style={styles.bpSeparator}>/</Text>
                <View style={styles.bpInput}>
                  <Text style={styles.label}>Diastolic</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="80"
                    placeholderTextColor="#999"
                    value={formData.diastolic}
                    onChangeText={(value) => updateField('diastolic', value)}
                    keyboardType="numeric"
                    maxLength={3}
                    editable={!loading}
                  />
                  <Text style={styles.unit}>mmHg</Text>
                </View>
              </View>
            </View>

            {/* Heart Rate */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>❤️ Heart Rate</Text>
              <TextInput
                style={styles.input}
                placeholder="75"
                placeholderTextColor="#999"
                value={formData.heartRate}
                onChangeText={(value) => updateField('heartRate', value)}
                keyboardType="numeric"
                maxLength={3}
                editable={!loading}
              />
              <Text style={styles.unit}>BPM</Text>
            </View>

            {/* Blood Sugar */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🩹 Blood Sugar</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                placeholderTextColor="#999"
                value={formData.sugar}
                onChangeText={(value) => updateField('sugar', value)}
                keyboardType="numeric"
                maxLength={3}
                editable={!loading}
              />
              <Text style={styles.unit}>mg/dL</Text>
            </View>

            {/* Weight */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚖️ Weight</Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                placeholderTextColor="#999"
                value={formData.weight}
                onChangeText={(value) => updateField('weight', value)}
                keyboardType="numeric"
                maxLength={3}
                editable={!loading}
              />
              <Text style={styles.unit}>kg</Text>
            </View>

            {/* Sleep Hours */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>😴 Sleep Hours</Text>
              <TextInput
                style={styles.input}
                placeholder="7"
                placeholderTextColor="#999"
                value={formData.sleepHours}
                onChangeText={(value) => updateField('sleepHours', value)}
                keyboardType="numeric"
                maxLength={2}
                editable={!loading}
              />
              <Text style={styles.unit}>hours</Text>
            </View>

            {/* Symptoms (Optional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤒 Symptoms (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., headache, dizziness (separate with commas)"
                placeholderTextColor="#999"
                value={formData.symptoms}
                onChangeText={(value) => updateField('symptoms', value)}
                multiline
                numberOfLines={2}
                editable={!loading}
              />
            </View>

            {/* Notes (Optional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Notes (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Any additional notes..."
                placeholderTextColor="#999"
                value={formData.notes}
                onChangeText={(value) => updateField('notes', value)}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <>
                  <Text style={styles.submitButtonIcon}>✓</Text>
                  <Text style={styles.submitButtonText}>Submit Reading</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
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
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  bpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bpInput: {
    flex: 1,
  },
  bpSeparator: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2E86DE',
    marginHorizontal: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#333',
    textAlignVertical: 'top',
  },
  unit: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#10AC84',
    flexDirection: 'row',
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#8DD3BB',
  },
  submitButtonIcon: {
    fontSize: 32,
    color: 'white',
    marginRight: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
});
