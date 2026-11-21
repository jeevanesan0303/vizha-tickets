
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
   LEGAL & POLICY PAGES

   Existing files:
   src/pages/TermsPage.tsx
   src/pages/PrivacyPolicyPage.tsx

   These pages are lazy-loaded.
   ========================================================== */

const TermsPage = lazy(
  () => import("./pages/TermsPage")
);

const PrivacyPolicyPage = lazy(
  () => import("./pages/PrivacyPolicyPage")
);

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
   ========================================================== */

import AdminGuard from "./admin/AdminGuard";

/* ==========================================================
   ADMIN DASHBOARD — DEVELOPMENT ONLY
   ========================================================== */

const AdminApp = import.meta.env.DEV
  ? lazy(() => import("./admin/AdminApp"))
  : null;

/* ==========================================================
   SHARED PAGE LOADING COMPONENT
   ========================================================== */

function PageLoading({
  title = "VizhaTickets",
  message = "Loading page...",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div
      className="
        flex min-h-screen w-full
        flex-col items-center
        justify-center gap-4
        bg-[#fffaf2] px-6
        text-center
      "
    >
      <div
        className="
          h-10 w-10 animate-spin
          rounded-full border-4
          border-[#f0dfc9]
          border-t-[#c9790b]
        "
      />

      <div>
        <h2
          className="
            text-lg font-bold
            text-[#30251b]
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-2 text-sm
            text-[#958473]
          "
        >
          {message}
        </p>
      </div>
    </div>
  );
}

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
      behavior: "auto",
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

   Frontend session protection only.
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

   The pathname key resets the enquiry form when
   switching between routes.
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

   Development-only Admin Dashboard.
   ========================================================== */

function AdminPreviewRoute() {
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

  return (
    <Suspense
      fallback={
        <PageLoading
          title="VizhaTickets Admin"
          message="Loading dashboard..."
        />
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
          ==================================================== */}

      <Route
        path="/contact"
        element={<EnquiryPageRoute />}
      />

      {/* ====================================================
          ORGANIZER REQUEST
          ==================================================== */}

      <Route
        path="/organizer-request"
        element={<EnquiryPageRoute />}
      />

      {/* ====================================================
          CUSTOMER LOGIN
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
          ==================================================== */}

      <Route
        path="/profile"
        element={
          <CustomerRoute>
            <CustomerDashboard />
          </CustomerRoute>
        }
      />

      {/* CUSTOMER DASHBOARD ALIAS */}

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
          ==================================================== */}

      <Route
        path="/checkout"
        element={<CheckoutPage />}
      />

      {/* ====================================================
          BOOKING SUCCESS
          ==================================================== */}

      <Route
        path="/booking-success"
        element={<BookingSuccessPage />}
      />

      {/* ====================================================
          TERMS & CONDITIONS

          Public page.
          No login required.
          ==================================================== */}

      <Route
        path="/terms-and-conditions"
        element={
          <Suspense
            fallback={
              <PageLoading
                message="Loading Terms & Conditions..."
              />
            }
          >
            <TermsPage />
          </Suspense>
        }
      />

      {/* TERMS SHORT URL */}

      <Route
        path="/terms"
        element={
          <Navigate
            to="/terms-and-conditions"
            replace
          />
        }
      />

      {/* ====================================================
          PRIVACY POLICY

          Public page.
          No login required.
          ==================================================== */}

      <Route
        path="/privacy-policy"
        element={
          <Suspense
            fallback={
              <PageLoading
                message="Loading Privacy Policy..."
              />
            }
          >
            <PrivacyPolicyPage />
          </Suspense>
        }
      />

      {/* ====================================================
          ADMIN DASHBOARD

          Development mode only.

          AdminGuard protects the admin preview.
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

   PROVIDER STRUCTURE

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

          {/* AUTOMATIC SCROLL RESTORATION */}

          <ScrollToTop />

          {/* APPLICATION ROUTES */}

          <AppRoutes />

          {/* SHARED AUTHENTICATION MODAL */}

          <AuthModal />

        </AuthModalProvider>
      </LocationProvider>
    </BrowserRouter>
  );
}
