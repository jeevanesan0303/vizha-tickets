
import { useSyncExternalStore } from "react";
import type { Event } from "@/types";

/* ==========================================================
   VIZHATICKETS — SHARED EVENT DATA SYSTEM

   React + Vite + TypeScript

   PURPOSE
   ----------------------------------------------------------
   Connect the Admin Dashboard and Customer Website
   using a common frontend event catalogue.

   Supports:
   - Existing sample events
   - Published admin-created events
   - Draft visibility rules
   - Dynamic ticket categories
   - Event banners
   - Venue layout images
   - General admission booking
   - Zone/area selection
   - Demonstration reserved seating
   - Existing checkout helper compatibility
   - Event details lookup by slug and ID
   - Reactive customer event listings

   DEVELOPMENT LIMITATIONS
   ----------------------------------------------------------
   Browser localStorage is not a production database.

   Real booking availability, payment confirmation,
   seat locking, QR issuance and organizer settlements
   require secure backend services.

   Uploaded venue images are visual references only.
   They do not automatically create clickable zones.
   ========================================================== */

/* ==========================================================
   STORAGE CONFIGURATION
   ========================================================== */

export const ADMIN_EVENTS_STORAGE_KEY =
  "vizha_admin_events_v1";

export const ADMIN_ORGANIZERS_STORAGE_KEY =
  "vizha_admin_organizers_v1";

export const ADMIN_DATA_CHANGE_EVENT =
  "vizha-admin-data-changed";

/* ==========================================================
   BOOKING TYPES
   ========================================================== */

export type EventBookingMode =
  | "general"
  | "zone"
  | "seat";

export interface EventTicketTier {
  id: string;
  name: string;
  price: number;

  description?: string;
  available?: boolean;

  minQuantity?: number;
  maxQuantity?: number;

  capacity?: number;
  color?: string;

  demo?: boolean;
}

export interface EventBookingZone {
  id: string;
  name: string;

  ticketTierId: string;

  description?: string;

  position?:
    | "front"
    | "middle"
    | "back"
    | "left"
    | "right"
    | "center";

  color?: string;
  capacity?: number;
  available?: boolean;

  benefits?: string[];

  demo?: boolean;
}

export type EventSeatStatus =
  | "available"
  | "unavailable"
  | "reserved"
  | "sold"
  | "blocked";

export interface EventSeat {
  id: string;
  row: string;
  number: number;
  label: string;

  ticketTierId: string;
  zoneId?: string;

  status: EventSeatStatus;

  accessible?: boolean;
  companionSeat?: boolean;
}

export interface EventSeatRow {
  id: string;
  label: string;
  seats: EventSeat[];
}

export interface EventSeatingConfig {
  id: string;
  name: string;
  demo: boolean;

  stagePosition?:
    | "top"
    | "bottom"
    | "left"
    | "right";

  stageLabel?: string;
  mapImage?: string;

  maxSeatsPerBooking: number;

  rows: EventSeatRow[];
  notes?: string[];
}

export interface EventVenueDetails {
  name: string;

  address?: string;
  city?: string;
  country?: string;

  latitude?: number;
  longitude?: number;

  mapImage?: string;

  entranceInstructions?: string;
  parkingInformation?: string;
  accessibilityInformation?: string;
}

/* ==========================================================
   PUBLIC EVENT MODEL

   Extends the existing shared Event interface.
   ========================================================== */

export interface EventDetails extends Event {
  duration?: string;
  ageLimit?: string;
  language?: string;
  eventType?: string;
  organizer?: string;

  tags?: string[];
  interestedCount?: number;

  fullDescription?: string;
  dateISO?: string;

  bookingEnabled?: boolean;
  bookingMode?: EventBookingMode;

  ticketTiers?: EventTicketTier[];
  bookingZones?: EventBookingZone[];
  seatingConfig?: EventSeatingConfig;

  venueDetails?: EventVenueDetails;

  minTicketsPerBooking?: number;
  maxTicketsPerBooking?: number;

  bookingConfigurationDemo?: boolean;

  /* Shared admin/public metadata */

  adminEventId?: string;
  organizerId?: string;

  publicationStatus?: "Draft" | "Published";

  venueLayoutImage?: string;

  salesStart?: string;
  salesEnd?: string;

  refundPolicy?: string;
  terms?: string;

  endDate?: string;
  endTime?: string;

  eventSource?: "static" | "admin";
}

/* ==========================================================
   ADMIN EVENT STORAGE TYPES

   These describe the records saved by EventForm.tsx.

   This module does not import AdminApp or EventForm,
   avoiding circular dependencies between customer
   and admin components.
   ========================================================== */

interface StoredAdminTicketTier {
  id: string;
  name: string;
  price: number;
  capacity: number;

  maxPerBooking: number;

  description?: string;
  enabled?: boolean;
}

interface StoredAdminEvent {
  id: string;
  title: string;
  category: string;
  description: string;

  organizerId: string;

  country: string;
  city: string;
  venue: string;

  date: string;
  time: string;

  endDate?: string;
  endTime?: string;

  currency: string;

  ticketTiers?: StoredAdminTicketTier[];

  admissionType?:
    | "general"
    | "zones"
    | "reserved"
    | "stadium";

  stagePosition?: string;
  venueNotes?: string;

