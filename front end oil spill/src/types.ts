export type LatLng = { lat: number; lng: number };

export type PhaseId =
  | "tracking"
  | "zone"
  | "enhanced"
  | "telemetry"
  | "leak"
  | "satellite"
  | "fusion"
  | "spill"
  | "forecast"
  | "impact"
  | "alert"
  | "response";

export type VesselStatus = "Tracking" | "Enhanced Monitoring" | "Incident Vessel";

export interface Vessel {
  id: string;
  name: string;
  type: string;
  imo: string;
  position: LatLng;
  heading: number;
  speedKn: number;
  inZone: boolean;
  status: VesselStatus;
  isFocus: boolean;
}

export interface Telemetry {
  fuelPct: number;
  fuelFlowTph: number;
  pressureBar: number;
  tempC: number;
  fuelDropRate: number;
}

export interface Anomaly {
  possibleLeak: boolean;
  reasons: string[];
}

export interface SarEvidence {
  visible: boolean;
  center: LatLng;
  polygon: LatLng[];
  label: string;
}

export interface FusionResult {
  telemetryScore: number;
  satelliteScore: number;
  associationScore: number;
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
}

export interface ForecastSlice {
  label: string;
  hours: number;
  center: LatLng;
  radiusKm: number;
  polygon: LatLng[];
}

export interface WeatherForcing {
  windFromDeg: number;
  windKn: number;
  currentTowardDeg: number;
  currentKn: number;
}

export interface VulnerableArea {
  id: string;
  name: string;
  kind: "fishing" | "coastal" | "port" | "ecology";
  polygon: LatLng[];
  potentiallyAffected: boolean;
}

export interface MarineAlert {
  title: string;
  vessel: string;
  incident: string;
  risk: "HIGH";
  location: LatLng;
  affected: string[];
  responsePriority: "HIGH";
}

export interface SimState {
  t: number;
  phase: PhaseId;
  unlocked: Record<PhaseId, boolean>;
  vessels: Vessel[];
  focusVessel: Vessel;
  zone: LatLng[];
  telemetry: Telemetry;
  anomaly: Anomaly;
  sar: SarEvidence;
  fusion: FusionResult;
  weather: WeatherForcing;
  spillLocation: LatLng | null;
  forecast: ForecastSlice[];
  areas: VulnerableArea[];
  alert: MarineAlert | null;
  why: string[];
  responseSteps: string[];
}
