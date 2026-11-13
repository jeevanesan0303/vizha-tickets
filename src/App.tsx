
import {
  useEffect,
  type ReactNode,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

/* ==========================================================
   VIZHATICKETS — MAIN APPLICATION ROUTER

   React + Vite + TypeScript + React Router

   UPDATED:
   ----------------------------------------------------------
   - Added global LocationProvider
   - Location available throughout website
   - Selected location can persist on refresh
   - Preserved all existing application routes
   - Preserved authentication modal
   - Preserved customer route protection
   - Preserved checkout and booking confirmation
   - Preserved My Tickets and My Bookings
   - Preserved organizer and contact forms
   - Preserved automatic scroll to top

   ========================================================== */

/* ==========================================================
   WEBSITE PAGES
   ========================================================== */

import HomePage from "./pages/HomePage";

import AboutPage from "./pages/AboutPage";

import EventsPage from "./pages/EventsPage";

import EventDetailsPage from "./pages/EventDetailsPage";

import CategoriesPage from "./pages/CategoriesPage";

import CategoryDetailPage from "./pages/CategoryDetailPage";

/* ==========================================================
   CONTACT AND ORGANIZER REQUEST

   Both paths use the consolidated enquiry form.
   ========================================================== */

import OrganizerRequestPage from "./pages/OrganizerRequestPage";

/* ==========================================================
   AUTHENTICATION PAGES
   ========================================================== */

import LoginPage from "./pages/LoginPage";

import RegisterPage from "./pages/RegisterPage";

import ForgotPasswordPage from "./pages/ForgotPasswordPage";

/* ==========================================================
   CUSTOMER ACCOUNT PAGES
   ========================================================== */

import CustomerDashboard from "./pages/CustomerDashboard";

import MyTicketsPage from "./pages/MyTicketsPage";

import MyBookingsPage from "./pages/MyBookingsPage";

/* ==========================================================
   BOOKING PAGES
   ========================================================== */

import CheckoutPage from "./pages/CheckoutPage";

import BookingSuccessPage from "./pages/BookingSuccessPage";

/* ==========================================================
   CUSTOMER SESSION
   ========================================================== */

import {
  useCustomerSession,
} from "./lib/customerSession";

/* ==========================================================
   GLOBAL AUTHENTICATION MODAL
   ========================================================== */

import {
  AuthModalProvider,
} from "./contexts/AuthModalContext";

import AuthModal from "./components/auth/AuthModal";

/* ==========================================================
   NEW — GLOBAL LOCATION CONTEXT

   Makes the selected country or city available to:
   - HeroSection
   - UpcomingEvents
   - EventsPage
   - Other location-based components
   ========================================================== */

import {
  LocationProvider,
} from "./contexts/LocationContext";

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

   Protects customer account pages:
   - Profile
   - My Tickets
   - My Bookings

   This protects the frontend demo interface.
   Real production authentication and authorization
   must also be enforced by the backend.
   ========================================================== */

interface CustomerRouteProps {
  children: ReactNode;
}

function CustomerRoute({
  children,
}: CustomerRouteProps) {
  const { isAuthenticated } =
    useCustomerSession();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <>{children}</>;
}

/* ==========================================================
   CONTACT AND ORGANIZER REQUEST ROUTE

   Both routes share OrganizerRequestPage.

   Pathname is used as a key so navigating between
   /contact and /organizer-request resets the form.
   ========================================================== */

function EnquiryPageRoute() {
  const { pathname } = useLocation();

  return (
    <OrganizerRequestPage
      key={pathname}
    />
  );
}

/* ==========================================================
   APPLICATION ROUTES
   ========================================================== */

function AppRoutes() {
  return (
    <Routes>
      {/* ====================================================
          HOME PAGE
          ==================================================== */}

      <Route
        path="/"
        element={<HomePage />}
      />

      {/* ====================================================
          ABOUT US
          ==================================================== */}

      <Route
        path="/about"
        element={<AboutPage />}
      />

      {/* ====================================================
          EVENTS LISTING
          ==================================================== */}

      <Route
        path="/events"
        element={<EventsPage />}
      />

      {/* ====================================================
          INDIVIDUAL EVENT DETAILS
          ==================================================== */}

      <Route
        path="/events/:slug"
        element={<EventDetailsPage />}
      />

      {/* LEGACY EVENT DETAIL ROUTE */}

      <Route
        path="/event/:slug"
        element={<EventDetailsPage />}
      />

      {/* ====================================================
          CATEGORIES
          ==================================================== */}

      <Route
        path="/categories"
        element={<CategoriesPage />}
      />

      {/* CATEGORY DETAILS */}

      <Route
        path="/categories/:slug"
        element={<CategoryDetailPage />}
      />

      {/* ====================================================
          CONTACT US

          Uses the new consolidated enquiry form.
          ==================================================== */}

      <Route
        path="/contact"
        element={<EnquiryPageRoute />}
      />

      {/* ====================================================
          ORGANIZER REQUEST

          Public form.
          Organizer login is not required.
          ==================================================== */}

      <Route
        path="/organizer-request"
        element={<EnquiryPageRoute />}
      />

      {/* ====================================================
          LOGIN
          ==================================================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* ====================================================
          REGISTER
          ==================================================== */}

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      {/* ====================================================
          FORGOT PASSWORD
          ==================================================== */}

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      {/* ====================================================
          CUSTOMER PROFILE / DASHBOARD
          ==================================================== */}

      <Route
        path="/profile"
        element={
          <CustomerRoute>
            <CustomerDashboard />
          </CustomerRoute>
        }
      />

      {/* DASHBOARD ALIAS */}

      <Route
        path="/dashboard"
        element={
          <Navigate
            to="/profile"
            replace
          />
        }
      />

      {/* ====================================================
          MY TICKETS
          ==================================================== */}

      <Route
        path="/my-tickets"
        element={
          <CustomerRoute>
            <MyTicketsPage />
          </CustomerRoute>
        }
      />

      {/* ====================================================
          MY BOOKINGS
          ==================================================== */}

      <Route
        path="/my-bookings"
        element={
          <CustomerRoute>
            <MyBookingsPage />
          </CustomerRoute>
        }
      />

      {/* ====================================================
          CHECKOUT

          Ticket selection, venue/seat selection,
          attendee information, and demo payment.
          ==================================================== */}

      <Route
        path="/checkout"
        element={<CheckoutPage />}
      />

      {/* ====================================================
          BOOKING SUCCESS

          Booking details and demo group QR.
          ==================================================== */}

      <Route
        path="/booking-success"
        element={<BookingSuccessPage />}
      />

      {/* ====================================================
          FALLBACK
          ==================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

/* ==========================================================
   MAIN APPLICATION

   PROVIDER STRUCTURE:

   BrowserRouter
     └── LocationProvider
           └── AuthModalProvider
                 ├── ScrollToTop
                 ├── AppRoutes
                 └── AuthModal

   ========================================================== */

export default function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <AuthModalProvider>
          {/* RESET SCROLL ON PAGE NAVIGATION */}

          <ScrollToTop />

          {/* ALL WEBSITE ROUTES */}

          <AppRoutes />

          {/* GLOBAL LOGIN AND REGISTER MODALS */}

          <AuthModal />
        </AuthModalProvider>
      </LocationProvider>
    </BrowserRouter>
  );
}
