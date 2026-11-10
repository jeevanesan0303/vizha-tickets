
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Heart, MapPin } from "lucide-react";

import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  priority?: boolean;
  loading?: "eager" | "lazy";
}

export default function EventCard({
  event,
  priority = false,
  loading,
}: EventCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const eventUrl = `/events/${event.slug}`;

  const dateParts = event.date.trim().split(/\s+/);
  const eventDay = dateParts[0] ?? "";
  const eventMonth = dateParts[1] ?? "";

  const formattedPrice = new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 0,
  }).format(event.price);

  const handleFavorite = () => {
    setIsFavorite((previous) => !previous);
  };

  return (
    <article
      className="
        group relative flex h-full min-w-0 flex-col
        overflow-hidden rounded-[20px]
        border border-[#EEE4D9]
        bg-white
        shadow-[0_5px_22px_rgba(82,52,18,0.055)]
        transition-[transform,box-shadow,border-color]
        duration-300 ease-out
        hover:-translate-y-1.25
        hover:border-[#E8C9A3]
        hover:shadow-[0_18px_42px_rgba(94,57,17,0.13)]
        motion-reduce:transform-none
        motion-reduce:transition-none
      "
    >
      {/* =========================================
          EVENT IMAGE
      ========================================= */}
      <div
        className="
          relative aspect-[1.72/1] w-full
          shrink-0 overflow-hidden bg-[#F5F0EA]
        "
      >
        <Link
          href={eventUrl}
          aria-label={`View details for ${event.title}`}
          className="absolute inset-0 z-0 block"
        >
          <Image
            src={event.image}
            alt={event.title}
            fill
            priority={priority}
            loading={priority ? undefined : loading ?? "lazy"}
            sizes="
              (max-width: 639px) 100vw,
              (max-width: 1023px) 50vw,
              25vw
            "
            className="
              object-cover object-center
              transition-transform duration-700 ease-out
              group-hover:scale-[1.055]
              motion-reduce:transform-none
              motion-reduce:transition-none
            "
          />

          {/* Subtle Image Depth */}
          <div
            aria-hidden="true"
            className="
              absolute inset-0
              bg-linear-to-t
              from-black/15 via-transparent to-black/4
              transition-opacity duration-300
              group-hover:opacity-70
            "
          />
        </Link>

        {/* =========================================
            DATE BADGE
        ========================================= */}
        <div
          className="
            pointer-events-none absolute
            left-3 top-3 z-10
            flex h-13.25 w-12.25
            flex-col items-center justify-center
            rounded-[13px]
            border border-white/80
            bg-white/95
            shadow-[0_5px_16px_rgba(0,0,0,0.12)]
            backdrop-blur-md
          "
        >
          <span
            className="
              text-[19px] font-extrabold
              leading-none tracking-[-0.04em]
              text-[#24201D]
            "
          >
            {eventDay}
          </span>

          <span
            className="
              mt-1.25 text-[10px]
              font-extrabold uppercase
              tracking-[0.08em]
              text-[#C9790B]
            "
          >
            {eventMonth}
          </span>
        </div>

        {/* =========================================
            FAVORITE BUTTON
        ========================================= */}
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={
            isFavorite
              ? `Remove ${event.title} from favourites`
              : `Add ${event.title} to favourites`
          }
          aria-pressed={isFavorite}
          title={
            isFavorite
              ? "Remove from favourites"
              : "Add to favourites"
          }
          className={`
            absolute right-3 top-3 z-20
            flex h-9.25 w-9.25
            cursor-pointer items-center justify-center
            rounded-full
            border border-white/80
            bg-white/95
            shadow-[0_4px_14px_rgba(0,0,0,0.12)]
            backdrop-blur-md
            transition-all duration-300
            hover:scale-110
            active:scale-95
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-[#C9790B]
            motion-reduce:transform-none
            ${
              isFavorite
                ? "text-[#E44857]"
                : "text-[#55514D] hover:text-[#C9790B]"
            }
          `}
        >
          <Heart
            size={18}
            strokeWidth={1.9}
            fill={isFavorite ? "currentColor" : "none"}
            aria-hidden="true"
            className="transition-colors duration-200"
          />
        </button>
      </div>

      {/* =========================================
          EVENT CONTENT
      ========================================= */}
      <div
        className="
          flex min-w-0 flex-1 flex-col
          px-4.25 pb-4.25 pt-4
          sm:px-4.5 sm:pb-4.5
        "
      >
        {/* Event Title */}
        <Link
          href={eventUrl}
          className="
            group/title block rounded-sm
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-[#C9790B]
          "
        >
          <h3
            className="
              line-clamp-2 min-h-10.5
              text-[15px] font-bold
              leading-[1.4]
              tracking-[-0.015em]
              text-[#24211E]
              transition-colors duration-200
              group-hover/title:text-[#B76B09]
              sm:text-[15.5px]
            "
          >
            {event.title}
          </h3>
        </Link>

        {/* Event Location */}
        <div
          className="
            mt-1.75 flex min-w-0 items-center
            gap-1.5 text-[12px]
            leading-5 text-[#827B74]
          "
        >
          <MapPin
            size={14}
            strokeWidth={1.9}
            className="shrink-0 text-[#D17A0B]"
            aria-hidden="true"
          />

          <span className="truncate" title={event.location}>
            {event.location}
          </span>
        </div>

        {/* Flexible Spacer */}
        <div className="min-h-4.5 flex-1" />

        {/* Subtle Divider */}
        <div
          aria-hidden="true"
          className="mb-3.75 h-px w-full bg-[#F2EBE3]"
        />

        {/* =========================================
            PRICE + BOOK NOW
        ========================================= */}
        <div
          className="
            flex items-end justify-between
            gap-2
          "
        >
          {/* Starting Price */}
          <div className="min-w-0 flex-1">
            <p
              className="
                mb-0.75 text-[10px]
                font-medium leading-none
                tracking-[0.01em]
                text-[#999087]
              "
            >
              Starting from
            </p>

            <p
              className="
                whitespace-nowrap
                text-[16px] font-extrabold
                leading-tight
                tracking-tight
                text-[#C9790B]
                sm:text-[17px]
              "
            >
              <span className="mr-0.75 text-[11px] font-bold">
                {event.currency}
              </span>
              {formattedPrice}
            </p>
          </div>

          {/* Booking Button */}
          <Link
            href={eventUrl}
            aria-label={`Book tickets for ${event.title}`}
            className="
              group/book inline-flex
              min-h-9.75 shrink-0
              items-center justify-center
              gap-1.5 whitespace-nowrap
              rounded-[10px]
              bg-linear-to-r
              from-[#D4810C] to-[#F18B00]
              px-3.5 py-2.25
              text-[11.5px] font-bold
              text-white
              shadow-[0_4px_12px_rgba(209,122,11,0.17)]
              transition-all duration-300
              hover:from-[#BD6D05]
              hover:to-[#DB7900]
              hover:shadow-[0_7px_18px_rgba(209,122,11,0.28)]
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-[#C9790B]
              active:scale-[0.97]
              motion-reduce:transform-none
              sm:px-3.75
            "
          >
            <span>Book Now</span>

            <ArrowUpRight
              size={15}
              strokeWidth={2}
              aria-hidden="true"
              className="
                transition-transform duration-300
                group-hover/book:translate-x-0.5
                group-hover/book:-translate-y-0.5
                motion-reduce:transform-none
              "
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
