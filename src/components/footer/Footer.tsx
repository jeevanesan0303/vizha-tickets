
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import {
  Mail,
  MapPin,
  Phone,
  Apple,
  ArrowUpRight,
  ArrowRight,
  Send,
} from "lucide-react";

/* ==========================================================
   VIZHATICKETS — FOOTER

   React + Vite + TypeScript + Tailwind CSS

   UPDATED:
   ----------------------------------------------------------
   - Removed Create an Event
   - Removed Organizer Login
   - Added organizer Contact Us link
   - Organizer link goes to /organizer-request
   - Added organizer invitation description
   - Preserved original footer design
   - Preserved Tamil VizhaTickets logo
   - Preserved social links
   - Preserved app promotion
   - Preserved festival background
   - Preserved golden decorative waves
   - Preserved footer animations
   - Preserved responsive layout

   IMPORTANT:
   The /organizer-request route must be created
   separately in src/App.tsx.
   ========================================================== */

/* ==========================================================
   SOCIAL ICON TYPES
   ========================================================== */

type SocialIconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

/* ==========================================================
   INSTAGRAM ICON
   ========================================================== */

function InstagramIcon({
  size = 18,
  strokeWidth = 1.8,
  className,
}: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="0.8"
        fill="currentColor"
      />
    </svg>
  );
}

/* ==========================================================
   FACEBOOK ICON
   ========================================================== */

function FacebookIcon({
  size = 18,
  className,
}: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M13.4 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v1.9H7v3.1h2.7v8h3.7Z"
      />
    </svg>
  );
}

/* ==========================================================
   YOUTUBE ICON
   ========================================================== */

function YoutubeIcon({
  size = 18,
  strokeWidth = 1.8,
  className,
}: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M22 12s0-3.5-.5-5.2a2.7 2.7 0 0 0-1.9-1.9C17.9 4.4 12 4.4 12 4.4s-5.9 0-7.6.5a2.7 2.7 0 0 0-1.9 1.9C2 8.5 2 12 2 12s0 3.5.5 5.2a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.7 2.7 0 0 0 1.9-1.9C22 15.5 22 12 22 12Z"
      />

      <path
        d="m10 8.8 5.5 3.2-5.5 3.2V8.8Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/* ==========================================================
   LINKEDIN ICON
   ========================================================== */

function LinkedinIcon({
  size = 18,
  className,
}: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5.2 7.8A2.1 2.1 0 1 0 5.2 3.6a2.1 2.1 0 0 0 0 4.2ZM3.4 9.3H7v11.1H3.4V9.3Zm5.8 0h3.5v1.5h.1a3.8 3.8 0 0 1 3.4-1.9c3.6 0 4.3 2.3 4.3 5.3v6.2h-3.6v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.6H9.2V9.3Z"
      />
    </svg>
  );
}

/* ==========================================================
   FOOTER NAVIGATION LINKS
   ========================================================== */

const exploreLinks = [
  {
    label: "Events",
    href: "/events",
  },
  {
    label: "Categories",
    href: "/categories",
  },
  {
    label: "About Us",
    href: "/about",
  },
];

const supportLinks = [
  {
    label: "Help Center",
    href: "/help",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
  {
    label: "Terms & Conditions",
    href: "/terms",
  },
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
];

/* ==========================================================
   ORGANIZER NAVIGATION — UPDATED

   REMOVED:
   - Create an Event
   - Organizer Login

   NEW:
   - Contact Us -> /organizer-request

   This route will contain an organizer proposal form.
   ========================================================== */

const organizerLinks = [
  {
    label: "Contact Us",
    href: "/organizer-request",
  },
];

/* ==========================================================
   SOCIAL LINKS

   Original destinations preserved.
   Replace these homepage URLs with the official
   VizhaTickets profiles when available.
   ========================================================== */

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/",
    Icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/",
    Icon: FacebookIcon,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/",
    Icon: YoutubeIcon,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    Icon: LinkedinIcon,
  },
];

