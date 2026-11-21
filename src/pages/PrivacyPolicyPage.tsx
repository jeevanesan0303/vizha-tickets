
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Introduction",
    content:
      "VizhaTickets respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and share information when you access or use our platform.",
  },
  {
    title: "2. Information We Collect",
    content:
      "We may collect personal information such as your name, email address, telephone number, account details, booking information, ticket information, transaction records, and information you provide when contacting customer support.",
  },
  {
    title: "3. Information Collected Automatically",
    content:
      "When you use our platform, we may collect technical information such as IP address, browser type, device information, pages visited, access times, diagnostic data, and usage information necessary to maintain and improve our services.",
  },
  {
    title: "4. How We Use Your Information",
    content:
      "We use information to create and manage accounts, process ticket bookings, deliver tickets, verify event attendance, process payments through payment providers, communicate booking updates, respond to inquiries, prevent fraud, improve our services, and comply with legal obligations.",
  },
  {
    title: "5. Payments and Transactions",
    content:
      "Payments may be processed through third-party payment providers. Payment information may be handled directly by those providers in accordance with their security practices and privacy policies. We may receive transaction-related information needed to confirm and manage bookings.",
  },
  {
    title: "6. Sharing Information",
    content:
      "We may share relevant booking and attendee information with event organizers when necessary to manage events, verify tickets, coordinate entry, provide event services, and communicate important event information. We may also share information with service providers who support hosting, analytics, communications, payment processing, and platform operations.",
  },
  {
    title: "7. Cookies and Similar Technologies",
    content:
      "Our platform may use cookies or similar technologies to maintain sessions, remember preferences, improve performance, understand platform usage, and support security. You may be able to control cookies through your browser settings. Disabling certain cookies may affect platform functionality.",
  },
  {
    title: "8. Data Security",
    content:
      "We take reasonable technical and organizational measures designed to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure. However, no internet-based system or storage method can be guaranteed to be completely secure.",
  },
  {
    title: "9. Data Retention",
    content:
      "We retain personal information for as long as reasonably necessary to provide our services, maintain booking and transaction records, resolve disputes, enforce our terms, and meet legal or regulatory obligations. Information may be securely deleted or anonymized when it is no longer required.",
  },
  {
    title: "10. Your Privacy Rights",
    content:
      "Subject to applicable law, you may have rights to request access to your personal information, correct inaccurate information, request deletion, object to certain processing, or withdraw consent where processing is based on consent. Requests may be subject to identity verification and legal requirements.",
  },
  {
    title: "11. Third-Party Services",
    content:
      "VizhaTickets may use third-party services such as payment providers, hosting providers, analytics services, and communication tools. These services may process information in accordance with their own privacy policies and applicable agreements.",
  },
  {
    title: "12. Children's Privacy",
    content:
      "VizhaTickets is not intended to knowingly collect personal information from children in violation of applicable law. Where age restrictions apply to an event or service, users must comply with those restrictions.",
  },
  {
    title: "13. Changes to This Privacy Policy",
    content:
      "We may update this Privacy Policy as our services, practices, or legal obligations change. Any updated version will be published on this page along with a revised effective date.",
  },
  {
    title: "14. Contact Us",
    content:
      "If you have questions about this Privacy Policy or how your personal information is handled, please contact the VizhaTickets team using the contact details available on our platform.",
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>

          <p className="max-w-2xl text-gray-400">
            Learn how VizhaTickets collects, uses, protects, and manages your
            personal information.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Effective date: November 18, 2026
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-white/10 bg-white/3 p-5 md:p-7">
          <p className="leading-7 text-gray-300">
            This policy applies to users who browse events, register accounts,
            purchase tickets, interact with event organizers, or otherwise use
            VizhaTickets.
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
            Your privacy matters to us. By using VizhaTickets, you acknowledge
            that you have reviewed this Privacy Policy.
          </p>

          <Link
            to="/terms"
            className="mt-4 inline-flex text-sm font-medium text-white underline underline-offset-4 hover:text-gray-300"
          >
            Read our Terms & Conditions →
          </Link>
        </div>
      </div>
    </div>
  );
}
