const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PostSchema = new Schema(
  {
    title: { type: String },
    summary: { type: String },
    content: { type: String },
    cover: { type: String },
    author: { type: Schema.Types.ObjectId, ref: "User" }, //as we have to put the name of the author which we will get by id from user model so far that reference
  },
  {
    timestamps: true,
  }
);

const PostModel = model("Post", PostSchema);

module.exports = PostModel;
