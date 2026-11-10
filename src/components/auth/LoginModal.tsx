
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuthModal } from "../../contexts/AuthModalContext";
import { notifyCustomerSessionChanged } from "../../lib/customerSession";

/* ==========================================================
   VIZHATICKETS — PREMIUM LOGIN MODAL

   React + Vite + TypeScript

   CORRECTIONS
   - Only ONE image in the entire left panel
   - Full-width, full-height background image
   - No duplicated picture
   - No smaller overlay picture
   - No additional image overlay
   - Existing login design preserved
   - Original Tamil logo preserved
   - Demo customer login preserved
   - Shared customer session preserved
   - Compatible with RegisterModal.tsx
   ========================================================== */

/* ==========================================================
   IMAGE CONFIGURATION

   Only one image is rendered for each modal.

   Login:
   public/images/auth/login-left-image.png

   Register:
   public/images/auth/register-left-image.png
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

const DEMO_EMAIL = "demo@vizhatickets.lk";
const DEMO_PASSWORD = "Demo@12345";

const SESSION_KEY = "vizha_mock_session";
const USER_KEY = "vizha_mock_user";

type DemoCustomer = {
  id: string;
  name: string;
  email: string;
  role: "customer";
};

type DemoProvider = "email" | "google-demo";

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
   SAVE DEMO SESSION

   Matches customerSession.ts
   ========================================================== */

function saveDemoSession(
  user: DemoCustomer,
  provider: DemoProvider
): void {
  const session = {
    user,
    isAuthenticated: true,
    loginAt: new Date().toISOString(),
    provider,
    mode: "demo",
  };

  window.sessionStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );

  window.sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  notifyCustomerSessionChanged();
}

/* ==========================================================
   REUSABLE LEFT ARTWORK

   IMPORTANT:

   This component uses ONE image only.

   It works with:
     <TicketArtwork />
     <TicketArtwork register />
     <TicketArtwork variant="login" />
     <TicketArtwork variant="register" />

   No additional images.
   No smaller central illustration.
   No added tagline.
   No artificial overlays.
   ========================================================== */

