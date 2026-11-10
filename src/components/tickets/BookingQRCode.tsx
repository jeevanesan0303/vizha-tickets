
import { QRCodeSVG } from "qrcode.react";

import {
  Armchair,
  CalendarDays,
  Clock3,
  Info,
  MapPin,
  ShieldAlert,
  Ticket,
  UsersRound,
} from "lucide-react";

import type {
  CustomerBooking,
} from "../../lib/customerBookings";

/* ==========================================================
   VIZHATICKETS — GROUP BOOKING QR CODE

   FEATURES
   ----------------------------------------------------------
   1. One QR code per booking
   2. Supports 1–10 tickets
   3. General admission support
   4. Zone / area selection support
   5. Individual seat selection support
   6. All ticket references inside one QR
   7. Event details inside QR
   8. Customer booking confirmation display
   9. Print-friendly QR code
   10. Backward compatibility with older bookings

   IMPORTANT
   ----------------------------------------------------------
   This component generates DEMO QR codes only.

   It does not verify a payment or admission.

   In production, QR codes must be validated against
   a secure backend and must not be trusted based
   on their embedded text alone.
   ========================================================== */

/* ==========================================================
   TYPES
   ========================================================== */

type BookingMode = "general" | "zone" | "seat";

interface BookingSeatDetails {
  id: string;
  row: string;
  label: string;
  tierId: string;
  tierName: string;
  price: number;
}

interface BookingSelectionDetails {
  bookingMode?: BookingMode;

  zoneId?: string;
  zoneName?: string;

  selectedSeatIds?: string[];
  selectedSeats?: BookingSeatDetails[];
}

type ExtendedCustomerBooking =
  CustomerBooking & BookingSelectionDetails;

interface BookingQRCodeProps {
  booking: ExtendedCustomerBooking;
  compact?: boolean;
}

/* ==========================================================
   HELPERS
   ========================================================== */

