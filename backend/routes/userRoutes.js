require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sql = require("../db/sql");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "Humbletree_Secret_Key_2024_!@#";

// TOGGLE ARCHIVE
router.post("/archive/:targetId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    const { targetId } = req.params;
    if (!user.archivedChats) user.archivedChats = [];
    const isArchived = user.archivedChats.includes(targetId);
    if (isArchived) {
      user.archivedChats = user.archivedChats.filter(id => id !== targetId);
    } else {
      user.archivedChats.push(targetId);
    }
    await user.save();
    res.json({ archived: !isArchived, archivedChats: user.archivedChats });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/unarchive/:targetId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    user.archivedChats = (user.archivedChats || []).filter(id => id !== req.params.targetId);
    await user.save();
    res.json({ success: true, archivedChats: user.archivedChats });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// TOGGLE FAVORITE
router.post("/favorite/:targetId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    const { targetId } = req.params;
    if (!user.favoriteUsers) user.favoriteUsers = [];
    const isFav = user.favoriteUsers.includes(targetId);
    if (isFav) {
      user.favoriteUsers = user.favoriteUsers.filter(id => id !== targetId);
    } else {
      user.favoriteUsers.push(targetId);
    }
    await user.save();
    res.json({ favorite: !isFav, favoriteUsers: user.favoriteUsers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// TOGGLE BLOCK
router.post("/block/:targetId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    const { targetId } = req.params;
    if (!user.blockedUsers) user.blockedUsers = [];
    const isBlocked = user.blockedUsers.includes(targetId);
    if (isBlocked) {
      user.blockedUsers = user.blockedUsers.filter(id => id !== targetId);
    } else {
      user.blockedUsers.push(targetId);
    }
    await user.save();
    res.json({ blocked: !isBlocked, blockedUsers: user.blockedUsers });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/unblock/:targetId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    user.blockedUsers = (user.blockedUsers || []).filter(id => id !== req.params.targetId);
    await user.save();
    res.json({ success: true, blockedUsers: user.blockedUsers });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// TOGGLE LOCK
router.post("/lock/:targetId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    const { targetId } = req.params;
    if (!user.lockedChats) user.lockedChats = [];
    const isLocked = user.lockedChats.includes(targetId);
    if (isLocked) {
      user.lockedChats = user.lockedChats.filter(id => id !== targetId);
    } else {
      user.lockedChats.push(targetId);
    }
    await user.save();
    res.json({ locked: !isLocked, lockedChats: user.lockedChats });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// SET/UPDATE PIN
router.post("/set-pin", verifyToken, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length < 4) return res.status(400).json({ error: "PIN must be at least 4 digits" });
    
    const user = await User.findOne({ userId: req.userId });
    const salt = await bcrypt.genSalt(10);
    user.appPin = await bcrypt.hash(pin, salt);
    await user.save();
    
    res.json({ message: "PIN set successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// VERIFY PIN
router.post("/verify-pin", verifyToken, async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findOne({ userId: req.userId });
    
    if (!user.appPin) return res.status(400).json({ error: "No PIN set" });
    
    const isMatch = await bcrypt.compare(pin, user.appPin);
    if (isMatch) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid PIN" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/unlock/:targetId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    user.lockedChats = (user.lockedChats || []).filter(id => id !== req.params.targetId);
    await user.save();
    res.json({ success: true, lockedChats: user.lockedChats });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// Validation helper
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// REGISTER - Create a new user
router.post("/register", async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters" });
    }

    const existingUserMongo = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUserMongo) {
      return res.status(409).json({
        error: existingUserMongo.email === email ? "Email already exists" : "Username already exists",
      });
    }

    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Create Profile and Auth in MongoDB
    const user = new User({ username, email, password: hashedPassword });
    const userId = user.userId;

    // 3. Cache Auth in SQLite
    await sql.run(
      'INSERT INTO users_auth (userId, email, password) VALUES (?, ?, ?)',
      [userId, email, hashedPassword]
    );

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
    
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      token,
      refreshToken,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// LOGIN - Authenticate user
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 1. Authenticate via SQLite with MongoDB fallback (cache miss handler)
    let user;
    let authData = await sql.get('SELECT * FROM users_auth WHERE email = ?', [email]);

    if (authData) {
      const isPasswordValid = await bcrypt.compare(password, authData.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      user = await User.findOne({ userId: authData.userId });
      if (!user) {
        return res.status(404).json({ error: "User profile not found" });
      }
    } else {
      // SQLite cache miss: query MongoDB directly (source of truth)
      user = await User.findOne({ email });
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Populate SQLite cache for future logins
      await sql.run(
        'INSERT OR REPLACE INTO users_auth (userId, email, password) VALUES (?, ?, ?)',
        [user.userId, user.email, user.password]
      );
      console.log(`[LOGIN] SQLite cache populated for user: ${user.email}`);
    }

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "7d" });
    const refreshToken = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "30d" });

    user.refreshToken = refreshToken;
    user.isOnline = true;
    await user.save();

    res.json({
      message: "Login successful",
      token,
      refreshToken,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        status: user.status,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
        theme: user.theme,
        isAppLocked: user.isAppLocked,
        hasPin: !!user.appPin,
        archivedChats: user.archivedChats || [],
        lockedChats: user.lockedChats || [],
        blockedUsers: user.blockedUsers || [],
        favoriteUsers: user.favoriteUsers || []
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// REFRESH TOKEN
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });
  
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findOne({ userId: decoded.userId, refreshToken });
    if (!user) return res.status(403).json({ error: "Invalid refresh token" });
    
    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No account found with this email" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Nodemailer integration
    const nodemailer = require("nodemailer");
    
    // Create transporter using environment variables or a fallback ethereal test account
    let transporter;
    const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== "your-gmail-app-password";
    
    if (isConfigured) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_PORT === "465",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Fallback: Test account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@whatsappclone.com",
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; rounded-2xl;">
          <h2 style="color: #00a884; text-align: center;">Password Reset Request</h2>
          <p>Hi ${user.username || "User"},</p>
          <p>You requested a password reset for your WhatsApp Clone account. Please click the button below to reset your password. This link is valid for 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #00a884; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #00a884;">${resetUrl}</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 11px; color: #888; text-align: center;">WhatsApp Clone Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    if (!isConfigured) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    res.json({ 
      message: "Password reset link sent to your email.",
      resetToken 
    }); 
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: "Password reset token is invalid or has expired." });
    if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`[RESET PASSWORD] Updating password for userId: ${user.userId}, email: ${user.email}`);

    // 1. Update password in MongoDB (source of truth)
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 2. Update/sync password in SQLite cache
    await sql.run(
      'INSERT OR REPLACE INTO users_auth (userId, email, password) VALUES (?, ?, ?)',
      [user.userId, user.email, hashedPassword]
    );
    console.log(`[RESET PASSWORD] Updated SQLite auth cache for: ${user.email}`);

    res.json({ message: "Password has been updated." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE PRIVACY SETTINGS
router.put("/:userId/privacy", verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });
    const { lastSeen, profilePhoto, about, readReceipts, notifications } = req.body;
    const user = await User.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.privacy) user.privacy = {};
    if (lastSeen !== undefined) user.privacy.lastSeen = lastSeen;
    if (profilePhoto !== undefined) user.privacy.profilePhoto = profilePhoto;
    if (about !== undefined) user.privacy.about = about;
    if (readReceipts !== undefined) user.privacy.readReceipts = readReceipts;
    if (notifications !== undefined) user.privacy.notifications = notifications;
    user.markModified('privacy');
    await user.save();

    res.json({ message: "Privacy settings updated", privacy: user.privacy });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET ALL USERS (Kept for compatibility, but in production we'd only load contacts)
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken -resetPasswordToken -resetPasswordExpires");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// SEARCH USERS
router.get("/search", verifyToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    }).select("-password -refreshToken -resetPasswordToken -resetPasswordExpires");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET CONTACTS
router.get("/:userId/contacts", verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });
    const user = await User.findOne({ userId: req.userId }).populate("contacts", "-password -refreshToken -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADD CONTACT
router.post("/:userId/contacts", verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });
    const { contactId } = req.body;
    
    if (req.userId === contactId) return res.status(400).json({ error: "Cannot add yourself as contact" });

    const user = await User.findOne({ userId: req.userId });
    const contact = await User.findOne({ userId: contactId });
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    if (!user.contacts.includes(contact._id)) {
      user.contacts.push(contact._id);
      await user.save();
    }
    
    res.json({ message: "Contact added successfully", contact: {
      userId: contact.userId,
      username: contact.username,
      email: contact.email,
      status: contact.status,
      isOnline: contact.isOnline,
      profilePicture: contact.profilePicture
    } });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// REMOVE CONTACT
