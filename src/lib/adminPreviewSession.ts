
/* ==========================================================
   VIZHATICKETS — DEVELOPMENT ADMIN PREVIEW SESSION

   FRONTEND TESTING ONLY

   No real admin credentials or permissions belong here.
   This module must not authorize production operations.
   ========================================================== */

export const ADMIN_PREVIEW_SESSION_KEY =
  "vizha_admin_preview_session";

export const ADMIN_PREVIEW_EVENT =
  "vizha-admin-preview-changed";

const PREVIEW_DURATION_MS = 4 * 60 * 60 * 1000;

/*
 * Fictional test account.
 * NEVER replace with a real administrator's credentials.
 *
 * import.meta.env.DEV ensures the credentials cannot
 * activate admin preview login in a production build.
 */
const PREVIEW_EMAIL =
  "admin.preview@vizhatickets.test";

const PREVIEW_PASSWORD =
  "PreviewOnly@2026";

export interface AdminPreviewSession {
  id: string;
  email: string;
  name: string;
  role: "admin_preview";
  loginAt: string;
}

function readSession(): AdminPreviewSession | null {
  if (!import.meta.env.DEV) return null;

  try {
    const raw = sessionStorage.getItem(
      ADMIN_PREVIEW_SESSION_KEY
    );

    if (!raw) return null;

    const data: unknown = JSON.parse(raw);

    if (
      typeof data !== "object" ||
      data === null ||
      Array.isArray(data)
    ) {
      return null;
    }

    const session = data as Record<string, unknown>;

    if (
      session.role !== "admin_preview" ||
      typeof session.id !== "string" ||
      typeof session.email !== "string" ||
      typeof session.name !== "string" ||
      typeof session.loginAt !== "string"
    ) {
      return null;
    }

    const startedAt = Date.parse(session.loginAt);

    if (
      !Number.isFinite(startedAt) ||
      Date.now() < startedAt ||
      Date.now() - startedAt >= PREVIEW_DURATION_MS
    ) {
      sessionStorage.removeItem(
        ADMIN_PREVIEW_SESSION_KEY
      );
      return null;
    }

    return session as unknown as AdminPreviewSession;
  } catch {
    return null;
  }
}

export function isAdminPreviewCredential(
  email: string,
  password: string
): boolean {
  return (
    import.meta.env.DEV &&
    email.trim().toLowerCase() === PREVIEW_EMAIL &&
    password === PREVIEW_PASSWORD
  );
}

export function isAdminPreviewEmail(
  email: string
): boolean {
  return (
    import.meta.env.DEV &&
    email.trim().toLowerCase() === PREVIEW_EMAIL
  );
}

export function startAdminPreviewSession(): boolean {
  if (!import.meta.env.DEV) return false;

  const session: AdminPreviewSession = {
    id: "vizha-admin-preview-001",
    email: PREVIEW_EMAIL,
    name: "Admin Preview",
    role: "admin_preview",
    loginAt: new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(
      ADMIN_PREVIEW_SESSION_KEY,
      JSON.stringify(session)
    );

    window.dispatchEvent(
      new Event(ADMIN_PREVIEW_EVENT)
    );

    return true;
  } catch {
    return false;
  }
}

export function getAdminPreviewSession():
  AdminPreviewSession | null {
  return readSession();
}

export function isAdminPreviewLoggedIn(): boolean {
  return readSession() !== null;
}

export function logoutAdminPreview(): void {
  try {
    sessionStorage.removeItem(
      ADMIN_PREVIEW_SESSION_KEY
    );
  } catch {
    // Storage may be unavailable.
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event(ADMIN_PREVIEW_EVENT)
    );
  }
}
