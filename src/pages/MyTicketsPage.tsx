
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Ticket,
  UsersRound,
} from "lucide-react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

import BookingQRCode from "../components/tickets/BookingQRCode";

import { useCustomerSession } from "../lib/customerSession";

import {
  useCustomerBookings,
  formatBookingMoney,
} from "../lib/customerBookings";

/* ==========================================================
   VIZHATICKETS — MY TICKETS

   Displays ONE QR code for EACH booking.

   A booking with 10 tickets:
   - 1 booking card
   - 1 group QR
   - 10 ticket references within that booking

   ========================================================== */

export default function MyTicketsPage() {
  const { customer } = useCustomerSession();

  const {
    bookings,
    totalBookings,
    totalTickets,
  } = useCustomerBookings(customer?.id);

  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf2] text-[#211b15]">
      <Header />

      <main className="mx-auto w-full max-w-300 flex-1 px-4 py-9 sm:px-6 lg:px-8">

        {/* BREADCRUMBS */}

        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-[12px]"
        >
          <Link
            to="/profile"
            className="text-[#8c7968] hover:text-[#c9790b]"
          >
            My Account
          </Link>

          <ChevronRight
            size={14}
            className="text-[#baa994]"
          />

          <span className="font-bold text-[#bb741b]">
            My Tickets
          </span>
        </nav>

        {/* PAGE HEADER */}

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#c9790b]">
              VizhaTickets Customer
            </p>

            <h1 className="mt-2 font-serif text-[clamp(2rem,4vw,2.8rem)] font-bold">
              My{" "}
              <span className="text-[#c9790b]">
                Tickets
              </span>
            </h1>

            <p className="mt-2 text-[13px] text-[#87786a]">
              Manage your group bookings and QR codes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <span className="rounded-full border border-[#f0dbb9] bg-[#fff2dc] px-4 py-2 text-[12px] font-bold text-[#a36b1d]">
              {totalTickets} Ticket
              {totalTickets === 1 ? "" : "s"}
            </span>

            <span className="rounded-full border border-[#eadccb] bg-white px-4 py-2 text-[12px] font-bold text-[#796957]">
              {totalBookings} Booking
              {totalBookings === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* EMPTY STATE */}

        {totalBookings === 0 ? (
          <section className="mt-8 flex min-h-90 flex-col items-center justify-center rounded-[26px] border border-[#eee0cd] bg-white px-6 py-12 text-center shadow-sm">

            <div className="flex h-19.5 w-19.5 items-center justify-center rounded-[22px] bg-[#fff1dc] text-[#c9790b]">
              <Ticket size={36} />
            </div>

            <h2 className="mt-5 font-serif text-[24px] font-bold">
              No Tickets Yet
            </h2>

            <p className="mt-3 max-w-105 text-[13px] leading-relaxed text-[#897868]">
              After completing a demo checkout,
              your group booking and QR code
              will appear here automatically.
            </p>

            <Link
              to="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#df810b] px-6 py-3 text-[12px] font-bold text-white transition-colors hover:bg-[#b96b08]"
            >
              Explore Events
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <div className="mt-8 space-y-7">

            {/* LOOP THROUGH BOOKINGS, NOT TICKETS */}

            {bookings.map((booking) => {
              const confirmationUrl =
                `/booking-success?booking=${encodeURIComponent(
                  booking.reference
                )}`;

              return (
                <article
                  key={booking.id}
                  className="overflow-hidden rounded-[26px] border border-[#eee1d2] bg-white shadow-[0_10px_32px_rgba(86,48,16,0.06)]"
                >
                  <div className="grid items-start lg:grid-cols-[minmax(0,1fr)_380px]">

                    {/* LEFT — GROUP BOOKING INFO */}

                    <div className="p-5 sm:p-7">

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0d8] px-3 py-1.5 text-[11px] font-bold text-[#ac6c15]">
                          <UsersRound size={15} />
                          Group Booking
                        </span>

                        <span className="rounded-full bg-[#f1f8ed] px-3 py-1.5 text-[10px] font-bold text-[#55844b]">
                          Demo Confirmed
                        </span>
                      </div>

                      {/* EVENT IMAGE */}

                      <div className="mt-5 overflow-hidden rounded-[19px] border border-[#eee2d6] bg-[#f1e5d6]">

                        <img
                          src={booking.eventImage}
                          alt={booking.eventTitle}
                          className="aspect-video w-full object-cover"
                        />
                      </div>

                      <h2 className="mt-5 font-serif text-[24px] font-bold leading-tight">
                        {booking.eventTitle}
                      </h2>

                      {/* EVENT DETAILS */}

                      <div className="mt-4 space-y-3">

                        <p className="flex items-center gap-2 text-[12px] text-[#796b5d]">
                          <CalendarDays
                            size={16}
                            className="text-[#c9790b]"
                          />
                          {booking.eventDate}
                        </p>

                        <p className="flex items-center gap-2 text-[12px] text-[#796b5d]">
                          <Clock3
                            size={16}
                            className="text-[#c9790b]"
                          />
                          {booking.eventTime}
                        </p>

                        <p className="flex items-start gap-2 text-[12px] text-[#796b5d]">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0 text-[#c9790b]"
                          />
                          {booking.eventVenue}
                        </p>
                      </div>

                      {/* BOOKING SUMMARY */}

                      <div className="mt-6 grid gap-5 border-t border-[#f0e5d9] pt-5 sm:grid-cols-2">

                        <div>
                          <p className="text-[10px] font-bold uppercase text-[#978779]">
                            Booking Reference
                          </p>

                          <p className="mt-1.5 break-all font-mono text-[12px] font-bold">
                            {booking.reference}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase text-[#978779]">
                            Ticket Category
                          </p>

                          <p className="mt-1.5 text-[13px] font-bold">
                            {booking.ticketTypeLabel}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase text-[#978779]">
                            Total Tickets
                          </p>

                          <p className="mt-1.5 text-[14px] font-extrabold text-[#c9790b]">
                            {booking.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase text-[#978779]">
                            Booking Total
                          </p>

                          <p className="mt-1.5 text-[14px] font-extrabold text-[#c9790b]">
                            {formatBookingMoney(
                              booking.currency,
                              booking.total
                            )}
                          </p>
                        </div>
                      </div>

                      {/* ALL REFERENCES */}

                      <div className="mt-6 border-t border-[#f0e5d9] pt-5">

                        <h3 className="text-[13px] font-bold">
                          Included Tickets
                        </h3>

                        <p className="mt-1 text-[11px] text-[#918071]">
                          All tickets are included in the
                          single QR code on the right.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">

                          {booking.tickets.map(
                            (ticket, index) => (
                              <span
                                key={ticket.id}
                                className="rounded-lg border border-[#eee2d3] bg-[#fffaf3] px-3 py-2 text-[10px] text-[#715c47]"
                                title={ticket.reference}
                              >
                                Ticket {index + 1}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* ACTION */}

                      <Link
                        to={confirmationUrl}
                        className="mt-6 inline-flex min-h-10.75 items-center gap-2 rounded-full bg-[#db810d] px-5 text-[12px] font-bold text-white transition hover:bg-[#b76a08]"
                      >
                        View Full Booking
                        <ArrowRight size={16} />
                      </Link>
                    </div>

                    {/* RIGHT — ONE QR */}

                    <div className="border-t border-[#eee1d2] bg-[#fffcf7] p-4 lg:border-l lg:border-t-0">

                      <BookingQRCode
                        booking={booking}
                        compact
                      />
                    </div>
                  </div>
                </article>
              );
            })}

            {/* DISCLAIMER */}

            <div className="rounded-2xl border border-[#f1dfc0] bg-[#fff6e6] p-4 text-[12px] leading-relaxed text-[#826947]">
              These are demo group-booking QR codes.
              They contain booking summaries but
              cannot be used for actual venue admission.
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
