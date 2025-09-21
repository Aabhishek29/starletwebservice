# User API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication
All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## User Model Structure

### Fields
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | INTEGER | Primary key, auto-increment | Auto |
| email | STRING | User's email address | No |
| phoneNumber | STRING | User's phone number | No |
| isAdmin | BOOLEAN | Admin privileges (default: false) | Yes |
| isTrainer | BOOLEAN | Trainer privileges (default: false) | Yes |
| name | STRING | User's full name | No |
| mobileNumber | STRING | Additional mobile number | No |
| height | FLOAT | Height in cm | No |
| weight | FLOAT | Weight in kg | No |
| measurements_chest | FLOAT | Chest measurement in cm | No |
| measurements_upperWaist | FLOAT | Upper waist in cm | No |
| measurements_midWaist | FLOAT | Mid waist in cm | No |
| measurements_lowerWaist | FLOAT | Lower waist in cm | No |
| measurements_rightThigh | FLOAT | Right thigh in cm | No |
| measurements_leftThigh | FLOAT | Left thigh in cm | No |
| measurements_rightArm | FLOAT | Right arm in cm | No |
| measurements_leftArm | FLOAT | Left arm in cm | No |
| bca_weight | FLOAT | BCA weight in kg | No |
| bca_bmi | FLOAT | Body Mass Index | No |
| bca_bodyFat | FLOAT | Body fat percentage | No |
| bca_muscleRate | FLOAT | Muscle rate percentage | No |
| bca_subcutaneousFat | FLOAT | Subcutaneous fat percentage | No |
| bca_visceralFat | FLOAT | Visceral fat level | No |
| bca_bodyAge | INTEGER | Metabolic body age | No |
| bca_bmr | FLOAT | Basal Metabolic Rate in kcal | No |
| bca_skeletalMass | FLOAT | Skeletal mass in kg | No |
| bca_muscleMass | FLOAT | Muscle mass in kg | No |
| bca_boneMass | FLOAT | Bone mass in kg | No |
| bca_protein | FLOAT | Protein percentage | No |

---

## Authentication Endpoints

### 1. Request OTP Login
**Endpoint:** `POST /users/request-otp`
**Auth Required:** No
**Description:** Request OTP for login via email or WhatsApp

#### Request Body
```json
{
  "email": "user@example.com"  // OR
  "phoneNumber": "9876543210"
}
```

#### Response
```json
{
  "success": true,
  "message": "OTP sent to your email/WhatsApp",
  "identifierType": "email",  // or "phone"
  "expiresIn": "10 minutes"
}
```

#### Error Responses
- `400` - Invalid email format or phone number
- `500` - Internal server error

---

### 2. Verify OTP and Login
**Endpoint:** `POST /users/verify-otp`
**Auth Required:** No
**Description:** Verify OTP and receive JWT tokens

#### Request Body
```json
{
  "email": "user@example.com",  // OR phoneNumber
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```

#### Response
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
    "isTrainer": false
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

#### Error Responses
- `400` - Missing credentials or invalid OTP
- `500` - Internal server error

---

## User Management Endpoints

### 3. Get All Users
**Endpoint:** `GET /users`
**Auth Required:** Yes (Admin only)
**Description:** Retrieve list of all users

#### Headers
```
Authorization: Bearer <admin_jwt_token>
```

#### Response
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
      "isTrainer": false,
      "height": 175,
      "weight": 70
    }
  ]
}
```

#### Error Responses
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (not an admin)
- `500` - Internal server error

---

### 4. Get User by ID
**Endpoint:** `GET /users/:id`
**Auth Required:** Yes (Owner or Admin)
**Description:** Get specific user details

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Parameters
- `id` (path) - User ID

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "phoneNumber": "9876543210",
    "name": "John Doe",
    "isAdmin": false,
    "isTrainer": false,
    "height": 175,
    "weight": 70,
    "measurements_chest": 40,
    "bca_bmi": 22.86
  }
}
```

#### Error Responses
- `401` - Unauthorized
- `403` - Forbidden (not owner or admin)
- `404` - User not found
- `500` - Internal server error

---

## Profile Management Endpoints

### 5. Get User Profile
**Endpoint:** `GET /profile/:userId`
**Auth Required:** Yes (Owner or Admin)
**Description:** Get complete user profile with all details

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Parameters
- `userId` (path) - User ID

