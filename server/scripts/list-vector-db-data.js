/**
 * List and show data stored in the Vector DB and related storage.
 * Run from server dir: node scripts/list-vector-db-data.js [workspace-slug]
 * Examples:
 *   node scripts/list-vector-db-data.js
 *   node scripts/list-vector-db-data.js my-workspace
 */
const path = require("path");
const fs = require("fs");

const envPath =
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "../.env.development")
    : path.join(__dirname, "../.env");
require("dotenv").config({ path: envPath });

const storageDir = process.env.STORAGE_DIR || path.join(__dirname, "../storage");
const vectorCachePath = path.join(storageDir, "vector-cache");
const documentsPath = path.join(storageDir, "documents", "custom-documents");
const lancedbPath = path.join(storageDir, "lancedb");

function truncateVector(arr, max = 5) {
  if (!Array.isArray(arr)) return arr;
  if (arr.length <= max) return arr;
  return [...arr.slice(0, max), `...(${arr.length} total)`];
}

function truncateText(s, maxLen = 200) {
  if (typeof s !== "string") return s;
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + "...";
}

console.log("=== Vector DB stored data ===\n");
console.log("Storage base:", storageDir);
console.log("");

// 1. Source documents
console.log("--- 1. Source documents (server/storage/documents/custom-documents/) ---");
if (!fs.existsSync(documentsPath)) {
  console.log("  (folder not found)\n");
} else {
  const files = fs.readdirSync(documentsPath).filter((f) => f.endsWith(".json"));
  console.log("  Files:", files.length);
  for (const file of files.slice(0, 3)) {
    const fp = path.join(documentsPath, file);
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    console.log("\n  File:", file);
    console.log("    id:", data.id);
    console.log("    title:", data.title);
    console.log("    published:", data.published);
    console.log("    docSource:", data.docSource);
    console.log("    pageContent (preview):", truncateText(data.pageContent || ""));
  }
  if (files.length > 3) console.log("\n  ... and", files.length - 3, "more file(s)");
  console.log("");
}

// 2. Vector cache
console.log("--- 2. Vector cache (server/storage/vector-cache/) ---");
if (!fs.existsSync(vectorCachePath)) {
  console.log("  (folder not found)\n");
} else {
  const cacheFiles = fs.readdirSync(vectorCachePath).filter((f) => f.endsWith(".json"));
  console.log("  Cache files:", cacheFiles.length);
  for (const file of cacheFiles.slice(0, 2)) {
    const fp = path.join(vectorCachePath, file);
    const raw = fs.readFileSync(fp, "utf8");
    const batches = JSON.parse(raw);
    let chunkCount = 0;
    for (const batch of batches) {
      for (const chunk of batch) {
        chunkCount++;
        if (chunkCount > 1) continue;
        console.log("\n  Cache file:", file);
        console.log("    Chunk id:", chunk.id);
        console.log("    Vector length:", chunk.values?.length ?? 0);
        console.log("    Vector (first 5):", truncateVector(chunk.values));
        const meta = chunk.metadata || {};
        console.log("    metadata.title:", meta.title);
        console.log("    metadata.published:", meta.published);
        console.log("    metadata.text (preview):", truncateText(meta.text || ""));
      }
    }
    console.log("    Total chunks in this cache:", chunkCount);
  }
  if (cacheFiles.length > 2) console.log("\n  ... and", cacheFiles.length - 2, "more cache file(s)");
  console.log("");
}

// 3. LanceDB (if in use)
const vectorDb = process.env.VECTOR_DB || "lancedb";
if (vectorDb !== "lancedb") {
  console.log("--- 3. Vector DB ---");
  console.log("  VECTOR_DB is set to:", vectorDb, "(script only lists LanceDB tables)");
  console.log("");
  process.exit(0);
}

console.log("--- 3. LanceDB (server/storage/lancedb/) ---");
if (!fs.existsSync(lancedbPath)) {
  console.log("  (folder not found)\n");
  process.exit(0);
}

(async () => {
  try {
    const lancedb = require("vectordb");
    const client = await lancedb.connect(lancedbPath);
    const dirs = fs.readdirSync(lancedbPath).filter((d) => d.endsWith(".lance"));
    const tables = dirs.map((d) => d.replace(".lance", ""));
    console.log("  Tables (workspaces):", tables.length, tables.join(", ") || "(none)");

    const slug = process.argv[2];
    const toShow = slug ? (tables.includes(slug) ? [slug] : []) : tables.slice(0, 3);

    for (const namespace of toShow) {
      const table = await client.openTable(namespace);
      const count = await table.countRows();
      console.log("\n  Namespace:", namespace, "| Rows (chunks):", count);
      if (count === 0) continue;
      const limit = 2;
      // LanceDB: use search with a zero vector and limit to sample rows
      const sampleVector = new Array(384).fill(0);
      const rows = await table.search(sampleVector).limit(limit).execute();
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        console.log("    Row", i + 1, ":");
        console.log("      id:", row.id);
        console.log("      title:", row.title);
        console.log("      published:", row.published);
        console.log("      text (preview):", truncateText(row.text || ""));
        if (row.vector && Array.isArray(row.vector)) {
          console.log("      vector length:", row.vector.length, "| first 3:", truncateVector(row.vector, 3));
        }
      }
    }
    console.log("");
  } catch (e) {
    console.log("  Error:", e.message);
    console.log("");
  }
})();
