
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  FileText,
  Heart,
  Hourglass,
  Info,
  Languages,
  LayoutGrid,
  Map,
  MapPin,
  Share2,
  ShieldCheck,
  Tag,
  Ticket,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

import {
  formatEventPrice,
  getEventBookingMode,
  getEventStartingPrice,
  getEventTicketTiers,
  hasEventBookingConfiguration,
  isEventSalesWindowOpen,
  useEventBySlug,
  type EventDetails,
  type EventTicketTier,
} from "../data/events";

/* ==========================================================
   VIZHATICKETS — PREMIUM EVENT DETAILS PAGE

   ADMIN + CUSTOMER CONNECTED VERSION

   React + Vite + TypeScript + React Router

   FEATURES
   ----------------------------------------------------------
   - Reactively loads published events by URL slug
   - Supports events created through Admin Dashboard
   - Updates when admin edits event information
   - Preserves existing public event URL structure
   - Displays event banner and description
   - Displays custom ticket categories
   - Shows ticket prices and configured capacity
   - Displays uploaded venue / stadium layout
   - Supports general, zone and seating configuration
   - Displays organizer and venue information
   - Displays event refund policy and terms
   - Respects booking enabled/disabled settings
   - Respects ticket sales opening/closing dates
   - Blocks unconfigured zone/seat booking flows
   - Maintains checkout URL compatibility
   - Preserves interested and share features
   - Responsive premium cream/gold interface

   IMPORTANT
   ----------------------------------------------------------
   This is a frontend preview.

   Configured ticket capacity is NOT live inventory.
   Payment verification and QR issuance need a backend.
   ========================================================== */

const INTERESTED_KEY = "vizha-event-interested";
const INTERESTED_EVENT = "vizha-interested-changed";

/* ==========================================================
   INTERESTED EVENT STORAGE
   ========================================================== */

function readInterested(slug: string): boolean {
  if (!slug) return false;

  try {
    const raw = localStorage.getItem(INTERESTED_KEY);

    const parsed: unknown = raw
      ? JSON.parse(raw)
      : [];

    return (
      Array.isArray(parsed) &&
      parsed.includes(slug)
    );
  } catch {
    return false;
  }
}

function toggleInterested(
  slug: string,
  currentlyInterested: boolean
): boolean {
  try {
    const raw = localStorage.getItem(INTERESTED_KEY);

    const parsed: unknown = raw
      ? JSON.parse(raw)
      : [];

    const list: string[] = Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string =>
            typeof item === "string"
        )
      : [];

    const next = currentlyInterested
      ? list.filter((item) => item !== slug)
      : [...new Set([...list, slug])];

    localStorage.setItem(
      INTERESTED_KEY,
      JSON.stringify(next)
    );

    window.dispatchEvent(
      new Event(INTERESTED_EVENT)
    );

    return true;
  } catch {
    return false;
  }
}

/* ==========================================================
   DISPLAY UTILITIES
   ========================================================== */

