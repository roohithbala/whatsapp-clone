# 🚀 Start Here: WhatsApp Clone Onboarding

Welcome to the premium WhatsApp Web clone. Follow this guide to get up and running in minutes.

## 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running locally or via Atlas)
- [Git](https://git-scm.com/)

## 2. Environment Setup

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail_address          # Optional – for password reset emails
EMAIL_PASS=your_gmail_app_password     # Optional – Gmail App Password
```

### Install & Run
```bash
# Backend
cd backend
npm install
npm run dev       # Runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev       # Runs on http://localhost:5173
```

> On first startup, the backend automatically runs a **database sync** (`db/sync.js`) that:
> - Migrates legacy password hashes from SQLite → MongoDB
> - Populates any missing SQLite auth/cache entries
> - Removes orphaned SQLite rows

## 3. Create Your First Account

1. Open `http://localhost:5173` in your browser.
2. Click **Register** and fill in your username, email, and password.
3. Log in and explore the features.
4. Optionally set a **Security PIN** in Settings → Privacy for app locking.

## 4. Explore Premium Features

| Feature | How to Access |
|---------|--------------|
| 💬 Real-time Chat | Click any contact in the sidebar |
| 📞 Voice/Video Call | Click the phone/camera icon in the chat header |
| 📸 Media Sharing | Use the **+** (attachment) button in the chat input |
| 🌐 Status Updates | Go to the **Status** tab in the sidebar rail |
| 👥 Communities | Go to the **Communities** tab in the sidebar rail |
| 📢 Channels | Go to the **Channels** tab in the sidebar rail |
| 🔒 App Lock | Settings → Privacy → App Lock (requires PIN) |
| 🔑 Forgot Password | On login screen → **Forgot Password** (sends email reset) |
| 🌙 Dark/Light Theme | Toggle the theme icon in the navigation rail |

## 5. Documentation Map

| File | Contents |
|------|----------|
| `README.md` | High-level project overview and tech stack |
| `IMPLEMENTATION_SUMMARY.md` | Architecture deep-dive and feature breakdown |
| `README_USER_MODULE.md` | Authentication, user profiles, and database sync |
| `backend/IMPLEMENTATION_GUIDE.md` | Backend engine architecture |
| `backend/QUICK_START.md` | Backend setup and troubleshooting |
| `backend/USER_HANDLING_API.md` | REST API endpoint reference |

---
