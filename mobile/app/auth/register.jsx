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
import { useAuth } from '../../context/AuthContext';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'Male',
    phone: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Prepare data for registration
    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      age: parseInt(formData.age),
      gender: formData.gender,
      phone: formData.phone.trim(),
      role: 'elder',
    };

    // Register
    const result = await register(userData);

    if (result.success) {
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } else {
      Alert.alert('Registration Failed', result.message || 'Unable to create account');
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
            <Text style={styles.icon}>👋</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Smart Health</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#999"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Age */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                placeholderTextColor="#999"
                value={formData.age}
                onChangeText={(value) => updateField('age', value)}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            {/* Gender */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => updateField('gender', value)}
                  style={styles.picker}
                  enabled={!loading}
                >
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone"
                placeholderTextColor="#999"
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push('/auth/login')}
                disabled={loading}
              >
                <Text style={styles.linkText}>Login</Text>
              </TouchableOpacity>
            </View>
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
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E86DE',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 18,
    fontSize: 18,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 60,
    fontSize: 18,
  },
  registerButton: {
    backgroundColor: '#10AC84',
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#8DD3BB',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 30,
  },
  footerText: {
    fontSize: 18,
    color: '#666',
    marginRight: 8,
  },
  linkText: {
    fontSize: 20,
    color: '#2E86DE',
    fontWeight: 'bold',
  },
});
