
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Dumbbell,
  Globe2,
  Landmark,
  MapPin,
  Mic2,
  Music2,
  Search,
  Sparkles,
  Theater,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  useLocationSelection,
} from "@/contexts/LocationContext";

/* ==========================================================
   VIZHATICKETS — HERO SECTION

   React + Vite + TypeScript

   CORRECTIONS:
   ----------------------------------------------------------
   - Connected location popup to global LocationContext
   - Removed duplicate local location state
   - Country/city changes are saved immediately
   - Location selection persists after refresh
   - Other pages can access selected location
   - Search Events retains q and loc URL parameters
   - Preserved original premium hero design
   - Preserved original background artwork
   - Preserved searchable location popup
   - Preserved popular cities
   - Preserved all eight category cards
   - Preserved responsive behavior and animation
   - Improved modal accessibility and focus handling

   IMPORTANT:
   UpcomingEvents.tsx and EventsPage.tsx must also use
   LocationContext to filter displayed events.

   ========================================================== */

/* ==========================================================
   EVENT CATEGORIES — ORIGINAL DATA
   ========================================================== */

const categories = [
  {
    name: "Concerts",
    slug: "music",
    icon: Music2,
  },
  {
    name: "Cultural",
    slug: "cultural",
    icon: Landmark,
  },
  {
    name: "Comedy",
    slug: "comedy",
    icon: Mic2,
  },
  {
    name: "Sports",
    slug: "sports",
    icon: Dumbbell,
  },
  {
    name: "Theatre",
    slug: "theatre",
    icon: Theater,
  },
  {
    name: "Festivals",
    slug: "festivals",
    icon: Sparkles,
  },
  {
    name: "Workshops",
    slug: "workshops",
    icon: Clapperboard,
  },
  {
    name: "Others",
    slug: "others",
    icon: CalendarDays,
  },
] as const;

/* ==========================================================
   LOCATION DATA

   These locations are available as search filters.

   Listing a location here does not mean that events
   are currently available in that city or country.
   ========================================================== */

interface LocationGroup {
  country: string;
  flag: string;
  cities: string[];
}

interface LocationOption {
  label: string;
  value: string;
  country: string;
  flag: string;
  type: "country" | "city";
}

const LOCATION_GROUPS: LocationGroup[] = [
  {
    country: "Sri Lanka",
    flag: "🇱🇰",
    cities: [
      "Jaffna",
      "Colombo",
      "Kandy",
      "Galle",
      "Batticaloa",
      "Trincomalee",
      "Negombo",
      "Vavuniya",
      "Kilinochchi",
      "Mannar",
      "Anuradhapura",
      "Kurunegala",
      "Matara",
      "Nuwara Eliya",
      "Ratnapura",
      "Hambantota",
    ],
  },
  {
    country: "India",
    flag: "🇮🇳",
    cities: [
      "Chennai",
      "Bengaluru",
      "Mumbai",
      "New Delhi",
      "Hyderabad",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Kochi",
      "Pune",
      "Kolkata",
    ],
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    cities: [
      "London",
      "Manchester",
      "Birmingham",
      "Leicester",
      "Liverpool",
      "Leeds",
      "Bristol",
      "Glasgow",
      "Edinburgh",
      "Cardiff",
    ],
  },
  {
    country: "Switzerland",
    flag: "🇨🇭",
    cities: [
      "Zurich",
      "Geneva",
      "Basel",
      "Bern",
      "Lausanne",
      "Lucerne",
    ],
  },
  {
    country: "France",
    flag: "🇫🇷",
    cities: [
      "Paris",
      "Lyon",
      "Marseille",
      "Toulouse",
      "Nice",
      "Strasbourg",
    ],
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    cities: [
      "Berlin",
      "Frankfurt",
      "Munich",
      "Hamburg",
      "Cologne",
      "Stuttgart",
    ],
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    cities: [
      "Sydney",
      "Melbourne",
      "Brisbane",
      "Perth",
      "Adelaide",
      "Canberra",
    ],
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    cities: [
      "Toronto",
      "Vancouver",
      "Montreal",
      "Ottawa",
      "Calgary",
      "Edmonton",
    ],
  },
  {
    country: "United States",
    flag: "🇺🇸",
    cities: [
      "New York",
      "Los Angeles",
      "Chicago",
      "San Francisco",
      "Houston",
      "Boston",
    ],
  },
  {
    country: "Singapore",
    flag: "🇸🇬",
    cities: ["Singapore"],
  },
  {
    country: "United Arab Emirates",
    flag: "🇦🇪",
    cities: [
      "Dubai",
      "Abu Dhabi",
      "Sharjah",
      "Ajman",
    ],
  },
  {
    country: "Malaysia",
    flag: "🇲🇾",
    cities: [
      "Kuala Lumpur",
      "Penang",
      "Johor Bahru",
    ],
  },
  {
    country: "Qatar",
    flag: "🇶🇦",
    cities: ["Doha"],
  },
];

