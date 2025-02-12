import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  user_type: { type: String, required: true, enum: ["slt", "drc", "ro"]},
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "admin", "superadmin"] },
  created_by: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  user_active: { type: Boolean, required: true, default: true },
  login_method: { type: String, required: true, enum: ["slt", "email", "facebook"] },
  seequance_id: { type: String }
});

const User = mongoose.model("User", userSchema);

export default User;