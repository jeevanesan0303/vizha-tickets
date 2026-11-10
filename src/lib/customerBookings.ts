
import { useSyncExternalStore } from "react";

/* ==========================================================
   VIZHATICKETS — CUSTOMER BOOKING STORAGE

   React + Vite + TypeScript

   FEATURES
   ----------------------------------------------------------
   - General admission bookings
   - Zone / area bookings
   - Individual reserved-seat bookings
   - Customer-specific booking history
   - Multiple tickets under one booking
   - One group QR per booking
   - Backward compatibility with existing demo bookings
   - Reactive booking updates
   - Booking and ticket counts
   - Booking lookup
   - Demo QR payload generation

   IMPORTANT
   ----------------------------------------------------------
   Browser localStorage is used for DEMO purposes only.

   This module does NOT provide:
   - Secure server-side booking ownership
   - Verified payments
   - Real ticket admission
   - Shared inventory
   - Atomic seat reservations

   These require a production backend.
   ========================================================== */

/* ==========================================================
   STORAGE CONFIGURATION
   ========================================================== */

export const BOOKINGS_KEY = "vizha_demo_bookings_v1";

export const BOOKINGS_CHANGE_EVENT =
  "vizha-demo-bookings-changed";

const EMPTY_BOOKINGS = "[]";

/* ==========================================================
   BOOKING TYPES
   ========================================================== */

export type CustomerBookingMode =
  | "general"
  | "zone"
  | "seat";

export type CustomerPaymentMethod = "card";

export type CustomerPaymentStatus = "demo";

export type CustomerBookingStatus =
  | "demo-confirmed";

export type CustomerTicketStatus = "demo";

/* ==========================================================
   ATTENDEE
   ========================================================== */

export interface BookingAttendee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/* ==========================================================
   INDIVIDUAL TICKET

   A booking can contain multiple ticket records.

   Example:
   One booking with 10 tickets will have:
   - One booking reference
   - Ten individual ticket references
   - One group QR code

   ========================================================== */

export interface CustomerTicket {
  id: string;

  reference: string;

  status: CustomerTicketStatus;

  /* New fields for reserved-seat bookings */

  seatId?: string;

  /* Ticket category associated with this ticket */

  tierId?: string;
}

/* ==========================================================
   SELECTED SEAT

   Stores seating information at the time of
   booking confirmation.

   Example:

   {
     id: "A1",
     row: "A",
     label: "A1",
     tierId: "vip",
     tierName: "Front Row Seating",
     price: 3000
   }

   ========================================================== */

export interface CustomerBookingSeat {
  id: string;

  row: string;

  label: string;

  tierId: string;

  tierName: string;

  price: number;
}

/* ==========================================================
   COMPLETE CUSTOMER BOOKING

   Preserves the existing structure and adds the
   new booking-mode fields as optional properties.

   Optional fields allow older stored bookings
   to continue working without migration.
   ========================================================== */

export interface CustomerBooking {
  /* Booking identity */

  id: string;

  reference: string;

  /* Customer ownership */

  customerId: string;

  customerEmail: string;

  /* Event information */

  eventSlug: string;

  eventTitle: string;

  eventImage: string;

  eventDate: string;

  eventTime: string;

  eventVenue: string;

  /* Ticket category */

  ticketType: string;

  ticketTypeLabel: string;

  /* Total number of tickets */

  quantity: number;

  /* Pricing */

  currency: string;

  unitPrice: number;

  subtotal: number;

  serviceFee: number;

  total: number;

  /* Customer contact information */

  attendee: BookingAttendee;

  /* Demo payment */

  paymentMethod: string;

  paymentStatus: CustomerPaymentStatus;

  /* Booking status */

  bookingStatus: CustomerBookingStatus;

  /* Individual tickets */

  tickets: CustomerTicket[];

  /* Booking date */

  createdAt: string;

  /* Event policy acknowledgment */

  policyVersion?: string;

  policyAcknowledgedAt?: string;

  /* ======================================================
     NEW — BOOKING CONFIGURATION
     ====================================================== */

