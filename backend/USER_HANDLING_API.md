# User Handling & Auth API Reference

## Authentication Flow
1. User registers via `/api/auth/register`.
2. Password hashed with Bcrypt (Salt: 10).
3. User logs in via `/api/auth/login`.
4. Server returns a JWT (Expires in 7 days).
5. Frontend stores JWT and includes it in `Authorization: Bearer <token>` headers for all requests.

## User Metadata
- **username**: Display name (editable).
- **email**: Unique identifier.
- **isOnline**: Managed by Socket.io `connect/disconnect` events.
- **lastSeen**: Timestamp updated on disconnect.
- **avatar**: Initial-based avatar or URL (if provided).

## API Details

### Profile Update
`PUT /api/users/profile`
**Body**: `{ username, bio, avatarUrl }`
**Security**: Requires valid JWT.

### Fetch All Users
`GET /api/users`
Returns a list of all users excluding their password hashes. Used for chat discovery.
