
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Download,
  Eye,
  Globe2,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  logoutAdminPreview,
} from "../lib/adminPreviewSession";

import EventForm, {
  type AdvancedEvent,
  type EventTicketTier,
} from "./components/EventForm";

import OrganizerForm, {
  type AdvancedOrganizer,
} from "./components/OrganizerForm";

import "./admin.css";
import ReportsPage from "./components/ReportsPage";

/* ==========================================================
   VIZHATICKETS — ADMIN APP

   Frontend preview only.

   Features:
   - Dashboard overview
   - Advanced event form
   - Multi-tier ticket pricing
   - Event banner and venue layout
   - Advanced organizer form
   - Organizer profile and verification status
   - Organizer commission and settlement settings
   - Contact / organizer requests
   - Paid bookings demonstration
   - Customer overview
   - Currency-separated financial overview
   - Reports
   - Admin preview logout

   Storage:
   - Browser localStorage only
   - No live backend
   - No payment gateway verification

   Production authentication and authorization must
   be enforced by a backend.
   ========================================================== */

/* ==========================================================
   TYPES
   ========================================================== */

type Section =
  | "dashboard"
  | "events"
  | "bookings"
  | "organizers"
  | "requests"
  | "customers"
  | "finance"
  | "reports"
  | "settings";

type RequestType = "Contact" | "Organizer";

type RequestStatus =
  | "New"
  | "In Review"
  | "Approved"
  | "Rejected"
  | "Resolved";

type BookingStatus =
  | "Confirmed"
  | "Checked In"
  | "Cancelled"
  | "Refunded";

interface AdminRequest {
  id: string;
  type: RequestType;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  country: string;
  status: RequestStatus;
  createdAt: string;
}

interface AdminBooking {
  id: string;
  customer: string;
  email: string;
  eventId: string;
  event: string;
  tickets: number;
  total: number;
  currency: string;
  status: BookingStatus;
  paymentVerified: boolean;
  bookedAt: string;
}

/* ==========================================================
   STORAGE KEYS

   Keep these unchanged to preserve existing data.
   ========================================================== */

const EVENTS_KEY = "vizha_admin_events_v1";

const ORGANIZERS_KEY = "vizha_admin_organizers_v1";

const REQUESTS_KEY = "vizha_admin_requests_v1";

const DATA_EVENT = "vizha-admin-data-changed";

/* ==========================================================
   ADMIN NAVIGATION
   ========================================================== */

const menu: Array<{
  id: Section;
  label: string;
  icon: LucideIcon;
}> = [
  {
    id: "dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarDays,
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: Ticket,
  },
  {
    id: "organizers",
    label: "Organizers",
    icon: Users,
  },
  {
    id: "requests",
    label: "Requests",
    icon: Inbox,
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

/* ==========================================================
   DEFAULT ORGANIZERS

   Existing sample data remains available.

   These are normalized into AdvancedOrganizer records.
   ========================================================== */

const initialOrganizers: AdvancedOrganizer[] = [
  {
    id: "ORG-001",
    name: "Demo Events Sri Lanka",
    contactName: "Demo Organizer A",
    email: "organizer-a@example.com",
    phone: "+94770000000",
    country: "Sri Lanka",
    commission: 5,
    createdAt: "2026-10-01T10:00:00.000Z",

    organizerType: "Company",
    displayName: "Demo Events Sri Lanka",
    logo: "",
    registrationNumber: "",
    website: "",
    description: "",

    contactPosition: "",
    whatsapp: "",
    financeContactName: "",
    financeContactEmail: "",

    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",

    settlementCurrency: "LKR",
    settlementSchedule: "After Event",
    customSettlementTerms: "",
    agreementDate: "",

    verificationStatus: "Not Started",
    status: "Active",
    adminNotes: "",
  },
  {
    id: "ORG-002",
    name: "Demo Events UK",
    contactName: "Demo Organizer B",
    email: "organizer-b@example.com",
    phone: "+447000000000",
    country: "United Kingdom",
    commission: 5,
    createdAt: "2026-11-01T10:00:00.000Z",

    organizerType: "Company",
    displayName: "Demo Events UK",
    logo: "",
    registrationNumber: "",
    website: "",
    description: "",

    contactPosition: "",
    whatsapp: "",
    financeContactName: "",
    financeContactEmail: "",

    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",

    settlementCurrency: "GBP",
    settlementSchedule: "After Event",
    customSettlementTerms: "",
    agreementDate: "",

    verificationStatus: "Not Started",
    status: "Active",
    adminNotes: "",
  },
];

/* ==========================================================
   EVENT DEMO DATA
   ========================================================== */

function createTier(
  id: string,
  name: string,
  price: number,
  capacity: number
): EventTicketTier {
  return {
    id,
    name,
    price,
    capacity,
    maxPerBooking: Math.min(10, capacity),
    description: "",
    enabled: true,
  };
}

function createSampleEvent(
  data: {
    id: string;
    title: string;
    category: string;
    description: string;
    country: string;
    city: string;
    venue: string;
    date: string;
    time: string;
    price: number;
    capacity: number;
    currency: string;
    organizerId: string;
    status: "Draft" | "Published";
    createdAt: string;
  }
): AdvancedEvent {
  return {
    ...data,

    endDate: "",
    endTime: "",

    ticketTiers: [
      createTier(
        `${data.id}-GENERAL`,
        "General Admission",
        data.price,
        data.capacity
      ),
    ],

    admissionType: "general",
    stagePosition: "",
    venueNotes: "",

    imageUrl: "",
    venueLayoutImage: "",

    salesStart: "",
    salesEnd: "",
    refundPolicy: "",
    terms: "",
    bookingEnabled: true,
  };
}

const initialEvents: AdvancedEvent[] = [
  createSampleEvent({
    id: "EVT-001",
    title: "Yuvan Live in Concert",
    category: "Concerts",
    description: "Live music event.",
    country: "Sri Lanka",
    city: "Jaffna",
    venue: "Jaffna Cultural Centre",
    date: "2026-10-25",
    time: "19:00",
    price: 2500,
    capacity: 1200,
    currency: "LKR",
    organizerId: "ORG-001",
    status: "Published",
    createdAt: "2026-10-01T10:00:00.000Z",
  }),
  createSampleEvent({
    id: "EVT-002",
    title: "Bharathanatyam Arangetram",
    category: "Cultural",
    description: "Classical dance performance.",
    country: "Sri Lanka",
    city: "Colombo",
    venue: "Colombo Music Hall",
    date: "2026-10-28",
    time: "18:30",
    price: 1000,
    capacity: 350,
    currency: "LKR",
    organizerId: "ORG-001",
    status: "Published",
    createdAt: "2026-10-02T10:00:00.000Z",
  }),
  createSampleEvent({
    id: "EVT-003",
    title: "Tamil Stand-up Comedy Night",
    category: "Comedy",
    description: "An evening of stand-up comedy.",
    country: "Sri Lanka",
    city: "Batticaloa",
    venue: "Batticaloa Town Hall",
    date: "2026-11-05",
    time: "19:30",
    price: 1500,
    capacity: 300,
    currency: "LKR",
    organizerId: "ORG-001",
    status: "Draft",
    createdAt: "2026-10-03T10:00:00.000Z",
  }),
  createSampleEvent({
    id: "EVT-004",
    title: "International Music Festival",
    category: "Concerts",
    description: "International festival concept.",
    country: "United Kingdom",
    city: "London",
    venue: "Venue to be confirmed",
    date: "",
    time: "",
    price: 25,
    capacity: 2000,
    currency: "GBP",
    organizerId: "ORG-002",
    status: "Draft",
    createdAt: "2026-11-01T10:00:00.000Z",
  }),
];

/* ==========================================================
   DEMO REQUESTS
   ========================================================== */

const initialRequests: AdminRequest[] = [
  {
    id: "REQ-001",
    type: "Organizer",
    name: "Demo Organizer C",
    email: "request@example.com",
    phone: "+41790000000",
    subject: "Cultural Celebration",
    message:
      "We would like to discuss publishing a cultural event on VizhaTickets.",
    country: "Switzerland",
    status: "New",
    createdAt: "2026-11-12T09:00:00.000Z",
  },
  {
    id: "REQ-002",
    type: "Contact",
    name: "Demo Visitor",
    email: "visitor@example.com",
    phone: "+94770000001",
    subject: "Ticket booking enquiry",
    message:
      "I would like to know more about booking tickets for an upcoming event.",
    country: "Sri Lanka",
    status: "New",
    createdAt: "2026-11-13T11:00:00.000Z",
  },
];

/* ==========================================================
   DEMO PAID BOOKINGS

   IMPORTANT:
   - No Pending booking status
   - No unpaid booking is included
   - Real payment verification requires backend
   ========================================================== */

const demoBookings: AdminBooking[] = [
  {
    id: "VZH-10482",
    customer: "Demo Customer A",
    email: "customer-a@example.com",
    eventId: "EVT-001",
    event: "Yuvan Live in Concert",
    tickets: 2,
    total: 5000,
    currency: "LKR",
    status: "Confirmed",
    paymentVerified: true,
    bookedAt: "2026-10-20T09:30:00.000Z",
  },
  {
    id: "VZH-10483",
    customer: "Demo Customer B",
    email: "customer-b@example.com",
    eventId: "EVT-002",
    event: "Bharathanatyam Arangetram",
    tickets: 3,
    total: 3000,
    currency: "LKR",
    status: "Confirmed",
    paymentVerified: true,
    bookedAt: "2026-10-22T14:00:00.000Z",
  },
];

const sampleSales = [
  { day: "Mon", value: 90 },
  { day: "Tue", value: 155 },
  { day: "Wed", value: 115 },
  { day: "Thu", value: 235 },
  { day: "Fri", value: 220 },
  { day: "Sat", value: 300 },
  { day: "Sun", value: 210 },
];

/* ==========================================================
   STORAGE HELPERS
   ========================================================== */

function readStoredArray<T>(
  key: string,
  fallback: T[]
): T[] {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return fallback;
    }

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed)
      ? (parsed as T[])
      : fallback;
  } catch {
    return fallback;
  }
}

