# Recommendation API — Student

Base URL prefix: `/recommendations`

All endpoints require **student authentication** (`Authorization: Bearer <supabase-jwt>`).

---

## GET `/recommendations/preferences`

Returns the student's saved recommendation preferences along with the allowed option lists used to populate the preference form.

### Response `200`

```json
{
  "status": "success",
  "data": {
    "preferences": {
      "highestQualificationLevel": "bachelors",
      "intendedStart": "next_year",
      "preferredCategories": ["Engineering", "Computer Science"],
      "preferredCountries": ["India", "United Kingdom"],
      "budget": "six_to_12k",
      "profileHash": "a3f9c2...",
      "preferencesSetAt": "2025-05-10T14:30:00.000Z"
    },
    "allowedCategories": ["Engineering", "Business", "Computer Science", "..."],
    "allowedCountries": ["India", "United Kingdom", "Canada", "..."]
  }
}
```

**Field notes:**

- `preferences` — `null` if the student has never saved preferences (i.e. `highestQualificationLevel` is not set).
- `allowedCategories` — Live list of distinct `category` values from non-disabled courses (cached).
- `allowedCountries` — Live list of distinct `country` values from non-disabled courses (cached).
- `profileHash` — SHA-256 of the saved preference fields. Used internally to detect preference changes and invalidate the recommendation cache.

### Error Responses

| Status | Description |
|--------|-------------|
| `401` | Missing or invalid auth token |

---

## PUT `/recommendations/preferences`

Saves (upserts) the student's recommendation preferences. Validates that submitted categories and countries are from the allowed lists.

### Request Body

