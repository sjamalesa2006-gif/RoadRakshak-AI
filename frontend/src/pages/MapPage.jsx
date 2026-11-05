
import { useState, useEffect, useCallback } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";

const API_URL = "http://127.0.0.1:8000";

// Illustrative markers only — not real verified road defects.
const sampleReports = [
  {
    id: "sample-1",
    position: [11.6643, 78.1460],
    type: "Pothole",
    severity: "High",
    description: "Illustrative sample pothole",
    status: "Sample",
    source: "Sample",
  },
  {
    id: "sample-2",
    position: [11.6700, 78.1400],
    type: "Road Crack",
    severity: "Medium",
    description: "Illustrative sample road crack",
    status: "Sample",
    source: "Sample",
  },
  {
    id: "sample-3",
    position: [11.6580, 78.1520],
    type: "Pothole",
    severity: "Low",
    description: "Illustrative sample road damage",
    status: "Sample",
    source: "Sample",
  },
];

function readStoredReports(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function isValidPosition(position) {
  return (
    Array.isArray(position) &&
    position.length === 2 &&
    Number.isFinite(Number(position[0])) &&
    Number.isFinite(Number(position[1])) &&
    Number(position[0]) >= -90 &&
    Number(position[0]) <= 90 &&
    Number(position[1]) >= -180 &&
    Number(position[1]) <= 180
  );
}

function GoogleMapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (map && position) {
      map.panTo({
        lat: Number(position[0]),
        lng: Number(position[1]),
      });
      map.setZoom(16);
    }
  }, [map, position]);

  return null;
}

// Convert the backend SQLite report format into the map format.
function normalizeBackendReport(report) {
  const typeMap = {
    ACTUAL_POTHOLES: "Pothole",
    ROAD_CRACKS: "Road Crack",
  };

  const type = typeMap[report.prediction];

  if (!type || report.latitude == null || report.longitude == null) {
    return null;
  }

  const position = [
    Number(report.latitude),
    Number(report.longitude),
  ];

  if (!isValidPosition(position)) return null;

  const baseUrl = API_URL;

  return {
    id: report.id,
    position,
    type,
    severity: "AI detected",
    description: report.description || "AI-detected road damage",
    confidence: report.confidence,
    status: report.status || "Pending verification",
    createdAt: report.created_at,
    imageUrl: report.image_url
      ? report.image_url.startsWith("http")
        ? report.image_url
        : `${baseUrl}${report.image_url}`
      : null,
    source: "AI",
    accuracy: report.accuracy,
    locationSource: report.location_source,
  };
}

function markerColor(type) {
  return type === "Pothole" ? "#ff405c" : "#ffb547";
}

