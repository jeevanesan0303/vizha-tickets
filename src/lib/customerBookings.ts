
import {
  useMemo,
  useSyncExternalStore,
} from "react";

/* ==========================================================
   VIZHATICKETS — CUSTOMER BOOKING DATA SYSTEM

   React + Vite + TypeScript

   Supports:
   - General admission tickets
   - Custom ticket tiers (VIP, VVIP, Gold, etc.)
   - Zone and stadium bookings
   - Reserved numbered seating
   - Customer booking history
   - One QR payload per booking
   - Multiple tickets within one booking
   - Browser-local demo seat tracking
   - Event-based demo reporting
   - Category-wise demo ticket analysis
   - Backward compatibility
   - Reactively updated customer dashboards

   IMPORTANT:
   This is a DEVELOPMENT-ONLY booking data store.

   Browser localStorage does not prove payment.

   Real paid bookings, inventory, admission QR codes,
   financial settlements and admin authorization
   require a trusted backend.
   ========================================================== */

/* ==========================================================
   STORAGE
   ========================================================== */

export const BOOKINGS_KEY =
  "vizha_demo_bookings_v1";

export const BOOKINGS_CHANGE_EVENT =
  "vizha-demo-bookings-changed";

const EMPTY_BOOKINGS = "[]";

/* ==========================================================
   TYPES
   ========================================================== */

export type CustomerBookingMode =
  | "general"
  | "zone"
  | "seat";

export type CustomerPaymentMethod = "card";

export type CustomerPaymentStatus = "demo";

export type CustomerBookingStatus =
  "demo-confirmed";

export type CustomerTicketStatus = "demo";

/* ==========================================================
   ATTENDEE DETAILS
   ========================================================== */

export interface BookingAttendee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/* ==========================================================
   INDIVIDUAL TICKET

   Every ticket has its own reference.

   A separate QR code is NOT created for each ticket.

   One parent booking carries one group QR.
   ========================================================== */

export interface CustomerTicket {
  id: string;
  reference: string;
  status: CustomerTicketStatus;

  seatId?: string;
  tierId?: string;

  /* Optional future ticket allocation metadata */

  tierName?: string;
  unitPrice?: number;
}

/* ==========================================================
   RESERVED SEAT
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
   TICKET CATEGORY ALLOCATION

   Used for accurate category-wise reporting.

   One booking may eventually contain:

   VIP:
     2 tickets

   Gold:
     3 tickets

   Each category retains its own unit price.

   NOTE:
   The current checkout normally selects one general
   category per booking. Reserved seating may include
   multiple categories.
   ========================================================== */

export interface CustomerBookingTicketLine {
  tierId: string;
  tierName: string;

  quantity: number;
  unitPrice: number;
  subtotal: number;

  zoneId?: string;
  zoneName?: string;

  seatIds?: string[];
}

/* ==========================================================
   COMPLETE BOOKING RECORD

   Required legacy fields are preserved.

   New fields are optional so previously saved bookings
   continue to work.
   ========================================================== */

export interface CustomerBooking {
  /* Booking identity */

  id: string;
  reference: string;

  /* Customer identity */

  customerId: string;
  customerEmail: string;

  /* Event identity */

  eventSlug: string;

  /*
   * Optional stable admin event ID.
   * Prefer this ID for future reporting.
   */

  eventId?: string;
  adminEventId?: string;

  /* Event snapshot */

  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;

  /* Legacy ticket category */

  ticketType: string;
  ticketTypeLabel: string;

  /* Total tickets */

  quantity: number;

  /* Financial snapshot */

  currency: string;
  unitPrice: number;
  subtotal: number;
  serviceFee: number;
  total: number;

  /* Attendee */

  attendee: BookingAttendee;

  /* Demo payment */

  paymentMethod: CustomerPaymentMethod;
  paymentStatus: CustomerPaymentStatus;

  /* Demo booking status */

  bookingStatus: CustomerBookingStatus;

  /* Individual tickets */

  tickets: CustomerTicket[];

  /* Date */

  createdAt: string;

  /* Policy acknowledgement */

  policyVersion?: string;
  policyAcknowledgedAt?: string;

  /* Booking mode */

