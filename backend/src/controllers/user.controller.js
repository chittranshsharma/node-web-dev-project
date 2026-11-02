import { User } from "../models/user.model.js";

function validEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validPassword(password) {
  return typeof password === "string" && password.length >= 6 && password.length <= 50 && Buffer.byteLength(password, "utf8") <= 72;
}

function publicUser(user) {
  return { id: user._id, username: user.username, email: user.email };
}

export async function registerUser(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (typeof username !== "string" || !username.trim() || username.trim().length > 30 || !validEmail(email) || !validPassword(password)) {
      return res.status(400).json({ message: "Provide a username (1–30 characters), valid email, and password (6–50 characters, at most 72 UTF-8 bytes)." });
    }
    const user = await User.create({ username, email, password });
    res.status(201).json({ message: "User registered", user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!validEmail(email) || !validPassword(password)) {
      return res.status(400).json({ message: "Provide a valid email and password (6–50 characters, at most 72 UTF-8 bytes)." });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ message: "Credentials verified. This tutorial API does not create a session.", user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function logoutUser(req, res, next) {
  try {
    const { email } = req.body;
    if (!validEmail(email)) {
      return res.status(400).json({ message: "Provide a valid email." });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Logout acknowledged. This tutorial API has no session to invalidate." });
  } catch (error) {
    next(error);
  }
}
