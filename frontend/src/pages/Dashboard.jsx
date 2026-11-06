import { API_BASE_URL, fetchWithRetry } from "../api";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  MapPin,
  ScanSearch,
  FileText,
  BarChart3,
  ShieldCheck,
  ArrowUpRight,
  Radar,
  RefreshCw,
  Menu,
  X,
  Zap,
  Clock3,
  ChevronRight,
  CircleDot,
  Wifi,
  Database,
  ExternalLink,
} from "lucide-react";

const modules = [
  {
    title: "AI Detection Lab",
    description: "Analyze road images with AI-powered damage detection.",
    icon: ScanSearch,
    path: "/detection",
    tag: "AI ENGINE",
    number: "01",
  },
  {
    title: "Road Intelligence Map",
    description: "Explore geographically tagged road damage reports.",
    icon: MapPin,
    path: "/map",
    tag: "GEO INTELLIGENCE",
    number: "02",
  },
  {
    title: "Report a Road",
    description: "Submit road damage information to the platform.",
    icon: FileText,
    path: "/report",
    tag: "REPORTING",
    number: "03",
  },
  {
    title: "Authority Portal",
    description: "Review reports and monitor repair progress.",
    icon: ShieldCheck,
    path: "/authority",
    tag: "MANAGEMENT",
    number: "04",
  },
  {
    title: "Analytics Center",
    description: "Discover road safety trends and insights.",
    icon: BarChart3,
    path: "/analytics",
    tag: "INTELLIGENCE",
    number: "05",
  },
];

