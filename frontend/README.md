# WhatsApp Clone Frontend (React)

The frontend is a modern, responsive React application designed to mirror the WhatsApp Web experience with premium aesthetics and real-time functionality.

## 🚀 Key Modules

### 1. Messaging & Signaling (`ChatWindow.js`)
- Handles real-time message exchange via Socket.io.
- Manages **WebRTC signaling** for audio and video calls.
- Implements replying, typing indicators, and message status receipts.

### 2. Calling UI (`CallWindow.js`)
- A dedicated, high-performance overlay for managing active calls.
- Handles local and remote video streams using `ref` and `RTCPeerConnection`.

### 3. Sidebar Modules
- **Status (`SidebarStatus.js`)**: Creation and viewing of updates.
- **Profile (`SidebarProfile.js`)**: Real-time editing of user metadata.
- **Communities & Channels**: Discovery and management of groups.

### 4. Style System
- **Variables.css**: Defines the global theme palette.
- **Glassmorphism**: Consistent use of blur and transparency for a modern feel.

## 🛠️ Tech Stack
- **React 18** (Hooks & Context)
- **WebRTC** (RTCPeerConnection API)
- **Socket.io-client**
- **Vanilla CSS** (No heavy UI libraries for maximum control)

## 📦 Scripts
- `npm start`: Launch development server.
- `npm run build`: Create production bundle.
- `npm test`: Run unit tests.
