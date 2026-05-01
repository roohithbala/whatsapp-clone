# User Module & Profile Guide

The User Module handles all aspects of identity, profile management, and privacy within the WhatsApp clone.

## 👤 Profile Management
- **Editable Identity**: Users can update their **Display Name** and **About** (Bio) directly from the sidebar profile view.
- **Dynamic Avatars**: Automated initial-based avatars for all users.
- **Privacy Settings**: Integrated **App Lock** via PIN to protect user data locally.

## 🔑 Authentication
- **Secure JWT**: State-of-the-art token-based authentication.
- **Persistence**: Login status persists across sessions using `localStorage` token storage.

## 📡 Live Presence
- **Online/Offline Status**: Real-time updates via Socket.io.
- **Last Seen**: Accurate timestamps showing when a contact was last active.

## 🛠️ Components
- `SidebarProfile.js`: The primary interface for viewing and editing profile data.
- `AppLock.js`: The security layer for PIN protection.
- `useAuth.js`: Hook for managing login/signup state.
