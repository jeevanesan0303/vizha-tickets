
import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Link } from "react-router-dom";
import { isValidPhoneNumber } from "react-phone-number-input";

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
} from "lucide-react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

/* =========================================================
   VIZHATICKETS — ORGANIZER & CONTACT REQUEST

   Compact BookMyShow-style form, redesigned for
   VizhaTickets' premium cream-and-gold theme.

   - Enquiry category selector
   - Conditional event organizer fields
   - International phone validation
   - Company / individual support
   - Event details and ticket inventory
   - Ticketing and venue layout requirements
   - Optional social/website link
   - Consent and validation
   - API submission with real response handling

   API:
   /api/organizer-requests — event hosting enquiries
   /api/contact-enquiries   — general enquiries

   These API endpoints must exist on the backend.
   ========================================================= */

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

type FormValues = {
  enquiryType: EnquiryType;

  organizerType: OrganizerType;
  organizerName: string;
  companyName: string;

  email: string;
  phone: string;
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

  // Spam honeypot.
  website: string;
};

type ApiResponse = {
  success?: boolean;
  reference?: string;
  message?: string;
  error?: string;
};

const INITIAL_FORM: FormValues = {
  enquiryType: "host-event",

  organizerType: "individual",
  organizerName: "",
  companyName: "",

  email: "",
  phone: "",
  organizerCountry: "Sri Lanka",

  eventName: "",
  eventGenre: "",
  eventCountry: "Sri Lanka",
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

const INPUT_CLASS =
  "mt-2 h-12 w-full rounded-xl border border-[#e9dfd2] " +
  "bg-[#fffdfa] px-4 text-[13px] text-[#30251b] " +
  "outline-none transition focus:border-[#c9790b] " +
  "focus:bg-white focus:ring-4 focus:ring-[#c9790b]/10 " +
  "placeholder:text-[#a29484] disabled:opacity-60";

const LABEL_CLASS =
  "block text-[12px] font-bold text-[#403024]";

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
      <label className={LABEL_CLASS}>
        {label}
        {required && (
          <span className="ml-1 text-[#de760b]">
            *
          </span>
        )}
      </label>

      {children}

      {hint && (
        <p className="mt-1.5 text-[10px] leading-relaxed text-[#958473]">
          {hint}
        </p>
      )}
    </div>
  );
}

