const express = require("express");
const Status = require("../models/Status");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

// GET all active statuses for contacts
// Currently returning all active statuses globally for simplicity. In production, filter by contacts.
router.get("/", verifyToken, async (req, res) => {
  try {
    // Fetch active statuses from others where current user is allowed to view
    const activeStatuses = await Status.find({
      userId: { $ne: req.userId },
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      $or: [
        { privacyType: "all" },
        { privacyType: "except", privacyList: { $ne: req.userId } },
        { privacyType: "only", privacyList: req.userId }
      ]
    })
    .populate("viewedBy", "username")
    .sort({ createdAt: -1 });

    // Also fetch current user's own statuses
    const myStatuses = await Status.find({
      userId: req.userId,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .populate("viewedBy", "username")
    .sort({ createdAt: -1 });

    const allRelevant = [...activeStatuses, ...myStatuses];
    
    // Group by user
    const grouped = allRelevant.reduce((acc, status) => {
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
    const { mediaUrl, text, type, backgroundColor, fontFamily, privacyType, privacyList } = req.body;
    
    if (!mediaUrl && !text) {
      return res.status(400).json({ error: "Either mediaUrl or text is required" });
    }

    const newStatus = new Status({
      userId: req.userId,
      mediaUrl,
      text,
      type: type || (mediaUrl ? "image" : "text"),
      backgroundColor: backgroundColor || "#25D366",
      fontFamily: fontFamily || "Inter",
      privacyType: privacyType || "all",
      privacyList: privacyList || []
    });

    await newStatus.save();
    res.status(201).json(newStatus);
  } catch (error) {
    console.error("Error creating status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE a status
router.delete("/:statusId", verifyToken, async (req, res) => {
  try {
    const status = await Status.findById(req.params.statusId);
    if (!status) return res.status(404).json({ error: "Status not found" });
    
    if (status.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized to delete this status" });
    }

    await Status.findByIdAndDelete(req.params.statusId);
    res.json({ message: "Status deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// MARK status as viewed
router.post("/:statusId/view", verifyToken, async (req, res) => {
  try {
    const status = await Status.findById(req.params.statusId);
    if (!status) return res.status(404).json({ error: "Status not found" });

    if (!status.viewedBy.includes(req.userId)) {
      status.viewedBy.push(req.userId);
      await status.save();
    }

    res.json({ message: "Status marked as viewed" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
