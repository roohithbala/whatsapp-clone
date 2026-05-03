# Humbletree Backend Engine

The Humbletree Backend is a high-availability, secure server architecture designed to handle real-time messaging, presence synchronization, and multi-tenant community management.

## 🏗️ Architecture Overview

The system uses a hybrid database approach to maximize performance and reliability:
*   **MongoDB**: Primary store for persistent user profiles, complex message threads, community structures, and status stories.
*   **SQLite**: Dedicated high-speed store for authentication credentials and session metadata.

## 🚀 Key Modules

*   **Socket Engine**: Powered by Socket.IO for sub-100ms message delivery and real-time typing/presence indicators.
*   **Authentication**: JWT-based stateless authentication with secure refresh token rotation.
*   **Message Processing**: Handles encryption metadata, reactions, and disappearing message logic.
*   **Resource Management**: Optimized file upload handling and static asset serving.

## 🛠️ Technology Stack

*   **Runtime**: Node.js (LTS)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Databases**: [MongoDB (Mongoose)](https://mongoosejs.com/), [SQLite3](https://www.sqlite.org/)
*   **Security**: [Bcrypt.js](https://github.com/kelektiv/node.bcrypt.js), [JSONWebToken](https://github.com/auth0/node-jsonwebtoken)

## 📦 Deployment & Setup

1.  **Dependency Installation**:
    ```bash
    npm install
    ```

2.  **Environment Configuration**:
    Configure `PORT`, `MONGODB_URI`, and `JWT_SECRET` in your `.env` file.

3.  **Database Migration**:
    The SQLite schema is automatically initialized on the first run.

4.  **Launch**:
    ```bash
    npm start
    ```

## 🔒 Advanced Security Features

*   **PIN Protection**: Server-side Bcrypt hashing for Two-Step Verification (2SV).
*   **Rate Limiting**: Integrated protection against brute-force and DDoS attempts.
*   **Encrypted Payloads**: Support for end-to-end encryption metadata storage.

---
Designed for Performance. Engineered for Security.
