import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import app from "../backend/src/app.js";
import "../backend/src/config/database.js";

test("invalid requests and unavailable database return safe JSON", async () => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const [method, path, body, status] of [
      ["POST", "/api/v1/users/register", {}, 400],
      ["POST", "/api/v1/users/login", { email: { $ne: null }, password: "secret123" }, 400],
      ["POST", "/api/v1/users/logout", [], 400],
      ["POST", "/api/v1/posts/create", { name: "A", description: "B", age: "20" }, 400],
      ["PATCH", "/api/v1/posts/update/not-an-id", { age: 20 }, 400],
      ["DELETE", "/api/v1/posts/delete/not-an-id", undefined, 400],
      ["GET", "/unknown", undefined, 404],
      ["GET", "/api/v1/posts/getPosts", undefined, 503]
    ]) {
      const response = await fetch(base + path, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
      assert.equal(response.status, status, path);
      const result = await response.json();
      assert.equal(typeof result.message, "string");
      assert.equal(result.stack, undefined);
    }
    const malformed = await fetch(base + "/api/v1/users/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
    assert.equal(malformed.status, 400);
    const wrongType = await fetch(base + "/api/v1/users/register", { method: "POST", body: "hello" });
    assert.equal(wrongType.status, 415);
    const oversized = await fetch(base + "/api/v1/posts/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: "a".repeat(17000) }) });
    assert.equal(oversized.status, 413);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test("real MongoDB: accounts, CRUD, errors, and persistence after server restart", { timeout: 180000 }, async () => {
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri("backend_assignment_test");
  const portFinder = createServer().listen(0, "127.0.0.1");
  await once(portFinder, "listening");
  const port = portFinder.address().port;
  await new Promise(resolve => portFinder.close(resolve));
  let child;
  let connection;
  const base = `http://127.0.0.1:${port}`;

  async function startServer() {
    child = spawn(process.execPath, ["backend/src/index.js"], { env: { ...process.env, MONGODB_URI: uri, PORT: String(port) }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Test server startup timed out")), 15000);
      child.stdout.on("data", data => {
        if (data.toString().includes("Server running")) {
          clearTimeout(timer);
          resolve();
        }
      });
      child.once("error", error => { clearTimeout(timer); reject(error); });
      child.once("exit", code => { clearTimeout(timer); reject(new Error(`Test server exited: ${code}`)); });
    });
  }

  async function stopServer() {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
  }

  async function request(method, path, body, expected) {
    const response = await fetch(base + "/api/v1" + path, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const result = await response.json();
    assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(result)}`);
    assert.equal(JSON.stringify(result).includes('"password":'), false);
    assert.equal(JSON.stringify(result).includes("$2b$"), false);
    return result;
  }

  try {
    await startServer();
    const account = { username: " Student ", email: " Student@Example.com ", password: "secret123" };
    const registered = await request("POST", "/users/register", account, 201);
    assert.equal(registered.user.email, "student@example.com");
    assert.equal(registered.user.username, "student");
    await request("POST", "/users/register", account, 409);
    await request("POST", "/users/register", { ...account, email: "another@example.com" }, 409);
    await request("POST", "/users/register", { ...account, username: "another" }, 409);
    await request("POST", "/users/login", { email: account.email, password: "wrongpass" }, 401);
    await request("POST", "/users/login", { email: "absent@example.com", password: account.password }, 401);
    await request("POST", "/users/login", account, 200);
    await request("POST", "/users/logout", { email: account.email }, 200);
    await request("POST", "/users/logout", { email: "absent@example.com" }, 404);
    await request("POST", "/users/register", { ...account, password: "😀".repeat(20) }, 400);

    connection = await mongoose.createConnection(uri).asPromise();
    const storedUser = await connection.collection("users").findOne({ email: "student@example.com" });
    assert.notEqual(storedUser.password, account.password);
    assert.equal(await bcrypt.compare(account.password, storedUser.password), true);

    const created = await request("POST", "/posts/create", { name: "Student", description: "Learning APIs", age: 20 }, 201);
    const id = created.post._id;
    assert.ok((await request("GET", "/posts/getPosts", undefined, 200)).some(post => post._id === id));
    await request("PATCH", `/posts/update/${id}`, {}, 400);
    await request("PATCH", `/posts/update/${id}`, { $set: { age: 30 } }, 400);
    await request("PATCH", `/posts/update/${id}`, { age: 151 }, 400);
    await request("PATCH", `/posts/update/${id}`, { name: " " }, 400);
    await request("PATCH", `/posts/update/${id}`, { description: "Updated", age: 21 }, 200);
    assert.equal((await connection.collection("posts").findOne({ _id: new mongoose.Types.ObjectId(id) })).age, 21);

    await stopServer();
    await startServer();
    const persisted = (await request("GET", "/posts/getPosts", undefined, 200)).find(post => post._id === id);
    assert.equal(persisted.description, "Updated");
    await request("POST", "/users/login", account, 200);
    await request("DELETE", `/posts/delete/${id}`, undefined, 200);
    assert.equal(await connection.collection("posts").countDocuments(), 0);
    await request("DELETE", `/posts/delete/${id}`, undefined, 404);
    await request("PATCH", `/posts/update/${id}`, { age: 20 }, 404);
    assert.deepEqual(await request("GET", "/posts/getPosts", undefined, 200), []);
  } finally {
    await stopServer();
    if (connection) await connection.close();
    await mongo.stop();
  }
});
