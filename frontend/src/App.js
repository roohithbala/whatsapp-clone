import { useEffect, useState } from "react";
import ChatPage from "./pages/ChatPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import userService from "./services/userService";
import groupService from "./services/groupService";
import api from "./services/api";
import socket from "./socket";
import AppLock from "./components/chat/AppLock";

// Modular CSS Imports
import "./styles/Variables.css";
import "./styles/Auth.css";
import "./styles/Sidebar.css";
import "./styles/ChatWindow.css";

function App() {
  const [currentUser, setCurrentUser] = useState(userService.getCurrentUser());
  const [currentView, setCurrentView] = useState(currentUser ? "chat" : "login");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [railMode, setRailMode] = useState("messages");
  const [theme, setTheme] = useState(currentUser?.theme || "light");
  const [isLocked, setIsLocked] = useState(currentUser?.isAppLocked);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    if (!currentUser) return;

    if (!socket.connected) {
      socket.connect();
    }

    const registerUser = () => {
      if (currentUser?.userId && socket.connected) {
        socket.emit('register-user', currentUser.userId);
      }
    };

    const handleSocketConnect = () => {
      registerUser();
    };

    const handleSocketConnectError = (err) => {
      console.error('Socket connection error:', err);
    };

    socket.on('connect', handleSocketConnect);
    socket.on('connect_error', handleSocketConnectError);
    registerUser();

    const loadData = async () => {
      if (!currentUser) return;
      try {
        let userList = [];
        try {
          userList = await userService.getAllUsers();
        } catch (e) { console.error("Users fetch failed", e); }

        let groupList = [];
        try {
          groupList = await groupService.fetchMyGroups();
        } catch (e) { console.error("Groups fetch failed", e); }

        const normalizedGroups = groupList.map(g => ({
          ...g,
          userId: g.groupId, 
          username: g.name,
          isGroup: true,
          isCommunityGroup: g.isCommunity
        }));

        setUsers([...userList, ...normalizedGroups]);
      } catch (error) {
        console.error("Critical error in loadData", error);
      }
    };
    loadData();

    socket.on('presence:update', ({ userId, isOnline, lastSeen }) => {
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isOnline, updatedAt: lastSeen || u.updatedAt } : u));
    });

    socket.on('presence:sync', ({ onlineUserIds }) => {
      setUsers(prev => prev.map(u => ({ ...u, isOnline: onlineUserIds.includes(u.userId) })));
    });

    return () => {
      socket.off('connect', handleSocketConnect);
      socket.off('connect_error', handleSocketConnectError);
      socket.off('presence:update');
      socket.off('presence:sync');
    };
  }, [currentUser]);

  const handleLogout = () => {
    userService.removeToken();
    setCurrentUser(null);
    setCurrentView("login");
    socket.disconnect();
  };

  const handleSetTheme = async (newTheme) => {
    setTheme(newTheme);
    if (currentUser) {
      try {
        await userService.updateSettings(currentUser.userId, { theme: newTheme });
        const updatedUser = { ...currentUser, theme: newTheme };
        userService.setCurrentUser(updatedUser);
        setCurrentUser(updatedUser);
      } catch (err) {
        console.error("Failed to update theme on server", err);
      }
    }
  };

  const handleSetLocked = async (locked) => {
    setIsLocked(locked);
    if (currentUser) {
      try {
        await userService.updateSettings(currentUser.userId, { isAppLocked: locked });
        const updatedUser = { ...currentUser, isAppLocked: locked };
        userService.setCurrentUser(updatedUser);
        setCurrentUser(updatedUser);
      } catch (err) {
        console.error("Failed to update lock status on server", err);
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="auth-shell">
        {currentView === "login" ? (
          <Login onSuccess={(data) => { 
            setCurrentUser(data.user); 
            setTheme(data.user.theme || "light");
            setIsLocked(data.user.isAppLocked);
            setCurrentView("chat"); 
          }} />
        ) : currentView === "register" ? (
          <Register onSuccess={() => setCurrentView("login")} />
        ) : (
          <ForgotPassword onBackToLogin={() => setCurrentView("login")} />
        )}
        
        {currentView !== "forgotPassword" && (
          <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
            <button className="text-button" onClick={() => setCurrentView(currentView === "login" ? "register" : "login")}>
              {currentView === "login" ? "Register" : "Login"}
            </button>
            {currentView === "login" && (
              <button className="text-button" onClick={() => setCurrentView("forgotPassword")}>
                Forgot Password?
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {isLocked ? (
        <AppLock onUnlock={() => handleSetLocked(false)} currentUser={currentUser} />
      ) : (
        <ChatPage 
          users={users} currentUser={currentUser} 
          selectedUser={selectedUser} setSelectedUser={setSelectedUser}
          railMode={railMode} setRailMode={setRailMode}
          onLogout={handleLogout}
          setTheme={handleSetTheme} theme={theme}
          setAppLocked={handleSetLocked}
          refreshUserData={async () => {
            const userRes = await api.get(`/users/${currentUser.userId}`);
            userService.setCurrentUser(userRes.data);
            setCurrentUser(userRes.data);
          }}
        />
      )}
    </>
  );
}

export default App;
