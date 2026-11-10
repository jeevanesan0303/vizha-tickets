


import Image from "next/image";
import Link from "next/link";
import { useParams, Navigate } from "react-router-dom";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import EventCard from "@/components/events/EventCard";

import { categories } from "@/data/categories";
import { events } from "@/data/events";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Compass,
  Sparkles,
  Ticket,
} from "lucide-react";

/* ==========================================================
   VIZHA TICKETS - CATEGORY DETAIL PAGE
   ========================================================== */


/* ==========================================================
   CATEGORY THEME CONFIGURATION
   ========================================================== */

const categoryThemes: Record<
  string,
  {
    color: string;
    softColor: string;
    label: string;
    description: string;
  }
> = {
  music: {
    color: "#f01446",
    softColor: "#fff0f3",
    label: "Music & Concerts",
    description:
      "Feel the rhythm of unforgettable live performances, concerts, and musical experiences.",
  },
  cultural: {
    color: "#e88a00",
    softColor: "#fff3e1",
    label: "Culture & Heritage",
    description:
      "Celebrate traditions, heritage, dance, and the beauty of cultural experiences.",
  },
  comedy: {
    color: "#782bff",
    softColor: "#f3edff",
    label: "Comedy & Entertainment",
    description:
      "Discover laughter-filled evenings, stand-up performances, and comedy shows.",
  },
  sports: {
    color: "#1677ff",
    softColor: "#ecf4ff",
    label: "Sports & Action",
    description:
      "Experience the excitement of live matches, tournaments, and sporting events.",
  },
  theatre: {
    color: "#e83d48",
    softColor: "#fff0f1",
    label: "Theatre & Performing Arts",
    description:
      "Discover captivating stage productions, plays, and theatrical performances.",
  },
  festivals: {
    color: "#e91e63",
    softColor: "#fff0f6",
    label: "Festivals & Celebrations",
    description:
      "Explore vibrant celebrations, seasonal festivals, fairs, and community gatherings.",
  },
  workshops: {
    color: "#00a866",
    softColor: "#e8faf1",
    label: "Workshops & Learning",
    description:
      "Learn something new through creative workshops, classes, and hands-on experiences.",
  },
  others: {
    color: "#77808c",
    softColor: "#f1f3f5",
    label: "More Experiences",
    description:
      "Explore unique events, exciting activities, and experiences beyond the ordinary.",
  },
};

const fallbackTheme = {
  color: "#c9790b",
  softColor: "#fff3e1",
  label: "Explore Events",
  description:
    "Discover unforgettable events, entertainment, and experiences with VizhaTickets.",
};

/* ==========================================================
   CATEGORY ALIASES
   ========================================================== */

const categoryAliases: Record<string, string[]> = {
  music: ["music", "concert", "concerts"],
  cultural: ["cultural", "culture"],
  comedy: ["comedy"],
  sports: ["sports", "sport"],
  theatre: ["theatre", "theater"],
  festivals: ["festivals", "festival"],
  workshops: ["workshops", "workshop"],
  others: ["others", "other"],
};

/* ==========================================================
   HELPER FUNCTIONS
   ========================================================== */

function normalizeCategory(value: string): string {
  const normalized = value.trim().toLowerCase();

  for (const [slug, aliases] of Object.entries(
    categoryAliases
  )) {
    if (
      aliases.some(
        (alias) =>
          normalized === alias ||
          normalized === slug
      )
    ) {
      return slug;
    }
  }

  return normalized;
}

function getCategory(slug: string) {
  return categories.find(
    (category) =>
      category.slug.toLowerCase() ===
      slug.toLowerCase()
  );
}

function getCategoryEvents(
  categorySlug: string,
  categoryName: string
) {
  const normalizedSlug =
    normalizeCategory(categorySlug);

  const normalizedName =
    normalizeCategory(categoryName);

  return events.filter((event) => {
    const eventCategory = normalizeCategory(
      String(event.category)
    );

    return (
      eventCategory === normalizedSlug ||
      eventCategory === normalizedName
    );
  });
}

