import mongoose from "mongoose";
import { Post } from "../models/post.model.js";

function validatePost(body, isUpdate = false) {
  const fields = Object.keys(body);
  const allowedFields = ["name", "description", "age"];
  if (fields.length === 0 || fields.some(field => !allowedFields.includes(field))) {
    return "Provide only name, description, and age; at least one field is required.";
  }
  if (!isUpdate && allowedFields.some(field => !(field in body))) {
    return "Name, description, and age are required.";
  }
  if ("name" in body && (typeof body.name !== "string" || !body.name.trim())) {
    return "name must be a non-empty string.";
  }
  if ("description" in body && (typeof body.description !== "string" || !body.description.trim())) {
    return "description must be a non-empty string.";
  }
  if ("age" in body && (typeof body.age !== "number" || !Number.isFinite(body.age) || body.age < 1 || body.age > 150)) {
    return "age must be a number between 1 and 150.";
  }
}

export async function createPost(req, res, next) {
  try {
    const problem = validatePost(req.body);
    if (problem) return res.status(400).json({ message: problem });
    const { name, description, age } = req.body;
    const post = await Post.create({ name, description, age });
    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    next(error);
  }
}

export async function getPosts(req, res, next) {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    next(error);
  }
}

export async function updatePost(req, res, next) {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    const problem = validatePost(req.body, true);
    if (problem) return res.status(400).json({ message: problem });
    const post = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post updated", post });
  } catch (error) {
    next(error);
  }
}

export async function deletePost(req, res, next) {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (error) {
    next(error);
  }
}
