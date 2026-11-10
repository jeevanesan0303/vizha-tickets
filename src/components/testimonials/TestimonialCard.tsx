
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({
  testimonial,
}: TestimonialCardProps) {
  const initials = testimonial.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="relative h-full min-w-0 rounded-2xl border border-[#f1e5d7] bg-white/90 p-4 shadow-[0_4px_14px_rgba(125,76,24,0.06)] transition-shadow hover:shadow-[0_8px_22px_rgba(125,76,24,0.10)] sm:p-5">
      {/* Decorative quote */}
      <Quote
        size={32}
        strokeWidth={0}
        fill="currentColor"
        aria-hidden="true"
        className="absolute right-4 top-3 rotate-180 text-[#f9d9b8]"
      />

      {/* User details */}
      <div className="flex items-center gap-3 pr-8">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#f0e3d3] bg-linear-to-br from-[#fff0db] to-[#e8c89d] text-sm font-bold text-[#a85f08] sm:h-14 sm:w-14"
          aria-label={`${testimonial.name} avatar`}
        >
          {initials}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-[#171717] sm:text-lg">
            {testimonial.name}
          </h3>

          <div
            className="mt-1 flex gap-0.5"
            role="img"
            aria-label={`${testimonial.rating} out of 5 stars`}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={17}
                fill={
                  index < testimonial.rating
                    ? "#f39200"
                    : "transparent"
                }
                stroke={
                  index < testimonial.rating
                    ? "#f39200"
                    : "#d8c8b5"
                }
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review */}
      <p className="mt-4 text-sm leading-6 text-[#414655] sm:text-[15px] sm:leading-[1.55]">
        “{testimonial.comment}”
      </p>
    </article>
  );
}
