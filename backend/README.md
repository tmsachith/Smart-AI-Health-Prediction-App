# Smart AI Health Prediction App - Backend

## 🏥 Overview
Backend API for the Smart AI Health Prediction App - an elderly health monitoring system with AI-powered abnormality detection, health predictions, and automated alerts.

## 🚀 Features

### ✅ Implemented (Phase 1)
- **User Authentication**
  - Register with JWT token
  - Login with secure password hashing (bcrypt)
  - Protected routes with middleware
  - User profiles with medical history

- **Daily Health Readings**
  - Record BP, heart rate, sugar, weight, sleep hours
  - Automatic abnormality detection
  - Real-time health status (Normal/Warning/Danger)
  - Reading history with statistics

- **Rule-Based Abnormality Detection**
  - BP thresholds (Danger: ≥160/100, Warning: ≥140/90)
  - Heart rate monitoring (High: >100, Very High: ≥120)
  - Blood sugar alerts (High: ≥140, Very High: ≥250)
  - Sleep pattern analysis

- **Smart Alerts System**
  - Auto-generated alerts for abnormal readings
  - Severity levels: Info, Warning, Danger, Critical
  - Wellness checkup suggestions
  - Recommended medical tests
  - Family notifications for critical alerts

## 📦 Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your MongoDB URI and JWT Secret
```

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/smart-health-db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

## 🏃‍♂️ Running the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Daily Readings (`/api/readings`)
- `POST /api/readings/add` - Add new health reading (Protected)
- `GET /api/readings/user/:id` - Get user readings with pagination (Protected)
- `GET /api/readings/user/:id/latest` - Get latest reading (Protected)
- `GET /api/readings/:id` - Get reading by ID (Protected)
- `DELETE /api/readings/:id` - Delete reading (Protected)

### Alerts (`/api/alerts`)
- `GET /api/alerts/user/:id` - Get user alerts (Protected)
- `GET /api/alerts/:id` - Get alert by ID (Protected)
- `PUT /api/alerts/:id/read` - Mark alert as read (Protected)
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert (Protected)
- `PUT /api/alerts/user/:id/read-all` - Mark all as read (Protected)
- `DELETE /api/alerts/:id` - Delete alert (Protected)
- `POST /api/alerts/create` - Create manual alert (Protected)

## 📊 Data Models

### User Model
```javascript
{
  name, email, password, age, gender, phone, role,
  linkedElders, emergencyContacts, medicalConditions,
  allergies, medications, notificationsEnabled, fcmToken
}
```

### Reading Model
```javascript
{
  userId, bp: { systolic, diastolic }, heartRate, sugar,
  sleepHours, weight, symptoms, notes, abnormalityStatus,
  readingDate
}
```

### Alert Model
```javascript
{
  userId, readingId, type, severity, title, message,
  details, recommendations, suggestedTests, isRead,
  isAcknowledged, notificationSent, familyNotified, priority
}
```

## 🧪 Testing with Postman

### 1. Register User
```
POST http://localhost:5000/api/auth/register

Body (JSON):
{
  "name": "John Elder",
  "email": "john@example.com",
  "password": "password123",
  "age": 68,
  "gender": "Male",
  "phone": "+1234567890"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login

Body (JSON):
{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token: "..." }
```

### 3. Add Health Reading
```
POST http://localhost:5000/api/readings/add

Headers:
Authorization: Bearer <your_token>

Body (JSON):
{
  "bp": {
    "systolic": 165,
    "diastolic": 105
  },
  "heartRate": 95,
  "sugar": 150,
  "sleepHours": 5,
  "weight": 75,
  "symptoms": ["headache", "dizziness"]
}
```

### 4. Get User Alerts
```
GET http://localhost:5000/api/alerts/user/<user_id>

Headers:
Authorization: Bearer <your_token>
```

## 🎯 Abnormality Detection Rules

### Blood Pressure
- **Danger (≥180/120)**: Hypertensive Crisis - Immediate medical attention
- **Danger (≥160/100)**: Very high BP - Consult doctor immediately
- **Warning (≥140/90)**: Stage 1 Hypertension - Monitor closely
- **Warning (≥130/85)**: Elevated BP - Lifestyle changes recommended

### Heart Rate
- **Danger (≥120)**: Tachycardia - Seek medical attention
- **Warning (>100)**: Elevated heart rate
- **Danger (<50)**: Bradycardia - Consult doctor
- **Warning (<60)**: Low heart rate

### Blood Sugar
- **Danger (≥250)**: Severe hyperglycemia - Immediate care
- **Danger (≥180)**: High blood sugar - Contact doctor
- **Warning (≥140)**: Elevated sugar - Monitor diet
- **Danger (<70)**: Hypoglycemia - Eat something sweet
- **Warning (<80)**: Borderline low - Have a snack

### Sleep
- **Warning (<6 hours)**: Insufficient sleep
- **Warning (>10 hours)**: Excessive sleep

## 🔮 Coming Soon (Phase 2)

- [ ] Medical Report Upload & OCR
- [ ] AI-powered Health Predictions
- [ ] Trend Analysis & Forecasting
- [ ] Push Notifications
- [ ] Monthly Health Summary PDF
- [ ] Family Member Dashboard
- [ ] Medication Reminders
- [ ] Doctor Appointment Scheduling

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer (for future reports)

## 📝 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── Reading.js         # Health reading model
│   │   └── Alert.js           # Alert model
│   ├── controllers/
│   │   ├── authController.js   # Auth logic
│   │   ├── readingController.js # Reading logic
│   │   └── alertController.js  # Alert logic
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── readingRoutes.js    # Reading endpoints
│   │   └── alertRoutes.js      # Alert endpoints
│   ├── middleware/
│   │   └── auth.js             # JWT verification
│   ├── utils/
│   │   └── abnormalityChecker.js # Detection rules
│   └── server.js               # Main server file
├── .env                        # Environment variables
├── .env.example               # Example env file
├── .gitignore
└── package.json
```

## 📄 License

MIT

## 👨‍💻 Author

Smart AI Health Prediction Team
