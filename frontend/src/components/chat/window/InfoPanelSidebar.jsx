import React from "react";
import GroupInfoPanel from "./group/GroupInfoPanel";
import ChannelInfoPanel from "./channel/ChannelInfoPanel";
import ContactInfoPanel from "./contact/ContactInfoPanel";

const InfoPanelSidebar = ({
  showGroupInfo,
  isGroup,
  isChannel,
  selectedUser,
  currentUser,
  users,
  onClose
}) => {
  if (!showGroupInfo) return null;

  if (isGroup) {
    return (
      <GroupInfoPanel 
        group={selectedUser} 
        currentUser={currentUser} 
        users={users}
        onClose={onClose} 
      />
    );
  }

  if (isChannel) {
    return (
      <ChannelInfoPanel 
        channel={selectedUser} 
        currentUser={currentUser} 
        users={users}
        onClose={onClose} 
      />
    );
  }

  return (
    <ContactInfoPanel 
      user={selectedUser} 
      currentUser={currentUser} 
      onClose={onClose} 
    />
  );
};

export default InfoPanelSidebar;
