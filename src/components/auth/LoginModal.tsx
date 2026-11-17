
import {
  useState,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  useAuthModal,
} from "../../contexts/AuthModalContext";

import {
  saveCustomerSession,
} from "../../lib/customerSession";

import {
  isAdminPreviewCredential,
  isAdminPreviewEmail,
  startAdminPreviewSession,
  logoutAdminPreview,
} from "../../lib/adminPreviewSession";

/* ==========================================================
   VIZHATICKETS — SHARED SIGN IN MODAL

   React + Vite + TypeScript

   FEATURES
   ----------------------------------------------------------
   - Same login form for customers and admins
   - Existing premium design preserved
   - Original Tamil logo preserved
   - Single full-height image on left
   - Demo customer login preserved
   - Development-only admin login added
   - Google demo customer login preserved
   - Secure backend login interface prepared
   - Password visibility toggle
   - Remember email option
   - Forgot password navigation
   - Sign Up modal preserved
   - No public Admin Login button

   IMPORTANT
   ----------------------------------------------------------
   The admin preview is NOT real authentication.

   Actual admin access must be authorized by a backend.

   ========================================================== */

/* ==========================================================
   ASSETS
   ========================================================== */

const LOGIN_LEFT_IMAGE =
  "/images/auth/login-left-image.png";

const REGISTER_LEFT_IMAGE =
  "/images/auth/register-left-image.png";

const BRAND_LOGO =
  "/images/branding/vizha-logo.png";

/* ==========================================================
   DEMO CUSTOMER CREDENTIALS
   ========================================================== */

const DEMO_CUSTOMER_EMAIL =
  "demo@vizhatickets.lk";

const DEMO_CUSTOMER_PASSWORD =
  "Demo@12345";

const REMEMBER_EMAIL_KEY =
  "vizha_remembered_email";

const AUTH_LOGIN_ENDPOINT =
  "/api/auth/login";

/* ==========================================================
   TYPES
   ========================================================== */

interface ServerUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginApiResponse {
  success?: boolean;
  message?: string;
  user?: ServerUser;
}

/* ==========================================================
   GOOGLE ICON
   ========================================================== */

function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.22c0-.71-.06-1.39-.18-2.05H12v3.77h5.24a4.48 4.48 0 0 1-1.95 2.95v2.45h3.15c1.85-1.71 2.91-4.23 2.91-7.12Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.62 0 4.82-.87 6.44-2.41l-3.15-2.45c-.87.58-1.99.92-3.29.92-2.53 0-4.67-1.71-5.44-4.01H3.31v2.52A9.75 9.75 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.56 13.8a5.85 5.85 0 0 1 0-3.6V7.68H3.31a9.75 9.75 0 0 0 0 8.64l3.25-2.52Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.19c1.38 0 2.62.48 3.59 1.42l2.8-2.81A9.35 9.35 0 0 0 12 2.25a9.75 9.75 0 0 0-8.69 5.43l3.25 2.52C7.33 7.9 9.47 6.19 12 6.19Z"
      />
    </svg>
  );
}

/* ==========================================================
   REMEMBER EMAIL
   ========================================================== */

function getRememberedEmail(): string {
  if (typeof window === "undefined") return "";

  try {
    return (
      localStorage.getItem(REMEMBER_EMAIL_KEY) ?? ""
    );
  } catch {
    return "";
  }
}

function saveRememberedEmail(
  enabled: boolean,
  email: string
) {
  try {
    if (enabled) {
      localStorage.setItem(
        REMEMBER_EMAIL_KEY,
        email
      );
    } else {
      localStorage.removeItem(
        REMEMBER_EMAIL_KEY
      );
    }
  } catch {
    // Optional preference.
  }
}

/* ==========================================================
   FUTURE BACKEND AUTHENTICATION

   The backend will:
   - Validate the email and password
   - Create an HTTP-only session cookie
   - Return the authenticated account
   - Verify admin roles on each protected request

   ========================================================== */

