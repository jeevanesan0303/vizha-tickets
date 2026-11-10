
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Music2,
  Flower2,
  Drama,
  Trophy,
  Theater,
  PartyPopper,
  GraduationCap,
  Ellipsis,
} from "lucide-react";

import type { Category } from "@/types";
import type { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  priority?: boolean;
  loading?: "eager" | "lazy";
}

interface CategoryStyle {
  count: string;
  countLabel: string;
  subtitle: string;
  color: string;
  softColor: string;
  icon: LucideIcon;
  imagePosition: string;
}

const categoryStyles: Record<string, CategoryStyle> = {
  music: {
    count: "120+",
    countLabel: "Events",
    subtitle: "Concerts",
    color: "#f52243",
    softColor: "#ffe9ed",
    icon: Music2,
    imagePosition: "center center",
  },
  cultural: {
    count: "85+",
    countLabel: "Events",
    subtitle: "Events",
    color: "#ff9900",
    softColor: "#fff2df",
    icon: Flower2,
    imagePosition: "center 35%",
  },
  comedy: {
    count: "60+",
    countLabel: "Shows",
    subtitle: "Shows",
    color: "#742cff",
    softColor: "#f0e8ff",
    icon: Drama,
    imagePosition: "center center",
  },
  sports: {
    count: "95+",
    countLabel: "Events",
    subtitle: "Events",
    color: "#1877f2",
    softColor: "#e8f1ff",
    icon: Trophy,
    imagePosition: "center center",
  },
  theatre: {
    count: "70+",
    countLabel: "Performances",
    subtitle: "& Performances",
    color: "#f52243",
    softColor: "#ffe9ed",
    icon: Theater,
    imagePosition: "center center",
  },
  festivals: {
    count: "110+",
    countLabel: "Events",
    subtitle: "& Fairs",
    color: "#e91e63",
    softColor: "#fdeaf2",
    icon: PartyPopper,
    imagePosition: "center center",
  },
  workshops: {
    count: "55+",
    countLabel: "Classes",
    subtitle: "& Classes",
    color: "#09b96b",
    softColor: "#e3f9ed",
    icon: GraduationCap,
    imagePosition: "center 35%",
  },
  others: {
    count: "80+",
    countLabel: "Events",
    subtitle: "Events",
    color: "#68717d",
    softColor: "#f0f1f3",
    icon: Ellipsis,
    imagePosition: "center center",
  },
};

const fallbackStyle: CategoryStyle = {
  count: "50+",
  countLabel: "Events",
  subtitle: "Explore",
  color: "#c9790b",
  softColor: "#fff1dc",
  icon: Ellipsis,
  imagePosition: "center center",
};