/* ==========================================================
   FLATTEN LOCATION OPTIONS
   ========================================================== */

const ALL_LOCATIONS: LocationOption[] =
  LOCATION_GROUPS.flatMap((group) => [
    {
      label: group.country,
      value: group.country,
      country: group.country,
      flag: group.flag,
      type: "country" as const,
    },

    ...group.cities.map((city) => ({
      label: city,
      value: `${city}, ${group.country}`,
      country: group.country,
      flag: group.flag,
      type: "city" as const,
    })),
  ]);

/* ==========================================================
   POPULAR LOCATIONS
   ========================================================== */

const POPULAR_LOCATIONS = [
  {
    city: "Jaffna",
    country: "Sri Lanka",
    flag: "🇱🇰",
  },
  {
    city: "Colombo",
    country: "Sri Lanka",
    flag: "🇱🇰",
  },
  {
    city: "Chennai",
    country: "India",
    flag: "🇮🇳",
  },
  {
    city: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
  },
  {
    city: "Zurich",
    country: "Switzerland",
    flag: "🇨🇭",
  },
  {
    city: "Dubai",
    country: "United Arab Emirates",
    flag: "🇦🇪",
  },
];

/* ==========================================================
   LOCATION POPUP PROPS
   ========================================================== */

interface LocationPopupProps {
  open: boolean;
  selectedLocation: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}

/* ==========================================================
   LOCATION POPUP
   ========================================================== */

