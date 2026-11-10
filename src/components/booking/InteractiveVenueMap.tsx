
import { useState, type CSSProperties } from "react";

import {
  Armchair,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Ticket,
  UsersRound,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import {
  calculateSelectedSeats,
  getEventBookingMode,
  getEventBookingZones,
  getEventSeat,
  getEventSeatingConfig,
  getEventTicketTier,
  getEventTicketTiers,
  getSeatTicketPrice,
  getZoneTicketPrice,
  isEventSeatAvailable,
  type EventDetails,
  type EventBookingZone,
} from "../../data/events";

/* ==========================================================
   VIZHATICKETS — INTERACTIVE VENUE MAP

   React + Vite + TypeScript + Tailwind CSS

   FEATURES:
   - Dynamic booking mode per event
   - Concert area map
   - Stadium stand map
   - Theatre individual seat map
   - General admission
   - Zoom in / zoom out / reset
   - Interactive section selection
   - Seat selection with prices
   - Sold-out and unavailable states
   - Ticket quantity selection
   - Live price calculations
   - Responsive layout
   - Checkout state integration

   IMPORTANT:
   The venue geometry is illustrative.
   Actual seating positions and availability must
   be provided by the organizer and later managed
   by a backend.

   ========================================================== */

interface InteractiveVenueMapProps {
  event: EventDetails;

  selectedZoneId?: string | null;
  onZoneChange?: (zoneId: string) => void;

  selectedSeatIds?: string[];
  onSeatsChange?: (seatIds: string[]) => void;

  selectedTierId?: string;
  onTierChange?: (tierId: string) => void;

  quantity?: number;
  onQuantityChange?: (quantity: number) => void;

  disabled?: boolean;
}

/* ==========================================================
   THEME
   ========================================================== */

const GOLD = "#C9790B";

const ZONE_COLORS = [
  "#EAB85D",
  "#88C6D9",
  "#A48CCB",
  "#79B6A0",
  "#E39C91",
  "#B6A2DD",
];

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

/* ==========================================================
   HELPERS
   ========================================================== */

function formatMoney(
  currency: string,
  amount: number
): string {
  return `${currency} ${amount.toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  })}`;
}

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(
    maximum,
    Math.max(minimum, value)
  );
}

