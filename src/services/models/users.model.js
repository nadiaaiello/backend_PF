import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: true,
  },
  age: Number,
  password: String,
  loggedBy: String,
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "user_premium"],
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
