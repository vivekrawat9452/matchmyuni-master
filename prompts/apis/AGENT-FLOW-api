# MatchMyUni — App Backend API Reference

> This document describes all backend APIs required for the MatchMyUni partner app and the supporting admin portal. Intended for app developers building against these endpoints. No implementation details — only what each API does, what data it accepts, and what it returns.

---

## Authentication

All `/partner/*` endpoints require the caller to be authenticated as a **partner** (agent or counsellor role).
All `/admin/*` endpoints require the caller to be authenticated as an **admin** (admin, appManager, or counsellor as specified per endpoint).

Authentication is session-based (cookie). Unauthenticated requests return `401`. Requests by the wrong role return `403`.

---

## Base Response Format

All endpoints return:
```json
{ "status": "success", "data": { ... } }
```
Errors return:
```json
{ "status": "error", "message": "..." }
```

---

## 1. Partner Dashboard

### `GET /partner/dashboard`
**Purpose:** Single call that loads everything needed for the partner home screen.

**Returns:**
- **Greeting** — partner's first name + time-based greeting ("Good morning, Kwame")
- **Stats** — total active students and offers received this month
- **Milestone Progress** — 4 career milestones (First App, 5 Students, 10 Students, First Offer), each marked as achieved, in-progress (with current count vs target), or locked
- **Today's Actions** — up to 5 applications that urgently need attention (documents missing, offer awaiting response, registration fee pending), ordered by most overdue first. Each item includes urgency level, action label, and what type of action is needed
- **Pipeline Summary** — counts of students at each stage: shortlisted, applied, offers, enrolled
- **Earnings Preview** — total estimated earnings broken into confirmed (enrolled students) and pending (active applications), with currency

---

## 2. Partner Students

### `GET /partner/students`
**Purpose:** Paginated list of all students assigned to this partner.

**Query Params:**
- `search` — filter by student name, country, or course name
- `filter` — `all` | `action_needed` | `on_track` | `offer_received` (default: `all`)
- `page`, `limit` (default: page 1, 20 per page)

**Returns per student:**
- Name, country, country flag code, intended field of study
- Number of applications, current status tag (`action_needed` / `on_track` / `offer_received`)
- Latest action message (e.g. "IELTS doc missing")
- Estimated commission value
- Last updated timestamp
- Current pipeline stage (shortlisted / applied / decision / enrolled)

**Also returns:** Filter tab counts (`all`, `actionNeeded`, `onTrack`, `offerReceived`), total count, pagination info.

---

### `GET /partner/students/:userId`
**Purpose:** Full detail view for a single student. Returns 403 if the student does not belong to this partner.

**Returns:**
- **User info** — name, email, country, phone, date added
- **Student profile** — intended field, nationality, qualification level, intended start date, budget
- **Action needed** — if any application needs urgent attention, a message + application reference + action type
- **Applications list** — all applications with course name, university, status label, pipeline position, last updated
- **Profile completeness** — percentage (0–100) and a list of what's missing (e.g. "IELTS / language test", "Passport copy"), each flagged as chaseable or uploadable

---

### `POST /partner/students`
**Purpose:** Create a new student and automatically assign them to this partner.

**Accepts:** Standard student registration fields (name, email, country, etc.)

**Behaviour:** The new student is automatically linked to the calling partner — no need to pass a partner ID. Reuses the same student creation flow used by admin.

---

## 3. Partner Applications

### `GET /partner/applications`
**Purpose:** Full applications view — summary stats, needs-action list, and all applications.

**Query Params:**
- `filter` — `all` | `needs_action`
- `page`, `limit`

**Returns:**
- **Summary** — active application count, how many need action today
- **Shortlist count** — total courses shortlisted across all students
- **Pipeline** — counts and conversion percentages for each stage: Applied → In Review → Offers → Enrolled (percentages are relative to the applied count)
- **Earnings Projection** — "If all current offers convert, you earn $X" — shows potential value of in-progress offers
- **Needs Action** list — applications requiring immediate attention (documents required / offer received / registration pending), sorted oldest first. Each item shows: student, course, university, urgency label (e.g. "Overdue 2d"), action label, estimated commission
- **All Applications** list — all other applications with student info, course, university, status, estimated commission, last updated. Paginated.

---

## 4. Application Detail

### `GET /partner/applications/:applicationId`
**Purpose:** Full detail view for a single application. Returns 403 if the application's student does not belong to this partner.

**Returns:**
- **Student info** — name, country, phone
- **Course info** — course name, university, university country, intake (season + year)
- **Match Score** — 0–100 score showing how well the course matches the student's profile
- **Commission** — estimated commission amount for this application (confirmed on enrollment)
- **Application Journey** — 6-stage timeline showing where the application is:
  1. Profile Complete
  2. Documents Uploaded
  3. Application Submitted
  4. Offer / Rejection
  5. Offer Accepted + Deposit Paid
  6. Visa Approved + Enrolled

  Each stage shows: whether it has been reached, the date it was reached (if applicable), and whether it is currently in progress.

- **Documents section** — list of required documents for the course, each with a status:
  - `verified` — uploaded and confirmed by MMU
  - `under_review` — uploaded, awaiting admin check
  - `required_by_university` — university has specifically requested this document (includes any notes, e.g. "IELTS score must be 6.5+")
  - `not_submitted` — not yet uploaded

