# Understanding the project

## Request flow

Postman → Express JSON parser → route → controller → Mongoose model → MongoDB → controller → JSON response.

For example, Postman sends a POST request containing a name, description, and age. The route `/api/v1/posts/create` selects `createPost`. That function checks the values, waits for `Post.create`, and responds with status 201 and the saved document. The model describes document fields; MongoDB actually stores them. `await` lets the function wait for the database without blocking all other requests. If an operation fails, `catch` sends the error to the shared error handler.

## Files

| File | Purpose |
| --- | --- |
| `package.json` | Project metadata, ES module setting, dependencies, and npm commands. |
| `package-lock.json` | Exact resolved dependency versions used by `npm ci`. |
| `.gitignore` | Keeps local secrets and generated dependencies out of Git. |
| `.env.example` | Safe configuration template containing placeholders. |
| `.env` (local only) | Your Atlas connection string and port. |
| `backend/src/index.js` | Loads configuration, connects the database, creates user indexes, and starts the server. |
| `backend/src/app.js` | Builds Express, parses JSON, checks body format, mounts routes, and handles unknown routes. |
| `backend/src/config/database.js` | Calls `mongoose.connect` with bounded timeouts; disables buffering while disconnected. |
| `backend/src/models/user.model.js` | User schema, unique indexes, password hashing before save, and password comparison. |
| `backend/src/models/post.model.js` | Post fields and age constraints; adds creation/update timestamps. |
| `backend/src/routes/user.route.js` | Maps registration, login, and logout URLs to controller functions. |
| `backend/src/routes/post.route.js` | Maps create, list, update, and delete URLs to controllers. |
| `backend/src/controllers/user.controller.js` | Validates user inputs, creates users, checks passwords, and returns safe user fields. |
| `backend/src/controllers/post.controller.js` | Validates post inputs/IDs, calls database operations, and handles missing documents. |
| `backend/src/middleware/error-handler.js` | Converts thrown errors into safe JSON and HTTP status codes. Four arguments identify Express error middleware. |
| `test/api.test.js` | Sends real HTTP requests, checks invalid requests, runs a separate MongoDB, restarts the Node process, and checks persistence. |
| `postman/backend-assignment.postman_collection.json` | Importable requests, example bodies, variables, and response assertions. |
| `README.md` | Setup, API contract, demo, tutorial credit, and submission instructions. |
| `docs/learning.md` | This explanation and practice questions. |
| `docs/verification.md` | Actual test results and remaining account/desktop checks. |

## Dependencies

| Dependency | Why it is present |
| --- | --- |
| `express` | HTTP routing, request/response helpers, and JSON parsing. |
| `mongoose` | Schemas, models, validation, and communication with MongoDB. |
| `bcrypt` | One-way password hashing and comparison. A cost of 10 controls hashing effort. |
| `dotenv` | Reads `.env` into `process.env`. |
| `mongodb-memory-server-core` (development only) | Starts an isolated real MongoDB binary for integration tests. It is not used by the app or Atlas. The core package avoids downloading MongoDB during npm installation. |

Node itself provides the test runner, assertions, HTTP fetch, child processes, and watch mode. No separate testing framework or nodemon is needed.

## Viva questions

1. **What is Node.js?** A runtime that executes our JavaScript outside the browser, including the API server.
2. **What does Express add?** URL routing, JSON body parsing, and convenient request/response methods.
3. **Why `type: module`?** It makes `.js` files use `import` and `export`, matching the tutorial.
4. **How are route, controller, and model different?** A route selects the function, a controller handles the request, and a model defines and accesses stored documents.
5. **MongoDB versus Mongoose?** MongoDB is the database; Mongoose is the JavaScript library that helps us work with it.
6. **What does `express.json()` do?** Parses JSON request bodies into `req.body` before controllers run.
7. **Why `async/await` and `try/catch`?** Database/hash operations take time; await waits for their results and catch handles failures.
8. **Why hash passwords?** The database stores a one-way hash instead of plaintext. `bcrypt.compare` verifies a password against it; we do not decrypt it.
9. **What is the pre-save hook?** A function run before saving a user. It hashes the password only if the password changed.
10. **Does login protect the post endpoints?** No. This implementation checks credentials but has no session, token, authentication middleware, or post ownership.
11. **What does logout invalidate?** Nothing. It verifies the email exists and returns an acknowledgement; this is a limitation of the tutorial.
12. **What are `_id`, `req.params.id`, and `req.body`?** `_id` is MongoDB's document identifier, `params.id` comes from the URL, and `body` contains submitted JSON.
13. **Why `new: true` and `runValidators: true` on update?** Return the updated document and enforce schema validators. Updates do not automatically run save hooks.
14. **How do 400, 401, 404, and 409 differ?** Bad input, invalid credentials, missing resource, and duplicate/conflicting account respectively. A well-formed ID may still identify no document.
15. **How do we know data persists?** Tests restart the Node process and read the updated post and log in again. MongoDB stores data separately from the Node server. Unique indexes enforce username/email uniqueness even for simultaneous registrations; `unique` is not a Mongoose validator.

## Small practice changes

1. Change the root route's message, restart, and check it in Postman. Explain why this does not change MongoDB.
2. Add a maximum of 200 characters to post descriptions in both controller validation and schema. Check create and update with 200 and 201 characters. Update the README to match.
3. Sort `getPosts` by newest creation time. Create two posts and predict the order before sending GET.
4. Add `GET /api/v1/posts/:id`. Reuse the existing ID-checking pattern and return 404 when a valid ID is absent. Test both errors and a successful read.

These are exercises, not already implemented features. Explain each change in your own words before making it.
