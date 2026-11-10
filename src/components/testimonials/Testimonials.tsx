
"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { testimonials } from "@/data/testimonials";
import TestimonialCard from "./TestimonialCard";

// Change this to the actual path of your existing festive background image.
const TESTIMONIALS_BACKGROUND =
  "/images/testimonials/testimonials-newsletter-bg.png";

export default function Testimonials() {
  const [startIndex, setStartIndex] = useState(0);

  const total = testimonials.length;
  const visibleCount = Math.min(3, total);

  const previous = () => {
    if (total > 1) {
      setStartIndex((current) => (current - 1 + total) % total);
    }
  };

  const next = () => {
    if (total > 1) {
      setStartIndex((current) => (current + 1) % total);
    }
  };

  const visibleTestimonials = Array.from(
    { length: visibleCount },
    (_, index) => testimonials[(startIndex + index) % total]
  );

  if (total === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.55 }}
      className="relative isolate w-full overflow-hidden bg-[#fffaf2] py-10 text-[#171717] sm:py-12 lg:py-14"
    >
      {/* Festive cultural background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src={TESTIMONIALS_BACKGROUND}
          alt=""
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Soft overlay keeps the text and cards readable */}
        <div className="absolute inset-0 bg-[#fffaf2]/20" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-[6.5%]">
        {/* Heading and carousel controls */}
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-7">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[38px]">
            What Our Users Say
          </h2>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={previous}
              disabled={total <= 1}
              aria-label="Previous testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d98525] bg-white/85 transition hover:bg-[#d98525] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-14"
            >
              <ArrowLeft size={22} strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={next}
              disabled={total <= 1}
              aria-label="Next testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d98525] bg-white/85 transition hover:bg-[#d98525] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-14"
            >
              <ArrowRight size={22} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Testimonial cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={startIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5"
          >
            {visibleTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="min-w-0">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
