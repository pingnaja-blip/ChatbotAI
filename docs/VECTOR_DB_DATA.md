# Data Stored in the Vector DB

This document describes the exact data structures stored for workspace documents: (1) inside the **vector database** (e.g. LanceDB), and (2) in the **relational DB** (PostgreSQL via Prisma) that references those vectors.

---

## 1. Vector database (e.g. LanceDB)

Each **workspace** has its own **namespace** (table) in the vector DB, named by the workspace slug. For every document you add to a workspace, the document’s text is split into **chunks**. For each chunk, **one row** is stored in that namespace.

### Per-row shape (one chunk)

Each row in the vector table has:

| Field      | Type           | Description |
|-----------|----------------|-------------|
| **id**    | string (UUID)  | Unique ID for this vector row. |
| **vector**| number[]       | Embedding of the chunk (from the embedding model). |
| **text**  | string         | The chunk’s raw text (required for retrieval and citation). |
| **title** | string         | Document title (from source document). |
| **published** | string      | Document “published” date (from source; used in `sourceIdentifier`). |
| **url**   | string         | Source URL/path (e.g. `file:///path/to/file`). |
| **docAuthor** | string     | From source document. |
| **description** | string   | From source document. |
| **docSource** | string    | From source document (e.g. “a text file uploaded by the user.”). |
| **chunkSource** | string  | From source document. |
| **wordCount** | number   | From source document. |
| **token_count_estimate** | number | From source document. |

- **id** and **vector** are set when creating the row; **text** and the rest come from the parsed document JSON and the chunk content.
- Similarity search uses **vector**; retrieval and citations use **text** and the other metadata (e.g. **title**, **published** for deduplication via `sourceIdentifier`).

**Code reference:** `server/utils/vectorDbProviders/lance/index.js` — `addDocumentToNamespace` builds each row as:

```js
submissions.push({
  ...vectorRecord.metadata,   // title, published, url, docAuthor, etc. + text
  id: vectorRecord.id,        // UUID for this chunk
  vector: vectorRecord.values, // embedding array
});
```

`vectorRecord.metadata` is `{ ...documentMetadata, text: textChunks[i] }`, where `documentMetadata` is the parsed document JSON (excluding `pageContent` and `docId`).

---

## 2. Relational DB (PostgreSQL) — workspace documents and vector index

Two tables link workspaces to documents and to vector rows.

### 2.1 `workspace_documents`

One row per **document** that has been added to a workspace (not per chunk).

| Column         | Type    | Description |
|----------------|---------|-------------|
| id             | int     | Primary key. |
| docId          | string  | Unique ID for this document (UUID). |
| filename       | string  | Display filename (e.g. from path). |
| docpath        | string  | Relative path to the source JSON (e.g. `custom-documents/my-doc-uuid.json`). |
| workspaceId    | int     | FK to `workspaces.id`. |
| metadata       | string? | JSON string of document metadata. |
| pinned         | boolean?| Whether the document is pinned in this workspace. |
| createdAt      | DateTime| |
| lastUpdatedAt  | DateTime| |

**Code reference:** `server/models/documents.js` — `addDocuments` creates these rows; `server/prisma/schema.prisma` — `workspace_documents` model.

### 2.2 `document_vectors`

One row per **chunk** (per vector row), linking a document to a vector ID in the vector DB.

| Column         | Type    | Description |
|----------------|---------|-------------|
| id             | int     | Primary key. |
| docId          | string  | Same as `workspace_documents.docId` (groups chunks by document). |
| vectorId       | string  | Same as the **id** of the row in the vector DB for this chunk. |
| createdAt      | DateTime| |
| lastUpdatedAt  | DateTime| |

- **docId** ties all chunks of one document together.
- **vectorId** is the UUID stored in the vector DB row’s **id** field.

**Code reference:** `server/models/vectors.js` — `DocumentVectors.bulkInsert`; `server/prisma/schema.prisma` — `document_vectors` model.

---

## 3. End-to-end flow (where the data comes from)

1. **Source document**  
   Stored as JSON under `server/storage/documents/` (e.g. `custom-documents/<slugified-name>-<uuid>.json`) with at least:  
   `pageContent`, `title`, `docAuthor`, `description`, `docSource`, `chunkSource`, `published`, `wordCount`, `token_count_estimate`, `url`, `id`.

2. **Chunking and embedding**  
   `pageContent` is split into chunks (TextSplitter). Each chunk is embedded; one vector DB row is created with **id**, **vector**, **text** (chunk content), and the document metadata fields above.

3. **Relational records**  
   One `workspace_documents` row per document; one `document_vectors` row per chunk with **docId** and **vectorId** pointing to the vector DB row.

4. **Vector cache (optional)**  
   Embeddings can be cached under `server/storage/vector-cache/` (by path digest) so the same file can be added to another workspace without re-embedding; the same vector row shape is written to the vector DB from cache.

---

## 4. Summary

- **Vector DB:** One row per chunk: **id**, **vector**, **text**, plus document metadata (**title**, **published**, **url**, **docAuthor**, **description**, **docSource**, **chunkSource**, **wordCount**, **token_count_estimate**).
- **PostgreSQL:**  
  - **workspace_documents:** one row per document in a workspace (docId, filename, docpath, workspaceId, metadata, pinned).  
  - **document_vectors:** one row per chunk (docId, vectorId) linking to the vector DB row.

This is the data that is stored in the Vector DB and the related relational tables.