export default function MapPage() {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const [reportType, setReportType] = useState("Pothole");
  const [severity, setSeverity] = useState("Medium");
  const [description, setDescription] = useState("");

  const [locationStatus, setLocationStatus] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [backendReports, setBackendReports] = useState([]);
  const [manualReports, setManualReports] = useState(() =>
    readStoredReports("roadRakshakManualReports").filter(
      (report) => isValidPosition(report.position)
    )
  );

  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [backendError, setBackendError] = useState("");

  // Fetch real AI reports from FastAPI / SQLite.
  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/reports`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const normalized = (data.reports || [])
        .map(normalizeBackendReport)
        .filter(Boolean);

      setBackendReports(normalized);
      setBackendError("");
    } catch (error) {
      console.error("Could not fetch backend reports:", error);
      setBackendError(
        "Backend reports unavailable. Check that the FastAPI server is running."
      );
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  // Load on page entry and refresh when the browser tab becomes active.
  useEffect(() => {
    fetchReports();

    function handleFocus() {
      fetchReports();

      setManualReports(
        readStoredReports("roadRakshakManualReports").filter(
          (report) => isValidPosition(report.position)
        )
      );
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchReports]);

  const allReports = [
    ...sampleReports,
    ...manualReports.map((report) => ({
      ...report,
      status: report.status || "User submitted",
      source: "Manual",
    })),
    ...backendReports,
  ];

  const visibleReports = allReports.filter((report) => {
    const matchesType =
      typeFilter === "All" || report.type === typeFilter;

    const matchesStatus =
      statusFilter === "All" || report.status === statusFilter;

    return matchesType && matchesStatus;
  });

  const potholeCount = backendReports.filter(
    (report) => report.type === "Pothole"
  ).length;

  const crackCount = backendReports.filter(
    (report) => report.type === "Road Crack"
  ).length;

  const totalAIReports = backendReports.length;

  function locateMe() {
    if (!navigator.geolocation) {
      setLocationStatus("Your browser does not support GPS location.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Finding your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setSelectedPosition(coordinates);
        setSelectedReport(null);

        setLocationStatus(
          `Location found. GPS accuracy: approximately ${Math.round(
            position.coords.accuracy
          )} metres.`
        );

        setIsLocating(false);
      },
      (error) => {
        const messages = {
          1: "Location permission denied. Allow location access in browser settings.",
          2: "Your location is currently unavailable.",
          3: "GPS request timed out. Please try again.",
        };

        setLocationStatus(
          messages[error.code] || "Unable to retrieve your location."
        );

        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  }

  function submitReport(event) {
    event.preventDefault();

    if (!selectedPosition) {
      setLocationStatus(
        "Please use Find My Location or click on the map to choose a location."
      );
      return;
    }

    const newReport = {
      id: `manual-${Date.now()}`,
      position: selectedPosition,
      type: reportType,
      severity,
      description:
        description.trim() || "Road damage reported by user",
      createdAt: new Date().toISOString(),
      status: "User submitted",
      source: "Manual",
    };

    try {
      const stored = readStoredReports("roadRakshakManualReports");

      const updated = [...stored, newReport];

      localStorage.setItem(
        "roadRakshakManualReports",
        JSON.stringify(updated)
      );

      setManualReports(updated);
      setDescription("");
      setLocationStatus("Manual road report saved successfully!");
    } catch {
      setLocationStatus(
        "Could not save this report. Browser storage may be full."
      );
    }
  }

  const googleMapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="min-h-screen bg-[#050816] p-8 text-white">
        <h1 className="text-2xl font-bold text-rose-400">
          Google Maps API key not found
        </h1>
        <p className="mt-3 text-slate-300">
          Check frontend/.env and restart the Vite server.
        </p>
      </div>
    );
  }

  return (
    <div className="road-page min-h-screen px-4 py-8 text-white md:px-8">
      <style>{`
        .road-page {
          background:
            radial-gradient(ellipse at 10% 0%, rgba(8,145,178,.12), transparent 35%),
            #050816;
        }

        .road-panel {
          background: rgba(12,18,36,.88);
          border: 1px solid rgba(148,163,184,.13);
          box-shadow: 0 15px 45px rgba(0,0,0,.22);
          backdrop-filter: blur(14px);
        }

        .road-google-map {
          width: 100%;
          height: 100%;
          min-height: 480px;
        }
      `}</style>

      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.35em] text-cyan-400">
              ROADRAKSHAK AI / GEOSPATIAL INTELLIGENCE
            </p>

            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              Road Monitoring{" "}
              <span className="text-cyan-400">Center</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-slate-400 md:text-base">
              AI-powered road damage intelligence, GPS reporting
              and geospatial monitoring.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Monitoring Interface
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Google Maps + AI database
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="road-panel rounded-2xl p-5">
            <p className="text-sm text-slate-400">Total AI Reports</p>
            <h2 className="mt-2 text-4xl font-black">{totalAIReports}</h2>
            <span className="text-xs text-cyan-300">
              From backend database
            </span>
          </div>

          <div className="road-panel rounded-2xl p-5">
            <p className="text-sm text-slate-400">AI Potholes</p>
            <h2 className="mt-2 text-4xl font-black text-rose-400">
              {potholeCount}
            </h2>
            <span className="text-xs text-rose-300">
              Database reports
            </span>
          </div>

          <div className="road-panel rounded-2xl p-5">
            <p className="text-sm text-slate-400">AI Road Cracks</p>
            <h2 className="mt-2 text-4xl font-black text-amber-300">
              {crackCount}
            </h2>
            <span className="text-xs text-amber-300">
              Database reports
            </span>
          </div>
        </div>

        {backendError && (
          <div className="mb-5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
            {backendError}
            <button
              type="button"
              onClick={fetchReports}
              className="ml-3 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main content */}
        <div className="grid items-start gap-6 xl:grid-cols-[1.7fr_.8fr]">
          {/* Map */}
          <section className="road-panel overflow-hidden rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <h2 className="text-lg font-bold md:text-xl">
                  Live Geospatial Map
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  AI reports with GPS coordinates appear as map markers.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={fetchReports}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-cyan-300 hover:bg-white/5"
                >
                  ↻ Refresh
                </button>

                <button
                  type="button"
                  onClick={locateMe}
                  disabled={isLocating}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
                >
                  {isLocating ? "Locating..." : "◎ Find My Location"}
                </button>
              </div>
            </div>

            <div className="relative h-[480px] w-full md:h-[600px]">
              <APIProvider apiKey={googleMapsApiKey}>
                <Map
                  className="road-google-map"
                  defaultCenter={{ lat: 11.6643, lng: 78.1460 }}
                  defaultZoom={13}
                  mapTypeId="roadmap"
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  mapTypeControl
                  streetViewControl
                  fullscreenControl
                  onClick={(event) => {
                    const point = event.detail?.latLng;

                    if (point) {
                      setSelectedPosition([point.lat, point.lng]);
                      setSelectedReport(null);
                    }
                  }}
                >
                  <GoogleMapUpdater position={selectedPosition} />

                  {visibleReports.map((report) => (
                    <Marker
                      key={report.id}
                      position={{
                        lat: Number(report.position[0]),
                        lng: Number(report.position[1]),
                      }}
                      title={`${report.type} — ${report.source}`}
                      onClick={() => setSelectedReport(report)}
                      icon={{
                        path: "M 0,0 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0",
                        fillColor: markerColor(report.type),
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                        scale: 1.5,
                      }}
                    />
                  ))}

                  {selectedReport && (
                    <InfoWindow
                      position={{
                        lat: Number(selectedReport.position[0]),
                        lng: Number(selectedReport.position[1]),
                      }}
                      onCloseClick={() => setSelectedReport(null)}
                    >
                      <div style={{ color: "#111827", minWidth: "190px", maxWidth: "270px" }}>
                        <strong>{selectedReport.type}</strong>

                        <p>
                          Source: {selectedReport.source || "Unknown"}
                        </p>

                        <p>
                          Status: {selectedReport.status || "Not specified"}
                        </p>

                        <p>
                          {selectedReport.description || "Road damage report"}
                        </p>

                        {selectedReport.confidence != null && (
                          <p>
                            AI confidence:{" "}
                            {(Number(selectedReport.confidence) * 100).toFixed(1)}%
                          </p>
                        )}

                        {selectedReport.createdAt && (
                          <p>
                            Reported:{" "}
                            {new Date(selectedReport.createdAt).toLocaleString()}
                          </p>
                        )}

                        {selectedReport.imageUrl && (
                          <img
                            src={selectedReport.imageUrl}
                            alt="Uploaded road damage"
                            style={{
                              width: "100%",
                              maxHeight: "150px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              marginTop: "8px",
                            }}
                          />
                        )}

                        <p>
                          Coordinates:{" "}
                          {Number(selectedReport.position[0]).toFixed(6)},{" "}
                          {Number(selectedReport.position[1]).toFixed(6)}
                        </p>
                      </div>
                    </InfoWindow>
                  )}

                  {selectedPosition && (
                    <Marker
                      position={{
                        lat: selectedPosition[0],
                        lng: selectedPosition[1],
                      }}
                      title="Selected location"
                    />
                  )}
                </Map>
              </APIProvider>

              <div className="absolute left-4 top-4 z-10 rounded-xl border border-white/10 bg-[#080e1b]/90 px-3 py-2 text-xs text-cyan-300 shadow-lg backdrop-blur">
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                GOOGLE MAPS ACTIVE
              </div>

              {isLoadingReports && (
                <div className="absolute bottom-4 left-4 rounded-lg bg-[#080e1b]/90 px-3 py-2 text-xs text-cyan-300">
                  Loading AI reports...
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 p-5 text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                Pothole
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                Road Crack
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-cyan-400" />
                Selected Location
              </span>
            </div>
          </section>

          {/* Reporting panel */}
          <section className="road-panel rounded-3xl p-5 md:p-6">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-400">
                REPORTING SYSTEM
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Report Road Damage
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Choose your GPS position or click anywhere on the map
                to select a reporting location.
              </p>
            </div>

            <form onSubmit={submitReport} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Damage Type
                </label>
                <select
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080e1b] p-3 text-white outline-none focus:border-cyan-400"
                >
                  <option value="Pothole">Pothole</option>
                  <option value="Road Crack">Road Crack</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080e1b] p-3 text-white outline-none focus:border-cyan-400"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Describe the road damage..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#080e1b] p-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Selected Coordinates
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-cyan-300">
                  {selectedPosition
                    ? `${selectedPosition[0].toFixed(6)}, ${selectedPosition[1].toFixed(6)}`
                    : "No location selected"}
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-400 px-5 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                + Submit Road Report
              </button>
            </form>

            {locationStatus && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-sm text-cyan-200"
              >
                {locationStatus}
              </div>
            )}

            {/* Filters */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <h3 className="mb-3 text-sm font-bold text-slate-200">
                Filter Map Reports
              </h3>

              <label className="mb-2 block text-xs text-slate-400">
                Damage Type
              </label>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="mb-4 w-full rounded-xl border border-white/10 bg-[#080e1b] p-3 text-sm text-white"
              >
                <option value="All">All damage types</option>
                <option value="Pothole">Potholes</option>
                <option value="Road Crack">Road cracks</option>
              </select>

              <label className="mb-2 block text-xs text-slate-400">
                Verification Status
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#080e1b] p-3 text-sm text-white"
              >
                <option value="All">All statuses</option>
                <option value="Pending verification">Pending verification</option>
                <option value="User submitted">User submitted</option>
                <option value="Sample">Illustrative samples</option>
              </select>
            </div>

            {/* Recent reports */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">
                  Recent Map Reports
                </h3>
                <span className="text-xs text-slate-500">
                  {visibleReports.length} shown
                </span>
              </div>

              <div className="max-h-72 space-y-3 overflow-y-auto">
                {visibleReports.slice().reverse().map((report) => (
                  <button
                    type="button"
                    key={report.id}
                    onClick={() => {
                      setSelectedPosition(report.position);
                      setSelectedReport(report);
                    }}
                    className="flex w-full items-start gap-3 rounded-xl border border-white/5 bg-white/[.03] p-3 text-left transition hover:border-cyan-400/30 hover:bg-white/[.06]"
                  >
                    <span
                      className="mt-1 h-3 w-3 shrink-0 rounded-full"
                      style={{
                        background: markerColor(report.type),
                        boxShadow: `0 0 10px ${markerColor(report.type)}`,
                      }}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">
                        {report.type}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {report.source} · {report.status}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {report.description}
                      </span>
                    </span>
                  </button>
                ))}

                {visibleReports.length === 0 && (
                  <p className="py-5 text-center text-sm text-slate-500">
                    No reports in this filter.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          RoadRakshak AI Prototype · AI reports are retrieved from the
          backend database. Sample markers are illustrative only.
        </p>
      </div>
    </div>
  );
}
