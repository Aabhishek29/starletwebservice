# Session API Documentation

## Base URL
```
http://localhost:4000/api/sessions
```

## Authentication
All endpoints except `/upcoming` require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Session Model Structure

### Fields
| Field | Type | Description | Required | Constraints |
|-------|------|-------------|----------|-------------|
| id | INTEGER | Primary key, auto-increment | Auto | - |
| sessionId | STRING | Unique session identifier | Auto | Format: SESSION_XXXXXXXXXXXX |
| personCount | INTEGER | Number of persons allowed | Yes | Must be 1 or 2 |
| startingTime | TIME | Session start time | Yes | Format: HH:MM:SS |
| date | DATEONLY | Session date | Yes | Format: YYYY-MM-DD |
| users | JSON ARRAY | Array of user IDs | No | Cannot exceed personCount |
| status | ENUM | Session status | Auto | scheduled/in_progress/completed/cancelled |
| endTime | TIME | Session end time | No | Format: HH:MM:SS |
| trainerId | INTEGER | Assigned trainer ID | No | Must be valid trainer |
| notes | TEXT | Session notes | No | - |
| createdAt | DATETIME | Creation timestamp | Auto | - |
| updatedAt | DATETIME | Last update timestamp | Auto | - |

---

## Public Endpoints

### 1. Get Upcoming Sessions
**Endpoint:** `GET /sessions/upcoming`
**Auth Required:** No
**Description:** Get list of upcoming sessions for display

#### Query Parameters
- `limit` (optional) - Number of sessions to return (default: 10)

#### Request
```
GET /sessions/upcoming?limit=5
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
      "personCount": 2,
      "startingTime": "10:00:00",
      "date": "2024-12-25",
      "users": [1, 2],
      "status": "scheduled",
      "trainerId": 3,
      "endTime": "11:00:00",
      "notes": "Morning yoga session"
    }
  ]
}
```

---

## Protected Endpoints (Authentication Required)

### 2. Create Session
**Endpoint:** `POST /sessions`
**Auth Required:** Yes (Trainer or Admin)
**Description:** Create a new training session

#### Request Body
```json
{
  "personCount": 2,
  "startingTime": "10:00:00",
  "date": "2024-12-25",
  "users": [1, 2],
  "trainerId": 3,
  "endTime": "11:00:00",
  "notes": "Morning yoga session"
}
```

#### Response
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "id": 1,
    "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
    "personCount": 2,
    "startingTime": "10:00:00",
    "date": "2024-12-25",
    "users": [1, 2],
    "status": "scheduled",
    "trainerId": 3,
    "endTime": "11:00:00",
    "notes": "Morning yoga session"
  }
}
```

#### Validation Rules
- `personCount` must be 1 or 2
- `users` array length cannot exceed `personCount`
- `trainerId` must reference a valid trainer user
- `startingTime` and `date` are required

#### Error Responses
- `400` - Validation error (invalid person count, too many users, etc.)
- `401` - Unauthorized
- `403` - Forbidden (not a trainer/admin)
- `404` - Trainer not found
- `500` - Internal server error

---

### 3. Get All Sessions
**Endpoint:** `GET /sessions`
**Auth Required:** Yes
**Description:** Get all sessions with optional filters

#### Query Parameters
- `date` - Filter by specific date (YYYY-MM-DD)
- `status` - Filter by status (scheduled/in_progress/completed/cancelled)
- `trainerId` - Filter by trainer ID
- `upcoming` - Set to "true" to get only upcoming sessions

#### Request Examples
```
GET /sessions?date=2024-12-25
GET /sessions?status=scheduled
GET /sessions?trainerId=3
GET /sessions?upcoming=true
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
      "personCount": 2,
      "startingTime": "10:00:00",
      "date": "2024-12-25",
      "users": [1, 2],
      "status": "scheduled",
      "trainerId": 3
    }
  ]
}
```

---

### 4. Get Session by ID
**Endpoint:** `GET /sessions/:id`
**Auth Required:** Yes
**Description:** Get session by database ID

#### Parameters
- `id` (path) - Session database ID

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
    "personCount": 2,
    "startingTime": "10:00:00",
    "date": "2024-12-25",
    "users": [1, 2],
    "status": "scheduled",
    "trainerId": 3,
    "endTime": "11:00:00",
    "notes": "Morning yoga session"
  }
}
```