export default function CategoryCard({
  category,
  priority = false,
  loading = "lazy",
}: CategoryCardProps) {
  const key = category.slug.toLowerCase();
  const style = categoryStyles[key] ?? fallbackStyle;
  const Icon = style.icon;

  return (
    <Link
      href={`/categories/${category.slug}`}
      aria-label={`Explore ${category.name} events${
        category.description
          ? ` - ${category.description}`
          : ""
      }`}
      className="group block h-full min-w-0 rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-[#e98a0a] focus-visible:ring-offset-4"
    >
      {/* MAIN CATEGORY CARD */}

      <article
        className="
          relative
          isolate
          flex
          h-76.25
          min-w-0
          flex-col
          overflow-hidden
          rounded-[22px]
          border
          border-[#eee7dd]
          bg-white
          shadow-[0_6px_22px_rgba(35,24,12,0.08)]
          transition-all
          duration-300
          ease-out
          group-hover:-translate-y-1.25
          group-hover:border-[#e7d4bc]
          group-hover:shadow-[0_15px_35px_rgba(35,24,12,0.13)]
          sm:h-80
          lg:h-81.25
          2xl:h-83.75
        "
      >
        {/* ============================================
            CATEGORY IMAGE
            ============================================ */}

        <div className="absolute inset-x-0 top-0 h-[76%] overflow-hidden bg-[#f5eee5]">
          <Image
            src={category.image}
            alt={category.name}
            fill
            priority={priority}
            loading={priority ? undefined : loading}
            sizes="(max-width: 639px) 75vw, (max-width: 1023px) 40vw, (max-width: 1399px) 24vw, 13vw"
            style={{
              objectPosition: style.imagePosition,
            }}
            className="
              object-cover
              transition-transform
              duration-700
              ease-out
              motion-safe:group-hover:scale-[1.065]
            "
          />

          {/* IMAGE GRADIENT */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-linear-to-b
              from-black/15
              via-transparent
              to-black/25
            "
          />

          {/* SUBTLE HOVER OVERLAY */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-black/0
              transition-colors
              duration-500
              group-hover:bg-black/10
            "
          />
        </div>

        {/* ============================================
            EVENT COUNT BADGE
            ============================================ */}

        <div
          className="
            absolute
            right-3
            top-3
            z-10
            rounded-xl
            border
            border-white/20
            bg-black/65
            px-2.5
            py-1.5
            text-center
            text-white
            shadow-[0_5px_15px_rgba(0,0,0,0.13)]
            backdrop-blur-md
          "
        >
          <p className="text-[13px] font-extrabold leading-4.25 sm:text-[14px]">
            {style.count}
          </p>

          <p className="mt-0.5 text-[9px] font-medium leading-3 text-white/90">
            {style.countLabel}
          </p>
        </div>

        {/* ============================================
            WHITE INFORMATION PANEL
            ============================================ */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            z-20
            min-h-25.5
            rounded-t-[21px]
            bg-white
            px-3
            pb-3.5
            pt-8
            shadow-[0_-6px_20px_rgba(0,0,0,0.05)]
            sm:px-3.5
            sm:pb-4
          "
        >
          {/* OVERLAPPING CATEGORY ICON */}

          <div
            className="
              absolute
              -top-6.25
              left-3
              flex
              h-12.75
              w-12.75
              items-center
              justify-center
              rounded-full
              border-4
              border-white
              text-white
              shadow-[0_3px_10px_rgba(0,0,0,0.10)]
              transition-transform
              duration-300
              motion-safe:group-hover:scale-110
              sm:left-3.5
            "
            style={{
              backgroundColor: style.color,
            }}
          >
            <Icon
              size={22}
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </div>

          {/* CONTENT ROW */}

          <div className="flex min-w-0 items-center justify-between gap-1.5">
            {/* CATEGORY TEXT */}

            <div className="min-w-0 flex-1">
              <h3
                className="
                  min-w-0
                  whitespace-normal
                  wrap-break-word
                  text-[13px]
                  font-extrabold
                  leading-[1.3]
                  tracking-tight
                  text-[#171717]
                  sm:text-[14px]
                  xl:text-[14px]
                  2xl:text-[16px]
                "
              >
                {category.name}
              </h3>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-[1.35]
                  text-[#7b7b7b]
                  sm:text-[12px]
                "
              >
                {style.subtitle}
              </p>
            </div>

            {/* ARROW CIRCLE */}

            <span
              aria-hidden="true"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                transition-all
                duration-300
                group-hover:scale-105
                group-hover:shadow-sm
                sm:h-9.5
                sm:w-9.5
              "
              style={{
                backgroundColor: style.softColor,
                color: style.color,
              }}
            >
              <ArrowRight
                size={19}
                strokeWidth={2.2}
                className="
                  transition-transform
                  duration-300
                  motion-safe:group-hover:translate-x-0.75
                "
              />
            </span>
          </div>
        </div>

        {/* BOTTOM HOVER ACCENT */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-30
            h-0.75
            origin-center
            scale-x-0
            transition-transform
            duration-300
            group-hover:scale-x-100
          "
          style={{
            backgroundColor: style.color,
          }}
        />
      </article>
    </Link>
  );
}
