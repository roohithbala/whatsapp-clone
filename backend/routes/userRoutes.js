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
    const { username, email, password, confirmPassword } = req.body;

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

    // 1. Create Profile in MongoDB
    const user = new User({ username, email });
    const userId = user.userId;

    // 2. Hash and store Auth in SQLite
    const hashedPassword = await bcrypt.hash(password, 10);
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 1. Authenticate via SQLite
    const authData = await sql.get('SELECT * FROM users_auth WHERE email = ?', [email]);
    if (!authData) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, authData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Fetch Profile from MongoDB
    const user = await User.findOne({ userId: authData.userId });
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
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
        hasPin: !!user.appPin
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
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No account found with this email" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log(`[MOCK EMAIL] To: ${email}, Token: ${resetToken}`);
    res.json({ 
      message: "Password reset instructions sent. Please check your email (mocked in terminal).",
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

    // Update password in SQLite
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await sql.run('UPDATE users_auth SET password = ? WHERE userId = ?', [hashedPassword, user.userId]);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

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

    res.json(user);
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

    const { username, status, profilePicture } = req.body;
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

module.exports = router;
