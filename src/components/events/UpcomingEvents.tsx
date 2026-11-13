
"use client";

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

import { events } from "@/data/events";

import {
  useLocationSelection,
} from "@/contexts/LocationContext";

import EventCard from "./EventCard";

import type { EventDetails } from "@/data/events";

/* ==========================================================
   VIZHATICKETS — UPCOMING EVENTS

   React + Vite + TypeScript

   FEATURES:
   ----------------------------------------------------------
   - Global location filtering
   - Filters by country or city
   - Automatically updates after location selection
   - Preserves event card design
   - Auto-scroll right to left
   - One card per transition
   - Autoplay every 4 seconds
   - Continuous looping
   - Desktop: 4 visible cards
   - Tablet: 2 visible cards
   - Mobile: 1 visible card
   - Previous / Next controls
   - Pagination indicators
   - Touch swipe support
   - Pause on hover
   - Reduced-motion support
   - Helpful empty state for locations with no events
   - Reset location to Worldwide
   - No fictional events or locations

   ========================================================== */

const EASE = [
  0.21,
  0.47,
  0.32,
  0.98,
] as const;

const AUTOPLAY_DELAY = 4000;

/* ==========================================================
   EVENT CAROUSEL PROPS
   ========================================================== */

interface EventCarouselProps {
  eventList: EventDetails[];
  reducedMotion: boolean;
}

/* ==========================================================
   EVENT CAROUSEL

   Separated from UpcomingEvents so a change in the
   location can safely reset the carousel.

   IMPORTANT:
   A carousel is rendered only when there are at
   least two matching events.

   ========================================================== */

