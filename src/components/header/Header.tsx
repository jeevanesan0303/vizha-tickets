
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  CalendarDays,
  Grid2X2,
  Home,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { useCustomerSession } from "../../lib/customerSession";
import CustomerMenu from "./CustomerMenu";
import { useAuthModal } from "../../contexts/AuthModalContext";

/* ==========================================================
   VIZHATICKETS — PREMIUM RESPONSIVE HEADER

   React + Vite + React Router
   Uses existing next/* compatibility aliases.

   PRESERVED
   - Original Tamil VizhaTickets logo
   - Desktop navigation
   - Active navigation indicators
   - Desktop / mobile search
   - Mobile and tablet navigation
   - Premium cream and orange design
   - Existing customer profile dropdown
   - Hover animations

   NEW
   - Sign In opens global login modal
   - Sign Up opens global registration modal
   - No navigation to separate auth pages
   - Homepage remains visible behind the popup
   - Both desktop and mobile support
   - Signed-in customers see their profile
   ========================================================== */

const navigation = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: Grid2X2,
  },
  {
    label: "About Us",
    href: "/about",
    icon: UserRound,
  },
] as const;

/* ==========================================================
   HEADER COMPONENT
   ========================================================== */

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  /* ========================================================
     CUSTOMER AUTHENTICATION
     ======================================================== */

  const {
    customer,
    isAuthenticated,
  } = useCustomerSession();

  /* ========================================================
     GLOBAL LOGIN / REGISTER POPUP
     ======================================================== */

  const {
    openLogin,
    openRegister,
  } = useAuthModal();

  /* ========================================================
     HEADER STATE
     ======================================================== */

  const [mobilePanel, setMobilePanel] = useState({
    pathname,
    open: false,
  });

  const [searchPanel, setSearchPanel] = useState({
    pathname,
    open: false,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const mobileMenuButtonRef =
    useRef<HTMLButtonElement>(null);

  const searchButtonRef =
    useRef<HTMLButtonElement>(null);

  /* ========================================================
     ROUTE-AWARE MENU STATE
     ======================================================== */

  const mobileOpen =
    mobilePanel.pathname === pathname &&
    mobilePanel.open;

  const searchOpen =
    searchPanel.pathname === pathname &&
    searchPanel.open;

  const normalizedPath =
    pathname === "/"
      ? "/"
      : pathname.replace(/\/+$/, "");

  /*
   * Signed-in customers:
   * Show customer profile, hide auth buttons.
   *
   * Signed-out visitors:
   * Show Sign In and Sign Up popup buttons.
   */

  const showAuthButtons = !isAuthenticated;

  /* ========================================================
     ACTIVE NAVIGATION
     ======================================================== */

  const isActive = (href: string): boolean => {
    if (href === "/") {
      return normalizedPath === "/";
    }

    return (
      normalizedPath === href ||
      normalizedPath.startsWith(`${href}/`)
    );
  };

  /* ========================================================
     CLOSE MOBILE PANELS
     ======================================================== */

  const closeMenus = () => {
    setMobilePanel({
      pathname,
      open: false,
    });

    setSearchPanel({
      pathname,
      open: false,
    });
  };

  const handleNavigation = () => {
    closeMenus();
  };

  /* ========================================================
     OPEN SIGN IN POPUP
     ======================================================== */

  const handleSignIn = () => {
    closeMenus();

    if (isAuthenticated) {
      return;
    }

    openLogin();
  };

  /* ========================================================
     OPEN SIGN UP POPUP
     ======================================================== */

  const handleSignUp = () => {
    closeMenus();

    if (isAuthenticated) {
      return;
    }

    openRegister();
  };

  /* ========================================================
     MOBILE SEARCH
     ======================================================== */

  const toggleSearch = () => {
    setSearchPanel({
      pathname,
      open: !searchOpen,
    });

    setMobilePanel({
      pathname,
      open: false,
    });
  };

  /* ========================================================
     MOBILE MENU
     ======================================================== */

  const toggleMobileMenu = () => {
    setMobilePanel({
      pathname,
      open: !mobileOpen,
    });

    setSearchPanel({
      pathname,
      open: false,
    });
  };

  /* ========================================================
     ESCAPE KEY
     ======================================================== */

  useEffect(() => {
    if (!mobileOpen && !searchOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const wasSearchOpen = searchOpen;

      setMobilePanel({
        pathname,
        open: false,
      });

      setSearchPanel({
        pathname,
        open: false,
      });

      if (wasSearchOpen) {
        searchButtonRef.current?.focus();
      } else {
        mobileMenuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [mobileOpen, searchOpen, pathname]);

  /* ========================================================
     FOCUS MOBILE SEARCH
     ======================================================== */

  useEffect(() => {
    if (searchOpen) {
      mobileSearchRef.current?.focus();
    }
  }, [searchOpen]);

  /* ========================================================
     SEARCH SUBMIT
     ======================================================== */

  const handleSearchSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const query = searchQuery.trim();

    closeMenus();

    if (query) {
      router.push(
        `/events?q=${encodeURIComponent(query)}`
      );
    } else {
      router.push("/events");
    }
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 px-3 py-3 backdrop-blur-xl sm:px-5 lg:px-6 lg:py-3.5">

      <div className="mx-auto w-full max-w-[1900px]">

        {/* ==============================================
            MAIN HEADER CONTAINER
            ============================================== */}

        <div className="relative overflow-visible rounded-[20px] border border-[#f1e8dc] bg-white shadow-[0_8px_35px_rgba(89,56,17,0.07)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(89,56,17,0.09)] lg:rounded-[22px]">

          {/* ============================================
              MAIN HEADER ROW
              ============================================ */}

          <div className="flex min-h-17.5 w-full min-w-0 items-center justify-between gap-3 px-4 sm:min-h-19.5 sm:px-6 lg:min-h-21 lg:gap-4 lg:px-7 xl:gap-3 xl:px-6 2xl:min-h-22.5 2xl:gap-6 2xl:px-9">

            {/* ========================================
                ORIGINAL TAMIL LOGO
                ======================================== */}

            <Link
              href="/"
              aria-label="Vizha Tickets - Home"
              onClick={handleNavigation}
              className="group relative flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#ef8500] focus-visible:ring-offset-4"
            >
              <Image
                src="/images/branding/vizha-logo.png"
                alt="Vizha Tickets"
                width={260}
                height={82}
                priority
                sizes="(max-width: 640px) 170px, (max-width: 1280px) 210px, 240px"
                className="h-auto w-38.75 object-contain transition-transform duration-300 ease-out group-hover:scale-[1.025] sm:w-46.25 lg:w-52.5 xl:w-48.75 2xl:w-58.75 motion-reduce:transform-none"
              />
            </Link>

            {/* ========================================
                DESKTOP NAVIGATION
                ======================================== */}

            <nav
              aria-label="Main navigation"
              className="hidden min-w-0 flex-1 items-stretch justify-center self-stretch xl:flex"
            >
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavigation}
                    aria-current={
                      active ? "page" : undefined
                    }
                    className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1.75 rounded-t-xl px-2 outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ef8500] 2xl:max-w-28.75 2xl:px-3 ${
                      active
                        ? "text-[#df7500]"
                        : "text-[#292929] hover:text-[#e67b00]"
                    }`}
                  >

                    {/* HOVER BACKGROUND */}

                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-1.5 bottom-2 top-2 rounded-xl bg-linear-to-b from-[#fff8ee] to-transparent transition-opacity duration-300 ${
                        active
                          ? "opacity-50"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    />

                    {/* ICON */}

                    <Icon
                      size={21}
                      strokeWidth={active ? 2.2 : 1.8}
                      aria-hidden="true"
                      className="relative z-10 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                    />

                    {/* LABEL */}

                    <span
                      className={`relative z-10 whitespace-nowrap text-[12px] tracking-[0.01em] 2xl:text-[13px] ${
                        active
                          ? "font-bold"
                          : "font-medium"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* ACTIVE / HOVER UNDERLINE */}

                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 left-1/2 h-0.75 -translate-x-1/2 rounded-t-full bg-linear-to-r from-[#ff9d16] via-[#ef8000] to-[#e66800] transition-all duration-300 ${
                        active
                          ? "w-[60%] opacity-100"
                          : "w-0 opacity-0 group-hover:w-[60%] group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* ========================================
                DESKTOP SEARCH
                ======================================== */}

            <form
              role="search"
              onSubmit={handleSearchSubmit}
              className="hidden min-w-0 flex-1 xl:block xl:max-w-55 2xl:max-w-82.5"
            >
              <div className="group relative">

                <Search
                  size={19}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#e87a00] transition-colors duration-200 group-focus-within:text-[#c95b00]"
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search events, artists, cities..."
                  aria-label="Search events, artists, or cities"
                  className="h-11.5 w-full rounded-full border border-[#f0e6db] bg-[#faf8f5] pl-11 pr-4 text-[12px] font-medium text-[#282828] outline-none transition-all duration-300 placeholder:font-normal placeholder:text-[#909090] hover:border-[#e7c7a1] hover:bg-white focus:border-[#ed9a37] focus:bg-white focus:shadow-[0_0_0_4px_rgba(245,130,0,0.08)] 2xl:h-12 2xl:text-[13px]"
                />
              </div>
            </form>

            {/* ========================================
                DESKTOP AUTHENTICATION
                ======================================== */}

            <div className="hidden shrink-0 items-center gap-2 xl:flex 2xl:gap-3">

              {/* LOGGED IN CUSTOMER */}

              {isAuthenticated && customer && (
                <CustomerMenu customer={customer} />
              )}

              {/* ======================================
                  SIGN IN POPUP BUTTON
                  ====================================== */}

              {showAuthButtons && (
                <button
                  type="button"
                  onClick={handleSignIn}
                  aria-label="Open Sign In popup"
                  aria-haspopup="dialog"
                  className="group inline-flex h-11.5 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#f1d2af] bg-white px-3 text-[12px] font-semibold text-[#262626] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[#eb8e21] hover:bg-[#fff8ef] hover:shadow-[0_5px_15px_rgba(232,122,0,0.09)] focus-visible:ring-2 focus-visible:ring-[#f58200] focus-visible:ring-offset-2 2xl:h-12 2xl:px-5 2xl:text-[13px] motion-reduce:transform-none"
                >
                  <UserRound
                    size={17}
                    strokeWidth={1.9}
                    aria-hidden="true"
                    className="text-[#ed7c00] transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none"
                  />

                  <span>Sign In</span>
                </button>
              )}

              {/* ======================================
                  SIGN UP POPUP BUTTON
                  ====================================== */}

              {showAuthButtons && (
                <button
                  type="button"
                  onClick={handleSignUp}
                  aria-label="Open Sign Up popup"
                  aria-haspopup="dialog"
                  className="group relative inline-flex h-11.5 cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full bg-linear-to-r from-[#ff9500] via-[#f48200] to-[#e96c00] px-4 text-[12px] font-bold text-white shadow-[0_5px_16px_rgba(242,124,0,0.17)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(242,124,0,0.25)] focus-visible:ring-2 focus-visible:ring-[#f58200] focus-visible:ring-offset-2 2xl:h-12 2xl:px-6 2xl:text-[13px] motion-reduce:transform-none"
                >

                  {/* BUTTON SHINE */}

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:transform-none"
                  />

                  <span className="relative z-10">
                    Sign Up
                  </span>

                  <ArrowRight
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                  />
                </button>
              )}
            </div>

            {/* ========================================
                MOBILE / TABLET CONTROLS
                ======================================== */}

            <div className="flex shrink-0 items-center gap-2 xl:hidden">

              {/* MOBILE SEARCH BUTTON */}

              <button
                ref={searchButtonRef}
                type="button"
                aria-label={
                  searchOpen
                    ? "Close search"
                    : "Open search"
                }
                aria-expanded={searchOpen}
                aria-controls="vizha-responsive-search"
                onClick={toggleSearch}
                className={`inline-flex h-10.5 w-10.5 cursor-pointer items-center justify-center rounded-full border outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#f58200] ${
                  searchOpen
                    ? "border-[#f5d7b2] bg-[#fff0df] text-[#dc7300]"
                    : "border-transparent bg-[#faf8f5] text-[#393939] hover:border-[#f4dfc6] hover:bg-[#fff3e6] hover:text-[#e67a00]"
                }`}
              >
                {searchOpen ? (
                  <X
                    size={21}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                ) : (
                  <Search
                    size={21}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* MOBILE MENU BUTTON */}

              <button
                ref={mobileMenuButtonRef}
                type="button"
                aria-label={
                  mobileOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-expanded={mobileOpen}
                aria-controls="vizha-mobile-navigation"
                onClick={toggleMobileMenu}
                className={`inline-flex h-10.5 w-10.5 cursor-pointer items-center justify-center rounded-xl border outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#f58200] ${
                  mobileOpen
                    ? "border-[#f4d4ae] bg-[#fff0df] text-[#df7300]"
                    : "border-[#f0e5d9] bg-white text-[#242424] hover:border-[#edaa5f] hover:bg-[#fff8ef]"
                }`}
              >
                {mobileOpen ? (
                  <X
                    size={23}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                ) : (
                  <Menu
                    size={23}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>

          {/* ============================================
              MOBILE SEARCH PANEL
              ============================================ */}

          <div
            id="vizha-responsive-search"
            aria-hidden={!searchOpen}
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out xl:hidden ${
              searchOpen
                ? "grid-rows-[1fr]"
                : "grid-rows-[0fr]"
            }`}
          >
            <div className="min-h-0 overflow-hidden">

              {searchOpen && (
                <div className="border-t border-[#f3e9de] bg-[#fffdfa] px-4 py-4 sm:px-6">

                  <form
                    role="search"
                    onSubmit={handleSearchSubmit}
                    className="relative flex items-center rounded-full border border-[#eee2d5] bg-white p-1.5 shadow-[0_3px_15px_rgba(50,30,10,0.04)] focus-within:border-[#ed9a37] focus-within:ring-4 focus-within:ring-[#f58200]/10"
                  >
                    <Search
                      size={20}
                      aria-hidden="true"
                      className="ml-3 shrink-0 text-[#e87a00]"
                    />

                    <input
                      ref={mobileSearchRef}
                      type="search"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.target.value)
                      }
                      aria-label="Search events, artists, or cities"
                      placeholder="Search events, artists, cities..."
                      className="h-10 min-w-0 flex-1 bg-transparent px-3 text-[13px] text-[#292929] outline-none placeholder:text-[#999]"
                    />

                    <button
                      type="submit"
                      className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-linear-to-r from-[#fa9200] to-[#e87500] px-4 text-xs font-bold text-white transition-all duration-300 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e87500] sm:px-6"
                    >
                      Search
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* ============================================
              MOBILE / TABLET NAVIGATION
              ============================================ */}

          <div
            id="vizha-mobile-navigation"
            aria-hidden={!mobileOpen}
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out xl:hidden ${
              mobileOpen
                ? "grid-rows-[1fr]"
                : "grid-rows-[0fr]"
            }`}
          >
            <div className="min-h-0 overflow-visible">

              {mobileOpen && (
                <div className="border-t border-[#f1e8dd] bg-linear-to-b from-white to-[#fffdf9] px-4 pb-5 pt-4 sm:px-6">

                  {/* MOBILE NAVIGATION LINKS */}

                  <nav
                    aria-label="Mobile navigation"
                    className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                  >
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleNavigation}
                          aria-current={
                            active ? "page" : undefined
                          }
                          className={`group flex min-h-13.5 items-center gap-3 rounded-xl border px-3 py-3 text-[13px] outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#f58200] ${
                            active
                              ? "border-[#f6dfc1] bg-[#fff1df] font-bold text-[#df7600]"
                              : "border-transparent bg-[#faf8f5] font-medium text-[#333] hover:border-[#f2dfc6] hover:bg-[#fff5e9] hover:text-[#e27700]"
                          }`}
                        >
                          <Icon
                            size={19}
                            strokeWidth={active ? 2.2 : 1.8}
                            aria-hidden="true"
                            className="shrink-0 transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none"
                          />

                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* ==================================
                      MOBILE CUSTOMER PROFILE
                      ================================== */}

                  {isAuthenticated && customer && (
                    <div className="mt-5 border-t border-[#f0e7dc] pt-4">
                      <CustomerMenu
                        customer={customer}
                        mobile
                        onNavigate={handleNavigation}
                      />
                    </div>
                  )}

                  {/* ==================================
                      MOBILE AUTH POPUP BUTTONS
                      ================================== */}

                  {showAuthButtons && (
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#f0e7dc] pt-5">

                      {/* MOBILE SIGN IN */}

                      <button
                        type="button"
                        onClick={handleSignIn}
                        aria-label="Open Sign In popup"
                        aria-haspopup="dialog"
                        className="group inline-flex h-11.5 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#f1cda2] bg-white text-[13px] font-bold text-[#272727] outline-none transition-all duration-300 hover:border-[#e88513] hover:bg-[#fff8ef] hover:shadow-[0_5px_15px_rgba(232,122,0,0.09)] focus-visible:ring-2 focus-visible:ring-[#f58200]"
                      >
                        <UserRound
                          size={18}
                          aria-hidden="true"
                          className="text-[#e98000]"
                        />

                        Sign In
                      </button>

                      {/* MOBILE SIGN UP */}

                      <button
                        type="button"
                        onClick={handleSignUp}
                        aria-label="Open Sign Up popup"
                        aria-haspopup="dialog"
                        className="group relative inline-flex h-11.5 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-[#ff9500] to-[#e87500] text-[13px] font-bold text-white shadow-[0_5px_16px_rgba(242,124,0,0.16)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(242,124,0,0.25)] focus-visible:ring-2 focus-visible:ring-[#f58200] focus-visible:ring-offset-2 motion-reduce:transform-none"
                      >

                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:transform-none"
                        />

                        <span className="relative z-10">
                          Sign Up
                        </span>

                        <ArrowRight
                          size={17}
                          aria-hidden="true"
                          className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
