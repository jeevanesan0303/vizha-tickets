
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";

import { Link, useSearchParams } from "react-router-dom";

import { motion, useReducedMotion } from "framer-motion";

import {
  ArrowRight,
  CalendarDays,
  CalendarSearch,
  ChevronDown,
  Ellipsis,
  Globe2,
  Headset,
  Heart,
  Landmark,
  LayoutGrid,
  List,
  MapPin,
  Mic2,
  Music2,
  PartyPopper,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Theater,
  Ticket,
  Trophy,
  UsersRound,
} from "lucide-react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import EventCard from "../components/events/EventCard";

import {
  usePublicEvents,
  type EventDetails,
} from "../data/events";

import {
  eventMatchesLocation,
  useLocationSelection,
} from "../contexts/LocationContext";

/* ==========================================================
   VIZHATICKETS — EVENTS PAGE

   COMPLETE CORRECTED VERSION

   React + Vite + TypeScript

   FEATURES
   ----------------------------------------------------------
   - Connected to shared admin/public event catalogue
   - Published events only
   - Reactive admin event changes
   - Dynamic event categories
   - Custom categories without TypeScript errors
   - Global location filtering
   - Search and sorting
   - Date filtering
   - URL search parameters
   - Grid/list display
   - Favourites
   - Responsive event cards
   - Existing hero background
   - Existing EventCard component
   - Event details navigation

   FRONTEND DEVELOPMENT
   ----------------------------------------------------------
   Browser-local admin changes are visible only within
   the same origin/browser storage.

   Production event visibility, booking inventory,
   payment confirmation and ticket issuance require
   backend services.
   ========================================================== */

type EventItem = EventDetails;

type ViewMode = "grid" | "list";

type SortOption =
  | "date"
  | "date-desc"
  | "price-asc"
  | "price-desc"
  | "title";

type DateFilter =
  | ""
  | "today"
  | "this-week"
  | "this-weekend"
  | "this-month";

/* ==========================================================
   CATEGORIES

   IMPORTANT:
   This is the default visual category list.

   Admin-created categories are added dynamically.
   ========================================================== */

const categoryChips = [
  {
    name: "All Events",
    value: "all",
    icon: LayoutGrid,
    color: "#e97800",
  },
  {
    name: "Music",
    value: "music",
    icon: Music2,
    color: "#9224c7",
  },
  {
    name: "Cultural",
    value: "cultural",
    icon: Landmark,
    color: "#e87900",
  },
  {
    name: "Sports",
    value: "sports",
    icon: Trophy,
    color: "#159a66",
  },
  {
    name: "Comedy",
    value: "comedy",
    icon: Mic2,
    color: "#e84a58",
  },
  {
    name: "Theatre",
    value: "theatre",
    icon: Theater,
    color: "#8735c8",
  },
  {
    name: "Festivals",
    value: "festivals",
    icon: PartyPopper,
    color: "#ec3761",
  },
  {
    name: "Workshops",
    value: "workshops",
    icon: UsersRound,
    color: "#2188cf",
  },
  {
    name: "Others",
    value: "others",
    icon: Ellipsis,
    color: "#667085",
  },
] as const;

/*
 * Explicitly type this record as string-based.
 * This allows admin-created category values.
 */

const categoryAliases: Record<string, string[]> = {
  music: ["music", "concert", "concerts"],
  cultural: ["cultural", "culture"],
  sports: ["sports", "sport"],
  comedy: ["comedy"],
  theatre: ["theatre", "theater"],
  festivals: ["festival", "festivals"],
  workshops: [
    "workshop",
    "workshops",
    "education",
  ],
  others: ["other", "others"],
};

const dateFilterOptions: Array<{
  label: string;
  value: DateFilter;
}> = [
  { label: "Any Date", value: "" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this-week" },
  { label: "This Weekend", value: "this-weekend" },
  { label: "This Month", value: "this-month" },
];

/* ==========================================================
   CATEGORY UTILITIES
   ========================================================== */

function normalizeCategory(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "" ||
    normalized === "all" ||
    normalized === "all events"
  ) {
    return "all";
  }

  for (const [category, aliases] of Object.entries(
    categoryAliases
  )) {
    if (aliases.includes(normalized)) {
      return category;
    }
  }

  /*
   * Unknown categories retain their names.

   * Example:
   * "Exhibitions" -> "exhibitions"
   */

  return normalized;
}

