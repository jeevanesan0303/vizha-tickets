
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
   VIZHATICKETS — APP PROMOTION

   React + Vite + TypeScript + Tailwind CSS

   UPDATED:
   ----------------------------------------------------------
   - Reduced overall section height
   - Reduced mobile and desktop padding
   - Reduced unnecessary vertical spacing
   - Improved compact benefit cards
   - Refined heading and description sizes
   - Preserved original two-phone background artwork
   - Preserved original dark/gold theme
   - Preserved App Store / Google Play buttons
   - Preserved coming-soon status
   - Preserved Framer Motion animations
   - Preserved responsive layout

   IMPORTANT:
   The original background image already includes
   the two smartphone mockups.

   Do not add separate phone images.
   ========================================================== */

/* ==========================================================
   BENEFITS
   ========================================================== */

const benefits = [
  {
    icon: Ticket,
    title: "Easy Booking",
    description:
      "Find and book events in just a few taps.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Safe and reliable ticket payments.",
  },
  {
    icon: QrCode,
    title: "Instant Tickets",
    description:
      "Get your digital ticket instantly.",
  },
  {
    icon: Zap,
    title: "Exclusive Offers",
    description:
      "Discover special deals and offers.",
  },
] as const;

/* ==========================================================
   APP STORE LINKS

   Replace null with real app store URLs when the
   VizhaTickets mobile app is officially published.

   Until then, buttons stay disabled.
   ========================================================== */

const APP_STORE_URL: string | null = null;
const GOOGLE_PLAY_URL: string | null = null;

/* ==========================================================
   STORE BUTTON TYPES
   ========================================================== */

interface StoreButtonProps {
  store: "apple" | "google";
  href: string | null;
}

/* ==========================================================
   STORE DOWNLOAD BUTTON
   ========================================================== */

