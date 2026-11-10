
/* ==========================================================
   VIZHATICKETS — EVENT BOOKING POLICIES

   DEMO CONFIGURATION ONLY

   Organizer approval is required before using any
   cancellation, refund or transfer policy in production.
   ========================================================== */

export type RefundPolicy =
  | "cutoff"
  | "non-refundable"
  | "organizer-review";

export interface EventBookingPolicy {
  eventSlug: string;
  refundPolicy: RefundPolicy;
  refundCutoffHours?: number;
  serviceFeeRefundable: boolean;
  transferAllowed: boolean;
  transferCutoffHours?: number;
  ageNotice?: string;
  additionalTerms: string[];
  version: string;
  demo: boolean;
}

const demoPolicies: Record<
  string,
  EventBookingPolicy
> = {
  "yuvan-live-in-concert": {
    eventSlug: "yuvan-live-in-concert",
    refundPolicy: "cutoff",
    refundCutoffHours: 24,
    serviceFeeRefundable: false,
    transferAllowed: false,
    additionalTerms: [
      "Each ticket is for one attendee.",
      "Admission may require a valid identification document.",
      "Event changes and cancellations are subject to organizer confirmation.",
    ],
    version: "demo-1",
    demo: true,
  },

  "bharathanatyam-arangetram": {
    eventSlug: "bharathanatyam-arangetram",
    refundPolicy: "organizer-review",
    serviceFeeRefundable: false,
    transferAllowed: false,
    additionalTerms: [
      "Refund requests require organizer review.",
      "Please arrive before the performance begins.",
    ],
    version: "demo-1",
    demo: true,
  },

  "tamil-stand-up-comedy-night": {
    eventSlug: "tamil-stand-up-comedy-night",
    refundPolicy: "cutoff",
    refundCutoffHours: 48,
    serviceFeeRefundable: false,
    transferAllowed: true,
    transferCutoffHours: 24,
    additionalTerms: [
      "Name changes must be requested before the transfer deadline.",
      "Admission is subject to venue rules.",
    ],
    version: "demo-1",
    demo: true,
  },

  "ipl-2026-jaffna-kings": {
    eventSlug: "ipl-2026-jaffna-kings",
    refundPolicy: "organizer-review",
    serviceFeeRefundable: false,
    transferAllowed: false,
    additionalTerms: [
      "Event schedule and admission conditions require organizer confirmation.",
      "Weather-related postponements require a separate organizer policy.",
    ],
    version: "demo-1",
    demo: true,
  },

  "jaffna-food-festival-2026": {
    eventSlug: "jaffna-food-festival-2026",
    refundPolicy: "cutoff",
    refundCutoffHours: 24,
    serviceFeeRefundable: false,
    transferAllowed: true,
    transferCutoffHours: 48,
    additionalTerms: [
      "Food and merchandise purchases are not included in the admission ticket.",
      "Individual vendors may have separate purchase and refund conditions.",
    ],
    version: "demo-1",
    demo: true,
  },
};

export function getEventBookingPolicy(
  eventSlug: string
): EventBookingPolicy {
  return (
    demoPolicies[eventSlug] ?? {
      eventSlug,
      refundPolicy: "organizer-review",
      serviceFeeRefundable: false,
      transferAllowed: false,
      additionalTerms: [
        "Cancellation and refund conditions have not been confirmed by the organizer.",
      ],
      version: "demo-1",
      demo: true,
    }
  );
}

export function getRefundPolicyText(
  policy: EventBookingPolicy
): string {
  if (
    policy.refundPolicy === "cutoff" &&
    policy.refundCutoffHours
  ) {
    return (
      `Sample rule: Cancellation requests may be ` +
      `eligible for a refund when submitted at least ` +
      `${policy.refundCutoffHours} hours before the event.`
    );
  }

  if (policy.refundPolicy === "non-refundable") {
    return "Sample rule: Tickets are non-refundable except where applicable law or organizer-approved exceptions require otherwise.";
  }

  return "Refund and cancellation requests are subject to organizer review. No refund is guaranteed.";
}

export function getTransferPolicyText(
  policy: EventBookingPolicy
): string {
  if (!policy.transferAllowed) {
    return "Ticket transfers are not enabled under this sample policy.";
  }

  if (policy.transferCutoffHours) {
    return (
      `Sample rule: Ticket transfers may be requested ` +
      `up to ${policy.transferCutoffHours} hours ` +
      `before the event.`
    );
  }

  return "Ticket transfers may be requested under organizer-approved conditions.";
}