function matchesCategory(
  event: EventItem,
  selected: string
): boolean {
  const selectedNormalized =
    normalizeCategory(selected);

  if (selectedNormalized === "all") {
    return true;
  }

  const eventValues = [
    event.category,
    ...(event.tags ?? []),
  ]
    .filter(Boolean)
    .map(normalizeCategory);

  return eventValues.includes(selectedNormalized);
}

/* ==========================================================
   LOCATION UTILITIES
   ========================================================== */

function normalizeLocationValue(
  value: string | null | undefined
): string {
  const normalized = value?.trim();

  if (
    !normalized ||
    normalized.toLowerCase() === "all" ||
    normalized.toLowerCase() === "worldwide"
  ) {
    return "Worldwide";
  }

  return normalized;
}

/* ==========================================================
   DATE UTILITIES
   ========================================================== */

function parseDateFilter(
  value: string | null
): DateFilter {
  return (
    dateFilterOptions.find(
      (option) => option.value === value
    )?.value ?? ""
  );
}

function getEventDate(event: EventItem): Date | null {
  const iso = event.dateISO?.trim();

  if (
    !iso ||
    !/^\d{4}-\d{2}-\d{2}$/.test(iso)
  ) {
    return null;
  }

  const [year, month, day] = iso
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

function matchesDateFilter(
  event: EventItem,
  filter: DateFilter
): boolean {
  if (!filter) return true;

  const eventDate = getEventDate(event);

  if (!eventDate) return false;

  const target = startOfDay(eventDate);
  const today = startOfDay(new Date());

  if (filter === "today") {
    return target.getTime() === today.getTime();
  }

  if (filter === "this-week") {
    const weekday = (today.getDay() + 6) % 7;

    const monday = addDays(today, -weekday);
    const nextMonday = addDays(monday, 7);

    return target >= monday && target < nextMonday;
  }

  if (filter === "this-weekend") {
    const weekday = today.getDay();

    const saturday = addDays(
      today,
      (6 - weekday + 7) % 7
    );

    const monday = addDays(saturday, 2);

    return target >= saturday && target < monday;
  }

  if (filter === "this-month") {
    return (
      target.getFullYear() === today.getFullYear() &&
      target.getMonth() === today.getMonth()
    );
  }

  return true;
}

/* ==========================================================
   EVENT SEARCH
   ========================================================== */

function matchesSearch(
  event: EventItem,
  query: string
): boolean {
  const term = query.trim().toLowerCase();

  if (!term) return true;

  const searchable = [
    event.title,
    event.description,
    event.fullDescription,
    event.location,
    event.venue,
    event.category,
    event.organizer,
    event.id,
    event.adminEventId,
    ...(event.tags ?? []),
    ...(event.ticketTiers ?? []).map(
      (tier) => tier.name
    ),
  ];

  return searchable.some(
    (value) =>
      typeof value === "string" &&
      value.toLowerCase().includes(term)
  );
}

/* ==========================================================
   SORT EVENTS
   ========================================================== */

function sortEvents(
  items: EventItem[],
  sortBy: SortOption
): EventItem[] {
  return [...items].sort((a, b) => {
    if (sortBy === "price-asc") {
      return a.price - b.price;
    }

    if (sortBy === "price-desc") {
      return b.price - a.price;
    }

    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }

    const aDate = getEventDate(a);
    const bDate = getEventDate(b);

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return sortBy === "date-desc"
      ? bDate.getTime() - aDate.getTime()
      : aDate.getTime() - bDate.getTime();
  });
}

/* ==========================================================
   FAVOURITES

   Preserve original storage key and custom event.
   ========================================================== */

const FAVORITES_KEY = "vizha-event-favorites";
const FAVORITES_EVENT = "vizha-favorites-change";

function getFavoritesSnapshot(): string {
  if (typeof window === "undefined") {
    return "[]";
  }

  try {
    return (
      window.localStorage.getItem(FAVORITES_KEY) ??
      "[]"
    );
  } catch {
    return "[]";
  }
}

function subscribeToFavorites(
  callback: () => void
): () => void {
  window.addEventListener("storage", callback);

  window.addEventListener(
    FAVORITES_EVENT,
    callback
  );

  return () => {
    window.removeEventListener(
      "storage",
      callback
    );

    window.removeEventListener(
      FAVORITES_EVENT,
      callback
    );
  };
}

function parseFavorites(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (value): value is string =>
        typeof value === "string"
    );
  } catch {
    return [];
  }
}

/* ==========================================================
   MAIN EVENTS CONTENT
   ========================================================== */

