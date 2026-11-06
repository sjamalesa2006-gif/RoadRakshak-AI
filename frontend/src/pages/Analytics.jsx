import { fetchWithRetry } from "../api";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCw, TrendingUp } from "lucide-react";

const API = "https://roadrakshak-ai.onrender.com";

export default function Analytics() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    try {
      setError("");
      const response = await fetchWithRetry(`${API}/reports`);
      if (!response.ok) throw new Error("Unable to retrieve analytics data");
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

  const count = type => reports.filter(r =>
    String(r.prediction || "").toUpperCase().includes(type)
  ).length;

  const total = reports.length;
  const potholes = count("POTHOLE");
  const cracks = count("CRACK");
  const pending = reports.filter(r => r.status === "Pending verification").length;
  const verified = reports.filter(r => r.status === "Verified").length;
  const resolved = reports.filter(r => r.status === "Resolved").length;
  const maxType = Math.max(potholes, cracks, 1);

  const cards = [
    { title: "Total incidents", value: total, icon: AlertTriangle, color: "text-cyan-700" },
    { title: "Potholes", value: potholes, icon: Activity, color: "text-orange-600" },
    { title: "Road cracks", value: cracks, icon: TrendingUp, color: "text-amber-600" },
    { title: "Resolved cases", value: resolved, icon: CheckCircle2, color: "text-emerald-600" },
  ];

  const statusData = [
    { name: "Pending verification", value: pending, color: "bg-amber-400" },
    { name: "Verified", value: verified, color: "bg-cyan-500" },
    { name: "Resolved", value: resolved, color: "bg-emerald-500" },
  ];

  return (
    <main className="min-h-screen bg-[#eef2f7] p-5 text-slate-900 md:p-9">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.25em] text-cyan-700">ROADRAKSHAK AI • INSIGHTS</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Analytics Center</h1>
            <p className="mt-2 text-slate-500">Live insights calculated from submitted road reports.</p>
          </div>
          <button onClick={loadReports} className="flex items-center gap-2 rounded-xl bg-[#101b30] px-4 py-3 text-sm font-semibold text-white">
            <RefreshCw size={16}/> Refresh data
          </button>
        </div>

        {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        {loading ? <p className="mt-10 text-slate-500">Loading analytics...</p> : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map(({ title, value, icon: Icon, color }, index) => (
                <motion.div key={title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{title}</span>
                    <Icon className={color} size={21}/>
                  </div>
                  <p className="mt-4 text-3xl font-bold">{value}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Damage category breakdown</h2>
                <p className="mt-1 text-sm text-slate-500">Recorded AI classifications</p>
                <div className="mt-8 space-y-7">
                  <div>
                    <div className="mb-2 flex justify-between text-sm"><span>Potholes</span><b>{potholes}</b></div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: `${potholes / maxType * 100}%` }}/>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm"><span>Road cracks</span><b>{cracks}</b></div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${cracks / maxType * 100}%` }}/>
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-xs text-slate-400">Categories are counted from the prediction labels returned by the API.</p>
              </section>

              <section className="rounded-2xl bg-[#101b30] p-6 text-white shadow-sm">
                <h2 className="text-lg font-bold">Report status overview</h2>
                <p className="mt-1 text-sm text-slate-400">Current workflow status</p>
                <div className="mt-7 space-y-6">
                  {statusData.map(item => (
                    <div key={item.name}>
                      <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{item.name}</span><b>{item.value}</b></div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${total ? item.value / total * 100 : 0}%` }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Operational summary</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-amber-50 p-4"><Clock3 className="text-amber-700"/><p className="mt-3 text-2xl font-bold">{pending}</p><p className="text-sm text-slate-600">Need verification</p></div>
                <div className="rounded-xl bg-cyan-50 p-4"><Activity className="text-cyan-700"/><p className="mt-3 text-2xl font-bold">{verified}</p><p className="text-sm text-slate-600">Verified incidents</p></div>
                <div className="rounded-xl bg-emerald-50 p-4"><CheckCircle2 className="text-emerald-700"/><p className="mt-3 text-2xl font-bold">{total ? Math.round(resolved / total * 100) : 0}%</p><p className="text-sm text-slate-600">Resolution rate</p></div>
              </div>
            </section>
          </>
        )}
        <p className="mt-5 text-xs text-slate-500">Data refreshes every 30 seconds. This prototype reports only on incidents stored by the backend.</p>
      </div>
    </main>
  );
}
