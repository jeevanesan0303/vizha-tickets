
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarSearch,
  Globe2,
  MapPin,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import {
  usePublicEvents,
  type EventDetails,
} from "@/data/events";

import {
  useLocationSelection,
} from "@/contexts/LocationContext";

import EventCard from "./EventCard";

/* ==========================================================
   VIZHATICKETS — UPCOMING EVENTS

   COMPLETE ADMIN + WEBSITE CONNECTED VERSION

   React + Vite + TypeScript

   FEATURES
   ----------------------------------------------------------
   - Shared Admin / Customer event catalogue
   - Reacts to admin event publishing
   - Reacts to admin event edits
   - Draft events are hidden
   - Custom admin ticket prices and banners
   - Global location filtering
   - Country and city matching
   - Embla carousel
   - Autoplay every 4 seconds
   - Pause on hover and keyboard focus
   - Continuous looping
   - Desktop: 4 visible cards
   - Tablet: 2 visible cards
   - Mobile: 1 visible card
   - Previous / Next buttons
   - Pagination indicators
   - Touch swipe
   - Reduced motion support
   - Empty location state

   IMPORTANT:
   Frontend data is browser-local until a real
   backend database is connected.
   ========================================================== */

const EASE = [
  0.21,
  0.47,
  0.32,
  0.98,
] as const;

const AUTOPLAY_DELAY = 4000;

/* ==========================================================
   TYPES
   ========================================================== */

interface EventCarouselProps {
  eventList: EventDetails[];
  reducedMotion: boolean;
}

/* ==========================================================
   EVENT CAROUSEL

   The carousel is kept separate from UpcomingEvents
   so it can be reset when events or location change.
   ========================================================== */

