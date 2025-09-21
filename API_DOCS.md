# Web Services API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication
All users authenticate using OTP sent to their email or WhatsApp number.

---

## User Authentication APIs

### 1. Request OTP Login
**Endpoint:** `POST /users/request-otp`

**Description:** Request OTP for login via email or WhatsApp

**Request Body:**
```json
{
  "email": "user@example.com"  // OR
  "phoneNumber": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email/WhatsApp",
  "identifierType": "email" | "phone",
  "expiresIn": "10 minutes"
}
```

### 2. Verify OTP Login
**Endpoint:** `POST /users/verify-otp`

**Description:** Verify OTP and login/register user

**Request Body:**
```json
{
  "email": "user@example.com",  // OR phoneNumber
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "phoneNumber": "9876543210",
    "name": "John Doe",
    "isAdmin": false,
    "isTrainer": false,
    // ... other user fields
  }
}
```

### 3. Get All Users
**Endpoint:** `GET /users`

**Description:** Get list of all users

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "phoneNumber": "9876543210",
      "name": "John Doe",
      "isAdmin": false,
      "isTrainer": false
    }
  ]
}
```

### 4. Get User By ID
**Endpoint:** `GET /users/:id`

**Description:** Get specific user details

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "phoneNumber": "9876543210",
    "name": "John Doe",
    "isAdmin": false,
    "isTrainer": false
  }
}
```

---

## WhatsApp OTP APIs

### 5. Send WhatsApp OTP
**Endpoint:** `POST /otp/send`

**Description:** Send OTP via WhatsApp

**Request Body:**
```json
{
  "phoneNumber": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully via WhatsApp",
  "expiresIn": "10 minutes"
}
```

### 6. Verify WhatsApp OTP
**Endpoint:** `POST /otp/verify`

**Description:** Verify WhatsApp OTP and login

**Request Body:**
```json
{
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "phoneNumber": "9876543210",
    "name": "User_3210"
  }
}
```

### 7. Resend WhatsApp OTP
**Endpoint:** `POST /otp/resend`

**Description:** Resend OTP with rate limiting

**Request Body:**
```json
{
  "phoneNumber": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully via WhatsApp",
  "expiresIn": "10 minutes"
}
```

---

## User Profile APIs

### 8. Get User Profile
**Endpoint:** `GET /profile/:userId`

