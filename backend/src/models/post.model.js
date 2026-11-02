import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 1, max: 150 }
}, { timestamps: true });

export const Post = mongoose.model("Post", postSchema);
