
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";

import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Grid,
  Info,
  LayoutList,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import type { AdvancedEvent } from "./EventForm";
import type { AdvancedOrganizer } from "./OrganizerForm";

import {
  ALLOWED_EXTENSIONS,
  deleteAdminDocument,
  downloadAdminDocument,
  extractFileType,
  fetchDocumentDownloadUrl,
  getAdminDocuments,
  saveGeneratedReportDocument,
  uploadAdminDocument,
  validateDocumentFile,
  type AdminDocument,
  type DocumentCategory,
} from "../../lib/adminDocumentsStorage";

import "./DocumentsPage.css";

/* ==========================================================
   PROPS INTERFACE
   ========================================================== */

export interface DocumentsPageProps {
  events: AdvancedEvent[];
  organizers: AdvancedOrganizer[];
  bookings?: Array<{
    id: string;
    customer: string;
    email: string;
    eventId: string;
    event: string;
    tickets: number;
    total: number;
    currency: string;
    status: string;
    bookedAt: string;
  }>;
  onNotice?: (msg: string) => void;
}

/* ==========================================================
   FORMAT HELPERS
   ========================================================== */

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/* ==========================================================
   MAIN COMPONENT
   ========================================================== */

export default function DocumentsPage({
  events,
  organizers,
  bookings = [],
  onNotice,
}: DocumentsPageProps) {
  // Documents state
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [associationFilter, setAssociationFilter] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState<string>("NEWEST");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<AdminDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewRevoke, setPreviewRevoke] = useState<(() => void) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminDocument | null>(null);

  // Upload Form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] =
    useState<DocumentCategory>("Organizer Agreement");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadOrganizerId, setUploadOrganizerId] = useState("");
  const [uploadEventId, setUploadEventId] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Report generator state
  const [reportType, setReportType] = useState<
    "finance_summary" | "event_sales" | "organizer_commissions" | "executive_pdf"
  >("finance_summary");
  const [generatingReport, setGeneratingReport] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper for notifications
  const showFeedback = useCallback(
    (msg: string) => {
      setToastMessage(msg);
      if (onNotice) onNotice(msg);
      setTimeout(() => {
        setToastMessage((cur) => (cur === msg ? null : cur));
      }, 4000);
    },
    [onNotice]
  );

  // Load documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminDocuments();
      setDocuments(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load documents";
      showFeedback(msg);
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Clean up preview object URL
  useEffect(() => {
    return () => {
      if (previewRevoke) {
        previewRevoke();
      }
    };
  }, [previewRevoke]);

  /* ========================================================
     FILTER & SORT LOGIC
     ======================================================== */

  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Search term check
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = doc.name.toLowerCase().includes(q);
          const matchCategory = doc.category.toLowerCase().includes(q);
          const matchDesc = (doc.description || "").toLowerCase().includes(q);
          const matchOrg = (doc.organizerName || "").toLowerCase().includes(q);
          const matchEvent = (doc.eventTitle || "").toLowerCase().includes(q);
          const matchUploader = (doc.uploadedBy || "").toLowerCase().includes(q);

          if (
            !matchName &&
            !matchCategory &&
            !matchDesc &&
            !matchOrg &&
            !matchEvent &&
            !matchUploader
          ) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter !== "ALL" && doc.category !== categoryFilter) {
          return false;
        }

        // Association filter
        if (associationFilter === "ORGANIZER" && !doc.organizerId) return false;
        if (associationFilter === "EVENT" && !doc.eventId) return false;
        if (associationFilter === "UNLINKED" && (doc.organizerId || doc.eventId)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "NEWEST") {
          return Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt);
        }
        if (sortOption === "OLDEST") {
          return Date.parse(a.uploadedAt) - Date.parse(b.uploadedAt);
        }
        if (sortOption === "NAME") {
          return a.name.localeCompare(b.name);
        }
        if (sortOption === "SIZE") {
          return b.fileSize - a.fileSize;
        }
        return 0;
      });
  }, [documents, searchTerm, categoryFilter, associationFilter, sortOption]);

  // Summary counts
  const counts = useMemo(() => {
    let agreements = 0;
    let eventDocs = 0;
    let reports = 0;
    let general = 0;
    let totalBytes = 0;

    for (const d of documents) {
      totalBytes += d.fileSize;
      if (d.category === "Organizer Agreement") agreements++;
      else if (d.category === "Event Document") eventDocs++;
      else if (d.category === "Report") reports++;
      else if (d.category === "General Document") general++;
    }

    return {
      total: documents.length,
      agreements,
      eventDocs,
      reports,
      general,
      totalBytes,
    };
  }, [documents]);

  /* ========================================================
     UPLOAD HANDLERS
     ======================================================== */

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadName("");
    setUploadCategory("Organizer Agreement");
    setUploadDescription("");
    setUploadOrganizerId("");
    setUploadEventId("");
    setUploadError("");
  };

  const handleFileSelect = (file: File | null) => {
    setUploadError("");
    if (!file) return;

    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file");
      return;
    }

    setUploadFile(file);
    if (!uploadName) {
      setUploadName(file.name);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const submitUpload = async (e: FormEvent) => {
    e.preventDefault();
    setUploadError("");

    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);

      const orgMatch = organizers.find((o) => o.id === uploadOrganizerId);
      const eventMatch = events.find((ev) => ev.id === uploadEventId);

      const created = await uploadAdminDocument({
        file: uploadFile,
        name: uploadName.trim() || uploadFile.name,
        category: uploadCategory,
        description: uploadDescription.trim() || undefined,
        organizerId:
          uploadCategory === "Organizer Agreement"
            ? uploadOrganizerId
            : undefined,
        organizerName:
          uploadCategory === "Organizer Agreement" ? orgMatch?.name : undefined,
        eventId: uploadCategory === "Event Document" ? uploadEventId : undefined,
        eventTitle:
          uploadCategory === "Event Document" ? eventMatch?.title : undefined,
      });

      setDocuments((cur) => [created, ...cur]);
      setUploadModalOpen(false);
      resetUploadForm();
      showFeedback(`"${created.name}" uploaded successfully to private vault.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  /* ========================================================
     PREVIEW & DOWNLOAD HANDLERS
     ======================================================== */

  const handleOpenPreview = async (doc: AdminDocument) => {
    try {
      if (previewRevoke) {
        previewRevoke();
      }

      const { url, revoke } = await fetchDocumentDownloadUrl(doc);
      setPreviewDoc(doc);
      setPreviewUrl(url);
      setPreviewRevoke(() => revoke);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unable to preview document.";
      showFeedback(msg);
    }
  };

  const handleClosePreview = () => {
    if (previewRevoke) {
      previewRevoke();
    }
    setPreviewDoc(null);
    setPreviewUrl(null);
    setPreviewRevoke(null);
  };

  const handleDownload = async (doc: AdminDocument) => {
    try {
      showFeedback(`Preparing download for "${doc.name}"...`);
      await downloadAdminDocument(doc);
      showFeedback(`Downloaded "${doc.name}" successfully.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to download document.";
      showFeedback(msg);
    }
  };

  /* ========================================================
     DELETE HANDLER
     ======================================================== */

  const executeDelete = async () => {
    if (!deleteTarget) return;

    try {
      const id = deleteTarget.id;
      const name = deleteTarget.name;
      await deleteAdminDocument(id);
      setDocuments((cur) => cur.filter((d) => d.id !== id));
      setDeleteTarget(null);
      showFeedback(`"${name}" permanently removed from vault.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete document.";
      showFeedback(msg);
    }
  };

  /* ========================================================
     REPORT GENERATION (Feature 7)
     ======================================================== */

  const handleGenerateSystemReport = async (saveToVault: boolean) => {
    try {
      setGeneratingReport(true);
      const timestamp = new Date().toISOString().split("T")[0];

      let filename = "";
      let blob: Blob;
      let description = "";

      if (reportType === "finance_summary") {
        filename = `VizhaTickets-Financial-Settlement-Report-${timestamp}.csv`;
        description =
          "Consolidated financial settlements, platform commissions, and organizer payouts summary.";

        const rows: string[][] = [
          ["VIZHATICKETS FINANCIAL SETTLEMENT SUMMARY"],
          ["Generated Date", new Date().toLocaleString()],
          ["Total Events Registered", String(events.length)],
          ["Total Organizers", String(organizers.length)],
          ["Total Bookings Processed", String(bookings.length)],
          [],
          [
            "Event ID",
            "Event Title",
            "Organizer",
            "Currency",
            "Ticket Price",
            "Tickets Sold",
            "Gross Revenue",
            "Platform Fee (5%)",
            "Net Organizer Payout",
          ],
        ];

        events.forEach((ev) => {
          const org = organizers.find((o) => o.id === ev.organizerId);
          const evBookings = bookings.filter((b) => b.eventId === ev.id);
          const totalTickets = evBookings.reduce((sum, b) => sum + b.tickets, 0);
          const gross = evBookings.reduce((sum, b) => sum + b.total, 0);
          const fee = gross * 0.05;
          const net = gross - fee;

          rows.push([
            ev.id,
            ev.title,
            org?.name || ev.organizerId || "Not assigned",
            ev.currency || "LKR",
            String(ev.price),
            String(totalTickets),
            gross.toFixed(2),
            fee.toFixed(2),
            net.toFixed(2),
          ]);
        });

        const csvContent =
          "\uFEFF" +
          rows
            .map((r) =>
              r
                .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                .join(",")
            )
            .join("\r\n");

        blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      } else if (reportType === "event_sales") {
        filename = `VizhaTickets-Event-Sales-Attendance-${timestamp}.csv`;
        description =
          "Per-event attendance, ticket tier capacities, and sales rate ledger.";

        const rows: string[][] = [
          ["VIZHATICKETS EVENT SALES & INVENTORY LEDGER"],
          ["Generated Date", new Date().toLocaleString()],
          [],
          [
            "Event ID",
            "Event Title",
            "Country",
            "City",
            "Venue",
            "Date",
            "Total Capacity",
            "Status",
          ],
        ];

        events.forEach((ev) => {
          rows.push([
            ev.id,
            ev.title,
            ev.country || "Sri Lanka",
            ev.city || "Colombo",
            ev.venue,
            ev.date,
            String(ev.capacity),
            ev.status,
          ]);
        });

        const csvContent =
          "\uFEFF" +
          rows
            .map((r) =>
              r
                .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                .join(",")
            )
            .join("\r\n");

        blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      } else if (reportType === "organizer_commissions") {
        filename = `VizhaTickets-Organizer-Agreements-Commissions-${timestamp}.csv`;
        description =
          "Active organizer profiles, agreed commission percentages, and contact directory.";

        const rows: string[][] = [
          ["VIZHATICKETS ORGANIZER DIRECTORY & COMMISSION SCHEDULE"],
          ["Generated Date", new Date().toLocaleString()],
          [],
          ["Organizer ID", "Organization Name", "Contact Person", "Email", "Phone", "Country", "Commission %"],
        ];

        organizers.forEach((org) => {
          rows.push([
            org.id,
            org.name,
            org.contactName,
            org.email,
            org.phone,
            org.country || "Sri Lanka",
            `${org.commission}%`,
          ]);
        });

        const csvContent =
          "\uFEFF" +
          rows
            .map((r) =>
              r
                .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                .join(",")
            )
            .join("\r\n");

        blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      } else {
        // Executive PDF Summary
        filename = `VizhaTickets-Executive-Summary-${timestamp}.pdf`;
        description =
          "Official VizhaTickets executive performance summary generated from reports and finance modules.";

        try {
          const { jsPDF } = await import("jspdf");
          const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

          // Header Gold Accent Bar
          pdf.setFillColor(201, 121, 11);
          pdf.rect(0, 0, 210, 8, "F");

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(22);
          pdf.setTextColor(23, 25, 39);
          pdf.text("VIZHATICKETS", 15, 24);

          pdf.setFontSize(10);
          pdf.setTextColor(201, 121, 11);
          pdf.text("EXECUTIVE PERFORMANCE & COMPLIANCE SUMMARY", 15, 30);

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 110);
          pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 36);
          pdf.text(`Audited By: VizhaTickets Admin Console`, 15, 41);

          // Divider
          pdf.setDrawColor(230, 220, 210);
          pdf.line(15, 46, 195, 46);

          // Stats box
          pdf.setFillColor(253, 250, 246);
          pdf.rect(15, 52, 180, 26, "F");
          pdf.setDrawColor(238, 228, 216);
          pdf.rect(15, 52, 180, 26, "D");

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.setTextColor(23, 25, 39);
          pdf.text(`Total Active Events: ${events.length}`, 22, 62);
          pdf.text(`Registered Organizers: ${organizers.length}`, 22, 70);
          pdf.text(`System Bookings: ${bookings.length}`, 110, 62);
          pdf.text(`Document Vault Records: ${documents.length}`, 110, 70);

          // Event Section
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(13);
          pdf.setTextColor(23, 25, 39);
          pdf.text("Active Event Catalog", 15, 90);

          let y = 100;
          pdf.setFontSize(9);
          events.slice(0, 8).forEach((ev, idx) => {
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(23, 25, 39);
            pdf.text(`${idx + 1}. ${ev.title}`, 15, y);

            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(110, 105, 100);
            pdf.text(`Venue: ${ev.venue} | Date: ${ev.date} | Status: ${ev.status}`, 15, y + 5);
            y += 12;
          });

          // Footer
          pdf.setFontSize(8);
          pdf.setTextColor(150, 140, 130);
          pdf.text(
            "Confidential document generated for VizhaTickets Administrator Vault.",
            15,
            285
          );

          blob = pdf.output("blob");
        } catch {
          // Fallback text blob if jsPDF fails
          const text = `VIZHATICKETS EXECUTIVE SUMMARY\nGenerated: ${new Date().toLocaleString()}\nEvents: ${events.length}\nOrganizers: ${organizers.length}\n`;
          blob = new Blob([text], { type: "application/pdf" });
        }
      }

      if (saveToVault) {
        const saved = await saveGeneratedReportDocument({
          filename,
          category: "Report",
          blob,
          description,
        });
        setDocuments((cur) => [saved, ...cur]);
        showFeedback(`Report "${filename}" saved directly to Documents Vault.`);
      }

      // Download it
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      setReportModalOpen(false);
      showFeedback(`Report "${filename}" generated and downloaded successfully.`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate report.";
      showFeedback(msg);
    } finally {
      setGeneratingReport(false);
    }
  };

  /* ========================================================
     RENDER ICONS BY TYPE
     ======================================================== */

  const renderFileTypeIcon = (type: string) => {
    if (type === "pdf") {
      return (
        <div className="vdp-file-icon-badge vdp-file-icon-pdf">
          <FileText size={20} />
        </div>
      );
    }
    if (type === "doc" || type === "docx") {
      return (
        <div className="vdp-file-icon-badge vdp-file-icon-doc">
          <FileText size={20} />
        </div>
      );
    }
    if (type === "xls" || type === "xlsx") {
      return (
        <div className="vdp-file-icon-badge vdp-file-icon-xls">
          <FileSpreadsheet size={20} />
        </div>
      );
    }
    if (type === "png" || type === "jpg") {
      return (
        <div className="vdp-file-icon-badge vdp-file-icon-img">
          <FileCheck2 size={20} />
        </div>
      );
    }
    return (
      <div className="vdp-file-icon-badge vdp-file-icon-default">
        <FileText size={20} />
      </div>
    );
  };

  const renderCategoryBadge = (category: DocumentCategory) => {
    let className = "vdp-cat-badge ";
    if (category === "Organizer Agreement") className += "vdp-cat-agreement";
    else if (category === "Event Document") className += "vdp-cat-event";
    else if (category === "Report") className += "vdp-cat-report";
    else className += "vdp-cat-general";

    return <span className={className}>{category}</span>;
  };

  /* ========================================================
     JSX RENDER
     ======================================================== */

  return (
    <div className="vdp-root">
      {/* 1. PAGE HEADER */}
      <div className="vdp-heading">
        <div>
          <p className="vdp-eyebrow">Document Vault &amp; Compliance</p>
          <h2>Documents &amp; Contracts</h2>
          <p className="vdp-heading-sub">
            Private repository for organizer agreements, venue permits, system
            audit reports, and operational files. All files are safely stored
            with authorized admin access.
          </p>
        </div>

        <div className="vdp-heading-actions">
          <button
            type="button"
            className="vdp-btn vdp-btn-secondary"
            onClick={() => setReportModalOpen(true)}
          >
            <Sparkles size={16} />
            Generate System Report
          </button>

          <button
            type="button"
            className="vdp-btn vdp-btn-primary"
            onClick={() => {
              resetUploadForm();
              setUploadModalOpen(true);
            }}
          >
            <Plus size={17} />
            Upload Document
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="vdp-stats-grid">
        <div className="vdp-stat-card">
          <div className="vdp-stat-icon-wrap vdp-stat-icon-gold">
            <FileText size={22} />
          </div>
          <div className="vdp-stat-info">
            <span className="vdp-stat-label">Total Documents</span>
            <span className="vdp-stat-value">{counts.total}</span>
            <span className="vdp-stat-meta">
              {formatBytes(counts.totalBytes)} in vault
            </span>
          </div>
        </div>

        <div className="vdp-stat-card">
          <div className="vdp-stat-icon-wrap vdp-stat-icon-blue">
            <Building2 size={22} />
          </div>
          <div className="vdp-stat-info">
            <span className="vdp-stat-label">Organizer Agreements</span>
            <span className="vdp-stat-value">{counts.agreements}</span>
            <span className="vdp-stat-meta">Contracts &amp; Payout Terms</span>
          </div>
        </div>

        <div className="vdp-stat-card">
          <div className="vdp-stat-icon-wrap vdp-stat-icon-purple">
            <Calendar size={22} />
          </div>
          <div className="vdp-stat-info">
            <span className="vdp-stat-label">Event Documents</span>
            <span className="vdp-stat-value">{counts.eventDocs}</span>
            <span className="vdp-stat-meta">Permits, Layouts &amp; Riders</span>
          </div>
        </div>

        <div className="vdp-stat-card">
          <div className="vdp-stat-icon-wrap vdp-stat-icon-green">
            <FileSpreadsheet size={22} />
          </div>
          <div className="vdp-stat-info">
            <span className="vdp-stat-label">System Reports</span>
            <span className="vdp-stat-value">{counts.reports}</span>
            <span className="vdp-stat-meta">Financial &amp; Sales Audits</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="vdp-controls">
        <div className="vdp-controls-row-top">
          {/* Search Bar */}
          <div className="vdp-search-wrap">
            <Search className="vdp-search-icon" size={17} />
            <input
              type="text"
              className="vdp-search-input"
              placeholder="Search by document name, organizer, event, or uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Association, Sort and View Mode */}
          <div className="vdp-view-sort-group">
            <select
              className="vdp-select"
              value={associationFilter}
              onChange={(e) => setAssociationFilter(e.target.value)}
              aria-label="Filter by Association"
            >
              <option value="ALL">All Associations</option>
              <option value="ORGANIZER">Linked to Organizers</option>
              <option value="EVENT">Linked to Events</option>
              <option value="UNLINKED">General / Unlinked</option>
            </select>

            <select
              className="vdp-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              aria-label="Sort Documents"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="NAME">Name (A-Z)</option>
              <option value="SIZE">Largest Size</option>
            </select>

            <div className="vdp-view-toggle">
              <button
                type="button"
                className={`vdp-view-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
                title="Table View"
                aria-label="Table View"
              >
                <LayoutList size={16} />
              </button>
              <button
                type="button"
                className={`vdp-view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
                aria-label="Grid View"
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="vdp-category-pills">
          <button
            type="button"
            className={`vdp-pill ${categoryFilter === "ALL" ? "active" : ""}`}
            onClick={() => setCategoryFilter("ALL")}
          >
            All Categories
            <span className="vdp-pill-count">{counts.total}</span>
          </button>

          <button
            type="button"
            className={`vdp-pill ${categoryFilter === "Organizer Agreement" ? "active" : ""}`}
            onClick={() => setCategoryFilter("Organizer Agreement")}
          >
            Organizer Agreements
            <span className="vdp-pill-count">{counts.agreements}</span>
          </button>

          <button
            type="button"
            className={`vdp-pill ${categoryFilter === "Event Document" ? "active" : ""}`}
            onClick={() => setCategoryFilter("Event Document")}
          >
            Event Documents
            <span className="vdp-pill-count">{counts.eventDocs}</span>
          </button>

          <button
            type="button"
            className={`vdp-pill ${categoryFilter === "Report" ? "active" : ""}`}
            onClick={() => setCategoryFilter("Report")}
          >
            Reports
            <span className="vdp-pill-count">{counts.reports}</span>
          </button>

          <button
            type="button"
            className={`vdp-pill ${categoryFilter === "General Document" ? "active" : ""}`}
            onClick={() => setCategoryFilter("General Document")}
          >
            General Documents
            <span className="vdp-pill-count">{counts.general}</span>
          </button>
        </div>
      </div>

      {/* 4. DOCUMENTS CONTENT (TABLE OR GRID) */}
      {loading ? (
        <div className="vdp-empty-state">
          <RefreshCw className="animate-spin text-amber-600 mb-3" size={32} />
          <h3 className="vdp-empty-title">Loading Document Vault</h3>
          <p className="vdp-empty-desc">
            Decrypting metadata and verifying private storage permissions...
          </p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="vdp-empty-state">
          <div className="vdp-empty-icon">
            <FileText size={32} />
          </div>
          <h3 className="vdp-empty-title">No Documents Found</h3>
          <p className="vdp-empty-desc">
            {searchTerm || categoryFilter !== "ALL" || associationFilter !== "ALL"
              ? "No documents match your active search and filter criteria. Try clearing some filters."
              : "Your document vault is currently empty. Upload your first organizer agreement, event document or generate a system report."}
          </p>

          <div className="flex gap-3">
            {(searchTerm ||
              categoryFilter !== "ALL" ||
              associationFilter !== "ALL") && (
              <button
                type="button"
                className="vdp-btn vdp-btn-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("ALL");
                  setAssociationFilter("ALL");
                }}
              >
                Clear Filters
              </button>
            )}

            <button
              type="button"
              className="vdp-btn vdp-btn-primary"
              onClick={() => {
                resetUploadForm();
                setUploadModalOpen(true);
              }}
            >
              <Plus size={16} />
              Upload Document
            </button>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="vdp-table-card">
          <div className="vdp-table-wrap">
            <table className="vdp-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>Associated Entity</th>
                  <th>Uploaded By &amp; Date</th>
                  <th>File Size</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="vdp-file-cell">
                        {renderFileTypeIcon(doc.fileType)}
                        <div className="vdp-file-meta">
                          <span className="vdp-file-name" title={doc.name}>
                            {doc.name}
                          </span>
                          <span className="vdp-file-sub">
                            <span>{doc.id}</span>
                            {doc.source === "generated_report" && (
                              <span className="text-emerald-700 font-semibold">
                                • Auto Generated
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{renderCategoryBadge(doc.category)}</td>

                    <td>
                      {doc.organizerName ? (
                        <span
                          className="vdp-assoc-tag"
                          title={`Associated Organizer: ${doc.organizerName}`}
                        >
                          <Building2 size={13} className="text-amber-600" />
                          {doc.organizerName}
                        </span>
                      ) : doc.eventTitle ? (
                        <span
                          className="vdp-assoc-tag"
                          title={`Associated Event: ${doc.eventTitle}`}
                        >
                          <Calendar size={13} className="text-indigo-600" />
                          {doc.eventTitle}
                        </span>
                      ) : (
                        <span className="vdp-assoc-tag none">
                          General / Platform
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {formatDate(doc.uploadedAt)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(doc.uploadedAt)} • {doc.uploadedBy}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="font-medium text-gray-800">
                        {formatBytes(doc.fileSize)}
                      </span>
                    </td>

                    <td>
                      <div className="vdp-actions-cell">
                        <button
                          type="button"
                          className="vdp-btn-icon"
                          onClick={() => handleOpenPreview(doc)}
                          title="Preview Document"
                          aria-label={`Preview ${doc.name}`}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="vdp-btn-icon"
                          onClick={() => handleDownload(doc)}
                          title="Download Document"
                          aria-label={`Download ${doc.name}`}
                        >
                          <Download size={15} />
                        </button>

                        <button
                          type="button"
                          className="vdp-btn-icon danger"
                          onClick={() => setDeleteTarget(doc)}
                          title="Delete Document"
                          aria-label={`Delete ${doc.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="vdp-grid-wrap">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="vdp-grid-card">
              <div>
                <div className="vdp-grid-card-top">
                  {renderFileTypeIcon(doc.fileType)}
                  {renderCategoryBadge(doc.category)}
                </div>

                <h4 className="vdp-grid-title" title={doc.name}>
                  {doc.name}
                </h4>

                <p className="vdp-grid-desc">
                  {doc.description || "No description provided for this document."}
                </p>

                <div className="vdp-grid-meta-list">
                  <div className="vdp-grid-meta-item">
                    <span className="vdp-grid-meta-label">Associated With:</span>
                    <span className="vdp-grid-meta-val">
                      {doc.organizerName || doc.eventTitle || "General"}
                    </span>
                  </div>

                  <div className="vdp-grid-meta-item">
                    <span className="vdp-grid-meta-label">File Size:</span>
                    <span className="vdp-grid-meta-val">
                      {formatBytes(doc.fileSize)}
                    </span>
                  </div>

                  <div className="vdp-grid-meta-item">
                    <span className="vdp-grid-meta-label">Uploaded:</span>
                    <span className="vdp-grid-meta-val">
                      {formatDate(doc.uploadedAt)}
                    </span>
                  </div>

                  <div className="vdp-grid-meta-item">
                    <span className="vdp-grid-meta-label">Uploaded By:</span>
                    <span className="vdp-grid-meta-val">{doc.uploadedBy}</span>
                  </div>
                </div>
              </div>

              <div className="vdp-grid-actions">
                <button
                  type="button"
                  className="vdp-btn vdp-btn-secondary vdp-btn-sm flex-1"
                  onClick={() => handleOpenPreview(doc)}
                >
                  <Eye size={14} />
                  Preview
                </button>

                <button
                  type="button"
                  className="vdp-btn vdp-btn-primary vdp-btn-sm flex-1"
                  onClick={() => handleDownload(doc)}
                >
                  <Download size={14} />
                  Download
                </button>

                <button
                  type="button"
                  className="vdp-btn-icon danger"
                  onClick={() => setDeleteTarget(doc)}
                  title="Delete Document"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================
          5. MODAL: UPLOAD DOCUMENT
          ==================================================== */}
      {uploadModalOpen && (
        <div className="vdp-modal-overlay">
          <div className="vdp-modal" role="dialog" aria-modal="true">
            <div className="vdp-modal-header">
              <h3 className="vdp-modal-title">Upload New Document</h3>
              <button
                type="button"
                className="vdp-btn-icon"
                onClick={() => setUploadModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={submitUpload}>
              <div className="vdp-modal-body">
                {uploadError && (
                  <div className="vdp-alert vdp-alert-error">
                    <AlertTriangle size={18} className="shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Dropzone */}
                <div
                  className={`vdp-dropzone ${dragActive ? "drag-active" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  <UploadCloud className="vdp-dropzone-icon" />

                  {uploadFile ? (
                    <div>
                      <p className="vdp-dropzone-text text-amber-800">
                        {uploadFile.name}
                      </p>
                      <p className="vdp-dropzone-sub">
                        {formatBytes(uploadFile.size)} • Click to replace file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="vdp-dropzone-text">
                        Click or drag file here to upload
                      </p>
                      <p className="vdp-dropzone-sub">
                        Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 15MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="vdp-form-group">
                  <label className="vdp-label">Document Title / Display Name</label>
                  <input
                    type="text"
                    className="vdp-input"
                    placeholder="e.g. 2026 Organizer Master Agreement"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    required
                  />
                </div>

                {/* Category Selection */}
                <div className="vdp-form-group">
                  <label className="vdp-label">Document Category</label>
                  <select
                    className="vdp-input"
                    value={uploadCategory}
                    onChange={(e) => {
                      const cat = e.target.value as DocumentCategory;
                      setUploadCategory(cat);
                    }}
                  >
                    <option value="Organizer Agreement">
                      Organizer Agreement
                    </option>
                    <option value="Event Document">Event Document</option>
                    <option value="Report">Report</option>
                    <option value="General Document">General Document</option>
                  </select>
                </div>

                {/* Associate Organizer */}
                {uploadCategory === "Organizer Agreement" && (
                  <div className="vdp-form-group">
                    <label className="vdp-label">
                      Associate With Organizer{" "}
                      <span className="text-amber-700">*</span>
                    </label>
                    <select
                      className="vdp-input"
                      value={uploadOrganizerId}
                      onChange={(e) => setUploadOrganizerId(e.target.value)}
                      required
                    >
                      <option value="">-- Select an Organizer --</option>
                      {organizers.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Associate Event */}
                {uploadCategory === "Event Document" && (
                  <div className="vdp-form-group">
                    <label className="vdp-label">
                      Associate With Event <span className="text-indigo-700">*</span>
                    </label>
                    <select
                      className="vdp-input"
                      value={uploadEventId}
                      onChange={(e) => setUploadEventId(e.target.value)}
                      required
                    >
                      <option value="">-- Select an Event --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} ({ev.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div className="vdp-form-group">
                  <label className="vdp-label">Notes &amp; Description</label>
                  <textarea
                    className="vdp-textarea"
                    placeholder="Add optional notes, permit numbers, or validity dates..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="vdp-modal-footer">
                <button
                  type="button"
                  className="vdp-btn vdp-btn-secondary"
                  onClick={() => setUploadModalOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="vdp-btn vdp-btn-primary"
                  disabled={uploading || !uploadFile}
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Encrypting &amp; Storing...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      Save to Vault
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          6. MODAL: SYSTEM REPORT GENERATOR (Feature 7)
          ==================================================== */}
      {reportModalOpen && (
        <div className="vdp-modal-overlay">
          <div className="vdp-modal" role="dialog" aria-modal="true">
            <div className="vdp-modal-header">
              <h3 className="vdp-modal-title">Generate System Audit Report</h3>
              <button
                type="button"
                className="vdp-btn-icon"
                onClick={() => setReportModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={17} />
              </button>
            </div>

            <div className="vdp-modal-body">
              <div className="vdp-alert vdp-alert-info">
                <Info size={18} className="shrink-0" />
                <span>
                  Reports are compiled from active events, organizer commission
                  schedules, and live customer booking data in the Reports &amp;
                  Finance engines.
                </span>
              </div>

              <div className="vdp-form-group">
                <label className="vdp-label">Select Report Format &amp; Module</label>
                <select
                  className="vdp-input"
                  value={reportType}
                  onChange={(e) =>
                    setReportType(
                      e.target.value as
                        | "finance_summary"
                        | "event_sales"
                        | "organizer_commissions"
                        | "executive_pdf"
                    )
                  }
                >
                  <option value="finance_summary">
                    Financial Settlement &amp; Commission Ledger (CSV)
                  </option>
                  <option value="event_sales">
                    Event Sales &amp; Inventory Attendance (CSV)
                  </option>
                  <option value="organizer_commissions">
                    Organizer Directory &amp; Commission Rates (CSV)
                  </option>
                  <option value="executive_pdf">
                    Executive Performance &amp; Operations Audit (PDF)
                  </option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                <strong>Data Scope:</strong> Includes {events.length} active events,{" "}
                {organizers.length} registered organizers, and {bookings.length}{" "}
                system booking records. Generated files are tagged with the
                "Report" category.
              </div>
            </div>

            <div className="vdp-modal-footer">
              <button
                type="button"
                className="vdp-btn vdp-btn-secondary"
                onClick={() => setReportModalOpen(false)}
                disabled={generatingReport}
              >
                Close
              </button>

              <button
                type="button"
                className="vdp-btn vdp-btn-secondary"
                disabled={generatingReport}
                onClick={() => handleGenerateSystemReport(false)}
              >
                <Download size={15} />
                Download Directly
              </button>

              <button
                type="button"
                className="vdp-btn vdp-btn-primary"
                disabled={generatingReport}
                onClick={() => handleGenerateSystemReport(true)}
              >
                {generatingReport ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Save to Vault &amp; Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          7. MODAL: DOCUMENT PREVIEW
          ==================================================== */}
      {previewDoc && (
        <div className="vdp-modal-overlay">
          <div className="vdp-modal vdp-modal-lg" role="dialog" aria-modal="true">
            <div className="vdp-modal-header">
              <div className="flex items-center gap-3">
                {renderFileTypeIcon(previewDoc.fileType)}
                <div>
                  <h3 className="vdp-modal-title">{previewDoc.name}</h3>
                  <p className="text-xs text-gray-500 m-0">
                    {previewDoc.category} • {formatBytes(previewDoc.fileSize)} •
                    Uploaded by {previewDoc.uploadedBy}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="vdp-btn vdp-btn-secondary vdp-btn-sm"
                  onClick={() => handleDownload(previewDoc)}
                >
                  <Download size={14} />
                  Download
                </button>

                <button
                  type="button"
                  className="vdp-btn-icon"
                  onClick={handleClosePreview}
                  aria-label="Close preview"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="vdp-modal-body">
              {previewUrl &&
              (previewDoc.fileType === "png" || previewDoc.fileType === "jpg") ? (
                <div className="vdp-preview-content">
                  <img
                    src={previewUrl}
                    alt={previewDoc.name}
                    className="vdp-preview-img"
                  />
                </div>
              ) : previewUrl && previewDoc.fileType === "pdf" ? (
                <div className="vdp-preview-content">
                  <iframe
                    src={previewUrl}
                    title={previewDoc.name}
                    className="vdp-preview-iframe"
                  />
                </div>
              ) : (
                /* Non-visual files (DOC, XLS, etc.) */
                <div className="vdp-doc-card-preview">
                  <div className="vdp-file-icon-badge vdp-file-icon-doc w-16 h-16 rounded-2xl">
                    <FileText size={32} />
                  </div>

                  <h4 className="text-lg font-bold text-gray-900 m-0">
                    {previewDoc.name}
                  </h4>

                  <p className="text-sm text-gray-600 max-w-md m-0">
                    {previewDoc.description ||
                      "This document format can be inspected using your device's native editor."}
                  </p>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 w-full max-w-md flex flex-col gap-2 text-left">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">MIME Type:</span>
                      <span className="font-mono text-gray-800">
                        {previewDoc.mimeType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">Vault Key:</span>
                      <span className="font-mono text-gray-800">
                        {previewDoc.fileKey}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">Storage:</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Private IndexedDB Vault
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="vdp-btn vdp-btn-primary mt-2"
                    onClick={() => handleDownload(previewDoc)}
                  >
                    <Download size={16} />
                    Download File to View
                  </button>
                </div>
              )}
            </div>

            <div className="vdp-modal-footer">
              <span className="text-xs text-gray-500 mr-auto">
                Securely encrypted in private client vault
              </span>
              <button
                type="button"
                className="vdp-btn vdp-btn-secondary"
                onClick={handleClosePreview}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          8. MODAL: DELETE CONFIRMATION
          ==================================================== */}
      {deleteTarget && (
        <div className="vdp-modal-overlay">
          <div className="vdp-modal max-w-md" role="dialog" aria-modal="true">
            <div className="vdp-modal-header">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={20} />
                <h3 className="vdp-modal-title text-red-700">Delete Document</h3>
              </div>
              <button
                type="button"
                className="vdp-btn-icon"
                onClick={() => setDeleteTarget(null)}
                aria-label="Close modal"
              >
                <X size={17} />
              </button>
            </div>

            <div className="vdp-modal-body">
              <p className="text-sm text-gray-700 leading-relaxed m-0">
                Are you sure you want to permanently delete{" "}
                <strong className="text-gray-900 font-bold">
                  "{deleteTarget.name}"
                </strong>
                ?
              </p>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 leading-normal">
                This action will delete both the database record and the
                underlying file from private storage. This operation cannot be
                undone.
              </div>
            </div>

            <div className="vdp-modal-footer">
              <button
                type="button"
                className="vdp-btn vdp-btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="vdp-btn vdp-btn-danger"
                onClick={executeDelete}
              >
                <Trash2 size={15} />
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          9. TOAST NOTIFICATION
          ==================================================== */}
      {toastMessage && (
        <div className="vdp-toast" role="status">
          <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            className="text-gray-400 hover:text-white ml-2"
            onClick={() => setToastMessage(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