/* ==========================================================
   FOOTER SECTION HEADING
   ========================================================== */

function FooterHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold tracking-tight text-white sm:text-lg">
        {children}
      </h3>

      <span
        aria-hidden="true"
        className="mt-2 block h-1 w-10 rounded-full bg-linear-to-r from-[#ffbd18] to-[#ff8500]"
      />
    </div>
  );
}

/* ==========================================================
   APP STORE BADGE
   ========================================================== */

interface StoreBadgeProps {
  store: "apple" | "google";
  href: string;
}

function StoreBadge({
  store,
  href,
}: StoreBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        store === "apple"
          ? "Download on the App Store"
          : "Get it on Google Play"
      }
      className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-[#e8a400] bg-black/50 px-2 py-1.5 text-white transition hover:bg-[#211708] sm:px-2.5"
    >
      {store === "apple" ? (
        <>
          {/* APPLE LOGO */}

          <Apple
            size={25}
            fill="currentColor"
            strokeWidth={1.5}
          />

          <span className="text-left leading-tight">
            <span className="block text-[8px]">
              Download on the
            </span>

            <span className="block whitespace-nowrap text-sm font-semibold">
              App Store
            </span>
          </span>
        </>
      ) : (
        <>
          {/* GOOGLE PLAY LOGO */}

          <svg
            aria-hidden="true"
            width="24"
            height="26"
            viewBox="0 0 32 36"
            fill="none"
          >
            <path
              d="M3 2L19 18L3 34C2.5 33.5 2 32.7 2 31.5V4.5C2 3.4 2.4 2.6 3 2Z"
              fill="#34A853"
            />

            <path
              d="M3 2L22 12L19 18L3 2Z"
              fill="#4285F4"
            />

            <path
              d="M19 18L22 12L29 16C31 17.2 31 18.8 29 20L22 24L19 18Z"
              fill="#FBBC04"
            />

            <path
              d="M3 34L22 24L19 18L3 34Z"
              fill="#EA4335"
            />
          </svg>

          <span className="text-left leading-tight">
            <span className="block text-[8px]">
              GET IT ON
            </span>

            <span className="block whitespace-nowrap text-sm font-semibold">
              Google Play
            </span>
          </span>
        </>
      )}
    </a>
  );
}

/* ==========================================================
   ANIMATED FOOTER LINK

   Original underline animation preserved.

   ========================================================== */

interface FooterLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

