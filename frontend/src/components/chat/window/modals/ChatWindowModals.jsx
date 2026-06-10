import React from "react";
import MessageInfoModal from "./MessageInfoModal";
import ForwardModal from "./ForwardModal";
import DisappearingMessagesModal from "./DisappearingMessagesModal";
import SummaryModal from "./SummaryModal";

const ChatWindowModals = ({
  infoMessage,
  setInfoMessage,
  forwardingMessage,
  setForwardingMessage,
  messageSearchTerm,
  setMessageSearchTerm,
  users,
  currentUser,
  handleForwardMessage,
  isDisappearingModalOpen,
  setIsDisappearingModalOpen,
  disappearingDuration,
  handleSetDisappearingDuration,
  selectedUser,
  isSummaryOpen,
  setIsSummaryOpen,
  messages
}) => {
  return (
    <>
      {infoMessage && (
        <MessageInfoModal 
          message={infoMessage} 
          onClose={() => setInfoMessage(null)} 
          users={users}
          currentUser={currentUser}
        />
      )}

      <ForwardModal 
        forwardingMessage={forwardingMessage}
        setForwardingMessage={setForwardingMessage}
        messageSearchTerm={messageSearchTerm}
        setMessageSearchTerm={setMessageSearchTerm}
        users={users}
        handleForwardMessage={handleForwardMessage}
      />

      <DisappearingMessagesModal
        isOpen={isDisappearingModalOpen}
        onClose={() => setIsDisappearingModalOpen(false)}
        currentDuration={disappearingDuration}
        onSelect={handleSetDisappearingDuration}
        peerName={selectedUser.name || selectedUser.username}
      />

      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        messages={messages}
        chatName={selectedUser.name || selectedUser.username}
      />
    </>
  );
};

export default ChatWindowModals;