/* ==========================================================
   MAIN CATEGORY DETAIL PAGE
   ========================================================== */

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategory(slug || "");

  if (!category) {
    return <Navigate to="/categories" replace />;
  }

  const theme =
    categoryThemes[category.slug.toLowerCase()] ??
    fallbackTheme;

  const categoryEvents = getCategoryEvents(
    category.slug,
    category.name
  );

  const eventCount = categoryEvents.length;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fffaf3] text-[#171717]">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <Header />

      {/* ======================================================
          BREADCRUMBS
          ====================================================== */}

      <nav
        aria-label="Breadcrumb"
        className="border-b border-[#f1e8dc] bg-white"
      >
        <div className="vizha-container mx-auto flex min-h-14.5 w-full items-center gap-2 overflow-x-auto py-3 text-[12px] sm:gap-3">
          <Link
            href="/"
            className="shrink-0 font-medium text-[#777] transition-colors hover:text-[#c9790b]"
          >
            Home
          </Link>

          <ChevronRight
            size={15}
            aria-hidden="true"
            className="shrink-0 text-[#c9b59a]"
          />

          <Link
            href="/categories"
            className="shrink-0 font-medium text-[#777] transition-colors hover:text-[#c9790b]"
          >
            Categories
          </Link>

          <ChevronRight
            size={15}
            aria-hidden="true"
            className="shrink-0 text-[#c9b59a]"
          />

          <span
            aria-current="page"
            className="font-semibold text-[#bf7209]"
          >
            {category.name}
          </span>
        </div>
      </nav>

      {/* ======================================================
          CATEGORY HERO
          ====================================================== */}

      <section
        aria-labelledby="category-detail-title"
        className="relative isolate overflow-hidden bg-[#fffaf3] py-12 sm:py-14 lg:py-16"
      >
        {/* DECORATIVE BACKGROUND */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-45 -top-45 h-107.5 w-107.5 rounded-full bg-[#f4d7a8]/25 blur-[100px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-37.5 -left-32.5 h-80 w-80 rounded-full bg-[#f2d6ab]/15 blur-[90px]"
        />

        <div className="vizha-container relative z-10 mx-auto w-full">

          <div className="grid items-center gap-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">

            {/* ==============================================
                LEFT CATEGORY IMAGE
                ============================================== */}

            <div
              className="
                group
                relative
                isolate
                aspect-16/11
                overflow-hidden
                rounded-[22px]
                border
                border-[#eadcc9]
                bg-[#eee6dc]
                shadow-[0_12px_35px_rgba(64,39,16,0.12)]
                sm:aspect-16/10
                lg:rounded-[25px]
              "
            >
              <Image
                src={category.image}
                alt={`${category.name} events and experiences`}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.035]"
              />

              {/* CINEMATIC IMAGE GRADIENT */}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/5"
              />

              {/* CATEGORY LABEL */}

              <div className="absolute bottom-5 left-5 z-10 sm:bottom-6 sm:left-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-4 py-2 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
                  <Sparkles
                    size={15}
                    aria-hidden="true"
                    className="text-[#ffbd58]"
                  />

                  {theme.label}
                </span>
              </div>

              {/* SMALL CORNER ACCENT */}

              <span
                aria-hidden="true"
                className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                style={{
                  backgroundColor: theme.color,
                }}
              />
            </div>

            {/* ==============================================
                RIGHT CATEGORY INFORMATION
                ============================================== */}

            <div className="relative max-w-155">

              {/* EYEBROW */}

              <div className="mb-5 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-0.75 w-8 rounded-full"
                  style={{
                    backgroundColor: theme.color,
                  }}
                />

                <p
                  className="text-[11px] font-bold uppercase tracking-[0.18em] sm:text-[12px]"
                  style={{
                    color: theme.color,
                  }}
                >
                  Discover Your Experience
                </p>
              </div>

              {/* CATEGORY TITLE */}

              <h1
                id="category-detail-title"
                className="vizha-heading text-[clamp(2.5rem,4.5vw,4.25rem)] font-bold leading-[1.07] tracking-[-0.04em] text-[#171717]"
              >
                <span
                  style={{
                    color: theme.color,
                  }}
                >
                  {category.name}
                </span>{" "}
                Events
              </h1>

              {/* CATEGORY DESCRIPTION */}

              <p className="mt-6 max-w-140 text-[14px] leading-[1.85] text-[#5d5d5d] sm:text-[16px]">
                {theme.description}
              </p>

              {/* EVENT COUNT AND FEATURES */}

              <div className="mt-7 flex flex-wrap items-center gap-3">

                <div className="inline-flex min-h-10.75 items-center gap-2.5 rounded-full border border-[#ead9c2] bg-white px-4 py-2 text-[12px] font-semibold text-[#444]">
                  <CalendarDays
                    size={17}
                    aria-hidden="true"
                    style={{
                      color: theme.color,
                    }}
                  />

                  {eventCount}{" "}
                  {eventCount === 1
                    ? "Event Available"
                    : "Events Available"}
                </div>

                <div className="inline-flex min-h-10.75 items-center gap-2.5 rounded-full border border-[#ead9c2] bg-white px-4 py-2 text-[12px] font-semibold text-[#444]">
                  <Ticket
                    size={17}
                    aria-hidden="true"
                    style={{
                      color: theme.color,
                    }}
                  />

                  Explore &amp; Book
                </div>
              </div>

              {/* CTA LINKS */}

              <div className="mt-8 flex flex-wrap items-center gap-3">

                <a
                  href="#category-events"
                  className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[11px] px-6 text-[13px] font-bold text-white shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9790b]"
                  style={{
                    backgroundColor: theme.color,
                  }}
                >
                  Browse Events

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>

                <Link
                  href="/categories"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[11px] border border-[#e8d9c7] bg-white px-5 text-[13px] font-semibold text-[#444] transition-all duration-300 hover:border-[#dba967] hover:bg-[#fff5e8] hover:text-[#b96d0a]"
                >
                  <ArrowLeft
                    size={17}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:-translate-x-1"
                  />

                  All Categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          EVENTS IN THIS CATEGORY
          ====================================================== */}

      <section
        id="category-events"
        aria-labelledby="category-events-title"
        className="scroll-mt-27.5 border-t border-[#efe4d6] bg-white py-14 sm:py-16 lg:py-18"
      >
        <div className="vizha-container mx-auto w-full">

          {/* SECTION HEADING */}

          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">

            <div>
              <div
                aria-hidden="true"
                className="mb-3 h-1 w-8 rounded-full bg-linear-to-r from-[#e99a18] to-[#bc6e05]"
              />

              <h2
                id="category-events-title"
                className="vizha-heading text-[26px] font-bold leading-tight tracking-[-0.03em] text-[#171717] sm:text-[32px] lg:text-[35px]"
              >
                Upcoming {category.name} Events
              </h2>

              <p className="mt-3 text-[13px] leading-[1.7] text-[#777] sm:text-[14px]">
                Discover experiences selected from this
                category.
              </p>
            </div>

            {/* EVENT COUNT */}

            <span className="inline-flex items-center rounded-full border border-[#efdac0] bg-[#fff8ef] px-4 py-2 text-[12px] font-semibold text-[#b86b0b]">
              {eventCount}{" "}
              {eventCount === 1 ? "Event" : "Events"}
            </span>
          </div>

          {/* ==============================================
              CATEGORY EVENT GRID
              ============================================== */}

          {categoryEvents.length > 0 ? (
            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="min-w-0"
                >
                  <EventCard
                    event={event}
                    priority={index === 0}
                    loading={
                      index < 4 ? "eager" : "lazy"
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            /* ==========================================
               EMPTY STATE
               ========================================== */

            <div className="rounded-3xl border border-dashed border-[#e5d5c1] bg-[#fffaf3] px-6 py-14 text-center sm:py-16">

              {/* EMPTY ICON */}

              <div className="mx-auto flex h-17.5 w-17.5 items-center justify-center rounded-full bg-[#fff0df] text-[#c9790b]">
                <Compass
                  size={30}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>

              {/* EMPTY TITLE */}

              <h3 className="mt-5 text-[20px] font-bold text-[#222] sm:text-[23px]">
                No {category.name} events currently available
              </h3>

              {/* EMPTY DESCRIPTION */}

              <p className="mx-auto mt-3 max-w-112.5 text-[13px] leading-[1.75] text-[#777] sm:text-[14px]">
                There are no events listed in this category
                right now. Explore other categories or
                browse all upcoming events.
              </p>

              {/* ACTIONS */}

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/events"
                  className="group inline-flex min-h-11.75 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#d78a0b] to-[#bc6d00] px-6 text-[13px] font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  Browse All Events

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/categories"
                  className="inline-flex min-h-11.75 items-center justify-center gap-2 rounded-xl border border-[#e8d8c4] bg-white px-6 text-[13px] font-semibold text-[#555] transition-colors hover:border-[#dba967] hover:text-[#b96d0a]"
                >
                  Other Categories
                </Link>
              </div>
            </div>
          )}

          {/* ==============================================
              EXPLORE ALL EVENTS LINK
              ============================================== */}

          {categoryEvents.length > 0 && (
            <div className="mt-10 flex justify-center">
              <Link
                href={`/events?category=${encodeURIComponent(
                  category.slug
                )}`}
                className="group inline-flex min-h-11.5 items-center justify-center gap-2.5 rounded-full border border-[#e9d5b8] bg-[#fffaf3] px-6 text-[13px] font-semibold text-[#b56e0d] transition-all duration-300 hover:border-[#d7a15b] hover:bg-[#fff2df]"
              >
                View in All Events

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <Footer />
    </main>
  );
}
