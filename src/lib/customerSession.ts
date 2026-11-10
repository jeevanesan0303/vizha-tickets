
import { useSyncExternalStore } from "react";

/* ==========================================================
   VIZHATICKETS — CUSTOMER SESSION MANAGEMENT

   React + Vite + TypeScript

   FEATURES
   - Shared customer authentication state
   - Compatible with LoginModal and RegisterModal
   - Immediate header updates
   - Session restoration after refresh
   - Customer profile updates
   - Logout
   - Session validation
   - React 19 useSyncExternalStore compatibility

   IMPORTANT
   - Frontend demo authentication only
   - Not suitable as production authentication
   - Does not store passwords
   - Does not validate users against a backend
   ========================================================== */

/* ==========================================================
   STORAGE KEYS
   ========================================================== */

export const CUSTOMER_SESSION_KEY =
  "vizha_mock_session";

export const CUSTOMER_USER_KEY =
  "vizha_mock_user";

export const CUSTOMER_SESSION_EVENT =
  "vizha-customer-session-changed";

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
   SESSION VALIDATION HELPERS
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
    value.role === "customer" &&
    (
      value.phone === undefined ||
      typeof value.phone === "string"
    )
  );
}

function parseSession(
  raw: string | null
): CustomerSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.isAuthenticated !== true ||
      !isValidCustomer(parsed.user)
    ) {
      return null;
    }

    const session: CustomerSession = {
      isAuthenticated: true,
      user: {
        id: parsed.user.id,
        name: parsed.user.name,
        email: parsed.user.email,
        role: "customer",
        phone: parsed.user.phone ?? "",
      },
    };

    if (typeof parsed.provider === "string") {
      session.provider = parsed.provider;
    }

    if (typeof parsed.mode === "string") {
      session.mode = parsed.mode;
    }

    if (typeof parsed.loginAt === "string") {
      session.loginAt = parsed.loginAt;
    }

    return session;
  } catch {
    return null;
  }
}

/* ==========================================================
   REACT EXTERNAL STORE

   useSyncExternalStore requires getSnapshot()
   to return a stable value when storage has not changed.

   Returning the original storage string satisfies this.
   ========================================================== */

function subscribe(
  callback: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(
    CUSTOMER_SESSION_EVENT,
    callback
  );

  window.addEventListener(
    "storage",
    callback
  );

  return () => {
    window.removeEventListener(
      CUSTOMER_SESSION_EVENT,
      callback
    );

    window.removeEventListener(
      "storage",
      callback
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
   NOTIFY AUTHENTICATION CHANGES

   Existing LoginModal and RegisterModal already call:
   notifyCustomerSessionChanged()

   Keep the function name unchanged.
   ========================================================== */

export function notifyCustomerSessionChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(CUSTOMER_SESSION_EVENT)
  );
}

/* ==========================================================
   READ CURRENT CUSTOMER SESSION
   ========================================================== */

export function getCustomerSession():
  CustomerSession | null {
  return parseSession(getSnapshot());
}

/* ==========================================================
   READ CURRENT CUSTOMER
   ========================================================== */

export function getCurrentCustomer():
  Customer | null {
  const session = getCustomerSession();

  return session?.user ?? null;
}

/* ==========================================================
   CHECK LOGIN STATUS
   ========================================================== */

export function isCustomerLoggedIn(): boolean {
  return getCurrentCustomer() !== null;
}

/* ==========================================================
   SAVE CUSTOMER SESSION

   Can be used later to simplify LoginModal and
   RegisterModal so session-saving logic is centralized.

   Existing modal implementations remain compatible.
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
    email: customer.email.trim().toLowerCase(),
    role: "customer",
    phone: customer.phone?.trim() ?? "",
  };

  const session: CustomerSession = {
    user: sanitizedCustomer,
    isAuthenticated: true,
    loginAt: new Date().toISOString(),
    provider,
    mode: "demo",
  };

  try {
    storage.setItem(
      CUSTOMER_USER_KEY,
      JSON.stringify(sanitizedCustomer)
    );

    storage.setItem(
      CUSTOMER_SESSION_KEY,
      JSON.stringify(session)
    );

    notifyCustomerSessionChanged();

    return true;
  } catch (error) {
    console.error(
      "VizhaTickets session save error:",
      error
    );

    return false;
  }
}

/* ==========================================================
   UPDATE CUSTOMER PROFILE

   For the upcoming Customer Dashboard.

   Editable fields:
   - name
   - phone

   Email is intentionally not editable here.
   Email changes will require verification when
   a real authentication backend is added.
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

  const nextName =
    updates.name !== undefined
      ? updates.name.trim()
      : currentCustomer.name;

  const nextPhone =
    updates.phone !== undefined
      ? updates.phone.trim()
      : currentCustomer.phone ?? "";

  if (nextName.length < 2) {
    return false;
  }

  if (nextPhone) {
    const digits =
      nextPhone.replace(/[\s()+-]/g, "");

    if (!/^\d{7,15}$/.test(digits)) {
      return false;
    }
  }

  const updatedCustomer: Customer = {
    ...currentCustomer,
    name: nextName,
    phone: nextPhone,
  };

  const updatedSession: CustomerSession = {
    ...existingSession,
    user: updatedCustomer,
  };

  try {
    storage.setItem(
      CUSTOMER_USER_KEY,
      JSON.stringify(updatedCustomer)
    );

    storage.setItem(
      CUSTOMER_SESSION_KEY,
      JSON.stringify(updatedSession)
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
   CUSTOMER LOGOUT

   Preserve unrelated sessionStorage keys.
   Only remove VizhaTickets customer auth records.
   ========================================================== */

export function logoutCustomer(): void {
  const storage = getStorage();

  if (storage) {
    try {
      storage.removeItem(
        CUSTOMER_SESSION_KEY
      );

      storage.removeItem(
        CUSTOMER_USER_KEY
      );
    } catch (error) {
      console.error(
        "VizhaTickets logout error:",
        error
      );
    }
  }

  notifyCustomerSessionChanged();
}

/* ==========================================================
   CUSTOMER SESSION HOOK

   Existing components use:

   const { customer, isAuthenticated } =
     useCustomerSession();

   The API remains unchanged.

   Also exposes:
   - session
   - provider
   - loginAt
   ========================================================== */

export function useCustomerSession() {
  const raw = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const session = parseSession(raw);

  const customer = session?.user ?? null;

  return {
    customer,
    isAuthenticated: customer !== null,
    session,
    provider: session?.provider ?? null,
    loginAt: session?.loginAt ?? null,
  };
}
