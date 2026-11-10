
"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  QrCode,
  Search,
  Ticket,
  UsersRound,
} from "lucide-react";

/* ==========================================================
   VIZHA TICKETS - HOW IT WORKS
   ========================================================== */

const steps = [
  {
    number: "01",
    title: "Find Events",
    description:
      "Search and explore events happening near you.",
    icon: Search,
  },
  {
    number: "02",
    title: "Book Tickets",
    description:
      "Choose your tickets and secure your spot in just a few clicks.",
    icon: Ticket,
  },
  {
    number: "03",
    title: "Get Your Ticket",
    description:
      "Receive e-tickets instantly via email or our app.",
    icon: QrCode,
  },
  {
    number: "04",
    title: "Enjoy the Event",
    description:
      "Be there and create amazing memories!",
    icon: UsersRound,
  },
] as const;

export default function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion === true;

  return (
    <section
      aria-labelledby="how-it-works-title"
      className="relative isolate overflow-hidden bg-white py-14 sm:py-16 lg:py-17.5"
    >
      {/* SUBTLE BACKGROUND DECORATION */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-30 -top-30 h-90 w-90 rounded-full bg-[#f7e5c9]/20 blur-[90px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32.5 h-80 w-80 rounded-full bg-[#fff1df]/20 blur-[85px]"
      />

      {/* MAIN CONTAINER */}

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
            ease: "easeOut",
          }}
          className="mb-10 sm:mb-12 lg:mb-13"
        >
          {/* GOLD ACCENT */}

          <div
            aria-hidden="true"
            className="mb-3 h-1 w-8 rounded-full bg-linear-to-r from-[#e99a18] to-[#bd6e05]"
          />

          <h2
            id="how-it-works-title"
            className="vizha-heading text-[28px] font-bold leading-tight tracking-tight text-[#171717] sm:text-[32px] lg:text-[35px]"
          >
            How It Works
          </h2>

          <p className="mt-3 max-w-130 text-[13px] leading-[1.7] text-[#777] sm:text-[14px]">
            From discovering your favourite events to
            enjoying every moment — booking with Vizha
            Tickets is simple and seamless.
          </p>
        </motion.div>

        {/* ======================================================
            STEP GRID

            Mobile: Vertical timeline
            Tablet: Two columns
            Desktop: Four columns
            ====================================================== */}

        <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-5 xl:gap-7">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <motion.div
                key={step.number}
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
                  amount: 0.2,
                }}
                transition={{
                  duration: reducedMotion ? 0 : 0.5,
                  delay: reducedMotion
                    ? 0
                    : index * 0.08,
                  ease: "easeOut",
                }}
                className="group relative min-w-0"
              >
                {/* MAIN STEP CONTENT */}

                <div className="relative flex items-start gap-4 sm:gap-4 lg:gap-3 xl:gap-4">
                  {/* ICON AND NUMBER */}

                  <div className="relative z-10 shrink-0">
                    {/* ICON CIRCLE */}

                    <div
                      className="
                        relative
                        flex
                        h-19
                        w-19
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#f0dabb]
                        bg-linear-to-br
                        from-[#fffaf2]
                        via-[#fff7eb]
                        to-[#fff2de]
                        text-[#c9790b]
                        shadow-[0_6px_20px_rgba(91,55,16,0.06)]
                        transition-all
                        duration-300
                        group-hover:-translate-y-0.75
                        group-hover:border-[#e9bb76]
                        group-hover:shadow-[0_10px_26px_rgba(201,121,11,0.13)]
                        sm:h-20
                        sm:w-20
                        lg:h-18
                        lg:w-18
                        xl:h-20
                        xl:w-20
                      "
                    >
                      {/* DECORATIVE INNER CIRCLE */}

                      <span
                        aria-hidden="true"
                        className="absolute inset-1.5 rounded-full border border-[#f8e9d2]/80"
                      />

                      <Icon
                        size={30}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        className="relative z-10 transition-transform duration-300 motion-safe:group-hover:scale-110 sm:h-8 sm:w-8 lg:h-7 lg:w-7 xl:h-8 xl:w-8"
                      />
                    </div>

                    {/* NUMBER BADGE */}

                    <span
                      className="
                        absolute
                        -right-1
                        -top-1.25
                        z-20
                        flex
                        h-6.25
                        min-w-6.25
                        items-center
                        justify-center
                        rounded-full
                        border-2
                        border-white
                        bg-linear-to-br
                        from-[#e99715]
                        to-[#bd6800]
                        px-1
                        text-[10px]
                        font-bold
                        text-white
                        shadow-[0_3px_8px_rgba(201,121,11,0.16)]
                      "
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* TEXT CONTENT */}

                  <div className="min-w-0 flex-1 pt-1">
                    {/* SMALL STEP NUMBER */}

                    <p className="text-[10px] font-bold tracking-[0.13em] text-[#c9790b]">
                      {step.number}
                    </p>

                    {/* STEP TITLE */}

                    <h3
                      className="
                        mt-1.5
                        text-[15px]
                        font-bold
                        leading-[1.3]
                        tracking-[-0.015em]
                        text-[#222]
                        transition-colors
                        duration-300
                        group-hover:text-[#b96d07]
                        sm:text-[16px]
                        lg:text-[14px]
                        xl:text-[16px]
                      "
                    >
                      {step.title}
                    </h3>

                    {/* STEP DESCRIPTION */}

                    <p
                      className="
                        mt-2
                        max-w-58.75
                        text-[12px]
                        leading-[1.7]
                        text-[#777]
                        sm:text-[12px]
                        lg:text-[11px]
                        xl:text-[12px]
                      "
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* ==========================================
                    MOBILE VERTICAL CONNECTOR
                    ========================================== */}

                {!isLast && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-9.25 top-21.25 -bottom-6.75 w-px bg-linear-to-b from-[#e6c18c] to-[#f1e5d3] sm:hidden"
                  />
                )}

                {/* ==========================================
                    DESKTOP HORIZONTAL CONNECTOR
                    ========================================== */}

                {!isLast && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3.75 top-6.5 hidden items-center justify-center lg:flex xl:-right-4.75"
                  >
                    <ArrowRight
                      size={17}
                      strokeWidth={1.7}
                      className="text-[#d4b78e]"
                    />
                  </div>
                )}

                {/* SUBTLE UNDERLINE ON HOVER */}

                <div
                  aria-hidden="true"
                  className="mt-5 hidden h-0.5 w-0 rounded-full bg-linear-to-r from-[#e7ab57] to-transparent transition-all duration-500 group-hover:w-[60%] lg:block"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
