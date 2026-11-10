
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Play,
  Sparkles,
  X,
} from "lucide-react";

/* ==========================================================
   VIZHA TICKETS - FEATURED EVENT CONFIGURATION

   Replace event details with real database data
   when your dynamic event system is connected.
   ========================================================== */

const featuredEvent = {
  title: "Jaffna Food Festival 2026",
  date: "18 Nov 2026",
  dateISO: "2026-11-18",
  location: "Jaffna Public Ground",
  time: "10:00 AM Onwards",
  description:
    "Experience an unforgettable food festival featuring local cuisine, music, cultural performances, family-friendly activities and more.",
  image: "/images/events/featured-event.png",
  href: "/events/jaffna-food-festival-2026",
};

/* ==========================================================
   VIDEO CONFIGURATION

   Set the URL to an actual hosted video when available.

   Example:
   "/videos/jaffna-food-festival-highlights.mp4"

   Null means no video is available, so the play
   control will not be shown.
   ========================================================== */

const FEATURED_VIDEO_URL: string | null = null;

/* ==========================================================
   MAIN COMPONENT
   ========================================================== */

export default function FeaturedEvent() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion === true;

  const [videoOpen, setVideoOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);

  /* CLOSE VIDEO USING ESCAPE */

  useEffect(() => {
    if (!videoOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVideoOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    const playButton = playButtonRef.current;

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      playButton?.focus();
    };
  }, [videoOpen]);

  return (
    <>
      <section
        aria-labelledby="featured-event-title"
        className="relative isolate overflow-hidden bg-[#fffaf2] py-12 sm:py-14 lg:py-16"
      >
        {/* DECORATIVE BACKGROUND */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-27.5 -left-25 h-82.5 w-82.5 rounded-full bg-[#e8c996]/20 blur-[85px]"
        />

        {/* MAIN CONTAINER */}

        <div className="vizha-container relative z-10 mx-auto w-full">
          {/* FEATURED EVENT CARD */}

          <motion.div
            initial={
              reducedMotion
                ? false
                : { opacity: 0, y: 22 }
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
              duration: reducedMotion ? 0 : 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden rounded-[22px] border border-[#eadfce] bg-[#fff8ed] shadow-[0_10px_35px_rgba(82,51,18,0.07)] lg:rounded-3xl"
          >
            {/* SUBTLE DECORATIVE CIRCLE */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-21.25 left-[32%] h-57.5 w-57.5 rounded-full border-22 border-[#e4bd7e]/10"
            />

            <div className="grid lg:grid-cols-2">
              {/* ==========================================
                  LEFT EVENT DETAILS
                  ========================================== */}

              <motion.div
                initial={
                  reducedMotion
                    ? false
                    : { opacity: 0, x: -20 }
                }
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: reducedMotion ? 0 : 0.65,
                }}
                className="relative z-10 flex min-w-0 flex-col justify-center px-6 py-10 sm:px-9 sm:py-12 lg:px-10 lg:py-12 xl:px-12 xl:py-14"
              >
                {/* FEATURED LABEL */}

                <div className="mb-5 flex items-center gap-2.5">
                  <Sparkles
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="text-[#c9790b]"
                  />

                  <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#b76d0a] sm:text-[11px]">
                    Featured Event
                  </p>
                </div>

                {/* EVENT HEADING */}

                <h2
                  id="featured-event-title"
                  className="vizha-heading max-w-155 text-[clamp(2rem,3.1vw,3.1rem)] font-bold leading-[1.13] tracking-[-0.035em] text-[#171717]"
                >
                  <span className="text-[#c9790b]">
                    Jaffna Food
                  </span>{" "}
                  Festival 2026
                </h2>

                {/* EVENT METADATA */}

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-7">
                  {/* DATE */}

                  <div className="flex items-center gap-2 text-[12px] font-medium text-[#525252] sm:text-[13px]">
                    <CalendarDays
                      size={17}
                      strokeWidth={1.9}
                      aria-hidden="true"
                      className="shrink-0 text-[#c9790b]"
                    />

                    <time dateTime={featuredEvent.dateISO}>
                      {featuredEvent.date}
                    </time>
                  </div>

                  {/* LOCATION */}

                  <div className="flex items-center gap-2 text-[12px] font-medium text-[#525252] sm:text-[13px]">
                    <MapPin
                      size={17}
                      strokeWidth={1.9}
                      aria-hidden="true"
                      className="shrink-0 text-[#c9790b]"
                    />

                    <span>
                      {featuredEvent.location}
                    </span>
                  </div>

                  {/* TIME */}

                  <div className="flex items-center gap-2 text-[12px] font-medium text-[#525252] sm:text-[13px]">
                    <Clock3
                      size={17}
                      strokeWidth={1.9}
                      aria-hidden="true"
                      className="shrink-0 text-[#c9790b]"
                    />

                    <span>
                      {featuredEvent.time}
                    </span>
                  </div>
                </div>

                {/* EVENT DESCRIPTION */}

                <p className="mt-6 max-w-137.5 text-[13px] leading-[1.85] text-[#565656] sm:text-[14px]">
                  {featuredEvent.description}
                </p>

                {/* BOOKING ACTION */}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={featuredEvent.href}
                    className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[11px] bg-linear-to-r from-[#d4860b] via-[#c9790b] to-[#b76504] px-7 text-[13px] font-bold text-white shadow-[0_6px_18px_rgba(201,121,11,0.18)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(201,121,11,0.25)] focus-visible:ring-2 focus-visible:ring-[#c9790b] focus-visible:ring-offset-4"
                  >
                    Book Tickets

                    <ArrowRight
                      size={17}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.div>

              {/* ==========================================
                  RIGHT EVENT ARTWORK
                  ========================================== */}

              <motion.div
                initial={
                  reducedMotion
                    ? false
                    : { opacity: 0, scale: 1.025 }
                }
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: reducedMotion ? 0 : 0.75,
                }}
                className="relative isolate min-h-67.5 overflow-hidden bg-[#24170c] sm:min-h-85 lg:min-h-102.5"
              >
                {/* FEATURED IMAGE */}

                <Image
                  src={featuredEvent.image}
                  alt="Jaffna Food Festival featured promotional artwork"
                  fill
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                />

                {/* CINEMATIC IMAGE OVERLAY */}

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/10 via-transparent to-black/20"
                />

                {/* SOFT BOTTOM SHADE */}

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent"
                />

                {/* ======================================
                    VIDEO PLAY BUTTON

                    Only rendered when a real video
                    URL is available.
                    ====================================== */}

                {FEATURED_VIDEO_URL && (
                  <button
                    ref={playButtonRef}
                    type="button"
                    onClick={() => setVideoOpen(true)}
                    aria-label="Watch featured event highlights"
                    aria-haspopup="dialog"
                    className="group absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#f0a13a] focus-visible:ring-offset-4"
                  >
                    {/* GOLD OUTER RING */}

                    <span className="relative flex h-19 w-19 items-center justify-center rounded-full border border-[#f4c374]/65 bg-black/45 shadow-[0_8px_28px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-[#f4c374] group-hover:bg-[#c9790b]/90">
                      <span
                        aria-hidden="true"
                        className="absolute inset-1.5 rounded-full border border-white/25"
                      />

                      <Play
                        size={26}
                        strokeWidth={1.7}
                        fill="currentColor"
                        aria-hidden="true"
                        className="relative ml-1 text-white"
                      />
                    </span>

                    {/* WATCH HIGHLIGHTS LABEL */}

                    <span className="rounded-full border border-white/15 bg-black/60 px-4 py-2 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
                      Watch Highlights
                    </span>
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          VIDEO MODAL

          Only rendered when a video URL exists and
          the user opens it.
          ====================================================== */}

      {FEATURED_VIDEO_URL && videoOpen && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/85 px-4 py-8 backdrop-blur-md"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setVideoOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Featured event highlights"
            className="relative w-full max-w-250 rounded-[18px] border border-white/15 bg-[#111] p-3 shadow-[0_25px_90px_rgba(0,0,0,0.55)] sm:p-4"
          >
            {/* CLOSE BUTTON */}

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setVideoOpen(false)}
              aria-label="Close video"
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-[#f0a13a]"
            >
              <X size={21} />
            </button>

            {/* VIDEO PLAYER */}

            <video
              src={FEATURED_VIDEO_URL}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="aspect-video w-full rounded-xl bg-black"
            >
              Your browser does not support HTML5 video.
            </video>
          </div>
        </div>
      )}
    </>
  );
}
