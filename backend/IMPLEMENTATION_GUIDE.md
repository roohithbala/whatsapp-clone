# Humbletree Backend Engine

The Humbletree Backend is a high-availability, secure server architecture designed to handle real-time messaging, presence synchronization, and multi-tenant community management.

## 🏗️ Architecture Overview

The system uses a **hybrid database architecture** to maximize performance, reliability, and security:

| Database | Role | Tables / Collections |
|----------|------|----------------------|
| **MongoDB** | Primary source of truth | Users (with passwords), Messages, Groups, Channels, Communities, Calls, Status |
| **SQLite** | High-speed performance cache | `users_auth` (credentials cache), `users_cache` (profile cache) |

### Data Flow
1. **Write** → Always writes to MongoDB first, then syncs/updates the SQLite cache.
2. **Read (Auth)** → Checks SQLite `users_auth` first; on cache miss, falls back to MongoDB and repopulates the cache.
3. **Startup Sync** → `db/sync.js` runs on every server start to ensure MongoDB and SQLite are fully in sync.

## 🗄️ Database Sync Engine (`db/sync.js`)

Runs automatically on startup and performs:
- Migrates password hashes from SQLite → MongoDB for any legacy users that predate the dual-store setup.
- For users that exist in MongoDB but not in SQLite `users_auth`: inserts their credentials into the cache.
- For users missing from `users_cache`: inserts their profile metadata.
- Detects and removes orphan rows in SQLite that have no corresponding MongoDB user.

## 🚀 Key Modules

| Module | Description |
|--------|-------------|
| **Socket Engine** | Powered by Socket.IO for sub-100ms message delivery, typing indicators, presence updates, and WebRTC call signaling |
| **Auth Service** | JWT-based stateless authentication with access tokens (7d) and refresh token rotation (30d) |
| **Password Reset** | Nodemailer-powered email reset flow using tokens stored in MongoDB; updates both MongoDB and SQLite on completion |
| **Message Processing** | Handles media metadata, reactions, read receipts, and disappearing message logic |
| **Call Logger** | Records call history (caller, receiver, type, duration, status) in MongoDB |
| **Upload Manager** | Multer-based file upload handling with static asset serving |
| **Community Engine** | Creates and manages communities, subgroups, announcement channels, and membership |

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js (LTS v18+) |
| **Framework** | [Express.js](https://expressjs.com/) |
| **Primary DB** | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| **Cache DB** | [SQLite3](https://www.sqlite.org/) |
| **Real-time** | [Socket.IO](https://socket.io/) |
| **Security** | [Bcrypt.js](https://github.com/kelektiv/node.bcrypt.js), [JSONWebToken](https://github.com/auth0/node-jsonwebtoken) |
| **Email** | [Nodemailer](https://nodemailer.com/) |
| **Uploads** | [Multer](https://github.com/expressjs/multer) |

## 📦 Setup & Launch

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment** (`backend/.env`):
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_gmail_address       # Optional
   EMAIL_PASS=your_gmail_app_password  # Optional
   ```

3. **Launch**:
   ```bash
   npm run dev
   ```
   The SQLite schema initializes automatically on first run. The startup sync engine runs immediately after MongoDB connects.

## 🔒 Security Features

- **Dual-Store Auth**: Password hashes stored in MongoDB (source of truth) and cached in SQLite (speed layer).
- **Fail-safe Fallback**: If SQLite auth cache misses, transparently authenticates via MongoDB and rebuilds the cache.
- **PIN Protection**: Server-side Bcrypt hashing for Two-Step Verification (2SV) App Lock.
- **Password Reset Flow**: Time-limited tokens (1 hour) in MongoDB. On reset, both MongoDB and SQLite are updated atomically.
- **JWT Refresh Rotation**: Short-lived access tokens with secure server-side refresh token storage.

---
Designed for Performance. Engineered for Security.