router.delete("/:userId/contacts/:contactId", verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });
    const contactId = req.params.contactId;

    const user = await User.findOne({ userId: req.userId });
    const contact = await User.findOne({ userId: contactId });
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    user.contacts = user.contacts.filter(id => id.toString() !== contact._id.toString());
    await user.save();
    
    res.json({ message: "Contact removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET USER BY ID
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select("-password -refreshToken -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      ...user.toObject(),
      hasPin: !!user.appPin
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE USER PROFILE
router.put("/:userId", verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { username, status, profilePicture, privacy } = req.body;
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (username) user.username = username;
    if (status) user.status = status;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (privacy) user.privacy = { ...user.privacy, ...privacy };

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        status: user.status,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE USER SETTINGS (Theme, PIN, notifications)
router.put("/:userId/settings", verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });

    const { theme, appPin, isAppLocked, notifications, disappearingMessages } = req.body;
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (theme !== undefined) user.theme = theme;
    if (appPin !== undefined) {
      const hashedPin = await bcrypt.hash(String(appPin), 10);
      user.appPin = hashedPin;
    }
    if (isAppLocked !== undefined) user.isAppLocked = isAppLocked;
    if (notifications !== undefined) user.notifications = notifications;
    if (disappearingMessages !== undefined) user.disappearingMessages = disappearingMessages;

    await user.save();

    res.json({
      message: "Settings updated successfully",
      theme: user.theme,
      isAppLocked: user.isAppLocked,
      hasPin: !!user.appPin
    });
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// VERIFY APP PIN
router.post("/:userId/verify-pin", verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });
    const { pin } = req.body;
    const user = await User.findOne({ userId: req.userId });
    
    if (!user || !user.appPin) return res.status(400).json({ error: "No PIN set" });

    const isValid = await bcrypt.compare(pin, user.appPin);
    if (isValid) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid PIN" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// LOGOUT
router.post("/logout/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isOnline = false;
    user.refreshToken = null; // Invalidate refresh token
    await user.save();

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// REPORT USER
router.post("/report", verifyToken, async (req, res) => {
  try {
    const { targetUserId, reason } = req.body;
    if (!targetUserId || !reason) {
      return res.status(400).json({ error: "Target user ID and reason are required" });
    }

    const reporter = await User.findOne({ userId: req.userId });
    const targetUser = await User.findOne({ userId: targetUserId });

    if (!reporter) return res.status(404).json({ error: "Reporter not found" });
    if (!targetUser) return res.status(404).json({ error: "Target user not found" });

    // Send email using nodemailer
    const nodemailer = require("nodemailer");
    
    let transporter;
    const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== "your-gmail-app-password";
    
    if (isConfigured) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_PORT === "465",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const adminEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || "admin@whatsappclone.com";
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@whatsappclone.com",
      to: adminEmail, // User requested "send mail to me" (admin)
      subject: `[USER REPORT] User reported: ${targetUser.username}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 12px;">
          <h2 style="color: #ef4444; text-align: center;">User Report Submitted</h2>
          <p>A user has been reported on the WhatsApp Clone application. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f9fafb;">
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Reporter:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${reporter.username} (ID: ${reporter.userId}, Email: ${reporter.email})</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Reported User:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${targetUser.username} (ID: ${targetUser.userId}, Email: ${targetUser.email})</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Reason / Details:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${reason}</td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px;">This is an automated system notification.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Report email sent successfully: %s", info.messageId);

    res.json({ message: "User reported successfully. Email notification sent to administrator." });
  } catch (error) {
    console.error("Report user error:", error);
    res.status(500).json({ error: "Failed to submit user report" });
  }
});

module.exports = router;
