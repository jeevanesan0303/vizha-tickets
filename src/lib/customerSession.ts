
import {
  useSyncExternalStore,
} from "react";

/* ==========================================================
   VIZHATICKETS — CUSTOMER SESSION MANAGEMENT

   React + Vite + TypeScript

   UPDATED:
   ----------------------------------------------------------
   - Preserves existing customer authentication API
   - Compatible with LoginModal and RegisterModal
   - Compatible with CustomerMenu and Header
   - React 19 useSyncExternalStore compatible
   - Immediate customer login/logout updates
   - Session restoration after page refresh
   - Demo customer session expiration
   - Stronger session validation
   - Customer profile editing preserved
   - International telephone number validation
   - Admin roles rejected from demo customer sessions
   - Ready for future server-side authentication
   - No administrator permissions stored here

   SECURITY:
   ----------------------------------------------------------
   This file manages DEMO customer sessions only.

   sessionStorage is controlled by the browser user.

   Never use this file alone to authorize:
   - Admin dashboard access
   - Event publishing
   - Ticket issuance
   - Payment processing
   - Refunds
   - Organizer settlements

   The backend must verify real authenticated users.

   ========================================================== */

/* ==========================================================
   STORAGE KEYS

   KEEP THESE NAMES UNCHANGED.

   Existing LoginModal and RegisterModal use them.
   ========================================================== */

export const CUSTOMER_SESSION_KEY =
  "vizha_mock_session";

export const CUSTOMER_USER_KEY =
  "vizha_mock_user";

export const CUSTOMER_SESSION_EVENT =
  "vizha-customer-session-changed";

/* ==========================================================
   DEMO SESSION CONFIGURATION

   Maximum demo session: 4 hours

   This is a frontend convenience, not a production
   authentication security boundary.
   ========================================================== */

const DEMO_SESSION_DURATION_MS =
  4 * 60 * 60 * 1000;

/* ==========================================================
   TYPES
   ========================================================== */

export interface Customer {
  id: string;
  name: string;
  email: string;
  role: "customer";
  phone?: string;
}

export type CustomerAuthProvider =
  | "email"
  | "google-demo";

export interface CustomerSession {
  isAuthenticated: boolean;
  user: Customer;
  provider?: CustomerAuthProvider | string;
  mode?: string;
  loginAt?: string;
}

export interface CustomerSessionState {
  customer: Customer | null;
  isAuthenticated: boolean;
  session: CustomerSession | null;
}

export interface UpdateCustomerProfileInput {
  name?: string;
  phone?: string;
}

/* ==========================================================
   FUTURE BACKEND AUTHENTICATION TYPES

   The backend will eventually verify both customers
   and administrators using a secure session cookie.

   These types describe possible verified accounts.
   They DO NOT grant any permissions.
   ========================================================== */

export type AccountRole =
  | "customer"
  | "admin"
  | "super_admin"
  | "event_manager"
  | "booking_manager"
  | "finance_manager";

export interface VerifiedAccount {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
}

export interface VerifiedAuthResponse {
  authenticated: boolean;
  user?: VerifiedAccount;
}

/* ==========================================================
   SAFE BROWSER STORAGE
   ========================================================== */

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/* ==========================================================
   TYPE GUARDS
   ========================================================== */

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isNonEmptyString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

/* ==========================================================
   CUSTOMER VALIDATION

   Only customer role is permitted.

   If anyone changes the browser's sessionStorage
   role to admin, this parser will reject the session.

   This does not replace server authorization.
   ========================================================== */

function isValidCustomer(
  value: unknown
): value is Customer {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.email) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.email
    ) &&
    value.role === "customer" &&
    (
      value.phone === undefined ||
      typeof value.phone === "string"
    )
  );
}

/* ==========================================================
   SESSION EXPIRATION

   Existing LoginModal creates loginAt when signing in.

   Older demo sessions without loginAt are invalidated
   and the user can sign in again.

   ========================================================== */

function isSessionExpired(
  loginAt: unknown
): boolean {
  if (
    typeof loginAt !== "string" ||
    !loginAt.trim()
  ) {
    return true;
  }

  const loginTime =
    Date.parse(loginAt);

  if (!Number.isFinite(loginTime)) {
    return true;
  }

  const elapsed =
    Date.now() - loginTime;

  if (elapsed < 0) {
    return true;
  }

  return elapsed >=
    DEMO_SESSION_DURATION_MS;
}

/* ==========================================================
   PARSE CUSTOMER SESSION
   ========================================================== */

