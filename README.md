# 📱 WhatsApp Web Clone — Premium MERN Stack Implementation

A production-grade, feature-rich WhatsApp Web clone built with the **MERN** stack. This application mirrors the official platform's design and functionality, including real-world WebRTC calling, multi-media sharing, and advanced state management.

---

## ✨ Premium Features

### 📞 Real-World Communication

- **WebRTC Video & Audio Calls**: True peer-to-peer calling with live media streams and real-time signaling via Socket.io.
- **Call History & UI**: A premium calling overlay with timers and controls (mute/camera toggle).

### 💬 Advanced Messaging

- **Real-Time Chat**: Powered by Socket.io for zero-latency communication.
- **Media Sharing**: Send and receive Photos, Videos, and Documents.
- **Media Previewer**: High-quality modal preview for all shared media.
- **Message Yourself**: Private self-chat for notes and reminders.
- **Smart Ticks**: Double blue ticks for seen messages, even for self-chats.
- **Typing Indicators**: Live "typing..." feedback.

### 📡 Status & Stories

- **Status Updates**: Share text or media updates that contacts can view.
- **Story Viewer**: Premium, full-screen viewer for status stories.

### 🎨 Design & Personalization

- **Glassmorphic UI**: Modern, state-of-the-art design with `backdrop-filter` and smooth gradients.
- **Dual-Theme Engine**: Crisp Light mode by default and a sleek Dark mode, with a quick-toggle switch in the navigation rail.
- **Editable Profile**: Update your display name and about section in real-time.

---

## 🛠️ Technology Stack

| Architecture | Technologies                                                     |
| ------------ | ---------------------------------------------------------------- |
| **Frontend** | React 18, WebRTC (PeerConnection), Socket.io-client, Vanilla CSS |
| **Backend**  | Node.js, Express, Socket.io, JWT, Mongoose                       |
| **Database** | MongoDB                                                          |
| **Security** | Bcrypt.js, App Lock (PIN-based persistence)                      |

---

## 🚀 Quick Start

### 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running locally or on Atlas)

### ⚙️ Installation

1. **Install Dependencies:**

   ```bash
   # Backend
   cd backend && npm install
   # Frontend
   cd ../frontend && npm install
   ```

2. **Environment Setup (`backend/.env`):**

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

3. **Run the App:**
   ```bash
   # Run Backend (from backend/)
   npm start
   # Run Frontend (from frontend/)
   npm start
   ```

---

## 🔒 Security & Performance

- **PIN-Based App Lock**: Protect your chats with a persistent, local-storage based locking system.
- **JWT Authentication**: Secure sessions with automatic token expiration.
- **Media Optimization**: Efficient rendering of large media files with preview modals.

---

**Developed By Roohith Bala.**