- **Actions** — which actions are available based on current status:
  - Primary CTA (e.g. "Mark Offer Accepted", "Upload Required Document", "Pay Registration Fee") — only shown when relevant
  - Can upload a document
  - Can download offer letter (if available)
  - Can WhatsApp the student
  - Can contact the university

---

### `PATCH /partner/applications/:applicationId/accept-offer`
**Purpose:** Mark an offer as accepted on behalf of the student.

**Behaviour:** Only works when the application is in `offer_received` status (returns 422 otherwise). Updates the status to `offer_accepted`, records the timestamp, logs the action, and notifies the student.

**Returns:** Updated application data.

---

## 5. Course Recommendations & Shortlist

### `GET /partner/students/:userId/recommendations`
**Purpose:** Run the course recommendation engine for a specific student and return scored course matches.

**Query Params:** `page`, `limit`, `widenStep` (0–3 to progressively broaden matches)

**Returns:**
- `hasPreferences` — false if the student hasn't set their preferences yet (returns empty list with a message)
- **Courses list** — each course with: name, university, country, degree level, intakes, fees, match score (0–100), score band (`strong` / etc.), and whether the course is already shortlisted by this student

---

### `GET /partner/students/:userId/shortlist`
**Purpose:** View all courses shortlisted for a specific student.

**Returns per course:** Course name, university, country, degree level, intakes, match score, date added, who added it (`partner` or `student`), and whether an application already exists for this course.

---

### `POST /partner/students/:userId/shortlist`
**Purpose:** Add a course to the student's shortlist on their behalf.

**Accepts:** `{ courseId, matchScore? }` — if no match score is provided, it is computed automatically from the student's preferences (or stored as null if no preferences are set).

Returns 409 if the course is already shortlisted.

---

### `DELETE /partner/students/:userId/shortlist/:courseId`
**Purpose:** Remove a course from the student's shortlist.

Returns 409 if an application already exists for this course (cannot un-shortlist a course that has been applied to).

---

## 6. Partner Profile

### `GET /partner/me`
**Purpose:** Load the full profile screen for the logged-in partner.

**Returns:**
- Partner name, email, organization, country
- Stats: students, applications, offers, enrolled
- Partner documents (MoU, commission structure PDF) uploaded by admin
- Earnings summary (confirmed + pending totals)
- Milestone progress (same 4 milestones as dashboard)

---

### `PATCH /partner/me`
**Purpose:** Update the partner's own profile details.

**Can update:** name, phone number, country. Cannot update email, role, or organization.

---

### `GET /partner/milestones`
**Purpose:** Fetch milestone progress on its own (without reloading the full profile). Useful for refreshing the milestones section after an event.

---

### `GET /partner/documents`
**Purpose:** List official documents that admin has uploaded for this partner (MoU, commission structure).

---

## 7. Document Changes Visible to Partners

No new partner endpoints here — these are data changes that affect what the app already displays.

**Document verification status** — each document a student uploads now has a 3-state status instead of a simple verified/unverified flag:
- `pending` — uploaded, waiting for MMU admin to review
- `verified` — confirmed by MMU admin
- `rejected` — rejected by admin; student needs to re-upload

This status is shown in the **documents section of the application detail** (`GET /partner/applications/:id`).

**Ad-hoc document requests** — when MMU admin raises a specific document request against an application (e.g. a university asks for a higher IELTS score), it appears in the same documents section as a fourth state:
- `required_by_university` — includes a note from admin (e.g. "Score must be 6.5 or above")

The partner sees all four states (`verified`, `under_review`, `required_by_university`, `not_submitted`) in the documents list on the application detail screen. No separate API call needed — it is part of the existing `GET /partner/applications/:id` response.

> Admin endpoints to manage document types, templates, course requirements, and verification are planned for a later phase.

---

## Summary — All Endpoints

| # | Method | Route | Purpose |
|---|---|---|---|
| 1 | GET | `/partner/dashboard` | Partner home screen — stats, actions, pipeline, milestones |
| 2 | GET | `/partner/students` | Paginated student list with filters |
| 3 | GET | `/partner/students/:userId` | Full student detail + profile completeness |
| 4 | POST | `/partner/students` | Add a new student (auto-assigned to partner) |
| 5 | GET | `/partner/applications` | Applications overview — pipeline, needs-action, full list |
| 6 | GET | `/partner/applications/:id` | Full application detail — journey, documents, actions |
| 7 | PATCH | `/partner/applications/:id/accept-offer` | Accept an offer on behalf of a student |
| 8 | GET | `/partner/students/:userId/recommendations` | Scored course recommendations for a student |
| 9 | GET | `/partner/students/:userId/shortlist` | Student's shortlisted courses |
| 10 | POST | `/partner/students/:userId/shortlist` | Add a course to student's shortlist |
| 11 | DELETE | `/partner/students/:userId/shortlist/:courseId` | Remove a course from shortlist |
| 12 | GET | `/partner/me` | Partner profile screen |
| 13 | PATCH | `/partner/me` | Update partner profile |
| 14 | GET | `/partner/milestones` | Milestone progress |
| 15 | GET | `/partner/documents` | Partner's MoU and commission docs |