type TicketArtworkProps = {
  register?: boolean;
  variant?: "login" | "register";
};

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
        relative
        hidden
        min-h-142.5
        overflow-hidden
        bg-[#140b08]
        lg:block
      "
    >
      {/* ONLY ONE IMAGE — FILLS ENTIRE LEFT PANEL */}

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
          absolute
          inset-0
          block
          h-full
          w-full
          object-cover
          object-center
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

  /* ========================================================
     FORM STATE
     ======================================================== */

  const [email, setEmail] = useState(() => {
    try {
      return (
        window.localStorage.getItem(
          "vizha_remembered_email"
        ) ?? ""
      );
    } catch {
      return "";
    }
  });

  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] =
    useState(() => {
      try {
        return Boolean(
          window.localStorage.getItem(
            "vizha_remembered_email"
          )
        );
      } catch {
        return false;
      }
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  /* ========================================================
     EMAIL LOGIN
     ======================================================== */

  const onLogin = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    const validCredentials =
      normalizedEmail === DEMO_EMAIL &&
      password === DEMO_PASSWORD;

    if (!validCredentials) {
      setError("Incorrect email address or password.");
      return;
    }

    setIsSubmitting(true);

    try {
      /* Remember email only, never password */

      try {
        if (rememberMe) {
          window.localStorage.setItem(
            "vizha_remembered_email",
            DEMO_EMAIL
          );
        } else {
          window.localStorage.removeItem(
            "vizha_remembered_email"
          );
        }
      } catch {
        // Remembering the email is optional.
      }

      /* Create customer session */

      saveDemoSession(
        {
          id: "vizha-demo-customer-001",
          name: "Demo Customer",
          email: DEMO_EMAIL,
          role: "customer",
        },
        "email"
      );

      /* Clear password */

      setPassword("");

      /* Close modal without reloading homepage */

      closeModal();
    } catch (sessionError) {
      console.error(
        "VizhaTickets login session error:",
        sessionError
      );

      setError(
        "Unable to start your demo session. Please check your browser settings."
      );

      setIsSubmitting(false);
    }
  };

  /* ========================================================
     GOOGLE DEMO LOGIN
     ======================================================== */

  const googleDemoLogin = () => {
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      saveDemoSession(
        {
          id: "vizha-google-demo-001",
          name: "Google Demo Customer",
          email: "google.demo@vizhatickets.lk",
          role: "customer",
        },
        "google-demo"
      );

      setPassword("");
      closeModal();
    } catch (sessionError) {
      console.error(
        "VizhaTickets Google demo login error:",
        sessionError
      );

      setError("Unable to save your demo session.");
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

      {/* ==============================================
          LEFT — SINGLE FULL-PANEL IMAGE
          ============================================== */}

      <TicketArtwork variant="login" />

      {/* ==============================================
          RIGHT — LOGIN FORM
          ============================================== */}

      <div className="flex min-w-0 flex-col justify-center bg-[linear-gradient(135deg,#fffdfb,#fff8f1)] px-6 py-8 sm:px-10 lg:px-9">

        {/* ORIGINAL TAMIL LOGO */}

        <img
          src={BRAND_LOGO}
          alt="VizhaTickets"
          draggable={false}
          className="mx-auto mb-3 h-auto w-48.75 object-contain"
        />

        {/* LOGIN HEADING */}

        <h2 className="text-center font-serif text-[clamp(1.55rem,3vw,2rem)] font-extrabold tracking-[-0.045em] text-[#19130f]">
          Sign In to Your Account
        </h2>

        <p className="mt-1 text-center text-[12px] text-[#625c55]">
          Book events, manage tickets and more.
        </p>

        {/* ==============================================
            LOGIN FORM
            ============================================== */}

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
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#ef6405]"
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
              className="h-11.5 w-full rounded-full border border-[#eadbd0] bg-white/85 pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-[#8d8580] hover:border-[#e4ab72] focus:border-[#ed7b0b] focus:ring-4 focus:ring-[#f9a53b]/15 disabled:opacity-60"
            />
          </div>

          {/* PASSWORD */}

          <div className="relative">
            <LockKeyhole
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#ef6405]"
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
              className="h-11.5 w-full rounded-full border border-[#eadbd0] bg-white/85 pl-11 pr-11 text-sm outline-none transition-all duration-300 placeholder:text-[#8d8580] hover:border-[#e4ab72] focus:border-[#ed7b0b] focus:ring-4 focus:ring-[#f9a53b]/15 disabled:opacity-60"
            />

            {/* SHOW / HIDE PASSWORD */}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                setShowPassword((value) => !value)
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#67615b] transition-colors hover:bg-[#fff0de] hover:text-[#e8790b] focus-visible:outline-2 focus-visible:outline-[#ed7b0b]"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* REMEMBER EMAIL / FORGOT PASSWORD */}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label className="flex cursor-pointer items-center gap-2 font-medium text-[#29211c]">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={isSubmitting}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                className="h-4 w-4 cursor-pointer accent-[#f27b06]"
              />

              Remember email
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="font-semibold text-[#df4907] transition-colors hover:text-[#b84105] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* VALIDATION ERROR */}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </div>
          )}

          {/* SIGN IN BUTTON */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex h-11.5 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#ff9810] to-[#e62708] text-sm font-bold text-white shadow-[0_7px_17px_rgba(220,81,6,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[#ed7b0b] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"
          >
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />

            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* ==============================================
            SOCIAL LOGIN DIVIDER
            ============================================== */}

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e9ddd2]" />

          <span className="shrink-0 text-[11px] text-[#68625c]">
            or continue with
          </span>

          <div className="h-px flex-1 bg-[#e9ddd2]" />
        </div>

        {/* ==============================================
            GOOGLE AND APPLE LOGIN
            ============================================== */}

        <div className="space-y-2">

          {/* GOOGLE DEMO LOGIN */}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={googleDemoLogin}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#e8dcd1] bg-white text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ed9c54] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />

            Continue with Google

            <span className="text-[10px] text-[#a66b24]">
              (Demo)
            </span>
          </button>

          {/* APPLE — COMING SOON */}

          <button
            type="button"
            disabled
            title="Apple sign-in is not connected yet"
            className="flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-[#e8dcd1] bg-white text-xs font-semibold text-[#666] opacity-55"
          >
            <span aria-hidden="true" className="text-base">
              ●
            </span>

            Continue with Apple — Coming Soon
          </button>
        </div>

        {/* ==============================================
            SWITCH TO SIGN UP MODAL
            ============================================== */}

        <div className="mt-4 text-center text-xs text-[#514942]">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={openRegister}
            className="font-bold text-[#e04a06] transition-colors hover:text-[#b54105] hover:underline focus-visible:outline-2 focus-visible:outline-[#e8790b]"
          >
            Sign Up
          </button>
        </div>

        {/* DEMO INFORMATION */}

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[#928273]">
          <ShieldCheck size={13} aria-hidden="true" />
          Demo authentication only
        </div>

      </div>
    </div>
  );
}
