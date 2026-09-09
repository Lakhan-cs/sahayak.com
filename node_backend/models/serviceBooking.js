const mongoose = require("mongoose");

const serviceBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  service: { type: String, required: true, trim: true },
  problemDescription: { type: String, required: true, trim: true, maxlength: 500 },
  images: { type: [String], default: [] },
  bookingType: { type: String, enum: ["asap", "scheduled"], required: true },
  scheduledDate: { type: Date, default: null },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  status: { type: String, enum: ["pending", "assigned", "in-progress", "completed", "cancelled"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("ServiceBooking", serviceBookingSchema);
