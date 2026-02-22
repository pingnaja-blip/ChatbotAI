/**
 * One-time: rename a user's username.
 * Run from server: node scripts/rename-username.js <currentUsername> <newUsername>
 */
const path = require("path");
const envPath =
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "../../.env.development")
    : path.join(__dirname, "../../.env");
require("dotenv").config({ path: envPath });

const { User } = require("../models/user");

async function main() {
  const currentUsername = process.argv[2];
  const newUsername = process.argv[3];
  if (!currentUsername || !newUsername) {
    console.error("Usage: node scripts/rename-username.js <currentUsername> <newUsername>");
    process.exit(1);
  }

  const user = await User.get({ username: currentUsername });
  if (!user) {
    console.error("User not found:", currentUsername);
    process.exit(1);
  }

  const { success, error } = await User.update(user.id, { username: newUsername });
  if (!success) {
    console.error("Update failed:", error);
    process.exit(1);
  }
  console.log("Username updated: %s -> %s", currentUsername, newUsername);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
