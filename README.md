# Backend assignment

A small local Express API following [Shivani's freeCodeCamp tutorial](https://www.youtube.com/watch?v=KOutPbKc9UM) and its [official source](https://github.com/NewSmoke38/intro-to-backend). Uses the tutorial's ES modules, folder layout, user fields, post fields, and seven endpoints. No frontend is required.

## Setup

Prerequisites: Node.js 22 or newer, npm, Git, an Atlas cluster, and Postman desktop. Node 24 is available on the development laptop.

Run these commands in the project folder in PowerShell:

```powershell
npm ci
Copy-Item .env.example .env
notepad .env
npm start
```

Copy the example only if `.env` does not already exist. Fill in `MONGODB_URI` with your own Atlas connection string; keep `PORT=4000` unless that port is occupied. Never commit or share `.env`.

For your existing Atlas cluster:

1. In Atlas, ensure a **database user** has read/write access to `backend_assignment`. This is separate from your Atlas login.
2. Add your current public IP to the project's Network Access/IP access list.
3. Choose your cluster's **Connect → Drivers → Node.js** connection string.
4. Replace the username and password placeholders locally. Percent-encode special characters in the password. Include `/backend_assignment` before the connection string's `?`.
5. Save `.env` in the project root, next to `package.json`. Start the app from that directory.

Example shape only:

```text
PORT=4000
MONGODB_URI=mongodb+srv://YOUR_DATABASE_USER:YOUR_ENCODED_PASSWORD@YOUR_CLUSTER/backend_assignment?retryWrites=true&w=majority
```

The server connects to MongoDB and initializes unique user indexes before listening at `http://localhost:4000`. It binds to the laptop's loopback interface. Startup fails if the database cannot connect. Check credentials, IP access, internet/DNS, and whether your cluster is available. Credentials and connection strings are not printed in errors. `/` is a simple server check, not a database health check.

`npm run dev` restarts on code changes using Node's built-in watch mode. Restart manually after changing `.env`. Stop with Ctrl+C. `npm test` uses a separate temporary real MongoDB process; it never uses the Atlas URI in `.env`. Its first run downloads a MongoDB binary and needs internet access; npm installation does not download that binary. If the test download fails, set the environment variable `MONGOMS_SYSTEM_BINARY` to an existing local `mongod.exe` path before running `npm test`.

## API

Use raw JSON bodies and `Content-Type: application/json` for POST and PATCH. Base URL: `http://localhost:4000`.

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| GET | `/` | none | 200, server message |
| POST | `/api/v1/users/register` | `{"username":"student","email":"student@example.com","password":"secret123"}` | 201, message + safe user |
| POST | `/api/v1/users/login` | `{"email":"student@example.com","password":"secret123"}` | 200, message + safe user |
| POST | `/api/v1/users/logout` | `{"email":"student@example.com"}` | 200, acknowledgement |
| POST | `/api/v1/posts/create` | `{"name":"Student","description":"Learning APIs","age":20}` | 201, message + post |
| GET | `/api/v1/posts/getPosts` | none | 200, array (possibly empty) |
| PATCH | `/api/v1/posts/update/:id` | `{"description":"Updated","age":21}` | 200, message + updated post |
| DELETE | `/api/v1/posts/delete/:id` | none | 200, message |

Replace `:id` with a post's `_id`. There is no single-post GET route in the tutorial; use the list to find the post.

Usernames are trimmed, lowercased, unique, and 1–30 characters. Emails are trimmed, lowercased, unique, and checked for a basic email shape. Passwords are 6–50 characters and at most 72 UTF-8 bytes (bcrypt's input limit). This is the tutorial's learning-level password policy. Passwords are never trimmed or returned. Posts require non-empty name/description and a numeric age from 1 to 150. PATCH accepts one or more of these three fields. Extra post fields and MongoDB update operators are rejected.

Errors return JSON with a `message`: **400** invalid input/ID/JSON; **401** incorrect credentials; **404** missing user on logout, missing post, or unknown route; **409** duplicate username/email; **413** body over 16 KB; **415** incorrect request content type; **503** unavailable database; **500** unexpected internal failure. Raw database errors and password hashes are not returned.

## What login and logout actually do

Registration stores a bcrypt hash. Login finds the email and compares the supplied password with that hash. It does **not** issue a token, set a cookie, or create a session. Logout checks whether the email exists and acknowledges the request; there is no session to destroy. This preserves the official tutorial's behavior, with clearer response messages.

Post routes are public, have no owner, and work before login and after logout. Anyone who can reach the API can change any post. Use this as a local learning demonstration. Real access control would require sessions/tokens and authorization, which are outside this tutorial implementation.

## Postman desktop and demonstration

1. Start the app with your configured Atlas `.env`.
2. In Postman desktop, choose **Import** and select `postman/backend-assignment.postman_collection.json`.
3. Check the collection variable `baseUrl` is `http://localhost:4000`. No authorization setting is needed.
4. Send the requests in order or use the Collection Runner. The registration pre-request script generates a new demo username/email; the create-post test saves `postId`. The collection contains only disposable example credentials.
5. For a viva, send Server check → Register → Duplicate account → Login → Wrong password → Logout → Create → Read → Update.
6. Before deleting, stop the Node server with Ctrl+C, run `npm start` again, and repeat **Read updated post**. The post should still have age 21 and the updated description. Repeat Login to show the account also persisted.
7. In Atlas's collection browser, inspect the matching document in `backend_assignment.posts`. You can also inspect the demo user's hashed password in `users`; do not display real credentials.
8. Send Invalid age → Invalid ID → Delete → Delete missing post → Update missing post → Confirm deletion. Explain the different status codes.

The automated collection runner does not restart the server; step 6 is manual. Each run leaves a demo user in Atlas and removes its demo post if all requests finish. Remove only your own demo users using Atlas when no longer needed. Do not delete other users or databases.

See [verification](docs/verification.md) for what was actually run and [learning guide](docs/learning.md) for file/dependency explanations, viva questions, and exercises.

## GitHub submission

Intended public repository: [chittranshsharma/node-web-dev-project](https://github.com/chittranshsharma/node-web-dev-project). Local commits use the connected GitHub account's profile name/email and current timestamps. Commit messages use Conventional Commit prefixes as required by the workspace.

This repository was empty when inspected. The local working branch is `codex/backend-assignment`; it is published to the remote's default `main` branch. To push later commits from this working branch:

```powershell
git push origin HEAD:main
```

If the remote changes, fetch and review it before integrating; do not force-push over existing work. If authentication prompts, sign in to GitHub through Git Credential Manager. Verify repository visibility is Public and inspect the pushed files on GitHub.

Before pushing, check `git status`, `git ls-files`, and staged diffs. `.env`, `node_modules`, and generated local files are ignored; `.env.example` and `package-lock.json` belong in Git.

## Tutorial differences and credit

Source behavior was verified from the official repository linked in the video's description; no transcript was obtained. This project is an educational implementation informed by that source, not a verbatim transcription. Improvements are input validation, password exclusion, duplicate-index handling, safe errors, validated/allowlisted updates, and local-only binding. The tutorial's schema imposed a maximum length on the password field even though hashing replaces it with a longer string; the plaintext maximum is checked in the controller here instead. The pre-save hook uses async/await without mixing callback completion. Native Node watch mode replaces nodemon. No unused constants file is included.

References: [official tutorial source](https://github.com/NewSmoke38/intro-to-backend), [Atlas connections](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/), [Mongoose validation](https://mongoosejs.com/docs/validation.html), [Express error handling](https://expressjs.com/en/guide/error-handling/), [Postman import](https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-data/).
