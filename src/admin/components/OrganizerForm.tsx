
import {
  useEffect,
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
  FileText,
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

   Frontend-only development.

   Supports:
   - Individual and company organizers
   - Five-step organizer onboarding
   - Logo file selection and local preview
   - Contact and address information
   - International phone numbers
   - Commercial agreement configuration
   - Verification and organizer status
   - Admin notes and review
   - Save Draft / Save Organizer
   - Editing previously saved organizers

   SECURITY:
   Do not store real bank details, identity documents,
   passwords or other sensitive verification material
   in localStorage.

   The parent AdminApp saves the resulting record.
   ========================================================== */

export type OrganizerType =
  | "Individual"
  | "Company";

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
  /* Existing AdminApp compatibility fields */
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  commission: number;
  createdAt: string;

  /* Advanced organizer fields */
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

function validInternationalPhone(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(
    value.replace(/[\s()-]/g, "")
  );
}

function validOptionalUrl(value: string): boolean {
  if (!value.trim()) return true;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

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
      <span>
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
      <strong>{value === "" ? "Not provided" : value}</strong>
    </div>
  );
}

export default function OrganizerForm({
  initialOrganizer,
  onSave,
  onClose,
}: OrganizerFormProps) {
  const [step, setStep] = useState(0);

  const [draft, setDraft] = useState<OrganizerDraft>(
    () => getInitialDraft(initialOrganizer)
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const editing = Boolean(initialOrganizer?.id);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
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

  const validateStep = (index: number): string => {
    if (index === 0) {
      if (draft.name.trim().length < 2) {
        return "Enter the organizer or organization name.";
      }

      if (!draft.country.trim()) {
        return "Enter the organizer's country.";
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

      if (!validInternationalPhone(draft.phone)) {
        return "Enter a valid international phone number starting with + and its country code.";
      }

      if (
        draft.whatsapp.trim() &&
        !validInternationalPhone(draft.whatsapp)
      ) {
        return "Enter a valid international WhatsApp number.";
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

    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    setError("");
  };

  const saveOrganizer = async (
    status: OrganizerStatus
  ) => {
    if (saving || uploading) return;

    // Drafts may be incomplete. Active/other statuses
    // require completed essential organizer information.
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
      setError("Enter at least an organizer name to save a draft.");
      return;
    }

    setSaving(true);
    setError("");

    const record: AdvancedOrganizer = {
      ...draft,
      id: initialOrganizer?.id ?? generateId(),
      createdAt:
        initialOrganizer?.createdAt ?? new Date().toISOString(),

      name,
      displayName: draft.displayName.trim(),
      registrationNumber: draft.registrationNumber.trim(),
      website: draft.website.trim(),
      description: draft.description.trim(),

      contactName: draft.contactName.trim(),
      contactPosition: draft.contactPosition.trim(),
      email: draft.email.trim().toLowerCase(),
      phone: draft.phone.trim(),
      whatsapp: draft.whatsapp.trim(),

      financeContactName: draft.financeContactName.trim(),
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

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="vof-grid">
            <div className="vof-wide">
              <Field label="Organizer Type" required>
                <div className="vof-type-options">
                  {(["Company", "Individual"] as const).map(
                    (value) => (
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
                    )
                  )}
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
                  onChange={(e) =>
                    update("name", e.target.value)
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
                onChange={(e) =>
                  update("displayName", e.target.value)
                }
                placeholder="Name displayed on event pages"
                maxLength={160}
              />
            </Field>

            <Field label="Country" required>
              <input
                value={draft.country}
                onChange={(e) =>
                  update("country", e.target.value)
                }
                maxLength={100}
                placeholder="Sri Lanka"
              />
            </Field>

            {draft.organizerType === "Company" && (
              <Field label="Business Registration Number">
                <input
                  value={draft.registrationNumber}
                  onChange={(e) =>
                    update("registrationNumber", e.target.value)
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
                onChange={(e) =>
                  update("website", e.target.value)
                }
                placeholder="https://example.com"
              />
            </Field>

            <div className="vof-wide">
              <Field label="Organizer Description">
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(e) =>
                    update("description", e.target.value)
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
                    onChange={(e) => void uploadLogo(e)}
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

      case 1:
        return (
          <div className="vof-grid">
            <Field label="Primary Contact Person" required>
              <input
                value={draft.contactName}
                onChange={(e) =>
                  update("contactName", e.target.value)
                }
                placeholder="Contact person's full name"
              />
            </Field>

            <Field label="Job Title / Position">
              <input
                value={draft.contactPosition}
                onChange={(e) =>
                  update("contactPosition", e.target.value)
                }
                placeholder="Director / Manager / Coordinator"
              />
            </Field>

            <Field label="Contact Email" required>
              <input
                type="email"
                value={draft.email}
                onChange={(e) =>
                  update("email", e.target.value)
                }
                placeholder="organizer@example.com"
              />
            </Field>

            <Field
              label="International Phone Number"
              required
              hint="Enter the full number with country code."
            >
              <input
                type="tel"
                value={draft.phone}
                onChange={(e) =>
                  update("phone", e.target.value)
                }
                placeholder="+94 77 123 4567"
              />
            </Field>

            <Field label="WhatsApp Number">
              <input
                type="tel"
                value={draft.whatsapp}
                onChange={(e) =>
                  update("whatsapp", e.target.value)
                }
                placeholder="+44 7700 900000"
              />
            </Field>

            <div className="vof-divider vof-wide">
              <strong>Business Address</strong>
              <span>Optional during initial onboarding</span>
            </div>

            <div className="vof-wide">
              <Field label="Address Line 1">
                <input
                  value={draft.addressLine1}
                  onChange={(e) =>
                    update("addressLine1", e.target.value)
                  }
                  placeholder="Street address / building"
                />
              </Field>
            </div>

            <div className="vof-wide">
              <Field label="Address Line 2">
                <input
                  value={draft.addressLine2}
                  onChange={(e) =>
                    update("addressLine2", e.target.value)
                  }
                  placeholder="Suite / unit / additional address"
                />
              </Field>
            </div>

            <Field label="City">
              <input
                value={draft.city}
                onChange={(e) =>
                  update("city", e.target.value)
                }
                placeholder="Jaffna / London"
              />
            </Field>

            <Field label="State / Province">
              <input
                value={draft.region}
                onChange={(e) =>
                  update("region", e.target.value)
                }
                placeholder="Northern Province"
              />
            </Field>

            <Field label="Postal Code">
              <input
                value={draft.postalCode}
                onChange={(e) =>
                  update("postalCode", e.target.value)
                }
              />
            </Field>

            <div className="vof-divider vof-wide">
              <strong>Additional Finance Contact</strong>
              <span>Optional</span>
            </div>

            <Field label="Finance Contact Name">
              <input
                value={draft.financeContactName}
                onChange={(e) =>
                  update("financeContactName", e.target.value)
                }
                placeholder="Finance manager"
              />
            </Field>

            <Field label="Finance Contact Email">
              <input
                type="email"
                value={draft.financeContactEmail}
                onChange={(e) =>
                  update("financeContactEmail", e.target.value)
                }
                placeholder="finance@example.com"
              />
            </Field>
          </div>
        );

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
                onChange={(e) =>
                  update("commission", Number(e.target.value))
                }
              />
            </Field>

            <Field label="Settlement Currency">
              <select
                value={draft.settlementCurrency}
                onChange={(e) =>
                  update("settlementCurrency", e.target.value)
                }
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Settlement Schedule">
              <select
                value={draft.settlementSchedule}
                onChange={(e) =>
                  update(
                    "settlementSchedule",
                    e.target.value as SettlementSchedule
                  )
                }
              >
                <option value="After Event">After Event</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Custom">Custom</option>
              </select>
            </Field>

            <Field label="Agreement Date">
              <input
                type="date"
                value={draft.agreementDate}
                onChange={(e) =>
                  update("agreementDate", e.target.value)
                }
              />
            </Field>

            {draft.settlementSchedule === "Custom" && (
              <div className="vof-wide">
                <Field label="Custom Settlement Terms" required>
                  <textarea
                    rows={4}
                    value={draft.customSettlementTerms}
                    onChange={(e) =>
                      update(
                        "customSettlementTerms",
                        e.target.value
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
                Commission and settlement schedules are only
                administrative records during frontend testing.
                Actual organizer payouts require verified payment,
                refund, tax and gateway-fee information. Do not
                enter real bank account numbers in this form.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="vof-grid">
            <Field label="Verification Status">
              <select
                value={draft.verificationStatus}
                onChange={(e) =>
                  update(
                    "verificationStatus",
                    e.target.value as VerificationStatus
                  )
                }
              >
                <option value="Not Started">Not Started</option>
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </Field>

            <Field label="Organizer Account Status">
              <select
                value={draft.status}
                onChange={(e) =>
                  update(
                    "status",
                    e.target.value as OrganizerStatus
                  )
                }
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </Field>

            <div className="vof-wide">
              <Field label="Internal Admin Notes">
                <textarea
                  rows={5}
                  value={draft.adminNotes}
                  onChange={(e) =>
                    update("adminNotes", e.target.value)
                  }
                  placeholder="Onboarding progress, agreement follow-ups, or review notes. Do not enter sensitive identity or financial information."
                />
              </Field>
            </div>

            <div className="vof-info vof-wide">
              <ShieldCheck size={21} />
              <p>
                Document verification will later use protected
                backend storage. This frontend form records the
                review status only; selecting Verified here is
                not proof that identity checks have occurred.
              </p>
            </div>
          </div>
        );

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
                value={draft.phone}
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

  const submitStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step < STEPS.length - 1) {
      goNext();
    }
  };

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
          editing ? "Edit Organizer" : "Add New Organizer"
        }
        className="vof-dialog"
      >
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

        <div className="vof-progress">
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

        <form className="vof-form" onSubmit={submitStep}>
          <div className="vof-body" key={step}>
            <div className="vof-content-heading">
              <h3>{STEPS[step].title}</h3>
              <p>
                Step {step + 1} of {STEPS.length}
              </p>
            </div>

            {renderStep()}

            {error && (
              <div className="vof-error" role="alert">
                <Info size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

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
                onClick={() => void saveOrganizer("Draft")}
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
