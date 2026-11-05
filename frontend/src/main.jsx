
import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Detection from "./pages/Detection.jsx";
import MapPage from "./pages/MapPage.jsx";
import Reports from "./pages/Reports.jsx";
import Authority from "./pages/Authority.jsx";
import Analytics from "./pages/Analytics.jsx";

import { LocationProvider } from "./context/LocationContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LocationProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/detection" element={<Detection />} />
          <Route path="/report" element={<Detection />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/authority" element={<Authority />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LocationProvider>
    </BrowserRouter>
  </React.StrictMode>
);