  bookingMode?: CustomerBookingMode;

  /* ======================================================
     ZONE / AREA SELECTION

     Example:
     zoneId: "vip-front"
     zoneName: "VIP — Front Area"
     ====================================================== */

  zoneId?: string;

  zoneName?: string;

  /* ======================================================
     INDIVIDUAL SEAT SELECTION

     Example:
     selectedSeatIds: ["A1", "A2", "B3"]

     selectedSeats contains the seat category,
     row, reference and ticket price.
     ====================================================== */

  selectedSeatIds?: string[];

  selectedSeats?: CustomerBookingSeat[];
}

/* ==========================================================
   BOOKING + TICKET RELATIONSHIP

   Useful for My Tickets.

   Each individual ticket can be associated with
   its parent booking.

   ========================================================== */

export interface CustomerTicketWithBooking
  extends CustomerTicket {
  booking: CustomerBooking;
}

/* ==========================================================
   VALIDATION HELPERS
   ========================================================== */

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isNonEmptyString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function isFiniteNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

/* ==========================================================
   ATTENDEE VALIDATION
   ========================================================== */

function isValidAttendee(
  value: unknown
): value is BookingAttendee {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.firstName === "string" &&
    typeof value.lastName === "string" &&
    typeof value.email === "string" &&
    typeof value.phone === "string"
  );
}

/* ==========================================================
   TICKET VALIDATION
   ========================================================== */

function isValidTicket(
  value: unknown
): value is CustomerTicket {
  if (!isObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.reference) &&
    value.status === "demo" &&
    (
      value.seatId === undefined ||
      typeof value.seatId === "string"
    ) &&
    (
      value.tierId === undefined ||
      typeof value.tierId === "string"
    )
  );
}

/* ==========================================================
   SELECTED SEAT VALIDATION
   ========================================================== */

function isValidBookingSeat(
  value: unknown
): value is CustomerBookingSeat {
  if (!isObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.row) &&
    isNonEmptyString(value.label) &&
    isNonEmptyString(value.tierId) &&
    isNonEmptyString(value.tierName) &&
    isFiniteNumber(value.price) &&
    value.price >= 0
  );
}

/* ==========================================================
   COMPLETE BOOKING VALIDATION

   Older bookings may not contain bookingMode.

   This is allowed for backward compatibility.

   ========================================================== */

function isValidBooking(
  value: unknown
): value is CustomerBooking {
  if (!isObject(value)) {
    return false;
  }

  /* Booking identity */

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.reference)
  ) {
    return false;
  }

  /* Customer */

  if (
    !isNonEmptyString(value.customerId) ||
    typeof value.customerEmail !== "string"
  ) {
    return false;
  }

  /* Event */

  if (
    !isNonEmptyString(value.eventSlug) ||
    !isNonEmptyString(value.eventTitle) ||
    typeof value.eventImage !== "string" ||
    typeof value.eventDate !== "string" ||
    typeof value.eventTime !== "string" ||
    typeof value.eventVenue !== "string"
  ) {
    return false;
  }

  /* Ticket category */

  if (
    typeof value.ticketType !== "string" ||
    typeof value.ticketTypeLabel !== "string"
  ) {
    return false;
  }

  /* Quantity */

  if (
    !Number.isInteger(value.quantity) ||
    (value.quantity as number) < 1
  ) {
    return false;
  }

  /* Pricing */

  if (
    typeof value.currency !== "string" ||
    !isFiniteNumber(value.unitPrice) ||
    !isFiniteNumber(value.subtotal) ||
    !isFiniteNumber(value.serviceFee) ||
    !isFiniteNumber(value.total)
  ) {
    return false;
  }

  /* Attendee */

  if (!isValidAttendee(value.attendee)) {
    return false;
  }

  /* Payment status */

  if (
    typeof value.paymentMethod !== "string" ||
    value.paymentStatus !== "demo" ||
    value.bookingStatus !== "demo-confirmed"
  ) {
    return false;
  }

  /* Ticket records */

  if (
    !Array.isArray(value.tickets) ||
    !value.tickets.every(isValidTicket)
  ) {
    return false;
  }

  /* Date */

  if (typeof value.createdAt !== "string") {
    return false;
  }

  /* Optional booking mode */

  if (
    value.bookingMode !== undefined &&
    value.bookingMode !== "general" &&
    value.bookingMode !== "zone" &&
    value.bookingMode !== "seat"
  ) {
    return false;
  }

  /* Optional zone */

  if (
    value.zoneId !== undefined &&
    typeof value.zoneId !== "string"
  ) {
    return false;
  }

  if (
    value.zoneName !== undefined &&
    typeof value.zoneName !== "string"
  ) {
    return false;
  }

  /* Optional selected seat IDs */

  if (
    value.selectedSeatIds !== undefined &&
    (
      !Array.isArray(value.selectedSeatIds) ||
      !value.selectedSeatIds.every(
        (id) => typeof id === "string"
      )
    )
  ) {
    return false;
  }

  /* Optional structured seats */

  if (
    value.selectedSeats !== undefined &&
    (
      !Array.isArray(value.selectedSeats) ||
      !value.selectedSeats.every(
        isValidBookingSeat
      )
    )
  ) {
    return false;
  }

  return true;
}

