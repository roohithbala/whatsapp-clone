const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Session = require("../models/Session");

const JWT_SECRET = process.env.JWT_SECRET || "temp_dev_secret_key_not_for_production";
const LEGACY_SECRET = process.env.LEGACY_SECRET || "temp_legacy_dev_secret_key";
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== "test") {
  console.warn("WARNING: JWT_SECRET is not configured in authMiddleware. Falling back to temporary keys.");
}

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided", code: "NO_TOKEN" });
  }

  // Try primary secret first, then legacy fallback
  const secrets = [JWT_SECRET, LEGACY_SECRET].filter((s, i, a) => a.indexOf(s) === i);
  let decoded = null;
  for (const secret of secrets) {
    try {
      decoded = jwt.verify(token, secret);
      break;
    } catch (err) {
      // Try next secret
    }
  }

  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token", code: "INVALID_TOKEN" });
  }

  // Attach userId and sessionId
  req.userId = decoded.userId;
  req.sessionId = decoded.sessionId || null;

  // Verify session if sessionId is in token
  if (decoded.sessionId) {
    try {
      const activeSession = await Session.findOne({ sessionId: decoded.sessionId, userId: decoded.userId });
      if (!activeSession) {
        return res.status(401).json({ error: "Session has been logged out", code: "SESSION_LOGGED_OUT" });
      }
      
      // Update session last active time (non-blocking)
      activeSession.lastActiveAt = new Date();
      activeSession.save().catch(err => console.error("Failed to update session lastActiveAt:", err));
    } catch (err) {
      console.error("Session verification database error:", err);
    }
  }

  // Optionally attach full user doc (non-blocking — skip if DB is slow)
  try {
    const user = await User.findOne({ userId: decoded.userId }).lean();
    if (user) req.user = user;
  } catch (_) {
    // Non-fatal — req.userId still set
  }

  return next();
};

module.exports = { verifyToken, JWT_SECRET };
