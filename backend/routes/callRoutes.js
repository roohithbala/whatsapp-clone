const express = require("express");
const Call = require("../models/Call");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// GET call history for current user
router.get("/", verifyToken, async (req, res) => {
  try {
    const calls = await Call.find({
      $or: [{ callerId: req.userId }, { receiverId: req.userId }],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(calls);
  } catch (error) {
    console.error("Error fetching calls:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// LOG a completed call (called from frontend when call ends)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { receiverId, type, status, duration, startedAt, endedAt } = req.body;

    if (!receiverId) return res.status(400).json({ error: "receiverId required" });

    const [caller, receiver] = await Promise.all([
      User.findOne({ userId: req.userId }).select("userId username"),
      User.findOne({ userId: receiverId }).select("userId username"),
    ]);

    if (!caller || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    const call = new Call({
      callerId: caller.userId,
      callerUsername: caller.username,
      receiverId: receiver.userId,
      receiverUsername: receiver.username,
      type: type || "audio",
      status: status || "ended",
      duration: duration || 0,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: endedAt ? new Date(endedAt) : new Date(),
    });

    await call.save();
    res.status(201).json(call);
  } catch (error) {
    console.error("Error logging call:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE a call record from history
router.delete("/:callId", verifyToken, async (req, res) => {
  try {
    const call = await Call.findOne({ callId: req.params.callId });
    if (!call) return res.status(404).json({ error: "Call not found" });
    if (call.callerId !== req.userId && call.receiverId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await Call.findByIdAndDelete(call._id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// MISSED call count (for badge)
router.get("/missed-count", verifyToken, async (req, res) => {
  try {
    const count = await Call.countDocuments({
      receiverId: req.userId,
      status: "missed",
      createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // last 7 days
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
