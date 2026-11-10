
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Ticket,
} from "lucide-react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

import { useCustomerSession } from "../lib/customerSession";

import {
  formatBookingMoney,
  useCustomerBookings,
} from "../lib/customerBookings";

export default function MyBookingsPage() {
  const { customer } = useCustomerSession();

  const { bookings, totalBookings } =
    useCustomerBookings(customer?.id);

  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf2] text-[#211b15]">
      <Header />

      <main className="mx-auto w-full max-w-287.5 flex-1 px-4 py-9 sm:px-6 lg:px-8">

        {/* BREADCRUMB */}

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

          <ChevronRight size={14} />

          <span className="font-bold text-[#c9790b]">
            My Bookings
          </span>
        </nav>

        {/* HEADER */}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#c9790b]">
              VizhaTickets Customer
            </p>

            <h1 className="mt-2 font-serif text-[clamp(2rem,4vw,2.8rem)] font-bold">
              My <span className="text-[#c9790b]">Bookings</span>
            </h1>

            <p className="mt-2 text-[13px] text-[#89796a]">
              Review your booking history and view ticket details.
            </p>
          </div>

          <span className="rounded-full border border-[#eed9b7] bg-[#fff3e0] px-4 py-2 text-[12px] font-bold text-[#a86c1a]">
            {totalBookings} Booking{totalBookings === 1 ? "" : "s"}
          </span>
        </div>

        {/* EMPTY STATE */}

        {totalBookings === 0 ? (
          <section className="mt-8 flex min-h-90 flex-col items-center justify-center rounded-[25px] border border-[#eee0ce] bg-white px-6 py-12 text-center shadow-sm">
            <div className="flex h-19 w-19 items-center justify-center rounded-[22px] bg-[#fff0dc] text-[#c9790b]">
              <CalendarDays size={36} />
            </div>

            <h2 className="mt-5 font-serif text-[24px] font-bold">
              No Bookings Yet
            </h2>

            <p className="mt-3 max-w-md text-center text-[13px] leading-relaxed text-[#857566]">
              When you complete a demo checkout, your booking
              will appear here automatically.
            </p>

            <Link
              to="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#dc800c] px-6 py-3 text-[12px] font-bold text-white"
            >
              Explore Events
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <div className="mt-8 space-y-5">
            {bookings.map((booking) => {
              const confirmationUrl =
                `/booking-success?booking=${encodeURIComponent(
                  booking.reference
                )}`;

              return (
                <article
                  key={booking.id}
                  className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white p-5 shadow-[0_8px_30px_rgba(86,48,16,0.055)] sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <img
                      src={booking.eventImage}
                      alt={booking.eventTitle}
                      className="h-43.75 w-full shrink-0 rounded-[17px] bg-[#eee2d2] object-cover sm:h-42.5 sm:w-52.5"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="font-serif text-[21px] font-bold">
                            {booking.eventTitle}
                          </h2>

                          <p className="mt-2 break-all font-mono text-[11px] text-[#897869]">
                            {booking.reference}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5eddb] bg-[#f2f9ed] px-3 py-1.5 text-[10px] font-bold text-[#53804b]">
                          <CheckCircle2 size={14} />
                          Demo Confirmed
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-[12px] text-[#817061]">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays
                            size={15}
                            className="text-[#c9790b]"
                          />
                          {booking.eventDate}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Clock3
                            size={15}
                            className="text-[#c9790b]"
                          />
                          {booking.eventTime}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <MapPin
                            size={15}
                            className="text-[#c9790b]"
                          />
                          {booking.eventVenue}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-[#f0e6da] pt-4">
                        <div className="flex flex-wrap gap-6">
                          <div>
                            <p className="text-[10px] text-[#998779]">
                              Ticket Category
                            </p>

                            <p className="mt-1 text-[12px] font-bold">
                              {booking.ticketTypeLabel}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] text-[#998779]">
                              Quantity
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-[12px] font-bold">
                              <Ticket size={14} />
                              {booking.quantity}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] text-[#998779]">
                              Demo Total
                            </p>

                            <p className="mt-1 text-[14px] font-extrabold text-[#c9790b]">
                              {formatBookingMoney(
                                booking.currency,
                                booking.total
                              )}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={confirmationUrl}
                          className="inline-flex min-h-10.5 items-center gap-2 rounded-full bg-linear-to-r from-[#f1a01c] to-[#dc7806] px-5 text-[12px] font-bold text-white transition hover:brightness-95"
                        >
                          View Details
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
