
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ImagePlus,
  Info,
  Map,
  Plus,
  Save,
  Ticket,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import "./EventForm.css";

/* ==========================================================
   VIZHATICKETS — ADVANCED EVENT FORM

   Frontend development edition.

   Supports:
   - 6-step event creation
   - Dynamic ticket categories
   - Individual tier capacity, price and ticket limits
   - Event banner upload
   - Venue layout image upload
   - Venue / admission types
   - Event dates and locations
   - Sales dates and refund policy
   - Draft and Publish
   - Existing event editing

   Browser image preview is NOT permanent hosting.
   Backend storage and verified ticket inventory
   will be implemented separately.
   ========================================================== */

export type EventPublicationStatus =
  | "Draft"
  | "Published";

export type VenueAdmissionType =
  | "general"
  | "zones"
  | "reserved"
  | "stadium";

export interface EventTicketTier {
  id: string;
  name: string;
  price: number;
  capacity: number;
  maxPerBooking: number;
  description: string;
  enabled: boolean;
}

export interface AdvancedEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  organizerId: string;

  country: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;

  currency: string;
  ticketTiers: EventTicketTier[];

  admissionType: VenueAdmissionType;
  stagePosition: string;
  venueNotes: string;

  imageUrl: string;
  venueLayoutImage: string;

  salesStart: string;
  salesEnd: string;
  refundPolicy: string;
  terms: string;
  bookingEnabled: boolean;

  status: EventPublicationStatus;
  createdAt: string;

  // Compatibility with the current admin event model.
  price: number;
  capacity: number;
}

export interface EventOrganizerOption {
  id: string;
  name: string;
}

interface EventFormProps {
  initialEvent?: Partial<AdvancedEvent> | null;
  organizers: EventOrganizerOption[];
  onSave: (event: AdvancedEvent) => void | boolean;
  onClose: () => void;
}

type EventDraft = Omit<
  AdvancedEvent,
  "id" | "createdAt" | "price" | "capacity"
>;

const CATEGORIES = [
  "Concerts",
  "Cultural",
  "Comedy",
  "Theatre",
  "Festivals",
  "Education",
  "Workshops",
  "Sports",
  "Others",
];

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

const STEPS = [
  "Event Details",
  "Date & Location",
  "Ticket Categories",
  "Venue & Seating",
  "Booking Settings",
  "Review & Publish",
];

const MAX_IMAGE_SIZE = 1024 * 1024;

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function blankTier(): EventTicketTier {
  return {
    id: newId("TIER"),
    name: "",
    price: 0,
    capacity: 100,
    maxPerBooking: 10,
    description: "",
    enabled: true,
  };
}

function makeDraft(
  initial?: Partial<AdvancedEvent> | null
): EventDraft {
  return {
    title: initial?.title ?? "",
    category: initial?.category ?? "Concerts",
    description: initial?.description ?? "",
    organizerId: initial?.organizerId ?? "",

    country: initial?.country ?? "Sri Lanka",
    city: initial?.city ?? "",
    venue: initial?.venue ?? "",
    date: initial?.date ?? "",
    time: initial?.time ?? "",
    endDate: initial?.endDate ?? "",
    endTime: initial?.endTime ?? "",

    currency: initial?.currency ?? "LKR",

    ticketTiers:
      initial?.ticketTiers?.length
        ? initial.ticketTiers.map((tier) => ({ ...tier }))
        : [
            {
              ...blankTier(),
              price: initial?.price ?? 0,
              capacity: initial?.capacity ?? 100,
              name: "General Admission",
            },
          ],

    admissionType: initial?.admissionType ?? "general",
    stagePosition: initial?.stagePosition ?? "",
    venueNotes: initial?.venueNotes ?? "",

    imageUrl: initial?.imageUrl ?? "",
    venueLayoutImage: initial?.venueLayoutImage ?? "",

    salesStart: initial?.salesStart ?? "",
    salesEnd: initial?.salesEnd ?? "",
    refundPolicy: initial?.refundPolicy ?? "",
    terms: initial?.terms ?? "",
    bookingEnabled: initial?.bookingEnabled ?? true,

    status: initial?.status ?? "Draft",
  };
}