function persistArray<T>(
  key: string,
  values: T[]
): boolean {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(values)
    );

    window.dispatchEvent(
      new Event(DATA_EVENT)
    );

    return true;
  } catch {
    return false;
  }
}

/* ==========================================================
   EVENT NORMALIZATION
   ========================================================== */

function normalizeEvent(
  event: AdvancedEvent
): AdvancedEvent {
  const price = Number.isFinite(Number(event.price))
    ? Number(event.price)
    : 0;

  const capacity = Number.isFinite(Number(event.capacity))
    ? Math.max(1, Number(event.capacity))
    : 100;

  const tiers =
    Array.isArray(event.ticketTiers) &&
    event.ticketTiers.length > 0
      ? event.ticketTiers
      : [
          createTier(
            `${event.id}-GENERAL`,
            "General Admission",
            price,
            capacity
          ),
        ];

  return {
    ...event,
    price,
    capacity,
    ticketTiers: tiers,
    endDate: event.endDate ?? "",
    endTime: event.endTime ?? "",
    admissionType: event.admissionType ?? "general",
    stagePosition: event.stagePosition ?? "",
    venueNotes: event.venueNotes ?? "",
    imageUrl: event.imageUrl ?? "",
    venueLayoutImage: event.venueLayoutImage ?? "",
    salesStart: event.salesStart ?? "",
    salesEnd: event.salesEnd ?? "",
    refundPolicy: event.refundPolicy ?? "",
    terms: event.terms ?? "",
    bookingEnabled: event.bookingEnabled ?? true,
  };
}

function readEvents(): AdvancedEvent[] {
  return readStoredArray<AdvancedEvent>(
    EVENTS_KEY,
    initialEvents
  ).map(normalizeEvent);
}

/* ==========================================================
   ORGANIZER NORMALIZATION

   Preserves previously saved six-field organizers.

   Missing advanced fields receive safe defaults.

   Existing IDs are retained, so event assignments
   continue pointing to the same organizers.
   ========================================================== */

function normalizeOrganizer(
  organizer: AdvancedOrganizer
): AdvancedOrganizer {
  return {
    ...organizer,

    name: organizer.name ?? "",
    contactName: organizer.contactName ?? "",
    email: organizer.email ?? "",
    phone: organizer.phone ?? "",
    country: organizer.country ?? "",
    commission:
      Number.isFinite(Number(organizer.commission))
        ? Number(organizer.commission)
        : 5,

    organizerType:
      organizer.organizerType ?? "Company",

    displayName:
      organizer.displayName || organizer.name || "",

    logo: organizer.logo ?? "",
    registrationNumber:
      organizer.registrationNumber ?? "",
    website: organizer.website ?? "",
    description: organizer.description ?? "",

    contactPosition:
      organizer.contactPosition ?? "",
    whatsapp: organizer.whatsapp ?? "",
    financeContactName:
      organizer.financeContactName ?? "",
    financeContactEmail:
      organizer.financeContactEmail ?? "",

    addressLine1:
      organizer.addressLine1 ?? "",
    addressLine2:
      organizer.addressLine2 ?? "",
    city: organizer.city ?? "",
    region: organizer.region ?? "",
    postalCode: organizer.postalCode ?? "",

    settlementCurrency:
      organizer.settlementCurrency ??
      (organizer.country === "United Kingdom"
        ? "GBP"
        : "LKR"),

    settlementSchedule:
      organizer.settlementSchedule ?? "After Event",

    customSettlementTerms:
      organizer.customSettlementTerms ?? "",

    agreementDate:
      organizer.agreementDate ?? "",

    verificationStatus:
      organizer.verificationStatus ?? "Not Started",

    status: organizer.status ?? "Active",

    adminNotes: organizer.adminNotes ?? "",
    createdAt:
      organizer.createdAt ?? new Date().toISOString(),
  };
}

function readOrganizers(): AdvancedOrganizer[] {
  return readStoredArray<AdvancedOrganizer>(
    ORGANIZERS_KEY,
    initialOrganizers
  ).map(normalizeOrganizer);
}

/* ==========================================================
   DISPLAY HELPERS
   ========================================================== */

