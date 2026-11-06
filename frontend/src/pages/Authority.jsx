import { API_BASE_URL, fetchWithRetry } from "../api";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw, MapPin, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";

const statuses = ["Pending verification", "Verified", "Resolved"];

export default function Authority() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  async function loadReports() {
    try {
      setError("");
      const response = await fetchWithRetry(`${API_BASE_URL}/reports`);
      if (!response.ok) throw new Error("Could not load reports");
      const data = await response.json();
      setReports(Array.isArray(data) ? data : data.reports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    const timer = setInterval(loadReports, 30000);
    return () => clearInterval(timer);
  }, []);

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Status update failed");
      await loadReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  const pending = reports.filter(r => r.status === statuses[0]).length;
  const verified = reports.filter(r => r.status === statuses[1]).length;
  const resolved = reports.filter(r => r.status === statuses[2]).length;

  const stats = [
    { label: "Total reports", value: reports.length, icon: AlertTriangle },
    { label: "Awaiting review", value: pending, icon: Clock3 },
    { label: "Verified", value: verified, icon: ShieldCheck },
    { label: "Resolved", value: resolved, icon: CheckCircle2 },
  ];

  return (
    <main className="min-h-screen bg-[#eef2f7] p-5 text-slate-900 md:p-9">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.25em] text-cyan-700">ROADRAKSHAK AI • CONTROL ROOM</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Authority Portal</h1>
            <p className="mt-2 text-slate-500">Review road damage reports and manage response status.</p>
          </div>
          <button onClick={loadReports} className="flex items-center gap-2 rounded-xl bg-[#101b30] px-4 py-3 text-sm font-semibold text-white">
            <RefreshCw size={16}/> Refresh
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{label}</span>
                <Icon className="text-cyan-700" size={20}/>
              </div>
              <p className="mt-4 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <section className="mt-8 overflow-hidden rounded-2xl bg-[#101b30] text-white shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="text-lg font-semibold">Incoming road reports</h2>
              <p className="mt-1 text-xs text-slate-400">Review each AI-detected incident and update its status.</p>
            </div>
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">{reports.length} reports</span>
          </div>

          {loading ? <p className="p-8 text-slate-400">Loading reports...</p> :
            reports.length === 0 ? <p className="p-8 text-slate-400">No road reports received yet.</p> :
            <div className="divide-y divide-white/10">
              {reports.map(report => (
                <motion.div key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-semibold">{String(report.prediction || "Road damage").replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs text-slate-400">Report #{report.id} • {report.created_at || "Date unavailable"}</p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <MapPin size={14}/>
                      {report.latitude != null && report.longitude != null
                        ? `${report.latitude}, ${report.longitude}`
                        : "Location unavailable"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Confidence: {Number(report.confidence || 0).toFixed(1)}%</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white/10 px-3 py-2 text-xs">{report.status || statuses[0]}</span>
                    <select
                      value={report.status || statuses[0]}
                      disabled={updating === report.id}
                      onChange={e => updateStatus(report.id, e.target.value)}
                      className="rounded-lg border border-white/15 bg-[#1b2a43] px-3 py-2 text-sm text-white"
                    >
                      {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          }
        </section>
        <p className="mt-5 text-xs text-slate-500">Prototype note: this portal currently has no login or role-based access control.</p>
      </div>
    </main>
  );
}
