import { useState, useMemo } from "react";
import { toDisplayName } from "../utils/formatters";

export const useChatList = (users, conversationMeta, railMode, currentUser, selectedUser) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [listScope, setListScope] = useState("all");
  const [showNewChatMenu, setShowNewChatMenu] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [appLocked, setAppLockedState] = useState(localStorage.getItem("app-locked") === "true");

  const setAppLocked = (val) => {
    setAppLockedState(val);
    localStorage.setItem("app-locked", val ? "true" : "false");
    if (val) window.location.reload();
  };

  const filteredUsers = useMemo(() => {
    let list = users || [];
    
    if (railMode === "archived") {
       list = list.filter(user => user.isArchived);
    } else if (railMode === "messages") {
       list = list.filter(user => !user.isArchived);
    }

    if (!searchTerm) {
      // By default show active conversations OR if no conversations yet, show everyone for better UX
      const activeCount = list.filter(u => conversationMeta[u.userId]).length;
      if (activeCount === 0) {
        // Show everyone if no active chats yet
        return list;
      }

      list = list.filter(user => 
        conversationMeta[user.userId] || 
        (currentUser && user.userId === currentUser.userId) ||
        (selectedUser && user.userId === selectedUser.userId)
      );
    } else {
      list = list.filter(user => toDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (quickFilter === "unread") {
      list = list.filter(user => conversationMeta[user.userId]?.unreadCount > 0);
    }
    return list;
  }, [users, searchTerm, quickFilter, conversationMeta, railMode, currentUser, selectedUser]);

  return {
    searchTerm, setSearchTerm,
    quickFilter, setQuickFilter,
    listScope, setListScope,
    showNewChatMenu, setShowNewChatMenu,
    showMainMenu, setShowMainMenu,
    isNewChatModalOpen, setIsNewChatModalOpen,
    isNewGroupModalOpen, setIsNewGroupModalOpen,
    isBroadcastModalOpen, setIsBroadcastModalOpen,
    newChatUsername, setNewChatUsername,
    newGroupName, setNewGroupName,
    modalError, setModalError,
    modalLoading, setModalLoading,
    appLocked, setAppLocked,
    filteredUsers
  };
};
