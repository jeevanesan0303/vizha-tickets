
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useReducedMotion } from "framer-motion";

import {
  AlertCircle,
  ArrowRight,
  Bell,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  Star,
  Ticket,
  UserRound,
} from "lucide-react";

import Header from "../components/header/Header";
import {
  notifyCustomerSessionChanged,
} from "../lib/customerSession";

/* ==========================================================
   VIZHATICKETS — CUSTOMER REGISTRATION PAGE

   React + Vite + TypeScript + React Router

   Preserves:
   - Original Tamil VizhaTickets logo through Header
   - Golden-wave background
   - Theatre registration image
   - Premium split-screen design
   - Responsive registration form
   - Email, name and phone validation
   - Password strength indicator
   - Password visibility controls
   - Terms agreement
   - Button hover animations

   Authentication corrections:
   - Consistent customer session structure
   - Save sessionStorage using correct arguments
   - Notify Header after successful registration
   - Customer profile displayed after registration
   - No password stored in sessionStorage
   - Redirect without page reload

   IMPORTANT:
   Demo authentication only.
   Does not create a real database account.
   ========================================================== */

/* ==========================================================
   IMAGE PATHS
   ========================================================== */

const REGISTER_BACKGROUND =
  "/images/register/register-background.png";

const REGISTER_PANEL_IMAGE =
  "/images/register/register-panel.png";

/* ==========================================================
   SESSION STORAGE KEYS
   ========================================================== */

const SESSION_KEY = "vizha_mock_session";
const USER_KEY = "vizha_mock_user";

/* ==========================================================
   TYPES
   ========================================================== */

type RegisterForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type FormField = keyof RegisterForm;

type FieldErrors = Partial<
  Record<FormField, string>
>;

type DemoUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer";
};

type DemoProvider = "email" | "google-demo";

/* ==========================================================
   INITIAL STATE
   ========================================================== */

const initialForm: RegisterForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

/* ==========================================================
   GOOGLE DEMO CUSTOMER
   ========================================================== */

const GOOGLE_DEMO_USER: DemoUser = {
  id: "vizha-google-demo-001",
  name: "Google Demo Customer",
  email: "google.demo@vizhatickets.lk",
  role: "customer",
};

/* ==========================================================
   LEFT PANEL FEATURES
   ========================================================== */

const features = [
  {
    icon: Ticket,
    label: "Book Your Favourite Events",
  },
  {
    icon: Bell,
    label: "Get Event Updates & Alerts",
  },
  {
    icon: Star,
    label: "Manage Your Bookings Easily",
  },
];

/* ==========================================================
   VALIDATION HELPERS
   ========================================================== */

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value: string): boolean {
  const digits = value.replace(/[\s()+-]/g, "");
  return /^\d{7,15}$/.test(digits);
}

function getPasswordStrength(password: string) {
  if (!password) {
    return {
      score: 0,
      label: "",
      color: "#e5e7eb",
    };
  }

  let points = 0;

  if (password.length >= 8) points++;
  if (password.length >= 12) points++;

  if (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password)
  ) {
    points++;
  }

  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  if (points <= 2) {
    return {
      score: 1,
      label: "Weak",
      color: "#ef4444",
    };
  }

  if (points === 3) {
    return {
      score: 2,
      label: "Fair",
      color: "#f59e0b",
    };
  }

  if (points === 4) {
    return {
      score: 3,
      label: "Good",
      color: "#2563eb",
    };
  }

  return {
    score: 4,
    label: "Strong",
    color: "#16a34a",
  };
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
        d="M6.4 13.9A6 6 0 0 1 6.09 12c0-.66.11-1.3.31-1.9V7.53H3.07A10 10 0 0 0 12 22z"
        fill="#FBBC05"
      />
      <path
        d="M12 6c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.77 9.77 0 0 0 12 2a10 10 0 0 0 8.93-5.53L6.4 10.1C7.19 7.75 9.4 6 12 6z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ==========================================================
   SHARED INPUT STYLES
   ========================================================== */

