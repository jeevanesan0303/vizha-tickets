
import { useEffect, type ReactNode } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useParams,
  Navigate,
  Link,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
} from "lucide-react";

/* ==========================================================
   VIZHATICKETS — MAIN APPLICATION ROUTER
   React + Vite + TypeScript + React Router
   ========================================================== */

/* EXISTING WEBSITE PAGES */

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import EventsPage from "./pages/EventsPage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import ContactPage from "./pages/ContactPage";

/* CUSTOMER ACCOUNT PAGES */

import CustomerDashboard from "./pages/CustomerDashboard";
import MyTicketsPage from "./pages/MyTicketsPage";
import MyBookingsPage from "./pages/MyBookingsPage";

/* EVENT DATA */

import { events } from "./data/events";
import EventDetailsPage from "./pages/EventDetailsPage";
/* SHARED LAYOUT */

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

/* CUSTOMER SESSION */

import { useCustomerSession } from "./lib/customerSession";

/* GLOBAL AUTHENTICATION POPUP */

import { AuthModalProvider } from "./contexts/AuthModalContext";
import AuthModal from "./components/auth/AuthModal";

/* ==========================================================
   SCROLL TO TOP ON ROUTE CHANGE
   ========================================================== */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

/* ==========================================================
   CUSTOMER ROUTE GUARD
   Frontend demo protection only
   ========================================================== */

function CustomerRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated } = useCustomerSession();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/* ==========================================================
   EVENT DETAILS PAGE

   Reads the slug directly from React Router.

   This component is intentionally included here
   so the project does not require a missing import.

   A dedicated EventDetailsPage.tsx can replace
   this component later without changing the route.
   ========================================================== */

