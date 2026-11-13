
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ==========================================================
   VIZHATICKETS — GLOBAL LOCATION CONTEXT

   FEATURES:
   - Shares location between all website pages
   - Supports Worldwide, countries and cities
   - Saves selection in localStorage
   - Restores selection after refresh
   - Synchronizes changes across browser tabs
   - Provides helpers for event location filtering
   - No external libraries required

   ========================================================== */

const LOCATION_STORAGE_KEY =
  "vizha_selected_location";

export const DEFAULT_LOCATION = "Worldwide";

/* ==========================================================
   TYPES
   ========================================================== */

export interface SelectedLocation {
  label: string;
  country: string | null;
  city: string | null;
  type: "worldwide" | "country" | "city";
}

interface LocationContextValue {
  location: string;
  selectedLocation: SelectedLocation;

  setLocation: (location: string) => void;
  resetLocation: () => void;

  matchesLocation: (
    eventLocation: string,
    eventVenue?: string
  ) => boolean;
}

/* ==========================================================
   PARSE LOCATION

   Supported examples:
   Worldwide
   Sri Lanka
   United Kingdom
   London, United Kingdom
   Jaffna, Sri Lanka

   ========================================================== */

export function parseSelectedLocation(
  value: string
): SelectedLocation {
  const label = value.trim() || DEFAULT_LOCATION;

  if (label.toLowerCase() === "worldwide") {
    return {
      label: DEFAULT_LOCATION,
      country: null,
      city: null,
      type: "worldwide",
    };
  }

  const commaIndex = label.indexOf(",");

  if (commaIndex !== -1) {
    const city = label
      .slice(0, commaIndex)
      .trim();

    const country = label
      .slice(commaIndex + 1)
      .trim();

    if (city && country) {
      return {
        label,
        city,
        country,
        type: "city",
      };
    }
  }

  return {
    label,
    country: label,
    city: null,
    type: "country",
  };
}

/* ==========================================================
   READ SAVED LOCATION
   ========================================================== */

function getSavedLocation(): string {
  if (typeof window === "undefined") {
    return DEFAULT_LOCATION;
  }

  try {
    const saved = window.localStorage.getItem(
      LOCATION_STORAGE_KEY
    );

    return saved?.trim() || DEFAULT_LOCATION;
  } catch {
    return DEFAULT_LOCATION;
  }
}

/* ==========================================================
   EVENT LOCATION MATCHING

   Uses location strings already present in events.ts.

   Example event:
   location: "Jaffna, Sri Lanka"

   When selection is:
   - Worldwide -> matches all events
   - Sri Lanka -> matches every Sri Lankan event
   - Jaffna, Sri Lanka -> matches only Jaffna

   This is a frontend helper for the demo catalogue.
   A production backend should use normalized
   country/city identifiers.
   ========================================================== */

function normalizeLocation(value: string): string {
  return value
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function eventMatchesLocation(
  eventLocation: string,
  selectedLocation: string,
  eventVenue = ""
): boolean {
  const selected = parseSelectedLocation(
    selectedLocation
  );

  if (selected.type === "worldwide") {
    return true;
  }

  const normalizedEvent = normalizeLocation(
    eventLocation
  );

  if (!normalizedEvent) {
    return false;
  }

  const parts = normalizedEvent
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const country = normalizeLocation(
    selected.country ?? ""
  );

  if (selected.type === "country") {
    return (
      parts.includes(country) ||
      normalizedEvent === country
    );
  }

  const city = normalizeLocation(
    selected.city ?? ""
  );

  if (!parts.includes(country)) {
    return false;
  }

  if (parts.includes(city)) {
    return true;
  }

  // Optional fallback when the city is stored
  // in the venue rather than the location field.
  const normalizedVenue = normalizeLocation(
    eventVenue
  );

  return (
    normalizedVenue === city ||
    normalizedVenue.includes(
      `, ${city}`
    )
  );
}

/* ==========================================================
   CONTEXT
   ========================================================== */

const LocationContext =
  createContext<LocationContextValue | null>(
    null
  );

/* ==========================================================
   PROVIDER
   ========================================================== */

export function LocationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [location, setLocationState] =
    useState<string>(getSavedLocation);

  /* ========================================================
     SET LOCATION
     ======================================================== */

  const setLocation = useCallback(
    (nextLocation: string) => {
      const normalized =
        nextLocation.trim() || DEFAULT_LOCATION;

      setLocationState(normalized);

      try {
        window.localStorage.setItem(
          LOCATION_STORAGE_KEY,
          normalized
        );
      } catch {
        // The selection still works for this session
        // when browser storage is unavailable.
      }
    },
    []
  );

  /* ========================================================
     RESET LOCATION
     ======================================================== */

  const resetLocation = useCallback(() => {
    setLocation(DEFAULT_LOCATION);
  }, [setLocation]);

  /* ========================================================
     KEEP TABS IN SYNC
     ======================================================== */

  useEffect(() => {
    const handleStorage = (
      event: StorageEvent
    ) => {
      if (
        event.key === LOCATION_STORAGE_KEY ||
        event.key === null
      ) {
        setLocationState(
          event.newValue?.trim() ||
            DEFAULT_LOCATION
        );
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  /* ========================================================
     DERIVED LOCATION DATA
     ======================================================== */

  const selectedLocation = useMemo(
    () => parseSelectedLocation(location),
    [location]
  );

  /* ========================================================
     MATCH EVENTS
     ======================================================== */

  const matchesLocation = useCallback(
    (
      eventLocation: string,
      eventVenue = ""
    ) =>
      eventMatchesLocation(
        eventLocation,
        location,
        eventVenue
      ),
    [location]
  );

  const contextValue = useMemo(
    () => ({
      location,
      selectedLocation,
      setLocation,
      resetLocation,
      matchesLocation,
    }),
    [
      location,
      selectedLocation,
      setLocation,
      resetLocation,
      matchesLocation,
    ]
  );

  return (
    <LocationContext.Provider
      value={contextValue}
    >
      {children}
    </LocationContext.Provider>
  );
}

/* ==========================================================
   HOOK

   Example:

   const { location, setLocation } = useLocationSelection();

   ========================================================== */

export function useLocationSelection() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error(
      "useLocationSelection must be used inside LocationProvider."
    );
  }

  return context;
}
