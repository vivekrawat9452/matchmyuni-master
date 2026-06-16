# Shortlist API — Student

Base URL prefix: `/api/user/shortlist`

All endpoints require **student authentication** (`Authorization: Bearer <supabase-jwt>`).

---

## GET `/api/user/shortlist`

Returns all courses the authenticated student has shortlisted, ordered by most recently added.

### Response `200`

```json
{
  "status": "success",
  "data": [
    {
      "shortlistId": 15,
      "addedAt": "2025-05-10T14:30:00.000Z",
      "addedBy": null,
      "notes": null,
      "id": 1,
      "name": "BSc Computer Science",
      "universityId": 5,
      "universityName": "MIT WPU",
      "universityLogo": "https://cdn.example.com/logos/mitwpu.png",
      "degreeLevel": "Bachelor",
      "country": "India",
      "city": "Pune",
      "duration": 3,
      "category": "Engineering",
      "applicableTuitionFee": 8400,
      "applicationFee": 0,
      "depositFee": 0,
      "registrationFee": 500,
      "scholarshipAvailable": true,
      "scholarshipType": "flat_automatic",
      "scholarshipDetails": {
        "percentageMin": 50,
        "percentageMax": 50,
        "description": "50% scholarship for all international students",
        "appliesTo": "tuition_only",
        "validForYears": "all_years",
        "renewalCondition": null
      },
      "currency": "USD",
      "currencySymbol": "$",
      "isPrime": true,
      "upcomingIntakes": [
        {
          "id": 12,
          "month": 9,
          "year": 2025,
          "season": "fall",
          "label": "Fall 2025",
          "status": "open",
          "applicationDeadline": "2025-08-15"
        },
        {
          "id": 18,
          "month": 2,
          "year": 2026,
          "season": "spring",
          "label": "Spring 2026",
          "status": "yet_to_open",
          "applicationDeadline": "2026-01-20"
        },
        {
          "id": 24,
          "month": 9,
          "year": 2026,
          "season": "fall",
          "label": "Fall 2026",
          "status": "yet_to_open",
          "applicationDeadline": "2026-08-15"
        }
      ]
    }
  ]
}
```

**Field notes:**

- `shortlistId` — ID of the shortlist record, not the course ID.
- `addedBy` — `null` when the student added the course themselves. Non-null contains the admin/counsellor ID when added on the student's behalf.
- `notes` — Optional notes attached by an admin/counsellor. `null` for student-added entries.
- `upcomingIntakes` — Up to 3 next upcoming intakes with status `yet_to_open` or `open` and a future month/year, ordered by year/month ascending. Returns `[]` if none exist. Same summary shape as the course listing (no `statusNote`, `documentDeadline`, `startDate`, `applicationsCount`, `maxCapacity`).
- Course fields are identical in shape to the `GET /api/courses` listing response.

### Error Responses

| Status | Description |
|--------|-------------|
| `401` | Missing or invalid auth token |

---

## POST `/api/user/shortlist`

Adds a course to the authenticated student's shortlist.

### Request Body

```json
{
  "courseId": 1
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `courseId` | number | Yes | Positive integer |

### Response `201`

```json
{
  "status": "success",
  "message": "Course added to shortlist",
  "data": {
    "id": 15,
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "courseId": 1,
    "addedBy": null,
    "notes": null,
    "createdAt": "2025-05-10T14:30:00.000Z"
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400` | `courseId` is missing or not a positive integer |
| `401` | Missing or invalid auth token |
| `404` | Course not found or is disabled |
| `409` | Course is already in the student's shortlist |

---

## DELETE `/api/user/shortlist/:courseId`

Removes a course from the authenticated student's shortlist.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | number | ID of the course to remove |

### Response `200`

```json
{
  "status": "success",
  "message": "Course removed from shortlist"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400` | `courseId` is not a valid number |
| `401` | Missing or invalid auth token |
| `404` | Course not found in the student's shortlist |
