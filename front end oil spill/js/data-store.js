/**
 * OilGuard AI — Pre-bundled Data Store (100% Offline & GitHub Pages Capable)
 * Provides immediate zero-latency fallback data when Flask backend is not running.
 */
const OilGuardDataStore = {
  vessels: [
    {
      id: "OG-VESSEL-01",
      name: "MV Ocean Star",
      type: "Product Tanker",
      mmsi: "419001234",
      imo: "9418826",
      callSign: "V7OJ8",
      flag: "Marshall Islands",
      length: 183,
      beam: 32,
      draught: 11.2,
      destination: "Cochin Port (INCOK)",
      eta: "2026-09-19T06:00:00Z",
      speedKn: 12.0,
      heading: 45,
      position: { lat: 9.65, lng: 76.25 },
      initialPosition: { lat: 9.45, lng: 75.95 },
      incidentPosition: { lat: 9.65, lng: 76.25 },
      status: "UNDER ANALYSIS",
      riskLevel: "HIGH",
      dataSource: "Prototype AIS / VTS feed (Simulated)",
      telemetryAuthorized: true,
      inZone: true
    },
    {
      id: "OG-VESSEL-02",
      name: "MV Coral",
      type: "General Cargo",
      mmsi: "419002567",
      imo: "9283741",
      callSign: "9V6231",
      flag: "Singapore",
      length: 145,
      beam: 24,
      draught: 8.4,
      destination: "Colombo (LKCMB)",
      eta: "2026-09-20T14:00:00Z",
      speedKn: 14.0,
      heading: 315,
      position: { lat: 10.25, lng: 75.75 },
      status: "NORMAL",
      riskLevel: "LOW",
      dataSource: "Prototype AIS / VTS feed (Simulated)",
      telemetryAuthorized: false,
      inZone: true
    },
    {
      id: "OG-VESSEL-03",
      name: "MT Blue Horizon",
      type: "Crude Oil Tanker",
      mmsi: "419003890",
      imo: "9367128",
      callSign: "A8TK4",
      flag: "Liberia",
      length: 274,
      beam: 48,
      draught: 16.5,
      destination: "Mangalore (INMRG)",
      eta: "2026-09-20T22:30:00Z",
      speedKn: 10.5,
      heading: 40,
      position: { lat: 9.15, lng: 76.65 },
      status: "NORMAL",
      riskLevel: "LOW",
      dataSource: "Prototype AIS / VTS feed (Simulated)",
      telemetryAuthorized: false,
      inZone: false
    },
    {
      id: "OG-VESSEL-04",
      name: "MV Arabian Pearl",
      type: "Container Ship",
      mmsi: "419004122",
      imo: "9514782",
      callSign: "H3VR",
      flag: "Panama",
      length: 210,
      beam: 30,
      draught: 10.0,
      destination: "Jebel Ali (AEJEA)",
      eta: "2026-09-22T04:00:00Z",
      speedKn: 13.0,
      heading: 270,
      position: { lat: 11.10, lng: 75.20 },
      status: "NORMAL",
      riskLevel: "LOW",
      dataSource: "Prototype AIS / VTS feed (Simulated)",
      telemetryAuthorized: false,
      inZone: false
    }
  ],

  telemetry: {
    notice: "Simulated telemetry data feed for authorized vessels only. Authorities do not access private engine computers without authorization.",
    vesselId: "OG-VESSEL-01",
    vesselName: "MV Ocean Star",
    normalBaseline: {
      fuelPressurePsi: { value: 72.0, unit: "PSI", min: 65.0, max: 78.0, status: "NORMAL" },
      fuelFlowTph: { value: 11.8, unit: "t/h", min: 10.0, max: 14.0, status: "NORMAL" },
      fuelLevelPct: { value: 84.5, unit: "%", status: "NORMAL" },
      engineTempC: { value: 41.2, unit: "°C", min: 38.0, max: 45.0, status: "NORMAL" },
      pumpPressureBar: { value: 2.1, unit: "bar", min: 1.9, max: 2.4, status: "NORMAL" }
    },
    observedIncident: {
      fuelPressurePsi: { value: 41.0, unit: "PSI", normal: 72.0, status: "CRITICAL_LOW" },
      fuelFlowTph: { value: 29.6, unit: "t/h", normal: 11.8, status: "ABNORMAL_SPIKE" },
      fuelLevelPct: { value: 68.2, unit: "%", dropRatePerHour: 0.86, status: "RAPID_DEPLETION" },
      engineTempC: { value: 47.8, unit: "°C", normal: 41.2, status: "ELEVATED" },
      pumpPressureBar: { value: 3.9, unit: "bar", normal: 2.1, status: "UNSTABLE" },
      anomalyDetected: true,
      anomalySummary: "Sudden drop in fuel manifold pressure (-31 PSI) coupled with anomalous flow surge (+17.8 t/h) and rapid tank depletion (0.86%/h)."
    }
  },

  incidents: [
    {
      id: "OG-2026-001",
      title: "Possible Oil Spill — Kochi Coastal Approaches",
      source: "AIS Anomaly / Multi-Source Trigger",
      vesselId: "OG-VESSEL-01",
      vesselName: "MV Ocean Star",
      mmsi: "419001234",
      location: { lat: 9.65, lng: 76.25, zoneName: "Kerala Coastal Monitoring Zone (Kochi Outer Anchorage)" },
      timestamp: "2026-09-18T09:15:00Z",
      reportedCondition: "Possible oil leakage detected via multi-source anomaly fusion",
      status: "Verification Required",
      riskScore: 87,
      riskLevel: "HIGH",
      evidenceCount: 4,
      potentialImpact: "High",
      recommendedAction: "VERIFY -> ASSESS -> RESPOND"
    },
    {
      id: "OG-2026-000",
      title: "Suspected Fuel Bunker Sheen — Azhikkal Offing",
      source: "Observer / Coast Guard Patrol",
      vesselId: "OG-VESSEL-02",
      vesselName: "MV Coral",
      mmsi: "419002567",
      location: { lat: 10.25, lng: 75.75, zoneName: "North Kerala Shelf" },
      timestamp: "2026-09-17T14:20:00Z",
      reportedCondition: "Light surface discoloration reported by local coastal patrol",
      status: "Closed / Resolved",
      riskScore: 24,
      riskLevel: "LOW",
      evidenceCount: 1,
      potentialImpact: "Low",
      recommendedAction: "LOG AND CLOSE"
    },
    {
      id: "OG-2025-089",
      title: "Minor Bilge Discharge Anomaly — Alappuzha Coast",
      source: "Port State Control Inspection",
      vesselId: "OG-VESSEL-03",
      vesselName: "MT Blue Horizon",
      mmsi: "419003890",
      location: { lat: 9.15, lng: 76.65, zoneName: "South Kerala Coastal Zone" },
      timestamp: "2025-11-04T18:40:00Z",
      reportedCondition: "Controlled ballast exchange discrepancy",
      status: "Archived / Assessed",
      riskScore: 48,
      riskLevel: "MEDIUM",
      evidenceCount: 2,
      potentialImpact: "Medium",
      recommendedAction: "ARCHIVE"
    }
  ],

  wind: {
    speedKmh: 18.0,
    speedKnots: 9.72,
    directionFromDeg: 225,
    directionTowardDeg: 45,
    cardinal: "SW -> NE"
  },

  current: {
    speedKnots: 1.2,
    speedKmh: 2.22,
    directionTowardDeg: 55,
    cardinal: "North-East"
  },

  monitoringZone: [
    [9.35, 75.50],
    [9.35, 76.45],
    [10.35, 76.45],
    [10.35, 75.50]
  ],

  impactZones: [
    {
      id: "ZONE-FISH-A",
      name: "Fishing Zone A (Inshore Artisanal Waters)",
      category: "fishing",
      impactLevel: "HIGH",
      color: "#00e676",
      desc: "Primary coastal fishing ground sustaining over 12,000 traditional fishermen.",
      polygon: [[9.60, 75.95], [9.60, 76.22], [9.80, 76.26], [9.80, 76.02]]
    },
    {
      id: "ZONE-FISH-B",
      name: "Fishing Zone B (Deep Mechanized Grounds)",
      category: "fishing",
      impactLevel: "MEDIUM",
      color: "#00e676",
      desc: "Commercial trawling shelf producing export-grade shrimp and squid.",
      polygon: [[9.50, 75.70], [9.50, 75.94], [9.75, 76.00], [9.75, 75.76]]
    },
    {
      id: "ZONE-PORT-01",
      name: "Cochin Port Approaches & Fairway",
      category: "port",
      impactLevel: "MEDIUM",
      color: "#00b4d8",
      desc: "International shipping approaches, tanker fairway buoy and outer anchorage.",
      polygon: [[9.90, 76.15], [9.90, 76.32], [10.05, 76.32], [10.05, 76.15]]
    },
    {
      id: "ZONE-COMM-01",
      name: "Coastal Communities (Chellanam / Fort Kochi)",
      category: "coastal",
      impactLevel: "HIGH",
      color: "#ffb703",
      desc: "Densely populated shoreline villages, tourist beaches and sea-wall zones.",
      polygon: [[9.68, 76.24], [9.68, 76.33], [9.96, 76.33], [9.96, 76.24]]
    },
    {
      id: "ZONE-ECOL-01",
      name: "Sensitive Marine Zone (Vembanad Mangrove Buffer)",
      category: "ecology",
      impactLevel: "MEDIUM",
      color: "#b5179e",
      desc: "Ramsar wetland buffer #1212, mangrove fish nursery and estuary mouth.",
      polygon: [[9.58, 76.22], [9.58, 76.35], [9.76, 76.36], [9.76, 76.25]]
    }
  ],

  satelliteObservation: {
    satellite: "Sentinel-1B",
    sensor: "Synthetic Aperture Radar (SAR) C-Band",
    status: "Supporting Evidence Available",
    timestamp: "2026-09-18T08:42:15Z (Simulated latest pass)",
    confidence: "Supporting / Corroborating",
    disclaimer: "Satellite observation is not continuous live monitoring. It is used as a supporting verification source when an observation is available.",
    polygon: [
      [9.63, 76.22],
      [9.64, 76.27],
      [9.67, 76.29],
      [9.68, 76.24],
      [9.65, 76.21]
    ]
  }
};

window.OilGuardDataStore = OilGuardDataStore;
