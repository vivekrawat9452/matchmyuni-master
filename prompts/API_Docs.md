# MatchMyUni — Backend API Documentation

> **Base URL:** `https://api.matchmyuni.com` (production)
> **Staging URL:** `matchmyuni-staging.up.railway.app` (testing)
> **Framework:** Express.js (TypeScript) · **Database:** PostgreSQL (Drizzle ORM) · **Validation:** Zod

## Table of Contents

1. [Public Endpoints](#1-public-endpoints)
   - [Health Check](#11-health-check)
   - [Courses](#12-courses)
   - [Universities](#13-universities)
   - [Countries](#14-countries)
   - [Events](#15-events)
2. [User Endpoints](#2-user-endpoints)
   - [User Auth](#21-user-auth)
   - [User Profile](#22-user-profile)
   - [Student Profile](#23-student-profile)
   - [User Documents](#24-user-documents)
   - [Applications](#25-applications)
   - [Payments](#26-payments)
   - [Student Notifications](#27-student-notifications)
   - [Realtime Subscriptions](#28-realtime-subscriptions)
3. [Event Registrations](#3-event-registrations)
4. [Admin Endpoints](#4-admin-endpoints)
   - [Admin Auth](#41-admin-auth)
   - [Admin Students](#42-admin-students)
   - [Admin Applications](#43-admin-applications)
   - [Admin Payments](#44-admin-payments)
   - [Admin Members](#45-admin-members)
   - [Admin Invitations](#46-admin-invitations)
   - [Admin Notifications](#47-admin-notifications)
5. [Permission Matrix](#5-permission-matrix)

## 1. Public Endpoints

No authentication required.

---

### 1.1 Health Check

#### `GET /health`

Returns server health status.

**Response**

```json
{
  "status": "ok",
  "uptime": 12345.67,
  "memory": { "rss": 123456, "heapTotal": 123456, "heapUsed": 123456 },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 1.2 Courses

#### `GET /courses`

Get all courses with optional filtering and pagination.

**Query Parameters**

| Param             | Type            | Description                                        |
| ----------------- | --------------- | -------------------------------------------------- |
| `search`          | string          | Full-text search on course name / description      |
| `degree_level`    | string          | Filter by degree level (e.g. `Bachelor`, `Master`) |
| `duration`        | number          | Filter by duration (years)                         |
| `category`        | string          | Course category                                    |
| `destination`     | string          | Country name                                       |
| `min_fee`         | number          | Minimum tuition fee                                |
| `max_fee`         | number          | Maximum tuition fee                                |
| `intake`          | string          | Intake month/year                                  |
| `university_name` | string          | Filter by university name                          |
| `university_id`   | number          | Filter by university ID                            |
| `is_prime`        | boolean         | Only prime courses                                 |
| `randomize`       | boolean         | Randomize result order                             |
| `sort_by`         | string          | Field to sort by                                   |
| `sort_order`      | `asc` \| `desc` | Sort direction                                     |
| `page`            | number          | Page number (default: 1)                           |
| `limit`           | number          | Items per page (default: 10)                       |

**Response**

```json
{
  "status": "success",
  "data": {
    "courses": [
      {
        "id": 1,
        "universityId": 10,
        "universityName": "University of Example",
        "universityLogo": "https://...",
        "name": "Bachelor of Computer Science",
        "description": "...",
        "duration": 3,
        "degreeLevel": "Bachelor",
        "category": "Technology",
        "country": "United Kingdom",
        "city": "London",
        "intakes": ["September 2024", "January 2025"],
        "applicableTuitionFee": 15000,
        "applicationFee": 50,
        "registrationFee": 0,
        "depositFee": 500,
        "examinationFee": 0,
        "hostelFee": 0,
        "foodFee": 0,
        "packageFee": 0,
        "scholarshipOnTuitionFee": "10%",
        "otherFees": [],
        "currency": "GBP",
        "currencySymbol": "£",
        "offerTime": "2-4 weeks",
        "minimumLevelOfEducation": "A-Levels",
        "minimumGPA": "3.0",
        "language": "English",
        "additionalRequirements": "...",
        "info": "...",
        "tags": ["stem", "technology"],
        "acronym": "BCS",
        "isPrime": false,
        "disabled": false,
        "priority": 1
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "filterData": { ... }
  }
}
```

---

#### `GET /courses/filters`

Get available filter options for the course listing page.

**Response**

```json
{
  "status": "success",
  "data": {
    "degreelevels": ["Bachelor", "Master", "PhD"],
    "categories": ["Technology", "Business"],
    "destinations": ["United Kingdom", "Malaysia"],
    "intakes": ["September 2024"],
    "minFee": 0,
    "maxFee": 50000
  }
}
```

---

#### `GET /courses/search`

Quick course search by keyword.

**Query Parameters**

| Param    | Type   | Required | Description    |
| -------- | ------ | -------- | -------------- |
| `search` | string | Yes      | Search keyword |

**Response** — same shape as `GET /courses`

---

#### `GET /courses/:id`

Get a single course by ID.

**Path Parameters**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Course ID   |

**Response**

```json
{
  "status": "success",
  "data": {
    /* Course object */
  }
}
```

---

### 1.3 Universities

#### `GET /universities`

Get all universities.

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "University of Example",
      "city": "London",
      "country": "United Kingdom",
      "description": "...",
      "type": "Public",
      "averageProcessingTime": "4 weeks",
      "intakes": "September, January",
      "isFeatured": true,
      "logoUrl": "https://..."
    }
  ]
}
```

---

#### `GET /universities/:id`

Get a single university by ID.

**Path Parameters**

| Param | Type   | Description   |
| ----- | ------ | ------------- |
| `id`  | number | University ID |

---

### 1.4 Countries

#### `GET /countries`

Get all countries.

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "United Kingdom",
      "description": "...",
      "averageTuitionFee": 15000,
      "costOfLiving": 12000,
      "intakes": ["September", "January"],
      "localCurrencyCode": "GBP",
      "feeCurrencyCode": "GBP",
      "feeCurrencySymbol": "£",
      "language": "English",
      "population": "67 million",
      "location": "Western Europe"
    }
  ]
}
```

---

#### `GET /countries/:id`

Get a single country by ID.

**Path Parameters**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Country ID  |

---

### 1.5 Events

#### `GET /events`

Get all events with optional filters.

**Query Parameters**

| Param       | Type                  | Description       |
| ----------- | --------------------- | ----------------- |
| `eventType` | `Online` \| `Offline` | Filter by type    |
| `city`      | string                | Filter by city    |
| `country`   | string                | Filter by country |
| `page`      | number                | Page              |
| `limit`     | number                | Limit             |

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "University Fair 2024",
      "description": "...",
      "dateTime": "2024-09-15T10:00:00.000Z",
      "eventType": "Offline",
      "address": "123 Main St",
      "city": "London",
      "country": "United Kingdom",
      "imageLink": "https://...",
      "locationLink": "https://maps.google.com/...",
      "tags": ["fair", "university"],
      "entryConditions": "Open to all"
    }
  ]
}
```

---

#### `GET /events/upcoming`

Get the next upcoming event.

**Response** — single event object

---

#### `GET /events/:id`

Get a single event by ID.

**Path Parameters**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Event ID    |

---

## 2. User Endpoints

These endpoints require **User Authentication** (`Authorization: Bearer <token>`).

---

### 2.1 User Auth

#### `POST /auth/signup`

Register a new student account.

**Request Body**

| Field              | Type   | Required | Constraints                                    |
| ------------------ | ------ | -------- | ---------------------------------------------- |
| `email`            | string | Yes      | Valid email                                    |
| `firstName`        | string | Yes      |                                                |
| `lastName`         | string | Yes      |                                                |
| `country`          | string | Yes      |                                                |
| `countryCode`      | string | Yes      | e.g. `+44`                                     |
| `contact`          | string | Yes      | Phone number                                   |
| `password`         | string | Yes      | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit |
| `referralCodeUsed` | string | No       | Referral code                                  |

**Response**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "studentId": "STU-001",
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "country": "Nigeria",
      "countryCode": "+234",
      "contact": "08012345678",
      "avatarUrl": null,
      "referralCodeUsed": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "session": {
      "access_token": "eyJ...",
      "token_type": "bearer",
      "expires_in": 3600,
      "refresh_token": "..."
    }
  }
}
```

---

#### `POST /auth/login`

Log in with email and password.

**Request Body**

| Field      | Type   | Required |
| ---------- | ------ | -------- |
| `email`    | string | Yes      |
| `password` | string | Yes      |

**Response** — same shape as signup response

---

#### `POST /auth/signout`

**Auth:** Bearer token required

Sign out the current user.

**Response**

```json
{ "status": "success", "data": null }
```

---

#### `GET /auth/me`

**Auth:** Bearer token required

Get the current authenticated user.

**Response**

```json
{
  "status": "success",
  "data": {
    /* User object */
  }
}
```

---

#### `POST /auth/google/verify`

Verify a Google access token. If the user already exists, returns their session. If new, returns Google profile data to complete onboarding via `/auth/google/complete`.

**Request Body**

| Field         | Type   | Required | Description               |
| ------------- | ------ | -------- | ------------------------- |
| `accessToken` | string | Yes      | Google OAuth access token |

**Response — existing user**

```json
{
  "status": "success",
  "data": {
    "requiresOnboarding": false,
    "user": {
      /* User object */
    },
    "session": {
      "access_token": "eyJ..."
    }
  }
}
```

**Response — new user (onboarding required)**

```json
{
  "status": "success",
  "data": {
    "requiresOnboarding": true,
    "googleData": {
      "email": "user@gmail.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatarUrl": "https://..."
    }
  }
}
```

---

#### `POST /auth/google/complete`

**Auth:** Bearer token required

Complete onboarding for a new Google sign-in user. Only needed when `/auth/google/verify` returns `requiresOnboarding: true`.

**Request Body**

| Field              | Type   | Required | Constraints   |
| ------------------ | ------ | -------- | ------------- |
| `firstName`        | string | Yes      | Min 2 chars   |
| `lastName`         | string | Yes      | Min 2 chars   |
| `country`          | string | Yes      | Min 2 chars   |
| `countryCode`      | string | Yes      | e.g. `+44`    |
| `contact`          | string | Yes      | Min 4 digits  |
| `referralCodeUsed` | string | No       | Referral code |

**Response**

```json
{
  "status": "success",
  "data": {
    "user": {
      /* User object */
    }
  }
}
```

---

#### `POST /auth/forgot-password`

Send a password reset email.

**Request Body**

| Field   | Type   | Required |
| ------- | ------ | -------- |
| `email` | string | Yes      |

**Response**

```json
{ "status": "success", "data": { "message": "Reset email sent" } }
```

---

#### `POST /auth/reset-password`

Reset password using a token received via email.

**Request Body**

| Field      | Type   | Required | Constraints                                    |
| ---------- | ------ | -------- | ---------------------------------------------- |
| `token`    | string | Yes      | Token from email link                          |
| `password` | string | Yes      | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit |

**Response**

```json
{ "status": "success", "data": { "message": "Password reset successful" } }
```

---

### 2.2 User Profile

#### `GET /user/me`

**Auth:** Bearer token required

Get the current user's details.

**Response**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "studentId": "STU-001",
    "email": "student@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "country": "Nigeria",
    "countryCode": "+234",
    "contact": "08012345678",
    "avatarUrl": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### `GET /user/details`

**Auth:** Bearer token required

Get the current user's profile including student profile details.

**Response**

```json
{
  "status": "success",
  "data": {
    "user": {
      /* User object */
    },
    "studentProfile": {
      /* StudentProfile object or null */
    }
  }
}
```

---

### 2.3 Student Profile

<!-- #### `GET /student-profiles/me`

**Auth:** Bearer token required

Get the current student's extended profile.

**Response**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "dateOfBirth": "2000-01-01",
    "sex": "Male",
    "nationality": "Nigerian",
    "passportNumber": "A12345678",
    "nationalIdNumber": "NIN123",
    "profilePhotoUrl": "https://...",
    "guardianName": "Jane Doe",
    "guardianContact": "08098765432",
    "guardianCountryCode": "+234",
    "guardianRelation": "Mother",
    "guardianOccupation": "Teacher",
    "highestQualification": "A-Levels",
    "institutionName": "Example School",
    "institutionCity": "Lagos",
    "institutionCountry": "Nigeria",
    "gradesObtained": "A, B, B",
    "preferredDestination": "United Kingdom",
    "preferredIntake": "September 2024",
    "budgetCurrency": "USD",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### `POST /student-profiles/create`

**Auth:** Bearer token required

Create the student's extended profile. All fields are optional.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dateOfBirth` | string (date) | No | `YYYY-MM-DD` format |
| `sex` | string | No | e.g. `Male`, `Female` |
| `nationality` | string | No | |
| `passportNumber` | string | No | |
| `nationalIdNumber` | string | No | |
| `guardianName` | string | No | |
| `guardianContact` | string | No | |
| `guardianCountryCode` | string | No | e.g. `+234` |
| `guardianRelation` | string | No | e.g. `Mother`, `Father` |
| `guardianOccupation` | string | No | |
| `highestQualification` | string | No | |
| `institutionName` | string | No | |
| `institutionCity` | string | No | |
| `institutionCountry` | string | No | |
| `gradesObtained` | string | No | |
| `preferredDestination` | string | No | |
| `preferredIntake` | string | No | |
| `budgetCurrency` | string | No | Default: `USD` |

**Response** — StudentProfile object -->

---

#### `PATCH /student-profiles/update`

**Auth:** Bearer token required

Update the student's extended profile. All fields optional. Also accepts contact-related fields:

| Additional Field   | Type   | Description        |
| ------------------ | ------ | ------------------ |
| `countryCode`      | string | Phone country code |
| `contact`          | string | Phone number       |
| `referralCodeUsed` | string | Referral code      |

**Response** — Updated StudentProfile object

---

### 2.4 User Documents

#### `GET /user/documents`

**Auth:** Bearer token required

Get all documents uploaded by the current user.

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "applicationId": "uuid",
      "documentType": "passport",
      "documentUrl": "https://...",
      "filename": "passport.pdf",
      "filesize": 204800,
      "mimeType": "application/pdf",
      "verified": false,
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /user/documents`

**Auth:** Bearer token required
**Content-Type:** `multipart/form-data`

Upload user documents.

**Form Fields**

| Field          | Type   | Required | Constraints                                                                                                                                    |
| -------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `documentType` | string | Yes      | One of: `passport`, `national_id`, `o_level`, `a_level`, `diploma`, `bachelor_degree_certificate`, `bachelor_degree_transcripts`, `other` |
| `files`        | file[] | Yes      | Max 10 files per request (same `documentType`), 5MB each, allowed: pdf, jpg, jpeg, png, webp                                                  |

**Response**

```json
{
  "status": "success",
  "data": { "message": "Documents uploaded successfully" }
}
```

---

### 2.5 Applications

#### `GET /applications`

**Auth:** Bearer token required

Get all applications for the current student.

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "universityId": 10,
      "courseId": 5,
      "status": "created",
      "feeCurrency": "USD",
      "receiptUrl": null,
      "eligibilityStatus": "pending",
      "isPartiallyRegistered": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "submittedAt": null,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "course": {
        /* Course object */
      },
      "university": {
        /* University object */
      }
    }
  ]
}
```

---

#### `GET /applications/by-ids`

**Auth:** Bearer token required

Get specific applications by IDs.

**Query Parameters**

| Param | Type   | Required | Description                       |
| ----- | ------ | -------- | --------------------------------- |
| `ids` | string | Yes      | Comma-separated application UUIDs |

---

#### `POST /applications/create`

**Auth:** Bearer token required

Create a new application.

**Request Body**

| Field      | Type   | Required | Description                  |
| ---------- | ------ | -------- | ---------------------------- |
| `courseId` | number | Yes      | ID of the course to apply to |

**Response**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "courseId": 5,
    "universityId": 10,
    "status": "created",
    "eligibilityStatus": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### `DELETE /applications/:id`

**Auth:** Bearer token required

Delete an application (only allowed for owned applications).

**Path Parameters**

| Param | Type          | Description    |
| ----- | ------------- | -------------- |
| `id`  | string (UUID) | Application ID |

**Response**

```json
{ "status": "success", "data": { "message": "Application deleted" } }
```

---

### 2.6 Payments

#### `POST /payments/application-fees`

**Auth:** Bearer token required

Initiate payment for application fees (creates a Stripe checkout session or handles zero-fee applications).

**Request Body**

| Field           | Type          | Required | Description                                       |
| --------------- | ------------- | -------- | ------------------------------------------------- |
| `applicationId` | string (UUID) | Yes      | Application to pay for                            |
| `paymentType`   | string        | Yes      | Fee type — see [FeeTypeEnum](#10-enums-reference) |
| `paymentMethod` | string        | Yes      | See [PaymentMethodEnum](#10-enums-reference)      |

**Response**

```json
{
  "status": "success",
  "data": {
    "checkout_url": "https://checkout.stripe.com/...",
    "zero_fee": false,
    "application_id": "uuid"
  }
}
```

> If the fee is zero, `checkout_url` will be null and `zero_fee` will be `true`.

---

#### `POST /payments/custom-payment`

**Auth:** Bearer token required

Pay a custom amount for a specific fee type.

**Request Body**

| Field           | Type          | Required | Description                                  |
| --------------- | ------------- | -------- | -------------------------------------------- |
| `applicationId` | string (UUID) | Yes      |                                              |
| `feeType`       | string        | Yes      | See [FeeTypeEnum](#10-enums-reference)       |
| `amount`        | number        | Yes      | Amount to pay                                |
| `paymentMethod` | string        | Yes      | See [PaymentMethodEnum](#10-enums-reference) |

---

#### `GET /payments/history`

**Auth:** Bearer token required

Get payment history for the current student.

**Query Parameters** — standard pagination (`page`, `limit`)

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "applicationId": "uuid",
      "amount": "500.00",
      "currency": "USD",
      "paymentMethod": "credit_debit_card",
      "paymentType": "application_fee",
      "status": "completed",
      "paymentDate": "2024-01-01T00:00:00.000Z",
      "application": {
        /* Application object */
      },
      "course": {
        /* Course object */
      }
    }
  ]
}
```

---

### 2.7 Student Notifications

#### `GET /notifications`

**Auth:** Bearer token required

Get all notifications for the current user.

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "recipientType": "student",
      "recipientUserId": "uuid",
      "type": "application.status_changed",
      "title": "Application Status Updated",
      "body": "Your application status has changed to Under Review.",
      "applicationId": "uuid",
      "metadata": {},
      "isRead": false,
      "readAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Notification Types**

| Type | Description |
| ----------------------------------------- | ----------------------------------------- |
| `application.created` | New application was created |
| `application.status_changed` | Application status was updated |
| `application.eligibility_updated` | Eligibility status changed |
| `application.offer_letter_uploaded` | Offer letter is available |
| `application.document_uploaded` | A document was uploaded to the application |
| `payment.confirmed` | Payment was confirmed |
| `payment.submitted` | Payment was submitted |
| `payment.created` | A new payment record was created |
| `broadcast` | General broadcast message |

---

#### `GET /notifications/unread-count`

**Auth:** Bearer token required

Get the count of unread notifications.

**Response**

```json
{ "status": "success", "data": { "count": 5 } }
```

---

#### `PATCH /notifications/:id/read`

**Auth:** Bearer token required

Mark a specific notification as read.

**Path Parameters**

| Param | Type          | Description     |
| ----- | ------------- | --------------- |
| `id`  | string (UUID) | Notification ID |

**Response**

```json
{ "status": "success" }
```

---

#### `PATCH /notifications/read-all`

**Auth:** Bearer token required

Mark all notifications as read for the current user.

**Response**

```json
{ "status": "success" }
```

---

### 2.8 Realtime Subscriptions (Supabase)

Notifications are pushed in real time via Supabase Realtime. Subscribe to the relevant channel and refetch from the REST endpoint on each event.

#### Student Channels

**Individual notifications**

```js
supabase
  .channel(`notifications:student:${userId}`)
  .on('broadcast', { event: 'new_notification' }, () => {
    // refetch GET /notifications
  })
  .subscribe()
```

**Broadcast notifications**

```js
supabase
  .channel('notifications:broadcast:students')
  .on('broadcast', { event: 'new_notification' }, () => {
    // refetch GET /notifications
  })
  .subscribe()
```

#### Admin Channels

**Individual notifications**

```js
supabase
  .channel(`notifications:admin:${adminId}`)
  .on('broadcast', { event: 'new_notification' }, () => {
    // refetch GET /admin/notifications
  })
  .subscribe()
```

**Broadcast notifications**

```js
supabase
  .channel('notifications:broadcast:admins')
  .on('broadcast', { event: 'new_notification' }, () => {
    // refetch GET /admin/notifications
  })
  .subscribe()
```

---

## 3. Event Registrations

#### `POST /event-registrations`

Register for an event. No auth required.

**Request Body**

| Field            | Type   | Required |
| ---------------- | ------ | -------- |
| `eventId`        | number | Yes      |
| `firstName`      | string | Yes      |
| `lastName`       | string | Yes      |
| `email`          | string | Yes      |
| `city`           | string | Yes      |
| `country`        | string | Yes      |
| `countryCode`    | string | Yes      |
| `contact`        | string | Yes      |
| `parentFullName` | string | No       |
| `parentContact`  | string | No       |

**Response**

```json
{ "status": "success", "data": { "message": "Registered successfully" } }
```

---

#### `GET /event-registrations/all`

**Auth:** Bearer token required (admin)

Get all event registrations.

---

#### `GET /event-registrations/registration/:eventId`

**Auth:** Bearer token required (admin)

Get registrations for a specific event.

**Path Parameters**

| Param     | Type   | Description |
| --------- | ------ | ----------- |
| `eventId` | number | Event ID    |

---

## 4. Admin Endpoints

These endpoints require **Admin Authentication** (`Authorization: Bearer <admin-token>`).

---

### 4.1 Admin Auth

#### `POST /admin/auth/signup`

Create a new admin account.

**Request Body**

| Field       | Type   | Required |
| ----------- | ------ | -------- |
| `email`     | string | Yes      |
| `password`  | string | Yes      |
| `firstName` | string | Yes      |
| `lastName`  | string | Yes      |

**Response**

```json
{
  "status": "success",
  "data": {
    "admin": {
      "id": "uuid",
      "email": "admin@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "admin"
    },
    "session": {
      "access_token": "eyJ...",
      "token_type": "bearer",
      "expires_in": 3600,
      "refresh_token": "..."
    }
  }
}
```

---

#### `POST /admin/auth/signin`

Sign in as an admin. Pass `invitationId` to simultaneously accept a pending invitation.

**Request Body**

| Field          | Type   | Required | Description                              |
| -------------- | ------ | -------- | ---------------------------------------- |
| `email`        | string | Yes      |                                          |
| `password`     | string | Yes      |                                          |
| `invitationId` | string | No       | Accept a pending invitation on sign-in   |

**Response** — same shape as signup response

---

#### `POST /admin/auth/sign-out`

Sign out the current admin.

**Response**

```json
{ "status": "success" }
```

---

#### `GET /admin/auth/session`

**Auth:** Admin token required

Get the current admin session.

**Response**

```json
{ "status": "success", "data": { /* Admin object */ } }
```

---

#### `POST /admin/auth/forgot-password`

Send a password reset email to an admin.

**Request Body**

| Field   | Type   | Required |
| ------- | ------ | -------- |
| `email` | string | Yes      |

**Response**

```json
{ "status": "success" }
```

---

#### `POST /admin/auth/reset-password`

Reset an admin password using the token received via email.

**Request Body**

| Field      | Type   | Required |
| ---------- | ------ | -------- |
| `token`    | string | Yes      |
| `password` | string | Yes      |

**Response**

```json
{ "status": "success" }
```

---

### 4.2 Admin Students

#### `GET /admin/students/all`

**Auth:** Admin token required

Get all students with optional pagination and search.

**Query Parameters** — standard pagination (`page`, `limit`) and optional `search`

**Response**

```json
{ "status": "success", "data": [ /* Array of Student objects */ ] }
```

---

#### `GET /admin/students/:id`

**Auth:** Admin token required

Get full details for a single student.

**Path Parameters**

| Param | Type          | Description |
| ----- | ------------- | ----------- |
| `id`  | string (UUID) | Student ID  |

**Response**

```json
{ "status": "success", "data": { /* Student object */ } }
```

---

#### `POST /admin/students/create`

**Auth:** Admin token required

Create a new student account.

**Request Body**

| Field              | Type   | Required | Constraints                                    |
| ------------------ | ------ | -------- | ---------------------------------------------- |
| `email`            | string | Yes      | Valid email                                    |
| `firstName`        | string | Yes      | Min 2 chars                                    |
| `lastName`         | string | Yes      | Min 2 chars                                    |
| `country`          | string | Yes      | Min 2 chars                                    |
| `countryCode`      | string | Yes      | e.g. `+44`                                     |
| `contact`          | string | Yes      | Min 4 digits                                   |
| `password`         | string | Yes      | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit |
| `referralCodeUsed` | string | No       |                                                |

**Response** — Created Student object

---

#### `PATCH /admin/students/update/:id`

**Auth:** Admin token required

Update a student's profile. All fields optional.

**Path Parameters**

| Param | Type          | Description |
| ----- | ------------- | ----------- |
| `id`  | string (UUID) | Student ID  |

**Request Body** — same fields as [`PATCH /student-profiles/update`](#23-student-profile), plus:

| Additional Field | Type   | Description        |
| ---------------- | ------ | ------------------ |
| `firstName`      | string |                    |
| `lastName`       | string |                    |
| `contact`        | string | Phone number       |
| `countryCode`    | string | Phone country code |

**Response** — Updated Student object

---

#### `GET /admin/students/:id/documents`

**Auth:** Admin token required

Get all documents for a student.

**Path Parameters**

| Param | Type          | Description |
| ----- | ------------- | ----------- |
| `id`  | string (UUID) | Student ID  |

**Response** — Array of Document objects (same shape as [`GET /user/documents`](#24-user-documents))

---

#### `POST /admin/students/:id/documents`

**Auth:** `CAN_UPLOAD_STUDENT_DOCUMENTS`
**Content-Type:** `multipart/form-data`

Upload documents for a student.

**Path Parameters**

| Param | Type          | Description |
| ----- | ------------- | ----------- |
| `id`  | string (UUID) | Student ID  |

**Form Fields**

| Field   | Type   | Required | Constraints                                                |
| ------- | ------ | -------- | ---------------------------------------------------------- |
| `files` | file[] | Yes      | Max 10 files, 5 MB each, allowed: pdf, jpg, jpeg, png, webp |

**Response** — Array of uploaded Document objects

---

#### `DELETE /admin/students/:id/documents/:documentId`

**Auth:** `CAN_DELETE_STUDENT_DOCUMENTS`

**Path Parameters**

| Param        | Type          | Description |
| ------------ | ------------- | ----------- |
| `id`         | string (UUID) | Student ID  |
| `documentId` | string (UUID) | Document ID |

**Response**

```json
{ "status": "success" }
```

---

#### `PATCH /admin/students/:id/referrer`

**Auth:** `CAN_UPDATE_REFERRAL`

Assign or update the referrer for a student.

**Path Parameters**

| Param | Type          | Description |
| ----- | ------------- | ----------- |
| `id`  | string (UUID) | Student ID  |

**Request Body**

| Field        | Type   | Required | Description       |
| ------------ | ------ | -------- | ----------------- |
| `referrerId` | string | Yes      | Admin member UUID |

**Response** — Updated Student object

---

#### `POST /admin/students/:id/send-email`

**Auth:** `CAN_SEND_EMAIL`

Send a custom email to a student.

**Path Parameters**

| Param | Type          | Description |
| ----- | ------------- | ----------- |
| `id`  | string (UUID) | Student ID  |

**Request Body**

| Field     | Type   | Required |
| --------- | ------ | -------- |
| `subject` | string | Yes      |
| `body`    | string | Yes      |

**Response**

```json
{ "status": "success" }
```

---

#### `GET /admin/students/:studentId/activity`

**Auth:** `CAN_VIEW_ACTIVITY_LOGS`

Get the audit log for a student.

**Path Parameters**

| Param       | Type          | Description |
| ----------- | ------------- | ----------- |
| `studentId` | string (UUID) | Student ID  |

**Response**

```json
{ "status": "success", "data": [ /* Array of AuditLog entries */ ] }
```

---

### 4.3 Admin Applications

#### `GET /admin/applications/all`

**Auth:** `CAN_VIEW_APPLICATIONS`

Get all applications with optional filters and pagination.

**Query Parameters** — standard pagination (`page`, `limit`) and optional filters (`search`, `status`)

**Response**

```json
{ "status": "success", "data": [ /* Array of Application objects */ ] }
```

---

#### `GET /admin/applications/:id/details`

**Auth:** Admin token required

Get full details for a single application, including student, course, university, documents, and payments.

**Path Parameters**

| Param | Type          | Description    |
| ----- | ------------- | -------------- |
| `id`  | string (UUID) | Application ID |

**Response**

```json
{ "status": "success", "data": { /* Application object */ } }
```

---

#### `POST /admin/applications/create-application`

**Auth:** Admin token required

Create an application on behalf of a student.

**Request Body**

| Field      | Type   | Required | Description  |
| ---------- | ------ | -------- | ------------ |
| `userId`   | string | Yes      | Student UUID |
| `courseId` | number | Yes      | Course ID    |

**Response** — Created Application object

---

#### `PATCH /admin/applications/update/:id`

**Auth:** `CAN_UPDATE_APPLICATION_STATUS`

Update application status.

**Path Parameters**

| Param | Type          | Description    |
| ----- | ------------- | -------------- |
| `id`  | string (UUID) | Application ID |

**Request Body**

| Field    | Type   | Required | Allowed values |
| -------- | ------ | -------- | -------------- |
| `status` | string | Yes      | `created` `applied` `under_review` `documents_required` `submitted_to_university` `offer_received` `offer_accepted` `registration_pending` `registered` `visa_processing` `visa_approved` `enrollment_ready` `reported` `rejected` `withdrawn` `deferred` |

**Response** — Updated Application object

---

#### `DELETE /admin/applications/:id`

**Auth:** `CAN_UPDATE_APPLICATION_STATUS`

**Path Parameters**

| Param | Type          | Description    |
| ----- | ------------- | -------------- |
| `id`  | string (UUID) | Application ID |

**Response**

```json
{ "status": "success" }
```

---

#### `GET /admin/applications/:applicationId/payments`

**Auth:** `CAN_VIEW_APPLICATION_PAYMENTS`

**Path Parameters**

| Param           | Type          | Description    |
| --------------- | ------------- | -------------- |
| `applicationId` | string (UUID) | Application ID |

**Response** — Array of Payment objects

---

#### `GET /admin/applications/:applicationId/documents`

**Auth:** Admin token required

**Path Parameters**

| Param           | Type          | Description    |
| --------------- | ------------- | -------------- |
| `applicationId` | string (UUID) | Application ID |

**Response** — Array of Document objects

---

#### `POST /admin/applications/:applicationId/documents`

**Auth:** `CAN_MANAGE_APPLICATION_DOCUMENTS`
**Content-Type:** `multipart/form-data`

**Path Parameters**

| Param           | Type          | Description    |
| --------------- | ------------- | -------------- |
| `applicationId` | string (UUID) | Application ID |

**Form Fields**

| Field  | Type | Required | Constraints           |
| ------ | ---- | -------- | --------------------- |
| `file` | file | Yes      | Single file, max 5 MB |

**Response** — Created Document object

---

#### `DELETE /admin/applications/:applicationId/documents/:documentId`

**Auth:** `CAN_DELETE_APPLICATION_DOCUMENTS`

**Path Parameters**

| Param           | Type          | Description    |
| --------------- | ------------- | -------------- |
| `applicationId` | string (UUID) | Application ID |
| `documentId`    | string (UUID) | Document ID    |

**Response**

```json
{ "status": "success" }
```

---

#### `PATCH /admin/applications/:id/eligibility`

**Auth:** `CAN_MANAGE_ELIGIBILITY`

Update the eligibility status of an application.

**Path Parameters**

| Param | Type          | Description    |
| ----- | ------------- | -------------- |
| `id`  | string (UUID) | Application ID |

**Request Body**

| Field    | Type   | Required | Allowed values                       |
| -------- | ------ | -------- | ------------------------------------ |
| `status` | string | Yes      | `pending` `eligible` `not_eligible`  |

**Response** — Updated Application object

---

#### `POST /admin/applications/:id/offer-letter/upload`

**Auth:** `CAN_MANAGE_ELIGIBILITY`
**Content-Type:** `multipart/form-data`

**Path Parameters**

| Param | Type          | Description    |
| ----- | ------------- | -------------- |
| `id`  | string (UUID) | Application ID |

**Form Fields**

| Field  | Type | Required | Constraints           |
| ------ | ---- | -------- | --------------------- |
| `file` | file | Yes      | Single file, max 5 MB |

**Response** — Uploaded Document object

---

#### `PATCH /admin/applications/:id/partial-registration`

**Auth:** `CAN_MANAGE_PARTIAL_REGISTRATION`

**Path Parameters**

| Param | Type          | Description    |
| ----- | ------------- | -------------- |
| `id`  | string (UUID) | Application ID |

**Request Body**

| Field                   | Type              | Required | Description                                       |
| ----------------------- | ----------------- | -------- | ------------------------------------------------- |
| `isPartiallyRegistered` | boolean \| `null` | Yes      | `appManager` can only set `true` or `null`        |

**Response** — Updated Application object

---

#### `POST /admin/applications/:id/send-email`

**Auth:** `CAN_SEND_EMAIL`

**Path Parameters**

| Param | Type          | Description    |
| ----- | ------------- | -------------- |
| `id`  | string (UUID) | Application ID |

**Request Body**

| Field     | Type   | Required |
| --------- | ------ | -------- |
| `subject` | string | Yes      |
| `body`    | string | Yes      |

**Response**

```json
{ "status": "success" }
```

---

#### `GET /admin/applications/:applicationId/activity`

**Auth:** `CAN_VIEW_ACTIVITY_LOGS`

**Path Parameters**

| Param           | Type          | Description    |
| --------------- | ------------- | -------------- |
| `applicationId` | string (UUID) | Application ID |

**Response** — Array of AuditLog entries

---

#### `GET /admin/applications/:applicationId/notes`

**Auth:** Admin token required

**Path Parameters**

| Param           | Type          | Description    |
| --------------- | ------------- | -------------- |
| `applicationId` | string (UUID) | Application ID |

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "applicationId": "uuid",
      "adminId": "uuid",
      "content": "Student confirmed intake preference.",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /admin/applications/:applicationId/notes`

**Auth:** Admin token required

**Path Parameters**

| Param           | Type          | Description    |
| --------------- | ------------- | -------------- |
| `applicationId` | string (UUID) | Application ID |

**Request Body**

| Field     | Type   | Required |
| --------- | ------ | -------- |
| `content` | string | Yes      |

**Response** — Created Note object

---

#### `PATCH /admin/applications/:applicationId/notes/:noteId`

**Auth:** Admin token required

**Path Parameters**

| Param           | Type          | Description    |
| --------------- | ------------- | -------------- |
| `applicationId` | string (UUID) | Application ID |
| `noteId`        | string (UUID) | Note ID        |

**Request Body**

| Field     | Type   | Required |
| --------- | ------ | -------- |
| `content` | string | Yes      |

**Response** — Updated Note object

---

#### `DELETE /admin/applications/:applicationId/notes/:noteId`

**Auth:** Admin token required

**Path Parameters**

| Param           | Type          | Description    |
| --------------- | ------------- | -------------- |
| `applicationId` | string (UUID) | Application ID |
| `noteId`        | string (UUID) | Note ID        |

**Response**

```json
{ "status": "success" }
```

---

### 4.4 Admin Payments

#### `POST /admin/payments/create`

**Auth:** `admin` or `appManager` role

Manually record a payment for an application.

**Request Body**

| Field              | Type   | Required | Description                                          |
| ------------------ | ------ | -------- | ---------------------------------------------------- |
| `userId`           | string | Yes      | Student UUID                                         |
| `applicationId`    | string | Yes      | Application UUID                                     |
| `amount`           | string | Yes      | Positive number as string                            |
| `currency`         | string | Yes      | 3-char code (default: `USD`)                         |
| `paymentMethod`    | string | Yes      | `credit_debit_card` `bank_transfer` `cash` `other`   |
| `paymentType`      | string | Yes      | Fee type enum value                                  |
| `paymentDate`      | string | Yes      | Valid date string                                    |
| `amountSent`       | string | No       |                                                      |
| `status`           | string | No       | Default: `pending`                                   |
| `recipientInfo`    | string | No       |                                                      |
| `paymentReference` | string | No       |                                                      |
| `transactionId`    | string | No       |                                                      |
| `remarks`          | string | No       |                                                      |
| `adminNotes`       | string | No       |                                                      |

**Response** — Created Payment object

---

#### `POST /admin/payments/confirm`

**Auth:** `admin` role

Confirm or reject a pending payment.

**Request Body**

| Field       | Type   | Required | Description               |
| ----------- | ------ | -------- | ------------------------- |
| `paymentId` | string | Yes      | Payment UUID              |
| `status`    | string | Yes      | `completed` or `failed`   |

**Response** — Updated Payment object

---

#### `PUT /admin/payments/:paymentId`

**Auth:** `admin` or `appManager` role

Update a payment record.

**Path Parameters**

| Param       | Type          | Description |
| ----------- | ------------- | ----------- |
| `paymentId` | string (UUID) | Payment ID  |

**Request Body** — same optional fields as create

**Response** — Updated Payment object

---

#### `DELETE /admin/payments/:paymentId`

**Auth:** `admin` role

**Path Parameters**

| Param       | Type          | Description |
| ----------- | ------------- | ----------- |
| `paymentId` | string (UUID) | Payment ID  |

**Response**

```json
{ "status": "success" }
```

---

### 4.5 Admin Members

#### `GET /admin/members`

**Auth:** `admin` or `appManager` role

Get all admin members.

**Query Parameters**

| Param    | Type   | Description             |
| -------- | ------ | ----------------------- |
| `role`   | string | Filter by role          |
| `status` | string | Filter by status        |
| `search` | string | Search by name or email |

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "email": "member@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "counsellor",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /admin/members/options`

**Auth:** `admin` or `appManager` role

Get member list formatted for dropdown options (e.g. when assigning a referrer).

**Response** — Array of `{ id, name }` objects

---

#### `GET /admin/members/sub-agents`

**Auth:** `admin`, `appManager`, `agent`, or `counsellor` role

Get sub-agents under the current admin member.

**Response** — Array of Member objects

---

#### `GET /admin/partner-requests`

**Auth:** `admin` role

Get all pending partner requests with pagination.

**Query Parameters** — standard pagination (`page`, `limit`)

**Response** — Array of PartnerRequest objects

---

#### `DELETE /admin/partner-requests/:id`

**Auth:** `admin` role

**Path Parameters**

| Param | Type          | Description        |
| ----- | ------------- | ------------------ |
| `id`  | string (UUID) | Partner Request ID |

**Response**

```json
{ "status": "success" }
```

---

#### `DELETE /admin/members/:id`

**Auth:** `CAN_MANAGE_MEMBERS`

**Path Parameters**

| Param | Type          | Description |
| ----- | ------------- | ----------- |
| `id`  | string (UUID) | Member ID   |

**Response**

```json
{ "status": "success" }
```

---

#### `PATCH /admin/members/:id/parent`

**Auth:** `admin` role

Reassign a member's hierarchical parent.

**Path Parameters**

| Param | Type          | Description |
| ----- | ------------- | ----------- |
| `id`  | string (UUID) | Member ID   |

**Request Body**

| Field      | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| `parentId` | string | Yes      | New parent member UUID |

**Response** — Updated Member object

---

### 4.6 Admin Invitations

#### `POST /admin/invitation/send`

**Auth:** `admin` role

Send an invitation email to a new admin member.

**Request Body**

| Field   | Type   | Required | Description                  |
| ------- | ------ | -------- | ---------------------------- |
| `email` | string | Yes      | Recipient email              |
| `role`  | string | Yes      | Role to assign on acceptance |

**Response** — Created Invitation object

---

#### `POST /admin/invitation/accept`

Retrieve invitation details by ID.

> Invitation acceptance is completed during sign-in by passing `invitationId` to `POST /admin/auth/signin`.

**Request Body**

| Field          | Type   | Required |
| -------------- | ------ | -------- |
| `invitationId` | string | Yes      |

**Response** — Invitation details object

---

#### `GET /admin/invitation/pending`

**Auth:** `admin` role

Get all pending invitations.

**Query Parameters** — standard pagination (`page`, `limit`)

**Response** — Array of Invitation objects

---

#### `DELETE /admin/invitation/:id`

**Auth:** `admin` role

Cancel a pending invitation.

**Path Parameters**

| Param | Type          | Description   |
| ----- | ------------- | ------------- |
| `id`  | string (UUID) | Invitation ID |

**Response**

```json
{ "status": "success" }
```

---

### 4.7 Admin Notifications

#### `GET /admin/notifications`

**Auth:** Admin token required

Get all notifications for the current admin.

**Response**

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "recipientType": "admin",
      "recipientAdminId": "uuid",
      "type": "admin.application.created",
      "title": "New Application",
      "body": "A new application has been submitted.",
      "applicationId": "uuid",
      "metadata": {},
      "isRead": false,
      "readAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Notification Types**

| Type | Description |
| ---------------------------------------- | ------------------------------------ |
| `admin.student.registered` | A new student registered |
| `admin.application.created` | A new application was submitted |
| `admin.application.status_changed` | An application status changed |
| `admin.payment.submitted` | A student submitted a payment |
| `admin.document.uploaded` | A student uploaded a document |
| `admin.note.created` | A note was added to an application |
| `broadcast` | General broadcast message |

---

#### `GET /admin/notifications/unread-count`

**Auth:** Admin token required

**Response**

```json
{ "status": "success", "data": { "count": 3 } }
```

---

#### `PATCH /admin/notifications/:id/read`

**Auth:** Admin token required

**Path Parameters**

| Param | Type          | Description     |
| ----- | ------------- | --------------- |
| `id`  | string (UUID) | Notification ID |

**Response**

```json
{ "status": "success" }
```

---

#### `PATCH /admin/notifications/read-all`

**Auth:** Admin token required

Mark all admin notifications as read.

**Response**

```json
{ "status": "success" }
```

---

## 5. Permission Matrix

**Roles**

| Role         | Description                                                     |
| ------------ | --------------------------------------------------------------- |
| `admin`      | Full access — manages members, invitations, and all resources   |
| `appManager` | Manages applications, students, and payments                    |
| `counsellor` | Views/creates applications and students; uploads/deletes student documents |
| `agent`      | Views/creates applications and students; uploads student documents |
| `university` | Views/creates applications and students; manages eligibility    |

**Permission Groups**

| Permission                             | admin | appManager | counsellor | agent | university |
| -------------------------------------- | :---: | :--------: | :--------: | :---: | :--------: |
| `CAN_VIEW_APPLICATIONS`                |   ✓   |     ✓      |     ✓      |   ✓   |     ✓      |
| `CAN_VIEW_APPLICATION_PAYMENTS`        |   ✓   |     ✓      |     ✓      |   ✓   |            |
| `CAN_UPDATE_APPLICATION_STATUS`        |   ✓   |     ✓      |            |       |            |
| `CAN_MANAGE_PARTIAL_REGISTRATION`      |   ✓   |     ✓      |            |       |            |
| `CAN_MANAGE_ELIGIBILITY`               |   ✓   |     ✓      |            |       |     ✓      |
| `CAN_UPDATE_REFERRAL`                  |   ✓   |     ✓      |            |       |            |
| `CAN_UPLOAD_STUDENT_DOCUMENTS`         |   ✓   |     ✓      |     ✓      |   ✓   |            |
| `CAN_DELETE_STUDENT_DOCUMENTS`         |   ✓   |     ✓      |     ✓      |       |            |
| `CAN_MANAGE_APPLICATION_DOCUMENTS`     |   ✓   |     ✓      |     ✓      |       |            |
| `CAN_DELETE_APPLICATION_DOCUMENTS`     |   ✓   |     ✓      |            |       |            |
| `CAN_MANAGE_CONTENT`                   |   ✓   |     ✓      |            |       |            |
| `CAN_SEND_EMAIL`                       |   ✓   |     ✓      |            |       |            |
| `CAN_VIEW_ACTIVITY_LOGS`               |   ✓   |            |            |       |            |
| `CAN_MANAGE_MEMBERS`                   |   ✓   |            |            |       |            |
| `CAN_OVERRIDE_REFERRAL`                |   ✓   |            |            |       |            |

---
