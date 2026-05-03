# Humbletree Messaging Platform (Frontend)

Humbletree is a premium, secure, and feature-rich messaging application built with React and Socket.IO. It provides a real-time communication experience with state-of-the-art security features and a stunning, high-performance UI.

## 🚀 Key Features

*   **Real-time Communication**: Instant message delivery and presence synchronization via Socket.IO.
*   **Two-Step Verification (2SV)**: Advanced security with 4-digit PIN protection for locked chats and sensitive sections.
*   **Locked & Archived Chats**: Organize and protect your conversations with dedicated folders and secure access.
*   **Rich Media Support**: Share images, videos, and documents with automatic validation and preview.
*   **Communities & Groups**: Scalable communication for teams and large organizations.
*   **Premium UI/UX**: A beautiful, responsive interface featuring dark mode, glassmorphism, and smooth micro-animations.

## 🛠️ Technology Stack

*   **Framework**: [React.js](https://reactjs.org/)
*   **State Management**: React Hooks (useState, useEffect, useCallback)
*   **Styling**: Vanilla CSS3 with Modern Variables
*   **Real-time**: [Socket.IO-client](https://socket.io/)
*   **API Client**: [Axios](https://axios-http.com/)

## 📦 Getting Started

1.  **Installation**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file in the root directory (refer to `.env.example`).

3.  **Development Mode**:
    ```bash
    npm run dev
    ```

4.  **Production Build**:
    ```bash
    npm run build
    ```

## 🔒 Security Architecture

The frontend implements a multi-layer security approach:
*   **Client-side PIN Validation**: Encrypted session handling for locked sections.
*   **File Integrity**: Validation for all outgoing attachments (size and type).
*   **Session Management**: Automatic token refresh and secure logout protocols.

---
Developed with ❤️ by the Humbletree Team.
