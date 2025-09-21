# Payment API Documentation

## Base URL
```
http://localhost:4000/api/payments
```

## Authentication
All payment endpoints require JWT authentication:
```
Authorization: Bearer <your_jwt_token>
```

---

## Payment Model Structure

### Core Fields
| Field | Type | Description | Required | Constraints |
|-------|------|-------------|----------|-------------|
| id | INTEGER | Primary key, auto-increment | Auto | - |
| paymentId | STRING | Unique payment identifier | Auto | Format: PAY_TIMESTAMP_XXXX |
| userId | INTEGER | User making payment | Yes | Cannot equal superUserId |
| superUserId | INTEGER | Referrer/sponsor ID | No | Cannot equal userId |
| amount | DECIMAL(10,2) | Base payment amount | Yes | Min: 0 |
| date | DATEONLY | Payment date | Yes | Format: YYYY-MM-DD |
| packageType | ENUM | Type of package | Yes | basic/standard/premium/custom |
| sessionCount | INTEGER | Number of sessions | Yes | Min: 0 |

### Additional Fields
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| paymentMethod | ENUM | Payment method | cash |
| paymentStatus | ENUM | Payment status | pending |
| transactionReference | STRING | External reference | null |
| currency | STRING(3) | Currency code | INR |
| gst | DECIMAL(10,2) | GST amount | 0 |
| discount | DECIMAL(10,2) | Discount amount | 0 |
| finalAmount | DECIMAL(10,2) | Final amount | Calculated |
| invoiceNumber | STRING | Invoice number | Auto-generated |
| notes | TEXT | Additional notes | null |

### Payment Method Values
- `cash`
- `card`
- `upi`
- `netbanking`
- `wallet`
- `other`

### Payment Status Values
- `pending` - Payment initiated
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded
- `cancelled` - Payment cancelled

---

## Payment Management Endpoints

### 1. Create Payment
**Endpoint:** `POST /payments`
**Auth Required:** Yes (Trainer or Admin)
**Description:** Create a new payment record

#### Request Body
```json
{
  "userId": 5,
  "superUserId": 3,
  "amount": 5000,
  "date": "2024-12-25",
  "packageType": "premium",
  "sessionCount": 10,
  "paymentMethod": "upi",
  "transactionReference": "UPI123456789",
  "gst": 900,
  "discount": 500,
  "notes": "New year discount applied"
}
```

#### Response
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": 1,
    "paymentId": "PAY_1703500000000_A1B2",
    "userId": 5,
    "superUserId": 3,
    "amount": "5000.00",
    "date": "2024-12-25",
    "packageType": "premium",
    "sessionCount": 10,
    "paymentMethod": "upi",
    "paymentStatus": "pending",
    "transactionReference": "UPI123456789",
    "gst": "900.00",
    "discount": "500.00",
    "finalAmount": "5400.00",
    "invoiceNumber": "INV202412000001",
    "currency": "INR"
  }
}
```

#### Validation Rules
- ✅ **userId ≠ superUserId** (User cannot be their own referrer)
- userId must exist
- superUserId must exist (if provided)
- amount must be positive
- packageType must be valid
- sessionCount must be non-negative

#### Calculation
```
finalAmount = amount + gst - discount
```

#### Error Responses
- `400` - Validation error (userId = superUserId, invalid data)
- `401` - Unauthorized
- `403` - Forbidden (not trainer/admin)
- `404` - User not found
- `500` - Internal server error

---

### 2. Get All Payments
**Endpoint:** `GET /payments`
**Auth Required:** Yes (Trainer or Admin)
**Description:** Get all payments with optional filters

#### Query Parameters
- `status` - Filter by payment status
- `packageType` - Filter by package type
- `userId` - Filter by user ID
- `superUserId` - Filter by super user ID
- `startDate` - Start date for range filter
- `endDate` - End date for range filter

#### Request Examples
```
GET /payments?status=completed
GET /payments?packageType=premium
GET /payments?userId=5
GET /payments?superUserId=3
GET /payments?startDate=2024-12-01&endDate=2024-12-31
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paymentId": "PAY_1703500000000_A1B2",
      "userId": 5,
      "superUserId": 3,
      "amount": "5000.00",
      "date": "2024-12-25",
      "packageType": "premium",
      "sessionCount": 10,
      "paymentStatus": "completed",
      "finalAmount": "5400.00",
      "invoiceNumber": "INV202412000001"
    }
  ]
}
```

---

### 3. Get Payment by ID
**Endpoint:** `GET /payments/:id`
**Auth Required:** Yes
**Description:** Get payment by database ID

#### Parameters
- `id` (path) - Payment database ID

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "paymentId": "PAY_1703500000000_A1B2",
    "userId": 5,
    "superUserId": 3,
    "amount": "5000.00",
    "date": "2024-12-25",
    "packageType": "premium",
    "sessionCount": 10,
    "paymentMethod": "upi",
    "paymentStatus": "completed",
    "transactionReference": "UPI123456789",
    "currency": "INR",
    "gst": "900.00",
    "discount": "500.00",
    "finalAmount": "5400.00",
    "invoiceNumber": "INV202412000001",
    "notes": "New year discount applied"
  }
}
```

