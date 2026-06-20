# Applications API — Student

Base URL prefix: `/applications`

All endpoints require **student authentication** (`Authorization: Bearer <supabase-jwt>`).

---

## GET `/applications`

Returns all applications for the authenticated student as a flat array, ordered by most recently created.

### Response `200`

```json
{
  "status": "success",
  "data": [
    {
      "application": {
        "id": "uuid",
        "status": "created",
        "receiptUrl": null
      },
      "course": {
        "id": 1,
        "name": "BSc Computer Science",
        "country": "India",
        "universityId": 5,
        "universityName": "MIT WPU",
        "applicationFee": 0,
        "currencySymbol": "$",
        "currency": "USD"
      },
      "university": {
        "name": "MIT WPU",
        "logoUrl": "https://cdn.example.com/logos/mitwpu.png"
      },
      "registrationFee": {
        "status": "unpaid",
        "requiredAmount": 500,
        "paidAmount": 0
      },
      "tuitionFee": {
        "status": "unpaid",
        "requiredAmount": 8400,
        "paidAmount": 0
      }
    }
  ]
}
```

**Field notes:**

- `registrationFee` / `tuitionFee` — `null` when no fee requirement record exists for that type yet.

### Error Responses

| Status | Description |
|--------|-------------|
| `401` | Missing or invalid auth token |

---

## GET `/applications/by-ids`

