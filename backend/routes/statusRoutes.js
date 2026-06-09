const express = require("express");
const Status = require("../models/Status");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

// GET all active statuses for contacts
// Currently returning all active statuses globally for simplicity. In production, filter by contacts.
router.get("/", verifyToken, async (req, res) => {
  try {
    const User = require("../models/User");

    // Fetch active statuses from others where current user is allowed to view
    const activeStatuses = await Status.find({
      userId: { $ne: req.userId },
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      $or: [
        { privacyType: "all" },
        { privacyType: "except", privacyList: { $ne: req.userId } },
        { privacyType: "only", privacyList: req.userId }
      ]
    }).sort({ createdAt: -1 }).lean();

    // Also fetch current user's own statuses
    const myStatuses = await Status.find({
      userId: req.userId,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).lean();

    const allRelevant = [...activeStatuses, ...myStatuses];

    // Gather all unique userIds from viewedBy lists to fetch them in one query
    const viewerIds = new Set();
    allRelevant.forEach(status => {
      if (status.viewedBy) {
        status.viewedBy.forEach(v => {
          if (v.userId) viewerIds.add(v.userId);
        });
      }
    });

    // Fetch details of all viewers
    const viewersList = await User.find({ userId: { $in: Array.from(viewerIds) } })
      .select("userId username profilePicture")
      .lean();

    const viewersMap = new Map(viewersList.map(u => [u.userId, u]));

    // Manually map user objects into viewedBy structures
    allRelevant.forEach(status => {
      if (status.viewedBy) {
        status.viewedBy = status.viewedBy.map(v => ({
          ...v,
          userId: viewersMap.get(v.userId) || { userId: v.userId, username: "Unknown" }
        }));
      }
    });
    
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

// GET a single status by ID
router.get("/:statusId", verifyToken, async (req, res) => {
  try {
    const User = require("../models/User");
    const status = await Status.findById(req.params.statusId)
      .populate("userId", "username profilePicture")
      .lean();
    if (!status) return res.status(404).json({ error: "Status not found" });

    // Populate viewedBy manually
    if (status.viewedBy && status.viewedBy.length > 0) {
      const viewerIds = status.viewedBy.map(v => v.userId).filter(Boolean);
      const viewersList = await User.find({ userId: { $in: viewerIds } })
        .select("userId username profilePicture")
        .lean();
      const viewersMap = new Map(viewersList.map(u => [u.userId, u]));
      
      status.viewedBy = status.viewedBy.map(v => ({
        ...v,
        userId: viewersMap.get(v.userId) || { userId: v.userId, username: "Unknown" }
      }));
    }

    res.json(status);
  } catch (error) {
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

    // Find if user already viewed this status
    let existingViewer = status.viewedBy.find(v => String(v.userId) === String(req.userId));

    if (existingViewer) {
      existingViewer.count = (existingViewer.count || 1) + 1;
    } else {
      status.viewedBy.push({ userId: req.userId, count: 1 });
    }

    // Force array modification tracking on Mongoose subdocument arrays
    status.markModified("viewedBy");
    await status.save();
    res.json({ message: "Status marked as viewed" });
  } catch (error) {
    console.error("Error updating status views:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