---

### 4. Get Payment by Payment ID
**Endpoint:** `GET /payments/payment/:paymentId`
**Auth Required:** Yes
**Description:** Get payment by unique payment ID

#### Parameters
- `paymentId` (path) - Unique payment ID (e.g., PAY_1703500000000_A1B2)

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "paymentId": "PAY_1703500000000_A1B2",
    "userId": 5,
    "amount": "5000.00",
    "finalAmount": "5400.00",
    "paymentStatus": "completed"
  }
}
```

---

### 5. Get User Payments
**Endpoint:** `GET /payments/user/:userId`
**Auth Required:** Yes
**Description:** Get all payments made by a specific user

#### Parameters
- `userId` (path) - User ID

#### Response
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 1,
        "paymentId": "PAY_1703500000000_A1B2",
        "amount": "5000.00",
        "date": "2024-12-25",
        "packageType": "premium",
        "sessionCount": 10,
        "paymentStatus": "completed",
        "finalAmount": "5400.00"
      },
      {
        "id": 2,
        "paymentId": "PAY_1703600000000_C3D4",
        "amount": "3000.00",
        "date": "2024-11-15",
        "packageType": "standard",
        "sessionCount": 5,
        "paymentStatus": "completed",
        "finalAmount": "3300.00"
      }
    ],
    "summary": {
      "totalPayments": 2,
      "totalSpent": 8700
    }
  }
}
```

---

### 6. Get Super User Payments
**Endpoint:** `GET /payments/super-user/:superUserId`
**Auth Required:** Yes (Trainer or Admin)
**Description:** Get all referral payments for a super user

#### Parameters
- `superUserId` (path) - Super User ID

#### Response
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 1,
        "paymentId": "PAY_1703500000000_A1B2",
        "userId": 5,
        "amount": "5000.00",
        "date": "2024-12-25",
        "packageType": "premium",
        "sessionCount": 10,
        "paymentStatus": "completed",
        "finalAmount": "5400.00"
      }
    ],
    "summary": {
      "totalReferrals": 3,
      "totalAmount": 15400,
      "totalSessions": 25
    }
  }
}
```

---

### 7. Update Payment
**Endpoint:** `PUT /payments/:id`
**Auth Required:** Yes (Trainer or Admin)
**Description:** Update payment details (only for pending payments)

#### Parameters
- `id` (path) - Payment ID

#### Request Body
```json
{
  "amount": 5500,
  "gst": 990,
  "discount": 600,
  "notes": "Updated discount",
  "transactionReference": "UPI987654321"
}
```

#### Response
```json
{
  "success": true,
  "message": "Payment updated successfully",
  "data": {
    "id": 1,
    "paymentId": "PAY_1703500000000_A1B2",
    "amount": "5500.00",
    "gst": "990.00",
    "discount": "600.00",
    "finalAmount": "5890.00"
  }
}
```

#### Validation Rules
- Cannot update completed or refunded payments
- userId ≠ superUserId validation still applies
- Final amount is recalculated automatically

---

### 8. Delete Payment
**Endpoint:** `DELETE /payments/:id`
**Auth Required:** Yes (Admin only)
**Description:** Delete a payment (only pending/failed/cancelled)

#### Parameters
- `id` (path) - Payment ID

#### Response
```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

#### Restrictions
- Cannot delete completed payments
- Cannot delete refunded payments

---

## Payment Status Management

### 9. Update Payment Status
**Endpoint:** `PATCH /payments/:id/status`
**Auth Required:** Yes (Trainer or Admin)
**Description:** Update the status of a payment

#### Parameters
- `id` (path) - Payment ID

#### Request Body
```json
{
  "status": "completed",
  "transactionReference": "BANK123456789"
}
```