/* ==========================================================
   PARSE CUSTOMER BOOKINGS

   Invalid records are skipped.

   We do not remove or overwrite existing storage
   while reading it.

   ========================================================== */

export function parseCustomerBookings(
  raw: string
): CustomerBooking[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidBooking);
  } catch {
    return [];
  }
}

/* ==========================================================
   READ LOCAL STORAGE

   Important for React useSyncExternalStore:

   The snapshot is a primitive string, so React
   receives a stable value until storage changes.

   ========================================================== */

function getSnapshot(): string {
  if (typeof window === "undefined") {
    return EMPTY_BOOKINGS;
  }

  try {
    return (
      window.localStorage.getItem(BOOKINGS_KEY) ??
      EMPTY_BOOKINGS
    );
  } catch {
    return EMPTY_BOOKINGS;
  }
}

/* ==========================================================
   SERVER SNAPSHOT

   Used for SSR compatibility.
   ========================================================== */

function getServerSnapshot(): string {
  return EMPTY_BOOKINGS;
}

/* ==========================================================
   SUBSCRIBE TO BOOKING CHANGES
   ========================================================== */

function subscribe(
  callback: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleBookingChange = () => {
    callback();
  };

  const handleStorageChange = (
    event: StorageEvent
  ) => {
    if (
      event.key === BOOKINGS_KEY ||
      event.key === null
    ) {
      callback();
    }
  };

  window.addEventListener(
    BOOKINGS_CHANGE_EVENT,
    handleBookingChange
  );

  window.addEventListener(
    "storage",
    handleStorageChange
  );

  return () => {
    window.removeEventListener(
      BOOKINGS_CHANGE_EVENT,
      handleBookingChange
    );

    window.removeEventListener(
      "storage",
      handleStorageChange
    );
  };
}

/* ==========================================================
   NOTIFY COMPONENTS

   Call this after updating BOOKINGS_KEY.

   The storage event does not fire in the same tab
   that performed the localStorage write.

   ========================================================== */

export function notifyCustomerBookingsChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(BOOKINGS_CHANGE_EVENT)
  );
}

/* ==========================================================
   GET ALL DEMO BOOKINGS

   This helper is intended for internal demo storage
   operations. It does not enforce server authorization.

   ========================================================== */

export function getAllDemoBookings(): CustomerBooking[] {
  return parseCustomerBookings(
    getSnapshot()
  ).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}

/* ==========================================================
   GET BOOKINGS FOR ONE CUSTOMER

   Bookings are filtered by customerId.

   This is browser-only display filtering, not
   secure access control.

   ========================================================== */

export function getCustomerBookings(
  customerId: string | undefined
): CustomerBooking[] {
  if (!customerId) {
    return [];
  }

  return getAllDemoBookings().filter(
    (booking) =>
      booking.customerId === customerId
  );
}