const navigation = [
  { label: "Overview", path: "/dashboard", icon: Activity },
  { label: "AI Detection", path: "/detection", icon: ScanSearch },
  { label: "Intelligence Map", path: "/map", icon: MapPin },
  { label: "Road Reports", path: "/report", icon: FileText },
  { label: "Authority Portal", path: "/authority", icon: ShieldCheck },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setError("");

      const response = await fetchWithRetry(`${API_BASE_URL}/reports`);

      if (!response.ok) {
        throw new Error("Unable to retrieve reports from the backend.");
      }

      const data = await response.json();

      setReports(Array.isArray(data.reports) ? data.reports : []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Backend connection unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();

    const interval = setInterval(fetchReports, 30000);

    return () => clearInterval(interval);
  }, [fetchReports]);

  const stats = useMemo(() => {
    const potholes = reports.filter(
      (r) => r.prediction === "ACTUAL_POTHOLES"
    ).length;

    const cracks = reports.filter(
      (r) => r.prediction === "ROAD_CRACKS"
    ).length;

    const locations = new Set(
      reports
        .filter(
          (r) =>
            r.latitude !== null &&
            r.latitude !== undefined &&
            r.longitude !== null &&
            r.longitude !== undefined
        )
        .map((r) => `${r.latitude},${r.longitude}`)
    ).size;

    return [
      {
        label: "Total Damage Reports",
        value: reports.length,
        icon: FileText,
        detail: "Reports stored in database",
      },
      {
        label: "Potholes Detected",
        value: potholes,
        icon: AlertTriangle,
        detail: "AI-classified pothole reports",
      },
      {
        label: "Road Cracks Detected",
        value: cracks,
        icon: Activity,
        detail: "AI-classified crack reports",
      },
      {
        label: "Geo-tagged Locations",
        value: locations,
        icon: MapPin,
        detail: "Reports with GPS coordinates",
      },
    ];
  }, [reports]);

  const distribution = useMemo(() => {
    const potholes = reports.filter(
      (r) => r.prediction === "ACTUAL_POTHOLES"
    ).length;

    const cracks = reports.filter(
      (r) => r.prediction === "ROAD_CRACKS"
    ).length;

    const total = reports.length || 1;

    return [
      {
        label: "Potholes",
        count: potholes,
        percentage: (potholes / total) * 100,
        color: "bg-cyan-400",
      },
      {
        label: "Road Cracks",
        count: cracks,
        percentage: (cracks / total) * 100,
        color: "bg-blue-400",
      },
    ];
  }, [reports]);

  const recentReports = useMemo(
    () =>
      [...reports]
        .sort(
          (a, b) =>
            new Date(b.created_at || 0) -
            new Date(a.created_at || 0)
        )
        .slice(0, 5),
    [reports]
  );

  const resolvedCount = reports.filter(
    (r) => String(r.status || "").toLowerCase() === "resolved"
  ).length;

  return (
    <main className="rr-dashboard relative min-h-screen overflow-hidden bg-[#F1F5F9] text-slate-900">

      {/* LIGHT THEME BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-cyan-400/[0.07] blur-[140px]" />
        <div className="absolute -right-40 top-60 h-[500px] w-[500px] rounded-full bg-blue-400/[0.07] blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-400/[0.04] blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[270px] border-r border-white/[0.07] bg-[#080e1d]/95 px-5 py-7 backdrop-blur-2xl lg:flex lg:flex-col">

        <Link to="/" className="mb-12 flex items-center gap-3 px-2">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.08 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
          >
            <Radar size={28} className="text-cyan-300" />
          </motion.div>

          <div>
            <p className="text-lg font-black tracking-[0.13em] text-white">
              ROAD<span className="text-cyan-400">RAKSHAK</span>
            </p>
            <p className="mt-1 text-[8px] tracking-[0.35em] text-slate-500">
              INTELLIGENCE SYSTEM
            </p>
          </div>
        </Link>

        <div className="mb-4 px-3 text-[9px] font-bold tracking-[0.3em] text-slate-600">
          COMMAND NAVIGATION
        </div>

        <nav className="space-y-2">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const active = item.path === "/dashboard";

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 }}
              >
                <Link
                  to={item.path}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3.5 text-[13px] transition-all duration-300 ${
                    active
                      ? "border border-cyan-400/20 bg-cyan-400/[0.09] text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.06)]"
                      : "border border-transparent text-slate-500 hover:border-white/10 hover:bg-white/[0.045] hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="activeNavigation"
                      className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]"
                    />
                  )}

                  <Icon size={17} />
                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
                  )}

                  {!active && (
                    <ChevronRight
                      size={14}
                      className="ml-auto opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="mb-5 rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.09] to-blue-500/[0.04] p-4">
            <div className="mb-3 flex items-center gap-2 text-cyan-300">
              <Zap size={15} />
              <span className="text-[10px] font-bold tracking-widest">
                SYSTEM CORE
              </span>
            </div>

            <p className="text-xs font-semibold text-white">
              RoadRakshak AI
            </p>

            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Intelligent road monitoring and infrastructure insights.
            </p>

            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5 }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
              />
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs text-slate-500 transition hover:bg-white/5 hover:text-cyan-300"
          >
            <ArrowUpRight size={16} />
            Back to Home
          </Link>

          <p className="mt-5 px-3 text-[9px] tracking-wider text-slate-700">
            ROADRAKSHAK AI • 2026
          </p>
        </div>
      </aside>

      {/* MOBILE NAVIGATION */}
      <AnimatePresence>
        {mobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenu(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 top-0 z-50 w-[290px] border-r border-white/10 bg-[#080e1d] p-6 lg:hidden"
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="font-bold tracking-widest text-white">
                  ROAD<span className="text-cyan-400">RAKSHAK</span>
                </span>

                <button
                  onClick={() => setMobileMenu(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenu(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-cyan-400/10 hover:text-cyan-300"
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN LIGHT WORKSPACE */}
      <section className="relative z-10 px-5 py-6 sm:px-8 lg:ml-[270px] lg:px-10 lg:py-9">

        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-300 pb-7"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenu(true)}
              className="rounded-xl border border-slate-300 bg-white p-3 text-slate-700 shadow-sm lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-cyan-700">
                <Radar size={14} />
                COMMAND CENTER / OVERVIEW
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Road Intelligence
                <span className="text-cyan-700"> Dashboard.</span>
              </h1>

              <p className="mt-2 text-xs text-slate-600 sm:text-sm">
                Your unified road safety intelligence workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-600 shadow-sm sm:flex">
              <Clock3 size={14} className="text-cyan-700" />
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : "Waiting for data"}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-cyan-700/20 bg-[#0B1426] px-4 py-3 text-xs font-semibold text-cyan-300 transition hover:bg-[#14243B] disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh Data</span>
            </motion.button>
          </div>
        </motion.header>

        {/* SYSTEM STATUS - DARK PANEL */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0B1426] p-4 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
              <Activity size={19} className="text-cyan-300" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-[#0b1426] bg-emerald-400" />
            </div>

            <div>
              <p className="text-xs font-semibold text-white">
                Platform monitoring
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                {error
                  ? "Backend connection needs attention"
                  : "Dashboard data connection"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[10px]">
            <div className="flex items-center gap-2">
              <Wifi
                size={14}
                className={error ? "text-red-400" : "text-emerald-400"}
              />
              <span className={error ? "text-red-300" : "text-emerald-300"}>
                {error
                  ? "API DISCONNECTED"
                  : loading
                  ? "CONNECTING"
                  : "API CONNECTED"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Database size={14} className="text-cyan-300" />
              DATABASE REPORTS
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-700"
          >
            {error} Make sure your FastAPI backend is running at {API_BASE_URL}.
          </motion.div>
        )}

        {/* STATISTICS */}
        <div className="mb-5 mt-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-cyan-700">
              LIVE INTELLIGENCE
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              Platform Overview
            </h2>
          </div>

          <span className="text-[10px] text-slate-500">
            AUTO REFRESH • 30 SEC
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -7, scale: 1.015 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#101c31] to-[#0a1222] p-5 shadow-xl transition-colors duration-300 hover:border-cyan-400/40"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/[0.035] blur-2xl transition-all duration-500 group-hover:bg-cyan-400/[0.12]" />

                <div className="relative flex items-center justify-between">
                  <p className="text-xs text-slate-300">{stat.label}</p>

                  <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.08] p-2.5">
                    <Icon size={19} className="text-cyan-300" />
                  </div>
                </div>

                <div className="relative mt-7 flex items-end justify-between">
                  <motion.p
                    key={stat.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold tracking-tight text-white"
                  >
                    {loading && reports.length === 0 ? "—" : stat.value}
                  </motion.p>

                  <span className="mb-1 text-[9px] tracking-wider text-cyan-400/70">
                    LIVE DATA
                  </span>
                </div>

                <p className="relative mt-3 text-[10px] text-slate-400">
                  {stat.detail}
                </p>

                <div className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-transform duration-500 group-hover:scale-x-100" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* INSIGHTS */}
        <div className="mt-10 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">

          {/* DETECTION DISTRIBUTION */}
          <motion.section
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl border border-slate-800 bg-[#0B1426] p-6 shadow-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] text-cyan-300">
                  DAMAGE INTELLIGENCE
                </p>
                <h3 className="mt-2 text-lg font-bold text-white">
                  Detection Distribution
                </h3>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-slate-400">
                ALL STORED REPORTS
              </div>
            </div>

            <div className="mt-9 space-y-7">
              {distribution.map((item, index) => (
                <div key={item.label}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-[0_0_12px_rgba(34,211,238,0.3)]`}
                      />
                      <span className="text-xs text-slate-300">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-white">
                      {item.count}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: `${item.percentage}%`,
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1.2,
                        delay: index * 0.2,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full ${item.color} shadow-[0_0_15px_rgba(34,211,238,0.2)]`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-9 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-6">
              <div className="rounded-xl bg-white/[0.025] p-4">
                <p className="text-[10px] text-slate-400">
                  Total stored reports
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {reports.length}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.025] p-4">
                <p className="text-[10px] text-slate-400">
                  Resolved reports
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">
                  {resolvedCount}
                </p>
              </div>
            </div>
          </motion.section>

          {/* SYSTEM PANEL */}
          <motion.section
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-[#0e2035] via-[#0b1426] to-[#0b1426] p-6 shadow-xl"
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/[0.08] blur-[70px]" />

            <div className="relative">
              <div className="flex items-center gap-2 text-cyan-300">
                <Radar size={18} />
                <p className="text-[10px] font-bold tracking-[0.25em]">
                  SYSTEM INTELLIGENCE
                </p>
              </div>

              <h3 className="mt-5 text-xl font-bold text-white">
                RoadRakshak <span className="text-cyan-300">AI Core</span>
              </h3>

              <p className="mt-3 text-xs leading-6 text-slate-400">
                AI-assisted road damage classification, report storage and
                geographic intelligence in one unified system.
              </p>

              <div className="mt-7 space-y-4">
                {[
                  {
                    label: "AI Classification",
                    value: "3 Classes",
                    icon: ScanSearch,
                  },
                  {
                    label: "Report Database",
                    value: "SQLite",
                    icon: Database,
                  },
                  {
                    label: "Location Mapping",
                    value: "Google Maps",
                    icon: MapPin,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-white/[0.06] pb-3"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className="text-cyan-300" />
                        <span className="text-xs text-slate-400">
                          {item.label}
                        </span>
                      </div>

                      <span className="text-[10px] font-semibold text-white">
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                to="/detection"
                className="mt-7 flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-3 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/[0.14]"
              >
                Launch AI Detection
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </motion.section>
        </div>

        {/* RECENT REPORTS */}
        <motion.section
          variants={itemVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1426] shadow-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] p-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] text-cyan-300">
                FIELD INTELLIGENCE
              </p>

              <h3 className="mt-2 text-lg font-bold text-white">
                Recent Road Reports
              </h3>
            </div>

            <Link
              to="/map"
              className="flex items-center gap-2 text-xs text-cyan-300 transition hover:text-white"
            >
              View Intelligence Map <ExternalLink size={14} />
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06]">
                <FileText size={24} className="text-cyan-300" />
              </div>

              <p className="mt-4 text-sm font-semibold text-white">
                No damage reports yet
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Reports saved through AI detection will appear here.
              </p>

              <Link
                to="/detection"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Start AI Detection <ArrowUpRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {recentReports.map((report, index) => (
                <motion.div
                  key={report.id || index}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition hover:bg-white/[0.025]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.07]">
                      <AlertTriangle size={18} className="text-cyan-300" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">
                        {report.prediction === "ACTUAL_POTHOLES"
                          ? "Pothole detected"
                          : report.prediction === "ROAD_CRACKS"
                          ? "Road crack detected"
                          : report.prediction || "Road damage report"}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] text-slate-400">
                        AI confidence
                      </p>

                      <p className="mt-1 text-xs font-semibold text-cyan-300">
                        {typeof report.confidence === "number"
                          ? `${(report.confidence * 100).toFixed(1)}%`
                          : "—"}
                      </p>
                    </div>

                    <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-3 py-1.5 text-[9px] text-amber-300">
                      {report.status || "Pending"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* PLATFORM MODULES */}
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-[10px] font-bold tracking-[0.3em] text-cyan-700">
              PLATFORM ECOSYSTEM
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Explore your workspace.
            </h2>

            <p className="mt-2 text-xs text-slate-600">
              Access the intelligence modules of RoadRakshak AI.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {modules.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div key={item.path} variants={itemVariants}>
                  <Link
                    to={item.path}
                    className="group relative block h-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#101c31] to-[#0a1222] p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_15px_50px_rgba(34,211,238,0.12)]"
                  >
                    <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/[0.025] blur-2xl transition-all duration-500 group-hover:bg-cyan-400/[0.12]" />

                    <div className="relative flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                        <Icon size={23} className="text-cyan-300" />
                      </div>

                      <span className="text-[10px] tracking-widest text-slate-500">
                        {item.number}
                      </span>
                    </div>

                    <p className="relative mt-6 text-[9px] font-bold tracking-[0.2em] text-cyan-400/80">
                      {item.tag}
                    </p>

                    <h3 className="relative mt-2 text-lg font-semibold text-white transition group-hover:text-cyan-200">
                      {item.title}
                    </h3>

                    <p className="relative mt-3 min-h-[42px] text-xs leading-6 text-slate-400">
                      {item.description}
                    </p>

                    <div className="relative mt-7 flex items-center justify-between border-t border-white/[0.07] pt-4">
                      <span className="text-[10px] font-bold tracking-widest text-cyan-300">
                        ACCESS MODULE
                      </span>

                      <ArrowUpRight
                        size={17}
                        className="text-slate-500 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-cyan-300"
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-slate-300 py-7 text-[9px] tracking-wider text-slate-500">
          <p>© 2026 ROADRAKSHAK AI • INTELLIGENCE SYSTEM</p>

          <div className="flex items-center gap-2">
            <CircleDot size={12} className="text-cyan-700" />
            BUILT FOR SAFER ROADS
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Dashboard;
