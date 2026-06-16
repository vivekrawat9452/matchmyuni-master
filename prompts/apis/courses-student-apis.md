# Courses API — Student / Public

Base URL prefix: `/api/courses`

All endpoints are **public** (no authentication required).

---

## GET `/api/courses`

Returns a paginated, filtered list of courses. Disabled courses and courses belonging to disabled universities are excluded by default.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `12` | Items per page |
| `search` | string | — | Full-text search across course name, university name, and `search` column |
| `degree_level` | string | — | Comma-separated degree levels: `Bachelor,Master` |
| `duration` | string | — | Comma-separated durations in years: `1,2,3` |
| `category` | string | — | Comma-separated course categories |
| `destination` | string | — | Comma-separated country names |
| `university_name` | string | — | Partial match on university name |
| `university_id` | string | — | Comma-separated university IDs |
| `min_fee` | number | — | Minimum applicable tuition fee |
| `max_fee` | number | — | Maximum applicable tuition fee |
| `intake_month` | string | — | Month number `1–12`. Must be combined with `intake_year` |
| `intake_year` | string | — | 4-digit year. Must be combined with `intake_month` |
| `season` | string | — | `fall \| spring \| summer` |
| `is_prime` | string | — | `true` to return only prime courses |
| `sort_by` | string | — | Column name to sort by |
| `sort_order` | string | `asc` | `asc \| desc` |
| `randomize` | string | — | `true` to randomize order (ignored when `sort_by` is provided) |
| `include_disabled` | string | — | `true` to include disabled courses and disabled university courses |

### Response `200`

```json
{
  "status": "success",
  "data": {
    "data": [
      {
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
    ],
    "currentPage": 1,
    "itemsPerPage": 12,
    "totalItems": 170,
    "totalPages": 15
  }
}
```

**Field notes:**

- `upcomingIntakes` — Up to 3 next upcoming intakes for this course. Only intakes with status `yet_to_open` or `open` and a future month/year are included, ordered by year and month ascending. Returns `[]` if none exist.
- `scholarshipDetails` — `null` when `scholarshipAvailable` is `false`.
- `effectiveTuitionFee` is not returned in the listing; compute it on the frontend using `applicableTuitionFee` and `scholarshipDetails.percentageMin/Max`.

---

## GET `/api/courses/filters`

Returns available filter options for the course listing UI. Results are cached in-memory for 4 hours.

### Response `200`

```json
{
  "status": "success",
  "data": {
    "countries": [
      { "label": "India", "value": "India" },
      { "label": "United Kingdom", "value": "United Kingdom" }
    ],
    "degree_levels": [
      { "label": "Bachelor", "value": "Bachelor" },
      { "label": "Master", "value": "Master" }
    ],
    "categories": [
      { "label": "Engineering", "value": "Engineering" },
      { "label": "Business", "value": "Business" }
    ],
    "durations": [
      { "label": "1 Year", "value": "1" },
      { "label": "3 Years", "value": "3" }
    ],
    "universities": [
      { "label": "MIT WPU", "value": 5 },
      { "label": "University of London", "value": 42 }
    ],
    "fees": [
      { "value": "0-2500", "label": "$0 - $2500" },
      { "value": "2500-5000", "label": "$2500 - $5000" },
      { "value": "5000-10000", "label": "$5000 - $10000" },
      { "value": "10000-20000", "label": "$10000 - $20000" },
      { "value": "20000", "label": "$20000+" }
    ],
    "limit": [
      { "label": "12", "value": "12" },
      { "label": "24", "value": "24" }
    ],
    "sort": [
      { "value": "", "label": "Default" },
      { "value": "applicableTuitionFee", "label": "Fee: Low to High" }
    ]
  }
}
```

---

## GET `/api/courses/search`

Quick autocomplete search. Returns up to 8 matching courses.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search string matched against name, university name, and search column |