function money(
  amount: number,
  currency = "LKR"
): string {
  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(date: string): string {
  if (!date) return "Not scheduled";

  const parsed = new Date(
    date.includes("T")
      ? date
      : `${date}T12:00:00`
  );

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function downloadCSV(
  filename: string,
  rows: string[][]
): void {
  const csv = rows
    .map((row) =>
      row
        .map(
          (cell) =>
            `"${String(cell).replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob(
    ["\uFEFF", csv],
    {
      type: "text/csv;charset=utf-8",
    }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function getEnabledTiers(
  event: AdvancedEvent
): EventTicketTier[] {
  return event.ticketTiers.filter(
    (tier) => tier.enabled
  );
}

function getStartingPrice(
  event: AdvancedEvent
): number {
  const tiers = getEnabledTiers(event);

  if (!tiers.length) {
    return event.price;
  }

  return Math.min(
    ...tiers.map((tier) => tier.price)
  );
}

function getTotalCapacity(
  event: AdvancedEvent
): number {
  return getEnabledTiers(event).reduce(
    (total, tier) => total + tier.capacity,
    0
  );
}

function isReadyToPublish(
  event: AdvancedEvent,
  organizers: AdvancedOrganizer[]
): boolean {
  const tiers = getEnabledTiers(event);

  if (
    !event.title.trim() ||
    !event.description.trim() ||
    !event.country.trim() ||
    !event.city.trim() ||
    !event.venue.trim() ||
    !event.date ||
    !event.time ||
    !event.organizerId ||
    !organizers.some(
      (organizer) =>
        organizer.id === event.organizerId &&
        organizer.status === "Active"
    ) ||
    !event.refundPolicy.trim() ||
    !event.terms.trim() ||
    tiers.length === 0
  ) {
    return false;
  }

  const names = new Set<string>();

  for (const tier of event.ticketTiers) {
    const name = tier.name.trim().toLowerCase();

    if (!name || names.has(name)) {
      return false;
    }

    names.add(name);

    if (
      !Number.isFinite(tier.price) ||
      tier.price < 0 ||
      !Number.isInteger(tier.capacity) ||
      tier.capacity < 1 ||
      !Number.isInteger(tier.maxPerBooking) ||
      tier.maxPerBooking < 1 ||
      tier.maxPerBooking > tier.capacity
    ) {
      return false;
    }
  }

  return true;
}

/* ==========================================================
   REUSABLE COMPONENTS
   ========================================================== */

function Status({
  value,
}: {
  value: string;
}) {
  const className = value
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`va-status va-status--${className}`}
    >
      <span className="va-status-dot" />
      {value}
    </span>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="va-section-heading">
      <div>
        <p className="va-eyebrow">
          {eyebrow}
        </p>

        <h2>{title}</h2>

        <p className="va-muted">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="va-empty">
      <div className="va-empty-icon">
        <Icon size={25} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="va-custom-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ModalShell({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="va-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="va-modal-card"
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "min(760px, calc(100dvh - 40px))",
          overflow: "hidden",
        }}
      >
        <div className="va-modal-heading">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <button
            type="button"
            className="va-icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <div
          className="va-modal-body"
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            flex: 1,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </section>
    </div>
  );
}

/* ==========================================================
   MAIN ADMIN APPLICATION
   ========================================================== */

export default function AdminApp() {
  const navigate = useNavigate();

  const [section, setSection] =
    useState<Section>("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  const [eventFilter, setEventFilter] =
    useState("All");

  const [requestFilter, setRequestFilter] =
    useState("All");

  const [organizerFilter, setOrganizerFilter] =
    useState("All");

  const [dateRange, setDateRange] =
    useState("7");

  const [notice, setNotice] = useState("");

  /* ========================================================
     STORED DATA
     ======================================================== */

  const [events, setEvents] =
    useState<AdvancedEvent[]>(readEvents);

  const [organizers, setOrganizers] =
    useState<AdvancedOrganizer[]>(readOrganizers);

  const [requests, setRequests] =
    useState<AdminRequest[]>(() =>
      readStoredArray(
        REQUESTS_KEY,
        initialRequests
      )
    );

  /* ========================================================
     ADVANCED EVENT FORM STATE
     ======================================================== */

  const [eventModalOpen, setEventModalOpen] =
    useState(false);

  const [editingEvent, setEditingEvent] =
    useState<AdvancedEvent | null>(null);

  /* ========================================================
     ADVANCED ORGANIZER FORM STATE
     ======================================================== */

  const [organizerModalOpen, setOrganizerModalOpen] =
    useState(false);

  const [editingOrganizer, setEditingOrganizer] =
    useState<AdvancedOrganizer | null>(null);

  /* ========================================================
     REQUEST DETAILS STATE
     ======================================================== */

  const [selectedRequest, setSelectedRequest] =
    useState<AdminRequest | null>(null);

  const [requestDraftStatus, setRequestDraftStatus] =
    useState<RequestStatus>("New");

  /* ========================================================
     BROWSER STORAGE SYNCHRONIZATION
     ======================================================== */

  useEffect(() => {
    const refresh = () => {
      setEvents(readEvents());
      setOrganizers(readOrganizers());

      setRequests(
        readStoredArray(
          REQUESTS_KEY,
          initialRequests
        )
      );
    };

    window.addEventListener(
      DATA_EVENT,
      refresh
    );

    window.addEventListener(
      "storage",
      refresh
    );

    return () => {
      window.removeEventListener(
        DATA_EVENT,
        refresh
      );

      window.removeEventListener(
        "storage",
        refresh
      );
    };
  }, []);

  /* ========================================================
     DERIVED DATA
     ======================================================== */

  const activeSection = menu.find(
    (item) => item.id === section
  );

  const openRequests = requests.filter(
    (request) =>
      request.status === "New" ||
      request.status === "In Review"
  );

  /*
   * Paid bookings are demonstration records.
   * No pending payment booking is included.
   */

  const bookings = demoBookings.filter(
    (booking) => booking.paymentVerified
  );

  const activeBookings = bookings.filter(
    (booking) =>
      booking.status === "Confirmed" ||
      booking.status === "Checked In"
  );

  const ticketsSold = activeBookings.reduce(
    (total, booking) =>
      total + booking.tickets,
    0
  );

  const revenueByCurrency = useMemo(() => {
    const amounts: Record<string, number> = {};

    for (const booking of activeBookings) {
      amounts[booking.currency] =
        (amounts[booking.currency] ?? 0) +
        booking.total;
    }

    return amounts;
  }, []);

  const confirmedRevenueLKR =
    revenueByCurrency.LKR ?? 0;

  const publishedCount = events.filter(
    (event) => event.status === "Published"
  ).length;

  const activeOrganizerCount = organizers.filter(
    (organizer) => organizer.status === "Active"
  ).length;

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return events.filter((event) => {
      const searchable = [
        event.id,
        event.title,
        event.category,
        event.country,
        event.city,
        event.venue,
        ...event.ticketTiers.map(
          (tier) => tier.name
        ),
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(term) &&
        (
          eventFilter === "All" ||
          event.status === eventFilter
        )
      );
    });
  }, [events, search, eventFilter]);

  const filteredBookings = bookings.filter(
    (booking) =>
      [
        booking.id,
        booking.customer,
        booking.email,
        booking.event,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  );

  const filteredOrganizers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return organizers.filter((organizer) => {
      const searchable = [
        organizer.id,
        organizer.name,
        organizer.displayName,
        organizer.contactName,
        organizer.email,
        organizer.country,
        organizer.status,
        organizer.verificationStatus,
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(term) &&
        (
          organizerFilter === "All" ||
          organizer.status === organizerFilter
        )
      );
    });
  }, [organizers, search, organizerFilter]);

  const filteredRequests = requests
    .filter((request) => {
      const matchesSearch = [
        request.name,
        request.email,
        request.subject,
        request.message,
        request.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      return (
        matchesSearch &&
        (
          requestFilter === "All" ||
          request.type === requestFilter
        )
      );
    })
    .sort(
      (a, b) =>
        Date.parse(b.createdAt) -
        Date.parse(a.createdAt)
    );

  /* ========================================================
     ADMIN NAVIGATION
     ======================================================== */

  const changeSection = (next: Section) => {
    setSection(next);

    setSearch("");
    setEventFilter("All");
    setRequestFilter("All");
    setOrganizerFilter("All");

    setSidebarOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setNotice("");
  };

  const handleLogout = () => {
    logoutAdminPreview();

    navigate("/", {
      replace: true,
    });
  };

  /* ========================================================
     EVENT MANAGEMENT
     ======================================================== */

  const openNewEvent = () => {
    setEditingEvent(null);
    setNotice("");
    setEventModalOpen(true);
  };

  const openEditEvent = (
    event: AdvancedEvent
  ) => {
    setEditingEvent(
      normalizeEvent(event)
    );

    setNotice("");
    setEventModalOpen(true);
  };

  const closeEventForm = () => {
    setEventModalOpen(false);
    setEditingEvent(null);
  };

  const saveAdvancedEvent = (
    record: AdvancedEvent
  ): boolean => {
    const normalized = normalizeEvent(record);

    if (
      normalized.status === "Published" &&
      !isReadyToPublish(normalized, organizers)
    ) {
      setNotice(
        "Complete the event information, ticket categories, policies and active organizer before publishing."
      );
      return false;
    }

    const exists = events.some(
      (event) => event.id === normalized.id
    );

    const next = exists
      ? events.map((event) =>
          event.id === normalized.id
            ? normalized
            : event
        )
      : [normalized, ...events];

    if (!persistArray(EVENTS_KEY, next)) {
      setNotice(
        "Unable to save event. Browser storage may be full."
      );
      return false;
    }

    setEvents(next);

    setNotice(
      normalized.status === "Published"
        ? "Event published in the local preview."
        : "Event draft saved successfully."
    );

    return true;
  };

  const changeEventStatus = (
    event: AdvancedEvent
  ) => {
    if (event.status === "Published") {
      const next: AdvancedEvent[] = events.map(
        (item) =>
          item.id === event.id
            ? {
                ...item,
                status: "Draft",
              }
            : item
      );

      if (persistArray(EVENTS_KEY, next)) {
        setEvents(next);
        setNotice("Event unpublished.");
      }

      return;
    }

    if (!isReadyToPublish(event, organizers)) {
      setNotice(
        "Complete the event setup before publishing."
      );

      openEditEvent(event);
      return;
    }

    const next: AdvancedEvent[] = events.map(
      (item) =>
        item.id === event.id
          ? {
              ...item,
              status: "Published",
            }
          : item
    );

    if (persistArray(EVENTS_KEY, next)) {
      setEvents(next);
      setNotice("Event published.");
    }
  };

  const deleteEvent = (
    event: AdvancedEvent
  ) => {
    if (
      !window.confirm(
        `Delete "${event.title}" from this preview?`
      )
    ) {
      return;
    }

    const next = events.filter(
      (item) => item.id !== event.id
    );

    if (persistArray(EVENTS_KEY, next)) {
      setEvents(next);
      setNotice("Event deleted.");
    } else {
      setNotice("Unable to delete event.");
    }
  };

  /* ========================================================
     ADVANCED ORGANIZER MANAGEMENT
     ======================================================== */

  const openNewOrganizer = () => {
    setEditingOrganizer(null);
    setNotice("");
    setOrganizerModalOpen(true);
  };

  const openEditOrganizer = (
    organizer: AdvancedOrganizer
  ) => {
    setEditingOrganizer(
      normalizeOrganizer(organizer)
    );

    setNotice("");
    setOrganizerModalOpen(true);
  };

  const closeOrganizerForm = () => {
    setOrganizerModalOpen(false);
    setEditingOrganizer(null);
  };

  /*
   * OrganizerForm returns the complete profile.
   * We preserve all advanced fields instead of
   * rebuilding a six-field organizer object.
   */

  const saveAdvancedOrganizer = (
    record: AdvancedOrganizer
  ): boolean => {
    const normalized = normalizeOrganizer(record);

    if (!normalized.name.trim()) {
      setNotice(
        "Organizer name is required."
      );
      return false;
    }

    if (
      !Number.isFinite(normalized.commission) ||
      normalized.commission < 0 ||
      normalized.commission > 100
    ) {
      setNotice(
        "Commission must be between 0 and 100 percent."
      );
      return false;
    }

    /*
     * Existing published events should not remain
     * linked to a suspended or inactive organizer
     * without review.
     */

    const linkedPublishedEvents = events.filter(
      (event) =>
        event.organizerId === normalized.id &&
        event.status === "Published"
    );

    if (
      normalized.status !== "Active" &&
      linkedPublishedEvents.length > 0
    ) {
      setNotice(
        "This organizer has published events. Unpublish or reassign those events before changing the organizer to a non-active status."
      );
      return false;
    }

    const exists = organizers.some(
      (organizer) =>
        organizer.id === normalized.id
    );

    const next = exists
      ? organizers.map((organizer) =>
          organizer.id === normalized.id
            ? normalized
            : organizer
        )
      : [normalized, ...organizers];

    if (
      !persistArray(
        ORGANIZERS_KEY,
        next
      )
    ) {
      setNotice(
        "Unable to save organizer. Browser storage may be full."
      );
      return false;
    }

    setOrganizers(next);

    setNotice(
      normalized.status === "Draft"
        ? "Organizer draft saved successfully."
        : "Organizer profile saved successfully."
    );

    return true;
  };

  const deleteOrganizer = (
    organizer: AdvancedOrganizer
  ) => {
    const hasEvents = events.some(
      (event) =>
        event.organizerId === organizer.id
    );

    if (hasEvents) {
      setNotice(
        "This organizer is assigned to events. Reassign or remove those event assignments before deleting."
      );
      return;
    }

    if (
      !window.confirm(
        `Delete "${organizer.name}" from this preview?`
      )
    ) {
      return;
    }

    const next = organizers.filter(
      (item) => item.id !== organizer.id
    );

    if (
      persistArray(
        ORGANIZERS_KEY,
        next
      )
    ) {
      setOrganizers(next);
      setNotice("Organizer deleted.");
    } else {
      setNotice("Unable to delete organizer.");
    }
  };

  /* ========================================================
     REQUEST MANAGEMENT
     ======================================================== */

  const openRequestDetails = (request: AdminRequest) => {
    setSelectedRequest(request);
    setRequestDraftStatus(request.status);
    setNotice("");
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setRequestDraftStatus("New");
  };

  const saveRequestChanges = () => {
    if (!selectedRequest) return;

    if (requestDraftStatus === selectedRequest.status) {
      closeRequestDetails();
      return;
    }

    const next = requests.map((request) =>
      request.id === selectedRequest.id
        ? { ...request, status: requestDraftStatus }
        : request
    );

    if (!persistArray(REQUESTS_KEY, next)) {
      setNotice("Unable to save request status.");
      return;
    }

    setRequests(next);
    setNotice("Request status saved successfully.");
    closeRequestDetails();
  };

  /* ========================================================
     CSV EXPORTS
     ======================================================== */

  const exportEvents = () => {
    downloadCSV(
      "vizhatickets-admin-events.csv",
      [
        [
          "Event ID",
          "Title",
          "Category",
          "Country",
          "City",
          "Venue",
          "Date",
          "Currency",
          "Starting Price",
          "Capacity",
          "Ticket Tiers",
          "Status",
        ],
        ...events.map((event) => [
          event.id,
          event.title,
          event.category,
          event.country,
          event.city,
          event.venue,
          event.date,
          event.currency,
          String(getStartingPrice(event)),
          String(getTotalCapacity(event)),
          event.ticketTiers
            .map(
              (tier) =>
                `${tier.name}: ${tier.price} (${tier.capacity})`
            )
            .join(" | "),
          event.status,
        ]),
      ]
    );
  };

  const exportOrganizers = () => {
    downloadCSV(
      "vizhatickets-organizers.csv",
      [
        [
          "Organizer ID",
          "Name",
          "Display Name",
          "Type",
          "Contact Person",
          "Email",
          "Phone",
          "Country",
          "Commission",
          "Settlement Currency",
          "Settlement Schedule",
          "Verification",
          "Status",
        ],
        ...organizers.map((organizer) => [
          organizer.id,
          organizer.name,
          organizer.displayName,
          organizer.organizerType,
          organizer.contactName,
          organizer.email,
          organizer.phone,
          organizer.country,
          String(organizer.commission),
          organizer.settlementCurrency,
          organizer.settlementSchedule,
          organizer.verificationStatus,
          organizer.status,
        ]),
      ]
    );
  };

  const exportBookings = () => {
    downloadCSV(
      "vizhatickets-paid-demo-bookings.csv",
      [
        [
          "Booking Reference",
          "Customer",
          "Email",
          "Event",
          "Tickets",
          "Total",
          "Currency",
          "Status",
        ],
        ...bookings.map((booking) => [
          booking.id,
          booking.customer,
          booking.email,
          booking.event,
          String(booking.tickets),
          String(booking.total),
          booking.currency,
          booking.status,
        ]),
      ]
    );
  };

  const exportRequests = () => {
    downloadCSV(
      "vizhatickets-demo-requests.csv",
      [
        [
          "Request ID",
          "Type",
          "Name",
          "Email",
          "Phone",
          "Subject",
          "Country",
          "Message",
          "Status",
        ],
        ...requests.map((request) => [
          request.id,
          request.type,
          request.name,
          request.email,
          request.phone,
          request.subject,
          request.country,
          request.message,
          request.status,
        ]),
      ]
    );
  };

  /* ========================================================
     BOOKINGS TABLE
     ======================================================== */

  const bookingsTable = (
    records: AdminBooking[]
  ) => (
    <div className="va-table-scroll">
      <table className="va-table">
        <thead>
          <tr>
            <th>Booking Reference</th>
            <th>Customer</th>
            <th>Event</th>
            <th>Tickets</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {records.map((booking) => (
            <tr key={booking.id}>
              <td>
                <strong>
                  <Ticket
                    size={14}
                    className="va-inline-icon"
                  />
                  {booking.id}
                </strong>
              </td>

              <td>
                {booking.customer}
                <span className="va-table-secondary">
                  {booking.email}
                </span>
              </td>

              <td>{booking.event}</td>

              <td>{booking.tickets}</td>

              <td>
                {money(
                  booking.total,
                  booking.currency
                )}
              </td>

              <td>
                <Status value={booking.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {records.length === 0 && (
        <EmptyState
          icon={Ticket}
          title="No paid bookings"
          description="Only verified paid bookings will appear here after the backend is connected."
        />
      )}
    </div>
  );

  /* ========================================================
     DASHBOARD OVERVIEW
     ======================================================== */

  const renderDashboard = () => (
    <>
      <PageHeading
        eyebrow="Platform Overview"
        title="Dashboard"
        description="A snapshot of your ticketing platform."
        action={
          <div className="va-select-wrap">
            <CalendarDays
              size={16}
              className="va-select-leading"
            />

            <select
              value={dateRange}
              onChange={(event) =>
                setDateRange(event.target.value)
              }
              aria-label="Sales chart date range"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>

            <ChevronDown size={16} />
          </div>
        }
      />

      <div className="va-stats-grid">
        {[
          {
            label: "Demo Booking Revenue",
            value: money(confirmedRevenueLKR),
            detail: "Active demo bookings — LKR",
            icon: Wallet,
            section: "finance" as Section,
          },
          {
            label: "Tickets Sold",
            value: ticketsSold.toLocaleString(),
            detail: "Issued in paid demo bookings",
            icon: Ticket,
            section: "bookings" as Section,
          },
          {
            label: "Published Events",
            value: String(publishedCount),
            detail: "Published in local admin preview",
            icon: CalendarDays,
            section: "events" as Section,
          },
          {
            label: "Open Requests",
            value: String(openRequests.length),
            detail: "Contact and organizer enquiries",
            icon: ClipboardList,
            section: "requests" as Section,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <button
              type="button"
              key={stat.label}
              className="va-stat-card va-clickable-stat"
              onClick={() =>
                changeSection(stat.section)
              }
            >
              <div className="va-stat-top">
                <span className="va-stat-icon">
                  <Icon size={22} />
                </span>

                <TrendingUp size={18} />
              </div>

              <p className="va-stat-label">
                {stat.label}
              </p>

              <strong className="va-stat-value">
                {stat.value}
              </strong>

              <p className="va-stat-detail">
                {stat.detail}
              </p>
            </button>
          );
        })}
      </div>

      <div className="va-dashboard-grid">
        <div className="va-panel">
          <div className="va-panel-heading">
            <div>
              <h3>
                <BarChart3
                  size={21}
                  className="va-inline-icon"
                />
                Ticket Sales Activity
              </h3>

              <p>Illustrative chart data only</p>
            </div>

            <span className="va-small-tag">
              Last {dateRange} Days
            </span>
          </div>

          <div className="va-chart va-chart-premium">
            {sampleSales.map((item, index) => {
              const multiplier =
                dateRange === "7"
                  ? 1
                  : dateRange === "30"
                    ? 0.85
                    : 0.7;

              const height =
                (item.value / 300) * 100 * multiplier;

              return (
                <div
                  className="va-chart-column"
                  key={item.day}
                >
                  <div className="va-chart-track">
                    <div
                      className="va-chart-bar"
                      style={{
                        height: `${height}%`,
                        animationDelay: `${index * 70}ms`,
                      }}
                      title={`Illustrative value: ${item.value}`}
                    />
                  </div>

                  <span>{item.day}</span>
                </div>
              );
            })}
          </div>

          <p className="va-chart-disclaimer">
            Chart figures are placeholders, not actual payment records.
          </p>
        </div>

        <div className="va-panel">
          <div className="va-panel-heading">
            <div>
              <h3>
                <Activity
                  size={21}
                  className="va-inline-icon"
                />
                Quick Actions
              </h3>

              <p>Manage your daily operations</p>
            </div>
          </div>

          <div className="va-quick-actions">
            {[
              {
                title: "Manage Events",
                icon: CalendarDays,
                next: "events" as Section,
              },
              {
                title: "View Paid Bookings",
                icon: Ticket,
                next: "bookings" as Section,
              },
              {
                title: "All Requests",
                icon: Inbox,
                next: "requests" as Section,
              },
              {
                title: "Organizer Management",
                icon: Users,
                next: "organizers" as Section,
              },
              {
                title: "Financial Overview",
                icon: CircleDollarSign,
                next: "finance" as Section,
              },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <button
                  type="button"
                  key={action.title}
                  className="va-quick-action"
                  onClick={() =>
                    changeSection(action.next)
                  }
                >
                  <span>
                    <Icon size={19} />
                    {action.title}
                  </span>

                  <ArrowRight size={17} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="va-feature-grid">
        <button
          type="button"
          className="va-feature-card"
          onClick={() =>
            changeSection("requests")
          }
        >
          <ClipboardList size={28} />

          <div>
            <strong>
              Contact & Organizer Requests
            </strong>
            <p>
              Review all enquiries and submissions
            </p>
          </div>

          <span>{openRequests.length} Open</span>
          <ArrowRight size={19} />
        </button>

        <button
          type="button"
          className="va-feature-card"
          onClick={() =>
            changeSection("finance")
          }
        >
          <Wallet size={28} />

          <div>
            <strong>Financial Overview</strong>
            <p>Track demo sales and commissions</p>
          </div>

          <ArrowRight size={19} />
        </button>
      </div>

      <div className="va-panel">
        <div className="va-panel-heading">
          <div>
            <h3>
              <Ticket
                size={21}
                className="va-inline-icon"
              />
              Recent Paid Bookings
            </h3>

            <p>Confirmed demo transactions</p>
          </div>

          <button
            type="button"
            className="va-text-action"
            onClick={() =>
              changeSection("bookings")
            }
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        {bookingsTable(bookings.slice(0, 5))}
      </div>
    </>
  );

  /* ========================================================
     EVENT MANAGEMENT PAGE
     ======================================================== */

  const renderEvents = () => (
    <>
      <PageHeading
        eyebrow="Event Operations"
        title="Event Management"
        description="Create and manage events with custom ticket tiers, venue layouts and booking settings."
        action={
          <div className="va-heading-actions">
            <button
              type="button"
              className="va-secondary-btn"
              onClick={exportEvents}
            >
              <Download size={17} />
              Export
            </button>

            <button
              type="button"
              className="va-primary-btn"
              onClick={openNewEvent}
            >
              <Plus size={18} />
              Add Event
            </button>
          </div>
        }
      />

      <div className="va-panel">
        <div className="va-toolbar">
          <div className="va-search-field">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search events, cities or ticket tiers..."
              aria-label="Search events"
            />
          </div>

          <div className="va-select-wrap">
            <select
              value={eventFilter}
              onChange={(event) =>
                setEventFilter(event.target.value)
              }
              aria-label="Filter events"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>

            <ChevronDown size={16} />
          </div>
        </div>

        <div className="va-table-scroll">
          <table className="va-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Location</th>
                <th>Date</th>
                <th>Ticket Categories</th>
                <th>Starting Price</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.map((event) => {
                const tiers = getEnabledTiers(event);

                return (
                  <tr key={event.id}>
                    <td>
                      <strong>
                        {event.title || "Untitled Event"}
                      </strong>

                      <span className="va-table-secondary">
                        {event.category} · {event.id}
                      </span>
                    </td>

                    <td>
                      {event.city || "Not set"}
                      {event.country
                        ? `, ${event.country}`
                        : ""}

                      <span className="va-table-secondary">
                        {event.venue || "Venue not set"}
                      </span>
                    </td>

                    <td>
                      {formatDate(event.date)}

                      {event.time && (
                        <span className="va-table-secondary">
                          {event.time}
                        </span>
                      )}
                    </td>

                    <td>
                      <strong>
                        {tiers.length} Categories
                      </strong>

                      <span className="va-table-secondary">
                        {tiers
                          .map((tier) => tier.name)
                          .join(", ") || "None"}
                      </span>
                    </td>

                    <td>
                      {tiers.length
                        ? money(
                            getStartingPrice(event),
                            event.currency
                          )
                        : "Not set"}
                    </td>

                    <td>
                      {getTotalCapacity(event).toLocaleString()}
                    </td>

                    <td>
                      <Status value={event.status} />
                    </td>

                    <td>
                      <div className="va-inline-actions">
                        <button
                          type="button"
                          className="va-mini-btn"
                          onClick={() =>
                            openEditEvent(event)
                          }
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="va-mini-btn"
                          onClick={() =>
                            changeEventStatus(event)
                          }
                        >
                          {event.status === "Published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          className="va-mini-btn va-mini-btn--reject"
                          aria-label={`Delete ${event.title}`}
                          onClick={() =>
                            deleteEvent(event)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <EmptyState
              icon={CalendarDays}
              title="No matching events"
              description="Add an event or adjust your search filters."
            />
          )}
        </div>
      </div>

      <p className="va-info-note">
        Ticket tiers and uploaded venue layouts are saved
        in the browser-local event records.
        Public event listing integration is still required.
      </p>
    </>
  );

  /* ========================================================
     BOOKINGS PAGE
     ======================================================== */

  const renderBookings = () => (
    <>
      <PageHeading
        eyebrow="Ticket Operations"
        title="Paid Bookings"
        description="Only successfully paid ticket bookings belong here."
        action={
          <button
            type="button"
            className="va-secondary-btn"
            onClick={exportBookings}
          >
            <Download size={17} />
            Export CSV
          </button>
        }
      />

      <div className="va-booking-policy">
        <ShieldCheck size={22} />

        <div>
          <strong>Payment-required ticket policy</strong>
          <p>
            No successful payment means no confirmed
            booking, no issued ticket and no QR code.
            Payment verification requires a backend.
          </p>
        </div>
      </div>

      <div className="va-panel">
        <div className="va-toolbar">
          <div className="va-search-field">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search paid bookings..."
              aria-label="Search bookings"
            />
          </div>
        </div>

        {bookingsTable(filteredBookings)}
      </div>
    </>
  );

  /* ========================================================
     ADVANCED ORGANIZER MANAGEMENT PAGE
     ======================================================== */

  const renderOrganizers = () => (
    <>
      <PageHeading
        eyebrow="Organizer Directory"
        title="Organizer Management"
        description="Manage organizer profiles, contact details, commission agreements, verification and event assignments."
        action={
          <div className="va-heading-actions">
            <button
              type="button"
              className="va-secondary-btn"
              onClick={exportOrganizers}
            >
              <Download size={17} />
              Export
            </button>

            <button
              type="button"
              className="va-primary-btn"
              onClick={openNewOrganizer}
            >
              <Plus size={18} />
              Add Organizer
            </button>
          </div>
        }
      />

      <div className="va-request-summary">
        <div>
          <Building2 size={23} />
          <span>Total Organizers</span>
          <strong>{organizers.length}</strong>
        </div>

        <div>
          <CheckCircle2 size={23} />
          <span>Active Organizers</span>
          <strong>{activeOrganizerCount}</strong>
        </div>

        <div>
          <ShieldCheck size={23} />
          <span>Marked Verified</span>
          <strong>
            {organizers.filter(
              (organizer) =>
                organizer.verificationStatus === "Verified"
            ).length}
          </strong>
        </div>

        <div>
          <ClipboardList size={23} />
          <span>Draft Organizers</span>
          <strong>
            {organizers.filter(
              (organizer) =>
                organizer.status === "Draft"
            ).length}
          </strong>
        </div>
      </div>

      <div className="va-panel">
        <div className="va-toolbar">
          <div className="va-search-field">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search organizer, contact or country..."
              aria-label="Search organizers"
            />
          </div>

          <div className="va-select-wrap">
            <select
              value={organizerFilter}
              onChange={(event) =>
                setOrganizerFilter(event.target.value)
              }
              aria-label="Filter organizer status"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>

            <ChevronDown size={16} />
          </div>
        </div>

        <div className="va-table-scroll">
          <table className="va-table">
            <thead>
              <tr>
                <th>Organizer</th>
                <th>Contact</th>
                <th>Country</th>
                <th>Commission</th>
                <th>Verification</th>
                <th>Status</th>
                <th>Events</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrganizers.map((organizer) => {
                const assignedEvents = events.filter(
                  (event) =>
                    event.organizerId === organizer.id
                );

                return (
                  <tr key={organizer.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 11,
                          minWidth: 170,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            width: 43,
                            height: 43,
                            overflow: "hidden",
                            borderRadius: 11,
                            background: "#fff0d8",
                            color: "#be750b",
                          }}
                        >
                          {organizer.logo ? (
                            <img
                              src={organizer.logo}
                              alt={`${organizer.name} logo`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <Building2 size={20} />
                          )}
                        </div>

                        <div>
                          <strong>
                            {organizer.displayName ||
                              organizer.name}
                          </strong>

                          <span className="va-table-secondary">
                            {organizer.organizerType}
                            {" · "}
                            {organizer.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {organizer.contactName ||
                        "Not provided"}

                      <span className="va-table-secondary">
                        {organizer.email ||
                          "No email"}
                      </span>
                    </td>

                    <td>
                      {organizer.country ||
                        "Not provided"}
                    </td>

                    <td>
                      <strong>
                        {organizer.commission}%
                      </strong>

                      <span className="va-table-secondary">
                        {organizer.settlementCurrency}
                        {" · "}
                        {organizer.settlementSchedule}
                      </span>
                    </td>

                    <td>
                      <Status
                        value={organizer.verificationStatus}
                      />
                    </td>

                    <td>
                      <Status value={organizer.status} />
                    </td>

                    <td>
                      <strong>
                        {assignedEvents.length}
                      </strong>
                    </td>

                    <td>
                      <div className="va-inline-actions">
                        <button
                          type="button"
                          className="va-mini-btn"
                          onClick={() =>
                            openEditOrganizer(organizer)
                          }
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="va-mini-btn va-mini-btn--reject"
                          aria-label={`Delete ${organizer.name}`}
                          onClick={() =>
                            deleteOrganizer(organizer)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrganizers.length === 0 && (
            <EmptyState
              icon={Building2}
              title="No organizers found"
              description="Add a new organizer or change the search filters."
            />
          )}
        </div>
      </div>

      <p className="va-info-note">
        Organizer verification and settlement
        settings are frontend demo records.
        No identity verification or real settlement
        is performed by this dashboard.
      </p>
    </>
  );

  /* ========================================================
     REQUESTS PAGE
     ======================================================== */

  const renderRequests = () => (
    <>
      <PageHeading
        eyebrow="Central Enquiry Inbox"
        title="All Requests"
        description="Review contact enquiries and organizer event submissions."
        action={
          <button
            type="button"
            className="va-secondary-btn"
            onClick={exportRequests}
          >
            <Download size={17} />
            Export Requests
          </button>
        }
      />

      <div className="va-request-summary">
        <div>
          <Inbox size={23} />
          <span>Total Requests</span>
          <strong>{requests.length}</strong>
        </div>

        <div>
          <Bell size={23} />
          <span>Open Requests</span>
          <strong>{openRequests.length}</strong>
        </div>

        <div>
          <Mail size={23} />
          <span>Contact Enquiries</span>
          <strong>
            {requests.filter(
              (request) => request.type === "Contact"
            ).length}
          </strong>
        </div>

        <div>
          <CalendarDays size={23} />
          <span>Organizer Requests</span>
          <strong>
            {requests.filter(
              (request) => request.type === "Organizer"
            ).length}
          </strong>
        </div>
      </div>

      <div className="va-panel">
        <div className="va-toolbar">
          <div className="va-search-field">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search requests..."
              aria-label="Search requests"
            />
          </div>

          <div className="va-select-wrap">
            <select
              value={requestFilter}
              onChange={(event) =>
                setRequestFilter(event.target.value)
              }
              aria-label="Filter requests"
            >
              <option value="All">All Requests</option>
              <option value="Contact">Contact</option>
              <option value="Organizer">Organizer</option>
            </select>

            <ChevronDown size={16} />
          </div>
        </div>

        <div className="va-table-scroll">
          <table className="va-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Submitted By</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <strong>{request.subject}</strong>

                    <span className="va-table-secondary">
                      {request.id}
                    </span>
                  </td>

                  <td>
                    {request.name}

                    <span className="va-table-secondary">
                      {request.email}
                    </span>
                  </td>

                  <td>
                    <Status value={request.type} />
                  </td>

                  <td>
                    {formatDateTime(request.createdAt)}
                  </td>

                  <td>
                    <Status value={request.status} />
                  </td>

                  <td>
                    <button
                      type="button"
                      className="va-mini-btn"
                      onClick={() => openRequestDetails(request)}
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRequests.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="No matching requests"
              description="Submitted local enquiries will appear here."
            />
          )}
        </div>
      </div>
    </>
  );

  /* ========================================================
     CUSTOMERS PAGE
     ======================================================== */

  const renderCustomers = () => {
    const customers = Array.from(
      new Map(
        bookings.map((booking) => [
          booking.email,
          {
            name: booking.customer,
            email: booking.email,
          },
        ])
      ).values()
    );

    return (
      <>
        <PageHeading
          eyebrow="Customer Management"
          title="Customers"
          description="Sample customer records from paid demo bookings."
        />

        <div className="va-panel">
          <div className="va-table-scroll">
            <table className="va-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Paid Bookings</th>
                  <th>Tickets</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => {
                  const customerBookings =
                    bookings.filter(
                      (booking) =>
                        booking.email === customer.email
                    );

                  return (
                    <tr key={customer.email}>
                      <td>
                        <strong>{customer.name}</strong>
                      </td>

                      <td>{customer.email}</td>

                      <td>
                        {customerBookings.length}
                      </td>

                      <td>
                        {customerBookings.reduce(
                          (total, booking) =>
                            total + booking.tickets,
                          0
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  /* ========================================================
     FINANCE PAGE
     ======================================================== */

  const renderFinance = () => (
    <>
      <PageHeading
        eyebrow="Financial Management"
        title="Finance"
        description="Currency-separated demo payment and settlement overview."
      />

      <div className="va-booking-policy">
        <CreditCard size={22} />

        <div>
          <strong>Payment verification is mandatory</strong>

          <p>
            All values are illustrative. Real payment
            confirmations, refunds and organizer settlements
            must be calculated and verified by the backend.
          </p>
        </div>
      </div>

      <div className="va-finance-grid">
        {Object.entries(revenueByCurrency).map(
          ([currency, value]) => (
            <div
              className="va-panel"
              key={currency}
            >
              <div className="va-panel-heading">
                <div>
                  <h3>Gross Ticket Sales</h3>
                  <p>{currency} summary</p>
                </div>

                <Wallet size={23} />
              </div>

              <strong className="va-finance-value">
                {money(value, currency)}
              </strong>
            </div>
          )
        )}
      </div>

      <div className="va-panel">
        <div className="va-panel-heading">
          <div>
            <h3>Organizer Settlement Preview</h3>
            <p>
              Commercial terms and assigned events
            </p>
          </div>
        </div>

        <div className="va-table-scroll">
          <table className="va-table">
            <thead>
              <tr>
                <th>Organizer</th>
                <th>Commission</th>
                <th>Currency</th>
                <th>Schedule</th>
                <th>Events</th>
                <th>Settlement</th>
              </tr>
            </thead>

            <tbody>
              {organizers.map((organizer) => (
                <tr key={organizer.id}>
                  <td>
                    <strong>{organizer.name}</strong>

                    <span className="va-table-secondary">
                      {organizer.id}
                    </span>
                  </td>

                  <td>{organizer.commission}%</td>

                  <td>
                    {organizer.settlementCurrency}
                  </td>

                  <td>
                    {organizer.settlementSchedule}
                  </td>

                  <td>
                    {events.filter(
                      (event) =>
                        event.organizerId === organizer.id
                    ).length}
                  </td>

                  <td>
                    <span className="va-table-secondary">
                      Backend required
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  /* ========================================================
     REPORTS PAGE
     ======================================================== */

  const renderReports = () => (
    <>
      <PageHeading
        eyebrow="Business Intelligence"
        title="Reports & Analytics"
        description="Overview of event, booking and organizer activity."
      />

      <div className="va-request-summary">
        {[
          {
            icon: CalendarDays,
            label: "All Events",
            value: events.length,
          },
          {
            icon: CheckCircle2,
            label: "Published",
            value: publishedCount,
          },
          {
            icon: Ticket,
            label: "Paid Tickets",
            value: ticketsSold,
          },
          {
            icon: Building2,
            label: "Active Organizers",
            value: activeOrganizerCount,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label}>
              <Icon size={23} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          );
        })}
      </div>

      <div className="va-panel">
        <div className="va-panel-heading">
          <div>
            <h3>Events by Country</h3>
            <p>Local event catalogue</p>
          </div>
        </div>

        {Array.from(
          new Set(
            events.map((event) => event.country)
          )
        ).map((country) => (
          <div
            className="va-report-row"
            key={country}
          >
            <span>
              <Globe2 size={17} />
              {country}
            </span>

            <strong>
              {events.filter(
                (event) =>
                  event.country === country
              ).length} events
            </strong>
          </div>
        ))}
      </div>
    </>
  );

  /* ========================================================
     SETTINGS PAGE
     ======================================================== */

  const renderSettings = () => (
    <>
      <PageHeading
        eyebrow="Platform Configuration"
        title="Settings"
        description="Administrator account and platform settings preview."
      />

      <div className="va-panel">
        <div className="va-settings-item">
          <ShieldCheck size={26} />

          <div>
            <strong>Administrator Authentication</strong>

            <p>
              This dashboard uses a development-only
              administrator preview session. Production
              security requires backend authentication,
              role verification and protected APIs.
            </p>
          </div>

          <Status value="Draft" />
        </div>

        <div className="va-settings-item">
          <Globe2 size={26} />

          <div>
            <strong>International Ticketing</strong>

            <p>
              Events support different countries,
              cities and currencies. Financial totals
              remain separated by currency.
            </p>
          </div>
        </div>

        <div className="va-settings-item">
          <Building2 size={26} />

          <div>
            <strong>Organizer Management</strong>

            <p>
              Organizer profiles have independent
              approval, verification, commission
              and settlement settings.
            </p>
          </div>

          <Check size={20} />
        </div>

        <div className="va-settings-item">
          <Ticket size={26} />

          <div>
            <strong>Ticket Issuance Rules</strong>

            <p>
              Bookings and QR tickets are issued
              only after verified successful payment.
              One QR code belongs to each booking.
            </p>
          </div>

          <Check size={20} />
        </div>
      </div>
    </>
  );

  /* ========================================================
     ADMIN PAGE SWITCHER
     ======================================================== */

  const renderContent = () => {
    switch (section) {
      case "dashboard":
        return renderDashboard();

      case "events":
        return renderEvents();

      case "bookings":
        return renderBookings();

      case "organizers":
        return renderOrganizers();

      case "requests":
        return renderRequests();

      case "customers":
        return renderCustomers();

      case "finance":
        return renderFinance();

      case "reports":
  return (
    <ReportsPage
      events={events}
      organizers={organizers}
      bookings={bookings}
    />
  );

      case "settings":
        return renderSettings();

      default:
        return renderDashboard();
    }
  };

  /* ========================================================
     MAIN APPLICATION RENDER
     ======================================================== */

  return (
    <div className="va-root va-premium">
      {/* MOBILE SIDEBAR OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          className="va-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`va-sidebar ${
          sidebarOpen
            ? "va-sidebar--open"
            : ""
        }`}
      >
        <div className="va-brand">
          <div className="va-brand-mark">
            <Ticket size={25} />
          </div>

          <div>
            <strong>VizhaTickets</strong>
            <span>ADMIN CONSOLE</span>
          </div>

          <button
            type="button"
            className="va-mobile-close"
            aria-label="Close sidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <p className="va-sidebar-heading">
          WORKSPACE
        </p>

        <nav
          className="va-navigation"
          aria-label="Admin navigation"
        >
          {menu.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;

            return (
              <button
                type="button"
                key={item.id}
                className={`va-nav-item ${
                  active
                    ? "va-nav-item--active"
                    : ""
                }`}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  changeSection(item.id)
                }
              >
                <Icon size={19} />

                <span>{item.label}</span>

                {item.id === "requests" &&
                  openRequests.length > 0 && (
                    <small>
                      {openRequests.length}
                    </small>
                  )}
              </button>
            );
          })}
        </nav>

        <div className="va-sidebar-bottom">
          <div className="va-sidebar-help">
            <ShieldCheck size={24} />

            <strong>Frontend Preview</strong>

            <p>
              Demo data only. Secure authentication
              and cross-device synchronization
              will be connected with the backend.
            </p>
          </div>

          <button
            type="button"
            className="va-return-link"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD */}

      <div className="va-main">
        <header className="va-topbar">
          <div className="va-topbar-left">
            <button
              type="button"
              className="va-menu-button"
              aria-label="Open navigation"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu size={22} />
            </button>

            <div className="va-breadcrumb">
              <span>Admin</span>
              <span>/</span>

              <strong>
                {activeSection?.label ??
                  "Overview"}
              </strong>
            </div>
          </div>

          <div className="va-topbar-right">
            <span className="va-demo-indicator">
              <span />
              Demo Mode
            </span>

            {/* NOTIFICATIONS */}

            <div className="va-notification-wrap">
              <button
                type="button"
                className="va-icon-button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen(
                    (value) => !value
                  );

                  setProfileOpen(false);
                }}
              >
                <Bell size={19} />

                {openRequests.length > 0 && (
                  <span className="va-notification-dot" />
                )}
              </button>

              {notificationsOpen && (
                <div className="va-notification-panel">
                  <strong>Notifications</strong>

                  <p>
                    {openRequests.length} request(s)
                    awaiting attention.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      changeSection("requests")
                    }
                  >
                    View Requests
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* ADMIN PROFILE */}

            <div className="va-notification-wrap">
              <button
                type="button"
                className="va-profile-button"
                aria-label="Admin profile menu"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen(
                    (value) => !value
                  );

                  setNotificationsOpen(false);
                }}
              >
                <div className="va-avatar">
                  VA
                </div>

                <div className="va-profile-copy">
                  <strong>Admin Preview</strong>
                  <span>Demo workspace</span>
                </div>

                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="va-profile-panel">
                  <button
                    type="button"
                    onClick={() =>
                      changeSection("settings")
                    }
                  >
                    <Settings size={17} />
                    Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="va-content">
          {notice && (
            <div
              className="va-notice"
              role="status"
            >
              <span>{notice}</span>

              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() =>
                  setNotice("")
                }
              >
                <X size={17} />
              </button>
            </div>
          )}

          {renderContent()}

          <footer className="va-footer">
            <span>
              © VizhaTickets — Admin Frontend Preview
            </span>

            <span>
              <Globe2 size={14} />
              International Event Management
            </span>
          </footer>
        </main>
      </div>

      {/* ADVANCED EVENT FORM */}

      {eventModalOpen && (
        <EventForm
          key={editingEvent?.id ?? "new-event"}
          initialEvent={editingEvent}
          organizers={organizers
            .filter(
              (organizer) =>
                organizer.status === "Active" ||
                organizer.id === editingEvent?.organizerId
            )
            .map((organizer) => ({
              id: organizer.id,
              name: organizer.name,
            }))}
          onSave={saveAdvancedEvent}
          onClose={closeEventForm}
        />
      )}

      {/* ADVANCED ORGANIZER FORM */}

      {organizerModalOpen && (
        <OrganizerForm
          key={editingOrganizer?.id ?? "new-organizer"}
          initialOrganizer={editingOrganizer}
          onSave={saveAdvancedOrganizer}
          onClose={closeOrganizerForm}
        />
      )}

      {/* REQUEST DETAILS MODAL */}

      {selectedRequest && (
        <ModalShell
          title="Request Details"
          subtitle={`${selectedRequest.id} · ${selectedRequest.type} Request`}
          onClose={closeRequestDetails}
        >
          <div
            className="va-request-details"
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              overflowY: "auto",
              paddingRight: 6,
            }}
          >
            <div>
              <strong>Submitted By</strong>
              <p>{selectedRequest.name}</p>
            </div>

            <div>
              <strong>Email Address</strong>
              <p>{selectedRequest.email || "Not provided"}</p>
            </div>

            <div>
              <strong>Phone Number</strong>
              <p>{selectedRequest.phone || "Not provided"}</p>
            </div>

            <div>
              <strong>Country</strong>
              <p>{selectedRequest.country || "Not provided"}</p>
            </div>

            <div>
              <strong>Request Type</strong>
              <p>{selectedRequest.type} Request</p>
            </div>

            <div>
              <strong>Subject</strong>
              <p>{selectedRequest.subject}</p>
            </div>

            <div>
              <strong>Message / Event Details</strong>
              <p style={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere"
              }}>
                {selectedRequest.message}
              </p>
            </div>

            <div>
              <strong>Submitted</strong>
              <p>{formatDateTime(selectedRequest.createdAt)}</p>
            </div>

            <FormField label="Review Status">
              <select
                value={requestDraftStatus}
                onChange={(e) =>
                  setRequestDraftStatus(
                    e.target.value as RequestStatus
                  )
                }
              >
                <option value="New">New</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Resolved">Resolved</option>
              </select>
            </FormField>
          </div>

          <div
            className="va-form-actions"
            style={{
              flexShrink: 0,
              marginTop: 12,
              paddingTop: 16,
              borderTop: "1px solid #eee2d5",
              background: "#fffaf4",
            }}
          >
            <button
              type="button"
              className="va-secondary-btn"
              onClick={closeRequestDetails}
            >
              Close
            </button>

            <button
              type="button"
              className="va-primary-btn"
              onClick={saveRequestChanges}
              disabled={
                requestDraftStatus === selectedRequest.status
              }
            >
              <Check size={17} />
              Save Changes
            </button>
          </div>
        </ModalShell>
      )}

    </div>
  );
}