function StoreButton({
  store,
  href,
}: StoreButtonProps) {
  const isApple = store === "apple";

  const label = isApple
    ? "App Store"
    : "Google Play";

  const content = (
    <>
      {isApple ? (
        <Apple
          size={23}
          strokeWidth={1.8}
          aria-hidden="true"
          className="shrink-0 text-white"
        />
      ) : (
        <Download
          size={22}
          strokeWidth={1.8}
          aria-hidden="true"
          className="shrink-0 text-[#f0a13a]"
        />
      )}

      <span className="flex flex-col text-left">
        <span className="text-[9px] font-medium uppercase tracking-[0.06em] text-white/70">
          {isApple
            ? "Download on the"
            : "Get it on"}
        </span>

        <span className="mt-0.5 whitespace-nowrap text-[14px] font-bold leading-tight text-white sm:text-[15px]">
          {label}
        </span>
      </span>
    </>
  );

  const baseClassName = `
    group
    inline-flex
    min-h-[52px]
    min-w-[155px]
    items-center
    justify-center
    gap-2.5
    rounded-[12px]
    border
    border-white/25
    bg-black/65
    px-4
    py-2
    shadow-[0_6px_20px_rgba(0,0,0,0.22)]
    backdrop-blur-md
    transition-all
    duration-300
  `;

  if (!href) {
    return (
      <button
        type="button"
        disabled
        title="Coming soon"
        aria-label={`${label} download coming soon`}
        className={`
          ${baseClassName}
          cursor-not-allowed
          opacity-85
        `}
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
      aria-label={`Download VizhaTickets on ${
        isApple ? "the App Store" : "Google Play"
      }`}
      className={`
        ${baseClassName}
        hover:-translate-y-0.5
        hover:border-[#f0a13a]/70
        hover:bg-black/85
        hover:shadow-[0_10px_26px_rgba(0,0,0,0.35)]
        focus-visible:outline-2
        focus-visible:outline-offset-4
        focus-visible:outline-[#f0a13a]
      `}
    >
      {content}
    </a>
  );
}

/* ==========================================================
   MAIN COMPONENT
   ========================================================== */

export default function AppPromotion() {
  const prefersReducedMotion =
    useReducedMotion();

  const reducedMotion =
    prefersReducedMotion === true;

  return (
    <section
      aria-labelledby="vizha-app-title"
      className="
        relative
        isolate
        w-full
        overflow-hidden
        bg-[#0d0907]
      "
    >
      {/* ====================================================
          CINEMATIC BACKGROUND

          Contains both original smartphone mockups.
          ==================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          bg-cover
          bg-no-repeat
          bg-position-[30%_center]
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
        className="
          pointer-events-none
          absolute
          inset-0
          z-1
          bg-black/20
        "
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
          from-black/10
          via-black/65
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
          -right-28
          top-[10%]
          z-2
          h-70
          w-70
          rounded-full
          bg-[#d17a13]/10
          blur-[90px]
          lg:h-85
          lg:w-85
        "
      />

      {/* ====================================================
          MAIN CONTENT CONTAINER
          ==================================================== */}

      <div className="vizha-container relative z-10 mx-auto w-full">
        <div
          className="
            grid
            min-h-135
            grid-cols-1
            items-end
            pb-8
            pt-46.25

            sm:min-h-142.5
            sm:pb-10
            sm:pt-52.5

            lg:min-h-127.5
            lg:grid-cols-[0.9fr_1.1fr]
            lg:items-center
            lg:py-10

            xl:min-h-132.5
            xl:grid-cols-[0.95fr_1.05fr]
            xl:py-11

            2xl:min-h-137.5
          "
        >
          {/* ==============================================
              LEFT IMAGE SPACE

              The phones are part of the background.
              ============================================== */}

          <div
            aria-hidden="true"
            className="hidden lg:block"
          />

          {/* ==============================================
              RIGHT PROMOTIONAL CONTENT
              ============================================== */}

          <motion.div
            initial={
              reducedMotion
                ? false
                : {
                    opacity: 0,
                    x: 20,
                  }
            }
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: reducedMotion
                ? 0
                : 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              z-20
              w-full
              max-w-190
              lg:ml-auto
              lg:pl-4
              xl:pl-7
            "
          >
            {/* ============================================
                EYEBROW
                ============================================ */}

            <div className="mb-3 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="
                  h-px
                  w-7
                  shrink-0
                  bg-linear-to-r
                  from-[#f0a13a]
                  to-[#bc6a09]
                "
              />

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[#f4ae4e]
                  sm:text-[11px]
                "
              >
                Your Events, Anywhere
              </p>
            </div>

            {/* ============================================
                MAIN HEADING
                ============================================ */}

            <h2
              id="vizha-app-title"
              className="
                font-serif
                text-[clamp(1.9rem,3vw,3.1rem)]
                font-bold
                leading-[1.16]
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

            {/* ============================================
                DESCRIPTION
                ============================================ */}

            <p
              className="
                mt-3
                max-w-142.5
                text-[12px]
                leading-[1.7]
                text-white/85
                sm:text-[14px]
              "
            >
              Discover, book, and manage unforgettable
              experiences wherever you go. Your favourite
              events and digital tickets, all in one place.
            </p>

            {/* ============================================
                APP STORE DOWNLOAD BUTTONS
                ============================================ */}

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
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

            {!APP_STORE_URL &&
              !GOOGLE_PLAY_URL && (
                <p
                  className="
                    mt-2
                    text-[10px]
                    font-medium
                    tracking-wide
                    text-[#f2bb76]
                  "
                >
                  Mobile app coming soon.
                </p>
              )}

            {/* ============================================
                BENEFIT FEATURES
                ============================================ */}

            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-x-4
                gap-y-4
                sm:gap-x-6
                lg:mt-7
                xl:grid-cols-4
                xl:gap-x-3
              "
            >
              {benefits.map(
                (benefit, index) => {
                  const Icon = benefit.icon;

                  return (
                    <motion.div
                      key={benefit.title}
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
                          : index * 0.06,
                      }}
                      className="
                        group/feature
                        flex
                        min-w-0
                        flex-col
                      "
                    >
                      {/* FEATURE ICON */}

                      <div
                        className="
                          mb-2
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-[11px]
                          border
                          border-[#d48a29]/55
                          bg-black/45
                          text-[#f0a13a]
                          shadow-[0_4px_12px_rgba(0,0,0,0.12)]
                          backdrop-blur-sm
                          transition-all
                          duration-300
                          group-hover/feature:-translate-y-0.5
                          group-hover/feature:border-[#f0a13a]/80
                          group-hover/feature:bg-[#d17a13]/15
                          sm:h-10
                          sm:w-10
                        "
                      >
                        <Icon
                          size={18}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </div>

                      {/* FEATURE TITLE */}

                      <h3
                        className="
                          text-[11px]
                          font-bold
                          leading-[1.4]
                          text-white
                          sm:text-[12px]
                        "
                      >
                        {benefit.title}
                      </h3>

                      {/* FEATURE DESCRIPTION */}

                      <p
                        className="
                          mt-1
                          max-w-45
                          text-[10px]
                          leading-normal
                          text-white/75
                          sm:text-[11px]
                        "
                      >
                        {benefit.description}
                      </p>
                    </motion.div>
                  );
                }
              )}
            </div>

            {/* ============================================
                TRUST MESSAGE
                ============================================ */}

            <div
              className="
                mt-5
                flex
                items-start
                gap-2
                border-t
                border-white/15
                pt-3
                text-[10px]
                leading-[1.6]
                text-white/70
                sm:text-[11px]
              "
            >
              <ShieldCheck
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className="
                  mt-0.5
                  shrink-0
                  text-[#f0a13a]
                "
              />

              <span>
                Secure, fast, and designed for event
                lovers everywhere.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
