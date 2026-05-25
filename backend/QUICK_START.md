# 🚀 Backend Quick Start Guide

Welcome to the **Humbletree Backend Engine**. This guide will help you set up and run the high-performance, dual-database real-time messaging server in minutes.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **SQLite3** (Automatically managed by the server via SQLite driver)

---

## 🛠️ Step-by-Step Setup

Follow these steps to launch the backend service:

### 1. Install Dependencies
Navigate to the backend directory and install all required packages:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy the template `.env.example` file and create your custom `.env` file:
```bash
cp .env.example .env
```

Open the newly created `.env` file and set the required variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27015/whatsapp-clone
JWT_SECRET=your_jwt_signing_secret_key
JWT_EXPIRES_IN=7d
EMAIL_USER=your_nodemailer_email@gmail.com
EMAIL_PASS=your_nodemailer_app_password
```

### 3. Start the Server
Run the backend in development mode with automatic reload support:
```bash
npm run dev
```

For production deployment:
```bash
npm start
```

---

## 🔄 Dual Database & Synchronization

The backend implements a high-availability **hybrid database architecture**:
- **MongoDB** acts as the primary persistent database for all core entities (Users, Chats, Communities).
- **SQLite3** acts as a local cache/mirror layer for low-latency queries and authentication verification.
- **Auto-Sync**: On server startup, a background synchronization script (`db/sync.js`) automatically reconciles data between MongoDB and SQLite3. You do not need to manually initialize schemas or run migration scripts.

---

## 🧪 Verifying the Backend

To verify that the backend is fully operational:

1. **Check Server Status**: The console should display:
   ```text
   Server running on port 5000
   Connected to MongoDB successfully!
   SQLite Database initialized.
   [Sync] Starting database synchronization...
   [Sync] Synchronization completed successfully.
   ```
2. **Test REST API**: Send a `GET` request to `http://localhost:5000/api/users/check` or any status endpoint to ensure it returns success.
3. **Verify SQLite State**: Run the state checker script to inspect cached users:
   ```bash
   node check_db_state.js
   ```

---

## 🆘 Troubleshooting

- **MongoDB Connection Error**:
  - Verify that your local MongoDB service is active (`mongod` process) or your MongoDB Atlas URI is correct and includes credentials.
  - Verify network firewall rules permit connections to port `27015` or `27017`.
- **SQLite Database Locked**:
  - Ensure no other database browser or command line tool is holding an active write lock on `database.sqlite`.
- **Nodemailer/Authentication Failures**:
  - When configuring password reset emails, use a valid Google App Password instead of your primary account password if using Gmail.

---
© 2026 Humbletree Messaging. All rights reserved.
