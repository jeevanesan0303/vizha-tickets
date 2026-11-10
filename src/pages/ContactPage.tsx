
import { useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Header />

      <section className="border-b border-[#eee8df] bg-white py-12">
        <div className="vizha-container max-w-3xl text-center">
          <span className="rounded-full border border-[#f0dfc8] bg-[#fffaf2] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#c9790b]">
            Get In Touch
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl">
            Contact Support & Organizer Partnerships
          </h1>
          <p className="mt-2 text-sm text-[#666]">
            Have a question about your tickets or looking to publish your upcoming event? We are here to help.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="vizha-container max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
            {/* Info Cards */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#eee5db] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff7eb] text-[#c9790b]">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-[#888]">Email Us</p>
                    <p className="text-sm font-bold text-[#111]">support@vizhatickets.com</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#eee5db] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff7eb] text-[#c9790b]">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-[#888]">Call Support</p>
                    <p className="text-sm font-bold text-[#111]">+94 (0) 77 123 4567</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#eee5db] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff7eb] text-[#c9790b]">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-[#888]">Headquarters</p>
                    <p className="text-sm font-bold text-[#111]">Colombo & Jaffna, Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-[#eee5db] bg-white p-8 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-[#111]">Message Sent Successfully!</h3>
                  <p className="mt-2 text-xs text-[#666]">
                    Thank you for reaching out. Our support team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="vizha-button-primary mt-6 text-xs"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold text-[#111]">Send Us a Message</h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-[#444]">Your Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Priya Sharma"
                        className="mt-1 w-full rounded-xl border border-[#e5ded3] bg-[#faf7f2] px-3.5 py-2.5 text-xs text-[#222] outline-none transition focus:border-[#c9790b] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#444]">Email Address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="priya@example.com"
                        className="mt-1 w-full rounded-xl border border-[#e5ded3] bg-[#faf7f2] px-3.5 py-2.5 text-xs text-[#222] outline-none transition focus:border-[#c9790b] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#444]">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Ticket inquiry / Event organizing / Partnership"
                      className="mt-1 w-full rounded-xl border border-[#e5ded3] bg-[#faf7f2] px-3.5 py-2.5 text-xs text-[#222] outline-none transition focus:border-[#c9790b] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#444]">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you?"
                      className="mt-1 w-full rounded-xl border border-[#e5ded3] bg-[#faf7f2] px-3.5 py-2.5 text-xs text-[#222] outline-none transition focus:border-[#c9790b] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="vizha-button-primary flex w-full items-center justify-center gap-2 py-3 text-xs font-bold"
                  >
                    <Send size={14} />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