  bookingMode?: CustomerBookingMode;

  /* Zone selection */

  zoneId?: string;
  zoneName?: string;

  /* Reserved seat selection */

  selectedSeatIds?: string[];
  selectedSeats?: CustomerBookingSeat[];

  /* Optional category-level snapshot */

  ticketLines?: CustomerBookingTicketLine[];
}

/* ==========================================================
   TICKET WITH PARENT BOOKING
   ========================================================== */

export interface CustomerTicketWithBooking
  extends CustomerTicket {
  booking: CustomerBooking;
}

/* ==========================================================
   REPORTING TYPES

   These represent DEMONSTRATION values only.

   Never treat them as collected cash or verified
   financial obligations.
   ========================================================== */

export interface DemoTicketTierReport {
  tierId: string;
  tierName: string;

  quantity: number;
  revenue: number;

  currency: string;
}

export interface DemoEventBookingReport {
  eventId: string;
  eventSlug: string;

  eventTitle: string;
  currency: string | null;

  totalBookings: number;
  totalTickets: number;

  demoTicketSubtotal: number;
  demoServiceFees: number;
  demoOrderTotal: number;

  ticketTiers: DemoTicketTierReport[];

  hasCompleteTierAllocation: boolean;

  paymentVerified: false;
  financialStatus: "DEMO_ONLY";

  verifiedGrossRevenue: null;
  verifiedCommission: null;
  verifiedOrganizerPayable: null;
  verifiedSettlementPaid: null;
}

/* ==========================================================
   GENERIC VALIDATION HELPERS
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

function isNonNegativeNumber(
  value: unknown
): value is number {
  return (
    isFiniteNumber(value) &&
    value >= 0
  );
}

function isPositiveInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

function optionalString(
  value: unknown
): boolean {
  return (
    value === undefined ||
    typeof value === "string"
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
    optionalString(value.seatId) &&
    optionalString(value.tierId) &&
    optionalString(value.tierName) &&
    (
      value.unitPrice === undefined ||
      isNonNegativeNumber(value.unitPrice)
    )
  );
}

/* ==========================================================
   RESERVED SEAT VALIDATION
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
    isNonNegativeNumber(value.price)
  );
}

/* ==========================================================
   TICKET ALLOCATION VALIDATION
   ========================================================== */

function isValidTicketLine(
  value: unknown
): value is CustomerBookingTicketLine {
  if (!isObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.tierId) &&
    isNonEmptyString(value.tierName) &&
    isPositiveInteger(value.quantity) &&
    isNonNegativeNumber(value.unitPrice) &&
    isNonNegativeNumber(value.subtotal) &&
    optionalString(value.zoneId) &&
    optionalString(value.zoneName) &&
    (
      value.seatIds === undefined ||
      (
        Array.isArray(value.seatIds) &&
        value.seatIds.every(
          (item) => typeof item === "string"
        )
      )
    )
  );
}

/* ==========================================================
   COMPLETE BOOKING VALIDATION

   Supports older records which do not contain:

   - eventId
   - adminEventId
   - ticketLines
   - bookingMode
   - selectedSeats

   Only recognized demo bookings are accepted.

   This intentionally does not recognize frontend
   claims of real paid transactions.
   ========================================================== */

