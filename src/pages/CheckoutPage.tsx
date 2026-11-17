
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { isValidPhoneNumber } from "react-phone-number-input";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Info,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Ticket,
  UserRound,
  X,
} from "lucide-react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import InteractiveVenueMap from "../components/booking/InteractiveVenueMap";

import {
  calculateSelectedSeats,
  getEventBookingMode,
  getEventBookingZone,
  getEventBookingZones,
  getEventSeat,
  getEventSeatingConfig,
  getEventTicketTier,
  getEventTicketTiers,
  getZoneTicketPrice,
  hasEventBookingConfiguration,
  isEventSalesWindowOpen,
  useEventBySlug,
  validateEventTicketQuantity,
  type EventBookingMode,
  type EventDetails,
} from "../data/events";

import {
  useCustomerSession,
  updateCustomerProfile,
} from "../lib/customerSession";

import { useAuthModal } from "../contexts/AuthModalContext";

import {
  getEventBookingPolicy,
  getRefundPolicyText,
  getTransferPolicyText,
} from "../lib/eventBookingPolicies";

import {
  BOOKINGS_KEY,
  notifyCustomerBookingsChanged,
  type CustomerBooking,
  type CustomerBookingSeat,
  type CustomerTicket,
} from "../lib/customerBookings";

/* ==========================================================
   VIZHATICKETS — CONNECTED CHECKOUT PAGE

   React + Vite + TypeScript

   Admin / customer shared event integration.

   FEATURES
   ----------------------------------------------------------
   - Reactively reads published admin events
   - Supports custom admin ticket categories
   - General admission / zone / reserved seats
   - Existing InteractiveVenueMap
   - Admin-uploaded venue layout
   - Configured ticket prices and booking limits
   - Booking enabled / disabled enforcement
   - Sales start / end checks
   - Customer authentication required
   - Mandatory international phone
   - Event-specific booking conditions
   - Demo card popup with live preview
   - Browser-local demo booking history
   - One booking reference per transaction
   - One group QR per demo booking
   - Existing Booking Success integration

   SECURITY
   ----------------------------------------------------------
   No real payment is processed.

   Browser demo bookings are NOT paid tickets.

   Production bookings and valid admission QR codes
   must only be issued after backend-verified payment.
   ========================================================== */

type CheckoutStep = 1 | 2;

type Attendee = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const DEMO_TEST_CARD = "4242424242424242";
const SERVICE_FEE_RATE = 0.05;

/* ==========================================================
   HELPERS
   ========================================================== */

function money(currency: string, value: number): string {
  return `${currency} ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function nameParts(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function makeReference(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase()}`;
}

function isFinitePrice(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function isValidQuantity(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function getEventAvailabilityError(
  event: EventDetails
): string {
  if (event.publicationStatus === "Draft") {
    return "This event is not published.";
  }

  if (event.bookingEnabled === false) {
    return "Online booking is disabled for this event.";
  }

  if (!hasEventBookingConfiguration(event)) {
    return (
      "This event's booking configuration is incomplete. " +
      "The organizer must configure its ticket zones or seats."
    );
  }

  if (!isEventSalesWindowOpen(event)) {
    return "Ticket sales are not currently open.";
  }

  return "";
}

/* ==========================================================
   BROWSER-LOCAL DEMO BOOKING STORAGE

   Existing format is preserved for:
   - Customer Dashboard
   - My Tickets
   - My Bookings
   - Booking Success

   Never treat these as real paid bookings.
   ========================================================== */

function saveDemoBooking(booking: CustomerBooking): void {
  const raw = localStorage.getItem(BOOKINGS_KEY);

  const parsed: unknown = raw ? JSON.parse(raw) : [];

  if (!Array.isArray(parsed)) {
    throw new Error(
      "Existing local booking storage is invalid."
    );
  }

  const duplicate = parsed.some((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    return (
      (item as { reference?: unknown }).reference ===
      booking.reference
    );
  });

  if (duplicate) {
    throw new Error("Duplicate booking reference.");
  }

  localStorage.setItem(
    BOOKINGS_KEY,
    JSON.stringify([booking, ...parsed])
  );

  notifyCustomerBookingsChanged();
}

/* ==========================================================
   LOCAL DEMO SEAT CONFLICT CHECK

   This is browser-local only.

   It cannot prevent simultaneous reservations
   across different users or devices.
   ========================================================== */

function getLocallyBookedSeatIds(
  eventSlug: string
): Set<string> {
  const occupied = new Set<string>();

  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);

    if (!raw) return occupied;

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return occupied;

    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const booking = entry as Record<string, unknown>;

      if (
        booking.eventSlug !== eventSlug ||
        booking.bookingMode !== "seat" ||
        booking.bookingStatus !== "demo-confirmed"
      ) {
        continue;
      }

      if (Array.isArray(booking.selectedSeatIds)) {
        for (const id of booking.selectedSeatIds) {
          if (typeof id === "string") {
            occupied.add(id);
          }
        }
      }

      if (Array.isArray(booking.selectedSeats)) {
        for (const seat of booking.selectedSeats) {
          if (
            seat &&
            typeof seat === "object" &&
            "id" in seat &&
            typeof seat.id === "string"
          ) {
            occupied.add(seat.id);
          }
        }
      }
    }
  } catch {
    return occupied;
  }

  return occupied;
}

function findAlreadyBookedSeats(
  eventSlug: string,
  selectedIds: string[]
): string[] {
  const occupied = getLocallyBookedSeatIds(eventSlug);

  return selectedIds.filter((id) => occupied.has(id));
}

/* ==========================================================
   TEST CARD MODAL

   Only predetermined fictional details are accepted.

   Never enter real card information.
   Card data is not saved.
   ========================================================== */

interface DemoCardModalProps {
  customerName: string;
  amount: string;
  onClose: () => void;
  onSuccess: () => void;
}

