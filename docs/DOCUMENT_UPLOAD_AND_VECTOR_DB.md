# Document Upload and Vector DB

This doc covers: making the **document processor** available, **permissions** for upload/storage, and **verifying** that embeddings are stored in the Vector DB.

---

## 1. Document processor (collector) must be running

The UI shows **"Document Processor Unavailable"** when the server cannot reach the document processor (collector) on `COLLECTOR_PORT` (default **8888**).

- **Docker:** The collector runs automatically in the same container as the server. No extra step.
- **Local dev:** Start the collector from the project root:
  ```bash
  cd collector && yarn dev
  ```
  Keep it running in a separate terminal while using the app. The Documents tab will enable once the server detects the collector (it re-checks every 10 seconds if currently offline).

Uploaded files are written to the **hotdir** (e.g. `collector/hotdir`). The server creates this directory if it does not exist when you upload; the collector also ensures it exists on startup.

---

## 2. Permissions (upload and storage)

Ensure the process that runs the **server** and the **collector** has:

- **Read/write** to the upload directory used by the server for the hotdir:
  - Dev: `server/../collector/hotdir` (i.e. `collector/hotdir`)
  - Production: `path.resolve(STORAGE_DIR, '../../collector/hotdir')` (or the same path as the collector's `WATCH_DIRECTORY`)
- **Read/write** to `STORAGE_DIR` (and thus to `storage/documents`, `storage/vector-cache`, `storage/lancedb`, etc.).

If you use a custom `STORAGE_DIR`, create it and give the app user ownership or write access so the server and collector can create files and folders there.

---

## 3. Verifying embeddings in the Vector DB

To confirm that documents were processed and their embeddings are stored:

1. From the **server** directory (and with the same env as the running app, e.g. `.env` or `.env.development`):
   ```bash
   cd server
   node scripts/list-vector-db-data.js
   ```
   This prints:
   - Source documents under `storage/documents/custom-documents/`
   - Vector cache under `storage/vector-cache/`
   - LanceDB tables (when `VECTOR_DB=lancedb`) under `storage/lancedb/`

2. To limit output to a specific workspace (LanceDB namespace):
   ```bash
   node scripts/list-vector-db-data.js <workspace-slug>
   ```
   Example: `node scripts/list-vector-db-data.js chatbotia`

3. If you use a different Vector DB (e.g. Chroma, Pinecone), the script only lists LanceDB; check that provider's UI or API to verify embeddings.

If a file appears in **source documents** but has no or empty chunks in the Vector DB, re-run **Update embeddings** for that workspace (or re-upload the file after fixing any "Access Denied" or processor errors).

---

## 4. "Access Denied" and "I have no data from the file (e.g. ABC Statement.jpg)"

### What's going on

- **If you added a link (URL)** to the file (e.g. `https://.../ABC%20Statement.jpg` on Huawei OBS or S3):  
  The app fetches that URL. If the server returns **403 Access Denied** (or an XML/HTML error page), that **error page** is what gets stored and embedded — not the image. The chatbot then only "sees" the error text (e.g. "Access Denied"), so it correctly says it has no useful data from the file.

- **If you uploaded the file directly:**  
  The document processor does **not** support image-only formats (e.g. `.jpg`, `.png`). Only text-based types and PDF, DOCX, etc. are supported. So a direct upload of `ABC Statement.jpg` may be rejected or not processed as document content.

### What to do

1. **For a link to the file (e.g. OBS/S3):**
   - Make the object **publicly readable**, or use a **signed URL** that the app can fetch without auth.
   - Re-add the link in Documents. The collector will now reject clear "Access Denied" error pages and show a message instead of storing them.
   - Note: even if the URL returns the image bytes, the system does not extract text from images; it expects HTML/text. For images you need a supported document format (see below).

2. **For the actual file (so the chatbot can use its content):**
   - Use a **supported format**: e.g. export/save as **PDF** or **DOCX**, then upload that file (or a working link to it). The app can then extract text and embed it.
   - Image-only files (`.jpg`, `.png`) are not supported for ingestion; the app does not perform OCR or image-to-text in this flow.
