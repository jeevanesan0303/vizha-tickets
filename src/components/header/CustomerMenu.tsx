
import { useEffect, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  CalendarDays,
  ChevronDown,
  LogOut,
  Ticket,
  UserRound,
} from "lucide-react";

import {
  logoutCustomer,
  type Customer,
} from "../../lib/customerSession";

/* ==========================================================
   VIZHATICKETS — CUSTOMER PROFILE DROPDOWN

   React + Vite + TypeScript

   FEATURES:
   - Customer avatar and name
   - Customer email
   - My Profile navigation
   - My Tickets navigation
   - My Bookings navigation
   - Active page indicator
   - Log Out
   - Close on outside click
   - Close on Escape
   - Mobile and desktop support
   - Premium cream / gold styling

   Requires matching routes in src/App.tsx.
   ========================================================== */

interface CustomerMenuProps {
  customer: Customer;
  mobile?: boolean;
  onNavigate?: () => void;
}

const customerLinks = [
  {
    label: "My Profile",
    description: "Account details",
    href: "/profile",
    icon: UserRound,
  },
  {
    label: "My Tickets",
    description: "Your event tickets",
    href: "/my-tickets",
    icon: Ticket,
  },
  {
    label: "My Bookings",
    description: "Booking history",
    href: "/my-bookings",
    icon: CalendarDays,
  },
] as const;

/* ==========================================================
   CUSTOMER MENU COMPONENT
   ========================================================== */

