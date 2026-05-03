import { useState, useMemo } from "react";
import { toDisplayName } from "../utils/formatters";

export const useChatList = (users, conversationMeta, railMode, currentUser, activeChat) => {
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
  };

  const filteredUsers = useMemo(() => {
    let list = users || [];
    
    if (railMode === "archived") {
       list = list.filter(user => currentUser?.archivedChats?.some(id => String(id) === String(user.userId)));
    } else if (railMode === "locked") {
       list = list.filter(user => currentUser?.lockedChats?.some(id => String(id) === String(user.userId)));
    } else if (railMode === "messages") {
       list = list.filter(user => 
         !currentUser?.archivedChats?.some(id => String(id) === String(user.userId)) && 
         !currentUser?.lockedChats?.some(id => String(id) === String(user.userId))
       );
       // Hide community groups only in Unread/Favorites to avoid clutter
       if (quickFilter === "unread" || quickFilter === "favorites") {
          list = list.filter(user => !user.isCommunityGroup);
       }
    }

    if (!searchTerm) {
      if (railMode === "messages") {
        const activeCount = list.filter(u => conversationMeta[u.userId]).length;
        if (activeCount === 0 && quickFilter === "all") {
          return list;
        }

        if (quickFilter === "all") {
          list = list.filter(user => 
            conversationMeta[user.userId] || 
            (activeChat && user.userId === activeChat.userId)
          );
        }
      }
      // For archived/locked, we show everything that matches the railMode filter
    } else {
      list = list.filter(user => toDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (railMode === "messages") {
      if (quickFilter === "unread") {
        list = list.filter(user => conversationMeta[user.userId]?.unreadCount > 0);
      } else if (quickFilter === "favorites") {
        list = list.filter(user => currentUser?.favoriteUsers?.some(id => String(id) === String(user.userId)));
      } else if (quickFilter === "groups") {
        list = list.filter(user => user.isGroup);
      } else if (quickFilter === "communities") {
        list = list.filter(user => user.isGroup && user.isCommunityGroup);
      }
    }
    
    // Always hide blocked users unless searching or specifically looking at blocked list (not implemented yet)
    list = list.filter(user => !currentUser?.blockedUsers?.some(id => String(id) === String(user.userId)));

    // Sort: Favorites first, then by last message time (if available)
    list.sort((a, b) => {
      const aFav = currentUser?.favoriteUsers?.some(id => String(id) === String(a.userId));
      const bFav = currentUser?.favoriteUsers?.some(id => String(id) === String(b.userId));
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      
      const aTime = conversationMeta[a.userId]?.lastMessage?.createdAt || 0;
      const bTime = conversationMeta[b.userId]?.lastMessage?.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    return list;
  }, [users, searchTerm, quickFilter, conversationMeta, railMode, currentUser, activeChat]);

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
