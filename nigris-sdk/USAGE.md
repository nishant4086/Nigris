# Nigris SDK - Usage Guide

## Installation

```bash
npm install nigris
```

## Quick Start

```javascript
import Nigris from "nigris";

const client = new Nigris("YOUR_API_KEY", {
  baseURL: "http://localhost:8000/api/public",  // Optional
  timeout: 15000,                                 // Optional (default: 10000ms)
});
```

---

## API Methods

### 1. CREATE Entry

Create a new entry in a collection.

```javascript
const entry = await client.create(collectionId, {
  name: "Alice Johnson",
  email: "alice@example.com",
  age: 28,
});

console.log(entry._id);      // Entry ID
console.log(entry.data);     // { name, email, age }
```

**Alternative - Namespace:**
```javascript
const entry = await client.entries.create(collectionId, data);
```

---

### 2. LIST Entries

Fetch entries with pagination and filtering.

**Basic pagination:**
```javascript
const result = await client.list(collectionId);

console.log(result.data);             // Array of entries
console.log(result.pagination.total); // Total count
console.log(result.pagination.pages); // Number of pages
```

**With pagination options:**
```javascript
const result = await client.list(collectionId, {
  page: 2,
  limit: 20,
});
```

**With filtering:**
```javascript
// Filter by email
const result = await client.list(collectionId, {
  filters: {
    email: "alice@example.com",
  },
});

// Multiple filters (AND logic)
const result = await client.list(collectionId, {
  page: 1,
  limit: 10,
  filters: {
    department: "Engineering",
    city: "New York",
  },
});
```

**Alternative - Namespace:**
```javascript
const result = await client.entries.list(collectionId, options);
```

**Response structure:**
```json
{
  "data": [
    {
      "_id": "69f267ff196cbb1247fd611a",
      "collectionId": "69f1b66189e041aab07678f3",
      "project": "67a1b8c2d4e5f6g7h8i9j0k1",
      "data": {
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "age": 28
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

---

### 3. UPDATE Entry

Update an entry (data fields are merged, not replaced).

```javascript
const updated = await client.update(entryId, {
  age: 29,
  city: "Boston",
});

console.log(updated.data.name);  // "Alice Johnson" (preserved)
console.log(updated.data.age);   // 29 (updated)
console.log(updated.data.city);  // "Boston" (new field)
```

**Alternative - Namespace:**
```javascript
const updated = await client.entries.update(entryId, updates);
```

**Important:** Update uses a shallow merge. Old data is preserved, only specified fields are updated.

---

### 4. DELETE Entry

Delete an entry.

```javascript
const result = await client.delete(entryId);

console.log(result.success); // true
console.log(result.message); // "Entry deleted successfully"
```

**Alternative - Namespace:**
```javascript
const result = await client.entries.delete(entryId);
```

---

## Complete CRUD Example

```javascript
import Nigris from "nigris";

const client = new Nigris(process.env.NIGRIS_API_KEY);
const collectionId = process.env.NIGRIS_COLLECTION_ID;

// 1. CREATE
const entry = await client.create(collectionId, {
  name: "Alice",
  email: "alice@example.com",
  department: "Engineering",
});
const entryId = entry._id;

// 2. LIST
const result = await client.list(collectionId, {
  page: 1,
  limit: 10,
  filters: { department: "Engineering" },
});
console.log(`Found ${result.pagination.total} entries`);

// 3. UPDATE
const updated = await client.update(entryId, {
  email: "alice.new@example.com",
  position: "Senior Engineer",
});

// 4. DELETE
await client.delete(entryId);
```

---

## Pagination Options

| Option | Type | Default | Max |
|--------|------|---------|-----|
| page | number | 1 | - |
| limit | number | 10 | 100 |

```javascript
// Pagination with validation
const result = await client.list(collectionId, {
  page: 2,       // Pages start at 1
  limit: 50,     // Values > 100 will be capped at 100
});
```

---

## Filtering

Filter entries by any field in the data object.

```javascript
// Single field
await client.list(collectionId, {
  filters: { email: "user@example.com" },
});