function isValidPrice(
  value: number | null | undefined
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function getZoneColor(
  zone: EventBookingZone,
  index: number
): string {
  return (
    zone.color ||
    ZONE_COLORS[index % ZONE_COLORS.length]
  );
}

/* ==========================================================
   STADIUM SVG GEOMETRY
   ========================================================== */

function polarPoint(
  centerX: number,
  centerY: number,
  radius: number,
  degrees: number
) {
  const angle = (degrees * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

function createRingSegment(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarPoint(
    centerX,
    centerY,
    outerRadius,
    startAngle
  );

  const outerEnd = polarPoint(
    centerX,
    centerY,
    outerRadius,
    endAngle
  );

  const innerEnd = polarPoint(
    centerX,
    centerY,
    innerRadius,
    endAngle
  );

  const innerStart = polarPoint(
    centerX,
    centerY,
    innerRadius,
    startAngle
  );

  const largeArc =
    endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

/* ==========================================================
   LEGEND
   ========================================================== */

function VenueLegend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="h-3.5 w-3.5 shrink-0 rounded-sm border border-black/10"
        style={{ backgroundColor: color }}
      />

      <span className="text-[10px] font-medium text-[#837262]">
        {label}
      </span>
    </div>
  );
}

/* ==========================================================
   ZOOM CONTROLS
   ========================================================== */

interface ZoomControlsProps {
  zoom: number;
  onChange: (zoom: number) => void;
}

function ZoomControls({
  zoom,
  onChange,
}: ZoomControlsProps) {
  const update = (direction: number) => {
    onChange(
      clamp(
        zoom + direction * ZOOM_STEP,
        MIN_ZOOM,
        MAX_ZOOM
      )
    );
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-[#e8dac8] bg-white p-1 shadow-sm">
      <button
        type="button"
        aria-label="Zoom out"
        title="Zoom out"
        disabled={zoom <= MIN_ZOOM}
        onClick={() => update(-1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#86653a] transition hover:bg-[#fff1dd] disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ZoomOut size={16} />
      </button>

      <span className="min-w-10.75 text-center text-[11px] font-extrabold tabular-nums text-[#624f3c]">
        {Math.round(zoom * 100)}%
      </span>

      <button
        type="button"
        aria-label="Zoom in"
        title="Zoom in"
        disabled={zoom >= MAX_ZOOM}
        onClick={() => update(1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#86653a] transition hover:bg-[#fff1dd] disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ZoomIn size={16} />
      </button>

      <div className="mx-1 h-5 w-px bg-[#eadfd0]" />

      <button
        type="button"
        aria-label="Reset zoom"
        title="Reset zoom"
        onClick={() => onChange(1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#86653a] transition hover:bg-[#fff1dd]"
      >
        <RotateCcw size={15} />
      </button>
    </div>
  );
}

/* ==========================================================
   MAIN COMPONENT
   ========================================================== */

export default function InteractiveVenueMap({
  event,

  selectedZoneId = null,
  onZoneChange,

  selectedSeatIds = [],
  onSeatsChange,

  selectedTierId = "",
  onTierChange,

  quantity = 1,
  onQuantityChange,

  disabled = false,
}: InteractiveVenueMapProps) {
  /* ========================================================
     LOCAL DISPLAY STATE
     ======================================================== */

  const [zoom, setZoom] = useState(1);

  const [showTicketList, setShowTicketList] =
    useState(true);

  /* ========================================================
     EVENT CONFIGURATION
     ======================================================== */

  const mode = getEventBookingMode(event);

  const zones = getEventBookingZones(event);

  const tiers = getEventTicketTiers(event);

  const seating = getEventSeatingConfig(event);

  const eventType =
    event.eventType?.toLowerCase() ?? "";

  const category =
    event.category.toLowerCase();

  /* Determine which zone map to render */

  const isStadium =
    mode === "zone" &&
    (
      category === "sports" ||
      eventType.includes("cricket") ||
      eventType.includes("football") ||
      eventType.includes("stadium")
    );

  /* ========================================================
     TICKET LIMITS
     ======================================================== */

  const configuredMaximum =
    event.maxTicketsPerBooking ?? 10;

  const seatingMaximum =
    seating?.maxSeatsPerBooking ?? configuredMaximum;

  const maximum = Math.max(
    1,
    Math.min(
      configuredMaximum,
      mode === "seat"
        ? seatingMaximum
        : configuredMaximum
    )
  );

  const minimum = clamp(
    event.minTicketsPerBooking ?? 1,
    1,
    maximum
  );

  /* ========================================================
     CURRENT SELECTION
     ======================================================== */

  const uniqueSelectedSeats = [
    ...new Set(selectedSeatIds),
  ];

  const selectedZone = zones.find(
    (zone) =>
      zone.id === selectedZoneId
  );

  const selectedTier =
    mode === "zone"
      ? tiers.find(
          (tier) =>
            tier.id === selectedZone?.ticketTierId
        )
      : tiers.find(
          (tier) =>
            tier.id === selectedTierId
        );

  const zonePrice = selectedZone
    ? getZoneTicketPrice(
        event,
        selectedZone.id
      )
    : null;

  const seatCalculation = calculateSelectedSeats(
    event,
    uniqueSelectedSeats
  );

  const selectedSeatLabels =
    uniqueSelectedSeats.map(
      (id) =>
        getEventSeat(event, id)?.label ?? id
    );

  const ticketCount =
    mode === "seat"
      ? uniqueSelectedSeats.length
      : quantity;

  /* ========================================================
     PRICE CALCULATION

     Matches the 5% demo service fee used by Checkout.
     ======================================================== */

  const seatSubtotal = uniqueSelectedSeats.reduce(
    (sum, seatId) => {
      const price = getSeatTicketPrice(
        event,
        seatId
      );

      return sum + (price ?? 0);
    },
    0
  );

  const subtotal =
    mode === "seat"
      ? seatSubtotal
      : mode === "zone"
        ? (zonePrice ?? 0) * quantity
        : (
            selectedTier?.available !== false &&
            isValidPrice(selectedTier?.price)
              ? selectedTier.price
              : 0
          ) * quantity;

  const serviceFee = Math.round(
    subtotal * 0.05
  );

  const total = subtotal + serviceFee;

  /* ========================================================
     SELECTION ACTIONS
     ======================================================== */

  const selectZone = (
    zone: EventBookingZone
  ) => {
    if (
      disabled ||
      !onZoneChange ||
      zone.available === false
    ) {
      return;
    }

    const price = getZoneTicketPrice(
      event,
      zone.id
    );

    if (!isValidPrice(price)) {
      return;
    }

    onZoneChange(zone.id);
  };

  const selectTier = (
    tierId: string
  ) => {
    if (
      disabled ||
      !onTierChange ||
      mode !== "general"
    ) {
      return;
    }

    const tier = tiers.find(
      (item) => item.id === tierId
    );

    if (
      !tier ||
      tier.available === false ||
      !isValidPrice(tier.price)
    ) {
      return;
    }

    onTierChange(tierId);
  };

  const toggleSeat = (
    seatId: string
  ) => {
    if (
      disabled ||
      !onSeatsChange
    ) {
      return;
    }

    if (uniqueSelectedSeats.includes(seatId)) {
      onSeatsChange(
        uniqueSelectedSeats.filter(
          (id) => id !== seatId
        )
      );

      return;
    }

    if (
      uniqueSelectedSeats.length >= maximum ||
      !isEventSeatAvailable(
        event,
        seatId
      )
    ) {
      return;
    }

    onSeatsChange([
      ...uniqueSelectedSeats,
      seatId,
    ]);
  };

  const changeQuantity = (
    difference: number
  ) => {
    if (
      disabled ||
      !onQuantityChange ||
      mode === "seat"
    ) {
      return;
    }

    const next = clamp(
      quantity + difference,
      minimum,
      maximum
    );

    onQuantityChange(next);
  };

  /* ========================================================
     STADIUM SECTIONS

     IMPORTANT FIX:

     Array.from receives (value, index), not an array
     as the third argument. The previous code using
     all.length would cause a TypeScript error.

     The total section count is calculated separately.
     ======================================================== */

  const stadiumSectionCount =
    zones.length > 0
      ? Math.max(8, zones.length * 2)
      : 0;

  const stadiumSections =
    stadiumSectionCount > 0
      ? Array.from(
          {
            length: stadiumSectionCount,
          },
          (_, index) => {
            const zone =
              zones[index % zones.length];

            const step =
              360 / stadiumSectionCount;

            return {
              zone,
              index,
              start:
                -90 + index * step + 1.5,
              end:
                -90 + (index + 1) * step - 1.5,
            };
          }
        )
      : [];

  /* ========================================================
     DISPLAY INFORMATION
     ======================================================== */

  const layoutTitle =
    mode === "seat"
      ? "Auditorium Seating Layout"
      : mode === "zone"
        ? isStadium
          ? "Stadium Seating Layout"
          : "Concert Venue Layout"
        : "General Admission";

  const selectionLabel =
    mode === "seat"
      ? `${uniqueSelectedSeats.length} seat(s) selected`
      : mode === "zone"
        ? selectedZone?.name ?? "Select a section"
        : selectedTier?.name ?? "Select tickets";

  const hasConfiguredMap =
    mode === "general" ||
    (mode === "zone" && zones.length > 0) ||
    (
      mode === "seat" &&
      !!seating &&
      seating.rows.length > 0
    );

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <section className="overflow-hidden rounded-[25px] border border-[#e9dfd0] bg-white shadow-[0_12px_38px_rgba(67,38,10,0.06)]">

      {/* ====================================================
          HEADER
          ==================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eee3d5] bg-[#fffcf7] px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">

          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0d8] text-[#c9790b]">
            {mode === "seat" ? (
              <Armchair size={22} />
            ) : mode === "zone" ? (
              <MapPin size={22} />
            ) : (
              <Ticket size={22} />
            )}
          </span>

          <div className="min-w-0">
            <h2 className="text-[17px] font-extrabold text-[#292018]">
              {mode === "seat"
                ? "Choose Your Seats"
                : mode === "zone"
                  ? "Choose Your Event Area"
                  : "Choose Your Tickets"}
            </h2>

            <p className="mt-1 text-[11px] text-[#8d7e70]">
              {event.venue}
            </p>
          </div>
        </div>

        {mode !== "general" && (
          <ZoomControls
            zoom={zoom}
            onChange={setZoom}
          />
        )}
      </div>

      {/* ====================================================
          MAP AND PRICE PANEL
          ==================================================== */}

      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_260px]">

        {/* ==================================================
            LEFT SIDE — VENUE MAP
            ================================================== */}

        <div className="min-w-0 border-b border-[#eee4d8] bg-[#f6f7f9] p-3 sm:p-5 lg:border-b-0 lg:border-r">

          {/* MAP TITLE */}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

            <div>
              <h3 className="text-[12px] font-extrabold uppercase tracking-[0.09em] text-[#655647]">
                {layoutTitle}
              </h3>

              <p className="mt-1 text-[10px] text-[#a08d7b]">
                Interactive event layout · Demo
              </p>
            </div>

            <span className="max-w-full rounded-full border border-[#e8d9c4] bg-white px-3 py-1.5 text-[10px] font-bold text-[#a17438]">
              {selectionLabel}
            </span>
          </div>

          {/* ================================================
              NO LAYOUT CONFIGURATION
              ================================================ */}

          {!hasConfiguredMap && (
            <div className="flex min-h-75 flex-col items-center justify-center rounded-[18px] border border-dashed border-[#ddcfbc] bg-white p-6 text-center">

              <MapPin
                size={35}
                className="text-[#c9790b]"
              />

              <h3 className="mt-4 text-[16px] font-bold">
                Venue Layout Unavailable
              </h3>

              <p className="mt-2 max-w-[320px] text-[12px] leading-relaxed text-[#877667]">
                The event organizer has not configured
                the area or seating plan for this event.
              </p>
            </div>
          )}

          {/* ================================================
              STADIUM INTERACTIVE MAP
              ================================================ */}

          {mode === "zone" &&
            isStadium &&
            zones.length > 0 && (

            <div className="overflow-auto rounded-[20px] border border-[#e4e6e9] bg-white p-2 sm:p-4">

              <div
                className="mx-auto"
                style={{
                  width: `${zoom * 100}%`,
                  minWidth: `${380 * zoom}px`,
                }}
              >

                <svg
                  viewBox="0 0 800 590"
                  xmlns="http://www.w3.org/2000/svg"
                  className="block h-auto w-full"
                  role="group"
                  aria-label="Interactive demo stadium section map"
                >

                  <rect
                    x="8"
                    y="8"
                    width="784"
                    height="574"
                    rx="24"
                    fill="#FCFDFE"
                  />

                  {/* STADIUM SEATING RING */}

                  <g transform="translate(400 280) scale(1 .76) translate(-400 -280)">

                    {stadiumSections.map(
                      ({
                        zone,
                        index,
                        start,
                        end,
                      }) => {
                        const active =
                          selectedZoneId === zone.id;

                        const price =
                          getZoneTicketPrice(
                            event,
                            zone.id
                          );

                        const available =
                          zone.available !== false &&
                          isValidPrice(price);

                        const color =
                          getZoneColor(
                            zone,
                            index
                          );

                        const path =
                          createRingSegment(
                            400,
                            280,
                            263,
                            163,
                            start,
                            end
                          );

                        const middleAngle =
                          (start + end) / 2;

                        const labelPoint =
                          polarPoint(
                            400,
                            280,
                            214,
                            middleAngle
                          );

                        return (
                          <g
                            key={`${zone.id}-${index}`}
                          >
                            <path
                              d={path}
                              fill={
                                available
                                  ? color
                                  : "#CDD0D4"
                              }
                              fillOpacity={
                                active ? 1 : 0.82
                              }
                              stroke={
                                active
                                  ? GOLD
                                  : "#FFFFFF"
                              }
                              strokeWidth={
                                active ? 7 : 3
                              }
                              role="button"
                              tabIndex={
                                !disabled && available
                                  ? 0
                                  : -1
                              }
                              aria-label={`${zone.name}, ${
                                available
                                  ? formatMoney(
                                      event.currency,
                                      price
                                    )
                                  : "unavailable"
                              }`}
                              aria-pressed={active}
                              onClick={() =>
                                selectZone(zone)
                              }
                              onKeyDown={(eventKey) => {
                                if (
                                  eventKey.key === "Enter" ||
                                  eventKey.key === " "
                                ) {
                                  eventKey.preventDefault();
                                  selectZone(zone);
                                }
                              }}
                              className={
                                available && !disabled
                                  ? "cursor-pointer transition-all hover:brightness-105 focus:outline-none"
                                  : "cursor-not-allowed"
                              }
                            />

                            <circle
                              cx={labelPoint.x}
                              cy={labelPoint.y}
                              r="20"
                              fill={
                                active
                                  ? GOLD
                                  : "#FFFFFF"
                              }
                              stroke={
                                active
                                  ? "#FFFFFF"
                                  : "#E4DFD8"
                              }
                              strokeWidth="2"
                              pointerEvents="none"
                            />

                            <text
                              x={labelPoint.x}
                              y={labelPoint.y + 4}
                              textAnchor="middle"
                              fontSize="12"
                              fontWeight="800"
                              fill={
                                active
                                  ? "#FFFFFF"
                                  : "#43352B"
                              }
                              pointerEvents="none"
                            >
                              {index + 1}
                            </text>
                          </g>
                        );
                      }
                    )}

                    {/* STADIUM RUNNING TRACK */}

                    <ellipse
                      cx="400"
                      cy="280"
                      rx="156"
                      ry="155"
                      fill="#E67C66"
                      stroke="#FFFFFF"
                      strokeWidth="9"
                    />

                    {[148, 137, 126].map(
                      (radius) => (
                        <ellipse
                          key={radius}
                          cx="400"
                          cy="280"
                          rx={radius}
                          ry={radius}
                          fill="none"
                          stroke="#FFD2C8"
                          strokeWidth="2.5"
                        />
                      )
                    )}

                    {/* CENTRAL PLAYING FIELD */}

                    <ellipse
                      cx="400"
                      cy="280"
                      rx="108"
                      ry="107"
                      fill="#3AA765"
                      stroke="#FFFFFF"
                      strokeWidth="5"
                    />

                    <ellipse
                      cx="400"
                      cy="280"
                      rx="92"
                      ry="91"
                      fill="#43B570"
                      stroke="#D9FCE5"
                      strokeWidth="2"
                    />

                    {/* CRICKET PITCH */}

                    <rect
                      x="393"
                      y="248"
                      width="14"
                      height="64"
                      rx="3"
                      fill="#D9C28B"
                      stroke="#F4E4BC"
                      strokeWidth="2"
                    />

                    <line
                      x1="387"
                      y1="255"
                      x2="413"
                      y2="255"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />

                    <line
                      x1="387"
                      y1="305"
                      x2="413"
                      y2="305"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />

                  </g>

                  {/* LABEL */}

                  <text
                    x="400"
                    y="546"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="800"
                    fill="#776B62"
                  >
                    STADIUM SECTION MAP
                  </text>

                  <text
                    x="400"
                    y="568"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#9A8D81"
                  >
                    Select a highlighted stand
                  </text>
                </svg>
              </div>
            </div>
          )}

          {/* ================================================
              CONCERT INTERACTIVE MAP
              ================================================ */}

          {mode === "zone" &&
            !isStadium &&
            zones.length > 0 && (

            <div className="overflow-auto rounded-[20px] border border-[#e7dfd4] bg-[#fffdfa] p-4 sm:p-6">

              <div
                className="mx-auto"
                style={{
                  width: `${zoom * 100}%`,
                  minWidth: `${300 * zoom}px`,
                }}
              >

                {/* STAGE */}

                <div className="relative mx-auto flex h-16.25 w-[80%] items-center justify-center rounded-b-[42px] rounded-t-xl bg-linear-to-r from-[#241812] via-[#573623] to-[#241812] shadow-[0_10px_25px_rgba(30,20,12,0.18)]">

                  <span className="text-[12px] font-extrabold uppercase tracking-[0.3em] text-white">
                    Stage
                  </span>

                  <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-linear-to-r from-transparent via-[#e4a842] to-transparent" />
                </div>

                <p className="mb-5 mt-4 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#9c8974]">
                  Front of event
                </p>

                {/* CONCERT SECTIONS */}

                <div className="mx-auto max-w-135 space-y-2.5">

                  {zones.map(
                    (zone, index) => {
                      const active =
                        selectedZoneId === zone.id;

                      const price =
                        getZoneTicketPrice(
                          event,
                          zone.id
                        );

                      const available =
                        zone.available !== false &&
                        isValidPrice(price);

                      const tier =
                        getEventTicketTier(
                          event,
                          zone.ticketTierId
                        );

                      const color =
                        getZoneColor(
                          zone,
                          index
                        );

                      return (
                        <button
                          key={zone.id}
                          type="button"
                          disabled={
                            disabled || !available
                          }
                          aria-pressed={active}
                          onClick={() =>
                            selectZone(zone)
                          }
                          className={`relative flex min-h-27 w-full flex-col items-center justify-center overflow-hidden rounded-[18px] border-[3px] px-4 py-4 text-center transition-all duration-200 ${
                            active
                              ? "border-[#A76C10] shadow-[0_0_0_4px_rgba(201,121,11,0.12)]"
                              : "border-white hover:border-[#E9B670]"
                          } ${
                            !available
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                          style={{
                            backgroundColor:
                              available
                                ? color
                                : "#DADADA",
                          }}
                        >

                          <span className="text-[13px] font-extrabold text-[#241B13]">
                            {zone.name}
                          </span>

                          <span className="mt-1 text-[11px] font-medium text-[#493A2A]">
                            {zone.description ||
                              tier?.name ||
                              "Event area"}
                          </span>

                          <span className="mt-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-extrabold text-[#6B4213]">
                            {available
                              ? formatMoney(
                                  event.currency,
                                  price
                                )
                              : "Unavailable"}
                          </span>

                          {active && (
                            <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#241B13] text-white">
                              <Check size={16} />
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                <p className="mt-5 text-center text-[10px] leading-relaxed text-[#9B8976]">
                  Demo concert layout. Actual areas,
                  dimensions and capacity are
                  organizer-configured.
                </p>
              </div>
            </div>
          )}

          {/* ================================================
              THEATRE SEATING LAYOUT
              ================================================ */}

          {mode === "seat" && seating && (
            <div className="overflow-auto rounded-[20px] border border-[#e7e0d7] bg-white p-3 sm:p-5">

              <div
                className="mx-auto w-max min-w-full"
                style={
                  {
                    zoom,
                  } as CSSProperties
                }
              >

                {/* FRONT STAGE */}

                {(
                  !seating.stagePosition ||
                  seating.stagePosition === "top"
                ) && (
                  <div className="mx-auto mb-7 flex h-11.25 w-[75%] min-w-50 max-w-125 items-center justify-center rounded-b-4xl rounded-t-lg bg-linear-to-r from-[#241B14] via-[#5A3A28] to-[#241B14] text-[11px] font-extrabold uppercase tracking-[0.2em] text-white shadow-md">
                    {seating.stageLabel || "STAGE"}
                  </div>
                )}

                {/* ROWS */}

                <div className="flex flex-col items-center gap-3">

                  {seating.rows.map((row) => {
                    const middleIndex =
                      Math.floor(
                        row.seats.length / 2
                      );

                    return (
                      <div
                        key={row.id}
                        className="flex w-max items-center gap-2"
                      >

                        <span className="w-6 shrink-0 text-center text-[11px] font-extrabold text-[#9B846A]">
                          {row.label}
                        </span>

                        <div className="flex items-center gap-1.5 sm:gap-2">

                          {row.seats.map(
                            (seat, index) => {
                              const active =
                                uniqueSelectedSeats.includes(
                                  seat.id
                                );

                              const available =
                                isEventSeatAvailable(
                                  event,
                                  seat.id
                                );

                              const tier =
                                getEventTicketTier(
                                  event,
                                  seat.ticketTierId
                                );

                              const seatPrice =
                                getSeatTicketPrice(
                                  event,
                                  seat.id
                                );

                              const seatColor =
                                seat.ticketTierId === "vip"
                                  ? "#FFE4B1"
                                  : seat.ticketTierId === "gold"
                                    ? "#FFF0D3"
                                    : "#FFFFFF";

                              return (
                                <div
                                  key={seat.id}
                                  className="flex items-center"
                                >
                                  {/* CENTER AISLE */}

                                  {index === middleIndex && (
                                    <span className="w-4 shrink-0 sm:w-7" />
                                  )}

                                  <button
                                    type="button"
                                    disabled={
                                      disabled ||
                                      !available
                                    }
                                    onClick={() =>
                                      toggleSeat(
                                        seat.id
                                      )
                                    }
                                    aria-pressed={active}
                                    aria-label={`Seat ${seat.label}, ${
                                      available
                                        ? `${tier?.name ?? "Seat"}, ${formatMoney(
                                            event.currency,
                                            seatPrice ?? 0
                                          )}`
                                        : "unavailable"
                                    }`}
                                    title={`Seat ${seat.label} · ${
                                      available
                                        ? tier?.name ?? "Available"
                                        : "Unavailable"
                                    }`}
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-t-[11px] rounded-b-[5px] border text-[10px] font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9790B] sm:h-10 sm:w-10 ${
                                      !available
                                        ? "cursor-not-allowed border-[#C7C4C0] bg-[#D8D8D8] text-[#8C8985]"
                                        : active
                                          ? "border-[#A66A0D] bg-[#C9790B] text-white shadow-[0_4px_10px_rgba(201,121,11,0.25)]"
                                          : "border-[#D8CBB8] text-[#6F5A42] hover:border-[#C9790B] hover:brightness-95"
                                    }`}
                                    style={
                                      available && !active
                                        ? {
                                            backgroundColor:
                                              seatColor,
                                          }
                                        : undefined
                                    }
                                  >
                                    {active ? (
                                      <Check size={16} />
                                    ) : (
                                      seat.number
                                    )}
                                  </button>
                                </div>
                              );
                            }
                          )}
                        </div>

                        <span className="w-6 shrink-0 text-center text-[11px] font-extrabold text-[#9B846A]">
                          {row.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* BOTTOM STAGE */}

                {seating.stagePosition === "bottom" && (
                  <div className="mx-auto mt-7 flex h-11.25 w-[75%] min-w-50 max-w-125 items-center justify-center rounded-t-4xl rounded-b-lg bg-[#34241B] text-[11px] font-extrabold uppercase tracking-[0.2em] text-white">
                    {seating.stageLabel || "STAGE"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================
              GENERAL ADMISSION
              ================================================ */}

          {mode === "general" && (
            <div className="flex min-h-65 flex-col items-center justify-center rounded-[20px] border border-[#E8E0D6] bg-white px-6 py-9 text-center">

              <span className="flex h-16 w-16 items-center justify-center rounded-[19px] bg-[#FFF0DD] text-[#C9790B]">
                <Ticket size={30} />
              </span>

              <h3 className="mt-5 font-serif text-[23px] font-bold text-[#30251B]">
                General Admission
              </h3>

              <p className="mt-3 max-w-85 text-[12px] leading-[1.8] text-[#877766]">
                This event does not require a reserved
                seat or a specific event section.
                Choose your ticket category and
                quantity from the panel.
              </p>
            </div>
          )}

          {/* ================================================
              SEATING LEGEND
              ================================================ */}

          {mode !== "general" && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-xl border border-[#E8E4DD] bg-white px-4 py-3">

              {mode === "seat" ? (
                <>
                  <VenueLegend
                    color="#FFFFFF"
                    label="Standard"
                  />

                  <VenueLegend
                    color="#FFF0D3"
                    label="Gold"
                  />

                  <VenueLegend
                    color="#FFE4B1"
                    label="VIP"
                  />

                  <VenueLegend
                    color="#C9790B"
                    label="Selected"
                  />

                  <VenueLegend
                    color="#D8D8D8"
                    label="Unavailable"
                  />
                </>
              ) : (
                <>
                  <VenueLegend
                    color="#EAB85D"
                    label="Available Area"
                  />

                  <VenueLegend
                    color="#C9790B"
                    label="Selected"
                  />

                  <VenueLegend
                    color="#CDD0D4"
                    label="Unavailable"
                  />
                </>
              )}
            </div>
          )}

          {/* MAP DISCLAIMER */}

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#E9DDC9] bg-white p-3">

            <Info
              size={16}
              className="mt-0.5 shrink-0 text-[#A77A35]"
            />

            <p className="text-[10px] leading-[1.7] text-[#8B7865]">
              Illustrative venue map. Real event sections,
              seating positions, prices and availability
              must be confirmed by the organizer.
              No real seats are reserved here.
            </p>
          </div>
        </div>

        {/* ==================================================
            RIGHT SIDE — SECTIONS / PRICES
            ================================================== */}

        <aside className="min-w-0 bg-white p-4 sm:p-5">

          {/* PANEL HEADER */}

          <button
            type="button"
            onClick={() =>
              setShowTicketList(
                (current) => !current
              )
            }
            aria-expanded={showTicketList}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <h3 className="text-[14px] font-extrabold text-[#30241B]">
                {mode === "zone"
                  ? "Available Areas"
                  : mode === "seat"
                    ? "Seating Prices"
                    : "Ticket Categories"}
              </h3>

              <p className="mt-1 text-[11px] text-[#96816D]">
                {mode === "seat"
                  ? "Prices depend on seat category"
                  : "Price per ticket"}
              </p>
            </div>

            {showTicketList ? (
              <ChevronUp
                size={18}
                className="text-[#856B4F]"
              />
            ) : (
              <ChevronDown
                size={18}
                className="text-[#856B4F]"
              />
            )}
          </button>

          {/* ================================================
              PRICE LIST
              ================================================ */}

          {showTicketList && (
            <div className="mt-4 space-y-2">

              {/* AREA / ZONE PRICING */}

              {mode === "zone" &&
                zones.map(
                  (zone, index) => {
                    const tier =
                      getEventTicketTier(
                        event,
                        zone.ticketTierId
                      );

                    const price =
                      getZoneTicketPrice(
                        event,
                        zone.id
                      );

                    const available =
                      zone.available !== false &&
                      isValidPrice(price);

                    const active =
                      selectedZoneId === zone.id;

                    return (
                      <button
                        key={zone.id}
                        type="button"
                        disabled={
                          disabled || !available
                        }
                        onClick={() =>
                          selectZone(zone)
                        }
                        aria-pressed={active}
                        className={`flex w-full items-center gap-3 rounded-[14px] border p-3 text-left transition-all ${
                          active
                            ? "border-[#D58B1D] bg-[#FFF3DF] shadow-sm"
                            : "border-[#EEE2D4] bg-white hover:border-[#E8BB80]"
                        } ${
                          !available
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                      >

                        <span
                          className="h-11 w-1.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              available
                                ? getZoneColor(
                                    zone,
                                    index
                                  )
                                : "#CFCFCF",
                          }}
                        />

                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-extrabold text-[#35271B]">
                            {zone.name}
                          </span>

                          <span className="mt-1 block text-[10px] text-[#978573]">
                            {available
                              ? tier?.name ||
                                "Event admission"
                              : "Unavailable"}
                          </span>
                        </span>

                        <span className="shrink-0 text-right">

                          <span className="block text-[12px] font-extrabold text-[#B67617]">
                            {available
                              ? formatMoney(
                                  event.currency,
                                  price
                                )
                              : "Sold Out"}
                          </span>

                          {active && (
                            <Check
                              size={16}
                              className="ml-auto mt-1 text-[#C9790B]"
                            />
                          )}
                        </span>
                      </button>
                    );
                  }
                )}

              {/* SEAT / GENERAL PRICES */}

              {mode !== "zone" &&
                tiers.map((tier) => {
                  const available =
                    tier.available !== false &&
                    isValidPrice(tier.price);

                  const active =
                    mode === "general" &&
                    selectedTierId === tier.id;

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      disabled={
                        disabled ||
                        mode === "seat" ||
                        !available
                      }
                      onClick={() =>
                        selectTier(tier.id)
                      }
                      aria-pressed={
                        mode === "general"
                          ? active
                          : undefined
                      }
                      className={`flex w-full items-center justify-between gap-3 rounded-[14px] border p-3 text-left transition ${
                        active
                          ? "border-[#D58B1D] bg-[#FFF3DF]"
                          : "border-[#EEE2D4] bg-white"
                      } ${
                        mode === "general" &&
                        available
                          ? "hover:border-[#E8BB80]"
                          : ""
                      } ${
                        !available
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <span className="min-w-0">

                        <span className="block text-[12px] font-bold text-[#3B2B1F]">
                          {tier.name}
                        </span>

                        {tier.description && (
                          <span className="mt-1 block text-[10px] text-[#94816D]">
                            {tier.description}
                          </span>
                        )}
                      </span>

                      <span className="shrink-0 text-right">

                        <span className="block text-[12px] font-extrabold text-[#B67617]">
                          {available
                            ? formatMoney(
                                event.currency,
                                tier.price
                              )
                            : "Unavailable"}
                        </span>

                        {active && (
                          <Check
                            size={15}
                            className="ml-auto mt-1 text-[#C9790B]"
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}

          {/* ================================================
              SELECTED ZONE DETAILS
              ================================================ */}

          {mode === "zone" && selectedZone && (
            <div className="mt-5 rounded-[15px] border border-[#EED9B6] bg-[#FFF8EB] p-4">

              <p className="text-[10px] font-bold uppercase tracking-wide text-[#A47B41]">
                Selected Area
              </p>

              <p className="mt-2 text-[13px] font-extrabold text-[#463019]">
                {selectedZone.name}
              </p>

              {selectedZone.description && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#80694B]">
                  {selectedZone.description}
                </p>
              )}

              {selectedZone.benefits?.map(
                (benefit, index) => (
                  <p
                    key={index}
                    className="mt-2 flex items-center gap-2 text-[11px] text-[#82623B]"
                  >
                    <Check
                      size={14}
                      className="shrink-0 text-[#C9790B]"
                    />
                    {benefit}
                  </p>
                )
              )}
            </div>
          )}

          {/* ================================================
              SELECTED SEATS
              ================================================ */}

          {mode === "seat" && (
            <div className="mt-5 border-t border-[#EEE4D8] pt-4">

              <div className="flex items-center justify-between gap-3">

                <h4 className="text-[12px] font-extrabold text-[#382A1D]">
                  Selected Seats
                </h4>

                <span className="rounded-full bg-[#FFF0D8] px-2.5 py-1 text-[10px] font-bold text-[#A66D1A]">
                  {uniqueSelectedSeats.length}/{maximum}
                </span>
              </div>

              {selectedSeatLabels.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">

                  {selectedSeatLabels.map(
                    (label, index) => (
                      <button
                        key={
                          uniqueSelectedSeats[index]
                        }
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          toggleSeat(
                            uniqueSelectedSeats[index]
                          )
                        }
                        title={`Remove seat ${label}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8CEAA] bg-[#FFF4E4] px-3 py-2 text-[11px] font-bold text-[#A66D1D] transition hover:bg-[#FFE8C5]"
                      >
                        <Armchair size={13} />
                        {label}
                        <span aria-hidden="true">
                          ×
                        </span>
                      </button>
                    )
                  )}
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-[#EADACA] p-4 text-center">

                  <Armchair
                    size={23}
                    className="mx-auto text-[#C79D6C]"
                  />

                  <p className="mt-2 text-[11px] text-[#998575]">
                    No seats selected
                  </p>
                </div>
              )}

              {!seatCalculation.valid &&
                uniqueSelectedSeats.length > 0 && (
                  <p
                    role="alert"
                    className="mt-3 text-[11px] leading-relaxed text-red-600"
                  >
                    {seatCalculation.error}
                  </p>
                )}
            </div>
          )}

          {/* ================================================
              TICKET QUANTITY
              ================================================ */}

          {mode !== "seat" && (
            <div className="mt-5 border-t border-[#EEE4D8] pt-5">

              <h4 className="flex items-center gap-2 text-[12px] font-extrabold">
                <UsersRound
                  size={17}
                  className="text-[#C9790B]"
                />
                Number of Tickets
              </h4>

              <div className="mt-4 flex items-center justify-between gap-3">

                <span className="text-[11px] text-[#94816D]">
                  Max {maximum}
                </span>

                <div className="flex items-center gap-2 rounded-full border border-[#E8D8C4] bg-white p-1">

                  <button
                    type="button"
                    aria-label="Decrease ticket quantity"
                    disabled={
                      disabled ||
                      quantity <= minimum
                    }
                    onClick={() =>
                      changeQuantity(-1)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#FFF0DA] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-6 text-center text-[14px] font-extrabold tabular-nums">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    aria-label="Increase ticket quantity"
                    disabled={
                      disabled ||
                      quantity >= maximum
                    }
                    onClick={() =>
                      changeQuantity(1)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#FFF0DA] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================
              PRICE SUMMARY
              ================================================ */}

          <div className="mt-5 space-y-3 border-t border-[#EEE4D8] pt-5">

            <div className="flex justify-between gap-3 text-[11px]">

              <span className="text-[#8B7A68]">
                {ticketCount} Ticket
                {ticketCount === 1
                  ? ""
                  : "s"}
              </span>

              <span className="font-bold text-[#33291F]">
                {formatMoney(
                  event.currency,
                  subtotal
                )}
              </span>
            </div>

            <div className="flex justify-between gap-3 text-[11px]">

              <span className="text-[#8B7A68]">
                Service Fee (5%)
              </span>

              <span className="font-bold text-[#33291F]">
                {formatMoney(
                  event.currency,
                  serviceFee
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#EEE4D8] pt-4">

              <span className="text-[13px] font-extrabold">
                Demo Total
              </span>

              <span className="text-[19px] font-extrabold text-[#C9790B]">
                {formatMoney(
                  event.currency,
                  total
                )}
              </span>
            </div>
          </div>

          {/* FOOTER INFO */}

          <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#FFF6E7] p-3">

            <Info
              size={16}
              className="mt-0.5 shrink-0 text-[#B77920]"
            />

            <p className="text-[10px] leading-relaxed text-[#886D47]">
              Prices and selection are for demonstration.
              Real inventory and admission require
              server-side booking verification.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
