# Nigris SDK

JavaScript SDK for the Nigris public API.

## Features

- API key authentication via `x-api-key`
- Full CRUD operations for entries
- Pagination with customizable page/limit
- Dynamic filtering on entry data fields
- Axios-based error normalization
- Optional custom `baseURL` and timeout

## Install

```bash
npm install nigris
```

## Usage

### Create Entry

```js
import Nigris from "nigris";

const client = new Nigris("API_KEY");

const entry = await client.create("collectionId", {
  name: "Alice Johnson",
  email: "alice@example.com",
  age: 28,
});

console.log(entry.data); // { _id, collectionId, data: {...}, ... }
```

### List Entries (with Pagination)

```js
// Get first 10 entries
const result = await client.list("collectionId");
console.log(result.data.length);          // Array of entries
console.log(result.pagination.total);     // Total count
console.log(result.pagination.pages);     // Total pages

// Get page 2 with 20 per page
const page2 = await client.list("collectionId", {
  page: 2,
  limit: 20,
});
```

### List with Filtering

```js
// Filter by email
const filtered = await client.list("collectionId", {
  filters: {
    email: "alice@example.com",
  },
});

// Multiple filters (AND logic)
const engineering = await client.list("collectionId", {
  page: 1,
  limit: 10,
  filters: {
    department: "Engineering",
    city: "New York",
  },
});
```

### Update Entry

```js
// Merge new data with existing entry
const updated = await client.entries.update("entryId", {
  age: 29,
  city: "Boston",
});

// Original fields (name, email) are preserved
console.log(updated.data.name);  // "Alice Johnson" (unchanged)
console.log(updated.data.age);   // 29 (updated)
```

### Delete Entry

```js
const result = await client.entries.delete("entryId");
console.log(result.success);  // true
console.log(result.message);  // "Entry deleted successfully"
```

## Namespace Usage

All methods available via namespace:

```js
// Create
await client.entries.create(collectionId, data);

// List with pagination/filtering
await client.entries.list(collectionId, options);

// Update (merge data)
await client.entries.update(entryId, updates);

// Delete
await client.entries.delete(entryId);
```

## Options

```js
new Nigris("API_KEY", {
  baseURL: "https://your-ngrok-url/api/public",  // Default: http://localhost:8000/api/public
  timeout: 15000,                                  // Default: 10000ms
});
```

## Error Handling

If a request fails, the SDK throws a `NigrisError` with useful fields:

```js
try {
  await client.create("collectionId", data);
} catch (error) {
  console.error(error.status);  // HTTP status code
  console.error(error.data);    // Response body
  console.error(error.code);    // Error code if available
  console.error(error.message); // Error message
}
```

## Example

Complete example with all operations:

```bash
NIGRIS_API_KEY=your_key NIGRIS_COLLECTION_ID=your_collection_id npm run example
```

## Pagination Defaults

- **Page:** 1
- **Limit:** 10
- **Max Limit:** 100 (capped automatically)
- **Invalid values:** Automatically corrected to defaults

---

## 📖 Full Documentation

For complete usage guide, examples, and API reference, see:

- **[USAGE.md](./USAGE.md)** - Comprehensive usage guide with examples
- **[ENTRIES_API.md](../server/ENTRIES_API.md)** - Complete REST API documentation
- **[example.js](./example.js)** - Working CRUD workflow example

---

## ✨ Status

**Production Ready** - All CRUD operations tested and working.

- ✅ Full CRUD (Create, Read, Update, Delete)
- ✅ Pagination & Filtering  
- ✅ Data Merge on Update
- ✅ Error Handling
- ✅ Input Validation
- ✅ Namespace Support (`client.entries.*`)
- ✅ Direct Function Exports