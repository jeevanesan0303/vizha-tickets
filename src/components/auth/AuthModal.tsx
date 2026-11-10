
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useAuthModal } from "../../contexts/AuthModalContext";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function AuthModal() {
  const {
    isOpen,
    view,
    closeModal,
  } = useAuthModal();

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled])'
        )
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          element.getAttribute("tabindex") !== "-1"
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, closeModal]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-3 sm:p-5">

          {/* DARK OVERLAY */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#160c08]/65 backdrop-blur-[3px]"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* MODAL CONTAINER */}

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={
              view === "login"
                ? "Sign in to VizhaTickets"
                : "Create your VizhaTickets account"
            }
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 290,
              damping: 28,
            }}
            className="relative z-10 flex max-h-[calc(100dvh-24px)] w-full max-w-200 flex-col overflow-hidden rounded-[30px] border-2 border-[#f8c76d] bg-white shadow-[0_30px_90px_rgba(30,12,0,0.4)] sm:max-h-[calc(100dvh-40px)]"
          >

            {/* CLOSE BUTTON */}

            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeModal}
              aria-label="Close authentication popup"
              className="absolute right-4 top-4 z-50 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e8ddd4] bg-white text-[#221a15] shadow-md transition-all hover:rotate-90 hover:bg-[#fff0de] focus-visible:outline-2 focus-visible:outline-[#ef8a0b]"
            >
              <X size={21} />
            </button>

            {/* CONTENT: SCROLLS ONLY WHEN SCREEN IS TOO SMALL */}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {view === "login" ? (
                <LoginModal />
              ) : (
                <RegisterModal />
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