function EventDetailsRoute() {
  const { slug } = useParams<{ slug: string }>();

  const event = events.find(
    (item) => item.slug === slug
  );

  /* EVENT NOT FOUND */

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fffaf2]">
        <Header />

        <main className="mx-auto flex w-full max-w-170 flex-1 flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-19 w-19 items-center justify-center rounded-2xl bg-[#fff0d9] text-[#c9790b]">
            <Ticket size={36} />
          </div>

          <h1 className="mt-6 font-serif text-3xl font-bold text-[#241b14]">
            Event Not Found
          </h1>

          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#827365]">
            This event could not be found. It may have
            been removed or the event link may be incorrect.
          </p>

          <Link
            to="/events"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#c9790b] px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#a96308]"
          >
            <ArrowLeft size={17} />
            Back to Events
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  const checkoutUrl =
    `/checkout?event=${encodeURIComponent(event.slug)}`;

  const formattedPrice =
    `${event.currency} ${event.price.toLocaleString("en-LK")}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf2] text-[#211b15]">
      <Header />

      <main className="flex-1">

        {/* BREADCRUMB */}

        <div className="border-b border-[#eee5da] bg-white">
          <div className="vizha-container flex min-h-14.5 items-center gap-3 text-[12px]">

            <Link
              to="/events"
              className="inline-flex items-center gap-2 font-semibold text-[#b36b10] hover:text-[#d78512]"
            >
              <ArrowLeft size={15} />
              All Events
            </Link>

            <span className="text-[#b1a294]">/</span>

            <span className="truncate font-medium text-[#605449]">
              {event.title}
            </span>
          </div>
        </div>

        {/* EVENT DETAILS */}

        <section className="py-8 sm:py-12">
          <div className="vizha-container">

            <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_0.75fr] lg:gap-10">

              {/* LEFT CONTENT */}

              <div className="min-w-0">

                {/* EVENT IMAGE */}

                <div className="relative aspect-video overflow-hidden rounded-3xl border border-[#eee2d4] bg-[#f4ece0] shadow-[0_12px_32px_rgba(92,57,22,0.1)]">

                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/95 px-4 py-2 text-[11px] font-bold text-[#b97212] shadow-sm">
                    {event.category}
                  </div>
                </div>

                {/* EVENT HEADING */}

                <div className="mt-7">

                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#c9790b]">
                    Discover Your Next Experience
                  </p>

                  <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-tight">
                    {event.title}
                  </h1>

                  {/* EVENT INFORMATION */}

                  <div className="mt-6 grid gap-4 rounded-[20px] border border-[#eee3d7] bg-white p-5 sm:grid-cols-2 sm:p-6">

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1dc] text-[#c9790b]">
                        <CalendarDays size={19} />
                      </div>

                      <div>
                        <p className="text-[11px] text-[#8b7d70]">
                          Event Date
                        </p>

                        <p className="mt-1 text-[13px] font-bold">
                          {event.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1dc] text-[#c9790b]">
                        <Clock3 size={19} />
                      </div>

                      <div>
                        <p className="text-[11px] text-[#8b7d70]">
                          Event Time
                        </p>

                        <p className="mt-1 text-[13px] font-bold">
                          {event.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 sm:col-span-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1dc] text-[#c9790b]">
                        <MapPin size={19} />
                      </div>

                      <div>
                        <p className="text-[11px] text-[#8b7d70]">
                          Venue & Location
                        </p>

                        <p className="mt-1 text-[13px] font-bold">
                          {event.venue}
                        </p>

                        <p className="mt-1 text-[12px] text-[#837365]">
                          {event.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}

                  <div className="mt-8">
                    <h2 className="font-serif text-[23px] font-bold">
                      About This Event
                    </h2>

                    <p className="mt-4 whitespace-pre-line text-[14px] leading-[1.9] text-[#706456]">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT BOOKING PANEL */}

              <aside className="lg:sticky lg:top-27.5">

                <div className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-[0_15px_40px_rgba(92,57,22,0.09)]">

                  {/* PANEL HEADER */}

                  <div className="border-b border-[#f0e5d8] bg-linear-to-r from-[#fff5e5] to-[#fffaf3] px-6 py-5">
                    <h2 className="text-[18px] font-bold">
                      Book Your Experience
                    </h2>

                    <p className="mt-1 text-[12px] text-[#857465]">
                      Select your tickets and continue.
                    </p>
                  </div>

                  <div className="p-6">

                    <p className="text-[12px] text-[#857465]">
                      Ticket prices from
                    </p>

                    <p className="mt-2 text-[30px] font-extrabold text-[#c9790b]">
                      {formattedPrice}
                    </p>

                    <p className="mt-2 text-[11px] text-[#908173]">
                      Additional ticket tiers and the
                      service fee are shown at checkout.
                    </p>

                    <div className="my-6 border-t border-[#f0e5d8]" />

                    <div className="flex items-center justify-between gap-3 text-[12px]">

                      <span className="text-[#776a5e]">
                        Available ticket categories
                      </span>

                      <span className="font-bold text-[#29211a]">
                        Standard / Gold / VIP
                      </span>
                    </div>

                    <Link
                      to={checkoutUrl}
                      className="group mt-7 flex min-h-12.25 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#f4a018] to-[#de7700] px-5 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(201,121,11,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <Ticket size={18} />

                      Select Tickets

                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>

                    <p className="mt-4 text-center text-[11px] leading-relaxed text-[#8a7b6d]">
                      Checkout currently uses demo bookings.
                      No real payment is collected.
                    </p>
                  </div>
                </div>

                <Link
                  to="/events"
                  className="mt-5 flex items-center justify-center gap-2 text-[12px] font-semibold text-[#a76b20] hover:text-[#d38212]"
                >
                  <ArrowLeft size={15} />
                  Explore More Events
                </Link>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ==========================================================
   APPLICATION ROUTES
   ========================================================== */

function AppRoutes() {
  return (
    <Routes>

      {/* HOME */}

      <Route
        path="/"
        element={<HomePage />}
      />

      {/* ABOUT */}

      <Route
        path="/about"
        element={<AboutPage />}
      />

      {/* EVENTS LISTING */}

      <Route
        path="/events"
        element={<EventsPage />}
      />

      {/* INDIVIDUAL EVENT DETAILS — FIXED */}

      <Route
  path="/events/:slug"
  element={<EventDetailsPage />}
/>

<Route
  path="/event/:slug"
  element={<EventDetailsPage />}
/>

      {/* CATEGORY PAGES */}

      <Route
        path="/categories"
        element={<CategoriesPage />}
      />

      <Route
        path="/categories/:slug"
        element={<CategoryDetailPage />}
      />

      {/* CONTACT */}

      <Route
        path="/contact"
        element={<ContactPage />}
      />

      {/* AUTHENTICATION PAGES */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      {/* CUSTOMER PROFILE */}

      <Route
        path="/profile"
        element={
          <CustomerRoute>
            <CustomerDashboard />
          </CustomerRoute>
        }
      />

      {/* CUSTOMER TICKETS */}

      <Route
        path="/my-tickets"
        element={
          <CustomerRoute>
            <MyTicketsPage />
          </CustomerRoute>
        }
      />

      {/* CUSTOMER BOOKINGS */}

      <Route
        path="/my-bookings"
        element={
          <CustomerRoute>
            <MyBookingsPage />
          </CustomerRoute>
        }
      />

      {/* CHECKOUT */}

      <Route
        path="/checkout"
        element={<CheckoutPage />}
      />

      {/* BOOKING CONFIRMATION */}

      <Route
        path="/booking-success"
        element={<BookingSuccessPage />}
      />

      {/* UNKNOWN ROUTES */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

/* ==========================================================
   MAIN APPLICATION
   ========================================================== */

export default function App() {
  return (
    <BrowserRouter>
      <AuthModalProvider>

        <ScrollToTop />

        <AppRoutes />

        <AuthModal />

      </AuthModalProvider>
    </BrowserRouter>
  );
}
