import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ContactRound,
  ImagePlus,
  Info,
  Save,
  ShieldCheck,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import "./OrganizerForm.css";

/* ==========================================================
   VIZHATICKETS — ADVANCED ORGANIZER FORM

   Features:
   - Company and Individual organizers
   - Five-step organizer onboarding
   - International country selection
   - International phone calling codes
   - International WhatsApp numbers
   - Logo upload and local preview
   - Contact and address information
   - Commercial agreement configuration
   - Verification and organizer status
   - Save Draft / Save Organizer
   - Existing organizer editing

   Phone numbers are saved with their international prefix.
   Example: +94771234567

   Logo previews are browser-local data URLs.
   Use backend/object storage for permanent hosting.
   ========================================================== */

export type OrganizerType = "Individual" | "Company";

export type OrganizerStatus =
  | "Draft"
  | "Active"
  | "Suspended"
  | "Inactive";

export type VerificationStatus =
  | "Not Started"
  | "Under Review"
  | "Verified"
  | "Rejected";

export type SettlementSchedule =
  | "After Event"
  | "Weekly"
  | "Monthly"
  | "Custom";

export interface AdvancedOrganizer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  commission: number;
  createdAt: string;

  organizerType: OrganizerType;
  displayName: string;
  logo: string;
  registrationNumber: string;
  website: string;
  description: string;

  contactPosition: string;
  whatsapp: string;
  financeContactName: string;
  financeContactEmail: string;

  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;

  settlementCurrency: string;
  settlementSchedule: SettlementSchedule;
  customSettlementTerms: string;
  agreementDate: string;

  verificationStatus: VerificationStatus;
  status: OrganizerStatus;
  adminNotes: string;
}

export interface OrganizerFormProps {
  initialOrganizer?: Partial<AdvancedOrganizer> | null;
  onSave: (
    organizer: AdvancedOrganizer
  ) => boolean | void | Promise<boolean | void>;
  onClose: () => void;
}

type OrganizerDraft = Omit<
  AdvancedOrganizer,
  "id" | "createdAt"
>;

type CountryOption = {
  name: string;
  code: string;
  dial: string;
};

/* ==========================================================
   INTERNATIONAL COUNTRY LIST
   ========================================================== */

