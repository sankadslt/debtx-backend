import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  user_type: { type: String, required: true, enum: ["slt", "drc", "ro"] },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "admin", "superadmin", "drc_admin", "drc_user"] },
  created_by: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  user_status: { type: Boolean, required: true, default: true },
  login_method: { type: String, required: true, enum: ["slt", "email", "facebook"] },
  sequence_id: { type: Number },
  drc_id: { type: Number, default: null },
  ro_id: { type: Number, default: null },
  // drc_sequence_id: { type: String, default: null },
  // ro_sequence_id: { type: String, default: null },
});

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