function DemoCardModal({
  customerName,
  amount,
  onClose,
  onSuccess,
}: DemoCardModalProps) {
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = document.getElementById(
        "vizha-demo-card-dialog"
      );

      const focusable = dialog?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled])"
      );

      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, []);

  const digits = number.replace(/\D/g, "").slice(0, 16);

  const previewNumber =
    digits
      .padEnd(16, "•")
      .match(/.{1,4}/g)
      ?.join(" ") ?? "•••• •••• •••• ••••";

  const previewHolder =
    holder.trim().toUpperCase() || "YOUR NAME";

  const previewExpiry = expiry || "MM/YY";

  const formatNumber = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 4);

    return raw.length <= 2
      ? raw
      : `${raw.slice(0, 2)}/${raw.slice(2)}`;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (holder.trim().length < 2) {
      setError("Enter the demo cardholder name.");
      return;
    }

    if (digits !== DEMO_TEST_CARD) {
      setError(
        "Use only the demo number 4242 4242 4242 4242."
      );
      return;
    }

    if (expiry !== "12/30") {
      setError("Use the demo expiry 12/30.");
      return;
    }

    if (cvv !== "123") {
      setError("Use the demo CVV 123.");
      return;
    }

    onSuccess();
  };

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-3 sm:p-5">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[#140c06]/75 backdrop-blur-[5px]"
      />

      <section
        id="vizha-demo-card-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vizha-demo-card-title"
        className="relative z-10 flex max-h-[calc(100dvh-24px)] w-full max-w-116.25 flex-col overflow-hidden rounded-3xl border border-[#e8cda4] bg-[#fffaf5] shadow-[0_28px_90px_rgba(0,0,0,0.3)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#efe4d7] bg-white px-5 py-4 sm:px-6">
          <div>
            <h2
              id="vizha-demo-card-title"
              className="font-serif text-[21px] font-bold"
            >
              Demo Card Payment
            </h2>

            <p className="mt-1 text-[11px] text-[#89796a]">
              VizhaTickets · No real payment
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close demo card"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadaca] bg-white text-[#6b5340] hover:bg-[#fff1de]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="relative overflow-hidden rounded-[19px] bg-[linear-gradient(125deg,#24150e,#713508,#d58514)] p-5 text-white shadow-[0_10px_25px_rgba(100,50,10,0.2)]">
            <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full border-23 border-white/10" />

            <div className="relative flex items-center justify-between">
              <span className="text-[12px] font-extrabold tracking-wider">
                VIZHATICKETS
              </span>
              <CreditCard size={23} />
            </div>

            <div className="relative mt-5 h-7 w-10 rounded-md border border-[#ffe7ae] bg-linear-to-br from-[#fff2c5] to-[#bd8b38]" />

            <p className="relative mt-5 font-mono text-[clamp(14px,3.5vw,19px)] font-semibold tracking-wider">
              {previewNumber}
            </p>

            <div className="relative mt-6 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] uppercase text-white/65">
                  Cardholder
                </p>
                <p className="mt-1 truncate text-[12px] font-bold">
                  {previewHolder}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[9px] uppercase text-white/65">
                  Expires
                </p>
                <p className="mt-1 font-mono text-[12px] font-bold">
                  {previewExpiry}
                </p>
              </div>
            </div>

            <p className="relative mt-3 text-right text-[9px] font-bold tracking-wider text-white/75">
              DEMO CARD ONLY
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-[#efd4a4] bg-[#fff2dc] px-4 py-3 text-[11px] leading-relaxed text-[#866125]">
            Use test number <strong>4242 4242 4242 4242</strong>,
            expiry <strong>12/30</strong> and CVV{" "}
            <strong>123</strong>. Do not enter real card details.
          </div>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            noValidate
            className="mt-5 space-y-4"
          >
            <label className="block">
              <span className="text-[12px] font-bold">
                Cardholder Name
              </span>

              <input
                type="text"
                value={holder}
                onChange={(e) => {
                  setHolder(e.target.value);
                  setError("");
                }}
                placeholder={customerName || "Demo Customer"}
                maxLength={80}
                autoComplete="off"
                className="mt-2 h-11 w-full rounded-xl border border-[#e8dac9] bg-white px-4 text-[13px] outline-none focus:border-[#c9790b]"
              />
            </label>

            <label className="block">
              <span className="text-[12px] font-bold">
                Test Card Number
              </span>

              <input
                type="text"
                inputMode="numeric"
                value={number}
                onChange={(e) => {
                  setNumber(formatNumber(e.target.value));
                  setError("");
                }}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                autoComplete="off"
                className="mt-2 h-11 w-full rounded-xl border border-[#e8dac9] bg-white px-4 font-mono text-[13px] outline-none focus:border-[#c9790b]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[12px] font-bold">
                  Test Expiry
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => {
                    setExpiry(formatExpiry(e.target.value));
                    setError("");
                  }}
                  placeholder="12/30"
                  maxLength={5}
                  autoComplete="off"
                  className="mt-2 h-11 w-full rounded-xl border border-[#e8dac9] bg-white px-4 text-[13px] outline-none focus:border-[#c9790b]"
                />
              </label>

              <label className="block">
                <span className="text-[12px] font-bold">
                  Test CVV
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) => {
                    setCvv(
                      e.target.value.replace(/\D/g, "").slice(0, 3)
                    );
                    setError("");
                  }}
                  placeholder="123"
                  maxLength={3}
                  autoComplete="off"
                  className="mt-2 h-11 w-full rounded-xl border border-[#e8dac9] bg-white px-4 text-[13px] outline-none focus:border-[#c9790b]"
                />
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-[11px] text-red-700"
              >
                {error}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-[#eadfce] pt-4">
              <span className="text-[12px] font-semibold">
                Demo Total
              </span>

              <strong className="text-[20px] text-[#c9790b]">
                {amount}
              </strong>
            </div>

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#f4a01b] to-[#de7805] text-[12px] font-bold text-white hover:brightness-95"
            >
              <BadgeCheck size={17} />
              Use Demo Card
              <ArrowRight size={17} />
            </button>

            <p className="text-center text-[10px] text-[#948170]">
              No funds will be charged or transferred.
            </p>
          </form>
        </div>
      </section>
    </div>,
    document.body
  );
}

