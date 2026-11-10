
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Music2,
  Flower2,
  Drama,
  Trophy,
  Theater,
  TentTree,
  GraduationCap,
  Ellipsis,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

/* ==========================================================
   CATEGORY DATA
   Preserve the original images, routes, and brand colours.
   ========================================================== */

interface ExploreCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  color: string;
  softColor: string;
  imagePosition: string;
  Icon: LucideIcon;
}

const exploreCategories: ExploreCategory[] = [
  {
    id: "music",
    name: "Music",
    description: "Concerts",
    slug: "music",
    image: "/images/categories/explore/music.png",
    color: "#f01446",
    softColor: "#fff0f3",
    imagePosition: "center center",
    Icon: Music2,
  },
  {
    id: "cultural",
    name: "Cultural",
    description: "Events",
    slug: "cultural",
    image: "/images/categories/explore/cultural.png",
    color: "#ff9900",
    softColor: "#fff5e5",
    imagePosition: "center 35%",
    Icon: Flower2,
  },
  {
    id: "comedy",
    name: "Comedy",
    description: "Shows",
    slug: "comedy",
    image: "/images/categories/explore/comedy.png",
    color: "#782bff",
    softColor: "#f3edff",
    imagePosition: "center center",
    Icon: Drama,
  },
  {
    id: "sports",
    name: "Sports",
    description: "Events",
    slug: "sports",
    image: "/images/categories/explore/sports.png",
    color: "#1677ff",
    softColor: "#ecf4ff",
    imagePosition: "center center",
    Icon: Trophy,
  },
  {
    id: "theatre",
    name: "Theatre",
    description: "& Performances",
    slug: "theatre",
    image: "/images/categories/explore/theatre.png",
    color: "#f21d35",
    softColor: "#fff0f1",
    imagePosition: "center center",
    Icon: Theater,
  },
  {
    id: "festivals",
    name: "Festivals",
    description: "& Fairs",
    slug: "festivals",
    image: "/images/categories/explore/festivals.png",
    color: "#e91e63",
    softColor: "#fff0f6",
    imagePosition: "center center",
    Icon: TentTree,
  },
  {
    id: "workshops",
    name: "Workshops",
    description: "& Classes",
    slug: "workshops",
    image: "/images/categories/explore/workshops.png",
    color: "#00b96b",
    softColor: "#e8faf1",
    imagePosition: "center 35%",
    Icon: GraduationCap,
  },
  {
    id: "others",
    name: "Others",
    description: "Events",
    slug: "others",
    image: "/images/categories/explore/others.png",
    color: "#77808c",
    softColor: "#f1f3f5",
    imagePosition: "center center",
    Icon: Ellipsis,
  },
];

/* ==========================================================
   INDIVIDUAL EXPLORE CATEGORY CARD
   ========================================================== */

interface ExploreCategoryCardProps {
  category: ExploreCategory;
  index: number;
  reducedMotion: boolean;
}