function EventCarousel({
  eventList,
  reducedMotion,
}: EventCarouselProps) {
  const eventCount = eventList.length;

  /* ========================================================
     REPEATED SLIDES

     Maintain a smooth carousel even with a small
     number of published events.

     Repetitions are display-only and do not create
     additional event records.
     ======================================================== */

  const carouselEvents = useMemo<EventDetails[]>(() => {
    if (eventCount <= 1) {
      return eventList;
    }

    const repetitions = Math.max(
      3,
      Math.ceil(12 / eventCount)
    );

    return Array.from(
      { length: repetitions },
      () => eventList
    ).flat();
  }, [eventList, eventCount]);

  /* ========================================================
     AUTOPLAY
     ======================================================== */

  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: AUTOPLAY_DELAY,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
        stopOnFocusIn: true,
        playOnInit: !reducedMotion,
      }),
    [reducedMotion]
  );

  /* ========================================================
     EMBLA
     ======================================================== */

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: eventCount > 1,
      align: "start",
      slidesToScroll: 1,
      containScroll: false,
      dragFree: false,
      duration: 26,
      watchDrag: eventCount > 1,
    },
    eventCount > 1 ? [autoplayPlugin] : []
  );

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const [canScrollPrev, setCanScrollPrev] =
    useState(false);

  const [canScrollNext, setCanScrollNext] =
    useState(false);

  /* ========================================================
     CAROUSEL CONTROLS
     ======================================================== */

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  /* ========================================================
     PAGINATION

     Each indicator represents a unique event.
     Duplicated slides don't create extra indicators.
     ======================================================== */

  const scrollTo = useCallback(
    (targetIndex: number) => {
      if (
        !emblaApi ||
        eventCount <= 0
      ) {
        return;
      }

      const currentIndex =
        emblaApi.selectedScrollSnap();

      const snapCount =
        emblaApi.scrollSnapList().length;

      if (!snapCount) return;

      const candidates: number[] = [];

      for (
        let index = targetIndex;
        index < snapCount;
        index += eventCount
      ) {
        candidates.push(index);
      }

      if (!candidates.length) return;

      const distance = (
        candidate: number
      ): number => {
        const direct = Math.abs(
          candidate - currentIndex
        );

        return Math.min(
          direct,
          snapCount - direct
        );
      };

      const closest = candidates.reduce(
        (best, candidate) =>
          distance(candidate) < distance(best)
            ? candidate
            : best
      );

      emblaApi.scrollTo(closest);
    },
    [emblaApi, eventCount]
  );

  /* ========================================================
     EMBLA SELECTION SYNC
     ======================================================== */

  useEffect(() => {
    if (!emblaApi) return;

    const updateSelection = () => {
      const index =
        emblaApi.selectedScrollSnap();

      setSelectedIndex(
        eventCount > 0
          ? index % eventCount
          : 0
      );

      setCanScrollPrev(
        emblaApi.canScrollPrev()
      );

      setCanScrollNext(
        emblaApi.canScrollNext()
      );
    };

    updateSelection();

    emblaApi.on(
      "select",
      updateSelection
    );

    emblaApi.on(
      "reInit",
      updateSelection
    );

    return () => {
      emblaApi.off(
        "select",
        updateSelection
      );

      emblaApi.off(
        "reInit",
        updateSelection
      );
    };
  }, [
    emblaApi,
    eventCount,
  ]);

  /* ========================================================
     REDUCED MOTION
     ======================================================== */

  useEffect(() => {
    if (reducedMotion) {
      autoplayPlugin.stop();
    }
  }, [
    autoplayPlugin,
    reducedMotion,
  ]);

  /* ========================================================
     SINGLE EVENT

     No carousel navigation required.
     ======================================================== */

  if (eventCount === 1) {
    return (
      <div
        className="
          grid grid-cols-1 gap-5
          sm:grid-cols-2 lg:grid-cols-4
        "
      >
        <div className="min-w-0">
          <EventCard
            event={eventList[0]}
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  /* ========================================================
     CAROUSEL RENDER
     ======================================================== */

  return (
    <>
      <div
        ref={emblaRef}
        aria-label="Upcoming events carousel"
        aria-roledescription="carousel"
        className="
          min-w-0 overflow-hidden touch-pan-y
        "
      >
        <div
          className="
            flex items-stretch gap-5
            lg:gap-4 xl:gap-6
          "
        >
          {carouselEvents.map(
            (event, index) => (
              <div
                key={`${event.id}-${index}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`Event ${
                  (index % eventCount) + 1
                } of ${eventCount}`}
                className="
                  min-w-0 shrink-0 grow-0
                  basis-full self-stretch
                  sm:basis-[calc((100%-20px)/2)]
                  lg:basis-[calc((100%-48px)/4)]
                  xl:basis-[calc((100%-72px)/4)]
                "
              >
                <div className="h-full">
                  <EventCard
                    event={event}
                    loading="lazy"
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ==================================================
          CAROUSEL CONTROLS
          ================================================== */}

      <div
        className="
          mt-7 flex flex-wrap
          items-center justify-center gap-4
        "
      >
        {/* PREVIOUS */}

        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous event"
          title="Previous event"
          className="
            flex h-9 w-9 items-center
            justify-center rounded-full
            border border-[#eedbc2]
            bg-white text-[#bd7418]
            transition-all
            hover:border-[#e9aa55]
            hover:bg-[#fff2dd]
            disabled:cursor-not-allowed
            disabled:opacity-40
            focus-visible:outline-2
            focus-visible:outline-[#c9790b]
          "
        >
          <ArrowLeft size={16} />
        </button>

        {/* PAGINATION */}

        <div
          className="
            flex items-center
            justify-center gap-2
          "
          aria-label="Choose upcoming event"
        >
          {eventList.map(
            (event, index) => (
              <button
                key={`${event.id}-indicator`}
                type="button"
                onClick={() =>
                  scrollTo(index)
                }
                aria-label={`Go to ${event.title}`}
                aria-current={
                  selectedIndex === index
                    ? "true"
                    : undefined
                }
                className={`
                  h-2 rounded-full
                  transition-all duration-300
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[#c9790b]
                  ${
                    selectedIndex === index
                      ? "w-7 bg-[#e98a09]"
                      : "w-2 bg-[#e7dccd] hover:bg-[#d6b68c]"
                  }
                `}
              />
            )
          )}
        </div>

        {/* NEXT */}

        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next event"
          title="Next event"
          className="
            flex h-9 w-9 items-center
            justify-center rounded-full
            border border-[#eedbc2]
            bg-white text-[#bd7418]
            transition-all
            hover:border-[#e9aa55]
            hover:bg-[#fff2dd]
            disabled:cursor-not-allowed
            disabled:opacity-40
            focus-visible:outline-2
            focus-visible:outline-[#c9790b]
          "
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <p
        className="
          mt-3 text-center
          text-[11px] text-[#a08b76]
          sm:hidden
        "
      >
        Swipe to explore more events
      </p>
    </>
  );
}

/* ==========================================================
   MAIN UPCOMING EVENTS COMPONENT
   ========================================================== */

export default function UpcomingEvents() {
  const prefersReducedMotion =
    useReducedMotion();

  const shouldReduceMotion =
    prefersReducedMotion === true;

  /* ========================================================
     SHARED PUBLISHED EVENTS

     IMPORTANT CORRECTION:

     OLD:
       import { events } from "@/data/events";

     NEW:
       const publishedEvents = usePublicEvents();

     This subscribes to changes from the admin dashboard.
     ======================================================== */

  const publishedEvents = usePublicEvents();

  /* ========================================================
     GLOBAL LOCATION

     Shared with HeroSection and EventsPage.
     ======================================================== */

  const {
    location,
    matchesLocation,
    resetLocation,
  } = useLocationSelection();

  /* ========================================================
     FILTER PUBLISHED EVENTS BY LOCATION

     Do not hide a published event merely because
     booking is disabled.

     Booking availability is a separate setting.

     The shared catalogue already excludes Draft events.
     ======================================================== */

  const upcomingEvents = useMemo(() => {
    return publishedEvents.filter(
      (event) =>
        matchesLocation(
          event.location,
          event.venue
        )
    );
  }, [
    publishedEvents,
    location,
    matchesLocation,
  ]);

  const eventCount =
    upcomingEvents.length;

  const isWorldwide =
    location.trim().toLowerCase() ===
    "worldwide";

  /* ========================================================
     FRIENDLY LOCATION LABEL
     ======================================================== */

  const displayLocation = useMemo(() => {
    if (isWorldwide) {
      return "Worldwide";
    }

    return (
      location.split(",")[0]?.trim() ||
      location
    );
  }, [
    location,
    isWorldwide,
  ]);

  /* ========================================================
     CAROUSEL RESET KEY

     Reset not only when the event ID changes, but also
     when the admin edits the event's visible details.

     This avoids retaining stale carousel slides.
     ======================================================== */

  const carouselKey = useMemo(() => {
    return JSON.stringify({
      location,
      events: upcomingEvents.map(
        (event) => ({
          id: event.id,
          title: event.title,
          image: event.image,
          price: event.price,
          currency: event.currency,
          date: event.date,
          venue: event.venue,
          bookingEnabled:
            event.bookingEnabled,
          ticketTiers:
            event.ticketTiers?.map(
              (tier) => ({
                id: tier.id,
                price: tier.price,
                available: tier.available,
              })
            ),
        })
      ),
    });
  }, [
    location,
    upcomingEvents,
  ]);

  /* ========================================================
     EVENTS PAGE LINK

     Pass selected location to /events.
     ======================================================== */

  const eventsPageUrl = useMemo(() => {
    if (isWorldwide) {
      return "/events";
    }

    const params = new URLSearchParams();

    params.set("loc", location);

    return `/events?${params.toString()}`;
  }, [
    isWorldwide,
    location,
  ]);

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <section
      aria-labelledby="upcoming-events-heading"
      className="
        relative isolate overflow-hidden
        bg-white py-12
        sm:py-14 lg:py-16
      "
    >
      <div
        className="
          vizha-container relative z-10
        "
      >
        {/* ==================================================
            SECTION HEADING
            ================================================== */}

        <div
          className="
            mb-7 flex flex-wrap
            items-end justify-between gap-5
            sm:mb-9 lg:mb-10
          "
        >
          {/* LEFT SIDE */}

          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 18,
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.5,
            }}
            transition={{
              duration: shouldReduceMotion
                ? 0
                : 0.55,
              ease: EASE,
            }}
            className="min-w-0"
          >
            {/* GOLD ACCENT */}

            <div
              aria-hidden="true"
              className="
                mb-3 h-0.75 w-9
                rounded-full bg-linear-to-r
                from-[#d07808] to-[#ff9a16]
              "
            />

            {/* HEADING */}

            <h2
              id="upcoming-events-heading"
              className="
                vizha-heading
                text-[29px] font-bold
                leading-[1.2]
                tracking-[-0.035em]
                text-[#161616]
                sm:text-[34px] lg:text-[38px]
              "
            >
              Upcoming Events
            </h2>

            <p
              className="
                mt-2 max-w-xl
                text-[13px] leading-relaxed
                text-[#777777] sm:text-sm
              "
            >
              {isWorldwide
                ? "Discover unforgettable experiences, live performances and celebrations near you."
                : `Discover events and live experiences in ${location}.`}
            </p>

            {/* LOCATION INDICATOR */}

            {!isWorldwide && (
              <div
                className="
                  mt-3 inline-flex max-w-full
                  items-center gap-2
                  rounded-full border
                  border-[#f0dfc6]
                  bg-[#fff7ea]
                  px-3 py-1.5
                  text-[#ac6a11]
                "
              >
                <MapPin
                  size={13}
                  className="shrink-0"
                />

                <span
                  className="
                    truncate text-[11px]
                    font-semibold
                  "
                  title={location}
                >
                  {location}
                </span>

                <button
                  type="button"
                  onClick={resetLocation}
                  aria-label="Clear location filter"
                  title="Clear location filter"
                  className="
                    ml-1 rounded-full
                    px-1.5 text-[11px]
                    font-bold text-[#a96f1b]
                    transition
                    hover:bg-[#f5e5cd]
                  "
                >
                  Clear
                </button>
              </div>
            )}
          </motion.div>

          {/* RIGHT SIDE */}

          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    x: 12,
                  }
            }
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: shouldReduceMotion
                ? 0
                : 0.5,
              delay: shouldReduceMotion
                ? 0
                : 0.1,
              ease: EASE,
            }}
            className="
              flex flex-wrap
              items-center gap-3
            "
          >
            <Link
              to={eventsPageUrl}
              aria-label="View all matching events"
              className="
                group inline-flex
                min-h-10 items-center
                justify-center gap-2
                whitespace-nowrap
                rounded-full
                border border-[#f2e2d0]
                bg-white px-4 py-2
                text-[12px] font-semibold
                text-[#b96a06]
                shadow-[0_3px_12px_rgba(171,101,20,0.04)]
                transition-all duration-300
                hover:border-[#eab772]
                hover:bg-[#fff8f0]
                hover:text-[#a85c00]
                hover:shadow-[0_5px_18px_rgba(171,101,20,0.10)]
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[#c9790b]
                sm:text-[13px]
              "
            >
              View All Events

              <ArrowRight
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>
          </motion.div>
        </div>

        {/* ==================================================
            PUBLISHED EVENT RESULTS
            ================================================== */}

        {eventCount > 0 ? (
          <EventCarousel
            key={carouselKey}
            eventList={upcomingEvents}
            reducedMotion={shouldReduceMotion}
          />
        ) : (
          /* ==================================================
              EMPTY LOCATION STATE
              ================================================== */

          <div
            className="
              flex min-h-72.5
              flex-col items-center
              justify-center
              rounded-3xl
              border border-dashed
              border-[#e9dccb]
              bg-[#fffcf8]
              px-6 py-12
              text-center
              sm:min-h-80
            "
          >
            <div
              className="
                flex h-16.25 w-16.25
                items-center justify-center
                rounded-[20px]
                bg-[#fff0d9]
                text-[#c9790b]
              "
            >
              <CalendarSearch
                size={30}
                strokeWidth={1.7}
              />
            </div>

            <h3
              className="
                mt-5 font-serif
                text-[22px] font-bold
                text-[#29221b]
                sm:text-[26px]
              "
            >
              {isWorldwide
                ? "No Published Events Yet"
                : `No Events in ${displayLocation}`}
            </h3>

            <p
              className="
                mt-3 max-w-122.5
                text-[12px] leading-[1.9]
                text-[#80776e]
                sm:text-[13px]
              "
            >
              {isWorldwide
                ? "There are currently no published events available. Check back for new experiences."
                : `There are currently no published events matching ${location}. Explore other locations or browse all available events.`}
            </p>

            <div
              className="
                mt-6 flex flex-wrap
                items-center justify-center gap-3
              "
            >
              {!isWorldwide && (
                <button
                  type="button"
                  onClick={resetLocation}
                  className="
                    inline-flex min-h-11.25
                    items-center justify-center
                    gap-2 rounded-full
                    bg-linear-to-r
                    from-[#f5a018] to-[#df7905]
                    px-6 text-[12px]
                    font-bold text-white
                    shadow-[0_7px_20px_rgba(201,121,11,0.16)]
                    transition-all
                    hover:brightness-95
                  "
                >
                  <Globe2 size={17} />

                  Show Worldwide Events
                </button>
              )}

              <Link
                to={eventsPageUrl}
                className="
                  inline-flex min-h-11.25
                  items-center justify-center
                  gap-2 rounded-full
                  border border-[#e7d9c5]
                  bg-white px-6
                  text-[12px] font-semibold
                  text-[#9b661d]
                  transition-all
                  hover:bg-[#fff3e3]
                "
              >
                Browse Events
                <ArrowRight size={16} />
              </Link>
            </div>

            {!isWorldwide && (
              <p
                className="
                  mt-5 max-w-110
                  text-[10px] leading-relaxed
                  text-[#a38e76]
                "
              >
                Only events matching your selected
                country or city are displayed.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
