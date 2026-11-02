# Verification record

Initial Express smoke check: a real local HTTP request returned 200 and the expected JSON message. bcrypt hash/compare smoke check passed. The runtime dependency audit reported zero vulnerabilities after removing nodemon.

Automated integration tests passed on 2 November 2026: **2 test groups passed, 0 failed**. The test suite uses its own temporary real MongoDB and never reads the Atlas connection string for testing. It checks registration, normalization, duplicate usernames/emails, password hashing and exclusion, successful/failed login, logout, complete post CRUD, invalid input/IDs, missing records, malformed JSON, oversized bodies, wrong content type, disconnected database responses, and persistence after restarting the actual Node process. MongoDB 8.2.6 was obtained from MongoDB's official download host and its executable cached locally after the package's initial downloader stalled. No database calls were mocked.

After switching to `mongodb-memory-server-core` to avoid installation-time binary downloads, a clean `npm ci` succeeded and plain `npm test` passed again using the cached official MongoDB executable. `npm audit` reported zero vulnerabilities across runtime and development dependencies. The Postman collection contains 23 requests; its desktop execution is not part of the automated Node tests.

Pending external checks:

- User's Atlas `.env` configuration and a verified connection to that cluster.
- Running the collection in Postman desktop and manually restarting the Atlas-connected app to verify persistence there.
- GitHub publication is tracked separately from runtime verification; the selected repository is `chittranshsharma/node-web-dev-project` and was public and empty when inspected.

The temporary database tests do not prove Atlas account setup or Postman desktop execution.
