# Humbletree User & Authentication API

This document outlines the core endpoints for user management, security, and profile synchronization within the Humbletree ecosystem.

## 🔐 Authentication Endpoints

### User Registration
*   **Endpoint**: `POST /api/users/register`
*   **Payload**: `{ username, email, password, confirmPassword }`
*   **Description**: Creates a new user profile in MongoDB and an auth record in SQLite. Returns a JWT and Refresh Token.

### User Login
*   **Endpoint**: `POST /api/users/login`
*   **Payload**: `{ email, password }`
*   **Description**: Validates credentials against SQLite. Returns full user profile metadata and session tokens.

## 🛡️ Security & 2SV

### Set Security PIN
*   **Endpoint**: `POST /api/users/set-pin`
*   **Payload**: `{ pin }` (4 digits)
*   **Description**: Hashes and stores the application-level PIN for two-step verification.

### Verify Security PIN
*   **Endpoint**: `POST /api/users/verify-pin`
*   **Payload**: `{ pin }`
*   **Description**: Validates the entered PIN against the stored hash. Required for accessing locked chats.

## 👤 Profile Management

### Get User Profile
*   **Endpoint**: `GET /api/users/:userId`
*   **Description**: Fetches comprehensive profile data, including online status, privacy settings, and security flags (`hasPin`).

### Update Settings
*   **Endpoint**: `PUT /api/users/:userId/settings`
*   **Payload**: `{ theme, disappearingMessages, notifications, ... }`
*   **Description**: Updates user preferences. Returns updated configuration.

## 📁 Chat Organization

### Archive/Unarchive Chat
*   **Endpoint**: `POST /api/users/archive/:targetId`
*   **Description**: Toggles the archive status of a conversation.

### Lock/Unlock Chat
*   **Endpoint**: `POST /api/users/lock/:targetId`
*   **Description**: Toggles the security lock for a specific chat. Requires an active 2SV PIN.

---
**Note**: All endpoints (except Register/Login) require a valid `Authorization: Bearer <token>` header.