async function signInWithBackend(
  email: string,
  password: string
): Promise<ServerUser> {
  let response: Response;

  try {
    response = await fetch(
      AUTH_LOGIN_ENDPOINT,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the sign-in service."
    );
  }

  if (
    response.status === 404 ||
    response.status === 405
  ) {
    throw new Error(
      "Secure sign-in has not been configured yet."
    );
  }

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    throw new Error(
      "Incorrect email address or password."
    );
  }

  if (response.status === 429) {
    throw new Error(
      "Too many sign-in attempts. Please try later."
    );
  }

  if (!response.ok) {
    throw new Error(
      "Unable to sign in. Please try again."
    );
  }

  let result: LoginApiResponse;

  try {
    result =
      (await response.json()) as LoginApiResponse;
  } catch {
    throw new Error(
      "The sign-in service returned an invalid response."
    );
  }

  if (
    result.success !== true ||
    !result.user ||
    typeof result.user.id !== "string" ||
    typeof result.user.name !== "string" ||
    typeof result.user.email !== "string" ||
    typeof result.user.role !== "string"
  ) {
    throw new Error(
      "Your account could not be verified."
    );
  }

  return result.user;
}

/* ==========================================================
   SINGLE IMAGE ARTWORK

   Compatible with RegisterModal.tsx:
   <TicketArtwork />
   <TicketArtwork register />
   <TicketArtwork variant="login" />
   <TicketArtwork variant="register" />
   ========================================================== */

interface TicketArtworkProps {
  register?: boolean;
  variant?: "login" | "register";
}

