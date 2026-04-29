# Nigris SDK

JavaScript SDK for the Nigris public API.

## Features

- API key authentication via `x-api-key`
- `create(collectionId, data)` for entry creation
- `list(collectionId)` for fetching collection data
- Axios-based error normalization
- Optional custom `baseURL` and timeout

## Install

```bash
npm install nigris
```

## Usage

```js
import Nigris from "nigris";

const client = new Nigris("API_KEY", {
  baseURL: "http://localhost:8000/api/public",
});

const entry = await client.create("collectionId", {
  name: "Rahul",
});

const entries = await client.list("collectionId");

// Equivalent namespace form
const moreEntries = await client.entries.list("collectionId");
```

## Options

```js
new Nigris("API_KEY", {
  baseURL: "https://your-ngrok-url/api/public",
  timeout: 15000,
});
```

If a request fails, the SDK throws a `NigrisError` with useful fields such as `status`, `data`, and `code` when available.

## Example

```bash
NIGRIS_API_KEY=your_key NIGRIS_COLLECTION_ID=your_collection_id npm run example
```