function EventsContent() {
  const reducedMotion =
    useReducedMotion() === true;

  const resultsRef = useRef<HTMLElement>(null);

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  /*
   * SHARED ADMIN / CUSTOMER EVENTS

   * This replaces the old static event import.

   * When the admin saves or publishes an event,
   * the shared data hook receives the change.
   */

  const events = usePublicEvents();

  /* ========================================================
     GLOBAL LOCATION
     ======================================================== */

  const {
    location,
    setLocation,
    resetLocation,
  } = useLocationSelection();

  const urlLocation = searchParams.get("loc");

  const selectedLocation =
    urlLocation !== null
      ? normalizeLocationValue(urlLocation)
      : normalizeLocationValue(location);

  /* ========================================================
     FILTER STATE

     FIX:
     Explicit string types support unlimited categories.

     This prevents TS2345 when admin categories are added.
     ======================================================== */

  const [query, setQuery] = useState<string>(
    () => searchParams.get("q") ?? ""
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string>(() =>
    normalizeCategory(
      searchParams.get("category") ?? "all"
    )
  );

  const [dateFilter, setDateFilter] =
    useState<DateFilter>(() =>
      parseDateFilter(searchParams.get("date"))
    );

  const [sortBy, setSortBy] =
    useState<SortOption>("date");

  const [viewMode, setViewMode] =
    useState<ViewMode>("grid");

  /* ========================================================
     URL PARAMETERS
     ======================================================== */

  const urlQuery = searchParams.get("q") ?? "";

  const urlCategory =
    searchParams.get("category") ?? "all";

  const urlDate = searchParams.get("date");

  useEffect(() => {
    setQuery(urlQuery);

    setSelectedCategory(
      normalizeCategory(urlCategory)
    );

    setDateFilter(
      parseDateFilter(urlDate)
    );
  }, [urlQuery, urlCategory, urlDate]);

  /* ========================================================
     SYNCHRONIZE URL LOCATION
     ======================================================== */

  useEffect(() => {
    if (urlLocation === null) return;

    const normalized =
      normalizeLocationValue(urlLocation);

    if (normalized !== location) {
      setLocation(normalized);
    }
  }, [
    urlLocation,
    location,
    setLocation,
  ]);

  /* ========================================================
     AVAILABLE LOCATIONS

     Derived from shared published events.
     ======================================================== */

  const locations = useMemo<string[]>(() => {
    const values = new Set<string>();

    for (const event of events) {
      const eventLocation =
        event.location.trim();

      if (!eventLocation) continue;

      values.add(eventLocation);

      const parts = eventLocation
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length >= 2) {
        values.add(
          parts[parts.length - 1]
        );
      }
    }

    if (selectedLocation !== "Worldwide") {
      values.add(selectedLocation);
    }

    return Array.from(values).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [events, selectedLocation]);

  /* ========================================================
     DYNAMIC CATEGORY OPTIONS

     IMPORTANT TS2345 FIX:

     Set<string> allows any normalized category name.
     The original code inferred a fixed literal union.
     ======================================================== */

  const extraCategories = useMemo<string[]>(() => {
    const known = new Set<string>(
      categoryChips.map(
        (category) => category.value
      )
    );

    const extras = new Set<string>();

    for (const event of events) {
      const category = event.category.trim();

      if (!category) continue;

      const normalized =
        normalizeCategory(category);

      if (!known.has(normalized)) {
        extras.add(category);
      }
    }

    return Array.from(extras).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [events]);

  const categoryOptions: Array<{
    label: string;
    value: string;
  }> = [
    ...categoryChips.map((category) => ({
      label:
        category.value === "all"
          ? "All Categories"
          : category.name,
      value: category.value,
    })),

    ...extraCategories.map((category) => ({
      label: category,
      value: normalizeCategory(category),
    })),
  ];

  /* ========================================================
     LOCATION CHANGES
     ======================================================== */

  const handleLocationChange = useCallback(
    (value: string) => {
      const next =
        normalizeLocationValue(value);

      setLocation(next);

      const updated =
        new URLSearchParams(searchParams);

      if (next === "Worldwide") {
        updated.delete("loc");
      } else {
        updated.set("loc", next);
      }

      setSearchParams(updated, {
        replace: true,
      });
    },
    [
      searchParams,
      setSearchParams,
      setLocation,
    ]
  );

  /* ========================================================
     FAVOURITES
     ======================================================== */

  const favoritesRaw = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    () => "[]"
  );

  const favorites = useMemo(
    () => parseFavorites(favoritesRaw),
    [favoritesRaw]
  );

  const toggleFavorite = (eventId: string) => {
    const current = parseFavorites(
      getFavoritesSnapshot()
    );

    const next = current.includes(eventId)
      ? current.filter(
          (id) => id !== eventId
        )
      : [...current, eventId];

    try {
      window.localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(next)
      );

      window.dispatchEvent(
        new Event(FAVORITES_EVENT)
      );
    } catch {
      // Storage unavailable.
    }
  };

  /* ========================================================
     FILTERED EVENTS

     Publication status is handled in usePublicEvents().
     This component applies visitor filters.
     ======================================================== */

  const filteredEvents = useMemo<EventItem[]>(() => {
    const matching = events.filter((event) => {
      const searchMatch =
        matchesSearch(event, query);

      const categoryMatch =
        matchesCategory(
          event,
          selectedCategory
        );

      const locationMatch =
        eventMatchesLocation(
          event.location,
          selectedLocation,
          event.venue
        );

      const dateMatch =
        matchesDateFilter(
          event,
          dateFilter
        );

      return (
        searchMatch &&
        categoryMatch &&
        locationMatch &&
        dateMatch
      );
    });

    return sortEvents(matching, sortBy);
  }, [
    events,
    query,
    selectedCategory,
    selectedLocation,
    dateFilter,
    sortBy,
  ]);

  const isWorldwide =
    selectedLocation === "Worldwide";

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedCategory !== "all" ||
    !isWorldwide ||
    dateFilter !== "";

  const displayLocation = isWorldwide
    ? "Worldwide"
    : selectedLocation.split(",")[0].trim();

  /* ========================================================
     SEARCH
     ======================================================== */

  const handleSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const updated = new URLSearchParams();

    if (query.trim()) {
      updated.set("q", query.trim());
    }

    if (selectedCategory !== "all") {
      updated.set(
        "category",
        selectedCategory
      );
    }

    if (!isWorldwide) {
      updated.set(
        "loc",
        selectedLocation
      );
    }

    if (dateFilter) {
      updated.set("date", dateFilter);
    }

    setSearchParams(updated, {
      replace: true,
    });

    resultsRef.current?.scrollIntoView({
      behavior: reducedMotion
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  /* ========================================================
     RESET FILTERS
     ======================================================== */

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setDateFilter("");
    setSortBy("date");

    resetLocation();

    setSearchParams(
      new URLSearchParams(),
      { replace: true }
    );
  };

  /* ========================================================
     MAIN RENDER
     ======================================================== */

  return (
    <>
      {/* ==================================================
          EVENT HERO
          ================================================== */}

      <section
        aria-labelledby="events-page-title"
        className="
          relative isolate overflow-hidden
          bg-[#fffaf4]
        "
      >
        {/* EXISTING BACKGROUND */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 z-0
          "
        >
          <img
            src="/images/events/events-hero.webp"
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="
              h-full w-full object-cover
              object-[65%_center]
              sm:object-[60%_center]
              lg:object-center
            "
          />
        </div>

        {/* MOBILE OVERLAY */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 z-1
            bg-linear-to-r
            from-[#fffaf4]/95
            via-[#fffaf4]/75
            to-[#fffaf4]/35
            lg:hidden
          "
        />

        {/* DESKTOP OVERLAY */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 z-1
            hidden
            bg-linear-to-r
            from-[#fffaf4]/35
            via-transparent
            to-transparent
            lg:block
          "
        />

        {/* HERO CONTENT */}

        <div
          className="
            vizha-container relative z-10
            mx-auto w-full
          "
        >
          <div
            className="
              grid min-h-97.5 items-center gap-8 py-12
              sm:min-h-105
              lg:min-h-107.5
              lg:grid-cols-[1.1fr_0.9fr]
              lg:py-10
              xl:min-h-113.75
            "
          >
            <motion.div
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, x: -24 }
              }
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: reducedMotion
                  ? 0
                  : 0.65,
              }}
              className="relative z-10 max-w-157.5"
            >
              <div
                className="
                  mb-5 flex items-center gap-2.5
                  text-[11px] font-extrabold uppercase
                  tracking-[0.14em] text-[#d84a0a]
                  sm:text-[12px]
                "
              >
                <Sparkles
                  size={18}
                  strokeWidth={2}
                />

                Explore Live Experiences
              </div>

              <h1
                id="events-page-title"
                className="
                  text-[clamp(2.7rem,4.3vw,4rem)]
                  font-extrabold leading-[1.12]
                  tracking-[-0.045em] text-[#171717]
                "
              >
                Upcoming{" "}
                <span className="text-[#df4b0b]">
                  Events
                </span>
              </h1>

              <p
                className="
                  mt-5 max-w-132.5
                  text-[14px] leading-[1.8]
                  text-[#555d67]
                  sm:text-[16px]
                "
              >
                Find and book tickets for the best
                concerts, cultural shows, sports
                and festivals near you and
                around the world.
              </p>

              {/* HERO BENEFITS */}

              <div
                className="
                  mt-8 grid max-w-152.5
                  grid-cols-1 gap-4
                  min-[480px]:grid-cols-3
                  min-[480px]:gap-3
                "
              >
                <div className="flex items-center gap-3">
                  <Ticket
                    size={27}
                    className="
                      shrink-0 text-[#e45d0b]
                    "
                  />

                  <div>
                    <p className="text-[12px] font-bold">
                      Easy Booking
                    </p>

                    <p className="mt-1 text-[11px] text-[#707070]">
                      Get tickets in minutes
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex items-center gap-3
                    min-[480px]:border-l
                    min-[480px]:border-[#ead7c3]
                    min-[480px]:pl-3
                  "
                >
                  <ShieldCheck
                    size={27}
                    className="
                      shrink-0 text-[#e45d0b]
                    "
                  />

                  <div>
                    <p className="text-[12px] font-bold">
                      Secure Payments
                    </p>

                    <p className="mt-1 text-[11px] text-[#707070]">
                      Safe transactions
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex items-center gap-3
                    min-[480px]:border-l
                    min-[480px]:border-[#ead7c3]
                    min-[480px]:pl-3
                  "
                >
                  <Headset
                    size={27}
                    className="
                      shrink-0 text-[#e45d0b]
                    "
                  />

                  <div>
                    <p className="text-[12px] font-bold">
                      Customer Support
                    </p>

                    <p className="mt-1 text-[11px] text-[#707070]">
                      Here to help
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div
              aria-hidden="true"
              className="hidden lg:block"
            />
          </div>
        </div>

        {/* ==================================================
            FILTER BAR
            ================================================== */}

        <div
          className="
            vizha-container relative z-20
            mx-auto w-full pb-6
          "
        >
          <form
            role="search"
            onSubmit={handleSearch}
            className="
              rounded-[22px]
              border border-[#f1e6db]
              bg-white/95 p-3
              shadow-[0_12px_38px_rgba(95,57,19,0.11)]
              backdrop-blur-xl
            "
          >
            <div
              className="
                grid gap-3 md:grid-cols-2
                xl:grid-cols-[1.35fr_1fr_1fr_1fr_auto]
              "
            >
              {/* SEARCH INPUT */}

              <label
                className="
                  flex min-h-13.75 min-w-0
                  items-center gap-3
                  rounded-[14px]
                  border border-[#eee5dc]
                  bg-[#fffdfb] px-4
                  focus-within:border-[#e9a25c]
                "
              >
                <Search
                  size={20}
                  className="
                    shrink-0 text-[#e87500]
                  "
                />

                <input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search event or artist..."
                  aria-label="Search events"
                  className="
                    w-full min-w-0
                    bg-transparent text-[13px]
                    outline-none
                    placeholder:text-[#909090]
                  "
                />
              </label>

              {/* CATEGORY SELECT */}

              <label
                className="
                  relative flex min-h-13.75
                  items-center gap-3 rounded-[14px]
                  border border-[#eee5dc]
                  bg-[#fffdfb] px-4
                  focus-within:border-[#e9a25c]
                "
              >
                <LayoutGrid
                  size={19}
                  className="
                    shrink-0 text-[#e87500]
                  "
                />

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value
                    )
                  }
                  aria-label="Filter by category"
                  className="
                    w-full min-w-0
                    cursor-pointer appearance-none
                    bg-transparent pr-5
                    text-[13px] outline-none
                  "
                >
                  {categoryOptions.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="
                    pointer-events-none
                    absolute right-4 text-[#e87500]
                  "
                />
              </label>

              {/* LOCATION SELECT */}

              <label
                className="
                  relative flex min-h-13.75
                  min-w-0 items-center gap-3
                  rounded-[14px]
                  border border-[#eee5dc]
                  bg-[#fffdfb] px-4
                  focus-within:border-[#e9a25c]
                "
              >
                <MapPin
                  size={19}
                  className="
                    shrink-0 text-[#e87500]
                  "
                />

                <select
                  value={selectedLocation}
                  onChange={(event) =>
                    handleLocationChange(
                      event.target.value
                    )
                  }
                  aria-label="Filter by location"
                  className="
                    w-full min-w-0
                    cursor-pointer appearance-none
                    bg-transparent pr-5
                    text-[13px] outline-none
                  "
                >
                  <option value="Worldwide">
                    Worldwide
                  </option>

                  {locations.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="
                    pointer-events-none
                    absolute right-4 text-[#e87500]
                  "
                />
              </label>

              {/* SORT SELECT */}

              <label
                className="
                  relative flex min-h-13.75
                  items-center gap-3 rounded-[14px]
                  border border-[#eee5dc]
                  bg-[#fffdfb] px-4
                  focus-within:border-[#e9a25c]
                "
              >
                <CalendarDays
                  size={19}
                  className="
                    shrink-0 text-[#e87500]
                  "
                />

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value as SortOption
                    )
                  }
                  aria-label="Sort events"
                  className="
                    w-full min-w-0
                    cursor-pointer appearance-none
                    bg-transparent pr-5
                    text-[13px] outline-none
                  "
                >
                  <option value="date">
                    Date: Earliest First
                  </option>

                  <option value="date-desc">
                    Date: Latest First
                  </option>

                  <option value="price-asc">
                    Price: Low to High
                  </option>

                  <option value="price-desc">
                    Price: High to Low
                  </option>

                  <option value="title">
                    Name: A to Z
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className="
                    pointer-events-none
                    absolute right-4 text-[#e87500]
                  "
                />
              </label>

              {/* SEARCH BUTTON */}

              <button
                type="submit"
                className="
                  group flex min-h-13.75
                  items-center justify-center gap-2.5
                  rounded-[14px]
                  bg-linear-to-r
                  from-[#ff9400] to-[#ed7800]
                  px-6 text-[13px] font-bold
                  text-white
                  shadow-[0_6px_18px_rgba(245,130,0,0.2)]
                  transition-all hover:brightness-95
                  hover:shadow-lg
                "
              >
                Search Events

                <ArrowRight
                  size={18}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </button>
            </div>

            {/* DATE FILTER */}

            <div
              className="
                mt-3 flex flex-wrap
                items-center gap-2 px-1
              "
            >
              <CalendarDays
                size={15}
                className="text-[#d77700]"
              />

              <span className="text-[12px] text-[#666]">
                Date:
              </span>

              <select
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(
                    event.target.value as DateFilter
                  )
                }
                aria-label="Filter events by date"
                className="
                  rounded-lg
                  border border-[#f0d6b5]
                  bg-[#fff7eb] px-2 py-1.5
                  text-[12px] font-semibold
                  text-[#bd700a]
                "
              >
                {dateFilterOptions.map((item) => (
                  <option
                    key={item.value || "any"}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* LOCATION INDICATOR */}

            {!isWorldwide && (
              <div
                className="
                  mt-3 flex flex-wrap
                  items-center gap-2 px-1
                  text-[11px]
                "
              >
                <span className="text-[#817260]">
                  Showing events in:
                </span>

                <span
                  className="
                    inline-flex items-center gap-1.5
                    rounded-full border
                    border-[#ecd3ac]
                    bg-[#fff2dd] px-3 py-1.5
                    font-semibold text-[#ad6d16]
                  "
                >
                  <MapPin size={13} />

                  {selectedLocation}
                </span>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ==================================================
          EVENT RESULTS
          ================================================== */}

      <section
        id="events-results"
        ref={resultsRef}
        aria-labelledby="events-results-title"
        className="
          scroll-mt-27.5 bg-[#fffaf4]
          py-8 sm:py-10
        "
      >
        <div
          className="
            vizha-container mx-auto w-full
          "
        >
          {/* CATEGORY CHIPS */}

          <div className="mb-8 overflow-x-auto pb-3">
            <div
              className="
                flex min-w-max
                items-center gap-2.5
              "
            >
              {categoryChips.map((category) => {
                const Icon = category.icon;

                const active =
                  selectedCategory ===
                  category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setSelectedCategory(
                        category.value
                      )
                    }
                    className={`
                      group flex min-h-12
                      shrink-0 items-center gap-2.5
                      rounded-full border px-4
                      text-[12px] font-semibold
                      transition-all duration-300
                      ${
                        active
                          ? "border-[#e99745] bg-[#fff0df] text-[#c96b06] shadow-sm"
                          : "border-[#efe7dc] bg-white text-[#333] hover:border-[#eebc85] hover:bg-[#fff8ef]"
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      strokeWidth={2}
                      style={{
                        color: active
                          ? "#d97706"
                          : category.color,
                      }}
                    />

                    {category.name}
                  </button>
                );
              })}

              {/* CUSTOM ADMIN CATEGORIES */}

              {extraCategories.map((category) => {
                const normalized =
                  normalizeCategory(category);

                const active =
                  selectedCategory === normalized;

                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setSelectedCategory(normalized)
                    }
                    className={`
                      flex min-h-12 shrink-0
                      items-center gap-2.5
                      rounded-full border px-4
                      text-[12px] font-semibold
                      transition-all
                      ${
                        active
                          ? "border-[#e99745] bg-[#fff0df] text-[#c96b06]"
                          : "border-[#efe7dc] bg-white text-[#333] hover:bg-[#fff8ef]"
                      }
                    `}
                  >
                    <Sparkles
                      size={18}
                      className="text-[#d97706]"
                    />

                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RESULTS HEADER */}

          <div
            className="
              mb-6 flex flex-wrap
              items-center justify-between gap-4
            "
          >
            <div
              className="
                flex flex-wrap items-center gap-4
              "
            >
              <h2
                id="events-results-title"
                className="
                  text-[20px] font-extrabold
                  tracking-tight sm:text-[24px]
                "
              >
                Showing{" "}
                <span className="text-[#df4b0b]">
                  {filteredEvents.length}{" "}
                  {filteredEvents.length === 1
                    ? "event"
                    : "events"}
                </span>
              </h2>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    inline-flex items-center gap-1.5
                    rounded-full border
                    border-[#f0d5b5]
                    bg-white px-3 py-2
                    text-[11px] font-semibold
                    text-[#bb6c08]
                    transition hover:bg-[#fff2e3]
                  "
                >
                  <RotateCcw size={13} />

                  Clear Filters
                </button>
              )}
            </div>

            {/* VIEW SWITCHER */}

            <div
              role="group"
              aria-label="Event display mode"
              className="
                flex items-center gap-1
                rounded-xl bg-[#f0eeeb] p-1
              "
            >
              <button
                type="button"
                onClick={() =>
                  setViewMode("grid")
                }
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={`
                  flex h-9.5 w-11.25
                  items-center justify-center
                  rounded-[9px] transition-all
                  ${
                    viewMode === "grid"
                      ? "bg-[#f58200] text-white shadow-sm"
                      : "text-[#707070] hover:text-[#222]"
                  }
                `}
              >
                <LayoutGrid size={19} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode("list")
                }
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                className={`
                  flex h-9.5 w-11.25
                  items-center justify-center
                  rounded-[9px] transition-all
                  ${
                    viewMode === "list"
                      ? "bg-[#f58200] text-white shadow-sm"
                      : "text-[#707070] hover:text-[#222]"
                  }
                `}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* ==================================================
              EVENT CARDS
              ================================================== */}

          {filteredEvents.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2"
              }
            >
              {filteredEvents.map((event, index) => {
                const eventId =
                  String(event.id);

                const favorite =
                  favorites.includes(eventId);

                /*
                 * The existing EventCard controls
                 * event-detail navigation.

                 * No full-card overlay is added here,
                 * avoiding interference with the
                 * card's own buttons and links.
                 */

                return (
                  <motion.div
                    key={eventId}
                    initial={
                      reducedMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 16,
                          }
                    }
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.08,
                    }}
                    transition={{
                      duration: reducedMotion
                        ? 0
                        : 0.4,
                      delay: reducedMotion
                        ? 0
                        : Math.min(index * 0.04, 0.2),
                    }}
                    className="
                      group/event relative min-w-0
                    "
                  >
                    <EventCard
                      event={event}
                      priority={index === 0}
                      loading={
                        index < 4
                          ? "eager"
                          : "lazy"
                      }
                    />

                    {/* FAVOURITE BUTTON */}

                    <button
                      type="button"
                      aria-label={
                        favorite
                          ? `Remove ${event.title} from favourites`
                          : `Add ${event.title} to favourites`
                      }
                      aria-pressed={favorite}
                      onClick={() =>
                        toggleFavorite(eventId)
                      }
                      className={`
                        absolute right-3 top-3 z-20
                        flex h-10.5 w-10.5
                        items-center justify-center
                        rounded-full border
                        backdrop-blur-md
                        transition-all duration-300
                        hover:scale-105
                        focus-visible:ring-2
                        focus-visible:ring-[#f58200]
                        ${
                          favorite
                            ? "border-[#f6bd8a] bg-[#fff1df] text-[#e87900]"
                            : "border-white/50 bg-black/35 text-white hover:bg-black/55"
                        }
                      `}
                    >
                      <Heart
                        size={21}
                        strokeWidth={2.2}
                        className={
                          favorite
                            ? "fill-[#f58200] text-[#f58200]"
                            : "text-white"
                        }
                      />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* EMPTY RESULTS */

            <div
              className="
                rounded-3xl border
                border-dashed border-[#e6d7c4]
                bg-white px-6 py-16
                text-center shadow-sm
              "
            >
              <div
                className="
                  mx-auto flex h-16.25 w-16.25
                  items-center justify-center
                  rounded-full
                  bg-[#fff0df] text-[#e87500]
                "
              >
                <CalendarSearch size={28} />
              </div>

              <h3
                className="
                  mt-5 text-[21px]
                  font-extrabold leading-snug
                "
              >
                {!isWorldwide
                  ? `No Events Found in ${displayLocation}`
                  : "No Events Match Your Search"}
              </h3>

              <p
                className="
                  mx-auto mt-3 max-w-115
                  text-[13px] leading-[1.8]
                  text-[#777]
                "
              >
                {!isWorldwide
                  ? `There are currently no published events in ${selectedLocation} matching your filters. Try another location or view worldwide events.`
                  : events.length === 0
                    ? "There are currently no published events. Please check again later."
                    : "Try another search term, category or date to discover more events."}
              </p>

              <div
                className="
                  mt-7 flex flex-wrap
                  items-center justify-center gap-3
                "
              >
                {!isWorldwide && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="
                      inline-flex min-h-11.5
                      items-center justify-center
                      gap-2 rounded-xl
                      bg-[#f58200] px-6
                      text-[13px] font-bold
                      text-white
                      transition-colors
                      hover:bg-[#de7100]
                    "
                  >
                    <Globe2 size={17} />

                    Show Worldwide Events
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    inline-flex min-h-11.5
                    items-center justify-center
                    gap-2 rounded-xl
                    border border-[#eadac6]
                    bg-white px-6
                    text-[13px] font-bold
                    text-[#a76510]
                    transition hover:bg-[#fff5e7]
                  "
                >
                  <RotateCcw size={16} />

                  Reset All Filters
                </button>
              </div>
            </div>
          )}

          {/* ==================================================
              EXPLORE BANNER
              ================================================== */}

          <div
            className="
              mt-14 flex flex-col
              items-start justify-between gap-6
              rounded-3xl
              border border-[#f1e5d7]
              bg-linear-to-r
              from-[#fff2e1]
              via-[#fff6ea]
              to-[#fffaf4]
              px-6 py-9
              sm:flex-row sm:items-center
              sm:px-9 sm:py-10
            "
          >
            <div className="max-w-167.5">
              <p
                className="
                  text-[11px] font-bold
                  uppercase tracking-[0.16em]
                  text-[#d86f00]
                "
              >
                Make Memories
              </p>

              <h3
                className="
                  mt-3 text-[21px]
                  font-extrabold leading-tight
                  tracking-tight sm:text-[26px]
                "
              >
                Your Next Great Experience
                Starts Here.
              </h3>

              <p
                className="
                  mt-3 text-[13px]
                  leading-[1.7]
                  text-[#696969]
                  sm:text-[14px]
                "
              >
                Explore different events and
                find something worth looking
                forward to.
              </p>
            </div>

            <Link
              to="/categories"
              className="
                group inline-flex min-h-12
                shrink-0 items-center
                justify-center gap-2
                rounded-xl
                bg-linear-to-r
                from-[#f69400]
                to-[#e77800]
                px-6 text-[13px] font-bold
                text-white
                shadow-[0_5px_17px_rgba(242,130,0,0.18)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:shadow-lg
              "
            >
              Explore Categories

              <ArrowRight
                size={18}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ==========================================================
   EXPORTED PAGE
   ========================================================== */

export default function EventsPage() {
  return (
    <div
      className="
        min-h-screen overflow-x-clip
        bg-[#fffaf4] text-[#171717]
      "
    >
      <Header />

      <main>
        <EventsContent />
      </main>

      <Footer />
    </div>
  );
}