Returns full application detail for a specific set of application IDs. All requested IDs must belong to the authenticated student.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids` | string | Yes | Comma-separated application UUIDs, e.g. `ids=uuid1,uuid2` |

### Response `200`

```json
{
  "status": "success",
  "data": [
    {
      "application": {
        "id": "uuid",
        "userId": "uuid",
        "universityId": 5,
        "courseId": 1,
        "intakeId": 12,
        "intakeMonth": 9,
        "intakeYear": 2025,
        "intakeLabel": "Fall 2025",
        "status": "created",
        "feeCurrency": "USD",
        "receiptUrl": null,
        "receiptUploadedAt": null,
        "eligibilityStatus": "pending",
        "eligibilityMarkedAt": null,
        "isPartiallyRegistered": null,
        "createdAt": "2025-05-10T14:30:00.000Z",
        "submittedAt": null,
        "updatedAt": "2025-05-10T14:30:00.000Z"
      },
      "course": {
        "id": 1,
        "name": "BSc Computer Science",
        "country": "India",
        "universityId": 5,
        "universityName": "MIT WPU",
        "applicationFee": 0,
        "currencySymbol": "$",
        "currency": "USD"
      },
      "university": {
        "name": "MIT WPU",
        "logoUrl": "https://cdn.example.com/logos/mitwpu.png"
      },
      "feeRequirements": [
        {
          "id": "uuid",
          "applicationId": "uuid",
          "feeType": "registration_fee",
          "requiredAmount": 500,
          "paidAmount": 0,
          "status": "unpaid"
        },
        {
          "id": "uuid",
          "applicationId": "uuid",
          "feeType": "tuition_fee",
          "requiredAmount": 8400,
          "paidAmount": 0,
          "status": "unpaid"
        }
      ],
      "payments": [
        {
          "id": "uuid",
          "applicationId": "uuid",
          "amount": 500,
          "currency": "USD",
          "status": "completed",
          "paymentMethod": "stripe",
          "transactionId": "pi_xxx",
          "createdAt": "2025-05-11T10:00:00.000Z",
          "completedAt": "2025-05-11T10:01:00.000Z"
        }
      ]
    }
  ]
}
```

**Field notes:**

- `feeRequirements` — All fee requirement records for the application. May be empty `[]` if not yet set up.
- `payments` — All payment records for the application regardless of payment status.

### Error Responses

| Status | Description |
|--------|-------------|
| `400` | `ids` param is missing, empty, or not a string |
| `401` | Missing or invalid auth token |
| `403` | One or more application IDs belong to a different student |
| `404` | One or more application IDs not found |

---

## POST `/applications/create`

Creates a new application for the authenticated student.

### Request Body

```json
{
  "courseId": 1,
  "intakeId": 12
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `courseId` | number | Yes | Positive integer |
| `intakeId` | number | Yes | Positive integer; must belong to the specified `courseId` |

No extra fields are allowed (schema is `.strict()`).

### Business Rules

- Student cannot have more than **5 applications** in total.
- Cannot create a duplicate application for the same course.
- The intake must exist and belong to the given course.
- Intake `status` must be `yet_to_open` or `open` — applications are rejected for `closed`, `cancelled`, or `full` intakes.
- If the course's `applicationFee` is `0`, the application is created with status `"applied"` instead of `"created"`.

### Response `201`

```json
{
  "status": "success",
  "message": "Application created successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "universityId": 5,
    "courseId": 1,
    "intakeId": 12,
    "intakeMonth": 9,
    "intakeYear": 2025,
    "intakeLabel": "Fall 2025",
    "status": "created",
    "feeCurrency": "USD",
    "receiptUrl": null,
    "receiptUploadedAt": null,
    "eligibilityStatus": "pending",
    "eligibilityMarkedAt": null,
    "isPartiallyRegistered": null,
    "createdAt": "2025-05-10T14:30:00.000Z",
    "submittedAt": null,
    "updatedAt": "2025-05-10T14:30:00.000Z"
  }
}
```

**Side effects (async, do not affect the response):**

- Intake `applicationsCount` is incremented.
- If the student has a referrer admin, an `admin.application.created` notification is sent to that admin.
- An audit log entry (`application.created`) is written.

### Error Responses

| Status | Description |
|--------|-------------|
| `400` | Validation failed (missing/invalid fields, or intake is `closed`/`cancelled`/`full`) |
| `401` | Missing or invalid auth token |
| `403` | Application limit of 5 reached |
| `404` | Course not found, or intake not found for this course |
| `409` | An application for this course already exists |

---

## DELETE `/applications/:id`

Deletes an application belonging to the authenticated student.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Application ID |

### Business Rules

- Cannot delete if status is `offer_accepted`, `registered`, or `reported`.
- Cannot delete if the application has any **completed** payments.
- On successful deletion, the intake's `applicationsCount` is decremented (floored at 0).

### Response `200`

Returns the full deleted application record.

```json
{
  "status": "success",
  "message": "Application deleted successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "universityId": 5,
    "courseId": 1,
    "intakeId": 12,
    "intakeMonth": 9,
    "intakeYear": 2025,
    "intakeLabel": "Fall 2025",
    "status": "created",
    "feeCurrency": "USD",
    "eligibilityStatus": "pending",
    "createdAt": "2025-05-10T14:30:00.000Z",
    "updatedAt": "2025-05-10T14:30:00.000Z"
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400` | Application ID is missing, status blocks deletion, or application has completed payments |
| `401` | Missing or invalid auth token |
| `404` | Application not found or does not belong to this student |

---

## Application Statuses

| Status | Description |
|--------|-------------|
| `created` | Initial state after student submits (when `applicationFee > 0`) |
| `applied` | Submitted to the university (or initial state when `applicationFee = 0`) |
| `under_review` | University is reviewing |
| `conditional_offer` | Conditional offer received |
| `unconditional_offer` | Unconditional offer received |
| `offer_accepted` | Student accepted the offer |
| `offer_declined` | Student declined the offer |
| `visa_applied` | Visa application submitted |
| `visa_approved` | Visa approved |
| `visa_rejected` | Visa rejected |
| `registered` | Student has registered at the university |
| `deferred` | Application deferred to a later intake |
| `withdrawn` | Application withdrawn |
| `reported` | Application marked as reported/closed |
| `rejected` | Application rejected by university |

## Fee Types

| `feeType` | Description |
|-----------|-------------|
| `registration_fee` | Registration/enrollment deposit |
| `tuition_fee` | First-year (or semester) tuition payment |

## Fee Statuses

| Value | Description |
|-------|-------------|
| `unpaid` | Not yet paid |
| `pending` | Payment initiated, awaiting confirmation |
| `partially_paid` | Partial payment received |
| `paid` | Fully paid |
| `waived` | Fee waived by admin |
| `refunded` | Payment refunded |
