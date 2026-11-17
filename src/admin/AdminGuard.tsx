
import {
  type ReactNode,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  isAdminPreviewLoggedIn,
} from "../lib/adminPreviewSession";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  // Admin preview must never be enabled in production.
  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  // This is a demo UI check, not real authorization.
  if (!isAdminPreviewLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