const labelStyle =
  "mb-1 block text-[11px] font-bold leading-[15px] " +
  "text-[#211b17]";

const inputStyle =
  "h-[37px] w-full min-w-0 rounded-full " +
  "border border-[#efdccf] bg-[#fdfaf7] " +
  "pl-10 pr-3 text-[12px] text-[#29211c] " +
  "outline-none transition-all duration-300 " +
  "placeholder:text-[#92867c] " +
  "hover:border-[#e7a369] hover:bg-white " +
  "focus:border-[#e8790b] focus:bg-white " +
  "focus:ring-4 focus:ring-[#f9aa50]/15 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const iconStyle =
  "pointer-events-none absolute left-3.5 top-1/2 " +
  "-translate-y-1/2 text-[#e9770b]";

const errorStyle =
  "mt-1 text-[10px] leading-[1.35] text-red-600";

/* ==========================================================
   REGISTER PAGE
   ========================================================== */

export default function RegisterPage() {
  const navigate = useNavigate();

  const reducedMotion = useReducedMotion() === true;

  /* ========================================================
     FORM STATE
     ======================================================== */

  const [form, setForm] = useState<RegisterForm>(
    initialForm
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});

  const passwordStrength =
    getPasswordStrength(form.password);

  /* ========================================================
     UPDATE FORM FIELD
     ======================================================== */

  const updateField = (
    field: FormField,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setError("");
  };

  /* ========================================================
     VALIDATE REGISTRATION
     ======================================================== */

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || name.length < 2) {
      errors.name =
        "Please enter your full name.";
    }

    if (!validEmail(email)) {
      errors.email =
        "Enter a valid email address.";
    }

    if (
      form.phone.trim() &&
      !validPhone(form.phone)
    ) {
      errors.phone =
        "Enter a valid phone number.";
    }

    if (form.password.length < 8) {
      errors.password =
        "Use at least 8 characters.";
    } else if (
      !/[a-z]/.test(form.password) ||
      !/[A-Z]/.test(form.password) ||
      !/\d/.test(form.password)
    ) {
      errors.password =
        "Use uppercase, lowercase and a number.";
    }

    if (!form.confirmPassword) {
      errors.confirmPassword =
        "Confirm your password.";
    } else if (
      form.confirmPassword !== form.password
    ) {
      errors.confirmPassword =
        "Passwords do not match.";
    }

    setFieldErrors(errors);

    if (!acceptedTerms) {
      setError(
        "Please accept the terms to continue."
      );
    }

    return (
      Object.keys(errors).length === 0 &&
      acceptedTerms
    );
  };

  /* ========================================================
     CREATE CUSTOMER SESSION

     This must match the structure expected by:
     src/lib/customerSession.ts

     IMPORTANT:
     We save the session first and only then notify
     the header that the authentication state changed.
     ======================================================== */

  const createMockSession = (
    user: DemoUser,
    provider: DemoProvider
  ): boolean => {
    try {
      /* CUSTOMER PROFILE */

      const profile = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
      };

      /* CUSTOMER SESSION */

      const session = {
        user: profile,
        isAuthenticated: true,
        loginAt: new Date().toISOString(),
        provider,
        mode: "demo",
      };

      /* SAVE PROFILE */

      window.sessionStorage.setItem(
        USER_KEY,
        JSON.stringify(profile)
      );

      /* SAVE AUTHENTICATION SESSION */

      window.sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
      );

      /* NOTIFY SHARED AUTHENTICATION STORE */

      notifyCustomerSessionChanged();

      return true;
    } catch (sessionError) {
      console.error(
        "VizhaTickets registration session error:",
        sessionError
      );

      setError(
        "Unable to create your demo session. Please check your browser settings."
      );

      setIsSubmitting(false);

      return false;
    }
  };

  /* ========================================================
     REGISTER CUSTOMER
     ======================================================== */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const user: DemoUser = {
      id: `vizha-customer-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: "customer",
    };

    const created = createMockSession(
      user,
      "email"
    );

    if (created) {
      /* CLEAR SENSITIVE FORM FIELDS */

      setForm((current) => ({
        ...current,
        password: "",
        confirmPassword: "",
      }));

      /* REDIRECT WITHOUT RELOADING PAGE */

      navigate("/", {
        replace: true,
      });
    }
  };

  /* ========================================================
     GOOGLE DEMO REGISTRATION

     This does not connect to real Google OAuth.
     ======================================================== */

  const handleGoogleDemo = () => {
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    const created = createMockSession(
      GOOGLE_DEMO_USER,
      "google-demo"
    );

    if (created) {
      navigate("/", {
        replace: true,
      });
    }
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div className="vizha-register-page relative flex min-h-dvh min-w-0 flex-col bg-[#fff8f2] text-[#171717]">

      {/* ================================================
          ORIGINAL PAGE BACKGROUND
          ================================================ */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url("${REGISTER_BACKGROUND}")`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />

      {/* ================================================
          ORIGINAL WEBSITE HEADER AND TAMIL LOGO
          ================================================ */}

      <div className="relative z-30 w-full shrink-0">
        <Header />
      </div>

      {/* ================================================
          MAIN REGISTRATION AREA
          ================================================ */}

      <main className="vizha-register-main relative z-10 flex min-w-0 flex-1 items-center justify-center px-4 py-2 sm:px-6 lg:px-8">

        {/* ================================================
            REGISTRATION CARD
            ================================================ */}

        <motion.section
          aria-labelledby="vizha-register-title"
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
          className="vizha-register-card grid w-full max-w-265 min-w-0 overflow-hidden rounded-[26px] border border-[#f0e5d9] bg-white shadow-[0_20px_50px_rgba(110,54,12,0.17)] lg:grid-cols-[52%_48%]"
        >

          {/* ==============================================
              LEFT CINEMATIC PANEL
              ============================================== */}

          <div className="group/visual relative isolate hidden min-h-0 overflow-hidden bg-[#180b07] lg:flex lg:flex-col">

            {/* ORIGINAL THEATRE IMAGE */}

            <img
              src={REGISTER_PANEL_IMAGE}
              alt="Premium theatre seating and event ticket"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 group-hover/visual:scale-[1.025] motion-reduce:transform-none"
            />

            {/* DARK TEXT OVERLAY */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#120704]/65 via-[#160905]/20 to-transparent"
            />

            {/* LEFT CONTENT */}

            <div className="relative z-10 flex h-full flex-col justify-center px-8 py-5 xl:px-10">

              {/* BRAND LABEL */}

              <div className="mb-4 flex items-center gap-3">

                <span className="h-px w-8 bg-[#ffc34e]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.23em] text-white">
                  VizhaTickets
                </span>

                <span className="h-px w-8 bg-[#ffc34e]" />
              </div>

              {/* MAIN HEADLINE */}

              <h2 className="font-serif text-[clamp(2.4rem,3.25vw,3.5rem)] font-bold leading-[1.04] tracking-[-0.035em] text-white">
                Create Your

                <span className="block text-[#ffc343]">
                  Account
                </span>
              </h2>

              {/* DESCRIPTION */}

              <p className="mt-4 max-w-76.25 text-[13px] leading-[1.65] text-white/95">
                Join VizhaTickets and discover
                unforgettable experiences.
              </p>

              {/* FEATURE LIST */}

              <div className="mt-6 space-y-3">

                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.label}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-[#f5b928] bg-black/60 text-[#ffc343] shadow-[0_0_15px_rgba(241,155,25,0.18)]">
                        <Icon
                          size={18}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </div>

                      <span className="text-[12px] font-medium text-white">
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ==============================================
              RIGHT REGISTRATION FORM PANEL
              ============================================== */}

          <div className="vizha-register-form-panel flex min-w-0 flex-col justify-center bg-white px-5 py-4 sm:px-8 lg:px-7 lg:py-3 xl:px-9">

            <div className="mx-auto w-full max-w-98.75">

              {/* HEADING */}

              <div className="mb-3 text-center">

                <div className="mb-1.5 flex items-center justify-center gap-3">

                  <span className="h-px w-8 bg-linear-to-r from-transparent to-[#fa8d20]" />

                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ac3510]">
                    Create Account
                  </span>

                  <span className="h-px w-8 bg-linear-to-l from-transparent to-[#fa8d20]" />
                </div>

                <h1
                  id="vizha-register-title"
                  className="font-serif text-[clamp(1.85rem,2.5vw,2.4rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#15100d]"
                >
                  Join Vizha
                  <span className="text-[#e56a09]">
                    Tickets
                  </span>
                </h1>

                <p className="mx-auto mt-1 max-w-82.5 text-[11px] leading-[1.45] text-[#625c56]">
                  Create your account and start booking
                  amazing events today.
                </p>
              </div>

              {/* ========================================
                  FORM
                  ======================================== */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-2"
              >

                {/* FULL NAME */}

                <div>
                  <label
                    htmlFor="register-name"
                    className={labelStyle}
                  >
                    Full Name
                  </label>

                  <div className="relative">

                    <UserRound
                      size={16}
                      aria-hidden="true"
                      className={iconStyle}
                    />

                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      disabled={isSubmitting}
                      value={form.name}
                      onChange={(event) =>
                        updateField(
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="Enter your full name"
                      aria-invalid={Boolean(
                        fieldErrors.name
                      )}
                      aria-describedby={
                        fieldErrors.name
                          ? "register-name-error"
                          : undefined
                      }
                      className={inputStyle}
                    />
                  </div>

                  {fieldErrors.name && (
                    <p
                      id="register-name-error"
                      role="alert"
                      className={errorStyle}
                    >
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="register-email"
                    className={labelStyle}
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={16}
                      aria-hidden="true"
                      className={iconStyle}
                    />

                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      disabled={isSubmitting}
                      value={form.email}
                      onChange={(event) =>
                        updateField(
                          "email",
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      aria-invalid={Boolean(
                        fieldErrors.email
                      )}
                      aria-describedby={
                        fieldErrors.email
                          ? "register-email-error"
                          : undefined
                      }
                      className={inputStyle}
                    />
                  </div>

                  {fieldErrors.email && (
                    <p
                      id="register-email-error"
                      role="alert"
                      className={errorStyle}
                    >
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* PHONE NUMBER */}

                <div>
                  <label
                    htmlFor="register-phone"
                    className={labelStyle}
                  >
                    Phone Number{" "}
                    <span className="font-normal text-[#777]">
                      (Optional)
                    </span>
                  </label>

                  <div className="relative">

                    <Phone
                      size={16}
                      aria-hidden="true"
                      className={iconStyle}
                    />

                    <input
                      id="register-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      disabled={isSubmitting}
                      value={form.phone}
                      onChange={(event) =>
                        updateField(
                          "phone",
                          event.target.value
                        )
                      }
                      placeholder="+94 77 123 4567"
                      aria-invalid={Boolean(
                        fieldErrors.phone
                      )}
                      aria-describedby={
                        fieldErrors.phone
                          ? "register-phone-error"
                          : undefined
                      }
                      className={inputStyle}
                    />
                  </div>

                  {fieldErrors.phone && (
                    <p
                      id="register-phone-error"
                      role="alert"
                      className={errorStyle}
                    >
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* ======================================
                    PASSWORD FIELDS
                    ====================================== */}

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">

                  {/* PASSWORD */}

                  <div className="min-w-0">

                    <label
                      htmlFor="register-password"
                      className={labelStyle}
                    >
                      Password
                    </label>

                    <div className="relative">

                      <LockKeyhole
                        size={15}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#e9770b]"
                      />

                      <input
                        id="register-password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                        value={form.password}
                        onChange={(event) =>
                          updateField(
                            "password",
                            event.target.value
                          )
                        }
                        placeholder="Create password"
                        aria-invalid={Boolean(
                          fieldErrors.password
                        )}
                        aria-describedby={
                          fieldErrors.password
                            ? "register-password-error"
                            : undefined
                        }
                        className={`${inputStyle} pl-8 pr-8 text-[11px]`}
                      />

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        aria-pressed={showPassword}
                        className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#78371c] transition-colors hover:bg-[#fff0df] hover:text-[#e87809] focus-visible:outline-2 focus-visible:outline-[#e87809]"
                      >
                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>

                    {fieldErrors.password && (
                      <p
                        id="register-password-error"
                        role="alert"
                        className={errorStyle}
                      >
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div className="min-w-0">

                    <label
                      htmlFor="register-confirm"
                      className={labelStyle}
                    >
                      Confirm Password
                    </label>

                    <div className="relative">

                      <LockKeyhole
                        size={15}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#e9770b]"
                      />

                      <input
                        id="register-confirm"
                        type={
                          showConfirm
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                        value={form.confirmPassword}
                        onChange={(event) =>
                          updateField(
                            "confirmPassword",
                            event.target.value
                          )
                        }
                        placeholder="Re-enter password"
                        aria-invalid={Boolean(
                          fieldErrors.confirmPassword
                        )}
                        aria-describedby={
                          fieldErrors.confirmPassword
                            ? "register-confirm-error"
                            : undefined
                        }
                        className={`${inputStyle} pl-8 pr-8 text-[11px]`}
                      />

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          setShowConfirm(
                            (value) => !value
                          )
                        }
                        aria-label={
                          showConfirm
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        aria-pressed={showConfirm}
                        className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#78371c] transition-colors hover:bg-[#fff0df] hover:text-[#e87809] focus-visible:outline-2 focus-visible:outline-[#e87809]"
                      >
                        {showConfirm ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>

                    {fieldErrors.confirmPassword && (
                      <p
                        id="register-confirm-error"
                        role="alert"
                        className={errorStyle}
                      >
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* ======================================
                    PASSWORD STRENGTH
                    ====================================== */}

                {form.password && (
                  <div className="flex items-center gap-2">

                    <div className="grid w-20 grid-cols-4 gap-1">

                      {[1, 2, 3, 4].map((segment) => (
                        <span
                          key={segment}
                          className="h-1 rounded-full"
                          style={{
                            backgroundColor:
                              segment <=
                              passwordStrength.score
                                ? passwordStrength.color
                                : "#e9e5df",
                          }}
                        />
                      ))}
                    </div>

                    <span
                      className="text-[10px] font-semibold"
                      style={{
                        color: passwordStrength.color,
                      }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                )}

                {/* ======================================
                    TERMS AND PRIVACY
                    ====================================== */}

                <div className="flex items-start gap-2 py-0.5">

                  <input
                    id="register-terms"
                    type="checkbox"
                    required
                    checked={acceptedTerms}
                    onChange={(event) => {
                      setAcceptedTerms(
                        event.target.checked
                      );
                      setError("");
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#e87809]"
                  />

                  <label
                    htmlFor="register-terms"
                    className="text-[10px] leading-[1.45] text-[#45403b]"
                  >
                    I agree to the{" "}

                    <Link
                      to="/terms"
                      className="font-bold text-[#e56309] transition-colors hover:text-[#a93e06] hover:underline"
                    >
                      Terms of Service
                    </Link>

                    {" "}and{" "}

                    <Link
                      to="/privacy"
                      className="font-bold text-[#e56309] transition-colors hover:text-[#a93e06] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                {/* ======================================
                    GENERAL ERROR
                    ====================================== */}

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-[#f2b9b1] bg-[#fff4f2] px-3 py-2 text-[10px] leading-[1.4] text-[#b43d2e]"
                  >
                    <AlertCircle
                      size={14}
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    />

                    <span>{error}</span>
                  </div>
                )}

                {/* ======================================
                    CREATE ACCOUNT BUTTON
                    ====================================== */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full bg-linear-to-r from-[#ffad13] via-[#f68b04] to-[#ea5205] px-4 text-[13px] font-bold text-white shadow-[0_5px_14px_rgba(223,94,8,0.23)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_9px_22px_rgba(223,94,8,0.32)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e87809] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"
                >

                  {/* ANIMATED BUTTON SHINE */}

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:transform-none"
                  />

                  {isSubmitting ? (
                    <>
                      <LoaderCircle
                        size={17}
                        aria-hidden="true"
                        className="relative z-10 animate-spin"
                      />

                      <span className="relative z-10">
                        Creating Account...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">
                        Create Account
                      </span>

                      <ArrowRight
                        size={17}
                        aria-hidden="true"
                        className="relative z-10 transition-transform duration-300 group-hover:translate-x-1.5"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* ========================================
                  SOCIAL LOGIN DIVIDER
                  ======================================== */}

              <div className="my-2 flex items-center gap-3">

                <div className="h-px flex-1 bg-[#efdac8]" />

                <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-[#68605a]">
                  Or Continue With
                </span>

                <div className="h-px flex-1 bg-[#efdac8]" />
              </div>

              {/* ========================================
                  GOOGLE DEMO REGISTRATION
                  ======================================== */}

              <button
                type="button"
                onClick={handleGoogleDemo}
                disabled={isSubmitting}
                aria-label="Continue with Google demo account"
                className="group flex h-9.5 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#e3dedb] bg-white px-3 text-[12px] font-semibold text-[#252525] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e9ad76] hover:shadow-[0_6px_15px_rgba(201,121,11,0.12)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e87809] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GoogleIcon />

                <span>Continue with Google</span>

                <span className="rounded-full bg-[#fff0dd] px-2 py-0.5 text-[9px] font-bold text-[#a56613]">
                  Demo
                </span>
              </button>

              {/* ========================================
                  EXISTING CUSTOMER SIGN IN
                  ======================================== */}

              <p className="mt-2.5 text-center text-[11px] text-[#514943]">
                Already have an account?{" "}

                <Link
                  to="/login"
                  className="group inline-flex items-center gap-1 font-bold text-[#dc5c07] transition-colors duration-300 hover:text-[#a74405] hover:underline"
                >
                  Sign In

                  <ArrowRight
                    size={13}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </p>

              <p className="mt-1 text-center text-[9px] text-[#93877c]">
                Demo only — no real account is created.
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      {/* ================================================
          RESPONSIVE LAYOUT

          Keep the card naturally sized.
          Avoid introducing an inner scrollbar.
          Allow document scrolling when necessary.
          ================================================ */}

      <style>{`
        .vizha-register-page {
          width: 100%;
          min-width: 0;
          overflow-x: clip;
        }

        .vizha-register-card {
          height: auto;
        }

        @media (min-width: 1024px) and (min-height: 740px) {
          .vizha-register-page {
            min-height: 100dvh;
            height: 100dvh;
          }

          .vizha-register-main {
            flex: 1 1 0%;
            min-height: 0;
            padding-top: 8px;
            padding-bottom: 8px;
          }

          .vizha-register-card {
            min-height: 0;
          }

          .vizha-register-form-panel {
            min-height: 0;
          }
        }

        @media (min-width: 1024px) and (max-height: 739px) {
          .vizha-register-page {
            height: auto;
            min-height: 100dvh;
          }
        }

        @media (max-width: 1023px) {
          .vizha-register-page {
            height: auto;
            min-height: 100dvh;
          }

          .vizha-register-main {
            padding-top: 18px;
            padding-bottom: 18px;
          }

          .vizha-register-form-panel {
            padding-top: 28px;
            padding-bottom: 28px;
          }
        }
      `}</style>
    </div>
  );
}
