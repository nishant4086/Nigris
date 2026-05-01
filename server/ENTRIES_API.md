# 📚 Entries CRUD API Documentation

## Overview

Complete Entries CRUD system with pagination, filtering, and project-based security. All endpoints require API key authentication via `x-api-key` header.

---

## 🔐 Authentication

**Required Header:**
```
x-api-key: YOUR_API_KEY
```

**Base URL:**
```
http://localhost:8000/api/public
```

---

## 📖 API ENDPOINTS

### 1️⃣ GET ENTRIES (with Pagination & Filtering)

**Endpoint:**
```
GET /api/public/collections/:id/entries
```

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Results per page (max 100) |
| `*` | string | - | Dynamic filters on data fields |

**Examples:**

Basic pagination:
```bash
curl -X GET \
  -H "x-api-key: YOUR_API_KEY" \
  "http://localhost:8000/api/public/collections/69f1b66189e041aab07678f3/entries?page=1&limit=10"
```

Dynamic filtering by email:
```bash
curl -X GET \
  -H "x-api-key: YOUR_API_KEY" \
  "http://localhost:8000/api/public/collections/69f1b66189e041aab07678f3/entries?email=user@example.com"
```

Multiple filters:
```bash
curl -X GET \
  -H "x-api-key: YOUR_API_KEY" \
  "http://localhost:8000/api/public/collections/69f1b66189e041aab07678f3/entries?city=NewYork&department=Engineering"
```

**Response:**
```json
{
  "data": [
    {
      "_id": "69f264199b4d6d5e9c53f673",
      "collectionId": "69f1b66189e041aab07678f3",
      "project": "67a1b8c2d4e5f6g7h8i9j0k1",
      "data": {
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "age": 28,
        "city": "New York"
      },
      "createdAt": "2026-04-30T10:15:30.000Z",
      "updatedAt": "2026-04-30T10:15:30.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

**Features:**
- ✅ Sort by `createdAt` (DESC)
- ✅ Project-scoped queries
- ✅ Dynamic field filtering
- ✅ Pagination with calculated pages
- ✅ Limit validation (1-100)
- ✅ Page validation (≥ 1)

---

### 2️⃣ UPDATE ENTRY

**Endpoint:**
```
PATCH /api/public/entries/:entryId
```

**Request Body:**
```json
{
  "age": 29,
  "city": "Boston",
  "newField": "value"
}
```

**Example:**
```bash
curl -X PATCH \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 29,
    "city": "Boston"
  }' \
  "http://localhost:8000/api/public/entries/69f264199b4d6d5e9c53f673"
```

**Response:**
```json
{
  "_id": "69f264199b4d6d5e9c53f673",
  "collectionId": "69f1b66189e041aab07678f3",
  "project": "67a1b8c2d4e5f6g7h8i9j0k1",
  "data": {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "age": 29,
    "city": "Boston"
  },
  "createdAt": "2026-04-30T10:15:30.000Z",
  "updatedAt": "2026-04-30T10:20:45.000Z"
}
```

**Features:**
- ✅ Merges old data with new data
- ✅ Only updates `data` field
- ✅ Preserves existing fields
- ✅ Project-scoped validation
- ✅ Updates `updatedAt` timestamp

**Error Cases:**
- `400` - Invalid entry ID format
- `404` - Entry not found (or doesn't belong to project)
- `400` - Project not found on request

---

### 3️⃣ DELETE ENTRY

**Endpoint:**
```
DELETE /api/public/entries/:entryId
```

**Example:**
```bash
curl -X DELETE \
  -H "x-api-key: YOUR_API_KEY" \
  "http://localhost:8000/api/public/entries/69f264199b4d6d5e9c53f673"
```

**Response:**
```json
{
  "success": true,
  "message": "Entry deleted successfully"
}
```

**Features:**
- ✅ Project-scoped deletion
- ✅ Validates entry ID format
- ✅ Safe deletion with existence check
- ✅ Clear success message

**Error Cases:**
- `400` - Invalid entry ID format
- `404` - Entry not found (or doesn't belong to project)
- `400` - Project not found on request

---

## 🔒 Security Implementation

### Project Isolation
All queries enforce project scoping:
```javascript
// ✅ Secure - always filters by project
const entry = await Data.findOne({
  _id: entryId,
  project: req.project._id  // ← Project scoping
});

// ❌ NEVER do this (cross-project access vulnerability)
const entry = await Data.findById(entryId);
```

### Authentication
- API key required in `x-api-key` header
- Middleware attaches `req.project` and `req.apiKey`
- All routes protected by `publicApiKeyMiddleware`
- Rate limiting enforced per API key

### Input Validation
- Entry IDs validated as MongoDB ObjectId
- Pagination values sanitized (negatives corrected, limits capped)
- Collection IDs/slugs validated and scoped to project

---

## 🎯 Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| GET with pagination | ✅ | Page/limit with sane defaults |
| Dynamic filtering | ✅ | Filter on any data field |
| UPDATE with merge | ✅ | Shallow merge of data fields |
| DELETE | ✅ | Safe deletion with validation |
| Project isolation | ✅ | All queries scoped to req.project |
| Error handling | ✅ | Proper JSON error responses |
| Pagination edge cases | ✅ | Invalid values corrected |
| Limit capping | ✅ | Max 100 per page |
| Sorting | ✅ | DESC by createdAt |

---

## 📝 Code Structure

```
server/
├── models/
│   └── Data.js                    # Data model with project field
├── modules/
│   ├── collections/
│   │   └── collectionController.js (updated)
│   └── entries/                   # NEW MODULE
│       └── entryController.js      # CRUD handlers
├── routes/
│   ├── publicRoutes.js            # Updated with entry routes
│   └── entryRoutes.js             # Entry-specific routes
├── middleware/
│   └── publicApiKeyMiddleware.js  # Authentication & rate limiting
└── tests/
    ├── entries.test.sh             # Bash test suite
    └── entries.test.js             # Node test suite (ref)
```

---

## 🧪 Test Coverage

All features tested:

```bash
✅ CREATE multiple entries
✅ GET with pagination (page 1, page 2)
✅ GET with dynamic filtering
✅ UPDATE with data merge
✅ DELETE entry
✅ Invalid entry ID handling
✅ Non-existent entry handling
✅ Pagination edge cases
✅ Data merge verification
```

---

## ⚡ Performance Considerations

- **Indexing:** Collection `project` field indexed for fast queries
- **Lean queries:** Using `.lean()` for GET operations (read-only)
- **Pagination:** Skip-limit pattern, max 100 results per page
- **Filtering:** Direct MongoDB query operators on `data.*` fields

---

## 🛠️ Maintenance

### Adding new dynamic filters
Dynamic filters work automatically on any field in `data`:
```bash
# Automatically filters data.department
?department=Engineering

# Works for nested fields too (if data structure supports)
?profile.title=Manager
```

### Changing defaults
Edit `validatePaginationParams()` in `entryController.js`:
```javascript
let p = parseInt(page) || 1;     // Change default page
let l = parseInt(limit) || 10;   // Change default limit
if (l > 100) l = 100;            // Change max limit
```

---

## 📞 Support & Examples

See complete examples in:
- [entries.test.sh](./tests/entries.test.sh) - Bash test suite with curl examples
- [nigris-sdk](../nigris-sdk/) - JavaScript SDK wrapper
