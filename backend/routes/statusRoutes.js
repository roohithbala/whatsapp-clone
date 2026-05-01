const express = require("express");
const Status = require("../models/Status");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

// GET all active statuses for contacts
// Currently returning all active statuses globally for simplicity. In production, filter by contacts.
router.get("/", verifyToken, async (req, res) => {
  try {
    const activeStatuses = await Status.find({
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    // Group by user
    const grouped = activeStatuses.reduce((acc, status) => {
      if (!acc[status.userId]) acc[status.userId] = [];
      acc[status.userId].push(status);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error("Error fetching statuses:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new status
router.post("/", verifyToken, async (req, res) => {
  try {
    const { mediaUrl, text } = req.body;
    
    if (!mediaUrl && !text) {
      return res.status(400).json({ error: "Either mediaUrl or text is required" });
    }

    const newStatus = new Status({
      userId: req.userId, // from verifyToken middleware
      mediaUrl,
      text
    });

    await newStatus.save();
    res.status(201).json(newStatus);
  } catch (error) {
    console.error("Error creating status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
