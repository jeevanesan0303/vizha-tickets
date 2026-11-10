
import Link from "next/link";
import { useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Header />

      <section className="py-16">
        <div className="vizha-container max-w-md">
          <div className="rounded-3xl border border-[#eee5db] bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7eb] text-[#c9790b]">
                <KeyRound size={22} />
              </div>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#111]">
                Reset Password
              </h1>
              <p className="mt-1 text-xs text-[#666]">
                Enter your registered email address to receive password reset instructions.
              </p>
            </div>

            {submitted ? (
              <div className="mt-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 size={26} />
                </div>
                <p className="mt-3 text-sm font-bold text-[#111]">Reset Link Sent!</p>
                <p className="mt-1 text-xs text-[#666]">
                  We have sent instructions to <strong className="text-[#222]">{email}</strong>. Please check your inbox.
                </p>
                <Link
                  href="/login"
                  className="vizha-button-primary mt-6 inline-flex text-xs font-bold"
                >
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#444]">Email Address</label>
                  <div className="relative mt-1 flex items-center">
                    <Mail size={16} className="absolute left-3.5 text-[#888]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[#e5ded3] bg-[#faf7f2] py-2.5 pl-10 pr-3 text-xs text-[#222] outline-none transition focus:border-[#c9790b] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="vizha-button-primary flex w-full items-center justify-center gap-2 py-3 text-xs font-bold"
                >
                  <span>Send Reset Link</span>
                </button>
              </form>
            )}

            <div className="mt-6 border-t border-[#eee8df] pt-6 text-center text-xs">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-[#c9790b] hover:underline"
              >
                <ArrowLeft size={13} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
