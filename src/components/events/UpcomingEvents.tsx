
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { events } from "@/data/events";
import EventCard from "./EventCard";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export default function UpcomingEvents() {
  const shouldReduceMotion = useReducedMotion();

  const upcomingEvents = events.slice(0, 4);

  return (
    <section
      aria-labelledby="upcoming-events-heading"
      className="relative isolate overflow-hidden bg-white py-12 sm:py-14 lg:py-16"
    >
      <div className="vizha-container relative z-10">
        {/* Section Heading */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5 sm:mb-9 lg:mb-10">
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, y: 18 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.55,
              ease: EASE,
            }}
            className="min-w-0"
          >
            {/* Accent Line */}
            <div
              aria-hidden="true"
              className="mb-3 h-0.75 w-9 rounded-full bg-linear-to-r from-[#D07808] to-[#FF9A16]"
            />

            {/* Heading */}
            <h2
              id="upcoming-events-heading"
              className="vizha-heading text-[29px] font-bold leading-[1.2] tracking-[-0.035em] text-[#161616] sm:text-[34px] lg:text-[38px]"
            >
              Upcoming Events
            </h2>

            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#777777] sm:text-sm">
              Discover unforgettable experiences, live performances
              and celebrations near you.
            </p>
          </motion.div>

          {/* View All Events */}
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, x: 12 }
            }
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: EASE,
            }}
          >
            <Link
              href="/events"
              aria-label="View all upcoming events"
              className="group inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#F2E2D0] bg-white px-4 py-2 text-[12px] font-semibold text-[#B96A06] shadow-[0_3px_12px_rgba(171,101,20,0.04)] transition-all duration-300 hover:border-[#EAB772] hover:bg-[#FFF8F0] hover:text-[#A85C00] hover:shadow-[0_5px_18px_rgba(171,101,20,0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9790B] sm:text-[13px]"
            >
              View All Events
              <ArrowRight
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>

        {/* Upcoming Events Grid */}
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-4 xl:gap-6">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 24 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{
                  once: true,
                  amount: 0.12,
                }}
                transition={{
                  duration: 0.55,
                  delay: shouldReduceMotion
                    ? 0
                    : index * 0.08,
                  ease: EASE,
                }}
                className="group relative h-full min-w-0"
              >
                <EventCard
                  event={event}
                  loading={index < 2 ? "eager" : "lazy"}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E9DCCB] bg-[#FFFCF8] px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-[#29221B]">
              No upcoming events yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#80776E]">
              New experiences are on the way. Explore all events
              to discover what is happening.
            </p>

            <Link
              href="/events"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F18700] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#D97800]"
            >
              Explore Events
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
