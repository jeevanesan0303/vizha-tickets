

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  Sparkles,
  Play,
  ArrowRight,
  Users,
  CalendarDays,
  ShieldCheck,
  Headset,
  Zap,
  Globe2,
  Heart,
} from "lucide-react";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

/* ==========================================================
   VIZHA TICKETS - ABOUT US PAGE
   ========================================================== */

/* ----------------------------------------------------------
   STATISTICS

   IMPORTANT:
   Replace these values with verified statistics before
   publishing the production website.
   ---------------------------------------------------------- */

const stats = [
  {
    value: "50,000+",
    label: "Happy Attendees",
    icon: Users,
  },
  {
    value: "250+",
    label: "Events Hosted",
    icon: CalendarDays,
  },
  {
    value: "100%",
    label: "Secure Digital Tickets",
    icon: ShieldCheck,
  },
  {
    value: "24/7",
    label: "Customer Support",
    icon: Headset,
  },
] as const;

/* ----------------------------------------------------------
   BENEFITS
   ---------------------------------------------------------- */

const benefits = [
  {
    title: "Trust & Authenticity",
    description:
      "Every ticket sold on VizhaTickets is designed to provide a reliable booking experience, with secure ticket verification.",
    icon: ShieldCheck,
  },
  {
    title: "Instant & Seamless",
    description:
      "From discovering local cultural shows to international concerts, find events and book your spot with ease.",
    icon: Zap,
  },
  {
    title: "Global Reach, Local Roots",
    description:
      "Connecting global audiences and local communities through cultural celebrations, sporting spectacles, and arts.",
    icon: Globe2,
  },
  {
    title: "Community Focused",
    description:
      "We help artists, creators, and event producers connect with audiences who share their passion.",
    icon: Heart,
  },
] as const;

/* ==========================================================
   MAIN ABOUT PAGE
   ========================================================== */

