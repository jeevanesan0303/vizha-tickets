
import { useMemo } from "react";

import {
  Check,
  Info,
  MapPin,
  Minus,
  Plus,
  Ticket,
  UsersRound,
} from "lucide-react";

import {
  getEventBookingZones,
  getEventTicketTier,
  type EventDetails,
  type EventBookingZone,
} from "../../data/events";

/* ==========================================================
   VIZHATICKETS — TICKET ZONE SELECTOR

   Features:
   - Dynamic zones from events.ts
   - Interactive venue area layout
   - VIP / Gold / Standard selection
   - Event-specific ticket prices
   - Quantity selector
   - Booking limits
   - Price summary
   - Responsive premium design

   Demo frontend only.
   No real inventory reservation.
   ========================================================== */

interface TicketZoneSelectorProps {
  event: EventDetails;

  selectedZoneId: string | null;

  onZoneChange: (zoneId: string) => void;

  quantity: number;

  onQuantityChange: (quantity: number) => void;

  disabled?: boolean;
}

function formatPrice(
  currency: string,
  amount: number
): string {
  return `${currency} ${amount.toLocaleString("en-LK")}`;
}

export default function TicketZoneSelector({
  event,
  selectedZoneId,
  onZoneChange,
  quantity,
  onQuantityChange,
  disabled = false,
}: TicketZoneSelectorProps) {
  const zones = getEventBookingZones(event);

  const minQuantity = Math.max(
    1,
    event.minTicketsPerBooking ?? 1
  );

  const maxQuantity = Math.max(
    minQuantity,
    event.maxTicketsPerBooking ?? 10
  );

  const zoneOptions = useMemo(() => {
    return zones.map((zone) => {
      const tier = getEventTicketTier(
        event,
        zone.ticketTierId
      );

      const priceValid =
        !!tier &&
        Number.isFinite(tier.price) &&
        tier.price >= 0;

      const available =
        zone.available !== false &&
        tier?.available !== false &&
        priceValid;

      return {
        zone,
        tier,
        price: tier?.price ?? 0,
        available,
      };
    });
  }, [event, zones]);

  const selectedOption = zoneOptions.find(
    (option) =>
      option.zone.id === selectedZoneId &&
      option.available
  );

  const unitPrice = selectedOption?.price ?? 0;

  const subtotal = unitPrice * quantity;

  const serviceFee = Math.round(subtotal * 0.05);

  const total = subtotal + serviceFee;

  const selectZone = (zone: EventBookingZone) => {
    if (disabled) return;

    const option = zoneOptions.find(
      (item) => item.zone.id === zone.id
    );

    if (!option?.available) return;

    onZoneChange(zone.id);
  };

  if (zones.length === 0) {
    return (
      <section className="rounded-3xl border border-[#eadfce] bg-white p-6">
        <div className="flex items-start gap-3">
          <Info
            size={21}
            className="shrink-0 text-[#c9790b]"
          />

          <div>
            <h3 className="text-[15px] font-bold">
              No Booking Areas Configured
            </h3>

            <p className="mt-2 text-[12px] leading-relaxed text-[#827466]">
              The event organizer has not configured
              ticket areas for this event.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-[0_10px_35px_rgba(90,51,12,0.06)]">

      {/* HEADER */}

      <div className="border-b border-[#f0e5d8] bg-[#fffbf5] px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0d8] text-[#c9790b]">
            <MapPin size={22} />
          </div>

          <div>
            <h2 className="text-[17px] font-bold text-[#281e16]">
              Select Your Event Area
            </h2>

            <p className="mt-1 text-[11px] text-[#8e7d6c]">
              Choose your preferred area and ticket quantity
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">

        {/* ========================================
            VISUAL EVENT ZONE MAP
            ======================================== */}

        <div className="rounded-[22px] border border-[#e9dfd2] bg-[#faf7f2] p-4 sm:p-6">

          <div className="mx-auto max-w-130">

            {/* STAGE */}

            <div className="mx-auto flex h-13 w-[75%] items-center justify-center rounded-b-[35px] rounded-t-xl bg-linear-to-r from-[#292019] via-[#4b3020] to-[#292019] shadow-lg">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.25em] text-white">
                Stage
              </span>
            </div>

            <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-widest text-[#a08c76]">
              Front of Event
            </p>

            {/* ZONES */}

            <div className="mt-5 space-y-3">

              {zoneOptions.map((option) => {
                const { zone, tier, price, available } =
                  option;

                const active =
                  selectedZoneId === zone.id &&
                  available;

                const zoneColor =
                  zone.color ||
                  tier?.color ||
                  "#c9790b";

                return (
                  <button
                    key={zone.id}
                    type="button"
                    disabled={disabled || !available}
                    onClick={() => selectZone(zone)}
                    aria-pressed={active}
                    className={`relative flex min-h-20 w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all duration-300 sm:px-5 ${
                      active
                        ? "scale-[1.01] border-[#c9790b] bg-[#fff0d9] shadow-md"
                        : available
                          ? "border-[#e8ded2] bg-white hover:border-[#dfad65] hover:shadow-sm"
                          : "cursor-not-allowed border-[#e7e3df] bg-[#f0eeeb] opacity-60"
                    }`}
                  >
                    {/* AREA COLOR */}

                    <span
                      className="h-11 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: zoneColor,
                      }}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-extrabold text-[#2b2118]">
                        {zone.name}
                      </span>

                      <span className="mt-1 block text-[11px] text-[#88786a]">
                        {zone.description ||
                          tier?.description ||
                          "Event admission area"}
                      </span>

                      {!available && (
                        <span className="mt-1 block text-[10px] font-semibold text-red-600">
                          Unavailable
                        </span>
                      )}
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="block text-[13px] font-extrabold text-[#b66d0b]">
                        {formatPrice(
                          event.currency,
                          price
                        )}
                      </span>

                      <span
                        className={`ml-auto mt-2 flex h-5 w-5 items-center justify-center rounded-full border ${
                          active
                            ? "border-[#d6810d] bg-[#d6810d] text-white"
                            : "border-[#d5c6b5] bg-white"
                        }`}
                      >
                        {active && <Check size={13} />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-center text-[10px] leading-relaxed text-[#a08e7b]">
              Illustrative venue layout. Actual positioning
              must be confirmed by the organizer.
            </p>
          </div>
        </div>

        {/* ========================================
            SELECTED ZONE DETAILS
            ======================================== */}

        {selectedOption && (
          <div className="mt-5 rounded-[18px] border border-[#f0ddbd] bg-[#fff9ef] p-4 sm:p-5">
            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffecd0] text-[#bc7719]">
                <Ticket size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#a27c48]">
                  Selected Area
                </p>

                <h3 className="mt-1 text-[15px] font-extrabold text-[#302219]">
                  {selectedOption.zone.name}
                </h3>

                <p className="mt-1 text-[12px] text-[#816e57]">
                  {selectedOption.tier?.name}
                </p>
              </div>
            </div>

            {selectedOption.zone.benefits &&
              selectedOption.zone.benefits.length > 0 && (
                <div className="mt-4 border-t border-[#efdfc7] pt-3">
                  {selectedOption.zone.benefits.map(
                    (benefit, index) => (
                      <p
                        key={index}
                        className="mt-1.5 flex items-center gap-2 text-[11px] text-[#75644e]"
                      >
                        <Check
                          size={14}
                          className="text-[#c9790b]"
                        />
                        {benefit}
                      </p>
                    )
                  )}
                </div>
              )}
          </div>
        )}

        {/* ========================================
            QUANTITY SELECTOR
            ======================================== */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#eee4d9] pt-6">

          <div>
            <h3 className="flex items-center gap-2 text-[13px] font-bold">
              <UsersRound
                size={18}
                className="text-[#c9790b]"
              />
              Number of Tickets
            </h3>

            <p className="mt-1 text-[11px] text-[#958574]">
              Maximum {maxQuantity} tickets per booking
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-[#e8d9c6] bg-white p-1">

            <button
              type="button"
              aria-label="Decrease ticket quantity"
              disabled={
                disabled ||
                !selectedOption ||
                quantity <= minQuantity
              }
              onClick={() =>
                onQuantityChange(
                  Math.max(minQuantity, quantity - 1)
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#fff0dd] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Minus size={17} />
            </button>

            <span className="w-6 text-center text-[16px] font-extrabold tabular-nums">
              {quantity}
            </span>

            <button
              type="button"
              aria-label="Increase ticket quantity"
              disabled={
                disabled ||
                !selectedOption ||
                quantity >= maxQuantity
              }
              onClick={() =>
                onQuantityChange(
                  Math.min(maxQuantity, quantity + 1)
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#fff0dd] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Plus size={17} />
            </button>
          </div>
        </div>

        {/* ========================================
            PRICE SUMMARY
            ======================================== */}

        <div className="mt-6 rounded-[18px] border border-[#efe1d0] bg-[#fffbf6] p-4 sm:p-5">

          <div className="flex justify-between gap-3 text-[12px]">
            <span className="text-[#857565]">
              {quantity} ×{" "}
              {selectedOption?.tier?.name ||
                "Select an area"}
            </span>

            <span className="font-bold">
              {formatPrice(event.currency, subtotal)}
            </span>
          </div>

          <div className="mt-3 flex justify-between gap-3 text-[12px]">
            <span className="text-[#857565]">
              Service Fee (5%)
            </span>

            <span className="font-bold">
              {formatPrice(event.currency, serviceFee)}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e8dbc9] pt-4">

            <span className="text-[14px] font-extrabold">
              Total
            </span>

            <span className="text-[22px] font-extrabold text-[#c9790b]">
              {formatPrice(event.currency, total)}
            </span>
          </div>
        </div>

        {/* DEMO DISCLAIMER */}

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#f0debf] bg-[#fff7e9] px-4 py-3">

          <Info
            size={17}
            className="mt-0.5 shrink-0 text-[#b4771d]"
          />

          <p className="text-[11px] leading-relaxed text-[#826d50]">
            Area availability and layout are currently
            demonstration data. Actual booking requires
            a signed-in customer and server-side
            inventory confirmation.
          </p>
        </div>
      </div>
    </section>
  );
}
