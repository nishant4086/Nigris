# Nigris SDK

Official JavaScript SDK for the [Nigris](https://nigris-client.vercel.app) API — a headless backend-as-a-service for managing collections, entries, and data.

[![npm version](https://img.shields.io/npm/v/nigris)](https://www.npmjs.com/package/nigris)
[![license](https://img.shields.io/npm/l/nigris)](./LICENSE)

## Install

```bash
npm install @nishant4806/nigris-sdk
```

## Quick Start

```js
import Nigris from "@nishant4806/nigris-sdk";

const client = new Nigris("your-api-key");

// Create an entry
const entry = await client.create("collectionId", {
  name: "Alice Johnson",
  email: "alice@example.com",
  age: 28,
});

console.log(entry);
```

## API Reference

### Initialize

```js
import Nigris from "@nishant4806/nigris-sdk";

const client = new Nigris("API_KEY", {
  baseURL: "https://nigris-1.onrender.com/api/public", // default
  timeout: 10000, // default (ms)
});
```

### Create Entry

```js
const entry = await client.create("collectionId", {
  name: "Alice",
  email: "alice@example.com",
});
```

### List Entries

```js
// Basic listing
const result = await client.list("collectionId");
console.log(result.data);       // Array of entries
console.log(result.pagination); // { total, page, limit, pages }

// With pagination
const page2 = await client.list("collectionId", {
  page: 2,
  limit: 20,
});

// With filters
const filtered = await client.list("collectionId", {
  filters: { department: "Engineering", city: "New York" },
});
```

### Update Entry

```js
// Merges new data with existing entry (non-destructive)
const updated = await client.update("entryId", {
  age: 29,
  city: "Boston",
});
```

### Delete Entry

```js
const result = await client.delete("entryId");
// { success: true, message: "Entry deleted successfully" }
```

### Namespace Syntax

All methods are also available under `client.entries.*`:

```js
await client.entries.create(collectionId, data);
await client.entries.list(collectionId, options);
await client.entries.update(entryId, data);
await client.entries.delete(entryId);
```

## Schema Validation

The SDK automatically validates your data against the collection's schema before sending requests. If a required field is missing or has the wrong type, you get a clear error before the API call is made.

## Error Handling

Errors are thrown as `NigrisError` with structured fields:

```js
try {
  await client.create("collectionId", data);
} catch (error) {
  console.error(error.message); // Human-readable message
  console.error(error.status);  // HTTP status code (e.g. 400, 404)
  console.error(error.data);    // Response body from server
  console.error(error.code);    // Error code (e.g. "ECONNREFUSED")
}
```

## Requirements

- Node.js 16+
- An API key from the [Nigris dashboard](https://nigris-client.vercel.app/dashboard/api-keys)

## License

[MIT](./LICENSE)