**Description:** Get complete user profile with all details

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "phoneNumber": "9876543210",
    "name": "John Doe",
    "height": 175,
    "weight": 70,
    "measurements_chest": 40,
    "measurements_upperWaist": 32,
    "measurements_midWaist": 34,
    "measurements_lowerWaist": 36,
    "measurements_rightThigh": 22,
    "measurements_leftThigh": 22,
    "measurements_rightArm": 12,
    "measurements_leftArm": 12,
    "bca_weight": 70,
    "bca_bmi": 22.86,
    "bca_bodyFat": 18,
    "bca_muscleRate": 45,
    "bca_subcutaneousFat": 15,
    "bca_visceralFat": 5,
    "bca_bodyAge": 25,
    "bca_bmr": 1650,
    "bca_skeletalMass": 30,
    "bca_muscleMass": 56,
    "bca_boneMass": 3.2,
    "bca_protein": 16
  }
}
```

### 9. Update Personal Details
**Endpoint:** `PUT /profile/:userId/personal`

**Description:** Update user's personal information

**Request Body:**
```json
{
  "name": "John Doe",
  "mobileNumber": "9876543210",
  "height": 175,
  "weight": 70
}
```

**Response:**
```json
{
  "success": true,
  "message": "Personal details updated successfully",
  "data": { /* updated user object */ }
}
```

### 10. Update Body Measurements
**Endpoint:** `PUT /profile/:userId/measurements`

**Description:** Update user's body measurements

**Request Body:**
```json
{
  "chest": 40,
  "upperWaist": 32,
  "midWaist": 34,
  "lowerWaist": 36,
  "rightThigh": 22,
  "leftThigh": 22,
  "rightArm": 12,
  "leftArm": 12
}
```

**Response:**
```json
{
  "success": true,
  "message": "Body measurements updated successfully",
  "data": { /* updated user object */ }
}
```

### 11. Update Body Composition Analysis
**Endpoint:** `PUT /profile/:userId/bca`

**Description:** Update user's BCA data

**Request Body:**
```json
{
  "weight": 70,
  "bmi": 22.86,
  "bodyFat": 18,
  "muscleRate": 45,
  "subcutaneousFat": 15,
  "visceralFat": 5,
  "bodyAge": 25,
  "bmr": 1650,
  "skeletalMass": 30,
  "muscleMass": 56,
  "boneMass": 3.2,
  "protein": 16
}
```

**Response:**
```json
{
  "success": true,
  "message": "Body composition analysis updated successfully",
  "data": { /* updated user object */ }
}
```

### 12. Update Full Profile
**Endpoint:** `PUT /profile/:userId`

**Description:** Update all profile sections at once

**Request Body:**
```json
{
  "personalDetails": {
    "name": "John Doe",
    "mobileNumber": "9876543210",
    "height": 175,
    "weight": 70
  },
  "measurements": {
    "chest": 40,
    "upperWaist": 32,
    "midWaist": 34,
    "lowerWaist": 36,
    "rightThigh": 22,
    "leftThigh": 22,
    "rightArm": 12,
    "leftArm": 12
  },
  "bca": {
    "weight": 70,
    "bmi": 22.86,
    "bodyFat": 18,
    "muscleRate": 45,
    "subcutaneousFat": 15,
    "visceralFat": 5,
    "bodyAge": 25,
    "bmr": 1650,
    "skeletalMass": 30,
    "muscleMass": 56,
    "boneMass": 3.2,
    "protein": 16
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user object */ }
}
```

---

## Health Check API

### 13. Health Check
**Endpoint:** `GET /health`

**Description:** Check API server status

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Error Responses

All APIs may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials or OTP"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Resource already exists"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Rate limit exceeded"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## User Model Fields

- `id` (Integer): Primary key
- `email` (String): User's email address
- `phoneNumber` (String): User's phone number
- `name` (String): User's full name
- `mobileNumber` (String): Additional mobile number
- `isAdmin` (Boolean): Admin privileges flag
- `isTrainer` (Boolean): Trainer privileges flag
- `height` (Float): Height in cm
- `weight` (Float): Weight in kg

### Body Measurements (in cm)
- `measurements_chest`
- `measurements_upperWaist`
- `measurements_midWaist`
- `measurements_lowerWaist`
- `measurements_rightThigh`
- `measurements_leftThigh`
- `measurements_rightArm`
- `measurements_leftArm`

### Body Composition Analysis
- `bca_weight` (Float): BCA weight in kg
- `bca_bmi` (Float): Body Mass Index
- `bca_bodyFat` (Float): Body fat percentage
- `bca_muscleRate` (Float): Muscle rate percentage
- `bca_subcutaneousFat` (Float): Subcutaneous fat percentage
- `bca_visceralFat` (Float): Visceral fat level
- `bca_bodyAge` (Integer): Metabolic body age
- `bca_bmr` (Float): Basal Metabolic Rate in kcal
- `bca_skeletalMass` (Float): Skeletal mass in kg
- `bca_muscleMass` (Float): Muscle mass in kg
- `bca_boneMass` (Float): Bone mass in kg
- `bca_protein` (Float): Protein percentage

---

## Environment Variables

```env
PORT=4000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=webservices
DB_USER=postgres
DB_PASSWORD=your_password

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## Notes

1. OTP expires after 10 minutes
2. Maximum 3 OTP verification attempts allowed
3. Rate limiting: 2 minutes between OTP resends
4. Indian phone number validation (starts with 6-9)
5. Auto user creation on first successful OTP login
6. No password required - OTP-based authentication only