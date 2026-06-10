const filterUserPrivacy = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return targetUser;
  
  const currentUserIdStr = String(currentUser.userId);
  const targetUserIdStr = String(targetUser.userId);
  
  // If we are looking at our own profile, return it without filtering
  if (currentUserIdStr === targetUserIdStr) {
    return targetUser.toObject ? targetUser.toObject() : targetUser;
  }

  const result = targetUser.toObject ? targetUser.toObject() : { ...targetUser };
  const privacy = targetUser.privacy || {
    lastSeen: "everyone",
    profilePhoto: "everyone",
    about: "everyone",
    readReceipts: true,
    notifications: true
  };

  // 1. Profile photo privacy check
  if (privacy.profilePhoto === "nobody") {
    result.profilePicture = null;
  } else if (privacy.profilePhoto === "contacts") {
    const isContact = targetUser.contacts && targetUser.contacts.some(cId => String(cId) === String(currentUser._id));
    if (!isContact) {
      result.profilePicture = null;
    }
  }

  // 2. About (status) privacy check
  if (privacy.about === "nobody") {
    result.status = "";
  } else if (privacy.about === "contacts") {
    const isContact = targetUser.contacts && targetUser.contacts.some(cId => String(cId) === String(currentUser._id));
    if (!isContact) {
      result.status = "";
    }
  }

  // 3. Last Seen (online status and updatedAt/lastSeen timestamp) check
  if (privacy.lastSeen === "nobody") {
    result.isOnline = false;
    result.updatedAt = null;
  } else if (privacy.lastSeen === "contacts") {
    const isContact = targetUser.contacts && targetUser.contacts.some(cId => String(cId) === String(currentUser._id));
    if (!isContact) {
      result.isOnline = false;
      result.updatedAt = null;
    }
  }

  return result;
};

module.exports = { filterUserPrivacy };
