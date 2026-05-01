const express = require("express");
const router = express.Router();
const Community = require("../models/Community");
const Group = require("../models/Group");
const { verifyToken } = require("../middleware/authMiddleware");

// Create a community
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const generalGroup = new Group({
      name: `${name} (General)`,
      description: `Official group for ${name}`,
      members: [req.userId],
      isCommunityGroup: true
    });
    await generalGroup.save();

    const community = new Community({
      name,
      description,
      creatorId: req.userId,
      announcementGroupId: generalGroup._id,
      groups: [generalGroup._id]
    });
    await community.save();
    res.status(201).json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my communities
router.get("/my", verifyToken, async (req, res) => {
  try {
    const communities = await Community.find({ 
      $or: [
        { creatorId: req.userId },
        { groups: { $in: await Group.find({ members: req.userId }).distinct('_id') } }
      ]
    }).populate('announcementGroupId');
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add group to community
router.post("/:id/groups", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.body;
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });
    community.groups.push(groupId);
    await community.save();
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
