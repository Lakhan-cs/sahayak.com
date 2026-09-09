const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 60, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6 },
  googleId: { type: String, unique: true, sparse: true },
  isemailverified: { type: Boolean, default: false },
  phone: { type: Number, min: 1000000000, max: 9999999999, unique: true, sparse: true },
  role: { type: String, enum: ["user", "worker", "cooperative", "mod", "superadmin"], default: "user" },
  address: { type: String, trim: true },
  fieldOfWork: { type: String, trim: true },
  experience: { type: Number, min: 0 },
  workLocation: { type: String, trim: true },
  description: { type: String, trim: true, maxlength: 1000 },
  profileCompletion: { type: Number, default: 70, min: 0, max: 100 },
  rating: { type: Number, default: 4.8, min: 0, max: 5 },
  available: { type: Boolean, default: false },
  earnings: { type: Number, default: 0 },
  earningsHistory: { type: [Number], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("User", userschema);