export function isValidCustomerBooking(
  value: unknown
): value is CustomerBooking {
  if (!isObject(value)) {
    return false;
  }

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.reference)
  ) {
    return false;
  }

  if (
    !isNonEmptyString(value.customerId) ||
    typeof value.customerEmail !== "string"
  ) {
    return false;
  }

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

  if (
    !optionalString(value.eventId) ||
    !optionalString(value.adminEventId)
  ) {
    return false;
  }

  if (
    typeof value.ticketType !== "string" ||
    typeof value.ticketTypeLabel !== "string"
  ) {
    return false;
  }

  if (!isPositiveInteger(value.quantity)) {
    return false;
  }

  if (
    !isNonEmptyString(value.currency) ||
    !isNonNegativeNumber(value.unitPrice) ||
    !isNonNegativeNumber(value.subtotal) ||
    !isNonNegativeNumber(value.serviceFee) ||
    !isNonNegativeNumber(value.total)
  ) {
    return false;
  }

  if (!isValidAttendee(value.attendee)) {
    return false;
  }

  if (
    value.paymentMethod !== "card" ||
    value.paymentStatus !== "demo" ||
    value.bookingStatus !== "demo-confirmed"
  ) {
    return false;
  }

  if (
    !Array.isArray(value.tickets) ||
    !value.tickets.every(isValidTicket)
  ) {
    return false;
  }

  if (!isNonEmptyString(value.createdAt)) {
    return false;
  }

  if (
    !optionalString(value.policyVersion) ||
    !optionalString(value.policyAcknowledgedAt)
  ) {
    return false;
  }

  if (
    value.bookingMode !== undefined &&
    value.bookingMode !== "general" &&
    value.bookingMode !== "zone" &&
    value.bookingMode !== "seat"
  ) {
    return false;
  }

  if (
    !optionalString(value.zoneId) ||
    !optionalString(value.zoneName)
  ) {
    return false;
  }

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

  if (
    value.ticketLines !== undefined &&
    (
      !Array.isArray(value.ticketLines) ||
      !value.ticketLines.every(isValidTicketLine)
    )
  ) {
    return false;
  }

  return true;
}

/* ==========================================================
   PARSE BOOKINGS

   Invalid records are ignored without modifying
   or deleting the original saved browser data.
   ========================================================== */

export function parseCustomerBookings(
  raw: string
): CustomerBooking[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidCustomerBooking);
  } catch {
    return [];
  }
}

/* ==========================================================
   BROWSER STORAGE SNAPSHOT
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

function getServerSnapshot(): string {
  return EMPTY_BOOKINGS;
}

/* ==========================================================
   REACTIVE BOOKING SUBSCRIPTION

   Same browser:
   BOOKING_CHANGE_EVENT

   Other tabs, same origin:
   storage event
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
   NOTIFY CUSTOMER BOOKING CHANGES

   Call after updating BOOKINGS_KEY.
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
   READ ALL DEMO BOOKINGS

   No real payment records are returned here.
   ========================================================== */

export function getAllDemoBookings(): CustomerBooking[] {
  return parseCustomerBookings(getSnapshot()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );
}

/* ==========================================================
   FILTER BOOKINGS BY CUSTOMER

   Browser-local filtering, not server authorization.
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
   FIND BOOKING BY REFERENCE
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
   FIND ALL TICKETS FOR A CUSTOMER
   ========================================================== */

export function getCustomerTickets(
  customerId: string | undefined
): CustomerTicketWithBooking[] {
  const bookings = getCustomerBookings(customerId);

  return bookings.flatMap((booking) =>
    booking.tickets.map((ticket) => ({
      ...ticket,
      booking,
    }))
  );
}

/* ==========================================================
   CUSTOMER BOOKINGS HOOK

   Used by:
   - Dashboard
   - My Tickets
   - My Bookings
   - Booking Success

   One group QR per parent booking.
   ========================================================== */

export function useCustomerBookings(
  customerId: string | undefined
) {
  const raw = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return useMemo(() => {
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
        booking.tickets.map((ticket) => ({
          ...ticket,
          booking,
        }))
      );

    return {
      bookings,
      tickets,

      totalBookings: bookings.length,
      totalTickets: tickets.length,

      totalGroupQRCodes: bookings.length,
    };
  }, [raw, customerId]);
}

/* ==========================================================
   BOOKING MONEY FORMAT
   ========================================================== */

export function formatBookingMoney(
  currency: string,
  value: number
): string {
  return `${currency} ${value.toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  })}`;
}

/* ==========================================================
   GET BOOKING MODE

   Backward compatible with older records.
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

  if (booking.zoneId || booking.zoneName) {
    return "zone";
  }

  return "general";
}

/* ==========================================================
   GET SELECTED SEAT IDS
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

  return getBookingSelectedSeatIds(booking);
}

/* ==========================================================
   GET BOOKING AREA NAME
   ========================================================== */

export function getBookingAreaLabel(
  booking: CustomerBooking
): string | null {
  if (
    getCustomerBookingMode(booking) !== "zone"
  ) {
    return null;
  }

  return (
    booking.zoneName ||
    booking.zoneId ||
    booking.ticketTypeLabel
  );
}

