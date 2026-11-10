
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import Header from "@/components/header/Header";

import {
  notifyCustomerSessionChanged,
} from "../lib/customerSession";

/* ==========================================================
   VIZHATICKETS — PREMIUM CUSTOMER LOGIN

   Project: React + Vite + TypeScript

   Preserves:
   - Original Tamil logo through Header
   - Golden-wave background
   - Microphone / headphones / ticket image
   - Compact split-screen layout
   - Responsive styling
   - Password visibility
   - Premium hover animations

   Fixes:
   - Correct sessionStorage.setItem() arguments
   - Notify Header after successful authentication
   - Redirect without unnecessary browser refresh
   - Prevent duplicate form submissions
   - Consistent demo customer session

   Authentication remains frontend-only.
   ========================================================== */

const SESSION_KEY = "vizha_mock_session";
const USER_KEY = "vizha_mock_user";

/* ==========================================================
   DEMO CUSTOMER
   ========================================================== */

const DEMO_USER = {
  id: "vizha-demo-customer-001",
  name: "Demo Customer",
  email: "demo@vizhatickets.lk",
  password: "Demo@12345",
  role: "customer",
} as const;

const GOOGLE_DEMO_USER = {
  id: "vizha-google-demo-001",
  name: "Google Demo Customer",
  email: "google.demo@vizhatickets.lk",
  role: "customer",
} as const;

type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: "customer";
};

type DemoProvider = "email" | "google-demo";

/* ==========================================================
   IMAGE PATHS
   ========================================================== */

const LOGIN_BACKGROUND =
  "/images/login/vizha-login-waves.png";

const LOGIN_STAGE_IMAGE =
  "/images/login/vizha-login-stage.png";

/* ==========================================================
   BENEFITS
   ========================================================== */

const BENEFITS = [
  "Discover unforgettable experiences",
  "Book your favourite events",
  "Keep all your tickets in one place",
];

/* ==========================================================
   VALIDATION
   ========================================================== */

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* ==========================================================
   GOOGLE ICON
   ========================================================== */

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M21.6 12.23c0-.68-.06-1.34-.17-1.98H12v3.75h5.39a4.61 4.61 0 0 1-2 3.03v2.48h3.23c1.89-1.74 2.98-4.3 2.98-7.28z"
        fill="#4285F4"
      />

      <path
        d="M12 22c2.7 0 4.96-.9 6.62-2.49l-3.23-2.48c-.9.6-2.05.97-3.39.97-2.6 0-4.81-1.75-5.6-4.1H3.07v2.57A10 10 0 0 0 12 22z"
        fill="#34A853"
      />

      <path
        d="M6.4 13.9A6 6 0 0 1 6.09 12c0-.66.11-1.3.31-1.9V7.53H3.07A10 10 0 0 0 2 12c0 1.61.39 3.13 1.07 4.47z"
        fill="#FBBC05"
      />

      <path
        d="M12 6c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.77 9.77 0 0 0 12 2a10 10 0 0 0-8.93 5.53L6.4 10.1C7.19 7.75 9.4 6 12 6z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ==========================================================
   LOGIN PAGE
   ========================================================== */