function parseSession(
  raw: string | null
): CustomerSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.isAuthenticated !== true ||
      !isValidCustomer(parsed.user)
    ) {
      return null;
    }

    /* ================================================
       DO NOT ACCEPT ADMIN ROLE
       ================================================ */

    if (
      parsed.user.role !== "customer"
    ) {
      return null;
    }

    /* ================================================
       CHECK SESSION AGE
       ================================================ */

    if (
      isSessionExpired(parsed.loginAt)
    ) {
      return null;
    }

    /* ================================================
       SANITIZE CUSTOMER DATA
       ================================================ */

    const customer: Customer = {
      id: parsed.user.id.trim(),
      name: parsed.user.name.trim(),
      email: parsed.user.email
        .trim()
        .toLowerCase(),
      role: "customer",
      phone:
        typeof parsed.user.phone === "string"
          ? parsed.user.phone
          : "",
    };

    const session: CustomerSession = {
      isAuthenticated: true,
      user: customer,
      loginAt: parsed.loginAt as string,
    };

    if (
      typeof parsed.provider === "string"
    ) {
      session.provider =
        parsed.provider;
    }

    if (
      typeof parsed.mode === "string"
    ) {
      session.mode = parsed.mode;
    }

    return session;
  } catch {
    return null;
  }
}

/* ==========================================================
   REACT EXTERNAL STORE

   Important:
   useSyncExternalStore snapshots must remain stable.

   We use the raw sessionStorage string.
   ========================================================== */

function subscribe(
  callback: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => {
    callback();
  };

  window.addEventListener(
    CUSTOMER_SESSION_EVENT,
    handleChange
  );

  window.addEventListener(
    "storage",
    handleChange
  );

  /*
   * Browser sessionStorage is tab-scoped.
   * The storage event is retained for compatibility
   * with related same-origin contexts.
   */

  return () => {
    window.removeEventListener(
      CUSTOMER_SESSION_EVENT,
      handleChange
    );

    window.removeEventListener(
      "storage",
      handleChange
    );
  };
}

function getSnapshot(): string | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(
      CUSTOMER_SESSION_KEY
    );
  } catch {
    return null;
  }
}

function getServerSnapshot(): null {
  return null;
}

/* ==========================================================
   NOTIFY CUSTOMER SESSION CHANGED

   KEEP THIS FUNCTION NAME.

   Existing components call:
   notifyCustomerSessionChanged()
   ========================================================== */

export function notifyCustomerSessionChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(
      CUSTOMER_SESSION_EVENT
    )
  );
}

/* ==========================================================
   CURRENT SESSION
   ========================================================== */

export function getCustomerSession():
  CustomerSession | null {
  return parseSession(
    getSnapshot()
  );
}

/* ==========================================================
   CURRENT CUSTOMER
   ========================================================== */

export function getCurrentCustomer():
  Customer | null {
  const session =
    getCustomerSession();

  return session?.user ?? null;
}

/* ==========================================================
   IS CUSTOMER LOGGED IN?
   ========================================================== */

export function isCustomerLoggedIn(): boolean {
  return getCurrentCustomer() !== null;
}

/* ==========================================================
   SAVE DEMO CUSTOMER SESSION

   Centralized helper for future LoginModal and
   RegisterModal improvements.

   This function NEVER creates an admin session.
   ========================================================== */

export function saveCustomerSession(
  customer: Customer,
  provider: CustomerAuthProvider = "email"
): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  if (!isValidCustomer(customer)) {
    return false;
  }

  const sanitizedCustomer: Customer = {
    id: customer.id.trim(),
    name: customer.name.trim(),
    email: customer.email
      .trim()
      .toLowerCase(),
    role: "customer",
    phone:
      customer.phone?.trim() ?? "",
  };

  const session: CustomerSession = {
    user: sanitizedCustomer,
    isAuthenticated: true,
    loginAt:
      new Date().toISOString(),
    provider,
    mode: "demo",
  };

  try {
    storage.setItem(
      CUSTOMER_USER_KEY,
      JSON.stringify(
        sanitizedCustomer
      )
    );

    storage.setItem(
      CUSTOMER_SESSION_KEY,
      JSON.stringify(
        session
      )
    );

    notifyCustomerSessionChanged();

    return true;
  } catch (error) {
    console.error(
      "VizhaTickets customer session save error:",
      error
    );

    return false;
  }
}

/* ==========================================================
   PROFILE UPDATE

   Supported fields:
   - Customer name
   - International phone number

   Email cannot be edited here.

   ========================================================== */

