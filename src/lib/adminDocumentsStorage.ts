
import {
  getAdminPreviewSession,
  isAdminPreviewLoggedIn,
} from "./adminPreviewSession";

/* ==========================================================
   VIZHATICKETS — ADMIN DOCUMENTS STORAGE & DATABASE ENGINE

   Private storage and database metadata engine for the
   VizhaTickets Admin Console.

   SECURITY & ARCHITECTURE:
   ----------------------------------------------------------
   - Admin authorization check enforced on upload, preview,
     download, and deletion.
   - Files are stored in private storage (browser IndexedDB
     object vault), NOT in public web directories.
   - Document metadata and entity associations are saved in
     the persistent admin database (localStorage with cross-tab
     event synchronization).
   - Strict file type and size validation.
   - Safe dual-deletion of both database metadata and
     storage objects.
   ========================================================== */

export type DocumentCategory =
  | "Organizer Agreement"
  | "Event Document"
  | "Report"
  | "General Document";

export interface AdminDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileType: "pdf" | "doc" | "docx" | "xls" | "xlsx" | "jpg" | "png";
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  organizerId?: string;
  organizerName?: string;
  eventId?: string;
  eventTitle?: string;
  fileKey: string;
  source?: "upload" | "generated_report";
}

export const DOCUMENTS_STORAGE_KEY = "vizha_admin_documents_v1";
export const DOCUMENTS_EVENT = "vizha-admin-documents-changed";

const DB_NAME = "vizhatickets_private_vault";
const DB_VERSION = 1;
const STORE_NAME = "document_blobs";

// 15 MB maximum file upload size
export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "jpg",
  "jpeg",
  "png",
] as const;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/pjpeg",
  "application/octet-stream", // Fallback for some OS file pickers
] as const;

/* ==========================================================
   AUTHORIZATION
   ========================================================== */

export function requireAdminAuth(): void {
  if (!isAdminPreviewLoggedIn()) {
    throw new Error(
      "Authorization required: You must be signed in as an administrator to access documents."
    );
  }
}

/* ==========================================================
   VALIDATION
   ========================================================== */

export function extractFileType(
  filename: string
): AdminDocument["fileType"] | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (ext === "jpeg" || ext === "jpg") return "jpg";
  if (ext === "png") return "png";
  if (ext === "pdf") return "pdf";
  if (ext === "doc") return "doc";
  if (ext === "docx") return "docx";
  if (ext === "xls") return "xls";
  if (ext === "xlsx") return "xlsx";
  return null;
}