/* ==========================================================
   DERIVE TICKET CATEGORY ALLOCATIONS

   Priority:

   1. Explicit ticketLines on the booking.
   2. Reserved seats with tier IDs and prices.
   3. Individual tickets with tier IDs and prices.
   4. Legacy one-category booking.

   The fallback is marked incomplete when category
   identity is missing or cannot be established.

   All amounts remain DEMO values.
   ========================================================== */

export interface ResolvedTicketAllocations {
  lines: CustomerBookingTicketLine[];

  complete: boolean;

  source:
    | "explicit"
    | "reserved-seats"
    | "tickets"
    | "legacy"
    | "unavailable";
}

export function resolveBookingTicketAllocations(
  booking: CustomerBooking
): ResolvedTicketAllocations {
  /* Explicit allocations */

  if (booking.ticketLines?.length) {
    const quantity = booking.ticketLines.reduce(
      (sum, line) => sum + line.quantity,
      0
    );

    const lineSubtotal = booking.ticketLines.reduce(
      (sum, line) => sum + line.subtotal,
      0
    );

    const accurate =
      quantity === booking.quantity &&
      Math.abs(lineSubtotal - booking.subtotal) < 0.011;

    return {
      lines: booking.ticketLines,
      complete: accurate,
      source: "explicit",
    };
  }

  /* Reserved seating */

  if (
    getCustomerBookingMode(booking) === "seat" &&
    booking.selectedSeats?.length
  ) {
    const grouped = new Map<
      string,
      CustomerBookingTicketLine
    >();

    for (const seat of booking.selectedSeats) {
      const existing = grouped.get(seat.tierId);

      if (existing) {
        existing.quantity += 1;
        existing.subtotal += seat.price;
        existing.seatIds = [
          ...(existing.seatIds ?? []),
          seat.id,
        ];
      } else {
        grouped.set(seat.tierId, {
          tierId: seat.tierId,
          tierName: seat.tierName,
          quantity: 1,
          unitPrice: seat.price,
          subtotal: seat.price,
          seatIds: [seat.id],
        });
      }
    }

    const lines = Array.from(grouped.values());

    const calculatedTotal = lines.reduce(
      (sum, line) => sum + line.subtotal,
      0
    );

    return {
      lines,
      complete:
        booking.selectedSeats.length ===
          booking.quantity &&
        Math.abs(
          calculatedTotal - booking.subtotal
        ) < 0.011,
      source: "reserved-seats",
    };
  }

  /* Individual tickets */

  if (
    booking.tickets.length === booking.quantity &&
    booking.tickets.length > 0 &&
    booking.tickets.every(
      (ticket) => isNonEmptyString(ticket.tierId)
    )
  ) {
    const grouped = new Map<
      string,
      CustomerBookingTicketLine
    >();

    const tierPricesKnown =
      booking.tickets.every(
        (ticket) =>
          ticket.unitPrice === undefined ||
          isNonNegativeNumber(ticket.unitPrice)
      );

    for (const ticket of booking.tickets) {
      const tierId = ticket.tierId!;

      const price =
        ticket.unitPrice ??
        booking.unitPrice;

      const existing = grouped.get(tierId);

      if (existing) {
        existing.quantity += 1;
        existing.subtotal += price;
      } else {
        grouped.set(tierId, {
          tierId,
          tierName:
            ticket.tierName ||
            booking.ticketTypeLabel ||
            tierId,

          quantity: 1,
          unitPrice: price,
          subtotal: price,

          ...(booking.zoneId
            ? {
                zoneId: booking.zoneId,
                zoneName: booking.zoneName,
              }
            : {}),
        });
      }
    }

    const lines = Array.from(grouped.values());

    const calculatedSubtotal = lines.reduce(
      (sum, line) => sum + line.subtotal,
      0
    );

    const consistentPrices =
      lines.every(
        (line) =>
          Math.abs(
            line.subtotal -
              line.unitPrice * line.quantity
          ) < 0.011
      );

    return {
      lines,
      complete:
        tierPricesKnown &&
        consistentPrices &&
        Math.abs(
          calculatedSubtotal - booking.subtotal
        ) < 0.011,
      source: "tickets",
    };
  }

  /* Legacy general admission record */

  if (
    getCustomerBookingMode(booking) === "general" &&
    isNonEmptyString(booking.ticketTypeLabel)
  ) {
    const tierId =
      booking.tickets.find(
        (ticket) => isNonEmptyString(ticket.tierId)
      )?.tierId;

    if (tierId) {
      const expected =
        booking.unitPrice * booking.quantity;

      return {
        lines: [
          {
            tierId,
            tierName: booking.ticketTypeLabel,
            quantity: booking.quantity,
            unitPrice: booking.unitPrice,
            subtotal: booking.subtotal,
          },
        ],
        complete:
          Math.abs(expected - booking.subtotal) <
          0.011,
        source: "legacy",
      };
    }
  }

  return {
    lines: [],
    complete: false,
    source: "unavailable",
  };
}