function formatMoney(
  currency: string,
  value: number
): string {
  return `${currency} ${value.toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Resolve the booking mode.
 *
 * Older bookings may not include bookingMode.
 * They are treated as general admission.
 */

function getBookingMode(
  booking: ExtendedCustomerBooking
): BookingMode {
  if (
    booking.bookingMode === "general" ||
    booking.bookingMode === "zone" ||
    booking.bookingMode === "seat"
  ) {
    return booking.bookingMode;
  }

  if (
    booking.selectedSeatIds?.length ||
    booking.selectedSeats?.length
  ) {
    return "seat";
  }

  if (booking.zoneId || booking.zoneName) {
    return "zone";
  }

  return "general";
}

/**
 * Get all selected seats.
 *
 * Prefer the structured selectedSeats array.
 * Fall back to selectedSeatIds for compatibility.
 */

function getSelectedSeatLabels(
  booking: ExtendedCustomerBooking
): string[] {
  if (booking.selectedSeats?.length) {
    return booking.selectedSeats.map(
      (seat) => seat.label || seat.id
    );
  }

  if (booking.selectedSeatIds?.length) {
    return booking.selectedSeatIds;
  }

  return booking.tickets
    .map((ticket) => {
      const extendedTicket = ticket as typeof ticket & {
        seatId?: string;
      };

      return extendedTicket.seatId;
    })
    .filter(
      (seatId): seatId is string =>
        typeof seatId === "string" &&
        seatId.length > 0
    );
}

/**
 * Find a seat associated with a ticket.
 *
 * Supports the new checkout record format.
 */

function getTicketSeat(
  booking: ExtendedCustomerBooking,
  ticketIndex: number
): string | undefined {
  const ticket = booking.tickets[ticketIndex];

  const ticketWithSeat = ticket as
    | (typeof ticket & {
        seatId?: string;
      })
    | undefined;

  if (ticketWithSeat?.seatId) {
    return ticketWithSeat.seatId;
  }

  return getSelectedSeatLabels(booking)[ticketIndex];
}

/**
 * Return the ticket category when available.
 */

function getTicketCategory(
  booking: ExtendedCustomerBooking,
  ticketIndex: number
): string {
  const ticket = booking.tickets[ticketIndex];

  const ticketWithTier = ticket as
    | (typeof ticket & {
        tierId?: string;
      })
    | undefined;

  const tierId = ticketWithTier?.tierId;

  if (tierId && booking.selectedSeats?.length) {
    const seatId = getTicketSeat(
      booking,
      ticketIndex
    );

    const selectedSeat = booking.selectedSeats.find(
      (seat) => seat.id === seatId
    );

    if (selectedSeat?.tierName) {
      return selectedSeat.tierName;
    }
  }

  return booking.ticketTypeLabel;
}

/* ==========================================================
   BUILD GROUP QR CONTENT

   ONE QR = ONE COMPLETE BOOKING

   Example:

   VIZHATICKETS DEMO BOOKING
   NOT VALID FOR ENTRY

   Booking: VZB-123456
   Event: Yuvan Live in Concert
   Tickets: 10
   Area: Gold Circle

   TICKETS:
   1. VZT-001
   2. VZT-002
   ...
   10. VZT-010

   For seated events, each ticket includes its
   corresponding seat number.

   ========================================================== */

export function buildBookingQRText(
  booking: ExtendedCustomerBooking
): string {
  const bookingMode = getBookingMode(booking);

  const lines: string[] = [
    "VIZHATICKETS - DEMO GROUP BOOKING",
    "NOT VALID FOR ENTRY",
    "",
    `Booking: ${booking.reference}`,
    `Event: ${booking.eventTitle}`,
    `Date: ${booking.eventDate}`,
    `Time: ${booking.eventTime}`,
    `Venue: ${booking.eventVenue}`,
    `Mode: ${bookingMode.toUpperCase()}`,
    `Category: ${booking.ticketTypeLabel}`,
    `Total Tickets: ${booking.quantity}`,
  ];

  /* ZONE DETAILS */

  if (bookingMode === "zone") {
    lines.push(
      `Selected Area: ${
        booking.zoneName ||
        booking.zoneId ||
        booking.ticketTypeLabel
      }`
    );
  }

  /* SEAT DETAILS */

  if (bookingMode === "seat") {
    const seats = getSelectedSeatLabels(booking);

    lines.push(
      `Selected Seats: ${
        seats.length > 0
          ? seats.join(", ")
          : "Not specified"
      }`
    );
  }

  /* INDIVIDUAL TICKET REFERENCES */

  lines.push("");
  lines.push("INCLUDED TICKETS:");

  booking.tickets.forEach((ticket, index) => {
    const ticketNumber = index + 1;
    const seat = getTicketSeat(booking, index);

    if (bookingMode === "seat") {
      const category = getTicketCategory(
        booking,
        index
      );

      lines.push(
        `${ticketNumber}. ${ticket.reference}` +
          (seat ? ` | Seat ${seat}` : "") +
          ` | ${category}`
      );
    } else {
      lines.push(
        `${ticketNumber}. ${ticket.reference}`
      );
    }
  });

  /* DEMO PAYMENT INFORMATION */

  lines.push("");
  lines.push(
    `Demo Total: ${formatMoney(
      booking.currency,
      booking.total
    )}`
  );

  lines.push("Payment: DEMO - NOT CHARGED");
  lines.push("Status: DEMO ONLY");
  lines.push("No admission verification performed.");

  return lines.join("\n");
}

/* ==========================================================
   BOOKING QR COMPONENT
   ========================================================== */

export default function BookingQRCode({
  booking,
  compact = false,
}: BookingQRCodeProps) {
  const bookingMode = getBookingMode(booking);

  const selectedSeatLabels =
    getSelectedSeatLabels(booking);

  const qrValue = buildBookingQRText(booking);

  const totalTickets = booking.quantity;

  const zoneLabel =
    booking.zoneName ||
    booking.zoneId ||
    booking.ticketTypeLabel;

  const hasSeats =
    bookingMode === "seat" &&
    selectedSeatLabels.length > 0;

  const hasZone = bookingMode === "zone";

  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border border-[#eadbc7]
        bg-white
        shadow-[0_10px_30px_rgba(66,37,12,0.07)]
      "
    >
      {/* ==================================================
          HEADER
          ================================================== */}

      <div className="border-b border-[#eee3d5] bg-[#fffbf5] px-5 py-5 text-center">
        <div className="flex items-center justify-center gap-2 text-[#c9790b]">
          <Ticket size={20} />

          <span className="text-[12px] font-bold uppercase tracking-[0.12em]">
            Group Booking QR
          </span>
        </div>

        <h3 className="mt-2 font-serif text-[21px] font-bold text-[#211b15]">
          One QR. All Your Tickets.
        </h3>

        <p className="mt-1 text-[11px] text-[#89786a]">
          {totalTickets} ticket
          {totalTickets !== 1 ? "s" : ""} included
          in this booking
        </p>
      </div>

      <div
        className={
          compact
            ? "p-4"
            : "p-5 sm:p-6"
        }
      >
        {/* ==================================================
            QR CODE
            ================================================== */}

        <div className="flex justify-center">
          <div className="rounded-[20px] border border-[#eee2d5] bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={qrValue}
              size={compact ? 210 : 260}
              level="M"
              marginSize={4}
              bgColor="#FFFFFF"
              fgColor="#201915"
              title={`Demo group booking QR ${booking.reference}`}
            />
          </div>
        </div>

        {/* ==================================================
            SCAN INFORMATION
            ================================================== */}

        <div className="mt-4 flex items-center justify-center gap-2 text-center">
          <Info
            size={15}
            className="shrink-0 text-[#b17a28]"
          />

          <p className="text-[10px] text-[#968270]">
            Scan to read the demo booking details
          </p>
        </div>

        {/* ==================================================
            BOOKING REFERENCE
            ================================================== */}

        <div className="mt-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9a8878]">
            Booking Reference
          </p>

          <p className="mt-2 break-all font-mono text-[14px] font-extrabold text-[#30251b]">
            {booking.reference}
          </p>
        </div>

        {/* ==================================================
            GROUP QUANTITY
            ================================================== */}

        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#fff1dc] px-4 py-3 text-[#a96914]">
          <UsersRound size={19} />

          <span className="text-[13px] font-bold">
            {totalTickets}{" "}
            {totalTickets === 1
              ? "Ticket"
              : "Tickets"}
          </span>
        </div>

        {/* ==================================================
            BOOKING TYPE
            ================================================== */}

        <div className="mt-4 rounded-xl border border-[#eee4d7] bg-[#fffcf8] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#968575]">
            Booking Type
          </p>

          <p className="mt-1.5 text-[12px] font-bold text-[#3a2b1e]">
            {bookingMode === "general"
              ? "General Admission"
              : bookingMode === "zone"
                ? "Area / Zone Selection"
                : "Reserved Seat Selection"}
          </p>
        </div>

        {/* ==================================================
            EVENT DETAILS
            ================================================== */}

        <div className="mt-5 space-y-3 border-t border-[#f0e6db] pt-5">
          <h4 className="text-[15px] font-bold text-[#292019]">
            {booking.eventTitle}
          </h4>

          <p className="flex items-center gap-2 text-[12px] text-[#877768]">
            <CalendarDays
              size={15}
              className="shrink-0 text-[#c9790b]"
            />

            {booking.eventDate}
          </p>

          <p className="flex items-center gap-2 text-[12px] text-[#877768]">
            <Clock3
              size={15}
              className="shrink-0 text-[#c9790b]"
            />

            {booking.eventTime}
          </p>

          <p className="flex items-start gap-2 text-[12px] text-[#877768]">
            <MapPin
              size={15}
              className="mt-0.5 shrink-0 text-[#c9790b]"
            />

            <span>{booking.eventVenue}</span>
          </p>
        </div>

        {/* ==================================================
            TICKET CATEGORY
            ================================================== */}

        <div className="mt-5 border-t border-[#f0e6db] pt-5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#978575]">
            Ticket Category
          </p>

          <p className="mt-2 text-[13px] font-bold text-[#38291e]">
            {booking.ticketTypeLabel}
          </p>
        </div>

        {/* ==================================================
            SELECTED ZONE / AREA
            ================================================== */}

        {hasZone && (
          <div className="mt-5 rounded-xl border border-[#efddbe] bg-[#fff8ec] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffeccc] text-[#b6761b]">
                <MapPin size={19} />
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#a18256]">
                  Selected Event Area
                </p>

                <h4 className="mt-1 text-[14px] font-extrabold text-[#412d18]">
                  {zoneLabel}
                </h4>

                <p className="mt-1 text-[11px] text-[#826c4e]">
                  All {totalTickets} tickets are
                  allocated to this selected area.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            SELECTED SEATS
            ================================================== */}

        {bookingMode === "seat" && (
          <div className="mt-5 rounded-xl border border-[#efddbe] bg-[#fff8ec] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffeccc] text-[#b6761b]">
                <Armchair size={19} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#a18256]">
                  Reserved Seats
                </p>

                <h4 className="mt-1 text-[14px] font-extrabold text-[#412d18]">
                  {hasSeats
                    ? `${selectedSeatLabels.length} Selected Seats`
                    : "No Seat Details"}
                </h4>

                {hasSeats && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSeatLabels.map(
                      (label, index) => (
                        <span
                          key={`${label}-${index}`}
                          className="rounded-lg border border-[#e8cfaa] bg-white px-3 py-2 font-mono text-[11px] font-bold text-[#a36b1c]"
                        >
                          {label}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            INDIVIDUAL TICKET REFERENCES

            All references belong to ONE group QR.
            Do not generate an individual QR here.
            ================================================== */}

        <div className="mt-5 border-t border-[#f0e6db] pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-[12px] font-bold text-[#2f261e]">
              Included Ticket References
            </h4>

            <span className="rounded-full bg-[#fff0da] px-3 py-1 text-[10px] font-bold text-[#a96d18]">
              {booking.tickets.length} Tickets
            </span>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-[#927e6b]">
            Every ticket below is included in
            the single group booking QR code.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {booking.tickets.map((ticket, index) => {
              const seat = getTicketSeat(
                booking,
                index
              );

              const category = getTicketCategory(
                booking,
                index
              );

              return (
                <div
                  key={ticket.id}
                  className="rounded-xl border border-[#eee5d9] bg-[#fffcf8] px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold text-[#968576]">
                      Ticket {index + 1}
                    </p>

                    {bookingMode === "seat" && seat && (
                      <span className="rounded-md bg-[#fff0da] px-2 py-1 text-[10px] font-bold text-[#a36c1b]">
                        {seat}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 break-all font-mono text-[10px] font-semibold text-[#3c2d1f]">
                    {ticket.reference}
                  </p>

                  {bookingMode === "seat" && (
                    <p className="mt-2 text-[10px] text-[#99836e]">
                      {category}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================
            BOOKING TOTAL
            ================================================== */}

        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#eee0cc] bg-[#fffbf5] px-4 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#988675]">
              Demo Booking Total
            </p>

            <p className="mt-1 text-[10px] text-[#94816d]">
              No actual payment collected
            </p>
          </div>

          <p className="text-[17px] font-extrabold text-[#c9790b]">
            {formatMoney(
              booking.currency,
              booking.total
            )}
          </p>
        </div>

        {/* ==================================================
            SECURITY / DEMO DISCLAIMER
            ================================================== */}

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#f0d9af] bg-[#fff5e5] p-3">
          <ShieldAlert
            size={17}
            className="mt-0.5 shrink-0 text-[#aa731b]"
          />

          <div>
            <p className="text-[11px] font-bold text-[#7d5b29]">
              Demo QR — Not Valid for Entry
            </p>

            <p className="mt-1 text-[10px] leading-relaxed text-[#816844]">
              This QR contains the booking details,
              selected area or seats, and individual
              ticket references. It is not a verified
              admission credential. No real payment
              or entrance verification has occurred.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
