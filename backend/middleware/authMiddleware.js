const jwt = require("jsonwebtoken");

// Support both secrets for backward compat during transition
const JWT_SECRET = process.env.JWT_SECRET || "Humbletree_Secret_Key_2024_!@#";
const LEGACY_SECRET = "Humbletree_Secret_Key_2024_!@#";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided", code: "NO_TOKEN" });
  }

  // Try primary secret first, then legacy fallback
  const secrets = [JWT_SECRET, LEGACY_SECRET].filter((s, i, a) => a.indexOf(s) === i);
  for (const secret of secrets) {
    try {
      const decoded = jwt.verify(token, secret);
      req.userId = decoded.userId;
      return next();
    } catch (err) {
      // Try next secret
    }
  }
  return res.status(401).json({ error: "Invalid or expired token", code: "INVALID_TOKEN" });
};

module.exports = { verifyToken, JWT_SECRET };
