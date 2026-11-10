
import type { Event } from "@/types";

/* ==========================================================
   VIZHATICKETS — COMPLETE EVENT DATA CONFIGURATION

   React + Vite + TypeScript

   FEATURES
   ----------------------------------------------------------
   1. General admission booking
   2. Area / zone selection
   3. Individual seat selection
   4. Event-specific ticket pricing
   5. Seating and venue configuration
   6. Seat availability representation
   7. Event listing compatibility
   8. Event Details page compatibility
   9. Existing checkout compatibility
   10. Customer booking integration

   IMPORTANT
   ----------------------------------------------------------
   Current booking / seating data is DEMO ONLY.

   Seat availability in this file is NOT live inventory.

   Real bookings require backend authentication,
   seat locking, inventory checks and payment verification.
   ========================================================== */

/* ==========================================================
   BOOKING MODES
   ========================================================== */

export type EventBookingMode =
  | "general"
  | "zone"
  | "seat";

/* ==========================================================
   TICKET CATEGORY
   ========================================================== */

export interface EventTicketTier {
  id: string;
  name: string;
  price: number;

  description?: string;
  available?: boolean;

  /* Optional booking limitations */

  minQuantity?: number;
  maxQuantity?: number;

  /* Optional availability display */

  capacity?: number;

  /* Appearance configuration */

  color?: string;

  /* Actual organizer price configuration needed */

  demo?: boolean;
}

/* ==========================================================
   EVENT ZONE CONFIGURATION

   Example:

   VIP — Front Standing
   GOLD — Middle Standing
   STANDARD — General Standing

   Customers choose a zone and quantity.

   ========================================================== */

export interface EventBookingZone {
  id: string;
  name: string;

  ticketTierId: string;

  description?: string;

  /* General position of the zone */

  position?:
    | "front"
    | "middle"
    | "back"
    | "left"
    | "right"
    | "center";

  /* User interface display */

  color?: string;

  /* Capacity configuration */

  capacity?: number;

  available?: boolean;

  /* Optional zone information */

  benefits?: string[];

  /* Demo data, not confirmed organizer layout */

  demo?: boolean;
}

/* ==========================================================
   SEAT STATUS

   available:
     Can be selected in the demo UI.

   unavailable:
     Cannot be selected.

   reserved:
     Example of a temporarily unavailable seat.

   sold:
     Example of a purchased seat.

   blocked:
     Not selectable.

   NOTE:
   Real statuses must come from a backend database.
   ========================================================== */

export type EventSeatStatus =
  | "available"
  | "unavailable"
  | "reserved"
  | "sold"
  | "blocked";

/* ==========================================================
   INDIVIDUAL SEAT
   ========================================================== */

export interface EventSeat {
  id: string;

  row: string;
  number: number;

  label: string;

  /* Maps the seat to a ticket category */

  ticketTierId: string;

  /* Optional zone where the seat is located */

  zoneId?: string;

  status: EventSeatStatus;

  /* Optional seat-specific information */

  accessible?: boolean;

  companionSeat?: boolean;
}

/* ==========================================================
   SEATING ROW
   ========================================================== */

export interface EventSeatRow {
  id: string;
  label: string;

  seats: EventSeat[];
}

/* ==========================================================
   EVENT SEATING PLAN
   ========================================================== */

export interface EventSeatingConfig {
  id: string;

  name: string;

  /* True for example layouts */

  demo: boolean;

  /* Stage position for visual seat selector */

  stagePosition?:
    | "top"
    | "bottom"
    | "left"
    | "right";

  stageLabel?: string;

  /* Optional seat map background image */

  mapImage?: string;

  /* Maximum tickets per booking */

  maxSeatsPerBooking: number;

  /* Physical row arrangement */

  rows: EventSeatRow[];

  /* UI notes */

  notes?: string[];
}

/* ==========================================================
   VENUE INFORMATION

   More accurate information can be supplied by
   organizers when events are created.
   ========================================================== */

export interface EventVenueDetails {
  name: string;

  address?: string;
  city?: string;
  country?: string;

  /* Optional actual map coordinates */

  latitude?: number;
  longitude?: number;

  /* Optional organizer-provided venue map */

  mapImage?: string;

  /* Venue instructions */

  entranceInstructions?: string;
  parkingInformation?: string;
  accessibilityInformation?: string;
}

/* ==========================================================
   EXTENDED EVENT INTERFACE

   Extends the existing Event type.

   Existing components using Event will continue
   to work with these records.
   ========================================================== */

