
"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useState,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Dumbbell,
  Grid2X2,
  Landmark,
  MapPin,
  Mic2,
  Music2,
  Search,
  Sparkles,
  Theater,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

/* ==========================================================
   VIZHATICKETS — CATEGORIES PAGE

   React + Vite + TypeScript

   CORRECTIONS:
   ----------------------------------------------------------
   - Completely removed the hero tagline overlay
   - Removed the empty cream box
   - Removed the tagline's decorative lines
   - Original hero artwork preserved
   - No text or floating card covering the artwork
   - Original premium cream/orange styling preserved
   - Search functionality preserved
   - Location and date filters preserved
   - All 8 category cards preserved
   - Category navigation preserved
   - Responsive layout preserved
   - Framer Motion animations preserved

   ========================================================== */

/* ==========================================================
   CATEGORY TYPES
   ========================================================== */

interface CategoryItem {
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: LucideIcon;
  color: string;
  size: "large" | "medium" | "small";
  imagePosition: string;
}

/* ==========================================================
   CATEGORY DATA

   All existing category names, slugs, icons,
   descriptions, colors, and image paths preserved.

   ========================================================== */

const categories: CategoryItem[] = [
  {
    name: "Music",
    slug: "music",
    description: "Concerts, Live Shows & Music Festivals",
    image: "/images/categories/music.png",
    icon: Music2,
    color: "#f01446",
    size: "large",
    imagePosition: "center center",
  },
  {
    name: "Cultural",
    slug: "cultural",
    description: "Traditional Events, Heritage & Arts",
    image: "/images/categories/cultural.png",
    icon: Landmark,
    color: "#ff9900",
    size: "medium",
    imagePosition: "center 35%",
  },
  {
    name: "Comedy",
    slug: "comedy",
    description: "Stand-up, Comedy Shows & More",
    image: "/images/categories/comedy.png",
    icon: Mic2,
    color: "#782bff",
    size: "medium",
    imagePosition: "center center",
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Matches, Tournaments & Sports Events",
    image: "/images/categories/sports.png",
    icon: Dumbbell,
    color: "#1677ff",
    size: "small",
    imagePosition: "center center",
  },
  {
    name: "Theatre",
    slug: "theatre",
    description: "Plays, Performances & Stage Shows",
    image: "/images/categories/theatre.png",
    icon: Theater,
    color: "#f21d35",
    size: "small",
    imagePosition: "center center",
  },
  {
    name: "Festivals",
    slug: "festivals",
    description: "Cultural, Seasonal & Community Fairs",
    image: "/images/categories/festivals.png",
    icon: Sparkles,
    color: "#e91e63",
    size: "small",
    imagePosition: "center center",
  },
  {
    name: "Workshops",
    slug: "workshops",
    description: "Learning, Skill Development & Classes",
    image: "/images/categories/workshops.png",
    icon: UsersRound,
    color: "#00b96b",
    size: "small",
    imagePosition: "center 35%",
  },
  {
    name: "Others",
    slug: "others",
    description: "Unique & Diverse Events",
    image: "/images/categories/others.png",
    icon: Grid2X2,
    color: "#77808c",
    size: "small",
    imagePosition: "center center",
  },
];

/* ==========================================================
   SEARCH LOCATION OPTIONS
   ========================================================== */

const locations = [
  "Worldwide",
  "Sri Lanka",
  "India",
  "United Kingdom",
  "Switzerland",
  "Australia",
  "Canada",
  "United States",
  "Singapore",
  "United Arab Emirates",
];

/* ==========================================================
   DATE FILTER OPTIONS
   ========================================================== */

const dateOptions = [
  {
    label: "Any Date",
    value: "",
  },
  {
    label: "Today",
    value: "today",
  },
  {
    label: "This Weekend",
    value: "this-weekend",
  },
  {
    label: "This Week",
    value: "this-week",
  },
  {
    label: "This Month",
    value: "this-month",
  },
];

/* ==========================================================
   CATEGORY CARD
   ========================================================== */

interface CategoryTileProps {
  category: CategoryItem;
  index: number;
  reducedMotion: boolean;
}

