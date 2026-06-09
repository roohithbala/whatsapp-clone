import { useEffect, useState } from "react";
import ChatPage from "./pages/ChatPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import userService from "./services/userService";
import groupService from "./services/groupService";
import api from "./services/api";
import socket from "./socket";

// Modular CSS Imports Removed (Converted to Tailwind)

function App() {
  const [currentUser, setCurrentUser] = useState(userService.getCurrentUser());
  
  // Parse token from URL if present for password resetting
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("token");
  
  const [currentView, setCurrentView] = useState(
    resetToken ? "resetPassword" : (currentUser ? "chat" : "login")
  );
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [railMode, setRailMode] = useState("messages");
  const [theme, setTheme] = useState(currentUser?.theme || "light");

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Refresh the user profile on startup so role, privacy, and other server-side fields are up-to-date
  useEffect(() => {
    if (!currentUser?.userId) return;
    const token = userService.getToken();
    if (!token) return;
    api.get(`/users/${currentUser.userId}`)
      .then(res => {
        const freshUser = res.data;
        if (freshUser.isSuspended) {
          userService.removeToken();
          setCurrentUser(null);
          setCurrentView("login");
          return;
        }
        userService.setCurrentUser(freshUser);
        setCurrentUser(freshUser);
        if (freshUser.theme && freshUser.theme !== theme) {
          setTheme(freshUser.theme);
        }
      })
      .catch(err => {
        console.error("Failed to refresh user profile on startup:", err);
        if (err.response?.status === 403 && err.response?.data?.code === "ACCOUNT_SUSPENDED") {
          userService.removeToken();
          setCurrentUser(null);
          setCurrentView("login");
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleLogout = async () => {
    try {
      if (currentUser?.userId) {
        await api.post(`/users/logout/${currentUser.userId}`);
      }
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      userService.removeToken();
      setCurrentUser(null);
      setCurrentView("login");
      socket.disconnect();
    }
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

  if (!currentUser) {
    return (
      <div className="auth-shell">
        {/* Background ambient light effects */}
        <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,168,132,0.06)_0%,transparent_70%)] -top-[200px] -left-[200px] pointer-events-none"></div>
        <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,168,132,0.04)_0%,transparent_70%)] -bottom-[100px] -right-[100px] pointer-events-none"></div>

        {currentView === "login" ? (
          <Login 
            onSuccess={(data) => { 
              setCurrentUser(data.user); 
              setTheme(data.user.theme || "light");
              setCurrentView("chat"); 
            }} 
            onNavigate={setCurrentView}
          />
        ) : currentView === "register" ? (
          <Register 
            onSuccess={(data) => {
              setCurrentUser(data.user);
              setTheme(data.user.theme || "light");
              setCurrentView("chat");
            }} 
            onNavigate={setCurrentView}
          />
        ) : currentView === "resetPassword" ? (
          <ResetPassword 
            token={resetToken} 
            onNavigate={(view) => {
              // Clear URL search parameters so reloading doesn't throw them back into reset view
              window.history.replaceState({}, document.title, window.location.pathname);
              setCurrentView(view);
            }} 
          />
        ) : (
          <ForgotPassword onNavigate={setCurrentView} />
        )}
      </div>
    );
  }

  return (
    <>
      <ChatPage 
        users={users} currentUser={currentUser} 
        selectedUser={selectedUser} setSelectedUser={setSelectedUser}
        railMode={railMode} setRailMode={setRailMode}
        onLogout={handleLogout}
        setTheme={handleSetTheme} theme={theme}
        refreshUserData={async () => {
          const userRes = await api.get(`/users/${currentUser.userId}`);
          userService.setCurrentUser(userRes.data);
          setCurrentUser(userRes.data);
        }}
      />
    </>
  );
}

export default App;