  imageUrl?: string;
  venueLayoutImage?: string;

  salesStart?: string;
  salesEnd?: string;

  refundPolicy?: string;
  terms?: string;

  bookingEnabled?: boolean;

  status: "Draft" | "Published";
  createdAt?: string;

  price?: number;
  capacity?: number;
}

interface StoredAdminOrganizer {
  id: string;
  name: string;
  displayName?: string;
  status?: string;
}

/* ==========================================================
   DEMO SEATING ROW GENERATOR
   ========================================================== */

function createDemoSeatRow(
  rowLabel: string,
  count: number,
  ticketTierId: string,
  zoneId?: string,
  unavailableSeatNumbers: number[] = []
): EventSeatRow {
  const seats: EventSeat[] = Array.from(
    { length: count },
    (_, index) => {
      const number = index + 1;
      const label = `${rowLabel}${number}`;

      return {
        id: label,
        row: rowLabel,
        number,
        label,
        ticketTierId,
        zoneId,

        status: unavailableSeatNumbers.includes(number)
          ? "unavailable"
          : "available",
      };
    }
  );

  return {
    id: `row-${rowLabel.toLowerCase()}`,
    label: rowLabel,
    seats,
  };
}

/* ==========================================================
   DEMO TICKET CONFIGURATIONS

   Retained from the original events.ts.
   ========================================================== */

/* YUVAN — ZONE BOOKING */

const yuvanTicketTiers: EventTicketTier[] = [
  {
    id: "standard",
    name: "Standard Pass",
    price: 2500,
    description: "General standing admission",
    available: true,
    color: "#64748b",
    demo: true,
  },
  {
    id: "gold",
    name: "Gold Circle",
    price: 4500,
    description: "Closer standing area",
    available: true,
    color: "#d69b27",
    demo: true,
  },
  {
    id: "vip",
    name: "VIP Experience",
    price: 8000,
    description: "Front standing area",
    available: true,
    color: "#b87918",
    demo: true,
  },
];

const yuvanBookingZones: EventBookingZone[] = [
  {
    id: "vip-front",
    name: "VIP — Front Area",
    ticketTierId: "vip",
    position: "front",
    color: "#b87918",
    description: "Front standing section",
    benefits: ["Front standing area"],
    available: true,
    demo: true,
  },
  {
    id: "gold-middle",
    name: "Gold — Middle Area",
    ticketTierId: "gold",
    position: "middle",
    color: "#d69b27",
    description: "Middle standing section",
    available: true,
    demo: true,
  },
  {
    id: "standard-back",
    name: "Standard — General Area",
    ticketTierId: "standard",
    position: "back",
    color: "#64748b",
    description: "General standing section",
    available: true,
    demo: true,
  },
];

/* BHARATHANATYAM — RESERVED SEATING */

const bharathanatyamTicketTiers: EventTicketTier[] = [
  {
    id: "standard",
    name: "Standard Seating",
    price: 1000,
    description: "General reserved seating",
    color: "#64748b",
    available: true,
    demo: true,
  },
  {
    id: "gold",
    name: "Premium Seating",
    price: 1800,
    description: "Middle rows",
    color: "#d69b27",
    available: true,
    demo: true,
  },
  {
    id: "vip",
    name: "Front Row Seating",
    price: 3000,
    description: "Front rows nearest the stage",
    color: "#b87918",
    available: true,
    demo: true,
  },
];

const bharathanatyamSeatingConfig: EventSeatingConfig = {
  id: "bharathanatyam-demo-seating",
  name: "Demo Auditorium Seating",
  demo: true,

  stagePosition: "top",
  stageLabel: "PERFORMANCE STAGE",

  maxSeatsPerBooking: 10,

  rows: [
    createDemoSeatRow("A", 8, "vip", "front", [3]),
    createDemoSeatRow("B", 8, "vip", "front", [5]),

    createDemoSeatRow("C", 8, "gold", "middle", [2, 7]),
    createDemoSeatRow("D", 8, "gold", "middle", [4]),

    createDemoSeatRow("E", 8, "standard", "back", [1, 6]),
    createDemoSeatRow("F", 8, "standard", "back", [8]),
  ],

  notes: [
    "This is a demonstration seating layout.",
    "Unavailable seats are sample data.",
    "Seat availability is not synchronized between customers.",
    "The organizer must provide an actual seat plan before launch.",
  ],
};

/* CRICKET — STADIUM ZONES */

const cricketTicketTiers: EventTicketTier[] = [
  {
    id: "standard",
    name: "General Stand",
    price: 1500,
    description: "General spectator stand",
    available: true,
    color: "#64748b",
    demo: true,
  },
  {
    id: "gold",
    name: "Premium Stand",
    price: 3000,
    description: "Premium viewing area",
    available: true,
    color: "#d69b27",
    demo: true,
  },
  {
    id: "vip",
    name: "VIP Stand",
    price: 5000,
    description: "VIP viewing area",
    available: true,
    color: "#b87918",
    demo: true,
  },
];

