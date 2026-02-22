# Data Stored in the Vector DB — Listed and Shown

This document **lists** every place data is stored after you upload a file and add it to a workspace, and **shows** real examples from your project.

---

## 1. Source document (before embedding)

**Location:** `server/storage/documents/custom-documents/<name>-<uuid>.json`

One JSON file per uploaded/processed document. This is the **input** to embedding (not the vector DB yet).

### Example from your project

**File:** `server/storage/documents/custom-documents/url-chatbotaibucket_obs.ap-southeast-2.myhuaweicloud.com-ABCpercent20Statement.jpg-aa116416-d5c6-468c-b6a2-d371218023e6.json`

```json
{
  "id": "aa116416-d5c6-468c-b6a2-d371218023e6",
  "url": "file://chatbotaibucket_obs.ap-southeast-2.myhuaweicloud.com-ABCpercent20Statement.jpg.html",
  "title": "chatbotaibucket_obs.ap-southeast-2.myhuaweicloud.com-ABCpercent20Statement.jpg.html",
  "docAuthor": "no author found",
  "description": "No description found.",
  "docSource": "URL link uploaded by the user.",
  "chunkSource": "link://https://chatbotaibucket.obs.ap-southeast-2.myhuaweicloud.com/ABC%20Statement.jpg",
  "published": "2/21/2026, 6:02:24 PM",
  "wordCount": 21,
  "pageContent": "This XML file does not appear to have any style information...\n\n<Error>...",
  "token_count_estimate": 124
}
```

**Fields stored:**

| Field | Type | Description |
|-------|------|--------------|
| id | string | Document UUID |
| url | string | Source file/URL path |
| title | string | Document title |
| docAuthor | string | Author (or "no author found") |
| description | string | Description (or "No description found.") |
| docSource | string | e.g. "URL link uploaded by the user." |
| chunkSource | string | Original link or file path |
| published | string | Date string (e.g. "2/21/2026, 6:02:24 PM") |
| wordCount | number | Word count |
| pageContent | string | Full text used for chunking |
| token_count_estimate | number | Estimated tokens |

---

## 2. Vector cache (same shape as Vector DB rows)

**Location:** `server/storage/vector-cache/<digest>.json`

After a document is embedded, the **same data** that is written to the Vector DB is cached here (so re-adding the doc to another workspace doesn’t re-embed). Each file is an array of “chunk batches”; each batch is an array of chunk objects.

### Example from your project (one chunk, vector truncated)

**File:** `server/storage/vector-cache/b65bc829-52bd-5c2d-8988-d46c8bc82f4f.json`

Each chunk in the cache looks like this (vector array shortened for readability):

```json
{
  "id": "0076f055-88a3-41c8-a8de-55526c308923",
  "values": [-0.01454..., 0.18169..., 0.00880..., ... ],
  "metadata": {
    "id": "aa116416-d5c6-468c-b6a2-d371218023e6",
    "url": "file://chatbotaibucket_obs.ap-southeast-2.myhuaweicloud.com-ABCpercent20Statement.jpg.html",
    "title": "chatbotaibucket_obs.ap-southeast-2.myhuaweicloud.com-ABCpercent20Statement.jpg.html",
    "docAuthor": "no author found",
    "description": "No description found.",
    "docSource": "URL link uploaded by the user.",
    "chunkSource": "link://https://chatbotaibucket.obs.ap-southeast-2.myhuaweicloud.com/ABC%20Statement.jpg",
    "published": "2/21/2026, 6:02:24 PM",
    "wordCount": 21,
    "token_count_estimate": 124,
    "text": "<document_metadata>\nsourceDocument: chatbotaibucket_obs.ap-southeast-2.myhuaweicloud.com-ABCpercent20Statement.jpg.html\npublished: 2/21/2026, 6:02:24 PM\n</document_metadata>\n\nThis XML file does not appear to have any style information associated with it. The document tree is shown below.\n\n<Error>\n<Code>AccessDenied</Code>\n<Message>Access Denied</Message>\n..."
  }
}
```

