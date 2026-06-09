const User = require("../models/User");

const verifyAdmin = async (req, res, next) => {
  try {
    let user = req.user;
    if (!user) {
      user = await User.findOne({ userId: req.userId }).lean();
    }
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ error: "Internal server error during authorization verification." });
  }
};

module.exports = { verifyAdmin };