const cricketBookingZones: EventBookingZone[] = [
  {
    id: "general-stand",
    name: "General Stand",
    ticketTierId: "standard",
    position: "back",
    color: "#64748b",
    available: true,
    demo: true,
  },
  {
    id: "premium-stand",
    name: "Premium Stand",
    ticketTierId: "gold",
    position: "middle",
    color: "#d69b27",
    available: true,
    demo: true,
  },
  {
    id: "vip-stand",
    name: "VIP Stand",
    ticketTierId: "vip",
    position: "front",
    color: "#b87918",
    available: true,
    demo: true,
  },
];

/* GENERAL ADMISSION EVENTS */

const comedyTicketTiers: EventTicketTier[] = [
  {
    id: "standard",
    name: "General Admission",
    price: 1500,
    description: "Entry to the comedy show",
    available: true,
    demo: true,
  },
];

const foodFestivalTicketTiers: EventTicketTier[] = [
  {
    id: "standard",
    name: "Festival Entry",
    price: 1200,
    description: "General admission to the festival",
    available: true,
    demo: true,
  },
];

/* ==========================================================
   ORIGINAL STATIC EVENTS

   These records are retained as fallback demo events.

   When the admin has saved an event catalogue, the
   admin catalogue becomes the source of publication
   status, prices and other configured information.

   The original images, slugs and richer demo seat
   configurations can still be reused for matching
   previously known events.
   ========================================================== */

export const staticEvents: EventDetails[] = [
  {
    id: "1",
    title: "Yuvan Live in Concert",
    slug: "yuvan-live-in-concert",

    description:
      "An unforgettable live musical experience featuring incredible performances.",

    fullDescription:
      "An unforgettable live musical experience featuring incredible performances.",

    image: "/images/events/yuvan-live.png",

    date: "25 OCT",
    time: "7:00 PM",

    location: "Jaffna, Sri Lanka",
    venue: "Jaffna Cultural Centre",

    category: "Concerts",
    tags: ["Concerts", "Music Shows"],

    eventType: "Live Concert",

    price: 2500,
    currency: "LKR",

    bookingEnabled: true,
    bookingMode: "zone",
    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,
    maxTicketsPerBooking: 10,

    ticketTiers: yuvanTicketTiers,
    bookingZones: yuvanBookingZones,

    venueDetails: {
      name: "Jaffna Cultural Centre",
      city: "Jaffna",
      country: "Sri Lanka",
    },

    adminEventId: "EVT-001",
    publicationStatus: "Published",
    eventSource: "static",
  },

  {
    id: "2",
    title: "Bharathanatyam Arangetram",
    slug: "bharathanatyam-arangetram",

    description:
      "Experience a beautiful evening of traditional Bharathanatyam.",

    fullDescription:
      "Experience a beautiful evening of traditional Bharathanatyyam.",

    image: "/images/events/bharathanatyam.png",

    date: "28 OCT",
    time: "6:30 PM",

    location: "Colombo, Sri Lanka",
    venue: "Colombo Music Hall",

    category: "Cultural",
    tags: ["Cultural", "Classical Dance"],

    eventType: "Dance Performance",

    price: 1000,
    currency: "LKR",

    bookingEnabled: true,
    bookingMode: "seat",
    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,
    maxTicketsPerBooking: 10,

    ticketTiers: bharathanatyamTicketTiers,
    seatingConfig: bharathanatyamSeatingConfig,

    venueDetails: {
      name: "Colombo Music Hall",
      city: "Colombo",
      country: "Sri Lanka",
    },

    adminEventId: "EVT-002",
    publicationStatus: "Published",
    eventSource: "static",
  },

  {
    id: "3",
    title: "Tamil Stand-up Comedy Night",
    slug: "tamil-stand-up-comedy-night",

    description:
      "A night of laughter, comedy and unforgettable performances.",

    fullDescription:
      "A night of laughter, comedy and unforgettable performances.",

    image: "/images/events/comedy-night.png",

    date: "05 NOV",
    time: "7:30 PM",

    location: "Batticaloa, Sri Lanka",
    venue: "Batticaloa Town Hall",

    category: "Comedy",
    tags: ["Comedy", "Stand-up"],

    eventType: "Stand-up Comedy",

    price: 1500,
    currency: "LKR",

    bookingEnabled: true,
    bookingMode: "general",
    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,
    maxTicketsPerBooking: 10,

    ticketTiers: comedyTicketTiers,

    venueDetails: {
      name: "Batticaloa Town Hall",
      city: "Batticaloa",
      country: "Sri Lanka",
    },

    adminEventId: "EVT-003",
    publicationStatus: "Published",
    eventSource: "static",
  },

  {
    id: "4",
    title: "IPL 2026 — Jaffna Kings",
    slug: "ipl-2026-jaffna-kings",

    description:
      "Experience the excitement of live cricket.",

    fullDescription:
      "Experience the excitement of live cricket.",

    image: "/images/events/sports-event.png",

    date: "12 NOV",
    time: "6:00 PM",

    location: "Jaffna, Sri Lanka",
    venue: "Jaffna Stadium",

    category: "Sports",
    tags: ["Sports", "Cricket"],

    eventType: "Cricket Match",

    price: 1500,
    currency: "LKR",

    bookingEnabled: true,
    bookingMode: "zone",
    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,
    maxTicketsPerBooking: 10,

    ticketTiers: cricketTicketTiers,
    bookingZones: cricketBookingZones,

    venueDetails: {
      name: "Jaffna Stadium",
      city: "Jaffna",
      country: "Sri Lanka",
    },

    publicationStatus: "Published",
    eventSource: "static",
  },

  {
    id: "5",
    title: "Jaffna Food Festival 2026",
    slug: "jaffna-food-festival-2026",

    description:
      "Experience an unforgettable food festival featuring local cuisine, music, cultural performances, and family-friendly activities.",

    fullDescription:
      "Experience an unforgettable food festival featuring local cuisine, music, cultural performances, and family-friendly activities.",

    image: "/images/events/featured-event.png",

    date: "18 NOV",
    time: "10:00 AM",

    location: "Jaffna, Sri Lanka",
    venue: "Jaffna Public Ground",

    category: "Festivals",
    tags: ["Festivals", "Food", "Cultural"],

    eventType: "Food Festival",

    price: 1200,
    currency: "LKR",

    featured: true,

    bookingEnabled: true,
    bookingMode: "general",
    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,
    maxTicketsPerBooking: 10,

    ticketTiers: foodFestivalTicketTiers,

    venueDetails: {
      name: "Jaffna Public Ground",
      city: "Jaffna",
      country: "Sri Lanka",
    },

    publicationStatus: "Published",
    eventSource: "static",
  },
];

