
import { useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  Hourglass,
  Languages,
  MapPin,
  Share2,
  ShieldCheck,
  Tag,
  Ticket,
  UsersRound,
} from "lucide-react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

import {
  getEventBySlug,
  formatEventPrice,
} from "../data/events";

/* ==========================================================
   VIZHATICKETS — PREMIUM EVENT DETAILS PAGE

   React + Vite + TypeScript + React Router

   - Dynamic event based on URL slug
   - Large cinematic event artwork
   - Event description and category tags
   - Favorite / interested control
   - Share event
   - Sticky event information panel
   - Ticket price and Book Now button
   - Responsive mobile layout
   - Existing checkout integration
   ========================================================== */

const INTERESTED_KEY = "vizha-event-interested";

function readInterested(slug: string): boolean {
  try {
    const raw = localStorage.getItem(INTERESTED_KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(data) && data.includes(slug);
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
    const data: unknown = raw ? JSON.parse(raw) : [];

    const list: string[] = Array.isArray(data)
      ? data.filter(
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

    return true;
  } catch {
    return false;
  }
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff3e2] text-[#c9790b]">
        <Icon size={19} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-medium text-[#958679]">
          {label}
        </p>

        <p className="mt-1 wrap-break-word text-[13px] font-semibold leading-relaxed text-[#30251b]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================
   MAIN COMPONENT
   ========================================================== */

export default function EventDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

  const event = getEventBySlug(slug);

  const [interestedOverrides, setInterestedOverrides] =
    useState<Record<string, boolean>>({});

  const [shareStatus, setShareStatus] = useState("");

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fffaf2]">
        <Header />

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
          <Ticket
            size={48}
            className="text-[#c9790b]"
          />

          <h1 className="mt-5 font-serif text-3xl font-bold">
            Event Not Found
          </h1>

          <p className="mt-3 text-sm text-[#817365]">
            This event is unavailable or the event link
            is incorrect.
          </p>

          <Link
            to="/events"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#c9790b] px-6 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={17} />
            Back to Events
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  const interested =
    interestedOverrides[event.slug] ??
    readInterested(event.slug);

  const tags =
    event.tags?.length
      ? event.tags
      : [event.category];

  const bookingUrl =
    `/checkout?event=${encodeURIComponent(event.slug)}`;

  const startingPrice = formatEventPrice(event);

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
        setShareStatus("Link copied!");
      } else {
        setShareStatus("Sharing is unavailable.");
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      setShareStatus("Unable to share this event.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf2] text-[#211b15]">
      <Header />

      <main>
        {/* BREADCRUMB */}

        <div className="border-b border-[#f0e7db] bg-white">
          <div className="vizha-container flex min-h-14 items-center gap-2 text-[12px]">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 font-semibold text-[#b97817] hover:text-[#df8a11]"
            >
              <ArrowLeft size={15} />
              Events
            </Link>

            <span className="text-[#baa999]">/</span>

            <span className="truncate font-medium text-[#77685b]">
              {event.title}
            </span>
          </div>
        </div>

        <section className="py-8 sm:py-10 lg:py-12">
          <div className="vizha-container">

            {/* EVENT HEADING */}

            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-220">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#c9790b]">
                  Discover Live Experiences
                </p>

                <h1 className="font-serif text-[clamp(2rem,3.4vw,3.15rem)] font-bold leading-[1.13] tracking-tight">
                  {event.title}
                </h1>

                <p className="mt-3 flex items-center gap-2 text-[13px] text-[#877869]">
                  <MapPin
                    size={16}
                    className="text-[#c9790b]"
                  />
                  {event.location}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share event"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadbc8] bg-white text-[#996924] transition-all hover:border-[#c9790b] hover:bg-[#fff5e6]"
                >
                  <Share2 size={19} />
                </button>

                {shareStatus && (
                  <span
                    role="status"
                    className="text-[10px] text-[#8a6b43]"
                  >
                    {shareStatus}
                  </span>
                )}
              </div>
            </div>

            {/* MAIN TWO-COLUMN LAYOUT */}

            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_370px] xl:gap-9">

              {/* LEFT SIDE */}

              <div className="min-w-0">

                {/* EVENT POSTER */}

                <div className="relative aspect-video overflow-hidden rounded-[23px] border border-[#eee2d4] bg-[#181512] shadow-[0_14px_35px_rgba(74,43,13,0.1)]">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-linear-to-t from-black/20 to-transparent" />
                </div>

                {/* TAGS AND INTEREST */}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#efdbc0] bg-[#fff0dc] px-3 py-1.5 text-[11px] font-bold text-[#ab6b18]"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    {typeof event.interestedCount === "number" && (
                      <span className="text-[12px] font-semibold text-[#746455]">
                        {event.interestedCount.toLocaleString()}
                        {" "}interested
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleInterested}
                      aria-pressed={interested}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[12px] font-bold transition-all ${
                        interested
                          ? "border-[#eab879] bg-[#fff0d9] text-[#b16b0e]"
                          : "border-[#e5c9a5] bg-white text-[#b67722] hover:bg-[#fff6e9]"
                      }`}
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

                {/* ABOUT EVENT */}

                <article className="mt-9 rounded-[22px] border border-[#eee3d6] bg-white p-6 shadow-[0_7px_22px_rgba(72,43,15,0.04)] sm:p-8">

                  <div className="mb-5 flex items-center gap-3">
                    <div className="h-8 w-1 rounded-full bg-[#e58c16]" />

                    <h2 className="font-serif text-[26px] font-bold tracking-tight">
                      About The Event
                    </h2>
                  </div>

                  <p className="whitespace-pre-line text-[14px] leading-[1.95] text-[#62574b]">
                    {event.fullDescription ||
                      event.description}
                  </p>

                  {event.organizer && (
                    <div className="mt-7 border-t border-[#f0e6da] pt-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#968678]">
                        Presented By
                      </p>

                      <p className="mt-2 text-[14px] font-bold">
                        {event.organizer}
                      </p>
                    </div>
                  )}
                </article>

                {/* BOOKING NOTES */}

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f0dfc2] bg-[#fff6e8] p-4">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-[#b7781e]"
                  />

                  <p className="text-[12px] leading-relaxed text-[#806d53]">
                    Bookings currently use demo checkout.
                    No real payment will be charged and no
                    admission ticket will be issued.
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE — STICKY INFO PANEL */}

              <aside className="lg:sticky lg:top-27">

                <div className="overflow-hidden rounded-3xl border border-[#eadac5] bg-white shadow-[0_12px_36px_rgba(79,49,16,0.075)]">

                  <div className="border-b border-[#f1e8dc] bg-[#fffcf7] px-6 py-5">
                    <h2 className="font-serif text-[21px] font-bold">
                      Event Information
                    </h2>

                    <p className="mt-1 text-[11px] text-[#948274]">
                      Everything you need to know
                    </p>
                  </div>

                  <div className="space-y-5 px-6 py-6">

                    <InfoItem
                      icon={CalendarDays}
                      label="Event Date"
                      value={
                        event.dateISO
                          ? new Date(
                              `${event.dateISO}T12:00:00`
                            ).toLocaleDateString(
                              "en-LK",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : `${event.date} · Year to be confirmed`
                      }
                    />

                    <InfoItem
                      icon={Clock3}
                      label="Event Time"
                      value={event.time}
                    />

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
                      value={`${event.venue}, ${event.location}`}
                    />

                    {/* PRICE AND BOOKING */}

                    <div className="border-t border-[#f0e5d8] pt-5">

                      <div className="flex flex-wrap items-end justify-between gap-3">

                        <div>
                          <p className="text-[11px] font-medium text-[#8b7b6b]">
                            Tickets starting from
                          </p>

                          <p className="mt-1 text-[24px] font-extrabold tracking-tight text-[#c9790b]">
                            {startingPrice}
                          </p>

                          <p className="mt-1 text-[10px] text-[#9a8a79]">
                            Additional fees may apply
                          </p>
                        </div>
                      </div>

                      {event.bookingEnabled !== false ? (
                        <Link
                          to={bookingUrl}
                          className="group mt-5 flex min-h-12.5 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#f6a019] to-[#dc7600] px-5 text-[13px] font-bold text-white shadow-[0_8px_19px_rgba(201,121,11,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <Ticket size={18} />

                          Book Now

                          <ArrowRight
                            size={17}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </Link>
                      ) : (
                        <div className="mt-5 rounded-xl bg-[#f3eee8] px-4 py-3 text-center text-[12px] font-semibold text-[#817469]">
                          Booking Unavailable
                        </div>
                      )}

                      <p className="mt-3 text-center text-[10px] text-[#928577]">
                        Demo booking only · No real payment
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
    </div>
  );
}