function EventCarousel({
  eventList,
  reducedMotion,
}: EventCarouselProps) {
  const eventCount = eventList.length;

  /* ========================================================
     REPEATED SLIDES

     The current demo catalogue is small.

     Repeating the matching sequence makes looping
     practical when the desktop displays four cards.

     All duplicated slides belong to the same
     matching location.

     ======================================================== */

  const carouselEvents = useMemo(() => {
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
     EMBLA INITIALIZATION
     ======================================================== */

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: eventCount > 1,

      align: "start",

      slidesToScroll: 1,

      containScroll: false,

      dragFree: false,

      duration: 26,
    },
    eventCount > 1 ? [autoplayPlugin] : []
  );

  /* ========================================================
     CAROUSEL STATE
     ======================================================== */

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const [canScrollPrev, setCanScrollPrev] =
    useState(false);

  const [canScrollNext, setCanScrollNext] =
    useState(false);

  /* ========================================================
     PREVIOUS / NEXT
     ======================================================== */

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  /* ========================================================
     PAGINATION NAVIGATION

     Each indicator represents a unique event,
     rather than an internally repeated slide.

     ======================================================== */

  const scrollTo = useCallback(
    (targetIndex: number) => {
      if (!emblaApi || eventCount === 0) {
        return;
      }

      const currentIndex =
        emblaApi.selectedScrollSnap();

      const snapCount =
        emblaApi.scrollSnapList().length;

      const candidates: number[] = [];

      for (
        let index = targetIndex;
        index < snapCount;
        index += eventCount
      ) {
        candidates.push(index);
      }

      if (!candidates.length) {
        return;
      }

      const closest = candidates.reduce(
        (best, candidate) => {
          const bestDistance = Math.min(
            Math.abs(best - currentIndex),
            snapCount -
              Math.abs(best - currentIndex)
          );

          const candidateDistance = Math.min(
            Math.abs(candidate - currentIndex),
            snapCount -
              Math.abs(candidate - currentIndex)
          );

          return candidateDistance < bestDistance
            ? candidate
            : best;
        }
      );

      emblaApi.scrollTo(closest);
    },
    [emblaApi, eventCount]
  );

  /* ========================================================
     SELECTION SYNCHRONIZATION
     ======================================================== */

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const updateSelection = () => {
      const current =
        emblaApi.selectedScrollSnap();

      setSelectedIndex(
        eventCount > 0
          ? current % eventCount
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
  }, [emblaApi, eventCount]);

  /* ========================================================
     REDUCED MOTION

     Users who prefer reduced motion should not
     have an automatically moving carousel.

     ======================================================== */

  useEffect(() => {
    if (reducedMotion) {
      autoplayPlugin.stop();
    }
  }, [autoplayPlugin, reducedMotion]);

  /* ========================================================
     SINGLE EVENT

     No carousel animation is needed when only one
     event matches the selected country or city.

     ======================================================== */

  if (eventCount === 1) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      {/* ================================================
          EVENT CAROUSEL
          ================================================ */}

      <div
        ref={emblaRef}
        aria-label="Upcoming events carousel"
        aria-roledescription="carousel"
        className="
          min-w-0
          overflow-hidden
          touch-pan-y
        "
      >
        {/* CAROUSEL TRACK */}

        <div
          className="
            flex
            items-stretch
            gap-5
            lg:gap-4
            xl:gap-6
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
                  min-w-0
                  shrink-0
                  grow-0
                  basis-full
                  self-stretch
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

      {/* ================================================
          NAVIGATION BELOW CAROUSEL
          ================================================ */}

      <div
        className="
          mt-7
          flex
          flex-wrap
          items-center
          justify-center
          gap-4
        "
      >
        {/* PREVIOUS BUTTON */}

        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous event"
          title="Previous event"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-[#eedbc2]
            bg-white
            text-[#bd7418]
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
            flex
            items-center
            justify-center
            gap-2
          "
          aria-label="Choose upcoming event"
        >
          {eventList.map((event, index) => (
            <button
              key={event.id}
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
                h-2
                rounded-full
                transition-all
                duration-300
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
          ))}
        </div>

        {/* NEXT BUTTON */}

        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next event"
          title="Next event"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-[#eedbc2]
            bg-white
            text-[#bd7418]
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

      {/* MOBILE HELP */}

      <p
        className="
          mt-3
          text-center
          text-[11px]
          text-[#a08b76]
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
     GLOBAL LOCATION

     Shared with HeroSection.tsx.

     Examples:
     - Worldwide
     - Sri Lanka
     - Jaffna, Sri Lanka
     - London, United Kingdom

     ======================================================== */

  const {
    location,
    matchesLocation,
    resetLocation,
  } = useLocationSelection();

  /* ========================================================
     FILTER AVAILABLE EVENTS

     The event must:
     1. Have booking enabled
     2. Match selected country or city

     This re-runs whenever the global location changes.

     ======================================================== */

  const upcomingEvents = useMemo(() => {
    return events.filter((event) => {
      if (event.bookingEnabled === false) {
        return false;
      }

      return matchesLocation(
        event.location,
        event.venue
      );
    });
  }, [matchesLocation]);

  const eventCount =
    upcomingEvents.length;

  const isWorldwide =
    location.trim().toLowerCase() ===
    "worldwide";

  /* ========================================================
     LOCATION DISPLAY

     Show a friendly place name inside the empty state.

     Example:
     London, United Kingdom -> London

     ======================================================== */

  const displayLocation = useMemo(() => {
    if (isWorldwide) {
      return "Worldwide";
    }

    return (
      location.split(",")[0]?.trim() ||
      location
    );
  }, [location, isWorldwide]);

  /* ========================================================
     CAROUSEL RESET KEY

     When the selected country/city changes, the
     carousel is remounted with its new event data.

     This avoids stale slides, old positions and
     animation state from the previous location.

     ======================================================== */

  const carouselKey = useMemo(() => {
    return [
      location,
      ...upcomingEvents.map(
        (event) => event.id
      ),
    ].join("|");
  }, [location, upcomingEvents]);

  /* ========================================================
     EVENTS PAGE URL

     Pass the location to the Events page so the
     same location can be applied there.

     ======================================================== */

  const eventsPageUrl = useMemo(() => {
    if (isWorldwide) {
      return "/events";
    }

    const params = new URLSearchParams();

    params.set("loc", location);

    return `/events?${params.toString()}`;
  }, [isWorldwide, location]);

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <section
      aria-labelledby="upcoming-events-heading"
      className="
        relative
        isolate
        overflow-hidden
        bg-white
        py-12
        sm:py-14
        lg:py-16
      "
    >
      <div
        className="
          vizha-container
          relative
          z-10
        "
      >
        {/* ================================================
            SECTION HEADING
            ================================================ */}

        <div
          className="
            mb-7
            flex
            flex-wrap
            items-end
            justify-between
            gap-5
            sm:mb-9
            lg:mb-10
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
              duration: 0.55,
              ease: EASE,
            }}
            className="min-w-0"
          >
            {/* ORANGE ACCENT */}

            <div
              aria-hidden="true"
              className="
                mb-3
                h-0.75
                w-9
                rounded-full
                bg-linear-to-r
                from-[#d07808]
                to-[#ff9a16]
              "
            />

            {/* MAIN HEADING */}

            <h2
              id="upcoming-events-heading"
              className="
                vizha-heading
                text-[29px]
                font-bold
                leading-[1.2]
                tracking-[-0.035em]
                text-[#161616]
                sm:text-[34px]
                lg:text-[38px]
              "
            >
              Upcoming Events
            </h2>

            {/* DESCRIPTION */}

            <p
              className="
                mt-2
                max-w-xl
                text-[13px]
                leading-relaxed
                text-[#777777]
                sm:text-sm
              "
            >
              {isWorldwide
                ? "Discover unforgettable experiences, live performances and celebrations near you."
                : `Discover events and live experiences in ${location}.`}
            </p>

            {/* SELECTED LOCATION BADGE */}

            {!isWorldwide && (
              <div
                className="
                  mt-3
                  inline-flex
                  max-w-full
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#f0dfc6]
                  bg-[#fff7ea]
                  px-3
                  py-1.5
                  text-[#ac6a11]
                "
              >
                <MapPin
                  size={13}
                  className="shrink-0"
                />

                <span
                  className="
                    truncate
                    text-[11px]
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
                    ml-1
                    rounded-full
                    px-1.5
                    text-[11px]
                    font-bold
                    text-[#a96f1b]
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
              duration: 0.5,
              delay: 0.1,
              ease: EASE,
            }}
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            {/* VIEW ALL EVENTS */}

            <Link
              to={eventsPageUrl}
              aria-label="View all matching events"
              className="
                group
                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2
                whitespace-nowrap
                rounded-full
                border
                border-[#f2e2d0]
                bg-white
                px-4
                py-2
                text-[12px]
                font-semibold
                text-[#b96a06]
                shadow-[0_3px_12px_rgba(171,101,20,0.04)]
                transition-all
                duration-300
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

        {/* ================================================
            LOCATION-FILTERED EVENT RESULTS
            ================================================ */}

        {eventCount > 0 ? (
          <EventCarousel
            key={carouselKey}
            eventList={upcomingEvents}
            reducedMotion={shouldReduceMotion}
          />
        ) : (
          /* ==============================================
              NO EVENTS FOR SELECTED LOCATION
              ============================================== */

          <div
            className="
              flex
              min-h-72.5
              flex-col
              items-center
              justify-center
              rounded-3xl
              border
              border-dashed
              border-[#e9dccb]
              bg-[#fffcf8]
              px-6
              py-12
              text-center
              sm:min-h-80
            "
          >
            {/* EMPTY ICON */}

            <div
              className="
                flex
                h-16.25
                w-16.25
                items-center
                justify-center
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

            {/* TITLE */}

            <h3
              className="
                mt-5
                font-serif
                text-[22px]
                font-bold
                text-[#29221b]
                sm:text-[26px]
              "
            >
              {isWorldwide
                ? "No Upcoming Events Yet"
                : `No Upcoming Events in ${displayLocation}`}
            </h3>

            {/* DESCRIPTION */}

            <p
              className="
                mt-3
                max-w-122.5
                text-[12px]
                leading-[1.9]
                text-[#80776e]
                sm:text-[13px]
              "
            >
              {isWorldwide
                ? "New experiences are on the way. Explore the events page for more information."
                : `There are currently no listed events matching ${location}. Explore other locations or browse all available events.`}
            </p>

            {/* BUTTONS */}

            <div
              className="
                mt-6
                flex
                flex-wrap
                items-center
                justify-center
                gap-3
              "
            >
              {!isWorldwide && (
                <button
                  type="button"
                  onClick={resetLocation}
                  className="
                    inline-flex
                    min-h-11.25
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-linear-to-r
                    from-[#f5a018]
                    to-[#df7905]
                    px-6
                    text-[12px]
                    font-bold
                    text-white
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
                  inline-flex
                  min-h-11.25
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-[#e7d9c5]
                  bg-white
                  px-6
                  text-[12px]
                  font-semibold
                  text-[#9b661d]
                  transition-all
                  hover:bg-[#fff3e3]
                "
              >
                Browse Events
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* NOTE */}

            {!isWorldwide && (
              <p
                className="
                  mt-5
                  max-w-110
                  text-[10px]
                  leading-relaxed
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
