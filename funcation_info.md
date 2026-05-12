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
- Nigris.mail.sendTemplate(options) - Send a templated email.
- Nigris.mail.send(options) - Send a direct HTML email.
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
- exportAnalyticsCsv - Export usage analytics as CSV (handles empty states gracefully).
- getAnalyticsLive - Live usage summary (realtime SSE).
- getAlerts - Fetch usage alerts and system notifications.
- markAlertRead - Mark a usage alert or notification as read.

### Collections Module
- createCollection - Create a new collection (triggers system notification).
- getCollections - List collections for a project.
- getCollectionById - Fetch a collection by ID.
- updateCollection - Update collection name, fields, and visibility.
- deleteCollection - Delete a collection (triggers system notification).
- publicGetCollections - Public list of collections (API key scoped).
- publicGetCollection - Public collection details (API key scoped).
- publicGetCollectionSchema - Public schema for a collection (API key scoped).
- publicCreateEntry - Public create entry endpoint (API key scoped).
- publicGetEntry - Public entry fetch (API key scoped).

### Mail & SMTP Module
- updateSmtpSettings - Configure custom SMTP host, port, and credentials.
- testSmtpSettings - Verify SMTP connection by sending a test email.
- getSmtpSettings - Fetch current SMTP configuration.
- createEmailTemplate - Create a new HTML email template with variables.
- getEmailTemplates - List all templates for a project.
- duplicateEmailTemplate - Clone an existing template.
- deleteEmailTemplate - Remove a template.
- sendTemplatedEmail - Send email using a template slug and variables.
- sendDirectEmail - Send raw HTML email.
- getEmailLogs - Fetch history of all sent emails with delivery status.

### Projects Module
- createProject - Create a new project (triggers system notification).
- getProjects - List all projects the user has access to.
- updateProject - Update project metadata.
- deleteProject - Remove project and all associated data.

### Notifications Module
- createNotification - Utility to create user notifications (Project, Collection, Billing, etc.).
- createBroadcastNotification - Send community-wide updates to all users.

## Client (UI components)

### Layout & Navigation
- Navbar - Dashboard top navigation with search and profile.
- Sidebar - Dashboard navigation with active state tracking.
- CommandPalette - Global search modal (`Cmd+K`) for services and projects.
- NotificationPopover - Real-time notification hub (Bell icon).
- ThemeToggle3D - UI switch for light/dark mode.

### UI Components
- GlassCard - Reusable liquid-glass card with motion and backdrop blur.
- StatsCard - Dashboard summary card with tinted icons.
- ActivityTable - Real-time request log table with live indicators.
- LiveIndicator - Visual pulsing status for SSE connections.
- ExportButton - Usage data export with detailed error handling.

### Features
- ApiKeysPage - Dashboard API keys table and actions.
- EmailTemplateEditor - HTML editor for email designs with variable mapping.
- SMTPConfigForm - Interface for configuring email delivery.
- TemplatePresets - Quick-start templates (Welcome, OTP, etc.).
