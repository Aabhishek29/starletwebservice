// API Test Examples with JWT Authentication
// You can use these examples with tools like Postman, Thunder Client, or in your frontend code

const BASE_URL = 'http://localhost:4000/api';
let authToken = ''; // Store the token after login

// ============================================
// 1. REQUEST OTP LOGIN (Email)
// ============================================
async function requestOTPEmail() {
  const response = await fetch(`${BASE_URL}/users/request-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'user@example.com'
    })
  });

  const data = await response.json();
  console.log('OTP sent to email:', data);
  return data;
}

// ============================================
// 2. REQUEST OTP LOGIN (WhatsApp)
// ============================================
async function requestOTPWhatsApp() {
  const response = await fetch(`${BASE_URL}/users/request-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phoneNumber: '9876543210'
    })
  });

  const data = await response.json();
  console.log('OTP sent to WhatsApp:', data);
  return data;
}

// ============================================
// 3. VERIFY OTP AND GET JWT TOKEN
// ============================================
async function verifyOTPAndLogin() {
  const response = await fetch(`${BASE_URL}/users/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'user@example.com', // or phoneNumber
      otp: '123456'
    })
  });

  const data = await response.json();

  if (data.success) {
    // Store the JWT token for future requests
    authToken = data.tokens.accessToken;
    console.log('Login successful!');
    console.log('Access Token:', data.tokens.accessToken);
    console.log('Refresh Token:', data.tokens.refreshToken);
    console.log('User Data:', data.user);
  }

  return data;
}

// ============================================
// 4. GET ALL USERS (Admin Only - Protected)
// ============================================
async function getAllUsers() {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}` // JWT token required
    }
  });

  const data = await response.json();
  console.log('All users:', data);
  return data;
}

// ============================================
// 5. GET USER BY ID (Protected)
// ============================================
async function getUserById(userId) {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}` // JWT token required
    }
  });

  const data = await response.json();
  console.log('User details:', data);
  return data;
}

// ============================================
// 6. GET USER PROFILE (Protected)
// ============================================
async function getUserProfile(userId) {
  const response = await fetch(`${BASE_URL}/profile/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}` // JWT token required
    }
  });

  const data = await response.json();
  console.log('User profile:', data);
  return data;
}

// ============================================
// 7. UPDATE PERSONAL DETAILS (Protected)
// ============================================
async function updatePersonalDetails(userId) {
  const response = await fetch(`${BASE_URL}/profile/${userId}/personal`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}` // JWT token required
    },
    body: JSON.stringify({
      name: 'John Doe',
      mobileNumber: '9876543210',
      height: 175,
      weight: 70
    })
  });

  const data = await response.json();
  console.log('Personal details updated:', data);
  return data;
}

// ============================================
// 8. UPDATE BODY MEASUREMENTS (Protected)
// ============================================
async function updateMeasurements(userId) {
  const response = await fetch(`${BASE_URL}/profile/${userId}/measurements`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}` // JWT token required
    },
    body: JSON.stringify({
      chest: 40,
      upperWaist: 32,
      midWaist: 34,
      lowerWaist: 36,
      rightThigh: 22,
      leftThigh: 22,
      rightArm: 12,
      leftArm: 12
    })
  });

  const data = await response.json();
  console.log('Measurements updated:', data);
  return data;
}

// ============================================
// 9. UPDATE BCA DATA (Protected)
// ============================================
async function updateBCA(userId) {
  const response = await fetch(`${BASE_URL}/profile/${userId}/bca`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}` // JWT token required
    },
    body: JSON.stringify({
      weight: 70,
      bmi: 22.86,
      bodyFat: 18,
      muscleRate: 45,
      subcutaneousFat: 15,
      visceralFat: 5,
      bodyAge: 25,
      bmr: 1650,
      skeletalMass: 30,
      muscleMass: 56,
      boneMass: 3.2,
      protein: 16
    })
  });

  const data = await response.json();
  console.log('BCA data updated:', data);
  return data;
}