function readImage(
  file: File
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read the image."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the image."));
    };

    reader.readAsDataURL(file);
  });
}

function validateImage(file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(
      file.type
    )
  ) {
    throw new Error(
      "Please select a JPG, PNG or WebP image."
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      "For the local preview, each image must be under 1 MB. Larger files will be supported with backend storage."
    );
  }
}

function currencyAmount(
  amount: number,
  currency: string
) {
  return `${currency} ${amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="vef-field">
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      {children}
    </label>
  );
}

export default function EventForm({
  initialEvent,
  organizers,
  onSave,
  onClose,
}: EventFormProps) {
  const [draft, setDraft] = useState<EventDraft>(
    () => makeDraft(initialEvent)
  );

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const update = <K extends keyof EventDraft>(
    key: K,
    value: EventDraft[K]
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
    setError("");
  };

  const updateTier = (
    id: string,
    patch: Partial<EventTicketTier>
  ) => {
    update(
      "ticketTiers",
      draft.ticketTiers.map((tier) =>
        tier.id === id ? { ...tier, ...patch } : tier
      )
    );
  };

  const removeTier = (id: string) => {
    if (draft.ticketTiers.length <= 1) {
      setError("At least one ticket category is required.");
      return;
    }

    update(
      "ticketTiers",
      draft.ticketTiers.filter((tier) => tier.id !== id)
    );
  };

  const uploadImage = async (
    event: ChangeEvent<HTMLInputElement>,
    field: "imageUrl" | "venueLayoutImage"
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");

    try {
      validateImage(file);
      const image = await readImage(file);
      update(field, image);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const enabledTiers = draft.ticketTiers.filter(
    (tier) => tier.enabled
  );

  const totalCapacity = enabledTiers.reduce(
    (total, tier) => total + tier.capacity,
    0
  );

  const minimumPrice = enabledTiers.length
    ? Math.min(...enabledTiers.map((tier) => tier.price))
    : 0;

  const validateStep = (index: number): string => {
    if (index === 0) {
      if (!draft.title.trim()) return "Enter the event title.";
      if (!draft.organizerId)
        return "Select an organizer.";
      if (!draft.description.trim())
        return "Enter the event description.";
    }

    if (index === 1) {
      if (!draft.country.trim() || !draft.city.trim())
        return "Enter the event country and city.";
      if (!draft.venue.trim())
        return "Enter the venue.";
      if (!draft.date || !draft.time)
        return "Select the event date and start time.";

      if (
        draft.endDate &&
        draft.endDate < draft.date
      ) {
        return "End date cannot be before the start date.";
      }

      if (
        draft.endDate === draft.date &&
        draft.endTime &&
        draft.endTime <= draft.time
      ) {
        return "End time must be after start time on the same day.";
      }
    }

    if (index === 2) {
      if (!enabledTiers.length)
        return "Enable at least one ticket category.";

      const names = new Set<string>();

      for (const tier of draft.ticketTiers) {
        if (!tier.name.trim())
          return "Enter a name for every ticket category.";

        const normalized = tier.name.trim().toLowerCase();

        if (names.has(normalized))
          return "Ticket category names must be unique.";

        names.add(normalized);

        if (
          !Number.isFinite(tier.price) ||
          tier.price < 0
        ) {
          return "Enter a valid ticket price.";
        }

        if (
          !Number.isInteger(tier.capacity) ||
          tier.capacity < 1
        ) {
          return "Each ticket category needs a valid capacity.";
        }

        if (
          !Number.isInteger(tier.maxPerBooking) ||
          tier.maxPerBooking < 1 ||
          tier.maxPerBooking > tier.capacity
        ) {
          return "The booking limit must be between 1 and the category capacity.";
        }
      }
    }

    if (index === 4) {
      if (
        draft.salesStart &&
        draft.salesEnd &&
        draft.salesStart > draft.salesEnd
      ) {
        return "Ticket sales must end after they begin.";
      }

      if (
        draft.salesEnd &&
        draft.date &&
        draft.salesEnd > `${draft.date}T${draft.time || "00:00"}`
      ) {
        return "Sales must close no later than the event start.";
      }

      if (!draft.refundPolicy.trim())
        return "Enter the event refund policy.";

      if (!draft.terms.trim())
        return "Enter the event terms and conditions.";
    }

    return "";
  };

  const validateAll = (): string => {
    for (const index of [0, 1, 2, 4]) {
      const message = validateStep(index);
      if (message) {
        setStep(index);
        return message;
      }
    }
    return "";
  };

  const next = () => {
    const message = validateStep(step);

    if (message) {
      setError(message);
      return;
    }

    setError("");
    setStep((current) => Math.min(current + 1, 5));
  };

  const save = async (status: EventPublicationStatus) => {
    if (saving || uploading) return;

    /*
     * Drafts may be incomplete; publication requires
     * complete event information.
     */
    if (status === "Published") {
      const validationError = validateAll();

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const record: AdvancedEvent = {
        ...draft,
        status,
        id: initialEvent?.id ?? newId("EVT"),
        createdAt:
          initialEvent?.createdAt ?? new Date().toISOString(),
        price: minimumPrice,
        capacity: totalCapacity,
        ticketTiers: draft.ticketTiers.map((tier) => ({
          ...tier,
          name: tier.name.trim(),
          description: tier.description.trim(),
        })),
      };

      const result = await Promise.resolve(onSave(record));

      if (result === false) {
        setError(
          "The event could not be saved. Check available browser storage."
        );
        return;
      }

      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save event."
      );
    } finally {
      setSaving(false);
    }
  };

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="vef-grid">
            <Field label="Event Name" required>
              <input
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Enter event title"
                maxLength={180}
              />
            </Field>

            <Field label="Event Category" required>
              <select
                value={draft.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {CATEGORIES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Event Organizer" required>
              <select
                value={draft.organizerId}
                onChange={(e) => update("organizerId", e.target.value)}
              >
                <option value="">Select organizer</option>
                {organizers.map((organizer) => (
                  <option key={organizer.id} value={organizer.id}>
                    {organizer.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="vef-wide">
              <Field label="Event Description" required>
                <textarea
                  rows={5}
                  value={draft.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe the event, attractions, performers and experience..."
                />
              </Field>
            </div>

            <div className="vef-wide">
              <Field label="Event Banner Upload">
                <label className="vef-upload">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => void uploadImage(e, "imageUrl")}
                    disabled={uploading}
                  />
                  <ImagePlus size={27} />
                  <strong>Choose Event Banner</strong>
                  <small>JPG, PNG, WebP — maximum 1 MB for local preview</small>
                </label>
              </Field>

              {draft.imageUrl && (
                <div className="vef-image-preview">
                  <img src={draft.imageUrl} alt="Event banner preview" />
                  <button
                    type="button"
                    onClick={() => update("imageUrl", "")}
                  >
                    <Trash2 size={15} /> Remove Banner
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="vef-grid">
            <Field label="Country" required>
              <input
                value={draft.country}
                onChange={(e) => update("country", e.target.value)}
                placeholder="Sri Lanka"
              />
            </Field>

            <Field label="City / Region" required>
              <input
                value={draft.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Jaffna"
              />
            </Field>

            <div className="vef-wide">
              <Field label="Venue Name / Address" required>
                <input
                  value={draft.venue}
                  onChange={(e) => update("venue", e.target.value)}
                  placeholder="Event hall, stadium or venue address"
                />
              </Field>
            </div>

            <Field label="Event Start Date" required>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </Field>

            <Field label="Start Time" required>
              <input
                type="time"
                value={draft.time}
                onChange={(e) => update("time", e.target.value)}
              />
            </Field>

            <Field label="End Date">
              <input
                type="date"
                value={draft.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </Field>

            <Field label="End Time">
              <input
                type="time"
                value={draft.endTime}
                onChange={(e) => update("endTime", e.target.value)}
              />
            </Field>
          </div>
        );

      case 2:
        return (
          <div className="vef-tickets">
            <div className="vef-section-head">
              <div>
                <h3>Ticket Categories</h3>
                <p>
                  Create custom categories such as VVIP, VIP,
                  Fan Pit, Platinum, Gold and Silver.
                </p>
              </div>
              <button
                type="button"
                className="vef-add-btn"
                onClick={() =>
                  update("ticketTiers", [
                    ...draft.ticketTiers,
                    blankTier(),
                  ])
                }
              >
                <Plus size={16} /> Add Category
              </button>
            </div>

            <Field label="Ticket Currency">
              <select
                value={draft.currency}
                onChange={(e) => update("currency", e.target.value)}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </Field>

            {draft.ticketTiers.map((tier, index) => (
              <div className="vef-tier" key={tier.id}>
                <div className="vef-tier-head">
                  <strong>
                    <Ticket size={17} />
                    Category {index + 1}
                  </strong>

                  <button
                    type="button"
                    className="vef-remove"
                    onClick={() => removeTier(tier.id)}
                    aria-label={`Remove category ${index + 1}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="vef-grid">
                  <Field label="Category Name" required>
                    <input
                      value={tier.name}
                      onChange={(e) =>
                        updateTier(tier.id, { name: e.target.value })
                      }
                      placeholder="VVIP, Gold, Fan Pit..."
                    />
                  </Field>

                  <Field label={`Price (${draft.currency})`} required>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tier.price}
                      onChange={(e) =>
                        updateTier(tier.id, {
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </Field>

                  <Field label="Total Capacity" required>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={tier.capacity}
                      onChange={(e) =>
                        updateTier(tier.id, {
                          capacity: Number(e.target.value),
                        })
                      }
                    />
                  </Field>

                  <Field label="Maximum Per Booking">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={tier.maxPerBooking}
                      onChange={(e) =>
                        updateTier(tier.id, {
                          maxPerBooking: Number(e.target.value),
                        })
                      }
                    />
                  </Field>

                  <div className="vef-wide">
                    <Field label="Category Description">
                      <input
                        value={tier.description}
                        onChange={(e) =>
                          updateTier(tier.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Access area, benefits, entry details..."
                      />
                    </Field>
                  </div>
                </div>

                <label className="vef-check">
                  <input
                    type="checkbox"
                    checked={tier.enabled}
                    onChange={(e) =>
                      updateTier(tier.id, {
                        enabled: e.target.checked,
                      })
                    }
                  />
                  Available for booking
                </label>
              </div>
            ))}

            <div className="vef-total">
              <div>
                <span>Total Ticket Capacity</span>
                <strong>{totalCapacity.toLocaleString()}</strong>
              </div>
              <div>
                <span>Starting Price</span>
                <strong>
                  {currencyAmount(minimumPrice, draft.currency)}
                </strong>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="vef-grid">
            <div className="vef-wide">
              <Field label="Admission / Seating Type">
                <select
                  value={draft.admissionType}
                  onChange={(e) =>
                    update(
                      "admissionType",
                      e.target.value as VenueAdmissionType
                    )
                  }
                >
                  <option value="general">General Admission</option>
                  <option value="zones">Ticket Zones / Areas</option>
                  <option value="reserved">Reserved Seats</option>
                  <option value="stadium">Stadium / Stands</option>
                </select>
              </Field>
            </div>

            <div className="vef-wide">
              <Field label="Upload Venue / Stadium Layout">
                <label className="vef-upload">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      void uploadImage(e, "venueLayoutImage")
                    }
                    disabled={uploading}
                  />
                  <UploadCloud size={29} />
                  <strong>Choose Venue Layout Image</strong>
                  <small>
                    Show the stage, sections and ticket areas
                    — JPG, PNG or WebP, under 1 MB
                  </small>
                </label>
              </Field>

              {draft.venueLayoutImage && (
                <div className="vef-image-preview vef-map-preview">
                  <img
                    src={draft.venueLayoutImage}
                    alt="Venue seating layout"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update("venueLayoutImage", "")
                    }
                  >
                    <Trash2 size={15} />
                    Remove Layout
                  </button>
                </div>
              )}
            </div>

            <Field label="Stage Position">
              <select
                value={draft.stagePosition}
                onChange={(e) =>
                  update("stagePosition", e.target.value)
                }
              >
                <option value="">Not Specified</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="center">Center</option>
              </select>
            </Field>

            <div className="vef-wide">
              <Field label="Venue / Seating Notes">
                <textarea
                  rows={4}
                  value={draft.venueNotes}
                  onChange={(e) =>
                    update("venueNotes", e.target.value)
                  }
                  placeholder="Describe entry gates, ticket zones, stand names and stage arrangements..."
                />
              </Field>
            </div>

            <div className="vef-info vef-wide">
              <Map size={19} />
              <p>
                The uploaded image will be a visual seating map.
                Interactive zone clicking and exact numbered seat
                reservations require a separate seat-map editor
                and backend inventory system.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="vef-grid">
            <Field label="Ticket Sales Start">
              <input
                type="datetime-local"
                value={draft.salesStart}
                onChange={(e) =>
                  update("salesStart", e.target.value)
                }
              />
            </Field>

            <Field label="Ticket Sales End">
              <input
                type="datetime-local"
                value={draft.salesEnd}
                onChange={(e) =>
                  update("salesEnd", e.target.value)
                }
              />
            </Field>

            <div className="vef-wide">
              <Field label="Refund / Cancellation Policy" required>
                <textarea
                  rows={4}
                  value={draft.refundPolicy}
                  onChange={(e) =>
                    update("refundPolicy", e.target.value)
                  }
                  placeholder="Explain whether tickets can be refunded and any applicable deadlines..."
                />
              </Field>
            </div>

            <div className="vef-wide">
              <Field label="Event Terms & Conditions" required>
                <textarea
                  rows={4}
                  value={draft.terms}
                  onChange={(e) =>
                    update("terms", e.target.value)
                  }
                  placeholder="Entry requirements, age limits, restrictions, event rules..."
                />
              </Field>
            </div>

            <div className="vef-wide">
              <label className="vef-check">
                <input
                  type="checkbox"
                  checked={draft.bookingEnabled}
                  onChange={(e) =>
                    update("bookingEnabled", e.target.checked)
                  }
                />
                Enable ticket bookings for this event
              </label>
            </div>

            <div className="vef-info vef-wide">
              <Info size={19} />
              <p>
                A successful payment must be verified by the
                backend before a confirmed booking or QR
                ticket is issued. The admin form does not
                create customer tickets.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="vef-review">
            <div className="vef-review-title">
              <CheckCircle2 size={23} />
              <div>
                <h3>Review Your Event</h3>
                <p>Check the details before publishing.</p>
              </div>
            </div>

            {draft.imageUrl && (
              <img
                className="vef-review-banner"
                src={draft.imageUrl}
                alt="Event banner"
              />
            )}

            <div className="vef-review-grid">
              <div>
                <span>Event</span>
                <strong>{draft.title || "Not entered"}</strong>
              </div>
              <div>
                <span>Category</span>
                <strong>{draft.category}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>
                  {draft.city || "City"}, {draft.country}
                </strong>
              </div>
              <div>
                <span>Event Date</span>
                <strong>
                  {draft.date || "Not set"} {draft.time}
                </strong>
              </div>
              <div>
                <span>Ticket Categories</span>
                <strong>{enabledTiers.length}</strong>
              </div>
              <div>
                <span>Total Capacity</span>
                <strong>{totalCapacity.toLocaleString()}</strong>
              </div>
              <div>
                <span>Starting Price</span>
                <strong>
                  {currencyAmount(minimumPrice, draft.currency)}
                </strong>
              </div>
              <div>
                <span>Seating Type</span>
                <strong>{draft.admissionType}</strong>
              </div>
            </div>

            <div className="vef-review-tiers">
              <h4>Ticket Categories</h4>
              {draft.ticketTiers.map((tier) => (
                <div key={tier.id}>
                  <span>
                    {tier.name || "Unnamed"}{" "}
                    {!tier.enabled && "(Disabled)"}
                  </span>
                  <strong>
                    {currencyAmount(tier.price, draft.currency)}
                    {" · "}
                    {tier.capacity} tickets
                  </strong>
                </div>
              ))}
            </div>

            {draft.venueLayoutImage && (
              <div className="vef-review-layout">
                <h4>Venue Map</h4>
                <img
                  src={draft.venueLayoutImage}
                  alt="Uploaded venue layout"
                />
              </div>
            )}
          </div>
        );
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < 5) {
      next();
    }
  };

  return (
    <div
      className="vef-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="vef-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={
          initialEvent?.id ? "Edit Event" : "Create New Event"
        }
      >
        <header className="vef-header">
          <div>
            <p className="vef-eyebrow">
              <CalendarDays size={14} />
              VIZHATICKETS EVENT MANAGEMENT
            </p>
            <h2>
              {initialEvent?.id
                ? "Edit Event"
                : "Create New Event"}
            </h2>
            <p>Configure your event, ticket tiers and venue.</p>
          </div>

          <button
            type="button"
            className="vef-close"
            onClick={onClose}
            aria-label="Close event form"
          >
            <X size={21} />
          </button>
        </header>

        <div className="vef-progress" aria-label="Event setup steps">
          {STEPS.map((label, index) => (
            <button
              type="button"
              key={label}
              className={[
                "vef-step",
                step === index ? "vef-step-active" : "",
                step > index ? "vef-step-complete" : "",
              ].join(" ")}
              onClick={() => {
                setStep(index);
                setError("");
              }}
            >
              <span>
                {step > index ? <Check size={14} /> : index + 1}
              </span>
              <small>{label}</small>
            </button>
          ))}
        </div>

        <form className="vef-form" onSubmit={submitForm}>
          <div className="vef-body" key={step}>
            <div className="vef-content-heading">
              <h3>{STEPS[step]}</h3>
              <p>
                Step {step + 1} of {STEPS.length}
              </p>
            </div>

            {stepContent()}

            {error && (
              <div className="vef-error" role="alert">
                <Info size={18} />
                {error}
              </div>
            )}
          </div>

          <footer className="vef-footer">
            <div className="vef-footer-left">
              <button
                type="button"
                className="vef-btn vef-btn-light"
                onClick={
                  step === 0
                    ? onClose
                    : () => {
                        setStep((current) => current - 1);
                        setError("");
                      }
                }
              >
                <ArrowLeft size={16} />
                {step === 0 ? "Cancel" : "Back"}
              </button>
            </div>

            <div className="vef-footer-right">
              <button
                type="button"
                className="vef-btn vef-btn-outline"
                disabled={saving || uploading}
                onClick={() => void save("Draft")}
              >
                <Save size={16} />
                Save Draft
              </button>

              {step < 5 ? (
                <button
                  type="submit"
                  className="vef-btn vef-btn-primary"
                  disabled={saving || uploading}
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="vef-btn vef-btn-primary"
                  disabled={saving || uploading}
                  onClick={() => void save("Published")}
                >
                  <CheckCircle2 size={17} />
                  Publish Event
                </button>
              )}
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
