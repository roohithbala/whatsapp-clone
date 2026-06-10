const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Session = require("../models/Session");
const sql = require("../db/sql");

const JWT_SECRET = process.env.JWT_SECRET || "temp_dev_secret_key_not_for_production";
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== "test") {
  console.warn("WARNING: JWT_SECRET is not configured in environment variables. Falling back to a temporary development key.");
}

// Helper to parse OS, Browser, and Device from User Agent string
const parseUserAgent = (ua) => {
  if (!ua) return { browser: "Unknown Browser", os: "Unknown OS", deviceType: "Desktop" };
  let browser = "Unknown Browser", os = "Unknown OS", deviceType = "Desktop";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) deviceType = "Mobile";
  else if (/ipad|tablet|playbook|silk/i.test(ua)) deviceType = "Tablet";

  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  if (/edg/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|iceweasel/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  return { browser, os, deviceType };
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Google Auth
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Google credential token is required" });

    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let payload;
    try {
      const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email?.trim().toLowerCase();
    let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      let username = name?.replace(/\s+/g, "").toLowerCase() || normalizedEmail.split("@")[0];
      const existing = await User.findOne({ username });
      if (existing) username = username + Math.floor(Math.random() * 9999);

      user = new User({ username, email: normalizedEmail, googleId, authProvider: "google", profilePicture: picture || null, password: null });
    } else {
      if (!user.googleId) { user.googleId = googleId; user.authProvider = "google"; }
      if (!user.profilePicture && picture) user.profilePicture = picture;
    }

    if (user.isSuspended) {
      return res.status(403).json({
        error: `Your account has been suspended by an administrator. Reason: ${user.suspensionReason || "Violating community guidelines."}`,
        code: "ACCOUNT_SUSPENDED",
        userId: user.userId,
        email: user.email,
        username: user.username,
        reason: user.suspensionReason || "Violating community guidelines.",
      });
    }

    const mongoose = require("mongoose");
    const sessionId = new mongoose.Types.ObjectId().toString();
    const ua = req.headers["user-agent"] || "";
    const uaParsed = parseUserAgent(ua);

    const session = new Session({
      sessionId, userId: user.userId,
      ipAddress: req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "Unknown",
      userAgent: ua, browser: uaParsed.browser, os: uaParsed.os, deviceType: uaParsed.deviceType
    });
    await session.save();

    const token = jwt.sign({ userId: user.userId, sessionId }, JWT_SECRET, { expiresIn: "7d" });
    const refreshToken = jwt.sign({ userId: user.userId, sessionId }, JWT_SECRET, { expiresIn: "30d" });

    user.refreshToken = refreshToken;
    user.isOnline = true;
    await user.save();

    res.status(isNewUser ? 201 : 200).json({
      message: isNewUser ? "Account created with Google" : "Login with Google successful",
      token, refreshToken,
      user: {
        userId: user.userId, username: user.username, email: user.email, profilePicture: user.profilePicture,
        status: user.status, isOnline: user.isOnline, createdAt: user.createdAt, theme: user.theme,
        isAppLocked: user.isAppLocked, hasPin: !!user.appPin, authProvider: user.authProvider,
        archivedChats: user.archivedChats || [], lockedChats: user.lockedChats || [],
        blockedUsers: user.blockedUsers || [], favoriteUsers: user.favoriteUsers || [],
        role: user.role || "user", isSuspended: user.isSuspended || false
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during Google authentication" });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!username || !email || !password || !confirmPassword) return res.status(400).json({ error: "All fields are required" });
    if (password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    if (!validateEmail(email)) return res.status(400).json({ error: "Invalid email format" });
    if (username.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters" });

    const existingUserMongo = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUserMongo) {
      return res.status(409).json({ error: existingUserMongo.email === email ? "Email already exists" : "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    const userId = user.userId;

    await sql.run('INSERT INTO users_auth (userId, email, password) VALUES (?, ?, ?)', [userId, email, hashedPassword]);

    const mongoose = require("mongoose");
    const sessionId = new mongoose.Types.ObjectId().toString();
    const ua = req.headers["user-agent"] || "";
    const uaParsed = parseUserAgent(ua);

    const session = new Session({
      sessionId, userId,
      ipAddress: req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "Unknown",
      userAgent: ua, browser: uaParsed.browser, os: uaParsed.os, deviceType: uaParsed.deviceType
    });
    await session.save();

    const token = jwt.sign({ userId, sessionId }, JWT_SECRET, { expiresIn: "7d" });
    const refreshToken = jwt.sign({ userId, sessionId }, JWT_SECRET, { expiresIn: "30d" });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: "User registered successfully", token, refreshToken,
      user: { userId: user.userId, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    let user;
    let authData = await sql.get('SELECT * FROM users_auth WHERE email = ?', [email]);

    if (authData) {
      const isPasswordValid = await bcrypt.compare(password, authData.password);
      if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });
      user = await User.findOne({ userId: authData.userId });
      if (!user) return res.status(404).json({ error: "User profile not found" });
    } else {
      user = await User.findOne({ email });
      if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

      await sql.run('INSERT OR REPLACE INTO users_auth (userId, email, password) VALUES (?, ?, ?)', [user.userId, user.email, user.password]);
    }

    // Block banned accounts — return special code so frontend shows appeal screen
    if (user.isSuspended) {
      return res.status(403).json({
        error: `Your account has been suspended by an administrator. Reason: ${user.suspensionReason || "Violating community guidelines."}`,
        code: "ACCOUNT_SUSPENDED",
        userId: user.userId,
        email: user.email,
        username: user.username,
        reason: user.suspensionReason || "Violating community guidelines.",
      });
    }

    const mongoose = require("mongoose");
    const sessionId = new mongoose.Types.ObjectId().toString();
    const ua = req.headers["user-agent"] || "";
    const uaParsed = parseUserAgent(ua);

    const session = new Session({
      sessionId, userId: user.userId,
      ipAddress: req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "Unknown",
      userAgent: ua, browser: uaParsed.browser, os: uaParsed.os, deviceType: uaParsed.deviceType
    });
    await session.save();

    const token = jwt.sign({ userId: user.userId, sessionId }, JWT_SECRET, { expiresIn: "7d" });
    const refreshToken = jwt.sign({ userId: user.userId, sessionId }, JWT_SECRET, { expiresIn: "30d" });

    user.refreshToken = refreshToken; user.isOnline = true;
    await user.save();

    res.json({
      message: "Login successful", token, refreshToken,
      user: {
        userId: user.userId, username: user.username, email: user.email, status: user.status,
        isOnline: user.isOnline, createdAt: user.createdAt, theme: user.theme, isAppLocked: user.isAppLocked,
        hasPin: !!user.appPin, archivedChats: user.archivedChats || [], lockedChats: user.lockedChats || [],
        blockedUsers: user.blockedUsers || [], favoriteUsers: user.favoriteUsers || [],
        role: user.role || "user", isSuspended: user.isSuspended || false,
        privacy: user.privacy || {}, profilePicture: user.profilePicture || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.sessionId) {
      const session = await Session.findOne({ sessionId: decoded.sessionId, userId: decoded.userId });
      if (!session) return res.status(403).json({ error: "Session has been logged out" });

      const token = jwt.sign({ userId: decoded.userId, sessionId: decoded.sessionId }, JWT_SECRET, { expiresIn: "7d" });
      session.lastActiveAt = new Date();
      await session.save();
      res.json({ token });
    } else {
      const user = await User.findOne({ userId: decoded.userId, refreshToken });
      if (!user) return res.status(403).json({ error: "Invalid refresh token" });
      const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token });
    }
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No account found with this email" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const nodemailer = require("nodemailer");
    let transporter;
    const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== "your-gmail-app-password";

    if (isConfigured) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_PORT === "465",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email", port: 587, secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    }

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@whatsappclone.com",
      to: email, subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; rounded-2xl;">
          <h2 style="color: #00a884; text-align: center;">Password Reset Request</h2>
          <p>Hi ${user.username || "User"},</p>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to your email.", resetToken });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await sql.run('INSERT OR REPLACE INTO users_auth (userId, email, password) VALUES (?, ?, ?)', [user.userId, user.email, hashedPassword]);
    res.json({ message: "Password has been updated." });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Submit Ban Appeal (public — no auth needed)
exports.submitBanAppeal = async (req, res) => {
  try {
    const Appeal = require("../models/Appeal");
    const { userId, reason } = req.body;
    if (!userId || !reason || !reason.trim()) {
      return res.status(400).json({ error: "userId and reason are required." });
    }

    const user = await User.findOne({ userId }).lean();
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!user.isSuspended) return res.status(400).json({ error: "Account is not suspended." });

    // Prevent duplicate pending appeals
    const existing = await Appeal.findOne({ userId, status: "pending" });
    if (existing) {
      return res.status(409).json({ error: "You already have a pending appeal. Please wait for admin review." });
    }

    const appeal = new Appeal({
      userId: user.userId,
      email: user.email,
      username: user.username,
      reason: reason.trim(),
    });
    await appeal.save();

    const io = req.app.get("io");
    if (io) {
      io.to("admins").emit("admin:appeal-created", appeal.toObject());
    }

    res.status(201).json({ message: "Your appeal has been submitted. The admin will review it shortly." });
  } catch (error) {
    console.error("submitBanAppeal error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
