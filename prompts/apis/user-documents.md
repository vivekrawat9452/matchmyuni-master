# POST /api/users/documents

Upload documents for the authenticated user.

**Auth:** Bearer token required  
**Content-Type:** `multipart/form-data`

---

## Request

| Field           | Type       | Required | Notes                                                           |
| --------------- | ---------- | -------- | --------------------------------------------------------------- |
| `files`         | `File[]`   | Yes      | Max 10 files                                                    |
| `documentTypes` | `string[]` | Yes      | Document type for each file — must match index order of `files` |

## Constraints

- **Max file size:** 5 MB
- **Allowed types:** `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- **`documentTypes` values:** `passport`, `national_id`, `o_level`, `a_level`, `diploma`, `bachelor_degree_certificate`, `bachelor_degree_transcripts`, `other`
- Count of `files` must equal count of `documentTypes`

---

## Response

### 201 Created

```json
{
  "status": "success",
  "message": "Documents uploaded successfully",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "applicationId": null,
      "documentType": "passport",
      "documentUrl": "https://...",
      "filename": "passport.pdf",
      "filesize": 204800,
      "mimeType": "application/pdf",
      "verified": false,
      "verifiedBy": null,
      "uploadedAt": "2026-05-24T10:00:00.000Z",
      "updatedAt": "2026-05-24T10:00:00.000Z"
    }
  ]
}
```

### Errors

| Status | Message                                               |
| ------ | ----------------------------------------------------- |
| 400    | `No files uploaded`                                   |
| 400    | `Number of files must match number of document types` |
| 400    | `Invalid document type: "<value>". Allowed: ...`      |
| 400    | `Invalid file type. Allowed: PDF, JPG, PNG, WEBP`     |
| 400    | `File is too large. Maximum size is 5MB.`             |
| 401    | `Not authenticated`                                   |
| 500    | `Failed to upload file: <storage error>`              |