const COUNTRIES: CountryOption[] = [
  { name: "Afghanistan", code: "AF", dial: "+93" },
  { name: "Albania", code: "AL", dial: "+355" },
  { name: "Algeria", code: "DZ", dial: "+213" },
  { name: "Argentina", code: "AR", dial: "+54" },
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "Austria", code: "AT", dial: "+43" },
  { name: "Bahrain", code: "BH", dial: "+973" },
  { name: "Bangladesh", code: "BD", dial: "+880" },
  { name: "Belgium", code: "BE", dial: "+32" },
  { name: "Bhutan", code: "BT", dial: "+975" },
  { name: "Brazil", code: "BR", dial: "+55" },
  { name: "Brunei", code: "BN", dial: "+673" },
  { name: "Cambodia", code: "KH", dial: "+855" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "Chile", code: "CL", dial: "+56" },
  { name: "China", code: "CN", dial: "+86" },
  { name: "Colombia", code: "CO", dial: "+57" },
  { name: "Croatia", code: "HR", dial: "+385" },
  { name: "Cyprus", code: "CY", dial: "+357" },
  { name: "Czechia", code: "CZ", dial: "+420" },
  { name: "Denmark", code: "DK", dial: "+45" },
  { name: "Egypt", code: "EG", dial: "+20" },
  { name: "Estonia", code: "EE", dial: "+372" },
  { name: "Ethiopia", code: "ET", dial: "+251" },
  { name: "Finland", code: "FI", dial: "+358" },
  { name: "France", code: "FR", dial: "+33" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "Ghana", code: "GH", dial: "+233" },
  { name: "Greece", code: "GR", dial: "+30" },
  { name: "Hong Kong", code: "HK", dial: "+852" },
  { name: "Hungary", code: "HU", dial: "+36" },
  { name: "Iceland", code: "IS", dial: "+354" },
  { name: "India", code: "IN", dial: "+91" },
  { name: "Indonesia", code: "ID", dial: "+62" },
  { name: "Iran", code: "IR", dial: "+98" },
  { name: "Iraq", code: "IQ", dial: "+964" },
  { name: "Ireland", code: "IE", dial: "+353" },
  { name: "Israel", code: "IL", dial: "+972" },
  { name: "Italy", code: "IT", dial: "+39" },
  { name: "Japan", code: "JP", dial: "+81" },
  { name: "Jordan", code: "JO", dial: "+962" },
  { name: "Kenya", code: "KE", dial: "+254" },
  { name: "Kuwait", code: "KW", dial: "+965" },
  { name: "Laos", code: "LA", dial: "+856" },
  { name: "Latvia", code: "LV", dial: "+371" },
  { name: "Lebanon", code: "LB", dial: "+961" },
  { name: "Lithuania", code: "LT", dial: "+370" },
  { name: "Luxembourg", code: "LU", dial: "+352" },
  { name: "Malaysia", code: "MY", dial: "+60" },
  { name: "Maldives", code: "MV", dial: "+960" },
  { name: "Malta", code: "MT", dial: "+356" },
  { name: "Mauritius", code: "MU", dial: "+230" },
  { name: "Mexico", code: "MX", dial: "+52" },
  { name: "Myanmar", code: "MM", dial: "+95" },
  { name: "Nepal", code: "NP", dial: "+977" },
  { name: "Netherlands", code: "NL", dial: "+31" },
  { name: "New Zealand", code: "NZ", dial: "+64" },
  { name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Norway", code: "NO", dial: "+47" },
  { name: "Oman", code: "OM", dial: "+968" },
  { name: "Pakistan", code: "PK", dial: "+92" },
  { name: "Philippines", code: "PH", dial: "+63" },
  { name: "Poland", code: "PL", dial: "+48" },
  { name: "Portugal", code: "PT", dial: "+351" },
  { name: "Qatar", code: "QA", dial: "+974" },
  { name: "Romania", code: "RO", dial: "+40" },
  { name: "Russia", code: "RU", dial: "+7" },
  { name: "Saudi Arabia", code: "SA", dial: "+966" },
  { name: "Singapore", code: "SG", dial: "+65" },
  { name: "South Africa", code: "ZA", dial: "+27" },
  { name: "South Korea", code: "KR", dial: "+82" },
  { name: "Spain", code: "ES", dial: "+34" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },
  { name: "Sweden", code: "SE", dial: "+46" },
  { name: "Switzerland", code: "CH", dial: "+41" },
  { name: "Taiwan", code: "TW", dial: "+886" },
  { name: "Thailand", code: "TH", dial: "+66" },
  { name: "Turkey", code: "TR", dial: "+90" },
  { name: "Ukraine", code: "UA", dial: "+380" },
  { name: "United Arab Emirates", code: "AE", dial: "+971" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "United States", code: "US", dial: "+1" },
  { name: "Vietnam", code: "VN", dial: "+84" },
];

const STEPS = [
  { title: "Organization", icon: Building2 },
  { title: "Contact Details", icon: ContactRound },
  { title: "Commercial", icon: Wallet },
  { title: "Verification", icon: ShieldCheck },
  { title: "Review & Save", icon: ClipboardCheck },
] as const;

const CURRENCIES = [
  "LKR",
  "GBP",
  "EUR",
  "CHF",
  "USD",
  "INR",
  "CAD",
  "AUD",
];

const MAX_LOGO_BYTES = 250 * 1024;

/* ==========================================================
   HELPERS
   ========================================================== */

function generateId(): string {
  return `ORG-${crypto.randomUUID()}`;
}