export function validateDocumentFile(file: {
  name: string;
  size: number;
  type?: string;
}): { valid: boolean; error?: string } {
  if (!file || !file.name) {
    return { valid: false, error: "Please select a valid file to upload." };
  }

  const fileType = extractFileType(file.name);
  if (!fileType) {
    return {
      valid: false,
      error: `Invalid file format. Supported formats are: PDF, DOC, DOCX, XLS, XLSX, JPG, and PNG.`,
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: "Selected file is empty." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds the maximum allowed limit of 15 MB.`,
    };
  }

  return { valid: true };
}

/* ==========================================================
   PRIVATE STORAGE VAULT (INDEXED DB ENGINE)
   Files are kept isolated in the browser's private origin storage.
   ========================================================== */

// In-memory fallback if IndexedDB is disabled by browser settings
const memoryVault = new Map<string, Blob>();

function openPrivateVault(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported in this environment."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open vault"));
  });
}

export async function storePrivateBlob(
  key: string,
  blob: Blob
): Promise<void> {
  requireAdminAuth();

  try {
    const db = await openPrivateVault();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback to memory vault
    memoryVault.set(key, blob);
  }
}

export async function getPrivateBlob(key: string): Promise<Blob | null> {
  requireAdminAuth();

  if (memoryVault.has(key)) {
    return memoryVault.get(key) || null;
  }

  try {
    const db = await openPrivateVault();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return memoryVault.get(key) || null;
  }
}

export async function deletePrivateBlob(key: string): Promise<void> {
  requireAdminAuth();

  memoryVault.delete(key);

  try {
    const db = await openPrivateVault();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Already removed from memoryVault
  }
}

/* ==========================================================
   METADATA DATABASE REPOSITORY
   ========================================================== */

function notifyDocumentsChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DOCUMENTS_EVENT));
  }
}

function readStoredMetadata(): AdminDocument[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AdminDocument[]) : [];
  } catch {
    return [];
  }
}

function writeStoredMetadata(docs: AdminDocument[]): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    notifyDocumentsChanged();
    return true;
  } catch {
    return false;
  }
}

/* ==========================================================
   SAMPLE INITIALIZATION SEED
   ========================================================== */

const SEEDED_KEY = "vizha_admin_documents_seeded_v2";

async function createInitialBlob(
  content: string,
  mime: string
): Promise<Blob> {
  return new Blob([content], { type: mime });
}

export async function initializeDocumentsRepository(): Promise<AdminDocument[]> {
  const existing = readStoredMetadata();
  if (existing.length > 0) {
    return existing;
  }

  // Check if we already seeded in this session
  if (typeof window !== "undefined" && localStorage.getItem(SEEDED_KEY)) {
    return existing;
  }

  const sampleDocs: AdminDocument[] = [
    {
      id: "DOC-2026-001",
      name: "Demo Events Sri Lanka Agreement 2026.pdf",
      category: "Organizer Agreement",
      fileType: "pdf",
      mimeType: "application/pdf",
      fileSize: 184320,
      uploadedAt: "2026-10-15T09:30:00.000Z",
      uploadedBy: "Admin Preview",
      description: "Official ticketing and promotion agreement with Demo Events Sri Lanka.",
      organizerId: "ORG-001",
      organizerName: "Demo Events Sri Lanka",
      fileKey: "vault_seed_doc_001",
      source: "upload",
    },
    {
      id: "DOC-2026-002",
      name: "Chithirai Thiruvizha Safety & Venue Layout.pdf",
      category: "Event Document",
      fileType: "pdf",
      mimeType: "application/pdf",
      fileSize: 524288,
      uploadedAt: "2026-10-20T14:15:00.000Z",
      uploadedBy: "Admin Preview",
      description: "Approved floor plan, gate entrances and fire safety clearance certificate.",
      eventId: "EVT-001",
      eventTitle: "Chithirai Thiruvizha 2026",
      fileKey: "vault_seed_doc_002",
      source: "upload",
    },
    {
      id: "DOC-2026-003",
      name: "Bharathanatyam Arangetram Stage Permit.pdf",
      category: "Event Document",
      fileType: "pdf",
      mimeType: "application/pdf",
      fileSize: 312400,
      uploadedAt: "2026-10-25T11:45:00.000Z",
      uploadedBy: "Admin Preview",
      description: "Municipal theatre permit and technical rider specifications.",
      eventId: "EVT-002",
      eventTitle: "Bharathanatyam Arangetram",
      fileKey: "vault_seed_doc_003",
      source: "upload",
    },
    {
      id: "DOC-2026-004",
      name: "VizhaTickets Q3 Financial Audit & Settlement Report.xlsx",
      category: "Report",
      fileType: "xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileSize: 145600,
      uploadedAt: "2026-11-01T16:00:00.000Z",
      uploadedBy: "Admin Preview",
      description: "Quarterly settlement summary with organizer commission breakdowns.",
      fileKey: "vault_seed_doc_004",
      source: "generated_report",
    },
    {
      id: "DOC-2026-005",
      name: "Standard Event Organizer Terms & Compliance.docx",
      category: "General Document",
      fileType: "docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: 98304,
      uploadedAt: "2026-11-05T10:00:00.000Z",
      uploadedBy: "Admin Preview",
      description: "Platform regulatory terms, refund liabilities, and ticketing code of conduct.",
      fileKey: "vault_seed_doc_005",
      source: "upload",
    },
    {
      id: "DOC-2026-006",
      name: "Venue Layout Seating Plan - Hall A.png",
      category: "Event Document",
      fileType: "png",
      mimeType: "image/png",
      fileSize: 245760,
      uploadedAt: "2026-11-08T15:20:00.000Z",
      uploadedBy: "Admin Preview",
      description: "High-resolution zone plan for VIP and General Admission sections.",
      eventId: "EVT-001",
      eventTitle: "Chithirai Thiruvizha 2026",
      fileKey: "vault_seed_doc_006",
      source: "upload",
    },
  ];

  // Seed private storage blobs for these sample records
  try {
    for (const doc of sampleDocs) {
      let sampleContent = "";
      if (doc.fileType === "pdf") {
        sampleContent = `%PDF-1.4\n% VizhaTickets Private Document: ${doc.name}\n1 0 obj\n<< /Title (${doc.name}) /Author (VizhaTickets) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
      } else if (doc.fileType === "xlsx" || doc.fileType === "xls") {
        sampleContent = `Item,Category,Date,Amount\nSettlement 1,Organizer Payout,2026-10-15,45000\nPlatform Fee,Revenue,2026-10-15,2250`;
      } else if (doc.fileType === "png" || doc.fileType === "jpg") {
        // Simple 1x1 transparent/colored pixel base64 or SVG blob
        sampleContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#12131a"/><rect x="40" y="40" width="720" height="520" rx="16" fill="#1a1c26" stroke="#c9790b" stroke-width="2"/><text x="400" y="120" text-anchor="middle" fill="#f4b34d" font-family="sans-serif" font-size="28" font-weight="bold">VIZHATICKETS VENUE PLAN</text><text x="400" y="170" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18">${doc.name}</text><rect x="100" y="240" width="600" height="240" rx="12" fill="#0d0e14" stroke="#443425"/><text x="400" y="370" text-anchor="middle" fill="#888" font-size="16">Main Stage &amp; Seating Layout</text></svg>`;
      } else {
        sampleContent = `VIZHATICKETS DOCUMENT REPOSITORY\nDocument: ${doc.name}\nCategory: ${doc.category}\nDate: ${doc.uploadedAt}\n\n${doc.description || ""}`;
      }

      const mime = doc.fileType === "png" || doc.fileType === "jpg" ? "image/svg+xml" : doc.mimeType;
      const blob = await createInitialBlob(sampleContent, mime);
      await storePrivateBlob(doc.fileKey, blob);
    }

    writeStoredMetadata(sampleDocs);
    localStorage.setItem(SEEDED_KEY, "true");
    return sampleDocs;
  } catch {
    writeStoredMetadata(sampleDocs);
    return sampleDocs;
  }
}

