# 👤 Humbletree User & Authentication API

This document describes all endpoints in the User & Authentication Module, detailing the request payloads, response structures, and the dual-database cache/fallback system behavior.

---

## 🔑 Authentication Endpoints

All authentication routes interact with both **SQLite3** (for quick caching) and **MongoDB** (for permanent persistent storage).

### 1. User Registration
- **Endpoint**: `POST /api/users/register`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "strongpassword123",
    "confirmPassword": "strongpassword123"
  }
  ```
- **Behavior**: Hashes the password and creates a new document in MongoDB. It concurrently creates cached records in SQLite (`users_auth` and `users_cache`).
- **Response**: Returns a new JWT Access Token and Refresh Token.

### 2. User Login
- **Endpoint**: `POST /api/users/login`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "email": "john@example.com",
    "password": "strongpassword123"
  }
  ```
- **Behavior**: Checks credentials in the SQLite cache first. If not found (cache miss), it queries MongoDB, validates the password, and repopulates the SQLite cache automatically so subsequent logins remain lightning fast.
- **Response**: User profile data, security settings, JWT access token, and refresh token.

### 3. Forgot Password
- **Endpoint**: `POST /api/users/forgot-password`
- **Payload**: `{ "email": "john@example.com" }`
- **Behavior**: Generates a secure, short-lived reset token, saves it to MongoDB, and emails it to the user.

### 4. Reset Password
- **Endpoint**: `POST /api/users/reset-password`
- **Payload**:
  ```json
  {
    "token": "reset_token_from_email",
    "password": "new_secure_password_123",
    "confirmPassword": "new_secure_password_123"
  }
  ```
- **Behavior**: Validates the token against MongoDB. Updates the password in MongoDB and mirrors the new hash in the SQLite `users_auth` table.

---

## 🛡️ Security & 2SV (Two-Step Verification)

### 1. Set Security PIN
- **Endpoint**: `POST /api/users/set-pin`
- **Payload**: `{ "pin": "1234" }` (4-digit numeric string)
- **Security**: Requires active JWT token. Hashes and stores the application-level PIN.

### 2. Verify Security PIN (General)
- **Endpoint**: `POST /api/users/verify-pin`
- **Payload**: `{ "pin": "1234" }`
- **Description**: Validates the PIN against the logged-in user's stored hash.

### 3. Verify Security PIN (Specific Session)
- **Endpoint**: `POST /api/users/:userId/verify-pin`
- **Payload**: `{ "pin": "1234" }`

---

## 👤 Profile & Privacy Settings

All endpoints below require an `Authorization: Bearer <JWT_TOKEN>` header.

### 1. Get User Profile
- **Endpoint**: `GET /api/users/:userId`
- **Response**: Full profile detail, active status, privacy options, and the `hasPin` flag.

### 2. Update Basic Profile
- **Endpoint**: `PUT /api/users/:userId`
- **Payload**: `{ "username": "John Doe", "avatar": "base64_or_url" }`

### 3. Update Settings
- **Endpoint**: `PUT /api/users/:userId/settings`
- **Payload**:
  ```json
  {
    "theme": "dark",
    "disappearingMessages": "off",
    "notifications": true
  }
  ```

### 4. Update Privacy Settings
- **Endpoint**: `PUT /api/users/:userId/privacy`
- **Payload**: `{ "lastSeen": "contacts", "profilePhoto": "everyone", "about": "nobody" }`

---

## 📁 Chat Organization & Social Features

All endpoints below require an `Authorization: Bearer <JWT_TOKEN>` header.

### 1. Toggle Archive Chat
- **Endpoint**: `POST /api/users/archive/:targetId`
- **Behavior**: Toggles the archive status of the conversation with `targetId`.

### 2. Unarchive Chat
- **Endpoint**: `POST /api/users/unarchive/:targetId`

### 3. Toggle Favorite User
- **Endpoint**: `POST /api/users/favorite/:targetId`

### 4. Toggle Block User
- **Endpoint**: `POST /api/users/block/:targetId`

### 5. Unblock User
- **Endpoint**: `POST /api/users/unblock/:targetId`

### 6. Toggle Lock Chat
- **Endpoint**: `POST /api/users/lock/:targetId`
- **Description**: Places the chat with `targetId` under the locked chats section (requires active 2SV PIN).

### 7. Unlock Chat
- **Endpoint**: `POST /api/users/unlock/:targetId`

---

## 👥 Contacts Management

### 1. List Contacts
- **Endpoint**: `GET /api/users/:userId/contacts`

### 2. Add Contact
- **Endpoint**: `POST /api/users/:userId/contacts`
- **Payload**: `{ "contactId": "target_user_id" }`

### 3. Delete Contact
- **Endpoint**: `DELETE /api/users/:userId/contacts/:contactId`

---

## 🚨 System Operations

### 1. Logout
- **Endpoint**: `POST /api/users/logout/:userId`
- **Behavior**: Cleans up active sessions and updates presence to offline.

### 2. Report User / Message
- **Endpoint**: `POST /api/users/report`
- **Payload**: `{ "targetId": "reported_user_id", "reason": "Spam/Harassment" }`
