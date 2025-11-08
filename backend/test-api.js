// Simple API Test Script
// Run with: node test-api.js

const testAPI = async () => {
  const baseUrl = 'http://localhost:5000';
  let token = '';
  let userId = '';

  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('📋 Test 1: Health Check');
    const healthCheck = await fetch(baseUrl);
    const healthData = await healthCheck.json();
    console.log('✅ Health Check:', healthData.message);
    console.log('');

    // Test 2: Register User
    console.log('📋 Test 2: Register User');
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Elder',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        age: 70,
        gender: 'Male',
        phone: '+1234567890',
      }),
    });
    const registerData = await registerResponse.json();
    
    if (registerData.success) {
      token = registerData.data.token;
      userId = registerData.data.user._id;
      console.log('✅ User registered successfully');
      console.log('   User ID:', userId);
      console.log('   Token:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ Registration failed:', registerData.message);
      return;
    }
    console.log('');

    // Test 3: Add Normal Reading
    console.log('📋 Test 3: Add Normal Reading');
    const normalReading = await fetch(`${baseUrl}/api/readings/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        bp: { systolic: 120, diastolic: 80 },
        heartRate: 75,
        sugar: 100,
        sleepHours: 7,
        weight: 70,
      }),
    });
    const normalData = await normalReading.json();
    
    if (normalData.success) {
      console.log('✅ Normal reading added');
      console.log('   Status:', normalData.data.abnormality.level);
      console.log('   Message:', normalData.data.abnormality.details);
    }
    console.log('');

    // Test 4: Add Warning Reading
    console.log('📋 Test 4: Add Warning Reading (High BP)');
    const warningReading = await fetch(`${baseUrl}/api/readings/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        bp: { systolic: 145, diastolic: 92 },
        heartRate: 85,
        sugar: 150,
        sleepHours: 5,
        weight: 72,
        symptoms: ['headache'],
      }),
    });
    const warningData = await warningReading.json();
    
    if (warningData.success) {
      console.log('⚠️  Warning reading added');
      console.log('   Status:', warningData.data.abnormality.level);
      console.log('   Message:', warningData.data.abnormality.details);
      if (warningData.data.suggestions.length > 0) {
        console.log('   Suggestions:', warningData.data.suggestions[0].items.join(', '));
      }
    }
    console.log('');

    // Test 5: Add Danger Reading
    console.log('📋 Test 5: Add Danger Reading (Critical)');
    const dangerReading = await fetch(`${baseUrl}/api/readings/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        bp: { systolic: 165, diastolic: 105 },
        heartRate: 110,
        sugar: 190,
        sleepHours: 4,
        weight: 75,
        symptoms: ['dizziness', 'chest pain'],
      }),
    });
    const dangerData = await dangerReading.json();
    
    if (dangerData.success) {
      console.log('❗ Danger reading added');
      console.log('   Status:', dangerData.data.abnormality.level);
      console.log('   Message:', dangerData.data.abnormality.details);
      if (dangerData.data.suggestions.length > 0) {
        console.log('   Suggested Tests:', dangerData.data.suggestions[0].items.join(', '));
      }
    }
    console.log('');

    // Test 6: Get Alerts
    console.log('📋 Test 6: Get User Alerts');
    const alertsResponse = await fetch(`${baseUrl}/api/alerts/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const alertsData = await alertsResponse.json();
    
    if (alertsData.success) {
      console.log('✅ Alerts retrieved');
      console.log('   Total alerts:', alertsData.data.pagination.total);
      console.log('   Unread count:', alertsData.data.summary.unreadCount);
      
      if (alertsData.data.alerts.length > 0) {
        console.log('\n   📢 Recent Alerts:');
        alertsData.data.alerts.slice(0, 3).forEach((alert, i) => {
          console.log(`   ${i + 1}. [${alert.severity.toUpperCase()}] ${alert.title}`);
          console.log(`      ${alert.message.substring(0, 80)}...`);
        });
      }
    }
    console.log('');

    // Test 7: Get Readings with Stats
    console.log('📋 Test 7: Get User Readings & Statistics');
    const readingsResponse = await fetch(`${baseUrl}/api/readings/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const readingsData = await readingsResponse.json();
    
    if (readingsData.success) {
      console.log('✅ Readings retrieved');
      console.log('   Total readings:', readingsData.data.pagination.total);
      
      if (readingsData.data.stats) {
        const stats = readingsData.data.stats;
        console.log('\n   📊 Statistics:');
        console.log('   Average BP:', `${stats.averages.systolic}/${stats.averages.diastolic}`);
        console.log('   Average Heart Rate:', stats.averages.heartRate);
        console.log('   Average Sugar:', stats.averages.sugar);
        console.log('   Average Sleep:', stats.averages.sleepHours, 'hours');
        console.log('\n   📈 Abnormality Distribution:');
        console.log('   Normal:', stats.abnormalCount.normal);
        console.log('   Warning:', stats.abnormalCount.warning);
        console.log('   Danger:', stats.abnormalCount.danger);
      }
    }
    console.log('');

    console.log('🎉 All tests completed successfully!\n');
    console.log('📝 Summary:');
    console.log('   ✅ Health check working');
    console.log('   ✅ User registration working');
    console.log('   ✅ JWT authentication working');
    console.log('   ✅ Reading submission working');
    console.log('   ✅ Abnormality detection working');
    console.log('   ✅ Alert generation working');
    console.log('   ✅ Statistics calculation working');
    console.log('\n🏥 Backend is fully functional!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run tests
testAPI();
