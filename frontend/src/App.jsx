
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  Radar,
  MapPin,
  ScanLine,
  Menu,
  Zap,
  Globe2,
  ChevronRight,
  Route,
  BrainCircuit,
} from "lucide-react";

const features = [
  {
    icon: ScanLine,
    number: "01",
    title: "AI Road Detection",
    description:
      "Analyse road images using artificial intelligence to identify potholes and damaged road surfaces.",
  },
  {
    icon: MapPin,
    number: "02",
    title: "Location Intelligence",
    description:
      "Connect road damage reports with geographic locations for easier monitoring and response.",
  },
  {
    icon: Activity,
    number: "03",
    title: "Smart Monitoring",
    description:
      "Monitor road conditions, reports and infrastructure insights through one unified platform.",
  },
];

const stats = [
  { value: "AI", label: "Powered Detection" },
  { value: "24/7", label: "Road Monitoring Vision" },
  { value: "ONE", label: "Unified Platform" },
];

function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-60 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:55px_55px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
            <ShieldCheck className="text-cyan-300" size={25} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">
              ROAD<span className="text-cyan-400">RAKSHAK</span>
            </h1>
            <p className="text-[9px] tracking-[0.35em] text-slate-500">
              INTELLIGENCE SYSTEM
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-9 text-sm text-slate-400 md:flex">
          <a href="#home" className="transition hover:text-cyan-300">Home</a>
          <a href="#technology" className="transition hover:text-cyan-300">Technology</a>
          <a href="#features" className="transition hover:text-cyan-300">Features</a>
          <a href="#mission" className="transition hover:text-cyan-300">Our Mission</a>
        </div>

        <Link
          to="/dashboard"
          className="hidden items-center gap-2 rounded-lg border border-cyan-400/40 px-5 py-3 text-sm text-cyan-300 transition hover:bg-cyan-400/10 md:flex"
        >
          Launch Platform <ArrowRight size={16} />
        </Link>

        <a href="#features" className="text-cyan-300 md:hidden">
          <Menu size={25} />
        </a>
      </nav>

      {/* Hero */}
      <section
        id="home"
        className="relative z-10 mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs tracking-wider text-cyan-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            AI-POWERED ROAD INTELLIGENCE
          </div>

          <h2 className="max-w-3xl text-5xl font-bold leading-[1.12] tracking-tight md:text-7xl">
            Making Every
            <span className="block">Road</span>
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
              Safer.
            </span>
          </h2>

          <p className="mt-8 max-w-xl text-base leading-8 text-slate-400 md:text-lg">
            Introducing RoadRakshak AI — an intelligent road monitoring
            platform designed to identify potholes, understand road
            conditions and support smarter infrastructure management.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              className="group flex items-center gap-3 rounded-xl bg-cyan-400 px-7 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Explore Platform
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </Link>

            <a
              href="#technology"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-7 py-4 text-sm text-white transition hover:border-cyan-400/50 hover:bg-white/5"
            >
              Discover Technology <ChevronRight size={17} />
            </a>
          </div>

          <div className="mt-14 grid max-w-xl grid-cols-3 gap-5 border-t border-white/10 pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-cyan-300">{stat.value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Animated visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative mx-auto flex w-full max-w-xl items-center justify-center"
        >
          <div className="absolute h-[420px] w-[420px] animate-pulse rounded-full border border-cyan-400/10" />
          <div className="absolute h-[340px] w-[340px] rounded-full border border-cyan-400/20" />
          <div className="absolute h-[260px] w-[260px] rounded-full border border-dashed border-cyan-400/30" />

          <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-cyan-300/20 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 shadow-[0_0_100px_rgba(34,211,238,0.12)] md:h-96 md:w-96">
            <div className="absolute inset-8 rounded-full border border-cyan-300/10" />
            <div className="absolute inset-16 rounded-full border border-cyan-300/10" />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute left-1/2 top-0 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_20px_#22d3ee]" />
            </motion.div>

            <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl border border-cyan-300/30 bg-[#071629] shadow-[0_0_60px_rgba(34,211,238,0.2)] md:h-40 md:w-40">
              <Radar size={75} strokeWidth={1.1} className="text-cyan-300" />
            </div>

            <div className="absolute -right-2 top-16 rounded-xl border border-cyan-400/20 bg-[#0b1629]/95 p-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs text-cyan-300">
                <Activity size={15} />
                SYSTEM STATUS
              </div>
              <p className="mt-2 text-sm font-semibold">AI READY</p>
              <p className="mt-1 text-[10px] text-slate-500">Detection module</p>
            </div>

            <div className="absolute -bottom-2 -left-4 rounded-xl border border-blue-400/20 bg-[#0b1629]/95 p-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs text-blue-300">
                <MapPin size={15} />
                GEO INTELLIGENCE
              </div>
              <p className="mt-2 text-sm font-semibold">LOCATION AWARE</p>
              <p className="mt-1 text-[10px] text-slate-500">Mapping capability</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Technology strip */}
      <section id="technology" className="relative z-10 border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-9 md:grid-cols-4 lg:px-10">
          {[
            { icon: BrainCircuit, label: "Artificial Intelligence" },
            { icon: Radar, label: "Computer Vision" },
            { icon: Globe2, label: "Location Intelligence" },
            { icon: Route, label: "Road Infrastructure" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-center gap-3 text-sm text-slate-400">
              <item.icon size={20} className="text-cyan-400" />
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.3em] text-cyan-400">
            PLATFORM CAPABILITIES
          </p>
          <h2 className="mt-5 text-4xl font-bold md:text-5xl">
            Intelligence for
            <span className="text-cyan-300"> better roads.</span>
          </h2>
          <p className="mt-5 leading-7 text-slate-400">
            Bringing AI-assisted road analysis, location information and
            infrastructure monitoring together in one platform.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-8 transition hover:-translate-y-2 hover:border-cyan-400/40 hover:bg-cyan-400/[0.04]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <feature.icon size={27} />
                </div>
                <span className="text-sm text-slate-600">{feature.number}</span>
              </div>
              <h3 className="mt-8 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {feature.description}
              </p>
              <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                EXPLORE CAPABILITY <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent p-10 md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]" />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-2 text-sm text-cyan-300">
              <Zap size={17} /> OUR MISSION
            </div>
            <h2 className="mt-6 text-3xl font-bold leading-tight md:text-5xl">
              Building a smarter and safer road ecosystem.
            </h2>
            <p className="mt-6 leading-8 text-slate-400">
              Our vision is to make road infrastructure monitoring more
              intelligent, accessible and responsive through technology.
              RoadRakshak AI aims to support better decisions for safer
              communities.
            </p>
            <Link
              to="/dashboard"
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Enter RoadRakshak AI <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center text-xs text-slate-500 md:flex-row lg:px-10">
          <p>© 2026 ROADRAKSHAK AI. All rights reserved.</p>
          <p>INTELLIGENCE • SAFETY • SUSTAINABILITY</p>
        </div>
      </footer>
    </main>
  );
}

export default App;