function LocationPopup({
  open,
  selectedLocation,
  onClose,
  onSelect,
}: LocationPopupProps) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const searchInputRef =
    useRef<HTMLInputElement>(null);

  const dialogRef =
    useRef<HTMLDivElement>(null);

  const filteredLocations = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return ALL_LOCATIONS;
    }

    return ALL_LOCATIONS.filter((item) => {
      return (
        item.label.toLowerCase().includes(search) ||
        item.country.toLowerCase().includes(search) ||
        item.value.toLowerCase().includes(search)
      );
    });
  }, [query]);

  const displayedLocations = query.trim()
    ? filteredLocations
    : showAll
      ? ALL_LOCATIONS
      : [];

  /* ========================================================
     CLOSE POPUP
     ======================================================== */

  const handleClose = useCallback(() => {
    setQuery("");
    setShowAll(false);
    onClose();
  }, [onClose]);

  /* ========================================================
     SELECT LOCATION

     Calls the parent onSelect function.

     The parent connects directly to LocationContext,
     so every selection is saved globally.
     ======================================================== */

  const handleSelect = (value: string) => {
    onSelect(value);
    setQuery("");
    setShowAll(false);
    onClose();
  };

  /* ========================================================
     MODAL FOCUS / KEYBOARD
     ======================================================== */

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;

      if (!dialog) return;

      const elements =
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );

      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

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
      } else if (
        !dialog.contains(document.activeElement)
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);

      document.removeEventListener(
        "keydown",
        onKeyDown
      );

      document.body.style.overflow =
        previousOverflow;

      previousFocus?.focus();
    };
  }, [open, handleClose]);

  /* ========================================================
     PORTAL RENDER
     ======================================================== */

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="
        fixed inset-0 z-9999
        flex items-center justify-center
        bg-black/60 px-3 py-4
        backdrop-blur-[3px] sm:px-5
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-popup-title"
        className="
          flex max-h-[min(88dvh,720px)]
          w-full max-w-212.5 flex-col
          overflow-hidden rounded-[22px]
          border border-[#ead9c4]
          bg-[#fffdf9]
          shadow-[0_28px_90px_rgba(0,0,0,0.3)]
          sm:rounded-[26px]
        "
      >
        {/* ================================================
            POPUP HEADING
            ================================================ */}

        <div
          className="
            flex shrink-0 items-start
            justify-between gap-4
            border-b border-[#eee2d3]
            px-5 py-4 sm:px-7 sm:py-5
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[10px] font-extrabold
                uppercase tracking-[0.16em]
                text-[#bf7815]
              "
            >
              VizhaTickets · Locations
            </p>

            <h2
              id="location-popup-title"
              className="
                mt-1 font-serif text-[23px]
                font-bold text-[#251a12]
                sm:text-[28px]
              "
            >
              Choose Your Location
            </h2>

            <p
              className="
                mt-1 text-[11px] leading-relaxed
                text-[#8c7c69] sm:text-[12px]
              "
            >
              Explore events by country or city.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close location selector"
            className="
              flex h-9 w-9 shrink-0 items-center
              justify-center rounded-full
              border border-[#eadfce] bg-white
              text-[#685849] transition
              hover:bg-[#fff0da]
              hover:text-[#c9790b]
              focus-visible:outline-2
              focus-visible:outline-[#c9790b]
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* ================================================
            SEARCH BOX
            ================================================ */}

        <div
          className="
            shrink-0 border-b border-[#f0e7dc]
            px-5 py-4 sm:px-7
          "
        >
          <div
            className="
              flex h-12.5 items-center gap-3
              rounded-[13px] border border-[#e6d9c8]
              bg-white px-4 transition
              focus-within:border-[#d18b25]
              focus-within:ring-4
              focus-within:ring-[#c9790b]/10
            "
          >
            <Search
              size={20}
              className="shrink-0 text-[#d0810b]"
            />

            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search for country or city..."
              aria-label="Search countries and cities"
              autoComplete="off"
              className="
                h-full w-full min-w-0
                bg-transparent text-[13px]
                text-[#30251a] outline-none
                placeholder:text-[#a08f7b]
                sm:text-[14px]
              "
            />
          </div>
        </div>

        {/* ================================================
            SCROLLABLE CONTENT
            ================================================ */}

        <div
          className="
            min-h-0 flex-1 overflow-y-auto
            overscroll-contain px-5 py-5 sm:px-7
          "
        >
          {/* WORLDWIDE OPTION */}

          {!query.trim() && (
            <button
              type="button"
              onClick={() =>
                handleSelect("Worldwide")
              }
              className="
                flex w-full items-center gap-3
                rounded-[14px] border
                border-[#ebdcc7] bg-[#fff5e7]
                px-4 py-3 text-left transition
                hover:border-[#dfa750]
                hover:bg-[#fff0d8]
              "
            >
              <span
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl bg-white text-[#c9790b]
                "
              >
                <Globe2 size={21} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-[#2c2015]">
                  Worldwide
                </span>

                <span className="mt-0.5 block text-[11px] text-[#947d62]">
                  Search events across all locations
                </span>
              </span>

              {selectedLocation === "Worldwide" && (
                <Check
                  size={20}
                  className="text-[#c9790b]"
                />
              )}
            </button>
          )}

          {/* ==============================================
              POPULAR CITIES
              ============================================== */}

          {!query.trim() && !showAll && (
            <div className="mt-6">
              <div className="mb-4 flex items-center gap-2">
                <MapPin
                  size={17}
                  className="text-[#c9790b]"
                />

                <h3
                  className="
                    text-[12px] font-extrabold
                    uppercase tracking-[0.12em]
                    text-[#72502b]
                  "
                >
                  Popular Cities
                </h3>
              </div>

              <div
                className="
                  grid grid-cols-2 gap-3
                  sm:grid-cols-3 md:grid-cols-6
                "
              >
                {POPULAR_LOCATIONS.map((item) => {
                  const value =
                    `${item.city}, ${item.country}`;

                  const selected =
                    selectedLocation === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        handleSelect(value)
                      }
                      aria-pressed={selected}
                      className={`
                        flex min-h-24.5 flex-col
                        items-center justify-center
                        gap-2 rounded-[14px] border
                        px-2 py-3 text-center
                        transition-all
                        hover:-translate-y-0.5
                        ${
                          selected
                            ? "border-[#d58b19] bg-[#fff1db]"
                            : "border-[#eadfd0] bg-white hover:border-[#dfa950] hover:bg-[#fffbf4]"
                        }
                      `}
                    >
                      <span className="text-[28px] leading-none">
                        {item.flag}
                      </span>

                      <span className="text-[12px] font-bold text-[#362719]">
                        {item.city}
                      </span>

                      <span className="text-[10px] text-[#968574]">
                        {item.country}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==============================================
              ALL LOCATION RESULTS
              ============================================== */}

          {(query.trim() || showAll) && (
            <div className="mt-3">
              <p
                className="
                  mb-3 text-[11px] font-bold
                  uppercase tracking-[0.12em]
                  text-[#977041]
                "
              >
                {query.trim()
                  ? `Search Results (${displayedLocations.length})`
                  : "All Countries & Cities"}
              </p>

              {displayedLocations.length === 0 ? (
                <div
                  className="
                    rounded-xl border border-dashed
                    border-[#e5d8c7] p-8 text-center
                  "
                >
                  <Search
                    size={25}
                    className="mx-auto text-[#bd8a43]"
                  />

                  <p className="mt-3 text-[13px] font-semibold text-[#493728]">
                    No matching location found
                  </p>

                  <p className="mt-1 text-[11px] text-[#938270]">
                    Try another country or city name.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {displayedLocations.map((item) => {
                    const selected =
                      selectedLocation === item.value;

                    return (
                      <button
                        key={`${item.type}-${item.value}`}
                        type="button"
                        onClick={() =>
                          handleSelect(item.value)
                        }
                        aria-pressed={selected}
                        className={`
                          flex w-full items-center
                          gap-3 rounded-xl px-3 py-2.5
                          text-left transition
                          ${
                            selected
                              ? "bg-[#fff0d8]"
                              : "hover:bg-[#fff6e9]"
                          }
                        `}
                      >
                        <span
                          className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-lg bg-[#fff6e9]
                            text-[23px]
                          "
                        >
                          {item.flag}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-[#37281b]">
                            {item.label}
                          </span>

                          <span className="mt-0.5 block text-[11px] text-[#938170]">
                            {item.type === "country"
                              ? "Country"
                              : item.country}
                          </span>
                        </span>

                        {selected ? (
                          <Check
                            size={19}
                            className="text-[#c9790b]"
                          />
                        ) : (
                          <ChevronRight
                            size={17}
                            className="text-[#b7a18a]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==============================================
              VIEW ALL LOCATIONS
              ============================================== */}

          {!query.trim() && (
            <button
              type="button"
              onClick={() =>
                setShowAll((previous) => !previous)
              }
              className="
                mt-6 flex min-h-11 w-full
                items-center justify-center gap-2
                rounded-xl border border-[#e9d7bd]
                bg-white text-[12px] font-bold
                text-[#b87617] transition
                hover:bg-[#fff5e7]
              "
            >
              {showAll
                ? "Show Popular Cities"
                : "View All Countries & Cities"}

              <ChevronDown
                size={16}
                className={
                  showAll ? "rotate-180" : ""
                }
              />
            </button>
          )}
        </div>

        {/* ================================================
            POPUP FOOTER
            ================================================ */}

        <div
          className="
            flex shrink-0 items-center
            justify-between gap-2
            border-t border-[#eee4d8]
            bg-[#fffaf2] px-5 py-3 sm:px-7
          "
        >
          <p className="text-[10px] text-[#988572]">
            Select a country or city to continue.
          </p>

          <span
            className="
              inline-flex shrink-0 items-center
              gap-1 text-[10px] font-bold
              text-[#b87721]
            "
          >
            <Globe2 size={13} />
            Global Events
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ==========================================================
   CATEGORY CARD

   Shared between desktop and mobile.
   Preserves original category names and slugs.
   ========================================================== */

interface CategoryCardProps {
  category: (typeof categories)[number];
  mobile?: boolean;
}

function CategoryCard({
  category,
  mobile = false,
}: CategoryCardProps) {
  const Icon = category.icon;

  if (mobile) {
    return (
      <Link
        to={`/categories/${category.slug}`}
        className="
          group flex min-h-20.5 min-w-23.5
          flex-col items-center justify-center
          gap-2 rounded-[14px]
          border border-[#eedfcb]
          bg-white/95 px-3 py-3
          shadow-[0_4px_16px_rgba(85,55,15,0.06)]
          backdrop-blur-md transition-all
          duration-300 hover:-translate-y-1
          hover:border-[#dea85e]
          hover:bg-[#fff7ea]
        "
      >
        <Icon
          size={21}
          strokeWidth={1.8}
          aria-hidden="true"
          className="
            text-[#ce7809] transition-transform
            duration-300 group-hover:scale-110
          "
        />

        <span className="whitespace-nowrap text-[11px] font-semibold text-[#393939]">
          {category.name}
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="
        group relative flex h-24 w-full
        flex-col items-center justify-center
        gap-2 overflow-hidden rounded-2xl
        border border-[#efe4d5]
        bg-white/95 px-2 text-center
        shadow-[0_5px_18px_rgba(85,55,15,0.06)]
        backdrop-blur-sm transition-all
        duration-300 hover:-translate-y-1.5
        hover:border-[#e8bc83]
        hover:bg-[#fffaf4]
        hover:shadow-[0_12px_28px_rgba(85,55,15,0.12)]
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[#d98200]
        xl:h-26.25
      "
    >
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute
          inset-x-0 bottom-0 h-0.75
          origin-center scale-x-0 rounded-t-full
          bg-linear-to-r from-[#ffac35]
          via-[#df8509] to-[#ba6700]
          transition-transform duration-300
          group-hover:scale-x-100
        "
      />

      <div
        className="
          flex h-9.75 w-9.75
          items-center justify-center rounded-xl
          bg-[#fff5e6] text-[#ce7809]
          transition-all duration-300
          group-hover:scale-110
          group-hover:bg-[#ffecd0]
        "
      >
        <Icon
          size={21}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </div>

      <span
        className="
          text-[11px] font-semibold
          text-[#333] transition-colors
          duration-300 group-hover:text-[#b96800]
          xl:text-[12px]
        "
      >
        {category.name}
      </span>
    </Link>
  );
}

/* ==========================================================
   MAIN HERO COMPONENT
   ========================================================== */

export default function HeroSection() {
  const navigate = useNavigate();

  const reducedMotion = useReducedMotion();

  /* ========================================================
     GLOBAL LOCATION STATE

     Previously:
     const [location, setLocation] = useState("Worldwide");

     Now:
     LocationContext manages the selection for all pages.
     ======================================================== */

  const {
    location,
    setLocation,
  } = useLocationSelection();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [locationPopupOpen, setLocationPopupOpen] =
    useState(false);

  const openLocationPopup = useCallback(() => {
    setLocationPopupOpen(true);
  }, []);

  const closeLocationPopup = useCallback(() => {
    setLocationPopupOpen(false);
  }, []);

  /* ========================================================
     GLOBAL LOCATION UPDATE

     This updates LocationContext and localStorage.

     UpcomingEvents and EventsPage will be able
     to receive the new location automatically
     once they use the same context.
     ======================================================== */

  const handleLocationSelect = useCallback(
    (selected: string) => {
      setLocation(selected);
    },
    [setLocation]
  );

  /* ========================================================
     SEARCH SUBMISSION
     ======================================================== */

  const handleSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const params = new URLSearchParams();

    const query = searchQuery.trim();

    if (query) {
      params.set("q", query);
    }

    if (location !== "Worldwide") {
      params.set("loc", location);
    }

    const queryString = params.toString();

    navigate(
      `/events${queryString ? `?${queryString}` : ""}`
    );
  };

  /* ========================================================
     HERO RENDER
     ======================================================== */

  return (
    <>
      <section
        aria-labelledby="vizha-hero-title"
        className="
          relative isolate w-full
          overflow-hidden bg-[#fffaf3]
        "
      >
        {/* ================================================
            ORIGINAL HERO BACKGROUND

            Preserved original artwork and positioning.
            ================================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 z-0
            bg-cover bg-no-repeat
            bg-position-[65%_center]
            sm:bg-position-[60%_center]
            lg:bg-size-[100%_auto]
            lg:bg-position-[center_top]
          "
          style={{
            backgroundImage:
              "url('/images/hero/hero-festival-waves.webp')",
          }}
        />

        {/* MOBILE READABILITY OVERLAY */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 z-1
            bg-linear-to-b from-white/90
            via-white/75 to-[#fffaf3]/90
            lg:hidden
          "
        />

        {/* DESKTOP READABILITY OVERLAY */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 z-1
            hidden bg-linear-to-r from-white/25
            via-white/5 to-transparent lg:block
          "
        />

        {/* ================================================
            HERO MAIN CONTENT
            ================================================ */}

        <div className="vizha-container relative z-10 mx-auto w-full">
          <div
            className="
              relative flex min-h-140
              items-center py-14
              sm:min-h-150 sm:py-16
              lg:min-h-147.5 lg:py-10
              xl:min-h-155
              2xl:min-h-162.5
            "
          >
            <motion.div
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 16,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: reducedMotion ? 0 : 0.65,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative z-20 w-full
                max-w-180
                lg:max-w-162.5
                xl:max-w-180
              "
            >
              {/* TOP TAGLINE */}

              <div className="mb-5 flex items-center gap-3 sm:mb-6">
                <span
                  aria-hidden="true"
                  className="
                    h-0.5 w-7 shrink-0
                    rounded-full bg-[#d78009]
                  "
                />

                <p
                  className="
                    text-[10px] font-bold uppercase
                    tracking-[0.19em] text-[#bf7009]
                    sm:text-[12px]
                  "
                >
                  Live Events. Real Experiences.
                </p>
              </div>

              {/* ============================================
                  MAIN HEADLINE
                  ============================================ */}

              <h1
                id="vizha-hero-title"
                className="
                  vizha-heading font-bold
                  text-[#171717]
                  text-[clamp(2.5rem,4.2vw,4rem)]
                  leading-[1.12]
                  tracking-[-0.035em]
                "
              >
                <span className="block">
                  Discover Amazing
                </span>

                <span
                  className="
                    block pb-[0.08em]
                    bg-linear-to-r from-[#c77708]
                    via-[#dc8708] to-[#bc6b00]
                    bg-clip-text text-transparent
                    lg:whitespace-nowrap
                  "
                >
                  Events Around You
                </span>
              </h1>

              {/* HERO DESCRIPTION */}

              <p
                className="
                  mt-6 max-w-147.5
                  text-[14px] leading-[1.8]
                  text-[#515151]
                  sm:mt-7 sm:text-[16px]
                  lg:mt-6
                "
              >
                From concerts to cultural festivals,
                comedy shows, sports, theatre, and more —
                find and book tickets for the best events
                near you.
              </p>

              {/* ============================================
                  MAIN SEARCH BAR
                  ============================================ */}

              <form
                role="search"
                onSubmit={handleSearch}
                className="
                  relative mt-8 w-full max-w-176.25
                  overflow-hidden rounded-[17px]
                  border border-[#eadfd0]
                  bg-white/95
                  shadow-[0_10px_32px_rgba(85,55,15,0.10)]
                  backdrop-blur-lg transition-all
                  duration-300
                  focus-within:border-[#e7b371]
                  focus-within:shadow-[0_12px_35px_rgba(130,75,10,0.13)]
                  sm:mt-9 lg:mt-8
                "
              >
                <div
                  className="
                    flex flex-col
                    lg:min-h-16.5
                    lg:flex-row lg:items-stretch
                  "
                >
                  {/* EVENT SEARCH INPUT */}

                  <div
                    className="
                      flex min-h-14.75 min-w-0
                      flex-1 items-center gap-3 px-5
                    "
                  >
                    <Search
                      size={20}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="shrink-0 text-[#d47b07]"
                    />

                    <input
                      type="search"
                      name="q"
                      aria-label="Search events, artists, or cities"
                      autoComplete="off"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.target.value)
                      }
                      placeholder="Search events, artists, cities..."
                      className="
                        h-12.5 w-full min-w-0
                        bg-transparent text-[13px]
                        font-medium text-[#292929]
                        outline-none
                        placeholder:font-normal
                        placeholder:text-[#929292]
                        sm:text-[14px]
                      "
                    />
                  </div>

                  {/* ========================================
                      GLOBAL LOCATION SELECTOR

                      Opens existing premium popup.

                      The displayed value comes directly
                      from LocationContext.
                      ======================================== */}

                  <div
                    className="
                      relative flex min-h-14.25
                      items-stretch border-t
                      border-[#eee6dc]
                      lg:w-45
                      lg:min-w-45
                      lg:border-l lg:border-t-0
                    "
                  >
                    <button
                      type="button"
                      onClick={openLocationPopup}
                      aria-haspopup="dialog"
                      aria-expanded={locationPopupOpen}
                      aria-label={`Select event location. Current selection: ${location}`}
                      className="
                        group flex w-full min-w-0
                        items-center gap-2.5 px-5
                        text-left text-[13px]
                        font-medium text-[#373737]
                        transition hover:bg-[#fff8ed]
                        focus-visible:outline-2
                        focus-visible:-outline-offset-2
                        focus-visible:outline-[#d48718]
                        lg:px-4
                      "
                    >
                      <MapPin
                        size={19}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="shrink-0 text-[#d47b07]"
                      />

                      <span
                        className="
                          min-w-0 flex-1 truncate
                        "
                        title={location}
                      >
                        {location}
                      </span>

                      <ChevronDown
                        size={15}
                        aria-hidden="true"
                        className="
                          shrink-0 text-[#454545]
                          transition-transform duration-200
                          group-hover:translate-y-0.5
                        "
                      />
                    </button>
                  </div>

                  {/* SEARCH BUTTON */}

                  <button
                    type="submit"
                    className="
                      group m-2 flex min-h-12.25
                      shrink-0 items-center
                      justify-center gap-2
                      rounded-[10px]
                      bg-linear-to-r from-[#df870b]
                      via-[#cf7907] to-[#bd6902]
                      px-6 text-[13px]
                      font-bold text-white
                      shadow-[0_5px_15px_rgba(193,105,0,0.15)]
                      outline-none transition-all
                      duration-300
                      hover:brightness-105
                      hover:shadow-[0_8px_20px_rgba(193,105,0,0.25)]
                      focus-visible:ring-2
                      focus-visible:ring-[#e99a35]
                      focus-visible:ring-offset-2
                    "
                  >
                    <Search
                      size={17}
                      strokeWidth={2.2}
                      aria-hidden="true"
                      className="
                        transition-transform duration-300
                        group-hover:scale-110
                      "
                    />

                    <span>Search Events</span>
                  </button>
                </div>
              </form>

              {/* ============================================
                  MOBILE / TABLET CATEGORIES
                  ============================================ */}

              <div className="mt-7 lg:hidden">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-[13px] font-bold text-[#292929]">
                    Explore Categories
                  </h2>

                  <Link
                    to="/categories"
                    className="
                      inline-flex items-center
                      gap-1 whitespace-nowrap
                      text-[12px] font-semibold
                      text-[#c7780c]
                      hover:text-[#a75d00]
                    "
                  >
                    View All
                    <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div
                  className="
                    overflow-x-auto pb-3
                    scrollbar-none
                    [&::-webkit-scrollbar]:hidden
                  "
                >
                  <div className="flex w-max gap-3">
                    {categories.map((category) => (
                      <CategoryCard
                        key={category.slug}
                        category={category}
                        mobile
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ================================================
              DESKTOP CATEGORY CARDS
              ================================================ */}

          <div
            className="
              relative z-30 hidden pb-10 pt-3
              lg:block xl:pb-12
            "
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="
                    h-6 w-0.75 rounded-full
                    bg-linear-to-b
                    from-[#ffae32] to-[#cb7200]
                  "
                />

                <div>
                  <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#222]">
                    Explore Categories
                  </h2>

                  <p className="mt-0.5 text-[12px] text-[#777]">
                    Find the experiences you love
                  </p>
                </div>
              </div>

              <Link
                to="/categories"
                className="
                  group inline-flex items-center
                  gap-1.5 rounded-full
                  px-3 py-2 text-[12px] font-bold
                  text-[#c47709] transition-all
                  duration-200
                  hover:bg-[#fff3e3]
                  hover:text-[#a95d00]
                "
              >
                View All Categories

                <ArrowUpRight
                  size={16}
                  className="
                    transition-transform duration-300
                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </Link>
            </div>

            {/* CATEGORY GRID */}

            <div className="grid grid-cols-8 gap-3 xl:gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.slug}
                  initial={
                    reducedMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 12,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                  transition={{
                    duration: reducedMotion
                      ? 0
                      : 0.4,
                    delay: reducedMotion
                      ? 0
                      : index * 0.045,
                  }}
                  className="min-w-0"
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          LOCATION POPUP

          Uses document.body portal to avoid clipping
          by hero overflow or animations.
          ================================================ */}

      <LocationPopup
        open={locationPopupOpen}
        selectedLocation={location}
        onClose={closeLocationPopup}
        onSelect={handleLocationSelect}
      />
    </>
  );
}