export interface EventDetails extends Event {
  /* Additional event information */

  duration?: string;
  ageLimit?: string;
  language?: string;
  eventType?: string;
  organizer?: string;

  tags?: string[];
  interestedCount?: number;

  fullDescription?: string;

  /* ISO date when confirmed */

  dateISO?: string;

  /* Basic event configuration */

  bookingEnabled?: boolean;

  /* Booking mode */

  bookingMode?: EventBookingMode;

  /* Ticket categories */

  ticketTiers?: EventTicketTier[];

  /* Zone selection */

  bookingZones?: EventBookingZone[];

  /* Individual seat selection */

  seatingConfig?: EventSeatingConfig;

  /* Optional structured venue information */

  venueDetails?: EventVenueDetails;

  /* Ticket restrictions */

  minTicketsPerBooking?: number;
  maxTicketsPerBooking?: number;

  /* Whether booking configuration is sample data */

  bookingConfigurationDemo?: boolean;
}

/* ==========================================================
   HELPER — CREATE DEMO SEATING ROW

   This avoids manually defining every seat.

   Example:

   createDemoSeatRow("A", 8, "vip", "front")

   Generates:

   A1, A2, A3, A4, A5, A6, A7, A8

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
      const seatNumber = index + 1;

      const seatLabel =
        `${rowLabel}${seatNumber}`;

      const isUnavailable =
        unavailableSeatNumbers.includes(seatNumber);

      return {
        id: seatLabel,
        row: rowLabel,
        number: seatNumber,
        label: seatLabel,
        ticketTierId,
        zoneId,
        status: isUnavailable
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

   Prices for additional ticket categories are
   examples only.

   The original event.price values are preserved.
   ========================================================== */

/* YUVAN — AREA SELECTION */

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
    benefits: [
      "Front standing area",
    ],
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

/* ==========================================================
   BHARATHANATYAM — INDIVIDUAL SEAT SELECTION

   Example auditorium:

   STAGE

   A1 A2 A3 A4 A5 A6 A7 A8
   B1 B2 B3 B4 B5 B6 B7 B8
   C1 C2 C3 C4 C5 C6 C7 C8
   D1 D2 D3 D4 D5 D6 D7 D8
   E1 E2 E3 E4 E5 E6 E7 E8
   F1 F2 F3 F4 F5 F6 F7 F8

   This is not the actual Colombo Music Hall plan.
   ========================================================== */

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
    createDemoSeatRow(
      "A",
      8,
      "vip",
      "front",
      [3]
    ),

    createDemoSeatRow(
      "B",
      8,
      "vip",
      "front",
      [5]
    ),

    createDemoSeatRow(
      "C",
      8,
      "gold",
      "middle",
      [2, 7]
    ),

    createDemoSeatRow(
      "D",
      8,
      "gold",
      "middle",
      [4]
    ),

    createDemoSeatRow(
      "E",
      8,
      "standard",
      "back",
      [1, 6]
    ),

    createDemoSeatRow(
      "F",
      8,
      "standard",
      "back",
      [8]
    ),
  ],

  notes: [
    "This is a demonstration seating layout.",
    "Unavailable seats are sample data.",
    "Seat availability is not synchronized between customers.",
    "The organizer must provide the actual seat plan before launch.",
  ],
};

/* ==========================================================
   SPORTS — DEMO STADIUM ZONES

   Actual venue layout and match identity require
   organizer verification.
   ========================================================== */

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

/* ==========================================================
   GENERAL ADMISSION CONFIGURATIONS
   ========================================================== */

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
   MAIN EVENTS
   ========================================================== */