function CategoryTile({
  category,
  index,
  reducedMotion,
}: CategoryTileProps) {
  const Icon = category.icon;

  const isLarge = category.size === "large";

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 20,
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
        duration: reducedMotion ? 0 : 0.5,
        delay: reducedMotion
          ? 0
          : Math.min(index * 0.05, 0.3),
        ease: "easeOut",
      }}
      className={`min-w-0 ${
        isLarge
          ? "lg:col-span-2"
          : "lg:col-span-1"
      }`}
    >
      <Link
        href={`/categories/${category.slug}`}
        aria-label={`Explore ${category.name}: ${category.description}`}
        className="
          group
          relative
          block
          h-65
          w-full
          overflow-hidden
          rounded-[20px]
          border
          border-[#eee7dc]
          bg-[#30271e]
          shadow-[0_6px_20px_rgba(45,30,15,0.09)]
          outline-none
          transition-all
          duration-300
          hover:-translate-y-1.25
          hover:border-[#e1c69e]
          hover:shadow-[0_16px_36px_rgba(45,30,15,0.17)]
          focus-visible:ring-2
          focus-visible:ring-[#e99014]
          focus-visible:ring-offset-4
          sm:h-68.75
          lg:h-67.5
          xl:h-73.75
        "
      >
        {/* ================================================
            CATEGORY IMAGE
            ================================================ */}

        <Image
          src={category.image}
          alt={category.name}
          fill
          priority={index === 0}
          loading={index === 0 ? undefined : "lazy"}
          sizes={
            isLarge
              ? "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1399px) 50vw, 45vw"
              : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          }
          style={{
            objectPosition: category.imagePosition,
          }}
          className="
            object-cover
            transition-transform
            duration-700
            ease-out
            motion-safe:group-hover:scale-[1.065]
          "
        />

        {/* ================================================
            IMAGE READABILITY GRADIENT
            ================================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-linear-to-t
            from-black/90
            via-black/20
            to-black/5
          "
        />

        {/* ================================================
            HOVER LIGHT
            ================================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-white/0
            transition-colors
            duration-500
            group-hover:bg-white/5
          "
        />

        {/* ================================================
            TOP CORNER ACCENT
            ================================================ */}

        <div
          aria-hidden="true"
          className="
            absolute
            right-4
            top-4
            h-2
            w-2
            rounded-full
            border
            border-white/60
            shadow-[0_0_12px_rgba(255,255,255,0.35)]
          "
          style={{
            backgroundColor: category.color,
          }}
        />

        {/* ================================================
            CATEGORY DETAILS
            ================================================ */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            z-10
            flex
            items-end
            justify-between
            gap-3
            p-4
            sm:p-5
            xl:p-6
          "
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* CATEGORY ICON */}

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-[14px]
                border
                border-white/20
                text-white
                shadow-[0_5px_15px_rgba(0,0,0,0.18)]
                transition-transform
                duration-300
                motion-safe:group-hover:scale-110
                sm:h-12
                sm:w-12
              "
              style={{
                backgroundColor: category.color,
              }}
            >
              <Icon
                size={22}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>

            {/* CATEGORY NAME & DESCRIPTION */}

            <div className="min-w-0 flex-1">
              <h3
                className="
                  font-serif
                  text-[20px]
                  font-bold
                  leading-[1.2]
                  tracking-tight
                  text-white
                  sm:text-[23px]
                  xl:text-[25px]
                "
              >
                {category.name}
              </h3>

              <p
                className="
                  mt-1.5
                  max-w-70
                  text-[11px]
                  leading-normal
                  text-white/85
                  sm:text-[12px]
                "
              >
                {category.description}
              </p>
            </div>
          </div>

          {/* CATEGORY ARROW */}

          <span
            aria-hidden="true"
            className="
              flex
              h-9.25
              w-9.25
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-white/50
              bg-white/10
              text-white
              backdrop-blur-md
              transition-all
              duration-300
              group-hover:border-[#f28b00]
              group-hover:bg-[#f28b00]
              group-hover:shadow-[0_5px_16px_rgba(242,139,0,0.28)]
              sm:h-10
              sm:w-10
            "
          >
            <ArrowRight
              size={19}
              strokeWidth={2}
              className="
                transition-transform
                duration-300
                motion-safe:group-hover:translate-x-0.75
              "
            />
          </span>
        </div>

        {/* ================================================
            BOTTOM ACCENT
            ================================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-0.75
            origin-center
            scale-x-0
            transition-transform
            duration-300
            group-hover:scale-x-100
          "
          style={{
            backgroundColor: category.color,
          }}
        />
      </Link>
    </motion.div>
  );
}

/* ==========================================================
   MAIN CATEGORIES PAGE
   ========================================================== */

export default function CategoriesPage() {
  const router = useRouter();

  const prefersReducedMotion = useReducedMotion();

  const reducedMotion =
    prefersReducedMotion === true;

  /* ========================================================
     SEARCH STATE
     ======================================================== */

  const [searchQuery, setSearchQuery] =
    useState("");

  const [location, setLocation] =
    useState("Worldwide");

  const [dateFilter, setDateFilter] =
    useState("");

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

    if (dateFilter) {
      params.set("date", dateFilter);
    }

    const queryString = params.toString();

    router.push(
      `/events${queryString ? `?${queryString}` : ""}`
    );
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <main className="min-h-screen bg-[#fffdf9]">
      {/* ====================================================
          CATEGORY HERO SECTION
          ==================================================== */}

      <section
        aria-labelledby="category-page-title"
        className="
          relative
          isolate
          overflow-hidden
          bg-[#fffaf2]
        "
      >
        {/* DECORATIVE BACKGROUND CIRCLE 1 */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-45
            -left-35
            h-105
            w-175
            rotate-[-7deg]
            rounded-[50%]
            border
            border-[#e9b35c]/20
          "
        />

        {/* DECORATIVE BACKGROUND CIRCLE 2 */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-55
            -left-25
            h-105
            w-175
            rotate-[-7deg]
            rounded-[50%]
            border
            border-[#e9b35c]/15
          "
        />

        {/* SOFT BACKGROUND GLOW */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-45
            -top-45
            h-125
            w-125
            rounded-full
            bg-[#f7dba9]/20
            blur-3xl
          "
        />

        {/* MAIN CONTENT CONTAINER */}

        <div className="vizha-container relative z-10 mx-auto w-full">
          {/* ==================================================
              HERO CONTENT GRID
              ================================================== */}

          <div
            className="
              relative
              grid
              min-h-77.5
              items-center
              gap-8
              pt-12
              sm:min-h-85
              lg:min-h-90
              lg:grid-cols-[0.9fr_1.1fr]
              lg:gap-10
              lg:pt-8
            "
          >
            {/* ==============================================
                LEFT — TEXT CONTENT
                ============================================== */}

            <motion.div
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      x: -25,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: reducedMotion ? 0 : 0.65,
              }}
              className="
                relative
                z-20
                pb-8
                lg:pb-12
              "
            >
              {/* EYEBROW */}

              <div className="mb-5 flex items-center gap-2.5">
                <Sparkles
                  size={17}
                  strokeWidth={2.1}
                  aria-hidden="true"
                  className="text-[#de8208]"
                />

                <span
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[#c47709]
                    sm:text-[12px]
                  "
                >
                  Explore By Genre
                </span>
              </div>

              {/* MAIN HEADING */}

              <h1
                id="category-page-title"
                className="
                  max-w-162.5
                  overflow-visible
                  pb-[0.08em]
                  font-sans
                  text-[clamp(2.55rem,4.2vw,4.1rem)]
                  font-extrabold
                  leading-[1.12]
                  tracking-[-0.045em]
                  text-[#171717]
                "
              >
                Find Your Kind of{" "}

                <span
                  className="
                    block
                    overflow-visible
                    pb-[0.1em]
                    bg-linear-to-r
                    from-[#f28b00]
                    via-[#db7c00]
                    to-[#bb6400]
                    bg-clip-text
                    text-transparent
                  "
                >
                  Experience
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-5
                  max-w-142.5
                  text-[14px]
                  leading-[1.8]
                  text-[#5b5b5b]
                  sm:text-[16px]
                "
              >
                Explore a world of events, from live music
                and cultural celebrations to comedy,
                sports, theatre, festivals, workshops
                and more.
              </p>
            </motion.div>

            {/* ==============================================
                RIGHT — ORIGINAL HERO ARTWORK

                CORRECTED:
                - No tagline text
                - No cream floating panel
                - No decorative tagline lines
                - No extra content on top of the image

                The original image is preserved.

                ============================================== */}

            <motion.div
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      x: 25,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: reducedMotion ? 0 : 0.8,
                delay: reducedMotion ? 0 : 0.1,
              }}
              className="
                relative
                hidden
                h-85
                min-w-0
                overflow-hidden
                lg:block
              "
            >
              {/* ORIGINAL CATEGORY HERO IMAGE */}

              <div
                aria-hidden="true"
                className="
                  absolute
                  inset-0
                  z-0
                  bg-cover
                  bg-center
                  bg-no-repeat
                "
                style={{
                  backgroundImage:
                    "url('/images/categories/category-hero.png')",
                }}
              />

              {/* SOFT LEFT TRANSITION ONLY */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  z-10
                  bg-linear-to-r
                  from-[#fffaf2]
                  via-[#fffaf2]/15
                  to-transparent
                "
              />

              {/* SUBTLE BOTTOM FADE */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  z-10
                  bg-linear-to-t
                  from-[#fffaf2]/40
                  via-transparent
                  to-transparent
                "
              />

              {/*
                IMPORTANT:

                The previous "Live Events Brighter Together"
                overlay has been completely removed.

                Do not add the cream panel back here.

                This area intentionally contains only:
                - The original hero image
                - A subtle left-side blending gradient
                - A subtle bottom fade
              */}
            </motion.div>
          </div>

          {/* ==================================================
              SEARCH AND FILTER BAR
              ================================================== */}

          <motion.div
            initial={
              reducedMotion
                ? false
                : {
                    opacity: 0,
                    y: 18,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.6,
              delay: reducedMotion ? 0 : 0.15,
            }}
            className="
              relative
              z-30
              mb-9
              lg:-mt-3
              lg:mb-11
            "
          >
            <form
              role="search"
              onSubmit={handleSearch}
              className="
                flex
                w-full
                flex-col
                overflow-hidden
                rounded-[18px]
                border
                border-[#eee2d2]
                bg-white
                shadow-[0_10px_35px_rgba(78,49,15,0.10)]
                transition-all
                duration-300
                focus-within:border-[#e6ba83]
                focus-within:shadow-[0_12px_36px_rgba(78,49,15,0.13)]
                lg:min-h-16.5
                lg:flex-row
                lg:items-stretch
                lg:rounded-[20px]
              "
            >
              {/* ============================================
                  SEARCH INPUT
                  ============================================ */}

              <div
                className="
                  flex
                  min-h-15
                  min-w-0
                  flex-1
                  items-center
                  gap-3
                  px-5
                  lg:px-6
                "
              >
                <Search
                  size={21}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 text-[#d78009]"
                />

                <input
                  type="search"
                  name="q"
                  aria-label="Search events, categories, or cities"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search events, categories or cities..."
                  className="
                    h-12.5
                    w-full
                    min-w-0
                    bg-transparent
                    text-[13px]
                    font-medium
                    text-[#252525]
                    outline-none
                    placeholder:font-normal
                    placeholder:text-[#969696]
                    sm:text-[14px]
                  "
                />
              </div>

              {/* ============================================
                  LOCATION FILTER
                  ============================================ */}

              <div
                className="
                  relative
                  flex
                  min-h-14.5
                  items-center
                  gap-3
                  border-t
                  border-[#eee8df]
                  px-5
                  lg:w-48.75
                  lg:min-w-48.75
                  lg:border-l
                  lg:border-t-0
                "
              >
                <MapPin
                  size={19}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 text-[#d78009]"
                />

                <select
                  name="location"
                  aria-label="Select location"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  className="
                    relative
                    z-10
                    h-12
                    w-full
                    min-w-0
                    cursor-pointer
                    appearance-none
                    bg-transparent
                    pr-5
                    text-[13px]
                    font-medium
                    text-[#343434]
                    outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#e99a35]
                  "
                >
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
                  size={15}
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    text-[#555]
                  "
                />
              </div>

              {/* ============================================
                  DATE FILTER
                  ============================================ */}

              <div
                className="
                  relative
                  flex
                  min-h-14.5
                  items-center
                  gap-3
                  border-t
                  border-[#eee8df]
                  px-5
                  lg:w-43.75
                  lg:min-w-43.75
                  lg:border-l
                  lg:border-t-0
                "
              >
                <CalendarDays
                  size={19}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 text-[#d78009]"
                />

                <select
                  name="date"
                  aria-label="Filter events by date"
                  value={dateFilter}
                  onChange={(event) =>
                    setDateFilter(event.target.value)
                  }
                  className="
                    relative
                    z-10
                    h-12
                    w-full
                    min-w-0
                    cursor-pointer
                    appearance-none
                    bg-transparent
                    pr-5
                    text-[13px]
                    font-medium
                    text-[#343434]
                    outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#e99a35]
                  "
                >
                  {dateOptions.map((option) => (
                    <option
                      key={option.label}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    text-[#555]
                  "
                />
              </div>

              {/* ============================================
                  SEARCH BUTTON
                  ============================================ */}

              <button
                type="submit"
                className="
                  group
                  m-2
                  flex
                  min-h-12
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-[11px]
                  bg-linear-to-r
                  from-[#f39a0b]
                  via-[#e58700]
                  to-[#ce7000]
                  px-7
                  text-[13px]
                  font-bold
                  text-white
                  shadow-[0_5px_16px_rgba(242,139,0,0.18)]
                  outline-none
                  transition-all
                  duration-300
                  hover:brightness-105
                  hover:shadow-[0_8px_22px_rgba(242,139,0,0.28)]
                  focus-visible:ring-2
                  focus-visible:ring-[#e99a35]
                  focus-visible:ring-offset-2
                  lg:m-2.5
                "
              >
                <Search
                  size={17}
                  strokeWidth={2.2}
                  aria-hidden="true"
                  className="
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                />

                <span>
                  Search Events
                </span>
              </button>
            </form>
          </motion.div>

          {/* ==================================================
              CATEGORY GRID SECTION
              ================================================== */}

          <section
            aria-labelledby="all-categories-title"
            className="
              pb-14
              sm:pb-16
              lg:pb-20
            "
          >
            {/* ==============================================
                SECTION HEADING
                ============================================== */}

            <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
              <div>
                {/* SMALL ORANGE ACCENT */}

                <div
                  aria-hidden="true"
                  className="
                    mb-3
                    h-1
                    w-8
                    rounded-full
                    bg-linear-to-r
                    from-[#e99a18]
                    to-[#bc6e05]
                  "
                />

                <h2
                  id="all-categories-title"
                  className="
                    vizha-heading
                    text-[26px]
                    font-bold
                    tracking-tight
                    text-[#171717]
                    sm:text-[31px]
                    lg:text-[35px]
                  "
                >
                  Browse All Categories
                </h2>

                <p
                  className="
                    mt-2
                    text-[13px]
                    text-[#777]
                    sm:text-[14px]
                  "
                >
                  Discover experiences for every interest.
                </p>
              </div>

              {/* CATEGORY COUNT */}

              <span
                className="
                  hidden
                  rounded-full
                  border
                  border-[#eedfcb]
                  bg-white
                  px-4
                  py-2
                  text-[12px]
                  font-semibold
                  text-[#b46d0b]
                  sm:inline-flex
                "
              >
                {categories.length} Categories
              </span>
            </div>

            {/* ==============================================
                ALL CATEGORY CARDS
                ============================================== */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                sm:gap-5
                lg:grid-cols-4
                lg:gap-5
                xl:gap-6
              "
            >
              {categories.map((category, index) => (
                <CategoryTile
                  key={category.slug}
                  category={category}
                  index={index}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
