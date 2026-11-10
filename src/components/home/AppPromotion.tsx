
"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Apple,
  CreditCard,
  Download,
  QrCode,
  ShieldCheck,
  Ticket,
  Zap,
} from "lucide-react";

/* ==========================================================
   VIZHA TICKETS - APP PROMOTION

   IMPORTANT:
   The background image already includes the
   two smartphone mockups.

   Do not add separate phone images.
   ========================================================== */

const benefits = [
  {
    icon: Ticket,
    title: "Easy Booking",
    description: "Find and book events in just a few taps.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and reliable ticket payments.",
  },
  {
    icon: QrCode,
    title: "Instant Tickets",
    description: "Get your digital ticket instantly.",
  },
  {
    icon: Zap,
    title: "Exclusive Offers",
    description: "Discover special deals and offers.",
  },
] as const;

/* ==========================================================
   APP STORE LINKS

   Replace null values with actual published store URLs.
   Until then, download buttons remain disabled.
   ========================================================== */

const APP_STORE_URL: string | null = null;
const GOOGLE_PLAY_URL: string | null = null;

/* ==========================================================
   STORE DOWNLOAD BUTTON
   ========================================================== */

interface StoreButtonProps {
  store: "apple" | "google";
  href: string | null;
}

function StoreButton({ store, href }: StoreButtonProps) {
  const isApple = store === "apple";

  const content = (
    <>
      {isApple ? (
        <Apple
          size={26}
          strokeWidth={1.8}
          aria-hidden="true"
          className="shrink-0 text-white"
        />
      ) : (
        <Download
          size={25}
          strokeWidth={1.8}
          aria-hidden="true"
          className="shrink-0 text-[#f0a13a]"
        />
      )}

      <span className="flex flex-col text-left">
        <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-white/65">
          {isApple ? "Download on the" : "Get it on"}
        </span>

        <span className="mt-0.5 whitespace-nowrap text-[16px] font-bold leading-tight text-white">
          {isApple ? "App Store" : "Google Play"}
        </span>
      </span>
    </>
  );

  const baseClassName = `
    group
    inline-flex
    min-h-[64px]
    min-w-[175px]
    items-center
    justify-center
    gap-3
    rounded-[15px]
    border
    border-white/25
    bg-black/65
    px-5
    py-3
    shadow-[0_10px_30px_rgba(0,0,0,0.22)]
    backdrop-blur-md
    transition-all
    duration-300
  `;

  if (!href) {
    return (
      <button
        type="button"
        disabled
        aria-label={`${
          isApple ? "App Store" : "Google Play"
        } download coming soon`}
        title="Coming soon"
        className={`${baseClassName} cursor-not-allowed opacity-80`}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Download Vizha Tickets on ${
        isApple ? "the App Store" : "Google Play"
      }`}
      className={`${baseClassName} hover:-translate-y-0.75 hover:border-[#f0a13a]/70 hover:bg-black/85 hover:shadow-[0_14px_35px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0a13a]`}
    >
      {content}
    </a>
  );
}

/* ==========================================================
   MAIN COMPONENT
   ========================================================== */

export default function AppPromotion() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion === true;

  return (
    <section
      aria-labelledby="vizha-app-title"
      className="relative isolate w-full overflow-hidden bg-[#0d0907]"
    >
      {/* ======================================================
          CINEMATIC BACKGROUND IMAGE
          Includes original two-phone artwork.
          ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          bg-cover
          bg-position-[30%_center]
          bg-no-repeat
          sm:bg-position-[35%_center]
          lg:bg-center
        "
        style={{
          backgroundImage:
            "url('/images/app/app-promotion-bg.png')",
        }}
      />

      {/* GENERAL CINEMATIC OVERLAY */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1 bg-black/25"
      />

      {/* DESKTOP READABILITY GRADIENT */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-2
          hidden
          bg-linear-to-r
          from-black/5
          via-black/25
          to-black/85
          lg:block
        "
      />

      {/* MOBILE / TABLET READABILITY GRADIENT */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-2
          bg-linear-to-b
          from-black/20
          via-black/75
          to-black/95
          lg:hidden
        "
      />

      {/* SUBTLE GOLDEN LIGHT */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          top-[12%]
          z-2
          h-95
          w-95
          rounded-full
          bg-[#d17a13]/10
          blur-[110px]
        "
      />

      {/* ======================================================
          MAIN CONTENT CONTAINER
          ====================================================== */}

      <div className="vizha-container relative z-10 mx-auto w-full">
        <div
          className="
            grid
            min-h-190
            grid-cols-1
            items-end
            pb-14
            pt-67.5
            sm:min-h-200
            sm:pt-80
            lg:min-h-162.5
            lg:grid-cols-[0.9fr_1.1fr]
            lg:items-center
            lg:py-20
            xl:min-h-172.5
            xl:grid-cols-[0.95fr_1.05fr]
            2xl:min-h-180
          "
        >
          {/* ================================================
              LEFT SPACER

              The uploaded background already includes
              the original mobile app mockups.
              ================================================ */}

          <div
            aria-hidden="true"
            className="hidden lg:block"
          />

          {/* ================================================
              RIGHT CONTENT
              ================================================ */}

          <motion.div
            initial={
              reducedMotion
                ? false
                : { opacity: 0, x: 24 }
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
              duration: reducedMotion ? 0 : 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              z-20
              w-full
              max-w-190
              lg:ml-auto
              lg:pl-4
              xl:pl-8
            "
          >
            {/* EYEBROW */}

            <div className="mb-5 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 shrink-0 bg-linear-to-r from-[#f0a13a] to-[#bc6a09]"
              />

              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f4ae4e] sm:text-[12px]">
                Your Events, Anywhere
              </p>
            </div>

            {/* MAIN HEADING */}

            <h2
              id="vizha-app-title"
              className="
                font-serif
                text-[clamp(2.4rem,3.6vw,3.75rem)]
                font-bold
                leading-[1.08]
                tracking-[-0.035em]
                text-white
              "
            >
              <span className="block">
                Your Events. Your Tickets.
              </span>

              <span className="mt-1 block text-[#f0a13a]">
                All in One App.
              </span>
            </h2>

            {/* DESCRIPTION */}

            <p
              className="
                mt-6
                max-w-145
                text-[14px]
                leading-[1.8]
                text-white/85
                sm:text-[16px]
              "
            >
              Discover, book, and manage unforgettable
              experiences wherever you go. Your favourite
              events and digital tickets, all in one place.
            </p>

            {/* ==================================================
                APP STORE DOWNLOAD BUTTONS
                ================================================== */}

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <StoreButton
                store="apple"
                href={APP_STORE_URL}
              />

              <StoreButton
                store="google"
                href={GOOGLE_PLAY_URL}
              />
            </div>

            {/* COMING SOON MESSAGE */}

            {!APP_STORE_URL && !GOOGLE_PLAY_URL && (
              <p className="mt-3 text-[11px] font-medium tracking-wide text-[#f2bb76]">
                Mobile app coming soon.
              </p>
            )}

            {/* ==================================================
                BENEFIT FEATURES
                ================================================== */}

            <div
              className="
                mt-10
                grid
                grid-cols-2
                gap-x-5
                gap-y-7
                sm:gap-x-7
                lg:mt-11
                xl:grid-cols-4
                xl:gap-x-4
              "
            >
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <motion.div
                    key={benefit.title}
                    initial={
                      reducedMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 15,
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
                      duration: reducedMotion ? 0 : 0.45,
                      delay: reducedMotion
                        ? 0
                        : index * 0.07,
                    }}
                    className="group/feature flex min-w-0 flex-col"
                  >
                    {/* FEATURE ICON */}

                    <div
                      className="
                        mb-3
                        flex
                        h-11.25
                        w-11.25
                        items-center
                        justify-center
                        rounded-[14px]
                        border
                        border-[#d48a29]/55
                        bg-black/45
                        text-[#f0a13a]
                        shadow-[0_5px_15px_rgba(0,0,0,0.12)]
                        backdrop-blur-sm
                        transition-all
                        duration-300
                        group-hover/feature:-translate-y-0.75
                        group-hover/feature:border-[#f0a13a]/80
                        group-hover/feature:bg-[#d17a13]/15
                      "
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>

                    {/* FEATURE HEADING */}

                    <h3 className="text-[12px] font-bold leading-normal text-white sm:text-[13px]">
                      {benefit.title}
                    </h3>

                    {/* FEATURE DESCRIPTION */}

                    <p className="mt-1.5 max-w-45 text-[11px] leading-[1.65] text-white/75 sm:text-[12px]">
                      {benefit.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* ==================================================
                TRUST MESSAGE
                ================================================== */}

            <div className="mt-9 flex items-start gap-2.5 border-t border-white/15 pt-5 text-[11px] leading-[1.7] text-white/70 sm:text-[12px]">
              <ShieldCheck
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[#f0a13a]"
              />

              <span>
                Secure, fast, and designed for event lovers
                everywhere.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
