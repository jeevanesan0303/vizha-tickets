
import {
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import EventCard from "../components/events/EventCard";
import { events } from "../data/events";

import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Ellipsis,
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

/* ==========================================================
   VIZHATICKETS — EVENTS PAGE

   React + Vite + TypeScript + React Router

   - Original premium events hero artwork
   - Search and filters
   - Category chips
   - Location filter
   - Date filters
   - Sorting
   - Grid / list toggle
   - EventCard component preserved
   - Explicit event-details navigation
   - Favorites
   - Responsive layout
   - Framer Motion animations
   ========================================================== */

type EventItem = (typeof events)[number];

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
   CATEGORY DATA
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

const categoryAliases: Record<string, string[]> = {
  music: ["music", "concert", "concerts"],
  cultural: ["cultural", "culture"],
  sports: ["sports", "sport"],
  comedy: ["comedy"],
  theatre: ["theatre", "theater"],
  festivals: ["festival", "festivals"],
  workshops: ["workshop", "workshops"],
  others: ["other", "others"],
};

const dateFilterOptions: {
  label: string;
  value: DateFilter;
}[] = [
  { label: "Any Date", value: "" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this-week" },
  { label: "This Weekend", value: "this-weekend" },
  { label: "This Month", value: "this-month" },
];

/* ==========================================================
   FILTER HELPERS
   ========================================================== */

function normalizeCategory(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (!normalized || normalized === "all") {
    return "all";
  }

  const entry = Object.entries(categoryAliases).find(
    ([, aliases]) =>
      aliases.some(
        (alias) =>
          normalized === alias ||
          normalized.includes(alias)
      )
  );

  return entry ? entry[0] : normalized;
}

function parseDateFilter(value: string | null): DateFilter {
  const matched = dateFilterOptions.find(
    (option) => option.value === value
  );

  return matched?.value ?? "";
}

function getEventDate(event: EventItem): Date | null {
  const record = event as unknown as Record<
    string,
    unknown
  >;

  const fields = [
    "date",
    "startDate",
    "start_date",
    "eventDate",
    "event_date",
    "startsAt",
    "start_time",
    "datetime",
  ];

  for (const field of fields) {
    const value = record[field];

    if (value instanceof Date) {
      if (!Number.isNaN(value.getTime())) {
        return value;
      }
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = new Date(value);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      const timestamp =
        value < 100000000000
          ? value * 1000
          : value;

      const parsed = new Date(timestamp);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  return null;
}

function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function matchesDateFilter(
  event: EventItem,
  filter: DateFilter
): boolean {
  if (!filter) return true;

  const date = getEventDate(event);

  if (!date) return false;

  const today = startOfDay(new Date());
  const target = startOfDay(date);

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

function matchesSearch(
  event: EventItem,
  query: string
): boolean {
  const search = query.trim().toLowerCase();

  if (!search) return true;

  const record = event as unknown as Record<
    string,
    unknown
  >;

  const values = [
    event.title,
    event.description,
    event.location,
    event.venue,
    event.category,
    record.artist,
    record.organizer,
  ];

  return values.some(
    (value) =>
      typeof value === "string" &&
      value.toLowerCase().includes(search)
  );
}

function matchesCategory(
  event: EventItem,
  selected: string
): boolean {
  if (selected === "all") return true;

  const normalized = normalizeCategory(selected);

  const aliases = categoryAliases[normalized] ?? [
    normalized,
  ];

  const eventCategory = String(
    event.category
  ).toLowerCase();

  return aliases.some(
    (alias) =>
      eventCategory === alias ||
      eventCategory.includes(alias)
  );
}

function matchesLocation(
  event: EventItem,
  selected: string
): boolean {
  if (
    !selected ||
    selected.toLowerCase() === "all" ||
    selected.toLowerCase() === "worldwide"
  ) {
    return true;
  }

  return event.location
    .toLowerCase()
    .includes(selected.toLowerCase());
}

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

    const first = getEventDate(a);
    const second = getEventDate(b);

    if (!first && !second) return 0;
    if (!first) return 1;
    if (!second) return -1;

    return sortBy === "date-desc"
      ? second.getTime() - first.getTime()
      : first.getTime() - second.getTime();
  });
}

/* ==========================================================
   FAVORITES STORE

   The snapshot is the raw string from localStorage
   so useSyncExternalStore receives stable values.
   ========================================================== */

const FAVORITES_KEY = "vizha-event-favorites";
const FAVORITES_EVENT = "vizha-favorites-change";

function getFavoritesSnapshot(): string {
  if (typeof window === "undefined") return "[]";

  try {
    return (
      window.localStorage.getItem(FAVORITES_KEY) ?? "[]"
    );
  } catch {
    return "[]";
  }
}

function getFavoritesServerSnapshot(): string {
  return "[]";
}

function subscribeToFavorites(
  callback: () => void
): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(FAVORITES_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(
      FAVORITES_EVENT,
      callback
    );
  };
}

function parseFavorites(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is string =>
        typeof item === "string"
    );
  } catch {
    return [];
  }
}

