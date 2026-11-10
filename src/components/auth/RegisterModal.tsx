
import { useState, type FormEvent } from "react";

import PhoneInput, {
  isValidPhoneNumber,
} from "react-phone-number-input";

import "react-phone-number-input/style.css";

import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuthModal } from "../../contexts/AuthModalContext";

import {
  saveCustomerSession,
  type Customer,
} from "../../lib/customerSession";

import { TicketArtwork } from "./LoginModal";

/* ==========================================================
   VIZHATICKETS — PREMIUM REGISTER MODAL

   React + Vite + TypeScript

   FEATURES
   - Original Tamil brand logo
   - Existing cinematic theatre artwork
   - Compact desktop registration popup
   - Mandatory international phone number
   - Country selector with country flags
   - Country-specific phone validation
   - International E.164 phone storage
   - Password visibility / strength
   - Confirm password validation
   - Terms agreement
   - Google demo registration
   - Existing shared customer session
   - Immediate header profile update

   IMPORTANT:
   Demo authentication only.
   No real Google OAuth or account creation.
   ========================================================== */

const BRAND_LOGO =
  "/images/branding/vizha-logo.png";

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

const initialForm: RegisterForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

/* ==========================================================
   GOOGLE DEMO USER
   ========================================================== */

const GOOGLE_DEMO_USER = {
  id: "vizha-google-demo-001",
  name: "Google Demo Customer",
  email: "google.demo@vizhatickets.lk",
  role: "customer" as const,
};

/* ==========================================================
   VALIDATION
   ========================================================== */

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validInternationalPhone(
  value: string
): boolean {
  if (!value.trim()) {
    return false;
  }

  try {
    return isValidPhoneNumber(value);
  } catch {
    return false;
  }
}

/* ==========================================================
   PASSWORD STRENGTH
   ========================================================== */

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

  if (/[^A-Za-z0-9]/.test(password)) {
    points++;
  }

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
   STYLES
   ========================================================== */

const fieldClass =
  "h-[35px] w-full min-w-0 rounded-full " +
  "border border-[#eadbd0] bg-white " +
  "pl-9 pr-3 text-[12px] text-[#29211c] " +
  "outline-none transition-all duration-300 " +
  "placeholder:text-[#978a7f] " +
  "hover:border-[#e7b17f] " +
  "focus:border-[#ed7b0b] " +
  "focus:ring-[3px] focus:ring-[#f9a53b]/15 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const iconClass =
  "pointer-events-none absolute left-3 top-1/2 " +
  "-translate-y-1/2 text-[#e9770b]";

const labelClass =
  "mb-0.5 block text-[10px] font-semibold " +
  "leading-[14px] text-[#33271e]";

const errorClass =
  "mt-0.5 text-[10px] leading-[1.3] text-red-600";

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
   REGISTER MODAL
   ========================================================== */