export function updateCustomerProfile(
  updates: UpdateCustomerProfileInput
): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  const existingSession =
    getCustomerSession();

  if (!existingSession) {
    return false;
  }

  const currentCustomer =
    existingSession.user;

  /* ================================================
     VALIDATE NAME
     ================================================ */

  const nextName =
    updates.name !== undefined
      ? updates.name.trim()
      : currentCustomer.name;

  if (nextName.length < 2) {
    return false;
  }

  /* ================================================
     VALIDATE PHONE
     ================================================ */

  const nextPhone =
    updates.phone !== undefined
      ? updates.phone.trim()
      : currentCustomer.phone ?? "";

  if (nextPhone) {
    const digits =
      nextPhone.replace(
        /[\s()+-]/g,
        ""
      );

    if (
      !/^\d{7,15}$/.test(
        digits
      )
    ) {
      return false;
    }
  }

  /* ================================================
     UPDATE CUSTOMER
     ================================================ */

  const updatedCustomer: Customer = {
    ...currentCustomer,
    name: nextName,
    phone: nextPhone,
    role: "customer",
  };

  const updatedSession: CustomerSession = {
    ...existingSession,
    user: updatedCustomer,
  };

  try {
    storage.setItem(
      CUSTOMER_USER_KEY,
      JSON.stringify(
        updatedCustomer
      )
    );

    storage.setItem(
      CUSTOMER_SESSION_KEY,
      JSON.stringify(
        updatedSession
      )
    );

    notifyCustomerSessionChanged();

    return true;
  } catch (error) {
    console.error(
      "VizhaTickets customer profile update error:",
      error
    );

    return false;
  }
}

/* ==========================================================
   CLEAR DEMO CUSTOMER SESSION

   Only removes VizhaTickets customer demo keys.
   Other application session data remains untouched.
   ========================================================== */

function clearDemoCustomerSession(): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(
      CUSTOMER_SESSION_KEY
    );

    storage.removeItem(
      CUSTOMER_USER_KEY
    );
  } catch {
    // Browser storage might be unavailable.
  }
}

/* ==========================================================
   CUSTOMER LOGOUT

   Existing CustomerMenu calls:
   logoutCustomer()

   This function does not terminate a future
   server-side administrator session.

   That will require a separate authenticated
   backend logout endpoint.
   ========================================================== */

export function logoutCustomer(): void {
  clearDemoCustomerSession();

  notifyCustomerSessionChanged();
}

/* ==========================================================
   FUTURE VERIFIED AUTHENTICATION

   This function checks the backend's authenticated
   session rather than trusting sessionStorage.

   Expected backend endpoint:
   GET /api/auth/me

   Example response:

   {
     "authenticated": true,
     "user": {
       "id": "123",
       "name": "Staff",
       "email": "staff@example.com",
       "role": "admin"
     }
   }

   The endpoint MUST validate an HTTP-only session
   cookie and retrieve role permissions server-side.

   This frontend function cannot authenticate users
   or authorize dashboard API access by itself.

   ========================================================== */

export async function getVerifiedAccount():
  Promise<VerifiedAccount | null> {
  try {
    const response = await fetch(
      "/api/auth/me",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: unknown =
      await response.json();

    if (!isRecord(data)) {
      return null;
    }

    if (
      data.authenticated !== true ||
      !isRecord(data.user)
    ) {
      return null;
    }

    const user = data.user;

    if (
      !isNonEmptyString(user.id) ||
      !isNonEmptyString(user.name) ||
      !isNonEmptyString(user.email) ||
      !isNonEmptyString(user.role)
    ) {
      return null;
    }

    const allowedRoles: AccountRole[] = [
      "customer",
      "admin",
      "super_admin",
      "event_manager",
      "booking_manager",
      "finance_manager",
    ];

    if (
      !allowedRoles.includes(
        user.role as AccountRole
      )
    ) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as AccountRole,
    };
  } catch {
    return null;
  }
}

/* ==========================================================
   ADMIN ROLE HELPERS

   These helpers classify a role that was returned
   by the authenticated backend.

   They DO NOT independently verify authentication.
   ========================================================== */

export function isAdminRole(
  role: string | null | undefined
): boolean {
  return (
    role === "admin" ||
    role === "super_admin"
  );
}

export function isStaffRole(
  role: string | null | undefined
): boolean {
  return (
    isAdminRole(role) ||
    role === "event_manager" ||
    role === "booking_manager" ||
    role === "finance_manager"
  );
}

/* ==========================================================
   REACT CUSTOMER SESSION HOOK

   Preserves the existing public API.

   Example:

   const {
     customer,
     isAuthenticated,
     session,
     provider,
     loginAt,
   } = useCustomerSession();

   NOTE:
   This reads DEMO customer authentication only.

   Administrator authentication must use the
   verified backend session.

   ========================================================== */

export function useCustomerSession() {
  const raw =
    useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );

  const session =
    parseSession(raw);

  const customer =
    session?.user ?? null;

  return {
    customer,
    isAuthenticated:
      customer !== null,
    session,
    provider:
      session?.provider ?? null,
    loginAt:
      session?.loginAt ?? null,
  };
}