/* ==========================================================
   EVENTS CONTENT
   ========================================================== */

function EventsContent({
  initialParams,
}: {
  initialParams: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion === true;

  const resultsRef = useRef<HTMLElement>(null);

  const params = useMemo(
    () => new URLSearchParams(initialParams),
    [initialParams]
  );

  const [query, setQuery] = useState(
    params.get("q") ?? ""
  );

  const [selectedCategory, setSelectedCategory] =
    useState(
      normalizeCategory(
        params.get("category") ?? "all"
      )
    );

  const [selectedLocation, setSelectedLocation] =
    useState(params.get("loc") ?? "all");

  const [dateFilter, setDateFilter] =
    useState<DateFilter>(
      parseDateFilter(params.get("date"))
    );

  const [sortBy, setSortBy] =
    useState<SortOption>("date");

  const [viewMode, setViewMode] =
    useState<ViewMode>("grid");

  const favoritesRaw = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot
  );

  const favorites = useMemo(
    () => parseFavorites(favoritesRaw),
    [favoritesRaw]
  );

  /* ========================================================
     LOCATIONS
     ======================================================== */

  const locations = useMemo(() => {
    const values = new Set<string>();

    for (const event of events) {
      event.location
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((location) =>
          values.add(location)
        );
    }

    if (
      selectedLocation !== "all" &&
      selectedLocation !== "Worldwide"
    ) {
      values.add(selectedLocation);
    }

    return [...values].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [selectedLocation]);

  /* ========================================================
     FILTERED RESULTS
     ======================================================== */

  const filteredEvents = useMemo(() => {
    const matching = events.filter(
      (event) =>
        matchesSearch(event, query) &&
        matchesCategory(
          event,
          selectedCategory
        ) &&
        matchesLocation(
          event,
          selectedLocation
        ) &&
        matchesDateFilter(event, dateFilter)
    );

    return sortEvents(matching, sortBy);
  }, [
    query,
    selectedCategory,
    selectedLocation,
    dateFilter,
    sortBy,
  ]);

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedCategory !== "all" ||
    (
      selectedLocation !== "all" &&
      selectedLocation !== "Worldwide"
    ) ||
    dateFilter !== "";

  /* ========================================================
     FAVORITES ACTION
     ======================================================== */

  const toggleFavorite = (eventId: string) => {
    const existing = parseFavorites(
      getFavoritesSnapshot()
    );

    const next = existing.includes(eventId)
      ? existing.filter((id) => id !== eventId)
      : [...existing, eventId];

    try {
      window.localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(next)
      );

      window.dispatchEvent(
        new Event(FAVORITES_EVENT)
      );
    } catch {
      // Storage may be unavailable.
    }
  };

  /* ========================================================
     RESET FILTERS
     ======================================================== */

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setDateFilter("");
    setSortBy("date");
  };

  const handleSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    resultsRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <>
      {/* ==============================================
          HERO
          ============================================== */}

      <section
        aria-labelledby="events-page-title"
        className="relative isolate overflow-hidden bg-[#fffaf4]"
      >
        {/* ORIGINAL HERO IMAGE */}

        <div className="pointer-events-none absolute inset-0 z-0">
          <img
            src="/images/events/events-hero.png"
            alt=""
            draggable={false}
            className="h-full w-full object-cover object-[65%_center] sm:object-[60%_center] lg:object-center"
          />
        </div>

        {/* MOBILE IMAGE OVERLAY */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-1 bg-linear-to-r from-[#fffaf4]/95 via-[#fffaf4]/75 to-[#fffaf4]/35 lg:hidden"
        />

        {/* DESKTOP IMAGE OVERLAY */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-1 hidden bg-linear-to-r from-[#fffaf4]/35 via-transparent to-transparent lg:block"
        />

        {/* HERO TEXT */}

        <div className="vizha-container relative z-10 mx-auto w-full">
          <div className="grid min-h-97.5 items-center gap-8 py-12 sm:min-h-105 lg:min-h-107.5 lg:grid-cols-[1.1fr_0.9fr] lg:py-10 xl:min-h-113.75">

            <motion.div
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, x: -24 }
              }
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.65,
              }}
              className="relative z-10 max-w-157.5"
            >
              <div className="mb-5 flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#d84a0a] sm:text-[12px]">
                <Sparkles
                  size={18}
                  strokeWidth={2}
                />
                Explore Live Experiences
              </div>

              <h1
                id="events-page-title"
                className="text-[clamp(2.7rem,4.3vw,4rem)] font-extrabold leading-[1.07] tracking-[-0.045em] text-[#171717]"
              >
                Upcoming{" "}
                <span className="text-[#df4b0b]">
                  Events
                </span>
              </h1>

              <p className="mt-5 max-w-132.5 text-[14px] leading-[1.8] text-[#555d67] sm:text-[16px]">
                Find and book tickets for the best concerts,
                cultural shows, sports, and festivals near
                you and around the world.
              </p>

              <div className="mt-8 grid max-w-152.5 grid-cols-1 gap-4 min-[480px]:grid-cols-3 min-[480px]:gap-3">

                <div className="flex items-center gap-3">
                  <Ticket
                    size={27}
                    className="shrink-0 text-[#e45d0b]"
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

                <div className="flex items-center gap-3 min-[480px]:border-l min-[480px]:border-[#ead7c3] min-[480px]:pl-3">
                  <ShieldCheck
                    size={27}
                    className="shrink-0 text-[#e45d0b]"
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

                <div className="flex items-center gap-3 min-[480px]:border-l min-[480px]:border-[#ead7c3] min-[480px]:pl-3">
                  <Headset
                    size={27}
                    className="shrink-0 text-[#e45d0b]"
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

        {/* ============================================
            SEARCH BAR
            ============================================ */}

        <div className="vizha-container relative z-20 mx-auto w-full pb-6">
          <form
            role="search"
            onSubmit={handleSearch}
            className="rounded-[22px] border border-[#f1e6db] bg-white/95 p-3 shadow-[0_12px_38px_rgba(95,57,19,0.11)] backdrop-blur-xl"
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_1fr_auto]">

              {/* SEARCH */}

              <label className="flex min-h-13.75 min-w-0 items-center gap-3 rounded-[14px] border border-[#eee5dc] bg-[#fffdfb] px-4 focus-within:border-[#e9a25c]">
                <Search
                  size={20}
                  className="shrink-0 text-[#e87500]"
                />

                <input
                  type="search"
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search event or artist..."
                  aria-label="Search events"
                  className="w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-[#909090]"
                />
              </label>

              {/* CATEGORY */}

              <label className="relative flex min-h-13.75 items-center gap-3 rounded-[14px] border border-[#eee5dc] bg-[#fffdfb] px-4 focus-within:border-[#e9a25c]">
                <LayoutGrid
                  size={19}
                  className="shrink-0 text-[#e87500]"
                />

                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value)
                  }
                  aria-label="Filter by category"
                  className="w-full min-w-0 cursor-pointer appearance-none bg-transparent pr-5 text-[13px] outline-none"
                >
                  {categoryChips.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.value === "all"
                        ? "All Categories"
                        : item.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 text-[#e87500]"
                />
              </label>

              {/* LOCATION */}

              <label className="relative flex min-h-13.75 items-center gap-3 rounded-[14px] border border-[#eee5dc] bg-[#fffdfb] px-4 focus-within:border-[#e9a25c]">
                <MapPin
                  size={19}
                  className="shrink-0 text-[#e87500]"
                />

                <select
                  value={selectedLocation}
                  onChange={(e) =>
                    setSelectedLocation(e.target.value)
                  }
                  aria-label="Filter by location"
                  className="w-full min-w-0 cursor-pointer appearance-none bg-transparent pr-5 text-[13px] outline-none"
                >
                  <option value="all">
                    All Locations
                  </option>

                  {locations.map((location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 text-[#e87500]"
                />
              </label>

              {/* SORT */}

              <label className="relative flex min-h-13.75 items-center gap-3 rounded-[14px] border border-[#eee5dc] bg-[#fffdfb] px-4 focus-within:border-[#e9a25c]">
                <CalendarDays
                  size={19}
                  className="shrink-0 text-[#e87500]"
                />

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as SortOption
                    )
                  }
                  aria-label="Sort events"
                  className="w-full min-w-0 cursor-pointer appearance-none bg-transparent pr-5 text-[13px] outline-none"
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
                  className="pointer-events-none absolute right-4 text-[#e87500]"
                />
              </label>

              {/* SEARCH BUTTON */}

              <button
                type="submit"
                className="group flex min-h-13.75 items-center justify-center gap-2.5 rounded-[14px] bg-linear-to-r from-[#ff9400] to-[#ed7800] px-6 text-[13px] font-bold text-white shadow-[0_6px_18px_rgba(245,130,0,0.2)] transition-all hover:brightness-95 hover:shadow-lg"
              >
                Search Events

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            {dateFilter && (
              <div className="mt-3 flex items-center gap-2 px-1">
                <CalendarDays
                  size={15}
                  className="text-[#d77700]"
                />

                <span className="text-[12px] text-[#666]">
                  Date:
                </span>

                <select
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(
                      e.target.value as DateFilter
                    )
                  }
                  className="rounded-lg border border-[#f0d6b5] bg-[#fff7eb] px-2 py-1.5 text-[12px] font-semibold text-[#bd700a]"
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
            )}
          </form>
        </div>
      </section>

      {/* ==============================================
          CATEGORY CHIPS AND RESULTS
          ============================================== */}

      <section
        id="events-results"
        ref={resultsRef}
        aria-labelledby="events-results-title"
        className="scroll-mt-27.5 bg-[#fffaf4] py-8 sm:py-10"
      >
        <div className="vizha-container mx-auto w-full">

          {/* CATEGORY CHIPS */}

          <div className="mb-8 overflow-x-auto pb-3">
            <div className="flex min-w-max items-center gap-2.5">

              {categoryChips.map((category) => {
                const Icon = category.icon;

                const active =
                  selectedCategory === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setSelectedCategory(category.value)
                    }
                    className={`group flex min-h-12 shrink-0 items-center gap-2.5 rounded-full border px-4 text-[12px] font-semibold transition-all duration-300 ${
                      active
                        ? "border-[#e99745] bg-[#fff0df] text-[#c96b06] shadow-sm"
                        : "border-[#efe7dc] bg-white text-[#333] hover:border-[#eebc85] hover:bg-[#fff8ef]"
                    }`}
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
            </div>
          </div>

          {/* RESULTS HEADING */}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

            <div className="flex flex-wrap items-center gap-4">

              <h2
                id="events-results-title"
                className="text-[20px] font-extrabold tracking-tight sm:text-[24px]"
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#f0d5b5] bg-white px-3 py-2 text-[11px] font-semibold text-[#bb6c08] hover:bg-[#fff2e3]"
                >
                  <RotateCcw size={13} />
                  Clear Filters
                </button>
              )}
            </div>

            {/* GRID / LIST TOGGLE */}

            <div
              role="group"
              aria-label="Event display mode"
              className="flex items-center gap-1 rounded-xl bg-[#f0eeeb] p-1"
            >
              <button
                type="button"
                onClick={() =>
                  setViewMode("grid")
                }
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                className={`flex h-9.5 w-11.25 items-center justify-center rounded-[9px] transition-all ${
                  viewMode === "grid"
                    ? "bg-[#f58200] text-white shadow-sm"
                    : "text-[#707070] hover:text-[#222]"
                }`}
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
                className={`flex h-9.5 w-11.25 items-center justify-center rounded-[9px] transition-all ${
                  viewMode === "list"
                    ? "bg-[#f58200] text-white shadow-sm"
                    : "text-[#707070] hover:text-[#222]"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* ============================================
              EVENT RESULTS

              A transparent link explicitly targets
              the event's individual detail URL.

              Favorite control is layered above it.
              ============================================ */}

          {filteredEvents.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2"
              }
            >
              {filteredEvents.map((event, index) => {
                const eventId = String(event.id);

                const favorite =
                  favorites.includes(eventId);

                const detailsUrl =
                  `/events/${encodeURIComponent(event.slug)}`;

                return (
                  <motion.div
                    key={eventId}
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, y: 16 }
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
                      duration: reducedMotion ? 0 : 0.4,
                      delay: reducedMotion
                        ? 0
                        : Math.min(index * 0.04, 0.2),
                    }}
                    className="group/event relative min-w-0"
                  >
                    {/* ORIGINAL EVENT CARD */}

                    <EventCard
                      event={event}
                      priority={index === 0}
                      loading={
                        index < 4 ? "eager" : "lazy"
                      }
                    />

                    {/* EVENT DETAILS LINK

                        The overlay makes the entire
                        card area clickable without
                        modifying EventCard.tsx.

                        It is a sibling, not an anchor
                        nested inside the card.
                    */}

                    <Link
                      to={detailsUrl}
                      aria-label={`View details for ${event.title}`}
                      className="absolute inset-0 z-10 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-[#f58200]/65"
                    />

                    {/* FAVORITE BUTTON */}

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
                      className={`absolute right-3 top-3 z-20 flex h-10.5 w-10.5 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#f58200] ${
                        favorite
                          ? "border-[#f6bd8a] bg-[#fff1df] text-[#e87900]"
                          : "border-white/50 bg-black/35 text-white hover:bg-black/55"
                      }`}
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
            /* NO RESULTS */

            <div className="rounded-3xl border border-dashed border-[#e6d7c4] bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-16.25 w-16.25 items-center justify-center rounded-full bg-[#fff0df] text-[#e87500]">
                <Search size={28} />
              </div>

              <h3 className="mt-5 text-[21px] font-extrabold">
                No events match your search
              </h3>

              <p className="mx-auto mt-3 max-w-105 text-[13px] leading-[1.7] text-[#777]">
                Try a different search term, category,
                location, or date to discover more events.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-7 inline-flex min-h-11.5 items-center justify-center gap-2 rounded-xl bg-[#f58200] px-6 text-[13px] font-bold text-white transition-colors hover:bg-[#de7100]"
              >
                Reset All Filters
                <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* ============================================
              EXPLORE BANNER
              ============================================ */}

          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl border border-[#f1e5d7] bg-linear-to-r from-[#fff2e1] via-[#fff6ea] to-[#fffaf4] px-6 py-9 sm:flex-row sm:items-center sm:px-9 sm:py-10">

            <div className="max-w-167.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d86f00]">
                Make Memories
              </p>

              <h3 className="mt-3 text-[21px] font-extrabold leading-tight tracking-tight sm:text-[26px]">
                Your Next Great Experience Starts Here.
              </h3>

              <p className="mt-3 text-[13px] leading-[1.7] text-[#696969] sm:text-[14px]">
                Explore different events and find something
                worth looking forward to.
              </p>
            </div>

            <Link
              to="/categories"
              className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#f69400] to-[#e77800] px-6 text-[13px] font-bold text-white shadow-[0_5px_17px_rgba(242,130,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Explore Categories

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ==========================================================
   EVENTS PAGE EXPORT

   Keying the content by URL parameters ensures
   externally changed search/category filters
   initialize correctly without setting state
   during React effects.
   ========================================================== */

export default function EventsPage() {
  const [searchParams] = useSearchParams();
  const paramsKey = searchParams.toString();

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fffaf4] text-[#171717]">
      <Header />

      <main>
        <EventsContent
          key={paramsKey}
          initialParams={paramsKey}
        />
      </main>

      <Footer />
    </div>
  );
}
