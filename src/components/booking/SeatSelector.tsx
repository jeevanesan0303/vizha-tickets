
import { useMemo } from "react";
import {
  Armchair,
  Check,
  Info,
  MapPin,
  ShieldAlert,
  Ticket,
  UsersRound,
} from "lucide-react";

import {
  calculateSelectedSeats,
  getEventSeat,
  getEventSeatingConfig,
  getEventTicketTier,
  getSeatTicketPrice,
  isEventSeatAvailable,
  type EventDetails,
  type EventSeat,
} from "../../data/events";

/* ==========================================================
   VIZHATICKETS — INTERACTIVE SEAT SELECTOR

   - Event-specific seating plan
   - Individual seat selection
   - Different ticket category prices
   - Selected / available / unavailable seats
   - Maximum seating limit
   - Live price calculations
   - Responsive seat grid
   - Demo availability only
   ========================================================== */

interface SeatSelectorProps {
  event: EventDetails;
  selectedSeatIds: string[];
  onChange: (seatIds: string[]) => void;
  disabled?: boolean;
}

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  })}`;
}

function statusClasses(
  seat: EventSeat,
  selected: boolean,
  available: boolean
) {
  if (!available) {
    return (
      "cursor-not-allowed border-[#ded9d2] " +
      "bg-[#d8d5d0] text-[#77736f] opacity-65"
    );
  }

  if (selected) {
    return (
      "border-[#bd7112] bg-[#c9790b] text-white " +
      "shadow-[0_4px_12px_rgba(201,121,11,0.25)]"
    );
  }

  if (seat.ticketTierId === "vip") {
    return (
      "border-[#e9bb79] bg-[#fff0d3] " +
      "text-[#9c6013] hover:bg-[#ffe2ac]"
    );
  }

  if (seat.ticketTierId === "gold") {
    return (
      "border-[#ead4aa] bg-[#fff9e9] " +
      "text-[#a57b29] hover:bg-[#fff0c8]"
    );
  }

  return (
    "border-[#dfd9d2] bg-white text-[#645648] " +
    "hover:border-[#c9790b] hover:bg-[#fff3df]"
  );
}

function LegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded-sm border ${color}`}
      />
      <span className="text-[10px] text-[#827263]">
        {label}
      </span>
    </div>
  );
}