function FooterLink({
  href,
  children,
  className = "",
}: FooterLinkProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={`group relative inline-flex items-center text-[13px] text-white/85 transition-colors duration-200 hover:text-[#ffb800] sm:text-sm ${className}`}
    >
      <span className="relative z-10">
        {children}
      </span>

      {/* LEFT UNDERLINE ANIMATION */}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-0.5 left-0 h-0.5 w-[calc(50%+1px)] origin-left scale-x-0 rounded-l-full bg-linear-to-r from-[#ff8500] to-[#ffb800] shadow-[0_0_8px_rgba(255,184,0,0.6)] transition-transform duration-300 ease-out group-hover:scale-x-100"
      />

      {/* RIGHT UNDERLINE ANIMATION */}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-0.5 right-0 h-0.5 w-[calc(50%+1px)] origin-right scale-x-0 rounded-r-full bg-linear-to-l from-[#ff8500] to-[#ffb800] shadow-[0_0_8px_rgba(255,184,0,0.6)] transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
    </Link>
  );
}

/* ==========================================================
   MAIN FOOTER COMPONENT
   ========================================================== */

export default function Footer() {
  return (
    <motion.footer
      initial={{
        opacity: 0,
        y: 15,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.03,
      }}
      transition={{
        duration: 0.45,
      }}
      className="relative isolate w-full max-w-full overflow-hidden bg-[#080705] text-white"
    >
      {/* ====================================================
          FESTIVAL BACKGROUND

          Original image preserved.
          ==================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/footer/footer-festival-bg.png')",

          backgroundPosition: "center 65%",
        }}
      />

      {/* DARK BACKGROUND OVERLAY */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-[#080705]/95 via-[#080705]/85 to-[#080705]/55"
      />

      {/* ====================================================
          MAIN FOOTER
          ==================================================== */}

      <div className="mx-auto w-full max-w-[1800px] px-5 pb-20 pt-8 sm:px-8 sm:pb-24 sm:pt-10 lg:px-12 lg:pb-24 lg:pt-11">

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-[1.45fr_0.8fr_0.8fr_0.75fr_1.5fr] lg:gap-5 xl:gap-6">

          {/* ==================================================
              BRAND AND CONTACT
              ================================================== */}

          <div className="min-w-0 lg:pr-4">

            {/* BRAND LOGO */}

            <Link
              href="/"
              aria-label="VizhaTickets home"
              className="inline-flex items-center transition-transform hover:scale-[1.02]"
            >
              <Image
                src="/images/branding/vizha-logo.png"
                alt="VizhaTickets"
                width={260}
                height={82}
                className="h-13 w-auto object-contain sm:h-15 lg:h-16"
              />
            </Link>

            {/* BRAND DESCRIPTION */}

            <p className="mt-3 max-w-97.5 text-[13px] leading-6 text-white/85 sm:text-sm">
              Discover amazing events around you.
              Find, explore and book tickets for
              unforgettable experiences worldwide.
            </p>

            {/* CONTACT DETAILS */}

            <div className="mt-3 space-y-2">

              {/* EMAIL */}

              <a
                href="mailto:hello@vizhatickets.com"
                className="group flex items-center gap-2.5 text-[13px] text-white/90 transition hover:text-[#ffb800] sm:text-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ffb800] text-[#ffb800] transition group-hover:bg-[#ffb800]/10">
                  <Mail size={16} />
                </span>

                hello@vizhatickets.com
              </a>

              {/* CONTACT SUPPORT */}

              <a
                href="mailto:hello@vizhatickets.com?subject=VizhaTickets%20Support"
                className="group flex items-center gap-2.5 text-[13px] text-white/90 transition hover:text-[#ffb800] sm:text-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ffb800] text-[#ffb800] transition group-hover:bg-[#ffb800]/10">
                  <Phone size={16} />
                </span>

                Contact Support
              </a>

              {/* LOCATION */}

              <div className="flex items-center gap-2.5 text-[13px] text-white/90 sm:text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#ffbd18] to-[#ff8500] text-black">
                  <MapPin size={17} />
                </span>

                Worldwide
              </div>
            </div>

            {/* SOCIAL LINKS */}

            <div className="mt-4 flex flex-wrap gap-2.5">
              {socialLinks.map(
                ({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c98b00] text-white transition hover:-translate-y-1 hover:bg-[#ffb800] hover:text-black"
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                    />
                  </a>
                )
              )}
            </div>
          </div>

          {/* ==================================================
              EXPLORE
              ================================================== */}

          <div className="border-white/10 sm:border-l sm:pl-5 lg:pl-6">
            <FooterHeading>
              Explore
            </FooterHeading>

            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ==================================================
              SUPPORT
              ================================================== */}

          <div className="border-white/10 sm:border-l sm:pl-5 lg:pl-6">
            <FooterHeading>
              Support
            </FooterHeading>

            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ==================================================
              FOR ORGANIZERS — UPDATED

              REMOVED:
              - Create an Event
              - Organizer Login

              NEW:
              - Contact Us
              - Event request description
              - /organizer-request destination
              ================================================== */}

          <div className="border-white/10 sm:border-l sm:pl-5 lg:pl-6">

            <FooterHeading>
              For Organizers
            </FooterHeading>

            {/* SHORT DESCRIPTION */}

            <p className="mb-4 max-w-52.5 text-[12px] leading-[1.7] text-white/65">
              Planning an event? Submit your
              proposal and connect with our team.
            </p>

            {/* ORGANIZER LINK */}

            <ul className="space-y-3">
              {organizerLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>
                    <span className="inline-flex items-center gap-2">
                      <Send
                        size={15}
                        strokeWidth={1.9}
                        className="text-[#ffb800]"
                        aria-hidden="true"
                      />

                      {link.label}

                      <ArrowRight
                        size={14}
                        strokeWidth={1.8}
                        className="text-[#ffb800]"
                        aria-hidden="true"
                      />
                    </span>
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ==================================================
              APP PROMOTION — ORIGINAL DESIGN PRESERVED
              ================================================== */}

          <div className="h-fit min-w-0 rounded-2xl border border-[#a86a00] bg-[#100d08]/80 p-4 shadow-[0_0_25px_rgba(255,153,0,0.04)] backdrop-blur-sm sm:p-5">

            {/* TITLE */}

            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#ffb000] sm:text-xs">
              Get the VizhaTickets App
            </p>

            {/* HEADING */}

            <h3 className="mt-2.5 max-w-85 text-[23px] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[26px]">
              Events Everywhere

              <br />

              In Your Hands
            </h3>

            {/* APP STORE BADGES */}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <StoreBadge
                store="apple"
                href="https://www.apple.com/app-store/"
              />

              <StoreBadge
                store="google"
                href="https://play.google.com/store"
              />
            </div>

            {/* DISCOVER LINK */}

            <Link
              href="/about"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-white/70 transition hover:text-[#ffb800]"
            >
              Discover VizhaTickets

              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ====================================================
          DECORATIVE GOLDEN WAVES — PRESERVED
          ==================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-12 -z-10 h-28 overflow-hidden sm:bottom-14 sm:h-32"
      >
        <svg
          viewBox="0 0 1600 180"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          fill="none"
          aria-hidden="true"
        >
          {/* FILL */}

          <path
            d="M0 65 C180 135 290 150 450 120 S700 165 880 120 S1130 145 1290 95 S1480 45 1600 85 V180 H0 Z"
            fill="#ff8a00"
            fillOpacity="0.12"
          />

          {/* ORANGE WAVE */}

          <path
            d="M0 65 C180 135 290 150 450 120 S700 165 880 120 S1130 145 1290 95 S1480 45 1600 85"
            stroke="#ff8a00"
            strokeWidth="3"
          />

          {/* SECOND WAVE */}

          <path
            d="M0 105 C180 155 340 168 510 143 S750 180 930 145 S1200 165 1360 120 S1500 90 1600 110"
            stroke="#e6a100"
            strokeWidth="2"
            strokeOpacity="0.8"
          />

          {/* THIRD WAVE */}

          <path
            d="M0 125 C180 170 340 180 510 160 S750 190 930 165 S1200 180 1360 140 S1500 115 1600 130"
            stroke="#ffbd18"
            strokeWidth="1"
            strokeOpacity="0.6"
          />
        </svg>
      </div>

      {/* ====================================================
          COPYRIGHT BAR
          ==================================================== */}

      <div className="relative border-t border-[#b47a13]/50 bg-[#080705]/90">

        <div className="mx-auto flex min-h-14 w-full max-w-[1800px] flex-col justify-center gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">

          {/* COPYRIGHT */}

          <p className="text-xs text-white/85 sm:text-sm">
            © 2026 VizhaTickets. All rights reserved.
          </p>

          {/* LEGAL NAVIGATION */}

          <nav
            aria-label="Legal links"
            className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/85 sm:gap-x-4 sm:text-sm"
          >
            <FooterLink
              href="/terms"
              className="text-xs sm:text-sm"
            >
              Terms &amp; Conditions
            </FooterLink>

            <span
              aria-hidden="true"
              className="text-white/30"
            >
              |
            </span>

            <FooterLink
              href="/privacy"
              className="text-xs sm:text-sm"
            >
              Privacy Policy
            </FooterLink>

            <span
              aria-hidden="true"
              className="text-white/30"
            >
              |
            </span>

            <FooterLink
              href="/sitemap"
              className="text-xs sm:text-sm"
            >
              Sitemap
            </FooterLink>
          </nav>
        </div>
      </div>
    </motion.footer>
  );
}