export const events: EventDetails[] = [
  /* ========================================================
     EVENT 01 — YUVAN LIVE IN CONCERT
     BOOKING MODE: ZONE
     ======================================================== */

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

    tags: [
      "Concerts",
      "Music Shows",
    ],

    eventType: "Live Concert",

    price: 2500,

    currency: "LKR",

    /* BOOKING */

    bookingEnabled: true,

    bookingMode: "zone",

    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,

    maxTicketsPerBooking: 10,

    ticketTiers: yuvanTicketTiers,

    bookingZones: yuvanBookingZones,

    /* VENUE */

    venueDetails: {
      name: "Jaffna Cultural Centre",
      city: "Jaffna",
      country: "Sri Lanka",
    },
  },

  /* ========================================================
     EVENT 02 — BHARATHANATYAM ARANGETRAM
     BOOKING MODE: SEAT
     ======================================================== */

  {
    id: "2",

    title: "Bharathanatyam Arangetram",

    slug: "bharathanatyam-arangetram",

    description:
      "Experience a beautiful evening of traditional Bharathanatyam.",

    fullDescription:
      "Experience a beautiful evening of traditional Bharathanatyam.",

    image: "/images/events/bharathanatyam.png",

    date: "28 OCT",

    time: "6:30 PM",

    location: "Colombo, Sri Lanka",

    venue: "Colombo Music Hall",

    category: "Cultural",

    tags: [
      "Cultural",
      "Classical Dance",
    ],

    eventType: "Dance Performance",

    price: 1000,

    currency: "LKR",

    /* BOOKING */

    bookingEnabled: true,

    bookingMode: "seat",

    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,

    maxTicketsPerBooking: 10,

    ticketTiers: bharathanatyamTicketTiers,

    seatingConfig: bharathanatyamSeatingConfig,

    /* VENUE */

    venueDetails: {
      name: "Colombo Music Hall",
      city: "Colombo",
      country: "Sri Lanka",
    },
  },

  /* ========================================================
     EVENT 03 — TAMIL STAND-UP COMEDY
     BOOKING MODE: GENERAL
     ======================================================== */

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

    tags: [
      "Comedy",
      "Stand-up",
    ],

    eventType: "Stand-up Comedy",

    price: 1500,

    currency: "LKR",

    /* BOOKING */

    bookingEnabled: true,

    bookingMode: "general",

    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,

    maxTicketsPerBooking: 10,

    ticketTiers: comedyTicketTiers,

    /* VENUE */

    venueDetails: {
      name: "Batticaloa Town Hall",
      city: "Batticaloa",
      country: "Sri Lanka",
    },
  },

  /* ========================================================
     EVENT 04 — JAFFNA KINGS
     BOOKING MODE: ZONE
     ======================================================== */

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

    tags: [
      "Sports",
      "Cricket",
    ],

    eventType: "Cricket Match",

    price: 1500,

    currency: "LKR",

    /* BOOKING */

    bookingEnabled: true,

    bookingMode: "zone",

    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,

    maxTicketsPerBooking: 10,

    ticketTiers: cricketTicketTiers,

    bookingZones: cricketBookingZones,

    /* VENUE */

    venueDetails: {
      name: "Jaffna Stadium",
      city: "Jaffna",
      country: "Sri Lanka",
    },
  },

  /* ========================================================
     EVENT 05 — JAFFNA FOOD FESTIVAL
     BOOKING MODE: GENERAL
     ======================================================== */

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

    tags: [
      "Festivals",
      "Food",
      "Cultural",
    ],

    eventType: "Food Festival",

    price: 1200,

    currency: "LKR",

    featured: true,

    /* BOOKING */

    bookingEnabled: true,

    bookingMode: "general",

    bookingConfigurationDemo: true,

    minTicketsPerBooking: 1,

    maxTicketsPerBooking: 10,

    ticketTiers: foodFestivalTicketTiers,

    /* VENUE */

    venueDetails: {
      name: "Jaffna Public Ground",
      city: "Jaffna",
      country: "Sri Lanka",
    },
  },
];

/* ==========================================================
   EVENT LOOKUP HELPERS
   ========================================================== */

export function getEventBySlug(
  slug: string | undefined
): EventDetails | undefined {
  if (!slug) return undefined;

  return events.find(
    (event) => event.slug === slug
  );
}

