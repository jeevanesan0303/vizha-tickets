
import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  FileDown,
  FileSpreadsheet,
  Info,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Search,
  ShieldCheck,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { AdvancedEvent } from "./EventForm";
import type { AdvancedOrganizer } from "./OrganizerForm";

import {
  useDemoEventBookingReport,
} from "../../lib/customerBookings";

import {
  createEventSlug,
  getPublicEvents,
  staticEvents,
} from "../../data/events";

import "./ReportsPage.css";

/* ==========================================================
   VIZHATICKETS — EVENT REPORTS & ANALYTICS

   CONNECTED FRONTEND DEVELOPMENT VERSION

   React + Vite + TypeScript

   DATA FLOW
   ----------------------------------------------------------
   Admin Events
      ↓
   Admin Organizers
      ↓
   Shared Public Event Catalogue
      ↓
   Customer Demo Bookings
      ↓
   Event Reports / CSV / PDF

   IMPORTANT
   ----------------------------------------------------------
   Demo bookings are NOT verified paid sales.

   No actual platform commission, organizer payable,
   received cash or settlement balance is inferred
   from browser localStorage.

   Financial estimates are explicitly illustrative.

   Real finance requires trusted backend records.
   ========================================================== */

/* ==========================================================
   LEGACY REPORT BOOKING TYPE

   Preserved so existing AdminApp.tsx imports and
   props do not break.

   IMPORTANT:
   These legacy mock bookings are not used as
   verified payment records.
   ========================================================== */

export interface ReportTicketLine {
  tierId?: string;
  tierName?: string;
  quantity: number;
  unitPrice?: number;
  total?: number;
}

export interface ReportBooking {
  id: string;
  customer: string;
  email: string;
  eventId: string;
  event: string;
  tickets: number;
  total: number;
  currency: string;

  status:
    | "Confirmed"
    | "Checked In"
    | "Cancelled"
    | "Refunded";

  paymentVerified: boolean;
  bookedAt: string;

  ticketLines?: ReportTicketLine[];
}

interface ReportsPageProps {
  events: AdvancedEvent[];
  organizers: AdvancedOrganizer[];

  /*
   * Optional for backwards compatibility.
   * The report does NOT treat these client-side
   * mock bookings as verified sales.
   */

  bookings?: ReportBooking[];
}

interface TierReport {
  id: string;
  name: string;
  price: number;
  capacity: number;
  enabled: boolean;

  demoQuantity: number | null;
  demoRevenue: number | null;
}

type CurrencyValue = number | null;

/* ==========================================================
   HELPERS
   ========================================================== */

const REPORT_NAME = "VizhaTickets";