function SectionTitle({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: typeof CalendarDays;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-[#f0e7dc] pb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0d9] text-[#c9790b]">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#b97b25]">
          Section {number}
        </p>

        <h2 className="mt-0.5 text-[16px] font-bold text-[#281e16]">
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

export default function OrganizerRequestPage() {
 const [form, setForm] = useState<FormValues>(() => ({
  ...INITIAL_FORM,
  enquiryType:
    window.location.pathname === "/organizer-request"
      ? "host-event"
      : "other",
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

  const today = new Date();
  const todayLocal =
    `${today.getFullYear()}-` +
    `${String(today.getMonth() + 1).padStart(2, "0")}-` +
    `${String(today.getDate()).padStart(2, "0")}`;

  /* =======================================================
     VALIDATION
     ======================================================= */

  const validate = (): string => {
    if (form.organizerName.trim().length < 2) {
      return "Please enter your full name.";
    }

    if (
      isEventRequest &&
      form.organizerType === "company" &&
      form.companyName.trim().length < 2
    ) {
      return "Please enter your organization name.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (
      !form.phone.trim() ||
      !isValidPhoneNumber(form.phone.trim())
    ) {
      return (
        "Please enter a valid international phone " +
        "number including the country code."
      );
    }

    if (!form.organizerCountry.trim()) {
      return "Please enter your country.";
    }

    if (isEventRequest) {
      if (form.eventName.trim().length < 3) {
        return "Please enter your event name.";
      }

      if (!form.eventGenre) {
        return "Please select the event genre.";
      }

      if (!form.eventCountry.trim()) {
        return "Please enter the event country.";
      }

      if (!form.eventCity.trim()) {
        return "Please enter the event city.";
      }

      if (
        form.ticketInventory &&
        (
          !Number.isInteger(
            Number(form.ticketInventory)
          ) ||
          Number(form.ticketInventory) < 1
        )
      ) {
        return "Please enter a valid ticket quantity.";
      }

      if (
        form.eventDescription.trim().length < 20
      ) {
        return (
          "Please describe your event in at least " +
          "20 characters."
        );
      }
    } else if (
      form.remarks.trim().length < 10
    ) {
      return (
        "Please enter a message with at least " +
        "10 characters."
      );
    }

    if (!form.consent) {
      return "Please accept the contact consent.";
    }

    return "";
  };

  /* =======================================================
     SUBMISSION
     ======================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submitting || submitted) return;

    setError("");

    if (form.website.trim()) {
      setError("Unable to submit this request.");
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const endpoint = isEventRequest
      ? "/api/organizer-requests"
      : "/api/contact-enquiries";

    const base = {
      organizerName: form.organizerName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      contactCountry: form.organizerCountry.trim(),
      acceptedConsent: form.consent,
    };

    const payload = isEventRequest
      ? {
          ...base,

          organizerType: form.organizerType,
          companyName:
            form.organizerType === "company"
              ? form.companyName.trim()
              : null,

          eventName: form.eventName.trim(),
          eventCategory: form.eventGenre,

          proposedDate: form.eventDate || null,
          proposedTime: form.eventTime || null,

          eventCountry: form.eventCountry.trim(),
          eventCity: form.eventCity.trim(),
          venueName:
            form.venueName.trim() || null,

          expectedAttendance: form.ticketInventory
            ? Number(form.ticketInventory)
            : null,

          ticketPriceRange:
            form.ticketPriceRange.trim() || null,

          ticketCategories:
            form.ticketCategories.trim() || null,

          venueLayout: form.venueLayout,

          eventDescription:
            form.eventDescription.trim(),

          additionalRequirements:
            [
              form.websiteOrSocial.trim()
                ? `Website / Social: ${form.websiteOrSocial.trim()}`
                : "",
              form.remarks.trim(),
            ]
              .filter(Boolean)
              .join("\n") || null,

          website: "",
        }
      : {
          ...base,
          enquiryType: form.enquiryType,
          message: form.remarks.trim(),
          website: "",
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType =
        response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "The submission service is not available yet. " +
          "Please contact the VizhaTickets team."
        );
      }

      const result =
        (await response.json()) as ApiResponse;

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error ||
            result.message ||
            "Unable to submit your enquiry."
        );
      }

      setReference(
        typeof result.reference === "string"
          ? result.reference
          : null
      );

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     SUCCESS VIEW
     ======================================================= */

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fffaf2]">
        <Header />

        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-147.5 rounded-[25px] border border-[#e9ddce] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f8ed] text-[#278f49]">
              <CheckCircle2 size={42} />
            </div>

            <h1 className="mt-6 font-serif text-[30px] font-bold">
              Request Received
            </h1>

            <p className="mt-4 text-[13px] leading-[1.9] text-[#857667]">
              Your enquiry has been accepted by
              our submission service. Our team
              can now review your request.
            </p>

            {reference && (
              <div className="mt-6 rounded-xl bg-[#fff4e4] p-4">
                <p className="text-[10px] font-bold uppercase text-[#9b7649]">
                  Request Reference
                </p>

                <p className="mt-2 break-all font-mono text-[15px] font-bold text-[#b87516]">
                  {reference}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="rounded-full bg-[#e88d0b] px-6 py-3 text-[12px] font-bold text-white"
              >
                Return Home
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setReference(null);
                  setForm({ ...INITIAL_FORM });
                }}
                className="rounded-full border border-[#e5d6c3] px-6 py-3 text-[12px] font-bold"
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

  /* =======================================================
     MAIN PAGE
     ======================================================= */

  return (
    <div className="min-h-screen bg-[#fffaf2] text-[#211b15]">
      <Header />

      <main>
        {/* BREADCRUMB */}

        <div className="border-b border-[#eee5da] bg-white">
          <div className="vizha-container flex min-h-13.75 items-center gap-2 text-[12px]">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#a86b15]"
            >
              <ArrowLeft size={15} />
              Home
            </Link>

            <span className="text-[#aa9985]">/</span>

            <span className="font-semibold">
              Contact & Event Requests
            </span>
          </div>
        </div>

        {/* HEADER */}

        <section className="relative overflow-hidden bg-[#17120d]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{
              backgroundImage:
                "url('/images/about/organizer-banner.png')",
            }}
          />

          <div className="absolute inset-0 bg-linear-to-r from-[#17120d] via-[#17120d]/90 to-[#17120d]/65" />

          <div className="vizha-container relative z-10 py-10 sm:py-12">
            <div className="flex max-w-200 items-start gap-4">
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#9c711f]/50 bg-[#d98914]/15 text-[#ffaf2e] sm:flex">
                <MessageSquare size={28} />
              </div>

              <div>
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ffae2a]">
                  <Sparkles size={15} />
                  Contact VizhaTickets
                </p>

                <h1 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.2] text-white">
                  Let's Make Your Event
                  <span className="text-[#ffad2c]">
                    {" "}Happen.
                  </span>
                </h1>

                <p className="mt-3 max-w-170 text-[13px] leading-[1.8] text-white/75">
                  Whether you're hosting an event,
                  exploring a partnership, or need
                  assistance, send us your enquiry
                  through the form below.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}

        <section className="py-10 sm:py-14">
          <div className="vizha-container">
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_330px]">
              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="min-w-0 space-y-5"
              >
                {/* ENQUIRY TYPE */}

                <section className="rounded-[22px] border border-[#e9dece] bg-white p-5 shadow-sm sm:p-7">
                  <div className="mb-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#b77b27]">
                      How Can We Help?
                    </p>

                    <h2 className="mt-2 text-[20px] font-bold">
                      Submit Your Enquiry
                    </h2>

                    <p className="mt-2 text-[12px] text-[#89786a]">
                      Select the type of enquiry to
                      display the relevant form.
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
                        className="pointer-events-none absolute right-4 top-6 text-[#aa782d]"
                      />
                    </div>
                  </FormField>
                </section>

                {/* ORGANIZER / CONTACT DETAILS */}

                <section className="rounded-[22px] border border-[#e9dece] bg-white p-5 shadow-sm sm:p-7">
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
                      <label className={LABEL_CLASS}>
                        Organizer Type
                      </label>

                      <div className="mt-3 flex flex-wrap gap-3">
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
                              update("organizerType", value)
                            }
                            aria-pressed={
                              form.organizerType === value
                            }
                            className={`rounded-full border px-4 py-2.5 text-[12px] font-semibold transition ${
                              form.organizerType === value
                                ? "border-[#d18a1c] bg-[#fff0d9] text-[#ab6610]"
                                : "border-[#e9ded0] bg-white text-[#756554] hover:border-[#e0b57b]"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
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
                          update("email", event.target.value)
                        }
                        placeholder="name@example.com"
                        autoComplete="email"
                        maxLength={254}
                        disabled={submitting}
                        className={INPUT_CLASS}
                      />
                    </FormField>

                    <FormField
                      label="Mobile Number"
                      required
                      hint="Include the international country code, e.g. +94 or +44."
                    >
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          update("phone", event.target.value)
                        }
                        placeholder="+94 77 123 4567"
                        autoComplete="tel"
                        maxLength={30}
                        disabled={submitting}
                        className={INPUT_CLASS}
                      />
                    </FormField>

                    <FormField
                      label="Country / Region"
                      required
                    >
                      <input
                        type="text"
                        value={form.organizerCountry}
                        onChange={(event) =>
                          update(
                            "organizerCountry",
                            event.target.value
                          )
                        }
                        placeholder="Sri Lanka"
                        autoComplete="country-name"
                        maxLength={100}
                        disabled={submitting}
                        className={INPUT_CLASS}
                      />
                    </FormField>
                  </div>
                </section>

                {/* EVENT INFORMATION */}

                {isEventRequest && (
                  <>
                    <section className="rounded-[22px] border border-[#e9dece] bg-white p-5 shadow-sm sm:p-7">
                      <SectionTitle
                        number="02"
                        icon={CalendarDays}
                        title="Event Information"
                        description="The details of your planned event."
                      />

                      <div className="grid gap-5 sm:grid-cols-2">
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

                        <FormField
                          label="Event Country"
                          required
                        >
                          <input
                            value={form.eventCountry}
                            onChange={(event) =>
                              update(
                                "eventCountry",
                                event.target.value
                              )
                            }
                            placeholder="Sri Lanka"
                            maxLength={100}
                            disabled={submitting}
                            className={INPUT_CLASS}
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

                    {/* TICKETING */}

                    <section className="rounded-[22px] border border-[#e9dece] bg-white p-5 shadow-sm sm:p-7">
                      <SectionTitle
                        number="03"
                        icon={Ticket}
                        title="Ticketing Requirements"
                        description="Approximate details are sufficient."
                      />

                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          label="Inventory to Sell"
                          hint="Estimated total number of tickets."
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

                {/* ADDITIONAL DETAILS */}

                <section className="rounded-[22px] border border-[#e9dece] bg-white p-5 shadow-sm sm:p-7">
                  <SectionTitle
                    number={isEventRequest ? "04" : "02"}
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

                  <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[#eadac4] bg-[#fff8ed] p-4">
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
                      className="mt-1 h-4 w-4 shrink-0 accent-[#c9790b]"
                    />

                    <span className="text-[11px] leading-[1.8] text-[#6f5c48]">
                      I confirm the information is
                      accurate and agree to be contacted
                      by VizhaTickets about this enquiry.
                      <span className="ml-1 text-[#dc7009]">
                        *
                      </span>
                    </span>
                  </label>

                  {/* HONEYPOT */}

                  <div
                    className="absolute left-[-9999px]"
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
                      className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-[12px] leading-relaxed text-red-700"
                    >
                      <Info
                        size={17}
                        className="mt-0.5 shrink-0"
                      />
                      {error}
                    </div>
                  )}

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 flex min-h-12.75 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#f5a019] to-[#dc7905] px-6 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(201,121,11,0.18)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Submitting...
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

                  <p className="mt-3 text-center text-[10px] leading-relaxed text-[#94816d]">
                    No request is considered submitted
                    until our server confirms receipt.
                  </p>
                </section>
              </form>

              {/* INFORMATION SIDEBAR */}

              <aside className="space-y-5 lg:sticky lg:top-27.5">
                <div className="overflow-hidden rounded-[22px] border border-[#e8dcc9] bg-white">
                  <div className="bg-[#17120d] p-5 text-white">
                    <div className="flex items-center gap-2 text-[#ffb02a]">
                      <ClipboardList size={20} />
                      <h2 className="text-[15px] font-bold text-white">
                        How It Works
                      </h2>
                    </div>

                    <p className="mt-2 text-[11px] leading-relaxed text-white/70">
                      A straightforward way to connect
                      with the VizhaTickets team.
                    </p>
                  </div>

                  <div className="space-y-5 p-5">
                    {[
                      [
                        "01",
                        "Submit Your Enquiry",
                        "Fill in the information and send your request.",
                      ],
                      [
                        "02",
                        "Team Review",
                        "Our team reviews the submitted details.",
                      ],
                      [
                        "03",
                        "Get in Touch",
                        "We'll use your contact information to discuss the next steps.",
                      ],
                    ].map(([number, title, description]) => (
                      <div
                        key={number}
                        className="flex gap-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0d8] text-[11px] font-bold text-[#b5751a]">
                          {number}
                        </span>

                        <div>
                          <p className="text-[12px] font-bold">
                            {title}
                          </p>

                          <p className="mt-1 text-[11px] leading-[1.7] text-[#8a7868]">
                            {description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#e7d3b4] bg-[#fff3df] p-5">
                  <div className="flex items-center gap-2 text-[#a36e20]">
                    <BadgeCheck size={20} />
                    <h2 className="text-[14px] font-bold">
                      Why Partner With Us?
                    </h2>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-2 text-[11px] leading-[1.7] text-[#806546]">
                      <Ticket
                        size={16}
                        className="mt-0.5 shrink-0 text-[#bf7a15]"
                      />
                      Flexible event ticket categories
                      and pricing.
                    </div>

                    <div className="flex items-start gap-2 text-[11px] leading-[1.7] text-[#806546]">
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-[#bf7a15]"
                      />
                      Different seating, zone and
                      stadium layouts.
                    </div>

                    <div className="flex items-start gap-2 text-[11px] leading-[1.7] text-[#806546]">
                      <Globe2
                        size={16}
                        className="mt-0.5 shrink-0 text-[#bf7a15]"
                      />
                      Local and international
                      organizer enquiries.
                    </div>

                    <div className="flex items-start gap-2 text-[11px] leading-[1.7] text-[#806546]">
                      <ShieldCheck
                        size={16}
                        className="mt-0.5 shrink-0 text-[#bf7a15]"
                      />
                      Review and approval before
                      event publication.
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#e8dcc9] bg-white p-5">
                  <div className="flex items-center gap-2">
                    <Headphones
                      size={19}
                      className="text-[#c9790b]"
                    />

                    <h2 className="text-[14px] font-bold">
                      Need Assistance?
                    </h2>
                  </div>

                  <p className="mt-3 text-[11px] leading-[1.8] text-[#887867]">
                    For general questions, use the
                    enquiry dropdown or visit our
                    contact page.
                  </p>

                  <Link
                    to="/contact"
                    className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold text-[#b77518]"
                  >
                    Contact Us
                    <ArrowRight size={15} />
                  </Link>
                </div>

                <div className="rounded-xl border border-[#eadcc5] bg-white p-4">
                  <div className="flex items-start gap-2">
                    <UsersRound
                      size={17}
                      className="mt-0.5 shrink-0 text-[#b67921]"
                    />

                    <p className="text-[10px] leading-[1.8] text-[#917c65]">
                      Event submission is a request
                      for review, not automatic approval
                      or a confirmed ticketing agreement.
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