// Multiple fields (AND logic)
await client.list(collectionId, {
  filters: {
    department: "Engineering",
    city: "San Francisco",
    active: true,
  },
});
```

---

## Error Handling

The SDK throws `NigrisError` on failures.

```javascript
import Nigris from "nigris";

const client = new Nigris("API_KEY");

try {
  await client.create("collectionId", { name: "Test" });
} catch (error) {
  console.error(error.message);        // Error message
  console.error(error.status);         // HTTP status (e.g., 404)
  console.error(error.data);           // Response body
  console.error(error.code);           // Error code
  console.error(error.isAxiosError);   // Is Axios error?
}
```

**Common errors:**

| Status | Cause | Solution |
|--------|-------|----------|
| 400 | Invalid parameters | Check required fields |
| 401 | No API key | Provide API key in header |
| 403 | Invalid API key | Check API key validity |
| 404 | Entry/collection not found | Verify IDs exist |
| 429 | Rate limit exceeded | Wait before retrying |

---

## Configuration

### Custom Base URL

```javascript
const client = new Nigris("API_KEY", {
  baseURL: "https://api.nigris.com/api/public",
});
```

### Custom Timeout

```javascript
const client = new Nigris("API_KEY", {
  timeout: 30000,  // 30 seconds
});
```

### Both Options

```javascript
const client = new Nigris("API_KEY", {
  baseURL: "https://api.nigris.com/api/public",
  timeout: 30000,
});
```

---

## Module Usage

Import functions directly instead of using the class:

```javascript
import { createEntry, listEntries, updateEntry, deleteEntry } from "nigris";
import NigrisClient from "nigris";

const http = new NigrisClient("API_KEY");

// Use functions directly
const entry = await createEntry(http, collectionId, data);
const result = await listEntries(http, collectionId, { page: 1 });
const updated = await updateEntry(http, entryId, updates);
await deleteEntry(http, entryId);
```

---

## TypeScript Support (Coming Soon)

The SDK works with TypeScript. Type definitions will be added in a future release.

```typescript
// Example with JSDoc
/**
 * @param {string} collectionId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async create(collectionId, data) { ... }
```

---

## Validation

The SDK validates inputs before making requests:

| Method | Validation |
|--------|-----------|
| create | collectionId (string), data (object) |
| list | collectionId (string) |
| update | entryId (string), data (object) |
| delete | entryId (string) |

---

## Pagination Response Format

```json
{
  "data": [ ... ],
  "pagination": {
    "total": 45,      // Total entries in collection
    "page": 1,        // Current page
    "limit": 10,      // Results per page
    "pages": 5        // Total pages available
  }
}
```

---

## Best Practices

1. **Always handle errors:**
   ```javascript
   try {
     await client.create(collectionId, data);
   } catch (error) {
     console.error("Failed to create entry:", error.message);
   }
   ```

2. **Use pagination for large datasets:**
   ```javascript
   for (let page = 1; page <= totalPages; page++) {
     const result = await client.list(collectionId, { page });
     // Process result.data
   }
   ```

3. **Filter before listing to reduce data:**
   ```javascript
   // Good: Filter on server
   const result = await client.list(collectionId, {
     filters: { status: "active" },
   });

   // Avoid: Get all, then filter in client
   ```

4. **Combine pagination with filtering:**
   ```javascript
   const result = await client.list(collectionId, {
     page: 2,
     limit: 20,
     filters: { department: "Engineering" },
   });
   ```

5. **Validate data before creating:**
   ```javascript
   const data = {
     name: req.body.name,
     email: req.body.email,
   };
   if (!data.name || !data.email) {
     throw new Error("Name and email required");
   }
   const entry = await client.create(collectionId, data);
   ```

---

## Environment Variables

```bash
NIGRIS_API_KEY=your_api_key
NIGRIS_COLLECTION_ID=your_collection_id
NIGRIS_BASE_URL=http://localhost:8000/api/public  # Optional
```

```javascript
const client = new Nigris(process.env.NIGRIS_API_KEY, {
  baseURL: process.env.NIGRIS_BASE_URL,
});
```

---

## Support

For issues or questions, refer to:
- [ENTRIES_API.md](../server/ENTRIES_API.md) - Complete REST API documentation
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - Quick API reference
- [Example](./example.js) - Working CRUD example
