# 🏥 Smart AI Health Prediction App

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> An intelligent elderly health monitoring system with AI-powered abnormality detection, automated health predictions, and real-time family alerts.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation Guide](#installation-guide)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Mobile App Features](#mobile-app-features)
- [Screenshots](#screenshots)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The **Smart AI Health Prediction App** is a comprehensive health monitoring solution designed specifically for elderly users and their families. The system combines a React Native mobile application with a robust Node.js backend to provide:

- **Real-time Health Monitoring**: Track vital signs including blood pressure, heart rate, blood sugar, weight, and sleep patterns
- **AI-Powered Abnormality Detection**: Intelligent rule-based system to detect health anomalies
- **Automated Alerts**: Instant notifications for family members when critical health issues are detected
- **Elder-Friendly UI**: Large fonts, high contrast colors, and simple navigation designed for elderly users
- **Health Predictions**: Smart analysis of health trends and recommendations
- **Medical History Tracking**: Comprehensive record of all health readings and alerts

---

## ✨ Key Features

### 🏥 Health Monitoring
- ✅ Daily vital signs tracking (BP, heart rate, blood sugar, weight, sleep)
- ✅ Real-time abnormality detection with severity levels
- ✅ Health status visualization (Normal/Warning/Danger)
- ✅ Historical data with trends and statistics
- ✅ Symptom and notes recording

### 🔔 Smart Alert System
- ✅ Automatic alert generation for abnormal readings
- ✅ Severity-based classification (Info/Warning/Danger/Critical)
- ✅ Family notifications for critical alerts
- ✅ Recommended medical tests and lifestyle suggestions
- ✅ Wellness checkup reminders

### 👥 User Management
- ✅ Secure authentication with JWT tokens
- ✅ User roles: Elder and Family members
- ✅ Profile management with medical history
- ✅ Emergency contact information
- ✅ Medication and allergy tracking

### 📱 Elder-Friendly Mobile Interface
- ✅ Large text (minimum 18px) and buttons (70px height)
- ✅ High contrast color scheme
- ✅ Simple tab-based navigation
- ✅ Color-coded health status (Green/Yellow/Red)
- ✅ Pull-to-refresh functionality
- ✅ Offline data caching

### 🔐 Security & Privacy
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT-based authentication (30-day expiry)
- ✅ Protected API routes with middleware
- ✅ CORS configuration
- ✅ Environment-based configuration

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Application                       │
│                  (React Native + Expo)                       │
│  ┌─────────┬──────────┬─────────┬─────────┬──────────┐     │
│  │  Home   │ Add Read │ History │ Alerts  │ Profile  │     │
│  └─────────┴──────────┴─────────┴─────────┴──────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (axios)
                      │ HTTP/HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│                     Backend Server                           │
│                  (Node.js + Express)                         │
│  ┌──────────┬──────────────┬─────────────┬──────────────┐  │
│  │   Auth   │   Readings   │   Alerts    │  Middleware  │  │
│  │  Routes  │    Routes    │   Routes    │   (JWT)      │  │
│  └──────────┴──────────────┴─────────────┴──────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Abnormality Detection Engine                 │  │
│  │        (Rule-based AI Health Analysis)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ Mongoose ODM
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     MongoDB Database                         │
│  ┌────────┬──────────────┬─────────────────────────────┐   │
│  │ Users  │   Readings   │         Alerts              │   │
│  └────────┴──────────────┴─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB v8.19.3 (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken v9.0.2)
- **Security**: bcryptjs v3.0.3 for password hashing
- **CORS**: cors v2.8.5
- **Environment**: dotenv v17.2.3
- **File Upload**: multer v2.0.2

### Frontend (Mobile)
- **Framework**: React Native v0.81.5
- **Platform**: Expo v54.0.23
- **Navigation**: Expo Router v6.0.14 + React Navigation v7.1.8
- **State Management**: React Context API
- **HTTP Client**: Axios v1.13.2
- **Storage**: AsyncStorage v2.2.0
- **UI Components**: Expo Vector Icons v15.0.3
- **Animations**: React Native Reanimated v4.1.1

### Development Tools
- **Backend Dev Server**: nodemon v3.1.10
- **TypeScript**: v5.9.2
- **ESLint**: v9.25.0
- **API Testing**: Postman (collection included)

---

## 📁 Project Structure

```
Smart AI Health Prediction App/
│
├── backend/                          # Node.js Backend Server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── readingController.js # Health readings logic
│   │   │   └── alertController.js   # Alerts logic
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── User.js              # User schema
│   │   │   ├── Reading.js           # Health reading schema
│   │   │   └── Alert.js             # Alert schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Auth endpoints
│   │   │   ├── readingRoutes.js     # Reading endpoints
│   │   │   └── alertRoutes.js       # Alert endpoints
│   │   ├── utils/
│   │   │   └── abnormalityChecker.js # Health analysis engine
│   │   └── server.js                # Express app entry point
│   ├── package.json
│   ├── README.md
│   ├── TESTING_GUIDE.md
│   ├── test-api.js
│   └── postman_collection.json
│
├── mobile/                           # React Native Mobile App
│   ├── app/
│   │   ├── auth/
│   │   │   ├── welcome.jsx          # Welcome screen
│   │   │   ├── login.jsx            # Login screen
│   │   │   └── register.jsx         # Registration screen
│   │   ├── (tabs)/
│   │   │   ├── home.jsx             # Home dashboard
│   │   │   ├── history.jsx          # Reading history
│   │   │   └── profile.jsx          # User profile
│   │   ├── add-reading.jsx          # Add health reading
│   │   ├── alerts.jsx               # Alerts list
│   │   ├── index.jsx                # Entry point
│   │   └── _layout.tsx              # Root layout
│   ├── assets/
│   │   └── images/                  # App images
│   ├── components/
│   │   └── ui/                      # Reusable UI components
│   ├── context/
│   │   └── AuthContext.js           # Authentication context
│   ├── services/
│   │   └── api.js                   # API service layer
│   ├── constants/
│   │   └── theme.ts                 # Theme configuration
│   ├── package.json
│   ├── MOBILE_README.md
│   └── README.md
│
├── PHASE_1_COMPLETE.md              # Phase 1 completion documentation
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MongoDB** v4.4 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Expo CLI** (for mobile development)
- **Git** ([Download](https://git-scm.com/))
- **Android Studio** (for Android) or **Xcode** (for iOS, macOS only)

### System Requirements

**Backend:**
- OS: Windows 10+, macOS 10.14+, or Linux
- RAM: Minimum 2GB (4GB recommended)
- Storage: 500MB free space

**Mobile Development:**
- OS: Windows 10+, macOS 10.14+ (iOS development requires macOS)
- RAM: Minimum 8GB
- Storage: 10GB free space (for Android Studio/Xcode)

---

## 📥 Installation Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Smart AI Health Prediction App"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
# or on macOS/Linux:
# cp .env.example .env
```

**Configure `.env` file:**

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smart-health-db

# JWT Secret (Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Start MongoDB

**Windows:**
```powershell
# Start MongoDB service
net start MongoDB
```

**macOS/Linux:**
```bash
# Using Homebrew (macOS)
brew services start mongodb-community

# Or manually
mongod --dbpath /path/to/data/directory
```

### 4. Mobile App Setup

```bash
# Navigate to mobile directory
cd ../mobile

# Install dependencies
npm install

# Update API endpoint in services/api.js
# Change BASE_URL to your backend server IP
# Example: http://192.168.1.100:5000/api
```

**Configure API Endpoint:**

Edit `mobile/services/api.js`:

```javascript
// For development on physical device, use your computer's IP
const BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';

// For Android emulator
// const BASE_URL = 'http://10.0.2.2:5000/api';

// For iOS simulator
// const BASE_URL = 'http://localhost:5000/api';
```

---

## 🏃 Running the Application

### Start the Backend Server

**Development Mode (with auto-reload):**
```bash
cd backend
npm run dev
```

**Production Mode:**
```bash
cd backend
npm start
```

Expected output:
```
🚀 ========================================
🏥 Smart AI Health Prediction API
🌍 Server running on port 5000
📡 Environment: development
⏰ Started at: 11/8/2025, 10:30:00 AM
========================================

✅ MongoDB Connected: smart-health-db
```

### Start the Mobile App

**Using Expo:**
```bash
cd mobile
npm start
```

This will open Expo DevTools in your browser. You can then:

- **Scan QR code** with Expo Go app (iOS/Android)
- **Press 'a'** to open in Android emulator
- **Press 'i'** to open in iOS simulator
- **Press 'w'** to open in web browser

**Run on specific platform:**
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "elder",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Daughter",
    "phone": "+1234567890"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <JWT_TOKEN>
```

### Health Reading Endpoints

#### Add Reading (Protected)
```http
POST /api/readings/add
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "bloodPressure": {
    "systolic": 120,
    "diastolic": 80
  },
  "heartRate": 72,
  "bloodSugar": 95,
  "weight": 70.5,
  "sleepHours": 7,
  "symptoms": ["Headache"],
  "notes": "Feeling well today"
}
```

#### Get User Readings (Protected)
```http
GET /api/readings/user/:userId?page=1&limit=10
Authorization: Bearer <JWT_TOKEN>
```

#### Get Latest Reading (Protected)
```http
GET /api/readings/user/:userId/latest
Authorization: Bearer <JWT_TOKEN>
```

### Alert Endpoints

#### Get User Alerts (Protected)
```http
GET /api/alerts/user/:userId?severity=danger&isRead=false
Authorization: Bearer <JWT_TOKEN>
```

#### Mark Alert as Read (Protected)
```http
PUT /api/alerts/:alertId/read
Authorization: Bearer <JWT_TOKEN>
```

#### Mark All as Read (Protected)
```http
PUT /api/alerts/user/:userId/read-all
Authorization: Bearer <JWT_TOKEN>
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

---

## 📱 Mobile App Features

### Authentication Flow
1. **Welcome Screen** - App introduction and navigation
2. **Register/Login** - User authentication
3. **Auto-redirect** - Based on authentication status

### Home Dashboard
- Today's health status with color-coded indicators
- Latest reading display
- Quick action buttons
- Health tips and suggestions
- Pull-to-refresh

### Add Reading Screen
- Large, accessible input fields for:
  - Blood Pressure (Systolic/Diastolic)
  - Heart Rate (BPM)
  - Blood Sugar (mg/dL)
  - Weight (kg)
  - Sleep Hours
  - Symptoms (multi-select)
  - Additional notes
- Real-time validation
- Immediate health status feedback

### History Screen
- Chronological list of all readings
- Health statistics and averages
- Status distribution visualization
- Trend indicators (↑↓)
- Filtering and search

### Alerts Screen
- Color-coded alerts by severity
- Unread count badge
- Detailed alert information
- Recommended tests
- Lifestyle suggestions
- Mark as read/acknowledged

### Profile Screen
- Personal information
- Emergency contacts
- Medical conditions
- Allergies and medications
- Account settings
- Logout

---

## 🧪 Testing

### Backend Testing

**Manual API Testing:**
```bash
cd backend
node test-api.js
```

**Using Postman:**
1. Import `backend/postman_collection.json`
2. Set environment variable `baseUrl` to `http://localhost:5000/api`
3. Run the collection

**Health Check:**
```bash
curl http://localhost:5000
```

Expected response:
```json
{
  "success": true,
  "message": "🏥 Smart AI Health Prediction API is running!",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "readings": "/api/readings",
    "alerts": "/api/alerts"
  }
}
```

### Mobile App Testing

**Testing on Physical Device:**
1. Install Expo Go app from App Store/Play Store
2. Scan QR code from Expo DevTools
3. Test all features

**Testing on Emulator:**
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

---

## 🚢 Deployment

### Backend Deployment

**Recommended Platforms:**
- **Heroku** - Easy deployment with free tier
- **DigitalOcean** - VPS hosting
- **AWS EC2** - Scalable cloud hosting
- **Railway** - Modern deployment platform

**Environment Variables for Production:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=<generate-strong-secret>
PORT=5000
NODE_ENV=production
```

**Docker Deployment:**
```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Mobile App Deployment

**Build for Production:**

**Android APK:**
```bash
cd mobile
eas build --platform android
```

**iOS IPA:**
```bash
cd mobile
eas build --platform ios
```

**Publishing:**
- **Google Play Store** - Android distribution
- **Apple App Store** - iOS distribution
- **Expo OTA Updates** - Instant updates without store review

---

## 🎨 Health Status Detection Rules

### Blood Pressure (BP)
- **Normal**: Systolic < 140 AND Diastolic < 90
- **Warning**: 140 ≤ Systolic < 160 OR 90 ≤ Diastolic < 100
- **Danger**: Systolic ≥ 160 OR Diastolic ≥ 100

### Heart Rate (BPM)
- **Normal**: 60-100 BPM
- **Warning**: 100-120 BPM
- **Danger**: < 60 OR ≥ 120 BPM

### Blood Sugar (mg/dL)
- **Normal**: < 140 mg/dL
- **Warning**: 140-250 mg/dL
- **Danger**: ≥ 250 mg/dL

### Sleep Hours
- **Normal**: 6-9 hours
- **Warning**: < 6 OR > 9 hours

---

## 🛡️ Security Features

- ✅ **Password Hashing**: bcrypt with 10 salt rounds
- ✅ **JWT Authentication**: Secure token-based auth (30-day expiry)
- ✅ **Protected Routes**: Middleware authentication on all sensitive endpoints
- ✅ **CORS Configuration**: Controlled cross-origin access
- ✅ **Environment Variables**: Sensitive data in .env files
- ✅ **Input Validation**: Server-side validation for all inputs
- ✅ **Error Handling**: Comprehensive error handling with appropriate status codes

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Authors

- Your Name - Initial work

---

## 🙏 Acknowledgments

- Designed for elderly users with accessibility in mind
- Built with modern web and mobile technologies
- Focused on health monitoring and family care

---

## 📞 Support

For support, email support@smarthealthapp.com or open an issue in the repository.

---

## 🗺️ Roadmap

### Phase 2 (Planned)
- [ ] Machine Learning integration for health predictions
- [ ] Real-time family notifications via push notifications
- [ ] Voice input for readings
- [ ] Multi-language support
- [ ] Medication reminder system
- [ ] Doctor appointment scheduling
- [ ] Health report PDF generation
- [ ] Integration with wearable devices
- [ ] Video consultation feature
- [ ] Emergency SOS button

### Phase 3 (Future)
- [ ] AI chatbot for health queries
- [ ] Telemedicine integration
- [ ] Community health forums
- [ ] Gamification for healthy habits
- [ ] Insurance integration

---

<div align="center">

**Made with ❤️ for elderly health and family care**

[Report Bug](issues) · [Request Feature](issues) · [Documentation](docs)

</div>