function formatMoney(
  amount: CurrencyValue,
  code: string
): string {
  if (
    amount === null ||
    !Number.isFinite(amount)
  ) {
    return "Unavailable";
  }

  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString(
      "en-LK",
      { maximumFractionDigits: 2 }
    )}`;
  }
}

function formatDate(
  value: string | undefined
): string {
  if (!value) return "Not provided";

  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T12:00:00`
      : value
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(
  value: string | undefined
): string {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function safeNumber(
  value: number | undefined
): number {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : 0;
}

function safeFileName(value: string): string {
  return (
    value.replace(/[^a-zA-Z0-9_-]/g, "-") ||
    "event"
  );
}

/* ==========================================================
   REUSABLE UI
   ========================================================== */

function InfoLine({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="vrp-info-line">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

function Metric({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: string;
  note?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="vrp-metric">
      <div className="vrp-metric-heading">
        <span>{title}</span>
        <Icon size={20} />
      </div>

      <strong>{value}</strong>

      {note && <small>{note}</small>}
    </div>
  );
}

/* ==========================================================
   CSV EXPORT

   Includes protection against spreadsheet formula
   execution when opening externally supplied strings.
   ========================================================== */

function csvEscape(
  value: string | number | null | undefined
): string {
  let text = String(value ?? "");

  if (/^[\s]*[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCSV(
  filename: string,
  rows: Array<
    Array<string | number | null | undefined>
  >
): void {
  const contents = rows
    .map((row) =>
      row.map(csvEscape).join(",")
    )
    .join("\r\n");

  const blob = new Blob(
    ["\uFEFF", contents],
    { type: "text/csv;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );
}

/* ==========================================================
   PDF TEXT SAFETY

   Standard jsPDF fonts cannot reliably render Tamil
   and other non-Latin scripts.

   This fallback prevents malformed PDF output, but
   multilingual font embedding is still required
   for accurate Tamil text in PDF exports.
   ========================================================== */

function pdfText(value: unknown): string {
  return String(value ?? "Not provided")
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "?");
}

/* ==========================================================
   CONVERT BROWSER IMAGE TO PDF DATA URL

   Supports:
   - Embedded data URLs
   - Same-origin image paths
   - CORS-enabled remote image URLs

   Cross-origin images without CORS permission
   cannot be embedded safely.
   ========================================================== */

async function imageToDataURL(
  source: string
): Promise<string | null> {
  if (!source) return null;

  if (
    source.startsWith("data:image/jpeg") ||
    source.startsWith("data:image/png")
  ) {
    return source;
  }

  try {
    const response = await fetch(source, {
      mode: "cors",
    });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      return null;
    }

    const image = await createImageBitmap(blob);

    const canvas = document.createElement("canvas");

    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext("2d");

    if (!context) {
      image.close();
      return null;
    }

    context.drawImage(image, 0, 0);

    const data = canvas.toDataURL(
      "image/jpeg",
      0.86
    );

    image.close();

    return data;
  } catch {
    return null;
  }
}

/* ==========================================================
   RESOLVE ADMIN EVENT PUBLIC SLUG

   Admin-created events and older static events
   sometimes use different event IDs.

   This helper preserves those legacy mappings.
   ========================================================== */

function resolveEventSlug(
  event: AdvancedEvent
): string {
  const publicEvent = getPublicEvents().find(
    (item) =>
      item.adminEventId === event.id ||
      (
        item.eventSource === "admin" &&
        item.id === event.id
      )
  );

  if (publicEvent) {
    return publicEvent.slug;
  }

  const matchingStatic = staticEvents.find(
    (item) =>
      item.adminEventId === event.id
  );

  if (matchingStatic) {
    return matchingStatic.slug;
  }

  return (
    `${createEventSlug(event.title)}-` +
    createEventSlug(event.id)
  );
}

/* ==========================================================
   MAIN REPORTS PAGE
   ========================================================== */

export default function ReportsPage({
  events,
  organizers,
}: ReportsPageProps) {
  const [selectedEventId, setSelectedEventId] =
    useState("");

  const [eventSearch, setEventSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [pdfLoading, setPdfLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ========================================================
     EVENT FILTERING
     ======================================================== */

  const filteredEvents = useMemo(() => {
    const term =
      eventSearch.trim().toLowerCase();

    return events.filter((event) => {
      const searchable = [
        event.id,
        event.title,
        event.category,
        event.city,
        event.country,
        event.venue,
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(term) &&
        (
          statusFilter === "All" ||
          event.status === statusFilter
        )
      );
    });
  }, [
    events,
    eventSearch,
    statusFilter,
  ]);

  const selectedEvent =
    events.find(
      (event) =>
        event.id === selectedEventId
    ) ?? null;

  /* ========================================================
     ORGANIZER
     ======================================================== */

  const organizer = selectedEvent
    ? organizers.find(
        (item) =>
          item.id === selectedEvent.organizerId
      ) ?? null
    : null;

  /* ========================================================
     EVENT REFERENCE

     Stable admin ID is preferred.
     Slug preserves old customer bookings.
     ======================================================== */

  const eventId =
    selectedEvent?.id ?? "";

  const eventSlug = selectedEvent
    ? resolveEventSlug(selectedEvent)
    : "";

  const eventCurrency =
    selectedEvent?.currency || "LKR";

  /* ========================================================
     LIVE CUSTOMER DEMO BOOKINGS

     CRITICAL INTEGRATION:

     This hook subscribes to BOOKING_CHANGE_EVENT
     and browser localStorage updates.

     Do not conditionally call this hook.
     ======================================================== */

  const demoReport =
    useDemoEventBookingReport(
      eventId,
      eventSlug,
      eventCurrency
    );

  /* ========================================================
     COMMISSION AGREEMENT

     Organizer commission is not the same thing as
     the checkout service fee.

     Here it is only used to generate an illustrative
     gross-sales scenario using demo ticket subtotals.
     ======================================================== */

  const commissionRate =
    organizer?.commission !== undefined &&
    Number.isFinite(organizer.commission)
      ? organizer.commission
      : null;

  const commissionRateValid =
    commissionRate !== null &&
    commissionRate >= 0 &&
    commissionRate <= 100;

  const hasConsistentCurrency =
    demoReport.currency === eventCurrency;

  const canIllustrateFinance =
    Boolean(
      selectedEvent &&
      commissionRateValid &&
      hasConsistentCurrency
    );

  const illustrativeCommission =
    canIllustrateFinance &&
    commissionRate !== null
      ? (
          demoReport.demoTicketSubtotal *
          commissionRate
        ) / 100
      : null;

  const illustrativeOrganizerShare =
    illustrativeCommission !== null
      ? (
          demoReport.demoTicketSubtotal -
          illustrativeCommission
        )
      : null;

  /* ========================================================
     EVENT CAPACITY

     Active tiers are used for current capacity.
     Demo bookings do not deduct real inventory.
     ======================================================== */

  const configuredCapacity =
    selectedEvent?.ticketTiers
      .filter((tier) => tier.enabled)
      .reduce(
        (sum, tier) =>
          sum + Math.max(
            0,
            safeNumber(tier.capacity)
          ),
        0
      ) ?? 0;

  const demoOccupancy =
    configuredCapacity > 0
      ? Math.min(
          100,
          (
            demoReport.totalTickets /
            configuredCapacity
          ) * 100
        )
      : 0;

  /* ========================================================
     TICKET CATEGORY REPORT

     Match demo ticket allocations to admin categories.

     A category total is shown only if the booking
     allocations are complete and every tier matches
     an admin-configured tier.

     Prevent displaying fictional category sales.
     ======================================================== */

  const tierReports: TierReport[] = useMemo(() => {
    if (!selectedEvent) return [];

    const allocationMap = new Map(
      demoReport.ticketTiers.map(
        (tier) => [tier.tierId, tier]
      )
    );

    return selectedEvent.ticketTiers.map(
      (tier) => {
        const allocation =
          allocationMap.get(tier.id);

        return {
          id: tier.id,
          name: tier.name,
          price: tier.price,
          capacity: tier.capacity,
          enabled: tier.enabled,

          demoQuantity:
            allocation?.quantity ?? 0,

          demoRevenue:
            allocation?.revenue ?? 0,
        };
      }
    );
  }, [
    selectedEvent,
    demoReport.ticketTiers,
  ]);

  const allAllocationsMatchTiers =
    demoReport.ticketTiers.every(
      (allocation) =>
        selectedEvent?.ticketTiers.some(
          (tier) =>
            tier.id === allocation.tierId
        ) ?? false
    );

  const totalAllocatedTickets =
    demoReport.ticketTiers.reduce(
      (sum, tier) =>
        sum + tier.quantity,
      0
    );

  const tierSalesKnown =
    Boolean(
      selectedEvent &&
      demoReport.hasCompleteTierAllocation &&
      allAllocationsMatchTiers &&
      totalAllocatedTickets ===
        demoReport.totalTickets
    );

  /* ========================================================
     EVENT COUNTS

     Demo bookings are counted from customer storage.
     They must not be presented as paid tickets.
     ======================================================== */

  const publishedCount = events.filter(
    (event) => event.status === "Published"
  ).length;

  const activeOrganizerCount = organizers.filter(
    (item) => item.status === "Active"
  ).length;

  /* ========================================================
     EXPORT HELPERS
     ======================================================== */

  const selectedEventLabel =
    selectedEvent?.title ?? "";

  const selectedOrganizerLabel =
    organizer?.displayName ||
    organizer?.name ||
    "Unavailable";

  /* ========================================================
     EXPORT CSV
     ======================================================== */

  const exportReportCSV = () => {
    if (!selectedEvent) return;

    const rows: Array<
      Array<string | number | null>
    > = [
      [
        "VizhaTickets Event Report",
        selectedEvent.title,
      ],

      ["REPORT STATUS", "DEMO ONLY"],
      ["Event ID", selectedEvent.id],
      ["Event Slug", eventSlug],
      ["Event Category", selectedEvent.category],
      ["Event Status", selectedEvent.status],
      ["Start Date", selectedEvent.date],
      ["Start Time", selectedEvent.time],
      ["End Date", selectedEvent.endDate || ""],
      ["End Time", selectedEvent.endTime || ""],
      ["Venue", selectedEvent.venue],
      ["City", selectedEvent.city],
      ["Country", selectedEvent.country],
      ["Admission Type", selectedEvent.admissionType],
      ["Stage Position", selectedEvent.stagePosition || ""],
      ["Currency", eventCurrency],

      [],

      ["ORGANIZER INFORMATION", ""],
      ["Organizer ID", organizer?.id || ""],
      ["Organizer", selectedOrganizerLabel],
      ["Contact Name", organizer?.contactName || ""],
      ["Contact Email", organizer?.email || ""],
      ["Contact Phone", organizer?.phone || ""],
      ["Organizer Country", organizer?.country || ""],
      [
        "Commission Agreement",
        commissionRateValid
          ? `${commissionRate}%`
          : "Unavailable",
      ],
      [
        "Settlement Currency",
        organizer?.settlementCurrency || "",
      ],
      [
        "Settlement Schedule",
        organizer?.settlementSchedule || "",
      ],

      [],

      ["DEMO BOOKING ACTIVITY", ""],
      ["Demo Bookings", demoReport.totalBookings],
      ["Demo Tickets", demoReport.totalTickets],
      ["Configured Capacity", configuredCapacity],

      [
        "Demo Ticket Subtotal",
        hasConsistentCurrency
          ? demoReport.demoTicketSubtotal
          : "Unavailable",
      ],
      [
        "Demo Service Fees",
        hasConsistentCurrency
          ? demoReport.demoServiceFees
          : "Unavailable",
      ],
      [
        "Demo Order Total",
        hasConsistentCurrency
          ? demoReport.demoOrderTotal
          : "Unavailable",
      ],

      [],

      ["ILLUSTRATIVE FINANCIAL SCENARIO", ""],
      [
        "Illustrative Platform Commission",
        illustrativeCommission ?? "Unavailable",
      ],
      [
        "Illustrative Organizer Gross Share",
        illustrativeOrganizerShare ?? "Unavailable",
      ],

      [],

      ["VERIFIED FINANCIAL VALUES", ""],
      ["Verified Gross Sales", "Unavailable"],
      ["Verified Tickets Sold", "Unavailable"],
      ["Payment Gateway Fees", "Unavailable"],
      ["Refunds", "Unavailable"],
      ["Tax Deductions", "Unavailable"],
      ["Actual Commission Earned", "Unavailable"],
      ["Verified Settlements Paid", "Unavailable"],
      ["Organizer Net Payable", "Unavailable"],
      ["Outstanding Settlement", "Unavailable"],

      [],

      [
        "TICKET CATEGORY",
        "PRICE",
        "CAPACITY",
        "DEMO QUANTITY",
        "DEMO REVENUE",
      ],

      ...tierReports.map(
        (tier) => [
          tier.name,
          tier.price,
          tier.capacity,

          tierSalesKnown
            ? tier.demoQuantity
            : "Unavailable",

          tierSalesKnown
            ? tier.demoRevenue
            : "Unavailable",
        ]
      ),

      [],

      [
        "DISCLAIMER",
        "All booking activity and commission estimates are demonstrations. No real payment has been verified.",
      ],
    ];

    downloadCSV(
      `VizhaTickets-Report-${safeFileName(
        selectedEvent.id
      )}.csv`,
      rows
    );
  };

  /* ========================================================
     MULTIPAGE PDF EXPORT
     ======================================================== */

  const exportPDF = async () => {
    if (!selectedEvent || pdfLoading) {
      return;
    }

    setPdfLoading(true);
    setError("");

    try {
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 17;

      const usableWidth =
        pageWidth - margin * 2;

      let y = 20;
      let pageNumber = 1;

      const dark: [number, number, number] =
        [32, 30, 36];

      const gold: [number, number, number] =
        [192, 118, 19];

      const grey: [number, number, number] =
        [112, 105, 96];

      /* ====================================================
         PDF FOOTER
         ==================================================== */

      const writeFooter = () => {
        pdf.setDrawColor(
          226,
          219,
          208
        );

        pdf.line(
          margin,
          pageHeight - 17,
          pageWidth - margin,
          pageHeight - 17
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(8);

        pdf.setTextColor(...grey);

        pdf.text(
          "VizhaTickets | DEMO ONLY - NOT A SETTLEMENT STATEMENT",
          margin,
          pageHeight - 11
        );

        pdf.text(
          `Page ${pageNumber}`,
          pageWidth - margin,
          pageHeight - 11,
          { align: "right" }
        );
      };

      const newPage = () => {
        writeFooter();

        pdf.addPage();

        pageNumber += 1;
        y = 22;
      };

      const ensureSpace = (
        needed: number
      ) => {
        if (
          y + needed >
          pageHeight - 25
        ) {
          newPage();
        }
      };

      /* ====================================================
         PDF SECTION
         ==================================================== */

      const section = (
        title: string
      ) => {
        ensureSpace(21);

        y += 5;

        pdf.setFillColor(
          251,
          242,
          229
        );

        pdf.roundedRect(
          margin,
          y,
          usableWidth,
          11,
          2,
          2,
          "F"
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(11);
        pdf.setTextColor(...gold);

        pdf.text(
          pdfText(title),
          margin + 4,
          y + 7
        );

        y += 16;
      };

      /* ====================================================
         PDF FIELD
         ==================================================== */

      const line = (
        label: string,
        value: unknown
      ) => {
        const safeValue = pdfText(
          value === "" ||
          value === null ||
          value === undefined
            ? "Not provided"
            : value
        );

        const lines = pdf.splitTextToSize(
          safeValue,
          usableWidth - 65
        ) as string[];

        const lineHeight = Math.max(
          8,
          lines.length * 5 + 3
        );

        ensureSpace(lineHeight);

        pdf.setFontSize(9);

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setTextColor(...grey);

        pdf.text(
          pdfText(label),
          margin + 1,
          y + 4
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setTextColor(...dark);

        pdf.text(
          lines,
          margin + 65,
          y + 4
        );

        y += lineHeight;
      };

      /* ====================================================
         PDF PARAGRAPH
         ==================================================== */

      const paragraph = (
        content: string
      ) => {
        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(9);
        pdf.setTextColor(...dark);

        const textLines =
          pdf.splitTextToSize(
            pdfText(
              content || "Not provided"
            ),
            usableWidth - 3
          ) as string[];

        for (const textLine of textLines) {
          ensureSpace(6);

          pdf.text(
            textLine,
            margin + 1,
            y + 4
          );

          y += 5.4;
        }

        y += 3;
      };

      /* ====================================================
         PDF IMAGE

         Large images are scaled to fit the remaining
         page area without overlapping the footer.
         ==================================================== */

      const drawImage = async (
        source: string,
        label: string,
        maxHeight: number
      ) => {
        const data =
          await imageToDataURL(source);

        if (!data) {
          line(
            label,
            source
              ? "Image could not be embedded"
              : "Not uploaded"
          );

          return;
        }

        try {
          const props =
            pdf.getImageProperties(data);

          const aspect =
            props.width /
            Math.max(1, props.height);

          const safeMaxHeight = Math.min(
            maxHeight,
            pageHeight - 55
          );

          const imageWidth = Math.min(
            usableWidth,
            safeMaxHeight * aspect
          );

          const imageHeight =
            imageWidth / aspect;

          ensureSpace(
            imageHeight + 10
          );

          pdf.addImage(
            data,
            props.fileType,
            margin +
              (usableWidth - imageWidth) / 2,
            y,
            imageWidth,
            imageHeight
          );

          y += imageHeight + 8;
        } catch {
          line(
            label,
            "Unable to embed image"
          );
        }
      };

      /* ====================================================
         PDF HEADER
         ==================================================== */

      pdf.setFillColor(...dark);

      pdf.rect(
        0,
        0,
        pageWidth,
        43,
        "F"
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);

      pdf.text(
        REPORT_NAME,
        margin,
        19
      );

      pdf.setFontSize(11);

      pdf.setTextColor(
        241,
        191,
        114
      );

      pdf.text(
        "EVENT REPORT & DEMO FINANCIAL ANALYSIS",
        margin,
        29
      );

      y = 51;

      line(
        "Generated",
        new Date().toLocaleString("en-GB")
      );

      line(
        "Event Reference",
        selectedEvent.id
      );

      line(
        "Report Classification",
        "DEVELOPMENT DEMONSTRATION"
      );

      /* ====================================================
         EVENT INFORMATION
         ==================================================== */

      section("1. EVENT INFORMATION");

      line(
        "Event Name",
        selectedEvent.title
      );

      line(
        "Category",
        selectedEvent.category
      );

      line(
        "Status",
        selectedEvent.status
      );

      line(
        "Start Date",
        formatDate(selectedEvent.date)
      );

      line(
        "Start Time",
        selectedEvent.time
      );

      line(
        "End Date",
        formatDate(selectedEvent.endDate)
      );

      line(
        "End Time",
        selectedEvent.endTime
      );

      line(
        "Currency",
        eventCurrency
      );

      line(
        "Booking Enabled",
        selectedEvent.bookingEnabled
          ? "Yes"
          : "No"
      );

      /* ====================================================
         ORGANIZER
         ==================================================== */

      section("2. ORGANIZER INFORMATION");

      line(
        "Organizer",
        selectedOrganizerLabel
      );

      line(
        "Organizer ID",
        organizer?.id
      );

      line(
        "Contact Person",
        organizer?.contactName
      );

      line(
        "Email",
        organizer?.email
      );

      line(
        "Phone",
        organizer?.phone
      );

      line(
        "Country",
        organizer?.country
      );

      line(
        "Commission",
        commissionRateValid
          ? `${commissionRate}%`
          : "Unavailable"
      );

      line(
        "Settlement Currency",
        organizer?.settlementCurrency
      );

      line(
        "Settlement Schedule",
        organizer?.settlementSchedule
      );

      /* ====================================================
         VENUE
         ==================================================== */

      section("3. VENUE INFORMATION");

      line(
        "Venue",
        selectedEvent.venue
      );

      line(
        "City",
        selectedEvent.city
      );

      line(
        "Country",
        selectedEvent.country
      );

      line(
        "Admission Type",
        selectedEvent.admissionType
      );

      line(
        "Stage Position",
        selectedEvent.stagePosition
      );

      line(
        "Venue Notes",
        selectedEvent.venueNotes
      );

      /* ====================================================
         DEMO BOOKING ACTIVITY
         ==================================================== */

      section("4. DEMO BOOKING ACTIVITY");

      line(
        "Demo Bookings",
        demoReport.totalBookings
      );

      line(
        "Demo Tickets",
        demoReport.totalTickets
      );

      line(
        "Configured Capacity",
        configuredCapacity
      );

      line(
        "Demo Ticket Subtotal",
        hasConsistentCurrency
          ? formatMoney(
              demoReport.demoTicketSubtotal,
              eventCurrency
            )
          : "Unavailable"
      );

      line(
        "Demo Service Fees",
        hasConsistentCurrency
          ? formatMoney(
              demoReport.demoServiceFees,
              eventCurrency
            )
          : "Unavailable"
      );

      line(
        "Demo Order Total",
        hasConsistentCurrency
          ? formatMoney(
              demoReport.demoOrderTotal,
              eventCurrency
            )
          : "Unavailable"
      );

      line(
        "Tier Allocation",
        tierSalesKnown
          ? "Complete"
          : "Incomplete or unavailable"
      );

      /* ====================================================
         TICKET CATEGORIES
         ==================================================== */

      section("5. TICKET CATEGORY BREAKDOWN");

      for (const tier of tierReports) {
        ensureSpace(38);

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(10);
        pdf.setTextColor(...gold);

        pdf.text(
          pdfText(tier.name),
          margin + 1,
          y + 4
        );

        y += 9;

        line(
          "Configured Price",
          formatMoney(
            tier.price,
            eventCurrency
          )
        );

        line(
          "Capacity",
          tier.capacity
        );

        line(
          "Status",
          tier.enabled
            ? "Enabled"
            : "Disabled"
        );

        line(
          "Demo Ticket Quantity",
          tierSalesKnown
            ? tier.demoQuantity
            : "Unavailable"
        );

        line(
          "Demo Ticket Value",
          tierSalesKnown
            ? formatMoney(
                tier.demoRevenue,
                eventCurrency
              )
            : "Unavailable"
        );
      }

      /* ====================================================
         FINANCIAL ILLUSTRATION
         ==================================================== */

      section("6. ILLUSTRATIVE FINANCIAL SCENARIO");

      paragraph(
        "The following scenario is calculated using fictional checkout bookings and the organizer's configured commission rate. It does not represent cash received or a payment obligation."
      );

      line(
        "Demo Ticket Subtotal",
        hasConsistentCurrency
          ? formatMoney(
              demoReport.demoTicketSubtotal,
              eventCurrency
            )
          : "Unavailable"
      );

      line(
        "Commission Rate",
        commissionRateValid
          ? `${commissionRate}%`
          : "Unavailable"
      );

      line(
        "Illustrative Platform Commission",
        formatMoney(
          illustrativeCommission,
          eventCurrency
        )
      );

      line(
        "Illustrative Organizer Gross Share",
        formatMoney(
          illustrativeOrganizerShare,
          eventCurrency
        )
      );

      /* ====================================================
         VERIFIED FINANCE
         ==================================================== */

      section("7. VERIFIED FINANCIAL STATUS");

      line(
        "Verified Gross Sales",
        "Unavailable"
      );

      line(
        "Verified Tickets Sold",
        "Unavailable"
      );

      line(
        "Actual Commission Earned",
        "Unavailable"
      );

      line(
        "Gateway Processing Fees",
        "Unavailable"
      );

      line(
        "Refunds",
        "Unavailable"
      );

      line(
        "Taxes / Adjustments",
        "Unavailable"
      );

      line(
        "Verified Settlements Paid",
        "Unavailable"
      );

      line(
        "Organizer Net Payable",
        "Unavailable"
      );

      line(
        "Outstanding Settlement",
        "Unavailable"
      );

      /* ====================================================
         EVENT DESCRIPTION / POLICIES
         ==================================================== */

      section("8. EVENT DESCRIPTION");

      paragraph(
        selectedEvent.description
      );

      section("9. REFUND POLICY");

      paragraph(
        selectedEvent.refundPolicy
      );

      section("10. TERMS & CONDITIONS");

      paragraph(
        selectedEvent.terms
      );

      /* ====================================================
         BANNER / VENUE LAYOUT
         ==================================================== */

      section("11. EVENT BANNER");

      await drawImage(
        selectedEvent.imageUrl,
        "Event Banner",
        95
      );

      section("12. VENUE / STADIUM LAYOUT");

      await drawImage(
        selectedEvent.venueLayoutImage,
        "Venue Layout",
        145
      );

      /* ====================================================
         FINAL DISCLAIMER
         ==================================================== */

      section("13. REPORT DISCLAIMERS");

      paragraph(
        "All demo bookings and ticket categories in this report originate from browser-local development data. No payment has been independently verified."
      );

      paragraph(
        "The illustrative organizer share does not account for verified refunds, taxes, gateway processing costs, contractual adjustments or any real payouts."
      );

      paragraph(
        "This report must not be used as an invoice, cash receipt, settlement confirmation, gate admission authorization or instruction to pay an organizer."
      );

      writeFooter();

      pdf.save(
        `VizhaTickets-Event-Report-${safeFileName(
          selectedEvent.id
        )}.pdf`
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `Unable to export PDF: ${cause.message}`
          : "PDF export failed."
      );
    } finally {
      setPdfLoading(false);
    }
  };

  /* ========================================================
     UI
     ======================================================== */

  return (
    <div className="vrp-root">
      {/* ====================================================
          PAGE HEADING
          ==================================================== */}

      <div className="vrp-heading">
        <div>
          <p className="vrp-eyebrow">
            BUSINESS INTELLIGENCE
          </p>

          <h2>Reports & Analytics</h2>

          <p>
            Event performance, demo ticket activity
            and organizer financial analysis.
          </p>
        </div>

        <div className="vrp-heading-icon">
          <BarChart3 size={25} />
        </div>
      </div>

      {/* ====================================================
          SUMMARY METRICS
          ==================================================== */}

      <div className="vrp-overview">
        <Metric
          title="All Events"
          value={events.length.toLocaleString()}
          note="Admin event catalogue"
          icon={CalendarDays}
        />

        <Metric
          title="Published Events"
          value={publishedCount.toLocaleString()}
          note="Visible on the customer website"
          icon={CheckCircle2}
        />

        <Metric
          title="Organizers"
          value={organizers.length.toLocaleString()}
          note={`${activeOrganizerCount} active organizer profiles`}
          icon={Building2}
        />

        <Metric
          title="Data Source"
          value="Demo"
          note="Browser-local booking records"
          icon={Ticket}
        />
      </div>

      {/* ====================================================
          EVENT SELECTION
          ==================================================== */}

      <section className="vrp-panel">
        <div className="vrp-panel-title">
          <div>
            <h3>
              <Search size={19} />
              Select an Event
            </h3>

            <p>
              Select an event to view its detailed
              ticket and financial report.
            </p>
          </div>
        </div>

        <div className="vrp-select-grid">
          <label className="vrp-field">
            <span>Search Events</span>

            <div className="vrp-input-icon">
              <Search size={17} />

              <input
                type="search"
                value={eventSearch}
                onChange={(event) =>
                  setEventSearch(event.target.value)
                }
                placeholder="Search event, ID or location..."
              />
            </div>
          </label>

          <label className="vrp-field">
            <span>Event Status</span>

            <div className="vrp-select-icon">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">
                  All Events
                </option>

                <option value="Published">
                  Published
                </option>

                <option value="Draft">
                  Draft
                </option>
              </select>

              <ChevronDown size={16} />
            </div>
          </label>

          <label className="vrp-field vrp-wide">
            <span>Choose Event Report</span>

            <div className="vrp-select-icon">
              <select
                value={selectedEventId}
                onChange={(event) => {
                  setSelectedEventId(event.target.value);
                  setError("");
                }}
              >
                <option value="">
                  Select an event to view report
                </option>

                {filteredEvents.map((event) => (
                  <option
                    key={event.id}
                    value={event.id}
                  >
                    {event.title} — {event.city} — {event.id}
                  </option>
                ))}

                {selectedEvent &&
                  !filteredEvents.some(
                    (event) =>
                      event.id === selectedEvent.id
                  ) && (
                  <option value={selectedEvent.id}>
                    {selectedEvent.title} — Selected
                  </option>
                )}
              </select>

              <ChevronDown size={16} />
            </div>
          </label>
        </div>
      </section>

      {/* ====================================================
          EMPTY STATE
          ==================================================== */}

      {!selectedEvent ? (
        <div className="vrp-empty">
          <LayoutGrid size={42} />

          <h3>
            Select an Event to Generate a Report
          </h3>

          <p>
            Explore event configuration, organizer
            details, ticket prices, demo booking
            activity, commission illustrations
            and venue layouts.
          </p>
        </div>
      ) : (
        <>
          {/* ==================================================
              EVENT HERO
              ================================================== */}

          <section className="vrp-event-hero">
            {selectedEvent.imageUrl ? (
              <img
                className="vrp-event-banner"
                src={selectedEvent.imageUrl}
                alt={selectedEvent.title}
              />
            ) : (
              <div className="vrp-event-placeholder">
                <CalendarDays size={36} />
                <span>No event banner uploaded</span>
              </div>
            )}

            <div className="vrp-event-hero-content">
              <div className="vrp-event-tag">
                <CalendarDays size={14} />
                {selectedEvent.category}
              </div>

              <h3>{selectedEventLabel}</h3>

              <p>
                <MapPin size={16} />
                {selectedEvent.venue},{" "}
                {selectedEvent.city}
              </p>

              <p>
                <CalendarDays size={16} />
                {formatDate(selectedEvent.date)}
                {selectedEvent.time
                  ? ` · ${selectedEvent.time}`
                  : ""}
              </p>

              <div className="vrp-event-status">
                {selectedEvent.status}
              </div>
            </div>
          </section>

          {/* ==================================================
              DOWNLOAD ACTIONS
              ================================================== */}

          <div className="vrp-report-actions">
            <div>
              <strong>Event Performance Report</strong>

              <span>
                Event ID: {selectedEvent.id} ·
                Development Preview
              </span>
            </div>

            <div className="vrp-action-buttons">
              <button
                type="button"
                className="vrp-secondary-btn"
                onClick={exportReportCSV}
              >
                <FileSpreadsheet size={17} />
                Export CSV
              </button>

              <button
                type="button"
                className="vrp-primary-btn"
                onClick={() => void exportPDF()}
                disabled={pdfLoading}
              >
                <FileDown size={17} />

                {pdfLoading
                  ? "Generating PDF..."
                  : "Download PDF Report"}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="vrp-alert"
              role="alert"
            >
              <CircleAlert size={18} />
              {error}
            </div>
          )}

          {/* ==================================================
              DEMO METRICS
              ================================================== */}

          <div className="vrp-financial-grid">
            <Metric
              title="Demo Bookings"
              value={demoReport.totalBookings.toLocaleString()}
              note="Customer checkout demonstrations"
              icon={Ticket}
            />

            <Metric
              title="Demo Ticket Quantity"
              value={demoReport.totalTickets.toLocaleString()}
              note="Not verified tickets sold"
              icon={Users}
            />

            <Metric
              title="Demo Ticket Value"
              value={
                hasConsistentCurrency
                  ? formatMoney(
                      demoReport.demoTicketSubtotal,
                      eventCurrency
                    )
                  : "Unavailable"
              }
              note="Fictional ticket subtotal"
              icon={Wallet}
            />

            <Metric
              title="Illustrative Commission"
              value={formatMoney(
                illustrativeCommission,
                eventCurrency
              )}
              note="Not actual platform earnings"
              icon={TrendingUp}
            />
          </div>

          {/* ==================================================
              DATA STATUS
              ================================================== */}

          <div className="vrp-notice">
            <Info size={19} />

            <p>
              <strong>Development data:</strong>{" "}
              Demo bookings created on the customer
              website are now connected to this
              report through browser-local storage.
              They are not successful real payments,
              paid admissions or organizer settlement
              transactions.
            </p>
          </div>

          {/* ==================================================
              TICKET ACTIVITY OVERVIEW
              ================================================== */}

          <section className="vrp-panel">
            <div className="vrp-panel-title">
              <div>
                <h3>
                  <TrendingUp size={19} />
                  Demo Ticket Activity
                </h3>

                <p>
                  Compare checkout demonstrations
                  against configured event capacity.
                </p>
              </div>
            </div>

            <div className="vrp-sales-summary">
              <div>
                <span>
                  Configured Capacity
                </span>

                <strong>
                  {configuredCapacity.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>
                  Demo Booking Count
                </span>

                <strong>
                  {demoReport.totalBookings.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>
                  Demo Ticket Quantity
                </span>

                <strong>
                  {demoReport.totalTickets.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>
                  Verified Tickets Sold
                </span>

                <strong>Unavailable</strong>
              </div>
            </div>

            <div className="vrp-progress-heading">
              <span>
                Demo Quantity / Capacity
              </span>

              <strong>
                {demoOccupancy.toFixed(1)}%
              </strong>
            </div>

            <div className="vrp-progress-track">
              <div
                style={{
                  width: `${demoOccupancy}%`,
                }}
              />
            </div>

            <p className="vrp-small-note">
              Demonstration ticket quantities do
              not reduce real remaining inventory.
              A production backend is required
              to calculate actual availability.
            </p>
          </section>

          {/* ==================================================
              EVENT + ORGANIZER INFORMATION
              ================================================== */}

          <div className="vrp-two-column">
            <section className="vrp-panel">
              <div className="vrp-panel-title">
                <div>
                  <h3>
                    <CalendarDays size={19} />
                    Event Information
                  </h3>

                  <p>
                    Complete event configuration
                  </p>
                </div>
              </div>

              <InfoLine label="Event ID">
                {selectedEvent.id}
              </InfoLine>

              <InfoLine label="Public Event Slug">
                {eventSlug}
              </InfoLine>

              <InfoLine label="Category">
                {selectedEvent.category}
              </InfoLine>

              <InfoLine label="Start Date">
                {formatDate(selectedEvent.date)}
              </InfoLine>

              <InfoLine label="Start Time">
                {selectedEvent.time || "Not provided"}
              </InfoLine>

              <InfoLine label="End Date">
                {formatDate(selectedEvent.endDate)}
              </InfoLine>

              <InfoLine label="Status">
                {selectedEvent.status}
              </InfoLine>

              <InfoLine label="Currency">
                {eventCurrency}
              </InfoLine>

              <InfoLine label="Admission Type">
                {selectedEvent.admissionType}
              </InfoLine>

              <InfoLine label="Booking Enabled">
                {selectedEvent.bookingEnabled
                  ? "Yes"
                  : "No"}
              </InfoLine>
            </section>

            <section className="vrp-panel">
              <div className="vrp-panel-title">
                <div>
                  <h3>
                    <Building2 size={19} />
                    Organizer Details
                  </h3>

                  <p>
                    Assigned event partner
                  </p>
                </div>
              </div>

              <InfoLine label="Organizer ID">
                {organizer?.id || "Unavailable"}
              </InfoLine>

              <InfoLine label="Organization">
                {selectedOrganizerLabel}
              </InfoLine>

              <InfoLine label="Contact Person">
                {organizer?.contactName || "Not provided"}
              </InfoLine>

              <InfoLine label="Email">
                {organizer?.email || "Not provided"}
              </InfoLine>

              <InfoLine label="Phone">
                {organizer?.phone || "Not provided"}
              </InfoLine>

              <InfoLine label="Country">
                {organizer?.country || "Not provided"}
              </InfoLine>

              <InfoLine label="Commission Agreement">
                {commissionRateValid
                  ? `${commissionRate}%`
                  : "Unavailable"}
              </InfoLine>

              <InfoLine label="Settlement Currency">
                {organizer?.settlementCurrency ||
                  "Not specified"}
              </InfoLine>

              <InfoLine label="Settlement Schedule">
                {organizer?.settlementSchedule ||
                  "Not specified"}
              </InfoLine>

              <InfoLine label="Verification Status">
                {organizer?.verificationStatus ||
                  "Not specified"}
              </InfoLine>
            </section>
          </div>

          {/* ==================================================
              TICKET TIER BREAKDOWN
              ================================================== */}

          <section className="vrp-panel">
            <div className="vrp-panel-title">
              <div>
                <h3>
                  <Ticket size={19} />
                  Ticket Category Breakdown
                </h3>

                <p>
                  Admin ticket prices, capacities
                  and customer demo allocations.
                </p>
              </div>
            </div>

            <div className="vrp-table-scroll">
              <table className="vrp-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Ticket Price</th>
                    <th>Capacity</th>
                    <th>Demo Qty</th>
                    <th>Demo Value</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {tierReports.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        No ticket categories configured.
                      </td>
                    </tr>
                  ) : (
                    tierReports.map((tier) => (
                      <tr key={tier.id}>
                        <td>
                          <strong>
                            {tier.name}
                          </strong>
                        </td>

                        <td>
                          {formatMoney(
                            tier.price,
                            eventCurrency
                          )}
                        </td>

                        <td>
                          {tier.capacity.toLocaleString()}
                        </td>

                        <td>
                          {tierSalesKnown
                            ? (
                                tier.demoQuantity ?? 0
                              ).toLocaleString()
                            : "Unavailable"}
                        </td>

                        <td>
                          {tierSalesKnown
                            ? formatMoney(
                                tier.demoRevenue,
                                eventCurrency
                              )
                            : "Unavailable"}
                        </td>

                        <td>
                          <span
                            className={
                              tier.enabled
                                ? "vrp-tier-active"
                                : "vrp-tier-disabled"
                            }
                          >
                            {tier.enabled
                              ? "Active"
                              : "Disabled"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!tierSalesKnown && (
              <div className="vrp-notice">
                <Info size={18} />

                <p>
                  Some demo bookings do not contain
                  complete ticket-category allocations,
                  or their tier IDs no longer match
                  the current event configuration.
                  Category quantities and values are
                  therefore unavailable rather than
                  estimated incorrectly.
                </p>
              </div>
            )}
          </section>

          {/* ==================================================
              VENUE DETAILS
              ================================================== */}

          <div className="vrp-two-column">
            <section className="vrp-panel">
              <div className="vrp-panel-title">
                <div>
                  <h3>
                    <MapPin size={19} />
                    Venue Information
                  </h3>

                  <p>
                    Location and entry configuration
                  </p>
                </div>
              </div>

              <InfoLine label="Venue">
                {selectedEvent.venue}
              </InfoLine>

              <InfoLine label="City">
                {selectedEvent.city}
              </InfoLine>

              <InfoLine label="Country">
                {selectedEvent.country}
              </InfoLine>

              <InfoLine label="Admission Type">
                {selectedEvent.admissionType}
              </InfoLine>

              <InfoLine label="Stage Position">
                {selectedEvent.stagePosition ||
                  "Not specified"}
              </InfoLine>

              <InfoLine label="Venue Notes">
                {selectedEvent.venueNotes ||
                  "Not provided"}
              </InfoLine>

              <InfoLine label="Sales Opening">
                {formatDateTime(
                  selectedEvent.salesStart
                )}
              </InfoLine>

              <InfoLine label="Sales Closing">
                {formatDateTime(
                  selectedEvent.salesEnd
                )}
              </InfoLine>
            </section>

            <section className="vrp-panel">
              <div className="vrp-panel-title">
                <div>
                  <h3>
                    <MapIcon size={19} />
                    Venue / Stadium Layout
                  </h3>

                  <p>
                    Uploaded organizer layout
                  </p>
                </div>
              </div>

              {selectedEvent.venueLayoutImage ? (
                <img
                  className="vrp-layout-image"
                  src={selectedEvent.venueLayoutImage}
                  alt={`Venue layout for ${selectedEvent.title}`}
                />
              ) : (
                <div className="vrp-layout-empty">
                  <MapIcon size={34} />

                  <p>
                    No venue layout has been uploaded
                    for this event.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* ==================================================
              FINANCIAL STATEMENT
              ================================================== */}

          <section className="vrp-panel">
            <div className="vrp-panel-title">
              <div>
                <h3>
                  <Wallet size={19} />
                  Event Financial Analysis
                </h3>

                <p>
                  Demo estimates separated from
                  verified financial information.
                </p>
              </div>
            </div>

            <div className="vrp-statement">
              <InfoLine label="Demo Ticket Subtotal">
                {hasConsistentCurrency
                  ? formatMoney(
                      demoReport.demoTicketSubtotal,
                      eventCurrency
                    )
                  : "Unavailable"}
              </InfoLine>

              <InfoLine label="Demo Service Fees">
                {hasConsistentCurrency
                  ? formatMoney(
                      demoReport.demoServiceFees,
                      eventCurrency
                    )
                  : "Unavailable"}
              </InfoLine>

              <InfoLine label="Demo Order Total">
                {hasConsistentCurrency
                  ? formatMoney(
                      demoReport.demoOrderTotal,
                      eventCurrency
                    )
                  : "Unavailable"}
              </InfoLine>

              <InfoLine label="Organizer Commission Rate">
                {commissionRateValid
                  ? `${commissionRate}%`
                  : "Unavailable"}
              </InfoLine>

              <InfoLine label="Illustrative VizhaTickets Commission">
                {formatMoney(
                  illustrativeCommission,
                  eventCurrency
                )}
              </InfoLine>

              <InfoLine label="Illustrative Organizer Gross Share">
                {formatMoney(
                  illustrativeOrganizerShare,
                  eventCurrency
                )}
              </InfoLine>

              <InfoLine label="Verified Gross Ticket Sales">
                Unavailable
              </InfoLine>

              <InfoLine label="Actual VizhaTickets Commission">
                Unavailable
              </InfoLine>

              <InfoLine label="Gateway Processing Fees">
                Unavailable
              </InfoLine>

              <InfoLine label="Refunds / Adjustments">
                Unavailable
              </InfoLine>

              <InfoLine label="Taxes / Deductions">
                Unavailable
              </InfoLine>

              <InfoLine label="Verified Amount Already Paid">
                Unavailable
              </InfoLine>

              <InfoLine label="Actual Organizer Net Payable">
                Unavailable
              </InfoLine>

              <InfoLine label="Outstanding Settlement">
                Unavailable
              </InfoLine>
            </div>

            <div className="vrp-notice">
              <ShieldCheck size={19} />

              <p>
                The commission and organizer share
                above are illustrative calculations
                using fictional checkout totals.
                Actual settlements require verified
                payments, refund records, tax rules,
                gateway charges and payout history.
                Do not use these figures to transfer
                money to organizers.
              </p>
            </div>
          </section>

          {/* ==================================================
              POLICIES
              ================================================== */}

          <div className="vrp-two-column">
            <section className="vrp-panel">
              <div className="vrp-panel-title">
                <div>
                  <h3>
                    <FileSpreadsheet size={19} />
                    Refund Policy
                  </h3>
                </div>
              </div>

              <p className="vrp-long-text">
                {selectedEvent.refundPolicy ||
                  "Not provided"}
              </p>
            </section>

            <section className="vrp-panel">
              <div className="vrp-panel-title">
                <div>
                  <h3>
                    <BadgeCheck size={19} />
                    Terms & Conditions
                  </h3>
                </div>
              </div>

              <p className="vrp-long-text">
                {selectedEvent.terms ||
                  "Not provided"}
              </p>
            </section>
          </div>

          {/* ==================================================
              FINAL NOTICE
              ================================================== */}

          <div className="vrp-final-note">
            <CircleAlert size={18} />

            <p>
              This report is a frontend development
              preview. The customer booking records
              come from browser-local storage and
              do not prove payment, cash collection,
              actual ticket admission, commissions
              earned or organizer settlement
              obligations. Production reporting will
              require verified backend transactions
              and accounting records.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ==========================================================
   END — VIZHATICKETS REPORTS PAGE
   ========================================================== */
