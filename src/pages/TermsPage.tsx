
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using VizhaTickets, you agree to these Terms and Conditions. If you do not agree with these terms, please do not use our platform.",
  },
  {
    title: "2. About VizhaTickets",
    content:
      "VizhaTickets is an online platform that enables users to discover events, book tickets, and access event-related information. Events may be organized by independent event organizers who are responsible for the information, arrangements, and delivery of their respective events.",
  },
  {
    title: "3. User Accounts",
    content:
      "Users must provide accurate information when registering and maintain the confidentiality of their account credentials. You are responsible for activities carried out through your account and must notify us if you suspect unauthorized access.",
  },
  {
    title: "4. Ticket Purchases and Bookings",
    content:
      "All ticket purchases are subject to availability, event-specific requirements, applicable payment terms, and confirmation. Users should carefully review event details, ticket types, dates, venue information, and restrictions before completing a booking.",
  },
  {
    title: "5. Ticket Validity and Entry",
    content:
      "Tickets issued through VizhaTickets are intended for the event specified on the ticket. Entry may be subject to verification, QR code validation, venue rules, age restrictions, and conditions established by the event organizer. A ticket may be rejected if it is invalid, duplicated, altered, or already used.",
  },
  {
    title: "6. Payments",
    content:
      "Users must complete the payment process using the payment methods available on the platform. Bookings may not be confirmed until the required payment has been successfully processed. VizhaTickets is not responsible for delays caused by banks, payment providers, or third-party payment services.",
  },
  {
    title: "7. Refunds and Cancellations",
    content:
      "Refunds, cancellations, and ticket changes are subject to the applicable event policy and the circumstances of the request. If an event is cancelled, postponed, rescheduled, or materially changed, the applicable resolution will be communicated to ticket holders. Users should review the event-specific refund policy before purchasing.",
  },
  {
    title: "8. Event Changes",
    content:
      "Event organizers may make changes to event schedules, venues, performers, arrangements, or other details where necessary. VizhaTickets will make reasonable efforts to display or communicate relevant updates when information is provided to us.",
  },
  {
    title: "9. User Conduct",
    content:
      "Users must not misuse the platform, attempt fraudulent purchases, interfere with ticket validation, manipulate bookings, violate applicable laws, or engage in activities that compromise the security or operation of VizhaTickets.",
  },
  {
    title: "10. Event Organizer Responsibilities",
    content:
      "Event organizers are responsible for the accuracy of event information, event arrangements, venue safety, permits, delivery of the event, and compliance with applicable laws and regulations. VizhaTickets provides a platform for event discovery and ticketing and does not independently guarantee the performance of every event.",
  },
  {
    title: "11. Limitation of Liability",
    content:
      "To the extent permitted by applicable law, VizhaTickets shall not be liable for indirect, incidental, or consequential losses arising from the use of the platform, third-party services, or events organized by independent organizers. Nothing in these terms excludes liability that cannot legally be excluded.",
  },
  {
    title: "12. Privacy",
    content:
      "Your personal information is handled in accordance with our Privacy Policy. By using VizhaTickets, you acknowledge that information may be processed as necessary to provide booking, ticketing, account, payment, and customer support services.",
  },
  {
    title: "13. Platform Availability",
    content:
      "We aim to maintain reliable access to VizhaTickets but do not guarantee uninterrupted availability. Maintenance, technical issues, network interruptions, or circumstances beyond our control may temporarily affect the platform.",
  },
  {
    title: "14. Changes to These Terms",
    content:
      "VizhaTickets may update these Terms and Conditions from time to time. Updated terms will be published on this page with a revised effective date. Continued use of the platform after changes take effect constitutes acceptance of the updated terms where permitted by law.",
  },
  {
    title: "15. Governing Law",
    content:
      "These terms are subject to applicable laws of Sri Lanka. Any disputes will be handled in accordance with the applicable legal framework and jurisdiction of Sri Lanka.",
  },
  {
    title: "16. Contact Us",
    content:
      "If you have any questions regarding these Terms and Conditions, please contact the VizhaTickets support team through the contact information provided on our platform.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <div className="mb-10">
          <Link
            to="/"
            className="mb-8 inline-flex text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Home
          </Link>

          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400">
            Legal Information
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
            Terms & Conditions
          </h1>

          <p className="max-w-2xl text-gray-400">
            Please read these terms carefully before using VizhaTickets,
            purchasing tickets, or accessing event services.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Effective date: November 18, 2026
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-white/10 bg-white/3 p-5 md:p-7">
          <p className="leading-7 text-gray-300">
            These Terms and Conditions govern your access to and use of the
            VizhaTickets platform, including browsing events, creating accounts,
            purchasing tickets, and using ticket-related services.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <section key={index} className="border-b border-white/10 pb-7">
              <h2 className="mb-3 text-xl font-semibold md:text-2xl">
                {section.title}
              </h2>

              <p className="text-[15px] leading-8 text-gray-400">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/3 p-6">
          <p className="text-sm leading-7 text-gray-400">
            By using VizhaTickets, you acknowledge that you have read and
            understood these Terms and Conditions.
          </p>

          <Link
            to="/privacy-policy"
            className="mt-4 inline-flex text-sm font-medium text-white underline underline-offset-4 hover:text-gray-300"
          >
            Read our Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