---

### 5. Get Session by Session ID
**Endpoint:** `GET /sessions/session/:sessionId`
**Auth Required:** Yes
**Description:** Get session by unique session ID

#### Parameters
- `sessionId` (path) - Unique session ID (e.g., SESSION_A1B2C3D4E5F6G7H8)

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
    "personCount": 2,
    "startingTime": "10:00:00",
    "date": "2024-12-25",
    "users": [1, 2],
    "status": "scheduled"
  }
}
```

---

### 6. Get Sessions by Date
**Endpoint:** `GET /sessions/date/:date`
**Auth Required:** Yes
**Description:** Get all sessions for a specific date

#### Parameters
- `date` (path) - Date in YYYY-MM-DD format

#### Request
```
GET /sessions/date/2024-12-25
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
      "startingTime": "10:00:00",
      "date": "2024-12-25",
      "personCount": 2,
      "users": [1, 2],
      "status": "scheduled"
    },
    {
      "id": 2,
      "sessionId": "SESSION_B2C3D4E5F6G7H8I9",
      "startingTime": "14:00:00",
      "date": "2024-12-25",
      "personCount": 1,
      "users": [3],
      "status": "scheduled"
    }
  ]
}
```

---

### 7. Get Sessions by Date Range
**Endpoint:** `GET /sessions/date-range`
**Auth Required:** Yes
**Description:** Get sessions within a date range

#### Query Parameters
- `startDate` (required) - Start date (YYYY-MM-DD)
- `endDate` (required) - End date (YYYY-MM-DD)

#### Request
```
GET /sessions/date-range?startDate=2024-12-01&endDate=2024-12-31
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
      "date": "2024-12-01",
      "startingTime": "10:00:00",
      "status": "completed"
    },
    {
      "id": 2,
      "sessionId": "SESSION_B2C3D4E5F6G7H8I9",
      "date": "2024-12-15",
      "startingTime": "14:00:00",
      "status": "scheduled"
    }
  ]
}
```

---

### 8. Get User's Sessions
**Endpoint:** `GET /sessions/user/:userId`
**Auth Required:** Yes
**Description:** Get all sessions for a specific user

#### Parameters
- `userId` (path) - User ID

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
      "date": "2024-12-25",
      "startingTime": "10:00:00",
      "personCount": 2,
      "users": [1, 2],
      "status": "scheduled",
      "trainerId": 3
    }
  ]
}
```

---

### 9. Update Session
**Endpoint:** `PUT /sessions/:id`
**Auth Required:** Yes (Trainer or Admin)
**Description:** Update session details

#### Parameters
- `id` (path) - Session ID

#### Request Body
```json
{
  "personCount": 1,
  "startingTime": "11:00:00",
  "endTime": "12:00:00",
  "notes": "Updated session time",
  "trainerId": 4
}
```

#### Response
```json
{
  "success": true,
  "message": "Session updated successfully",
  "data": {
    "id": 1,
    "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
    "personCount": 1,
    "startingTime": "11:00:00",
    "endTime": "12:00:00",
    "notes": "Updated session time"
  }
}
```

#### Validation Rules
- Cannot reduce `personCount` below current number of users
- Cannot add more users than `personCount`
- `trainerId` must be valid trainer

---

### 10. Delete Session
**Endpoint:** `DELETE /sessions/:id`
**Auth Required:** Yes (Admin only)
**Description:** Delete a session

#### Parameters
- `id` (path) - Session ID

