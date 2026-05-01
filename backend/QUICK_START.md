# Backend Quick Start

## 🚀 Setup
1. `npm install`
2. Create `.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
3. `npm start` (or `npm run dev` for nodemon)

## 📡 Endpoints

### Auth
- `POST /api/auth/register`: Create a new account.
- `POST /api/auth/login`: Authenticate and receive a JWT.

### Messages
- `GET /api/messages/:userId`: Get chat history with a specific user.
- `POST /api/messages/send`: Send a new message (API alternative to Sockets).

### Users
- `GET /api/users`: Get all registered users.
- `PUT /api/users/profile`: Update current user's profile.

## ⚡ Socket.io Events
- `join`: `socket.emit('join', userId)`
- `sendMessage`: `socket.emit('sendMessage', { to, text, ... })`
- `call-offer`: `socket.emit('call-offer', { to, offer, type })`
