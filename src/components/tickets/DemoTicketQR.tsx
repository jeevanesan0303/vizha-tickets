
import { QRCodeSVG } from "qrcode.react";
import { Ticket, ShieldAlert } from "lucide-react";

import {
  getDemoTicketQRPayload,
  type CustomerBooking,
  type CustomerTicket,
} from "../../lib/customerBookings";

interface DemoTicketQRProps {
  booking: CustomerBooking;
  ticket: CustomerTicket;
  index?: number;
  compact?: boolean;
}

export default function DemoTicketQR({
  booking,
  ticket,
  index = 0,
  compact = false,
}: DemoTicketQRProps) {
  const payload = getDemoTicketQRPayload(
    booking,
    ticket
  );

  return (
    <article
      className={`overflow-hidden rounded-[20px] border border-[#eadfce] bg-white ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[12px] font-bold text-[#2b221a]">
            <Ticket
              size={17}
              className="text-[#c9790b]"
            />
            Ticket {index + 1}
          </p>

          <p className="mt-1.5 break-all font-mono text-[11px] font-semibold text-[#82684a]">
            {ticket.reference}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#fff1db] px-2.5 py-1 text-[10px] font-bold text-[#a86b18]">
          DEMO
        </span>
      </div>

      <div className="mt-5 flex justify-center">
        <div className="rounded-[15px] border border-[#eee5db] bg-white p-4 shadow-sm">
          <QRCodeSVG
            value={payload}
            size={compact ? 150 : 184}
            level="H"
            marginSize={0}
            bgColor="#FFFFFF"
            fgColor="#1F1915"
            title={`Demo QR code for ticket ${ticket.reference}`}
          />
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] font-bold text-[#272018]">
        {booking.eventTitle}
      </p>

      <p className="mt-1 text-center text-[11px] text-[#877769]">
        {booking.ticketTypeLabel}
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#f2d8b1] bg-[#fff7ea] p-3">
        <ShieldAlert
          size={16}
          className="mt-0.5 shrink-0 text-[#ac741e]"
        />

        <p className="text-[10px] leading-relaxed text-[#85623a]">
          Test QR only. Not valid for admission,
          payment verification, or entry scanning.
        </p>
      </div>
    </article>
  );
}
