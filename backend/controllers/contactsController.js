const User = require("../models/User");

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken -resetPasswordToken -resetPasswordExpires");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Search Users
exports.searchUsers = async (req, res) => {
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
};

// Get Contacts
exports.getContacts = async (req, res) => {
  try {
    if (req.userId !== req.params.userId) return res.status(403).json({ error: "Unauthorized" });
    const user = await User.findOne({ userId: req.userId }).populate("contacts", "-password -refreshToken -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add Contact
exports.addContact = async (req, res) => {
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

    res.json({
      message: "Contact added successfully",
      contact: {
        userId: contact.userId, username: contact.username, email: contact.email,
        status: contact.status, isOnline: contact.isOnline, profilePicture: contact.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Remove Contact
exports.removeContact = async (req, res) => {
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
};