export function getEventById(
  id: string
): EventDetails | undefined {
  return events.find(
    (event) => event.id === id
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

  if (!normalized || normalized === "all") {
    return events;
  }

  return events.filter((event) => {
    const categoryMatches =
      event.category.toLowerCase() === normalized;

    const tagMatches =
      event.tags?.some(
        (tag) =>
          tag.toLowerCase() === normalized
      ) ?? false;

    return categoryMatches || tagMatches;
  });
}

/* ==========================================================
   FEATURED EVENTS
   ========================================================== */

export function getFeaturedEvents(): EventDetails[] {
  return events.filter(
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
  const current = getEventBySlug(currentSlug);

  if (!current) return [];

  return events
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

/**
 * Determine how customers select admission.
 *
 * General:
 *   Ticket category + quantity.
 *
 * Zone:
 *   Event area + quantity.
 *
 * Seat:
 *   Individual seats from a seating layout.
 */

export function getEventBookingMode(
  event: EventDetails
): EventBookingMode {
  return event.bookingMode ?? "general";
}

/**
 * Return whether the event has a supported
 * booking configuration.
 *
 * This only validates frontend configuration.
 * It does not prove availability or payment.
 */

export function hasEventBookingConfiguration(
  event: EventDetails
): boolean {
  const mode = getEventBookingMode(event);

  if (event.bookingEnabled === false) {
    return false;
  }

  if (mode === "general") {
    return true;
  }

  if (mode === "zone") {
    return Boolean(
      event.bookingZones &&
      event.bookingZones.length > 0 &&
      event.ticketTiers?.length
    );
  }

  if (mode === "seat") {
    return Boolean(
      event.seatingConfig &&
      event.seatingConfig.rows.length > 0 &&
      event.ticketTiers?.length
    );
  }

  return false;
}

/* ==========================================================
   TICKET CATEGORY HELPERS
   ========================================================== */

/**
 * Get all configured ticket categories.
 *
 * If no categories exist, use the original
 * advertised event price.
 */

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

/**
 * Find a ticket category.
 */

export function getEventTicketTier(
  event: EventDetails,
  tierId: string
): EventTicketTier | undefined {
  return getEventTicketTiers(event).find(
    (tier) => tier.id === tierId
  );
}

/**
 * Get minimum advertised ticket price.
 */

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

  if (availableTiers.length === 0) {
    return event.price;
  }

  return Math.min(
    ...availableTiers.map(
      (tier) => tier.price
    )
  );
}

/**
 * Format currency.
 */

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

/**
 * Get the booking zones for an event.
 */

export function getEventBookingZones(
  event: EventDetails
): EventBookingZone[] {
  if (getEventBookingMode(event) !== "zone") {
    return [];
  }

  return event.bookingZones ?? [];
}

/**
 * Find a single event zone.
 */

export function getEventBookingZone(
  event: EventDetails,
  zoneId: string
): EventBookingZone | undefined {
  return getEventBookingZones(event).find(
    (zone) => zone.id === zoneId
  );
}

/**
 * Find the ticket tier belonging to a zone.
 */

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

/**
 * Get a zone's ticket price.
 */

export function getZoneTicketPrice(
  event: EventDetails,
  zoneId: string
): number | null {
  const zone = getEventBookingZone(
    event,
    zoneId
  );

  if (!zone || zone.available === false) {
    return null;
  }

  const tier = getZoneTicketTier(
    event,
    zoneId
  );

  if (!tier || tier.available === false) {
    return null;
  }

  return tier.price;
}

/* ==========================================================
   INDIVIDUAL SEATING HELPERS
   ========================================================== */

/**
 * Get the seating configuration.
 */

export function getEventSeatingConfig(
  event: EventDetails
): EventSeatingConfig | undefined {
  if (getEventBookingMode(event) !== "seat") {
    return undefined;
  }

  return event.seatingConfig;
}

/**
 * Flatten all seating rows into an array of seats.
 */

export function getEventSeats(
  event: EventDetails
): EventSeat[] {
  const config = getEventSeatingConfig(event);

  if (!config) return [];

  return config.rows.flatMap(
    (row) => row.seats
  );
}

/**
 * Find a seat by its ID.
 *
 * Example:
 * getEventSeat(event, "A1")
 */

export function getEventSeat(
  event: EventDetails,
  seatId: string
): EventSeat | undefined {
  return getEventSeats(event).find(
    (seat) => seat.id === seatId
  );
}

/**
 * Check whether a seat is selectable.
 *
 * Frontend demo check only.
 */

export function isEventSeatAvailable(
  event: EventDetails,
  seatId: string
): boolean {
  const seat = getEventSeat(event, seatId);

  if (!seat || seat.status !== "available") {
    return false;
  }

  const tier = getEventTicketTier(
    event,
    seat.ticketTierId
  );

  return Boolean(
    tier && tier.available !== false
  );
}

/**
 * Find the ticket category for a seat.
 */

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

/**
 * Get the seat's individual price.
 */

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
   MULTIPLE SELECTED SEATS

   Used by the future SeatSelector component.

   Example:
   ["A1", "A2", "A3"]

   The total is calculated from each seat's
   configured ticket category.

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
      error: "This event does not use seat selection.",
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

  const maximum = Math.min(
    event.maxTicketsPerBooking ?? 10,
    config?.maxSeatsPerBooking ?? 10
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
   EVENT VENUE HELPERS
   ========================================================== */

/**
 * Return the event location displayed in the
 * booking information panel.
 */

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

/**
 * Return whether actual venue coordinates
 * have been configured.
 */

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
   END OF EVENT CONFIGURATION
   ========================================================== */
