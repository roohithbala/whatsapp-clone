# 👤 User Module & Profile Guide

The User Module handles all aspects of identity, profile management, and authentication within the WhatsApp clone.

## 🔑 Authentication

- **MongoDB Primary Store**: Hashed passwords are stored in MongoDB as the source of truth for all user data.
- **SQLite Auth Cache**: Credentials are cached in the `users_auth` SQLite table for fast, sub-millisecond authentication lookups.
- **Fallback Login**: On a SQLite cache miss (e.g. new device or cleared cache), login transparently falls back to MongoDB and rebuilds the SQLite cache automatically.
- **Password Reset**: Resets update the password hash in both MongoDB and the SQLite cache via `INSERT OR REPLACE`.
- **Secure JWT**: Token-based authentication with 7-day access tokens and 30-day refresh tokens.
- **Persistence**: Login sessions persist across page refreshes using the stored JWT.

## 👤 Profile Management

- **Editable Identity**: Users can update their Display Name, About/Bio, and Profile Picture directly from the Sidebar Profile view.
- **Dynamic Avatars**: Auto-generated initial-based avatars for every user.
- **Privacy Settings**: Fine-grained control over Last Seen, Profile Photo, About visibility, and Read Receipts.
- **Theme Preference**: Light/Dark theme preference stored server-side in MongoDB.
- **App Lock (PIN)**: Protect chats and the app with a server-side bcrypt-hashed 4-digit PIN.

## 📡 Live Presence

- **Online/Offline Status**: Real-time presence via Socket.io and automatic updates on connect/disconnect.
- **Last Seen**: Accurate timestamps showing when a contact was last active.
- **SQLite Profile Cache**: User profile metadata is cached in `users_cache` for fast lookups and reduced database load.

## 🗄️ Startup Database Sync

On every backend startup, `db/sync.js` automatically:
- Migrates password hashes from SQLite → MongoDB for legacy accounts.
- Populates missing SQLite `users_auth` and `users_cache` entries.
- Removes orphan SQLite rows that no longer have a corresponding MongoDB user.

## 🛠️ Key Components

- `models/User.js`: Mongoose schema with `password` field, privacy settings, and post-save SQLite cache sync hook.
- `db/sync.js`: Bidirectional MongoDB ↔ SQLite synchronization engine.
- `routes/userRoutes.js`: All auth and profile endpoints.
- `SidebarProfile.jsx`: The primary interface for viewing and editing profile data.
