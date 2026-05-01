# Backend Implementation Guide: WhatsApp Clone

This guide covers the Node.js/Express backend architecture for the WhatsApp clone.

## 🏗️ Architecture

### 1. Real-Time Layer (Socket.io)
- **Namespace**: Default `/`
- **Events**:
  - `join`: Associates a socket with a `userId`.
  - `sendMessage`: Broadcasts messages to specific recipients.
  - `typing`: Propagates typing status.
  - `call-offer / call-answer / call-candidate`: Facilitates WebRTC signaling.

### 2. Data Persistence (MongoDB)
- **User Schema**: Handles auth, online status, and profile info (username, email, bio).
- **Message Schema**: Stores text content, media URLs, message status (sent/delivered/seen), and reply metadata.

### 3. API Routes
- **/api/auth**: Login and Signup with JWT generation.
- **/api/messages**: Fetching message history and updating receipts.
- **/api/users**: User discovery and profile updates.

## 🔒 Security
- **Bcrypt**: All passwords are hashed before storage.
- **JWT Middleware**: Ensures that only authenticated requests can access chat data.

## 🚀 Performance
- **Indexes**: MongoDB indexes on `senderId` and `receiverId` for fast message retrieval.
- **Socket Rooms**: Each user joins a private room named after their `userId` for targeted message delivery.
