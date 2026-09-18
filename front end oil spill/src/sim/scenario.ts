import type { LatLng, PhaseId, VulnerableArea, WeatherForcing } from "../types";

export const SPILL_LOCATION: LatLng = { lat: 9.76, lng: 75.82 };

export const WEATHER: WeatherForcing = {
  windFromDeg: 245,
  windKn: 16,
  currentTowardDeg: 78,
  currentKn: 0.85,
};

export const MONITORING_ZONE: LatLng[] = [
  { lat: 9.62, lng: 75.68 },
  { lat: 9.9, lng: 75.68 },
  { lat: 9.94, lng: 76.12 },
  { lat: 9.58, lng: 76.12 },
];

export const OCEAN_STAR_PATH: LatLng[] = [
  { lat: 9.66, lng: 75.48 },
  { lat: 9.7, lng: 75.62 },
  { lat: 9.73, lng: 75.72 },
  { lat: 9.76, lng: 75.82 },
  { lat: 9.78, lng: 75.9 },
];

export const OTHER_VESSELS = [
  {
    id: "pearl",
    name: "MV Kerala Pearl",
    type: "Container",
    imo: "9321104",
    path: [
      { lat: 9.88, lng: 75.52 },
      { lat: 9.86, lng: 75.7 },
      { lat: 9.84, lng: 75.92 },
      { lat: 9.83, lng: 76.08 },
    ],
    speedKn: 14.2,
  },
  {
    id: "sagar",
    name: "FV Sagar Jyoti",
    type: "Fishing",
    imo: "IND-KL-4471",
    path: [
      { lat: 9.54, lng: 75.86 },
      { lat: 9.58, lng: 75.94 },
      { lat: 9.61, lng: 76.02 },
      { lat: 9.63, lng: 76.08 },
    ],
    speedKn: 7.4,
  },
];

export const VULNERABLE_AREAS: Omit<VulnerableArea, "potentiallyAffected">[] = [
  {
    id: "fishing",
    name: "Inshore Fishing Grounds",
    kind: "fishing",
    polygon: [
      { lat: 9.78, lng: 75.88 },
      { lat: 9.88, lng: 75.88 },
      { lat: 9.9, lng: 76.08 },
      { lat: 9.76, lng: 76.08 },
    ],
  },
  {
    id: "coastal",
    name: "Coastal Community — Chellanam / Fort Kochi",
    kind: "coastal",
    polygon: [
      { lat: 9.86, lng: 76.16 },
      { lat: 9.98, lng: 76.16 },
      { lat: 9.98, lng: 76.28 },
      { lat: 9.86, lng: 76.28 },
    ],
  },
  {
    id: "port",
    name: "Cochin Port Approaches",
    kind: "port",
    polygon: [
      { lat: 9.94, lng: 76.2 },
      { lat: 10.04, lng: 76.2 },
      { lat: 10.04, lng: 76.32 },
      { lat: 9.94, lng: 76.32 },
    ],
  },
  {
    id: "ecology",
    name: "Nearshore Ecological Buffer",
    kind: "ecology",
    polygon: [
      { lat: 9.66, lng: 76.1 },
      { lat: 9.78, lng: 76.1 },
      { lat: 9.78, lng: 76.24 },
      { lat: 9.66, lng: 76.24 },
    ],
  },
];

export const PHASE_ORDER: PhaseId[] = [
  "tracking",
  "zone",
  "enhanced",
  "telemetry",
  "leak",
  "satellite",
  "fusion",
  "spill",
  "forecast",
  "impact",
  "alert",
  "response",
];

export const PHASE_AT: Record<PhaseId, number> = {
  tracking: 0,
  zone: 0.1,
  enhanced: 0.16,
  telemetry: 0.22,
  leak: 0.34,
  satellite: 0.44,
  fusion: 0.52,
  spill: 0.6,
  forecast: 0.68,
  impact: 0.76,
  alert: 0.84,
  response: 0.9,
};

export const PHASE_LABEL: Record<PhaseId, string> = {
  tracking: "Watch ships",
  zone: "Monitoring zone",
  enhanced: "Enhanced monitoring",
  telemetry: "Check ship data",
  leak: "Possible leak",
  satellite: "Satellite evidence",
  fusion: "AI fusion",
  spill: "Spill location",
  forecast: "Predict spread",
  impact: "Vulnerable areas",
  alert: "Marine alert",
  response: "Response priority",
};

export const RESPONSE_STEPS = [
  "Verify incident with on-scene / VTS confirmation",
  "Monitor predicted spread and potentially affected zones",
  "Alert relevant maritime and coastal authorities",
  "Deploy response resources if the incident is confirmed",
];