/* ==========================================================
   GET BOOKING BY REFERENCE

   A booking is returned only when its customerId
   matches the supplied customerId.

   ========================================================== */

export function getCustomerBookingByReference(
  customerId: string | undefined,
  bookingReference: string
): CustomerBooking | null {
  if (!customerId || !bookingReference) {
    return null;
  }

  return (
    getCustomerBookings(customerId).find(
      (booking) =>
        booking.reference === bookingReference
    ) ?? null
  );
}

/* ==========================================================
   GET ONE CUSTOMER'S TICKETS
   ========================================================== */

export function getCustomerTickets(
  customerId: string | undefined
): CustomerTicketWithBooking[] {
  const bookings = getCustomerBookings(customerId);

  return bookings.flatMap(
    (booking) =>
      booking.tickets.map(
        (ticket) => ({
          ...ticket,
          booking,
        })
      )
  );
}

/* ==========================================================
   CUSTOMER BOOKINGS HOOK

   Reactively updates:

   - Customer Dashboard
   - My Tickets
   - My Bookings
   - Booking Success

   ========================================================== */

export function useCustomerBookings(
  customerId: string | undefined
) {
  const raw = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const bookings = parseCustomerBookings(raw)
    .filter(
      (booking) =>
        Boolean(customerId) &&
        booking.customerId === customerId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

  const tickets: CustomerTicketWithBooking[] =
    bookings.flatMap((booking) =>
      booking.tickets.map(
        (ticket) => ({
          ...ticket,
          booking,
        })
      )
    );

  return {
    bookings,

    tickets,

    totalBookings: bookings.length,

    totalTickets: tickets.length,

    /* One group QR for each booking */

    totalGroupQRCodes: bookings.length,
  };
}

/* ==========================================================
   FORMAT BOOKING MONEY
   ========================================================== */

export function formatBookingMoney(
  currency: string,
  value: number
): string {
  return `${currency} ${value.toLocaleString(
    "en-LK",
    {
      maximumFractionDigits: 2,
    }
  )}`;
}

/* ==========================================================
   RESOLVE BOOKING MODE

   Older bookings without bookingMode default
   to general admission unless seat/zone
   data indicates otherwise.

   ========================================================== */

export function getCustomerBookingMode(
  booking: CustomerBooking
): CustomerBookingMode {
  if (
    booking.bookingMode === "general" ||
    booking.bookingMode === "zone" ||
    booking.bookingMode === "seat"
  ) {
    return booking.bookingMode;
  }

  if (
    booking.selectedSeatIds?.length ||
    booking.selectedSeats?.length ||
    booking.tickets.some(
      (ticket) => Boolean(ticket.seatId)
    )
  ) {
    return "seat";
  }

  if (
    booking.zoneId ||
    booking.zoneName
  ) {
    return "zone";
  }

  return "general";
}

/* ==========================================================
   GET SELECTED SEAT IDS

   Prefer structured booking data.

   Fall back to individual ticket seat IDs.

   ========================================================== */

export function getBookingSelectedSeatIds(
  booking: CustomerBooking
): string[] {
  if (booking.selectedSeats?.length) {
    return booking.selectedSeats.map(
      (seat) => seat.id
    );
  }

  if (booking.selectedSeatIds?.length) {
    return booking.selectedSeatIds;
  }

  return booking.tickets
    .map((ticket) => ticket.seatId)
    .filter(
      (seatId): seatId is string =>
        typeof seatId === "string" &&
        seatId.length > 0
    );
}

/* ==========================================================
   GET SELECTED SEAT LABELS
   ========================================================== */

export function getBookingSelectedSeatLabels(
  booking: CustomerBooking
): string[] {
  if (booking.selectedSeats?.length) {
    return booking.selectedSeats.map(
      (seat) => seat.label || seat.id
    );
  }

  return getBookingSelectedSeatIds(
    booking
  );
}

/* ==========================================================
   GET BOOKING AREA LABEL
   ========================================================== */

export function getBookingAreaLabel(
  booking: CustomerBooking
): string | null {
  if (getCustomerBookingMode(booking) !== "zone") {
    return null;
  }

  return (
    booking.zoneName ||
    booking.zoneId ||
    booking.ticketTypeLabel
  );
}

/* ==========================================================
   BUILD GROUP BOOKING QR PAYLOAD

   ONE QR = ONE COMPLETE BOOKING

   The QR contains:
   - Demo-only status
   - Booking reference
   - Event information
   - Ticket quantity
   - Ticket category
   - Selected area or seats
   - Individual ticket references

   No personal contact details or sensitive
   card information are embedded.

   IMPORTANT:
   This is a readable DEMO payload.
   It must not be used for real admission.

   ========================================================== */

export interface DemoGroupQRPayload {
  type: "VIZHATICKETS_DEMO_GROUP_BOOKING";

  status: "NOT_VALID_FOR_ENTRY";

  bookingReference: string;

  eventSlug: string;

  eventTitle: string;

  eventDate: string;

  eventTime: string;

  eventVenue: string;

  bookingMode: CustomerBookingMode;

  quantity: number;

  ticketCategory: string;

  zoneName?: string;

  selectedSeats?: string[];

  tickets: Array<{
    reference: string;
    seatId?: string;
    tierId?: string;
  }>;
}

export function getDemoGroupQRPayload(
  booking: CustomerBooking
): DemoGroupQRPayload {
  const bookingMode =
    getCustomerBookingMode(booking);

  const seatIds =
    getBookingSelectedSeatIds(booking);

  const tickets = booking.tickets.map(
    (ticket, index) => {
      const seatId =
        ticket.seatId ||
        (
          bookingMode === "seat"
            ? seatIds[index]
            : undefined
        );

      return {
        reference: ticket.reference,

        ...(seatId
          ? { seatId }
          : {}),

        ...(ticket.tierId
          ? { tierId: ticket.tierId }
          : {}),
      };
    }
  );

  return {
    type: "VIZHATICKETS_DEMO_GROUP_BOOKING",

    status: "NOT_VALID_FOR_ENTRY",

    bookingReference: booking.reference,

    eventSlug: booking.eventSlug,

    eventTitle: booking.eventTitle,

    eventDate: booking.eventDate,

    eventTime: booking.eventTime,

    eventVenue: booking.eventVenue,

    bookingMode,

    quantity: booking.quantity,

    ticketCategory: booking.ticketTypeLabel,

    ...(bookingMode === "zone"
      ? {
          zoneName:
            getBookingAreaLabel(booking) ??
            booking.ticketTypeLabel,
        }
      : {}),

    ...(bookingMode === "seat"
      ? {
          selectedSeats:
            getBookingSelectedSeatLabels(booking),
        }
      : {}),

    tickets,
  };
}

/* ==========================================================
   GROUP QR STRING

   Can be passed directly to QRCodeSVG.

   Example:

   <QRCodeSVG
     value={getDemoGroupQRValue(booking)}
   />

   ========================================================== */

export function getDemoGroupQRValue(
  booking: CustomerBooking
): string {
  return JSON.stringify(
    getDemoGroupQRPayload(booking)
  );
}

/* ==========================================================
   LEGACY INDIVIDUAL TICKET QR

   Kept for compatibility with any older
   component importing this function.

   New group bookings should use:

   getDemoGroupQRPayload()
   getDemoGroupQRValue()

   ========================================================== */

export function getDemoTicketQRPayload(
  booking: CustomerBooking,
  ticket: CustomerTicket
) {
  return JSON.stringify({
    type: "VIZHATICKETS_DEMO_TICKET",

    bookingReference: booking.reference,

    ticketReference: ticket.reference,

    bookingMode:
      getCustomerBookingMode(booking),

    ...(ticket.seatId
      ? {
          seatId: ticket.seatId,
        }
      : {}),

    status: "NOT_VALID_FOR_ENTRY",
  });
}

/* ==========================================================
   END — CUSTOMER BOOKINGS MODULE
   ========================================================== */