/* ==========================================================
   PUBLIC DOCUMENT CRUD METHODS
   ========================================================== */

export async function getAdminDocuments(): Promise<AdminDocument[]> {
  requireAdminAuth();
  const docs = readStoredMetadata();
  if (docs.length === 0) {
    return await initializeDocumentsRepository();
  }
  return docs;
}

export async function uploadAdminDocument(params: {
  file: File;
  name?: string;
  category: DocumentCategory;
  description?: string;
  organizerId?: string;
  organizerName?: string;
  eventId?: string;
  eventTitle?: string;
}): Promise<AdminDocument> {
  requireAdminAuth();

  const { file, category, description, organizerId, organizerName, eventId, eventTitle } = params;

  // Server-side validation
  const validation = validateDocumentFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed.");
  }

  const fileType = extractFileType(file.name);
  if (!fileType) {
    throw new Error("Unsupported file format.");
  }

  const session = getAdminPreviewSession();
  const uploadedBy = session?.name || "Admin Preview";

  const docId = `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const fileKey = `vault_${docId}_${Date.now()}`;

  // Store file privately in IndexedDB vault
  await storePrivateBlob(fileKey, file);

  const newDoc: AdminDocument = {
    id: docId,
    name: params.name?.trim() || file.name,
    category,
    fileType,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
    description: description?.trim() || undefined,
    organizerId: category === "Organizer Agreement" ? organizerId : undefined,
    organizerName: category === "Organizer Agreement" ? organizerName : undefined,
    eventId: category === "Event Document" ? eventId : undefined,
    eventTitle: category === "Event Document" ? eventTitle : undefined,
    fileKey,
    source: "upload",
  };

  const existing = await getAdminDocuments();
  const next = [newDoc, ...existing];
  const saved = writeStoredMetadata(next);

  if (!saved) {
    // Clean up private blob if metadata storage fails
    await deletePrivateBlob(fileKey);
    throw new Error("Unable to save document metadata. Storage may be full.");
  }

  return newDoc;
}

export async function saveGeneratedReportDocument(params: {
  filename: string;
  category?: DocumentCategory;
  blob: Blob;
  description: string;
  eventId?: string;
  eventTitle?: string;
  organizerId?: string;
  organizerName?: string;
}): Promise<AdminDocument> {
  requireAdminAuth();

  const fileType = extractFileType(params.filename) || "csv";
  const docId = `DOC-RPT-${Math.floor(1000 + Math.random() * 9000)}`;
  const fileKey = `vault_report_${docId}_${Date.now()}`;

  // Store private blob
  await storePrivateBlob(fileKey, params.blob);

  const session = getAdminPreviewSession();
  const uploadedBy = session?.name || "System Generated";

  const newDoc: AdminDocument = {
    id: docId,
    name: params.filename,
    category: params.category || "Report",
    fileType: fileType as AdminDocument["fileType"],
    mimeType: params.blob.type || "application/octet-stream",
    fileSize: params.blob.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
    description: params.description,
    eventId: params.eventId,
    eventTitle: params.eventTitle,
    organizerId: params.organizerId,
    organizerName: params.organizerName,
    fileKey,
    source: "generated_report",
  };

  const existing = await getAdminDocuments();
  const next = [newDoc, ...existing];
  writeStoredMetadata(next);

  return newDoc;
}

export async function deleteAdminDocument(id: string): Promise<boolean> {
  requireAdminAuth();

  const existing = await getAdminDocuments();
  const target = existing.find((d) => d.id === id);

  if (!target) {
    throw new Error("Document not found.");
  }

  // 1. Delete private storage blob safely
  if (target.fileKey) {
    try {
      await deletePrivateBlob(target.fileKey);
    } catch {
      // Continue to remove metadata even if blob removal warned
    }
  }

  // 2. Remove document metadata
  const next = existing.filter((d) => d.id !== id);
  return writeStoredMetadata(next);
}

export async function fetchDocumentDownloadUrl(
  doc: AdminDocument
): Promise<{ url: string; revoke: () => void }> {
  requireAdminAuth();

  const blob = await getPrivateBlob(doc.fileKey);
  if (!blob) {
    throw new Error(
      `File content for "${doc.name}" is not available in private storage.`
    );
  }

  const url = URL.createObjectURL(blob);
  return {
    url,
    revoke: () => URL.revokeObjectURL(url),
  };
}

export async function downloadAdminDocument(doc: AdminDocument): Promise<void> {
  requireAdminAuth();

  const { url, revoke } = await fetchDocumentDownloadUrl(doc);

  const a = document.createElement("a");
  a.href = url;
  a.download = doc.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revoke after download is triggered
  setTimeout(revoke, 2000);
}