#### Response
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "id": 1,
    "paymentId": "PAY_1703500000000_A1B2",
    "paymentStatus": "completed",
    "transactionReference": "BANK123456789",
    "invoiceNumber": "INV202412000001"
  }
}
```

#### Notes
- Invoice number is auto-generated when status changes to "completed"
- Transaction reference can be updated with status

---

### 10. Process Refund
**Endpoint:** `POST /payments/:id/refund`
**Auth Required:** Yes (Admin only)
**Description:** Process a refund for a completed payment

#### Parameters
- `id` (path) - Payment ID

#### Request Body
```json
{
  "reason": "Customer request - service not provided"
}
```

#### Response
```json
{
  "success": true,
  "message": "Payment refunded successfully",
  "data": {
    "id": 1,
    "paymentId": "PAY_1703500000000_A1B2",
    "paymentStatus": "refunded",
    "notes": "Refund Reason: Customer request - service not provided"
  }
}
```

#### Restrictions
- Only completed payments can be refunded
- Refund reason is appended to notes

---

## Statistics & Analytics

### 11. Get Payment Statistics
**Endpoint:** `GET /payments/statistics`
**Auth Required:** Yes (Admin only)
**Description:** Get payment statistics and analytics

#### Query Parameters
- `startDate` - Start date for analysis
- `endDate` - End date for analysis

#### Request
```
GET /payments/statistics?startDate=2024-01-01&endDate=2024-12-31
```

#### Response
```json
{
  "success": true,
  "data": {
    "totalRevenue": 543000,
    "paymentsByStatus": [
      {
        "paymentStatus": "completed",
        "count": 85,
        "totalAmount": "543000.00"
      },
      {
        "paymentStatus": "pending",
        "count": 5,
        "totalAmount": "25000.00"
      },
      {
        "paymentStatus": "refunded",
        "count": 3,
        "totalAmount": "15000.00"
      }
    ],
    "paymentsByPackage": [
      {
        "packageType": "premium",
        "count": 30,
        "totalAmount": "300000.00",
        "totalSessions": 300
      },
      {
        "packageType": "standard",
        "count": 40,
        "totalAmount": "200000.00",
        "totalSessions": 200
      },
      {
        "packageType": "basic",
        "count": 15,
        "totalAmount": "43000.00",
        "totalSessions": 45
      }
    ]
  }
}
```

---

## Business Logic & Validation

### User Validation Rule
**CRITICAL:** `userId` must never equal `superUserId`
- Enforced at model level
- Enforced at controller level
- Applies to create and update operations
- Error message: "User cannot be their own super user (referrer)"

### Payment Status Flow
```
pending → completed → refunded
   ↓         ↓
failed   cancelled
```

### Financial Calculations
```javascript
baseAmount = amount
gstAmount = gst || 0
discountAmount = discount || 0
finalAmount = baseAmount + gstAmount - discountAmount
```

### Invoice Number Generation
- Format: `INV + YYYY + MM + 6-digit-padded-ID`
- Example: `INV202412000001`
- Generated automatically when payment is marked as completed

### Payment ID Generation
- Format: `PAY_TIMESTAMP_RANDOM`
- Example: `PAY_1703500000000_A1B2C3D4`
- Generated automatically on creation

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
- `400` - Bad Request (validation error, userId = superUserId)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Usage Examples

### Example 1: Create a Premium Package Payment
```javascript
// POST /payments
{
  "userId": 10,
  "superUserId": 5,  // Referrer
  "amount": 10000,
  "packageType": "premium",
  "sessionCount": 20,
  "paymentMethod": "card",
  "gst": 1800,
  "discount": 1000,
  "notes": "Early bird discount"
}
// Final amount = 10000 + 1800 - 1000 = 10800
```

### Example 2: Complete a Payment
```javascript
// PATCH /payments/1/status
{
  "status": "completed",
  "transactionReference": "CARD_TXN_123456"
}
// This will auto-generate invoice number
```

### Example 3: Query Referral Performance
```javascript
// GET /payments/super-user/5
// Returns all payments where superUserId = 5
// Shows total referrals and commission base
```

### Example 4: Process Refund
```javascript
// POST /payments/1/refund
{
  "reason": "Service cancellation due to medical emergency"
}
// Only works for completed payments
```

---

## Package Types

### Basic Package
- Lower price point
- Limited sessions
- Standard features

### Standard Package
- Mid-range pricing
- Moderate session count
- Enhanced features

### Premium Package
- Higher price point
- Maximum sessions
- All features included

### Custom Package
- Flexible pricing
- Custom session count
- Tailored features

---

## Notes

1. **Payment ID:** Unique identifier auto-generated on creation
2. **Invoice Number:** Generated when payment is marked completed
3. **Referral System:** Track referrers via superUserId
4. **GST & Discounts:** Automatically calculated in finalAmount
5. **Status Protection:** Completed/refunded payments cannot be edited
6. **Deletion Protection:** Only pending/failed/cancelled payments can be deleted
7. **Currency:** Default is INR, can be changed per payment
8. **Audit Trail:** All changes tracked via updatedAt timestamp
9. **Validation:** userId ≠ superUserId strictly enforced