export default function LoginPage() {
  const router = useRouter();

  const reducedMotion = useReducedMotion() === true;

  /* ========================================================
     STATE
     ======================================================== */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  /* ========================================================
     CREATE CUSTOMER SESSION

     Correct order:
     1. Prepare customer profile
     2. Save session to sessionStorage
     3. Notify shared authentication hook
     4. Redirect to homepage
     ======================================================== */

  const createMockSession = (
    user: DemoUser,
    provider: DemoProvider
  ): boolean => {
    try {
      /* CUSTOMER PROFILE */

      const customer = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      /* SESSION OBJECT */

      const session = {
        user: customer,
        isAuthenticated: true,
        loginAt: new Date().toISOString(),
        provider,
        mode: "demo",
      };

      /* SAVE SESSION */

      window.sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
      );

      /* OPTIONAL CUSTOMER PROFILE STORAGE */

      window.sessionStorage.setItem(
        USER_KEY,
        JSON.stringify(customer)
      );

      /* NOTIFY HEADER AND OTHER COMPONENTS */

      notifyCustomerSessionChanged();

      return true;
    } catch (sessionError) {
      console.error(
        "VizhaTickets demo session error:",
        sessionError
      );

      setError(
        "Unable to start your demo session. Please check your browser settings."
      );

      setIsSubmitting(false);

      return false;
    }
  };

  /* ========================================================
     REDIRECT AFTER LOGIN

     Do not call router.refresh().
     The customer session store updates the header.
     ======================================================== */

  const finishLogin = () => {
    router.push("/");
  };

  /* ========================================================
     EMAIL AND PASSWORD LOGIN
     ======================================================== */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    /* EMAIL VALIDATION */

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    /* PASSWORD VALIDATION */

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    /* VALIDATE DEMO CREDENTIALS */

    const validCredentials =
      normalizedEmail === DEMO_USER.email &&
      password === DEMO_USER.password;

    if (!validCredentials) {
      setError(
        "Incorrect email address or password."
      );
      return;
    }

    setIsSubmitting(true);

    /* CREATE SESSION AND REDIRECT */

    if (
      createMockSession(
        DEMO_USER,
        "email"
      )
    ) {
      finishLogin();
    }
  };

  /* ========================================================
     GOOGLE DEMO LOGIN

     This simulates Google authentication.
     It does not access a real Google account.
     ======================================================== */

  const handleGoogleDemoLogin = () => {
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    if (
      createMockSession(
        GOOGLE_DEMO_USER,
        "google-demo"
      )
    ) {
      finishLogin();
    }
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div className="vizha-login-page relative flex min-h-dvh min-w-0 flex-col overflow-x-clip bg-[#fff8f2] text-[#171717]">

      {/* ================================================
          PAGE BACKGROUND
          ================================================ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <Image
          src={LOGIN_BACKGROUND}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* ================================================
          ORIGINAL VIZHATICKETS HEADER
          ================================================ */}

      <div className="relative z-30 w-full shrink-0">
        <Header />
      </div>

      {/* ================================================
          LOGIN MAIN CONTENT
          ================================================ */}

      <main className="vizha-login-main relative z-10 flex min-h-0 min-w-0 flex-1 items-center justify-center px-4 py-2 sm:px-6 lg:px-8">

        {/* LOGIN CARD */}

        <motion.section
          aria-labelledby="vizha-login-title"
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  y: 10,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: reducedMotion ? 0 : 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="vizha-login-card relative grid w-full max-w-255 min-w-0 overflow-hidden rounded-[26px] border border-[#f1e8df] bg-white shadow-[0_20px_50px_rgba(103,48,9,0.16)] lg:grid-cols-[52%_48%]"
        >

          {/* ==============================================
              LEFT CINEMATIC PANEL
              ============================================== */}

          <div className="group/visual relative isolate hidden min-h-0 overflow-hidden bg-[#120906] lg:flex lg:flex-col lg:justify-between">

            {/* STAGE IMAGE */}

            <Image
              src={LOGIN_STAGE_IMAGE}
              alt="Concert stage with microphone, headphones, and event tickets"
              fill
              priority
              sizes="(min-width: 1024px) 540px, 0px"
              className="object-cover object-[58%_center] transition-transform duration-1000 ease-out group-hover/visual:scale-[1.025] motion-reduce:transform-none"
            />

            {/* TEXT CONTRAST OVERLAY */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#100805]/70 via-[#100805]/25 to-transparent"
            />

            {/* PREMIUM BADGE */}

            <div className="relative z-10 px-7 pt-6 xl:px-9">

              <div className="inline-flex items-center gap-2 rounded-full border border-[#f5b937] bg-[#130b08]/70 px-3.5 py-1.5 text-white shadow-[0_0_17px_rgba(245,174,36,0.18)] backdrop-blur-md transition-all duration-300 group-hover/visual:border-[#ffe084]">

                <Crown
                  size={16}
                  aria-hidden="true"
                  className="text-[#ffcc45]"
                />

                <span className="text-[10px] font-bold uppercase tracking-[0.06em]">
                  Premium Event Experiences
                </span>
              </div>
            </div>

            {/* LEFT CONTENT */}

            <div className="relative z-10 px-7 pb-7 pt-5 xl:px-9">

              <h2 className="font-serif text-[clamp(2rem,2.65vw,2.85rem)] font-bold italic leading-[1.1] tracking-[-0.035em] text-white">
                Every Event.

                <span className="block whitespace-nowrap text-[#ffc43e]">
                  Every Moment.
                </span>
              </h2>

              <p className="mt-3 text-[13px] font-medium text-white">
                Discover • Book • Experience
              </p>

              <div className="mt-5 space-y-2.5">

                {BENEFITS.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5"
                  >

                    <CheckCircle2
                      size={17}
                      aria-hidden="true"
                      className="shrink-0 text-[#ffd04f]"
                    />

                    <span className="text-[11px] font-medium text-white">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ==============================================
              RIGHT LOGIN PANEL
              ============================================== */}

          <div className="vizha-login-form-panel flex min-w-0 flex-col justify-center bg-white px-6 py-5 sm:px-9 lg:px-8 lg:py-3 xl:px-10">

            <div className="mx-auto w-full max-w-85">

              {/* HEADING */}

              <div className="mb-3 text-center">

                <div className="mb-2 flex items-center justify-center gap-3">

                  <span className="h-px w-8 bg-linear-to-r from-transparent to-[#f68b27]" />

                  <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#87300a]">
                    Member Sign In
                  </span>

                  <span className="h-px w-8 bg-linear-to-l from-transparent to-[#f68b27]" />
                </div>

                <h1
                  id="vizha-login-title"
                  className="font-serif text-[clamp(2rem,2.65vw,2.55rem)] font-bold leading-[1.08] tracking-[-0.045em] text-[#16100c]"
                >
                  Welcome Back
                  <span className="text-[#e66d09]">
                    !
                  </span>
                </h1>

                <p className="mx-auto mt-1.5 max-w-77.5 text-[11px] leading-[1.55] text-[#625b55]">
                  Sign in to access your tickets, manage bookings,
                  and discover new experiences.
                </p>
              </div>

              {/* ========================================
                  EMAIL LOGIN FORM
                  ======================================== */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-2.5"
              >

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="vizha-login-email"
                    className="mb-1 block text-[11px] font-bold text-[#221c17]"
                  >
                    Email Address
                  </label>

                  <div className="group/field relative">

                    <Mail
                      size={17}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#ee760d] transition-colors group-focus-within/field:text-[#b84907]"
                    />

                    <input
                      id="vizha-login-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      disabled={isSubmitting}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      placeholder="you@example.com"
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error
                          ? "vizha-login-error"
                          : undefined
                      }
                      className="h-10.25 w-full rounded-full border border-[#f0ddd0] bg-[#fdfaf7] pl-11 pr-4 text-[12px] text-[#29221c] outline-none transition-all duration-300 placeholder:text-[#898078] hover:border-[#efad74] hover:bg-white focus:border-[#e77808] focus:bg-white focus:ring-4 focus:ring-[#f9aa50]/15 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">

                    <label
                      htmlFor="vizha-login-password"
                      className="text-[11px] font-bold text-[#221c17]"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="group/forgot relative text-[10px] font-semibold text-[#d65c09] transition-colors duration-300 hover:text-[#963805] focus-visible:outline-2 focus-visible:outline-[#e8790b]"
                    >
                      Forgot password?

                      <span
                        aria-hidden="true"
                        className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#d65c09] transition-all duration-300 group-hover/forgot:w-full"
                      />
                    </Link>
                  </div>

                  <div className="group/field relative">

                    <LockKeyhole
                      size={17}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#ee760d] transition-colors group-focus-within/field:text-[#b84907]"
                    />

                    <input
                      id="vizha-login-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      autoComplete="current-password"
                      required
                      disabled={isSubmitting}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="Enter your password"
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error
                          ? "vizha-login-error"
                          : undefined
                      }
                      className="h-10.25 w-full rounded-full border border-[#f0ddd0] bg-[#fdfaf7] pl-11 pr-11 text-[12px] text-[#29221c] outline-none transition-all duration-300 placeholder:text-[#898078] hover:border-[#efad74] hover:bg-white focus:border-[#e77808] focus:bg-white focus:ring-4 focus:ring-[#f9aa50]/15 disabled:opacity-60"
                    />

                    {/* PASSWORD VISIBILITY */}

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#973b0a] transition-all duration-300 hover:scale-110 hover:bg-[#fff0e0] hover:text-[#e6780a] focus-visible:outline-2 focus-visible:outline-[#e8790b]"
                    >
                      {showPassword ? (
                        <EyeOff
                          size={17}
                          aria-hidden="true"
                        />
                      ) : (
                        <Eye
                          size={17}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR MESSAGE */}

                {error && (
                  <div
                    id="vizha-login-error"
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-[#f0c0b8] bg-[#fff5f2] px-3 py-2 text-[11px] leading-[1.4] text-[#ae3e2e]"
                  >
                    <AlertCircle
                      size={15}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}

                {/* SIGN IN BUTTON */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group/signin relative flex h-10.75 w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full bg-linear-to-r from-[#ffb51b] via-[#fa8907] to-[#dc5405] px-4 text-[14px] font-bold text-white shadow-[0_6px_15px_rgba(213,92,5,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(213,92,5,0.32)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e77a0b] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"
                >

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/signin:translate-x-full motion-reduce:transform-none"
                  />

                  {isSubmitting ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="relative z-10 animate-spin"
                        aria-hidden="true"
                      />

                      <span className="relative z-10">
                        Signing In...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">
                        Sign In
                      </span>

                      <ArrowRight
                        size={18}
                        className="relative z-10 transition-transform duration-300 group-hover/signin:translate-x-1.5"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* SOCIAL DIVIDER */}

              <div className="my-3 flex items-center gap-3">

                <div className="h-px flex-1 bg-linear-to-r from-transparent to-[#e99a62]" />

                <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-[#68605a]">
                  Or Continue With
                </span>

                <div className="h-px flex-1 bg-linear-to-l from-transparent to-[#e99a62]" />
              </div>

              {/* GOOGLE DEMO LOGIN */}

              <button
                type="button"
                onClick={handleGoogleDemoLogin}
                disabled={isSubmitting}
                aria-label="Continue with Google demo account"
                className="group/google flex h-10.5 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-[#e7dfd9] bg-linear-to-b from-white to-[#faf9f8] px-3 text-[12px] font-semibold text-[#242424] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e8ad76] hover:shadow-[0_7px_17px_rgba(201,121,11,0.12)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e77a0b] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"
              >
                <GoogleIcon />

                <span>Continue with Google</span>

                <span className="rounded-full bg-[#fff0dd] px-2 py-0.5 text-[9px] font-bold text-[#a56613]">
                  Demo
                </span>
              </button>

              {/* CREATE ACCOUNT LINK */}

              <div className="mt-3 text-center">

                <p className="text-[11px] text-[#514943]">
                  New to VizhaTickets?{" "}

                  <Link
                    href="/register"
                    className="group/register inline-flex items-center gap-1 font-bold text-[#d75b06] transition-colors duration-300 hover:text-[#a74405] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e77a0b]"
                  >
                    Create an Account

                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover/register:translate-x-1.5"
                      aria-hidden="true"
                    />
                  </Link>
                </p>
              </div>

              {/* FOOTNOTE */}

              <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#fff0e1] px-3 py-2">

                <ShieldCheck
                  size={16}
                  className="shrink-0 text-[#e8790b]"
                  aria-hidden="true"
                />

                <p className="text-[10px] font-semibold text-[#3d332a]">
                  Your ticketing experience, made simple.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
