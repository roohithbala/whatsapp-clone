# Humbletree Messaging Platform (Frontend)

Humbletree is a premium, secure, and feature-rich messaging application built with React and Socket.IO. It provides a real-time communication experience with a stunning, high-performance UI built on a glassmorphic design system.

## 🚀 Key Features

- **Real-time Communication**: Instant message delivery and presence synchronization via Socket.IO.
- **WebRTC Video & Audio Calls**: True peer-to-peer calls with synthetic Web Audio API ringtones, connection state detection, and proper call logging.
- **Two-Step Verification (2SV)**: Advanced security with 4-digit PIN protection for locked chats and sensitive sections.
- **Locked & Archived Chats**: Organize and protect your conversations with dedicated folders and secure access controls.
- **Rich Media Support**: Share images, videos, and documents with automatic validation and a high-quality full-screen previewer.
- **Communities & Groups**: Scalable communication for teams and large organizations, with nested group management and member invites.
- **Status/Stories**: Post text or media status updates with a premium full-screen story viewer.
- **Meta AI Sidebar**: Frosted-glass AI assistant panel with suggestion capsules and auto-resizing text input.
- **Premium UI/UX**: Dark mode, glassmorphism, smooth micro-animations, and consistent spacing/alignment across all panels.

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Framework** | [React.js](https://reactjs.org/) 18 |
| **Routing** | React Router |
| **State Management** | React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`) |
| **Styling** | Vanilla CSS3 with CSS Custom Properties (Variables), TailwindCSS utilities |
| **Real-time** | [Socket.IO-client](https://socket.io/) |
| **API Client** | [Axios](https://axios-http.com/) |
| **Calling** | WebRTC (`RTCPeerConnection`) + Web Audio API synthetic ringtones |
| **Build Tool** | [Vite](https://vitejs.dev/) |

## 📦 Getting Started

1. **Installation**:
   ```bash
   npm install
   ```

2. **Development Mode**:
   ```bash
   npm run dev
   # Runs on http://localhost:5173
   ```

3. **Production Build**:
   ```bash
   npm run build
   ```

## 📂 Key Components

| File | Purpose |
|------|---------|
| `src/pages/ChatPage.jsx` | Root layout: sidebar rail, chat list, chat window |
| `src/components/chat/window/CallWindow.jsx` | WebRTC calling overlay with ringtone engine |
| `src/components/chat/window/MessageItem.jsx` | Individual message bubble with ticks, reactions, media |
| `src/components/chat/list/SidebarRail.jsx` | Navigation rail with section switcher |
| `src/components/chat/sidebar/SidebarCommunities.jsx` | Communities panel |
| `src/components/chat/sidebar/SidebarMetaAI.jsx` | AI assistant sidebar |
| `src/styles/Variables.css` | Design token CSS variables for theming |
| `src/index.css` | Global styles and dark/light theme definitions |

## 🔒 Security Architecture

- **JWT Session Management**: Access tokens (7d) and refresh tokens (30d) for persistent, secure sessions.
- **Client-side PIN Validation**: Encrypted session handling for app-locked sections.
- **File Integrity**: Validation for all outgoing attachments (size and type).
- **Automatic Token Refresh**: Transparent token rotation on expiry.

---
Developed with ❤️ by the Humbletree Team.
