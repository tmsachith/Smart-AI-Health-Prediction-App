import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { reportsAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function UploadReportScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Request permissions on mount
  React.useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to upload medical reports.'
        );
      }
    })();
  }, []);

  // Pick document (PDF)
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
          return;
        }

        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: 'application/pdf',
          size: file.size,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  // Pick image
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Updated from MediaTypeOptions.Images
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        
        // Check file size (max 10MB)
        if (image.fileSize && image.fileSize > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select an image smaller than 10MB.');
          return;
        }

        // Extract filename from URI
        const uriParts = image.uri.split('/');
        const fileName = uriParts[uriParts.length - 1];

        setSelectedFile({
          uri: image.uri,
          name: fileName || 'report-image.jpg',
          type: 'image/jpeg',
          size: image.fileSize || 0,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Take photo
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        
        setSelectedFile({
          uri: image.uri,
          name: `photo-${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: image.fileSize || 0,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Upload report
  const uploadReport = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create FormData
      const formData = new FormData();
      
      // Append file
      formData.append('reportFile', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      });

      // Upload to backend
      const response = await reportsAPI.uploadReport(formData);

      setUploading(false);
      
      Alert.alert(
        'Upload Successful',
        'Your medical report has been uploaded and is being processed. You will receive alerts when abnormalities are detected.',
        [
          {
            text: 'View Report',
            onPress: () => {
              router.push({
                pathname: '/report-details',
                params: { id: response.data.report._id },
              });
            },
          },
          {
            text: 'Upload Another',
            onPress: () => setSelectedFile(null),
          },
          {
            text: 'Go to Reports',
            onPress: () => router.push('/reports'),
          },
        ]
      );
    } catch (error) {
      setUploading(false);
      console.error('Upload error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to upload report';
      
      Alert.alert('Upload Failed', errorMessage);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Medical Report</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Ionicons name="information-circle" size={32} color="#4A90E2" />
        <Text style={styles.instructionsTitle}>Upload Your Report</Text>
        <Text style={styles.instructionsText}>
          Choose a PDF file or take a photo of your medical report. 
          Our AI will extract health data and detect any abnormalities.
        </Text>
      </View>

      {/* File Selection Buttons */}
      {!selectedFile && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={pickDocument}>
            <Ionicons name="document-text" size={40} color="#fff" />
            <Text style={styles.buttonText}>Choose PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Ionicons name="images" size={40} color="#fff" />
            <Text style={styles.buttonText}>Choose Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Ionicons name="camera" size={40} color="#fff" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected File Preview */}
      {selectedFile && !uploading && (
        <View style={styles.previewContainer}>
          <View style={styles.fileInfoContainer}>
            <Ionicons 
              name={selectedFile.type === 'application/pdf' ? 'document-text' : 'image'} 
              size={50} 
              color="#4A90E2" 
            />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={2}>
                {selectedFile.name}
              </Text>
              <Text style={styles.fileSize}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </Text>
            </View>
            <TouchableOpacity onPress={removeFile} style={styles.removeButton}>
              <Ionicons name="close-circle" size={32} color="#FF6B6B" />
            </TouchableOpacity>
          </View>

          {/* Image Preview (if image) */}
          {selectedFile.type !== 'application/pdf' && (
            <Image 
              source={{ uri: selectedFile.uri }} 
              style={styles.imagePreview}
              resizeMode="contain"
            />
          )}

          {/* Upload Button */}
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={uploadReport}
          >
            <Ionicons name="cloud-upload" size={32} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Uploading State */}
      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.uploadingText}>Uploading...</Text>
          <Text style={styles.uploadingSubtext}>
            Please wait while we process your report
          </Text>
        </View>
      )}

      {/* Supported Formats */}
      <View style={styles.supportedFormatsContainer}>
        <Text style={styles.supportedFormatsTitle}>Supported Formats</Text>
        <Text style={styles.supportedFormatsText}>
          • PDF files (up to 10MB){'\n'}
          • JPEG/PNG images (up to 10MB){'\n'}
          • Blood Test, Lipid Profile, Kidney Function{'\n'}
          • Liver Function, Diabetes, Thyroid Reports
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  instructionsContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonsContainer: {
    gap: 20,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fileDetails: {
    flex: 1,
    marginLeft: 15,
  },
  fileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 16,
    color: '#888',
  },
  removeButton: {
    padding: 5,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  uploadButton: {
    backgroundColor: '#28a745',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  uploadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    marginBottom: 30,
  },
  uploadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  uploadingSubtext: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  supportedFormatsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 1,
  },
  supportedFormatsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  supportedFormatsText: {
    fontSize: 18,
    color: '#555',
    lineHeight: 28,
  },
});