export function TicketArtwork({
  register = false,
  variant,
}: TicketArtworkProps) {
  const activeVariant =
    variant ?? (register ? "register" : "login");

  const imageSource =
    activeVariant === "register"
      ? REGISTER_LEFT_IMAGE
      : LOGIN_LEFT_IMAGE;

  return (
    <div
      className="
        relative hidden min-h-142.5
        overflow-hidden bg-[#140b08] lg:block
      "
    >
      <img
        src={imageSource}
        alt={
          activeVariant === "register"
            ? "VizhaTickets registration event artwork"
            : "VizhaTickets premium event artwork"
        }
        draggable={false}
        loading="eager"
        decoding="async"
        className="
          absolute inset-0 block h-full w-full
          object-cover object-center
        "
      />
    </div>
  );
}

/* ==========================================================
   LOGIN MODAL
   ========================================================== */

export default function LoginModal() {
  const navigate = useNavigate();

  const {
    closeModal,
    openRegister,
  } = useAuthModal();

  const [email, setEmail] =
    useState(getRememberedEmail);

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(
      () => getRememberedEmail().length > 0
    );

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ========================================================
     EMAIL / PASSWORD LOGIN
     ======================================================== */

  const onLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      /* ================================================
         DEVELOPMENT ADMIN PREVIEW LOGIN

         This works only in Vite development mode.
         It NEVER uses the customer session.
         ================================================ */

      if (
        import.meta.env.DEV &&
        isAdminPreviewEmail(normalizedEmail)
      ) {
        if (
          !isAdminPreviewCredential(
            normalizedEmail,
            password
          )
        ) {
          throw new Error(
            "Incorrect email address or password."
          );
        }

        const started =
          startAdminPreviewSession();

        if (!started) {
          throw new Error(
            "Could not start the admin preview session."
          );
        }

        saveRememberedEmail(
          rememberMe,
          normalizedEmail
        );

        setPassword("");
        closeModal();

        navigate("/admin", {
          replace: true,
        });

        return;
      }

      /* ================================================
         DEVELOPMENT DEMO CUSTOMER LOGIN
         ================================================ */

      if (
        import.meta.env.DEV &&
        normalizedEmail === DEMO_CUSTOMER_EMAIL &&
        password === DEMO_CUSTOMER_PASSWORD
      ) {
        logoutAdminPreview();

        const saved = saveCustomerSession(
          {
            id: "vizha-demo-customer-001",
            name: "Demo Customer",
            email: DEMO_CUSTOMER_EMAIL,
            role: "customer",
          },
          "email"
        );

        if (!saved) {
          throw new Error(
            "Unable to start your customer session."
          );
        }

        saveRememberedEmail(
          rememberMe,
          normalizedEmail
        );

        setPassword("");
        closeModal();
        navigate("/");

        return;
      }

      /* ================================================
         FUTURE REAL ACCOUNT LOGIN
         ================================================ */

      const user =
        await signInWithBackend(
          normalizedEmail,
          password
        );

      const role =
        user.role.toLowerCase();

      /* ================================================
         ADMIN OR SUPER ADMIN

         Navigation only; the backend must independently
         validate the admin session and API permissions.
         ================================================ */

      if (
        role === "admin" ||
        role === "super_admin"
      ) {
        saveRememberedEmail(
          rememberMe,
          normalizedEmail
        );

        setPassword("");
        closeModal();

        navigate("/admin", {
          replace: true,
        });

        return;
      }

      /*
       * Real customer accounts will be connected
       * to the centralized production auth context
       * when the backend is implemented.
       *
       * Never copy a real backend account into the
       * mock customer session.
       */

      throw new Error(
        "Customer account integration is not configured yet."
      );
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================
     GOOGLE DEMO — CUSTOMER ONLY
     ======================================================== */

  const googleDemoLogin = () => {
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      if (!import.meta.env.DEV) {
        throw new Error(
          "Google sign-in is not configured yet."
        );
      }

      logoutAdminPreview();

      const saved = saveCustomerSession(
        {
          id: "vizha-google-demo-001",
          name: "Google Demo Customer",
          email: "google.demo@vizhatickets.lk",
          role: "customer",
        },
        "google-demo"
      );

      if (!saved) {
        throw new Error(
          "Unable to start Google demo session."
        );
      }

      setPassword("");
      closeModal();
      navigate("/");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Google demo login failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================
     FORGOT PASSWORD
     ======================================================== */

  const handleForgotPassword = () => {
    closeModal();
    navigate("/forgot-password");
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div className="grid min-h-142.5 lg:grid-cols-[40%_60%]">
      {/* LEFT IMAGE */}

      <TicketArtwork variant="login" />

      {/* RIGHT FORM */}

      <div
        className="
          flex min-w-0 flex-col justify-center
          bg-[linear-gradient(135deg,#fffdfb,#fff8f1)]
          px-6 py-8 sm:px-10 lg:px-9
        "
      >
        {/* ORIGINAL TAMIL LOGO */}

        <img
          src={BRAND_LOGO}
          alt="VizhaTickets"
          draggable={false}
          className="
            mx-auto mb-3 h-auto w-48.75
            object-contain
          "
        />

        <h2
          className="
            text-center font-serif
            text-[clamp(1.55rem,3vw,2rem)]
            font-extrabold tracking-[-0.045em]
            text-[#19130f]
          "
        >
          Sign In to Your Account
        </h2>

        <p
          className="
            mt-1 text-center text-[12px]
            text-[#625c55]
          "
        >
          Book events, manage tickets and more.
        </p>

        {/* EMAIL / PASSWORD FORM */}

        <form
          onSubmit={onLogin}
          noValidate
          className="mt-5 space-y-3"
        >
          {/* EMAIL */}

          <div className="relative">
            <Mail
              size={18}
              aria-hidden="true"
              className="
                pointer-events-none absolute left-4
                top-1/2 -translate-y-1/2
                text-[#ef6405]
              "
            />

            <input
              id="vizha-modal-email"
              type="email"
              name="email"
              autoComplete="email"
              aria-label="Email address"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              aria-invalid={Boolean(error)}
              className="
                h-11.5 w-full rounded-full
                border border-[#eadbd0] bg-white/85
                pl-11 pr-4 text-sm outline-none
                transition-all duration-300
                placeholder:text-[#8d8580]
                hover:border-[#e4ab72]
                focus:border-[#ed7b0b]
                focus:ring-4 focus:ring-[#f9a53b]/15
                disabled:opacity-60
              "
            />
          </div>

          {/* PASSWORD */}

          <div className="relative">
            <LockKeyhole
              size={18}
              aria-hidden="true"
              className="
                pointer-events-none absolute left-4
                top-1/2 -translate-y-1/2
                text-[#ef6405]
              "
            />

            <input
              id="vizha-modal-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              aria-label="Password"
              required
              disabled={isSubmitting}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              aria-invalid={Boolean(error)}
              className="
                h-11.5 w-full rounded-full
                border border-[#eadbd0] bg-white/85
                pl-11 pr-11 text-sm outline-none
                transition-all duration-300
                placeholder:text-[#8d8580]
                hover:border-[#e4ab72]
                focus:border-[#ed7b0b]
                focus:ring-4 focus:ring-[#f9a53b]/15
                disabled:opacity-60
              "
            />

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                setShowPassword((current) => !current)
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              aria-pressed={showPassword}
              className="
                absolute right-3 top-1/2
                -translate-y-1/2 rounded-full
                p-1.5 text-[#67615b]
                transition-colors
                hover:bg-[#fff0de]
                hover:text-[#e8790b]
                focus-visible:outline-2
                focus-visible:outline-[#ed7b0b]
              "
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* REMEMBER EMAIL / FORGOT PASSWORD */}

          <div
            className="
              flex flex-wrap items-center
              justify-between gap-2 text-xs
            "
          >
            <label
              className="
                flex cursor-pointer items-center gap-2
                font-medium text-[#29211c]
              "
            >
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={isSubmitting}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                className="
                  h-4 w-4 cursor-pointer
                  accent-[#f27b06]
                "
              />
              Remember email
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isSubmitting}
              className="
                font-semibold text-[#df4907]
                transition-colors hover:text-[#b84105]
                hover:underline disabled:opacity-50
              "
            >
              Forgot password?
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div
              role="alert"
              className="
                rounded-lg border border-red-200
                bg-red-50 px-3 py-2
                text-xs text-red-700
              "
            >
              {error}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              group flex h-11.5 w-full
              cursor-pointer items-center justify-center
              gap-2 rounded-full
              bg-linear-to-r from-[#ff9810] to-[#e62708]
              text-sm font-bold text-white
              shadow-[0_7px_17px_rgba(220,81,6,0.22)]
              transition-all duration-300
              hover:-translate-y-0.5 hover:shadow-lg
              active:scale-[0.98]
              focus-visible:outline-2
              focus-visible:outline-[#ed7b0b]
              disabled:cursor-not-allowed
              disabled:opacity-60
              motion-reduce:transform-none
            "
          >
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="
                transition-transform duration-300
                group-hover:translate-x-1
              "
            />
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* SOCIAL LOGIN DIVIDER */}

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e9ddd2]" />

          <span className="shrink-0 text-[11px] text-[#68625c]">
            or continue with
          </span>

          <div className="h-px flex-1 bg-[#e9ddd2]" />
        </div>

        {/* SOCIAL OPTIONS */}

        <div className="space-y-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={googleDemoLogin}
            className="
              flex h-10 w-full cursor-pointer
              items-center justify-center gap-2
              rounded-full border border-[#e8dcd1]
              bg-white text-xs font-semibold
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-[#ed9c54]
              hover:shadow-md active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <GoogleIcon />
            Continue with Google
            <span className="text-[10px] text-[#a66b24]">
              (Demo)
            </span>
          </button>

          <button
            type="button"
            disabled
            title="Apple sign-in is not connected yet"
            className="
              flex h-10 w-full cursor-not-allowed
              items-center justify-center gap-2
              rounded-full border border-[#e8dcd1]
              bg-white text-xs font-semibold
              text-[#666] opacity-55
            "
          >
            <span aria-hidden="true" className="text-base">
              ●
            </span>
            Continue with Apple — Coming Soon
          </button>
        </div>

        {/* SIGN UP */}

        <div
          className="
            mt-4 text-center text-xs
            text-[#514942]
          "
        >
          Don't have an account?{" "}
          <button
            type="button"
            onClick={openRegister}
            disabled={isSubmitting}
            className="
              font-bold text-[#e04a06]
              transition-colors hover:text-[#b54105]
              hover:underline
              focus-visible:outline-2
              focus-visible:outline-[#e8790b]
              disabled:opacity-50
            "
          >
            Sign Up
          </button>
        </div>

        {/* DEMO MESSAGE */}

        <div
          className="
            mt-3 flex items-center justify-center
            gap-1.5 text-[10px] text-[#928273]
          "
        >
          <ShieldCheck
            size={13}
            aria-hidden="true"
          />
          Frontend authentication preview
        </div>
      </div>
    </div>
  );
}
