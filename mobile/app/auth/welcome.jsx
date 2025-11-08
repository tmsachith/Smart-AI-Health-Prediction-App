import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>🏥</Text>
          <Text style={styles.title}>Smart Health</Text>
          <Text style={styles.subtitle}>Your Daily Health Companion</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>❤️</Text>
            <Text style={styles.featureText}>Track Your Health</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Get Insights</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔔</Text>
            <Text style={styles.featureText}>Stay Safe</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  icon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E86DE',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  features: {
    marginVertical: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    fontSize: 22,
    color: '#333',
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButton: {
    backgroundColor: '#2E86DE',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#2E86DE',
  },
  registerButtonText: {
    color: '#2E86DE',
    fontSize: 26,
    fontWeight: 'bold',
  },
});