function getInitialDraft(
  organizer?: Partial<AdvancedOrganizer> | null
): OrganizerDraft {
  return {
    name: organizer?.name ?? "",
    contactName: organizer?.contactName ?? "",
    email: organizer?.email ?? "",
    phone: organizer?.phone ?? "",
    country: organizer?.country ?? "Sri Lanka",
    commission: organizer?.commission ?? 5,

    organizerType: organizer?.organizerType ?? "Company",
    displayName: organizer?.displayName ?? "",
    logo: organizer?.logo ?? "",
    registrationNumber:
      organizer?.registrationNumber ?? "",
    website: organizer?.website ?? "",
    description: organizer?.description ?? "",

    contactPosition: organizer?.contactPosition ?? "",
    whatsapp: organizer?.whatsapp ?? "",
    financeContactName:
      organizer?.financeContactName ?? "",
    financeContactEmail:
      organizer?.financeContactEmail ?? "",

    addressLine1: organizer?.addressLine1 ?? "",
    addressLine2: organizer?.addressLine2 ?? "",
    city: organizer?.city ?? "",
    region: organizer?.region ?? "",
    postalCode: organizer?.postalCode ?? "",

    settlementCurrency:
      organizer?.settlementCurrency ?? "LKR",
    settlementSchedule:
      organizer?.settlementSchedule ?? "After Event",
    customSettlementTerms:
      organizer?.customSettlementTerms ?? "",
    agreementDate: organizer?.agreementDate ?? "",

    verificationStatus:
      organizer?.verificationStatus ?? "Not Started",
    status: organizer?.status ?? "Draft",
    adminNotes: organizer?.adminNotes ?? "",
  };
}

