const User = require("../models/User");
const sql = require("./sql");

async function syncDatabases() {
  try {
    console.log("[DB SYNC] Starting MongoDB <-> SQLite synchronization...");

    // 1. Fetch all users from MongoDB
    const mongoUsers = await User.find({});
    console.log(`[DB SYNC] Found ${mongoUsers.length} users in MongoDB.`);

    // 2. Fetch all rows from SQLite users_auth and users_cache
    const sqliteAuth = await sql.all("SELECT * FROM users_auth");
    const sqliteCache = await sql.all("SELECT * FROM users_cache");

    // Create maps for efficient lookups
    const authMapByEmail = new Map();
    const authMapByUserId = new Map();
    sqliteAuth.forEach(row => {
      if (row.email) authMapByEmail.set(row.email.toLowerCase(), row);
      if (row.userId) authMapByUserId.set(row.userId, row);
    });

    const cacheMapByUserId = new Map();
    sqliteCache.forEach(row => {
      if (row.userId) cacheMapByUserId.set(row.userId, row);
    });

    // 3. Process each MongoDB user
    for (const user of mongoUsers) {
      const userEmailLower = user.email.toLowerCase();
      // Try lookup by email first, then by userId
      const authRow = authMapByEmail.get(userEmailLower) || authMapByUserId.get(user.userId);

      let passwordSynced = false;

      if (authRow) {
        // If MongoDB does not have password, populate it from SQLite
        if (!user.password && authRow.password) {
          user.password = authRow.password;
          await user.save();
          console.log(`[DB SYNC] Migrated password from SQLite to MongoDB for: ${user.email}`);
          passwordSynced = true;
        } 
        // If SQLite email/userId is out of sync or password changed in MongoDB, update SQLite
        else if (user.password && user.password !== authRow.password) {
          await sql.run(
            "UPDATE users_auth SET password = ? WHERE userId = ?",
            [user.password, user.userId]
          );
          console.log(`[DB SYNC] Updated SQLite password cache for: ${user.email}`);
        }
        
        // Ensure email and userId mapping matches in SQLite users_auth
        if (authRow.email.toLowerCase() !== userEmailLower || authRow.userId !== user.userId) {
          await sql.run(
            "INSERT OR REPLACE INTO users_auth (userId, email, password) VALUES (?, ?, ?)",
            [user.userId, user.email, user.password || authRow.password]
          );
          console.log(`[DB SYNC] Synced credentials mapping in SQLite users_auth for: ${user.email}`);
        }
      } else {
        // No SQLite auth row exists. If MongoDB has password, cache it in SQLite
        if (user.password) {
          await sql.run(
            "INSERT INTO users_auth (userId, email, password) VALUES (?, ?, ?)",
            [user.userId, user.email, user.password]
          );
          console.log(`[DB SYNC] Cached password to SQLite users_auth for: ${user.email}`);
        } else {
          console.warn(`[DB SYNC] WARNING: User ${user.email} has no password in MongoDB or SQLite. They will need to perform a password reset.`);
        }
      }

      // Check if user is cached in SQLite users_cache
      const cacheRow = cacheMapByUserId.get(user.userId);
      if (!cacheRow) {
        await sql.run(
          `INSERT OR REPLACE INTO users_cache (
            userId, username, email, profilePicture, status, theme, isOnline, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.userId,
            user.username,
            user.email,
            user.profilePicture || null,
            user.status || "Hey there! I am using WhatsApp.",
            user.theme || "dark",
            user.isOnline ? 1 : 0,
            user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
            user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
          ]
        );
        console.log(`[DB SYNC] Cached profile to SQLite users_cache for: ${user.email}`);
      }
    }

    // 4. Reverse sync: Check if there are any SQLite auth records without corresponding MongoDB users
    for (const authRow of sqliteAuth) {
      const match = mongoUsers.find(u => u.userId === authRow.userId || u.email.toLowerCase() === authRow.email.toLowerCase());
      if (!match) {
        console.warn(`[DB SYNC] WARNING: Found auth record in SQLite for ${authRow.email} but no user in MongoDB. Wiping orphan cache entry...`);
        await sql.run("DELETE FROM users_auth WHERE userId = ?", [authRow.userId]);
      }
    }

    console.log("[DB SYNC] Database sync complete.");
  } catch (error) {
    console.error("[DB SYNC] Error during synchronization:", error);
  }
}

module.exports = { syncDatabases };