### Response `200`

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "BSc Computer Science",
      "universityName": "MIT WPU",
      "search": "bsc computer science mit wpu pune india engineering ..."
    }
  ]
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400` | `query` parameter is missing or not a string |

---

## GET `/api/courses/:id`

Returns full details for a single course, including fee breakdown, scholarship details, and up to 3 upcoming intakes.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Course ID |

### Response `200`

```json
{
  "status": "success",
  "data": {
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
    "description": "A comprehensive undergraduate program in computer science...",
    "language": "English",
    "minimumLevelOfEducation": "12th Grade",
    "minimumGPA": "60%",
    "additionalRequirements": "IELTS 6.0 or equivalent",
    "info": "Applications reviewed on a rolling basis.",
    "tags": ["stem", "technology"],
    "offerTime": "4-6 weeks",
    "acronym": "BSc CS",
    "applicableTuitionFee": 8400,
    "applicationFee": 0,
    "registrationFee": 500,
    "depositFee": 0,
    "examinationFee": 200,
    "hostelFee": 1200,
    "foodFee": 800,
    "otherFees": [
      { "name": "Library Fee", "amount": 100, "required": true, "frequency": "annual" }
    ],
    "scholarshipAvailable": true,
    "scholarshipType": "flat_automatic",
    "scholarshipDetails": {
      "percentageMin": 50,
      "percentageMax": 50,
      "description": "50% scholarship for all international students",
      "appliesTo": "tuition_only",
      "validForYears": "all_years",
      "renewalCondition": null,
      "additionalNotes": null
    },
    "currency": "USD",
    "currencySymbol": "$",
    "isPrime": true,
    "disabled": false,
    "priority": 10,
    "upcomingIntakes": [
      {
        "id": 12,
        "month": 9,
        "year": 2025,
        "season": "fall",
        "label": "Fall 2025",
        "status": "open",
        "statusNote": null,
        "applicationDeadline": "2025-08-15",
        "documentDeadline": "2025-08-30",
        "startDate": "2025-09-01",
        "applicationsCount": 14,
        "maxCapacity": 100
      },
      {
        "id": 18,
        "month": 2,
        "year": 2026,
        "season": "spring",
        "label": "Spring 2026",
        "status": "yet_to_open",
        "statusNote": null,
        "applicationDeadline": "2026-01-20",
        "documentDeadline": "2026-02-01",
        "startDate": "2026-02-15",
        "applicationsCount": 0,
        "maxCapacity": 100
      }
    ]
  }
}
```

**Field notes:**

- `upcomingIntakes` — Up to 3 upcoming intakes with status `yet_to_open` or `open` and a future month/year, ordered by year/month ascending. Returns `[]` if none exist. Filtered and limited at the DB level.
- Detail response includes the full intake shape (`statusNote`, `documentDeadline`, `startDate`, `applicationsCount`, `maxCapacity`), unlike the listing which only includes summary fields.
- `applicationsCount` / `maxCapacity` — Use to compute availability (`maxCapacity - applicationsCount`). `maxCapacity` is `null` when capacity is unlimited.
- `otherFees` — Array of additional fees; `[]` if none.
- `hostelFee`, `foodFee`, `examinationFee` — `null` if not set by the university.
- `scholarshipDetails` — `null` when `scholarshipAvailable` is `false`.

### Error Responses

| Status | Description |
|--------|-------------|
| `404` | Course not found |

---

## Reference

### Scholarship Types

| Value | Description |
|-------|-------------|
| `flat_automatic` | Fixed percentage applied automatically to all students |
| `grade_based` | Percentage determined by academic grade (see `gradeTiers` in `scholarshipDetails`) |
| `package` | Bundled scholarship package |
| `post_bursary` | Cashback-style bursary paid after enrollment |

### Intake Statuses

| Value | Description |
|-------|-------------|
| `yet_to_open` | Application window not open yet |
| `open` | Actively accepting applications |
| `full` | Capacity reached, no new applications accepted |
| `closed` | Application window has closed |
| `cancelled` | Intake has been cancelled |