/* ==========================================================
   CHECKOUT ROUTE

   IMPORTANT CORRECTION:

   Previously:
     import { events } from "../data/events"

   Now:
     useEventBySlug(eventSlug)

   This follows Admin Dashboard publication changes.
   ========================================================== */

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();

  const eventSlug = searchParams.get("event") ?? undefined;

  const event = useEventBySlug(eventSlug);

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fffaf2]">
        <Header />

        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-20 text-center">
          <Ticket size={46} className="text-[#c9790b]" />

          <h1 className="mt-5 font-serif text-[28px] font-bold">
            Event Unavailable
          </h1>

          <p className="mt-3 text-[13px] leading-relaxed text-[#827467]">
            This event may have been unpublished, deleted, or
            its booking link may be incorrect.
          </p>

          <Link
            to="/events"
            className="mt-7 rounded-full bg-[#c9790b] px-6 py-3 text-[12px] font-bold text-white"
          >
            Explore Events
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <CheckoutContent
      key={event.slug}
      event={event}
      initialType={searchParams.get("type")}
      initialQuantity={searchParams.get("qty")}
    />
  );
}

/* ==========================================================
   CHECKOUT CONTENT
   ========================================================== */

interface CheckoutContentProps {
  event: EventDetails;
  initialType: string | null;
  initialQuantity: string | null;
}

