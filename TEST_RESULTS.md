# EventPulse — Test Results

Automated test run output for the project. Run locally with:

```bash
npm test
```

## Summary (latest run)

| Metric | Value |
|---|---|
| Test suites | 3 passed, 3 total |
| Tests | 8 passed, 8 total |
| Snapshots | 0 total |
| Duration | ~47s |

- `tests/unit/appError.test.js` — PASS
- `tests/unit/asyncHandler.test.js` — PASS
- `tests/integration/events.test.js` — PASS

## Coverage of the brief

- **Unit tests** cover both success and failure cases for `AppError` and `asyncHandler`.
- **Integration tests** cover event creation, listing, category filtering, empty-list
  responses, and the 404 case for a non-existent event, via Supertest against an
  in-memory MongoDB instance.

## Notes

- Integration tests use `mongodb-memory-server`. On machines without network access
  to download a MongoDB binary, a locally installed `mongod` is used automatically by
  setting `MONGOMS_SYSTEM_BINARY` (the test checks for MongoDB 7.0 at the default
  Windows install path and falls back to the library default download).
