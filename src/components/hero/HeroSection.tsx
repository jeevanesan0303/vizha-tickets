
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clapperboard,
  Dumbbell,
  Landmark,
  MapPin,
  Mic2,
  Music2,
  Search,
  Sparkles,
  Theater,
} from "lucide-react";

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
] as const;

export default function HeroSection() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Worldwide");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
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

    router.push(
      `/events${queryString ? `?${queryString}` : ""}`
    );
  };

  return (
    <section
      aria-labelledby="vizha-hero-title"
      className="relative isolate w-full overflow-hidden bg-[#fffaf3]"
    >
      {/* ======================================================
          HERO ARTWORK
          Desktop: fit image across the available width.
          Mobile: use cover for better portrait composition.
          ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          bg-cover
          bg-position-[65%_center]
          bg-no-repeat
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
          pointer-events-none
          absolute
          inset-0
          z-1
          bg-linear-to-b
          from-white/90
          via-white/75
          to-[#fffaf3]/90
          lg:hidden
        "
      />

      {/* DESKTOP LEFT-SIDE READABILITY */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-1
          hidden
          bg-linear-to-r
          from-white/25
          via-white/5
          to-transparent
          lg:block
        "
      />

      {/* ======================================================
          MAIN HERO CONTENT
          ====================================================== */}

      <div className="vizha-container relative z-10 mx-auto w-full">
        <div
          className="
            relative
            flex
            min-h-140
            items-center
            py-14
            sm:min-h-150
            sm:py-16
            lg:min-h-147.5
            lg:py-10
            xl:min-h-155
            2xl:min-h-162.5
          "
        >
          <motion.div
            initial={
              reducedMotion
                ? false
                : { opacity: 0, y: 16 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              z-20
              w-full
              max-w-180
              lg:max-w-162.5
              xl:max-w-180
            "
          >
            {/* SMALL TOP TAGLINE */}

            <div className="mb-5 flex items-center gap-3 sm:mb-6">
              <span
                aria-hidden="true"
                className="
                  h-0.5
                  w-7
                  shrink-0
                  rounded-full
                  bg-[#d78009]
                "
              />

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.19em]
                  text-[#bf7009]
                  sm:text-[12px]
                "
              >
                Live Events. Real Experiences.
              </p>
            </div>

            {/* MAIN HEADLINE */}

            <h1
              id="vizha-hero-title"
              className="
                vizha-heading
                font-bold
                text-[#171717]
                text-[clamp(2.5rem,4.2vw,4rem)]
                leading-[1.08]
                tracking-[-0.035em]
              "
            >
              <span className="block">
                Discover Amazing
              </span>

              <span
                className="
                  block
                  bg-linear-to-r
                  from-[#c77708]
                  via-[#dc8708]
                  to-[#bc6b00]
                  bg-clip-text
                  text-transparent
                  lg:whitespace-nowrap
                "
              >
                Events Around You
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                mt-6
                max-w-147.5
                text-[14px]
                leading-[1.8]
                text-[#515151]
                sm:mt-7
                sm:text-[16px]
                lg:mt-6
              "
            >
              From concerts to cultural festivals, comedy shows,
              sports, theatre, and more — find and book tickets
              for the best events near you.
            </p>

            {/* ==================================================
                SEARCH BAR
                ================================================== */}

            <form
              role="search"
              onSubmit={handleSearch}
              className="
                relative
                mt-8
                w-full
                max-w-176.25
                overflow-hidden
                rounded-[17px]
                border
                border-[#eadfd0]
                bg-white/95
                shadow-[0_10px_32px_rgba(85,55,15,0.10)]
                backdrop-blur-lg
                transition-all
                duration-300
                focus-within:border-[#e7b371]
                focus-within:shadow-[0_12px_35px_rgba(130,75,10,0.13)]
                sm:mt-9
                lg:mt-8
              "
            >
              <div
                className="
                  flex
                  flex-col
                  lg:min-h-16.5
                  lg:flex-row
                  lg:items-stretch
                "
              >
                {/* SEARCH INPUT */}

                <div
                  className="
                    flex
                    min-h-14.75
                    min-w-0
                    flex-1
                    items-center
                    gap-3
                    px-5
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
                      h-12.5
                      w-full
                      min-w-0
                      bg-transparent
                      text-[13px]
                      font-medium
                      text-[#292929]
                      outline-none
                      placeholder:font-normal
                      placeholder:text-[#929292]
                      sm:text-[14px]
                    "
                  />
                </div>

                {/* LOCATION SELECTOR */}

                <div
                  className="
                    relative
                    flex
                    min-h-14.25
                    items-center
                    gap-2.5
                    border-t
                    border-[#eee6dc]
                    px-5
                    lg:w-45
                    lg:min-w-45
                    lg:border-l
                    lg:border-t-0
                    lg:px-4
                  "
                >
                  <MapPin
                    size={19}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="shrink-0 text-[#d47b07]"
                  />

                  <select
                    name="location"
                    aria-label="Select event location"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    className="
                      relative
                      z-10
                      h-12.25
                      w-full
                      min-w-0
                      cursor-pointer
                      appearance-none
                      bg-transparent
                      pr-5
                      text-[13px]
                      font-medium
                      text-[#373737]
                      outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#e99a35]
                    "
                  >
                    {locations.map((item) => (
                      <option key={item} value={item}>
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
                      text-[#454545]
                    "
                  />
                </div>

                {/* SEARCH BUTTON */}

                <button
                  type="submit"
                  className="
                    group
                    m-2
                    flex
                    min-h-12.25
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-[10px]
                    bg-linear-to-r
                    from-[#df870b]
                    via-[#cf7907]
                    to-[#bd6902]
                    px-6
                    text-[13px]
                    font-bold
                    text-white
                    shadow-[0_5px_15px_rgba(193,105,0,0.15)]
                    outline-none
                    transition-all
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
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                  />

                  <span>Search Events</span>
                </button>
              </div>
            </form>

            {/* MOBILE / TABLET CATEGORIES */}

            <div className="mt-7 lg:hidden">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-[13px] font-bold text-[#292929]">
                  Explore Categories
                </h2>

                <Link
                  href="/categories"
                  className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-[#c7780c] hover:text-[#a75d00]"
                >
                  View All
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="overflow-x-auto pb-3 scrollbar-none [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;

                    return (
                      <Link
                        key={category.slug}
                        href={`/categories/${category.slug}`}
                        className="
                          group
                          flex
                          min-h-20.5
                          min-w-23.5
                          flex-col
                          items-center
                          justify-center
                          gap-2
                          rounded-[14px]
                          border
                          border-[#eedfcb]
                          bg-white/95
                          px-3
                          py-3
                          shadow-[0_4px_16px_rgba(85,55,15,0.06)]
                          backdrop-blur-md
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:border-[#dea85e]
                          hover:bg-[#fff7ea]
                        "
                      >
                        <Icon
                          size={21}
                          strokeWidth={1.8}
                          aria-hidden="true"
                          className="text-[#ce7809] transition-transform duration-300 group-hover:scale-110"
                        />

                        <span className="whitespace-nowrap text-[11px] font-semibold text-[#393939]">
                          {category.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ======================================================
            DESKTOP CATEGORIES
            Separate from hero content to avoid overlap.
            ====================================================== */}

        <div className="relative z-30 hidden pb-10 pt-3 lg:block xl:pb-12">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="
                  h-6
                  w-0.75
                  rounded-full
                  bg-linear-to-b
                  from-[#ffae32]
                  to-[#cb7200]
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
              href="/categories"
              className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold text-[#c47709] transition-all duration-200 hover:bg-[#fff3e3] hover:text-[#a95d00]"
            >
              View All Categories

              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          {/* CATEGORY CARDS */}

          <div className="grid grid-cols-8 gap-3 xl:gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;

              return (
                <motion.div
                  key={category.slug}
                  initial={
                    reducedMotion
                      ? false
                      : { opacity: 0, y: 12 }
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
                    duration: 0.4,
                    delay: reducedMotion
                      ? 0
                      : index * 0.045,
                  }}
                  className="min-w-0"
                >
                  <Link
                    href={`/categories/${category.slug}`}
                    className="
                      group
                      relative
                      flex
                      h-24
                      w-full
                      flex-col
                      items-center
                      justify-center
                      gap-2
                      overflow-hidden
                      rounded-2xl
                      border
                      border-[#efe4d5]
                      bg-white/95
                      px-2
                      text-center
                      shadow-[0_5px_18px_rgba(85,55,15,0.06)]
                      backdrop-blur-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1.5
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
                        pointer-events-none
                        absolute
                        inset-x-0
                        bottom-0
                        h-0.75
                        origin-center
                        scale-x-0
                        rounded-t-full
                        bg-linear-to-r
                        from-[#ffac35]
                        via-[#df8509]
                        to-[#ba6700]
                        transition-transform
                        duration-300
                        group-hover:scale-x-100
                      "
                    />

                    <div className="flex h-9.75 w-9.75 items-center justify-center rounded-xl bg-[#fff5e6] text-[#ce7809] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#ffecd0]">
                      <Icon
                        size={21}
                        strokeWidth={1.9}
                        aria-hidden="true"
                      />
                    </div>

                    <span className="text-[11px] font-semibold text-[#333] transition-colors duration-300 group-hover:text-[#b96800] xl:text-[12px]">
                      {category.name}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