#### Response
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

---

### 6. Update Personal Details
**Endpoint:** `PUT /profile/:userId/personal`
**Auth Required:** Yes (Owner or Admin)
**Description:** Update user's personal information

#### Request Body
```json
{
  "name": "John Doe",
  "mobileNumber": "9876543210",
  "height": 175,
  "weight": 70
}
```

#### Response
```json
{
  "success": true,
  "message": "Personal details updated successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "mobileNumber": "9876543210",
    "height": 175,
    "weight": 70
  }
}
```

---

### 7. Update Body Measurements
**Endpoint:** `PUT /profile/:userId/measurements`
**Auth Required:** Yes (Owner or Admin)
**Description:** Update user's body measurements

#### Request Body
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

#### Response
```json
{
  "success": true,
  "message": "Body measurements updated successfully",
  "data": {
    "id": 1,
    "measurements_chest": 40,
    "measurements_upperWaist": 32,
    "measurements_midWaist": 34,
    "measurements_lowerWaist": 36,
    "measurements_rightThigh": 22,
    "measurements_leftThigh": 22,
    "measurements_rightArm": 12,
    "measurements_leftArm": 12
  }
}
```

---

### 8. Update Body Composition Analysis
**Endpoint:** `PUT /profile/:userId/bca`
**Auth Required:** Yes (Owner or Admin)
**Description:** Update user's BCA data

#### Request Body
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

#### Response
```json
{
  "success": true,
  "message": "Body composition analysis updated successfully",
  "data": {
    "id": 1,
    "bca_weight": 70,
    "bca_bmi": 22.86,
    "bca_bodyFat": 18,
    "bca_muscleRate": 45
  }
}
```

---

### 9. Update Full Profile
**Endpoint:** `PUT /profile/:userId`
**Auth Required:** Yes (Owner or Admin)
**Description:** Update all profile sections at once

#### Request Body
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

---

## WhatsApp OTP Endpoints

### 10. Send WhatsApp OTP
**Endpoint:** `POST /otp/send`
**Auth Required:** No
**Description:** Send OTP via WhatsApp

#### Request Body
```json
{
  "phoneNumber": "9876543210"
}
```

#### Response
```json
{
  "success": true,
  "message": "OTP sent successfully via WhatsApp",
  "expiresIn": "10 minutes"
}
```

---

### 11. Verify WhatsApp OTP
**Endpoint:** `POST /otp/verify`
**Auth Required:** No
**Description:** Verify WhatsApp OTP and login

#### Request Body
```json
{
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```

#### Response
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "phoneNumber": "9876543210",
    "name": "User_3210"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

---

### 12. Resend WhatsApp OTP
**Endpoint:** `POST /otp/resend`
**Auth Required:** No
**Description:** Resend OTP with rate limiting (2 min cooldown)

#### Request Body
```json
{
  "phoneNumber": "9876543210"
}
```

#### Response
```json
{
  "success": true,
  "message": "OTP resent successfully via WhatsApp",
  "expiresIn": "10 minutes"
}
```

#### Error Response (Rate Limited)
```json
{
  "success": false,
  "message": "Please wait 1 minute(s) before requesting a new OTP"
}
```

---

## Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Authentication & Authorization

### JWT Token Structure
```json
{
  "id": 1,
  "email": "user@example.com",
  "phoneNumber": "9876543210",
  "isAdmin": false,
  "isTrainer": false,
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authorization Levels
1. **Public** - No authentication required
2. **Authenticated** - Valid JWT required
3. **Owner** - User can only access their own data
4. **Trainer** - Trainer role required
5. **Admin** - Admin role required
6. **Owner or Admin** - Either owner of resource or admin

### Token Usage
```javascript
// Include in headers
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
  'Content-Type': 'application/json'
}
```

---

## Notes

1. **OTP Validity:** 10 minutes
2. **OTP Attempts:** Maximum 3 attempts
3. **Rate Limiting:** 2 minutes between OTP resends
4. **Phone Validation:** Indian numbers only (starts with 6-9)
5. **Auto Registration:** Users are automatically created on first successful OTP verification
6. **Token Expiry:**
   - Access Token: 7 days
   - Refresh Token: 30 days
7. **Password:** No passwords - OTP-only authentication