function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read the selected logo."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the selected logo."));
    };

    reader.readAsDataURL(file);
  });
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizePhone(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function validInternationalPhone(value: string): boolean {
  const digits = normalizePhone(value);

  return (
    /^\d{7,15}$/.test(digits) &&
    value.trim().startsWith("+")
  );
}

function validOptionalUrl(value: string): boolean {
  if (!value.trim()) return true;

  try {
    const url = new URL(value.trim());

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function getPhoneParts(
  value: string,
  fallbackDial = "+94"
) {
  const normalized = value.replace(/[^\d+]/g, "");

  if (!normalized) {
    return {
      dial: fallbackDial,
      local: "",
    };
  }

  const matching = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((country) =>
      normalized.startsWith(country.dial)
    );

  if (normalized.startsWith("+") && matching) {
    return {
      dial: matching.dial,
      local: normalized
        .slice(matching.dial.length)
        .replace(/\D/g, ""),
    };
  }

  return {
    dial: fallbackDial,
    local: normalized.replace(/\D/g, "").replace(/^0+/, ""),
  };
}

/* ==========================================================
   REUSABLE FORM COMPONENTS
   ========================================================== */

function Field({
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
    <label className="vof-field">
      <span className="vof-field-label">
        {label}
        {required && <b> *</b>}
      </span>

      {children}

      {hint && <small>{hint}</small>}
    </label>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="vof-review-item">
      <span>{label}</span>
      <strong>
        {value === "" ? "Not provided" : value}
      </strong>
    </div>
  );
}

function PhoneInput({
  label,
  dialCode,
  number,
  onDialCodeChange,
  onNumberChange,
  required = false,
  hint,
}: {
  label: string;
  dialCode: string;
  number: string;
  onDialCodeChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <Field
      label={label}
      required={required}
      hint={hint}
    >
      <div className="vof-phone-control">
        <div className="vof-select-wrap vof-dial-select">
          <select
            aria-label={`${label} country calling code`}
            value={dialCode}
            onChange={(event) =>
              onDialCodeChange(event.target.value)
            }
          >
            {COUNTRIES.map((country) => (
              <option
                key={`${country.code}-${country.dial}`}
                value={country.dial}
              >
                {country.code} ({country.dial})
              </option>
            ))}
          </select>
        </div>

        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={number}
          onChange={(event) =>
            onNumberChange(
              event.target.value.replace(/[^\d\s()-]/g, "")
            )
          }
          placeholder="77 123 4567"
          aria-label={label}
        />
      </div>
    </Field>
  );
}

/* ==========================================================
   MAIN ORGANIZER FORM
   ========================================================== */

export default function OrganizerForm({
  initialOrganizer,
  onSave,
  onClose,
}: OrganizerFormProps) {
  const [step, setStep] = useState(0);

  const [draft, setDraft] = useState<OrganizerDraft>(
    () => getInitialDraft(initialOrganizer)
  );

  const initialPhone = useMemo(
    () =>
      getPhoneParts(
        initialOrganizer?.phone ?? "",
        "+94"
      ),
    [initialOrganizer?.phone]
  );

  const initialWhatsapp = useMemo(
    () =>
      getPhoneParts(
        initialOrganizer?.whatsapp ?? "",
        "+94"
      ),
    [initialOrganizer?.whatsapp]
  );

  const [phoneDialCode, setPhoneDialCode] =
    useState(initialPhone.dial);

  const [phoneNumber, setPhoneNumber] =
    useState(initialPhone.local);

  const [whatsappDialCode, setWhatsappDialCode] =
    useState(initialWhatsapp.dial);

  const [whatsappNumber, setWhatsappNumber] =
    useState(initialWhatsapp.local);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const editing = Boolean(initialOrganizer?.id);

  useEffect(() => {
    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, []);

  const update = <K extends keyof OrganizerDraft>(
    field: K,
    value: OrganizerDraft[K]
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  };

  /* ========================================================
     LOGO UPLOAD
     ======================================================== */

  const uploadLogo = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    event.target.value = "";

    if (
      ![
        "image/png",
        "image/jpeg",
        "image/webp",
      ].includes(file.type)
    ) {
      setError("Choose a JPG, PNG or WebP logo.");
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      setError(
        "For this browser-local preview, the logo must be smaller than 250 KB."
      );
      return;
    }

    setUploading(true);
    setError("");

    try {
      const value = await readLogo(file);
      update("logo", value);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload logo."
      );
    } finally {
      setUploading(false);
    }
  };

  /* ========================================================
     VALIDATION
     ======================================================== */

  const validateStep = (index: number): string => {
    if (index === 0) {
      if (draft.name.trim().length < 2) {
        return "Enter the organizer or organization name.";
      }

      if (!draft.country.trim()) {
        return "Select the organizer's country.";
      }

      if (!validOptionalUrl(draft.website)) {
        return "Enter a valid website beginning with https:// or http://.";
      }
    }

    if (index === 1) {
      if (draft.contactName.trim().length < 2) {
        return "Enter the primary contact person's full name.";
      }

      if (!validEmail(draft.email)) {
        return "Enter a valid primary contact email address.";
      }

      const fullPhone =
        `${phoneDialCode}${normalizePhone(phoneNumber)}`;

      if (!validInternationalPhone(fullPhone)) {
        return "Enter a valid phone number with its international country code.";
      }

      if (whatsappNumber.trim()) {
        const fullWhatsapp =
          `${whatsappDialCode}${normalizePhone(whatsappNumber)}`;

        if (!validInternationalPhone(fullWhatsapp)) {
          return "Enter a valid international WhatsApp number.";
        }
      }

      if (
        draft.financeContactEmail.trim() &&
        !validEmail(draft.financeContactEmail)
      ) {
        return "Enter a valid finance contact email address.";
      }
    }

    if (index === 2) {
      if (
        !Number.isFinite(draft.commission) ||
        draft.commission < 0 ||
        draft.commission > 100
      ) {
        return "Platform commission must be between 0% and 100%.";
      }

      if (
        draft.settlementSchedule === "Custom" &&
        !draft.customSettlementTerms.trim()
      ) {
        return "Describe the custom settlement schedule.";
      }
    }

    return "";
  };

  const validateComplete = (): string => {
    for (const index of [0, 1, 2]) {
      const result = validateStep(index);

      if (result) {
        setStep(index);
        return result;
      }
    }

    return "";
  };

  const goNext = () => {
    const result = validateStep(step);

    if (result) {
      setError(result);
      return;
    }

    setStep((current) =>
      Math.min(current + 1, STEPS.length - 1)
    );

    setError("");
  };

  /* ========================================================
     SAVE ORGANIZER
     ======================================================== */

  const saveOrganizer = async (
    status: OrganizerStatus
  ) => {
    if (saving || uploading) return;

    if (status !== "Draft") {
      const validationError = validateComplete();

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    const name = draft.name.trim();

    if (!name) {
      setStep(0);
      setError(
        "Enter at least an organizer name to save a draft."
      );
      return;
    }

    setSaving(true);
    setError("");

    const record: AdvancedOrganizer = {
      ...draft,

      id: initialOrganizer?.id ?? generateId(),

      createdAt:
        initialOrganizer?.createdAt ??
        new Date().toISOString(),

      name,

      displayName: draft.displayName.trim(),
      registrationNumber:
        draft.registrationNumber.trim(),
      website: draft.website.trim(),
      description: draft.description.trim(),

      contactName: draft.contactName.trim(),
      contactPosition: draft.contactPosition.trim(),

      email: draft.email.trim().toLowerCase(),

      phone: phoneNumber.trim()
        ? `${phoneDialCode}${normalizePhone(phoneNumber)}`
        : "",

      whatsapp: whatsappNumber.trim()
        ? `${whatsappDialCode}${normalizePhone(whatsappNumber)}`
        : "",

      financeContactName:
        draft.financeContactName.trim(),

      financeContactEmail:
        draft.financeContactEmail.trim().toLowerCase(),

      addressLine1: draft.addressLine1.trim(),
      addressLine2: draft.addressLine2.trim(),
      city: draft.city.trim(),
      region: draft.region.trim(),
      postalCode: draft.postalCode.trim(),
      country: draft.country.trim(),

      customSettlementTerms:
        draft.customSettlementTerms.trim(),

      adminNotes: draft.adminNotes.trim(),

      status,
    };

    try {
      const result = await onSave(record);

      if (result === false) {
        setError(
          "Unable to save the organizer. Browser storage may be full."
        );
        return;
      }

      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save organizer."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ========================================================
     STEP 1 — ORGANIZATION
     ======================================================== */

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="vof-grid">
            <div className="vof-wide">
              <Field
                label="Organizer Type"
                required
              >
                <div className="vof-type-options">
                  {(
                    ["Company", "Individual"] as const
                  ).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        draft.organizerType === value
                          ? "vof-type active"
                          : "vof-type"
                      }
                      onClick={() =>
                        update("organizerType", value)
                      }
                    >
                      {value === "Company" ? (
                        <Building2 size={19} />
                      ) : (
                        <ContactRound size={19} />
                      )}

                      {value}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="vof-wide">
              <Field
                label={
                  draft.organizerType === "Company"
                    ? "Registered Organization Name"
                    : "Organizer Full Name"
                }
                required
              >
                <input
                  value={draft.name}
                  onChange={(event) =>
                    update("name", event.target.value)
                  }
                  maxLength={160}
                  placeholder={
                    draft.organizerType === "Company"
                      ? "Enter company or organization name"
                      : "Enter organizer's full name"
                  }
                />
              </Field>
            </div>

            <Field label="Public Display Name">
              <input
                value={draft.displayName}
                onChange={(event) =>
                  update("displayName", event.target.value)
                }
                placeholder="Name displayed on event pages"
                maxLength={160}
              />
            </Field>

            <Field label="Country" required>
              <div className="vof-select-wrap">
                <select
                  value={draft.country}
                  onChange={(event) =>
                    update("country", event.target.value)
                  }
                >
                  <option value="">
                    Select country
                  </option>

                  {COUNTRIES.map((country) => (
                    <option
                      key={country.code}
                      value={country.name}
                    >
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            {draft.organizerType === "Company" && (
              <Field label="Business Registration Number">
                <input
                  value={draft.registrationNumber}
                  onChange={(event) =>
                    update(
                      "registrationNumber",
                      event.target.value
                    )
                  }
                  maxLength={100}
                  placeholder="Optional during onboarding"
                />
              </Field>
            )}

            <Field label="Official Website">
              <input
                type="url"
                value={draft.website}
                onChange={(event) =>
                  update("website", event.target.value)
                }
                placeholder="https://example.com"
              />
            </Field>

            <div className="vof-wide">
              <Field label="Organizer Description">
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  placeholder="Describe the company, organizer and types of events they manage..."
                />
              </Field>
            </div>

            <div className="vof-wide">
              <Field label="Organizer Logo">
                <div className="vof-upload">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                      void uploadLogo(event)
                    }
                    disabled={uploading}
                    aria-label="Upload organizer logo"
                  />

                  <ImagePlus size={28} />

                  <strong>Upload Logo</strong>

                  <small>
                    JPG, PNG or WebP · Max 250 KB for local preview
                  </small>
                </div>
              </Field>

              {draft.logo && (
                <div className="vof-logo-preview">
                  <img
                    src={draft.logo}
                    alt="Organizer logo preview"
                  />

                  <button
                    type="button"
                    onClick={() => update("logo", "")}
                  >
                    <Trash2 size={15} />
                    Remove Logo
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      /* ======================================================
         STEP 2 — CONTACT DETAILS
         ====================================================== */

      case 1:
        return (
          <div className="vof-grid">
            <Field
              label="Primary Contact Person"
              required
            >
              <input
                value={draft.contactName}
                onChange={(event) =>
                  update("contactName", event.target.value)
                }
                placeholder="Contact person's full name"
              />
            </Field>

            <Field label="Job Title / Position">
              <input
                value={draft.contactPosition}
                onChange={(event) =>
                  update("contactPosition", event.target.value)
                }
                placeholder="Director / Manager / Coordinator"
              />
            </Field>

            <Field label="Contact Email" required>
              <input
                type="email"
                autoComplete="email"
                value={draft.email}
                onChange={(event) =>
                  update("email", event.target.value)
                }
                placeholder="organizer@example.com"
              />
            </Field>

            <PhoneInput
              label="International Phone Number"
              required
              hint="Choose the country calling code, then enter the phone number."
              dialCode={phoneDialCode}
              number={phoneNumber}
              onDialCodeChange={(value) => {
                setPhoneDialCode(value);
                setError("");
              }}
              onNumberChange={(value) => {
                setPhoneNumber(value);
                setError("");
              }}
            />

            <PhoneInput
              label="WhatsApp Number"
              dialCode={whatsappDialCode}
              number={whatsappNumber}
              onDialCodeChange={(value) => {
                setWhatsappDialCode(value);
                setError("");
              }}
              onNumberChange={(value) => {
                setWhatsappNumber(value);
                setError("");
              }}
            />

            <div className="vof-divider vof-wide">
              <strong>Business Address</strong>
              <span>
                Optional during initial onboarding
              </span>
            </div>

            <div className="vof-wide">
              <Field label="Address Line 1">
                <input
                  value={draft.addressLine1}
                  onChange={(event) =>
                    update("addressLine1", event.target.value)
                  }
                  placeholder="Street address / building"
                />
              </Field>
            </div>

            <div className="vof-wide">
              <Field label="Address Line 2">
                <input
                  value={draft.addressLine2}
                  onChange={(event) =>
                    update("addressLine2", event.target.value)
                  }
                  placeholder="Suite / unit / additional address"
                />
              </Field>
            </div>

            <Field label="City">
              <input
                value={draft.city}
                onChange={(event) =>
                  update("city", event.target.value)
                }
                placeholder="Jaffna / London"
              />
            </Field>

            <Field label="State / Province">
              <input
                value={draft.region}
                onChange={(event) =>
                  update("region", event.target.value)
                }
                placeholder="Northern Province"
              />
            </Field>

            <Field label="Postal Code">
              <input
                value={draft.postalCode}
                onChange={(event) =>
                  update("postalCode", event.target.value)
                }
                placeholder="Postal code"
              />
            </Field>

            <div className="vof-divider vof-wide">
              <strong>Additional Finance Contact</strong>
              <span>Optional</span>
            </div>

            <Field label="Finance Contact Name">
              <input
                value={draft.financeContactName}
                onChange={(event) =>
                  update(
                    "financeContactName",
                    event.target.value
                  )
                }
                placeholder="Finance manager"
              />
            </Field>

            <Field label="Finance Contact Email">
              <input
                type="email"
                value={draft.financeContactEmail}
                onChange={(event) =>
                  update(
                    "financeContactEmail",
                    event.target.value
                  )
                }
                placeholder="finance@example.com"
              />
            </Field>
          </div>
        );

      /* ======================================================
         STEP 3 — COMMERCIAL
         ====================================================== */

      case 2:
        return (
          <div className="vof-grid">
            <Field
              label="VizhaTickets Platform Commission (%)"
              required
            >
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={draft.commission}
                onChange={(event) =>
                  update(
                    "commission",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Settlement Currency">
              <div className="vof-select-wrap">
                <select
                  value={draft.settlementCurrency}
                  onChange={(event) =>
                    update(
                      "settlementCurrency",
                      event.target.value
                    )
                  }
                >
                  {CURRENCIES.map((currency) => (
                    <option
                      key={currency}
                      value={currency}
                    >
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            <Field label="Settlement Schedule">
              <div className="vof-select-wrap">
                <select
                  value={draft.settlementSchedule}
                  onChange={(event) =>
                    update(
                      "settlementSchedule",
                      event.target.value as SettlementSchedule
                    )
                  }
                >
                  <option value="After Event">
                    After Event
                  </option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </Field>

            <Field label="Agreement Date">
              <input
                type="date"
                value={draft.agreementDate}
                onChange={(event) =>
                  update("agreementDate", event.target.value)
                }
              />
            </Field>

            {draft.settlementSchedule === "Custom" && (
              <div className="vof-wide">
                <Field
                  label="Custom Settlement Terms"
                  required
                >
                  <textarea
                    rows={4}
                    value={draft.customSettlementTerms}
                    onChange={(event) =>
                      update(
                        "customSettlementTerms",
                        event.target.value
                      )
                    }
                    placeholder="Describe the agreed settlement schedule..."
                  />
                </Field>
              </div>
            )}

            <div className="vof-info vof-wide">
              <Info size={20} />

              <p>
                Commission and settlement schedules are
                administrative records during frontend testing.
                Actual organizer payouts require verified payment,
                refund, tax and gateway-fee information. Do not
                enter real bank account numbers in this form.
              </p>
            </div>
          </div>
        );

      /* ======================================================
         STEP 4 — VERIFICATION
         ====================================================== */

      case 3:
        return (
          <div className="vof-grid">
            <Field label="Verification Status">
              <div className="vof-select-wrap">
                <select
                  value={draft.verificationStatus}
                  onChange={(event) =>
                    update(
                      "verificationStatus",
                      event.target.value as VerificationStatus
                    )
                  }
                >
                  <option value="Not Started">
                    Not Started
                  </option>
                  <option value="Under Review">
                    Under Review
                  </option>
                  <option value="Verified">
                    Verified
                  </option>
                  <option value="Rejected">
                    Rejected
                  </option>
                </select>
              </div>
            </Field>

            <Field label="Organizer Account Status">
              <div className="vof-select-wrap">
                <select
                  value={draft.status}
                  onChange={(event) =>
                    update(
                      "status",
                      event.target.value as OrganizerStatus
                    )
                  }
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </Field>

            <div className="vof-wide">
              <Field label="Internal Admin Notes">
                <textarea
                  rows={5}
                  value={draft.adminNotes}
                  onChange={(event) =>
                    update("adminNotes", event.target.value)
                  }
                  placeholder="Onboarding progress, agreement follow-ups, or review notes. Do not enter sensitive identity or financial information."
                />
              </Field>
            </div>

            <div className="vof-info vof-wide">
              <ShieldCheck size={21} />

              <p>
                Document verification will later use protected
                backend storage. This form records the review
                status only; selecting Verified here is not
                proof that identity checks occurred.
              </p>
            </div>
          </div>
        );

      /* ======================================================
         STEP 5 — REVIEW & SAVE
         ====================================================== */

      default:
        return (
          <div className="vof-review">
            <div className="vof-review-head">
              <BadgeCheck size={26} />

              <div>
                <h3>Review Organizer Profile</h3>
                <p>
                  Check the information before saving.
                </p>
              </div>
            </div>

            {draft.logo && (
              <img
                className="vof-review-logo"
                src={draft.logo}
                alt="Organizer logo"
              />
            )}

            <div className="vof-review-grid">
              <ReviewItem
                label="Organizer"
                value={draft.name}
              />

              <ReviewItem
                label="Type"
                value={draft.organizerType}
              />

              <ReviewItem
                label="Country"
                value={draft.country}
              />

              <ReviewItem
                label="Display Name"
                value={draft.displayName}
              />

              <ReviewItem
                label="Contact"
                value={draft.contactName}
              />

              <ReviewItem
                label="Email"
                value={draft.email}
              />

              <ReviewItem
                label="Phone"
                value={
                  phoneNumber
                    ? `${phoneDialCode} ${phoneNumber}`
                    : ""
                }
              />

              <ReviewItem
                label="WhatsApp"
                value={
                  whatsappNumber
                    ? `${whatsappDialCode} ${whatsappNumber}`
                    : ""
                }
              />

              <ReviewItem
                label="Commission"
                value={`${draft.commission}%`}
              />

              <ReviewItem
                label="Settlement Currency"
                value={draft.settlementCurrency}
              />

              <ReviewItem
                label="Settlement Schedule"
                value={draft.settlementSchedule}
              />

              <ReviewItem
                label="Verification"
                value={draft.verificationStatus}
              />

              <ReviewItem
                label="Status"
                value={draft.status}
              />
            </div>

            <div className="vof-info">
              <ClipboardCheck size={20} />

              <p>
                Saving an organizer does not automatically
                approve or publish their events. Each event
                will still require its own publishing decision.
              </p>
            </div>
          </div>
        );
    }
  };

  /* ========================================================
     FORM SUBMISSION
     ======================================================== */

  const submitStep = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (step < STEPS.length - 1) {
      goNext();
    }
  };

  /* ========================================================
     MAIN UI
     ======================================================== */

  return (
    <div
      className="vof-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={
          editing
            ? "Edit Organizer"
            : "Add New Organizer"
        }
        className="vof-dialog"
      >
        {/* HEADER */}

        <header className="vof-header">
          <div>
            <p className="vof-eyebrow">
              <Building2 size={15} />
              VIZHATICKETS PARTNER MANAGEMENT
            </p>

            <h2>
              {editing
                ? "Edit Organizer"
                : "Add New Organizer"}
            </h2>

            <p>
              Manage organizer profiles, contacts,
              commercial agreements and onboarding.
            </p>
          </div>

          <button
            type="button"
            className="vof-close"
            onClick={onClose}
            aria-label="Close organizer form"
          >
            <X size={21} />
          </button>
        </header>

        {/* PROGRESS STEPS */}

        <div
          className="vof-progress"
          aria-label="Organizer setup steps"
        >
          {STEPS.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.title}
                className={[
                  "vof-step",
                  step === index ? "active" : "",
                  step > index ? "completed" : "",
                ].join(" ")}
                onClick={() => {
                  setStep(index);
                  setError("");
                }}
              >
                <span>
                  {step > index ? (
                    <Check size={15} />
                  ) : (
                    <Icon size={16} />
                  )}
                </span>

                <small>{item.title}</small>
              </button>
            );
          })}
        </div>

        {/* FORM */}

        <form
          className="vof-form"
          onSubmit={submitStep}
        >
          <div
            className="vof-body"
            key={step}
          >
            <div className="vof-content-heading">
              <h3>{STEPS[step].title}</h3>

              <p>
                Step {step + 1} of {STEPS.length}
              </p>
            </div>

            {renderStep()}

            {error && (
              <div
                className="vof-error"
                role="alert"
              >
                <Info size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* FOOTER */}

          <footer className="vof-footer">
            <button
              type="button"
              className="vof-btn vof-btn-light"
              onClick={() => {
                if (step === 0) {
                  onClose();
                } else {
                  setStep((current) => current - 1);
                  setError("");
                }
              }}
            >
              <ArrowLeft size={16} />

              {step === 0 ? "Cancel" : "Back"}
            </button>

            <div className="vof-footer-actions">
              <button
                type="button"
                className="vof-btn vof-btn-outline"
                disabled={saving || uploading}
                onClick={() =>
                  void saveOrganizer("Draft")
                }
              >
                <Save size={16} />
                Save Draft
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="submit"
                  className="vof-btn vof-btn-primary"
                  disabled={saving || uploading}
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="vof-btn vof-btn-primary"
                  disabled={saving || uploading}
                  onClick={() =>
                    void saveOrganizer(draft.status)
                  }
                >
                  <CheckCircle2 size={17} />

                  {saving
                    ? "Saving..."
                    : "Save Organizer"}
                </button>
              )}
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}