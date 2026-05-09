# TODO — Nigris Production Hardening

## Phase 1 — Security Fixes
- [ ] 1. Update `server/middleware/errorMiddleware.js` to remove stack trace leakage in production; return consistent API error format + traceId.
- [ ] 2. Ensure Express app surfaces errors via centralized middleware (add minimal catch/guard if needed in `server/app.js`).

## Phase 1.2 — Redis Rate Limiting
- [ ] 3. Fix `server/middleware/redisRateLimit.js` tenant isolation bug: replace `req.apiKey?.key` usage with stable identifier(s) (`req.apiKey._id`/`hashedKey`) and include project/tenant id.
- [ ] 4. Guard missing plan lookups; default to `free`.

## Phase 2 — Testing Stability
- [ ] 5. Fix E2E auth bootstrap: update `server/tests/qa_e2e_test.js` to follow signup → verify email → login (no immediate JWT on signup).
- [ ] 6. Replace/adjust `mongodb-memory-server` strategy in `server/tests/setup.js` + `server/jest.config.js` to stop crashes and stabilize Jest.

## Phase 2.2 — Testing Architecture
- [ ] 7. (After green tests) propose split between unit/integration/e2e + CI gates.

## Phase 3+ — Remaining Work
- [ ] 8. Refactor rate limiter into separate groups with plan-based limits (auth/public/api-key/admin).
- [ ] 9. Improve load handling + reduce non-2xx ratio (metrics + redis optimization + grace modes).
- [ ] 10. Frontend hook/lint/hydration fixes (target actual lint errors).
- [ ] 11. CI/CD + security scanning + monitoring recommendations.

