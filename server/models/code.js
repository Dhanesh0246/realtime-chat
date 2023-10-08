import mongoose, { Schema, model } from "mongoose";

const schema = new Schema({
  code: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

export const Code = mongoose.models.Code || model("Code", schema);