export default function AboutPage() {
  const prefersReducedMotion = useReducedMotion();

  const reducedMotion = prefersReducedMotion === true;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fffaf3] text-[#171717]">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <Header />

      {/* ======================================================
          HERO SECTION - OUR STORY AND MISSION
          ====================================================== */}

      <section
        id="our-story"
        aria-labelledby="about-hero-title"
        className="relative isolate overflow-hidden bg-[#fffaf3]"
      >
        {/* ORIGINAL HERO BACKGROUND */}

        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="/images/about/about-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[62%_center] sm:object-[57%_center] lg:object-center"
          />
        </div>

        {/* MOBILE READABILITY OVERLAY */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-1 bg-linear-to-b from-[#fff3e7]/90 via-[#fff2e4]/70 to-[#fff4e8]/40 lg:hidden"
        />

        {/* DESKTOP READABILITY OVERLAY */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-1 hidden bg-linear-to-r from-[#fff1e7]/45 via-[#fff1e7]/10 to-transparent lg:block"
        />

        {/* SOFT DECORATIVE LIGHT */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-[15%] z-1 h-105 w-105 rounded-full bg-[#fff2dc]/25 blur-[100px]"
        />

        {/* MAIN HERO CONTAINER */}

        <div className="vizha-container relative z-10 mx-auto w-full">
          <div
            className="
              grid
              min-h-127.5
              grid-cols-1
              items-center
              gap-8
              py-14
              sm:min-h-142.5
              sm:py-16
              lg:min-h-143.75
              lg:grid-cols-[1fr_0.95fr]
              lg:gap-10
              lg:py-12
              xl:min-h-151.25
              2xl:min-h-157.5
            "
          >

            {/* ==============================================
                LEFT HERO CONTENT
                ============================================== */}

            <motion.div
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      x: -24,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: reducedMotion ? 0 : 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-20 w-full max-w-165"
            >

              {/* EYEBROW BADGE */}

              <div
                className="
                  mb-6
                  inline-flex
                  items-center
                  gap-2.5
                  rounded-full
                  border
                  border-[#f2d5ad]
                  bg-[#fff4e3]/90
                  px-4
                  py-2.5
                  shadow-[0_3px_12px_rgba(159,90,15,0.06)]
                  backdrop-blur-md
                "
              >
                <Sparkles
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 text-[#d97706]"
                />

                <span
                  className="
                    text-[10px]
                    font-extrabold
                    uppercase
                    tracking-[0.13em]
                    text-[#c45f0a]
                    sm:text-[11px]
                  "
                >
                  Our Story &amp; Mission
                </span>
              </div>

              {/* MAIN HERO HEADING */}

              <h1
                id="about-hero-title"
                className="
                  max-w-160
                  text-[clamp(2.5rem,4.1vw,3.65rem)]
                  font-extrabold
                  leading-[1.08]
                  tracking-[-0.045em]
                  text-[#171717]
                "
              >
                Empowering Live
                <span className="block">
                  Experiences That
                </span>

                <span
                  className="
                    mt-1
                    block
                    bg-linear-to-r
                    from-[#dd500b]
                    via-[#e66b08]
                    to-[#c9790b]
                    bg-clip-text
                    text-transparent
                  "
                >
                  Bring Us Together
                </span>
              </h1>

              {/* HERO DESCRIPTION */}

              <p
                className="
                  mt-6
                  max-w-135
                  text-[14px]
                  leading-[1.85]
                  text-[#484b50]
                  sm:text-[15px]
                  lg:text-[15px]
                "
              >
                VizhaTickets was created to celebrate culture,
                art, music, and sports by making live event
                ticketing effortless, reliable, and accessible
                to everyone around the world.
              </p>

              {/* DISCOVER EVENTS CTA */}

              <div className="mt-8">
                <Link
                  href="/events"
                  className="
                    group
                    inline-flex
                    min-h-13
                    items-center
                    gap-3
                    rounded-full
                    pr-4
                    text-[13px]
                    font-bold
                    text-[#171717]
                    outline-none
                    transition-all
                    duration-300
                    hover:text-[#c9790b]
                    focus-visible:ring-2
                    focus-visible:ring-[#e58a0c]
                    focus-visible:ring-offset-4
                    sm:text-[14px]
                  "
                >
                  {/* PLAY ICON */}

                  <span
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-linear-to-br
                      from-[#ff9800]
                      to-[#e66e00]
                      text-white
                      shadow-[0_7px_18px_rgba(242,130,0,0.22)]
                      transition-all
                      duration-300
                      group-hover:scale-105
                      group-hover:shadow-[0_10px_24px_rgba(242,130,0,0.3)]
                    "
                  >
                    <Play
                      size={18}
                      fill="currentColor"
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className="ml-0.5"
                    />
                  </span>

                  <span>
                    Discover Our Events
                  </span>

                  <ArrowRight
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="text-[#df6408] transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </motion.div>

            {/* RIGHT SPACER

                Hero artwork already exists in the
                background image.

                No duplicate images are added.
            */}

            <div
              aria-hidden="true"
              className="hidden lg:block"
            />
          </div>
        </div>

        {/* ======================================================
            STATISTICS SECTION
            ====================================================== */}

        <div className="vizha-container relative z-30 mx-auto w-full pb-8 sm:pb-10 lg:pb-12">
          <motion.div
            initial={
              reducedMotion
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
              amount: 0.15,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.6,
              ease: "easeOut",
            }}
            className="
              grid
              grid-cols-2
              overflow-hidden
              rounded-[20px]
              border
              border-[#42301b]
              bg-[#17120c]
              shadow-[0_12px_35px_rgba(32,20,9,0.20)]
              lg:grid-cols-4
              lg:rounded-[22px]
            "
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`
                    group
                    flex
                    min-h-28
                    min-w-0
                    items-center
                    justify-center
                    gap-3
                    px-3
                    py-5
                    transition-colors
                    duration-300
                    hover:bg-white/4
                    sm:min-h-31.25
                    sm:gap-4
                    sm:px-5
                    lg:min-h-32.5
                    ${
                      index % 2 === 1
                        ? "border-l border-white/10 lg:border-l-0"
                        : ""
                    }
                    ${
                      index >= 2
                        ? "border-t border-white/10 lg:border-t-0"
                        : ""
                    }
                    ${
                      index > 0
                        ? "lg:border-l lg:border-white/15"
                        : ""
                    }
                  `}
                >
                  {/* STAT ICON */}

                  <div
                    className="
                      flex
                      h-10.75
                      w-10.75
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#f29b19]/10
                      transition-all
                      duration-300
                      group-hover:bg-[#f29b19]/15
                      sm:h-12.5
                      sm:w-12.5
                    "
                  >
                    <Icon
                      size={29}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="text-[#ff9e12] sm:h-8.25 sm:w-8.25"
                    />
                  </div>

                  {/* STAT CONTENT */}

                  <div className="min-w-0">
                    <p
                      className="
                        text-[20px]
                        font-extrabold
                        leading-tight
                        tracking-[-0.03em]
                        text-[#ffad26]
                        sm:text-[26px]
                        xl:text-[30px]
                      "
                    >
                      {stat.value}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        font-medium
                        leading-[1.45]
                        text-white/90
                        sm:text-[12px]
                        xl:text-[13px]
                      "
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          WHY CHOOSE VIZHATICKETS
          ====================================================== */}

      <section
        aria-labelledby="why-choose-title"
        className="relative isolate overflow-hidden bg-[#fffaf3] py-14 sm:py-16 lg:py-18"
      >
        {/* BACKGROUND ACCENT */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32.5 top-[10%] h-85 w-85 rounded-full bg-[#f5c67c]/10 blur-[90px]"
        />

        <div className="vizha-container relative z-10 mx-auto w-full">

          {/* SECTION HEADING */}

          <motion.div
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
              amount: 0.2,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.5,
            }}
            className="mb-9 text-center sm:mb-11"
          >
            <h2
              id="why-choose-title"
              className="
                text-[27px]
                font-extrabold
                leading-tight
                tracking-[-0.035em]
                text-[#171717]
                sm:text-[33px]
                lg:text-[36px]
              "
            >
              Why Choose VizhaTickets?
            </h2>

            {/* ORANGE ACCENT */}

            <div
              aria-hidden="true"
              className="mx-auto mt-4 h-1 w-11 rounded-full bg-linear-to-r from-[#f49a12] to-[#c9790b]"
            />

            <p
              className="
                mx-auto
                mt-4
                max-w-142.5
                text-[13px]
                leading-[1.75]
                text-[#666]
                sm:text-[15px]
              "
            >
              Designed with passion for fans, artists,
              and event producers.
            </p>
          </motion.div>

          {/* BENEFIT CARDS */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              sm:gap-5
              xl:grid-cols-4
              xl:gap-4
              2xl:gap-5
            "
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.article
                  key={benefit.title}
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
                      : index * 0.07,
                  }}
                  className="
                    group
                    flex
                    h-full
                    min-h-48.75
                    min-w-0
                    flex-col
                    gap-4
                    rounded-[20px]
                    border
                    border-[#f2eae0]
                    bg-white
                    p-5
                    shadow-[0_7px_25px_rgba(43,31,17,0.06)]
                    transition-all
                    duration-300
                    hover:-translate-y-1.25
                    hover:border-[#ead7bb]
                    hover:shadow-[0_15px_35px_rgba(43,31,17,0.11)]
                    sm:p-6
                    lg:flex-row
                    lg:gap-4
                    xl:flex-col
                    2xl:flex-row
                  "
                >
                  {/* BENEFIT ICON */}

                  <div
                    className="
                      flex
                      h-15
                      w-15
                      shrink-0
                      items-center
                      justify-center
                      rounded-[18px]
                      bg-[#fff1df]
                      text-[#ee8500]
                      transition-all
                      duration-300
                      group-hover:scale-105
                      group-hover:bg-[#ffe6c3]
                    "
                  >
                    <Icon
                      size={29}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  </div>

                  {/* BENEFIT CONTENT */}

                  <div className="min-w-0 flex-1">
                    <h3
                      className="
                        text-[15px]
                        font-bold
                        leading-[1.4]
                        tracking-[-0.015em]
                        text-[#171717]
                        sm:text-[16px]
                      "
                    >
                      {benefit.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-[12px]
                        leading-[1.75]
                        text-[#62656c]
                        sm:text-[13px]
                      "
                    >
                      {benefit.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================
          EVENT ORGANIZER PROMOTION
          ====================================================== */}

      <section
        aria-labelledby="organizer-banner-title"
        className="bg-[#fffaf3] pb-14 sm:pb-16 lg:pb-20"
      >
        <div className="vizha-container mx-auto w-full">

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
              duration: reducedMotion ? 0 : 0.6,
              ease: "easeOut",
            }}
            className="
              relative
              isolate
              overflow-hidden
              rounded-[22px]
              bg-[#17110a]
              px-6
              py-10
              shadow-[0_15px_40px_rgba(43,25,8,0.15)]
              sm:px-9
              sm:py-12
              lg:min-h-63.75
              lg:rounded-3xl
              lg:px-12
              lg:py-14
            "
          >
            {/* ORIGINAL ORGANIZER BACKGROUND */}

            <Image
              src="/images/about/organizer-banner.png"
              alt=""
              fill
              sizes="(max-width: 1023px) 100vw, 1380px"
              className="-z-20 object-cover object-center"
            />

            {/* DARK READABILITY GRADIENT */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-black/95 via-black/75 to-black/40"
            />

            {/* GOLDEN ATMOSPHERE */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-30 -top-30 h-80 w-80 rounded-full bg-[#e78a11]/10 blur-[100px]"
            />

            {/* ORGANIZER CONTENT */}

            <div
              className="
                relative
                z-10
                flex
                flex-col
                gap-8
                lg:flex-row
                lg:items-center
                lg:justify-between
                lg:gap-10
              "
            >
              {/* TEXT SECTION */}

              <div className="max-w-177.5">
                <p
                  className="
                    text-[11px]
                    font-extrabold
                    uppercase
                    tracking-[0.12em]
                    text-[#ffad32]
                    sm:text-[13px]
                  "
                >
                  Are You an Event Organizer?
                </p>

                <h2
                  id="organizer-banner-title"
                  className="
                    mt-3
                    max-w-170
                    text-[clamp(1.6rem,2.6vw,2.35rem)]
                    font-extrabold
                    leading-[1.2]
                    tracking-[-0.035em]
                    text-white
                  "
                >
                  Host Your Next Event with
                  <span className="text-[#ffad32]">
                    {" "}VizhaTickets
                  </span>
                </h2>

                <p
                  className="
                    mt-4
                    max-w-137.5
                    text-[13px]
                    leading-[1.8]
                    text-white/85
                    sm:text-[15px]
                  "
                >
                  Reach passionate fans and make your event
                  a memorable experience.
                </p>
              </div>

              {/* CTA BUTTONS */}

              <div
                className="
                  flex
                  w-full
                  shrink-0
                  flex-col
                  gap-3
                  sm:w-auto
                  sm:flex-row
                  sm:flex-wrap
                  lg:justify-end
                "
              >
                {/* PRIMARY CTA */}

                <Link
                  href="/contact"
                  className="
                    group
                    inline-flex
                    min-h-12.25
                    items-center
                    justify-center
                    gap-2.5
                    rounded-full
                    bg-linear-to-r
                    from-[#ff9b0b]
                    to-[#ed7b00]
                    px-6
                    text-[13px]
                    font-bold
                    text-[#17110a]
                    shadow-[0_6px_20px_rgba(242,139,0,0.22)]
                    outline-none
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-[0_10px_25px_rgba(242,139,0,0.3)]
                    focus-visible:ring-2
                    focus-visible:ring-[#f0a13a]
                    focus-visible:ring-offset-4
                    sm:min-w-43.75
                  "
                >
                  Partner With Us

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                  />
                </Link>

                {/* SECONDARY CTA */}

                <Link
                  href="/events"
                  className="
                    group
                    inline-flex
                    min-h-12.25
                    items-center
                    justify-center
                    gap-2.5
                    rounded-full
                    border
                    border-white/75
                    bg-black/45
                    px-6
                    text-[13px]
                    font-bold
                    text-white
                    backdrop-blur-md
                    outline-none
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-white
                    hover:bg-white
                    hover:text-[#171717]
                    focus-visible:ring-2
                    focus-visible:ring-white
                    focus-visible:ring-offset-4
                    sm:min-w-41.25
                  "
                >
                  Browse Events

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <Footer />
    </main>
  );
}