```json
{
  "highestQualificationLevel": "bachelors",
  "intendedStart": "next_year",
  "preferredCategories": ["Engineering", "Computer Science"],
  "preferredCountries": ["India", "United Kingdom"],
  "budget": "six_to_12k"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `highestQualificationLevel` | string | Yes | One of `grade_10`, `grade_12`, `diploma`, `bachelors`, `masters` |
| `intendedStart` | string | Yes | One of `this_year`, `next_year`, `two_three_years` |
| `preferredCategories` | string[] | Yes | Min 1 item. Each value must exist in `allowedCategories` |
| `preferredCountries` | string[] | Yes | Min 1 item. Each value must exist in `allowedCountries` |
| `budget` | string | Yes | One of `under_3k`, `three_to_6k`, `six_to_12k`, `not_sure` |

### Response `200`

```json
{
  "status": "success",
  "data": {
    "preferences": {
      "highestQualificationLevel": "bachelors",
      "intendedStart": "next_year",
      "preferredCategories": ["Engineering", "Computer Science"],
      "preferredCountries": ["India", "United Kingdom"],
      "budget": "six_to_12k"
    },
    "profileHash": "a3f9c2...",
    "cacheInvalidated": true
  }
}
```

**Field notes:**

- `cacheInvalidated` — `true` if the new preferences differ from what was previously saved (profile hash changed). The frontend can use this to know whether to refetch the discover feed.

### Error Responses

| Status | Description |
|--------|-------------|
| `400` | Validation failed — missing/invalid fields, or unrecognized category/country values |
| `401` | Missing or invalid auth token |

---

## GET `/recommendations/discover`

Returns a paginated, **scored and ranked** list of courses recommended for the student based on their saved preferences.

If the student has not set preferences, returns an empty result with `hasPreferences: false`.

### Query Parameters

| Parameter | Type | Default | Validation |
|-----------|------|---------|------------|
| `page` | number | `1` | Positive integer |
| `pageSize` | number | `10` | 1–20 |

### Response `200` — preferences set

Each item in `results` contains **score metadata** merged with the **full course object**:

```json
{
  "status": "success",
  "data": {
    "hasPreferences": true,
    "results": [
      {
        "courseId": 1,
        "matchScore": 89,
        "scoreBand": "strong",
        "scoreBreakdown": {
          "field": 39,
          "country": 28,
          "budget": 22,
          "intake": 11
        },
        "finalRank": 1,
        "whyMatch": [
          "Matches your field of interest",
          "In your preferred country",
          "Within your budget"
        ],
        "isWidened": false,
        "course": {
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
          "registrationFee": 500,
          "depositFee": 0,
          "scholarshipAvailable": true,
          "scholarshipType": "flat_automatic",
          "scholarshipDetails": { ... },
          "currency": "USD",
          "currencySymbol": "$",
          "isPrime": true,
          "priority": 10
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 42,
      "totalPages": 5,
      "hasMore": true
    }
  }
}
```

### Response `200` — no preferences set

```json
{
  "status": "success",
  "data": {
    "hasPreferences": false,
    "results": [],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 0,
      "totalPages": 0,
      "hasMore": false
    }
  }
}
```

**Score fields (per result):**

| Field | Type | Description |
|-------|------|-------------|
| `courseId` | number | Course ID (same as `course.id`) |
| `matchScore` | number | 0–100 composite score |
| `scoreBand` | string | `"strong"` (≥80) · `"good"` (≥60) · `"explore"` (<60) |
| `scoreBreakdown` | object | Points contributed by `field`, `country`, `budget`, `intake` (weights sum to 100) |
| `finalRank` | number | 1-based rank across all results for this student |
| `whyMatch` | string[] | Up to 3 human-readable match reasons, e.g. `"In your preferred country"` |
| `isWidened` | boolean | `false` on all normal discover results. `true` only when results are appended by the widen step (future feature) |
| `wideningStep` | number? | `1`, `2`, or `3`. Only present when `isWidened: true` |
| `wideningLabel` | string? | Human-readable label for the widening step, e.g. `"Nearby countries"`. Only present when `isWidened: true` |
| `costLabel` | string? | Only present for `not_sure` budget (no fee ceiling applied). Example: `"~$8,400/yr"` |
| `course` | object | Full course row. Does **not** include `upcomingIntakes` — use `GET /courses/:id` for intake details |

**Filtering logic (Layer 1 — courses that enter the scoring pool):**

| Filter | Rule |
|--------|------|
| Degree eligibility | Maps `highestQualificationLevel` → eligible `degreeLevel` values. e.g. `bachelors` → only `Masters` courses |
| Countries | Matches `preferredCountries` exactly |
| Categories | Matches `preferredCategories` exactly |
| Budget | `applicableTuitionFee ≤ ceiling`. Ceilings: `under_3k` → $3,300 · `three_to_6k` → $6,600 · `six_to_12k` → $13,200 · `not_sure` → no gate |
| Intake timing | `this_year` → intakes within next 12 months · `next_year` → 6–24 months out · `two_three_years` → any active intake |
| Score floor | Courses scoring below 40 are excluded from results |
| Pool cap | Layer 1 is capped at 150 courses (ordered by `priority DESC`) before scoring |

### Error Responses

| Status | Description |
|--------|-------------|
| `400` | Invalid `page` or `pageSize` |
| `401` | Missing or invalid auth token |

---

## Reference

### `highestQualificationLevel` Values

| Value | Description | Eligible Degree Levels |
|-------|-------------|------------------------|
| `grade_10` | Completed Grade 10 | Foundation, Diploma |
| `grade_12` | Completed Grade 12 | Foundation, Diploma, Bachelor's |
| `diploma` | Diploma holder | Bachelor's |
| `bachelors` | Bachelor's degree | Master's |
| `masters` | Master's degree | PhD |

### `intendedStart` Values

| Value | Description |
|-------|-------------|
| `this_year` | Planning to start within the next 12 months |
| `next_year` | Planning to start 6–24 months from now |
| `two_three_years` | Planning to start 2–3 years from now |

### `budget` Values

| Value | Description | Fee Ceiling (USD) |
|-------|-------------|-------------------|
| `under_3k` | Under $3,000/year | $3,300 |
| `three_to_6k` | $3,000–$6,000/year | $6,600 |
| `six_to_12k` | $6,000–$12,000/year | $13,200 |
| `not_sure` | Not sure / no limit | No ceiling |