/* ==========================================================
   GET DEMO BOOKINGS BY EVENT

   Match by stable event ID when present, or by slug
   for compatibility with existing customer records.

   The caller should provide the admin ID and slug.
   ========================================================== */

export function getDemoBookingsByEvent(
  eventId: string,
  eventSlug?: string
): CustomerBooking[] {
  if (!eventId && !eventSlug) {
    return [];
  }

  return getAllDemoBookings().filter((booking) => {
    if (
      eventId &&
      (
        booking.eventId === eventId ||
        booking.adminEventId === eventId
      )
    ) {
      return true;
    }

    return Boolean(
      eventSlug &&
      booking.eventSlug === eventSlug
    );
  });
}

/* ==========================================================
   BUILD DEMO EVENT REPORT

   The report deliberately does not invent:

   - Gateway payment confirmation
   - Actual money collected
   - Platform profit
   - Organizer payout
   - Settlement balance

   These values require authoritative backend records.
   ========================================================== */

function buildDemoEventReport(
  bookings: CustomerBooking[],
  eventId: string,
  eventSlug: string,
  expectedCurrency?: string
): DemoEventBookingReport {
  const matching = bookings.filter((booking) => {
    return (
      (
        Boolean(eventId) &&
        (
          booking.eventId === eventId ||
          booking.adminEventId === eventId
        )
      ) ||
      (
        Boolean(eventSlug) &&
        booking.eventSlug === eventSlug
      )
    );
  });

  const currencies = [
    ...new Set(
      matching.map((booking) => booking.currency)
    ),
  ];

  const currency =
    expectedCurrency ||
    (
      currencies.length === 1
        ? currencies[0]
        : null
    );

  /*
   * Different currencies must never be combined
   * into one financial amount.
   */

  const consistentCurrency =
    currency !== null &&
    matching.every(
      (booking) => booking.currency === currency
    );

  const totalTickets = matching.reduce(
    (sum, booking) => sum + booking.quantity,
    0
  );

  const demoTicketSubtotal =
    consistentCurrency
      ? matching.reduce(
          (sum, booking) =>
            sum + booking.subtotal,
          0
        )
      : 0;

  const demoServiceFees =
    consistentCurrency
      ? matching.reduce(
          (sum, booking) =>
            sum + booking.serviceFee,
          0
        )
      : 0;

  const demoOrderTotal =
    consistentCurrency
      ? matching.reduce(
          (sum, booking) =>
            sum + booking.total,
          0
        )
      : 0;

  const grouped = new Map<
    string,
    DemoTicketTierReport
  >();

  let complete = consistentCurrency;

  for (const booking of matching) {
    const allocation =
      resolveBookingTicketAllocations(booking);

    if (!allocation.complete) {
      complete = false;
      continue;
    }

    if (!consistentCurrency) {
      continue;
    }

    for (const line of allocation.lines) {
      const existing = grouped.get(line.tierId);

      if (existing) {
        existing.quantity += line.quantity;
        existing.revenue += line.subtotal;
      } else {
        grouped.set(line.tierId, {
          tierId: line.tierId,
          tierName: line.tierName,

          quantity: line.quantity,
          revenue: line.subtotal,

          currency: booking.currency,
        });
      }
    }
  }

  const ticketTiers = Array.from(
    grouped.values()
  );

  if (
    ticketTiers.reduce(
      (sum, tier) => sum + tier.quantity,
      0
    ) !== totalTickets
  ) {
    complete = false;
  }

  return {
    eventId,
    eventSlug,

    eventTitle:
      matching[0]?.eventTitle || "",

    currency:
      consistentCurrency ? currency : null,

    totalBookings: matching.length,
    totalTickets,

    demoTicketSubtotal,
    demoServiceFees,
    demoOrderTotal,

    ticketTiers,

    hasCompleteTierAllocation: complete,

    paymentVerified: false,
    financialStatus: "DEMO_ONLY",

    verifiedGrossRevenue: null,
    verifiedCommission: null,
    verifiedOrganizerPayable: null,
    verifiedSettlementPaid: null,
  };
}