/* ==========================================================
   LEGACY ADMIN EVENT MAPPING

   The existing admin sample IDs differ from the public
   static event IDs. These mappings preserve known public
   detail routes when admin versions replace them.

   New admin-created events retain their own admin IDs.
   ========================================================== */

const LEGACY_EVENT_IDS: Record<string, string> = {
  "EVT-001": "1",
  "EVT-002": "2",
  "EVT-003": "3",
};

function findMatchingStaticEvent(
  adminEvent: StoredAdminEvent
): EventDetails | undefined {
  const mappedId = LEGACY_EVENT_IDS[adminEvent.id];

  if (mappedId) {
    const mapped = staticEvents.find(
      (event) => event.id === mappedId
    );

    if (mapped) return mapped;
  }

  return staticEvents.find(
    (event) =>
      event.title.trim().toLowerCase() ===
      adminEvent.title.trim().toLowerCase()
  );
}

/* ==========================================================
   HELPER — SAFE BROWSER STORAGE READ
   ========================================================== */

function readStorageArray<T>(
  key: string
): T[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);

    if (value === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed)
      ? (parsed as T[])
      : null;
  } catch {
    return null;
  }
}

/* ==========================================================
   HELPER — SLUG GENERATION
   ========================================================== */

export function createEventSlug(
  title: string
): string {
  return title
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "event";
}

/* ==========================================================
   DATE / TIME CONVERSION
   ========================================================== */

function displayEventDate(
  date: string
): string {
  if (!date) return "TBA";

  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  const monthNames = [
    "JAN", "FEB", "MAR", "APR",
    "MAY", "JUN", "JUL", "AUG",
    "SEP", "OCT", "NOV", "DEC",
  ];

  const monthIndex = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  if (
    monthIndex < 0 ||
    monthIndex > 11 ||
    !Number.isInteger(day)
  ) {
    return date;
  }

  return `${String(day).padStart(2, "0")} ${monthNames[monthIndex]}`;
}

