# TODO — Nigris Production Hardening

## Phase 1 — Security Fixes
- [x] 1. Update `server/middleware/errorMiddleware.js` to remove stack trace leakage in production; return consistent API error format + traceId.
- [x] 2. Ensure Express app surfaces errors via centralized middleware (add minimal catch/guard if needed in `server/app.js`).

## Phase 1.2 — Redis Rate Limiting
- [x] 3. Fix `server/middleware/redisRateLimit.js` tenant isolation bug: replace `req.apiKey?.key` usage with stable identifier(s) (`req.apiKey._id`/`hashedKey`) and include project/tenant id.
- [x] 4. Guard missing plan lookups; default to `free`.

## Phase 1.5 — Admin Monitoring & UX Enhancements
- [x] 5. Admin Error Alerting & Dashboard: Created SystemError collection, SMTP error mailer, and admin error inspection UI (`/admin/errors`).
- [x] 6. Form UX Hardening: Made SMTP config and Collection entry grid read-only by default with explicit Edit Mode toggles.
- [x] 7. Dynamic Navbar Branding: Header user dropdown dynamically loads and syncs uploaded profile avatar live.

## Phase 2 — Testing Stability
- [x] 8. Stabilized backend Jest test suite against live/dockerized MongoDB & Redis instances with 100% success rate.
- [ ] 9. Fix E2E auth bootstrap: update `server/tests/qa_e2e_test.js` to follow signup → verify email → login (no immediate JWT on signup).

## Phase 3+ — Remaining Work
- [ ] 10. Refactor rate limiter into separate groups with plan-based limits (auth/public/api-key/admin).
- [ ] 11. Observability Integration: Implement Sentry and PostHog/Plausible analytics tracking.
- [ ] 12. CI/CD + security scanning + monitoring recommendations.