export default function SeatSelector({
  event,
  selectedSeatIds,
  onChange,
  disabled = false,
}: SeatSelectorProps) {
  const config = getEventSeatingConfig(event);

  const selectedSeats = useMemo(
    () => [...new Set(selectedSeatIds)],
    [selectedSeatIds]
  );

  const calculation = calculateSelectedSeats(
    event,
    selectedSeats
  );

  const minimum = Math.max(
    1,
    event.minTicketsPerBooking ?? 1
  );

  const maximum = Math.max(
    minimum,
    Math.min(
      event.maxTicketsPerBooking ?? 10,
      config?.maxSeatsPerBooking ?? 10
    )
  );

  const subtotal = calculation.valid
    ? calculation.subtotal
    : selectedSeats.reduce((sum, id) => {
        const price = getSeatTicketPrice(event, id);
        return sum + (price ?? 0);
      }, 0);

  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const toggleSeat = (seat: EventSeat) => {
    if (disabled) return;

    if (!isEventSeatAvailable(event, seat.id)) {
      return;
    }

    if (selectedSeats.includes(seat.id)) {
      onChange(
        selectedSeats.filter((id) => id !== seat.id)
      );
      return;
    }

    if (selectedSeats.length >= maximum) {
      return;
    }

    onChange([...selectedSeats, seat.id]);
  };

  if (!config || config.rows.length === 0) {
    return (
      <section className="rounded-3xl border border-[#eee1d1] bg-white p-6">
        <div className="flex items-start gap-3">
          <Info
            size={21}
            className="shrink-0 text-[#c9790b]"
          />
          <div>
            <h2 className="text-[15px] font-bold">
              Seating Plan Unavailable
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[#877667]">
              The organizer has not configured a seating
              plan for this event.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const isVerticalStage =
    config.stagePosition === "left" ||
    config.stagePosition === "right";

  const stage = (
    <div className="mx-auto flex min-h-11.5 w-[78%] max-w-120 items-center justify-center rounded-b-[35px] rounded-t-xl bg-linear-to-r from-[#2d211b] via-[#654026] to-[#2d211b] px-4 text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-white shadow-md">
      {config.stageLabel || "STAGE"}
    </div>
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-[0_10px_35px_rgba(90,51,12,0.06)]">
      {/* HEADER */}

      <div className="flex items-center gap-3 border-b border-[#f0e5d9] bg-[#fffbf5] px-5 py-5 sm:px-7">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0da] text-[#c9790b]">
          <Armchair size={22} />
        </span>

        <div>
          <h2 className="text-[17px] font-bold">
            Select Your Seats
          </h2>
          <p className="mt-1 text-[11px] text-[#8e7d6e]">
            Choose your preferred seats from the plan
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-7">
        {/* SEATING MAP */}

        <div className="overflow-hidden rounded-[22px] border border-[#eee2d4] bg-[#faf7f2] p-3 sm:p-6">
          <div className="mb-5 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d794d]">
              {config.name}
            </p>
            <p className="mt-1 text-[10px] text-[#978879]">
              Select up to {maximum} seats
            </p>
          </div>

          {!isVerticalStage &&
            config.stagePosition !== "bottom" &&
            stage}

          <div
            className={`${
              isVerticalStage
                ? "flex items-center gap-4"
                : ""
            }`}
          >
            {config.stagePosition === "left" && (
              <div className="flex w-10 shrink-0 items-center justify-center self-stretch rounded-xl bg-[#33251d] text-[10px] font-bold tracking-widest text-white [writing-mode:vertical-rl]">
                {config.stageLabel || "STAGE"}
              </div>
            )}

            <div className="mt-6 min-w-0 flex-1 overflow-x-auto pb-3">
              <div className="mx-auto flex w-max min-w-fit flex-col gap-2.5">
                {config.rows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-2"
                  >
                    <span className="w-6 shrink-0 text-center text-[11px] font-bold text-[#9c876e]">
                      {row.label}
                    </span>

                    <div className="flex gap-1.5 sm:gap-2">
                      {row.seats.map((seat) => {
                        const selected =
                          selectedSeats.includes(
                            seat.id
                          );

                        const available =
                          isEventSeatAvailable(
                            event,
                            seat.id
                          );

                        const tier = getEventTicketTier(
                          event,
                          seat.ticketTierId
                        );

                        const price = tier?.price ?? 0;

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            disabled={
                              disabled || !available
                            }
                            onClick={() =>
                              toggleSeat(seat)
                            }
                            aria-label={`Seat ${seat.label}, ${
                              !available
                                ? "unavailable"
                                : `${tier?.name ?? "General"}, ${money(
                                    event.currency,
                                    price
                                  )}`
                            }`}
                            aria-pressed={selected}
                            title={`${seat.label} · ${
                              available
                                ? tier?.name ?? "Seat"
                                : "Unavailable"
                            }`}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-t-xl rounded-b-md border text-[10px] font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9790b] sm:h-10 sm:w-10 ${statusClasses(
                              seat,
                              selected,
                              available
                            )}`}
                          >
                            {selected ? (
                              <Check size={16} />
                            ) : (
                              seat.number
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <span className="w-6 shrink-0 text-center text-[11px] font-bold text-[#9c876e]">
                      {row.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {config.stagePosition === "right" && (
              <div className="flex w-10 shrink-0 items-center justify-center self-stretch rounded-xl bg-[#33251d] text-[10px] font-bold tracking-widest text-white [writing-mode:vertical-rl]">
                {config.stageLabel || "STAGE"}
              </div>
            )}
          </div>

          {config.stagePosition === "bottom" && (
            <div className="mt-4">{stage}</div>
          )}

          {/* LEGEND */}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-[#e8ddce] pt-4">
            <LegendItem
              color="border-[#e9bb79] bg-[#fff0d3]"
              label="VIP"
            />
            <LegendItem
              color="border-[#ead4aa] bg-[#fff9e9]"
              label="Gold"
            />
            <LegendItem
              color="border-[#dfd9d2] bg-white"
              label="Standard"
            />
            <LegendItem
              color="border-[#bd7112] bg-[#c9790b]"
              label="Selected"
            />
            <LegendItem
              color="border-[#ded9d2] bg-[#d8d5d0]"
              label="Unavailable"
            />
          </div>
        </div>

        {/* SELECTION SUMMARY */}

        <div className="mt-6 rounded-[19px] border border-[#efdfc7] bg-[#fffaf2] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-[14px] font-bold">
                <Ticket
                  size={18}
                  className="text-[#c9790b]"
                />
                Selected Seats
              </h3>
              <p className="mt-1 text-[11px] text-[#8b7a68]">
                Minimum {minimum}, maximum {maximum}
              </p>
            </div>

            <span className="flex items-center gap-2 rounded-full bg-[#ffebca] px-3 py-1.5 text-[12px] font-bold text-[#a76614]">
              <UsersRound size={15} />
              {selectedSeats.length} Selected
            </span>
          </div>

          {selectedSeats.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-[#e5d3bd] bg-white p-4 text-center text-[12px] text-[#8a7969]">
              Select your seats from the layout above.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedSeats.map((id) => {
                const seat = getEventSeat(event, id);
                const tier = seat
                  ? getEventTicketTier(
                      event,
                      seat.ticketTierId
                    )
                  : undefined;

                return (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onChange(
                        selectedSeats.filter(
                          (item) => item !== id
                        )
                      )
                    }
                    title="Remove selected seat"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#e8d5ba] bg-white px-3 py-2 text-[11px] font-semibold text-[#886027] transition-colors hover:bg-[#fff0d8]"
                  >
                    <MapPin size={13} />
                    {id}
                    {tier && (
                      <span className="text-[10px] text-[#a38c74]">
                        {money(
                          event.currency,
                          tier.price
                        )}
                      </span>
                    )}
                    <span aria-hidden="true">×</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* PRICE SUMMARY */}

          <div className="mt-5 space-y-3 border-t border-[#ecdcc6] pt-4">
            <div className="flex justify-between gap-3 text-[12px]">
              <span className="text-[#877769]">
                {selectedSeats.length} seat(s)
              </span>
              <span className="font-semibold">
                {money(event.currency, subtotal)}
              </span>
            </div>

            <div className="flex justify-between gap-3 text-[12px]">
              <span className="text-[#877769]">
                Service Fee (5%)
              </span>
              <span className="font-semibold">
                {money(event.currency, serviceFee)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#ecddc9] pt-4">
              <span className="text-[14px] font-bold">
                Total
              </span>
              <span className="text-[22px] font-extrabold text-[#c9790b]">
                {money(event.currency, total)}
              </span>
            </div>
          </div>
        </div>

        {!calculation.valid &&
          selectedSeats.length > 0 && (
            <p
              role="alert"
              className="mt-3 text-[11px] text-red-600"
            >
              {calculation.error}
            </p>
          )}

        {/* DEMO NOTICE */}

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#efd9ae] bg-[#fff6e6] p-4">
          <ShieldAlert
            size={17}
            className="mt-0.5 shrink-0 text-[#ac7319]"
          />
          <div>
            <p className="text-[11px] font-bold text-[#86601f]">
              Demo Seating Plan
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#88704b]">
              This is not the venue's verified seating
              chart. Seat availability is not reserved
              until a production backend is connected.
            </p>
          </div>
        </div>

        {config.notes?.length ? (
          <div className="mt-4 flex items-start gap-2">
            <Info
              size={15}
              className="mt-0.5 shrink-0 text-[#ae812e]"
            />
            <p className="text-[10px] leading-relaxed text-[#948273]">
              {config.notes[0]}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
