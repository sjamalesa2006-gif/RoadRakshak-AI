
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationContext } from "../context/LocationContext.jsx";
import {
  Upload,
  ScanSearch,
  CheckCircle2,
  AlertTriangle,
  Construction,
  RefreshCw,
  Image as ImageIcon,
  Camera,
  MapPin,
  MapPinOff,
  ShieldCheck,
  Activity,
  Cpu,
  Database,
  RotateCcw,
  FileCheck2,
} from "lucide-react";

const API_URL = "https://roadrakshak-ai.onrender.com";

const CLASS_INFO = {
  NORMAL_ROAD: {
    title: "Normal Road",
    description: "No significant road damage detected.",
    icon: CheckCircle2,
    accent: "emerald",
  },
  ACTUAL_POTHOLES: {
    title: "Pothole Detected",
    description:
      "A pothole has been detected. Road maintenance may be required.",
    icon: AlertTriangle,
    accent: "red",
  },
  ROAD_CRACKS: {
    title: "Road Cracks Detected",
    description: "Cracks have been detected on the road surface.",
    icon: Construction,
    accent: "amber",
  },
};

const CLASSES = [
  "NORMAL_ROAD",
  "ACTUAL_POTHOLES",
  "ROAD_CRACKS",
];

const analysisSteps = [
  {
    label: "Image submitted",
    detail: "Sending image to the detection server",
    icon: Upload,
  },
  {
    label: "AI model processing",
    detail: "Waiting for the model prediction",
    icon: Cpu,
  },
  {
    label: "Report processing",
    detail: "Receiving classification and report data",
    icon: Database,
  },
];