#### Response
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

---

## Session User Management

### 11. Add User to Session
**Endpoint:** `POST /sessions/:id/add-user`
**Auth Required:** Yes
**Description:** Add a user to a session

#### Parameters
- `id` (path) - Session ID

#### Request Body
```json
{
  "userId": 5
}
```

#### Response
```json
{
  "success": true,
  "message": "User added to session successfully",
  "data": {
    "id": 1,
    "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
    "users": [1, 2, 5],
    "personCount": 3
  }
}
```

#### Error Responses
- `400` - Session is full (users count = personCount)
- `400` - User not found
- `404` - Session not found

---

### 12. Remove User from Session
**Endpoint:** `POST /sessions/:id/remove-user`
**Auth Required:** Yes (Trainer or Admin)
**Description:** Remove a user from a session

#### Parameters
- `id` (path) - Session ID

#### Request Body
```json
{
  "userId": 5
}
```

#### Response
```json
{
  "success": true,
  "message": "User removed from session successfully",
  "data": {
    "id": 1,
    "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
    "users": [1, 2],
    "personCount": 3
  }
}
```

---

## Session Status Management

### 13. Update Session Status
**Endpoint:** `PATCH /sessions/:id/status`
**Auth Required:** Yes (Trainer or Admin)
**Description:** Update the status of a session

#### Parameters
- `id` (path) - Session ID

#### Request Body
```json
{
  "status": "in_progress"
}
```

#### Valid Status Values
- `scheduled` - Session is scheduled
- `in_progress` - Session is currently ongoing
- `completed` - Session has been completed
- `cancelled` - Session has been cancelled

#### Response
```json
{
  "success": true,
  "message": "Session status updated successfully",
  "data": {
    "id": 1,
    "sessionId": "SESSION_A1B2C3D4E5F6G7H8",
    "status": "in_progress"
  }
}
```

---

## Error Response Format

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
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Business Logic & Validation

### Person Count Rules
1. Must be either 1 or 2
2. Cannot be changed to less than current user count
3. Users array cannot exceed person count

### User Management Rules
1. Users are stored as an array of user IDs
2. Cannot add duplicate users
3. Cannot exceed session's person count
4. User must exist in the system

### Session Status Flow
```
scheduled → in_progress → completed
     ↓            ↓
  cancelled    cancelled
```

### Trainer Assignment
- Only users with `isTrainer = true` can be assigned
- Trainer can be changed anytime before completion

### Date & Time
- Date format: YYYY-MM-DD
- Time format: HH:MM:SS (24-hour)
- Sessions are ordered by date and starting time

---

## Usage Examples

### Example 1: Create a Group Session
```javascript
// POST /sessions
{
  "personCount": 2,
  "startingTime": "18:00:00",
  "date": "2024-12-25",
  "users": [],  // Will be added later
  "trainerId": 3,
  "notes": "Evening fitness session"
}
```

### Example 2: Add Users to Session
```javascript
// First user
// POST /sessions/1/add-user
{
  "userId": 10
}

// Second user
// POST /sessions/1/add-user
{
  "userId": 11
}

// Third user would fail (personCount = 2)
```

### Example 3: Query Sessions for a Week
```javascript
// GET /sessions/date-range?startDate=2024-12-23&endDate=2024-12-29
```

### Example 4: Complete a Session
```javascript
// PATCH /sessions/1/status
{
  "status": "completed"
}
```

---

## Notes

1. **Session ID:** Automatically generated in format SESSION_XXXXXXXXXXXX
2. **User Array:** Stored as JSON, searched using database JSON functions
3. **Upcoming Sessions:** Filters for future dates with scheduled/in_progress status
4. **Sorting:** Sessions are typically sorted by date (DESC) and time (DESC)
5. **Capacity:** Sessions enforce strict capacity limits based on personCount
6. **Trainer Validation:** System validates trainer role before assignment