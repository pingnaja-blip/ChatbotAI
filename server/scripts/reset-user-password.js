/**
 * One-time script: set a new password for a user (by username).
 * Run from server dir: node scripts/reset-user-password.js <username> <newPassword>
 * Example: node scripts/reset-user-password.js Somnpong "Regional@2026"
 */
const path = require("path");
const envPath =
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "../../.env.development")
    : path.join(__dirname, "../../.env");
require("dotenv").config({ path: envPath });

const { User } = require("../models/user");

async function main() {
  const username = process.argv[2] || process.env.DEV_ADMIN_USERNAME;
  const newPassword = process.argv[3] || process.env.DEV_ADMIN_PASSWORD;

  if (!username || !newPassword) {
    console.error("Usage: node scripts/reset-user-password.js <username> <newPassword>");
    console.error("Or set DEV_ADMIN_USERNAME and DEV_ADMIN_PASSWORD in .env.development");
    process.exit(1);
  }

  const user = await User.get({ username });
  if (!user) {
    console.error("User not found with username:", username);
    process.exit(1);
  }

  const { success, error } = await User.update(user.id, { password: newPassword });
  if (!success) {
    console.error("Update failed:", error);
    process.exit(1);
  }

  console.log("Password updated successfully for user:", username);
  console.log("You can now log in with this username and the new password.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