function displayEventTime(
  time: string
): string {
  if (!time) return "TBA";

  const match = /^(\d{1,2}):(\d{2})$/.exec(time);

  if (!match) return time;

  const hours = Number(match[1]);
  const minutes = match[2];

  if (hours > 23) return time;

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${period}`;
}

/* ==========================================================
   BOOKING MODE CONVERSION
   ========================================================== */

function mapAdmissionType(
  type: StoredAdminEvent["admissionType"]
): EventBookingMode {
  switch (type) {
    case "zones":
    case "stadium":
      return "zone";

    case "reserved":
      return "seat";

    case "general":
    default:
      return "general";
  }
}

/* ==========================================================
   TICKET TIER CONVERSION
   ========================================================== */

function convertAdminTicketTiers(
  adminEvent: StoredAdminEvent
): EventTicketTier[] {
  const source = Array.isArray(adminEvent.ticketTiers)
    ? adminEvent.ticketTiers
    : [];

  if (source.length === 0) {
    const price = Number(adminEvent.price ?? 0);
    const capacity = Number(adminEvent.capacity ?? 100);

    return [
      {
        id: `${adminEvent.id}-GENERAL`,
        name: "General Admission",
        price: Number.isFinite(price) ? price : 0,
        capacity: Number.isFinite(capacity)
          ? Math.max(1, capacity)
          : 100,
        maxQuantity: 10,
        minQuantity: 1,
        description: "General admission ticket",
        available: true,
        demo: true,
      },
    ];
  }

  return source.map((tier) => ({
    id: tier.id,
    name: tier.name,

    price: Number.isFinite(Number(tier.price))
      ? Number(tier.price)
      : 0,

    capacity: Number.isFinite(Number(tier.capacity))
      ? Math.max(0, Number(tier.capacity))
      : 0,

    minQuantity: 1,

    maxQuantity: Math.max(
      1,
      Number(tier.maxPerBooking) || 10
    ),

    description: tier.description || "",

    available: tier.enabled !== false,
    demo: true,
  }));
}

/* ==========================================================
   MATCH PREDEFINED DEMO CONFIGURATIONS

   A predefined static seating or zone configuration is
   only reused if the admin event still has matching tier
   IDs and compatible prices.

   This prevents an old demo seating map from silently
   assigning seats to newly edited ticket categories.
   ========================================================== */

function canReuseBookingConfiguration(
  original: EventDetails,
  adminTiers: EventTicketTier[],
  desiredMode: EventBookingMode
): boolean {
  if (original.bookingMode !== desiredMode) {
    return false;
  }

  const oldTiers = original.ticketTiers ?? [];

  return (
    oldTiers.length === adminTiers.length &&
    oldTiers.every((oldTier) =>
      adminTiers.some(
        (newTier) =>
          newTier.id === oldTier.id &&
          newTier.price === oldTier.price
      )
    )
  );
}

/* ==========================================================
   ADMIN EVENT → PUBLIC EVENT CONVERSION
   ========================================================== */

function convertAdminEvent(
  adminEvent: StoredAdminEvent,
  organizers: StoredAdminOrganizer[]
): EventDetails {
  const original = findMatchingStaticEvent(adminEvent);

  const ticketTiers =
    convertAdminTicketTiers(adminEvent);

  const availableTiers = ticketTiers.filter(
    (tier) => tier.available !== false
  );

  const startingPrice = availableTiers.length
    ? Math.min(...availableTiers.map((tier) => tier.price))
    : 0;

  const mode = mapAdmissionType(
    adminEvent.admissionType
  );

  const reuseDemoConfig = Boolean(
    original &&
    canReuseBookingConfiguration(
      original,
      ticketTiers,
      mode
    )
  );

  const organizer = organizers.find(
    (item) => item.id === adminEvent.organizerId
  );

  /*
   * A venue layout upload is a visual image.
   * It does not create physical seat coordinates.
   */

  const venueLayoutImage =
    adminEvent.venueLayoutImage || "";

  const bookingZones: EventBookingZone[] | undefined =
    mode === "zone"
      ? reuseDemoConfig
        ? original?.bookingZones
        : undefined
      : undefined;

  const seatingConfig: EventSeatingConfig | undefined =
    mode === "seat" && reuseDemoConfig
      ? original?.seatingConfig
      : undefined;

  /*
   * Reserved seating must not pretend that a visual
   * image is an interactive numbered seat plan.
   *
   * Zone bookings without configured zone mappings
   * are likewise not ready for checkout.
   */

  const configurationReady =
    mode === "general" ||
    (
      mode === "zone" &&
      Boolean(bookingZones?.length)
    ) ||
    (
      mode === "seat" &&
      Boolean(seatingConfig?.rows.length)
    );

  const organizerName =
    organizer?.displayName ||
    organizer?.name ||
    original?.organizer ||
    "Event Organizer";

  const image =
    adminEvent.imageUrl ||
    original?.image ||
    "/images/events/featured-event.png";

  const slug =
    original?.slug ||
    `${createEventSlug(adminEvent.title)}-${createEventSlug(adminEvent.id)}`;

  const location = [
    adminEvent.city,
    adminEvent.country,
  ]
    .filter(Boolean)
    .join(", ");

  const maxPerBooking = availableTiers.length
    ? Math.max(
        1,
        Math.min(
          10,
          ...availableTiers.map(
            (tier) => tier.maxQuantity ?? 10
          )
        )
      )
    : 10;

  return {
    id: original?.id || adminEvent.id,

    title: adminEvent.title,
    slug,

    description: adminEvent.description,

    fullDescription:
      adminEvent.description ||
      original?.fullDescription ||
      "",

    image,

    date: displayEventDate(adminEvent.date),
    dateISO: adminEvent.date,

    time: displayEventTime(adminEvent.time),

    location,
    venue: adminEvent.venue,

    category: adminEvent.category,

    tags: original?.tags || [adminEvent.category],

    eventType:
      original?.eventType ||
      adminEvent.category,

    price: startingPrice,
    currency: adminEvent.currency || "LKR",

    featured: original?.featured ?? false,

    organizer: organizerName,

    bookingEnabled:
      adminEvent.bookingEnabled !== false &&
      configurationReady &&
      availableTiers.length > 0,

    bookingMode: mode,
    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,
    maxTicketsPerBooking: maxPerBooking,

    ticketTiers,
    bookingZones,
    seatingConfig,

    venueDetails: {
      name: adminEvent.venue,
      city: adminEvent.city,
      country: adminEvent.country,

      mapImage:
        venueLayoutImage ||
        original?.venueDetails?.mapImage,

      entranceInstructions:
        adminEvent.venueNotes || undefined,
    },

    venueLayoutImage,

    adminEventId: adminEvent.id,
    organizerId: adminEvent.organizerId,

    publicationStatus: adminEvent.status,
    eventSource: "admin",

    endDate: adminEvent.endDate || "",
    endTime: adminEvent.endTime || "",

    salesStart: adminEvent.salesStart || "",
    salesEnd: adminEvent.salesEnd || "",

    refundPolicy: adminEvent.refundPolicy || "",
    terms: adminEvent.terms || "",
  };
}

/* ==========================================================
   GET THE PUBLIC EVENT CATALOGUE

   Rules:

   1. Without saved admin data, use the original static
      demo events.

   2. With saved admin data, the admin catalogue is
      authoritative.

   3. Only Published events are visible publicly.

   4. Draft events do not appear.

   5. Deleting an event from the admin catalogue also
      removes it from the customer catalogue.

   This avoids duplicate and inconsistent events.
   ========================================================== */

export function getPublicEvents(): EventDetails[] {
  const adminEvents =
    readStorageArray<StoredAdminEvent>(
      ADMIN_EVENTS_STORAGE_KEY
    );

  /*
   * No admin catalogue saved yet.
   * Retain existing frontend demo events.
   */

  if (adminEvents === null) {
    return staticEvents;
  }

  const organizers =
    readStorageArray<StoredAdminOrganizer>(
      ADMIN_ORGANIZERS_STORAGE_KEY
    ) ?? [];

  const published = adminEvents.filter(
    (event) => event.status === "Published"
  );

  return published.map((event) =>
    convertAdminEvent(event, organizers)
  );
}

/* ==========================================================
   BACKWARD COMPATIBILITY

   Previous customer components import:
     import { events } from "@/data/events";

   Keep that export so existing imports compile.

   IMPORTANT:
   This is a snapshot, not a React subscription.

   Customer components that need live updates must
   call usePublicEvents() or getPublicEvents().
   ========================================================== */

export const events: EventDetails[] = getPublicEvents();

/* ==========================================================
   REACTIVE PUBLIC EVENT SUBSCRIPTION

   The admin currently dispatches:
     vizha-admin-data-changed

   We also listen for the browser storage event to
   detect changes from another tab on the same origin.
   ========================================================== */

let cachedStorageKey = "";
let cachedEvents: EventDetails[] = events;

const listeners = new Set<() => void>();

let subscriptionCount = 0;

function readCatalogueCacheKey(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    return [
      window.localStorage.getItem(
        ADMIN_EVENTS_STORAGE_KEY
      ) ?? "null",

      window.localStorage.getItem(
        ADMIN_ORGANIZERS_STORAGE_KEY
      ) ?? "null",
    ].join("::");
  } catch {
    return "storage-unavailable";
  }
}

function getPublicEventsSnapshot(): EventDetails[] {
  const nextKey = readCatalogueCacheKey();

  if (nextKey !== cachedStorageKey) {
    cachedStorageKey = nextKey;
    cachedEvents = getPublicEvents();
  }

  return cachedEvents;
}

function notifySubscribers(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleCatalogueChange(): void {
  cachedStorageKey = "";
  notifySubscribers();
}

function subscribeToPublicEvents(
  listener: () => void
): () => void {
  listeners.add(listener);

  if (
    typeof window !== "undefined" &&
    subscriptionCount === 0
  ) {
    window.addEventListener(
      ADMIN_DATA_CHANGE_EVENT,
      handleCatalogueChange
    );

    window.addEventListener(
      "storage",
      handleCatalogueChange
    );
  }

  subscriptionCount += 1;

  return () => {
    listeners.delete(listener);
    subscriptionCount = Math.max(
      0,
      subscriptionCount - 1
    );

    if (
      typeof window !== "undefined" &&
      subscriptionCount === 0
    ) {
      window.removeEventListener(
        ADMIN_DATA_CHANGE_EVENT,
        handleCatalogueChange
      );

      window.removeEventListener(
        "storage",
        handleCatalogueChange
      );
    }
  };
}

/* ==========================================================
   USE IN CUSTOMER COMPONENTS

   Example:

   const events = usePublicEvents();

   This updates when the admin saves or publishes events.
   ========================================================== */

export function usePublicEvents(): EventDetails[] {
  return useSyncExternalStore(
    subscribeToPublicEvents,
    getPublicEventsSnapshot,
    () => staticEvents
  );
}

/* ==========================================================
   EVENT LOOKUP HELPERS

   Lookup against current admin/public data instead
   of the original static array.
   ========================================================== */

export function getEventBySlug(
  slug: string | undefined
): EventDetails | undefined {
  if (!slug) return undefined;

  return getPublicEvents().find(
    (event) => event.slug === slug
  );
}

export function getEventById(
  id: string
): EventDetails | undefined {
  return getPublicEvents().find(
    (event) =>
      event.id === id ||
      event.adminEventId === id
  );
}

/* ==========================================================
   REACTIVE EVENT LOOKUP

   Useful on EventDetailPage and CheckoutPage.
   ========================================================== */

export function useEventBySlug(
  slug: string | undefined
): EventDetails | undefined {
  const availableEvents = usePublicEvents();

  return availableEvents.find(
    (event) => event.slug === slug
  );
}

export function useEventById(
  id: string | undefined
): EventDetails | undefined {
  const availableEvents = usePublicEvents();

  if (!id) return undefined;

  return availableEvents.find(
    (event) =>
      event.id === id ||
      event.adminEventId === id
  );
}

/* ==========================================================
   CATEGORY HELPERS
   ========================================================== */

export function getEventsByCategory(
  category: string
): EventDetails[] {
  const normalized = category
    .trim()
    .toLowerCase();

  const availableEvents = getPublicEvents();

  if (!normalized || normalized === "all") {
    return availableEvents;
  }

  return availableEvents.filter((event) => {
    const categoryMatches =
      event.category.toLowerCase() === normalized;

    const tagMatches =
      event.tags?.some(
        (tag) => tag.toLowerCase() === normalized
      ) ?? false;

    return categoryMatches || tagMatches;
  });
}

/* ==========================================================
   FEATURED EVENTS
   ========================================================== */

export function getFeaturedEvents(): EventDetails[] {
  return getPublicEvents().filter(
    (event) => event.featured === true
  );
}

/* ==========================================================
   RELATED EVENTS
   ========================================================== */

export function getRelatedEvents(
  currentSlug: string,
  limit = 3
): EventDetails[] {
  const availableEvents = getPublicEvents();

  const current = availableEvents.find(
    (event) => event.slug === currentSlug
  );

  if (!current) return [];

  return availableEvents
    .filter(
      (event) =>
        event.slug !== current.slug &&
        event.category === current.category
    )
    .slice(0, Math.max(0, limit));
}

/* ==========================================================
   BOOKING MODE HELPERS
   ========================================================== */

export function getEventBookingMode(
  event: EventDetails
): EventBookingMode {
  return event.bookingMode ?? "general";
}

/* ==========================================================
   BOOKING CONFIGURATION VALIDATION

   A venue layout image alone is NOT a valid interactive
   seat map or zone configuration.
   ========================================================== */

export function hasEventBookingConfiguration(
  event: EventDetails
): boolean {
  if (event.bookingEnabled === false) {
    return false;
  }

  const mode = getEventBookingMode(event);

  if (mode === "general") {
    return getEventTicketTiers(event).some(
      (tier) => tier.available !== false
    );
  }

  if (mode === "zone") {
    return Boolean(
      event.bookingZones?.length &&
      event.ticketTiers?.length &&
      event.bookingZones.some(
        (zone) =>
          zone.available !== false &&
          event.ticketTiers?.some(
            (tier) =>
              tier.id === zone.ticketTierId &&
              tier.available !== false
          )
      )
    );
  }

  if (mode === "seat") {
    return Boolean(
      event.seatingConfig?.rows.length &&
      event.ticketTiers?.length
    );
  }

  return false;
}

/* ==========================================================
   TICKET CATEGORY HELPERS
   ========================================================== */

export function getEventTicketTiers(
  event: EventDetails
): EventTicketTier[] {
  if (event.ticketTiers?.length) {
    return event.ticketTiers;
  }

  return [
    {
      id: "standard",
      name: "Standard Pass",
      price: event.price,
      description: "General admission",
      available: true,
      demo: true,
    },
  ];
}

export function getEventTicketTier(
  event: EventDetails,
  tierId: string
): EventTicketTier | undefined {
  return getEventTicketTiers(event).find(
    (tier) => tier.id === tierId
  );
}

export function getEventStartingPrice(
  event: EventDetails
): number {
  const availableTiers =
    getEventTicketTiers(event).filter(
      (tier) =>
        tier.available !== false &&
        Number.isFinite(tier.price) &&
        tier.price >= 0
    );

  if (!availableTiers.length) {
    return event.price;
  }

  return Math.min(
    ...availableTiers.map(
      (tier) => tier.price
    )
  );
}

export function formatEventPrice(
  event: EventDetails,
  amount = getEventStartingPrice(event)
): string {
  return `${event.currency} ${amount.toLocaleString(
    "en-LK",
    {
      maximumFractionDigits: 2,
    }
  )}`;
}

/* ==========================================================
   ZONE SELECTION HELPERS
   ========================================================== */

export function getEventBookingZones(
  event: EventDetails
): EventBookingZone[] {
  if (getEventBookingMode(event) !== "zone") {
    return [];
  }

  return event.bookingZones ?? [];
}

export function getEventBookingZone(
  event: EventDetails,
  zoneId: string
): EventBookingZone | undefined {
  return getEventBookingZones(event).find(
    (zone) => zone.id === zoneId
  );
}

export function getZoneTicketTier(
  event: EventDetails,
  zoneId: string
): EventTicketTier | undefined {
  const zone = getEventBookingZone(
    event,
    zoneId
  );

  if (!zone) return undefined;

  return getEventTicketTier(
    event,
    zone.ticketTierId
  );
}

export function getZoneTicketPrice(
  event: EventDetails,
  zoneId: string
): number | null {
  const zone = getEventBookingZone(
    event,
    zoneId
  );

  if (
    !zone ||
    zone.available === false
  ) {
    return null;
  }

  const tier = getZoneTicketTier(
    event,
    zoneId
  );

  if (
    !tier ||
    tier.available === false
  ) {
    return null;
  }

  return tier.price;
}

/* ==========================================================
   INDIVIDUAL SEATING HELPERS
   ========================================================== */

export function getEventSeatingConfig(
  event: EventDetails
): EventSeatingConfig | undefined {
  if (getEventBookingMode(event) !== "seat") {
    return undefined;
  }

  return event.seatingConfig;
}

export function getEventSeats(
  event: EventDetails
): EventSeat[] {
  const config = getEventSeatingConfig(event);

  if (!config) return [];

  return config.rows.flatMap(
    (row) => row.seats
  );
}

export function getEventSeat(
  event: EventDetails,
  seatId: string
): EventSeat | undefined {
  return getEventSeats(event).find(
    (seat) => seat.id === seatId
  );
}

export function isEventSeatAvailable(
  event: EventDetails,
  seatId: string
): boolean {
  const seat = getEventSeat(
    event,
    seatId
  );

  if (
    !seat ||
    seat.status !== "available"
  ) {
    return false;
  }

  const tier = getEventTicketTier(
    event,
    seat.ticketTierId
  );

  return Boolean(
    tier &&
    tier.available !== false
  );
}

export function getSeatTicketTier(
  event: EventDetails,
  seatId: string
): EventTicketTier | undefined {
  const seat = getEventSeat(
    event,
    seatId
  );

  if (!seat) return undefined;

  return getEventTicketTier(
    event,
    seat.ticketTierId
  );
}

export function getSeatTicketPrice(
  event: EventDetails,
  seatId: string
): number | null {
  if (!isEventSeatAvailable(event, seatId)) {
    return null;
  }

  const tier = getSeatTicketTier(
    event,
    seatId
  );

  return tier?.price ?? null;
}

/* ==========================================================
   SELECTED SEAT CALCULATION
   ========================================================== */

export interface SelectedSeatsCalculation {
  seatIds: string[];
  quantity: number;
  subtotal: number;
  valid: boolean;
  error?: string;
}

export function calculateSelectedSeats(
  event: EventDetails,
  seatIds: string[]
): SelectedSeatsCalculation {
  if (getEventBookingMode(event) !== "seat") {
    return {
      seatIds,
      quantity: 0,
      subtotal: 0,
      valid: false,
      error:
        "This event does not use seat selection.",
    };
  }

  if (seatIds.length === 0) {
    return {
      seatIds,
      quantity: 0,
      subtotal: 0,
      valid: false,
      error: "Select at least one seat.",
    };
  }

  const uniqueSeatIds = [
    ...new Set(seatIds),
  ];

  if (uniqueSeatIds.length !== seatIds.length) {
    return {
      seatIds,
      quantity: seatIds.length,
      subtotal: 0,
      valid: false,
      error: "Duplicate seats are not allowed.",
    };
  }

  const config = getEventSeatingConfig(event);

  if (!config) {
    return {
      seatIds,
      quantity: 0,
      subtotal: 0,
      valid: false,
      error:
        "This event does not have a configured numbered seating plan.",
    };
  }

  const maximum = Math.min(
    event.maxTicketsPerBooking ?? 10,
    config.maxSeatsPerBooking
  );

  const minimum =
    event.minTicketsPerBooking ?? 1;

  if (
    seatIds.length < minimum ||
    seatIds.length > maximum
  ) {
    return {
      seatIds,
      quantity: seatIds.length,
      subtotal: 0,
      valid: false,
      error:
        `Select between ${minimum} and ` +
        `${maximum} seats.`,
    };
  }

  let subtotal = 0;

  for (const seatId of seatIds) {
    const price = getSeatTicketPrice(
      event,
      seatId
    );

    if (
      price === null ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return {
        seatIds,
        quantity: seatIds.length,
        subtotal: 0,
        valid: false,
        error:
          `Seat ${seatId} is unavailable ` +
          `or has no valid price.`,
      };
    }

    subtotal += price;
  }

  return {
    seatIds: uniqueSeatIds,
    quantity: uniqueSeatIds.length,
    subtotal,
    valid: true,
  };
}

/* ==========================================================
   GENERAL TICKET QUANTITY VALIDATION
   ========================================================== */

export function validateEventTicketQuantity(
  event: EventDetails,
  quantity: number
): boolean {
  if (!Number.isInteger(quantity)) {
    return false;
  }

  const minimum =
    event.minTicketsPerBooking ?? 1;

  const maximum =
    event.maxTicketsPerBooking ?? 10;

  return (
    quantity >= minimum &&
    quantity <= maximum
  );
}

/* ==========================================================
   VENUE HELPERS
   ========================================================== */

export function getEventVenueLabel(
  event: EventDetails
): string {
  return [
    event.venue,
    event.location,
  ]
    .filter(Boolean)
    .join(", ");
}

export function hasEventVenueCoordinates(
  event: EventDetails
): boolean {
  const venue = event.venueDetails;

  return Boolean(
    venue &&
    typeof venue.latitude === "number" &&
    typeof venue.longitude === "number" &&
    Number.isFinite(venue.latitude) &&
    Number.isFinite(venue.longitude) &&
    venue.latitude >= -90 &&
    venue.latitude <= 90 &&
    venue.longitude >= -180 &&
    venue.longitude <= 180
  );
}

/* ==========================================================
   EVENT SALES WINDOW

   This is a frontend display rule only.
   Production enforcement belongs to the backend.
   ========================================================== */

export function isEventSalesWindowOpen(
  event: EventDetails,
  now: Date = new Date()
): boolean {
  if (event.bookingEnabled === false) {
    return false;
  }

  const start = event.salesStart
    ? new Date(event.salesStart)
    : null;

  const end = event.salesEnd
    ? new Date(event.salesEnd)
    : null;

  if (
    start &&
    !Number.isNaN(start.getTime()) &&
    now < start
  ) {
    return false;
  }

  if (
    end &&
    !Number.isNaN(end.getTime()) &&
    now > end
  ) {
    return false;
  }

  return true;
}

/* ==========================================================
   END OF SHARED EVENT DATA SYSTEM
   ========================================================== */