// ============================================
// 10. WHATSAPP OTP DIRECT (Without JWT)
// ============================================
async function sendWhatsAppOTP() {
  const response = await fetch(`${BASE_URL}/otp/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phoneNumber: '9876543210'
    })
  });

  const data = await response.json();
  console.log('WhatsApp OTP sent:', data);
  return data;
}

// ============================================
// 11. VERIFY WHATSAPP OTP AND LOGIN
// ============================================
async function verifyWhatsAppOTP() {
  const response = await fetch(`${BASE_URL}/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phoneNumber: '9876543210',
      otp: '123456'
    })
  });

  const data = await response.json();

  if (data.success) {
    // Store the JWT token
    authToken = data.tokens.accessToken;
    console.log('WhatsApp login successful!');
    console.log('Token:', authToken);
  }

  return data;
}

// ============================================
// EXAMPLE USAGE FLOW
// ============================================
async function exampleFlow() {
  try {
    // Step 1: Request OTP
    console.log('Step 1: Requesting OTP...');
    await requestOTPEmail();
    // or await requestOTPWhatsApp();

    // Step 2: Wait for user to receive OTP (simulated delay)
    console.log('Step 2: Waiting for OTP...');
    // In real app, user would enter the OTP they received

    // Step 3: Verify OTP and get JWT token
    console.log('Step 3: Verifying OTP and logging in...');
    const loginResponse = await verifyOTPAndLogin();

    if (loginResponse.success) {
      const userId = loginResponse.user.id;

      // Step 4: Get user profile (using JWT token)
      console.log('Step 4: Getting user profile...');
      await getUserProfile(userId);

      // Step 5: Update personal details
      console.log('Step 5: Updating personal details...');
      await updatePersonalDetails(userId);

      // Step 6: Update measurements
      console.log('Step 6: Updating measurements...');
      await updateMeasurements(userId);

      // Step 7: Update BCA
      console.log('Step 7: Updating BCA data...');
      await updateBCA(userId);
    }
  } catch (error) {
    console.error('Error in flow:', error);
  }
}

// ============================================
// CURL EXAMPLES
// ============================================

/*
# 1. Request OTP (Email)
curl -X POST http://localhost:4000/api/users/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# 2. Request OTP (WhatsApp)
curl -X POST http://localhost:4000/api/users/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210"}'

# 3. Verify OTP and Login
curl -X POST http://localhost:4000/api/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'

# 4. Get User Profile (Protected - needs JWT)
curl -X GET http://localhost:4000/api/profile/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# 5. Update Personal Details (Protected)
curl -X PUT http://localhost:4000/api/profile/1/personal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"name":"John Doe","mobileNumber":"9876543210","height":175,"weight":70}'

# 6. Get All Users (Admin Only)
curl -X GET http://localhost:4000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN_HERE"
*/

// ============================================
// POSTMAN COLLECTION STRUCTURE
// ============================================

/*
Postman Collection: Web Services API

Variables:
- baseUrl: http://localhost:4000/api
- token: {{bearerToken}} (set after login)

Folders:

1. Authentication
   - POST Request OTP (Email)
   - POST Request OTP (WhatsApp)
   - POST Verify OTP Login

2. Users (Protected)
   - GET All Users (Admin)
   - GET User by ID

3. Profile (Protected)
   - GET User Profile
   - PUT Update Personal Details
   - PUT Update Measurements
   - PUT Update BCA
   - PUT Update Full Profile

4. WhatsApp OTP
   - POST Send OTP
   - POST Verify OTP
   - POST Resend OTP

Headers for Protected Routes:
- Authorization: Bearer {{token}}
- Content-Type: application/json

Pre-request Script for Login:
pm.test("Save JWT token", function () {
    var jsonData = pm.response.json();
    if (jsonData.success && jsonData.tokens) {
        pm.environment.set("token", jsonData.tokens.accessToken);
        pm.environment.set("refreshToken", jsonData.tokens.refreshToken);
    }
});
*/

// ============================================
// ERROR HANDLING EXAMPLE
// ============================================
async function makeAuthenticatedRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
      }
    });

    const data = await response.json();

    // Handle token expiration
    if (response.status === 401 && data.message === 'Token has expired') {
      console.log('Token expired, need to login again');
      // Implement refresh token logic here
    }

    // Handle other errors
    if (!response.ok) {
      console.error(`Error ${response.status}:`, data.message);
    }

    return data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    requestOTPEmail,
    requestOTPWhatsApp,
    verifyOTPAndLogin,
    getAllUsers,
    getUserById,
    getUserProfile,
    updatePersonalDetails,
    updateMeasurements,
    updateBCA,
    sendWhatsAppOTP,
    verifyWhatsAppOTP,
    exampleFlow
  };
}