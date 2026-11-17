
import {
  lazy,
  Suspense,
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

   FEATURES:
   ----------------------------------------------------------
   - Existing customer website preserved
   - Existing customer login / register preserved
   - Global location filtering preserved
   - Event listing and event details preserved
   - Category routes preserved
   - Organizer request form preserved
   - Customer account routes preserved
   - My Tickets and My Bookings preserved
   - Checkout and booking success preserved
   - Development-only Admin Dashboard
   - AdminGuard integrated
   - Shared login interface for customer and admin
   - Automatic scroll to top
   - Global authentication modal preserved

   SECURITY:
   ----------------------------------------------------------
   Admin preview access is available ONLY in Vite
   development mode.

   AdminGuard checks the mock administrator session.

   Frontend session checks are NOT real security.

   Production authorization will require backend
   authentication and role verification.

   ========================================================== */

/* ==========================================================
   PUBLIC WEBSITE PAGES
   ========================================================== */

import HomePage from "./pages/HomePage";

import AboutPage from "./pages/AboutPage";

import EventsPage from "./pages/EventsPage";

import EventDetailsPage from "./pages/EventDetailsPage";

import CategoriesPage from "./pages/CategoriesPage";

import CategoryDetailPage from "./pages/CategoryDetailPage";

/* ==========================================================
   CONTACT AND ORGANIZER REQUEST
   ========================================================== */

import OrganizerRequestPage from "./pages/OrganizerRequestPage";

/* ==========================================================
   CUSTOMER AUTHENTICATION PAGES
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
   GLOBAL LOCATION CONTEXT
   ========================================================== */

import {
  LocationProvider,
} from "./contexts/LocationContext";

/* ==========================================================
   ADMIN ROUTE GUARD

   Checks the development administrator preview session.

   The existing customer session must NOT be used
   to authorize administrator dashboard access.

   ========================================================== */

import AdminGuard from "./admin/AdminGuard";

/* ==========================================================
   ADMIN DASHBOARD — DEVELOPMENT ONLY

   Lazy loading keeps the Admin Dashboard separate
   from normal public website navigation.

   This preview is not registered in production.

   ========================================================== */

const AdminApp = import.meta.env.DEV
  ? lazy(() => import("./admin/AdminApp"))
  : null;

/* ==========================================================
   SCROLL TO TOP

   Runs whenever the URL pathname changes.

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

   Used for:
   - /profile
   - /my-tickets
   - /my-bookings

   Existing customer session behavior is preserved.

   This is frontend demo protection only.

   ========================================================== */

interface CustomerRouteProps {
  children: ReactNode;
}

function CustomerRoute({
  children,
}: CustomerRouteProps) {
  const {
    isAuthenticated,
  } = useCustomerSession();

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
   CONTACT / ORGANIZER ENQUIRY ROUTE

   Both routes use OrganizerRequestPage.

   The pathname is passed as the component key to
   reset the enquiry form when changing routes.

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
   ADMIN PREVIEW ROUTE

   This component loads AdminApp.

   Authentication is handled by the AdminGuard
   wrapping this component in AppRoutes.

   IMPORTANT:
   The development admin session is not suitable
   for real production authorization.

   ========================================================== */

function AdminPreviewRoute() {
  /* ================================================
     BLOCK ADMIN PREVIEW OUTSIDE DEVELOPMENT
     ================================================ */

  if (
    !import.meta.env.DEV ||
    AdminApp === null
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* ================================================
     LOAD ADMIN DASHBOARD
     ================================================ */

  return (
    <Suspense
      fallback={
        <div
          className="
            flex
            min-h-screen
            w-full
            flex-col
            items-center
            justify-center
            gap-4
            bg-[#f6f8fb]
            px-6
            text-center
          "
        >
          {/* LOADING SPINNER */}

          <div
            className="
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-[#f0dfc9]
              border-t-[#c9790b]
            "
          />

          {/* LOADING MESSAGE */}

          <div>
            <h2
              className="
                text-lg
                font-bold
                text-[#252b35]
              "
            >
              VizhaTickets Admin
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-[#86909e]
              "
            >
              Loading dashboard...
            </p>
          </div>
        </div>
      }
    >
      <AdminApp />
    </Suspense>
  );
}

/* ==========================================================
   MAIN WEBSITE ROUTES
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
          ABOUT PAGE
          ==================================================== */}

      <Route
        path="/about"
        element={<AboutPage />}
      />

      {/* ====================================================
          EVENTS LISTING

          Supports global country/city filtering.
          ==================================================== */}

      <Route
        path="/events"
        element={<EventsPage />}
      />

      {/* ====================================================
          EVENT DETAILS
          ==================================================== */}

      <Route
        path="/events/:slug"
        element={<EventDetailsPage />}
      />

      {/* LEGACY EVENT DETAILS ROUTE */}

      <Route
        path="/event/:slug"
        element={<EventDetailsPage />}
      />

      {/* ====================================================
          EVENT CATEGORIES
          ==================================================== */}

      <Route
        path="/categories"
        element={<CategoriesPage />}
      />

      {/* ====================================================
          INDIVIDUAL CATEGORY
          ==================================================== */}

      <Route
        path="/categories/:slug"
        element={<CategoryDetailPage />}
      />

      {/* ====================================================
          CONTACT US

          Uses the existing combined enquiry form.
          ==================================================== */}

      <Route
        path="/contact"
        element={<EnquiryPageRoute />}
      />

      {/* ====================================================
          ORGANIZER REQUEST

          Public enquiry submission.
          Organizer login is not required.
          ==================================================== */}

      <Route
        path="/organizer-request"
        element={<EnquiryPageRoute />}
      />

      {/* ====================================================
          CUSTOMER LOGIN PAGE

          Existing login page preserved.

          The shared modal also handles development
          administrator preview sign-in.
          ==================================================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* ====================================================
          CUSTOMER REGISTRATION
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
          CUSTOMER PROFILE

          Customer authentication required.
          ==================================================== */}

      <Route
        path="/profile"
        element={
          <CustomerRoute>
            <CustomerDashboard />
          </CustomerRoute>
        }
      />

      {/* ====================================================
          CUSTOMER DASHBOARD ALIAS

          /dashboard -> /profile
          ==================================================== */}

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

          Customer authentication required.
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

          Customer authentication required.
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

          Existing ticket booking flow preserved.

          Customer sign-in requirements are handled
          by the existing checkout components.
          ==================================================== */}

      <Route
        path="/checkout"
        element={<CheckoutPage />}
      />

      {/* ====================================================
          BOOKING SUCCESS

          Booking confirmation and group QR display.
          ==================================================== */}

      <Route
        path="/booking-success"
        element={<BookingSuccessPage />}
      />

      {/* ====================================================
          ADMIN DASHBOARD

          DEVELOPMENT MODE ONLY

          The shared LoginModal verifies the fictional
          development administrator credentials and
          starts a demo admin preview session.

          AdminGuard then checks that session.

          If the session is missing or expired,
          the visitor is redirected to the homepage.

          No separate admin login page is required.

          ==================================================== */}

      {import.meta.env.DEV && (
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminPreviewRoute />
            </AdminGuard>
          }
        />
      )}

      {/* ====================================================
          FALLBACK ROUTE

          Unknown URLs return to the homepage.

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
     |
     +-- LocationProvider
           |
           +-- AuthModalProvider
                 |
                 +-- ScrollToTop
                 |
                 +-- AppRoutes
                 |     |
                 |     +-- Public Pages
                 |     +-- Customer Pages
                 |     +-- AdminGuard
                 |           |
                 |           +-- Admin Dashboard
                 |
                 +-- AuthModal

   ========================================================== */

export default function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <AuthModalProvider>
          {/* AUTOMATIC SCROLL RESTORATION */}

          <ScrollToTop />

          {/* CUSTOMER / ADMIN APPLICATION ROUTES */}

          <AppRoutes />

          {/* SHARED LOGIN AND REGISTRATION MODALS */}

          <AuthModal />
        </AuthModalProvider>
      </LocationProvider>
    </BrowserRouter>
  );
}
