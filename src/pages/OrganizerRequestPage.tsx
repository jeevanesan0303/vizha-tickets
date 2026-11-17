
import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import PhoneInput, {
  getCountries,
  isValidPhoneNumber,
  type Country,
  type Value,
} from "react-phone-number-input";

import countryLabels from "react-phone-number-input/locale/en.json";

import "react-phone-number-input/style.css";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Globe2,
  Headphones,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

/* ==========================================================
   VIZHATICKETS — CONTACT & ORGANIZER REQUEST PAGE

   INTERNATIONAL PHONE & COUNTRY SUPPORT

   1. International country selector
   2. Automatic country calling codes
   3. International phone validation
   4. Complete country / region dropdown
   5. Event country dropdown
   6. E.164 phone number storage
   7. Existing Admin Requests integration
   8. Existing premium UI preserved

   ========================================================== */

/* ==========================================================
   ADMIN STORAGE
   ========================================================== */

const ADMIN_REQUESTS_KEY =
  "vizha_admin_requests_v1";

const ADMIN_DATA_CHANGED_EVENT =
  "vizha-admin-data-changed";

/* ==========================================================
   TYPES
   ========================================================== */

type EnquiryType =
  | "host-event"
  | "business"
  | "media"
  | "support"
  | "other";

type OrganizerType =
  | "individual"
  | "company";

type VenueLayout =
  | "undecided"
  | "general"
  | "standing"
  | "reserved"
  | "stadium";

type RequestType =
  | "Contact"
  | "Organizer";

type RequestStatus =
  | "New"
  | "In Review"
  | "Approved"
  | "Rejected"
  | "Resolved";

interface FormValues {
  enquiryType: EnquiryType;

  organizerType: OrganizerType;
  organizerName: string;
  companyName: string;

  email: string;

  // International E.164 phone number
  phone: Value | undefined;

  // ISO country codes
  organizerCountry: string;

  eventName: string;
  eventGenre: string;
  eventCountry: string;
  eventCity: string;
  venueName: string;

  eventDate: string;
  eventTime: string;

  ticketInventory: string;
  ticketPriceRange: string;
  ticketCategories: string;

  venueLayout: VenueLayout;

  websiteOrSocial: string;

  eventDescription: string;
  remarks: string;

  consent: boolean;

  website: string;
}

interface AdminRequest {
  id: string;
  type: RequestType;

  name: string;
  email: string;
  phone: string;

  subject: string;
  message: string;
  country: string;

  status: RequestStatus;
  createdAt: string;
}

/* ==========================================================
   INTERNATIONAL COUNTRY DATA

   Uses the countries supported by
   react-phone-number-input.

   Country names are displayed in English.
   Country values use ISO 3166-1 alpha-2 codes.

   ========================================================== */

const COUNTRY_LABELS =
  countryLabels as Record<string, string>;

interface CountryOption {
  code: Country;
  name: string;
}

const COUNTRY_OPTIONS: CountryOption[] =
  getCountries()
    .map((code) => ({
      code,
      name: COUNTRY_LABELS[code] ?? code,
    }))
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    );

/* ==========================================================
   COUNTRY HELPER
   ========================================================== */

function getCountryName(code: string): string {
  return COUNTRY_LABELS[code] ?? code;
}

/* ==========================================================
   INITIAL FORM
   ========================================================== */

const INITIAL_FORM: FormValues = {
  enquiryType: "host-event",

  organizerType: "individual",
  organizerName: "",
  companyName: "",

  email: "",
  phone: undefined,

  organizerCountry: "LK",

  eventName: "",
  eventGenre: "",
  eventCountry: "LK",
  eventCity: "",
  venueName: "",

  eventDate: "",
  eventTime: "",

  ticketInventory: "",
  ticketPriceRange: "",
  ticketCategories: "",

  venueLayout: "undecided",

  websiteOrSocial: "",

  eventDescription: "",
  remarks: "",

  consent: false,
  website: "",
};

/* ==========================================================
   ENQUIRY OPTIONS
   ========================================================== */

const ENQUIRY_TYPES: {
  value: EnquiryType;
  label: string;
}[] = [
  {
    value: "host-event",
    label: "I Want to Host My Event on VizhaTickets",
  },
  {
    value: "business",
    label: "Business & Partnership Enquiries",
  },
  {
    value: "media",
    label: "Media / Press Enquiries",
  },
  {
    value: "support",
    label: "Customer Support",
  },
  {
    value: "other",
    label: "Other Enquiries",
  },
];

/* ==========================================================
   EVENT GENRES
   ========================================================== */

const EVENT_GENRES = [
  "Music / Concert",
  "Cultural",
  "Comedy",
  "Theatre",
  "Sports",
  "Festival",
  "Workshop / Education",
  "Exhibition",
  "Corporate Event",
  "Other",
];

/* ==========================================================
   VENUE LAYOUTS
   ========================================================== */

const LAYOUTS: {
  value: VenueLayout;
  label: string;
}[] = [
  {
    value: "undecided",
    label: "Not Decided Yet",
  },
  {
    value: "general",
    label: "General Admission",
  },
  {
    value: "standing",
    label: "VIP / Gold / Standard Areas",
  },
  {
    value: "reserved",
    label: "Individual Reserved Seats",
  },
  {
    value: "stadium",
    label: "Stadium / Stand Selection",
  },
];

/* ==========================================================
   STYLING
   ========================================================== */