export default function Detection() {
  const { location, status, requestLocation } = useLocationContext();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [source, setSource] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFileChange(event, selectedSource) {
    const selected = event.target.files?.[0];
    event.target.value = "";

    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (selected.size > 15 * 1024 * 1024) {
      setError("Image is too large. Please select an image under 15 MB.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setSource(selectedSource);
    setResult(null);
    setError("");
  }

  async function analyseImage() {
    if (!file) {
      setError("Please capture or upload a road image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setAnalysisStep(0);

    const formData = new FormData();

    formData.append("file", file);

    // GPS is optional. Do not invent coordinates for gallery images.
    if (location) {
      formData.append("latitude", String(location.latitude));
      formData.append("longitude", String(location.longitude));
      formData.append("accuracy", String(location.accuracy));
      formData.append(
        "location_source",
        source === "camera" ? "camera_capture_current_gps" : "current_device_gps"
      );
    } else {
      formData.append(
        "location_source",
        source === "camera" ? "camera_no_gps" : "gallery_no_gps"
      );
    }

    try {
      setAnalysisStep(0);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      setAnalysisStep(1);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "AI analysis failed. Please try again."
        );
      }

      if (!CLASS_INFO[data.prediction]) {
        throw new Error("The server returned an unknown AI classification.");
      }

      setAnalysisStep(2);
      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the AI server. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetAnalysis() {
    setFile(null);
    setPreview("");
    setSource("");
    setResult(null);
    setError("");
    setAnalysisStep(0);
  }

  const detectedClass = result
    ? CLASS_INFO[result.prediction]
    : null;

  const ResultIcon = detectedClass?.icon;

  const confidence = Math.min(
    100,
    Math.max(0, Number(result?.confidence) || 0)
  );

  const savedReport = result?.report;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-5 py-8 text-white md:px-10">

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
            <Activity size={15} />
            RoadRakshak AI / Intelligence Centre
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                AI Detection
                <span className="text-cyan-400"> Lab.</span>
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                Intelligent road-surface analysis powered by a
                three-class deep-learning model for normal roads, potholes,
                and road cracks.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 md:self-auto">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-semibold tracking-wider text-emerald-300">
                AI SYSTEM READY
              </span>
            </div>
          </div>
        </motion.header>

        {/* Main layout */}
        <div className="grid items-start gap-7 lg:grid-cols-2">

          {/* Upload panel */}
          <motion.section
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-cyan-400/15 bg-[#0b1224]/90 p-6 shadow-[0_0_50px_rgba(8,145,178,0.06)] backdrop-blur-xl md:p-8"
          >
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Input Module 01
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Road Image Input
                </h2>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-400">
                <ImageIcon size={25} />
              </div>
            </div>

            {/* Image preview */}
            <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#060b18]">

              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Selected road"
                    className="max-h-80 w-full object-contain"
                  />

                  {loading && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-cyan-950/10">
                      <motion.div
                        className="absolute inset-x-0 h-1 bg-cyan-300 shadow-[0_0_25px_8px_rgba(34,211,238,0.55)]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />

                      <div className="absolute inset-0 border-2 border-cyan-400/30">
                        <motion.div
                          className="absolute inset-0 border border-cyan-300/30"
                          animate={{ opacity: [0.2, 0.8, 0.2] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        />
                      </div>

                      <div className="absolute bottom-3 left-3 rounded-lg border border-cyan-300/30 bg-black/70 px-3 py-2 text-xs font-semibold tracking-widest text-cyan-300">
                        IMAGE SCAN ACTIVE
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-6 text-center">
                  <motion.div
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.12)]"
                  >
                    <ScanSearch size={38} />
                  </motion.div>

                  <h3 className="text-lg font-semibold text-slate-200">
                    Awaiting Image Input
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Capture a road image or select one from your gallery.
                  </p>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB �{" "}
                    {source === "camera" ? "Camera capture" : "Gallery image"}
                  </p>
                </div>

                <FileCheck2 className="shrink-0 text-cyan-400" size={20} />
              </div>
            )}

            {/* Camera and gallery */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-4 text-sm font-bold text-cyan-300 transition hover:border-cyan-300 hover:bg-cyan-400/20">
                <Camera size={19} />
                Camera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => handleFileChange(event, "camera")}
                  className="hidden"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-4 text-sm font-bold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/[0.08]">
                <Upload size={19} />
                Gallery
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleFileChange(event, "gallery")}
                  className="hidden"
                />
              </label>
            </div>

            {/* GPS information */}
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-[#070d1b] p-4">
              {location ? (
                <MapPin className="mt-0.5 shrink-0 text-emerald-400" size={19} />
              ) : (
                <MapPinOff className="mt-0.5 shrink-0 text-amber-400" size={19} />
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200">
                  {location ? "GPS Location Available" : "GPS Location Unavailable"}
                </p>

                {location ? (
                  <p className="mt-1 break-all text-xs leading-5 text-slate-500">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    <br />
                    Accuracy: approximately {Math.round(location.accuracy)} metres
                  </p>
                ) : (
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    You can still analyse an image without GPS. Reports will
                    have no coordinates until location is available.
                  </p>
                )}
              </div>

              {!location && (
                <button
                  onClick={requestLocation}
                  disabled={status === "loading"}
                  className="shrink-0 text-xs font-semibold text-cyan-400 hover:text-cyan-200 disabled:opacity-50"
                >
                  {status === "loading" ? "Getting..." : "Enable GPS"}
                </button>
              )}
            </div>

            {/* Analysis button */}
            <button
              onClick={analyseImage}
              disabled={!file || loading}
              className="group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-cyan-400 px-6 py-4 font-black tracking-wide text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.16)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />

              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  PROCESSING IMAGE...
                </>
              ) : (
                <>
                  <ScanSearch size={20} />
                  START AI ANALYSIS
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {file && (
              <button
                onClick={resetAnalysis}
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                <RotateCcw size={16} />
                Clear and Upload Another Image
              </button>
            )}
          </motion.section>

          {/* Results panel */}
          <motion.section
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-cyan-400/15 bg-[#0b1224]/90 p-6 shadow-[0_0_50px_rgba(8,145,178,0.06)] backdrop-blur-xl md:p-8"
          >
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Output Module 02
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Intelligence Results
              </h2>
            </div>

            <AnimatePresence mode="wait">

              {/* Idle state */}
              {!result && !loading && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-72 flex-col items-center justify-center text-center"
                >
                  <div className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-slate-500">
                    <Activity size={42} />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-300">
                    System Standing By
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Your AI classification, confidence score, and report
                    information will appear here.
                  </p>
                </motion.div>
              )}

              {/* Animated analysis state */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-72 flex-col items-center justify-center text-center"
                >
                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <motion.div
                      className="absolute inset-0 rounded-full border border-cyan-400/20"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />

                    <motion.div
                      className="absolute inset-3 rounded-full border-2 border-dashed border-cyan-400/50"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />

                    <motion.div
                      className="absolute inset-7 rounded-full border border-cyan-300/30"
                      animate={{ scale: [1, 1.12, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.2)]">
                      <Cpu size={34} />
                    </div>
                  </div>

                  <h3 className="mt-7 text-xl font-bold">
                    AI Analysis in Progress
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Communicating with the RoadRakshak detection server
                  </p>

                  <div className="mt-8 w-full space-y-4 text-left">
                    {analysisSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const active = index === analysisStep;
                      const complete = index < analysisStep;

                      return (
                        <div key={step.label} className="flex items-center gap-3">
                          <div
                            className={`rounded-xl p-2 ${
                              complete
                                ? "bg-emerald-400/10 text-emerald-400"
                                : active
                                  ? "bg-cyan-400/10 text-cyan-300"
                                  : "bg-white/5 text-slate-600"
                            }`}
                          >
                            {complete ? (
                              <CheckCircle2 size={19} />
                            ) : (
                              <StepIcon size={19} />
                            )}
                          </div>

                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${
                              active || complete ? "text-slate-200" : "text-slate-600"
                            }`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-slate-600">
                              {step.detail}
                            </p>
                          </div>

                          {active && (
                            <RefreshCw
                              size={16}
                              className="animate-spin text-cyan-400"
                            />
                          )}
                          {complete && (
                            <CheckCircle2 size={16} className="text-emerald-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Successful result */}
              {result && detectedClass && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5">
                    <motion.div
                      className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/10 blur-2xl"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />

                    <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                      AI Classification Complete
                    </p>

                    <div className="relative mt-5 flex items-center gap-4">
                      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-300">
                        <ResultIcon size={34} />
                      </div>

                      <div>
                        <h3 className="text-2xl font-black">
                          {detectedClass.title}
                        </h3>
                        <p className="mt-1 text-sm leading-5 text-slate-400">
                          {detectedClass.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="rounded-2xl border border-white/10 bg-[#070d1b] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-200">
                        Model Confidence
                      </p>
                      <p className="text-2xl font-black text-cyan-300">
                        {confidence.toFixed(2)}%
                      </p>
                    </div>

                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                      />
                    </div>
                  </div>

                  {/* Probability breakdown */}
                  <div className="rounded-2xl border border-white/10 bg-[#070d1b] p-5">
                    <h3 className="mb-5 font-semibold text-slate-200">
                      Class Probability Breakdown
                    </h3>

                    <div className="space-y-5">
                      {CLASSES.map((name, index) => {
                        const probability = Math.min(
                          100,
                          Math.max(
                            0,
                            Number(result.class_probabilities?.[name]) || 0
                          )
                        );

                        return (
                          <div key={name}>
                            <div className="mb-2 flex justify-between gap-3 text-sm">
                              <span className="text-slate-300">
                                {CLASS_INFO[name].title}
                              </span>
                              <span className="font-bold text-cyan-300">
                                {probability.toFixed(2)}%
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${probability}%` }}
                                transition={{
                                  duration: 0.8,
                                  delay: index * 0.15,
                                }}
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Backend report status */}
                  {result.prediction !== "NORMAL_ROAD" && (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-400">
                          <ShieldCheck size={23} />
                        </div>

                        <div>
                          <h3 className="font-bold text-emerald-300">
                            Road Damage Report
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            {savedReport?.id
                              ? "Report saved successfully in the backend database."
                              : "No saved report was returned by the server."}
                          </p>
                        </div>
                      </div>

                      {savedReport?.id && (
                        <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-slate-400">
                          <p>
                            Report ID:{" "}
                            <span className="break-all text-slate-200">
                              {savedReport.id}
                            </span>
                          </p>
                          <p>
                            Status:{" "}
                            <span className="text-amber-300">
                              {savedReport.status || "Pending verification"}
                            </span>
                          </p>
                          <p>
                            GPS:{" "}
                            {savedReport.position
                              ? "Coordinates attached"
                              : "Not available"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {result.prediction === "NORMAL_ROAD" && (
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
                      <CheckCircle2 className="mr-2 inline" size={17} />
                      No damage report was necessary for this normal-road result.
                    </div>
                  )}

                  <p className="text-xs leading-6 text-slate-500">
                    AI predictions are model estimates, not confirmed
                    engineering inspections. Road conditions should be
                    verified before maintenance decisions are made.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>

        {/* Model classes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid gap-4 sm:grid-cols-3"
        >
          {CLASSES.map((name) => {
            const InfoIcon = CLASS_INFO[name].icon;

            return (
              <div
                key={name}
                className="rounded-2xl border border-white/10 bg-[#0b1224]/80 p-5 transition hover:border-cyan-400/30"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Detection Class
                  </span>
                  <InfoIcon className="text-cyan-400" size={20} />
                </div>

                <h3 className="font-bold text-slate-200">
                  {CLASS_INFO[name].title}
                </h3>
              </div>
            );
          })}
        </motion.section>

        <footer className="mt-12 border-t border-white/5 pt-6 text-center">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-600">
            ROADRAKSHAK AI � INTELLIGENT ROAD SAFETY SYSTEM
          </p>
          <p className="mt-2 text-xs text-slate-700">
            Three-class road surface detection with real image classification
          </p>
        </footer>
      </div>
    </div>
  );
}
