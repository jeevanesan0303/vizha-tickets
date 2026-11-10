
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Info,
  MapPin,
  Ticket,
  UserRound,
  Wallet,
} from "lucide-react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

import BookingQRCode from "../components/tickets/BookingQRCode";

import { useCustomerSession } from "../lib/customerSession";
import { useAuthModal } from "../contexts/AuthModalContext";

import {
  formatBookingMoney,
  useCustomerBookings,
} from "../lib/customerBookings";

/* ==========================================================
   VIZHATICKETS — BOOKING SUCCESS PAGE

   ONE QR PER BOOKING

   - Supports multiple tickets under one booking
   - Shows all individual ticket references
   - Displays one combined QR code
   - Connected to customer booking storage
   - PDF printing
   - Profile / tickets / bookings navigation
   ========================================================== */

function BookingDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#948374]">
        {label}
      </p>

      <p className="mt-1.5 wrap-break-word text-[13px] font-semibold text-[#292119]">
        {value}
      </p>
    </div>
  );
}

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();

  const { customer } = useCustomerSession();
  const { openLogin } = useAuthModal();

  const reference = searchParams.get("booking") ?? "";

  const { bookings } = useCustomerBookings(customer?.id);

  const booking =
    bookings.find(
      (item) => item.reference === reference
    ) ?? null;

  const createdDate = booking
    ? new Date(booking.createdAt)
    : null;

  const dateLabel =
    createdDate &&
    !Number.isNaN(createdDate.getTime())
      ? createdDate.toLocaleString("en-LK", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Not available";

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#211b15]">

      <div className="vizha-print-hide">
        <Header />
      </div>

      <main className="py-8 sm:py-12">
        <div className="vizha-container max-w-212.5">

          {/* BACK LINK */}

          <div className="vizha-print-hide mb-7">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#b17419]"
            >
              <ArrowLeft size={16} />
              Back to Events
            </Link>
          </div>

          {!booking ? (
            /* BOOKING NOT FOUND */

            <section className="rounded-[25px] border border-[#eee0cc] bg-white px-6 py-14 text-center shadow-sm">

              <Ticket
                size={44}
                className="mx-auto text-[#c9790b]"
              />

              <h1 className="mt-5 font-serif text-[28px] font-bold">
                {customer
                  ? "Booking Not Found"
                  : "Sign In Required"}
              </h1>

              <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-[#796c5f]">
                {customer
                  ? "This booking could not be found for your current demo customer account."
                  : "Please sign in using the customer account that created this booking."}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">

                {!customer && (
                  <button
                    type="button"
                    onClick={openLogin}
                    className="rounded-full bg-[#cf7d0b] px-6 py-3 text-[12px] font-bold text-white"
                  >
                    Sign In
                  </button>
                )}

                <Link
                  to="/my-bookings"
                  className="rounded-full border border-[#e9d9c5] px-6 py-3 text-[12px] font-bold text-[#a76a1e]"
                >
                  My Bookings
                </Link>
              </div>
            </section>
          ) : (
            <>
              {/* SUCCESS HEADING */}

              <div className="vizha-print-hide text-center">

                <span className="mx-auto flex h-17.5 w-17.5 items-center justify-center rounded-full bg-[#eaf8ee] text-[#2c8b4e]">
                  <CheckCircle2 size={38} />
                </span>

                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#ac771b]">
                  VizhaTickets Demo Booking
                </p>

                <h1 className="mt-2 font-serif text-[clamp(2rem,4vw,2.7rem)] font-bold">
                  Booking Confirmed!
                </h1>

                <p className="mt-2 text-[13px] text-[#807163]">
                  Your group booking has been saved
                  to your customer account in this browser.
                </p>
              </div>

              <div id="vizha-print-area">

                {/* ====================================
                    CONFIRMATION CARD
                    ==================================== */}

                <article className="mt-8 overflow-hidden rounded-[26px] border border-[#eadfce] bg-white shadow-[0_14px_45px_rgba(69,38,10,0.09)]">

                  {/* DARK HEADER */}

                  <div className="bg-[#171411] px-6 py-7 text-white sm:px-8">

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <img
                        src="/images/branding/vizha-logo.png"
                        alt="VizhaTickets"
                        className="h-11 w-auto max-w-45 rounded-lg bg-white px-2 py-1 object-contain"
                      />

                      <span className="rounded-full border border-[#edba6d]/30 bg-[#d2830b]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#f0b85e]">
                        Demo Group Booking
                      </span>
                    </div>

                    <h2 className="mt-6 font-serif text-[clamp(1.5rem,3vw,2rem)] font-bold">
                      {booking.eventTitle}
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-white/75">

                      <span className="flex items-center gap-1.5">
                        <CalendarDays
                          size={14}
                          className="text-[#e4a33e]"
                        />
                        {booking.eventDate}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock3
                          size={14}
                          className="text-[#e4a33e]"
                        />
                        {booking.eventTime}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MapPin
                          size={14}
                          className="text-[#e4a33e]"
                        />
                        {booking.eventVenue}
                      </span>
                    </div>
                  </div>

                  {/* PERFORATION */}

                  <div className="bg-white px-6 py-3">
                    <div className="border-t-2 border-dashed border-[#e9ddd0]" />
                  </div>

                  {/* BOOKING DETAILS */}

                  <div className="px-6 pb-7 sm:px-8">

                    <div className="grid gap-6 sm:grid-cols-2">

                      <BookingDetail
                        label="Booking Reference"
                        value={booking.reference}
                      />

                      <BookingDetail
                        label="Attendee"
                        value={`${booking.attendee.firstName} ${booking.attendee.lastName}`.trim()}
                      />

                      <BookingDetail
                        label="Ticket Category"
                        value={booking.ticketTypeLabel}
                      />

                      <BookingDetail
                        label="Number of Tickets"
                        value={`${booking.quantity} ticket(s)`}
                      />

                      <BookingDetail
                        label="Contact Email"
                        value={booking.attendee.email}
                      />

                      <BookingDetail
                        label="Contact Phone"
                        value={booking.attendee.phone || "Not provided"}
                      />

                      <BookingDetail
                        label="Booking Created"
                        value={dateLabel}
                      />
                    </div>

                    {/* PRICE SUMMARY */}

                    <div className="mt-7 rounded-[18px] border border-[#efe1cf] bg-[#fffaf3] p-5">

                      <h3 className="mb-4 flex items-center gap-2 text-[13px] font-bold">
                        <Wallet
                          size={17}
                          className="text-[#c9790b]"
                        />
                        Booking Price Summary
                      </h3>

                      <div className="space-y-3 text-[12px]">

                        <div className="flex justify-between gap-3">
                          <span className="text-[#817263]">
                            {booking.quantity} ×{" "}
                            {booking.ticketTypeLabel}
                          </span>

                          <span className="font-semibold">
                            {formatBookingMoney(
                              booking.currency,
                              booking.subtotal
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-[#817263]">
                            Service Fee (5%)
                          </span>

                          <span className="font-semibold">
                            {formatBookingMoney(
                              booking.currency,
                              booking.serviceFee
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3 border-t border-[#e7d8c4] pt-3">

                          <span className="font-bold">
                            Demo Total
                          </span>

                          <span className="text-[18px] font-extrabold text-[#c9790b]">
                            {formatBookingMoney(
                              booking.currency,
                              booking.total
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* STATUS */}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">

                      <div className="rounded-xl border border-[#e1edda] bg-[#f5fbf1] p-4">

                        <p className="text-[10px] font-bold uppercase text-[#6b8954]">
                          Booking Status
                        </p>

                        <p className="mt-1 flex items-center gap-2 text-[12px] font-bold text-[#477d3f]">
                          <CheckCircle2 size={15} />
                          Demo Confirmed
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#f0dfc0] bg-[#fff8ec] p-4">

                        <p className="text-[10px] font-bold uppercase text-[#a37d43]">
                          Payment Status
                        </p>

                        <p className="mt-1 text-[12px] font-bold text-[#a36c21]">
                          Not Charged — Demo
                        </p>
                      </div>
                    </div>
                  </div>
                </article>

                {/* ====================================
                    ONE GROUP BOOKING QR
                    ==================================== */}

                <section className="mt-8">

                  <div className="mb-5 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#bc791a]">
                      Digital Booking Pass
                    </p>

                    <h2 className="mt-2 font-serif text-[25px] font-bold">
                      Your Group Booking QR
                    </h2>

                    <p className="mt-2 text-[12px] text-[#857466]">
                      One QR code represents all{" "}
                      {booking.quantity} tickets in
                      this booking.
                    </p>
                  </div>

                  <BookingQRCode booking={booking} />
                </section>

                {/* DISCLAIMER */}

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#f0d9ae] bg-[#fff5e4] p-4">

                  <Info
                    size={18}
                    className="mt-0.5 shrink-0 text-[#b67a20]"
                  />

                  <p className="text-[11px] leading-relaxed text-[#7d6848]">
                    This group QR code is for demonstration
                    only. It is not a valid admission pass.
                    No payment has been collected, no
                    confirmation email has been sent and
                    no gate validation is connected.
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}

              <div className="vizha-print-hide mt-6 grid gap-3 sm:grid-cols-3">

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex min-h-11.5 items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#f7a21a] to-[#da7600] px-4 text-[12px] font-bold text-white transition hover:brightness-95"
                >
                  <Download size={16} />
                  Print / Save PDF
                </button>

                <Link
                  to="/my-tickets"
                  className="flex min-h-11.5 items-center justify-center gap-2 rounded-full border border-[#ead9c6] bg-white px-4 text-[12px] font-bold text-[#9b6a23]"
                >
                  <Ticket size={16} />
                  My Tickets
                </Link>

                <Link
                  to="/my-bookings"
                  className="flex min-h-11.5 items-center justify-center gap-2 rounded-full border border-[#ead9c6] bg-white px-4 text-[12px] font-bold text-[#9b6a23]"
                >
                  <UserRound size={16} />
                  My Bookings
                </Link>
              </div>

              <div className="vizha-print-hide mt-7 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-[12px] font-bold text-[#b17823]"
                >
                  Return to Homepage
                  <ArrowRight size={15} />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <div className="vizha-print-hide">
        <Footer />
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          .vizha-print-hide {
            display: none !important;
          }

          body,
          #root {
            background: white !important;
          }

          main {
            padding: 0 !important;
          }

          .vizha-container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
          }

          #vizha-print-area,
          #vizha-print-area * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          #vizha-print-area article {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