export default function CustomerMenu({
  customer,
  mobile = false,
  onNavigate,
}: CustomerMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef<HTMLDetailsElement>(null);

  /* ========================================================
     CUSTOMER INITIAL
     ======================================================== */

  const customerName =
    customer.name?.trim() || "Customer";

  const customerEmail =
    customer.email?.trim() || "";

  const initial =
    customerName.charAt(0).toUpperCase();

  /* ========================================================
     CLOSE DROPDOWN
     ======================================================== */

  const closeMenu = () => {
    if (menuRef.current) {
      menuRef.current.open = false;
    }
  };

  /* ========================================================
     HANDLE LINK NAVIGATION
     ======================================================== */

  const handleMenuNavigation = () => {
    closeMenu();
    onNavigate?.();
  };

  /* ========================================================
     LOG OUT
     ======================================================== */

  const handleLogout = () => {
    try {
      logoutCustomer();

      closeMenu();

      onNavigate?.();

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "VizhaTickets logout error:",
        error
      );
    }
  };

  /* ========================================================
     OUTSIDE CLICK AND ESCAPE
     ======================================================== */

  useEffect(() => {
    const handleOutsideClick = (
      event: PointerEvent
    ) => {
      const target = event.target;

      if (
        target instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        menuRef.current.open = false;
      }
    };

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape" &&
        menuRef.current?.open
      ) {
        menuRef.current.open = false;

        menuRef.current
          .querySelector<HTMLElement>("summary")
          ?.focus();
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* ========================================================
     CLOSE AFTER ROUTE CHANGE
     ======================================================== */

  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.open = false;
    }
  }, [location.pathname]);

  /* ========================================================
     ACTIVE ROUTE
     ======================================================== */

  const isActiveLink = (href: string) => {
    return (
      location.pathname === href ||
      location.pathname.startsWith(`${href}/`)
    );
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <details
      ref={menuRef}
      className={`group relative ${
        mobile ? "w-full" : ""
      }`}
    >
      {/* ================================================
          CUSTOMER PROFILE TRIGGER
          ================================================ */}

      <summary
        aria-label={`Customer account menu for ${customerName}`}
        className={`
          flex cursor-pointer list-none items-center
          gap-2 rounded-full border
          border-[#efd9bc] bg-white
          px-2 py-1.5 shadow-sm
          outline-none
          transition-all duration-300
          hover:border-[#e99a30]
          hover:bg-[#fff9ef]
          hover:shadow-md
          focus-visible:ring-2
          focus-visible:ring-[#e98912]
          focus-visible:ring-offset-2
          group-open:border-[#eda43e]
          group-open:bg-[#fff8ed]
          [&::-webkit-details-marker]:hidden
          ${mobile ? "w-full" : ""}
        `}
      >
        {/* AVATAR */}

        <span
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-full
            bg-linear-to-br
            from-[#ffedc8] to-[#ffda9a]
            text-sm font-extrabold
            text-[#a65a09]
            shadow-inner
          "
        >
          {initial}
        </span>

        {/* CUSTOMER NAME */}

        <span
          className={`
            min-w-0 text-left
            ${mobile ? "flex-1" : "max-w-33.75"}
          `}
        >
          <span className="block truncate text-xs font-bold text-[#292019]">
            {customerName}
          </span>

          <span className="block text-[10px] text-[#8a6c45]">
            Customer Account
          </span>
        </span>

        {/* DROPDOWN ARROW */}

        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className="
            shrink-0 text-[#aa740f]
            transition-transform duration-200
            group-open:rotate-180
          "
        />
      </summary>

      {/* ================================================
          DROPDOWN PANEL
          ================================================ */}

      <div
        className={`
          z-100
          rounded-2xl
          border border-[#f0dfc7]
          bg-white p-2
          shadow-[0_16px_36px_rgba(57,32,8,0.18)]
          ${
            mobile
              ? "relative mt-2 w-full"
              : "absolute right-0 top-[calc(100%+10px)] w-65"
          }
        `}
      >
        {/* ==============================================
            CUSTOMER INFORMATION
            ============================================== */}

        <div className="border-b border-[#f4e8db] px-3 pb-3 pt-2.5">

          <div className="flex items-center gap-3">

            {/* SMALL AVATAR */}

            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                bg-[#fff1dc]
                font-extrabold text-[#b76b0d]
              "
            >
              {initial}
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-[12px] font-bold text-[#292019]">
                {customerName}
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-[#ab741e]">
                Customer Account
              </p>
            </div>
          </div>

          {/* EMAIL */}

          <p
            className="
              mt-3 break-all
              text-[11px] leading-normal
              text-[#837569]
            "
          >
            {customerEmail}
          </p>
        </div>

        {/* ==============================================
            CUSTOMER NAVIGATION LINKS
            ============================================== */}

        <nav
          aria-label="Customer account navigation"
          className="mt-1 space-y-0.5"
        >
          {customerLinks.map((item) => {
            const Icon = item.icon;

            const active = isActiveLink(
              item.href
            );

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleMenuNavigation}
                aria-current={
                  active ? "page" : undefined
                }
                className={`
                  group/link flex w-full
                  items-center gap-3
                  rounded-xl px-3 py-2.5
                  outline-none
                  transition-all duration-200
                  focus-visible:ring-2
                  focus-visible:ring-[#ef8b16]
                  ${
                    active
                      ? "bg-[#fff1df] text-[#c46b0b]"
                      : "text-[#4c4037] hover:bg-[#fff7ed] hover:text-[#d8780b]"
                  }
                `}
              >
                {/* ICON */}

                <span
                  className={`
                    flex h-8 w-8 shrink-0
                    items-center justify-center
                    rounded-lg
                    transition-colors duration-200
                    ${
                      active
                        ? "bg-[#ffe1b4] text-[#bd6d0e]"
                        : "bg-[#fff7ed] text-[#b98540] group-hover/link:bg-[#ffe8c7] group-hover/link:text-[#c8750b]"
                    }
                  `}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </span>

                {/* LINK TEXT */}

                <span className="min-w-0 flex-1">

                  <span
                    className={`
                      block text-[12px]
                      ${
                        active
                          ? "font-bold"
                          : "font-semibold"
                      }
                    `}
                  >
                    {item.label}
                  </span>

                  <span
                    className="
                      mt-0.5 block
                      text-[10px]
                      text-[#988a7b]
                    "
                  >
                    {item.description}
                  </span>
                </span>

                {/* ACTIVE INDICATOR */}

                {active && (
                  <span
                    aria-hidden="true"
                    className="
                      h-1.5 w-1.5
                      rounded-full
                      bg-[#e98c13]
                    "
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* DIVIDER */}

        <div className="my-2 border-t border-[#f3e7dc]" />

        {/* ==============================================
            LOG OUT BUTTON
            ============================================== */}

        <button
          type="button"
          onClick={handleLogout}
          className="
            group/logout flex w-full
            cursor-pointer
            items-center gap-3
            rounded-xl px-3 py-2.5
            text-left
            text-[12px] font-bold
            text-[#b23727]
            outline-none
            transition-all duration-200
            hover:bg-[#fff2f0]
            hover:text-[#962619]
            focus-visible:ring-2
            focus-visible:ring-[#d8584b]
          "
        >
          <span
            className="
              flex h-8 w-8
              items-center justify-center
              rounded-lg bg-[#fff1ef]
              transition-colors duration-200
              group-hover/logout:bg-[#ffe3df]
            "
          >
            <LogOut
              size={17}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </span>

          <span>Log Out</span>
        </button>
      </div>
    </details>
  );
}