function ExploreCategoryCard({
  category,
  index,
  reducedMotion,
}: ExploreCategoryCardProps) {
  const Icon = category.Icon;

  return (
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
        amount: 0.15,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.45,
        delay: reducedMotion
          ? 0
          : Math.min(index * 0.045, 0.3),
        ease: "easeOut",
      }}
      className="h-full min-w-0"
    >
      <Link
        href={`/categories/${category.slug}`}
        aria-label={`Explore ${category.name} ${category.description}`}
        className="
          group
          relative
          flex
          h-75
          w-full
          min-w-0
          flex-col
          overflow-hidden
          rounded-[22px]
          border
          border-[#eee8df]
          bg-white
          shadow-[0_5px_20px_rgba(35,25,10,0.07)]
          outline-none
          transition-all
          duration-300
          ease-out
          hover:-translate-y-1.25
          hover:border-[#e8d8c4]
          hover:shadow-[0_15px_32px_rgba(35,25,10,0.13)]
          focus-visible:ring-2
          focus-visible:ring-[#e99014]
          focus-visible:ring-offset-4
          sm:h-78.75
          lg:h-80
          2xl:h-81.25
        "
      >
        {/* ==========================================
            CATEGORY IMAGE
            ========================================== */}

        <div
          className="
            relative
            min-h-0
            flex-1
            overflow-hidden
            bg-[#f6efe7]
          "
        >
          <Image
            src={category.image}
            alt={`${category.name} events`}
            fill
            priority={index < 2}
            sizes="(max-width: 639px) 160px, (max-width: 1023px) 210px, (max-width: 1599px) 205px, 12vw"
            style={{
              objectPosition: category.imagePosition,
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
              from-black/10
              via-transparent
              to-black/30
            "
          />

          {/* HOVER OVERLAY */}

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

        {/* ==========================================
            WHITE INFORMATION PANEL
            ========================================== */}

        <div
          className="
            relative
            z-10
            flex
            min-h-26.25
            shrink-0
            flex-col
            justify-end
            rounded-t-[20px]
            bg-white
            px-3
            pb-3.5
            pt-8
            shadow-[0_-5px_18px_rgba(0,0,0,0.04)]
            sm:px-3.5
            sm:pb-4
          "
        >
          {/* FLOATING CATEGORY ICON */}

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
              shadow-[0_3px_12px_rgba(0,0,0,0.12)]
              transition-transform
              duration-300
              motion-safe:group-hover:scale-110
              sm:left-3.5
            "
            style={{
              backgroundColor: category.color,
            }}
          >
            <Icon
              size={22}
              strokeWidth={2.3}
              aria-hidden="true"
            />
          </div>

          {/* CATEGORY DETAILS */}

          <div className="flex min-w-0 items-center justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              {/* CATEGORY NAME */}

              <h3
                className="
                  whitespace-normal
                  wrap-break-word
                  text-[13px]
                  font-extrabold
                  leading-[1.3]
                  tracking-[-0.02em]
                  text-[#171717]
                  sm:text-[14px]
                  2xl:text-[15px]
                "
              >
                {category.name}
              </h3>

              {/* CATEGORY DESCRIPTION */}

              <p
                className="
                  mt-1
                  whitespace-normal
                  wrap-break-word
                  text-[11px]
                  leading-[1.35]
                  text-[#777b82]
                  sm:text-[12px]
                "
              >
                {category.description}
              </p>
            </div>

            {/* ARROW BUTTON */}

            <span
              aria-hidden="true"
              className="
                flex
                h-8.75
                w-8.75
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
                color: category.color,
                backgroundColor: category.softColor,
              }}
            >
              <ArrowRight
                size={18}
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

        {/* COLOURED BOTTOM HOVER LINE */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-20
            h-0.75
            origin-center
            scale-x-0
            transition-transform
            duration-300
            group-hover:scale-x-100
          "
          style={{
            backgroundColor: category.color,
          }}
        />
      </Link>
    </motion.div>
  );
}

/* ==========================================================
   EXPLORE BY CATEGORY SECTION
   ========================================================== */

export default function ExploreByCategory() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion === true;

  return (
    <section
      aria-labelledby="explore-categories-title"
      className="
        relative
        w-full
        overflow-hidden
        bg-white
        py-12
        sm:py-14
        lg:py-16
      "
    >
      <div className="vizha-container relative mx-auto w-full">
        {/* ==========================================
            SECTION HEADING
            ========================================== */}

        <motion.div
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  y: 14,
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
            duration: 0.45,
          }}
          className="
            mb-7
            flex
            items-end
            justify-between
            gap-4
            sm:mb-8
          "
        >
          <div className="min-w-0">
            {/* GOLD ACCENT */}

            <div
              aria-hidden="true"
              className="
                mb-3
                h-1
                w-8
                rounded-full
                bg-linear-to-r
                from-[#e99a18]
                to-[#bc6e05]
              "
            />

            {/* SECTION TITLE */}

            <h2
              id="explore-categories-title"
              className="
                vizha-heading
                text-[26px]
                font-bold
                leading-tight
                tracking-tight
                text-[#171717]
                sm:text-[32px]
                lg:text-[35px]
              "
            >
              Explore By Category
            </h2>
          </div>

          {/* VIEW ALL LINK */}

          <Link
            href="/categories"
            className="
              group
              mb-1
              inline-flex
              shrink-0
              items-center
              gap-2
              rounded-full
              px-2
              py-2
              text-[12px]
              font-semibold
              text-[#292929]
              outline-none
              transition-colors
              duration-200
              hover:text-[#c9790b]
              focus-visible:ring-2
              focus-visible:ring-[#c9790b]
              sm:text-[13px]
            "
          >
            <span>View All</span>

            <ArrowRight
              size={19}
              strokeWidth={2}
              aria-hidden="true"
              className="
                transition-transform
                duration-300
                motion-safe:group-hover:translate-x-1
              "
            />
          </Link>
        </motion.div>

        {/* ==========================================
            RESPONSIVE CATEGORY CARDS

            Mobile:
              2 columns

            Tablet:
              4 columns

            Medium desktop:
              Horizontal scrolling at comfortable card widths

            Large desktop:
              8 columns
            ========================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-4
            sm:gap-4
            lg:flex
            lg:gap-4
            lg:overflow-x-auto
            lg:pb-5
            lg:scrollbar-thin
            lg:[scrollbar-color:#e4d2b8_transparent]
            min-[1600px]:grid
            min-[1600px]:grid-cols-8
            min-[1600px]:overflow-visible
            min-[1600px]:pb-0
          "
        >
          {exploreCategories.map((category, index) => (
            <div
              key={category.id}
              className="
                min-w-0
                lg:w-51.25
                lg:min-w-51.25
                lg:shrink-0
                min-[1600px]:w-auto
                min-[1600px]:min-w-0
              "
            >
              <ExploreCategoryCard
                category={category}
                index={index}
                reducedMotion={reducedMotion}
              />
            </div>
          ))}
        </div>

        {/* MOBILE / TABLET VIEW ALL LINK */}

        <div className="mt-7 flex justify-center sm:hidden">
          <Link
            href="/categories"
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#e8d2b3]
              bg-[#fffaf3]
              px-6
              text-[13px]
              font-semibold
              text-[#b96e07]
              transition-all
              duration-300
              hover:border-[#d69746]
              hover:bg-[#fff0da]
            "
          >
            Explore All Categories
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