export function getDemoEventBookingReport(
  eventId: string,
  eventSlug: string,
  currency?: string
): DemoEventBookingReport {
  return buildDemoEventReport(
    getAllDemoBookings(),
    eventId,
    eventSlug,
    currency
  );
}

/* ==========================================================
   REACTIVE DEMO EVENT REPORT HOOK

   Useful for the future Admin Reports integration.

   Must be labelled DEMO.
   ========================================================== */

export function useDemoEventBookingReport(
  eventId: string,
  eventSlug: string,
  currency?: string
): DemoEventBookingReport {
  const raw = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return useMemo(() => {
    return buildDemoEventReport(
      parseCustomerBookings(raw),
      eventId,
      eventSlug,
      currency
    );
  }, [raw, eventId, eventSlug, currency]);
}

/* ==========================================================
   RESOLVE GROUP QR BOOKING MODE
   ========================================================== */

/* ==========================================================
   DEMO GROUP QR PAYLOAD

   ONE QR = ONE BOOKING

   No attendee email, phone, payment data or other
   private customer information is embedded.

   Not valid for real admission.
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

  ticketLines?: Array<{
    tierId: string;
    tierName: string;
    quantity: number;
  }>;

  tickets: Array<{
    reference: string;
    seatId?: string;
    tierId?: string;
  }>;
}

/* ==========================================================
   BUILD ONE GROUP QR
   ========================================================== */

export function getDemoGroupQRPayload(
  booking: CustomerBooking
): DemoGroupQRPayload {
  const bookingMode =
    getCustomerBookingMode(booking);

  const seatIds =
    getBookingSelectedSeatIds(booking);

  const allocations =
    resolveBookingTicketAllocations(booking);

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

    ...(allocations.complete
      ? {
          ticketLines:
            allocations.lines.map((line) => ({
              tierId: line.tierId,
              tierName: line.tierName,
              quantity: line.quantity,
            })),
        }
      : {}),

    tickets,
  };
}

/* ==========================================================
   GROUP QR STRING

   Usage:

   <QRCodeSVG
     value={getDemoGroupQRValue(booking)}
   />

   This QR is a demonstration and must never be
   accepted at a real venue gate.
   ========================================================== */

export function getDemoGroupQRValue(
  booking: CustomerBooking
): string {
  return JSON.stringify(
    getDemoGroupQRPayload(booking)
  );
}

/* ==========================================================
   LEGACY TICKET QR PAYLOAD

   Retained for existing components.

   For the correct one-QR-per-booking implementation,
   use getDemoGroupQRValue() instead.

   This returns a demo-only identifier, not an
   admission-valid QR.
   ========================================================== */

export function getDemoTicketQRPayload(
  booking: CustomerBooking,
  ticket: CustomerTicket
): string {
  return JSON.stringify({
    type: "VIZHATICKETS_DEMO_TICKET",

    bookingReference: booking.reference,
    ticketReference: ticket.reference,

    bookingMode:
      getCustomerBookingMode(booking),

    ...(ticket.seatId
      ? { seatId: ticket.seatId }
      : {}),

    status: "NOT_VALID_FOR_ENTRY",
  });
}

/* ==========================================================
   END — VIZHATICKETS CUSTOMER BOOKINGS
   ========================================================== */
