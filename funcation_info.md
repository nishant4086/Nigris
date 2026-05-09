# Function Info

This is a curated list of the main public-facing functions and components across the SDK, server, and client.

## SDK (nigris-sdk)

- Nigris (class) - Main SDK client that wraps public API calls.
- Nigris.constructor(apiKey, options) - Create a client with API key, baseURL, and timeout.
- Nigris.create(collectionId, data) - Create a new entry in a collection.
- Nigris.list(collectionId, options) - List entries with pagination and filters.
- Nigris.update(entryId, data, options) - Update an entry; supports optional collectionId for schema validation.
- Nigris.delete(entryId) - Delete an entry by ID.
- Nigris.entries.create/list/update/delete - Namespaced equivalents of the CRUD methods.
- NigrisClient.request(config) - Low-level request wrapper with error handling.
- NigrisError - Error type used by the SDK for structured failures.

## Server (core API handlers)

### API Key Module
- createApiKey - Create a new API key for a project.
- getApiKeys - List API keys for the current user.
- updateApiKey - Update API key status, permissions, or rotate the key.
- deleteApiKey - Revoke (delete) an API key.
- revealApiKey - Reveal a stored API key (owner only).
- getUsage - Per-key usage summary for dashboard.
- getUsageSummary - Aggregate usage summary.
- getAnalyticsTimeSeries - Usage time-series with anomaly detection.
- getAnalyticsDistribution - Usage distribution breakdown.
- getAnalyticsLogs - Recent usage logs.
- exportAnalyticsCsv - Export usage analytics as CSV.
- getAnalyticsLive - Live usage summary (realtime).
- getAlerts - Fetch usage alerts.
- markAlertRead - Mark a usage alert as read.

### Collections Module
- createCollection - Create a new collection.
- getCollections - List collections for a project.
- getCollectionById - Fetch a collection by ID.
- updateCollection - Update collection name, fields, and visibility.
- deleteCollection - Delete a collection (owner/admin only).
- publicGetCollections - Public list of collections (API key scoped).
- publicGetCollection - Public collection details (API key scoped).
- publicGetCollectionSchema - Public schema for a collection (API key scoped).
- publicCreateEntry - Public create entry endpoint (API key scoped).
- publicGetEntry - Public entry fetch (API key scoped).

### Entries Module (Public)
- getEntries - List entries with pagination and filters (API key scoped).
- updateEntry - Update an entry by ID (API key scoped).
- deleteEntry - Delete an entry by ID (API key scoped).

### Dynamic Module
- createDynamic - Create entry by collection slug (dynamic route).
- getDynamic - List entries by collection slug.
- updateDynamic - Update entry by slug + ID.
- deleteDynamic - Delete entry by slug + ID.

## Client (UI components)

- ThemeProvider - Provides MUI theme and dark/light mode state.
- useThemeMode - Hook for reading/toggling theme state.
- ThemeInitializer - Applies theme before hydration.
- ThemeToggle3D - UI switch for light/dark mode.
- GlassCard - Reusable liquid-glass card with motion.
- Navbar - Dashboard top navigation bar.
- Sidebar - Dashboard navigation sidebar.
- ApiKeysPage - Dashboard API keys table and actions.
- CreateKeyModal - Create API key modal workflow.
- RevokeKeyModal - Confirm and revoke API key.
- CopyButton - Copy-to-clipboard utility button.