**Fields stored (per chunk):**

| Field | Type | Description |
|-------|------|--------------|
| id | string (UUID) | Unique ID for this vector row |
| values | number[] | Embedding vector (e.g. 384 or 1536 dimensions) |
| metadata.id | string | Source document UUID |
| metadata.url | string | Source URL/path |
| metadata.title | string | Document title |
| metadata.docAuthor | string | Author |
| metadata.description | string | Description |
| metadata.docSource | string | Source type |
| metadata.chunkSource | string | Original link/path |
| metadata.published | string | Date string |
| metadata.wordCount | number | Word count |
| metadata.token_count_estimate | number | Token estimate |
| metadata.text | string | **Chunk text** (used in search and citations) |

---

## 3. Vector DB (e.g. LanceDB)

**Location:** `server/storage/lancedb/` (or `STORAGE_DIR/lancedb`)

- One **table (namespace)** per workspace, named by workspace slug (e.g. `my-workspace.lance`).
- Each **row** in that table = one chunk, with the **same fields** as in the vector cache, but stored as columns:

**Per-row columns in Vector DB:**

| Column | Type | Description |
|--------|------|-------------|
| id | string | Chunk vector row UUID |
| vector | number[] | Embedding array |
| text | string | Chunk text |
| title | string | Document title |
| published | string | Document published date |
| url | string | Source URL/path |
| docAuthor | string | Author |
| description | string | Description |
| docSource | string | Source type |
| chunkSource | string | Original link/path |
| wordCount | number | Word count |
| token_count_estimate | number | Token estimate |

So the **data** you see in the vector cache is the same as the **data** stored in the Vector DB; only the storage format (JSON file vs LanceDB table) differs.

---

## 4. PostgreSQL (relational index)

**Tables:** `workspace_documents`, `document_vectors`

### workspace_documents (one row per document in a workspace)

| Column | Type | Example / Description |
|--------|------|------------------------|
| id | int | Auto-increment PK |
| docId | string | e.g. `aa116416-d5c6-468c-b6a2-d371218023e6` |
| filename | string | e.g. `url-chatbotaibucket_obs...-aa116416-....json` |
| docpath | string | e.g. `custom-documents/url-chatbotaibucket_obs...-aa116416-....json` |
| workspaceId | int | FK to workspaces.id |
| metadata | string (JSON) | Document metadata as JSON string |
| pinned | boolean | Whether pinned in this workspace |
| createdAt | DateTime | |
| lastUpdatedAt | DateTime | |

### document_vectors (one row per chunk)

| Column | Type | Example / Description |
|--------|------|------------------------|
| id | int | Auto-increment PK |
| docId | string | Same as workspace_documents.docId (groups chunks) |
| vectorId | string | Same as the **id** of the row in the Vector DB for this chunk (e.g. `0076f055-88a3-41c8-a8de-55526c308923`) |
| createdAt | DateTime | |
| lastUpdatedAt | DateTime | |

---

## 5. Summary list

After you upload a file and add it to a workspace, data is stored in:

1. **server/storage/documents/custom-documents/** — One JSON per document (id, title, pageContent, published, etc.).
2. **server/storage/vector-cache/** — One JSON per embedded document; each chunk has **id**, **values** (vector), **metadata** (text, title, published, url, docAuthor, description, docSource, chunkSource, wordCount, token_count_estimate).
3. **server/storage/lancedb/<workspace-slug>.lance** — Same per-chunk data as columns: **id**, **vector**, **text**, **title**, **published**, **url**, **docAuthor**, **description**, **docSource**, **chunkSource**, **wordCount**, **token_count_estimate**.
4. **PostgreSQL workspace_documents** — One row per document (docId, filename, docpath, workspaceId, metadata, pinned).
5. **PostgreSQL document_vectors** — One row per chunk (docId, vectorId linking to Vector DB row).

The **actual content** you see in search and citations comes from the **text** (and metadata) stored in the Vector DB and mirrored in the vector-cache JSON.