const INPUT_CLASS =
  "mt-2 h-12 w-full rounded-xl border " +
  "border-[#e9dfd2] bg-[#fffdfa] " +
  "px-4 text-[13px] text-[#30251b] " +
  "outline-none transition-all duration-300 " +
  "focus:border-[#c9790b] focus:bg-white " +
  "focus:ring-4 focus:ring-[#c9790b]/10 " +
  "hover:border-[#dcba8a] " +
  "placeholder:text-[#a29484] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const LABEL_CLASS =
  "block text-[12px] font-bold text-[#403024]";

const CARD_CLASS =
  "rounded-[22px] border border-[#e9dece] " +
  "bg-white p-5 shadow-sm " +
  "transition-shadow duration-300 " +
  "hover:shadow-[0_12px_35px_rgba(125,79,20,0.06)] " +
  "sm:p-7";

/* ==========================================================
   REUSABLE FORM FIELD
   ========================================================== */

function FormField({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className={LABEL_CLASS}>
        {label}

        {required && (
          <span className="ml-1 text-[#de760b]">
            *
          </span>
        )}
      </div>

      {children}

      {hint && (
        <p className="mt-1.5 text-[10px] leading-relaxed text-[#958473]">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ==========================================================
   REUSABLE COUNTRY SELECT

   Used for:
   - Organizer Country
   - Event Country

   ========================================================== */

function CountrySelect({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        required
        className={`${INPUT_CLASS} appearance-none pr-11 cursor-pointer`}
      >
        <option value="">
          Select your country
        </option>

        {COUNTRY_OPTIONS.map((country) => (
          <option
            key={country.code}
            value={country.code}
          >
            {country.name}
          </option>
        ))}
      </select>

      <ChevronDown
        size={18}
        className="
          pointer-events-none
          absolute right-4 top-6
          text-[#aa782d]
        "
      />
    </div>
  );
}

/* ==========================================================
   INTERNATIONAL PHONE INPUT

   Users can:
   - Select any supported country.
   - Select the corresponding calling code.
   - Enter their local mobile number.
   - Automatically get the international number.

   Example:
   Sri Lanka: +94 77 123 4567
   UK:        +44 77 1234 5678
   Switzerland: +41 79 123 45 67

   ========================================================== */

function InternationalPhoneInput({
  value,
  onChange,
  disabled = false,
}: {
  value: Value | undefined;
  onChange: (value: Value | undefined) => void;
  disabled?: boolean;
}) {
  return (
    <PhoneInput
      international
      defaultCountry="LK"
      value={value}
      onChange={onChange}
      disabled={disabled}
      countrySelectProps={{
        "aria-label": "Select phone country and calling code",
      }}
      numberInputProps={{
        autoComplete: "tel-national",
        placeholder: "77 123 4567",
        maxLength: 30,
        className:
          "PhoneInputInput min-w-0 flex-1 " +
          "border-0 bg-transparent px-2 " +
          "text-[13px] text-[#30251b] " +
          "outline-none placeholder:text-[#a29484] " +
          "focus:ring-0 disabled:cursor-not-allowed",
      }}
      className="
        vizha-international-phone
        mt-2 flex h-12 w-full items-center
        rounded-xl border border-[#e9dfd2]
        bg-[#fffdfa] px-3
        transition-all duration-300
        hover:border-[#dcba8a]
        focus-within:border-[#c9790b]
        focus-within:bg-white
        focus-within:ring-4
        focus-within:ring-[#c9790b]/10
      "
    />
  );
}

/* ==========================================================
   SECTION TITLE
   ========================================================== */

function SectionTitle({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div
      className="
        mb-5 flex items-start gap-3
        border-b border-[#f0e7dc] pb-4
      "
    >
      <div
        className="
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-xl bg-[#fff0d9]
          text-[#c9790b]
        "
      >
        <Icon size={19} />
      </div>

      <div>
        <p
          className="
            text-[10px] font-bold uppercase
            tracking-widest text-[#b97b25]
          "
        >
          Section {number}
        </p>

        <h2
          className="
            mt-0.5 text-[16px]
            font-bold text-[#281e16]
          "
        >
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-[11px] text-[#938171]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ==========================================================
   STORAGE HELPERS
   ========================================================== */

function generateRequestId(): string {
  const timestamp =
    Date.now().toString(36).toUpperCase();

  const random =
    crypto.randomUUID()
      .slice(0, 8)
      .toUpperCase();

  return `REQ-${timestamp}-${random}`;
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isAdminRequest(
  value: unknown
): value is AdminRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    (
      value.type === "Contact" ||
      value.type === "Organizer"
    ) &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.phone === "string" &&
    typeof value.subject === "string" &&
    typeof value.message === "string" &&
    typeof value.country === "string" &&
    typeof value.status === "string" &&
    typeof value.createdAt === "string"
  );
}

function readAdminRequests(): AdminRequest[] {
  try {
    const raw = window.localStorage.getItem(
      ADMIN_REQUESTS_KEY
    );

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error(
        "The existing request storage is invalid."
      );
    }

    if (!parsed.every(isAdminRequest)) {
      throw new Error(
        "The existing request storage contains invalid records."
      );
    }

    return parsed;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to read existing requests."
    );
  }
}

/* ==========================================================
   SAVE REQUEST

   Development mode only.

   ========================================================== */

function saveRequestToAdminPreview(
  request: AdminRequest
): void {
  if (!import.meta.env.DEV) {
    throw new Error(
      "Online enquiry submission is not available yet."
    );
  }

  const existing = readAdminRequests();

  if (
    existing.some(
      (item) => item.id === request.id
    )
  ) {
    throw new Error(
      "Duplicate request reference. Please try again."
    );
  }

  const next = [
    request,
    ...existing,
  ];

  try {
    window.localStorage.setItem(
      ADMIN_REQUESTS_KEY,
      JSON.stringify(next)
    );

    window.dispatchEvent(
      new Event(ADMIN_DATA_CHANGED_EVENT)
    );
  } catch {
    throw new Error(
      "Unable to save your test request. Please check browser storage."
    );
  }
}

/* ==========================================================
   LABEL HELPERS
   ========================================================== */

function enquiryLabel(
  type: EnquiryType
): string {
  return (
    ENQUIRY_TYPES.find(
      (item) => item.value === type
    )?.label ?? "General Enquiry"
  );
}

function venueLayoutLabel(
  layout: VenueLayout
): string {
  return (
    LAYOUTS.find(
      (item) => item.value === layout
    )?.label ?? "Not Decided Yet"
  );
}

function optional(
  value: string
): string {
  return value.trim() || "Not provided";
}

/* ==========================================================
   BUILD ADMIN REQUEST
   ========================================================== */

function buildAdminRequest(
  form: FormValues
): AdminRequest {
  const isEvent =
    form.enquiryType === "host-event";

  const type: RequestType =
    isEvent ? "Organizer" : "Contact";

  const organizerCountryName =
    getCountryName(form.organizerCountry);

  const eventCountryName =
    getCountryName(form.eventCountry);

  const internationalPhone =
    form.phone ?? "";

  const subject = isEvent
    ? form.eventName.trim()
    : enquiryLabel(form.enquiryType);

  const details: string[] = [];

  if (isEvent) {
    details.push(
      "EVENT ORGANIZER SUBMISSION",
      "",
      "ORGANIZER INFORMATION",
      "---------------------",
      `Organizer Type: ${
        form.organizerType === "company"
          ? "Company / Organization"
          : "Individual"
      }`,
      `Organizer Name: ${form.organizerName.trim()}`,
      `Company / Organization: ${
        form.organizerType === "company"
          ? optional(form.companyName)
          : "Not applicable"
      }`,
      `Email: ${form.email.trim().toLowerCase()}`,
      `Phone: ${internationalPhone}`,
      `Organizer Country: ${organizerCountryName}`,
      "",
      "EVENT INFORMATION",
      "-----------------",
      `Event Name: ${form.eventName.trim()}`,
      `Event Genre: ${form.eventGenre}`,
      `Event Country: ${eventCountryName}`,
      `Event City: ${form.eventCity.trim()}`,
      `Venue: ${optional(form.venueName)}`,
      `Proposed Date: ${
        form.eventDate || "Not confirmed"
      }`,
      `Proposed Time: ${
        form.eventTime || "Not confirmed"
      }`,
      "",
      "TICKETING REQUIREMENTS",
      "----------------------",
      `Estimated Inventory: ${
        optional(form.ticketInventory)
      }`,
      `Ticket Price Range: ${
        optional(form.ticketPriceRange)
      }`,
      `Ticket Categories: ${
        optional(form.ticketCategories)
      }`,
      `Venue / Seat Layout: ${
        venueLayoutLabel(form.venueLayout)
      }`,
      "",
      "EVENT DESCRIPTION",
      "-----------------",
      form.eventDescription.trim(),
      "",
      "ADDITIONAL INFORMATION",
      "----------------------",
      `Website / Social: ${
        optional(form.websiteOrSocial)
      }`,
      `Remarks: ${optional(form.remarks)}`,
      "",
      "Contact Consent: Accepted"
    );
  } else {
    details.push(
      "GENERAL CONTACT ENQUIRY",
      "",
      `Enquiry Category: ${
        enquiryLabel(form.enquiryType)
      }`,
      `Full Name: ${form.organizerName.trim()}`,
      `Email: ${form.email.trim().toLowerCase()}`,
      `Phone: ${internationalPhone}`,
      `Country: ${organizerCountryName}`,
      "",
      "MESSAGE",
      "-------",
      form.remarks.trim(),
      "",
      "Contact Consent: Accepted"
    );
  }

  return {
    id: generateRequestId(),

    type,

    name:
      isEvent &&
      form.organizerType === "company" &&
      form.companyName.trim()
        ? form.companyName.trim()
        : form.organizerName.trim(),

    email: form.email
      .trim()
      .toLowerCase(),

    // Always save international E.164 format
    phone: internationalPhone,

    subject,

    message: details.join("\n"),

    country: organizerCountryName,

    status: "New",

    createdAt: new Date().toISOString(),
  };
}

/* ==========================================================
   MAIN PAGE
   ========================================================== */

export default function OrganizerRequestPage() {
  const location = useLocation();

  const initialEnquiryType: EnquiryType =
    location.pathname === "/organizer-request"
      ? "host-event"
      : "other";

  const [form, setForm] =
    useState<FormValues>(() => ({
      ...INITIAL_FORM,
      enquiryType: initialEnquiryType,
    }));

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [reference, setReference] =
    useState<string | null>(null);

  const isEventRequest =
    form.enquiryType === "host-event";

  /* ========================================================
     FORM UPDATE
     ======================================================== */

  const update = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
  };

  /* ========================================================
     LOCAL DATE
     ======================================================== */

  const now = new Date();

  const todayLocal =
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, "0")}-` +
    `${String(now.getDate()).padStart(2, "0")}`;

  /* ========================================================
     VALIDATION
     ======================================================== */

  const validate = (): string => {
    if (form.organizerName.trim().length < 2) {
      return "Please enter your full name.";
    }

    if (
      isEventRequest &&
      form.organizerType === "company" &&
      form.companyName.trim().length < 2
    ) {
      return "Please enter your company or organization name.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (
      !form.phone ||
      !isValidPhoneNumber(form.phone)
    ) {
      return (
        "Please select your country calling code " +
        "and enter a valid international mobile number."
      );
    }

    if (!form.organizerCountry) {
      return "Please select your country / region.";
    }

    if (isEventRequest) {
      if (form.eventName.trim().length < 3) {
        return "Please enter your event name.";
      }

      if (!form.eventGenre) {
        return "Please select an event genre.";
      }

      if (!form.eventCountry) {
        return "Please select the event country.";
      }

      if (!form.eventCity.trim()) {
        return "Please enter the event city.";
      }

      if (
        form.eventDate &&
        form.eventDate < todayLocal
      ) {
        return "The proposed event date cannot be in the past.";
      }

      if (form.ticketInventory) {
        const inventory = Number(
          form.ticketInventory
        );

        if (
          !Number.isInteger(inventory) ||
          inventory < 1
        ) {
          return "Please enter a valid ticket quantity.";
        }
      }

      if (
        form.websiteOrSocial.trim() &&
        !/^https?:\/\/\S+\.\S+/i.test(
          form.websiteOrSocial.trim()
        )
      ) {
        return "Please enter a valid website or social media URL.";
      }

      if (
        form.eventDescription.trim().length < 20
      ) {
        return (
          "Please describe your event in at least " +
          "20 characters."
        );
      }
    } else {
      if (form.remarks.trim().length < 10) {
        return (
          "Please enter an enquiry message with at " +
          "least 10 characters."
        );
      }
    }

    if (!form.consent) {
      return "Please accept the contact consent.";
    }

    return "";
  };

  /* ========================================================
     SUBMIT
     ======================================================== */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submitting || submitted) {
      return;
    }

    setError("");

    // Honeypot
    if (form.website.trim()) {
      setError(
        "Unable to submit this request."
      );
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    // Production submission requires a backend.
    if (!import.meta.env.DEV) {
      setError(
        "Online enquiry submission is not available yet. " +
        "Please contact the VizhaTickets team through " +
        "an alternative contact channel."
      );
      return;
    }

    setSubmitting(true);

    try {
      const request =
        buildAdminRequest(form);

      saveRequestToAdminPreview(request);

      setReference(request.id);
      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save this request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ========================================================
     RESET
     ======================================================== */

  const resetForm = () => {
    setForm({
      ...INITIAL_FORM,
      enquiryType: initialEnquiryType,
    });

    setError("");
    setSubmitted(false);
    setReference(null);
  };

  /* ========================================================
     SUCCESS PAGE
     ======================================================== */

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fffaf2]">
        <Header />

        <main
          className="
            flex flex-1 items-center
            justify-center px-4 py-16
          "
        >
          <div
            className="
              w-full max-w-147.5
              rounded-[25px]
              border border-[#e9ddce]
              bg-white p-8 text-center
              shadow-[0_15px_45px_rgba(105,68,23,0.07)]
              sm:p-12
            "
          >
            <div
              className="
                mx-auto flex h-20 w-20
                items-center justify-center
                rounded-full bg-[#e8f8ed]
                text-[#278f49]
              "
            >
              <CheckCircle2 size={42} />
            </div>

            <p
              className="
                mt-5 text-[10px] font-bold
                uppercase tracking-[0.2em]
                text-[#b97b25]
              "
            >
              VizhaTickets Preview
            </p>

            <h1
              className="
                mt-3 font-serif
                text-[30px] font-bold
                text-[#251d15]
              "
            >
              Request Saved Successfully
            </h1>

            <p
              className="
                mt-4 text-[13px]
                leading-[1.9] text-[#857667]
              "
            >
              Your request has been saved in this
              browser's local development inbox.
              You can review it in the
              VizhaTickets Admin Dashboard under
              the Requests section.
            </p>

            {reference && (
              <div
                className="
                  mt-6 rounded-xl
                  border border-[#f0dfc4]
                  bg-[#fff4e4] p-4
                "
              >
                <p
                  className="
                    text-[10px] font-bold
                    uppercase tracking-wider
                    text-[#9b7649]
                  "
                >
                  Request Reference
                </p>

                <p
                  className="
                    mt-2 break-all font-mono
                    text-[14px] font-bold
                    text-[#b87516]
                  "
                >
                  {reference}
                </p>
              </div>
            )}

            <p
              className="
                mt-5 text-[11px]
                leading-relaxed text-[#a08b76]
              "
            >
              This is a frontend demonstration.
              The request has not been sent to
              a live server or to the VizhaTickets team.
            </p>

            <div
              className="
                mt-8 flex flex-wrap
                justify-center gap-3
              "
            >
              <Link
                to="/"
                className="
                  inline-flex items-center
                  justify-center rounded-full
                  bg-[#e88d0b] px-6 py-3
                  text-[12px] font-bold
                  text-white transition
                  hover:bg-[#c9790b]
                  hover:-translate-y-0.5
                "
              >
                Return Home
              </Link>

              <button
                type="button"
                onClick={resetForm}
                className="
                  rounded-full border
                  border-[#e5d6c3]
                  px-6 py-3 text-[12px]
                  font-bold transition
                  hover:bg-[#fff3df]
                "
              >
                New Enquiry
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* ========================================================
     MAIN PAGE
     ======================================================== */

  return (
    <div className="min-h-screen bg-[#fffaf2] text-[#211b15]">
      <Header />

      <main>
        {/* BREADCRUMB */}

        <div className="border-b border-[#eee5da] bg-white">
          <div
            className="
              vizha-container flex min-h-13.75
              items-center gap-2 text-[12px]
            "
          >
            <Link
              to="/"
              className="
                inline-flex items-center gap-2
                text-[#a86b15] transition
                hover:text-[#df8709]
              "
            >
              <ArrowLeft size={15} />
              Home
            </Link>

            <span className="text-[#aa9985]">
              /
            </span>

            <span className="font-semibold">
              Contact & Event Requests
            </span>
          </div>
        </div>

        {/* HERO */}

        <section
          className="
            relative overflow-hidden
            bg-[#17120d]
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute inset-0
              bg-cover bg-center opacity-25
            "
            style={{
              backgroundImage:
                "url('/images/about/organizer-banner.png')",
            }}
          />

          <div
            className="
              absolute inset-0
              bg-linear-to-r
              from-[#17120d]
              via-[#17120d]/90
              to-[#17120d]/65
            "
          />

          <div
            className="
              vizha-container relative z-10
              py-10 sm:py-12
            "
          >
            <div
              className="
                flex max-w-200
                items-start gap-4
              "
            >
              <div
                className="
                  hidden h-14 w-14
                  shrink-0 items-center
                  justify-center rounded-2xl
                  border border-[#9c711f]/50
                  bg-[#d98914]/15
                  text-[#ffaf2e] sm:flex
                "
              >
                <MessageSquare size={28} />
              </div>

              <div>
                <p
                  className="
                    flex items-center gap-2
                    text-[11px] font-bold
                    uppercase tracking-[0.14em]
                    text-[#ffae2a]
                  "
                >
                  <Sparkles size={15} />
                  Contact VizhaTickets
                </p>

                <h1
                  className="
                    mt-3 font-serif
                    text-[clamp(2rem,4vw,3rem)]
                    font-bold leading-[1.2]
                    text-white
                  "
                >
                  Let's Make Your Event{" "}
                  <span className="text-[#ffad2c]">
                    Happen.
                  </span>
                </h1>

                <p
                  className="
                    mt-3 max-w-170
                    text-[13px]
                    leading-[1.8] text-white/75
                  "
                >
                  Whether you're hosting an event,
                  exploring a partnership, or need
                  assistance, send us your enquiry
                  through the form below.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN FORM */}

        <section className="py-10 sm:py-14">
          <div className="vizha-container">
            <div
              className="
                grid items-start gap-7
                lg:grid-cols-[minmax(0,1fr)_300px]
                xl:grid-cols-[minmax(0,1fr)_330px]
              "
            >
              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="min-w-0 space-y-5"
              >
                {/* ENQUIRY TYPE */}

                <section className={CARD_CLASS}>
                  <div className="mb-5">
                    <p
                      className="
                        text-[11px] font-bold
                        uppercase tracking-wider
                        text-[#b77b27]
                      "
                    >
                      How Can We Help?
                    </p>

                    <h2
                      className="
                        mt-2 text-[20px]
                        font-bold
                      "
                    >
                      Submit Your Enquiry
                    </h2>

                    <p
                      className="
                        mt-2 text-[12px]
                        text-[#89786a]
                      "
                    >
                      Select your enquiry type.
                      The relevant fields will
                      appear automatically.
                    </p>
                  </div>

                  <FormField
                    label="Enquiry Type"
                    required
                  >
                    <div className="relative">
                      <select
                        value={form.enquiryType}
                        onChange={(event) =>
                          update(
                            "enquiryType",
                            event.target.value as EnquiryType
                          )
                        }
                        disabled={submitting}
                        className={`${INPUT_CLASS} appearance-none pr-11`}
                      >
                        {ENQUIRY_TYPES.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={18}
                        className="
                          pointer-events-none
                          absolute right-4 top-6
                          text-[#aa782d]
                        "
                      />
                    </div>
                  </FormField>
                </section>

                {/* ORGANIZER / CONTACT INFORMATION */}

                <section className={CARD_CLASS}>
                  <SectionTitle
                    number="01"
                    icon={Building2}
                    title={
                      isEventRequest
                        ? "Organizer Information"
                        : "Contact Information"
                    }
                    description="Tell us how we can reach you."
                  />

                  {isEventRequest && (
                    <div className="mb-5">
                      <div className={LABEL_CLASS}>
                        Organizer Type
                      </div>

                      <div
                        className="
                          mt-3 flex flex-wrap gap-3
                        "
                      >
                        {(
                          [
                            ["individual", "Individual"],
                            ["company", "Company / Organization"],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            disabled={submitting}
                            onClick={() =>
                              update(
                                "organizerType",
                                value
                              )
                            }
                            aria-pressed={
                              form.organizerType === value
                            }
                            className={`
                              rounded-full border
                              px-4 py-2.5
                              text-[12px] font-semibold
                              transition-all duration-300
                              hover:-translate-y-0.5
                              ${
                                form.organizerType === value
                                  ? "border-[#d18a1c] bg-[#fff0d9] text-[#ab6610]"
                                  : "border-[#e9ded0] bg-white text-[#756554] hover:border-[#e0b57b]"
                              }
                            `}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className="
                      grid gap-5 sm:grid-cols-2
                    "
                  >
                    <FormField
                      label={
                        isEventRequest
                          ? "Organizer Full Name"
                          : "Full Name"
                      }
                      required
                    >
                      <input
                        value={form.organizerName}
                        onChange={(event) =>
                          update(
                            "organizerName",
                            event.target.value
                          )
                        }
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        maxLength={120}
                        disabled={submitting}
                        className={INPUT_CLASS}
                      />
                    </FormField>

                    {isEventRequest && (
                      <FormField
                        label="Company / Organization"
                        required={
                          form.organizerType === "company"
                        }
                      >
                        <input
                          value={form.companyName}
                          onChange={(event) =>
                            update(
                              "companyName",
                              event.target.value
                            )
                          }
                          type="text"
                          placeholder="Company or organization name"
                          maxLength={160}
                          disabled={submitting}
                          className={INPUT_CLASS}
                        />
                      </FormField>
                    )}

                    <FormField
                      label="Email Address"
                      required
                    >
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          update(
                            "email",
                            event.target.value
                          )
                        }
                        placeholder="name@example.com"
                        autoComplete="email"
                        maxLength={254}
                        disabled={submitting}
                        className={INPUT_CLASS}
                      />
                    </FormField>

                    {/* INTERNATIONAL PHONE NUMBER */}

                    <FormField
                      label="Mobile Number"
                      required
                      hint="Select your country from the flag dropdown. The international calling code will be added automatically."
                    >
                      <InternationalPhoneInput
                        value={form.phone}
                        onChange={(value) =>
                          update("phone", value)
                        }
                        disabled={submitting}
                      />
                    </FormField>

                    {/* ORGANIZER COUNTRY */}

                    <FormField
                      label="Country / Region"
                      required
                    >
                      <CountrySelect
                        value={form.organizerCountry}
                        onChange={(value) =>
                          update(
                            "organizerCountry",
                            value
                          )
                        }
                        disabled={submitting}
                      />
                    </FormField>
                  </div>
                </section>

                {/* EVENT INFORMATION */}

                {isEventRequest && (
                  <>
                    <section className={CARD_CLASS}>
                      <SectionTitle
                        number="02"
                        icon={CalendarDays}
                        title="Event Information"
                        description="The details of your planned event."
                      />

                      <div
                        className="
                          grid gap-5 sm:grid-cols-2
                        "
                      >
                        <FormField
                          label="Event Name"
                          required
                        >
                          <input
                            value={form.eventName}
                            onChange={(event) =>
                              update(
                                "eventName",
                                event.target.value
                              )
                            }
                            placeholder="Name of your event"
                            maxLength={180}
                            disabled={submitting}
                            className={INPUT_CLASS}
                          />
                        </FormField>

                        <FormField
                          label="Event Genre"
                          required
                        >
                          <select
                            value={form.eventGenre}
                            onChange={(event) =>
                              update(
                                "eventGenre",
                                event.target.value
                              )
                            }
                            disabled={submitting}
                            className={INPUT_CLASS}
                          >
                            <option value="">
                              Select event genre
                            </option>

                            {EVENT_GENRES.map((genre) => (
                              <option
                                key={genre}
                                value={genre}
                              >
                                {genre}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        {/* EVENT COUNTRY */}

                        <FormField
                          label="Event Country"
                          required
                        >
                          <CountrySelect
                            value={form.eventCountry}
                            onChange={(value) =>
                              update(
                                "eventCountry",
                                value
                              )
                            }
                            disabled={submitting}
                          />
                        </FormField>

                        <FormField
                          label="Event City / Region"
                          required
                        >
                          <input
                            value={form.eventCity}
                            onChange={(event) =>
                              update(
                                "eventCity",
                                event.target.value
                              )
                            }
                            placeholder="Jaffna, London, Paris..."
                            maxLength={120}
                            disabled={submitting}
                            className={INPUT_CLASS}
                          />
                        </FormField>

                        <FormField label="Proposed Event Date">
                          <input
                            type="date"
                            min={todayLocal}
                            value={form.eventDate}
                            onChange={(event) =>
                              update(
                                "eventDate",
                                event.target.value
                              )
                            }
                            disabled={submitting}
                            className={INPUT_CLASS}
                          />
                        </FormField>

                        <FormField label="Proposed Start Time">
                          <input
                            type="time"
                            value={form.eventTime}
                            onChange={(event) =>
                              update(
                                "eventTime",
                                event.target.value
                              )
                            }
                            disabled={submitting}
                            className={INPUT_CLASS}
                          />
                        </FormField>

                        <div className="sm:col-span-2">
                          <FormField
                            label="Event Venue"
                            hint="Leave blank if not confirmed."
                          >
                            <input
                              value={form.venueName}
                              onChange={(event) =>
                                update(
                                  "venueName",
                                  event.target.value
                                )
                              }
                              placeholder="Venue name or location"
                              maxLength={200}
                              disabled={submitting}
                              className={INPUT_CLASS}
                            />
                          </FormField>
                        </div>
                      </div>

                      <div className="mt-5">
                        <FormField
                          label="Event Description"
                          required
                          hint="Minimum 20 characters."
                        >
                          <textarea
                            rows={4}
                            value={form.eventDescription}
                            onChange={(event) =>
                              update(
                                "eventDescription",
                                event.target.value
                              )
                            }
                            placeholder="Tell us about the event, performers, audience and event experience..."
                            maxLength={5000}
                            disabled={submitting}
                            className={`${INPUT_CLASS} h-auto min-h-28.75 resize-y py-3 leading-[1.7]`}
                          />
                        </FormField>
                      </div>
                    </section>

                    {/* TICKETING REQUIREMENTS */}

                    <section className={CARD_CLASS}>
                      <SectionTitle
                        number="03"
                        icon={Ticket}
                        title="Ticketing Requirements"
                        description="Approximate details are sufficient."
                      />

                      <div
                        className="
                          grid gap-5 sm:grid-cols-2
                        "
                      >
                        <FormField
                          label="Inventory to Sell"
                          hint="Estimated number of tickets."
                        >
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={form.ticketInventory}
                            onChange={(event) =>
                              update(
                                "ticketInventory",
                                event.target.value
                              )
                            }
                            placeholder="Example: 2500"
                            disabled={submitting}
                            className={INPUT_CLASS}
                          />
                        </FormField>

                        <FormField label="Ticket Price Range">
                          <input
                            value={form.ticketPriceRange}
                            onChange={(event) =>
                              update(
                                "ticketPriceRange",
                                event.target.value
                              )
                            }
                            placeholder="LKR 2,500 – 10,000"
                            maxLength={160}
                            disabled={submitting}
                            className={INPUT_CLASS}
                          />
                        </FormField>

                        <FormField label="Ticket Categories">
                          <input
                            value={form.ticketCategories}
                            onChange={(event) =>
                              update(
                                "ticketCategories",
                                event.target.value
                              )
                            }
                            placeholder="VIP, Gold, Silver, Standard"
                            maxLength={300}
                            disabled={submitting}
                            className={INPUT_CLASS}
                          />
                        </FormField>

                        <FormField label="Venue / Seat Layout">
                          <select
                            value={form.venueLayout}
                            onChange={(event) =>
                              update(
                                "venueLayout",
                                event.target.value as VenueLayout
                              )
                            }
                            disabled={submitting}
                            className={INPUT_CLASS}
                          >
                            {LAYOUTS.map((layout) => (
                              <option
                                key={layout.value}
                                value={layout.value}
                              >
                                {layout.label}
                              </option>
                            ))}
                          </select>
                        </FormField>
                      </div>
                    </section>
                  </>
                )}

                {/* ADDITIONAL DETAILS / MESSAGE */}

                <section className={CARD_CLASS}>
                  <SectionTitle
                    number={
                      isEventRequest ? "04" : "02"
                    }
                    icon={MessageSquare}
                    title={
                      isEventRequest
                        ? "Additional Details"
                        : "Your Message"
                    }
                    description={
                      isEventRequest
                        ? "Anything else our team should know?"
                        : "How can we assist you?"
                    }
                  />

                  {isEventRequest && (
                    <div className="mb-5">
                      <FormField label="Website / Social Media Link">
                        <input
                          type="url"
                          value={form.websiteOrSocial}
                          onChange={(event) =>
                            update(
                              "websiteOrSocial",
                              event.target.value
                            )
                          }
                          placeholder="https://..."
                          maxLength={500}
                          disabled={submitting}
                          className={INPUT_CLASS}
                        />
                      </FormField>
                    </div>
                  )}

                  <FormField
                    label={
                      isEventRequest
                        ? "Event Remarks / Special Requirements"
                        : "Enquiry Details"
                    }
                    required={!isEventRequest}
                  >
                    <textarea
                      rows={4}
                      value={form.remarks}
                      onChange={(event) =>
                        update(
                          "remarks",
                          event.target.value
                        )
                      }
                      placeholder={
                        isEventRequest
                          ? "Promotional support, international payment needs, event setup or other requirements..."
                          : "Write your message here..."
                      }
                      maxLength={5000}
                      disabled={submitting}
                      className={`${INPUT_CLASS} h-auto min-h-28.75 resize-y py-3 leading-[1.7]`}
                    />
                  </FormField>

                  {/* CONSENT */}

                  <label
                    className="
                      mt-6 flex cursor-pointer
                      items-start gap-3
                      rounded-xl border
                      border-[#eadac4]
                      bg-[#fff8ed] p-4
                    "
                  >
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(event) =>
                        update(
                          "consent",
                          event.target.checked
                        )
                      }
                      disabled={submitting}
                      className="
                        mt-1 h-4 w-4 shrink-0
                        accent-[#c9790b]
                      "
                    />

                    <span
                      className="
                        text-[11px] leading-[1.8]
                        text-[#6f5c48]
                      "
                    >
                      I confirm the information is accurate
                      and agree to be contacted by
                      VizhaTickets about this enquiry.

                      <span className="ml-1 text-[#dc7009]">
                        *
                      </span>
                    </span>
                  </label>

                  {/* HONEYPOT */}

                  <div
                    className="
                      absolute left-[-9999px]
                      h-px w-px overflow-hidden
                    "
                    aria-hidden="true"
                  >
                    <label htmlFor="vizha-form-website">
                      Leave empty
                    </label>

                    <input
                      id="vizha-form-website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(event) =>
                        update(
                          "website",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  {/* ERROR */}

                  {error && (
                    <div
                      role="alert"
                      className="
                        mt-5 flex items-start gap-2
                        rounded-xl border
                        border-red-200 bg-red-50
                        p-4 text-[12px]
                        leading-relaxed text-red-700
                      "
                    >
                      <Info
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{error}</span>
                    </div>
                  )}

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="
                      mt-6 flex min-h-12.75
                      w-full items-center
                      justify-center gap-2
                      rounded-full
                      bg-linear-to-r
                      from-[#f5a019]
                      to-[#dc7905]
                      px-6 text-[13px]
                      font-bold text-white
                      shadow-[0_8px_20px_rgba(201,121,11,0.18)]
                      transition-all duration-300
                      hover:-translate-y-0.5
                      hover:shadow-[0_12px_26px_rgba(201,121,11,0.25)]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {submitting ? (
                      <>
                        <span
                          className="
                            h-4 w-4 animate-spin
                            rounded-full border-2
                            border-white/30 border-t-white
                          "
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Send size={17} />

                        {isEventRequest
                          ? "Submit Event Request"
                          : "Send Enquiry"}

                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  <p
                    className="
                      mt-3 text-center
                      text-[10px] leading-relaxed
                      text-[#94816d]
                    "
                  >
                    {import.meta.env.DEV
                      ? "Frontend preview: submissions are stored locally in this browser for admin testing."
                      : "Live enquiry submission will be enabled when our submission service is connected."}
                  </p>
                </section>
              </form>

              {/* SIDEBAR */}

              <aside className="space-y-5 lg:sticky lg:top-27.5">
                {/* HOW IT WORKS */}

                <div
                  className="
                    overflow-hidden rounded-[22px]
                    border border-[#e8dcc9]
                    bg-white
                  "
                >
                  <div className="bg-[#17120d] p-5 text-white">
                    <div
                      className="
                        flex items-center gap-2
                        text-[#ffb02a]
                      "
                    >
                      <ClipboardList size={20} />

                      <h2 className="text-[15px] font-bold text-white">
                        How It Works
                      </h2>
                    </div>

                    <p
                      className="
                        mt-2 text-[11px]
                        leading-relaxed text-white/70
                      "
                    >
                      A straightforward way to connect
                      with the VizhaTickets team.
                    </p>
                  </div>

                  <div className="space-y-5 p-5">
                    {[
                      [
                        "01",
                        "Submit Your Enquiry",
                        "Complete and submit your details.",
                      ],
                      [
                        "02",
                        "Team Review",
                        "The team reviews submitted information.",
                      ],
                      [
                        "03",
                        "Get in Touch",
                        "The team contacts you about the next steps.",
                      ],
                    ].map(
                      ([number, title, description]) => (
                        <div
                          key={number}
                          className="flex gap-3"
                        >
                          <span
                            className="
                              flex h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-full
                              bg-[#fff0d8]
                              text-[11px] font-bold
                              text-[#b5751a]
                            "
                          >
                            {number}
                          </span>

                          <div>
                            <p className="text-[12px] font-bold">
                              {title}
                            </p>

                            <p
                              className="
                                mt-1 text-[11px]
                                leading-[1.7]
                                text-[#8a7868]
                              "
                            >
                              {description}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* WHY PARTNER */}

                <div
                  className="
                    rounded-[22px]
                    border border-[#e7d3b4]
                    bg-[#fff3df] p-5
                  "
                >
                  <div
                    className="
                      flex items-center gap-2
                      text-[#a36e20]
                    "
                  >
                    <BadgeCheck size={20} />

                    <h2 className="text-[14px] font-bold">
                      Why Partner With Us?
                    </h2>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div
                      className="
                        flex items-start gap-2
                        text-[11px] leading-[1.7]
                        text-[#806546]
                      "
                    >
                      <Ticket
                        size={16}
                        className="mt-0.5 shrink-0 text-[#bf7a15]"
                      />
                      Flexible event ticket categories
                      and pricing.
                    </div>

                    <div
                      className="
                        flex items-start gap-2
                        text-[11px] leading-[1.7]
                        text-[#806546]
                      "
                    >
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-[#bf7a15]"
                      />
                      Different seating, zone and
                      stadium layouts.
                    </div>

                    <div
                      className="
                        flex items-start gap-2
                        text-[11px] leading-[1.7]
                        text-[#806546]
                      "
                    >
                      <Globe2
                        size={16}
                        className="mt-0.5 shrink-0 text-[#bf7a15]"
                      />
                      Local and international
                      organizer enquiries.
                    </div>

                    <div
                      className="
                        flex items-start gap-2
                        text-[11px] leading-[1.7]
                        text-[#806546]
                      "
                    >
                      <ShieldCheck
                        size={16}
                        className="mt-0.5 shrink-0 text-[#bf7a15]"
                      />
                      Review and approval before
                      event publication.
                    </div>
                  </div>
                </div>

                {/* ASSISTANCE */}

                <div
                  className="
                    rounded-[22px]
                    border border-[#e8dcc9]
                    bg-white p-5
                  "
                >
                  <div className="flex items-center gap-2">
                    <Headphones
                      size={19}
                      className="text-[#c9790b]"
                    />

                    <h2 className="text-[14px] font-bold">
                      Need Assistance?
                    </h2>
                  </div>

                  <p
                    className="
                      mt-3 text-[11px]
                      leading-[1.8] text-[#887867]
                    "
                  >
                    For general questions, select
                    a contact enquiry type or visit
                    our contact page.
                  </p>

                  <Link
                    to="/contact"
                    className="
                      mt-4 inline-flex
                      items-center gap-2
                      text-[12px] font-bold
                      text-[#b77518]
                      transition hover:gap-3
                    "
                  >
                    <Mail size={15} />
                    Contact Us
                    <ArrowRight size={15} />
                  </Link>
                </div>

                {/* DISCLAIMER */}

                <div
                  className="
                    rounded-xl border
                    border-[#eadcc5]
                    bg-white p-4
                  "
                >
                  <div className="flex items-start gap-2">
                    <UsersRound
                      size={17}
                      className="mt-0.5 shrink-0 text-[#b67921]"
                    />

                    <p
                      className="
                        text-[10px] leading-[1.8]
                        text-[#917c65]
                      "
                    >
                      Event submission is a request for
                      review, not automatic approval,
                      publication or a confirmed
                      ticketing agreement.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
