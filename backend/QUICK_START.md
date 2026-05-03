# Humbletree Quick Start Guide

Welcome to the Humbletree platform. Follow this guide to get your development environment up and running in minutes.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16.x or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)
*   [Git](https://git-scm.com/)

## 🛠️ Installation

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd humbletree
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Update .env with your MONGODB_URI and JWT_SECRET
    npm start
    ```

3.  **Frontend Setup**:
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

## 🔑 Initial Account Creation

1.  Open your browser to `http://localhost:3000`.
2.  Navigate to the **Register** page.
3.  Create your first administrator account.
4.  Once logged in, navigate to **Settings > Security** to configure your 2SV PIN.

## 🧪 Testing the Real-time Engine

To test real-time features (Chat, Reactions, Typing):
1.  Open two different browsers (or one in Incognito mode).
2.  Register/Login with two different users.
3.  Search for the other user and start a conversation.
4.  Notice the instant message delivery and status synchronization.

## 🆘 Support & Troubleshooting

*   **Database Connection**: Ensure your MongoDB service is running.
*   **Socket Issues**: Verify that the backend is running on the correct port (default: 5000) and matches the frontend configuration.
*   **Permissions**: Ensure the `uploads/` directory in the backend has write permissions for media sharing.

---
© 2024 Humbletree Messaging. All rights reserved.