function formatDate(
  value?: string
): string {
  if (!value) {
    return "To be announced";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T12:00:00`);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }

  return value;
}

function formatSalesDate(
  value?: string
): string {
  if (!value) return "Not specified";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPrice(
  amount: number,
  currency: string
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

function getValidTicketTiers(
  event: EventDetails
): EventTicketTier[] {
  return getEventTicketTiers(event).filter(
    (tier) =>
      tier.available !== false &&
      Number.isFinite(tier.price) &&
      tier.price >= 0
  );
}

function getBookingMessage(
  event: EventDetails
): string | null {
  if (event.bookingEnabled === false) {
    const bookingMode = getEventBookingMode(event);

    if (
      bookingMode !== "general" &&
      !hasEventBookingConfiguration({
        ...event,
        bookingEnabled: true,
      })
    ) {
      return bookingMode === "zone"
        ? "Ticket zone selection has not been configured for this event."
        : "Numbered seating has not been configured for this event.";
    }

    return "Online booking is currently unavailable for this event.";
  }

  if (!hasEventBookingConfiguration(event)) {
    return "Ticket booking configuration is not yet complete.";
  }

  if (!getValidTicketTiers(event).length) {
    return "No ticket categories are currently available.";
  }

  if (!isEventSalesWindowOpen(event)) {
    const now = new Date();

    if (event.salesStart) {
      const start = new Date(event.salesStart);

      if (
        !Number.isNaN(start.getTime()) &&
        now < start
      ) {
        return `Ticket sales open on ${formatSalesDate(
          event.salesStart
        )}.`;
      }
    }

    if (event.salesEnd) {
      const end = new Date(event.salesEnd);

      if (
        !Number.isNaN(end.getTime()) &&
        now > end
      ) {
        return "Ticket sales for this event have ended.";
      }
    }

    return "Ticket sales are not currently available.";
  }

  return null;
}

/* ==========================================================
   REUSABLE INFORMATION ROW
   ========================================================== */

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-xl bg-[#fff3e2]
          text-[#c9790b]
        "
      >
        <Icon
          size={19}
          strokeWidth={1.8}
        />
      </span>

      <div className="min-w-0 pt-0.5">
        <p
          className="
            text-[11px] font-medium
            text-[#958679]
          "
        >
          {label}
        </p>

        <div
          className="
            mt-1 wrap-break-word
            text-[13px] font-semibold
            leading-relaxed
            text-[#30251b]
          "
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   SECTION HEADER
   ========================================================== */

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div
        className="
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-xl bg-[#fff1dc]
          text-[#c9790b]
        "
      >
        <Icon size={20} />
      </div>

      <div>
        <h2
          className="
            font-serif text-[23px]
            font-bold tracking-tight
            text-[#252018]
            sm:text-[26px]
          "
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className="
              mt-1 text-[12px]
              leading-relaxed text-[#968776]
            "
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/* ==========================================================
   TICKET CATEGORY CARD

   Displays configured pricing, NOT live ticket stock.
   ========================================================== */

function TicketTierCard({
  tier,
  currency,
}: {
  tier: EventTicketTier;
  currency: string;
}) {
  const isAvailable = tier.available !== false;

  return (
    <div
      className={`
        relative rounded-2xl
        border p-4 transition-all
        sm:p-5
        ${
          isAvailable
            ? "border-[#ead9c3] bg-[#fffdf9] hover:border-[#d5ac76] hover:shadow-[0_8px_24px_rgba(100,61,13,0.07)]"
            : "border-[#eee7df] bg-[#f9f6f2] opacity-75"
        }
      `}
    >
      <div
        className="
          flex flex-wrap items-start
          justify-between gap-3
        "
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="
                flex h-8 w-8 items-center
                justify-center rounded-lg
                bg-[#fff0d7]
                text-[#be7411]
              "
            >
              <Ticket size={17} />
            </span>

            <h3
              className="
                text-[15px] font-extrabold
                text-[#292117]
              "
            >
              {tier.name}
            </h3>
          </div>

          {tier.description && (
            <p
              className="
                mt-3 text-[12px]
                leading-[1.75] text-[#827464]
              "
            >
              {tier.description}
            </p>
          )}
        </div>

        <div className="text-right">
          <p
            className="
              text-[10px] font-medium
              text-[#9b8b79]
            "
          >
            Ticket Price
          </p>

          <strong
            className="
              mt-1 block text-[17px]
              font-extrabold text-[#b76c09]
              sm:text-[19px]
            "
          >
            {formatPrice(tier.price, currency)}
          </strong>
        </div>
      </div>

      <div
        className="
          mt-4 flex flex-wrap
          items-center gap-x-5 gap-y-2
          border-t border-[#f0e5d6] pt-3
        "
      >
        {typeof tier.capacity === "number" && (
          <span className="text-[11px] text-[#817466]">
            Configured capacity:{" "}
            <strong className="text-[#342b20]">
              {tier.capacity.toLocaleString()}
            </strong>
          </span>
        )}

        {typeof tier.maxQuantity === "number" && (
          <span className="text-[11px] text-[#817466]">
            Max per booking:{" "}
            <strong className="text-[#342b20]">
              {tier.maxQuantity}
            </strong>
          </span>
        )}

        <span
          className={`
            ml-auto rounded-full px-3 py-1
            text-[10px] font-bold
            ${
              isAvailable
                ? "bg-[#e9f6e9] text-[#33824b]"
                : "bg-[#f0e7df] text-[#8a7766]"
            }
          `}
        >
          {isAvailable
            ? "Category Enabled"
            : "Unavailable"}
        </span>
      </div>
    </div>
  );
}

/* ==========================================================
   EVENT NOT FOUND

   Draft, unpublished or deleted events are not
   accessible through the public catalogue.
   ========================================================== */

function EventNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf2]">
      <Header />

      <main
        className="
          mx-auto flex w-full max-w-xl
          flex-1 flex-col items-center
          justify-center px-5 py-20
          text-center
        "
      >
        <div
          className="
            flex h-20 w-20 items-center
            justify-center rounded-3xl
            bg-[#fff0d9] text-[#c9790b]
          "
        >
          <Ticket size={40} />
        </div>

        <h1
          className="
            mt-6 font-serif
            text-3xl font-bold
            text-[#241d16]
          "
        >
          Event Not Found
        </h1>

        <p
          className="
            mt-3 text-sm
            leading-[1.8] text-[#817365]
          "
        >
          This event may have been unpublished,
          removed, or its link may be incorrect.
        </p>

        <Link
          to="/events"
          className="
            mt-7 inline-flex items-center
            gap-2 rounded-full
            bg-[#c9790b] px-6 py-3
            text-sm font-bold text-white
            transition hover:bg-[#aa6407]
          "
        >
          <ArrowLeft size={17} />
          Back to Events
        </Link>
      </main>

      <Footer />
    </div>
  );
}

/* ==========================================================
   MAIN EVENT DETAILS COMPONENT

   CRITICAL:
   useEventBySlug() subscribes to the shared
   admin/customer event catalogue.

   Previous implementation used:
     getEventBySlug(slug)

   That did not cause React to update automatically
   after an admin event changed.
   ========================================================== */

export default function EventDetailsPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const event = useEventBySlug(slug);

  const [interestedOverrides, setInterestedOverrides] =
    useState<Record<string, boolean>>({});

  const [shareStatus, setShareStatus] =
    useState("");

  const [layoutPreviewOpen, setLayoutPreviewOpen] =
    useState(false);

  /* ========================================================
     UPDATE INTERACTION STATE WHEN URL CHANGES
     ======================================================== */

  useEffect(() => {
    setShareStatus("");
    setLayoutPreviewOpen(false);
  }, [slug]);

  if (!event) {
    return <EventNotFound />;
  }

  /* ========================================================
     DERIVED EVENT DETAILS
     ======================================================== */

  const interested =
    interestedOverrides[event.slug] ??
    readInterested(event.slug);

  const tags = event.tags?.length
    ? event.tags
    : [event.category];

  const ticketTiers = getEventTicketTiers(event);

  const enabledTiers = getValidTicketTiers(event);

  const startingPrice = enabledTiers.length
    ? formatEventPrice(
        event,
        getEventStartingPrice(event)
      )
    : "Not available";

  const bookingMode = getEventBookingMode(event);

  const bookingMessage = getBookingMessage(event);

  const canBook = bookingMessage === null;

  const bookingUrl =
    `/checkout?event=${encodeURIComponent(event.slug)}`;

  const venueLayoutImage =
    event.venueLayoutImage ||
    event.venueDetails?.mapImage ||
    event.seatingConfig?.mapImage ||
    "";

  const eventDate = event.dateISO
    ? formatDate(event.dateISO)
    : `${event.date} · Year to be confirmed`;

  const endDate = event.endDate
    ? formatDate(event.endDate)
    : "";

  const venueLabel = [
    event.venue,
    event.location,
  ]
    .filter(Boolean)
    .join(", ");

  const stagePosition =
    event.seatingConfig?.stagePosition ||
    "";

  /* ========================================================
     INTERESTED BUTTON
     ======================================================== */

  const handleInterested = () => {
    const saved = toggleInterested(
      event.slug,
      interested
    );

    if (saved) {
      setInterestedOverrides((current) => ({
        ...current,
        [event.slug]: !interested,
      }));
    }
  };

  /* ========================================================
     SHARE BUTTON
     ======================================================== */

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on VizhaTickets`,
          url,
        });

        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);

        setShareStatus(
          "Event link copied!"
        );
      } else {
        setShareStatus(
          "Sharing is unavailable."
        );
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      setShareStatus(
        "Unable to share this event."
      );
    }
  };

  /* ========================================================
     MAIN RENDER
     ======================================================== */

  return (
    <div
      className="
        min-h-screen bg-[#fffaf2]
        text-[#211b15]
      "
    >
      <Header />

      <main>
        {/* ==================================================
            BREADCRUMB
            ================================================== */}

        <div
          className="
            border-b border-[#f0e7db]
            bg-white
          "
        >
          <div
            className="
              vizha-container flex min-h-14
              items-center gap-2
              text-[12px]
            "
          >
            <Link
              to="/events"
              className="
                inline-flex items-center gap-1.5
                font-semibold text-[#b97817]
                hover:text-[#df8a11]
              "
            >
              <ArrowLeft size={15} />
              Events
            </Link>

            <span className="text-[#baa999]">
              /
            </span>

            <span
              className="
                truncate font-medium
                text-[#77685b]
              "
            >
              {event.title}
            </span>
          </div>
        </div>

        {/* ==================================================
            EVENT DETAILS
            ================================================== */}

        <section className="py-8 sm:py-10 lg:py-12">
          <div className="vizha-container">

            {/* EVENT HEADING */}

            <div
              className="
                mb-7 flex flex-wrap
                items-start justify-between gap-4
              "
            >
              <div className="max-w-220">
                <p
                  className="
                    mb-2 text-[11px] font-bold
                    uppercase tracking-[0.15em]
                    text-[#c9790b]
                  "
                >
                  Discover Live Experiences
                </p>

                <h1
                  className="
                    font-serif
                    text-[clamp(2rem,3.4vw,3.15rem)]
                    font-bold leading-[1.13]
                    tracking-tight
                  "
                >
                  {event.title}
                </h1>

                <p
                  className="
                    mt-3 flex items-start gap-2
                    text-[13px] text-[#877869]
                  "
                >
                  <MapPin
                    size={16}
                    className="
                      mt-0.5 shrink-0
                      text-[#c9790b]
                    "
                  />

                  {event.location}
                </p>
              </div>

              {/* SHARE */}

              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  aria-label="Share event"
                  className="
                    flex h-11 w-11
                    items-center justify-center
                    rounded-full border
                    border-[#eadbc8]
                    bg-white text-[#996924]
                    transition-all
                    hover:border-[#c9790b]
                    hover:bg-[#fff5e6]
                  "
                >
                  <Share2 size={19} />
                </button>

                {shareStatus && (
                  <span
                    role="status"
                    className="
                      text-[10px]
                      text-[#8a6b43]
                    "
                  >
                    {shareStatus}
                  </span>
                )}
              </div>
            </div>

            {/* ==================================================
                MAIN TWO-COLUMN LAYOUT
                ================================================== */}

            <div
              className="
                grid items-start gap-7
                lg:grid-cols-[minmax(0,1fr)_370px]
                xl:gap-9
              "
            >
              {/* ================================================
                  LEFT COLUMN
                  ================================================ */}

              <div className="min-w-0">

                {/* EVENT BANNER */}

                <div
                  className="
                    relative aspect-video
                    overflow-hidden rounded-[23px]
                    border border-[#eee2d4]
                    bg-[#181512]
                    shadow-[0_14px_35px_rgba(74,43,13,0.1)]
                  "
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="
                      h-full w-full object-cover
                    "
                  />

                  <div
                    className="
                      absolute inset-x-0 bottom-0
                      h-[30%]
                      bg-linear-to-t
                      from-black/25 to-transparent
                    "
                  />
                </div>

                {/* EVENT TAGS AND INTERESTED */}

                <div
                  className="
                    mt-5 flex flex-wrap
                    items-center justify-between gap-4
                  "
                >
                  <div
                    className="
                      flex flex-wrap
                      items-center gap-2
                    "
                  >
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="
                          inline-flex items-center
                          gap-1.5 rounded-lg
                          border border-[#efdbc0]
                          bg-[#fff0dc]
                          px-3 py-1.5
                          text-[11px] font-bold
                          text-[#ab6b18]
                        "
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}

                    {event.eventSource === "admin" && (
                      <span
                        className="
                          inline-flex items-center
                          gap-1.5 rounded-lg
                          border border-[#dfebd7]
                          bg-[#f0faeb]
                          px-3 py-1.5
                          text-[11px] font-bold
                          text-[#51834b]
                        "
                      >
                        <BadgeCheck size={13} />
                        Published Event
                      </span>
                    )}
                  </div>

                  <div
                    className="
                      flex items-center gap-3
                    "
                  >
                    {typeof event.interestedCount ===
                      "number" && (
                      <span
                        className="
                          text-[12px] font-semibold
                          text-[#746455]
                        "
                      >
                        {event.interestedCount.toLocaleString()}{" "}
                        interested
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleInterested}
                      aria-pressed={interested}
                      className={`
                        inline-flex min-h-10
                        items-center gap-2
                        rounded-full border px-4
                        text-[12px] font-bold
                        transition-all
                        ${
                          interested
                            ? "border-[#eab879] bg-[#fff0d9] text-[#b16b0e]"
                            : "border-[#e5c9a5] bg-white text-[#b67722] hover:bg-[#fff6e9]"
                        }
                      `}
                    >
                      {interested ? (
                        <Check size={16} />
                      ) : (
                        <Heart size={16} />
                      )}

                      {interested
                        ? "Interested"
                        : "I'm Interested"}
                    </button>
                  </div>
                </div>

                {/* ================================================
                    ABOUT EVENT
                    ================================================ */}

                <article
                  className="
                    mt-9 rounded-[22px]
                    border border-[#eee3d6]
                    bg-white p-6
                    shadow-[0_7px_22px_rgba(72,43,15,0.04)]
                    sm:p-8
                  "
                >
                  <SectionHeading
                    icon={FileText}
                    title="About The Event"
                    subtitle="Experience details and event information"
                  />

                  <p
                    className="
                      whitespace-pre-line
                      text-[14px] leading-[1.95]
                      text-[#62574b]
                    "
                  >
                    {event.fullDescription ||
                      event.description}
                  </p>

                  {event.organizer && (
                    <div
                      className="
                        mt-7 border-t
                        border-[#f0e6da] pt-5
                      "
                    >
                      <p
                        className="
                          text-[11px] font-semibold
                          uppercase tracking-wide
                          text-[#968678]
                        "
                      >
                        Presented By
                      </p>

                      <div
                        className="
                          mt-3 flex items-center
                          gap-3
                        "
                      >
                        <div
                          className="
                            flex h-10 w-10
                            items-center justify-center
                            rounded-xl bg-[#fff0da]
                            text-[#bd7819]
                          "
                        >
                          <Building2 size={20} />
                        </div>

                        <p
                          className="
                            text-[14px] font-bold
                            text-[#30251b]
                          "
                        >
                          {event.organizer}
                        </p>
                      </div>
                    </div>
                  )}
                </article>

                {/* ================================================
                    TICKET CATEGORIES
                    ================================================ */}

                <section
                  id="event-ticket-categories"
                  className="
                    mt-6 rounded-[22px]
                    border border-[#eee3d6]
                    bg-white p-6
                    shadow-[0_7px_22px_rgba(72,43,15,0.04)]
                    sm:p-8
                  "
                >
                  <div
                    className="
                      mb-5 flex flex-wrap
                      items-start justify-between
                      gap-3
                    "
                  >
                    <SectionHeading
                      icon={Ticket}
                      title="Ticket Categories"
                      subtitle="Explore the available ticket options and their prices"
                    />

                    <span
                      className="
                        rounded-full
                        border border-[#eedbbd]
                        bg-[#fff4e3] px-3 py-1.5
                        text-[11px] font-bold
                        text-[#a76a18]
                      "
                    >
                      {ticketTiers.length}{" "}
                      {ticketTiers.length === 1
                        ? "Category"
                        : "Categories"}
                    </span>
                  </div>

                  {ticketTiers.length > 0 ? (
                    <div className="space-y-3">
                      {ticketTiers.map((tier) => (
                        <TicketTierCard
                          key={tier.id}
                          tier={tier}
                          currency={event.currency}
                        />
                      ))}
                    </div>
                  ) : (
                    <p
                      className="
                        rounded-xl bg-[#fff7ed]
                        p-4 text-[12px]
                        text-[#866f54]
                      "
                    >
                      Ticket information has not been
                      published for this event.
                    </p>
                  )}

                  <div
                    className="
                      mt-5 flex items-start
                      gap-2 rounded-xl
                      bg-[#fff7ed] p-4
                    "
                  >
                    <Info
                      size={17}
                      className="
                        mt-0.5 shrink-0
                        text-[#c17d1e]
                      "
                    />

                    <p
                      className="
                        text-[11px]
                        leading-[1.75]
                        text-[#846e53]
                      "
                    >
                      Ticket capacities shown here are
                      configured event limits, not
                      real-time remaining quantities.
                      Final availability and payment
                      must be verified by the booking
                      backend.
                    </p>
                  </div>
                </section>

                {/* ================================================
                    VENUE INFORMATION
                    ================================================ */}

                <section
                  className="
                    mt-6 rounded-[22px]
                    border border-[#eee3d6]
                    bg-white p-6
                    shadow-[0_7px_22px_rgba(72,43,15,0.04)]
                    sm:p-8
                  "
                >
                  <SectionHeading
                    icon={MapPin}
                    title="Venue & Location"
                    subtitle="Plan your visit before the event"
                  />

                  <div
                    className="
                      grid gap-5
                      sm:grid-cols-2
                    "
                  >
                    <InfoItem
                      icon={MapPin}
                      label="Venue"
                      value={event.venue}
                    />

                    <InfoItem
                      icon={Map}
                      label="Location"
                      value={event.location}
                    />

                    <InfoItem
                      icon={LayoutGrid}
                      label="Admission Type"
                      value={
                        bookingMode === "general"
                          ? "General Admission"
                          : bookingMode === "zone"
                            ? "Zone / Area Selection"
                            : "Reserved Numbered Seating"
                      }
                    />

                    {stagePosition && (
                      <InfoItem
                        icon={UsersRound}
                        label="Stage Position"
                        value={stagePosition}
                      />
                    )}
                  </div>

                  {event.venueDetails
                    ?.entranceInstructions && (
                    <div
                      className="
                        mt-5 rounded-xl
                        bg-[#fff8ed] p-4
                      "
                    >
                      <p
                        className="
                          text-[11px] font-bold
                          text-[#a16a22]
                        "
                      >
                        Venue Instructions
                      </p>

                      <p
                        className="
                          mt-2 whitespace-pre-line
                          text-[12px] leading-[1.8]
                          text-[#796754]
                        "
                      >
                        {
                          event.venueDetails
                            .entranceInstructions
                        }
                      </p>
                    </div>
                  )}
                </section>

                {/* ================================================
                    UPLOADED VENUE / STADIUM MAP
                    ================================================ */}

                {venueLayoutImage && (
                  <section
                    className="
                      mt-6 rounded-[22px]
                      border border-[#eee3d6]
                      bg-white p-6
                      shadow-[0_7px_22px_rgba(72,43,15,0.04)]
                      sm:p-8
                    "
                  >
                    <SectionHeading
                      icon={Map}
                      title="Venue Seating Layout"
                      subtitle="View the stage, sections and venue arrangement"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setLayoutPreviewOpen(true)
                      }
                      className="
                        group block w-full
                        overflow-hidden rounded-2xl
                        border border-[#eadac8]
                        bg-[#f8f4ef]
                        text-left transition-all
                        hover:border-[#c99755]
                        hover:shadow-lg
                      "
                      aria-label="Enlarge venue layout"
                    >
                      <img
                        src={venueLayoutImage}
                        alt={`Venue seating layout for ${event.title}`}
                        className="
                          block max-h-125 w-full
                          object-contain
                          transition-transform
                          duration-300
                          group-hover:scale-[1.015]
                        "
                      />
                    </button>

                    <p
                      className="
                        mt-3 flex items-start
                        gap-2 text-[11px]
                        leading-[1.75]
                        text-[#897a69]
                      "
                    >
                      <Info
                        size={15}
                        className="
                          mt-0.5 shrink-0
                          text-[#c9790b]
                        "
                      />

                      This layout is a visual reference.
                      Ticket-zone or individual-seat
                      selection requires an actual
                      mapped booking configuration.
                    </p>
                  </section>
                )}

                {/* ================================================
                    REFUND POLICY
                    ================================================ */}

                {event.refundPolicy && (
                  <section
                    className="
                      mt-6 rounded-[22px]
                      border border-[#eee3d6]
                      bg-white p-6
                      shadow-[0_7px_22px_rgba(72,43,15,0.04)]
                      sm:p-8
                    "
                  >
                    <SectionHeading
                      icon={ShieldCheck}
                      title="Refund & Cancellation Policy"
                    />

                    <p
                      className="
                        whitespace-pre-line
                        text-[13px] leading-[1.9]
                        text-[#655a4f]
                      "
                    >
                      {event.refundPolicy}
                    </p>
                  </section>
                )}

                {/* ================================================
                    TERMS & CONDITIONS
                    ================================================ */}

                {event.terms && (
                  <section
                    className="
                      mt-6 rounded-[22px]
                      border border-[#eee3d6]
                      bg-white p-6
                      shadow-[0_7px_22px_rgba(72,43,15,0.04)]
                      sm:p-8
                    "
                  >
                    <SectionHeading
                      icon={FileText}
                      title="Terms & Conditions"
                    />

                    <p
                      className="
                        whitespace-pre-line
                        text-[13px] leading-[1.9]
                        text-[#655a4f]
                      "
                    >
                      {event.terms}
                    </p>
                  </section>
                )}

                {/* ================================================
                    BOOKING NOTICE
                    ================================================ */}

                <div
                  className="
                    mt-6 flex items-start gap-3
                    rounded-2xl border
                    border-[#f0dfc2]
                    bg-[#fff6e8] p-4
                  "
                >
                  <ShieldCheck
                    size={19}
                    className="
                      mt-0.5 shrink-0
                      text-[#b7781e]
                    "
                  />

                  <p
                    className="
                      text-[12px] leading-relaxed
                      text-[#806d53]
                    "
                  >
                    This website currently uses a
                    frontend demonstration checkout.
                    No live payment is processed.
                    Production bookings and QR
                    tickets must be issued only
                    after backend-verified successful
                    payment.
                  </p>
                </div>
              </div>

              {/* ================================================
                  RIGHT COLUMN — STICKY EVENT PANEL
                  ================================================ */}

              <aside
                className="
                  lg:sticky lg:top-27
                "
              >
                <div
                  className="
                    overflow-hidden rounded-3xl
                    border border-[#eadac5]
                    bg-white
                    shadow-[0_12px_36px_rgba(79,49,16,0.075)]
                  "
                >
                  <div
                    className="
                      border-b border-[#f1e8dc]
                      bg-[#fffcf7]
                      px-6 py-5
                    "
                  >
                    <h2
                      className="
                        font-serif
                        text-[21px] font-bold
                      "
                    >
                      Event Information
                    </h2>

                    <p
                      className="
                        mt-1 text-[11px]
                        text-[#948274]
                      "
                    >
                      Everything you need to know
                    </p>
                  </div>

                  <div className="space-y-5 px-6 py-6">
                    <InfoItem
                      icon={CalendarDays}
                      label="Event Date"
                      value={eventDate}
                    />

                    <InfoItem
                      icon={Clock3}
                      label="Event Time"
                      value={
                        event.time ||
                        "To be announced"
                      }
                    />

                    {endDate && (
                      <InfoItem
                        icon={CalendarClock}
                        label="Event End Date"
                        value={endDate}
                      />
                    )}

                    {event.endTime && (
                      <InfoItem
                        icon={Clock3}
                        label="End Time"
                        value={event.endTime}
                      />
                    )}

                    <InfoItem
                      icon={Hourglass}
                      label="Duration"
                      value={
                        event.duration ||
                        "To be announced"
                      }
                    />

                    <InfoItem
                      icon={UsersRound}
                      label="Age Limit"
                      value={
                        event.ageLimit ||
                        "To be announced"
                      }
                    />

                    <InfoItem
                      icon={Languages}
                      label="Language"
                      value={
                        event.language ||
                        "To be announced"
                      }
                    />

                    <InfoItem
                      icon={Ticket}
                      label="Event Type"
                      value={
                        event.eventType ||
                        event.category
                      }
                    />

                    <InfoItem
                      icon={MapPin}
                      label="Venue & Location"
                      value={venueLabel}
                    />

                    {event.organizer && (
                      <InfoItem
                        icon={Building2}
                        label="Organizer"
                        value={event.organizer}
                      />
                    )}

                    {/* TICKET SUMMARY */}

                    <div
                      className="
                        border-t border-[#f0e5d8]
                        pt-5
                      "
                    >
                      <p
                        className="
                          text-[11px] font-medium
                          text-[#8b7b6b]
                        "
                      >
                        Tickets starting from
                      </p>

                      <p
                        className="
                          mt-1 text-[25px]
                          font-extrabold
                          tracking-tight
                          text-[#c9790b]
                        "
                      >
                        {startingPrice}
                      </p>

                      <p
                        className="
                          mt-1 text-[11px]
                          text-[#9a8a79]
                        "
                      >
                        {enabledTiers.length}{" "}
                        {enabledTiers.length === 1
                          ? "ticket category"
                          : "ticket categories"}
                      </p>

                      <a
                        href="#event-ticket-categories"
                        className="
                          mt-3 inline-flex
                          items-center gap-1.5
                          text-[12px] font-bold
                          text-[#aa690d]
                          hover:text-[#d3881d]
                        "
                      >
                        View Ticket Categories
                        <ArrowRight size={14} />
                      </a>

                      {/* BOOK NOW */}

                      {canBook ? (
                        <Link
                          to={bookingUrl}
                          className="
                            group mt-5 flex
                            min-h-12.5 w-full
                            items-center justify-center
                            gap-2 rounded-xl
                            bg-linear-to-r
                            from-[#f6a019]
                            to-[#dc7600]
                            px-5 text-[13px]
                            font-bold text-white
                            shadow-[0_8px_19px_rgba(201,121,11,0.2)]
                            transition-all duration-300
                            hover:-translate-y-0.5
                            hover:shadow-lg
                          "
                        >
                          <Ticket size={18} />

                          Book Now

                          <ArrowRight
                            size={17}
                            className="
                              transition-transform
                              group-hover:translate-x-1
                            "
                          />
                        </Link>
                      ) : (
                        <div
                          className="
                            mt-5 rounded-xl
                            border border-[#e9ddd0]
                            bg-[#f7f2ec]
                            px-4 py-4
                            text-center
                          "
                        >
                          <p
                            className="
                              text-[12px]
                              font-bold
                              text-[#756456]
                            "
                          >
                            Booking Unavailable
                          </p>

                          <p
                            className="
                              mt-2 text-[11px]
                              leading-[1.65]
                              text-[#928272]
                            "
                          >
                            {bookingMessage}
                          </p>
                        </div>
                      )}

                      <p
                        className="
                          mt-3 text-center
                          text-[10px]
                          text-[#928577]
                        "
                      >
                        Demo checkout only · No live payment
                      </p>
                    </div>

                    {/* SALES DATES */}

                    {(event.salesStart ||
                      event.salesEnd) && (
                      <div
                        className="
                          space-y-3
                          border-t border-[#f0e5d8]
                          pt-5
                        "
                      >
                        <h3
                          className="
                            text-[12px]
                            font-extrabold
                            text-[#4b3e2e]
                          "
                        >
                          Ticket Sales Schedule
                        </h3>

                        {event.salesStart && (
                          <InfoItem
                            icon={CalendarClock}
                            label="Sales Open"
                            value={formatSalesDate(
                              event.salesStart
                            )}
                          />
                        )}

                        {event.salesEnd && (
                          <InfoItem
                            icon={CalendarClock}
                            label="Sales Close"
                            value={formatSalesDate(
                              event.salesEnd
                            )}
                          />
                        )}
                      </div>
                    )}

                    {/* PAYMENT SAFETY NOTE */}

                    <div
                      className="
                        flex items-start gap-2
                        rounded-xl
                        bg-[#fff8ed] p-3
                      "
                    >
                      <CreditCard
                        size={16}
                        className="
                          mt-0.5 shrink-0
                          text-[#bb791b]
                        "
                      />

                      <p
                        className="
                          text-[10px]
                          leading-[1.7]
                          text-[#88745c]
                        "
                      >
                        A real booking and its QR
                        code must only be created
                        after successful payment
                        verification.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ==================================================
          FULL-SCREEN VENUE LAYOUT PREVIEW
          ================================================== */}

      {layoutPreviewOpen && venueLayoutImage && (
        <div
          role="presentation"
          className="
            fixed inset-0 z-200
            flex items-center justify-center
            bg-black/85 p-4
            backdrop-blur-md
            sm:p-8
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setLayoutPreviewOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Venue layout preview"
            className="
              relative flex max-h-[94dvh]
              w-full max-w-6xl
              flex-col overflow-hidden
              rounded-2xl bg-white
            "
          >
            <div
              className="
                flex items-center
                justify-between gap-3
                border-b border-[#eee2d5]
                px-5 py-4
              "
            >
              <div>
                <h2
                  className="
                    text-[15px]
                    font-extrabold
                    text-[#241d17]
                  "
                >
                  Venue Seating Layout
                </h2>

                <p
                  className="
                    mt-1 text-[11px]
                    text-[#837669]
                  "
                >
                  {event.title}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close layout preview"
                onClick={() =>
                  setLayoutPreviewOpen(false)
                }
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl bg-[#fff1e1]
                  text-[#a66b19]
                  hover:bg-[#ffe6c4]
                "
              >
                <X size={21} />
              </button>
            </div>

            <div
              className="
                min-h-0 flex-1
                overflow-auto
                bg-[#f4f0eb] p-3
                sm:p-6
              "
            >
              <img
                src={venueLayoutImage}
                alt={`Enlarged seating layout for ${event.title}`}
                className="
                  mx-auto block max-h-[72dvh]
                  max-w-full object-contain
                "
              />
            </div>

            <div
              className="
                border-t border-[#eee2d5]
                px-5 py-3
                text-[11px]
                leading-relaxed
                text-[#847669]
              "
            >
              Reference layout only. Seat availability
              must be confirmed during booking.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