function CheckoutContent({
  event,
  initialType,
  initialQuantity,
}: CheckoutContentProps) {
  const navigate = useNavigate();

  const { customer, isAuthenticated } = useCustomerSession();
  const { openLogin } = useAuthModal();

  const bookingMode: EventBookingMode =
    getEventBookingMode(event);

  const policy = getEventBookingPolicy(event.slug);

  const tiers = getEventTicketTiers(event);

  const maxQuantity = Math.max(
    1,
    event.maxTicketsPerBooking ?? 10
  );

  const minQuantity = Math.max(
    1,
    Math.min(event.minTicketsPerBooking ?? 1, maxQuantity)
  );

  const availableTier = tiers.find(
    (tier) =>
      tier.available !== false &&
      isFinitePrice(tier.price)
  );

  const requestedQuantity =
    initialQuantity === null
      ? NaN
      : Number(initialQuantity);

  /* ========================================================
     STATE
     ======================================================== */

  const [step, setStep] = useState<CheckoutStep>(1);

  const [quantity, setQuantity] = useState(
    Number.isInteger(requestedQuantity) &&
      requestedQuantity >= minQuantity &&
      requestedQuantity <= maxQuantity
      ? requestedQuantity
      : minQuantity
  );

  const [selectedTierId, setSelectedTierId] = useState(
    () => {
      if (
        initialType &&
        tiers.some(
          (tier) =>
            tier.id === initialType &&
            tier.available !== false &&
            isFinitePrice(tier.price)
        )
      ) {
        return initialType;
      }

      return availableTier?.id ?? "";
    }
  );

  const [selectedZoneId, setSelectedZoneId] =
    useState<string | null>(null);

  const [selectedSeatIds, setSelectedSeatIds] =
    useState<string[]>([]);

  const [acceptedPolicy, setAcceptedPolicy] =
    useState(false);

  const [cardModalOpen, setCardModalOpen] =
    useState(false);

  const [demoCardReady, setDemoCardReady] =
    useState(false);

  const [attendeeEdits, setAttendeeEdits] =
    useState<Partial<Attendee>>({});

  const [error, setError] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const submitLock = useRef(false);

  /* ========================================================
     RESET VALIDATED DEMO CARD ON EVENT CHANGES

     This covers admin modifications while the
     customer is viewing checkout.
     ======================================================== */

  const selectionSignature = JSON.stringify({
    eventId: event.adminEventId ?? event.id,
    title: event.title,
    currency: event.currency,
    price: event.price,
    bookingEnabled: event.bookingEnabled,
    salesStart: event.salesStart,
    salesEnd: event.salesEnd,
    tiers: event.ticketTiers?.map((tier) => ({
      id: tier.id,
      price: tier.price,
      capacity: tier.capacity,
      enabled: tier.available,
    })),
  });

  useEffect(() => {
    setDemoCardReady(false);
    setCardModalOpen(false);
    setStep(1);
    setAcceptedPolicy(false);
    setError("");
  }, [selectionSignature]);

  /* ========================================================
     SELECTION
     ======================================================== */

  const selectedTier = tiers.find(
    (tier) =>
      tier.id === selectedTierId &&
      tier.available !== false &&
      isFinitePrice(tier.price)
  );

  const selectedZone = selectedZoneId
    ? getEventBookingZone(event, selectedZoneId)
    : undefined;

  const zonePrice = selectedZoneId
    ? getZoneTicketPrice(event, selectedZoneId)
    : null;

  const seatCalculation = calculateSelectedSeats(
    event,
    selectedSeatIds
  );

  const selectedSeats: CustomerBookingSeat[] =
    selectedSeatIds
      .map((seatId) => {
        const seat = getEventSeat(event, seatId);

        if (!seat) return null;

        const tier = getEventTicketTier(
          event,
          seat.ticketTierId
        );

        if (!tier) return null;

        const result: CustomerBookingSeat = {
          id: seat.id,
          row: seat.row,
          label: seat.label,
          tierId: tier.id,
          tierName: tier.name,
          price: tier.price,
        };

        return result;
      })
      .filter(
        (seat): seat is CustomerBookingSeat =>
          seat !== null
      );

  const ticketQuantity =
    bookingMode === "seat"
      ? selectedSeatIds.length
      : quantity;

  const unitPrice =
    bookingMode === "zone"
      ? zonePrice ?? 0
      : bookingMode === "general"
        ? selectedTier?.price ?? 0
        : ticketQuantity > 0 && seatCalculation.valid
          ? seatCalculation.subtotal / ticketQuantity
          : 0;

  const subtotal =
    bookingMode === "seat"
      ? seatCalculation.valid
        ? seatCalculation.subtotal
        : selectedSeats.reduce(
            (total, seat) => total + seat.price,
            0
          )
      : unitPrice * quantity;

  const serviceFee = Math.round(
    subtotal * SERVICE_FEE_RATE
  );

  const total = subtotal + serviceFee;

  const ticketLabel =
    bookingMode === "zone"
      ? selectedZone?.name ?? "Select an area"
      : bookingMode === "seat"
        ? selectedSeats.length > 0
          ? new Set(
              selectedSeats.map(
                (seat) => seat.tierName
              )
            ).size > 1
            ? "Mixed Seating Categories"
            : selectedSeats[0].tierName
          : "Select seats"
        : selectedTier?.name ??
          "Select ticket category";

  /* ========================================================
     CUSTOMER DETAILS
     ======================================================== */

  const customerName = nameParts(customer?.name ?? "");

  const attendee: Attendee = {
    firstName:
      attendeeEdits.firstName ??
      customerName.firstName,

    lastName:
      attendeeEdits.lastName ??
      customerName.lastName,

    email:
      attendeeEdits.email ??
      customer?.email ??
      "",

    phone:
      attendeeEdits.phone ??
      customer?.phone ??
      "",
  };

  const inputClass =
    "mt-1.5 h-11 w-full rounded-xl border " +
    "border-[#e9ded2] bg-[#fdfaf7] px-4 " +
    "text-[13px] text-[#292019] outline-none " +
    "transition focus:border-[#db8416] " +
    "focus:bg-white focus:ring-4 " +
    "focus:ring-[#e9a346]/10";

  const bookingSelectionChanged = () => {
    setDemoCardReady(false);
    setError("");
  };

  const updateAttendee = (
    field: keyof Attendee,
    value: string
  ) => {
    setAttendeeEdits((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };

  const changeStep = (next: CheckoutStep) => {
    setStep(next);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ========================================================
     BOOKING VALIDATION
     ======================================================== */

  const validateSelection = (): string => {
    const availabilityError =
      getEventAvailabilityError(event);

    if (availabilityError) {
      return availabilityError;
    }

    if (bookingMode === "general") {
      if (
        !selectedTier ||
        !isFinitePrice(selectedTier.price)
      ) {
        return "Select an available ticket category.";
      }

      if (!validateEventTicketQuantity(event, quantity)) {
        return "Select a valid ticket quantity.";
      }

      if (
        selectedTier.minQuantity !== undefined &&
        quantity < selectedTier.minQuantity
      ) {
        return `This category requires at least ${selectedTier.minQuantity} tickets.`;
      }

      if (
        selectedTier.maxQuantity !== undefined &&
        quantity > selectedTier.maxQuantity
      ) {
        return `This category allows a maximum of ${selectedTier.maxQuantity} tickets.`;
      }

      if (
        typeof selectedTier.capacity === "number" &&
        quantity > selectedTier.capacity
      ) {
        return "Your quantity exceeds the configured category capacity.";
      }
    }

    if (bookingMode === "zone") {
      const zones = getEventBookingZones(event);

      if (
        !selectedZone ||
        selectedZone.available === false ||
        !zones.some((zone) => zone.id === selectedZone.id) ||
        !isFinitePrice(zonePrice)
      ) {
        return "Select a valid event zone.";
      }

      if (!validateEventTicketQuantity(event, quantity)) {
        return "Select a valid ticket quantity.";
      }

      const tier = getEventTicketTier(
        event,
        selectedZone.ticketTierId
      );

      if (
        !tier ||
        tier.available === false ||
        !isFinitePrice(tier.price)
      ) {
        return "The selected zone is unavailable.";
      }

      if (
        tier.maxQuantity !== undefined &&
        quantity > tier.maxQuantity
      ) {
        return `Maximum ${tier.maxQuantity} tickets for this zone.`;
      }

      if (
        tier.minQuantity !== undefined &&
        quantity < tier.minQuantity
      ) {
        return `Minimum ${tier.minQuantity} tickets for this zone.`;
      }

      if (
        typeof tier.capacity === "number" &&
        quantity > tier.capacity
      ) {
        return "The quantity exceeds the configured ticket capacity.";
      }

      if (
        typeof selectedZone.capacity === "number" &&
        quantity > selectedZone.capacity
      ) {
        return "The quantity exceeds this zone's configured capacity.";
      }
    }

    if (bookingMode === "seat") {
      if (!seatCalculation.valid) {
        return (
          seatCalculation.error ||
          "Please select valid seats."
        );
      }

      if (
        selectedSeatIds.length !== selectedSeats.length ||
        new Set(selectedSeatIds).size !==
          selectedSeatIds.length
      ) {
        return "One or more selected seats are invalid.";
      }

      if (
        !validateEventTicketQuantity(
          event,
          selectedSeatIds.length
        )
      ) {
        return "Invalid number of selected seats.";
      }

      const seating = getEventSeatingConfig(event);

      if (!seating) {
        return "Numbered seating has not been configured.";
      }

      if (
        selectedSeatIds.length >
        seating.maxSeatsPerBooking
      ) {
        return `Maximum ${seating.maxSeatsPerBooking} seats allowed.`;
      }

      const alreadyBooked = findAlreadyBookedSeats(
        event.slug,
        selectedSeatIds
      );

      if (alreadyBooked.length > 0) {
        return (
          `Demo seat(s) ${alreadyBooked.join(", ")} ` +
          "already exist in another local booking."
        );
      }
    }

    if (
      !isValidQuantity(ticketQuantity) ||
      !isFinitePrice(subtotal) ||
      !isFinitePrice(total)
    ) {
      return "Please select valid tickets.";
    }

    return "";
  };

  const validateCustomer = (): string => {
    if (!attendee.firstName.trim()) {
      return "Enter your first name.";
    }

    if (!attendee.lastName.trim()) {
      return "Enter your last name.";
    }

    if (!validEmail(attendee.email)) {
      return "Enter a valid email address.";
    }

    if (!attendee.phone.trim()) {
      return "International phone number is required.";
    }

    if (!isValidPhoneNumber(attendee.phone.trim())) {
      return (
        "Enter a valid phone number including " +
        "the international country code."
      );
    }

    return "";
  };

  const selectionError = validateSelection();

  const selectionValid = selectionError === "";

  const canProceed =
    selectionValid && acceptedPolicy;

  /* ========================================================
     PROCEED TO CUSTOMER DETAILS
     ======================================================== */

  const handleProceed = () => {
    setError("");

    if (!isAuthenticated || !customer) {
      setError("Sign in before proceeding to checkout.");
      openLogin();
      return;
    }

    const validation = validateSelection();

    if (validation) {
      setError(validation);
      return;
    }

    if (!acceptedPolicy) {
      setError("Accept the event booking conditions.");
      return;
    }

    changeStep(2);
  };

  /* ========================================================
     CREATE DEMO BOOKING

     PAYMENT SAFETY:

     This action creates only a fictional demo record.
     It is not a payment confirmation.

     The customerBookings model retains demo statuses.
     Do not change these to "paid" or "confirmed"
     without actual backend payment verification.
     ======================================================== */

  const handleConfirm = (
    submitEvent: FormEvent<HTMLFormElement>
  ) => {
    submitEvent.preventDefault();

    if (submitLock.current || submitting) return;

    setError("");

    if (!isAuthenticated || !customer) {
      setStep(1);
      setError("Your session has expired. Sign in again.");
      openLogin();
      return;
    }

    const validation = validateSelection();

    if (validation) {
      changeStep(1);
      setError(validation);
      return;
    }

    if (!acceptedPolicy) {
      changeStep(1);
      setError("Accept the event booking conditions.");
      return;
    }

    const customerError = validateCustomer();

    if (customerError) {
      setError(customerError);
      return;
    }

    if (!demoCardReady) {
      setError("Complete the demo card step first.");
      setCardModalOpen(true);
      return;
    }

    submitLock.current = true;
    setSubmitting(true);

    try {
      const phone = attendee.phone.trim();

      if (phone !== (customer.phone ?? "").trim()) {
        const updated = updateCustomerProfile({
          phone,
        });

        if (!updated) {
          throw new Error(
            "Unable to update the customer phone number."
          );
        }
      }

      /*
       * Recheck the browser-local seat list before saving.
       * This is not an atomic or cross-device reservation.
       */

      if (bookingMode === "seat") {
        const conflicts = findAlreadyBookedSeats(
          event.slug,
          selectedSeatIds
        );

        if (conflicts.length > 0) {
          throw new Error(
            `Demo seat(s) already selected: ${conflicts.join(", ")}`
          );
        }
      }

      const bookingReference = makeReference("VZB");
      const createdAt = new Date().toISOString();

      /* ====================================================
         INDIVIDUAL DEMO TICKET RECORDS

         ONE booking reference and group QR.
         No separate QR is generated for each ticket.
         ==================================================== */

      const tickets: CustomerTicket[] = Array.from(
        { length: ticketQuantity },
        (_, index) => {
          const ticket: CustomerTicket = {
            id: crypto.randomUUID(),
            reference: makeReference("VZT"),
            status: "demo",
          };

          if (bookingMode === "seat") {
            ticket.seatId = selectedSeats[index]?.id;
            ticket.tierId = selectedSeats[index]?.tierId;
          }

          if (bookingMode === "zone" && selectedZone) {
            ticket.tierId = selectedZone.ticketTierId;
          }

          if (bookingMode === "general" && selectedTier) {
            ticket.tierId = selectedTier.id;
          }

          return ticket;
        }
      );

      const actualTierId =
        bookingMode === "zone"
          ? selectedZone?.ticketTierId
          : bookingMode === "general"
            ? selectedTier?.id
            : undefined;

      /*
       * The legacy ticketType is kept for older customer
       * components. The actual category identity remains
       * in tickets[].tierId and ticketTypeLabel.
       */

      const legacyTier: "standard" | "gold" | "vip" =
        actualTierId === "gold" || actualTierId === "vip"
          ? actualTierId
          : "standard";

      const booking: CustomerBooking = {
        id: crypto.randomUUID(),
        reference: bookingReference,

        customerId: customer.id,
        customerEmail: customer.email,

        eventSlug: event.slug,
        eventTitle: event.title,
        eventImage: event.image,
        eventDate: String(event.date),
        eventTime: String(event.time),
        eventVenue: event.venue,

        ticketType: legacyTier,
        ticketTypeLabel: ticketLabel,
        quantity: ticketQuantity,

        currency: event.currency,
        unitPrice,
        subtotal,
        serviceFee,
        total,

        attendee: {
          firstName: attendee.firstName.trim(),
          lastName: attendee.lastName.trim(),
          email: attendee.email.trim().toLowerCase(),
          phone,
        },

        paymentMethod: "card",
        paymentStatus: "demo",
        bookingStatus: "demo-confirmed",

        tickets,
        createdAt,

        bookingMode,

        ...(bookingMode === "zone" && selectedZone
          ? {
              zoneId: selectedZone.id,
              zoneName: selectedZone.name,
            }
          : {}),

        ...(bookingMode === "seat"
          ? {
              selectedSeatIds: [...selectedSeatIds],
              selectedSeats: [...selectedSeats],
            }
          : {}),

        policyVersion: policy.version,
        policyAcknowledgedAt: createdAt,
      };

      saveDemoBooking(booking);

      navigate(
        `/booking-success?booking=${encodeURIComponent(
          bookingReference
        )}`,
        { replace: true }
      );
    } catch (bookingError) {
      console.error("VizhaTickets demo checkout:", bookingError);

      setError(
        bookingError instanceof Error
          ? bookingError.message
          : "Unable to save the demo booking."
      );

      submitLock.current = false;
      setSubmitting(false);
    }
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div className="min-h-screen bg-[#fffaf2] text-[#211b15]">
      <Header />

      <main className="pb-16">
        {/* BREADCRUMB */}

        <div className="border-b border-[#eee3d4] bg-white">
          <div className="vizha-container flex min-h-14 items-center gap-2 text-[12px]">
            <Link
              to={`/events/${encodeURIComponent(event.slug)}`}
              className="inline-flex items-center gap-2 font-semibold text-[#b67720]"
            >
              <ArrowLeft size={15} />
              Event Details
            </Link>

            <ChevronRight
              size={14}
              className="text-[#bbaa99]"
            />

            <span className="font-medium text-[#5b4b3c]">
              Checkout
            </span>
          </div>
        </div>

        <div className="vizha-container pt-8 sm:pt-10">
          {/* PAGE HEADING */}

          <div className="mb-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#c9790b]">
              VizhaTickets · Demo Checkout
            </p>

            <h1 className="mt-2 font-serif text-[clamp(1.9rem,3vw,2.6rem)] font-bold">
              {step === 1
                ? "Select Your Tickets"
                : "Customer Details & Payment"}
            </h1>

            <p className="mt-2 text-[13px] text-[#887768]">
              {step === 1
                ? "Choose your ticket category, area or seats."
                : "Review your contact details and complete the demonstration payment."}
            </p>
          </div>

          {/* UNAVAILABLE EVENT WARNING */}

          {getEventAvailabilityError(event) && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#efcba5] bg-[#fff2e3] p-4">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-[#bf7418]"
              />

              <div>
                <p className="text-[13px] font-bold">
                  Booking Unavailable
                </p>

                <p className="mt-1 text-[12px] leading-relaxed text-[#846747]">
                  {getEventAvailabilityError(event)}
                </p>
              </div>
            </div>
          )}

          {/* CUSTOMER SIGN-IN */}

          {!isAuthenticated && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#ecd3a5] bg-[#fff2dc] p-4">
              <div className="flex items-start gap-3">
                <LockKeyhole
                  size={20}
                  className="mt-0.5 shrink-0 text-[#b77316]"
                />

                <div>
                  <p className="text-[13px] font-bold">
                    Customer Sign In Required
                  </p>

                  <p className="mt-1 text-[12px] leading-relaxed text-[#816c51]">
                    You can explore tickets and the venue,
                    but must sign in before proceeding.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openLogin}
                className="rounded-full bg-[#cb790b] px-5 py-2.5 text-[12px] font-bold text-white hover:bg-[#a96808]"
              >
                Sign In / Register
              </button>
            </div>
          )}

          {/* STEPS */}

          <div className="mb-7 flex items-center gap-3 rounded-2xl border border-[#eee2d3] bg-white p-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  step === 1
                    ? "bg-[#e78a0b] text-white"
                    : "bg-[#e6f6e9] text-[#31894e]"
                }`}
              >
                {step === 1 ? "1" : <Check size={16} />}
              </span>

              <span className="text-[12px] font-semibold">
                Ticket Selection
              </span>
            </div>

            <div className="h-px min-w-3 flex-1 bg-[#ebdfd0]" />

            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  step === 2
                    ? "bg-[#e78a0b] text-white"
                    : "bg-[#f3ece4] text-[#897768]"
                }`}
              >
                2
              </span>

              <span className="text-[12px] font-semibold">
                Details & Payment
              </span>
            </div>
          </div>

          {/* MAIN GRID */}

          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)]">
            {/* LEFT COLUMN */}

            <div className="min-w-0">
              {step === 1 ? (
                <div className="space-y-5">
                  {/* INTERACTIVE VENUE AND TICKET SELECTOR */}

                  <InteractiveVenueMap
                    event={event}
                    selectedZoneId={selectedZoneId}
                    onZoneChange={(zoneId) => {
                      setSelectedZoneId(zoneId);
                      bookingSelectionChanged();
                    }}
                    selectedSeatIds={selectedSeatIds}
                    onSeatsChange={(seatIds) => {
                      setSelectedSeatIds(seatIds);
                      bookingSelectionChanged();
                    }}
                    selectedTierId={selectedTierId}
                    onTierChange={(tierId) => {
                      setSelectedTierId(tierId);
                      bookingSelectionChanged();
                    }}
                    quantity={quantity}
                    onQuantityChange={(value) => {
                      setQuantity(value);
                      bookingSelectionChanged();
                    }}
                    disabled={
                      getEventAvailabilityError(event) !== ""
                    }
                  />

                  {/* ADMIN VENUE IMAGE */}

                  {event.venueLayoutImage && (
                    <section className="rounded-[23px] border border-[#eee2d4] bg-white p-5 sm:p-7">
                      <h2 className="text-[16px] font-bold">
                        Venue Layout Reference
                      </h2>

                      <p className="mt-1 text-[11px] text-[#8a7967]">
                        Uploaded by the event organizer.
                      </p>

                      <img
                        src={event.venueLayoutImage}
                        alt={`Venue layout for ${event.title}`}
                        className="mt-4 max-h-95 w-full rounded-xl border border-[#eee2d4] bg-[#f9f6f2] object-contain"
                      />

                      <p className="mt-3 text-[11px] leading-relaxed text-[#8a7967]">
                        This image is a visual reference.
                        Actual zone and seat selections require
                        a configured interactive map.
                      </p>
                    </section>
                  )}

                  {/* BOOKING CONDITIONS */}

                  <section className="rounded-[23px] border border-[#ead8ba] bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0d9] text-[#b97919]">
                        <ShieldCheck size={20} />
                      </span>

                      <div>
                        <h2 className="text-[16px] font-bold">
                          Event Booking Conditions
                        </h2>

                        <p className="mt-1 text-[11px] text-[#887769]">
                          Read and accept before proceeding.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-[#f0d9ad] bg-[#fff6e5] p-4">
                      <p className="text-[11px] leading-[1.8] text-[#8c6a34]">
                        This is a demonstration checkout.
                        Policies require organizer confirmation
                        before actual ticket sales.
                      </p>
                    </div>

                    <div className="mt-5 space-y-5">
                      <div>
                        <h3 className="text-[12px] font-bold">
                          Cancellation & Refunds
                        </h3>

                        <p className="mt-2 whitespace-pre-line text-[12px] leading-[1.8] text-[#766554]">
                          {event.refundPolicy?.trim() ||
                            getRefundPolicyText(policy)}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-[12px] font-bold">
                          Service & Processing Fees
                        </h3>

                        <p className="mt-2 text-[12px] leading-[1.8] text-[#766554]">
                          {policy.serviceFeeRefundable
                            ? "Sample policy: service fees may be included in an eligible refund."
                            : "Sample policy: service and processing fees are non-refundable."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-[12px] font-bold">
                          Ticket Transfers
                        </h3>

                        <p className="mt-2 text-[12px] leading-[1.8] text-[#766554]">
                          {getTransferPolicyText(policy)}
                        </p>
                      </div>

                      {event.terms?.trim() ? (
                        <div>
                          <h3 className="text-[12px] font-bold">
                            Event Terms & Conditions
                          </h3>

                          <p className="mt-2 whitespace-pre-line text-[12px] leading-[1.8] text-[#766554]">
                            {event.terms}
                          </p>
                        </div>
                      ) : policy.additionalTerms.length > 0 ? (
                        <div>
                          <h3 className="text-[12px] font-bold">
                            Additional Conditions
                          </h3>

                          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[12px] leading-relaxed text-[#766554]">
                            {policy.additionalTerms.map(
                              (term, index) => (
                                <li key={index}>{term}</li>
                              )
                            )}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <label className="mt-6 flex cursor-pointer items-start gap-3 border-t border-[#eee3d5] pt-5">
                      <input
                        type="checkbox"
                        checked={acceptedPolicy}
                        onChange={(e) => {
                          setAcceptedPolicy(e.target.checked);
                          setError("");
                        }}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#d77b0a]"
                      />

                      <span className="text-[12px] leading-[1.8] text-[#5b4b3c]">
                        I have reviewed the event policies and
                        understand this is only a demonstration
                        booking, not a paid admission ticket.
                      </span>
                    </label>
                  </section>
                </div>
              ) : (
                /* STEP 2 — CUSTOMER DETAILS */

                <form
                  id="vizha-checkout-form"
                  onSubmit={handleConfirm}
                  noValidate
                  className="space-y-5"
                >
                  <section className="rounded-[23px] border border-[#eee2d4] bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0d9] text-[#c9790b]">
                        <UserRound size={20} />
                      </span>

                      <div>
                        <h2 className="text-[16px] font-bold">
                          Customer Contact Details
                        </h2>

                        <p className="mt-1 text-[11px] text-[#887969]">
                          Prefilled from your customer account.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-[12px] font-semibold">
                          First Name *
                        </span>

                        <input
                          type="text"
                          value={attendee.firstName}
                          onChange={(e) =>
                            updateAttendee(
                              "firstName",
                              e.target.value
                            )
                          }
                          autoComplete="given-name"
                          required
                          disabled={submitting}
                          className={inputClass}
                        />
                      </label>

                      <label className="block">
                        <span className="text-[12px] font-semibold">
                          Last Name *
                        </span>

                        <input
                          type="text"
                          value={attendee.lastName}
                          onChange={(e) =>
                            updateAttendee(
                              "lastName",
                              e.target.value
                            )
                          }
                          autoComplete="family-name"
                          required
                          disabled={submitting}
                          className={inputClass}
                        />
                      </label>

                      <label className="block">
                        <span className="text-[12px] font-semibold">
                          Email Address *
                        </span>

                        <input
                          type="email"
                          value={attendee.email}
                          onChange={(e) =>
                            updateAttendee(
                              "email",
                              e.target.value
                            )
                          }
                          autoComplete="email"
                          required
                          disabled={submitting}
                          className={inputClass}
                        />
                      </label>

                      <label className="block">
                        <span className="text-[12px] font-semibold">
                          International Phone Number *
                        </span>

                        <input
                          type="tel"
                          value={attendee.phone}
                          onChange={(e) =>
                            updateAttendee(
                              "phone",
                              e.target.value
                            )
                          }
                          placeholder="+94 77 123 4567"
                          autoComplete="tel"
                          required
                          disabled={submitting}
                          className={inputClass}
                        />

                        <p className="mt-1.5 text-[10px] leading-relaxed text-[#8a7b6c]">
                          Include the international country code,
                          such as +94, +44 or +41.
                        </p>
                      </label>
                    </div>

                    {customer && (
                      <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f0f8ee] px-4 py-3 text-[11px] text-[#418050]">
                        <CheckCircle2 size={16} />
                        Signed in as {customer.email}
                      </div>
                    )}
                  </section>

                  {/* PAYMENT METHOD */}

                  <section className="rounded-[23px] border border-[#eee2d4] bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0d9] text-[#c9790b]">
                        <CreditCard size={20} />
                      </span>

                      <div>
                        <h2 className="text-[16px] font-bold">
                          Demo Payment Method
                        </h2>

                        <p className="mt-1 text-[11px] text-[#897969]">
                          Fixed test card only.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={submitting || !isAuthenticated}
                      onClick={() => {
                        setError("");
                        setCardModalOpen(true);
                      }}
                      className="mt-5 flex w-full items-center gap-4 rounded-2xl border border-[#e6a24e] bg-[#fff8eb] p-4 text-left transition-all hover:border-[#de8914] hover:shadow-md disabled:opacity-50"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ffebd0] text-[#bc7418]">
                        <CreditCard size={22} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-bold">
                          Credit / Debit Card
                        </span>

                        <span className="mt-1 block text-[11px] text-[#877666]">
                          {demoCardReady
                            ? "Demo card selected •••• 4242"
                            : "Enter the supplied test card details"}
                        </span>
                      </span>

                      {demoCardReady ? (
                        <CheckCircle2
                          size={21}
                          className="text-green-600"
                        />
                      ) : (
                        <ArrowRight
                          size={19}
                          className="text-[#c9790b]"
                        />
                      )}
                    </button>

                    <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#fff4e3] p-4">
                      <Info
                        size={17}
                        className="mt-0.5 shrink-0 text-[#b2781e]"
                      />

                      <p className="text-[11px] leading-[1.8] text-[#816d50]">
                        No real payment will be charged.
                        Do not enter actual banking or card details.
                      </p>
                    </div>
                  </section>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => changeStep(1)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e8d7c2] bg-white px-5 py-2.5 text-[12px] font-bold text-[#9b6c2b] hover:bg-[#fff5e7] disabled:opacity-60"
                  >
                    <ArrowLeft size={16} />
                    Back to Ticket Selection
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT COLUMN — ORDER SUMMARY */}

            <aside className="min-w-0 lg:sticky lg:top-27.5">
              <div className="rounded-[23px] border border-[#eadfce] bg-white p-5 shadow-[0_10px_30px_rgba(93,57,20,0.065)] sm:p-7">
                <h2 className="text-[17px] font-bold">
                  Order Summary
                </h2>

                <div className="mt-5 flex gap-3 border-b border-[#eee5d9] pb-5">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-22 w-22 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0">
                    <p className="text-[13px] font-bold">
                      {event.title}
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#827466]">
                      <CalendarDays
                        size={14}
                        className="text-[#c9790b]"
                      />
                      {event.date}
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#827466]">
                      <Clock3
                        size={14}
                        className="text-[#c9790b]"
                      />
                      {event.time}
                    </p>

                    <p className="mt-1 flex items-start gap-1.5 text-[11px] text-[#827466]">
                      <MapPin
                        size={14}
                        className="shrink-0 text-[#c9790b]"
                      />
                      {event.venue}
                    </p>
                  </div>
                </div>

                {/* SELECTED TICKETS */}

                <div className="mt-5 rounded-xl border border-[#f1e5d7] bg-[#fffcf8] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9c8771]">
                    {bookingMode === "seat"
                      ? "Selected Seating"
                      : bookingMode === "zone"
                        ? "Selected Area"
                        : "Ticket Category"}
                  </p>

                  <p className="mt-2 text-[13px] font-bold">
                    {ticketLabel}
                  </p>

                  {bookingMode === "seat" &&
                    selectedSeats.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {selectedSeats.map((seat) => (
                          <span
                            key={seat.id}
                            className="rounded-md border border-[#ebd8ba] bg-[#fff1dd] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#9a671c]"
                          >
                            {seat.label}
                          </span>
                        ))}
                      </div>
                    )}

                  {bookingMode === "zone" &&
                    selectedZone &&
                    zonePrice !== null && (
                      <p className="mt-2 text-[11px] text-[#846a4d]">
                        {money(event.currency, zonePrice)} per ticket
                      </p>
                    )}

                  <p className="mt-3 text-[11px] text-[#897968]">
                    {ticketQuantity}{" "}
                    {ticketQuantity === 1 ? "ticket" : "tickets"}
                  </p>
                </div>

                {/* PRICE SUMMARY */}

                <div className="mt-5 space-y-3">
                  <div className="flex justify-between gap-3 text-[12px]">
                    <span className="text-[#827365]">
                      Ticket Subtotal
                    </span>

                    <span className="font-semibold">
                      {money(event.currency, subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-[12px]">
                    <span className="text-[#827365]">
                      Service Fee (5% Demo)
                    </span>

                    <span className="font-semibold">
                      {money(event.currency, serviceFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-[#eee2d5] pt-4">
                    <span className="text-[14px] font-bold">
                      Demo Total
                    </span>

                    <span className="text-[21px] font-extrabold text-[#c9790b]">
                      {money(event.currency, total)}
                    </span>
                  </div>
                </div>

                {/* VALIDATION ERROR */}

                {error && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[11px] leading-relaxed text-red-700"
                  >
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}

                {/* ACTIONS */}

                {step === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleProceed}
                      disabled={!selectionValid || !canProceed}
                      className="group mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#ffa115] to-[#e47a04] px-5 text-[13px] font-bold text-white shadow-[0_6px_17px_rgba(201,121,11,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Proceed to Customer Details
                      <ArrowRight size={17} />
                    </button>

                    {!selectionValid && (
                      <p className="mt-3 text-center text-[11px] leading-relaxed text-[#a77942]">
                        {selectionError}
                      </p>
                    )}

                    {selectionValid && !acceptedPolicy && (
                      <p className="mt-3 text-center text-[11px] text-[#a77942]">
                        Accept the event conditions to continue.
                      </p>
                    )}
                  </>
                ) : (
                  <button
                    type="submit"
                    form="vizha-checkout-form"
                    disabled={submitting || !isAuthenticated}
                    className="group mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#ffa115] to-[#e47a04] px-5 text-[13px] font-bold text-white shadow-[0_6px_17px_rgba(201,121,11,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <LockKeyhole size={16} />

                    {submitting
                      ? "Saving Demo Booking..."
                      : "Confirm Demo Booking"}

                    <ArrowRight size={17} />
                  </button>
                )}

                <p className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] text-[#948272]">
                  <ShieldCheck
                    size={15}
                    className="shrink-0 text-[#c9790b]"
                  />
                  Test mode · No real payment
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* TEST CARD POPUP */}

      {cardModalOpen &&
        step === 2 &&
        isAuthenticated &&
        customer && (
          <DemoCardModal
            customerName={customer.name || "Demo Customer"}
            amount={money(event.currency, total)}
            onClose={() => setCardModalOpen(false)}
            onSuccess={() => {
              setDemoCardReady(true);
              setCardModalOpen(false);
              setError("");
            }}
          />
        )}
    </div>
  );
}
