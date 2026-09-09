const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const memoryCache = require("memory-cache");
const usermodel = require("../models/user");
const sessionmodel = require("../models/session");
const ServiceBooking = require("../models/serviceBooking");
const { generateaccesstoken, generaterefreshtoken } = require("../utils/token");
const apierr = require("../utils/errclass");
const OTP = require("../utils/otpmaker");
const emailer = require("../utils/emailsender");
const auth = require("../middlewares/auth");
const googleClient = require("../config/google");
const upload = require("../middlewares/uploader");

const router = express.Router();
const cache = memoryCache;
const otpHash = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

function normalizeRole(role) {
  if (role === "worker") return "worker";
  if (role === "cooperative_society" || role === "cooperative")
    return "cooperative";
  return "user";
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    isemailverified: user.isemailverified,
    fieldOfWork: user.fieldOfWork,
    experience: user.experience,
    workLocation: user.workLocation,
    description: user.description,
    profileCompletion: user.profileCompletion,
    rating: user.rating,
    available: user.available,
    earnings: user.earnings || 0,
  };
}

async function issueSession(user, res) {
  const sessionid = crypto.randomBytes(16).toString("hex");
  const accessToken = generateaccesstoken(user);
  const refreshToken = generaterefreshtoken(user, sessionid);
  await sessionmodel.create({
    userid: user._id,
    refreshtoken: refreshToken,
    sessionid,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  res.cookie("refreshtoken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return accessToken;
}

router.post("/auth/signup", async (req, res, next) => {
  try {
    const {
      name,
      fullName,
      email,
      password,
      phone,
      role,
      address,
      fieldOfWork,
      experience,
      workLocation,
    } = req.body || {};
    const cleanName = String(name || fullName || "").trim();
    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();
    if (!cleanName || !cleanEmail || !password)
      throw new apierr("Name, email and password are required", 400);
    if (cleanName.length < 3)
      throw new apierr("Name must be at least 3 characters", 400);
    if (String(password).length < 6)
      throw new apierr("Password must be at least 6 characters", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
      throw new apierr("Please enter a valid email", 400);
    if (phone && !/^\d{10}$/.test(String(phone)))
      throw new apierr("Phone number must contain 10 digits", 400);

    const existing = await usermodel.findOne({ email: cleanEmail });
    if (existing) throw new apierr("User already exists. Please login.", 409);

    const user = await usermodel.create({
      name: cleanName,
      email: cleanEmail,
      password: await bcrypt.hash(String(password), 10),
      phone: phone ? Number(phone) : undefined,
      role: normalizeRole(role),
      isemailverified: false,
      address: address ? String(address).trim() : undefined,
      fieldOfWork: fieldOfWork ? String(fieldOfWork).trim() : undefined,
      experience: Number.isFinite(Number(experience))
        ? Number(experience)
        : undefined,
      workLocation: workLocation ? String(workLocation).trim() : undefined,
    });

    const otp = OTP();
    cache.put(`signup:${user.email}`, otpHash(otp), 120000);
    try {
      await emailer(
        user.email,
        "Sahayak email verification OTP",
        `<p>Your Sahayak verification OTP is <b>${otp}</b>.</p>`,
      );
    } catch (_) {}

    const accessToken = await issueSession(user, res);
    res
      .status(201)
      .json({
        status: true,
        message: "Account created successfully.",
        accessToken,
        user: publicUser(user),
      });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const cleanEmail = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = req.body?.password;
    if (!cleanEmail || !password)
      throw new apierr("Email and password are required", 400);
    const user = await usermodel.findOne({ email: cleanEmail });
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(String(password), user.password))
    ) {
      throw new apierr("Invalid email or password", 401);
    }
    const accessToken = await issueSession(user, res);
    res.json({
      status: true,
      message: "Login successful",
      accessToken,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/auth/google-config", (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID || "" });
});

router.post("/auth/google/link", auth, async (req, res, next) => {
  try {
    const credential = req.body?.credential;
    if (!credential) throw new apierr("Google credential is required", 400);
    if (!process.env.GOOGLE_CLIENT_ID)
      throw new apierr("Google authentication is not configured", 503);

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified)
      throw new apierr("Google email is not verified", 400);

    const signedInUser = await usermodel.findById(req.user.id);
    if (!signedInUser) throw new apierr("User not found", 404);

    if (signedInUser.googleId)
      throw new apierr("This Google account is already linked", 409);
    if (
      signedInUser.email.toLowerCase() !== String(payload.email).toLowerCase()
    ) {
      throw new apierr(
        "This Google account does not match your signed-in email",
        400,
      );
    }

    const existingGoogleUser = await usermodel.findOne({
      googleId: payload.sub,
    });
    if (
      existingGoogleUser &&
      !existingGoogleUser._id.equals(signedInUser._id)
    ) {
      throw new apierr(
        "This Google account is already linked to another user",
        409,
      );
    }

    signedInUser.googleId = payload.sub;
    signedInUser.isemailverified = true;
    if (!signedInUser.name && payload.name) signedInUser.name = payload.name;
    await signedInUser.save();

    res.json({
      status: true,
      message: "Google account linked successfully",
      user: publicUser(signedInUser),
    });
  } catch (err) {
    if (err instanceof apierr) return next(err);
    console.error("Google account link:", err.message);
    next(new apierr("Google account link failed", 500));
  }
});

router.post("/auth/google", async (req, res, next) => {
  try {
    const credential = req.body?.credential;
    if (!credential) throw new apierr("Google credential is required", 400);
    if (!process.env.GOOGLE_CLIENT_ID)
      throw new apierr("Google authentication is not configured", 503);

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified)
      throw new apierr("Google email is not verified", 400);

    let user = await usermodel.findOne({ googleId: payload.sub });
    if (user) {
      const accessToken = await issueSession(user, res);
      return res.json({
        status: true,
        message: "Google login successful",
        accessToken,
        user: publicUser(user),
      });
    }

    const existingEmailUser = await usermodel.findOne({
      email: payload.email.toLowerCase(),
    });
    if (existingEmailUser) {
      throw new apierr("This email is already in use", 409);
    }

    user = await usermodel.create({
      name: payload.name || "Sahayak User",
      email: payload.email.toLowerCase(),
      role: "user",
      isemailverified: true,
      googleId: payload.sub,
    });

    const accessToken = await issueSession(user, res);
    res.json({
      status: true,
      message: "Google login successful",
      accessToken,
      user: publicUser(user),
    });
  } catch (err) {
    if (err instanceof apierr) return next(err);
    console.error("Google authentication:", err.message);
    next(new apierr("Google authentication failed", 500));
  }
});

router.post("/auth/emailverify", auth, async (req, res, next) => {
  try {
    const otp = String(req.body?.otp || "").trim();
    if (!otp) throw new apierr("OTP not entered", 400);
    const user = await usermodel.findById(req.user.id);
    if (!user) throw new apierr("User not found", 404);
    const saved = cache.get(`signup:${user.email}`);
    if (!saved) throw new apierr("OTP has expired or does not exist", 400);
    if (otpHash(otp) !== saved) throw new apierr("Incorrect OTP", 400);
    user.isemailverified = true;
    await user.save();
    cache.del(`signup:${user.email}`);
    res.json({ status: true, message: "Your email has been verified" });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/resendotp", auth, async (req, res, next) => {
  try {
    const user = await usermodel.findById(req.user.id);
    if (!user) throw new apierr("User not found", 404);
    const otp = OTP();
    cache.put(`signup:${user.email}`, otpHash(otp), 120000);
    await emailer(
      user.email,
      "Sahayak email verification OTP",
      `<p>Your Sahayak verification OTP is <b>${otp}</b>.</p>`,
    );
    res.json({ status: true, message: "OTP has been resent" });
  } catch (err) {
    next(err);
  }
});

router.get("/auth/me", auth, async (req, res, next) => {
  try {
    const user = await usermodel.findById(req.user.id).select("-password");
    if (!user) throw new apierr("User not found", 404);
    res.json({ status: true, user });
  } catch (err) {
    next(err);
  }
});

router.put("/auth/profile", auth, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body || {};
    const user = await usermodel.findById(req.user.id);
    if (!user) throw new apierr("User not found", 404);
    if (name !== undefined) {
      const nextName = String(name).trim();
      if (nextName.length < 3 || nextName.length > 60)
        throw new apierr("Name must be between 3 and 60 characters", 400);
      user.name = nextName;
    }
    if (phone !== undefined) {
      const nextPhone = String(phone).replace(/\D/g, "");
      if (nextPhone && !/^\d{10}$/.test(nextPhone))
        throw new apierr("Phone number must contain 10 digits", 400);
      user.phone = nextPhone ? Number(nextPhone) : undefined;
    }
    if (address !== undefined) user.address = String(address).trim();
    await user.save();
    res.json({
      status: true,
      message: "Profile updated",
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/logout", async (req, res, next) => {
  try {
    const token = req.cookies.refreshtoken;
    if (token) await sessionmodel.findOneAndDelete({ refreshtoken: token });
    res.clearCookie("refreshtoken");
    res.json({ status: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/refresh", async (req, res, next) => {
  try {
    const token = req.cookies.refreshtoken || req.body?.refreshToken;
    if (!token) throw new apierr("Refresh token missing", 401);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        if (req.cookies?.refreshtoken) res.clearCookie("refreshtoken");
        throw new apierr("Session expired. Please login again.", 401);
      }
      throw new apierr("Invalid refresh token", 401);
    }

    const session = await sessionmodel.findOne({
      sessionid: decoded.sessionid,
      refreshtoken: token,
    });
    if (
      !session ||
      !session.expiresAt ||
      new Date(session.expiresAt).getTime() < Date.now()
    ) {
      if (req.cookies?.refreshtoken) res.clearCookie("refreshtoken");
      throw new apierr("Session expired. Please login again.", 401);
    }

    const user = await usermodel.findById(session.userid);
    if (!user) throw new apierr("User not found", 401);

    const newAccessToken = generateaccesstoken(user);
    res.json({
      status: true,
      accessToken: newAccessToken,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/forgotpass", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const user = await usermodel.findOne({ email });
    if (!user) throw new apierr("No account found with this email", 404);
    const otp = OTP();
    cache.put(`reset:${email}`, otpHash(otp), 120000);
    await emailer(
      email,
      "Sahayak password reset OTP",
      `<p>Your Sahayak password reset OTP is <b>${otp}</b>.</p>`,
    );
    res.json({
      status: true,
      message: "OTP has been sent",
      resetToken: jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
        expiresIn: "10m",
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/newpass", auth, async (req, res, next) => {
  try {
    const password = String(req.body?.password || "");
    if (password.length < 6)
      throw new apierr("Password must be at least 6 characters", 400);
    await usermodel.findByIdAndUpdate(req.user.id, {
      password: await bcrypt.hash(password, 10),
    });
    res.json({ status: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/bookings",
  auth,
  upload.array("images", 5),
  async (req, res, next) => {
    try {
      const {
        service,
        problemDescription,
        bookingType,
        scheduledDate,
        latitude,
        longitude,
      } = req.body || {};
      if (!service || !problemDescription || !bookingType)
        throw new apierr(
          "Service, problem description and booking type are required",
          400,
        );
      if (String(problemDescription).length > 500)
        throw new apierr(
          "Problem description must be 500 characters or less",
          400,
        );
      if (!["asap", "scheduled"].includes(bookingType))
        throw new apierr("Invalid booking type", 400);
      if (bookingType === "scheduled" && !scheduledDate)
        throw new apierr("Scheduled date is required", 400);
      if (bookingType === "asap" && scheduledDate)
        throw new apierr("ASAP booking cannot have a scheduled date", 400);

      const lat = Number(latitude),
        lon = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon))
        throw new apierr("Valid current location is required", 400);

      const images = (req.files || []).map(
        (file) => `/uploads/${file.filename}`,
      );
      const booking = await ServiceBooking.create({
        user: req.user.id,
        service: String(service).trim(),
        problemDescription: String(problemDescription).trim(),
        images,
        bookingType,
        scheduledDate:
          bookingType === "scheduled" ? new Date(scheduledDate) : null,
        location: { latitude: lat, longitude: lon },
      });
      res
        .status(201)
        .json({
          status: true,
          message: "Service booking created successfully",
          booking,
        });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/bookings", auth, async (req, res, next) => {
  try {
    const bookings = await ServiceBooking.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ status: true, bookings });
  } catch (err) {
    next(err);
  }
});

router.patch("/bookings/:id/cancel", auth, async (req, res, next) => {
  try {
    const booking = await ServiceBooking.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!booking) throw new apierr("Booking not found", 404);
    if (["completed", "cancelled"].includes(booking.status))
      throw new apierr("This booking cannot be cancelled", 400);
    booking.status = "cancelled";
    await booking.save();
    res.json({ status: true, message: "Booking cancelled", booking });
  } catch (err) {
    next(err);
  }
});

/* Worker dashboard APIs */
async function requireWorker(req, res, next) {
  try {
    if (req.user.role !== "worker")
      throw new apierr("Worker access required", 403);
    req.worker = await usermodel.findById(req.user.id);
    if (!req.worker) throw new apierr("Worker not found", 404);
    next();
  } catch (err) {
    next(err);
  }
}

router.get("/worker/profile", auth, requireWorker, (req, res) => {
  const w = req.worker;
  res.json({
    id: w._id,
    name: w.name,
    email: w.email,
    phone: w.phone,
    address: w.address,
    role: w.role,
    initial: (w.name || "W")[0].toUpperCase(),
    fieldOfWork: w.fieldOfWork || "Service Worker",
    experience: w.experience ?? 0,
    workLocation: w.workLocation || "",
    work: [
      w.fieldOfWork || "Service Worker",
      w.experience != null ? `${w.experience} years experience` : "",
    ]
      .filter(Boolean)
      .join(" · "),
    description:
      w.description ||
      "Reliable local service professional helping neighbours with everyday service needs.",
    completion: Number(w.profileCompletion || 70),
    rating: Number(w.rating || 4.8),
    available: Boolean(w.available),
    earnings: Number(w.earnings || 0),
  });
});

router.put("/worker/profile", auth, requireWorker, async (req, res, next) => {
  try {
    const { name, work, description } = req.body || {};
    if (name) req.worker.name = String(name).trim();
    if (work) {
      const parts = String(work).split(" · ");
      req.worker.fieldOfWork = parts[0].trim();
      const match = String(work).match(/(\d+(?:\.\d+)?)\s*years?/i);
      if (match) req.worker.experience = Number(match[1]);
    }
    if (description !== undefined)
      req.worker.description = String(description).trim();
    await req.worker.save();
    res.json({ status: true, message: "Profile updated", profile: req.worker });
  } catch (err) {
    next(err);
  }
});

router.get("/worker/dashboard", auth, requireWorker, async (req, res, next) => {
  try {
    const [jobs, completed] = await Promise.all([
      ServiceBooking.countDocuments({
        status: { $in: ["pending", "assigned", "in-progress"] },
      }),
      ServiceBooking.countDocuments({ status: "completed", user: req.user.id }),
    ]);
    res.json({
      earnings: Number(req.worker.earnings || 0),
      jobs: jobs,
      profileCompletion: Number(req.worker.profileCompletion || 70),
      rating: Number(req.worker.rating || 4.8),
      availability: Boolean(req.worker.available),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/worker/earnings", auth, requireWorker, (req, res) => {
  res.json(
    Array.isArray(req.worker.earningsHistory) ? req.worker.earningsHistory : [],
  );
});

router.patch(
  "/worker/availability",
  auth,
  requireWorker,
  async (req, res, next) => {
    try {
      req.worker.available = Boolean(req.body?.available);
      await req.worker.save();
      res.json({ status: true, available: req.worker.available });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/worker/jobs", auth, requireWorker, async (req, res, next) => {
  try {
    const jobs = await ServiceBooking.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ status: true, jobs });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/worker/jobs/:id/accept",
  auth,
  requireWorker,
  async (req, res, next) => {
    try {
      const booking = await ServiceBooking.findOneAndUpdate(
        { _id: req.params.id, status: "pending" },
        { status: "assigned", worker: req.worker._id },
        { new: true },
      );
      if (!booking) throw new apierr("Job is no longer available", 409);
      res.json({ status: true, message: "Service request accepted", booking });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/worker/welfare", auth, requireWorker, async (req, res) => {
  res.json({
    status: true,
    benefits: [],
    message: "Worker welfare information will be available here.",
  });
});

module.exports = router;
