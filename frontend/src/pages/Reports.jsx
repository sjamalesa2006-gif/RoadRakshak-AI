import { API_BASE_URL, fetchWithRetry } from "../api";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  FileWarning,
  MapPin,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Eye,
  X,
  Image as ImageIcon,
  Filter,
  ChevronDown,
  ShieldCheck,
  Activity,
} from "lucide-react";

const STATUS_OPTIONS = [
  "Pending verification",
  "Verified",
  "Resolved",
];

const FILTER_OPTIONS = ["All", "ACTUAL_POTHOLES", "ROAD_CRACKS"];
const STATUS_FILTERS = ["All", ...STATUS_OPTIONS];

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrediction(value) {
  if (value === "ACTUAL_POTHOLES") return "Pothole";
  if (value === "ROAD_CRACKS") return "Road Crack";
  return value || "Unknown";
}

function getImageUrl(url) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function StatusBadge({ status }) {
  const styles = {
    "Pending verification": "border-amber-400/30 bg-amber-400/10 text-amber-300",
    Verified: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    Resolved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        styles[status] || styles["Pending verification"]
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Pending verification"}
    </span>
  );
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/10 bg-[#101b30] p-5 shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-bold text-white">{value}</h3>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <Icon size={22} className="text-cyan-300" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const fetchReports = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/reports`);

      if (!response.ok) {
        throw new Error("Unable to retrieve reports from the server.");
      }

      const data = await response.json();
      setReports(Array.isArray(data.reports) ? data.reports : []);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();

    const interval = setInterval(() => {
      fetchReports(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchReports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesType =
        typeFilter === "All" || report.prediction === typeFilter;

      const matchesStatus =
        statusFilter === "All" || report.status === statusFilter;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        [
          report.id,
          report.prediction,
          report.description,
          report.image_name,
          report.latitude,
          report.longitude,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchText));

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [reports, typeFilter, statusFilter, search]);

  const stats = useMemo(() => ({
    total: reports.length,
    potholes: reports.filter((r) => r.prediction === "ACTUAL_POTHOLES").length,
    cracks: reports.filter((r) => r.prediction === "ROAD_CRACKS").length,
    pending: reports.filter((r) => r.status === "Pending verification").length,
    resolved: reports.filter((r) => r.status === "Resolved").length,
  }), [reports]);

  const updateStatus = async (report, newStatus) => {
    if (!report?.id || !STATUS_OPTIONS.includes(newStatus)) return;

    setUpdatingId(report.id);
    setActionMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/reports/${encodeURIComponent(report.id)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Status update failed.");
      }

      setReports((current) =>
        current.map((item) =>
          item.id === report.id ? { ...item, status: newStatus } : item
        )
      );

      setSelectedReport((current) =>
        current?.id === report.id
          ? { ...current, status: newStatus }
          : current
      );

      setActionMessage("Report status updated successfully.");
    } catch (err) {
      setActionMessage(err.message || "Could not update report status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
        >
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
              <ShieldCheck size={15} />
              Authority Control Centre
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Reports Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor, verify and manage AI-detected road damage reports.
            </p>
          </div>

          <button
            onClick={() => fetchReports(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101b30] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1b2b46] disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh Reports
          </button>
        </motion.div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total Reports" value={stats.total} description="Stored AI damage reports" icon={FileWarning} />
          <StatCard title="Potholes" value={stats.potholes} description="Detected pothole reports" icon={AlertTriangle} />
          <StatCard title="Road Cracks" value={stats.cracks} description="Detected crack reports" icon={Activity} />
          <StatCard title="Awaiting Review" value={stats.pending} description="Pending field verification" icon={Clock3} />
          <StatCard title="Resolved" value={stats.resolved} description="Marked as resolved" icon={CheckCircle2} />
        </div>

        {/* REPORT TABLE CONTAINER */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[#101b30] shadow-xl">

          <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Road Damage Records
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {filteredReports.length} records displayed
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full rounded-xl border border-white/10 bg-[#0b1425] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 sm:w-56"
                />
              </div>

              <div className="relative">
                <Filter
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#0b1425] py-2.5 pl-9 pr-9 text-sm text-white outline-none focus:border-cyan-400 sm:w-44"
                >
                  <option value="All">All damage types</option>
                  <option value="ACTUAL_POTHOLES">Potholes</option>
                  <option value="ROAD_CRACKS">Road cracks</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#0b1425] py-2.5 pl-3 pr-9 text-sm text-white outline-none focus:border-cyan-400 sm:w-48"
                >
                  {STATUS_FILTERS.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "All statuses" : status}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
              {error}
              <button
                onClick={() => fetchReports()}
                className="ml-3 font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <RefreshCw size={28} className="animate-spin text-cyan-300" />
              <p className="text-sm">Loading road damage reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <FileWarning size={30} className="text-slate-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                No reports found
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Try changing the filters or submit a road image through AI Detection.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-[#0b1425] text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Road Image</th>
                    <th className="px-5 py-4">Damage Type</th>
                    <th className="px-5 py-4">AI Confidence</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Reported On</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {filteredReports.map((report, index) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(index * 0.025, 0.3) }}
                      className="transition hover:bg-white/[0.035]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {report.image_url ? (
                            <img
                              src={getImageUrl(report.image_url)}
                              alt="Detected road damage"
                              className="h-14 w-20 rounded-lg border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-white/5">
                              <ImageIcon className="text-slate-500" />
                            </div>
                          )}
                          <span className="max-w-[120px] truncate text-xs text-slate-400">
                            {report.image_name || "Road image"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-white">
                          {formatPrediction(report.prediction)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-cyan-300">
                          {Number(report.confidence).toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {report.latitude != null && report.longitude != null ? (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-cyan-300" />
                            <span>
                              {Number(report.latitude).toFixed(4)},{" "}
                              {Number(report.longitude).toFixed(4)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">No GPS data</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} />
                          {formatDate(report.created_at)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={report.status} />
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setActionMessage("");
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>RoadRakshak AI · Reports Management</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Connected to local report database
          </span>
        </div>
      </div>

      {/* REPORT DETAIL MODAL */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedReport(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#101b30] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Report Details
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    {formatPrediction(selectedReport.prediction)}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
                {selectedReport.image_url && (
                  <img
                    src={getImageUrl(selectedReport.image_url)}
                    alt="Reported road damage"
                    className="max-h-72 w-full rounded-xl border border-white/10 object-cover"
                  />
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#0b1425] p-4">
                    <p className="text-xs text-slate-400">AI Confidence</p>
                    <p className="mt-2 text-2xl font-bold text-cyan-300">
                      {Number(selectedReport.confidence).toFixed(2)}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#0b1425] p-4">
                    <p className="text-xs text-slate-400">Current Status</p>
                    <div className="mt-2">
                      <StatusBadge status={selectedReport.status} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl bg-[#0b1425] p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-400">Report ID</span>
                    <span className="max-w-[65%] break-all text-right text-slate-200">
                      {selectedReport.id}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-400">GPS Coordinates</span>
                    <span className="text-right text-slate-200">
                      {selectedReport.latitude != null && selectedReport.longitude != null
                        ? `${selectedReport.latitude}, ${selectedReport.longitude}`
                        : "Not available"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-400">Location Source</span>
                    <span className="text-right text-slate-200">
                      {selectedReport.location_source || "Not provided"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-400">GPS Accuracy</span>
                    <span className="text-right text-slate-200">
                      {selectedReport.accuracy != null
                        ? `${selectedReport.accuracy} metres`
                        : "Not available"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-400">Reported On</span>
                    <span className="text-right text-slate-200">
                      {formatDate(selectedReport.created_at)}
                    </span>
                  </div>

                  <div>
                    <p className="text-slate-400">Description</p>
                    <p className="mt-1 text-slate-200">
                      {selectedReport.description || "No description available."}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Update Report Status
                  </label>

                  <select
                    value={selectedReport.status || "Pending verification"}
                    disabled={updatingId === selectedReport.id}
                    onChange={(e) => updateStatus(selectedReport, e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b1425] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {updatingId === selectedReport.id && (
                    <p className="mt-2 text-xs text-cyan-300">
                      Updating report status...
                    </p>
                  )}

                  {actionMessage && (
                    <p className="mt-2 text-xs text-cyan-300">
                      {actionMessage}
                    </p>
                  )}
                </div>

                {selectedReport.latitude != null && selectedReport.longitude != null && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                  >
                    <MapPin size={16} />
                    Open Location in Google Maps
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
