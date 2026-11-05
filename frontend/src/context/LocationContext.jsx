import React, { createContext, useContext, useState } from "react";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("not-requested");
  const [showPrompt, setShowPrompt] = useState(
    () => !sessionStorage.getItem("roadRakshakLocationPromptSeen")
  );
  const [error, setError] = useState("");

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setStatus("granted");
        setShowPrompt(false);
        sessionStorage.setItem("roadRakshakLocationPromptSeen", "true");
      },
      (err) => {
        setStatus("error");
        setError(
          err.code === 1
            ? "Location permission was denied. Enable it in browser settings."
            : "Unable to get your location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    sessionStorage.setItem("roadRakshakLocationPromptSeen", "true");
  };

  return (
    <LocationContext.Provider value={{ location, status, error, requestLocation }}>
      {children}

      {showPrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-cyan-400/20 bg-[#0b1224] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-3xl">
              📍
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
              RoadRakshak AI
            </p>

            <h2 className="text-2xl font-bold text-white">
              Enable Location Access
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Allow location access to attach GPS coordinates to road reports
              and display detected road issues at their reported locations.
            </p>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <button
              onClick={requestLocation}
              disabled={status === "loading"}
              className="mt-7 w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
            >
              {status === "loading" ? "Getting your location..." : "Enable Location"}
            </button>

            <button
              onClick={dismissPrompt}
              className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >
              Not now
            </button>

            <p className="mt-5 text-xs text-slate-500">
              Your browser will ask for permission. You remain in control.
            </p>
          </div>
        </div>
      )}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocationContext must be used inside LocationProvider");
  }

  return context;
}
