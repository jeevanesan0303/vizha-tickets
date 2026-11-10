
import {
  useState,
  type FormEvent,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
  X,
} from "lucide-react";

import { isValidPhoneNumber } from "react-phone-number-input";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

import {
  useCustomerSession,
  updateCustomerProfile,
} from "../lib/customerSession";

import {
  useCustomerBookings,
  formatBookingMoney,
} from "../lib/customerBookings";

export default function CustomerDashboard() {
  const { customer } = useCustomerSession();

  const {
    bookings,
    totalBookings,
    totalTickets,
  } = useCustomerBookings(customer?.id);

  const [editing, setEditing] = useState(false);
  const [nameEdit, setNameEdit] = useState<
    string | null
  >(null);
  const [phoneEdit, setPhoneEdit] = useState<
    string | null
  >(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!customer) return null;

  const name = nameEdit ?? customer.name;
  const phone = phoneEdit ?? customer.phone ?? "";

  const initial =
    customer.name.trim().charAt(0).toUpperCase() || "C";

  const startEdit = () => {
    setNameEdit(customer.name);
    setPhoneEdit(customer.phone ?? "");
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setNameEdit(null);
    setPhoneEdit(null);
    setError("");
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!isValidPhoneNumber(phone.trim())) {
      setError(
        "Please enter a valid international phone number."
      );
      return;
    }

    const saved = updateCustomerProfile({
      name: name.trim(),
      phone: phone.trim(),
    });

    if (!saved) {
      setError("Unable to save your profile.");
      return;
    }

    setEditing(false);
    setNameEdit(null);
    setPhoneEdit(null);
    setSuccess("Profile updated successfully.");
  };

  const accountLinks = [
    {
      title: "My Tickets",
      description: "View your individual QR tickets",
      href: "/my-tickets",
      icon: Ticket,
    },
    {
      title: "My Bookings",
      description: "View your complete booking history",
      href: "/my-bookings",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf2] text-[#211b15]">
      <Header />

      <main className="mx-auto max-w-290 px-4 py-9 sm:px-6 lg:px-8">

        {/* WELCOME BANNER */}

        <section className="relative overflow-hidden rounded-[27px] border border-[#ecd7b8] bg-linear-to-r from-[#fff9ed] to-[#fbe5c0] p-6 shadow-[0_12px_34px_rgba(85,48,15,0.075)] sm:p-9">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-19 w-19 shrink-0 items-center justify-center rounded-[21px] border border-[#e9c68e] bg-linear-to-br from-[#fff0ce] to-[#f9ca7a] text-[29px] font-extrabold text-[#b36e12]">
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#a7752e]">
                <Sparkles size={16} />
                VizhaTickets Customer
              </p>

              <h1 className="mt-2 font-serif text-[clamp(1.8rem,3vw,2.75rem)] font-bold">
                Welcome,{" "}
                <span className="text-[#c9790b]">
                  {customer.name}
                </span>
              </h1>

              <p className="mt-2 text-[13px] text-[#82715f]">
                Manage your profile, bookings and demo QR tickets.
              </p>
            </div>

            <Link
              to="/events"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#dc800d] px-5 text-[12px] font-bold text-white transition-colors hover:bg-[#b96c09]"
            >
              Explore Events
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ACCOUNT OVERVIEW */}

        <div className="mb-5 mt-9">
          <h2 className="font-serif text-[25px] font-bold">
            Account Overview
          </h2>

          <p className="mt-1 text-[12px] text-[#89796a]">
            Live counts from your saved demo bookings
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total Tickets",
              value: totalTickets,
              icon: Ticket,
              href: "/my-tickets",
            },
            {
              label: "Total Bookings",
              value: totalBookings,
              icon: CalendarDays,
              href: "/my-bookings",
            },
            {
              label: "Demo Confirmed",
              value: totalBookings,
              icon: CheckCircle2,
              href: "/my-bookings",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.href}
                className="rounded-[21px] border border-[#ece0d2] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#e6bf87] hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0dc] text-[#c9790b]">
                    <Icon size={21} />
                  </span>

                  <ArrowRight
                    size={17}
                    className="text-[#bba28a]"
                  />
                </div>

                <p className="mt-4 text-[31px] font-extrabold tabular-nums">
                  {item.value}
                </p>

                <p className="mt-1 text-[12px] text-[#8a7868]">
                  {item.label}
                </p>
              </Link>
            );
          })}
        </div>

        {/* PROFILE AND QUICK ACCESS */}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.3fr_0.85fr]">

          {/* PERSONAL DETAILS */}

          <section className="overflow-hidden rounded-[22px] border border-[#eadfce] bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#f0e6db] px-5 py-4 sm:px-6">
              <div>
                <h2 className="flex items-center gap-2 text-[16px] font-bold">
                  <UserRound
                    size={19}
                    className="text-[#c9790b]"
                  />
                  Personal Information
                </h2>

                <p className="mt-1 text-[11px] text-[#938374]">
                  Your customer profile
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex items-center gap-2 rounded-full border border-[#ebd3b0] px-4 py-2 text-[11px] font-bold text-[#a96e21] hover:bg-[#fff6e8]"
                >
                  <Edit3 size={14} />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {success && (
                <div
                  role="status"
                  className="mb-5 flex items-center gap-2 rounded-xl bg-[#eff9f0] p-3 text-[12px] text-[#36804a]"
                >
                  <CheckCircle2 size={16} />
                  {success}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl bg-red-50 p-3 text-[12px] text-red-700"
                >
                  {error}
                </div>
              )}

              {editing ? (
                <form
                  onSubmit={saveProfile}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="profile-name"
                      className="mb-1.5 block text-[12px] font-semibold"
                    >
                      Full Name
                    </label>

                    <input
                      id="profile-name"
                      value={name}
                      onChange={(e) =>
                        setNameEdit(e.target.value)
                      }
                      maxLength={100}
                      autoComplete="name"
                      className="h-11 w-full rounded-xl border border-[#e7daca] bg-[#fffdf9] px-4 text-[13px] outline-none focus:border-[#d98514]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-phone"
                      className="mb-1.5 block text-[12px] font-semibold"
                    >
                      International Phone Number *
                    </label>

                    <input
                      id="profile-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhoneEdit(e.target.value)
                      }
                      autoComplete="tel"
                      placeholder="+94 77 123 4567"
                      className="h-11 w-full rounded-xl border border-[#e7daca] bg-[#fffdf9] px-4 text-[13px] outline-none focus:border-[#d98514]"
                    />
                  </div>

                  <p className="text-[11px] text-[#897769]">
                    Your account email is managed by your
                    sign-in details.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-[#db800b] px-5 text-[12px] font-bold text-white"
                    >
                      <Save size={15} />
                      Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8d9c7] px-5 text-[12px] font-bold text-[#806d58]"
                    >
                      <X size={15} />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="flex items-center gap-2 text-[11px] text-[#928273]">
                      <UserRound size={15} />
                      Full Name
                    </p>

                    <p className="mt-2 wrap-break-word text-[13px] font-bold">
                      {customer.name}
                    </p>
                  </div>

                  <div>
                    <p className="flex items-center gap-2 text-[11px] text-[#928273]">
                      <Mail size={15} />
                      Email Address
                    </p>

                    <p className="mt-2 break-all text-[13px] font-bold">
                      {customer.email}
                    </p>
                  </div>

                  <div>
                    <p className="flex items-center gap-2 text-[11px] text-[#928273]">
                      <Phone size={15} />
                      Phone Number
                    </p>

                    <p className="mt-2 text-[13px] font-bold">
                      {customer.phone || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="flex items-center gap-2 text-[11px] text-[#928273]">
                      <ShieldCheck size={15} />
                      Account Type
                    </p>

                    <p className="mt-2 text-[13px] font-bold">
                      Customer · Demo
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* QUICK ACCESS */}

          <section className="overflow-hidden rounded-[22px] border border-[#eadfce] bg-white shadow-sm">
            <div className="border-b border-[#f0e6db] px-5 py-4 sm:px-6">
              <h2 className="text-[16px] font-bold">
                Quick Access
              </h2>

              <p className="mt-1 text-[11px] text-[#938374]">
                Your tickets and bookings
              </p>
            </div>

            <div className="p-3">
              {accountLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#fff5e8]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0db] text-[#c9790b]">
                      <Icon size={19} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[11px] text-[#978778]">
                        {item.description}
                      </p>
                    </div>

                    <ArrowRight
                      size={17}
                      className="text-[#b49a80]"
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* RECENT BOOKINGS */}

        <section className="mt-7 overflow-hidden rounded-[22px] border border-[#eadfce] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e6db] p-5 sm:px-6">
            <div>
              <h2 className="flex items-center gap-2 text-[17px] font-bold">
                <Clock3
                  size={19}
                  className="text-[#c9790b]"
                />
                Recent Bookings
              </h2>

              <p className="mt-1 text-[11px] text-[#938374]">
                Your latest demo reservations
              </p>
            </div>

            <Link
              to="/my-bookings"
              className="inline-flex items-center gap-2 text-[12px] font-bold text-[#b97820]"
            >
              View All
              <ArrowRight size={15} />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Ticket
                size={31}
                className="mx-auto text-[#cf8a2e]"
              />

              <p className="mt-3 text-[13px] font-semibold">
                No bookings yet
              </p>

              <p className="mt-1 text-[12px] text-[#8f8071]">
                Your bookings will appear here after checkout.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0e8df]">
              {bookings.slice(0, 3).map((booking) => (
                <Link
                  key={booking.id}
                  to={`/booking-success?booking=${encodeURIComponent(
                    booking.reference
                  )}`}
                  className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-[#fffbf5] sm:px-6"
                >
                  <img
                    src={booking.eventImage}
                    alt={booking.eventTitle}
                    className="h-17.5 w-18.75 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold">
                      {booking.eventTitle}
                    </p>

                    <p className="mt-1 text-[11px] text-[#8c7a69]">
                      {booking.quantity} ticket(s) ·{" "}
                      {booking.ticketTypeLabel}
                    </p>

                    <p className="mt-1 break-all font-mono text-[10px] text-[#aa8f72]">
                      {booking.reference}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[13px] font-extrabold text-[#c9790b]">
                      {formatBookingMoney(
                        booking.currency,
                        booking.total
                      )}
                    </p>

                    <p className="mt-1 flex items-center justify-end gap-1 text-[10px] font-semibold text-[#568049]">
                      <CheckCircle2 size={13} />
                      Demo Confirmed
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 rounded-xl border border-[#f0dfc5] bg-[#fff7e9] p-4 text-[11px] leading-relaxed text-[#886c49]">
          Your tickets and bookings are currently stored
          in this browser for demonstration. They are not
          paid tickets and cannot be used for event entry.
        </div>
      </main>

      <Footer />
    </div>
  );
}