export default function RegisterModal() {
  const { closeModal, openLogin } =
    useAuthModal();

  const [form, setForm] =
    useState<RegisterForm>(initialForm);

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});

  const strength = getPasswordStrength(
    form.password
  );

  /* ========================================================
     UPDATE FORM FIELD
     ======================================================== */

  const update = (
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
     PHONE VALIDATION

     Used by both email registration and Google demo.
     ======================================================== */

  const validatePhone = (): boolean => {
    const phone = form.phone.trim();

    if (!phone) {
      setFieldErrors((current) => ({
        ...current,
        phone: "Phone number is required.",
      }));

      return false;
    }

    if (!validInternationalPhone(phone)) {
      setFieldErrors((current) => ({
        ...current,
        phone:
          "Enter a valid number for the selected country.",
      }));

      return false;
    }

    return true;
  };

  /* ========================================================
     VALIDATE ALL REGISTRATION FIELDS
     ======================================================== */

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    const name = form.name.trim();

    const email =
      form.email.trim().toLowerCase();

    const phone = form.phone.trim();

    if (name.length < 2) {
      errors.name =
        "Please enter your full name.";
    }

    if (!validEmail(email)) {
      errors.email =
        "Enter a valid email address.";
    }

    /* MANDATORY INTERNATIONAL PHONE */

    if (!phone) {
      errors.phone =
        "Phone number is required.";
    } else if (!validInternationalPhone(phone)) {
      errors.phone =
        "Enter a valid number for the selected country.";
    }

    /* PASSWORD */

    if (form.password.length < 8) {
      errors.password =
        "Use at least 8 characters.";
    } else if (
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/\d/.test(form.password)
    ) {
      errors.password =
        "Use uppercase, lowercase and a number.";
    }

    /* CONFIRM PASSWORD */

    if (!form.confirmPassword) {
      errors.confirmPassword =
        "Confirm your password.";
    } else if (
      form.password !==
      form.confirmPassword
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
     CREATE DEMO ACCOUNT
     ======================================================== */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    if (!validate()) return;

    setIsSubmitting(true);

    const customer: Customer = {
      id: `vizha-customer-${crypto.randomUUID()}`,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: "customer",
    };

    try {
      /* USE CENTRALIZED SESSION MANAGEMENT */

      const saved = saveCustomerSession(
        customer,
        "email"
      );

      if (!saved) {
        throw new Error(
          "Unable to save customer session."
        );
      }

      /* RESET FORM */

      setForm(initialForm);

      setAcceptedTerms(false);

      setFieldErrors({});

      setError("");

      setIsSubmitting(false);

      /* CLOSE POPUP */

      closeModal();
    } catch (sessionError) {
      console.error(
        "VizhaTickets registration error:",
        sessionError
      );

      setError(
        "Unable to create your demo session. Please check browser storage."
      );

      setIsSubmitting(false);
    }
  };

  /* ========================================================
     GOOGLE DEMO REGISTRATION

     Mandatory phone validation applies here too.
     No real Google OAuth is performed.
     ======================================================== */

  const googleDemo = () => {
    if (isSubmitting) return;

    setError("");

    /* REQUIRE PHONE FOR GOOGLE DEMO */

    if (!validatePhone()) {
      return;
    }

    /* REQUIRE TERMS AGREEMENT */

    if (!acceptedTerms) {
      setError(
        "Please accept the terms to continue."
      );

      return;
    }

    setIsSubmitting(true);

    const customer: Customer = {
      ...GOOGLE_DEMO_USER,
      phone: form.phone.trim(),
    };

    try {
      const saved = saveCustomerSession(
        customer,
        "google-demo"
      );

      if (!saved) {
        throw new Error(
          "Unable to save Google demo session."
        );
      }

      setIsSubmitting(false);

      closeModal();
    } catch (sessionError) {
      console.error(
        "VizhaTickets Google demo error:",
        sessionError
      );

      setError(
        "Unable to start Google demo session."
      );

      setIsSubmitting(false);
    }
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div className="vizha-register-modal-grid grid lg:grid-cols-[40%_60%]">

      {/* ==============================================
          LEFT SIDE — EXISTING THEATRE ARTWORK
          ============================================== */}

      <TicketArtwork variant="register" />

      {/* ==============================================
          RIGHT SIDE — REGISTRATION FORM
          ============================================== */}

      <div className="vizha-register-modal-panel flex min-w-0 flex-col justify-center bg-[linear-gradient(135deg,#fffdfb,#fff8f1)] px-5 py-4 sm:px-9 lg:px-8 lg:py-3">

        <div className="mx-auto w-full max-w-101.25">

          {/* ORIGINAL TAMIL LOGO */}

          <img
            src={BRAND_LOGO}
            alt="VizhaTickets"
            draggable={false}
            className="mx-auto mb-1 h-auto w-38.75 object-contain"
          />

          {/* HEADING */}

          <h2 className="text-center font-serif text-[clamp(1.5rem,2.4vw,1.85rem)] font-extrabold leading-tight tracking-[-0.04em] text-[#19130f]">
            Create Your Account
          </h2>

          <p className="mb-2 mt-0.5 text-center text-[11px] leading-normal text-[#625c55]">
            Join VizhaTickets and discover amazing events.
          </p>

          {/* ============================================
              REGISTRATION FORM
              ============================================ */}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-1.5"
          >

            {/* FULL NAME */}

            <div>
              <label
                htmlFor="modal-register-name"
                className={labelClass}
              >
                Full Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <UserRound
                  size={15}
                  aria-hidden="true"
                  className={iconClass}
                />

                <input
                  id="modal-register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={isSubmitting}
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(event) =>
                    update(
                      "name",
                      event.target.value
                    )
                  }
                  aria-invalid={Boolean(
                    fieldErrors.name
                  )}
                  aria-describedby={
                    fieldErrors.name
                      ? "modal-register-name-error"
                      : undefined
                  }
                  className={fieldClass}
                />
              </div>

              {fieldErrors.name && (
                <p
                  id="modal-register-name-error"
                  role="alert"
                  className={errorClass}
                >
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="modal-register-email"
                className={labelClass}
              >
                Email Address
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <Mail
                  size={15}
                  aria-hidden="true"
                  className={iconClass}
                />

                <input
                  id="modal-register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(event) =>
                    update(
                      "email",
                      event.target.value
                    )
                  }
                  aria-invalid={Boolean(
                    fieldErrors.email
                  )}
                  aria-describedby={
                    fieldErrors.email
                      ? "modal-register-email-error"
                      : undefined
                  }
                  className={fieldClass}
                />
              </div>

              {fieldErrors.email && (
                <p
                  id="modal-register-email-error"
                  role="alert"
                  className={errorClass}
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* ========================================
                MANDATORY INTERNATIONAL PHONE
                ======================================== */}

            <div className="vizha-register-phone-field">
              <label
                htmlFor="modal-register-phone"
                className={labelClass}
              >
                Phone Number
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <PhoneInput
                id="modal-register-phone"
                name="phone"
                international
                defaultCountry="LK"
                countryCallingCodeEditable={false}
                value={form.phone || undefined}
                onChange={(value) =>
                  update(
                    "phone",
                    value ?? ""
                  )
                }
                placeholder="Enter phone number"
                autoComplete="tel"
                required
                disabled={isSubmitting}
                aria-label="Phone number with international country code"
                aria-invalid={Boolean(
                  fieldErrors.phone
                )}
                aria-describedby={
                  fieldErrors.phone
                    ? "modal-register-phone-error"
                    : undefined
                }
              />

              {fieldErrors.phone && (
                <p
                  id="modal-register-phone-error"
                  role="alert"
                  className={errorClass}
                >
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* ========================================
                PASSWORD AND CONFIRM PASSWORD
                ======================================== */}

            <div className="grid grid-cols-2 gap-2">

              {/* PASSWORD */}

              <div className="min-w-0">
                <label
                  htmlFor="modal-register-password"
                  className={labelClass}
                >
                  Password
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#e9770b]"
                  />

                  <input
                    id="modal-register-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    placeholder="Create password"
                    value={form.password}
                    onChange={(event) =>
                      update(
                        "password",
                        event.target.value
                      )
                    }
                    aria-invalid={Boolean(
                      fieldErrors.password
                    )}
                    aria-describedby={
                      fieldErrors.password
                        ? "modal-register-password-error"
                        : undefined
                    }
                    className={`${fieldClass} pl-8 pr-8 text-[11px]`}
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
                    className="absolute right-0.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#78371c] transition-colors hover:bg-[#fff0df] hover:text-[#e87809]"
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
                    id="modal-register-password-error"
                    role="alert"
                    className={errorClass}
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="min-w-0">
                <label
                  htmlFor="modal-register-confirm"
                  className={labelClass}
                >
                  Confirm Password
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#e9770b]"
                  />

                  <input
                    id="modal-register-confirm"
                    name="confirmPassword"
                    type={
                      showConfirm
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      update(
                        "confirmPassword",
                        event.target.value
                      )
                    }
                    aria-invalid={Boolean(
                      fieldErrors.confirmPassword
                    )}
                    aria-describedby={
                      fieldErrors.confirmPassword
                        ? "modal-register-confirm-error"
                        : undefined
                    }
                    className={`${fieldClass} pl-8 pr-8 text-[11px]`}
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
                    className="absolute right-0.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#78371c] transition-colors hover:bg-[#fff0df] hover:text-[#e87809]"
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
                    id="modal-register-confirm-error"
                    role="alert"
                    className={errorClass}
                  >
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* PASSWORD STRENGTH */}

            {form.password && (
              <div className="flex items-center gap-2 pt-0.5">
                <div className="grid w-20 grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((segment) => (
                    <span
                      key={segment}
                      className="h-1 rounded-full"
                      style={{
                        backgroundColor:
                          segment <= strength.score
                            ? strength.color
                            : "#e9e5df",
                      }}
                    />
                  ))}
                </div>

                <span
                  className="text-[10px] font-semibold"
                  style={{
                    color: strength.color,
                  }}
                >
                  {strength.label}
                </span>
              </div>
            )}

            {/* TERMS */}

            <label className="flex cursor-pointer items-start gap-2 py-0.5 text-[10px] leading-[1.35] text-[#514943]">

              <input
                type="checkbox"
                checked={acceptedTerms}
                disabled={isSubmitting}
                onChange={(event) => {
                  setAcceptedTerms(
                    event.target.checked
                  );
                  setError("");
                }}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#e8790b]"
              />

              <span>
                I agree to the Terms of Service
                and Privacy Policy.
              </span>
            </label>

            {/* GENERAL ERROR */}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] leading-[1.35] text-red-700"
              >
                <AlertCircle
                  size={14}
                  className="mt-0.5 shrink-0"
                />

                {error}
              </div>
            )}

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex h-9.5 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#ffad13] via-[#f68b04] to-[#e94605] text-[12px] font-bold text-white shadow-[0_5px_14px_rgba(216,93,5,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* SOCIAL DIVIDER */}

          <div className="my-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e9ddd2]" />

            <span className="shrink-0 text-[10px] text-[#68625c]">
              or continue with
            </span>

            <div className="h-px flex-1 bg-[#e9ddd2]" />
          </div>

          {/* GOOGLE DEMO */}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={googleDemo}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#e8dcd1] bg-white text-[11px] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ed9c54] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />

            Continue with Google

            <span className="text-[9px] text-[#a66b24]">
              (Demo)
            </span>
          </button>

          {/* SWITCH TO LOGIN */}

          <p className="mt-2 text-center text-[11px] text-[#514942]">
            Already have an account?{" "}

            <button
              type="button"
              onClick={openLogin}
              className="font-bold text-[#dc5c07] transition-colors hover:text-[#a54205] hover:underline"
            >
              Sign In
            </button>
          </p>

          {/* FOOTNOTE */}

          <div className="mt-1 flex items-center justify-center gap-1.5 text-[9px] text-[#928273]">
            <ShieldCheck
              size={12}
              aria-hidden="true"
            />
            Demo registration only
          </div>
        </div>
      </div>

      {/* ==============================================
          COMPONENT-SCOPED STYLING
          ============================================== */}

      <style>{`
        .vizha-register-modal-grid {
          min-height: 0;
        }

        /* ===========================================
           INTERNATIONAL PHONE INPUT
           =========================================== */

        .vizha-register-phone-field .PhoneInput {
          display: flex;
          align-items: center;
          gap: 8px;

          width: 100%;
          height: 35px;
          min-height: 35px;

          padding: 0 12px;

          border: 1px solid #eadbd0;
          border-radius: 999px;

          background: #ffffff;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .vizha-register-phone-field .PhoneInput:hover {
          border-color: #e7b17f;
        }

        .vizha-register-phone-field
          .PhoneInput:focus-within {
          border-color: #ed7b0b;
          box-shadow: 0 0 0 3px rgba(249, 165, 59, 0.15);
        }

        .vizha-register-phone-field
          .PhoneInputCountry {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          margin-right: 4px;
        }

        .vizha-register-phone-field
          .PhoneInputCountryIcon {
          width: 23px;
          height: 16px;
          box-shadow: none;
        }

        .vizha-register-phone-field
          .PhoneInputCountryIconImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vizha-register-phone-field
          .PhoneInputCountrySelect {
          cursor: pointer;
        }

        .vizha-register-phone-field
          .PhoneInputCountrySelectArrow {
          width: 7px;
          height: 7px;
          color: #c9790b;
          opacity: 1;
        }

        .vizha-register-phone-field
          .PhoneInputInput {
          min-width: 0;
          width: 100%;
          height: 32px;
          padding: 0;

          border: 0;
          outline: none;

          background: transparent;

          color: #29211c;
          font-size: 12px;
          line-height: 1.4;
        }

        .vizha-register-phone-field
          .PhoneInputInput:focus {
          outline: none;
          box-shadow: none;
        }

        .vizha-register-phone-field
          .PhoneInputInput::placeholder {
          color: #978a7f;
        }

        .vizha-register-phone-field
          .PhoneInput--disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ===========================================
           DESKTOP MODAL HEIGHT
           =========================================== */

        @media (min-width: 1024px) {
          .vizha-register-modal-panel {
            padding-top: 10px;
            padding-bottom: 10px;
          }
        }

        @media (min-width: 1024px) and (max-height: 740px) {
          .vizha-register-modal-panel {
            padding-top: 8px;
            padding-bottom: 8px;
          }
        }

        /* ===========================================
           MOBILE / TABLET
           =========================================== */

        @media (max-width: 1023px) {
          .vizha-register-modal-panel {
            padding-top: 26px;
            padding-bottom: 26px;
          }
        }
      `}</style>
    </div>
  );
}
